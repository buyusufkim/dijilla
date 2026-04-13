-- ==========================================
-- DROTO APP - SUPABASE POSTGRESQL SCHEMA
-- ==========================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Kullanıcı Profilleri)
CREATE TABLE IF NOT EXISTS profiles (
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
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. VEHICLES TABLE (Araçlar / Garaj)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
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
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    expiry_date DATE,
    status TEXT DEFAULT 'valid',
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi belgelerini görebilir" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar belge ekleyebilir" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi belgelerini güncelleyebilir" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi belgelerini silebilir" ON documents FOR DELETE USING (auth.uid() = user_id);


-- 4. EXPENSES TABLE (Gider Takibi)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
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
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    type TEXT NOT NULL,
    plate TEXT,
    phone TEXT NOT NULL,
    location_address TEXT,
    destination TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi taleplerini görebilir" ON service_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar talep oluşturabilir" ON service_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi taleplerini güncelleyebilir" ON service_requests FOR UPDATE USING (auth.uid() = user_id);


-- 6. NOTIFICATIONS TABLE (Bildirimler)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi bildirimlerini görebilir" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi bildirimlerini güncelleyebilir" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi bildirimlerini silebilir" ON notifications FOR DELETE USING (auth.uid() = user_id);


-- 7. QUOTE REQUESTS & INSURANCE FLOW
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS normalized_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  premium NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  coverage_details JSONB NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  offer_id UUID NOT NULL REFERENCES normalized_offers(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  checkout_id UUID REFERENCES checkouts(id) ON DELETE SET NULL,
  policy_number TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  premium NUMERIC(12, 2) NOT NULL,
  document_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE normalized_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quote requests" ON quote_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quote requests" ON quote_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view offers for own requests" ON normalized_offers FOR SELECT 
USING (EXISTS (SELECT 1 FROM quote_requests WHERE id = normalized_offers.quote_request_id AND user_id = auth.uid()));

CREATE POLICY "Users can view own checkouts" ON checkouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkouts" ON checkouts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own policies" ON policies FOR SELECT USING (auth.uid() = user_id);
