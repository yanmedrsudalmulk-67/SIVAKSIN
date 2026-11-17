/**
 * Service Kit Anafilaktik
 * Dialihkan 100% ke penyimpanan database lokal komputer (data/sivaksin_db.json).
 */

import { AnaphylacticItem, AnaphylacticFormMeta, AnaphylacticHistoryRecord, defaultAnaphylacticItems, defaultFormMeta } from '../data/anaphylacticData';
import { fetchAnaphylacticLocal, syncAnaphylacticLocal } from './localDataService';

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  isOfflineOrPaused?: boolean;
  error?: any;
}

export const fetchAnaphylacticFromSupabase = async (): Promise<{
  items: AnaphylacticItem[] | null;
  meta: AnaphylacticFormMeta | null;
  history?: AnaphylacticHistoryRecord[] | null;
  error?: string;
  isOfflineOrPaused?: boolean;
}> => {
  try {
    const data = await fetchAnaphylacticLocal();
    return {
      items: (data.items && data.items.length > 0) ? data.items : defaultAnaphylacticItems,
      meta: (data.meta && Object.keys(data.meta).length > 0) ? data.meta : defaultFormMeta,
      history: data.history || []
    };
  } catch (err: any) {
    return {
      items: defaultAnaphylacticItems,
      meta: defaultFormMeta,
      history: [],
      error: err.message
    };
  }
};

export const syncAnaphylacticItemsToSupabase = async (
  items: AnaphylacticItem[]
): Promise<SupabaseSyncResult> => {
  try {
    const res = await syncAnaphylacticLocal({ items });
    if (res.success) {
      return { success: true, message: 'Checklist anafilaktik tersimpan di database lokal' };
    }
    return { success: false, message: res.error || 'Gagal menyimpan checklist lokal' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal menyimpan checklist lokal' };
  }
};

export const syncAnaphylacticMetaToSupabase = async (
  meta: AnaphylacticFormMeta
): Promise<SupabaseSyncResult> => {
  try {
    const res = await syncAnaphylacticLocal({ meta });
    if (res.success) {
      return { success: true, message: 'Informasi pemeriksaan tersimpan di database lokal' };
    }
    return { success: false, message: res.error || 'Gagal menyimpan meta lokal' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal menyimpan meta lokal' };
  }
};

export const syncAllToSupabase = async (
  items: AnaphylacticItem[],
  meta: AnaphylacticFormMeta
): Promise<SupabaseSyncResult> => {
  try {
    const res = await syncAnaphylacticLocal({ items, meta });
    if (res.success) {
      return { success: true, message: 'Seluruh data anafilaktik tersimpan di database lokal komputer' };
    }
    return { success: false, message: res.error || 'Gagal menyimpan data lokal' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal menyimpan data lokal' };
  }
};

export const upsertItemToSupabase = async (
  item: AnaphylacticItem
): Promise<SupabaseSyncResult> => {
  try {
    const current = await fetchAnaphylacticLocal();
    const items = current.items || defaultAnaphylacticItems;
    const exists = items.some(i => i.no === item.no);
    const updated = exists ? items.map(i => i.no === item.no ? item : i) : [...items, item];
    const res = await syncAnaphylacticLocal({ items: updated });
    return { success: res.success, message: res.success ? 'Item berhasil disimpan di database lokal' : (res.error || 'Gagal menyimpan item') };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal menyimpan item lokal' };
  }
};

export const deleteItemFromSupabase = async (
  no: number
): Promise<SupabaseSyncResult> => {
  try {
    const current = await fetchAnaphylacticLocal();
    const items = (current.items || defaultAnaphylacticItems).filter(i => i.no !== no);
    const res = await syncAnaphylacticLocal({ items });
    return { success: res.success, message: res.success ? 'Item dihapus dari database lokal' : (res.error || 'Gagal menghapus item') };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal menghapus item lokal' };
  }
};

export const clearAllItemsFromSupabase = async (): Promise<SupabaseSyncResult> => {
  try {
    const res = await syncAnaphylacticLocal({ items: [] });
    return { success: res.success, message: res.success ? 'Seluruh item berhasil dikosongkan' : (res.error || 'Gagal mengosongkan item') };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal mengosongkan item lokal' };
  }
};

export const fetchAnaphylacticHistoryFromSupabase = async (): Promise<{
  history: AnaphylacticHistoryRecord[] | null;
  error?: string;
}> => {
  try {
    const data = await fetchAnaphylacticLocal();
    return { history: data.history || [], error: undefined };
  } catch (err: any) {
    return { history: [], error: err.message };
  }
};

export const saveAnaphylacticHistoryToSupabase = async (
  record: AnaphylacticHistoryRecord
): Promise<SupabaseSyncResult> => {
  try {
    const current = await fetchAnaphylacticLocal();
    const history = current.history || [];
    const updatedHistory = [record, ...history.filter((h: any) => h.id !== record.id)];
    const res = await syncAnaphylacticLocal({ history: updatedHistory });
    if (res.success) {
      return { success: true, message: 'Laporan pemeriksaan berhasil diarsipkan di database lokal' };
    }
    return { success: false, message: res.error || 'Gagal mengarsipkan laporan' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal mengarsipkan laporan lokal' };
  }
};

export const saveReportToHistorySupabase = saveAnaphylacticHistoryToSupabase;

export const deleteAnaphylacticHistoryFromSupabase = async (
  id: string
): Promise<SupabaseSyncResult> => {
  try {
    const current = await fetchAnaphylacticLocal();
    const history = (current.history || []).filter((h: any) => h.id !== id);
    const res = await syncAnaphylacticLocal({ history });
    if (res.success) {
      return { success: true, message: 'Laporan berhasil dihapus dari arsip lokal' };
    }
    return { success: false, message: res.error || 'Gagal menghapus arsip' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal menghapus arsip lokal' };
  }
};

export const deleteHistoryFromSupabase = deleteAnaphylacticHistoryFromSupabase;
