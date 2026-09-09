import { z } from 'zod';

export const requestKinds = ['roadside', 'insurance', 'assistance', 'service', 'premium'] as const;
export const kindLabels = { roadside: 'Yol yardım paketi', insurance: 'Sigorta teklifi', assistance: 'Yardım bildirimi', service: 'Servis rezervasyonu', premium: 'Premium üyelik' };
export const usageTypes = ['Otomobil (Hususi)', 'Otomobil (Ticari)', 'Kamyonet (Hususi)', 'Kamyonet (Ticari)', 'Karavan', 'Traktör', 'Motosiklet (Hususi)', 'Motokurye (Ticari)'] as const;
const text = (max: number) => z.string().trim().min(1).max(max);
const phone = z.string().transform(v => v.replace(/[\s()+-]/g, '').replace(/^90/, '').replace(/^0/, '')).pipe(z.string().regex(/^[1-9]\d{9}$/, 'Telefon 10 haneli olmalı.'));
const plate = z.string().transform(v => v.toUpperCase().replace(/\s/g, '')).pipe(z.string().regex(/^(0[1-9]|[1-7]\d|8[01])[A-Z]{1,3}\d{2,5}$/, 'Türkiye plakası girin.'));
const common = { phone, city: text(80), district: z.string().trim().max(80).default(''), email: z.union([z.email(), z.literal('')]).default('') };
export const customerSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('individual'), firstName: text(80), lastName: text(80), identityNumber: z.string().regex(/^[1-9]\d{10}$/, 'TC kimlik numarası 11 haneli olmalı.'), ...common }).strict(),
  z.object({ type: z.literal('corporate'), taxNumber: z.string().regex(/^\d{10}$/, 'Vergi numarası 10 haneli olmalı.'), taxOffice: text(100), companyName: text(160), ...common }).strict(),
]);
export const vehicleSchema = z.object({ plate, usage: z.enum(usageTypes), modelYear: z.number().int().min(1900).max(new Date().getFullYear() + 1), brand: text(80), model: text(100) }).strict();
const payloadSchemas = {
  roadside: z.object({ customer: customerSchema, vehicle: vehicleSchema }).strict(),
  insurance: z.object({ product: z.enum(['Trafik', 'Kasko', 'Konut', 'DASK', 'Tamamlayıcı Sağlık']), name: text(160), phone, note: z.string().trim().max(1000).default('') }).strict(),
  assistance: z.object({ name: text(160), phone, plate, address: text(500), latitude: z.number().min(-90).max(90).nullable(), longitude: z.number().min(-180).max(180).nullable(), note: text(1000), paidHelpAccepted: z.boolean() }).strict().refine(v => (v.latitude === null) === (v.longitude === null), 'Konum koordinatları eksik.'),
  service: z.object({ name: text(160), phone, plate, serviceName: text(160), preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), note: text(1000) }).strict(),
  premium: z.object({ name: text(160), phone, cycle: z.enum(['monthly', 'yearly']) }).strict(),
};
export const newRequestSchema = z.object({ kind: z.enum(requestKinds), packageId: z.enum(['eco', 'standard', 'pro']).optional(), catalogVersion: z.number().int().positive().optional(), settingsVersion: z.number().int().positive(), idempotencyKey: z.uuid(), acknowledged: z.literal(true), payload: z.unknown() }).strict();
export function parseRequest(input: unknown) {
  const parsed = newRequestSchema.parse(input);
  if (parsed.kind === 'roadside' && (!parsed.packageId || !parsed.catalogVersion)) throw new Error('Paket seçimi eksik.');
  if (parsed.kind !== 'roadside' && (parsed.packageId || parsed.catalogVersion)) throw new Error('Paket seçimi bu talebe ait değil.');
  return { ...parsed, payload: payloadSchemas[parsed.kind].parse(parsed.payload) };
}

export interface RequestState {
  stage: 'new' | 'contacted' | 'paid' | 'issued' | 'closed' | 'rejected';
  paidAt?: string;
  issuedAt?: string;
  packageNumber?: string;
  documentPath?: string;
  usedAt?: string;
  cancellation?: { requestedAt: string; decision: 'pending' | 'approved' | 'rejected'; decidedAt?: string; refundedAt?: string };
}
export interface RequestRecord {
  id: string; user_id: string; kind: typeof requestKinds[number]; payload: Record<string, any>;
  snapshot: Record<string, any>; state: RequestState; version: number; created_at: string;
}
export const actionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('contact') }).strict(),
  z.object({ type: z.literal('pay'), paidAt: z.iso.datetime({ offset: true }), amountMinor: z.number().int().positive() }).strict(),
  z.object({ type: z.literal('issue'), packageNumber: text(100) }).strict(),
  z.object({ type: z.literal('activate_premium') }).strict(),
  z.object({ type: z.literal('use'), usedAt: z.iso.datetime({ offset: true }) }).strict(),
  z.object({ type: z.literal('cancel_request') }).strict(),
  z.object({ type: z.literal('cancel_approve'), unusedConfirmed: z.literal(true) }).strict(),
  z.object({ type: z.literal('cancel_reject') }).strict(),
  z.object({ type: z.literal('refund') }).strict(),
  z.object({ type: z.literal('close') }).strict(),
]);
export type RequestAction = z.infer<typeof actionSchema>;
const DAY = 86_400_000;
export function endOfTerm(paidAt: string): string {
  const d = new Date(paidAt);
  const month = d.getUTCMonth();
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  if (d.getUTCMonth() !== month) d.setUTCDate(0); // Feb 29 -> Feb 28
  return d.toISOString();
}
export function premiumEnd(paidAt: string, cycle: string): string {
  if (cycle === 'yearly') return endOfTerm(paidAt);
  const d = new Date(paidAt); const day = d.getUTCDate();
  d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + 1);
  const month = d.getUTCMonth(); d.setUTCDate(day);
  if (d.getUTCMonth() !== month) d.setUTCDate(0);
  return d.toISOString();
}
export function requestStatus(record: Pick<RequestRecord, 'kind' | 'state'> & { snapshot?: Record<string, any> }, now = new Date()): string {
  const s = record.state;
  if (s.cancellation?.decision === 'approved') return s.paidAt && !s.cancellation.refundedAt ? 'refund_pending' : 'cancelled';
  if (s.cancellation?.decision === 'pending') return 'cancel_review';
  if (s.stage === 'issued' && s.paidAt && record.kind === 'roadside') {
    if (now.getTime() >= Date.parse(endOfTerm(s.paidAt))) return 'expired';
    if (now.getTime() < Date.parse(s.paidAt) + DAY) return 'waiting';
    return 'active';
  }
  if (s.stage === 'issued' && s.paidAt && record.kind === 'premium') return now.getTime() >= Date.parse(premiumEnd(s.paidAt, record.snapshot?.cycle)) ? 'expired' : 'active';
  return s.stage;
}
export const statusLabels: Record<string, string> = { new: 'Talep alındı', contacted: 'Görüşülüyor', paid: 'Ödeme teyit edildi, düzenleme bekleniyor', issued: 'Düzenlendi', closed: 'Tamamlandı', rejected: 'Reddedildi', cancel_review: 'İptal incelemede', refund_pending: 'İade bekleniyor', cancelled: 'İptal edildi', expired: 'Süresi doldu', waiting: '24 saat bekleme süresinde', active: 'Aktif' };

export function transition(record: RequestRecord, action: RequestAction, admin: boolean, now = new Date()): RequestState {
  const state = structuredClone(record.state);
  const fail = (message: string): never => { throw new Error(message); };
  if (!admin && action.type !== 'cancel_request') fail('Bu işlem için yönetici yetkisi gerekiyor.');
  if (state.cancellation?.decision === 'approved' && action.type !== 'refund') fail('İptal edilmiş talep değiştirilemez.');
  if (action.type === 'cancel_request') {
    if (record.kind !== 'roadside') fail('Bu iptal akışı yol yardım paketleri içindir.');
    if (state.cancellation?.decision === 'pending') fail('İptal talebiniz zaten incelemede.');
    if (state.usedAt) fail('Hizmet kullanıldığı için iptal edilemez.');
    if (state.paidAt && now.getTime() > Date.parse(state.paidAt) + 15 * DAY) fail('15 günlük iptal süresi doldu.');
    state.cancellation = { requestedAt: now.toISOString(), decision: 'pending' };
  } else if (action.type === 'cancel_approve') {
    if (record.kind !== 'roadside' || state.cancellation?.decision !== 'pending') fail('İncelenecek iptal talebi yok.');
    if (state.usedAt || !action.unusedConfirmed) fail('Hizmetin kullanılmadığı doğrulanmalı.');
    if (state.paidAt && Date.parse(state.cancellation!.requestedAt) > Date.parse(state.paidAt) + 15 * DAY) fail('İptal talebi süresi dışında.');
    state.cancellation = { ...state.cancellation!, decision: 'approved', decidedAt: now.toISOString() };
  } else if (action.type === 'cancel_reject') {
    if (state.cancellation?.decision !== 'pending') fail('İncelenecek iptal talebi yok.');
    state.cancellation = { ...state.cancellation!, decision: 'rejected', decidedAt: now.toISOString() };
  } else if (action.type === 'refund') {
    if (!state.paidAt || state.cancellation?.decision !== 'approved' || state.cancellation.refundedAt) fail('İade bekleyen ödeme yok.');
    state.cancellation = { ...state.cancellation!, refundedAt: now.toISOString() };
  } else if (action.type === 'use') {
    if (record.kind !== 'roadside' || state.stage !== 'issued' || !state.paidAt) fail('Düzenlenmiş paket bulunamadı.');
    const at = Date.parse(action.usedAt);
    if (at > now.getTime() || at < Date.parse(state.paidAt!) + DAY || at >= Date.parse(endOfTerm(state.paidAt!))) fail('Kullanım zamanı paket geçerliliği dışında.');
    if (state.usedAt) fail('İlk kullanım zaten kayıtlı.');
    state.usedAt = action.usedAt;
  } else {
    if (state.cancellation?.decision === 'pending') fail('Önce iptal incelemesini tamamlayın.');
    if (action.type === 'contact') {
      if (state.stage !== 'new') fail('Talep zaten işleme alınmış.');
      state.stage = 'contacted';
    } else if (action.type === 'pay') {
      if (record.kind !== 'roadside' && record.kind !== 'premium') fail('Bu talep türünde ödeme teyidi yok.');
      if (!['new', 'contacted'].includes(state.stage)) fail('Ödeme zaten işlenmiş.');
      if (action.amountMinor !== record.snapshot.priceMinor) fail('Ödeme tutarı kayıtlı fiyatla eşleşmiyor.');
      const at = Date.parse(action.paidAt);
      if (at > now.getTime() || at < Date.parse(record.created_at)) fail('Ödeme zamanı talep tarihinden önce veya gelecekte olamaz.');
      state.paidAt = action.paidAt; state.stage = 'paid';
    } else if (action.type === 'issue') {
      if (record.kind !== 'roadside' || state.stage !== 'paid' || !state.documentPath) fail('Paket için ödeme teyidi ve PDF gerekli.');
      state.packageNumber = action.packageNumber; state.issuedAt = now.toISOString(); state.stage = 'issued';
    } else if (action.type === 'activate_premium') {
      if (record.kind !== 'premium' || state.stage !== 'paid') fail('Önce Premium ödemesini teyit edin.');
      state.issuedAt = now.toISOString(); state.stage = 'issued';
    } else if (action.type === 'close') {
      if (!['insurance', 'assistance', 'service'].includes(record.kind) || !['new', 'contacted'].includes(state.stage)) fail('Bu talep kapatılamaz.');
      state.stage = 'closed';
    }
  }
  return state;
}
