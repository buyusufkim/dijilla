import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("[Supabase] Configuration missing. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
}

let supabaseAdminInstance: SupabaseClient<Database> | null = null;

export const getSupabaseAdmin = () => {
  if (supabaseAdminInstance) return supabaseAdminInstance;

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
    throw err;
  }
};

export const supabaseAdmin = getSupabaseAdmin() as any;
