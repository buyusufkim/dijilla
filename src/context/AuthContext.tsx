import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (user) {
        const { updateProfile } = await import('@/firebase');
        await updateProfile(user, { displayName: fullName });
        
        const { db, doc, setDoc } = await import('@/firebase');
        await setDoc(doc(db, 'profiles', user.uid), {
          id: user.uid,
          full_name: fullName,
          email: email,
          points: 0,
          created_at: new Date().toISOString()
        });
      }
      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signOutUser = async () => {
    const { signOut } = await import('@/firebase');
    await signOut(auth);
  };

  const demoLogin = async () => {
    setLoading(true);
    await performDemoLogin();
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signOut: signOutUser, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);