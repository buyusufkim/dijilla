import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('Postgres: migrations, owner isolation, RPC privileges, idempotency and version conflicts', async () => {
  const db = new PGlite();
  try {
    // Minimal Supabase-owned schemas for the local SQL engine; no real customer data.
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth,public to authenticated,service_role,anon;
      create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table public.checkouts(id uuid); grant all on public.checkouts to authenticated;`);
    await db.exec(await readFile(new URL('../supabase/migrations/20260909191803_droto_requests.sql', import.meta.url), 'utf8'));
    const owner='11111111-1111-4111-8111-111111111111', other='22222222-2222-4222-8222-222222222222', admin='33333333-3333-4333-8333-333333333333', key='44444444-4444-4444-8444-444444444444';
    await db.exec(`insert into auth.users values('${owner}'),('${other}'),('${admin}'); insert into public.droto_admins(user_id) values('${admin}'); update public.droto_settings set requests_enabled=true,privacy_text='Test purposes privacy notice only.'; set role service_role;`);
    const createSql='select public.droto_create_request($1,$2,$3,$4,$5,$6,$7) as result';
    const args=[owner,'roadside',JSON.stringify({ test: true }),'eco',1,1,key];
    const row:any=(await db.query<any>(createSql,args)).rows[0].result;
    const duplicate:any=(await db.query<any>(createSql,args)).rows[0].result;
    assert.equal(row.id,duplicate.id);
    assert.equal(row.snapshot.priceMinor,75000);
    assert.equal((await db.query('select * from public.droto_outbox')).rows.length,1);
    await assert.rejects(db.query(createSql,[owner,'roadside','{"changed":true}','eco',1,1,key]),/IDEMPOTENCY_CONFLICT/);
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false);`);
    assert.equal((await db.query('select * from public.droto_requests')).rows.length,1);
    await db.exec(`select set_config('request.jwt.claim.sub','${other}',false);`);
    assert.equal((await db.query('select * from public.droto_requests')).rows.length,0);
    await assert.rejects(db.query('update public.droto_requests set state=\'{"stage":"issued"}\''),/permission denied/);
    await assert.rejects(db.query('select * from public.droto_admins'),/permission denied/);
    await assert.rejects(db.query('insert into public.checkouts(id) values(gen_random_uuid())'),/permission denied/);
    await assert.rejects(db.query(createSql,args),/permission denied/);
    await db.exec('set role service_role');
    const updateSql='select public.droto_update_request($1,$2,$3,$4,$5) as result';
    await assert.rejects(db.query(updateSql,[row.id,other,1,'cancel_request','{"stage":"new","cancellation":{"decision":"pending"}}']),/NOT_FOUND/);
    await assert.rejects(db.query(updateSql,[row.id,owner,1,'pay','{"stage":"paid"}']),/FORBIDDEN/);
    const outcomes=await Promise.allSettled([db.query(updateSql,[row.id,admin,1,'contact','{"stage":"contacted"}']),db.query(updateSql,[row.id,admin,1,'contact','{"stage":"contacted"}'])]);
    assert.equal(outcomes.filter(v=>v.status==='fulfilled').length,1);
    assert.match(String((outcomes.find(v=>v.status==='rejected') as PromiseRejectedResult).reason),/VERSION_CONFLICT/);
    assert.equal((await db.query('select * from public.droto_request_events')).rows.length,2);
    await db.exec('reset role');
    assert.equal((await db.query<{public:boolean}>('select public from storage.buckets')).rows[0].public,false);
  } finally { await db.close(); }
});
