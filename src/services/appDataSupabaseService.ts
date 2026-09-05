import { supabase, isSupabaseConfigured, formatSupabaseErrorMessage } from '../lib/supabase';

export interface VaccineData {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  benefits: string[];
}

export interface BookingData {
  id: string;
  vaccineId: string;
  date: string;
  time: string;
  status: 'menunggu' | 'terverifikasi' | 'selesai';
  patient: any;
  user_id?: string;
  created_at?: string;
}

export interface UserProfileData {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role?: string;
  nik?: string;
  no_hp?: string;
  alamat?: string;
  no_passport?: string;
  avatar_url?: string;
  ktp_url?: string;
  passport_url?: string;
}

export interface AppSettingsData {
  id?: string;
  app_logo?: string;
  hospital_name?: string;
  phone?: string;
  address?: string;
  updated_at?: string;
}

const DEFAULT_VACCINES: VaccineData[] = [
  {
    id: 'v1',
    name: 'Meningitis Vaccine (Menveo)',
    price: 350000,
    stock: 120,
    description: 'Vaksin wajib untuk jamaah umroh dan haji.',
    benefits: ['Perlindungan dari radang selaput otak', 'Sertifikat Internasional (ICV)']
  },
  {
    id: 'v2',
    name: 'Polio Vaccine (OPV/IPV)',
    price: 150000,
    stock: 50,
    description: 'Vaksin tambahan yang diwajibkan beberapa negara.',
    benefits: ['Mencegah kelumpuhan akibat virus polio', 'Aman untuk dewasa']
  },
  {
    id: 'v3',
    name: 'Influenza Vaccine (Vaxigrip)',
    price: 300000,
    stock: 200,
    description: 'Perlindungan flu tahunan untuk perjalanan wisata atau tugas kerja.',
    benefits: ['Mencegah infeksi virus influenza A dan B', 'Mengurangi risiko komplikasi pernapasan']
  }
];

// ==========================================
// 1. VAKSIN SERVICES
// ==========================================
export const fetchVaccinesFromSupabase = async (): Promise<{
  vaccines: VaccineData[] | null;
  error: string | null;
}> => {
  if (!isSupabaseConfigured) return { vaccines: null, error: 'Supabase tidak aktif' };

  try {
    const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout mengambil data vaksin')), 6000)
    );

    const query = supabase.from('vaccines').select('*').order('id', { ascending: true });
    const { data, error } = (await Promise.race([query, timeoutPromise])) as any;

    if (error) {
      return { vaccines: null, error: formatSupabaseErrorMessage(error) };
    }

    // Jika tabel ada tapi kosong, bantu inisialisasi / seed data default ke Supabase
    if (!data || data.length === 0) {
      try {
        await supabase.from('vaccines').upsert(DEFAULT_VACCINES);
        return { vaccines: DEFAULT_VACCINES, error: null };
      } catch (seedErr) {
        console.warn('Seed vaccines note:', seedErr);
      }
    }

    return { vaccines: data as VaccineData[], error: null };
  } catch (err: any) {
    return { vaccines: null, error: formatSupabaseErrorMessage(err) };
  }
};

export const updateVaccineStockInSupabase = async (
  id: string,
  newStock: number
): Promise<{ success: boolean; error: string | null }> => {
  if (!isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.from('vaccines').update({ stock: newStock }).eq('id', id);
    if (error) {
      return { success: false, error: formatSupabaseErrorMessage(error) };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: formatSupabaseErrorMessage(err) };
  }
};

export const createVaccineInSupabase = async (
  vaccine: VaccineData
): Promise<{ success: boolean; error: string | null }> => {
  if (!isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.from('vaccines').insert([vaccine]);
    if (error) {
      return { success: false, error: formatSupabaseErrorMessage(error) };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: formatSupabaseErrorMessage(err) };
  }
};

export const updateVaccineInSupabase = async (
  id: string,
  updates: Partial<VaccineData>
): Promise<{ success: boolean; error: string | null }> => {
  if (!isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.from('vaccines').update(updates).eq('id', id);
    if (error) {
      return { success: false, error: formatSupabaseErrorMessage(error) };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: formatSupabaseErrorMessage(err) };
  }
};

export const deleteVaccineFromSupabase = async (
  id: string
): Promise<{ success: boolean; error: string | null }> => {
  if (!isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.from('vaccines').delete().eq('id', id);
    if (error) {
      return { success: false, error: formatSupabaseErrorMessage(error) };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: formatSupabaseErrorMessage(err) };
  }
};

// ==========================================
// 2. BOOKINGS / RESERVASI SERVICES
// ==========================================
export const fetchBookingsFromSupabase = async (
  userId?: string,
  role?: string
): Promise<{ bookings: BookingData[] | null; error: string | null }> => {
  if (!isSupabaseConfigured) return { bookings: null, error: 'Supabase tidak aktif' };

  try {
    const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout mengambil data reservasi')), 6000)
    );

    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

    // Jika bukan admin dan ada userId, filter berdasarkan user_id
    if (role !== 'admin' && userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = (await Promise.race([query, timeoutPromise])) as any;

    if (error) {
      return { bookings: null, error: formatSupabaseErrorMessage(error) };
    }

    return { bookings: data as BookingData[], error: null };
  } catch (err: any) {
    return { bookings: null, error: formatSupabaseErrorMessage(err) };
  }
};

export const createBookingInSupabase = async (
  booking: BookingData
): Promise<{ booking: BookingData | null; error: string | null }> => {
  if (!isSupabaseConfigured) return { booking, error: null };

  try {
    const payload = {
      id: booking.id,
      user_id: booking.user_id || null,
      vaccineId: booking.vaccineId,
      date: booking.date,
      time: booking.time,
      status: booking.status || 'menunggu',
      patient: booking.patient,
      created_at: new Date().toISOString()
    };

    const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout menyimpan reservasi')), 8000)
    );

    const insertPromise = supabase.from('bookings').insert([payload]).select().single();
    const { data, error } = (await Promise.race([insertPromise, timeoutPromise])) as any;

    if (error) {
      return { booking: null, error: formatSupabaseErrorMessage(error) };
    }

    return { booking: data as BookingData, error: null };
  } catch (err: any) {
    return { booking: null, error: formatSupabaseErrorMessage(err) };
  }
};

export const updateBookingStatusInSupabase = async (
  id: string,
  status: 'menunggu' | 'terverifikasi' | 'selesai'
): Promise<{ success: boolean; error: string | null }> => {
  if (!isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      return { success: false, error: formatSupabaseErrorMessage(error) };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: formatSupabaseErrorMessage(err) };
  }
};

export const deleteBookingInSupabase = async (
  id: string
): Promise<{ success: boolean; error: string | null }> => {
  if (!isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      return { success: false, error: formatSupabaseErrorMessage(error) };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: formatSupabaseErrorMessage(err) };
  }
};

// ==========================================
// 3. USER PROFILE SERVICES
// ==========================================
export const fetchUserProfileFromSupabase = async (
  userId: string
): Promise<{ profile: UserProfileData | null; error: string | null }> => {
  if (!isSupabaseConfigured) return { profile: null, error: 'Supabase tidak aktif' };

  try {
    const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout mengambil profil')), 6000)
    );

    let query = supabase.from('users').select('*').eq('id', userId).maybeSingle();
    let { data, error } = (await Promise.race([query, timeoutPromise])) as any;

    // Jika tidak ditemukan dengan ID dan bukan UUID, coba cari via username atau email
    if (!data && !error && userId) {
      const fallbackQuery = supabase
        .from('users')
        .select('*')
        .or(`username.eq.${userId},email.eq.${userId}`)
        .maybeSingle();
      const fallbackRes = (await Promise.race([fallbackQuery, timeoutPromise])) as any;
      if (fallbackRes.data) {
        data = fallbackRes.data;
        error = null;
      }
    }

    if (error) {
      return { profile: null, error: formatSupabaseErrorMessage(error) };
    }

    return { profile: data as UserProfileData, error: null };
  } catch (err: any) {
    return { profile: null, error: formatSupabaseErrorMessage(err) };
  }
};

export const upsertUserProfileToSupabase = async (
  userData: Partial<UserProfileData> & { id: string }
): Promise<{ success: boolean; error: string | null }> => {
  if (!isSupabaseConfigured) return { success: true, error: null };

  try {
    const rawUsername = userData.username || userData.name || (userData.email ? userData.email.split('@')[0] : '') || userData.id;

    const basePayload: any = {
      id: userData.id,
      username: rawUsername,
      name: userData.name || userData.username || 'Pengguna',
      email: userData.email || '',
      role: userData.role || 'user',
      nik: userData.nik ?? null,
      no_hp: userData.no_hp ?? null,
      alamat: userData.alamat ?? null,
      no_passport: userData.no_passport ?? null,
      avatar_url: userData.avatar_url ?? null,
      ktp_url: userData.ktp_url ?? null,
      passport_url: userData.passport_url ?? null,
    };

    const timeoutPromise = new Promise<{ error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout menyimpan profil ke Supabase')), 8000)
    );

    // 1. Attempt standard upsert
    let { error } = (await Promise.race([
      supabase.from('users').upsert(basePayload, { onConflict: 'id' }),
      timeoutPromise
    ])) as any;

    // 2. Fallback to direct update or insert if upsert fails
    if (error) {
      console.warn('Upsert profil attempt 1 warning, attempting direct update/insert:', error.message);
      const updateRes = (await Promise.race([
        supabase.from('users').update(basePayload).eq('id', userData.id),
        timeoutPromise
      ])) as any;

      if (!updateRes?.error) {
        error = null;
      } else {
        const insertRes = (await Promise.race([
          supabase.from('users').insert([basePayload]),
          timeoutPromise
        ])) as any;
        if (!insertRes?.error) {
          error = null;
        } else {
          error = insertRes.error;
        }
      }
    }

    if (error) {
      return { success: false, error: formatSupabaseErrorMessage(error) };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: formatSupabaseErrorMessage(err) };
  }
};

// ==========================================
// 4. APP SETTINGS & LOGO SERVICES
// ==========================================
export const fetchAppSettingsFromSupabase = async (): Promise<{
  settings: AppSettingsData | null;
  error: string | null;
}> => {
  if (!isSupabaseConfigured) return { settings: null, error: 'Supabase tidak aktif' };

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 'main_config')
      .maybeSingle();

    if (error) return { settings: null, error: formatSupabaseErrorMessage(error) };
    return { settings: data as AppSettingsData, error: null };
  } catch (err: any) {
    return { settings: null, error: formatSupabaseErrorMessage(err) };
  }
};

export const saveAppSettingsToSupabase = async (
  settings: Partial<AppSettingsData>
): Promise<{ success: boolean; error: string | null }> => {
  if (!isSupabaseConfigured) return { success: true, error: null };

  try {
    const payload = {
      id: 'main_config',
      ...settings,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('app_settings').upsert(payload, { onConflict: 'id' });
    if (error) return { success: false, error: formatSupabaseErrorMessage(error) };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: formatSupabaseErrorMessage(err) };
  }
};
