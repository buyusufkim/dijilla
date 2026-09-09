import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRequest, transition, requestStatus, endOfTerm, premiumEnd, type RequestRecord } from '../src/domain/requests.js';
const now = new Date('2026-09-09T12:00:00Z');
function record(state: RequestRecord['state'] = { stage: 'new' }): RequestRecord {
  return { id: '1', user_id: 'user', kind: 'roadside', payload: {}, snapshot: { priceMinor: 75000 }, state, version: 1, created_at: '2026-09-01T00:00:00Z' };
}
test('payments, issuance and 24h waiting are separate; late issuance never resets expiry', () => {
  const r = record();
  assert.throws(() => transition(r, { type: 'pay', paidAt: now.toISOString(), amountMinor: 1 }, true, now));
  r.state = transition(r, { type: 'pay', paidAt: now.toISOString(), amountMinor: 75000 }, true, now);
  assert.equal(requestStatus(r, now), 'paid');
  assert.throws(() => transition(r, { type: 'issue', packageNumber: 'real-id' }, true, now));
  r.state.documentPath = 'private.pdf';
  r.state = transition(r, { type: 'issue', packageNumber: 'real-id' }, true, now);
  assert.equal(requestStatus(r, new Date('2026-09-10T11:59:59Z')), 'waiting');
  assert.equal(requestStatus(r, new Date('2026-09-10T12:00:00Z')), 'active');
  assert.equal(requestStatus(r, new Date('2027-09-09T12:00:00Z')), 'expired');
  assert.equal(endOfTerm('2028-02-29T12:00:00Z'), '2029-02-28T12:00:00.000Z');
  assert.equal(premiumEnd('2026-01-31T12:00:00Z', 'monthly'), '2026-02-28T12:00:00.000Z');
});
test('15-day boundary, usage confirmation and refund completion are independent', () => {
  const r = record({ stage: 'issued', paidAt: '2026-09-01T12:00:00Z' });
  assert.throws(() => transition(r, { type: 'cancel_request' }, false, new Date('2026-09-16T12:00:00.001Z')));
  r.state = transition(r, { type: 'cancel_request' }, false, new Date('2026-09-16T12:00:00Z'));
  r.state = transition(r, { type: 'cancel_approve', unusedConfirmed: true }, true, new Date('2026-09-20T12:00:00Z'));
  assert.equal(requestStatus(r), 'refund_pending');
  r.state = transition(r, { type: 'refund' }, true, new Date('2026-09-21T12:00:00Z'));
  assert.equal(requestStatus(r), 'cancelled');
  assert.throws(() => transition(r, { type: 'refund' }, true, now));
  assert.throws(() => transition(record({ stage: 'issued', usedAt: now.toISOString() }), { type: 'cancel_request' }, false, now));
  assert.throws(() => transition(record(), { type: 'contact' }, false, now));
});
test('request payload rejects customer-controlled price, state and foreign plates', () => {
  const input = { kind: 'roadside', packageId: 'eco', catalogVersion: 1, settingsVersion: 1, idempotencyKey: '9b6187bc-79b2-432b-9edb-ff9e90f69e82', acknowledged: true, payload: { customer: { type: 'corporate', taxNumber: '0000000000', taxOffice: 'Test', companyName: 'Test', city: 'Kayseri', phone: '05321234567' }, vehicle: { plate: '38 AA 123', usage: 'Traktör', modelYear: 2020, brand: 'Test', model: 'Test' } } };
  const result = parseRequest(input);
  assert.equal((result.payload as any).vehicle.plate, '38AA123');
  assert.equal((result.payload as any).customer.phone, '5321234567');
  assert.throws(() => parseRequest({ ...input, priceMinor: 1 }));
  assert.throws(() => parseRequest({ ...input, payload: { ...input.payload, state: { stage: 'issued' } } }));
  assert.throws(() => parseRequest({ ...input, payload: { ...input.payload, vehicle: { ...input.payload.vehicle, plate: 'DE-AB123' } } }));
});
