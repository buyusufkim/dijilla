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
