import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { 
  FileText, CheckCircle2, Clock, ChevronLeft, ChevronDown, Trash2, 
  Search, Filter, Calendar, Users, Award, 
  ExternalLink, Printer, RefreshCw, X, Eye, 
  Phone, Hash, ShieldCheck, AlertCircle, Upload, Check, Sparkles,
  Download, PlusCircle, ArrowUpDown, Layers, ArrowUpRight, ArrowDownRight,
  Package, Activity, FileSpreadsheet, Edit3, CalendarRange, Building2,
  UserCheck, Stethoscope, Syringe, Save, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DailyUsageReport, StockMutation } from '../services/appDataSupabaseService';

// Daftar Dokter Pemeriksa di Poli MCU Vaksinasi Internasional
export const AVAILABLE_DOCTORS = [
  { kd_dokter: 'D00057', nm_dokter: 'dr. M. Arifin Ramadhani', spesialisasi: 'Dokter Pemeriksa / Penanggung Jawab Poli' },
  { kd_dokter: 'D00179', nm_dokter: 'dr. Chrysman Andreria Hatulely', spesialisasi: 'Dokter Pemeriksa Poli' }
];

// Daftar Perawat Vaksinator
export const AVAILABLE_VACCINATORS = [
  { nip: 'D00237', nama: 'Adi Tresa Purnama, A.M.Kep', peran: 'Perawat Vaksinator' },
  { nip: 'D00110', nama: 'Rany Nelvia Hermawati, Amd.Kep', peran: 'Perawat Vaksinator' }
];

// Daftar Petugas Administrasi
export const AVAILABLE_ADMIN_OFFICERS = [
  { nip: 'D00230', nama: 'Ina Nuraeni, S.AP', peran: 'Petugas Administrasi' },
  { nip: 'D00134', nama: 'Yussy Alfiani Rachman, S.T', peran: 'Petugas Administrasi' },
  { nip: 'D00287', nama: 'Giandeno Arianda, S.K.M', peran: 'Petugas Administrasi' },
  { nip: 'D00029', nama: 'Rafiul Qomar, S.Sos', peran: 'Petugas Administrasi' }
];

const MONTH_OPTIONS = [
  { value: 'all', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const YEAR_OPTIONS = [
  { value: 'all', label: 'Semua Tahun' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
  { value: '2028', label: '2028' },
];

export default function History() {
  const navigate = useNavigate();
  const { 
    bookings, 
    vaccines, 
    deleteBooking, 
    updateBooking,
    role, 
    refreshAllCloudData, 
    updateBookingStatus,
    uploadOfficialEicv,
    eicvStock,
    dailyReports,
    stockMutations,
    addDailyReport,
    addStockMutation,
    syncWithApiik,
    syncBookingToSimrsAction,
    postponeBookingAction
  } = useAppStore();

  const [isSyncingSimrs, setIsSyncingSimrs] = useState<string | null>(null);

  // Modal Penundaan Vaksinasi & Pembatalan Antrean SIMRS
  const [postponeModalBooking, setPostponeModalBooking] = useState<any | null>(null);
  const [postponeReason, setPostponeReason] = useState<string>('Demam / Gejala Infeksi Akut');
  const [customPostponeReason, setCustomPostponeReason] = useState<string>('');
  const [isSubmittingPostpone, setIsSubmittingPostpone] = useState<boolean>(false);

  // Modal Konfirmasi Hapus Peserta (Pilihan Ya / Tidak)
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState<any | null>(null);
  const [isDeletingBooking, setIsDeletingBooking] = useState<boolean>(false);

  // Top-level sheet navigation ('register' | 'laporan_harian' | 'rekapan_petugas')
  const [activeSheet, setActiveSheet] = useState<'register' | 'laporan_harian' | 'rekapan_petugas'>('register');

  // Sub-sheet filter in Register ('all' | 'eicv' | 'influenza') - Default ke eicv (Vaksin Internasional)
  const [registerSubSheet, setRegisterSubSheet] = useState<'all' | 'eicv' | 'influenza'>('eicv');
  const [registerSortOrder, setRegisterSortOrder] = useState<'excel' | 'newest'>('excel');

  // APIIK Live Integration State
  const [isSyncingApiik, setIsSyncingApiik] = useState(false);
  const [lastApiikSyncTime, setLastApiikSyncTime] = useState<string | null>(null);

  // Register Filters State
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State Edit Modal Detail Peserta
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editDetailForm, setEditDetailForm] = useState({
    name: '',
    nik: '',
    passport: '',
    dob: '',
    gender: 'Laki-laki',
    nationality: 'INDONESIA',
    phone: '',
    purpose: '',
    address: '',
    date: '',
    doctor_code: 'D00057',
    doctor_name: 'dr. M. Arifin Ramadhani',
    vaccinator_name: 'Adi Tresa Purnama, A.M.Kep',
    vaccinator_nip: 'D00237',
    admin_officer_name: 'Ina Nuraeni, S.AP',
    admin_officer_nip: 'D00230'
  });

  // State Filter Sheet 3: Rekapan Petugas Vaksinasi
  const [petugasFilterPreset, setPetugasFilterPreset] = useState<'all' | 'today' | 'this_month' | 'custom'>('all');
  const [petugasCustomDate, setPetugasCustomDate] = useState<string>('');
  const [petugasSearchQuery, setPetugasSearchQuery] = useState<string>('');

  // E-ICV Send Modal State
  const [eicvModalBooking, setEicvModalBooking] = useState<any | null>(null);
  const [eicvFile, setEicvFile] = useState<File | null>(null);
  const [isSendingEicv, setIsSendingEicv] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Laporan Harian & Pemakaian Vaksin Filter States
  const [reportTimePreset, setReportTimePreset] = useState<'all' | 'today' | '7days' | 'month' | 'year'>('all');
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [reportEndDate, setReportEndDate] = useState<string>('');
  const [selectedVaccineFilter, setSelectedVaccineFilter] = useState<string>('all');
  const [activeReportSubTab, setActiveReportSubTab] = useState<'harian' | 'mutasi'>('harian');
  const [reportsPage, setReportsPage] = useState<number>(1);
  const [reportsPerPage, setReportsPerPage] = useState<number | 'all'>(30);

  // Modals for Stock and Daily Reports
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalType, setStockModalType] = useState<'masuk' | 'keluar' | 'penyesuaian'>('masuk');
  const [stockForm, setStockForm] = useState({
    vaccine_id: 'v1',
    qty: 10,
    batch_no: '',
    source_or_purpose: '',
    notes: '',
    icv_qty: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState(false);
  const [editingDailyReport, setEditingDailyReport] = useState<Partial<DailyUsageReport> | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllCloudData();
      showToast('Data berhasil disinkronkan!');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Sinkronisasi dengan Portal Resmi APIIK BKK Bandung
  const handleSyncApiik = async (full: boolean = false, silent: boolean = false) => {
    if (isSyncingApiik) return;
    setIsSyncingApiik(true);
    try {
      const res = await syncWithApiik(full);
      const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLastApiikSyncTime(currentTime);
      localStorage.setItem('sivaksin_last_apiik_sync', Date.now().toString());

      if (res && res.ok) {
        if (!silent || (res.result && res.result.newCount > 0)) {
          showToast(`✅ Sinkronisasi APIIK BKK Berhasil! ${res.result?.newCount ? `${res.result.newCount} laporan baru ditambahkan.` : 'Data laporan sudah yang paling mutakhir.'}`);
        }
      } else {
        if (!silent) {
          showToast(`⚠️ Sinkronisasi APIIK: ${res?.error || 'Portal APIIK sedang tidak dapat diakses.'}`);
        }
      }
    } catch (err: any) {
      if (!silent) {
        showToast(`❌ Error sinkronisasi: ${err?.message || 'Terjadi kesalahan sistem.'}`);
      }
    } finally {
      setIsSyncingApiik(false);
    }
  };

  // Auto-sync saat halaman dibuka jika belum pernah sinkron dalam 5 menit terakhir
  useEffect(() => {
    const lastStr = localStorage.getItem('sivaksin_last_apiik_sync');
    const now = Date.now();
    if (!lastStr || now - parseInt(lastStr, 10) > 5 * 60 * 1000) {
      handleSyncApiik(false, true);
    }
  }, []);

  const handleDelete = (bookingOrId: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = typeof bookingOrId === 'string' 
      ? bookings.find(b => b.id === bookingOrId) || { id: bookingOrId }
      : bookingOrId;
    setDeleteConfirmBooking(target);
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmBooking) return;
    setIsDeletingBooking(true);
    try {
      await deleteBooking(deleteConfirmBooking.id);
      if (selectedBookingDetail?.id === deleteConfirmBooking.id) {
        setSelectedBookingDetail(null);
      }
      showToast('Data peserta berhasil dihapus & antrean di SIMRS dibersihkan.');
      setDeleteConfirmBooking(null);
    } catch (err: any) {
      showToast(`❌ Gagal menghapus peserta: ${err.message}`);
    } finally {
      setIsDeletingBooking(false);
    }
  };

  const handleOpenPostponeModal = (booking: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPostponeModalBooking(booking);
    setPostponeReason('Demam / Gejala Infeksi Akut');
    setCustomPostponeReason('');
  };

  const handleConfirmPostpone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postponeModalBooking) return;
    setIsSubmittingPostpone(true);
    const finalReason = postponeReason === 'Lainnya' ? (customPostponeReason.trim() || 'Kondisi kesehatan/penyakit belum memungkinkan vaksin') : postponeReason;
    try {
      const res = await postponeBookingAction(postponeModalBooking.id, finalReason);
      if (res && res.success) {
        showToast('⚠️ Vaksinasi berhasil ditunda & antrean di SIMRS telah dibatalkan.');
        if (selectedBookingDetail && selectedBookingDetail.id === postponeModalBooking.id) {
          setSelectedBookingDetail({
            ...selectedBookingDetail,
            status: 'ditunda',
            simrs_synced: false,
            simrs_no_rawat: undefined,
            simrs_no_reg: undefined,
            postponed_at: new Date().toISOString(),
            postponed_reason: finalReason,
            simrs_message: 'Pendaftaran ditunda (antrean SIMRS telah dibatalkan).'
          });
        }
        setPostponeModalBooking(null);
      } else {
        showToast(`❌ Gagal menunda vaksin: ${res?.error || 'Terjadi kesalahan'}`);
      }
    } catch (err: any) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setIsSubmittingPostpone(false);
    }
  };

  const handleStatusChange = async (booking: any, newStatus: 'menunggu' | 'belum_terverifikasi' | 'terverifikasi' | 'ditunda' | 'selesai') => {
    if (!booking) return;
    if (newStatus === 'ditunda') {
      handleOpenPostponeModal(booking);
      return;
    }
    try {
      await updateBooking(booking.id, { status: newStatus as any });
      await updateBookingStatus(booking.id, newStatus as any);
      if (selectedBookingDetail && selectedBookingDetail.id === booking.id) {
        setSelectedBookingDetail((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }
      const labelMap: Record<string, string> = {
        menunggu: 'Menunggu',
        belum_terverifikasi: 'Belum Terverifikasi',
        terverifikasi: 'Terverifikasi',
        ditunda: 'Di Tunda',
        selesai: 'Selesai'
      };
      showToast(`✅ Status pendaftaran berhasil diubah menjadi "${labelMap[newStatus] || newStatus}"!`);
    } catch (err: any) {
      console.error('Gagal memperbarui status:', err);
      showToast(`❌ Gagal memperbarui status: ${err.message}`);
    }
  };

  // Sinkronisasi data form edit saat selectedBookingDetail berubah
  useEffect(() => {
    if (selectedBookingDetail) {
      const p = selectedBookingDetail.patient || {};
      const rawGender = (p.gender || '').toLowerCase();
      const isFemale = rawGender.includes('p') || rawGender.includes('wanita') || rawGender.includes('fem');

      const docCode = selectedBookingDetail.doctor_code || 'D00057';
      const doc = AVAILABLE_DOCTORS.find(d => d.kd_dokter === docCode) || AVAILABLE_DOCTORS[0];

      const vaccName = selectedBookingDetail.vaccinator_name || AVAILABLE_VACCINATORS[0].nama;
      const vacc = AVAILABLE_VACCINATORS.find(v => v.nama === vaccName) || AVAILABLE_VACCINATORS[0];

      const admName = selectedBookingDetail.admin_officer_name || AVAILABLE_ADMIN_OFFICERS[0].nama;
      const adm = AVAILABLE_ADMIN_OFFICERS.find(a => a.nama === admName) || AVAILABLE_ADMIN_OFFICERS[0];

      let formattedDate = selectedBookingDetail.date || '';
      if (formattedDate && !/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
        const pd = parseBookingDate(formattedDate);
        if (pd) {
          const y = pd.getFullYear();
          const m = String(pd.getMonth() + 1).padStart(2, '0');
          const d = String(pd.getDate()).padStart(2, '0');
          formattedDate = `${y}-${m}-${d}`;
        }
      }

      let formattedDob = p.dob || p.birthDate || '';
      if (formattedDob && !/^\d{4}-\d{2}-\d{2}$/.test(formattedDob)) {
        const pd = parseBookingDate(formattedDob);
        if (pd) {
          const y = pd.getFullYear();
          const m = String(pd.getMonth() + 1).padStart(2, '0');
          const d = String(pd.getDate()).padStart(2, '0');
          formattedDob = `${y}-${m}-${d}`;
        }
      }

      setEditDetailForm({
        name: p.name || p.fullName || '',
        nik: p.nik || '',
        passport: p.passport || p.passportNumber || p.no_passport || '',
        dob: formattedDob,
        gender: isFemale ? 'Perempuan' : 'Laki-laki',
        nationality: p.nationality || 'INDONESIA',
        phone: p.handphone || p.phone || p.whatsapp || '',
        purpose: p.purpose || 'Kesehatan Pribadi / Vaksinasi Rutin',
        address: p.address || p.alamat || '',
        date: formattedDate,
        doctor_code: doc.kd_dokter,
        doctor_name: doc.nm_dokter,
        vaccinator_name: vacc.nama,
        vaccinator_nip: vacc.nip,
        admin_officer_name: adm.nama,
        admin_officer_nip: adm.nip
      });
      setIsEditingDetail(false);
    }
  }, [selectedBookingDetail?.id]);

  const handleSaveEditedDetail = async () => {
    if (!selectedBookingDetail) return;
    setIsSavingDetail(true);
    try {
      const doc = AVAILABLE_DOCTORS.find(d => d.kd_dokter === editDetailForm.doctor_code) || AVAILABLE_DOCTORS[0];
      const vacc = AVAILABLE_VACCINATORS.find(v => v.nama === editDetailForm.vaccinator_name) || AVAILABLE_VACCINATORS[0];
      const adm = AVAILABLE_ADMIN_OFFICERS.find(a => a.nama === editDetailForm.admin_officer_name) || AVAILABLE_ADMIN_OFFICERS[0];

      const updates: any = {
        date: editDetailForm.date || selectedBookingDetail.date,
        doctor_code: doc.kd_dokter,
        doctor_name: doc.nm_dokter,
        vaccinator_name: vacc.nama,
        vaccinator_nip: vacc.nip,
        admin_officer_name: adm.nama,
        admin_officer_nip: adm.nip,
        patient: {
          ...(selectedBookingDetail.patient || {}),
          name: editDetailForm.name,
          fullName: editDetailForm.name,
          nik: editDetailForm.nik,
          passport: editDetailForm.passport,
          passportNumber: editDetailForm.passport,
          no_passport: editDetailForm.passport,
          dob: editDetailForm.dob,
          birthDate: editDetailForm.dob,
          gender: editDetailForm.gender,
          nationality: editDetailForm.nationality,
          handphone: editDetailForm.phone,
          phone: editDetailForm.phone,
          purpose: editDetailForm.purpose,
          address: editDetailForm.address,
          alamat: editDetailForm.address,
          doctor_code: doc.kd_dokter,
          doctor_name: doc.nm_dokter
        }
      };

      await updateBooking(selectedBookingDetail.id, updates);
      setSelectedBookingDetail((prev: any) => ({
        ...prev,
        ...updates,
        patient: { ...(prev?.patient || {}), ...updates.patient }
      }));
      setIsEditingDetail(false);

      // Jika pasien sudah terdaftar di SIMRS, sinkronkan perubahan dokter & data ke SIMRS Khanza seketika
      if (selectedBookingDetail.simrs_synced || selectedBookingDetail.simrs_no_rawat) {
        try {
          const simrsRes = await syncBookingToSimrsAction(selectedBookingDetail.id, false, doc.kd_dokter);
          if (simrsRes && simrsRes.success) {
            setSelectedBookingDetail((prev: any) => ({
              ...prev,
              doctor_code: simrsRes.kd_dokter || doc.kd_dokter,
              doctor_name: simrsRes.nm_dokter || doc.nm_dokter
            }));
            showToast(`✅ Data disimpan & Dokter di SIMRS Khanza berhasil disinkronkan ke ${doc.nm_dokter}!`);
            return;
          }
        } catch (simrsErr: any) {
          console.warn('[Auto-sync SIMRS update note]:', simrsErr.message);
        }
      }

      showToast('✅ Data peserta & petugas berhasil diperbarui dan disimpan!');
    } catch (err: any) {
      showToast(`❌ Gagal menyimpan perubahan: ${err.message}`);
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleSyncToSimrs = async (booking: any, reregister: boolean = false, customDoctorCode?: string) => {
    if (!booking) return;
    setIsSyncingSimrs(booking.id);
    const isRe = reregister || booking.status === 'ditunda';
    const chosenDoctorCode = customDoctorCode || booking.doctor_code || editDetailForm.doctor_code || 'D00057';
    try {
      const res = await syncBookingToSimrsAction(booking.id, isRe, chosenDoctorCode);
      if (res && res.success) {
        const msg = isRe 
          ? `✅ Pendaftaran ulang berhasil masuk SIMRS hari ini! No. Rawat: ${res.no_rawat} (Antrean: ${res.no_reg})`
          : `✅ Berhasil masuk SIMRS Poli Vaksinasi (${res.nm_dokter || 'dr. Pemeriksa'})! No. Rawat: ${res.no_rawat} (Antrean: ${res.no_reg})`;
        showToast(msg);
        if (selectedBookingDetail && selectedBookingDetail.id === booking.id) {
          setSelectedBookingDetail({
            ...selectedBookingDetail,
            status: isRe ? 'menunggu' : selectedBookingDetail.status,
            date: (isRe && res.tgl_registrasi) ? res.tgl_registrasi : selectedBookingDetail.date,
            simrs_synced: true,
            simrs_no_rawat: res.no_rawat || selectedBookingDetail.simrs_no_rawat,
            simrs_no_reg: res.no_reg || selectedBookingDetail.simrs_no_reg,
            simrs_no_rkm_medis: res.no_rkm_medis || selectedBookingDetail.simrs_no_rkm_medis,
            simrs_synced_at: new Date().toISOString(),
            simrs_message: res.message,
            doctor_code: res.kd_dokter || chosenDoctorCode,
            doctor_name: res.nm_dokter || selectedBookingDetail.doctor_name
          });
        }
      } else {
        showToast(`❌ Gagal masuk SIMRS: ${res.error || 'Terjadi kendala'}`);
      }
    } catch (err: any) {
      showToast(`❌ Error SIMRS: ${err.message}`);
    } finally {
      setIsSyncingSimrs(null);
    }
  };

  const handleSendEicvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'admin' || !eicvModalBooking || !eicvFile) return;
    if (eicvFile.type !== 'application/pdf' || eicvFile.size > 10 * 1024 * 1024) { 
      alert('Pilih file PDF maksimal 10 MB.'); 
      return; 
    }

    setIsSendingEicv(true);
    try {
      let finalFileName = eicvFile.name;
      const finalPdfUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(eicvFile);
      });

      await uploadOfficialEicv(eicvModalBooking.id, finalPdfUrl, finalFileName);
      showToast(`Sertifikat E-ICV (${finalFileName}) berhasil dikirim ke akun peserta!`);
      setEicvModalBooking(null);
      setEicvFile(null);
    } catch (err) {
      console.error('Gagal mengirim E-ICV:', err);
      alert('Gagal mengirim file E-ICV. Silakan coba lagi.');
    } finally {
      setIsSendingEicv(false);
    }
  };

  // Helper date parsing
  const parseBookingDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const directDate = new Date(dateStr);
    if (!isNaN(directDate.getTime())) return directDate;

    const isoMatch = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    }

    const dmyMatch = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      return new Date(parseInt(dmyMatch[3]), parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]));
    }

    return null;
  };

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    // If format like 05/11/2025, return as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    const d = parseBookingDate(dateStr);
    if (!d) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper mencari referensi master vaksin & harga standar RSUD Al-Mulk
  const findVaccineRef = (nameOrId: string) => {
    if (!nameOrId) return null;
    const lower = nameOrId.toLowerCase().trim();

    // 1. Cek by ID
    const byId = vaccines.find(v => v.id.toLowerCase() === lower);
    if (byId) return byId;

    // 2. Keyword check: Meningitis (Rp320.000)
    if (lower.includes('meningitis') || lower.includes('meningo')) {
      const vMen = vaccines.find(v => v.name.toLowerCase().includes('meningitis')) || vaccines.find(v => v.id === 'v1');
      return vMen || { id: 'v1', name: 'Meningitis Meningococcus', price: 320000, category: 'Wajib' };
    }

    // 3. Keyword check: Polio (Rp310.000)
    if (lower.includes('polio')) {
      const vPol = vaccines.find(v => v.name.toLowerCase().includes('polio')) || vaccines.find(v => v.id === 'v2');
      return vPol || { id: 'v2', name: 'Vaksin Polio', price: 310000, category: 'Wajib' };
    }

    // 4. Keyword check: Influenza / Flubio (Rp250.000)
    if (lower.includes('flu') || lower.includes('flubio') || lower.includes('influenza')) {
      const vFlu = vaccines.find(v => v.name.toLowerCase().includes('flu')) || vaccines.find(v => v.id === 'v3');
      return vFlu || { id: 'v3', name: 'Vaksin Influenza (Flubio)', price: 250000, category: 'Pilihan' };
    }

    // 5. Keyword check: Yellow Fever / Demam Kuning (Rp350.000)
    if (lower.includes('yellow') || lower.includes('kuning')) {
      return { id: 'v_yf', name: 'Vaksin Demam Kuning (Yellow Fever)', price: 350000, category: 'Wajib' };
    }

    // 6. Generic name match
    const byName = vaccines.find(v => v.name.toLowerCase().includes(lower) || lower.includes(v.name.toLowerCase()));
    if (byName) return byName;

    return null;
  };

  const getBookingVaccines = (b: any) => {
    if (!b) return [];

    if (b.patient?.selectedVaccineNames) {
      // Split koma yang bukan angka desimal (agar Flubio 0,5 ml tidak terbelah)
      const parts = b.patient.selectedVaccineNames.split(/,(?!\d)\s*/);
      return parts.map((name: string, idx: number) => {
        const trimmed = name.trim();
        const ref = findVaccineRef(trimmed);
        return {
          id: ref?.id || `v_custom_${idx}`,
          name: trimmed,
          price: ref ? ref.price : (trimmed.toLowerCase().includes('mening') ? 320000 : trimmed.toLowerCase().includes('polio') ? 310000 : trimmed.toLowerCase().includes('flu') ? 250000 : 0),
          category: ref?.category || 'Wajib'
        };
      });
    }

    const ids: string[] = Array.isArray(b.vaccineIds) && b.vaccineIds.length > 0
      ? b.vaccineIds
      : (Array.isArray(b.patient?.selectedVaccines) && b.patient.selectedVaccines.length > 0)
        ? b.patient.selectedVaccines
        : (b.vaccineId ? [b.vaccineId] : []);
    
    if (ids.length > 0) {
      return ids.map((id, idx) => {
        const found = vaccines.find(v => v.id === id) || findVaccineRef(id);
        if (found) return found;
        return { id, name: id, price: 0, category: 'Wajib' };
      });
    }

    if (b.patient?.selectedVaccine) {
      const trimmed = b.patient.selectedVaccine.trim();
      const ref = findVaccineRef(trimmed);
      return [{
        id: ref?.id || 'custom',
        name: trimmed,
        price: ref ? ref.price : (trimmed.toLowerCase().includes('mening') ? 320000 : trimmed.toLowerCase().includes('polio') ? 310000 : trimmed.toLowerCase().includes('flu') ? 250000 : 0),
        category: ref?.category || 'Wajib'
      }];
    }

    const single = vaccines.find(v => v.id === b.vaccineId) || findVaccineRef(b.vaccineId);
    return single ? [single] : [{ id: 'unknown', name: 'Vaksinasi Internasional', price: 0, category: 'Wajib' }];
  };

  const formatVaccineDisplay = (vaccineName: string): string => {
    if (!vaccineName) return '-';
    const lower = vaccineName.toLowerCase();
    if (lower.includes('mening')) {
      return 'MENINGITIS';
    }
    if (lower.includes('polio')) {
      return 'POLIO';
    }
    if (lower.includes('flu') || lower.includes('flubio')) {
      return 'INFLUENZA';
    }
    return vaccineName.toUpperCase();
  };

  const getBookingVaccineNames = (b: any): string => {
    const list = getBookingVaccines(b);
    return list.map(v => formatVaccineDisplay(v.name)).join(' • ');
  };

  // Kalkulasi tarif integrasi dengan paket bundling (Meningitis + Polio = Rp525.000)
  const getBookingPriceDetails = (b: any) => {
    const list = getBookingVaccines(b);
    if (list.length === 0) {
      return {
        vaccines: [],
        subtotal: 0,
        isBundled: false,
        discount: 0,
        total: 0
      };
    }

    const hasMen = list.some(v => v.name.toLowerCase().includes('mening') || v.id === 'v1');
    const hasPolio = list.some(v => v.name.toLowerCase().includes('polio') || v.id === 'v2');
    const isBundled = hasMen && hasPolio;

    let subtotal = 0;
    list.forEach(v => {
      subtotal += (v.price || 0);
    });

    let discount = 0;
    let total = subtotal;

    if (isBundled) {
      // Normal: Meningitis (320.000) + Polio (310.000) = 630.000
      // Paket Bundling Umroh RSUD Al-Mulk: 525.000 (Hemat 105.000)
      const menItem = list.find(v => v.name.toLowerCase().includes('mening') || v.id === 'v1');
      const polItem = list.find(v => v.name.toLowerCase().includes('polio') || v.id === 'v2');
      const menPrice = menItem?.price || 320000;
      const polPrice = polItem?.price || 310000;
      const normalMenPol = menPrice + polPrice; // 630.000

      discount = Math.max(0, normalMenPol - 525000); // 105.000
      total = Math.max(0, subtotal - discount);
    }

    return {
      vaccines: list,
      subtotal,
      isBundled,
      discount,
      total
    };
  };

  const getBookingTotalPrice = (b: any) => {
    return getBookingPriceDetails(b).total;
  };

  // Helper untuk mengecek apakah peserta hanya divaksin influenza saja (tanpa campuran vaksin meningitis / polio)
  const isPureInfluenzaOnly = (b: any) => {
    if (!b) return false;
    const p = b.patient || {};
    const cat = (p.category || '').toUpperCase();
    if (cat === 'INFLUENZA' || (b.id && b.id.startsWith('REG-INF'))) return true;

    const vIds = b.vaccineIds || (b.vaccineId ? [b.vaccineId] : []) || p.selectedVaccines || [];
    const vNames = (p.selectedVaccineNames || '').toLowerCase();
    
    const hasMen = vIds.includes('v1') || vNames.includes('meningitis');
    const hasPolio = vIds.includes('v2') || vNames.includes('polio');
    const hasFlu = vIds.includes('v3') || vNames.includes('flu') || vNames.includes('flubio');

    return hasFlu && !hasMen && !hasPolio;
  };

  // Helper untuk mengecek apakah peserta berhak menerima sertifikat E-ICV Internasional
  // Khusus vaksin Influenza murni TIDAK menerima sertifikat E-ICV
  const isBookingEligibleForEicv = (b: any) => {
    const p = b.patient || {};
    const cat = (p.category || '').toUpperCase();
    if (cat === 'INFLUENZA') return false;
    const vIds = b.vaccineIds || (b.vaccineId ? [b.vaccineId] : []) || p.selectedVaccines || [];
    const vNames = (p.selectedVaccineNames || '').toLowerCase();
    const hasMen = vIds.includes('v1') || vNames.includes('meningitis');
    const hasPolio = vIds.includes('v2') || vNames.includes('polio');
    const hasYf = vNames.includes('yellow') || vNames.includes('kuning');
    return hasMen || hasPolio || hasYf;
  };

  // Helper cek apakah pendaftar sudah memiliki E-ICV sebelumnya (sehingga tidak diterbitkan blangko E-ICV baru)
  const hasAlreadyIcv = (b: any) => {
    const p = b.patient || {};
    const notes = `${p.notes || ''} ${p.ket || ''} ${b.notes || ''}`.toLowerCase();
    return notes.includes('sudah memiliki e-icv') || notes.includes('sudah memiliki icv') || notes.includes('hanya vaksin saja');
  };

  // Sub-sheet counts calculation
  const subSheetCounts = useMemo(() => {
    let eicv = 0;
    let inf = 0;
    for (const b of bookings) {
      if (isPureInfluenzaOnly(b)) {
        inf++;
      } else {
        eicv++;
      }
    }
    return { all: bookings.length, eicv, influenza: inf };
  }, [bookings]);

  // Filter Register Logic
  const filteredBookings = useMemo(() => {
    let list = bookings.filter((booking) => {
      const bDate = parseBookingDate(booking.date);

      // Sub-sheet filter (all, eicv, influenza)
      // Khusus sheet influenza: hanya peserta murni influenza saja (tanpa campuran)
      if (registerSubSheet === 'eicv') {
        if (isPureInfluenzaOnly(booking)) return false;
      } else if (registerSubSheet === 'influenza') {
        if (!isPureInfluenzaOnly(booking)) return false;
      }

      if (selectedMonth !== 'all') {
        if (!bDate) return false;
        const monthNum = (bDate.getMonth() + 1).toString();
        if (monthNum !== selectedMonth) return false;
      }

      if (selectedYear !== 'all') {
        if (!bDate) return false;
        const yearNum = bDate.getFullYear().toString();
        if (yearNum !== selectedYear) return false;
      }

      if (selectedStatus !== 'all') {
        if (booking.status !== selectedStatus) return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const patient = booking.patient || {};
        const pName = (patient.name || patient.fullName || patient.nama || '').toLowerCase();
        const pNik = (patient.nik || '').toLowerCase();
        const pPassport = (patient.passport || patient.passportNumber || patient.no_passport || '').toLowerCase();
        const pPhone = (patient.handphone || patient.phone || patient.no_hp || '').toLowerCase();
        const bId = (booking.id || '').toLowerCase();
        const bVaccines = getBookingVaccines(booking);
        const hasVaccineMatch = bVaccines.some(v => v.name.toLowerCase().includes(q));
        const hasBatchMatch = (patient.batch_no || '').toLowerCase().includes(q);

        const match = 
          pName.includes(q) || 
          pNik.includes(q) || 
          pPassport.includes(q) || 
          pPhone.includes(q) || 
          bId.includes(q) || 
          hasVaccineMatch ||
          hasBatchMatch;

        if (!match) return false;
      }

      return true;
    });

    // Urutan: Default sama persis dengan urutan buku register Excel (No. 1 s/d 246)
    if (registerSortOrder === 'excel') {
      list.sort((a: any, b: any) => {
        const noA = typeof a.reg_no === 'number' ? a.reg_no : 999999;
        const noB = typeof b.reg_no === 'number' ? b.reg_no : 999999;
        if (noA !== noB) return noA - noB;
        return (a.date || '').localeCompare(b.date || '');
      });
    } else {
      // Paling baru lebih dulu
      list.sort((a: any, b: any) => {
        return (b.date || '').localeCompare(a.date || '');
      });
    }

    return list;
  }, [bookings, vaccines, registerSubSheet, registerSortOrder, selectedMonth, selectedYear, selectedStatus, searchQuery]);

  // Statistics counters for Register
  const stats = useMemo(() => {
    const total = bookings.length;
    const verified = bookings.filter(b => b.status === 'terverifikasi').length;
    const pending = bookings.filter(b => b.status === 'menunggu').length;

    // Total pendaftar berhak E-ICV yang diterbitkan baru (246 - 3 orang sudah memiliki E-ICV sebelumnya = 243)
    const eicvNewlyIssuedList = bookings.filter(b => isBookingEligibleForEicv(b) && !hasAlreadyIcv(b));
    const completedEicvTotal = eicvNewlyIssuedList.filter(b => b.status === 'selesai').length; // 243

    // Total sertifikat ICV dari Laporan Harian (APIIK BKK Bandung)
    const totalIcvFromReports = dailyReports.reduce((s, r) => s + (r.icv_issued || 0), 0);

    // Hitung selesai berdasarkan sheet aktif:
    // Pada sheet 'influenza': bernilai 0 (karena influenza tidak menerima blangko E-ICV)
    // Pada sheet 'eicv' atau 'all': bernilai 243 (sinkron persis dengan 243 ICV di laporan harian)
    let displayCompleted = completedEicvTotal;
    if (registerSubSheet === 'influenza') {
      displayCompleted = 0;
    }

    return { 
      total, 
      verified, 
      completed: displayCompleted, 
      pending,
      totalEicvBookings: completedEicvTotal,
      totalIcvReports: totalIcvFromReports
    };
  }, [bookings, dailyReports, registerSubSheet]);

  // Filter Daily Reports based on time range
  const filteredDailyReports = useMemo(() => {
    let list = dailyReports.slice();

    // Preset filter
    const now = new Date();
    if (reportTimePreset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      list = list.filter(r => r.date === todayStr);
    } else if (reportTimePreset === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      list = list.filter(r => r.date >= sevenDaysAgo);
    } else if (reportTimePreset === 'month') {
      const currentYearMonth = now.toISOString().slice(0, 7);
      list = list.filter(r => r.date.startsWith(currentYearMonth));
    } else if (reportTimePreset === 'year') {
      const currentYear = now.getFullYear().toString();
      list = list.filter(r => r.date.startsWith(currentYear));
    }

    // Custom date range
    if (reportStartDate) {
      list = list.filter(r => r.date >= reportStartDate);
    }
    if (reportEndDate) {
      list = list.filter(r => r.date <= reportEndDate);
    }

    // Vaccine filter
    if (selectedVaccineFilter !== 'all') {
      list = list.filter(r => r.vaccine_id === selectedVaccineFilter);
    }

    return list.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return (b.updated_at || '').localeCompare(a.updated_at || '');
    });
  }, [dailyReports, reportTimePreset, reportStartDate, reportEndDate, selectedVaccineFilter]);

  const paginatedReports = useMemo(() => {
    if (reportsPerPage === 'all') return filteredDailyReports;
    const perPage = Number(reportsPerPage);
    const start = (reportsPage - 1) * perPage;
    return filteredDailyReports.slice(start, start + perPage);
  }, [filteredDailyReports, reportsPage, reportsPerPage]);

  const totalReportPages = useMemo(() => {
    if (reportsPerPage === 'all') return 1;
    return Math.ceil(filteredDailyReports.length / Number(reportsPerPage)) || 1;
  }, [filteredDailyReports, reportsPerPage]);

  // Akumulasi pemakaian dalam rentang waktu yang dipilih
  const usageStats = useMemo(() => {
    // Hitung akurat dari filteredDailyReports (yang sudah terfilter oleh periode waktu & jenis vaksin)
    const totalGunaFromReports = filteredDailyReports.reduce((sum, r) => sum + (r.vaccine_used || 0), 0);
    const totalTerbitFromReports = filteredDailyReports.reduce((sum, r) => sum + (r.icv_issued || 0), 0);

    // Filter mutasi sesuai periode waktu & filter vaksin yang sama
    const now = new Date();
    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, '0');
    const localDay = String(now.getDate()).padStart(2, '0');
    const currentYearMonth = `${localYear}-${localMonth}`;
    const todayStr = `${localYear}-${localMonth}-${localDay}`;

    // Hitung ICV terbit bulan berjalan (sinkron dengan data APIIK: "X bulan ini")
    const icvThisMonth = dailyReports
      .filter(r => {
        if (selectedVaccineFilter !== 'all' && r.vaccine_id !== selectedVaccineFilter) return false;
        return (r.date || '').startsWith(currentYearMonth);
      })
      .reduce((sum, r) => sum + (r.icv_issued || 0), 0);

    // Hitung tren kumulatif bulanan ICV untuk grafik sparkline mini pada kartu Total ICV Terbit
    const monthlyIcvMap = new Map<string, number>();
    filteredDailyReports.forEach(r => {
      const ym = (r.date || '').slice(0, 7);
      if (ym && ym.length === 7) {
        monthlyIcvMap.set(ym, (monthlyIcvMap.get(ym) || 0) + (r.icv_issued || 0));
      }
    });
    const sortedMonths = Array.from(monthlyIcvMap.keys()).sort();
    let runningIcv = 0;
    const icvTrendPoints = sortedMonths.map(ym => {
      runningIcv += monthlyIcvMap.get(ym) || 0;
      return runningIcv;
    });

    const filterMutationByPeriod = (m: StockMutation) => {
      if (selectedVaccineFilter !== 'all' && m.vaccine_id !== selectedVaccineFilter) return false;
      if (reportTimePreset === 'today') {
        if (m.date !== todayStr) return false;
      } else if (reportTimePreset === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (m.date < sevenDaysAgo) return false;
      } else if (reportTimePreset === 'month') {
        if (!m.date.startsWith(currentYearMonth)) return false;
      } else if (reportTimePreset === 'year') {
        const currentYear = String(localYear);
        if (!m.date.startsWith(currentYear)) return false;
      }
      if (reportStartDate && m.date < reportStartDate) return false;
      if (reportEndDate && m.date > reportEndDate) return false;
      return true;
    };

    // Akumulasi per vaksin dari laporan harian pada periode terpilih
    const perVaccine: Record<string, number> = {};
    const targetVaccines = selectedVaccineFilter === 'all'
      ? vaccines
      : vaccines.filter(v => v.id === selectedVaccineFilter);

    targetVaccines.forEach(v => {
      const gunaReps = filteredDailyReports
        .filter(r => r.vaccine_id === v.id)
        .reduce((s, r) => s + (r.vaccine_used || 0), 0);
      perVaccine[v.name] = gunaReps;
    });

    // Total terpakai final selalu konsisten dengan penjumlahan rincian per vaksin
    const effectiveTotalVaksinTerpakai = Object.values(perVaccine).reduce((s, val) => s + val, 0) || totalGunaFromReports;

    // Hitung total penerimaan stok (masuk) pada periode terpilih
    const mutasiMasuk = stockMutations.filter(m => m.type === 'masuk' && filterMutationByPeriod(m));
    const totalDosisMasuk = mutasiMasuk.reduce((sum, m) => sum + (m.qty || 0), 0);

    return {
      totalVaksinTerpakai: effectiveTotalVaksinTerpakai,
      totalIcvTerbit: totalTerbitFromReports,
      icvThisMonth,
      icvTrendPoints,
      totalDosisMasuk,
      perVaccine
    };
  }, [dailyReports, filteredDailyReports, stockMutations, vaccines, reportTimePreset, reportStartDate, reportEndDate, selectedVaccineFilter]);

  // Export to Excel (Native formatted .xls format with hospital header)
  const handleExportRegisterExcel = () => {
    const title = 'DATA REGISTER PELAYANAN VAKSINASI INTERNASIONAL';
    const subTitle = 'UOBK RSUD AL-MULK KOTA SUKABUMI';
    
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Register Vaksinasi</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          body { font-family: Arial, sans-serif; }
          .header-title { font-size: 16pt; font-weight: bold; text-align: center; }
          .header-subtitle { font-size: 13pt; font-weight: bold; text-align: center; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #333333; padding: 8px; }
          td { border: 1px solid #cccccc; padding: 6px; text-align: left; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="header-title">${title}</div>
        <div class="header-subtitle">${subTitle}</div>
        <p style="text-align: center; font-size: 10pt; color: #555;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal Registrasi</th>
              <th>Nama</th>
              <th>NIK</th>
              <th>Tanggal Lahir</th>
              <th>Jenis Kelamin</th>
              <th>Kebangsaan</th>
              <th>No. Passport</th>
              <th>Jenis Vaksin</th>
              <th>KET</th>
            </tr>
          </thead>
          <tbody>
    `;

    filteredBookings.forEach((b, idx) => {
      const p = b.patient || {};
      const regDate = formatDisplayDate(b.date);
      const name = p.name || p.fullName || p.nama || '-';
      const nik = p.nik ? `="${p.nik}"` : '-';
      const dob = p.dob ? formatDisplayDate(p.dob) : '-';
      const gender = p.gender || '-';
      const nationality = p.nationality || 'INDONESIA';
      const passport = p.passport || p.passportNumber || p.no_passport || '-';
      const vaccineNames = getBookingVaccineNames(b);
      const ket = p.notes || p.ket || '';

      html += `
        <tr>
          <td class="center">${b.reg_no ?? (idx + 1)}</td>
          <td class="center">${regDate}</td>
          <td><b>${name}</b></td>
          <td class="center">${nik}</td>
          <td class="center">${dob}</td>
          <td class="center">${gender}</td>
          <td class="center">${nationality}</td>
          <td class="center">${passport}</td>
          <td>${vaccineNames}</td>
          <td class="center">${ket}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Register_Vaksinasi_RSUD_Al_Mulk_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Buku Register berhasil diunduh dalam format Excel!');
  };

  // Export Daily Reports to Excel
  const handleExportDailyReportsExcel = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; }
          .title { font-size: 15pt; font-weight: bold; text-align: center; }
          .subtitle { font-size: 12pt; font-weight: bold; text-align: center; }
          table { border-collapse: collapse; width: 100%; margin-top: 15px; }
          th { background-color: #065f46; color: #ffffff; font-weight: bold; border: 1px solid #333; padding: 8px; }
          td { border: 1px solid #ddd; padding: 6px; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="title">LAPORAN HARIAN PENGGUNAAN ICV & PEMAKAIAN VAKSIN</div>
        <div class="subtitle">UOBK RSUD AL-MULK KOTA SUKABUMI</div>
        <p style="text-align: center; font-size: 10pt;">Periode: ${reportStartDate || 'Awal'} s/d ${reportEndDate || 'Sekarang'}</p>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal Pelaporan</th>
              <th>Terakhir Diperbarui</th>
              <th>Klinik/RS</th>
              <th>Jenis Vaksin</th>
              <th>Terbit ICV</th>
              <th>Guna Vaksin</th>
              <th>Sisa ICV</th>
              <th>Sisa Vaksin</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
    `;

    filteredDailyReports.forEach((r, idx) => {
      html += `
        <tr>
          <td class="center">${idx + 1}</td>
          <td class="center">${r.date}</td>
          <td class="center">${r.updated_at}</td>
          <td class="center">${r.clinic}</td>
          <td><b>${r.vaccine_name}</b></td>
          <td class="center">${r.icv_issued}</td>
          <td class="center"><b>${r.vaccine_used}</b></td>
          <td class="center">${r.icv_remaining}</td>
          <td class="center"><b>${r.vaccine_remaining}</b></td>
          <td>${r.notes || '-'}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Harian_ICV_RSUD_Al_Mulk_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Laporan harian berhasil diunduh dalam format Excel!');
  };

  // Submit Penambahan / Pengeluaran Stok
  const handleStockMutationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetVac = vaccines.find(v => v.id === stockForm.vaccine_id);
    if (!targetVac) return;

    try {
      const res = await addStockMutation({
        vaccine_id: stockForm.vaccine_id,
        type: stockModalType,
        qty: Number(stockForm.qty) || 0,
        batch_no: stockForm.batch_no || '-',
        source_or_purpose: stockForm.source_or_purpose || (stockModalType === 'masuk' ? 'Penerimaan Stok Baru' : 'Pemakaian / Penyesuaian'),
        notes: stockForm.notes,
        icv_qty: Number(stockForm.icv_qty) || 0,
        date: stockForm.date,
        officer: 'Staf Farmasi RSUD Al-Mulk'
      });

      if (res.success) {
        showToast(
          stockModalType === 'masuk' 
            ? `Berhasil menambahkan ${stockForm.qty} dosis ${targetVac.name} ke stok!`
            : `Mutasi pengeluaran ${stockForm.qty} dosis ${targetVac.name} berhasil dicatat!`
        );
        setIsStockModalOpen(false);
        setStockForm({
          vaccine_id: 'v1',
          qty: 10,
          batch_no: '',
          source_or_purpose: '',
          notes: '',
          icv_qty: 0,
          date: new Date().toISOString().split('T')[0]
        });
      } else {
        alert(res.error || 'Gagal menyimpan mutasi stok');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem');
    }
  };

  // Submit / Update Daily Report
  const handleDailyReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDailyReport) return;

    try {
      const res = await addDailyReport({
        ...editingDailyReport,
        updated_at: new Date().toLocaleString('id-ID')
      });

      if (res.success) {
        showToast('Laporan harian berhasil disimpan!');
        setIsDailyReportModalOpen(false);
        setEditingDailyReport(null);
      } else {
        alert(res.error || 'Gagal menyimpan laporan harian');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    }
  };

  // Data terfilter untuk Sheet 3: Rekapan Petugas Vaksinasi
  const filteredBookingsForPetugas = useMemo(() => {
    let list = [...bookings];
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentYearMonth = todayStr.slice(0, 7);

    if (petugasFilterPreset === 'today') {
      list = list.filter(b => {
        const bd = b.date ? b.date.slice(0, 10) : '';
        return bd === todayStr;
      });
    } else if (petugasFilterPreset === 'this_month') {
      list = list.filter(b => {
        const bd = b.date ? b.date.slice(0, 7) : '';
        return bd === currentYearMonth;
      });
    } else if (petugasFilterPreset === 'custom' && petugasCustomDate) {
      list = list.filter(b => {
        const bd = b.date ? b.date.slice(0, 10) : '';
        return bd === petugasCustomDate;
      });
    }

    if (petugasSearchQuery.trim()) {
      const q = petugasSearchQuery.toLowerCase().trim();
      list = list.filter(b => {
        const p = b.patient || {};
        const pName = (p.name || p.fullName || '').toLowerCase();
        const pNik = (p.nik || '').toLowerCase();
        const docName = (b.doctor_name || '').toLowerCase();
        const vacName = (b.vaccinator_name || '').toLowerCase();
        const admName = (b.admin_officer_name || '').toLowerCase();
        return pName.includes(q) || pNik.includes(q) || docName.includes(q) || vacName.includes(q) || admName.includes(q);
      });
    }

    return list;
  }, [bookings, petugasFilterPreset, petugasCustomDate, petugasSearchQuery]);

  // Statistik Jasa Pelayanan Petugas
  const petugasStats = useMemo(() => {
    const totalServed = filteredBookingsForPetugas.length;

    const docCounts: Record<string, number> = {
      'D00057': 0,
      'D00179': 0
    };
    const vacCounts: Record<string, number> = {
      'Adi Tresa Purnama, A.M.Kep': 0,
      'Rany Nelvia Hermawati, Amd.Kep': 0
    };
    const admCounts: Record<string, number> = {
      'Ina Nuraeni, S.AP': 0,
      'Yussy Alfiani Rachman, S.T': 0,
      'Giandeno Arianda, S.K.M': 0,
      'Rafiul Qomar, S.Sos': 0
    };

    filteredBookingsForPetugas.forEach(b => {
      const dCode = b.doctor_code || (b.doctor_name?.includes('Chrysman') ? 'D00179' : 'D00057');
      if (docCounts[dCode] !== undefined) {
        docCounts[dCode]++;
      } else {
        docCounts['D00057']++;
      }

      const vName = b.vaccinator_name || 'Adi Tresa Purnama, A.M.Kep';
      if (vName.includes('Rany')) {
        vacCounts['Rany Nelvia Hermawati, Amd.Kep']++;
      } else {
        vacCounts['Adi Tresa Purnama, A.M.Kep']++;
      }

      const aName = b.admin_officer_name || 'Ina Nuraeni, S.AP';
      if (aName.includes('Yussy')) {
        admCounts['Yussy Alfiani Rachman, S.T']++;
      } else if (aName.includes('Giandeno')) {
        admCounts['Giandeno Arianda, S.K.M']++;
      } else if (aName.includes('Rafiul')) {
        admCounts['Rafiul Qomar, S.Sos']++;
      } else {
        admCounts['Ina Nuraeni, S.AP']++;
      }
    });

    return { totalServed, docCounts, vacCounts, admCounts };
  }, [filteredBookingsForPetugas]);

  // Export Rekapan Petugas ke Excel
  const handleExportPetugasExcel = () => {
    const total = petugasStats.totalServed || 1;
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; }
          .title { font-size: 14pt; font-weight: bold; text-align: center; color: #1e3a8a; }
          .subtitle { font-size: 11pt; font-weight: bold; text-align: center; }
          .section-title { font-size: 11pt; font-weight: bold; margin-top: 15px; margin-bottom: 5px; color: #0f172a; }
          table { border-collapse: collapse; width: 100%; margin-top: 5px; margin-bottom: 15px; }
          th { background-color: #3b82f6; color: #ffffff; font-weight: bold; border: 1px solid #333; padding: 6px; }
          .th-green { background-color: #10b981; color: #ffffff; }
          .th-purple { background-color: #8b5cf6; color: #ffffff; }
          td { border: 1px solid #ddd; padding: 5px; font-size: 10pt; }
          .center { text-align: center; }
          .right { text-align: right; }
          .total-row { font-weight: bold; background-color: #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="title">REKAPITULASI JASA PELAYANAN & PETUGAS POLI VAKSINASI INTERNASIONAL</div>
        <div class="subtitle">UOBK RSUD AL-MULK KOTA SUKABUMI</div>
        <p style="text-align: center; font-size: 9.5pt;">Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')} • Total Pasien Dilayani: ${petugasStats.totalServed} Pasien</p>

        <!-- 1. DOKTER PEMERIKSA -->
        <div class="section-title">1. REKAPITULASI DOKTER PEMERIKSA POLI VAKSINASI</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">No</th>
              <th style="width: 100px;">Kode Dokter</th>
              <th>Nama Dokter Pemeriksa</th>
              <th>Tugas / Peran</th>
              <th style="width: 120px;">Jumlah Layanan</th>
              <th style="width: 90px;">Kontribusi (%)</th>
            </tr>
          </thead>
          <tbody>
            ${AVAILABLE_DOCTORS.map((d, i) => {
              const count = petugasStats.docCounts[d.kd_dokter] || 0;
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
              return `
                <tr>
                  <td class="center">${i + 1}</td>
                  <td class="center"><b>${d.kd_dokter}</b></td>
                  <td><b>${d.nm_dokter}</b></td>
                  <td>${d.spesialisasi}</td>
                  <td class="center font-bold">${count} Pasien</td>
                  <td class="center">${pct}%</td>
                </tr>
              `;
            }).join('')}
            <tr class="total-row">
              <td colspan="4" class="right"><b>TOTAL DOKTER PEMERIKSA</b></td>
              <td class="center"><b>${petugasStats.totalServed} Pasien</b></td>
              <td class="center"><b>100%</b></td>
            </tr>
          </tbody>
        </table>

        <!-- 2. PERAWAT VAKSINATOR -->
        <div class="section-title">2. REKAPITULASI PERAWAT VAKSINATOR</div>
        <table>
          <thead>
            <tr>
              <th class="th-green" style="width: 40px;">No</th>
              <th class="th-green" style="width: 100px;">NIP / ID</th>
              <th class="th-green">Nama Perawat Vaksinator</th>
              <th class="th-green">Tugas / Peran</th>
              <th class="th-green" style="width: 120px;">Jumlah Tindakan</th>
              <th class="th-green" style="width: 90px;">Kontribusi (%)</th>
            </tr>
          </thead>
          <tbody>
            ${AVAILABLE_VACCINATORS.map((v, i) => {
              const count = petugasStats.vacCounts[v.nama] || 0;
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
              return `
                <tr>
                  <td class="center">${i + 1}</td>
                  <td class="center"><b>${v.nip}</b></td>
                  <td><b>${v.nama}</b></td>
                  <td>${v.peran}</td>
                  <td class="center font-bold">${count} Tindakan</td>
                  <td class="center">${pct}%</td>
                </tr>
              `;
            }).join('')}
            <tr class="total-row">
              <td colspan="4" class="right"><b>TOTAL TINDAKAN VAKSINATOR</b></td>
              <td class="center"><b>${petugasStats.totalServed} Tindakan</b></td>
              <td class="center"><b>100%</b></td>
            </tr>
          </tbody>
        </table>

        <!-- 3. PETUGAS ADMINISTRASI -->
        <div class="section-title">3. REKAPITULASI PETUGAS ADMINISTRASI</div>
        <table>
          <thead>
            <tr>
              <th class="th-purple" style="width: 40px;">No</th>
              <th class="th-purple" style="width: 100px;">NIP / ID</th>
              <th class="th-purple">Nama Petugas Administrasi</th>
              <th class="th-purple">Tugas / Peran</th>
              <th class="th-purple" style="width: 120px;">Jumlah Registrasi</th>
              <th class="th-purple" style="width: 90px;">Kontribusi (%)</th>
            </tr>
          </thead>
          <tbody>
            ${AVAILABLE_ADMIN_OFFICERS.map((a, i) => {
              const count = petugasStats.admCounts[a.nama] || 0;
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
              return `
                <tr>
                  <td class="center">${i + 1}</td>
                  <td class="center"><b>${a.nip}</b></td>
                  <td><b>${a.nama}</b></td>
                  <td>${a.peran}</td>
                  <td class="center font-bold">${count} Berkas</td>
                  <td class="center">${pct}%</td>
                </tr>
              `;
            }).join('')}
            <tr class="total-row">
              <td colspan="4" class="right"><b>TOTAL BERKAS ADMINISTRASI</b></td>
              <td class="center"><b>${petugasStats.totalServed} Berkas</b></td>
              <td class="center"><b>100%</b></td>
            </tr>
          </tbody>
        </table>

        <!-- 4. RINCIAN PASIEN -->
        <div class="section-title">4. RINCIAN DETAIL PELAYANAN PASIEN & PETUGAS</div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>No. Rawat SIMRS</th>
              <th>Nama Pasien</th>
              <th>NIK</th>
              <th>Vaksin Diberikan</th>
              <th>Dokter Pemeriksa</th>
              <th>Perawat Vaksinator</th>
              <th>Petugas Administrasi</th>
            </tr>
          </thead>
          <tbody>
            ${filteredBookingsForPetugas.map((b, i) => {
              const p = b.patient || {};
              const dObj = AVAILABLE_DOCTORS.find(d => d.kd_dokter === b.doctor_code) || AVAILABLE_DOCTORS[0];
              const vObj = AVAILABLE_VACCINATORS.find(v => v.nama === b.vaccinator_name) || AVAILABLE_VACCINATORS[0];
              const aObj = AVAILABLE_ADMIN_OFFICERS.find(a => a.nama === b.admin_officer_name) || AVAILABLE_ADMIN_OFFICERS[0];
              const vNames = getBookingVaccineNames(b);
              return `
                <tr>
                  <td class="center">${i + 1}</td>
                  <td class="center">${formatDisplayDate(b.date)}</td>
                  <td class="center">${b.simrs_no_rawat || '-'}</td>
                  <td><b>${p.name || p.fullName || 'Peserta'}</b></td>
                  <td class="center">${p.nik || '-'}</td>
                  <td>${vNames}</td>
                  <td>${b.doctor_name || dObj.nm_dokter}</td>
                  <td>${b.vaccinator_name || vObj.nama}</td>
                  <td>${b.admin_officer_name || aObj.nama}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekapan_Petugas_Vaksinasi_RSUD_Al_Mulk_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Rekapan Petugas Vaksinasi berhasil diunduh dalam format Excel!');
  };

  return (
    <div className="bg-slate-50 min-h-screen relative w-full h-full font-sans pb-28">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[10000] bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-3 text-xs sm:text-sm font-bold"
          >
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/60 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl border border-slate-200 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Kembali ke Beranda"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Riwayat & Data Pendaftar
                </h1>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Terhubung Realtime"></span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                UOBK RSUD AL-MULK KOTA SUKABUMI • Register Vaksinasi Internasional & Kontrol Stok
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* UTAMA: SHEET MENU NAVIGATION (TAB ATAS)                               */}
        {/* ==================================================================== */}
        <div className="bg-white p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveSheet('register')}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-[13px] font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeSheet === 'register'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet size={16} />
              <span>Register Pelayanan Vaksin</span>
            </button>

            <button
              onClick={() => setActiveSheet('laporan_harian')}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-[13px] font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeSheet === 'laporan_harian'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Activity size={16} />
              <span>Laporan Harian & Pemakaian Vaksin</span>
            </button>

            <button
              onClick={() => setActiveSheet('rekapan_petugas')}
              className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-[13px] font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeSheet === 'rekapan_petugas'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserCheck size={16} />
              <span>Rekap Petugas Vaksinasi</span>
            </button>
          </div>

          <div className="flex items-center shrink-0 pr-1 pl-2">
            {activeSheet === 'register' ? (
              <button
                onClick={handleExportRegisterExcel}
                className="p-2 sm:p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 hover:text-emerald-900 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0"
                title="Unduh Register Pelayanan Vaksin (Excel)"
              >
                <Download size={17} />
              </button>
            ) : activeSheet === 'laporan_harian' ? (
              <button
                onClick={handleExportDailyReportsExcel}
                className="p-2 sm:p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 hover:text-emerald-900 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0"
                title="Unduh Laporan Harian (Excel)"
              >
                <Download size={17} />
              </button>
            ) : (
              <button
                onClick={handleExportPetugasExcel}
                className="p-2 sm:p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 hover:text-emerald-900 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0"
                title="Unduh Rekap Petugas Vaksinasi (Excel)"
              >
                <Download size={17} />
              </button>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SHEET 1: REGISTER PELAYANAN VAKSINASI (FORMAT GAMBAR 2)              */}
        {/* ==================================================================== */}
        {activeSheet === 'register' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            
            {/* Top KPI Statistics Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pendaftar</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Semua periode register</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Users size={22} />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Terverifikasi</p>
                  <h3 className="text-2xl font-black text-blue-600 mt-0.5">{stats.verified}</h3>
                  <p className="text-[10px] text-blue-500 font-semibold mt-0.5">Siap disuntik</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {registerSubSheet === 'influenza' ? 'E-ICV Influenza' : 'Selesai E-ICV'}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <h3 className="text-2xl font-black text-emerald-600">{stats.completed}</h3>
                    <span className="text-xs font-bold text-slate-400">
                      {registerSubSheet === 'influenza' ? 'Sertifikat' : 'ICV'}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    {registerSubSheet === 'influenza' 
                      ? 'Khusus Influenza (Tanpa E-ICV)' 
                      : `Sinkron Laporan Harian (${stats.totalIcvReports} ICV)`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Award size={22} />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Menunggu</p>
                  <h3 className="text-2xl font-black text-amber-500 mt-0.5">{stats.pending}</h3>
                  <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Menunggu proses</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                  <Clock size={22} />
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama peserta, NIK, No. Passport, atau jenis vaksin..."
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-10 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      {MONTH_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y.value} value={y.value}>{y.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="all">Semua Status</option>
                      <option value="menunggu">Menunggu</option>
                      <option value="terverifikasi">Terverifikasi</option>
                      <option value="ditunda">Ditunda</option>
                      <option value="selesai">Selesai</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tab Navigasi Kategori Vaksin (tanpa kata Sheet) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl flex-wrap">
                  <button
                    onClick={() => setRegisterSubSheet('eicv')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      registerSubSheet === 'eicv' 
                        ? 'bg-blue-600 text-white shadow-xs font-black' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Vaksin Internasional (E-ICV) ({subSheetCounts.eicv})
                  </button>
                  <button
                    onClick={() => setRegisterSubSheet('influenza')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      registerSubSheet === 'influenza' 
                        ? 'bg-teal-600 text-white shadow-xs font-black' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Vaksin Influenza (Non E-ICV) ({subSheetCounts.influenza})
                  </button>
                  <button
                    onClick={() => setRegisterSubSheet('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      registerSubSheet === 'all' 
                        ? 'bg-white text-blue-700 shadow-xs font-black' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Semua ({subSheetCounts.all})
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Urutan Sesuai Excel / Terbaru */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider px-1">Urutan:</span>
                    <button
                      onClick={() => setRegisterSortOrder('excel')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        registerSortOrder === 'excel'
                          ? 'bg-white text-blue-700 shadow-xs font-black'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Urutan sama persis dengan baris buku register Excel (No. 1 s/d 246)"
                    >
                      Buku Register (1 - 246)
                    </button>
                    <button
                      onClick={() => setRegisterSortOrder('newest')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        registerSortOrder === 'newest'
                          ? 'bg-white text-blue-700 shadow-xs font-black'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Pendaftaran terbaru lebih dulu"
                    >
                      Terbaru
                    </button>
                  </div>

                  <div className="text-xs font-bold text-slate-500">
                    Menampilkan: <span className="text-slate-900 font-black">{filteredBookings.length} Peserta</span>
                  </div>
                </div>
              </div>
            </div>

            {/* REGISTER TABLE (PERSIS GAMBAR NO 2) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden font-['Poppins',sans-serif]">
              {/* Header Box Banner (Rata Tengah Sempurna) */}
              <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-4 text-white text-center flex flex-col items-center justify-center">
                <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase text-center w-full">
                  {registerSubSheet === 'influenza' 
                    ? 'DATA REGISTER PELAYANAN VAKSINASI INFLUENZA' 
                    : 'DATA REGISTER PELAYANAN VAKSINASI INTERNASIONAL'}
                </h2>
                <p className="text-xs text-blue-200 font-medium mt-0.5 text-center w-full">
                  UOBK RSUD AL-MULK KOTA SUKABUMI
                </p>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-16 p-4 space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                    <Calendar size={28} />
                  </div>
                  <h3 className="text-base font-black text-slate-800">Tidak Ditemukan Data Peserta</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Data peserta yang cocok dengan filter atau kata kunci belum ada. Silakan reset filter atau lakukan booking pendaftaran baru.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse font-['Poppins',sans-serif] text-[11px] leading-snug">
                    <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase text-[10.5px] border-b border-slate-200 tracking-tight">
                      <tr>
                        <th className="py-2.5 px-2 text-center border-r border-slate-200 w-9">No</th>
                        <th className="py-2.5 px-2 text-center border-r border-slate-200 whitespace-nowrap">Tanggal Registrasi</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-200 text-center">Nama</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">NIK</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">Tanggal Lahir</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">Jenis Kelamin</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">Kebangsaan</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">No. Passport</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-200 text-center">Jenis Vaksin</th>
                        <th className="py-2.5 px-2 text-center w-24 whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                      {filteredBookings.map((booking, index) => {
                        const patient = booking.patient || {};
                        const patientName = patient.name || patient.fullName || patient.nama || 'Peserta';
                        const patientNik = patient.nik || '-';
                        const patientDob = patient.dob ? formatDisplayDate(patient.dob) : '-';
                        const patientGender = patient.gender || '-';
                        const isFemale = patientGender.toLowerCase().includes('female') || 
                                         patientGender.toLowerCase().includes('perempuan') || 
                                         patientGender.toLowerCase() === 'p' || 
                                         patientGender.toLowerCase() === 'f';
                        const displayGender = isFemale ? 'Perempuan' : 'Laki-laki';
                        const rawNat = patient.nationality || patient.kebangsaan || 'INDONESIA';
                        const patientNat = rawNat === '-' ? '-' : rawNat.toUpperCase();
                        const patientPassport = patient.passport || patient.passportNumber || patient.no_passport || '-';
                        const hasEicv = Boolean(patient.e_icv_url);
                        const vaxs = getBookingVaccines(booking);

                        return (
                          <tr 
                            key={booking.id}
                            className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                          >
                            <td className="py-2.5 px-2 text-center font-bold text-slate-500 border-r border-slate-100">
                              {booking.reg_no ?? (index + 1)}
                            </td>
                            <td className="py-2.5 px-2 text-center font-medium text-slate-700 border-r border-slate-100 whitespace-nowrap">
                              {formatDisplayDate(booking.date)}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-100 text-left">
                              <span className="font-bold text-slate-900 uppercase tracking-tight text-left block">
                                {patientName}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-medium text-slate-700 border-r border-slate-100 whitespace-nowrap">
                              {patientNik}
                            </td>
                            <td className="py-2.5 px-2 text-center font-medium text-slate-600 border-r border-slate-100 whitespace-nowrap">
                              {patientDob}
                            </td>
                            <td className="py-2.5 px-2 text-center border-r border-slate-100 whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isFemale
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {displayGender}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-medium text-slate-700 border-r border-slate-100 whitespace-nowrap font-mono tracking-tight">
                              {patientNat}
                            </td>
                            <td className="py-2.5 px-2 text-center font-bold text-blue-700 border-r border-slate-100 whitespace-nowrap">
                              {patientPassport}
                            </td>
                            <td className="py-2.5 px-2.5 border-r border-slate-100 text-center">
                              <div className="flex flex-wrap items-center justify-center gap-1">
                                {vaxs.map((v, i) => (
                                  <span key={v.id || i} className="inline-block bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                                    {formatVaccineDisplay(v.name)}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Tombol Lihat Detail (Warna Icon Sesuai Status) */}
                                <button
                                  onClick={() => setSelectedBookingDetail(booking)}
                                  className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center hover:bg-slate-100 ${
                                    booking.status === 'selesai'
                                      ? 'text-emerald-500 hover:text-emerald-600'
                                      : booking.status === 'ditunda' || booking.status === 'tunda'
                                        ? 'text-amber-500 hover:text-amber-600'
                                        : booking.status === 'belum_terverifikasi' || booking.status === 'belum terverifikasi' || booking.status === 'batal'
                                          ? 'text-rose-500 hover:text-rose-600'
                                          : booking.status === 'terverifikasi'
                                            ? 'text-blue-600 hover:text-blue-700'
                                            : 'text-slate-400 hover:text-slate-600'
                                  }`}
                                  title={
                                    booking.status === 'selesai'
                                      ? 'Lihat Detail (Status: Selesai - Hijau)'
                                      : booking.status === 'ditunda' || booking.status === 'tunda'
                                        ? 'Lihat Detail (Status: Di Tunda - Kuning)'
                                        : booking.status === 'belum_terverifikasi' || booking.status === 'belum terverifikasi' || booking.status === 'batal'
                                          ? 'Lihat Detail (Status: Belum Terverifikasi - Merah)'
                                          : booking.status === 'terverifikasi'
                                            ? 'Lihat Detail (Status: Terverifikasi - Biru)'
                                            : 'Lihat Detail (Status: Menunggu - Abu-abu)'
                                  }
                                >
                                  <Eye size={15} />
                                </button>

                                {/* Tombol Kirim / Daftar SIMRS (Icon Saja Tanpa Card) */}
                                {booking.status === 'ditunda' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSyncToSimrs(booking, true);
                                    }}
                                    disabled={isSyncingSimrs === booking.id}
                                    className="p-1.5 rounded-lg text-teal-600 hover:text-teal-700 hover:bg-teal-50 cursor-pointer transition-all flex items-center justify-center disabled:opacity-50"
                                    title="Daftar Ulang Pasien ke SIMRS Hari Ini (Mendapatkan Nomor Antrean & Rawat Baru)"
                                  >
                                    <Building2 size={15} className={isSyncingSimrs === booking.id ? 'animate-spin' : ''} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSyncToSimrs(booking);
                                    }}
                                    disabled={isSyncingSimrs === booking.id}
                                    className={`p-1.5 rounded-lg cursor-pointer transition-all flex items-center justify-center disabled:opacity-50 ${
                                      booking.simrs_synced
                                        ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                        : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                                    }`}
                                    title={booking.simrs_synced 
                                      ? `Terdaftar di SIMRS (No. Antrean: ${booking.simrs_no_reg || '-'}, No. Rawat: ${booking.simrs_no_rawat || '-'})` 
                                      : 'Kirim Pendaftaran ke Poli Vaksinasi Internasional SIMRS'}
                                  >
                                    <Building2 size={15} className={isSyncingSimrs === booking.id ? 'animate-spin' : ''} />
                                  </button>
                                )}

                                {/* Tombol Tunda Vaksinasi jika belum selesai/ditunda */}
                                {booking.status !== 'selesai' && booking.status !== 'ditunda' && (
                                  <button
                                    onClick={(e) => handleOpenPostponeModal(booking, e)}
                                    className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                    title="Tunda Vaksinasi Pasien & Batalkan Antrean di SIMRS"
                                  >
                                    <Clock size={15} strokeWidth={2.2} />
                                  </button>
                                )}

                                {/* Tombol Kirim Dokumen E-ICV (Icon Saja Tanpa Card) */}
                                {role === 'admin' && (
                                  <button
                                    onClick={() => setEicvModalBooking(booking)}
                                    className={`p-1.5 rounded-lg cursor-pointer transition-all flex items-center justify-center ${
                                      hasEicv 
                                        ? 'text-teal-600 hover:text-teal-700 hover:bg-teal-50' 
                                        : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                                    }`}
                                    title={hasEicv ? 'Dokumen E-ICV sudah terunggah (Klik untuk perbarui)' : 'Kirim / Unggah Dokumen E-ICV PDF'}
                                  >
                                    <Upload size={15} strokeWidth={2.2} />
                                  </button>
                                )}

                                {/* Tombol Hapus Peserta (Icon Saja Tanpa Card) */}
                                {role === 'admin' && (
                                  <button
                                    onClick={(e) => handleDelete(booking, e)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                    title="Hapus Peserta"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SHEET 2: LAPORAN HARIAN & PEMAKAIAN VAKSIN (FORMAT GAMBAR 3)         */}
        {/* ==================================================================== */}
        {activeSheet === 'laporan_harian' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Filter Rentang Waktu (Kurun Waktu Tertentu) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <CalendarRange size={18} className="text-emerald-600" />
                    <span>Filter Kurun Waktu & Rentang Tanggal</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Pilih periode waktu untuk menghitung jumlah pemakaian vaksin dan pelaporan harian ICV
                  </p>
                </div>

                {/* Preset Time Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    onClick={() => { setReportTimePreset('all'); setReportStartDate(''); setReportEndDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reportTimePreset === 'all' && !reportStartDate ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua Waktu
                  </button>
                  <button
                    onClick={() => { setReportTimePreset('today'); setReportStartDate(''); setReportEndDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reportTimePreset === 'today' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={() => { setReportTimePreset('7days'); setReportStartDate(''); setReportEndDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reportTimePreset === '7days' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    7 Hari Terakhir
                  </button>
                  <button
                    onClick={() => { setReportTimePreset('month'); setReportStartDate(''); setReportEndDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reportTimePreset === 'month' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bulan Ini
                  </button>
                  <button
                    onClick={() => { setReportTimePreset('year'); setReportStartDate(''); setReportEndDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reportTimePreset === 'year' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tahun Ini
                  </button>
                </div>
              </div>

              {/* Custom Date Range Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Dari Tanggal:
                  </label>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => { setReportStartDate(e.target.value); setReportTimePreset('all'); }}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Sampai Tanggal:
                  </label>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => { setReportEndDate(e.target.value); setReportTimePreset('all'); }}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Filter Jenis Vaksin:
                  </label>
                  <select
                    value={selectedVaccineFilter}
                    onChange={(e) => setSelectedVaccineFilter(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="all">Semua Jenis Vaksin</option>
                    {vaccines.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* AKUMULASI STATISTIK PEMAKAIAN (KPI CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Vaksin Terpakai */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        Akumulasi Pemakaian
                      </span>
                      <h3 className="text-3xl font-black text-slate-900 mt-2">
                        {usageStats.totalVaksinTerpakai} <span className="text-sm font-bold text-slate-500">Dosis</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Total suntikan vaksin dalam periode ini
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Activity size={22} />
                    </div>
                  </div>

                  {/* Breakdown per vaccine */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    {Object.entries(usageStats.perVaccine).map(([name, count]) => {
                      const isPolio = name.toLowerCase().includes('polio');
                      const polioVials = Math.floor(Number(count) / 5);
                      const polioRem = Number(count) % 5;
                      return (
                        <div key={name} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium truncate">{name}:</span>
                          <div className="text-right">
                            <span className="font-black text-slate-900">{count} Dosis</span>
                            {isPolio && (
                              <span className="text-[10px] text-slate-400 block font-normal">
                                ({polioVials} vial{polioRem > 0 ? ` + ${polioRem} dosis` : ''} • 1 vial = 5 dosis)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                  Sinkron akurat dengan tabel laporan harian & register
                </div>
              </div>

              {/* Total ICV Diterbitkan */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    Sertifikat Terbit
                  </span>
                  <h3 className="text-3xl font-black text-blue-700 mt-2">
                    {usageStats.totalIcvTerbit} <span className="text-sm font-bold text-slate-500">ICV</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    E-ICV internasional selesai diproses
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Status Verifikasi:</span>
                  <span className="text-emerald-700 font-bold">100% Sah Kemenkes</span>
                </div>
              </div>

              {/* Sisa Stok Vaksin Saat Ini */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    Stok Fisik Realtime
                  </span>

                  {/* Total Botol Fisik di Cold Chain */}
                  {(() => {
                    let totalBotolFisik = 0;
                    vaccines.forEach(v => {
                      const isPol = v.id === 'v2' || v.name.toLowerCase().includes('polio');
                      if (isPol) {
                        // 1 vial polio = 5 dosis. Jika 57 dosis -> 11 vial utuh + 1 vial terbuka sisa 2 dosis = 12 botol fisik
                        totalBotolFisik += Math.ceil((v.stock || 0) / 5);
                      } else {
                        totalBotolFisik += (v.stock || 0);
                      }
                    });
                    return (
                      <>
                        <h3 className="text-2xl font-black text-indigo-900 mt-2">
                          {totalBotolFisik} <span className="text-sm font-bold text-slate-500">Botol Vial Fisik</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Sisa fisik di cold chain RSUD Al-Mulk
                        </p>
                      </>
                    );
                  })()}

                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-2">
                    {vaccines.map(v => {
                      const isPol = v.id === 'v2' || v.name.toLowerCase().includes('polio');
                      if (isPol) {
                        const fullVials = Math.floor((v.stock || 0) / 5);
                        const remDoses = (v.stock || 0) % 5;
                        return (
                          <div key={v.id} className="text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-700 font-bold truncate">{v.name}:</span>
                              <span className="font-black text-indigo-700">{v.stock} Dosis</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center justify-between bg-indigo-50/70 px-2 py-1 rounded-lg">
                              <span>Logika Vial (1 vial = 5 org):</span>
                              <span className="font-bold text-indigo-900">
                                {fullVials} vial {remDoses > 0 ? `+ sisa ${remDoses} ds` : 'utuh'}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={v.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 truncate">{v.name}:</span>
                          <span className="font-bold text-indigo-700">{v.stock} Vial</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                  Polio dihitung 5 dosis per vial (57 dosis = 11 vial + 2 dosis)
                </div>
              </div>

              {/* Sisa Stok ICV / E-ICV */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    Stok ICV / E-ICV
                  </span>
                  <h3 className="text-3xl font-black text-amber-600 mt-2">
                    {eicvStock || 18} <span className="text-sm font-bold text-slate-500">ICV / E-ICV</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Sisa ICV dan E-ICV siap cetak
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => { setStockModalType('masuk'); setIsStockModalOpen(true); }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PlusCircle size={13} />
                    <span>+ Stok Masuk</span>
                  </button>
                  <button
                    onClick={() => { setStockModalType('keluar'); setIsStockModalOpen(true); }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    title="Catat Mutasi / Penyesuaian"
                  >
                    Mutasi
                  </button>
                </div>
              </div>
            </div>

            {/* TABEL VIEW: SUB-TAB HARIAN vs RIWAYAT MUTASI */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl self-start">
                  <button
                    onClick={() => setActiveReportSubTab('harian')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeReportSubTab === 'harian' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Laporan Harian Penggunaan ICV ({filteredDailyReports.length})
                  </button>
                  <button
                    onClick={() => setActiveReportSubTab('mutasi')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeReportSubTab === 'mutasi' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Rekap Pemakaian Vaksin ({stockMutations.length})
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeReportSubTab === 'harian' && (
                    <>
                      {/* Live APIIK Badge */}
                      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Live APIIK BKK</span>
                        {lastApiikSyncTime && (
                          <span className="text-slate-500 font-normal">({lastApiikSyncTime})</span>
                        )}
                      </div>

                      {/* Tombol Sinkronkan APIIK */}
                      <button
                        onClick={() => handleSyncApiik(false)}
                        disabled={isSyncingApiik}
                        className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-60"
                        title="Tarik & sinkronkan data laporan penggunaan vaksin terbaru secara langsung dari portal online APIIK BKK Bandung"
                      >
                        <RefreshCw size={13} className={isSyncingApiik ? 'animate-spin' : ''} />
                        <span>{isSyncingApiik ? 'Sinkronisasi APIIK...' : '🔄 Sinkronkan APIIK BKK'}</span>
                      </button>
                    </>
                  )}

                  {activeReportSubTab === 'mutasi' && (
                    <button
                      onClick={() => { setStockModalType('masuk'); setIsStockModalOpen(true); }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <PlusCircle size={14} />
                      <span>+ Tambah Stok Masuk</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 1. SUB-TAB: TABEL LAPORAN HARIAN PENGGUNAAN ICV (PERSIS GAMBAR 3) */}
              {activeReportSubTab === 'harian' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 text-center w-10">
                          <input type="checkbox" className="rounded text-emerald-600" aria-label="Pilih semua baris" />
                        </th>
                        <th className="py-3.5 px-3 whitespace-nowrap">Tanggal Pelaporan</th>
                        <th className="py-3.5 px-3 whitespace-nowrap">Terakhir Diperbarui</th>
                        <th className="py-3.5 px-3 whitespace-nowrap">Klinik/RS</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Jenis Vaksin</th>
                        <th className="py-3.5 px-3 text-center whitespace-nowrap">Terbit ICV</th>
                        <th className="py-3.5 px-3 text-center whitespace-nowrap">Guna Vaksin</th>
                        <th className="py-3.5 px-3 text-center whitespace-nowrap">Sisa ICV</th>
                        <th className="py-3.5 px-3 text-center whitespace-nowrap">Sisa Vaksin</th>
                        <th className="py-3.5 px-4 min-w-[150px]">Catatan</th>
                        <th className="py-3.5 px-3 text-center w-20">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                      {paginatedReports.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-12 text-center text-slate-400">
                            Tidak ada data laporan harian pada rentang waktu ini.
                          </td>
                        </tr>
                      ) : (
                        paginatedReports.map((r, index) => (
                          <tr key={r.id || index} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 text-center">
                              <input type="checkbox" className="rounded text-emerald-600" aria-label={`Pilih laporan ${r.date} ${r.vaccine_name}`} />
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                              {r.date}
                            </td>
                            <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                              {r.updated_at}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-700 whitespace-nowrap">
                              {r.clinic || 'RSUD AL-MULK'}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                              {r.vaccine_name}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-slate-700">
                              {r.icv_issued}
                            </td>
                            <td className="py-3 px-3 text-center font-black text-emerald-700 bg-emerald-50/50">
                              {r.vaccine_used}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-amber-700">
                              {r.icv_remaining}
                            </td>
                            <td className="py-3 px-3 text-center font-black text-indigo-700 bg-indigo-50/50 whitespace-nowrap">
                              {(() => {
                                const isPol = (r.vaccine_name || '').toLowerCase().includes('polio') || r.vaccine_id === 'v2';
                                if (isPol) {
                                  const fullV = Math.floor(r.vaccine_remaining / 5);
                                  const remD = r.vaccine_remaining % 5;
                                  return (
                                    <div>
                                      <span>{r.vaccine_remaining} <span className="text-[10px] font-normal text-slate-500">Dosis</span></span>
                                      <div className="text-[10px] font-semibold text-indigo-600">
                                        ({fullV} vial {remD > 0 ? `+ ${remD} ds` : 'utuh'})
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                  <div>
                                    <span>{r.vaccine_remaining} <span className="text-[10px] font-normal text-slate-500">Vial</span></span>
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">
                              {r.notes || '-'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => {
                                  setEditingDailyReport(r);
                                  setIsDailyReportModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 mx-auto cursor-pointer"
                              >
                                <Edit3 size={12} />
                                <span>Ubah</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  {filteredDailyReports.length > 0 && (
                    <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs text-slate-500 font-medium">
                        Menampilkan <span className="font-bold text-slate-800">
                          {reportsPerPage === 'all' ? 1 : (reportsPage - 1) * Number(reportsPerPage) + 1}
                        </span> sampai <span className="font-bold text-slate-800">
                          {reportsPerPage === 'all' ? filteredDailyReports.length : Math.min(reportsPage * Number(reportsPerPage), filteredDailyReports.length)}
                        </span> dari <span className="font-black text-slate-900">{filteredDailyReports.length}</span> laporan
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Per page selector */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                          <span>Per Halaman:</span>
                          <select
                            value={reportsPerPage}
                            onChange={(e) => {
                              setReportsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value));
                              setReportsPage(1);
                            }}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                          >
                            <option value={15}>15</option>
                            <option value={30}>30</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value="all">Semua ({filteredDailyReports.length})</option>
                          </select>
                        </div>

                        {/* Pagination buttons */}
                        {reportsPerPage !== 'all' && totalReportPages > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setReportsPage(p => Math.max(1, p - 1))}
                              disabled={reportsPage <= 1}
                              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                            >
                              Sebelumnya
                            </button>
                            <span className="text-xs font-bold text-slate-600 px-2">
                              {reportsPage} / {totalReportPages}
                            </span>
                            <button
                              onClick={() => setReportsPage(p => Math.min(totalReportPages, p + 1))}
                              disabled={reportsPage >= totalReportPages}
                              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                            >
                              Selanjutnya
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. SUB-TAB: REKAP PEMAKAIAN VAKSIN (PERSIS GAMBAR 3 DENGAN NO, TANGGAL, JENIS MUTASI) */}
              {activeReportSubTab === 'mutasi' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-slate-300">
                    <thead className="bg-slate-50 text-slate-800 font-black text-[11px]">
                      <tr className="border-b border-slate-300">
                        <th rowSpan={3} className="py-3 px-3 text-center align-middle border border-slate-300 w-12 uppercase">
                          No
                        </th>
                        <th rowSpan={3} className="py-3 px-3 text-center align-middle border border-slate-300 whitespace-nowrap uppercase">
                          Tanggal
                        </th>
                        <th rowSpan={3} className="py-3 px-3 text-center align-middle border border-slate-300 whitespace-nowrap uppercase">
                          Jenis Mutasi
                        </th>
                        <th colSpan={6} className="py-2.5 px-4 text-center align-middle border border-slate-300 bg-slate-100/90 text-slate-900 text-xs tracking-wide underline">
                          Vaksin
                        </th>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <th rowSpan={2} className="py-2.5 px-3 text-center align-middle border border-slate-300 w-24">
                          Stok awal
                        </th>
                        <th colSpan={4} className="py-2 px-4 text-center align-middle border border-slate-300 bg-slate-50">
                          Pemakaian Vaksin
                        </th>
                        <th rowSpan={2} className="py-2.5 px-3 text-center align-middle border border-slate-300 w-28">
                          Stok Terakhir Vaksin
                        </th>
                      </tr>
                      <tr className="border-b border-slate-300 bg-slate-50/70">
                        <th className="py-2 px-3 text-center align-middle border border-slate-300 w-20 underline">
                          Jumlah
                        </th>
                        <th className="py-2 px-4 text-center align-middle border border-slate-300 underline">
                          Jenis
                        </th>
                        <th className="py-2 px-4 text-center align-middle border border-slate-300">
                          No. Batch
                        </th>
                        <th className="py-2 px-4 text-center align-middle border border-slate-300">
                          Exp Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-800 font-medium">
                      {stockMutations.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400 border border-slate-300">
                            Belum ada data rekap pemakaian vaksin. Klik "+ Tambah Stok Masuk" untuk mencatat data vaksin.
                          </td>
                        </tr>
                      ) : (
                        stockMutations.map((m, idx) => {
                          const usedQty = Number(m.qty ?? 0);
                          const initialStock = m.initial_stock !== undefined ? Number(m.initial_stock) : usedQty;
                          const finalStock = m.final_stock !== undefined ? Number(m.final_stock) : Math.max(0, initialStock - usedQty);
                          const expDate = m.exp_date || (m.vaccine_name?.toLowerCase().includes('flu') ? 'Mar 2027' : 'Apr 2029');

                          return (
                            <tr key={m.id || idx} className="hover:bg-slate-50/90 transition-colors">
                              <td className="py-3 px-3 text-center text-slate-600 font-bold border border-slate-300">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 text-center font-semibold text-slate-700 whitespace-nowrap border border-slate-300">
                                {m.date}
                              </td>
                              <td className="py-3 px-3 text-center whitespace-nowrap border border-slate-300">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  m.type === 'masuk'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : m.type === 'keluar'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {m.type === 'masuk' && <ArrowDownRight size={12} />}
                                  {m.type === 'keluar' && <ArrowUpRight size={12} />}
                                  {m.type === 'masuk' ? 'STOK MASUK' : m.type === 'keluar' ? 'PENGELUARAN' : 'STOK TETAP'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-slate-900 border border-slate-300">
                                {initialStock}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-slate-900 border border-slate-300">
                                {usedQty}
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-slate-900 border border-slate-300">
                                {m.vaccine_name}
                              </td>
                              <td className="py-3 px-4 text-center font-semibold text-slate-800 border border-slate-300">
                                {m.batch_no || '-'}
                              </td>
                              <td className="py-3 px-4 text-center font-semibold text-slate-800 border border-slate-300 whitespace-nowrap">
                                {expDate}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-slate-900 border border-slate-300">
                                {finalStock}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    {stockMutations.length > 0 && (
                      <tfoot className="bg-slate-100/90 font-black text-slate-900 text-xs">
                        <tr>
                          <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider text-[11px] text-slate-700 border border-slate-300">
                            Total Akumulasi
                          </td>
                          <td className="py-3 px-3 text-center border border-slate-300 text-sm">
                            {stockMutations.reduce((sum, m) => sum + Number(m.initial_stock ?? m.qty ?? 0), 0)}
                          </td>
                          <td className="py-3 px-3 text-center border border-slate-300 text-sm text-rose-700">
                            {stockMutations.reduce((sum, m) => sum + Number(m.qty ?? 0), 0)}
                          </td>
                          <td className="py-3 px-4 border border-slate-300"></td>
                          <td className="py-3 px-4 border border-slate-300"></td>
                          <td className="py-3 px-4 border border-slate-300"></td>
                          <td className="py-3 px-3 text-center border border-slate-300 text-sm text-emerald-800">
                            {stockMutations.reduce((sum, m) => {
                              const used = Number(m.qty ?? 0);
                              const init = m.initial_stock !== undefined ? Number(m.initial_stock) : used;
                              const fin = m.final_stock !== undefined ? Number(m.final_stock) : Math.max(0, init - used);
                              return sum + fin;
                            }, 0)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SHEET 3: REKAPAN PETUGAS VAKSINASI (FORMAT JASA PELAYANAN / JASPEL) */}
        {/* ==================================================================== */}
        {activeSheet === 'rekapan_petugas' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Filter Kurun Waktu & Pencarian Petugas */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <UserCheck size={18} className="text-indigo-600" />
                    <span>Rekapan Petugas Vaksinasi & Penentuan Jasa Pelayanan</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Rekapitulasi beban kerja dan layanan Dokter Pemeriksa, Perawat Vaksinator, dan Petugas Administrasi
                  </p>
                </div>

                {/* Preset Time Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    onClick={() => { setPetugasFilterPreset('all'); setPetugasCustomDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      petugasFilterPreset === 'all'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua Waktu
                  </button>
                  <button
                    onClick={() => { setPetugasFilterPreset('today'); setPetugasCustomDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      petugasFilterPreset === 'today'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={() => { setPetugasFilterPreset('this_month'); setPetugasCustomDate(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      petugasFilterPreset === 'this_month'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bulan Ini
                  </button>
                  <button
                    onClick={() => setPetugasFilterPreset('custom')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      petugasFilterPreset === 'custom'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pilih Tanggal
                  </button>
                </div>
              </div>

              {/* Custom Date Input & Search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                {petugasFilterPreset === 'custom' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Pilih Tanggal Pelayanan</label>
                    <input
                      type="date"
                      value={petugasCustomDate}
                      onChange={(e) => setPetugasCustomDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 outline-none"
                    />
                  </div>
                )}
                <div className={petugasFilterPreset === 'custom' ? 'sm:col-span-1 lg:col-span-2' : 'sm:col-span-2 lg:col-span-3'}>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Pencarian Cepat</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama pasien, NIK, dokter pemeriksa, vaksinator, atau petugas admin..."
                      value={petugasSearchQuery}
                      onChange={(e) => setPetugasSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top KPI Cards Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pasien Terlayani</p>
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Users size={18} />
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-2">{petugasStats.totalServed}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Sesuai filter periode aktif</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">dr. M. Arifin Ramadhani</p>
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Stethoscope size={18} />
                  </span>
                </div>
                <h3 className="text-2xl font-black text-blue-600 mt-2">{petugasStats.docCounts['D00057']} <span className="text-xs font-semibold text-slate-500">pasien</span></h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Dokter Pemeriksa Poli (D00057)</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">dr. Chrysman Andreria</p>
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Stethoscope size={18} />
                  </span>
                </div>
                <h3 className="text-2xl font-black text-blue-600 mt-2">{petugasStats.docCounts['D00179']} <span className="text-xs font-semibold text-slate-500">pasien</span></h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Dokter Pemeriksa Poli (D00179)</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tindakan Vaksinator</p>
                  <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Syringe size={18} />
                  </span>
                </div>
                <div className="mt-2 text-xs font-bold text-slate-800 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="truncate pr-1">Adi Tresa:</span>
                    <span className="text-emerald-700 font-black">{petugasStats.vacCounts['Adi Tresa Purnama, A.M.Kep']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="truncate pr-1">Rany Nelvia:</span>
                    <span className="text-emerald-700 font-black">{petugasStats.vacCounts['Rany Nelvia Hermawati, Amd.Kep']}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TABEL 1 & 2: REKAP DOKTER & PERAWAT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rekap Dokter */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Stethoscope size={16} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">1. Dokter Pemeriksa Poli MCU</h4>
                      <p className="text-[10px] text-slate-400">Jasa Pelayanan Medis Pemeriksaan</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-lg">
                    {petugasStats.totalServed} Layanan
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2 px-2 text-center w-8">No</th>
                        <th className="py-2 px-2 text-center">Kode</th>
                        <th className="py-2 px-3">Nama Dokter</th>
                        <th className="py-2 px-2 text-center">Jml Pasien</th>
                        <th className="py-2 px-2 text-center">Kontribusi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {AVAILABLE_DOCTORS.map((d, i) => {
                        const count = petugasStats.docCounts[d.kd_dokter] || 0;
                        const pct = petugasStats.totalServed > 0 
                          ? ((count / petugasStats.totalServed) * 100).toFixed(1) 
                          : '0';
                        return (
                          <tr key={d.kd_dokter} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-2 text-center font-bold text-slate-400">{i + 1}</td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-indigo-700">{d.kd_dokter}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-black text-slate-800 block">{d.nm_dokter}</span>
                              <span className="text-[10px] text-slate-400">{d.spesialisasi}</span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-black text-blue-700">{count}</td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">
                                {pct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rekap Perawat Vaksinator */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Syringe size={16} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">2. Perawat Vaksinator</h4>
                      <p className="text-[10px] text-slate-400">Jasa Pelayanan Tindakan Vaksinasi</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg">
                    {petugasStats.totalServed} Tindakan
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2 px-2 text-center w-8">No</th>
                        <th className="py-2 px-2 text-center">NIP</th>
                        <th className="py-2 px-3">Nama Perawat</th>
                        <th className="py-2 px-2 text-center">Tindakan</th>
                        <th className="py-2 px-2 text-center">Kontribusi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {AVAILABLE_VACCINATORS.map((v, i) => {
                        const count = petugasStats.vacCounts[v.nama] || 0;
                        const pct = petugasStats.totalServed > 0 
                          ? ((count / petugasStats.totalServed) * 100).toFixed(1) 
                          : '0';
                        return (
                          <tr key={v.nip} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-2 text-center font-bold text-slate-400">{i + 1}</td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-700">{v.nip}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-black text-slate-800 block">{v.nama}</span>
                              <span className="text-[10px] text-slate-400">{v.peran}</span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-black text-emerald-700">{count}</td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">
                                {pct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* TABEL 3: REKAP PETUGAS ADMINISTRASI */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">3. Petugas Administrasi & Pendaftaran</h4>
                    <p className="text-[10px] text-slate-400">Jasa Pelayanan Administrasi & Penerbitan Sertifikat</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-black rounded-lg">
                  {petugasStats.totalServed} Berkas
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2 px-2 text-center w-8">No</th>
                      <th className="py-2 px-2 text-center">NIP</th>
                      <th className="py-2 px-4">Nama Petugas Administrasi</th>
                      <th className="py-2 px-3">Tugas / Peran</th>
                      <th className="py-2 px-2 text-center">Jml Registrasi</th>
                      <th className="py-2 px-2 text-center">Kontribusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {AVAILABLE_ADMIN_OFFICERS.map((a, i) => {
                      const count = petugasStats.admCounts[a.nama] || 0;
                      const pct = petugasStats.totalServed > 0 
                        ? ((count / petugasStats.totalServed) * 100).toFixed(1) 
                        : '0';
                      return (
                        <tr key={a.nip} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-2 text-center font-bold text-slate-400">{i + 1}</td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-purple-700">{a.nip}</td>
                          <td className="py-2.5 px-4 font-black text-slate-800">{a.nama}</td>
                          <td className="py-2.5 px-3 text-slate-500">{a.peran}</td>
                          <td className="py-2.5 px-2 text-center font-black text-purple-700">{count}</td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold">
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABEL 4: LOG RINCIAN LENGKAP PELAYANAN PASIEN & PETUGAS */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-indigo-600" />
                    <span>Rincian Buku Log Pelayanan Pasien & Tim Petugas</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Daftar transaksi per peserta beserta dokter, vaksinator, dan admin yang bertugas</p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                  {filteredBookingsForPetugas.length} Pasien
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-3 text-center">No</th>
                      <th className="py-3 px-3 text-center">Tanggal</th>
                      <th className="py-3 px-3">Nama Pasien</th>
                      <th className="py-3 px-3 text-center">NIK</th>
                      <th className="py-3 px-3">Jenis Vaksin</th>
                      <th className="py-3 px-3">Dokter Pemeriksa</th>
                      <th className="py-3 px-3">Perawat Vaksinator</th>
                      <th className="py-3 px-3">Petugas Admin</th>
                      <th className="py-3 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookingsForPetugas.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                          Tidak ada data pendaftaran yang sesuai dengan filter periode ini.
                        </td>
                      </tr>
                    ) : (
                      filteredBookingsForPetugas.map((b, idx) => {
                        const p = b.patient || {};
                        const dCode = b.doctor_code || (b.doctor_name?.includes('Chrysman') ? 'D00179' : 'D00057');
                        const docObj = AVAILABLE_DOCTORS.find(d => d.kd_dokter === dCode) || AVAILABLE_DOCTORS[0];
                        const vacName = b.vaccinator_name || 'Adi Tresa Purnama, A.M.Kep';
                        const admName = b.admin_officer_name || 'Ina Nuraeni, S.AP';
                        const vaxs = getBookingVaccines(b);

                        return (
                          <tr key={b.id || idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap font-medium text-slate-600">
                              {formatDisplayDate(b.date)}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-black text-slate-900 block uppercase">
                                {p.name || p.fullName || 'Peserta'}
                              </span>
                              {b.simrs_no_rawat && (
                                <span className="text-[10px] font-mono text-indigo-600">
                                  Rawat: {b.simrs_no_rawat}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-700 whitespace-nowrap">
                              {p.nik || '-'}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-wrap gap-1">
                                {vaxs.map((v: any, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-bold tracking-wide uppercase">
                                    {formatVaccineDisplay(v.name)}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-lg text-[11px] font-bold inline-block border border-blue-200">
                                {b.doctor_name || docObj.nm_dokter}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-bold inline-block border border-emerald-200">
                                {vacName}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded-lg text-[11px] font-bold inline-block border border-purple-200">
                                {admName}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => setSelectedBookingDetail(b)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                                title="Lihat & Edit Detail Peserta / Petugas"
                              >
                                <Eye size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: TAMBAH / MUTASI STOK VAKSIN                                 */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isStockModalOpen && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
                    stockModalType === 'masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {stockModalType === 'masuk' ? 'Penerimaan Stok Vaksin' : 'Catat Pengeluaran / Penyesuaian'}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    {stockModalType === 'masuk' ? 'Tambah Stok Vaksin Masuk' : 'Catat Mutasi Stok'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Catat riwayat penambahan atau mutasi stok fisik vaksin RSUD Al-Mulk
                  </p>
                </div>
                <button
                  onClick={() => setIsStockModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleStockMutationSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Mutasi</label>
                    <select
                      value={stockModalType}
                      onChange={(e) => setStockModalType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value="masuk">➕ Stok Masuk (Penambahan)</option>
                      <option value="keluar">➖ Pengeluaran / Terpakai</option>
                      <option value="penyesuaian">🔄 Penyesuaian Stok Opname</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
                    <input
                      type="date"
                      value={stockForm.date}
                      onChange={(e) => setStockForm({ ...stockForm, date: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Vaksin</label>
                  <select
                    value={stockForm.vaccine_id}
                    onChange={(e) => setStockForm({ ...stockForm, vaccine_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    {vaccines.map(v => {
                      const isPol = v.id === 'v2' || v.name.toLowerCase().includes('polio');
                      const label = isPol 
                        ? `${v.name} (Sisa: ${v.stock} dosis • ${Math.floor((v.stock || 0) / 5)} vial utuh + ${(v.stock || 0) % 5} ds)`
                        : `${v.name} (Sisa saat ini: ${v.stock} vial)`;
                      return (
                        <option key={v.id} value={v.id}>{label}</option>
                      );
                    })}
                  </select>
                  {stockForm.vaccine_id === 'v2' && (
                    <p className="text-[11px] text-blue-600 font-semibold mt-1">
                      💡 Catatan Khusus Polio: 1 botol vial multi-dose = 5 dosis/orang. Masukkan penambahan/pengurangan dalam satuan dosis.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Dosis / Vial</label>
                    <input
                      type="number"
                      min="1"
                      value={stockForm.qty}
                      onChange={(e) => setStockForm({ ...stockForm, qty: parseInt(e.target.value) || 0 })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Batch (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: MNV-2026-A1"
                      value={stockForm.batch_no}
                      onChange={(e) => setStockForm({ ...stockForm, batch_no: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {stockModalType === 'masuk' ? 'Sumber / Pengirim Vaksin' : 'Tujuan / Alasan Pengeluaran'}
                  </label>
                  <input
                    type="text"
                    placeholder={stockModalType === 'masuk' ? 'Contoh: Dinas Kesehatan Kota Sukabumi / PBF Bio Farma' : 'Contoh: Pelayanan Vaksinasi Massal Umroh'}
                    value={stockForm.source_or_purpose}
                    onChange={(e) => setStockForm({ ...stockForm, source_or_purpose: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  />
                </div>

                {stockModalType === 'masuk' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Penambahan Blangko E-ICV Fisik (Lembar)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockForm.icv_qty}
                      onChange={(e) => setStockForm({ ...stockForm, icv_qty: parseInt(e.target.value) || 0 })}
                      placeholder="0 jika tidak ada penambahan buku ICV"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                  <textarea
                    rows={2}
                    placeholder="Kondisi cold chain, suhu pengiriman, catatan pemeriksaan..."
                    value={stockForm.notes}
                    onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check size={16} />
                    <span>Simpan Mutasi Stok</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStockModalOpen(false)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* MODAL 2: INPUT / EDIT LAPORAN HARIAN ICV (PERSIS GAMBAR 3)            */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isDailyReportModalOpen && editingDailyReport && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-auto"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                    Laporan Harian Penggunaan ICV
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    {editingDailyReport.id ? 'Ubah Laporan Harian' : 'Catat Laporan Hari Ini'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    RSUD AL-MULK • Laporan resmi pemanfaatan vaksin & ICV
                  </p>
                </div>
                <button
                  onClick={() => setIsDailyReportModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleDailyReportSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Pelaporan</label>
                    <input
                      type="date"
                      value={editingDailyReport.date || ''}
                      onChange={(e) => setEditingDailyReport({ ...editingDailyReport, date: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Klinik / RS</label>
                    <input
                      type="text"
                      value={editingDailyReport.clinic || 'RSUD AL-MULK'}
                      onChange={(e) => setEditingDailyReport({ ...editingDailyReport, clinic: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Vaksin</label>
                  <select
                    value={editingDailyReport.vaccine_id || 'v1'}
                    onChange={(e) => {
                      const sel = vaccines.find(v => v.id === e.target.value);
                      setEditingDailyReport({
                        ...editingDailyReport,
                        vaccine_id: e.target.value,
                        vaccine_name: sel?.name || 'Meningitis Polysakarida',
                        vaccine_remaining: sel?.stock || 0
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    {vaccines.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Terbit ICV (Sertifikat)</label>
                    <input
                      type="number"
                      min="0"
                      value={editingDailyReport.icv_issued ?? 0}
                      onChange={(e) => setEditingDailyReport({ ...editingDailyReport, icv_issued: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Guna Vaksin (Dosis)</label>
                    <input
                      type="number"
                      min="0"
                      value={editingDailyReport.vaccine_used ?? 0}
                      onChange={(e) => setEditingDailyReport({ ...editingDailyReport, vaccine_used: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sisa ICV</label>
                    <input
                      type="number"
                      min="0"
                      value={editingDailyReport.icv_remaining ?? 18}
                      onChange={(e) => setEditingDailyReport({ ...editingDailyReport, icv_remaining: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {editingDailyReport.vaccine_id === 'v2' || (editingDailyReport.vaccine_name || '').toLowerCase().includes('polio') 
                        ? 'Sisa Vaksin Polio (Dosis)' 
                        : 'Sisa Vaksin (Vial)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingDailyReport.vaccine_remaining ?? 0}
                      onChange={(e) => setEditingDailyReport({ ...editingDailyReport, vaccine_remaining: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                    {editingDailyReport.vaccine_remaining !== undefined && (editingDailyReport.vaccine_id === 'v2' || (editingDailyReport.vaccine_name || '').toLowerCase().includes('polio')) && (
                      <span className="text-[10px] text-indigo-600 font-semibold block mt-1">
                        Logika Vial: {Math.floor(editingDailyReport.vaccine_remaining / 5)} vial utuh {editingDailyReport.vaccine_remaining % 5 > 0 ? `+ 1 vial terbuka (${editingDailyReport.vaccine_remaining % 5} ds)` : ''} (1 vial = 5 org)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan</label>
                  <input
                    type="text"
                    placeholder="Pelayanan normal, kondisi rantai dingin, dll..."
                    value={editingDailyReport.notes || ''}
                    onChange={(e) => setEditingDailyReport({ ...editingDailyReport, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check size={16} />
                    <span>Simpan Laporan Harian</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDailyReportModalOpen(false)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* MODAL 3: ADMIN KIRIM E-ICV PDF KE PESERTA                             */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {eicvModalBooking && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                    Penerbitan Dokumen E-ICV
                  </span>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    Kirim E-ICV PDF ke Peserta
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {eicvModalBooking.patient?.name || 'Peserta'} • NIK: {eicvModalBooking.patient?.nik || '-'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEicvModalBooking(null);
                    setEicvFile(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSendEicvSubmit} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Upload file sertifikat resmi E-ICV (format PDF) untuk dikirim langsung ke akun peserta. Dokumen ini akan langsung tampil di menu E-ICV milik peserta dan siap diunduh.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih File PDF E-ICV
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setEicvFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                    />
                  </div>

                  {eicvFile && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center justify-between">
                      <span className="truncate">📎 {eicvFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setEicvFile(null)}
                        className="text-emerald-700 hover:text-emerald-900"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {!eicvFile && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-600 shrink-0" />
                      <span>Pilih dokumen PDF sertifikat resmi, maksimal 10 MB.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSendingEicv || !eicvFile}
                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSendingEicv ? (
                      <span>Mengirim Dokumen PDF...</span>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Kirim E-ICV PDF Ke Akun Peserta</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEicvModalBooking(null);
                      setEicvFile(null);
                    }}
                    className="px-5 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* MODAL 4: DETAIL PESERTA LENGKAP & EDIT PETUGAS / IDENTITAS             */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {selectedBookingDetail && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                      Detail Register Peserta
                    </span>
                    {isEditingDetail && (
                      <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                        Mode Edit Aktif
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1 uppercase">
                    {selectedBookingDetail.patient?.name || selectedBookingDetail.patient?.fullName || 'Peserta Terdaftar'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    ID Register: {selectedBookingDetail.id} • Tanggal: {formatDisplayDate(selectedBookingDetail.date)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingDetail(prev => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isEditingDetail
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <Edit3 size={13} />
                    <span>{isEditingDetail ? 'Batal Edit' : 'Edit Peserta'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBookingDetail(null);
                      setIsEditingDetail(false);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* FORM MODE: JIKA ADMIN SEDANG EDIT DATA */}
              {isEditingDetail ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <span>Silakan ubah identitas peserta, dokter pemeriksa, perawat vaksinator, atau petugas administrasi lalu klik <strong>Simpan Perubahan</strong>.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap Sesuai Identitas</label>
                      <input
                        type="text"
                        value={editDetailForm.name}
                        onChange={(e) => setEditDetailForm({ ...editDetailForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor NIK KTP</label>
                      <input
                        type="text"
                        value={editDetailForm.nik}
                        onChange={(e) => setEditDetailForm({ ...editDetailForm, nik: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Passport</label>
                      <input
                        type="text"
                        value={editDetailForm.passport}
                        onChange={(e) => setEditDetailForm({ ...editDetailForm, passport: e.target.value })}
                        placeholder="Contoh: X1234567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={editDetailForm.dob}
                        onChange={(e) => setEditDetailForm({ ...editDetailForm, dob: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                      <select
                        value={editDetailForm.gender}
                        onChange={(e) => setEditDetailForm({ ...editDetailForm, gender: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Kebangsaan</label>
                      <input
                        type="text"
                        value={editDetailForm.nationality}
                        onChange={(e) => setEditDetailForm({ ...editDetailForm, nationality: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">No. WhatsApp / HP</label>
                      <input
                        type="text"
                        value={editDetailForm.phone}
                        onChange={(e) => setEditDetailForm({ ...editDetailForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Pelayanan / Kunjungan</label>
                      <input
                        type="date"
                        value={editDetailForm.date}
                        onChange={(e) => setEditDetailForm({ ...editDetailForm, date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Keperluan / Peruntukan</label>
                      <input
                        type="text"
                        value={editDetailForm.purpose}
                        onChange={(e) => setEditDetailForm({ ...editDetailForm, purpose: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Alamat Domisili Lengkap</label>
                      <textarea
                        rows={2}
                        value={editDetailForm.address}
                        onChange={(e) => setEditDetailForm({ ...editDetailForm, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Section Pemilihan Petugas */}
                  <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-3">
                    <h4 className="font-black text-indigo-950 text-xs flex items-center gap-1.5">
                      <UserCheck size={16} className="text-indigo-600" />
                      <span>Penetapan Tim Petugas Layanan Vaksinasi</span>
                    </h4>

                    <div className="space-y-2.5">
                      {/* 1. Dokter Pemeriksa */}
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1 flex items-center gap-1">
                          <Stethoscope size={13} className="text-blue-600" />
                          <span>Dokter Pemeriksa (Poli MCU Vaksinasi)</span>
                        </label>
                        <select
                          value={editDetailForm.doctor_code}
                          onChange={(e) => {
                            const d = AVAILABLE_DOCTORS.find(doc => doc.kd_dokter === e.target.value);
                            setEditDetailForm({
                              ...editDetailForm,
                              doctor_code: e.target.value,
                              doctor_name: d?.nm_dokter || ''
                            });
                          }}
                          className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 outline-none cursor-pointer"
                        >
                          {AVAILABLE_DOCTORS.map(d => (
                            <option key={d.kd_dokter} value={d.kd_dokter}>
                              {d.nm_dokter} ({d.kd_dokter}) - {d.spesialisasi}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Perawat Vaksinator */}
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1 flex items-center gap-1">
                          <Syringe size={13} className="text-emerald-600" />
                          <span>Perawat Vaksinator</span>
                        </label>
                        <select
                          value={editDetailForm.vaccinator_name}
                          onChange={(e) => {
                            const v = AVAILABLE_VACCINATORS.find(vac => vac.nama === e.target.value);
                            setEditDetailForm({
                              ...editDetailForm,
                              vaccinator_name: e.target.value,
                              vaccinator_nip: v?.nip || ''
                            });
                          }}
                          className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 outline-none cursor-pointer"
                        >
                          {AVAILABLE_VACCINATORS.map(v => (
                            <option key={v.nip} value={v.nama}>
                              {v.nama} (NIP: {v.nip})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 3. Petugas Administrasi */}
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1 flex items-center gap-1">
                          <User size={13} className="text-purple-600" />
                          <span>Petugas Administrasi & Pendaftaran</span>
                        </label>
                        <select
                          value={editDetailForm.admin_officer_name}
                          onChange={(e) => {
                            const a = AVAILABLE_ADMIN_OFFICERS.find(adm => adm.nama === e.target.value);
                            setEditDetailForm({
                              ...editDetailForm,
                              admin_officer_name: e.target.value,
                              admin_officer_nip: a?.nip || ''
                            });
                          }}
                          className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 outline-none cursor-pointer"
                        >
                          {AVAILABLE_ADMIN_OFFICERS.map(a => (
                            <option key={a.nip} value={a.nama}>
                              {a.nama} (NIP: {a.nip})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingDetail(false)}
                      disabled={isSavingDetail}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedDetail}
                      disabled={isSavingDetail}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save size={14} className={isSavingDetail ? 'animate-spin' : ''} />
                      <span>{isSavingDetail ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE: TAMPILAN DETAIL LENGKAP */
                <>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">NIK KTP</span>
                      <span className="font-bold text-slate-800 text-sm font-mono">
                        {selectedBookingDetail.patient?.nik || '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">No. Passport</span>
                      <span className="font-black text-blue-700 text-sm font-mono">
                        {selectedBookingDetail.patient?.passport || selectedBookingDetail.patient?.passportNumber || selectedBookingDetail.patient?.no_passport || '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">Tanggal Lahir</span>
                      <span className="font-bold text-slate-800">
                        {selectedBookingDetail.patient?.dob ? formatDisplayDate(selectedBookingDetail.patient.dob) : '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">Jenis Kelamin</span>
                      <span className="font-bold text-slate-800">
                        {selectedBookingDetail.patient?.gender || '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">Kebangsaan</span>
                      <span className="font-bold text-slate-800">
                        {(selectedBookingDetail.patient?.nationality || selectedBookingDetail.patient?.kebangsaan || 'INDONESIA').toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">No. WhatsApp / HP</span>
                      <span className="font-bold text-slate-800">
                        {selectedBookingDetail.patient?.handphone || selectedBookingDetail.patient?.phone || '-'}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-slate-400 font-semibold block text-[11px]">Keperluan / Peruntukan</span>
                      <span className="font-bold text-blue-800">
                        {selectedBookingDetail.patient?.purpose || 'Vaksinasi Internasional'}
                      </span>
                    </div>

                    {selectedBookingDetail.patient?.address && (
                      <div className="col-span-2">
                        <span className="text-slate-400 font-semibold block text-[11px]">Alamat Domisili</span>
                        <span className="font-medium text-slate-700">
                          {selectedBookingDetail.patient?.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tim Petugas yang Bertugas Box */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <UserCheck size={14} className="text-indigo-600" />
                      <span>Tim Petugas Pelaksana Layanan:</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                        <span className="text-slate-400 block text-[10px] font-semibold">Dokter Pemeriksa:</span>
                        <span className="font-bold text-blue-800 block mt-0.5">
                          {selectedBookingDetail.doctor_name || editDetailForm.doctor_name || 'dr. M. Arifin Ramadhani'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedBookingDetail.doctor_code || editDetailForm.doctor_code || 'D00057'}
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-slate-400 block text-[10px] font-semibold">Perawat Vaksinator:</span>
                        <span className="font-bold text-emerald-800 block mt-0.5">
                          {selectedBookingDetail.vaccinator_name || editDetailForm.vaccinator_name || 'Adi Tresa Purnama, A.M.Kep'}
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                        <span className="text-slate-400 block text-[10px] font-semibold">Petugas Administrasi:</span>
                        <span className="font-bold text-purple-800 block mt-0.5">
                          {selectedBookingDetail.admin_officer_name || editDetailForm.admin_officer_name || 'Ina Nuraeni, S.AP'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Daftar Vaksin Diterima & Rincian Tarif */}
                  {(() => {
                    const priceDetails = getBookingPriceDetails(selectedBookingDetail);
                    return (
                      <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Package size={14} className="text-blue-600" />
                            <span>Daftar Vaksin Diterima & Rincian Tarif:</span>
                          </span>
                          {priceDetails.isBundled && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-xs">
                              <Sparkles size={11} />
                              <span>Paket Bundling Aktif (Rp525.000)</span>
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {priceDetails.vaccines.map((v, i) => (
                            <div key={v.id || i} className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-800 block uppercase">{formatVaccineDisplay(v.name)}</span>
                                <span className="text-[10px] text-slate-400">Tarif Normal</span>
                              </div>
                              <span className="font-bold text-slate-700 text-xs">
                                Rp{(v.price || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}

                          {priceDetails.isBundled && (
                            <div className="bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-900 font-bold">
                              <div>
                                <span className="flex items-center gap-1">
                                  <span>🎁 Potongan Paket Bundling (Meningitis + Polio)</span>
                                </span>
                                <span className="block text-[10px] text-emerald-700 font-normal">Tarif spesial bundling Umroh / Haji RSUD Al-Mulk</span>
                              </div>
                              <span className="font-black text-emerald-700 text-xs">
                                -Rp{priceDetails.discount.toLocaleString('id-ID')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Total Biaya Pelayanan */}
                        <div className="flex justify-between items-center pt-2 border-t border-blue-200/70 font-black text-slate-900">
                          <div>
                            <span className="text-xs">Total Tarif Vaksinasi:</span>
                            {priceDetails.isBundled && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                Normal: <span className="line-through">Rp{priceDetails.subtotal.toLocaleString('id-ID')}</span> (Hemat Rp105.000)
                              </span>
                            )}
                          </div>
                          <span className="text-base text-blue-700 font-black">
                            Rp{priceDetails.total.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* SIMRS Khanza Status Box */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50/90 to-blue-50/90 rounded-2xl border border-indigo-100 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-indigo-900">
                        <Building2 size={16} className="text-indigo-600" />
                        <span>Integrasi SIMRS Khanza RSUD Al-Mulk</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedBookingDetail.status === 'ditunda'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : selectedBookingDetail.simrs_synced
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}>
                        {selectedBookingDetail.status === 'ditunda'
                          ? '⚠️ Ditunda (Batal di SIMRS)'
                          : selectedBookingDetail.simrs_synced 
                            ? '● Terdaftar di SIMRS' 
                            : '○ Belum Terdaftar'}
                      </span>
                    </div>

                    {selectedBookingDetail.status === 'ditunda' && (
                      <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                        <div className="flex items-center gap-1 font-bold text-amber-800">
                          <Clock size={13} />
                          <span>Vaksinasi Ditunda Sementara</span>
                        </div>
                        <p className="text-amber-700">
                          Alasan: <strong>{selectedBookingDetail.postponed_reason || 'Kondisi kesehatan/penyakit belum memungkinkan vaksin'}</strong>
                        </p>
                        <p className="text-[10px] text-amber-600">
                          * Antrean di SIMRS telah dibatalkan. Jika pasien sudah siap divaksin hari ini, silakan klik <strong>Daftar Ulang ke SIMRS Hari Ini</strong>.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 block font-medium">Poli Tujuan:</span>
                        <span className="font-bold text-slate-800">U0029 - MCU VAKSIN INTERNASIONAL</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Dokter Pemeriksa Terpilih:</span>
                        <span className="font-bold text-slate-800">
                          {selectedBookingDetail.doctor_name || editDetailForm.doctor_name || 'dr. M. Arifin Ramadhani'} ({selectedBookingDetail.doctor_code || editDetailForm.doctor_code || 'D00057'})
                        </span>
                      </div>
                      {selectedBookingDetail.simrs_synced && (
                        <>
                          <div>
                            <span className="text-slate-400 block font-medium">No. Rekam Medis (RM):</span>
                            <span className="font-bold text-indigo-700 font-mono text-xs">{selectedBookingDetail.simrs_no_rkm_medis || '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">No. Rawat:</span>
                            <span className="font-bold text-indigo-700 font-mono text-xs">{selectedBookingDetail.simrs_no_rawat || '-'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block font-medium">No. Antrean Poli:</span>
                            <span className="font-black text-emerald-700 text-sm font-mono">{selectedBookingDetail.simrs_no_reg || '-'}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSyncToSimrs(
                          selectedBookingDetail, 
                          selectedBookingDetail.status === 'ditunda',
                          selectedBookingDetail.doctor_code || editDetailForm.doctor_code
                        )}
                        disabled={isSyncingSimrs === selectedBookingDetail.id}
                        className={`flex-1 py-2.5 px-3.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                          selectedBookingDetail.status === 'ditunda'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                            : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                        }`}
                        title="Daftar ke SIMRS Khanza RSUD Al-Mulk"
                      >
                        <Building2 size={16} className={`text-white shrink-0 ${isSyncingSimrs === selectedBookingDetail.id ? 'animate-spin' : ''}`} />
                        <span>
                          {isSyncingSimrs === selectedBookingDetail.id
                            ? 'Mendaftarkan ke SIMRS...'
                            : 'Daftar Ke SIMRS'}
                        </span>
                      </button>

                      {/* Dropdown Perubahan Status Peserta Terintegrasi */}
                      <div className="relative shrink-0 min-w-[155px]">
                        <select
                          value={selectedBookingDetail.status || 'menunggu'}
                          onChange={(e) => handleStatusChange(selectedBookingDetail, e.target.value as any)}
                          className={`w-full h-10 pl-3 pr-8 py-2 text-xs font-bold rounded-xl border appearance-none cursor-pointer outline-none transition-all shadow-xs ${
                            selectedBookingDetail.status === 'selesai'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : selectedBookingDetail.status === 'ditunda'
                                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                : selectedBookingDetail.status === 'belum_terverifikasi' || selectedBookingDetail.status === 'batal'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                                  : selectedBookingDetail.status === 'terverifikasi'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                          }`}
                          title="Pilih status peserta"
                        >
                          <option value="menunggu">Menunggu</option>
                          <option value="belum_terverifikasi">Belum Terverifikasi</option>
                          <option value="terverifikasi">Terverifikasi</option>
                          <option value="ditunda">Di Tunda</option>
                          <option value="selesai">Selesai</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Tunda Vaksinasi & Batal Antrean SIMRS */}
      <AnimatePresence>
        {postponeModalBooking && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm">Tunda Vaksinasi Peserta</h3>
                    <p className="text-[11px] text-amber-100">Batalkan antrean SIMRS sementara waktu</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPostponeModalBooking(null)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmPostpone} className="p-5 space-y-4">
                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <p className="font-bold">
                    Nama Peserta: {postponeModalBooking.patient?.name || postponeModalBooking.patient?.fullName || 'Peserta'}
                  </p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Jika ditunda, data registrasi periksa di <strong>SIMRS Khanza Poli Vaksinasi Internasional</strong> akan otomatis dibatalkan/dihapus dari antrean hari ini. Pasien dapat didaftarkan ulang kapan saja saat sudah sehat/siap.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Pilih Alasan Penundaan:</label>
                  <select
                    value={postponeReason}
                    onChange={(e) => setPostponeReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Demam / Gejala Infeksi Akut">Demam / Gejala Infeksi Akut</option>
                    <option value="Tekanan Darah Tinggi (Hipertensi)">Tekanan Darah Tinggi (Hipertensi)</option>
                    <option value="Penyakit Penyerta / Kondisi Medis Belum Fit">Penyakit Penyerta / Kondisi Medis Belum Fit</option>
                    <option value="Riwayat Reaksi Alergi Berat">Riwayat Reaksi Alergi Berat</option>
                    <option value="Sedang Dalam Pengobatan Imunosupresif">Sedang Dalam Pengobatan Imunosupresif</option>
                    <option value="Permintaan Pribadi Pasien / Jadwal Berubah">Permintaan Pribadi Pasien / Jadwal Berubah</option>
                    <option value="Lainnya">Alasan Lainnya (Ketik Manual)</option>
                  </select>
                </div>

                {postponeReason === 'Lainnya' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Keterangan Alasan Lain:</label>
                    <textarea
                      value={customPostponeReason}
                      onChange={(e) => setCustomPostponeReason(e.target.value)}
                      placeholder="Tuliskan alasan penundaan medis peserta..."
                      rows={2}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPostponeModalBooking(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPostpone}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingPostpone ? (
                      <>
                        <Clock size={13} className="animate-spin" />
                        <span>Membatalkan di SIMRS...</span>
                      </>
                    ) : (
                      <>
                        <Clock size={13} />
                        <span>Ya, Tunda & Batalkan di SIMRS</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Konfirmasi Hapus Peserta (Pilihan Ya atau Tidak) */}
      <AnimatePresence>
        {deleteConfirmBooking && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Trash2 size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm">Konfirmasi Hapus Peserta</h3>
                    <p className="text-[11px] text-rose-100">Peringatan penghapusan data pendaftaran</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmBooking(null)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-2 text-xs text-rose-900">
                  <p className="font-bold text-sm text-slate-800">
                    {deleteConfirmBooking.patient?.name || deleteConfirmBooking.patient?.fullName || 'Peserta'}
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                    <div>NIK: <span className="font-mono font-bold text-slate-800">{deleteConfirmBooking.patient?.nik || '-'}</span></div>
                    <div>Tgl: <span className="font-bold text-slate-800">{formatDisplayDate(deleteConfirmBooking.date)}</span></div>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed pt-2 border-t border-rose-200/60">
                    Apakah Anda yakin ingin menghapus data peserta ini? Data yang sudah dihapus tidak dapat dipulihkan.
                    {deleteConfirmBooking.simrs_synced && (
                      <span className="block mt-1.5 font-semibold text-rose-800">
                        * Pendaftaran dan nomor antrean pasien di SIMRS Khanza juga akan otomatis dibatalkan/dihapus.
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmBooking(null)}
                    disabled={isDeletingBooking}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Tidak, Batalkan
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteDelete}
                    disabled={isDeletingBooking}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingBooking ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Menghapus...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={13} />
                        <span>Ya, Hapus Peserta</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
