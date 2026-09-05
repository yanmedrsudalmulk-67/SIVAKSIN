import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Printer, Save, CheckCircle2, AlertTriangle, ShieldAlert,
  Calendar, MapPin, User, Building2, Plus, Minus, Check, X,
  BriefcaseMedical, Layers, CheckCheck, Database, PackagePlus,
  Edit2, Trash2, RotateCcw, RefreshCw, Sparkles, History, FileText,
  Eye, Filter, CalendarDays, ChevronDown, CheckCircle
} from 'lucide-react';
import { 
  AnaphylacticItem, 
  AnaphylacticFormMeta, 
  defaultFormMeta, 
  defaultAnaphylacticItems,
  AnaphylacticHistoryRecord,
  initialHistoryRecords
} from '../data/anaphylacticData';
import { isSupabaseConfigured } from '../lib/supabase';
import { 
  fetchAnaphylacticFromSupabase, 
  upsertItemToSupabase, 
  deleteItemFromSupabase, 
  clearAllItemsFromSupabase, 
  syncAllToSupabase,
  fetchAnaphylacticHistoryFromSupabase,
  saveAnaphylacticHistoryToSupabase,
  deleteAnaphylacticHistoryFromSupabase
} from '../services/anaphylacticSupabaseService';
import { SupabaseConfigModal } from '../components/SupabaseConfigModal';
import { AnaphylacticItemModal } from '../components/AnaphylacticItemModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { AnaphylacticReportModal } from '../components/AnaphylacticReportModal';

const STORAGE_KEY_ITEMS = 'sivaksin_anaphylactic_items_v1';
const STORAGE_KEY_META = 'sivaksin_anaphylactic_meta_v1';
const STORAGE_KEY_HISTORY = 'sivaksin_anaphylactic_history_v1';

export default function AnafilaktikKit() {
  const navigate = useNavigate();

  // State
  const [meta, setMeta] = useState<AnaphylacticFormMeta>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_META);
      return saved ? JSON.parse(saved) : defaultFormMeta;
    } catch (e) {
      return defaultFormMeta;
    }
  });

  const [items, setItems] = useState<AnaphylacticItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      return saved ? JSON.parse(saved) : defaultAnaphylacticItems;
    } catch (e) {
      return defaultAnaphylacticItems;
    }
  });

  // History State
  const [historyRecords, setHistoryRecords] = useState<AnaphylacticHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : initialHistoryRecords;
    } catch (e) {
      return initialHistoryRecords;
    }
  });

  // History Filters
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Report Modal State
  const [selectedReportRecord, setSelectedReportRecord] = useState<AnaphylacticHistoryRecord | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // UI States
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Data berhasil disimpan');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'unreachable' | 'unconfigured' | 'checking'>(() => {
    return isSupabaseConfigured ? 'checking' : 'unconfigured';
  });

  // Modals
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnaphylacticItem | null>(null);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    mode: 'single' | 'all';
    targetItem?: AnaphylacticItem;
  }>({
    isOpen: false,
    mode: 'single'
  });

  // Initial fetch from Supabase if configured, with graceful fallback to local storage
  const initSupabaseData = async () => {
    if (!isSupabaseConfigured) {
      setSupabaseStatus('unconfigured');
      return;
    }
    setIsLoadingSupabase(true);
    setSupabaseStatus('checking');
    try {
      const { items: cloudItems, meta: cloudMeta, error, isOfflineOrPaused } = await fetchAnaphylacticFromSupabase();
      const { history: cloudHistory } = await fetchAnaphylacticHistoryFromSupabase();

      if (isOfflineOrPaused) {
        setSupabaseStatus('unreachable');
      } else if (error) {
        setSupabaseStatus('unreachable');
      } else {
        setSupabaseStatus('connected');
        if (cloudItems && cloudItems.length > 0) {
          setItems(cloudItems);
          try {
            localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(cloudItems));
          } catch (e) {}
        }
        if (cloudMeta) {
          setMeta(cloudMeta);
          try {
            localStorage.setItem(STORAGE_KEY_META, JSON.stringify(cloudMeta));
          } catch (e) {}
        }
        if (cloudHistory && cloudHistory.length > 0) {
          setHistoryRecords(cloudHistory);
          try {
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(cloudHistory));
          } catch (e) {}
        }
      }
    } catch (err) {
      setSupabaseStatus('unreachable');
    } finally {
      setIsLoadingSupabase(false);
    }
  };

  useEffect(() => {
    initSupabaseData();
  }, []);

  // Auto-save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [items, meta]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  // Handle Meta Change
  const handleMetaChange = (field: keyof AnaphylacticFormMeta, value: string) => {
    setMeta(prev => ({ ...prev, [field]: value }));
  };

  // Stock adjustments
  const handleStockChange = async (no: number, delta: number) => {
    let updatedItem: AnaphylacticItem | null = null;
    setItems(prev => prev.map(item => {
      if (item.no === no) {
        const next = Math.max(0, Number(item.stokSisa) + delta);
        updatedItem = { ...item, stokSisa: next };
        return updatedItem;
      }
      return item;
    }));

    if (updatedItem && isSupabaseConfigured) {
      upsertItemToSupabase(updatedItem);
    }
  };

  const handleStockDirectInput = (no: number, valueStr: string) => {
    const val = parseInt(valueStr, 10);
    const parsed = isNaN(val) ? 0 : Math.max(0, val);
    let updatedItem: AnaphylacticItem | null = null;

    setItems(prev => prev.map(item => {
      if (item.no === no) {
        updatedItem = { ...item, stokSisa: parsed };
        return updatedItem;
      }
      return item;
    }));

    if (updatedItem && isSupabaseConfigured) {
      upsertItemToSupabase(updatedItem);
    }
  };

  // Condition toggle (Baik / Tidak)
  const toggleKondisi = (no: number) => {
    let updatedItem: AnaphylacticItem | null = null;
    setItems(prev => prev.map(item => {
      if (item.no === no) {
        const nextKondisi = item.kondisi === 'Baik' ? 'Tidak' : 'Baik';
        updatedItem = { ...item, kondisi: nextKondisi };
        return updatedItem;
      }
      return item;
    }));

    if (updatedItem && isSupabaseConfigured) {
      upsertItemToSupabase(updatedItem);
    }
  };

  // Batch action: Set All Complete
  const handleSetAllComplete = async () => {
    const updated = items.map(item => ({
      ...item,
      stokSisa: item.stokAwal,
      kondisi: 'Baik' as const
    }));
    setItems(updated);
    triggerToast('Semua stok diset lengkap & kondisi baik');

    if (isSupabaseConfigured) {
      syncAllToSupabase(updated, meta);
    }
  };

  // Batch action: Restore 20 Defaults
  const handleRestoreDefaults = async () => {
    setItems(defaultAnaphylacticItems);
    setMeta(defaultFormMeta);
    triggerToast('20 item standar RSUD Al-Mulk berhasil dipulihkan');

    if (isSupabaseConfigured) {
      await syncAllToSupabase(defaultAnaphylacticItems, defaultFormMeta);
    }
  };

  // Add Item
  const handleSaveItem = async (savedItem: AnaphylacticItem) => {
    if (editingItem) {
      // Edit existing
      setItems(prev => prev.map(i => i.no === savedItem.no ? savedItem : i));
      triggerToast(`Item "${savedItem.nama}" berhasil diperbarui`);
    } else {
      // Add new
      setItems(prev => [...prev.filter(i => i.no !== savedItem.no), savedItem].sort((a, b) => a.no - b.no));
      triggerToast(`Item "${savedItem.nama}" berhasil ditambahkan`);
    }

    if (isSupabaseConfigured) {
      await upsertItemToSupabase(savedItem);
    }
  };

  // Delete Single Item
  const handleDeleteSingle = async () => {
    if (!deleteModalState.targetItem) return;
    const targetNo = deleteModalState.targetItem.no;
    const targetName = deleteModalState.targetItem.nama;

    setItems(prev => prev.filter(i => i.no !== targetNo));
    triggerToast(`Item "${targetName}" berhasil dihapus`);

    if (isSupabaseConfigured) {
      await deleteItemFromSupabase(targetNo);
    }
  };

  // Delete All Items (Clear Table)
  const handleClearAllItems = async () => {
    setItems([]);
    triggerToast('Seluruh data obat & alat pada tabel berhasil dihapus');

    if (isSupabaseConfigured) {
      await clearAllItemsFromSupabase();
    }
  };

  // Archive Current Form to History Records
  const handleArchiveCurrentToHistory = () => {
    const todayDate = meta.tanggalPemeriksaan || new Date().toISOString().slice(0, 10);
    const newRecord: AnaphylacticHistoryRecord = {
      id: `rec-${todayDate}-${Date.now().toString().slice(-4)}`,
      tanggalPemeriksaan: todayDate,
      unitRuangan: meta.unitRuangan || 'Klinik Vaksinasi Internasional',
      namaPetugas: meta.namaPetugas || 'Petugas Vaksinasi',
      catatanPetugas: meta.catatanPetugas || 'Pemeriksaan rutin ketersediaan syock anafilaktik kit.',
      totalItem: items.length,
      itemsLengkap: items.filter(i => Number(i.stokSisa) >= i.stokAwal && i.kondisi === 'Baik').length,
      itemsKurang: items.filter(i => Number(i.stokSisa) < i.stokAwal).length,
      itemsRusak: items.filter(i => i.kondisi === 'Tidak').length,
      persentaseKesiapan: items.length > 0 ? Math.round((items.filter(i => Number(i.stokSisa) >= i.stokAwal && i.kondisi === 'Baik').length / items.length) * 100) : 0,
      items: JSON.parse(JSON.stringify(items)),
      createdAt: new Date().toISOString(),
    };

    const updatedHistory = [newRecord, ...historyRecords.filter(r => r.tanggalPemeriksaan !== todayDate)];
    setHistoryRecords(updatedHistory);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));
    } catch (e) {}

    if (isSupabaseConfigured) {
      saveAnaphylacticHistoryToSupabase(newRecord);
    }

    triggerToast('Data pemeriksaan berhasil diarsipkan ke Riwayat Monitoring (Supabase Cloud)');
  };

  // Manual Save & Sync
  const handleManualSave = async () => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));

      // Also ensure history record is updated with latest values
      const todayDate = meta.tanggalPemeriksaan || new Date().toISOString().slice(0, 10);
      const updatedSnapshot: AnaphylacticHistoryRecord = {
        id: `rec-${todayDate}`,
        tanggalPemeriksaan: todayDate,
        unitRuangan: meta.unitRuangan || 'Klinik Vaksinasi Internasional',
        namaPetugas: meta.namaPetugas || 'Petugas Vaksinasi',
        catatanPetugas: meta.catatanPetugas || 'Pemeriksaan rutin ketersediaan syock anafilaktik kit.',
        totalItem: items.length,
        itemsLengkap: items.filter(i => Number(i.stokSisa) >= i.stokAwal && i.kondisi === 'Baik').length,
        itemsKurang: items.filter(i => Number(i.stokSisa) < i.stokAwal).length,
        itemsRusak: items.filter(i => i.kondisi === 'Tidak').length,
        persentaseKesiapan: items.length > 0 ? Math.round((items.filter(i => Number(i.stokSisa) >= i.stokAwal && i.kondisi === 'Baik').length / items.length) * 100) : 0,
        items: JSON.parse(JSON.stringify(items)),
        createdAt: new Date().toISOString(),
      };

      const updatedHistory = [
        updatedSnapshot,
        ...historyRecords.filter(r => r.tanggalPemeriksaan !== todayDate && r.id !== updatedSnapshot.id)
      ];
      setHistoryRecords(updatedHistory);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));

      if (isSupabaseConfigured) {
        setIsSyncing(true);
        const res = await syncAllToSupabase(items, meta);
        await saveAnaphylacticHistoryToSupabase(updatedSnapshot);
        setIsSyncing(false);
        if (res.isOfflineOrPaused) {
          setSupabaseStatus('unreachable');
          triggerToast('Data tersimpan di memori lokal. Cloud Supabase sedang tidak aktif/paused.');
        } else if (!res.success) {
          triggerToast(`Tersimpan di lokal (${res.message})`);
        } else {
          setSupabaseStatus('connected');
          triggerToast(res.message);
        }
      } else {
        triggerToast('Data berhasil disimpan & diperbarui');
      }
    } catch (e) {
      triggerToast('Gagal menyimpan data');
      setIsSyncing(false);
    }
  };

  // Delete history item
  const handleDeleteHistory = async (recordId: string) => {
    const updated = historyRecords.filter(r => r.id !== recordId);
    setHistoryRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch (e) {}

    if (isSupabaseConfigured) {
      await deleteAnaphylacticHistoryFromSupabase(recordId);
    }
    triggerToast('Catatan riwayat berhasil dihapus dari Cloud');
  };

  const handleOpenReport = (record: AnaphylacticHistoryRecord) => {
    setSelectedReportRecord(record);
    setIsReportModalOpen(true);
  };

  // Direct print from History table row
  const handleDirectPrintRecord = (record: AnaphylacticHistoryRecord) => {
    setSelectedReportRecord(record);
    setIsReportModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Print official report for current active form
  const handlePrintCurrentOfficial = () => {
    const todayDate = meta.tanggalPemeriksaan || new Date().toISOString().slice(0, 10);
    const currentRecord: AnaphylacticHistoryRecord = {
      id: `rec-${todayDate}-cur`,
      tanggalPemeriksaan: todayDate,
      unitRuangan: meta.unitRuangan || 'Klinik Vaksinasi Internasional',
      namaPetugas: meta.namaPetugas || 'Petugas Vaksinasi',
      catatanPetugas: meta.catatanPetugas || 'Seluruh perlengkapan syock anafilaktik kit telah diperiksa dan disesuaikan dengan pedoman penanganan kejadian ikutan pasca imunisasi (KIPI) UOBK RSUD Al-Mulk.',
      totalItem: items.length,
      itemsLengkap: items.filter(i => Number(i.stokSisa) >= i.stokAwal && i.kondisi === 'Baik').length,
      itemsKurang: items.filter(i => Number(i.stokSisa) < i.stokAwal).length,
      itemsRusak: items.filter(i => i.kondisi === 'Tidak').length,
      persentaseKesiapan: items.length > 0 ? Math.round((items.filter(i => Number(i.stokSisa) >= i.stokAwal && i.kondisi === 'Baik').length / items.length) * 100) : 0,
      items: JSON.parse(JSON.stringify(items)),
      createdAt: new Date().toISOString(),
    };
    setSelectedReportRecord(currentRecord);
    setIsReportModalOpen(true);
  };

  // Month & Year Filter Options
  const MONTH_OPTIONS = [
    { value: 'all', label: 'Semua Bulan' },
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  // Dynamic Year list
  const availableYears = Array.from(
    new Set([
      '2026',
      '2025',
      '2024',
      ...historyRecords.map(r => r.tanggalPemeriksaan.slice(0, 4)).filter(Boolean)
    ])
  ).sort((a, b) => Number(b) - Number(a));

  // Filtered History
  const filteredHistory = historyRecords.filter(rec => {
    const parts = rec.tanggalPemeriksaan.split('-');
    const year = parts[0];
    const month = parts[1];
    const matchYear = selectedYear === 'all' || year === selectedYear;
    const matchMonth = selectedMonth === 'all' || month === selectedMonth;
    return matchYear && matchMonth;
  });

  // Statistics
  const totalItems = items.length;
  const itemsNeedRestock = items.filter(i => Number(i.stokSisa) < i.stokAwal).length;
  const itemsDamaged = items.filter(i => i.kondisi === 'Tidak').length;
  const itemsReady = items.filter(i => Number(i.stokSisa) >= i.stokAwal && i.kondisi === 'Baik').length;
  const readinessPercent = totalItems > 0 ? Math.round((itemsReady / totalItems) * 100) : 0;

  // Next suggested item number
  const nextNo = items.length > 0 ? Math.max(...items.map(i => i.no)) + 1 : 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20 print:bg-white print:p-0 print:pb-0">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border border-slate-700 text-sm font-bold print:hidden"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <Check size={14} strokeWidth={3} />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Navigation - Screen Only */}
      <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white sticky top-0 z-40 shadow-lg border-b border-slate-800/80 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Back & Title */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={() => navigate('/home')} 
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center border border-white/10 text-white shadow-sm"
                title="Kembali ke Beranda"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <BriefcaseMedical size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-[16px] sm:text-[20px] font-black tracking-tight text-white leading-tight">
                      Anafilaktik Kit
                    </h1>
                  </div>
                  <p className="text-[11px] sm:text-[12px] text-slate-300 font-medium">
                    UOBK RSUD AL-MULK KOTA SUKABUMI
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCurrentOfficial}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 active:scale-95 transition-all cursor-pointer shadow-sm"
                title="Cetak atau Download Laporan Resmi PDF"
              >
                <Printer size={15} />
                <span className="hidden sm:inline">Cetak / Download Laporan</span>
              </button>

              <button
                onClick={handleManualSave}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-600 text-white text-xs font-bold shadow-md shadow-rose-600/30 active:scale-95 transition-all disabled:opacity-50"
                title="Simpan & Sinkronkan Data"
              >
                {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
                <span>{isSyncing ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container - Hidden on print so ONLY the Official Report Modal prints */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 print:hidden">
        
        {/* ==========================================================
            METADATA / IDENTITAS FORMULIR (Screen View Card)
            ========================================================== */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-slate-200/80 relative overflow-hidden print:hidden">
          
          {/* Header Judul & Subjudul Rata Tengah Tanpa Badge */}
          <div className="relative z-10 text-center pb-6 border-b border-slate-100">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              FORM MONITORING SYOCK ANAFILAKTIK KIT
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-xl mx-auto">
              Pencatatan rutin ketersediaan obat dan alat emergensi syok anafilaktik di instalasi vaksinasi
            </p>
          </div>

          {/* Input Fields (Tanpa Lokasi Kit & Periode / Bulan) */}
          <div className="relative z-10 pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Field 1: Unit / Ruangan */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 size={13} className="text-rose-500" /> Unit / Ruangan
                </label>
                <input 
                  type="text"
                  value={meta.unitRuangan}
                  onChange={(e) => handleMetaChange('unitRuangan', e.target.value)}
                  placeholder="Contoh: Poli Vaksinasi / IGD"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all"
                />
              </div>

              {/* Field 2: Tanggal Pemeriksaan */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar size={13} className="text-rose-500" /> Tanggal Pemeriksaan
                </label>
                <input 
                  type="date"
                  value={meta.tanggalPemeriksaan}
                  onChange={(e) => handleMetaChange('tanggalPemeriksaan', e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all"
                />
              </div>

              {/* Field 3: Nama Petugas */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                  <User size={13} className="text-rose-500" /> Nama Petugas
                </label>
                <input 
                  type="text"
                  value={meta.namaPetugas}
                  onChange={(e) => handleMetaChange('namaPetugas', e.target.value)}
                  placeholder="Nama & Gelar Pemeriksa"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all"
                />
              </div>

            </div>
          </div>
        </section>

        {/* ==========================================================
            TABLE VIEW & TOOLBAR (CRUD: Tambah, Edit, Hapus, Supabase)
            ========================================================== */}
        <div className="bg-white rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-slate-200/80 overflow-hidden print:border-slate-900 print:shadow-none print:rounded-none">
          
          {/* Action Toolbar above table (Screen Only) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 print:hidden">
            
            {/* Left Actions: Tambah & Set Lengkap */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              >
                <PackagePlus size={15} />
                <span>+ Tambah Item Baru</span>
              </button>

              <button
                type="button"
                onClick={handleSetAllComplete}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold active:scale-95 transition-all"
                title="Isi otomatis semua stok sisa sama dengan stok awal"
              >
                <CheckCheck size={14} />
                <span>Set Lengkap</span>
              </button>
            </div>

            {/* Right Actions: Reset/Muat 20 Standar & Hapus Seluruh Data */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold active:scale-95 transition-all shadow-xs"
                title="Muat ulang 20 item standar RSUD Al-Mulk"
              >
                <RotateCcw size={13} className="text-slate-500" />
                <span className="hidden sm:inline">Muat 20 Standar RS</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteModalState({ isOpen: true, mode: 'all' })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold active:scale-95 transition-all"
                title="Kosongkan seluruh data tabel"
              >
                <Trash2 size={13} className="text-rose-600" />
                <span>Hapus Seluruh Data</span>
              </button>
            </div>

          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[820px] print:min-w-full">
              
              {/* Table Header matching the photo */}
              <thead>
                <tr className="bg-slate-100/90 text-slate-800 text-[12px] sm:text-[13px] font-black uppercase tracking-wider border-b-2 border-slate-300 print:bg-slate-200 print:border-slate-900">
                  <th className="py-3.5 px-3 text-center w-12 border-r border-slate-200 print:border-slate-900">
                    No
                  </th>
                  <th className="py-3.5 px-4 border-r border-slate-200 print:border-slate-900">
                    Nama Obat / Alat
                  </th>
                  <th className="py-3.5 px-4 border-r border-slate-200 print:border-slate-900">
                    Spesifikasi
                  </th>
                  <th className="py-3.5 px-3 text-center w-20 border-r border-slate-200 print:border-slate-900">
                    Stok Awal
                  </th>
                  <th className="py-3.5 px-4 text-center w-36 border-r border-slate-200 print:border-slate-900 bg-rose-50/50 print:bg-transparent">
                    Stok Sisa
                  </th>
                  <th className="py-3.5 px-4 border-r border-slate-200 print:border-slate-900">
                    No. Batch
                  </th>
                  <th className="py-3.5 px-4 border-r border-slate-200 print:border-slate-900">
                    Exp. Date
                  </th>
                  <th className="py-3.5 px-3 text-center w-28 border-r border-slate-200 print:border-slate-900">
                    Kondisi
                  </th>
                  <th className="py-3.5 px-3 text-center w-24 print:hidden">
                    Aksi
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-200 text-xs sm:text-[13px] print:divide-slate-900 font-medium">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <PackagePlus size={32} className="text-slate-300 stroke-1" />
                        <span className="font-bold text-slate-600 text-sm">Tabel Anafilaktik Kit Saat Ini Kosong</span>
                        <p className="text-xs text-slate-400 max-w-md">
                          Gunakan tombol <strong>+ Tambah Item Baru</strong> di atas untuk menambahkan item baru, atau klik <strong>Muat 20 Standar RS</strong> untuk memulihkan susunan resmi.
                        </p>
                        <button
                          type="button"
                          onClick={handleRestoreDefaults}
                          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
                        >
                          <RotateCcw size={13} />
                          <span>Muat 20 Standar RS</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const isUnderStock = Number(item.stokSisa) < item.stokAwal;
                    const isDamaged = item.kondisi === 'Tidak';

                    return (
                      <tr 
                        key={item.no}
                        className={`transition-colors print:border-b print:border-slate-900 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                        } ${
                          isUnderStock ? 'hover:bg-rose-50/40' : 'hover:bg-blue-50/30'
                        }`}
                      >
                        {/* No */}
                        <td className="py-3 px-3 text-center font-bold text-slate-700 border-r border-slate-200 print:border-slate-900">
                          {item.no}
                        </td>

                        {/* Nama Obat / Alat */}
                        <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 print:border-slate-900">
                          <div className="flex items-center justify-between gap-2">
                            <span>{item.nama}</span>
                            {isUnderStock && (
                              <span className="print:hidden inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-black shrink-0">
                                Kurang
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Spesifikasi */}
                        <td className="py-3 px-4 text-slate-600 border-r border-slate-200 print:border-slate-900 font-normal">
                          {item.spesifikasi}
                        </td>

                        {/* Stok Awal */}
                        <td className="py-3 px-3 text-center font-black text-slate-800 border-r border-slate-200 print:border-slate-900 bg-slate-50/40 print:bg-transparent">
                          {item.stokAwal}
                        </td>

                        {/* Stok Sisa (Interactive Stepper) */}
                        <td className="py-2.5 px-3 border-r border-slate-200 print:border-slate-900 bg-rose-50/20 print:bg-transparent">
                          
                          {/* Print mode text */}
                          <div className="hidden print:block text-center font-bold">
                            {item.stokSisa}
                          </div>

                          {/* Screen mode stepper */}
                          <div className="print:hidden flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStockChange(item.no, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-700 flex items-center justify-center font-black transition-all"
                              title="Kurangi stok"
                            >
                              <Minus size={13} strokeWidth={3} />
                            </button>

                            <input 
                              type="number"
                              min="0"
                              value={item.stokSisa}
                              onChange={(e) => handleStockDirectInput(item.no, e.target.value)}
                              className={`w-12 text-center py-1 rounded-lg border font-black text-sm focus:outline-none transition-all ${
                                isUnderStock 
                                  ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-2 focus:ring-rose-500/20' 
                                  : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500/20'
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() => handleStockChange(item.no, 1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-700 flex items-center justify-center font-black transition-all"
                              title="Tambah stok"
                            >
                              <Plus size={13} strokeWidth={3} />
                            </button>
                          </div>
                        </td>

                        {/* No. Batch */}
                        <td className="py-3 px-4 font-mono text-[12px] text-slate-700 border-r border-slate-200 print:border-slate-900">
                          {item.noBatch}
                        </td>

                        {/* Exp. Date */}
                        <td className="py-3 px-4 border-r border-slate-200 print:border-slate-900">
                          <span className={`font-semibold ${
                            item.expDate.includes('2026') 
                              ? 'text-amber-700 font-bold' 
                              : 'text-slate-700'
                          }`}>
                            {item.expDate}
                          </span>
                        </td>

                        {/* Kondisi (Baik / Tidak) */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-200 print:border-slate-900">
                          
                          {/* Print mode text */}
                          <div className="hidden print:block font-bold">
                            {item.kondisi}
                          </div>

                          {/* Screen toggle pill */}
                          <div className="print:hidden flex justify-center">
                            <button
                              type="button"
                              onClick={() => toggleKondisi(item.no)}
                              className={`px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 active:scale-95 shadow-xs ${
                                item.kondisi === 'Baik'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                              }`}
                              title="Klik untuk mengubah status Baik/Tidak"
                            >
                              {item.kondisi === 'Baik' ? (
                                <>
                                  <Check size={12} strokeWidth={3} />
                                  <span>Baik</span>
                                </>
                              ) : (
                                <>
                                  <X size={12} strokeWidth={3} />
                                  <span>Tidak</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Aksi (Edit & Hapus) - Screen Only */}
                        <td className="py-2 px-3 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(item);
                                setIsItemModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-all active:scale-95"
                              title="Edit Item"
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteModalState({
                                isOpen: true,
                                mode: 'single',
                                targetItem: item
                              })}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all active:scale-95"
                              title="Hapus Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>

          {/* Table Bottom Footer Summary */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 font-semibold gap-2 print:hidden">
            <div className="flex items-center gap-4">
              <span>Total {items.length} item obat & alat medis</span>
              {itemsNeedRestock > 0 && (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle size={13} /> {itemsNeedRestock} item kekurangan stok
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span>Penyimpanan:</span>
              {supabaseStatus === 'connected' ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 size={11} /> Cloud Supabase Aktif + Lokal
                </span>
              ) : supabaseStatus === 'unreachable' ? (
                <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <AlertTriangle size={11} className="text-amber-600" /> Mode Lokal (Supabase Paused/Offline)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-700 font-bold bg-slate-200 px-2.5 py-0.5 rounded-full">
                  Penyimpanan Lokal (Offline)
                </span>
              )}
            </div>
          </div>

        </div>

        {/* ==========================================================
            STATISTIK RINGKASAN STOK (Di Bawah Tabel)
            ========================================================== */}
        <section className="print:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            
            {/* Total Standar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3 hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Item</span>
                <span className="text-lg font-black text-slate-800">{totalItems} Item</span>
              </div>
            </div>

            {/* Lengkap & Baik */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Lengkap & Baik</span>
                <span className="text-lg font-black text-emerald-600">{itemsReady} Item</span>
              </div>
            </div>

            {/* Perlu Restok */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3 hover:border-rose-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Perlu Restok</span>
                <span className={`text-lg font-black ${itemsNeedRestock > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {itemsNeedRestock} Item
                </span>
              </div>
            </div>

            {/* Kondisi Rusak */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3 hover:border-amber-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Kondisi Rusak</span>
                <span className={`text-lg font-black ${itemsDamaged > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                  {itemsDamaged} Item
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ==========================================================
            RIWAYAT MONITORING (Bulan, Tahun, Laporan Resmi & Cetak)
            ========================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-slate-200/80 print:hidden space-y-6">
          
          {/* Header Riwayat */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <History size={24} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Riwayat Monitoring Anafilaktik Kit
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                    {filteredHistory.length} Riwayat Tersimpan
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Arsip riwayat pemeriksaan berkala yang telah di-input secara realtime.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bulan & Tahun Bar */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              
              <div className="flex items-center gap-1.5 font-bold text-slate-600">
                <Filter size={14} className="text-rose-500" />
                <span>Filter Periode:</span>
              </div>

              {/* Dropdown Bulan */}
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/10 cursor-pointer shadow-xs"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Dropdown Tahun */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/10 cursor-pointer shadow-xs"
                >
                  <option value="all">Semua Tahun</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      Tahun {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Reset Filter Button */}
              {(selectedMonth !== 'all' || selectedYear !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMonth('all');
                    setSelectedYear('all');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold underline underline-offset-2 ml-1"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-500 font-semibold">
              Menampilkan <span className="font-black text-slate-800">{filteredHistory.length}</span> laporan pemeriksaan
            </div>
          </div>

          {/* Daftar Riwayat Hasil Filter */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-200/70 text-slate-500 flex items-center justify-center mx-auto">
                <History size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Belum ada riwayat monitoring untuk filter yang dipilih
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Setiap kali Anda menyimpan formulir pemeriksaan di atas, data riwayat dan dokumen laporan resmi akan otomatis tercatat secara realtime di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <th className="py-3.5 px-4">Tanggal Periksa</th>
                      <th className="py-3.5 px-4">Unit / Ruangan</th>
                      <th className="py-3.5 px-4">Petugas Pemeriksa</th>
                      <th className="py-3.5 px-4 text-center">Status Kesiapan</th>
                      <th className="py-3.5 px-4 text-center">Jumlah Item</th>
                      <th className="py-3.5 px-4 text-center">Aksi & Dokumen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredHistory.map((rec, idx) => {
                      const isComplete = rec.itemsKurang === 0 && rec.itemsRusak === 0;

                      // Format date e.g. "04 Sep 2026"
                      const dateObj = new Date(rec.tanggalPemeriksaan);
                      const displayDate = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                        : rec.tanggalPemeriksaan;

                      return (
                        <tr 
                          key={rec.id || idx} 
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Tanggal */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-rose-50 text-slate-700 group-hover:text-rose-600 flex items-center justify-center font-black text-xs shrink-0 transition-colors">
                                <CalendarDays size={15} />
                              </div>
                              <div>
                                <span className="font-black text-slate-900 block">{displayDate}</span>
                                <span className="text-[10px] text-slate-500 font-mono">ID: #{rec.id.slice(-6).toUpperCase()}</span>
                              </div>
                            </div>
                          </td>

                          {/* Unit */}
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {rec.unitRuangan}
                          </td>

                          {/* Petugas */}
                          <td className="py-3.5 px-4 text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <User size={13} className="text-slate-400" />
                              <span>{rec.namaPetugas}</span>
                            </div>
                          </td>

                          {/* Kesiapan Kit */}
                          <td className="py-3.5 px-4 text-center">
                            {isComplete ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                                <CheckCircle size={13} className="text-emerald-600" />
                                100% Siap Pakai
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black">
                                <AlertTriangle size={13} className="text-amber-600" />
                                {rec.persentaseKesiapan}% ({rec.itemsKurang} Restok)
                              </span>
                            )}
                          </td>

                          {/* Jumlah Item */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {rec.totalItem} Item
                            </span>
                          </td>

                          {/* Tombol Aksi (Lihat Laporan & Cetak) */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Tombol Lihat Laporan Resmi */}
                              <button
                                type="button"
                                onClick={() => handleOpenReport(rec)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold transition-all active:scale-95 shadow-2xs"
                                title="Buka Dokumen Laporan Resmi"
                              >
                                <Eye size={14} className="text-rose-600" />
                                <span>Lihat Laporan</span>
                              </button>

                              {/* Tombol Cetak Langsung */}
                              <button
                                type="button"
                                onClick={() => handleDirectPrintRecord(rec)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                                title="Cetak Dokumen Laporan Resmi"
                              >
                                <Printer size={14} />
                                <span>Cetak</span>
                              </button>

                              {/* Tombol Hapus Arsip */}
                              <button
                                type="button"
                                onClick={() => handleDeleteHistory(rec.id)}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                title="Hapus dari Riwayat"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* ==========================================================
          MODALS
          ========================================================== */}

      {/* 1. Modal Tambah / Edit Item */}
      <AnaphylacticItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        initialItem={editingItem}
        suggestedNo={nextNo}
      />

      {/* 2. Modal Konfirmasi Hapus (Satuan atau Seluruh Data) */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (deleteModalState.mode === 'all') {
            handleClearAllItems();
          } else {
            handleDeleteSingle();
          }
        }}
        title={
          deleteModalState.mode === 'all'
            ? 'Hapus Seluruh Data Anafilaktik Kit?'
            : `Hapus Item "${deleteModalState.targetItem?.nama}"?`
        }
        description={
          deleteModalState.mode === 'all'
            ? 'Tindakan ini akan mengosongkan seluruh baris obat dan alat pada tabel Anafilaktik Kit saat ini.'
            : `Apakah Anda yakin ingin menghapus item nomor #${deleteModalState.targetItem?.no} (${deleteModalState.targetItem?.nama}) dari daftar kit?`
        }
        confirmLabel={deleteModalState.mode === 'all' ? 'Ya, Kosongkan Tabel' : 'Ya, Hapus Item'}
        isDangerAll={deleteModalState.mode === 'all'}
      />

      {/* 3. Modal Konfigurasi Database Supabase */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSyncAll={handleManualSave}
        isSyncing={isSyncing}
        onConfigChanged={initSupabaseData}
      />

      {/* 4. Modal Laporan Resmi Monitoring & Cetak */}
      <AnaphylacticReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        record={selectedReportRecord}
      />

    </div>
  );
}
