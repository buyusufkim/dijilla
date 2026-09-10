import express, { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../lib/authMiddleware.js';
import { documentSchema, documentExtension, MAX_DOCUMENT_BYTES } from '../../domain/documents.js';

class DocumentError extends Error { constructor(public status: number, message: string) { super(message); } }
function checked(result: any) {
  if (result.error?.message?.includes('DOCUMENT_LIMIT')) throw new DocumentError(409,'En fazla 100 belge kaydedebilirsiniz.');
  if (result.error) throw new DocumentError(503, 'Belge işlemi tamamlanamadı. Lütfen tekrar deneyin.');
  return result.data;
}
export function createDocumentsRouter(db: any) {
  const router = Router();
  const bucket = db.storage.from('droto-documents');
  const fields = 'id,title,type,expiry_date,file_path,created_at';
  const wrap = (fn: (req: AuthRequest, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => { void fn(req, res).catch(next); };
  router.use((_req,res,next) => { res.setHeader('Cache-Control','no-store'); next(); });
  async function find(id: unknown, owner: string) {
    const row = checked(await db.from('documents').select(fields).eq('id', z.uuid().parse(id)).eq('user_id', owner).maybeSingle());
    if (!row) throw new DocumentError(404, 'Belge bulunamadı.');
    return row;
  }
  function safePath(row: any, owner: string) {
    if (!['pdf','jpg','png'].some(ext => row.file_path === `${owner}/${row.id}.${ext}`)) throw new DocumentError(409, 'Belge dosyası doğrulanamadı.');
    return row.file_path;
  }
  router.get('/', wrap(async (req,res) => {
    res.json({documents: checked(await db.from('documents').select(fields).eq('user_id', req.user!.id).order('created_at',{ascending:false}).limit(101))});
  }));
  router.post('/', wrap(async (req,res) => {
    const input = documentSchema.parse(req.body);
    const existing = checked(await db.from('documents').select(fields).eq('user_id',req.user!.id).eq('id',input.id).maybeSingle());
    if (existing) {
      if (existing.title !== input.title || existing.type !== input.type || existing.expiry_date !== input.expiry_date) throw new DocumentError(409,'Bu kayıt zaten oluşturuldu. Listeyi yenileyin.');
      return res.json({document:existing});
    }
    const count = await db.from('documents').select('id',{head:true,count:'exact'}).eq('user_id',req.user!.id);
    checked(count);
    if ((count.count ?? 100) >= 100) throw new DocumentError(409,'En fazla 100 belge kaydedebilirsiniz.');
    res.status(201).json({document:checked(await db.from('documents').insert({...input,user_id:req.user!.id}).select(fields).single())});
  }));
  router.put('/:id/file', express.raw({type:()=>true,limit:MAX_DOCUMENT_BYTES}), wrap(async(req,res) => {
    const row = await find(req.params.id,req.user!.id);
    if (row.file_path) throw new DocumentError(409,'Bu belgeye dosya eklenmiş. Listeyi yenileyin.');
    const mime = (req.headers['content-type'] ?? '').split(';')[0];
    const extension = Buffer.isBuffer(req.body) ? documentExtension(req.body,mime) : null;
    if (!extension) throw new DocumentError(400,'En fazla 4 MB PDF, JPEG veya PNG dosyası seçin.');
    const path = `${req.user!.id}/${row.id}.${extension}`;
    checked(await bucket.upload(path,req.body,{contentType:mime,upsert:false}));
    try {
      const saved = checked(await db.from('documents').update({file_path:path}).eq('id',row.id).eq('user_id',req.user!.id).is('file_path',null).select(fields).maybeSingle());
      if (!saved) throw new DocumentError(409,'Belge değişti. Listeyi yenileyin.');
      res.json({document:saved});
    } catch (error) {
      // A transport error may arrive after Postgres committed the pointer.
      const persisted = await db.from('documents').select(fields).eq('id',row.id).eq('user_id',req.user!.id).maybeSingle();
      if (persisted.error) throw new DocumentError(503,'Dosya sonucu doğrulanamadı. Listeyi yenileyin; tekrar yüklemeden önce kontrol edin.');
      if (persisted.data?.file_path === path) return res.json({document:persisted.data});
      const cleanup = await bucket.remove([path]);
      if (cleanup.error) throw new DocumentError(503,'Dosya kaydı tamamlanamadı; dosya temizliği için destek gerekiyor.');
      throw error;
    }
  }));
  router.get('/:id/file', wrap(async(req,res) => {
    const row = await find(req.params.id,req.user!.id);
    if (!row.file_path) throw new DocumentError(404,'Bu belgeye dosya eklenmemiş.');
    const signed = checked(await bucket.createSignedUrl(safePath(row,req.user!.id),60,{download:true}));
    res.json({url:signed.signedUrl});
  }));
  router.delete('/:id', wrap(async(req,res) => {
    const row = await find(req.params.id,req.user!.id);
    if (row.file_path) checked(await bucket.remove([safePath(row,req.user!.id)]));
    const removed = checked(await db.from('documents').delete().eq('id',row.id).eq('user_id',req.user!.id).select('id').maybeSingle());
    if (!removed) throw new DocumentError(409,'Belge değişti. Listeyi yenileyin.');
    res.json({deleted:true});
  }));
  router.use((err:any,_req:Request,res:Response,next:NextFunction) => {
    if (err instanceof z.ZodError) return res.status(400).json({error:{message:'Belge bilgilerini kontrol edin.'}});
    if (err instanceof DocumentError) return res.status(err.status).json({error:{message:err.message}});
    next(err);
  });
  return router;
}
