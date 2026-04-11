import { supabase } from '../../supabase';
import { User, AuthListener } from './types';
import { isSupabaseConfigured } from './config';

export const auth = {
  currentUser: null as User | null,
};

const authListeners: AuthListener[] = [];

export const onAuthStateChanged = (authInstance: any, callback: AuthListener) => {
  authListeners.push(callback);
  let unsubscribeSupabase = () => {};

  if (isSupabaseConfigured) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user: User = {
          uid: session.user.id,
          email: session.user.email || null,
          displayName: session.user.user_metadata?.full_name || null,
          photoURL: session.user.user_metadata?.avatar_url || null,
        };
        auth.currentUser = user;
        authListeners.forEach(listener => listener(user));
      } else {
        if (!auth.currentUser || !auth.currentUser.uid.startsWith('mock-user')) {
          auth.currentUser = null;
          authListeners.forEach(listener => listener(null));
        }
      }
    });
    unsubscribeSupabase = () => subscription.unsubscribe();

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
        const localUser = localStorage.getItem('droto_mock_user');
        if (localUser) {
          try {
            const user = JSON.parse(localUser);
            auth.currentUser = user;
            callback(user);
          } catch (e) {
            callback(null);
          }
        } else {
          callback(null);
        }
      }
    });
  } else {
    const localUser = localStorage.getItem('droto_mock_user');
    if (localUser) {
      try {
        const user = JSON.parse(localUser);
        auth.currentUser = user;
        callback(user);
      } catch (e) {
        callback(null);
      }
    } else {
      callback(null);
    }
  }

  return () => {
    unsubscribeSupabase();
    const index = authListeners.indexOf(callback);
    if (index > -1) authListeners.splice(index, 1);
  };
};

export const signInWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  if (!isSupabaseConfigured || email.includes('droto.com')) {
    console.log("Using mock login for demo.");
    const mockUser = { uid: 'mock-user-123', email, displayName: 'Ahmet Yılmaz', photoURL: null };
    auth.currentUser = mockUser;
    localStorage.setItem('droto_mock_user', JSON.stringify(mockUser));
    authListeners.forEach(listener => listener(mockUser));
    return { user: mockUser };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { user: { uid: data.user.id, email: data.user.email, displayName: data.user.user_metadata?.full_name || null, photoURL: data.user.user_metadata?.avatar_url || null } };
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  if (!isSupabaseConfigured || email.includes('droto.com')) {
    console.log("Using mock signup for demo.");
    const mockUser = { uid: 'mock-user-123', email, displayName: null, photoURL: null };
    auth.currentUser = mockUser;
    localStorage.setItem('droto_mock_user', JSON.stringify(mockUser));
    authListeners.forEach(listener => listener(mockUser));
    return { user: mockUser };
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return { user: { uid: data.user!.id, email: data.user!.email, displayName: null, photoURL: null } };
};

export const signOut = async (authInstance: any) => {
  localStorage.removeItem('droto_mock_user');
  auth.currentUser = null;
  authListeners.forEach(listener => listener(null));
  
  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

export const updateProfile = async (user: any, data: { displayName?: string; photoURL?: string }) => {
  try {
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
