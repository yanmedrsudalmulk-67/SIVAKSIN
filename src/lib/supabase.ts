import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Validasi apakah URL Supabase valid dan bukan placeholder
 */
export const isValidSupabaseUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase().trim();
  if (
    lower.includes('placeholder') || 
    lower.includes('example.com') || 
    lower.includes('your-project') ||
    lower.length < 15
  ) {
    return false;
  }
  if (!lower.startsWith('https://')) return false;
  try {
    const parsed = new URL(lower);
    return parsed.hostname.length > 5 && parsed.hostname.includes('.');
  } catch {
    return false;
  }
};

/**
 * Membersihkan dan menormalisasi URL Supabase (membuang slash berlebih, subpath dashboard, dsb.)
 */
export const normalizeSupabaseUrl = (inputUrl: string): string => {
  let cleaned = inputUrl.trim();
  if (!cleaned) return '';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  try {
    const urlObj = new URL(cleaned);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch (e) {
    return cleaned.replace(/\/+$/, '');
  }
};

/**
 * Menerjemahkan pesan error teknis Supabase (seperti TypeError: Failed to fetch)
 * menjadi penjelasan yang jelas dan solutif bagi pengguna.
 */
export const formatSupabaseErrorMessage = (error: any): string => {
  if (!error) return 'Terjadi kesalahan tidak diketahui';
  const msg = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
  
  if (
    msg.includes('Failed to fetch') || 
    msg.includes('NetworkError') || 
    msg.includes('Network request failed') || 
    msg.includes('TypeError') ||
    msg.includes('timeout')
  ) {
    return 'Gagal terhubung ke server Supabase (Failed to fetch). Kemungkinan server sedang Dijeda (Paused) karena tidak aktif >7 hari, koneksi offline, atau URL tidak dapat dijangkau.';
  }
  if (msg.includes('42P01') || msg.includes('relation') || msg.includes('does not exist')) {
    return 'Tabel database belum dibuat di Supabase. Silakan buka menu SQL Editor di Supabase dan jalankan skrip SQL yang kami sediakan.';
  }
  if (msg.includes('JWT') || msg.includes('apiKey') || msg.includes('apikey') || msg.includes('invalid claim')) {
    return 'Anon Key Supabase tidak valid atau sudah kedaluwarsa. Periksa kembali pengaturan API Key di Supabase.';
  }
  return msg;
};

const getInitialConfig = () => {
  const env = (import.meta as any).env || {};
  const envUrl = env.VITE_SUPABASE_URL;
  const envKey = env.VITE_SUPABASE_ANON_KEY;

  if (
    envUrl && 
    envKey && 
    isValidSupabaseUrl(envUrl) &&
    typeof envKey === 'string' &&
    envKey.trim().length > 20 &&
    !envKey.includes('placeholder')
  ) {
    return { url: normalizeSupabaseUrl(envUrl), key: envKey.trim(), source: 'env' as const };
  }

  try {
    const savedUrl = localStorage.getItem('sivaksin_supabase_url');
    const savedKey = localStorage.getItem('sivaksin_supabase_key');
    if (
      savedUrl && 
      savedKey && 
      isValidSupabaseUrl(savedUrl) && 
      savedKey.trim().length > 20 &&
      !savedKey.includes('placeholder')
    ) {
      return { url: normalizeSupabaseUrl(savedUrl), key: savedKey.trim(), source: 'storage' as const };
    }
  } catch (e) {
    // Ignore localStorage access restrictions
  }

  return { url: '', key: '', source: 'none' as const };
};

let currentConfig = getInitialConfig();

export let isSupabaseConfigured = Boolean(
  currentConfig.url && 
  currentConfig.key && 
  isValidSupabaseUrl(currentConfig.url) &&
  currentConfig.key.length > 20
);

export let supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? currentConfig.url : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? currentConfig.key : 'placeholder-anon-key'
);

export const getSupabaseConfig = () => {
  return {
    ...currentConfig,
    isConfigured: isSupabaseConfigured
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = key.trim();

  if (!isValidSupabaseUrl(cleanUrl)) {
    throw new Error('URL Supabase harus diawali dengan https:// dan berupa domain proyek Supabase yang valid');
  }
  if (cleanKey.length < 20) {
    throw new Error('Anon Key Supabase tidak valid (terlalu pendek)');
  }

  try {
    localStorage.setItem('sivaksin_supabase_url', cleanUrl);
    localStorage.setItem('sivaksin_supabase_key', cleanKey);
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }

  currentConfig = { url: cleanUrl, key: cleanKey, source: 'storage' };
  isSupabaseConfigured = true;
  supabase = createClient(cleanUrl, cleanKey);
  return true;
};

export const clearSupabaseConfig = () => {
  try {
    localStorage.removeItem('sivaksin_supabase_url');
    localStorage.removeItem('sivaksin_supabase_key');
  } catch (e) {
    // ignore
  }
  currentConfig = getInitialConfig();
  isSupabaseConfigured = Boolean(currentConfig.url && currentConfig.key && isValidSupabaseUrl(currentConfig.url));
  supabase = createClient(
    isSupabaseConfigured ? currentConfig.url : 'https://placeholder.supabase.co',
    isSupabaseConfigured ? currentConfig.key : 'placeholder-anon-key'
  );
};

export const testSupabaseConnection = async (): Promise<{ 
  success: boolean; 
  message: string; 
  isPausedOrOffline?: boolean;
  isMissingTables?: boolean;
}> => {
  if (!isSupabaseConfigured) {
    return { 
      success: false, 
      message: 'Supabase belum dikonfigurasi. Masukkan Project URL dan Anon Key terlebih dahulu.' 
    };
  }

  try {
    // Gunakan race dengan timeout 6 detik agar tidak macet bila server Supabase sleeping/paused
    const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Failed to fetch (timeout 6s)')), 6000)
    );

    const queryPromise = supabase.from('anaphylactic_items').select('no').limit(1);
    const { error } = (await Promise.race([queryPromise, timeoutPromise])) as any;

    if (error) {
      const isFetchErr = 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('timeout') || 
        error.message?.includes('NetworkError');

      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return {
          success: true,
          message: 'Terhubung ke server Supabase! (Catatan: Tabel belum dibuat di SQL Editor. Silakan salin & jalankan skrip SQL di tab SQL Editor Supabase).',
          isMissingTables: true
        };
      }

      return { 
        success: false, 
        message: formatSupabaseErrorMessage(error),
        isPausedOrOffline: isFetchErr 
      };
    }
    return { success: true, message: 'Koneksi ke Supabase aktif dan tabel terdeteksi dengan baik!' };
  } catch (err: any) {
    const isFetchErr = 
      err.message?.includes('Failed to fetch') || 
      err.message?.includes('timeout') || 
      err.message?.includes('NetworkError');

    return { 
      success: false, 
      message: formatSupabaseErrorMessage(err),
      isPausedOrOffline: isFetchErr 
    };
  }
};

export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- SKRIP LENGKAP SETUP DATABASE & STORAGE SIVAKSIN RSUD AL-MULK DI SUPABASE
-- Salin dan jalankan seluruh query ini di menu "SQL Editor" pada dashboard Supabase Anda.
-- ==============================================================================

-- 1. TABEL ANAFILAKTIK KIT ITEMS
CREATE TABLE IF NOT EXISTS public.anaphylactic_items (
    id BIGSERIAL PRIMARY KEY,
    no INTEGER NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    spesifikasi TEXT NOT NULL,
    "stokAwal" INTEGER NOT NULL DEFAULT 1,
    "stokSisa" INTEGER NOT NULL DEFAULT 1,
    "noBatch" TEXT DEFAULT '-',
    "expDate" TEXT DEFAULT '-',
    kondisi TEXT NOT NULL DEFAULT 'Baik',
    kategori TEXT DEFAULT 'Alat',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL METADATA FORMULIR ANAFILAKTIK KIT
CREATE TABLE IF NOT EXISTS public.anaphylactic_meta (
    id TEXT PRIMARY KEY DEFAULT 'current_report',
    "unitRuangan" TEXT NOT NULL,
    "lokasiKit" TEXT NOT NULL,
    "periodeBulan" TEXT NOT NULL,
    "tanggalPemeriksaan" TEXT NOT NULL,
    "namaPetugas" TEXT NOT NULL,
    "catatanPetugas" TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL RIWAYAT MONITORING ANAFILAKTIK KIT
CREATE TABLE IF NOT EXISTS public.anaphylactic_history (
    id TEXT PRIMARY KEY,
    "tanggalPemeriksaan" TEXT NOT NULL,
    "periodeBulan" TEXT NOT NULL,
    "unitRuangan" TEXT NOT NULL,
    "lokasiKit" TEXT NOT NULL,
    "namaPetugas" TEXT NOT NULL,
    "catatanPetugas" TEXT,
    "totalItem" INTEGER DEFAULT 0,
    "itemsLengkap" INTEGER DEFAULT 0,
    "itemsKurang" INTEGER DEFAULT 0,
    "itemsRusak" INTEGER DEFAULT 0,
    "persentaseKesiapan" INTEGER DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL VAKSINASI & STOK
CREATE TABLE IF NOT EXISTS public.vaccines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    benefits JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL PEMESANAN / BOOKING VAKSINASI
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    "vaccineId" TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'menunggu',
    patient JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL PROFIL PENGGUNA & PASIEN
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    nik TEXT,
    no_hp TEXT,
    alamat TEXT,
    no_passport TEXT,
    avatar_url TEXT,
    ktp_url TEXT,
    passport_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABEL PENGATURAN APLIKASI & LOGO
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'main_config',
    app_logo TEXT,
    hospital_name TEXT DEFAULT 'RSUD AL-MULK KOTA SUKABUMI',
    phone TEXT DEFAULT '(0266) 6243088',
    address TEXT DEFAULT 'Jl. Pelabuhan II KM 6 No. 1, Cikembar, Sukabumi',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- STORAGE BUCKETS (Untuk Upload Gambar Profil, Logo, KTP, dan Passport)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('assets', 'assets', true),
    ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ==============================================================================
-- SECURITY POLICIES (Row Level Security - Buka Akses untuk Anon & Authenticated)
-- ==============================================================================
ALTER TABLE public.anaphylactic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anaphylactic_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anaphylactic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy Tabel Data
DROP POLICY IF EXISTS "Allow public all on anaphylactic_items" ON public.anaphylactic_items;
CREATE POLICY "Allow public all on anaphylactic_items" ON public.anaphylactic_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on anaphylactic_meta" ON public.anaphylactic_meta;
CREATE POLICY "Allow public all on anaphylactic_meta" ON public.anaphylactic_meta FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on anaphylactic_history" ON public.anaphylactic_history;
CREATE POLICY "Allow public all on anaphylactic_history" ON public.anaphylactic_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on vaccines" ON public.vaccines;
CREATE POLICY "Allow public all on vaccines" ON public.vaccines FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on bookings" ON public.bookings;
CREATE POLICY "Allow public all on bookings" ON public.bookings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on users" ON public.users;
CREATE POLICY "Allow public all on users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on app_settings" ON public.app_settings;
CREATE POLICY "Allow public all on app_settings" ON public.app_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Policy Storage Objects (Assets & Documents)
DROP POLICY IF EXISTS "Allow public uploads on assets" ON storage.objects;
CREATE POLICY "Allow public uploads on assets" ON storage.objects FOR ALL TO anon, authenticated USING (bucket_id IN ('assets', 'documents')) WITH CHECK (bucket_id IN ('assets', 'documents'));

-- ==============================================================================
-- INITIAL SEED DATA (Vaksin Awal)
-- ==============================================================================
INSERT INTO public.vaccines (id, name, price, stock, description, benefits)
VALUES
  ('v1', 'Meningitis Vaccine (Menveo)', 350000, 120, 'Vaksin wajib untuk jamaah umroh dan haji.', '["Perlindungan dari radang selaput otak", "Sertifikat Internasional (ICV)"]'::jsonb),
  ('v2', 'Polio Vaccine (OPV/IPV)', 150000, 50, 'Vaksin tambahan yang diwajibkan beberapa negara.', '["Mencegah kelumpuhan akibat virus polio", "Aman untuk dewasa"]'::jsonb),
  ('v3', 'Influenza Vaccine (Vaxigrip)', 300000, 200, 'Perlindungan flu tahunan untuk perjalanan wisata atau tugas kerja.', '["Mencegah infeksi virus influenza A dan B", "Mengurangi risiko komplikasi pernapasan"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
`;



