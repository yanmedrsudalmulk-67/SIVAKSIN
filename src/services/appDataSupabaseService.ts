/**
 * Service Data SIVAKSIN
 * Dialihkan 100% ke penyimpanan lokal komputer (data/sivaksin_db.json).
 * Tidak lagi menggunakan Supabase cloud.
 */

import {
  fetchVaccinesLocal,
  createVaccineLocal,
  updateVaccineLocal,
  deleteVaccineLocal,
  fetchBookingsLocal,
  createBookingLocal,
  updateBookingLocal,
  deleteBookingLocal,
  fetchUsersLocal,
  updateUserLocal,
  fetchSettingsLocal,
  saveSettingsLocal,
  fetchDailyReportsLocal,
  saveDailyReportLocal,
  fetchStockMutationsLocal,
  addStockMutationLocal,
  syncBookingToSimrsLocal,
  syncAllBookingsToSimrsLocal,
  getSimrsStatusLocal,
  type DailyUsageReport,
  type StockMutation,
  type LocalVaccine,
  type LocalBooking,
  type LocalUser,
  type LocalSettings
} from './localDataService';

export interface VaccineData extends LocalVaccine {}
export interface BookingData extends LocalBooking {}
export interface UserProfileData extends LocalUser {}
export interface AppSettingsData extends LocalSettings {}
export type { DailyUsageReport, StockMutation };

// ==========================================
// 1. VAKSIN SERVICES
// ==========================================
export const fetchVaccinesFromSupabase = async (): Promise<{
  vaccines: VaccineData[] | null;
  error: string | null;
}> => {
  try {
    const list = await fetchVaccinesLocal();
    return { vaccines: list, error: null };
  } catch (err: any) {
    return { vaccines: null, error: err.message || 'Gagal memuat vaksin lokal' };
  }
};

export const updateVaccineStockInSupabase = async (
  id: string,
  newStock: number
): Promise<{ success: boolean; error: string | null }> => {
  const res = await updateVaccineLocal(id, { stock: newStock });
  return { success: res.success, error: res.error || null };
};

export const createVaccineInSupabase = async (
  vaccine: VaccineData
): Promise<{ success: boolean; error: string | null }> => {
  const res = await createVaccineLocal(vaccine);
  return { success: res.success, error: res.error || null };
};

export const updateVaccineInSupabase = async (
  id: string,
  updates: Partial<VaccineData>
): Promise<{ success: boolean; error: string | null }> => {
  const res = await updateVaccineLocal(id, updates);
  return { success: res.success, error: res.error || null };
};

export const deleteVaccineFromSupabase = async (
  id: string
): Promise<{ success: boolean; error: string | null }> => {
  const res = await deleteVaccineLocal(id);
  return { success: res.success, error: res.error || null };
};

// ==========================================
// 2. BOOKING / PENDAFTARAN SERVICES
// ==========================================
export const fetchBookingsFromSupabase = async (
  _userId?: string,
  _role?: string
): Promise<{
  bookings: BookingData[] | null;
  error: string | null;
}> => {
  try {
    const list = await fetchBookingsLocal();
    return { bookings: list, error: null };
  } catch (err: any) {
    return { bookings: null, error: err.message || 'Gagal memuat booking lokal' };
  }
};

export const createBookingInSupabase = async (
  booking: BookingData
): Promise<{ success: boolean; booking?: BookingData; error: string | null }> => {
  const res = await createBookingLocal(booking);
  return { success: res.success, booking, error: res.error || null };
};

// ==========================================
// 3. DAILY REPORTS & STOCK MUTATIONS
// ==========================================
export const fetchDailyReportsFromSupabase = async (params?: { from?: string; to?: string; vaccine?: string }): Promise<DailyUsageReport[]> => {
  return await fetchDailyReportsLocal(params);
};

export const saveDailyReportToSupabase = async (report: Partial<DailyUsageReport>): Promise<{ success: boolean; report?: DailyUsageReport; error?: string }> => {
  return await saveDailyReportLocal(report);
};

export const fetchStockMutationsFromSupabase = async (params?: { from?: string; to?: string; type?: string }): Promise<StockMutation[]> => {
  return await fetchStockMutationsLocal(params);
};

export const addStockMutationToSupabase = async (mutation: any): Promise<{ success: boolean; mutation?: StockMutation; updated_stock?: number; error?: string }> => {
  return await addStockMutationLocal(mutation);
};

export const updateBookingStatusInSupabase = async (
  id: string,
  status: BookingData['status']
): Promise<{ success: boolean; error: string | null }> => {
  const res = await updateBookingLocal(id, { status });
  return { success: res.success, error: res.error || null };
};

export const updateBookingInSupabase = async (
  id: string,
  updates: Partial<BookingData>
): Promise<{ success: boolean; error: string | null }> => {
  const res = await updateBookingLocal(id, updates);
  return { success: res.success, error: res.error || null };
};

export const deleteBookingInSupabase = async (
  id: string
): Promise<{ success: boolean; error: string | null }> => {
  const res = await deleteBookingLocal(id);
  return { success: res.success, error: res.error || null };
};

// ==========================================
// 3. PROFIL & USER SERVICES
// ==========================================
export const fetchUserProfileFromSupabase = async (
  userId: string
): Promise<{ profile: UserProfileData | null; error: string | null }> => {
  try {
    const users = await fetchUsersLocal();
    const found = users.find(u => u.id === userId || u.username === userId || u.email === userId);
    return { profile: found || null, error: null };
  } catch (err: any) {
    return { profile: null, error: err.message || 'Gagal memuat profil user lokal' };
  }
};

export const upsertUserProfileToSupabase = async (
  userData: Partial<UserProfileData> & { id: string }
): Promise<{ success: boolean; error: string | null }> => {
  const res = await updateUserLocal(userData.id, userData);
  return { success: res.success, error: res.error || null };
};

// ==========================================
// 4. APP SETTINGS & LOGO SERVICES
// ==========================================
export const fetchAppSettingsFromSupabase = async (): Promise<{
  settings: AppSettingsData | null;
  error: string | null;
}> => {
  try {
    const settings = await fetchSettingsLocal();
    return { settings, error: null };
  } catch (err: any) {
    return { settings: null, error: err.message || 'Gagal memuat pengaturan lokal' };
  }
};

export const saveAppSettingsToSupabase = async (
  settings: Partial<AppSettingsData>
): Promise<{ success: boolean; error: string | null }> => {
  const res = await saveSettingsLocal(settings);
  return { success: res.success, error: res.error || null };
};

export { 
  triggerApiikSyncLocal, 
  getApiikSyncStatusLocal,
  syncBookingToSimrsLocal,
  syncAllBookingsToSimrsLocal,
  getSimrsStatusLocal,
  postponeBookingLocal
} from './localDataService';
