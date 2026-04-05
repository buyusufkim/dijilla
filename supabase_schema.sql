-- Supabase Schema for Dijilla

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Safely add columns if table already existed
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    EXCEPTION WHEN duplicate_column THEN END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    EXCEPTION WHEN duplicate_column THEN END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    EXCEPTION WHEN duplicate_column THEN END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    EXCEPTION WHEN duplicate_column THEN END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN points INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plate TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    year INTEGER,
    fuel_type TEXT,
    insurance_expiry DATE,
    inspection_expiry DATE,
    tax_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Maintenance Records Table
CREATE TABLE IF NOT EXISTS public.maintenance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    mileage INTEGER,
    date DATE,
    cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Tow Truck Requests Table
CREATE TABLE IF NOT EXISTS public.tow_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    plate TEXT,
    phone TEXT,
    address TEXT,
    destination TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Insurance Policies Table
CREATE TABLE IF NOT EXISTS public.insurance_policies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    type TEXT,
    provider TEXT,
    policy_number TEXT,
    start_date DATE,
    end_date DATE,
    premium DECIMAL(10, 2),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    category TEXT,
    amount DECIMAL(10, 2),
    date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    
    DROP POLICY IF EXISTS "Users can view own vehicles" ON public.vehicles;
    DROP POLICY IF EXISTS "Users can insert own vehicles" ON public.vehicles;
    DROP POLICY IF EXISTS "Users can update own vehicles" ON public.vehicles;
    DROP POLICY IF EXISTS "Users can delete own vehicles" ON public.vehicles;
    
    DROP POLICY IF EXISTS "Users can view own maintenance" ON public.maintenance_records;
    DROP POLICY IF EXISTS "Users can insert own maintenance" ON public.maintenance_records;
    
    DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Users can insert own appointments" ON public.appointments;
    
    DROP POLICY IF EXISTS "Users can view own tow requests" ON public.tow_requests;
    DROP POLICY IF EXISTS "Users can insert own tow requests" ON public.tow_requests;
    
    DROP POLICY IF EXISTS "Users can view own insurance" ON public.insurance_policies;
    DROP POLICY IF EXISTS "Users can insert own insurance" ON public.insurance_policies;
    
    DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
END $$;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own vehicles" ON public.vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vehicles" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicles" ON public.vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicles" ON public.vehicles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own maintenance" ON public.maintenance_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own maintenance" ON public.maintenance_records FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tow requests" ON public.tow_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tow requests" ON public.tow_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own insurance" ON public.insurance_policies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insurance" ON public.insurance_policies FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, points)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 0)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN new;
EXCEPTION
  WHEN others THEN
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
