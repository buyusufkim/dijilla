import { Request } from "express";
import { supabaseAdmin } from "./supabase.js";
import { createAuthMiddleware } from './verified-auth.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Auth Middleware
 * Verifies the Supabase JWT from the Authorization header.
 * Strictly requires a valid Supabase session.
 */
export const authMiddleware = createAuthMiddleware(token => supabaseAdmin.auth.getUser(token));
