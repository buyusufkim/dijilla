import type { Request, Response, NextFunction } from 'express';
import { isVerifiedUser } from '../../lib/auth-policy.js';

type VerifiedIdentity = { id: string; email?: string; email_confirmed_at?: string; is_anonymous?: boolean };
type LookupUser = (token: string) => Promise<{ data: { user: VerifiedIdentity | null }; error: unknown }>;

export function createAuthMiddleware(lookupUser: LookupUser) {
  return async (req: Request & { user?: { id: string; email?: string } }, res: Response, next: NextFunction) => {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization ?? '');
    if (!match) return res.status(401).json({ success: false, error: { message: 'Giriş yapmanız gerekiyor.' } });
    try {
      const { data: { user }, error } = await lookupUser(match[1]);
      if (error || !user) return res.status(401).json({ success: false, error: { message: 'Oturum geçersiz veya süresi dolmuş.' } });
      if (!isVerifiedUser(user)) return res.status(403).json({ success: false, error: { message: 'E-posta adresinizi doğrulayın.' } });
      req.user = { id: user.id, email: user.email };
      return next();
    } catch {
      return res.status(503).json({ success: false, error: { message: 'Oturum kontrol edilemiyor. Tekrar deneyin.' } });
    }
  };
}
