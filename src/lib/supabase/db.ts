import { supabase } from '../../supabase';
import { isSupabaseConfigured } from './config';
import { getLocalData, setLocalData, generateId, subscribeLocalDbChange } from './fallback';

const isDemoMode = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('droto_mock_user');
};

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

const verifiedProfiles = new Set<string>();

const ensureProfileExists = async (userId: any): Promise<boolean> => {
  if (!userId || typeof userId !== 'string') return false;
  
  // Basic UUID check to prevent Supabase errors for mock IDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) return false;

  if (verifiedProfiles.has(userId)) return true;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      verifiedProfiles.add(userId);
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
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

export const getDocs = async (queryRef: any) => {
  if (!isSupabaseConfigured || isDemoMode()) {
    let localData = getLocalData(queryRef.table);
    
    if (queryRef.constraints) {
      for (const c of queryRef.constraints) {
        if (c.type === 'where' && c.op === '==') {
          localData = localData.filter((item: any) => item[c.field] === c.value);
        }
      }
      
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
      
      if (queryRef.constraints) {
        for (const c of queryRef.constraints) {
          if (c.type === 'where' && c.op === '==') {
            localData = localData.filter((item: any) => item[c.field] === c.value);
          }
        }
        
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
  if (!isSupabaseConfigured || isDemoMode()) {
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
  if (!isSupabaseConfigured || isDemoMode()) {
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

  // Ensure profile exists for tables with user_id FK (except profiles itself)
  if (docRef.table !== 'profiles' && data.user_id) {
    const profileExists = await ensureProfileExists(data.user_id);
    if (!profileExists) {
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
  if (!isSupabaseConfigured || isDemoMode()) {
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
  if (!isSupabaseConfigured || isDemoMode()) {
    const localData = getLocalData(collectionRef.table);
    const newId = generateId();
    localData.push({ ...data, id: newId });
    setLocalData(collectionRef.table, localData);
    return { id: newId };
  }

  // Ensure profile exists for tables with user_id FK (except profiles itself)
  if (collectionRef.table !== 'profiles' && data.user_id) {
    const profileExists = await ensureProfileExists(data.user_id);
    if (!profileExists) {
      const localData = getLocalData(collectionRef.table);
      const newId = generateId();
      localData.push({ ...data, id: newId });
      setLocalData(collectionRef.table, localData);
      return { id: newId };
    }
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
  if (!isSupabaseConfigured || isDemoMode()) {
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

export const onSnapshot = (
  queryRef: any,
  callback: (snapshot: any) => void,
  errorCallback?: (error: any) => void
) => {
  let lastDataString = "";

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

  fetchAndNotify();

  let channel: any = null;
  let interval: ReturnType<typeof setInterval> | null = null;
  let unsubscribeLocal: (() => void) | null = null;

  if (isSupabaseConfigured && !isDemoMode()) {
    try {
      channel = supabase
        .channel(`public:${queryRef.table}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: queryRef.table },
          () => {
            fetchAndNotify();
          }
        )
        .subscribe((status) => {
          if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
            console.warn(`Supabase Realtime subscription ${status} for ${queryRef.table}`);

            if (!interval) {
              interval = setInterval(() => {
                fetchAndNotify();
              }, 10000);
            }
          }
        });
    } catch (e) {
      console.warn("Supabase Realtime subscription failed:", e);

      interval = setInterval(() => {
        fetchAndNotify();
      }, 10000);
    }
  } else {
    // Local/Demo mode: subscribe to local changes
    unsubscribeLocal = subscribeLocalDbChange(queryRef.table, () => {
      fetchAndNotify();
    });
  }

  return () => {
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    }

    if (interval) {
      clearInterval(interval);
    }

    if (unsubscribeLocal) {
      unsubscribeLocal();
    }
  };
};
