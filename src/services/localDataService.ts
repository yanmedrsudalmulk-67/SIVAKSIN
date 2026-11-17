/**
 * Service Penyimpanan Data Lokal Komputer untuk SIVAKSIN
 * Seluruh data vaksin, pasien, laporan, dokumen, dan pengaturan
 * disimpan langsung di komputer ini (data/sivaksin_db.json dan public/uploads/).
 */

const API_BASE = '';

export interface LocalVaccine {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  benefits: string[];
  category?: 'Wajib' | 'Dianjurkan' | 'Rutin';
  protectionDuration?: string;
}

export interface LocalBooking {
  id: string;
  vaccineId: string;
  vaccineIds?: string[];
  date: string;
  time: string;
  status: 'menunggu' | 'terverifikasi' | 'selesai' | 'ditunda' | 'batal';
  patient: any;
  user_id?: string;
  created_at?: string;
  reg_no?: number;
  simrs_synced?: boolean;
  simrs_no_rawat?: string;
  simrs_no_reg?: string;
  simrs_no_rkm_medis?: string;
  simrs_synced_at?: string;
  simrs_message?: string;
  postponed_at?: string;
  postponed_reason?: string;
  doctor_code?: string;
  doctor_name?: string;
  vaccinator_name?: string;
  vaccinator_nip?: string;
  admin_officer_name?: string;
  admin_officer_nip?: string;
}

export interface LocalUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  nik?: string;
  no_hp?: string;
  alamat?: string;
  no_passport?: string;
  avatar_url?: string;
  ktp_url?: string;
  passport_url?: string;
}

export interface LocalSettings {
  id?: string;
  hospital_name?: string;
  phone?: string;
  address?: string;
  eicv_stock?: number;
  eicv_status?: string;
  eicv_note?: string;
  app_logo?: string | null;
  doc_logo_left?: string | null;
  doc_logo_right?: string | null;
  hero_bg_image?: string | null;
  updated_at?: string;
}

// ==============================================================================
// 1. VAKSIN
// ==============================================================================
export const fetchVaccinesLocal = async (): Promise<LocalVaccine[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/vaccines`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('sivaksin_local_vaccines', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Gagal koneksi API lokal, menggunakan fallback localStorage:', err);
  }
  const cached = localStorage.getItem('sivaksin_local_vaccines');
  return cached ? JSON.parse(cached) : [];
};

export const createVaccineLocal = async (vaccine: LocalVaccine): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/vaccines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vaccine)
    });
    if (res.ok) return { success: true };
    const err = await res.json();
    return { success: false, error: err.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan vaksin lokal' };
  }
};

export const updateVaccineLocal = async (id: string, updates: Partial<LocalVaccine>): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/vaccines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) return { success: true };
    const err = await res.json();
    return { success: false, error: err.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memperbarui vaksin lokal' };
  }
};

export const deleteVaccineLocal = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/vaccines/${id}`, { method: 'DELETE' });
    if (res.ok) return { success: true };
    const err = await res.json();
    return { success: false, error: err.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus vaksin lokal' };
  }
};

// ==============================================================================
// 2. BOOKINGS
// ==============================================================================
export const fetchBookingsLocal = async (): Promise<LocalBooking[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('sivaksin_local_bookings', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Gagal koneksi API lokal bookings:', err);
  }
  const cached = localStorage.getItem('sivaksin_local_bookings');
  return cached ? JSON.parse(cached) : [];
};

export const createBookingLocal = async (booking: LocalBooking): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    if (res.ok) return { success: true };
    const err = await res.json();
    return { success: false, error: err.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan pendaftaran lokal' };
  }
};

export const updateBookingLocal = async (id: string, updates: Partial<LocalBooking>): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) return { success: true };
    const err = await res.json();
    return { success: false, error: err.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memperbarui booking lokal' };
  }
};

export const deleteBookingLocal = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) return { success: true };
    const err = await res.json();
    return { success: false, error: err.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus booking lokal' };
  }
};

// ==============================================================================
// 3. PENGGUNA & AUTENTIKASI
// ==============================================================================
export const fetchUsersLocal = async (): Promise<LocalUser[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/users`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('sivaksin_local_users', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Gagal koneksi API users lokal:', err);
  }
  const cached = localStorage.getItem('sivaksin_local_users');
  return cached ? JSON.parse(cached) : [];
};

export const loginUserLocal = async (credentials: { username: string; password?: string }): Promise<{ success: boolean; user?: LocalUser; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Login gagal' };
  } catch (err: any) {
    // Fallback pencarian di localStorage
    const users = await fetchUsersLocal();
    const uname = credentials.username.trim().toLowerCase();
    const matched = users.find(u => 
      (u.username?.toLowerCase() === uname || u.email?.toLowerCase() === uname) &&
      u.password === credentials.password
    );
    if (matched) return { success: true, user: matched };
    return { success: false, error: err.message || 'Gagal menghubungkan ke server lokal' };
  }
};

export const registerUserLocal = async (userData: LocalUser): Promise<{ success: boolean; user?: LocalUser; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Pendaftaran gagal' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mendaftarkan pengguna ke database lokal' };
  }
};

export const updateUserLocal = async (id: string, updates: Partial<LocalUser>): Promise<{ success: boolean; user?: LocalUser; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Gagal mengubah profil' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memperbarui profil lokal' };
  }
};

// ==============================================================================
// 4. PENGATURAN APLIKASI
// ==============================================================================
export const fetchSettingsLocal = async (): Promise<LocalSettings> => {
  try {
    const res = await fetch(`${API_BASE}/api/settings`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('sivaksin_local_settings', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Gagal koneksi API settings lokal:', err);
  }
  const cached = localStorage.getItem('sivaksin_local_settings');
  return cached ? JSON.parse(cached) : {};
};

export const saveSettingsLocal = async (settings: Partial<LocalSettings>): Promise<{ success: boolean; settings?: LocalSettings; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('sivaksin_local_settings', JSON.stringify(data.settings));
      return { success: true, settings: data.settings };
    }
    return { success: false, error: data.error || 'Gagal menyimpan pengaturan' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan pengaturan lokal' };
  }
};

// ==============================================================================
// 5. KIT ANAFILAKTIK
// ==============================================================================
export const fetchAnaphylacticLocal = async (): Promise<{ items: any[]; meta: any; history: any[] }> => {
  try {
    const res = await fetch(`${API_BASE}/api/anaphylactic`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Gagal koneksi API kit anafilaktik lokal:', err);
  }
  return { items: [], meta: {}, history: [] };
};

export const syncAnaphylacticLocal = async (payload: { items?: any[]; meta?: any; history?: any[] }): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/anaphylactic/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return { success: true };
    const data = await res.json();
    return { success: false, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyinkronkan kit anafilaktik' };
  }
};

// ==============================================================================
// 6. UPLOAD FILE KE PENYIMPANAN KOMPUTER
// ==============================================================================
export const uploadFileLocal = async (
  file: File | Blob,
  prefix = 'doc'
): Promise<{ url: string | null; fileName: string | null; error: string | null }> => {
  try {
    // Ubah File atau Blob menjadi Base64 string
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });

    const fileName = file instanceof File ? file.name : `${prefix}.jpg`;

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileData: dataUrl,
        fileName,
        prefix
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        url: data.url,
        fileName: data.fileName,
        error: null
      };
    }

    // Jika API server tidak merespon (misal dev offline), gunakan dataUrl langsung sebagai fallback
    return {
      url: dataUrl,
      fileName,
      error: null
    };
  } catch (err: any) {
    console.warn('Upload fallback ke data URL lokal:', err);
    // Graceful fallback ke Data URL
    try {
      const reader = new FileReader();
      const fallbackUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      return {
        url: fallbackUrl,
        fileName: file instanceof File ? file.name : `${prefix}.jpg`,
        error: null
      };
    } catch (e: any) {
      return { url: null, fileName: null, error: e.message || 'Gagal mengunggah file' };
    }
  }
};

// ==============================================================================
// 6. DAILY USAGE REPORTS & STOCK MUTATIONS (LAPORAN HARIAN & KONTROL STOK)
// ==============================================================================
export interface DailyUsageReport {
  id: string;
  date: string;
  updated_at: string;
  clinic: string;
  vaccine_id: string;
  vaccine_name: string;
  icv_issued: number;
  vaccine_used: number;
  icv_remaining: number;
  vaccine_remaining: number;
  notes?: string;
}

export interface StockMutation {
  id: string;
  date: string;
  type: 'masuk' | 'keluar' | 'penyesuaian';
  vaccine_id: string;
  vaccine_name: string;
  initial_stock?: number;
  batch_no?: string;
  exp_date?: string;
  qty: number;
  final_stock?: number;
  source_or_purpose?: string;
  notes?: string;
  officer?: string;
  created_at: string;
}

export const fetchDailyReportsLocal = async (params?: { from?: string; to?: string; vaccine?: string }): Promise<DailyUsageReport[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    if (params?.vaccine) query.set('vaccine', params.vaccine);

    const res = await fetch(`${API_BASE}/api/daily-reports?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('sivaksin_daily_reports', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Gagal koneksi API daily reports:', err);
  }
  const cached = localStorage.getItem('sivaksin_daily_reports');
  return cached ? JSON.parse(cached) : [];
};

export const saveDailyReportLocal = async (report: Partial<DailyUsageReport>): Promise<{ success: boolean; report?: DailyUsageReport; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/daily-reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, report: data.report };
    }
    const err = await res.json();
    return { success: false, error: err.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan laporan harian' };
  }
};

export const fetchStockMutationsLocal = async (params?: { from?: string; to?: string; type?: string }): Promise<StockMutation[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    if (params?.type) query.set('type', params.type);

    const res = await fetch(`${API_BASE}/api/stock-mutations?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('sivaksin_stock_mutations', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Gagal koneksi API stock mutations:', err);
  }
  const cached = localStorage.getItem('sivaksin_stock_mutations');
  return cached ? JSON.parse(cached) : [];
};

export const addStockMutationLocal = async (mutation: {
  vaccine_id: string;
  vaccine_name?: string;
  type: 'masuk' | 'keluar' | 'penyesuaian';
  initial_stock?: number;
  qty: number;
  final_stock?: number;
  date?: string;
  batch_no?: string;
  exp_date?: string;
  source_or_purpose?: string;
  notes?: string;
  officer?: string;
  icv_qty?: number;
}): Promise<{ success: boolean; mutation?: StockMutation; updated_stock?: number; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/stock-mutations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mutation)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, mutation: data.mutation, updated_stock: data.updated_stock };
    }
    const err = await res.json();
    return { success: false, error: err.error };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mencatat mutasi stok' };
  }
};

export const triggerApiikSyncLocal = async (fullSync: boolean = false): Promise<{ ok: boolean; result?: any; lastSyncTime?: string; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/api/apiik/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullSync })
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, error: err.message || 'Gagal sinkronisasi APIIK' };
  }
};

export const getApiikSyncStatusLocal = async (): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}/api/apiik/status`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Gagal cek status sync APIIK:', err);
  }
  return null;
};

// ==============================================================================
// 7. INTEGRASI SIMRS KHANZA RSUD AL-MULK
// ==============================================================================
export const syncBookingToSimrsLocal = async (
  bookingId: string, 
  reregister: boolean = false,
  doctorCode?: string
): Promise<{
  success: boolean;
  already_registered?: boolean;
  no_rkm_medis?: string;
  no_rawat?: string;
  no_reg?: string;
  tgl_registrasi?: string;
  nm_pasien?: string;
  nm_poli?: string;
  kd_dokter?: string;
  nm_dokter?: string;
  message?: string;
  error?: string;
}> => {
  try {
    const res = await fetch(`${API_BASE}/api/simrs/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, reregister, doctorCode })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengirim data pendaftaran ke SIMRS' };
  }
};

export const postponeBookingLocal = async (bookingId: string, reason?: string): Promise<{
  success: boolean;
  message?: string;
  booking?: LocalBooking;
  error?: string;
}> => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings/${encodeURIComponent(bookingId)}/postpone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menunda vaksinasi' };
  }
};

export const syncAllBookingsToSimrsLocal = async (): Promise<{
  success: boolean;
  total?: number;
  successCount?: number;
  failedCount?: number;
  error?: string;
}> => {
  try {
    const res = await fetch(`${API_BASE}/api/simrs/sync-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal sinkronisasi massal ke SIMRS' };
  }
};

export const getSimrsStatusLocal = async (): Promise<{
  success: boolean;
  connected?: boolean;
  host?: string;
  database?: string;
  poli?: string;
  dokter?: string;
  error?: string;
}> => {
  try {
    const res = await fetch(`${API_BASE}/api/simrs/status`);
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
