import { createClient } from "@supabase/supabase-js";
import { Database } from "../types.js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
}

let supabaseAdminInstance: any = null;

export const getSupabaseAdmin = () => {
  if (supabaseAdminInstance) return supabaseAdminInstance;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  }

  supabaseAdminInstance = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseAdminInstance;
};

// For backward compatibility if needed, but we should use the getter
export const supabaseAdmin = new Proxy({} as any, {
  get: (target, prop) => {
    return getSupabaseAdmin()[prop];
  }
});
