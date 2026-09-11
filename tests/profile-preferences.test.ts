import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { readPreferences, savePreference } from '../src/lib/profile-preferences.js';

test('preferences: database errors, missing rows and stale updates do not report success', async () => {
  let result: any = { error: { message: 'denied' } };
  let update: any;
  const calls: unknown[] = [];
  const chain: any = {
    update(value: any) { update = value; return this; },
    eq(...args: unknown[]) { calls.push(args); return this; },
    filter(...args: unknown[]) { calls.push(args); return this; },
    is(...args: unknown[]) { calls.push(args); return this; },
    select() { return this; },
    async maybeSingle() { return result; },
  };
  const db = { from(table: string) { assert.equal(table, 'profiles'); return chain; } };
  const original = { insurance_expiry: true, other_preference: false };
  await assert.rejects(savePreference(db, 'owner', original, 'insurance_expiry', false), /kaydedilemedi/);
  result = { data: null };
  await assert.rejects(savePreference(db, 'owner', original, 'insurance_expiry', false), /başka bir yerde/);
  result = { data: { notification_settings: { insurance_expiry: true } } };
  await assert.rejects(savePreference(db, 'owner', original, 'insurance_expiry', false), /doğrulanamadı/);
  result = { data: { notification_settings: { ...readPreferences(original), insurance_expiry: false, other_preference: false } } };
  const saved = await savePreference(db, 'owner', original, 'insurance_expiry', false);
  assert.equal(saved.insurance_expiry, false);
  assert.equal(update.notification_settings.other_preference, false);
  assert.ok(calls.some(v => JSON.stringify(v) === JSON.stringify(['id', 'owner'])));
  assert.ok(calls.some(v => JSON.stringify(v) === JSON.stringify(['notification_settings', 'eq', JSON.stringify(original)])));
  await savePreference(db, 'owner', null, 'insurance_expiry', false);
  assert.ok(calls.some(v => JSON.stringify(v) === JSON.stringify(['notification_settings', null])));
});

test('preferences migration validates stored booleans and retains owner-only access', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role authenticated; create table public.profiles(id text primary key); alter table profiles enable row level security;
      grant select,update on profiles to authenticated;
      create policy own_profile on profiles to authenticated using(id=current_setting('app.user_id')) with check(id=current_setting('app.user_id'));
      insert into profiles values('owner'),('other');`);
    await db.exec(await readFile(new URL('../supabase/migrations/20260911174620_droto_notification_preferences.sql', import.meta.url), 'utf8'));
    await assert.rejects(db.exec(`update profiles set notification_settings='{"insurance_expiry":"false"}'`), /profiles_notification_settings_shape/);
    await assert.rejects(db.exec(`update profiles set notification_settings='[]'`), /profiles_notification_settings_shape/);
    await db.exec(`set role authenticated; set app.user_id='owner'; update profiles set notification_settings='{"insurance_expiry":false}';`);
    const result = await db.query<any>('select notification_settings from profiles');
    assert.equal(result.rows.length, 1);
    assert.equal(result.rows[0].notification_settings.insurance_expiry, false);
    await db.exec('reset role');
    assert.deepEqual((await db.query<any>("select notification_settings from profiles where id='other'")).rows[0].notification_settings, {});
  } finally { await db.close(); }
});
