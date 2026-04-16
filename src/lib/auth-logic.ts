import { auth, db } from "@/lib/supabase-service";

export const handleProfileCreation = async (user: any, fullName: string, email: string) => {
  try {
    await auth.updateUser({
      data: { full_name: fullName }
    });
  } catch (e) {
    console.warn("Profil güncellenemedi (oturum henüz hazır olmayabilir):", e);
  }

  try {
    await db.from('profiles').upsert({
      id: user.id,
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
    const { data, error } = await auth.signIn({ email: demoEmail, password: demoPassword });
    if (error) throw error;
  } catch (error: any) {
    try {
      const { data, error: signUpError } = await auth.signUp({ 
        email: demoEmail, 
        password: demoPassword,
        options: {
          data: { full_name: 'Ahmet Yılmaz' }
        }
      });
      
      if (data?.user && !signUpError) {
        await db.from('profiles').upsert({
          id: data.user.id,
          full_name: 'Ahmet Yılmaz',
          email: demoEmail,
          points: 1500,
          created_at: new Date().toISOString()
        });
        
        const { seedDemoData } = await import('@/lib/seed');
        await seedDemoData(data.user.id);
      }
    } catch (e: any) {
      console.error("Demo girişi başarısız", e);
      if (e.message?.includes('already registered')) {
         await auth.signIn({ email: demoEmail, password: demoPassword }).catch(console.error);
      }
    }
  }
};
