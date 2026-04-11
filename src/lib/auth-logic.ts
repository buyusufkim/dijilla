import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  auth, 
  db,
  doc, 
  setDoc 
} from "@/firebase";

export const handleProfileCreation = async (user: User, fullName: string, email: string) => {
  try {
    await updateProfile(user, { displayName: fullName });
  } catch (e) {
    console.warn("Profil güncellenemedi (oturum henüz hazır olmayabilir):", e);
  }

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
};

export const performDemoLogin = async () => {
  const demoEmail = 'ahmet.yilmaz@droto.com';
  const demoPassword = 'demo123456';
  
  try {
    await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
  } catch (error: any) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
      if (user) {
        await updateProfile(user, { displayName: 'Ahmet Yılmaz' });
        await setDoc(doc(db, 'profiles', user.uid), {
          id: user.uid,
          full_name: 'Ahmet Yılmaz',
          email: demoEmail,
          points: 1500,
          created_at: new Date().toISOString()
        });
        
        const { seedDemoData } = await import('@/lib/seed');
        await seedDemoData(user.uid);
      }
    } catch (e: any) {
      console.error("Demo girişi başarısız", e);
      if (e.message?.includes('already registered')) {
         await signInWithEmailAndPassword(auth, demoEmail, demoPassword).catch(console.error);
      }
    }
  }
};
