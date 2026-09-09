import express, { Request, Response, NextFunction, RequestHandler } from "express";
import { authMiddleware } from './lib/authMiddleware.js';
import { pendingRouter } from './routes/pending.routes.js';
import { createRequestsRouter } from './routes/requests.routes.js';
import { supabaseAdmin } from './lib/supabase.js';

export function createApp(authenticate: RequestHandler = authMiddleware) {
const app = express();

// Middleware
app.use(express.json());

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    service: "Droto Backend"
  });
});

// Routes
app.use('/api', authenticate);
app.use('/api/requests', createRequestsRouter(supabaseAdmin));
app.use('/api/quotes', pendingRouter('Sigorta talep sistemi hazırlanıyor. Henüz talep oluşturulmadı.'));
app.use('/api/checkouts', pendingRouter('Uygulama içinden ödeme alınmıyor. Herhangi bir ödeme veya paket oluşturulmadı.'));
app.use('/api/ai', pendingRouter('Yapay zekâ hizmeti kullanım sınırları hazırlanırken geçici olarak kapalı.'));

// 404 Handler for API routes
app.use("/api", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { message: "İstenen kaynak bulunamadı." }
  });
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.type === 'entity.too.large' ? 413 : err.type === 'entity.parse.failed' ? 400 : 500;
  res.status(status).json({
    success: false,
    error: {
      message: status === 400 ? 'Geçersiz istek.' : status === 413 ? 'İstek boyutu çok büyük.' : 'İşlem tamamlanamadı. Lütfen tekrar deneyin.'
    }
  });
});

return app;
}

export default createApp();
