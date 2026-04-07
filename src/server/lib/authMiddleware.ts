import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "./supabase";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Auth Middleware
 * Verifies the Supabase JWT from the Authorization header.
 */
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: { message: "Yetkilendirme başlığı eksik veya geçersiz." }
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: { message: "Geçersiz veya süresi dolmuş oturum." }
      });
    }

    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: "Kimlik doğrulama sırasında bir hata oluştu." }
    });
  }
};
