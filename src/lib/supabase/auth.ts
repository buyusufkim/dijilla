import { supabase } from '../../supabase';
import { User, AuthListener } from './types';
import { isSupabaseConfigured } from './config';
import { setDataScope, clearDataScope } from './fallback';

export const auth = {
  currentUser: null as User | null,
};

const authListeners: AuthListener[] = [];
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';
const MOCK_USER_STORAGE_KEY = 'droto_mock_user';

const notifyAuthListeners = (user: User | null) => {
  auth.currentUser = user;
  authListeners.forEach((listener) => listener(user));
};

const setScopeForUser = (user: User | null) => {
  if (user?.uid) {
    setDataScope(user.uid);
  } else {
    clearDataScope();
  }
};

const clearStoredMockUser = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MOCK_USER_STORAGE_KEY);
};

const setStoredMockUser = (user: User) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
};

const getStoredMockUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  try {
    const localUser = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (!localUser) return null;
    return JSON.parse(localUser);
  } catch {
    return null;
  }
};

const isDemoLogin = (email: string) =>
  !isSupabaseConfigured || email.includes('droto.com');

const mapSessionUser = (sessionUser: any): User => ({
  uid: sessionUser.id,
  email: sessionUser.email || null,
  displayName: sessionUser.user_metadata?.full_name || null,
  photoURL: sessionUser.user_metadata?.avatar_url || null,
});

export const onAuthStateChanged = (
  authInstance: any,
  callback: AuthListener
) => {
  authListeners.push(callback);
  let unsubscribeSupabase = () => {};

  if (isSupabaseConfigured) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        clearStoredMockUser();

        const user = mapSessionUser(session.user);
        setScopeForUser(user);
        notifyAuthListeners(user);
      } else {
        const mockUser = getStoredMockUser();

        if (mockUser) {
          setScopeForUser(mockUser);
          notifyAuthListeners(mockUser);
        } else {
          setScopeForUser(null);
          notifyAuthListeners(null);
        }
      }
    });

    unsubscribeSupabase = () => subscription.unsubscribe();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        clearStoredMockUser();

        const user = mapSessionUser(session.user);
        setScopeForUser(user);
        auth.currentUser = user;
        callback(user);
      } else {
        const mockUser = getStoredMockUser();

        if (mockUser) {
          setScopeForUser(mockUser);
          auth.currentUser = mockUser;
          callback(mockUser);
        } else {
          setScopeForUser(null);
          auth.currentUser = null;
          callback(null);
        }
      }
    });
  } else {
    const mockUser = getStoredMockUser();

    if (mockUser) {
      setScopeForUser(mockUser);
      auth.currentUser = mockUser;
      callback(mockUser);
    } else {
      setScopeForUser(null);
      auth.currentUser = null;
      callback(null);
    }
  }

  return () => {
    unsubscribeSupabase();
    const index = authListeners.indexOf(callback);
    if (index > -1) authListeners.splice(index, 1);
  };
};

export const signInWithEmailAndPassword = async (
  authInstance: any,
  email: string,
  password: string
) => {
  if (isDemoLogin(email)) {
    console.log('Using mock login for demo.');

    const mockUser: User = {
      uid: MOCK_USER_ID,
      email,
      displayName: 'Ahmet Yılmaz',
      photoURL: null,
    };

    setStoredMockUser(mockUser);
    setScopeForUser(mockUser);
    notifyAuthListeners(mockUser);

    return { user: mockUser };
  }

  // Clear any existing mock session before real login
  clearStoredMockUser();
  clearDataScope();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  const user: User = mapSessionUser(data.user);

  setScopeForUser(user);
  notifyAuthListeners(user);

  return { user };
};

export const createUserWithEmailAndPassword = async (
  authInstance: any,
  email: string,
  password: string,
  fullName?: string
) => {
  if (isDemoLogin(email)) {
    console.log('Using mock signup for demo.');

    const mockUser: User = {
      uid: MOCK_USER_ID,
      email,
      displayName: fullName || null,
      photoURL: null,
    };

    setStoredMockUser(mockUser);
    setScopeForUser(mockUser);
    notifyAuthListeners(mockUser);

    return { user: mockUser };
  }

  // Clear any existing mock session before real signup
  clearStoredMockUser();
  clearDataScope();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;

  const user: User = {
    uid: data.user!.id,
    email: data.user!.email || null,
    displayName: data.user!.user_metadata?.full_name || null,
    photoURL: data.user!.user_metadata?.avatar_url || null,
  };

  // Only notify listeners if we have a session (auto-login enabled)
  if (data.session?.user) {
    setScopeForUser(user);
    notifyAuthListeners(user);
  } else {
    // If no session, user might need to verify email
    setScopeForUser(null);
  }

  return { user };
};

export const signOut = async (authInstance: any) => {
  clearStoredMockUser();
  setScopeForUser(null);
  notifyAuthListeners(null);

  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

export const updateProfile = async (
  user: any,
  data: { displayName?: string; photoURL?: string }
) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.warn(
        'Profil güncellenemedi: Aktif oturum bulunamadı. Bu durum e-posta doğrulaması beklendiğinde normaldir.'
      );
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: data.displayName,
        avatar_url: data.photoURL,
      },
    });

    if (error) {
      console.warn('Supabase updateUser hatası:', error.message);
    }
  } catch (err) {
    console.warn('updateProfile sırasında hata oluştu:', err);
  }
};