import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as supabaseSignOut,
  updateProfile,
  auth, 
  db,
  doc, 
  setDoc, 
  getDoc 
} from "@/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  demoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signOut: async () => {},
  demoLogin: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
        // Update profile - we wrap this in try/catch because if email confirmation is on,
        // session might not be available yet, and we don't want to block the flow.
        try {
          await updateProfile(user, { displayName: fullName });
        } catch (e) {
          console.warn("Profil güncellenemedi (oturum henüz hazır olmayabilir):", e);
        }

        // Create profile document in Firestore - this might also fail if RLS is on and no session
        // but the adapter will fallback to localStorage.
        try {
          await setDoc(doc(db, 'profiles', user.uid), {
            id: user.uid,
            full_name: fullName,
            email: email,
            points: 0,
            created_at: new Date().toISOString()
          });
        } catch (e) {
          console.warn("Profil dokümanı oluşturulamadı (yerel depolamaya kaydediliyor olabilir):", e);
        }
      }

      setLoading(false);
      return { error: null };
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
    try {
      // Try to login with demo user
      await signInWithEmailAndPassword(auth, 'ahmet@example.com', 'demo123456');
    } catch (error: any) {
      // If it fails, check if it's invalid credentials or user not found
      try {
        const { user } = await createUserWithEmailAndPassword(auth, 'ahmet@example.com', 'demo123456');
        await updateProfile(user, { displayName: 'Ahmet Yılmaz' });
        await setDoc(doc(db, 'profiles', user.uid), {
          id: user.uid,
          full_name: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          points: 1500,
          created_at: new Date().toISOString()
        });
        
        // Seed demo data
        const { seedDemoData } = await import('@/lib/seed');
        await seedDemoData(user.uid);
      } catch (e: any) {
        console.error("Demo girişi başarısız", e);
        // If user already exists but password was wrong, or trigger failed, we might still be able to login if we reset or just show error
        if (e.message?.includes('already registered')) {
           // Try one more time to login, maybe it was a race condition
           await signInWithEmailAndPassword(auth, 'ahmet@example.com', 'demo123456').catch(console.error);
        }
      }
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signOut, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
