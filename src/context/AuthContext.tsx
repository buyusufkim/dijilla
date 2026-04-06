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
      
      // Update profile
      await updateProfile(user, { displayName: fullName });

      // Create profile document in Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        id: user.uid,
        full_name: fullName,
        email: email,
        points: 0,
        created_at: new Date().toISOString()
      });

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
        console.error("Demo login failed", e);
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
