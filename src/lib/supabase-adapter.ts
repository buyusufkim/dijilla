import { supabase } from '../supabase';

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
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { user: { uid: data.user.id, email: data.user.email, displayName: data.user.user_metadata?.full_name || null, photoURL: data.user.user_metadata?.avatar_url || null } };
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return { user: { uid: data.user!.id, email: data.user!.email, displayName: null, photoURL: null } };
};

export const signOut = async (authInstance: any) => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const updateProfile = async (user: any, data: { displayName?: string; photoURL?: string }) => {
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: data.displayName,
      avatar_url: data.photoURL,
    }
  });
  if (error) throw error;
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
  const data = localStorage.getItem(`dijilla_${table}`);
  return data ? JSON.parse(data) : [];
};

const setLocalData = (table: string, data: any[]) => {
  localStorage.setItem(`dijilla_${table}`, JSON.stringify(data));
};

export const getDocs = async (queryRef: any) => {
  let q = supabase.from(queryRef.table).select('*');
  if (queryRef.constraints) {
    q = applyConstraints(q, queryRef.constraints);
  }
  const { data, error } = await q;
  
  if (error) {
    console.warn(`Supabase error for ${queryRef.table}, falling back to localStorage:`, error.message);
    let localData = getLocalData(queryRef.table);
    
    // Apply basic local filtering
    if (queryRef.constraints) {
      for (const c of queryRef.constraints) {
        if (c.type === 'where' && c.op === '==') {
          localData = localData.filter((item: any) => item[c.field] === c.value);
        }
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
};

export const getDoc = async (docRef: any) => {
  const { data, error } = await supabase.from(docRef.table).select('*').eq('id', docRef.id).single();
  
  if (error) {
    if (error.code !== 'PGRST116') {
      console.warn(`Supabase error for ${docRef.table}, falling back to localStorage:`, error.message);
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
};

export const setDoc = async (docRef: any, data: any, options?: { merge?: boolean }) => {
  const { error } = await supabase.from(docRef.table).upsert({ id: docRef.id, ...data });
  
  if (error) {
    console.warn(`Supabase error for ${docRef.table}, falling back to localStorage:`, error.message);
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
  const { error } = await supabase.from(docRef.table).update(data).eq('id', docRef.id);
  
  if (error) {
    console.warn(`Supabase error for ${docRef.table}, falling back to localStorage:`, error.message);
    const localData = getLocalData(docRef.table);
    const index = localData.findIndex((x: any) => x.id === docRef.id);
    if (index >= 0) {
      localData[index] = { ...localData[index], ...data };
      setLocalData(docRef.table, localData);
    }
  }
};

export const addDoc = async (collectionRef: any, data: any) => {
  const { data: inserted, error } = await supabase.from(collectionRef.table).insert(data).select();
  
  if (error) {
    console.warn(`Supabase error for ${collectionRef.table}, falling back to localStorage:`, error.message);
    const localData = getLocalData(collectionRef.table);
    const newId = crypto.randomUUID();
    localData.push({ ...data, id: newId });
    setLocalData(collectionRef.table, localData);
    return { id: newId };
  }
  
  return { id: inserted?.[0]?.id || crypto.randomUUID() };
};

export const deleteDoc = async (docRef: any) => {
  const { error } = await supabase.from(docRef.table).delete().eq('id', docRef.id);
  
  if (error) {
    console.warn(`Supabase error for ${docRef.table}, falling back to localStorage:`, error.message);
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
      console.error(err);
      if (errorCallback) errorCallback(err);
    }
  };

  // Initial fetch
  fetchAndNotify();

  // Realtime subscription
  const channel = supabase.channel(`public:${queryRef.table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: queryRef.table }, () => {
      fetchAndNotify();
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Successfully subscribed
      }
    });

  // Polling fallback for localStorage changes (since Supabase realtime won't trigger for local changes)
  const interval = setInterval(() => {
    fetchAndNotify();
  }, 2000);

  return () => {
    supabase.removeChannel(channel);
    clearInterval(interval);
  };
};
