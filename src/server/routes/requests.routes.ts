import express, { Router, type Request, type Response, type NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { actionSchema, parseRequest, transition, requestStatus, type RequestRecord } from '../../domain/requests.js';
import type { AuthRequest } from '../lib/authMiddleware.js';

class RequestError extends Error { constructor(public status: number, message: string) { super(message); } }
const uuid = z.uuid();
const version = z.number().int().positive();
const settingsSchema = z.object({ version, phone: z.string().regex(/^(?:\+?90\d{10})?$/), whatsapp: z.string().regex(/^(?:90\d{10})?$/), privacy_text: z.string().trim().max(20000), requests_enabled: z.boolean() }).strict().refine(v => !v.requests_enabled || (v.privacy_text.length >= 20 && !!v.phone), 'Talepleri açmak için iletişim telefonu ve bilgilendirme metni gerekli.');
const catalogSchema = z.object({ version, name: z.string().trim().min(1).max(100), price_minor: z.number().int().positive().max(10000000), description: z.string().trim().max(5000), active: z.boolean() }).strict();
function checked(result: any) {
  if (result.error) {
    const code = result.error.message ?? '';
    if (/VERSION_CONFLICT|IDEMPOTENCY_CONFLICT/.test(code)) throw new RequestError(409, 'Kayıt değişti veya talep anahtarı farklı içerikle kullanıldı. Listeyi yenileyin.');
    if (/RATE_LIMIT/.test(code)) throw new RequestError(429, 'Günlük talep sınırına ulaştınız.');
    if (/NOT_FOUND/.test(code)) throw new RequestError(404, 'Talep bulunamadı.');
    if (/FORBIDDEN/.test(code)) throw new RequestError(403, 'Bu işlem için yetkiniz yok.');
    throw new RequestError(503, 'İşlem şu anda tamamlanamıyor. Lütfen tekrar deneyin.');
  }
  return result.data;
}

export function createRequestsRouter(db: any) {
  const router = Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  const wrap = (fn: (req: AuthRequest, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => { void fn(req, res).catch(next); };
  const isAdmin = async (id: string): Promise<boolean> => Boolean(checked(await db.from('droto_admins').select('user_id').eq('user_id', id).maybeSingle()));
  const requireAdmin = async (id: string) => { if (!await isAdmin(id)) throw new RequestError(403, 'Yönetici yetkisi gerekiyor.'); };
  const find = async (id: string, actor: string, admin: boolean): Promise<RequestRecord> => {
    let query = db.from('droto_requests').select('*').eq('id', uuid.parse(id));
    if (!admin) query = query.eq('user_id', actor);
    const row = checked(await query.maybeSingle());
    if (!row) throw new RequestError(404, 'Talep bulunamadı.');
    return row;
  };
  const present = (row: RequestRecord) => ({ ...row, status: requestStatus(row) });
  router.get('/bootstrap', wrap(async (req, res) => {
    const [settings, catalog, admin] = await Promise.all([
      db.from('droto_settings').select('*').eq('id', true).single(),
      db.from('droto_catalog').select('*').order('price_minor'), isAdmin(req.user!.id),
    ]);
    res.json({ settings: checked(settings), catalog: checked(catalog), admin });
  }));
  router.get('/', wrap(async (req, res) => {
    const admin = req.query.scope === 'admin';
    if (admin) await requireAdmin(req.user!.id);
    const offset = z.coerce.number().int().min(0).max(100000).parse(req.query.offset ?? 0);
    let query = db.from('droto_requests').select('id,user_id,kind,snapshot,state,version,created_at').order('created_at', { ascending: false }).range(offset, offset + 49);
    if (!admin) query = query.eq('user_id', req.user!.id);
    res.json({ requests: checked(await query).map(present), offset });
  }));
  router.post('/', wrap(async (req, res) => {
    let input;
    try { input = parseRequest(req.body); } catch (e) { if (e instanceof z.ZodError) throw e; throw new RequestError(400, (e as Error).message); }
    const row = checked(await db.rpc('droto_create_request', { p_user: req.user!.id, p_kind: input.kind, p_payload: input.payload, p_package: input.packageId ?? null, p_catalog_version: input.catalogVersion ?? null, p_settings_version: input.settingsVersion, p_key: input.idempotencyKey }));
    res.status(201).json({ request: present(row) });
  }));
  router.put('/settings', wrap(async (req, res) => {
    await requireAdmin(req.user!.id);
    const { version: expected, ...values } = settingsSchema.parse(req.body);
    const row = checked(await db.from('droto_settings').update({ ...values, version: expected + 1, updated_at: new Date().toISOString() }).eq('id', true).eq('version', expected).select('*').maybeSingle());
    if (!row) throw new RequestError(409, 'Ayarlar değişmiş. Sayfayı yenileyin.');
    res.json({ settings: row });
  }));
  router.put('/catalog/:id', wrap(async (req, res) => {
    await requireAdmin(req.user!.id);
    const id = z.enum(['eco','standard','pro']).parse(req.params.id);
    const { version: expected, ...values } = catalogSchema.parse(req.body);
    const row = checked(await db.from('droto_catalog').update({ ...values, version: expected + 1 }).eq('id', id).eq('version', expected).select('*').maybeSingle());
    if (!row) throw new RequestError(409, 'Paket değişmiş. Sayfayı yenileyin.');
    res.json({ package: row });
  }));
  router.get('/:id', wrap(async (req, res) => {
    const row = await find(String(req.params.id), req.user!.id, await isAdmin(req.user!.id));
    res.json({ request: present(row) });
  }));
  router.post('/:id/actions', wrap(async (req, res) => {
    const input = z.object({ version, action: actionSchema }).strict().parse(req.body);
    const admin = await isAdmin(req.user!.id);
    if (!admin && input.action.type !== 'cancel_request') throw new RequestError(403, 'Yönetici yetkisi gerekiyor.');
    const row = await find(String(req.params.id), req.user!.id, admin);
    if (row.version !== input.version) throw new RequestError(409, 'Kayıt değişmiş. Sayfayı yenileyin.');
    let state;
    try { state = transition(row, input.action, admin); } catch (e) { throw new RequestError(400, (e as Error).message); }
    const saved = checked(await db.rpc('droto_update_request', { p_id: row.id, p_actor: req.user!.id, p_version: input.version, p_action: input.action.type, p_state: state }));
    res.json({ request: present(saved) });
  }));
  router.post('/:id/document', (req: AuthRequest, _res, next) => { void requireAdmin(req.user!.id).then(() => next(), next); }, express.raw({ type: 'application/pdf', limit: '4mb' }), wrap(async (req, res) => {
    const row = await find(String(req.params.id), req.user!.id, true);
    const expected = z.coerce.number().int().positive().parse(req.headers['x-record-version']);
    if (row.version !== expected) throw new RequestError(409, 'Kayıt değişmiş. Sayfayı yenileyin.');
    if (row.kind !== 'roadside' || row.state.stage !== 'paid' || row.state.cancellation?.decision === 'pending' || row.state.cancellation?.decision === 'approved') throw new RequestError(400, 'PDF yalnız ödemesi teyit edilen ve iptal incelemesinde olmayan pakete eklenebilir.');
    if (!Buffer.isBuffer(req.body) || req.body.length < 5 || req.body.subarray(0,5).toString() !== '%PDF-') throw new RequestError(400, 'Geçerli bir PDF dosyası seçin (en fazla 4 MB).');
    const path = `${row.id}/${randomUUID()}.pdf`;
    checked(await db.storage.from('droto-contracts').upload(path, req.body, { contentType: 'application/pdf', upsert: false }));
    const saved = await db.rpc('droto_update_request', { p_id: row.id, p_actor: req.user!.id, p_version: expected, p_action: 'attach_document', p_state: { ...row.state, documentPath: path } });
    if (saved.error) { await db.storage.from('droto-contracts').remove([path]); checked(saved); }
    res.json({ request: present(saved.data) });
  }));
  router.get('/:id/document', wrap(async (req, res) => {
    const row = await find(String(req.params.id), req.user!.id, await isAdmin(req.user!.id));
    if (!row.state.documentPath) throw new RequestError(404, 'Belge henüz eklenmedi.');
    const link = checked(await db.storage.from('droto-contracts').createSignedUrl(row.state.documentPath, 60, { download: 'yol-yardim-paketi.pdf' }));
    res.json({ url: link.signedUrl });
  }));
  router.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof z.ZodError) { res.status(400).json({ error: { message: 'Alanları kontrol edin.', fields: error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) } }); return; }
    const status = error instanceof RequestError ? error.status : (error as any)?.type === 'entity.too.large' ? 413 : 503;
    res.status(status).json({ error: { message: error instanceof RequestError ? error.message : status === 413 ? 'Dosya boyutu en fazla 4 MB olabilir.' : 'İşlem tamamlanamadı. Tekrar deneyin.' } });
  });
  return router;
}
