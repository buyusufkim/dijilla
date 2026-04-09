import { supabase } from '../supabase';

const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  console.warn("Supabase configuration is missing. Auth and database operations will fail or fallback to localStorage.");
}

// --- AUTH ADAPTER ---
export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export const auth = {
  currentUser: null as User | null,
};

export const onAuthStateChanged = (authInstance: any, callback: (user: User | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      const user: User = {
        uid: session.user.id,
        email: session.user.email || null,
        displayName: session.user.user_metadata?.full_name || null,
        photoURL: session.user.user_metadata?.avatar_url || null,
      };
      auth.currentUser = user;
      callback(user);
    } else {
      auth.currentUser = null;
      callback(null);
    }
  });

  // Initial fetch
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      const user: User = {
        uid: session.user.id,
        email: session.user.email || null,
        displayName: session.user.user_metadata?.full_name || null,
        photoURL: session.user.user_metadata?.avatar_url || null,
      };
      auth.currentUser = user;
      callback(user);
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};

export const signInWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  if (email.includes('droto.com')) {
    console.log("Using mock login for demo.");
    const mockUser = { uid: 'mock-user-123', email, displayName: 'Ahmet Yılmaz', photoURL: null };
    auth.currentUser = mockUser;
    return { user: mockUser };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { user: { uid: data.user.id, email: data.user.email, displayName: data.user.user_metadata?.full_name || null, photoURL: data.user.user_metadata?.avatar_url || null } };
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  if (email.includes('droto.com')) {
    console.log("Using mock signup for demo.");
    const mockUser = { uid: 'mock-user-123', email, displayName: null, photoURL: null };
    auth.currentUser = mockUser;
    return { user: mockUser };
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return { user: { uid: data.user!.id, email: data.user!.email, displayName: null, photoURL: null } };
};

export const signOut = async (authInstance: any) => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const updateProfile = async (user: any, data: { displayName?: string; photoURL?: string }) => {
  try {
    // Check if session exists before updating
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn("Profil güncellenemedi: Aktif oturum bulunamadı. Bu durum e-posta doğrulaması beklendiğinde normaldir.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: data.displayName,
        avatar_url: data.photoURL,
      }
    });
    if (error) {
      console.warn("Supabase updateUser hatası:", error.message);
    }
  } catch (err) {
    console.warn("updateProfile sırasında hata oluştu:", err);
  }
};

// Helper to generate IDs
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// --- FIRESTORE ADAPTER ---
export const db = {};

export const collection = (dbInstance: any, path: string) => {
  return { table: path };
};

export const doc = (dbInstance: any, path: string, id: string) => {
  return { table: path, id };
};

export const query = (collectionRef: any, ...constraints: any[]) => {
  return { ...collectionRef, constraints };
};

export const where = (field: string, op: string, value: any) => {
  return { type: 'where', field, op, value };
};

export const orderBy = (field: string, direction: 'asc' | 'desc' = 'asc') => {
  return { type: 'orderBy', field, direction };
};

export const serverTimestamp = () => {
  return new Date().toISOString();
};

const applyConstraints = (queryBuilder: any, constraints: any[]) => {
  let q = queryBuilder;
  for (const c of constraints) {
    if (c.type === 'where') {
      if (c.op === '==') q = q.eq(c.field, c.value);
      else if (c.op === '>') q = q.gt(c.field, c.value);
      else if (c.op === '<') q = q.lt(c.field, c.value);
      else if (c.op === '>=') q = q.gte(c.field, c.value);
      else if (c.op === '<=') q = q.lte(c.field, c.value);
      else if (c.op === 'in') q = q.in(c.field, c.value);
    } else if (c.type === 'orderBy') {
      q = q.order(c.field, { ascending: c.direction === 'asc' });
    }
  }
  return q;
};

// LocalStorage Fallback Helpers
const getLocalData = (table: string) => {
  try {
    const data = localStorage.getItem(`droto_${table}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("localStorage read error:", e);
    return [];
  }
};

const setLocalData = (table: string, data: any[]) => {
  try {
    localStorage.setItem(`droto_${table}`, JSON.stringify(data));
  } catch (e) {
    console.error("localStorage write error:", e);
  }
};

export const getDocs = async (queryRef: any) => {
  if (!isSupabaseConfigured) {
    const localData = getLocalData(queryRef.table);
    return {
      docs: localData.map((row: any) => ({ id: row.id, data: () => row })),
      empty: localData.length === 0,
    };
  }

  try {
    let q = supabase.from(queryRef.table).select('*');
    if (queryRef.constraints) {
      q = applyConstraints(q, queryRef.constraints);
    }
    const { data, error } = await q;
    
    if (error) {
      console.warn(`${queryRef.table} tablosu için Supabase hatası, yerel depolamaya (localStorage) geçiliyor:`, error.message);
      let localData = getLocalData(queryRef.table);
      
      // Apply basic local filtering and sorting
      if (queryRef.constraints) {
        for (const c of queryRef.constraints) {
          if (c.type === 'where' && c.op === '==') {
            localData = localData.filter((item: any) => item[c.field] === c.value);
          }
        }
        
        // Apply local sorting
        const orderByConstraint = queryRef.constraints.find((c: any) => c.type === 'orderBy');
        if (orderByConstraint) {
          localData.sort((a: any, b: any) => {
            const valA = a[orderByConstraint.field];
            const valB = b[orderByConstraint.field];
            if (valA < valB) return orderByConstraint.direction === 'asc' ? -1 : 1;
            if (valA > valB) return orderByConstraint.direction === 'asc' ? 1 : -1;
            return 0;
          });
        }
      }
      
      return {
        docs: localData.map((row: any) => ({
          id: row.id,
          data: () => row,
        })),
        empty: localData.length === 0,
      };
    }

    return {
      docs: (data || []).map((row: any) => ({
        id: row.id,
        data: () => row,
      })),
      empty: data?.length === 0,
    };
  } catch (err) {
    console.error("getDocs exception:", err);
    const localData = getLocalData(queryRef.table);
    return {
      docs: localData.map((row: any) => ({ id: row.id, data: () => row })),
      empty: localData.length === 0,
    };
  }
};

export const getDoc = async (docRef: any) => {
  if (!isSupabaseConfigured) {
    const localData = getLocalData(docRef.table);
    const item = localData.find((x: any) => x.id === docRef.id);
    return { id: docRef.id, exists: () => !!item, data: () => item };
  }

  try {
    const { data, error } = await supabase.from(docRef.table).select('*').eq('id', docRef.id).single();
    
    if (error) {
      if (error.code !== 'PGRST116') {
        console.warn(`${docRef.table} tablosu için Supabase hatası, yerel depolamaya (localStorage) geçiliyor:`, error.message);
      }
      const localData = getLocalData(docRef.table);
      const item = localData.find((x: any) => x.id === docRef.id);
      return {
        id: docRef.id,
        exists: () => !!item,
        data: () => item,
      };
    }

    return {
      id: docRef.id,
      exists: () => !!data,
      data: () => data,
    };
  } catch (err) {
    console.error("getDoc exception:", err);
    const localData = getLocalData(docRef.table);
    const item = localData.find((x: any) => x.id === docRef.id);
    return { id: docRef.id, exists: () => !!item, data: () => item };
  }
};

export const setDoc = async (docRef: any, data: any, options?: { merge?: boolean }) => {
  if (!isSupabaseConfigured) {
    const localData = getLocalData(docRef.table);
    const index = localData.findIndex((x: any) => x.id === docRef.id);
    if (index >= 0) {
      localData[index] = { ...localData[index], ...data, id: docRef.id };
    } else {
      localData.push({ ...data, id: docRef.id });
    }
    setLocalData(docRef.table, localData);
    return;
  }

  try {
    const { error } = await supabase.from(docRef.table).upsert({ id: docRef.id, ...data });
    
    if (error) {
      console.warn(`${docRef.table} tablosu için Supabase hatası, yerel depolamaya (localStorage) geçiliyor:`, error.message);
      const localData = getLocalData(docRef.table);
      const index = localData.findIndex((x: any) => x.id === docRef.id);
      if (index >= 0) {
        localData[index] = { ...localData[index], ...data, id: docRef.id };
      } else {
        localData.push({ ...data, id: docRef.id });
      }
      setLocalData(docRef.table, localData);
    }
  } catch (err) {
    console.error("setDoc exception:", err);
    const localData = getLocalData(docRef.table);
    const index = localData.findIndex((x: any) => x.id === docRef.id);
    if (index >= 0) {
      localData[index] = { ...localData[index], ...data, id: docRef.id };
    } else {
      localData.push({ ...data, id: docRef.id });
    }
    setLocalData(docRef.table, localData);
  }
};

export const updateDoc = async (docRef: any, data: any) => {
  if (!isSupabaseConfigured) {
    const localData = getLocalData(docRef.table);
    const index = localData.findIndex((x: any) => x.id === docRef.id);
    if (index >= 0) {
      localData[index] = { ...localData[index], ...data };
      setLocalData(docRef.table, localData);
    }
    return;
  }

  try {
    const { error } = await supabase.from(docRef.table).update(data).eq('id', docRef.id);
    
    if (error) {
      console.warn(`${docRef.table} tablosu için Supabase hatası, yerel depolamaya (localStorage) geçiliyor:`, error.message);
      const localData = getLocalData(docRef.table);
      const index = localData.findIndex((x: any) => x.id === docRef.id);
      if (index >= 0) {
        localData[index] = { ...localData[index], ...data };
        setLocalData(docRef.table, localData);
      }
    }
  } catch (err) {
    console.error("updateDoc exception:", err);
    const localData = getLocalData(docRef.table);
    const index = localData.findIndex((x: any) => x.id === docRef.id);
    if (index >= 0) {
      localData[index] = { ...localData[index], ...data };
      setLocalData(docRef.table, localData);
    }
  }
};

export const addDoc = async (collectionRef: any, data: any) => {
  console.log(`Adding document to ${collectionRef.table}...`, data);
  
  if (!isSupabaseConfigured) {
    console.log("Supabase not configured, using localStorage for addDoc");
    const localData = getLocalData(collectionRef.table);
    const newId = generateId();
    localData.push({ ...data, id: newId });
    setLocalData(collectionRef.table, localData);
    return { id: newId };
  }

  try {
    const { data: inserted, error } = await supabase.from(collectionRef.table).insert(data).select();
    
    if (error) {
      console.warn(`${collectionRef.table} tablosu için Supabase hatası, yerel depolamaya (localStorage) geçiliyor:`, error.message);
      const localData = getLocalData(collectionRef.table);
      const newId = generateId();
      localData.push({ ...data, id: newId });
      setLocalData(collectionRef.table, localData);
      return { id: newId };
    }
    
    console.log("Document added successfully to Supabase");
    return { id: inserted?.[0]?.id || generateId() };
  } catch (err) {
    console.error("addDoc exception:", err);
    const localData = getLocalData(collectionRef.table);
    const newId = generateId();
    localData.push({ ...data, id: newId });
    setLocalData(collectionRef.table, localData);
    return { id: newId };
  }
};

export const deleteDoc = async (docRef: any) => {
  if (!isSupabaseConfigured) {
    let localData = getLocalData(docRef.table);
    localData = localData.filter((x: any) => x.id !== docRef.id);
    setLocalData(docRef.table, localData);
    return;
  }

  try {
    const { error } = await supabase.from(docRef.table).delete().eq('id', docRef.id);
    
    if (error) {
      console.warn(`${docRef.table} tablosu için Supabase hatası, yerel depolamaya (localStorage) geçiliyor:`, error.message);
      let localData = getLocalData(docRef.table);
      localData = localData.filter((x: any) => x.id !== docRef.id);
      setLocalData(docRef.table, localData);
    }
  } catch (err) {
    console.error("deleteDoc exception:", err);
    let localData = getLocalData(docRef.table);
    localData = localData.filter((x: any) => x.id !== docRef.id);
    setLocalData(docRef.table, localData);
  }
};

export const onSnapshot = (queryRef: any, callback: (snapshot: any) => void, errorCallback?: (error: any) => void) => {
  let lastDataString = '';

  const fetchAndNotify = async () => {
    try {
      const snapshot = await getDocs(queryRef);
      const currentDataString = JSON.stringify(snapshot.docs.map((d: any) => d.data()));
      if (currentDataString !== lastDataString) {
        lastDataString = currentDataString;
        callback(snapshot);
      }
    } catch (err) {
      console.error("onSnapshot fetch error:", err);
      if (errorCallback) errorCallback(err);
    }
  };

  // Initial fetch
  fetchAndNotify();

  let channel: any = null;
  if (isSupabaseConfigured) {
    try {
      // Realtime subscription
      channel = supabase.channel(`public:${queryRef.table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: queryRef.table }, () => {
          fetchAndNotify();
        })
        .subscribe((status) => {
          if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            console.warn(`Supabase Realtime subscription ${status} for ${queryRef.table}`);
          }
        });
    } catch (e) {
      console.warn("Supabase Realtime subscription failed:", e);
    }
  }

  // Polling fallback for localStorage changes and Supabase failures
  const interval = setInterval(() => {
    fetchAndNotify();
  }, 3000);

  return () => {
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    }
    clearInterval(interval);
  };
};
