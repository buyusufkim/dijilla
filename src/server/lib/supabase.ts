import { createClient } from "@supabase/supabase-js";
import { Database } from "../types.js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.warn("[Supabase] Configuration missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
}

let supabaseAdminInstance: any = null;

export const getSupabaseAdmin = () => {
  if (supabaseAdminInstance) return supabaseAdminInstance;

  if (!isSupabaseConfigured) {
    console.error("[Supabase] Cannot initialize client: Missing credentials.");
    return null;
  }

  try {
    supabaseAdminInstance = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    return supabaseAdminInstance;
  } catch (err) {
    console.error("[Supabase] Initialization error:", err);
    return null;
  }
};

// For backward compatibility if needed, but we should use the getter
export const supabaseAdmin = new Proxy({} as any, {
  get: (target, prop) => {
    const client = getSupabaseAdmin();
    if (client) return client[prop];

    // Return a "safe" no-op handler that logs errors instead of crashing
    const noop = (...args: any[]) => {
      console.error(`[Supabase] Attempted to call "${String(prop)}" on uninitialized client.`);
      return Promise.reject(new Error("Supabase not configured"));
    };
    
    // If it's a known property like 'auth' or 'from', return a mock
    if (prop === 'auth') {
      return {
        getUser: () => Promise.reject(new Error("Supabase not configured")),
        getSession: () => Promise.reject(new Error("Supabase not configured")),
      };
    }
    
    if (prop === 'from') {
      return () => ({
        select: () => Promise.reject(new Error("Supabase not configured")),
        insert: () => Promise.reject(new Error("Supabase not configured")),
        update: () => Promise.reject(new Error("Supabase not configured")),
        delete: () => Promise.reject(new Error("Supabase not configured")),
      });
    }
    
    return noop;
  }
});
