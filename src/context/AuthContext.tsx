import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as supabaseSignOut,
  auth
} from "@/firebase";
import { performDemoLogin } from '@/lib/auth-logic';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any; requiresEmailVerification?: boolean }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: any; requiresEmailVerification?: boolean }>;
  signOut: () => Promise<void>;
  demoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => ({ error: null, requiresEmailVerification: false }),
  signUpWithEmail: async () => ({ error: null, requiresEmailVerification: false }),
  signOut: async () => {},
  demoLogin: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password, fullName);
      const requiresEmailVerification = !auth.currentUser;
      setLoading(false);
      return { error: null, requiresEmailVerification };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    await supabaseSignOut(auth);
  };

  const demoLogin = async () => {
    setLoading(true);
    await performDemoLogin();
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signOut, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);