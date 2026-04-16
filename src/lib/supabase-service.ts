import { supabase } from '@/supabase';

// Configuration check
export const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// --- Fallback / Demo Mode Logic ---
const STORAGE_SCOPE_KEY = "droto_data_scope";
const MOCK_USER_STORAGE_KEY = 'droto_mock_user';

const getScope = () => {
  if (typeof window === "undefined") return "guest";
  return localStorage.getItem(STORAGE_SCOPE_KEY) || "guest";
};

const getScopedTableKey = (table: string) => `droto_${getScope()}_${table}`;

const getLocalData = (table: string) => {
  try {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(getScopedTableKey(table));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const setLocalData = (table: string, data: any[]) => {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(getScopedTableKey(table), JSON.stringify(data));
    emitLocalDbChange(table);
  } catch (e) {}
};

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

// Local change event system
type ChangeCallback = () => void;
const listeners: Record<string, Set<ChangeCallback>> = {};

const subscribeLocalDbChange = (table: string, callback: ChangeCallback) => {
  if (!listeners[table]) {
    listeners[table] = new Set();
  }
  listeners[table].add(callback);
  return () => {
    listeners[table].delete(callback);
  };
};

const emitLocalDbChange = (table: string) => {
  if (listeners[table]) {
    listeners[table].forEach((cb) => cb());
  }
};

const isDemoMode = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(MOCK_USER_STORAGE_KEY) || !isSupabaseConfigured;
};

// --- Database Service ---
export const db = {
  from: (table: string) => {
    return {
      select: async (columns: string = '*') => {
        if (isDemoMode()) {
          const data = getLocalData(table);
          return { data, error: null };
        }
        return await supabase.from(table).select(columns);
      },
      insert: async (data: any) => {
        if (isDemoMode()) {
          const localData = getLocalData(table);
          const newItem = { ...data, id: data.id || generateId(), created_at: new Date().toISOString() };
          localData.push(newItem);
          setLocalData(table, localData);
          return { data: [newItem], error: null };
        }
        return await supabase.from(table).insert(data).select();
      },
      update: async (data: any, id: string) => {
        if (isDemoMode()) {
          const localData = getLocalData(table);
          const index = localData.findIndex((x: any) => x.id === id);
          if (index >= 0) {
            localData[index] = { ...localData[index], ...data };
            setLocalData(table, localData);
          }
          return { error: null };
        }
        return await supabase.from(table).update(data).eq('id', id);
      },
      delete: async (id: string) => {
        if (isDemoMode()) {
          let localData = getLocalData(table);
          localData = localData.filter((x: any) => x.id !== id);
          setLocalData(table, localData);
          return { error: null };
        }
        return await supabase.from(table).delete().eq('id', id);
      },
      upsert: async (data: any) => {
        if (isDemoMode()) {
          const localData = getLocalData(table);
          const id = data.id || generateId();
          const index = localData.findIndex((x: any) => x.id === id);
          if (index >= 0) {
            localData[index] = { ...localData[index], ...data, id };
          } else {
            localData.push({ ...data, id, created_at: new Date().toISOString() });
          }
          setLocalData(table, localData);
          return { error: null };
        }
        return await supabase.from(table).upsert(data);
      },
      // Simplified Realtime
      subscribe: (callback: (data: any[]) => void) => {
        const fetchAndNotify = async () => {
          const { data } = await db.from(table).select('*');
          if (data) callback(data);
        };

        fetchAndNotify();

        if (!isDemoMode()) {
          const channel = supabase
            .channel(`public:${table}`)
            .on("postgres_changes", { event: "*", schema: "public", table }, () => {
              fetchAndNotify();
            })
            .subscribe();
          
          return () => {
            supabase.removeChannel(channel);
          };
        } else {
          return subscribeLocalDbChange(table, fetchAndNotify);
        }
      }
    };
  }
};

// --- Auth Service ---
export const auth = {
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (callback: (user: any) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  },
  signIn: (credentials: any) => supabase.auth.signInWithPassword(credentials),
  signUp: (credentials: any) => supabase.auth.signUp(credentials),
  signOut: () => {
    localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    localStorage.removeItem(STORAGE_SCOPE_KEY);
    return supabase.auth.signOut();
  },
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
