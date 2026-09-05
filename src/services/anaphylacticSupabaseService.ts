import { supabase, isSupabaseConfigured, formatSupabaseErrorMessage } from '../lib/supabase';
import { AnaphylacticItem, AnaphylacticFormMeta } from '../data/anaphylacticData';

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  isOfflineOrPaused?: boolean;
  error?: any;
}

/**
 * Memuat seluruh data item dan meta formulir dari Supabase jika terhubung.
 * Dilengkapi proteksi timeout agar tidak menggantung jika server Supabase paused atau offline.
 */
export const fetchAnaphylacticFromSupabase = async (): Promise<{
  items: AnaphylacticItem[] | null;
  meta: AnaphylacticFormMeta | null;
  error?: string;
  isOfflineOrPaused?: boolean;
}> => {
  if (!isSupabaseConfigured) {
    return { items: null, meta: null };
  }

  try {
    // 1. Fetch Items dengan timeout race 5 detik
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Failed to fetch (timeout)')), 5000)
    );

    const queryPromise = supabase
      .from('anaphylactic_items')
      .select('*')
      .order('no', { ascending: true });

    const { data: itemsData, error: itemsError } = await (Promise.race([queryPromise, timeoutPromise]) as any);

    if (itemsError) {
      const isFetchErr = 
        itemsError.message?.includes('Failed to fetch') || 
        itemsError.message?.includes('timeout') || 
        itemsError.message?.includes('NetworkError');

      // Catat dengan halus tanpa warning merah jika hanya masalah koneksi/paused
      return { 
        items: null, 
        meta: null, 
        error: formatSupabaseErrorMessage(itemsError),
        isOfflineOrPaused: isFetchErr 
      };
    }

    // 2. Fetch Form Meta
    const metaPromise = supabase
      .from('anaphylactic_meta')
      .select('*')
      .eq('id', 'current_report')
      .maybeSingle();

    const { data: metaData } = await (Promise.race([metaPromise, timeoutPromise]) as any);

    let parsedItems: AnaphylacticItem[] | null = null;
    if (itemsData && itemsData.length > 0) {
      parsedItems = itemsData.map((row: any) => ({
        no: Number(row.no),
        nama: String(row.nama || ''),
        spesifikasi: String(row.spesifikasi || ''),
        stokAwal: Number(row.stokAwal || 1),
        stokSisa: Number(row.stokSisa !== undefined ? row.stokSisa : row.stokAwal || 1),
        noBatch: String(row.noBatch || '-'),
        expDate: String(row.expDate || '-'),
        kondisi: (row.kondisi === 'Tidak' ? 'Tidak' : 'Baik') as 'Baik' | 'Tidak',
        kategori: row.kategori || 'Alat'
      }));
    }

    let parsedMeta: AnaphylacticFormMeta | null = null;
    if (metaData) {
      parsedMeta = {
        unitRuangan: metaData.unitRuangan || '',
        lokasiKit: metaData.lokasiKit || '',
        periodeBulan: metaData.periodeBulan || '',
        tanggalPemeriksaan: metaData.tanggalPemeriksaan || '',
        namaPetugas: metaData.namaPetugas || '',
        catatanPetugas: metaData.catatanPetugas || ''
      };
    }

    return { items: parsedItems, meta: parsedMeta };
  } catch (err: any) {
    const isFetchErr = 
      err?.message?.includes('Failed to fetch') || 
      err?.message?.includes('timeout') || 
      err?.message?.includes('NetworkError');

    return { 
      items: null, 
      meta: null, 
      error: formatSupabaseErrorMessage(err),
      isOfflineOrPaused: isFetchErr
    };
  }
};

/**
 * Menyimpan atau memperbarui satu item di Supabase
 */
export const upsertItemToSupabase = async (item: AnaphylacticItem): Promise<SupabaseSyncResult> => {
  if (!isSupabaseConfigured) {
    return { success: true, message: 'Tersimpan di memori lokal' };
  }

  try {
    const payload = {
      no: item.no,
      nama: item.nama,
      spesifikasi: item.spesifikasi,
      stokAwal: item.stokAwal,
      stokSisa: item.stokSisa,
      noBatch: item.noBatch,
      expDate: item.expDate,
      kondisi: item.kondisi,
      kategori: item.kategori || 'Alat',
      updated_at: new Date().toISOString()
    };

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Failed to fetch (timeout)')), 5000)
    );

    const upsertPromise = supabase
      .from('anaphylactic_items')
      .upsert(payload, { onConflict: 'no' });

    const { error } = await (Promise.race([upsertPromise, timeoutPromise]) as any);

    if (error) {
      const isFetchErr = 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('timeout') || 
        error.message?.includes('NetworkError');

      return { 
        success: false, 
        message: formatSupabaseErrorMessage(error), 
        isOfflineOrPaused: isFetchErr,
        error 
      };
    }

    return { success: true, message: 'Item berhasil disinkronkan ke Supabase' };
  } catch (err: any) {
    const isFetchErr = 
      err?.message?.includes('Failed to fetch') || 
      err?.message?.includes('timeout') || 
      err?.message?.includes('NetworkError');

    return { 
      success: false, 
      message: formatSupabaseErrorMessage(err), 
      isOfflineOrPaused: isFetchErr,
      error: err 
    };
  }
};

/**
 * Menghapus satu item dari Supabase berdasarkan nomor urut (no)
 */
export const deleteItemFromSupabase = async (no: number): Promise<SupabaseSyncResult> => {
  if (!isSupabaseConfigured) {
    return { success: true, message: 'Dihapus dari memori lokal' };
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Failed to fetch (timeout)')), 5000)
    );

    const deletePromise = supabase
      .from('anaphylactic_items')
      .delete()
      .eq('no', no);

    const { error } = await (Promise.race([deletePromise, timeoutPromise]) as any);

    if (error) {
      const isFetchErr = 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('timeout') || 
        error.message?.includes('NetworkError');

      return { 
        success: false, 
        message: formatSupabaseErrorMessage(error), 
        isOfflineOrPaused: isFetchErr,
        error 
      };
    }

    return { success: true, message: 'Item berhasil dihapus dari Supabase' };
  } catch (err: any) {
    const isFetchErr = 
      err?.message?.includes('Failed to fetch') || 
      err?.message?.includes('timeout') || 
      err?.message?.includes('NetworkError');

    return { 
      success: false, 
      message: formatSupabaseErrorMessage(err), 
      isOfflineOrPaused: isFetchErr,
      error: err 
    };
  }
};

/**
 * Mengosongkan / Menghapus seluruh item dari tabel Anafilaktik Kit di Supabase
 */
export const clearAllItemsFromSupabase = async (): Promise<SupabaseSyncResult> => {
  if (!isSupabaseConfigured) {
    return { success: true, message: 'Seluruh data lokal dibersihkan' };
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Failed to fetch (timeout)')), 5000)
    );

    const deletePromise = supabase
      .from('anaphylactic_items')
      .delete()
      .gte('no', 0);

    const { error } = await (Promise.race([deletePromise, timeoutPromise]) as any);

    if (error) {
      const isFetchErr = 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('timeout') || 
        error.message?.includes('NetworkError');

      return { 
        success: false, 
        message: formatSupabaseErrorMessage(error), 
        isOfflineOrPaused: isFetchErr,
        error 
      };
    }

    return { success: true, message: 'Seluruh data di tabel Supabase berhasil dikosongkan' };
  } catch (err: any) {
    const isFetchErr = 
      err?.message?.includes('Failed to fetch') || 
      err?.message?.includes('timeout') || 
      err?.message?.includes('NetworkError');

    return { 
      success: false, 
      message: formatSupabaseErrorMessage(err), 
      isOfflineOrPaused: isFetchErr,
      error: err 
    };
  }
};

/**
 * Melakukan bulk synchronization (push) seluruh items dan metadata ke Supabase
 */
export const syncAllToSupabase = async (
  items: AnaphylacticItem[],
  meta: AnaphylacticFormMeta
): Promise<SupabaseSyncResult> => {
  if (!isSupabaseConfigured) {
    return { 
      success: false, 
      message: 'Supabase belum dikonfigurasi. Hubungkan kredensial terlebih dahulu.' 
    };
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Failed to fetch (timeout)')), 7000)
    );

    // 1. Clear existing and rewrite or upsert all
    const rows = items.map(i => ({
      no: i.no,
      nama: i.nama,
      spesifikasi: i.spesifikasi,
      stokAwal: i.stokAwal,
      stokSisa: i.stokSisa,
      noBatch: i.noBatch,
      expDate: i.expDate,
      kondisi: i.kondisi,
      kategori: i.kategori || 'Alat',
      updated_at: new Date().toISOString()
    }));

    if (rows.length > 0) {
      const upsertPromise = supabase
        .from('anaphylactic_items')
        .upsert(rows, { onConflict: 'no' });

      const { error: itemsErr } = await (Promise.race([upsertPromise, timeoutPromise]) as any);

      if (itemsErr) {
        const isFetchErr = 
          itemsErr.message?.includes('Failed to fetch') || 
          itemsErr.message?.includes('timeout') || 
          itemsErr.message?.includes('NetworkError');

        return { 
          success: false, 
          message: formatSupabaseErrorMessage(itemsErr),
          isOfflineOrPaused: isFetchErr 
        };
      }
    }

    // 2. Save Meta
    const metaPayload = {
      id: 'current_report',
      unitRuangan: meta.unitRuangan,
      lokasiKit: meta.lokasiKit,
      periodeBulan: meta.periodeBulan,
      tanggalPemeriksaan: meta.tanggalPemeriksaan,
      namaPetugas: meta.namaPetugas,
      catatanPetugas: meta.catatanPetugas || '',
      updated_at: new Date().toISOString()
    };

    const metaPromise = supabase
      .from('anaphylactic_meta')
      .upsert(metaPayload, { onConflict: 'id' });

    const { error: metaErr } = await (Promise.race([metaPromise, timeoutPromise]) as any);

    if (metaErr) {
      const isFetchErr = 
        metaErr.message?.includes('Failed to fetch') || 
        metaErr.message?.includes('timeout') || 
        metaErr.message?.includes('NetworkError');

      return { 
        success: false, 
        message: formatSupabaseErrorMessage(metaErr),
        isOfflineOrPaused: isFetchErr 
      };
    }

    return { 
      success: true, 
      message: `Berhasil menyinkronkan ${items.length} item obat/alat dan metadata ke Supabase!` 
    };
  } catch (err: any) {
    const isFetchErr = 
      err?.message?.includes('Failed to fetch') || 
      err?.message?.includes('timeout') || 
      err?.message?.includes('NetworkError');

    return { 
      success: false, 
      message: formatSupabaseErrorMessage(err),
      isOfflineOrPaused: isFetchErr 
    };
  }
};

/**
 * Memuat seluruh data riwayat pemeriksaan dari tabel anaphylactic_history di Supabase
 */
export const fetchAnaphylacticHistoryFromSupabase = async (): Promise<{
  history: any[] | null;
  error?: string;
  isOfflineOrPaused?: boolean;
}> => {
  if (!isSupabaseConfigured) return { history: null };

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Failed to fetch (timeout)')), 6000)
    );

    const query = supabase
      .from('anaphylactic_history')
      .select('*')
      .order('tanggalPemeriksaan', { ascending: false });

    const { data, error } = (await Promise.race([query, timeoutPromise])) as any;

    if (error) {
      const isFetchErr =
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('timeout') ||
        error.message?.includes('NetworkError');

      return {
        history: null,
        error: formatSupabaseErrorMessage(error),
        isOfflineOrPaused: isFetchErr
      };
    }

    return { history: data || [], error: undefined };
  } catch (err: any) {
    const isFetchErr =
      err?.message?.includes('Failed to fetch') ||
      err?.message?.includes('timeout') ||
      err?.message?.includes('NetworkError');

    return {
      history: null,
      error: formatSupabaseErrorMessage(err),
      isOfflineOrPaused: isFetchErr
    };
  }
};

/**
 * Menyimpan / memperbarui snapshot riwayat monitoring ke Supabase
 */
export const saveAnaphylacticHistoryToSupabase = async (
  record: any
): Promise<SupabaseSyncResult> => {
  if (!isSupabaseConfigured) {
    return { success: true, message: 'Tersimpan di lokal (Supabase belum diatur)' };
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Failed to fetch (timeout)')), 6000)
    );

    const payload = {
      id: record.id,
      tanggalPemeriksaan: record.tanggalPemeriksaan,
      periodeBulan: record.periodeBulan || '',
      unitRuangan: record.unitRuangan || '',
      lokasiKit: record.lokasiKit || '',
      namaPetugas: record.namaPetugas || '',
      catatanPetugas: record.catatanPetugas || '',
      totalItem: record.totalItem || 0,
      itemsLengkap: record.itemsLengkap || 0,
      itemsKurang: record.itemsKurang || 0,
      itemsRusak: record.itemsRusak || 0,
      persentaseKesiapan: record.persentaseKesiapan || 0,
      items: record.items || [],
      createdAt: record.createdAt || new Date().toISOString()
    };

    const upsertPromise = supabase
      .from('anaphylactic_history')
      .upsert(payload, { onConflict: 'id' });

    const { error } = (await Promise.race([upsertPromise, timeoutPromise])) as any;

    if (error) {
      const isFetchErr =
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('timeout') ||
        error.message?.includes('NetworkError');

      return {
        success: false,
        message: formatSupabaseErrorMessage(error),
        isOfflineOrPaused: isFetchErr
      };
    }

    return { success: true, message: 'Riwayat monitoring berhasil disimpan ke Supabase!' };
  } catch (err: any) {
    const isFetchErr =
      err?.message?.includes('Failed to fetch') ||
      err?.message?.includes('timeout') ||
      err?.message?.includes('NetworkError');

    return {
      success: false,
      message: formatSupabaseErrorMessage(err),
      isOfflineOrPaused: isFetchErr
    };
  }
};

/**
 * Menghapus riwayat monitoring dari Supabase
 */
export const deleteAnaphylacticHistoryFromSupabase = async (
  id: string
): Promise<SupabaseSyncResult> => {
  if (!isSupabaseConfigured) return { success: true, message: 'Terhapus lokal' };

  try {
    const { error } = await supabase.from('anaphylactic_history').delete().eq('id', id);
    if (error) {
      return { success: false, message: formatSupabaseErrorMessage(error) };
    }
    return { success: true, message: 'Riwayat monitoring terhapus dari Supabase' };
  } catch (err: any) {
    return { success: false, message: formatSupabaseErrorMessage(err) };
  }
};
