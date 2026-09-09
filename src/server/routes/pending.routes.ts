import { Router } from 'express';

// These legacy routes generated simulated prices, payments and policies.
// Do not mount them again; real requests will have a separate persisted API.
export function pendingRouter(message: string) {
  const router = Router();
  router.use((_req, res) => res.status(503).json({ success: false, error: { code: 'SERVICE_NOT_READY', message } }));
  return router;
}
