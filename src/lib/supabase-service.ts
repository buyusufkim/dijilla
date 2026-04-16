import { supabase } from '@/supabase';

// Configuration check
export const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// --- Database Service ---
export const db = {
  from: (table: string) => {
    return {
      select: async (columns: string = '*') => {
        return await supabase.from(table).select(columns);
      },
      insert: async (data: any) => {
        return await supabase.from(table).insert(data).select();
      },
      update: async (data: any, id: string) => {
        return await supabase.from(table).update(data).eq('id', id);
      },
      delete: async (id: string) => {
        return await supabase.from(table).delete().eq('id', id);
      },
      upsert: async (data: any) => {
        return await supabase.from(table).upsert(data);
      },
      // Simplified Realtime
      subscribe: (callback: (data: any[]) => void) => {
        const fetchAndNotify = async () => {
          const { data } = await db.from(table).select('*');
          if (data) callback(data);
        };

        fetchAndNotify();

        const channel = supabase
          .channel(`public:${table}`)
          .on("postgres_changes", { event: "*", schema: "public", table }, () => {
            fetchAndNotify();
          })
          .subscribe();
        
        return () => {
          supabase.removeChannel(channel);
        };
      }
    };
  }
};

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
