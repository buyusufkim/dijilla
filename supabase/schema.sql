-- ==========================================
-- DIJILLA APP - SUPABASE POSTGRESQL SCHEMA
-- ==========================================

-- 1. PROFILES TABLE (Kullanıcı Profilleri)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi profillerini görebilir" 
    ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" 
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- Yeni kullanıcı kayıt olduğunda otomatik profil oluşturma tetikleyicisi
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. VEHICLES TABLE (Araçlar / Garaj)
CREATE TABLE vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    plate TEXT NOT NULL,
    brand_model TEXT NOT NULL,
    year INTEGER,
    insurance_expiry DATE,
    inspection_expiry DATE,
    tax_status TEXT DEFAULT 'Ödendi',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi araçlarını görebilir" ON vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar araç ekleyebilir" ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi araçlarını güncelleyebilir" ON vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi araçlarını silebilir" ON vehicles FOR DELETE USING (auth.uid() = user_id);


-- 3. DOCUMENTS TABLE (Dijital Torpido)
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('license', 'insurance', 'registration', 'other')),
    title TEXT NOT NULL,
    expiry_date DATE,
    status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'warning', 'expired')),
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi belgelerini görebilir" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar belge ekleyebilir" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi belgelerini güncelleyebilir" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi belgelerini silebilir" ON documents FOR DELETE USING (auth.uid() = user_id);


-- 4. EXPENSES TABLE (Gider Takibi)
CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('fuel', 'maintenance', 'insurance', 'other')),
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    expense_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi giderlerini görebilir" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar gider ekleyebilir" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi giderlerini güncelleyebilir" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi giderlerini silebilir" ON expenses FOR DELETE USING (auth.uid() = user_id);


-- 5. SERVICE REQUESTS TABLE (Çekici / Yol Yardım / SOS)
CREATE TABLE service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    type TEXT NOT NULL CHECK (type IN ('tow', 'battery', 'tire', 'accident', 'other')),
    plate TEXT,
    phone TEXT NOT NULL,
    location_address TEXT,
    destination TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi taleplerini görebilir" ON service_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar talep oluşturabilir" ON service_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi taleplerini güncelleyebilir" ON service_requests FOR UPDATE USING (auth.uid() = user_id);


-- 6. NOTIFICATIONS TABLE (Bildirimler)
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi bildirimlerini görebilir" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi bildirimlerini güncelleyebilir" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi bildirimlerini silebilir" ON notifications FOR DELETE USING (auth.uid() = user_id);


-- STORAGE BUCKETS (Dosya ve Fotoğraf Yüklemeleri için)
-- Supabase Storage'da 'documents' ve 'vehicles' adında bucket'lar oluşturulmalıdır.
-- (Bu işlem Supabase Dashboard üzerinden Storage kısmından yapılmalıdır)
