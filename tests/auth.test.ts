import test from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { isVerifiedUser, safeReturnPath } from '../src/lib/auth-policy.js';
import { createAuthMiddleware } from '../src/server/lib/verified-auth.js';

test('unverified and anonymous identities cannot enter the application', () => {
  assert.equal(isVerifiedUser(null), false);
  assert.equal(isVerifiedUser({}), false);
  assert.equal(isVerifiedUser({ email_confirmed_at: '2026-09-09', is_anonymous: true }), false);
  assert.equal(isVerifiedUser({ email_confirmed_at: '2026-09-09' }), true);
});

test('login return target rejects external URLs and auth loops', () => {
  for (const target of ['https://evil.test', '//evil.test', '/\\evil.test', '/%2f%2fevil.test', '/login', '/reset-password?x=1', '/', undefined]) {
    assert.equal(safeReturnPath(target), '/home');
  }
  assert.equal(safeReturnPath('/garage/vehicle-id?tab=documents'), '/garage/vehicle-id?tab=documents');
});

test('HTTP boundary authenticates before disabled providers and does not leak errors', async () => {
  // Inert configuration: all identity lookups below are injected, no external IO.
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-not-a-real-key';
  const { createApp } = await import('../src/server/app.js');
  let lookups = 0;
  const authenticate = createAuthMiddleware(async token => {
    lookups++;
    if (token === 'outage') throw new Error('secret-provider-detail');
    if (token === 'expired') return { data: { user: null }, error: new Error('secret') };
    return { data: { user: { id: 'user-1', email_confirmed_at: token === 'valid' ? '2026-09-09' : undefined } }, error: null };
  });
  const server = createApp(authenticate).listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.equal(lookups, 0);
    for (const path of ['/api/ai/generate', '/api/quotes/request', '/api/checkouts/start', '/api/checkouts/test/pay', '/api/future']) {
      assert.equal((await fetch(base + path, { method: 'POST' })).status, 401);
    }
    assert.equal(lookups, 0);
    for (const [token, expected] of [['expired', 401], ['unverified', 403], ['outage', 503]] as const) {
      const response = await fetch(`${base}/api/checkouts/test/pay`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      assert.equal(response.status, expected);
      assert.doesNotMatch(await response.text(), /secret/);
    }
    for (const path of ['/api/quotes/request', '/api/checkouts/test/pay', '/api/ai/generate']) {
      const response = await fetch(base + path, { method: 'POST', headers: { Authorization: 'Bearer valid' } });
      assert.equal(response.status, 503);
      assert.equal((await response.json()).error.code, 'SERVICE_NOT_READY');
    }
    const malformed = await fetch(`${base}/api/checkouts/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"private":"sensitive"' });
    assert.equal(malformed.status, 400);
    assert.doesNotMatch(await malformed.text(), /sensitive|private|SyntaxError/);
    assert.equal((await fetch(`${base}/api/future`, { headers: { Authorization: 'Bearer valid' } })).status, 404);
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});
