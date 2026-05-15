import { supabase } from '@/supabase';
import type { Database } from '@/server/types';

export { supabase };

type TableName = keyof Database['public']['Tables'];

// Configuration check
export const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// --- Database Service ---
export const db = supabase as any;

// --- Auth Service ---
export const auth = {
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (callback: (user: any) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return { data: { subscription } };
  },
  signIn: (credentials: any) => supabase.auth.signInWithPassword(credentials),
  signUp: (credentials: any) => supabase.auth.signUp(credentials),
  signOut: () => supabase.auth.signOut(),
  updateUser: (data: any) => supabase.auth.updateUser(data)
};

// --- Storage Service ---
export const storage = {
  upload: async (bucket: string, path: string, file: File | Blob) => {
    return await supabase.storage.from(bucket).upload(path, file);
  },
  getPublicUrl: (bucket: string, path: string) => {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
};
