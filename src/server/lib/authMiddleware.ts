import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "./supabase.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Generates a deterministic UUID-like string from an email.
 * This ensures data isolation between different demo accounts.
 */
const generateDemoUserId = (email: string) => {
  const cleanEmail = email.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < cleanEmail.length; i++) {
    const char = cleanEmail.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 31).toString(16).padStart(8, '0');
  const hex3 = Math.abs(hash * 7).toString(16).padStart(8, '0');
  const hex4 = Math.abs(hash * 13).toString(16).padStart(8, '0');

  // Format as valid UUID: xxxxxxxx-xxxx-4xxx-axxx-xxxxxxxxxxxx
  const part1 = hex;
  const part2 = hex2.substring(0, 4);
  const part3 = "4" + hex3.substring(0, 3); // Version 4
  const part4 = "a" + hex4.substring(0, 3); // Variant a
  const part5 = (hex + hex2 + hex3).substring(0, 12);
  
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
};

/**
 * Auth Middleware
 * Verifies the Supabase JWT from the Authorization header.
 * Supports a secure Demo Mode for testing when ENABLE_DEMO_MODE is true.
 */
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const isDemoEnabled = process.env.ENABLE_DEMO_MODE === "true";

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: { message: "Yetkilendirme başlığı eksik veya geçersiz." }
    });
  }

  const token = authHeader.split(" ")[1];

  // Handle Demo Mode
  if (isDemoEnabled && token.startsWith("mock-token")) {
    const email = token.includes(":") ? token.split(":")[1] : "demo@droto.com";
    console.log(`[Auth] Demo request authorized for ${email}`);
    req.user = {
      id: generateDemoUserId(email),
      email: email
    };
    return next();
  }

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
