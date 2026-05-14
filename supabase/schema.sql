-- Skema Database SIVAKSIN (Jalankan di SQL Editor Supabase)

-- 1. Tabel users (menggunakan schema public untuk profil, terhubung dengan auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  nik TEXT,
  passport_number TEXT,
  birth_date DATE,
  address TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel vaccines
CREATE TABLE public.vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL,
  description TEXT,
  benefits TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  vaccine_id UUID REFERENCES public.vaccines(id),
  date DATE,
  time TEXT,
  destination_country TEXT,
  travel_type TEXT,
  status TEXT DEFAULT 'menunggu', -- menunggu, terverifikasi, selesai
  payment_status TEXT DEFAULT 'pending', -- pending, paid
  payment_proof_url TEXT,
  certificate_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Set up ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy untuk Users
CREATE POLICY "Users dapat melihat profilnya sendiri" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users dapat mengubah profilnya sendiri" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin dapat melihat semua users" ON public.users FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Policy untuk Vaccines (semua bisa melihat status vaksin)
CREATE POLICY "Semua orang bisa melihat stok vaksin" ON public.vaccines FOR SELECT USING (true);
CREATE POLICY "Admin bisa mengelola vaksin" ON public.vaccines FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Policy untuk Bookings
CREATE POLICY "Users dapat melihat booking miliknya" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users dapat membuat booking" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users dapat mengubah status booking (upload bukti dsb)" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin dapat melihat dan mengubah semua booking" ON public.bookings FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 5. Trigger update timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 6. Storage Buckets (Silakan jalankan atau buat manual di Storage UI Supabase)
-- insert into storage.buckets (id, name, public) values ('profiles', 'profiles', true);
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
-- insert into storage.buckets (id, name, public) values ('payments', 'payments', false);
-- insert into storage.buckets (id, name, public) values ('certificates', 'certificates', false);

-- Seed Vaksin Default
INSERT INTO public.vaccines (name, price, stock, description, benefits) VALUES
('Meningitis Vaccine (Menveo)', 350000, 120, 'Vaksin wajib untuk jamaah umroh dan haji.', ARRAY['Perlindungan dari radang selaput otak', 'Sertifikat Internasional (ICV)']),
('Polio Vaccine (OPV/IPV)', 150000, 50, 'Vaksin tambahan yang diwajibkan beberapa negara.', ARRAY['Mencegah kelumpuhan akibat virus polio', 'Aman untuk dewasa']),
('Influenza Vaccine (Vaxigrip)', 300000, 200, 'Perlindungan flu tahunan untuk perjalanan wisata atau tugas kerja.', ARRAY['Mencegah infeksi virus influenza A dan B', 'Mengurangi risiko komplikasi pernapasan']);
