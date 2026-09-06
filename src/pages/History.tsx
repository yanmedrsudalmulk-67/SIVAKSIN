import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { 
  FileText, CheckCircle2, Clock, ChevronLeft, Trash2, 
  Search, Filter, Calendar, Users, Award, 
  ExternalLink, Printer, RefreshCw, X, Eye, 
  Phone, Hash, ShieldCheck, AlertCircle, Upload, Check, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';

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
    role, 
    refreshAllCloudData, 
    isSupabaseOnline,
    updateBookingStatus,
    uploadOfficialEicv
  } = useAppStore();

  // Filters State
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // E-ICV Send Modal State
  const [eicvModalBooking, setEicvModalBooking] = useState<any | null>(null);
  const [eicvFile, setEicvFile] = useState<File | null>(null);
  const [isSendingEicv, setIsSendingEicv] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllCloudData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus data pendaftaran peserta ini?')) {
      await deleteBooking(id);
      if (selectedBookingDetail?.id === id) {
        setSelectedBookingDetail(null);
      }
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: 'menunggu' | 'terverifikasi' | 'selesai') => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      setToastMessage(`Status peserta berhasil diubah menjadi ${newStatus.toUpperCase()}`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Gagal memperbarui status:', err);
    }
  };

  // Helper to generate quick E-ICV PDF if no file uploaded
  const generateEicvPdfDataUrl = (booking: any): string => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [215, 330] // F4 size
    });

    const patient = booking.patient || {};
    const nama = patient.name || patient.fullName || 'Jamaah Vaksinasi';
    const passport = patient.passport || patient.no_passport || '-';
    const nik = patient.nik || '-';
    const tglLahir = patient.dob || patient.tanggalLahir || '-';
    const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Kop Surat
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PEMERINTAH KOTA SUKABUMI', 107.5, 18, { align: 'center' });
    doc.setFontSize(13);
    doc.text('DINAS KESEHATAN', 107.5, 24, { align: 'center' });
    doc.setFontSize(16);
    doc.text('UOBK RSUD AL-MULK', 107.5, 31, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Jl. Pelabuhan II KM 6, Lembursitu Kota Sukabumi Tlp.(0266) 6243088', 107.5, 37, { align: 'center' });
    doc.text('Kode Pos 43169 email: rsudalmulk@gmail.com', 107.5, 42, { align: 'center' });

    // Lines
    doc.setLineWidth(0.8);
    doc.line(15, 46, 200, 46);
    doc.setLineWidth(0.2);
    doc.line(15, 47.5, 200, 47.5);

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('ELECTRONIC INTERNATIONAL CERTIFICATE OF VACCINATION (E-ICV)', 107.5, 58, { align: 'center' });
    doc.setFontSize(10);
    doc.text('SURAT KETERANGAN VAKSINASI / IMUNISASI INTERNASIONAL RESMI', 107.5, 64, { align: 'center' });

    // Box
    doc.setLineWidth(0.4);
    doc.rect(18, 72, 179, 65);

    // Patient Details
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('IDENTITAS PEMEGANG SERTIFIKAT:', 22, 80);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`1. Nama Lengkap       : ${nama}`, 22, 88);
    doc.text(`2. Nomor Paspor         : ${passport}`, 22, 95);
    doc.text(`3. NIK                         : ${nik}`, 22, 102);
    doc.text(`4. Tanggal Lahir          : ${tglLahir}`, 22, 109);
    doc.text(`5. Jenis Vaksin           : Meningitis / Vaksinasi Internasional`, 22, 116);
    doc.text(`6. Nomor Registrasi   : ${booking.id}`, 22, 123);
    doc.text(`7. Tanggal Penerbitan : ${currentDate}`, 22, 130);

    // Official Seal / Note
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('Dokumen ini diterbitkan secara sah oleh UOBK RSUD Al-Mulk Kota Sukabumi', 107.5, 146, { align: 'center' });
    doc.text('dan terdaftar dalam database Kementerian Kesehatan RI.', 107.5, 151, { align: 'center' });

    // Signatures
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Sukabumi, ${currentDate}`, 150, 170);
    doc.text('Tim Medis & Vaksinator RSUD Al-Mulk', 150, 176);

    doc.setFont('Helvetica', 'bold');
    doc.text('( Dr. Hj. Munifah, M.Kes )', 150, 205);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('NIP. 19740512 200212 2 003', 150, 210);

    return doc.output('datauristring');
  };

  const handleSendEicvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eicvModalBooking) return;

    setIsSendingEicv(true);
    try {
      let finalPdfUrl = '';
      let finalFileName = `E-ICV_${eicvModalBooking.patient?.name || 'Peserta'}.pdf`;

      if (eicvFile) {
        finalFileName = eicvFile.name;
        // Read file as Data URL
        finalPdfUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(eicvFile);
        });
      } else {
        // Auto-generate official PDF
        finalPdfUrl = generateEicvPdfDataUrl(eicvModalBooking);
      }

      await uploadOfficialEicv(eicvModalBooking.id, finalPdfUrl, finalFileName);

      setToastMessage(`Sertifikat E-ICV (${finalFileName}) berhasil dikirim ke akun peserta ${eicvModalBooking.patient?.name || ''}!`);
      setTimeout(() => setToastMessage(null), 4000);

      setEicvModalBooking(null);
      setEicvFile(null);
    } catch (err) {
      console.error('Gagal mengirim E-ICV:', err);
      alert('Gagal mengirim file E-ICV. Silakan coba lagi.');
    } finally {
      setIsSendingEicv(false);
    }
  };

  // Helper to extract Date object
  const parseBookingDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const directDate = new Date(dateStr);
    if (!isNaN(directDate.getTime())) return directDate;

    const isoMatch = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    }

    const textMatch = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (textMatch) {
      const monthPrefixes = ['jan', 'feb', 'mar', 'apr', 'mei', 'may', 'jun', 'jul', 'agu', 'aug', 'sep', 'okt', 'oct', 'nov', 'des', 'dec'];
      const monthIdx = monthPrefixes.findIndex(m => textMatch[2].toLowerCase().startsWith(m));
      if (monthIdx !== -1) {
        const monthNum = Math.floor(monthIdx / 1) % 12;
        return new Date(parseInt(textMatch[3]), monthNum, parseInt(textMatch[1]));
      }
    }
    return null;
  };

  const getBookingVaccines = (b: any) => {
    if (!b) return [];
    const ids: string[] = Array.isArray(b.vaccineIds) && b.vaccineIds.length > 0
      ? b.vaccineIds
      : (Array.isArray(b.patient?.selectedVaccines) && b.patient.selectedVaccines.length > 0)
        ? b.patient.selectedVaccines
        : (b.vaccineId ? [b.vaccineId] : []);
    
    const matched = vaccines.filter(v => ids.includes(v.id));
    if (matched.length > 0) return matched;
    if (b.patient?.selectedVaccineNames) return [{ id: 'custom', name: b.patient.selectedVaccineNames, price: 0, category: 'Wajib' }];
    if (b.patient?.selectedVaccine) return [{ id: 'custom', name: b.patient.selectedVaccine, price: 0, category: 'Wajib' }];
    const single = vaccines.find(v => v.id === b.vaccineId);
    return single ? [single] : [{ id: 'unknown', name: 'Vaksinasi Internasional', price: 0, category: 'Wajib' }];
  };

  const getBookingTotalPrice = (b: any) => {
    const vaxs = getBookingVaccines(b);
    return vaxs.reduce((acc, curr) => acc + (curr.price || 0), 0);
  };

  // Filter and Search Logic
  const filteredBookings = useMemo(() => {
    return bookings.slice().reverse().filter((booking) => {
      const bDate = parseBookingDate(booking.date);

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

        const match = 
          pName.includes(q) || 
          pNik.includes(q) || 
          pPassport.includes(q) || 
          pPhone.includes(q) || 
          bId.includes(q) || 
          hasVaccineMatch;

        if (!match) return false;
      }

      return true;
    });
  }, [bookings, vaccines, selectedMonth, selectedYear, selectedStatus, searchQuery]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = bookings.length;
    const verified = bookings.filter(b => b.status === 'terverifikasi').length;
    const completed = bookings.filter(b => b.status === 'selesai').length;
    const pending = bookings.filter(b => b.status === 'menunggu').length;
    return { total, verified, completed, pending };
  }, [bookings]);

  return (
    <div className="bg-slate-50 min-h-screen relative w-full h-full font-sans pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-3 text-xs sm:text-sm font-bold"
          >
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/60 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-40 left-0 w-80 h-80 bg-cyan-100/50 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Top Header Bar */}
      <div className="bg-white px-4 sm:px-6 py-4 sticky top-0 z-40 shadow-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 rounded-2xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              title="Kembali"
            >
              <ChevronLeft size={22} />
            </button>
            <div>
              <h1 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
                <span>Riwayat & Data Pendaftar</span>
                {isSupabaseOnline && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Supabase Cloud Realtime"></span>
                )}
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Daftar peserta vaksinasi terdaftar, status verifikasi, dan pengiriman dokumen E-ICV
              </p>
            </div>
          </div>

          {/* Action Buttons: Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Sinkronisasi Data Supabase"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
              <span className="hidden md:inline">Sinkron Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl mx-auto w-full space-y-6 relative z-10">
        
        {/* Statistics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pendaftar</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total}</div>
            <span className="text-[10px] text-slate-400 font-medium">Semua periode</span>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Terverifikasi</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-cyan-700">{stats.verified}</div>
            <span className="text-[10px] text-cyan-600 font-medium">Siap disuntik</span>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Selesai / E-ICV</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700">{stats.completed}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Sertifikat aktif</span>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Menunggu</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700">{stats.pending}</div>
            <span className="text-[10px] text-amber-600 font-medium">Menunggu proses</span>
          </div>
        </div>

        {/* Filter & Search Controls Container */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
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

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              
              {/* Filter Bulan */}
              <div className="relative">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-1">
                  Bulan
                </div>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    aria-label="Filter Bulan"
                    className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Filter Tahun */}
              <div className="relative">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-1">
                  Tahun
                </div>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    aria-label="Filter Tahun"
                    className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y.value} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Filter Status */}
              <div className="relative col-span-2 sm:col-span-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-1">
                  Status
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  aria-label="Filter Status"
                  className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="menunggu">Menunggu</option>
                  <option value="terverifikasi">Terverifikasi</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

            </div>
          </div>

          {/* Active Filter Badges */}
          {(selectedMonth !== 'all' || selectedYear !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-semibold">Filter aktif:</span>
              
              {selectedMonth !== 'all' && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold flex items-center gap-1.5 border border-blue-100">
                  Bulan: {MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label}
                  <button onClick={() => setSelectedMonth('all')} className="hover:text-blue-900 cursor-pointer"><X size={12} /></button>
                </span>
              )}

              {selectedYear !== 'all' && (
                <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg font-bold flex items-center gap-1.5 border border-cyan-100">
                  Tahun: {selectedYear}
                  <button onClick={() => setSelectedYear('all')} className="hover:text-cyan-900 cursor-pointer"><X size={12} /></button>
                </span>
              )}

              {selectedStatus !== 'all' && (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold flex items-center gap-1.5 border border-emerald-100">
                  Status: {selectedStatus}
                  <button onClick={() => setSelectedStatus('all')} className="hover:text-emerald-900 cursor-pointer"><X size={12} /></button>
                </span>
              )}

              {searchQuery && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold flex items-center gap-1.5 border border-slate-200">
                  Kata Kunci: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-slate-900 cursor-pointer"><X size={12} /></button>
                </span>
              )}

              <button
                onClick={() => {
                  setSelectedMonth('all');
                  setSelectedYear('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="text-rose-600 hover:text-rose-800 font-bold ml-auto cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>

        {/* Filtered Results Header */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            Tabel Data Peserta Terdaftar ({filteredBookings.length} Peserta)
          </p>
        </div>

        {/* Empty State or Table View */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
              <Calendar size={28} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Tidak Ditemukan Data Peserta</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {bookings.length === 0 
                  ? 'Belum ada data pendaftaran vaksinasi di sistem.' 
                  : 'Tidak ada data peserta yang cocok dengan kombinasi filter bulan, tahun, atau kata kunci pencarian.'}
              </p>
            </div>
            {(selectedMonth !== 'all' || selectedYear !== 'all' || selectedStatus !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedMonth('all');
                  setSelectedYear('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
              >
                Tampilkan Semua Riwayat
              </button>
            )}
          </div>
        ) : (
          /* TABLE VIEW DIRECTLY */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-4">No.</th>
                    <th className="py-4 px-4">ID & Tanggal</th>
                    <th className="py-4 px-4">Nama Peserta</th>
                    <th className="py-4 px-4">NIK & Passport</th>
                    <th className="py-4 px-4">Jenis Vaksin</th>
                    <th className="py-4 px-4">Status Pendaftaran</th>
                    <th className="py-4 px-4 text-center">Aksi / Kirim E-ICV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredBookings.map((booking, index) => {
                    const patient = booking.patient || {};
                    const patientName = patient.name || patient.fullName || patient.nama || 'Peserta Vaksin';
                    const patientNik = patient.nik || '-';
                    const patientPassport = patient.passport || patient.passportNumber || patient.no_passport || '-';
                    const hasEicv = Boolean(patient.e_icv_url);

                    return (
                      <tr 
                        key={booking.id} 
                        className="hover:bg-blue-50/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-blue-600">{booking.id}</div>
                          <div className="text-[11px] text-slate-500">{booking.date} {booking.time ? `• ${booking.time} WIB` : ''}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900 text-sm">{patientName}</div>
                          <div className="text-[11px] text-slate-500">{patient.handphone || patient.phone || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">NIK: {patientNik}</div>
                          <div className="text-[11px] text-slate-500">Pass: {patientPassport}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {getBookingVaccines(booking).map(v => (
                              <span key={v.id} className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                {v.name}
                              </span>
                            ))}
                          </div>
                          <div className="text-[11px] text-blue-600 font-semibold mt-1">
                            {patient.purpose || 'Umroh / Haji'} • Rp{getBookingTotalPrice(booking).toLocaleString('id-ID')}
                          </div>
                        </td>

                        {/* Status Column with Interactive Admin Dropdown */}
                        <td className="py-3.5 px-4">
                          {role === 'admin' ? (
                            <select
                              value={booking.status}
                              onChange={(e) => handleStatusChange(booking.id, e.target.value as any)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider outline-none cursor-pointer border transition-all ${
                                booking.status === 'selesai' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-2 focus:ring-emerald-400' 
                                  : booking.status === 'terverifikasi'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300 focus:ring-2 focus:ring-blue-400'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 focus:ring-2 focus:ring-amber-400'
                              }`}
                              title="Ubah Status Peserta"
                            >
                              <option value="menunggu">⏱ Menunggu</option>
                              <option value="terverifikasi">🛡 Terverifikasi</option>
                              <option value="selesai">✅ Selesai</option>
                            </select>
                          ) : (
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              booking.status === 'selesai' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : booking.status === 'terverifikasi'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {booking.status}
                            </span>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Detail Button */}
                            <button
                              onClick={() => setSelectedBookingDetail(booking)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer"
                              title="Lihat Detail Peserta"
                            >
                              <Eye size={14} />
                            </button>

                            {/* Kirim / Upload E-ICV Button for Admin */}
                            {role === 'admin' && (
                              <button
                                onClick={() => setEicvModalBooking(booking)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                                  hasEicv 
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300' 
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                                title="Kirim dokumen E-ICV PDF ke akun peserta"
                              >
                                <Upload size={13} />
                                <span>{hasEicv ? 'E-ICV Terkirim' : 'Kirim E-ICV'}</span>
                              </button>
                            )}

                            {/* Direct E-ICV View for User */}
                            {role !== 'admin' && (booking.status === 'selesai' || booking.status === 'terverifikasi') && (
                              <button
                                onClick={() => navigate('/certificate')}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all cursor-pointer"
                                title="Buka E-Sertifikat ICV"
                              >
                                <Award size={14} />
                              </button>
                            )}

                            {/* Delete Button */}
                            {role === 'admin' && (
                              <button
                                onClick={(e) => handleDelete(booking.id, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 size={14} />
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
          </div>
        )}

      </div>

      {/* ADMIN KIRIM E-ICV PDF MODAL */}
      <AnimatePresence>
        {eicvModalBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
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
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSendEicvSubmit} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Upload file sertifikat resmi E-ICV (format PDF) untuk dikirim langsung ke akun peserta. Dokumen ini akan langsung tampil di menu E-ICV milik peserta dan siap diunduh.
                  </p>

                  {/* File Upload Input */}
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
                      <span>Jika tidak mengunggah file PDF khusus, sistem akan secara otomatis membuatkan <strong>E-ICV PDF Resmi</strong> berstandar RSUD Al-Mulk.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSendingEicv}
                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
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

      {/* DETAIL MODAL PESERTA TERDAFTAR */}
      <AnimatePresence>
        {selectedBookingDetail && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto"
            >
              {/* Header Modal */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                    Detail Pendaftaran Vaksin
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    {selectedBookingDetail.patient?.name || selectedBookingDetail.patient?.fullName || 'Peserta Terdaftar'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    ID Booking: {selectedBookingDetail.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBookingDetail(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Patient Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold block">Nomor Induk Kependudukan (NIK)</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedBookingDetail.patient?.nik || '-'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block">Nomor Passport</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedBookingDetail.patient?.passport || selectedBookingDetail.patient?.passportNumber || selectedBookingDetail.patient?.no_passport || '-'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block">Nomor WhatsApp / HP</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedBookingDetail.patient?.handphone || selectedBookingDetail.patient?.phone || selectedBookingDetail.patient?.no_hp || '-'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block">Tujuan Vaksinasi</span>
                  <span className="font-bold text-blue-700 text-sm">
                    {selectedBookingDetail.patient?.purpose || selectedBookingDetail.patient?.keperluan || 'Umroh & Haji'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-semibold block">Alamat Pasien</span>
                  <span className="font-bold text-slate-800">
                    {selectedBookingDetail.patient?.address || selectedBookingDetail.patient?.alamat || 'Alamat domisili peserta'}
                  </span>
                </div>
              </div>

              {/* Vaccine & Schedule Data */}
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs">
                    Daftar Vaksinasi ({getBookingVaccines(selectedBookingDetail).length} Jenis)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] ${
                    selectedBookingDetail.status === 'selesai'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedBookingDetail.status === 'terverifikasi'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedBookingDetail.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {getBookingVaccines(selectedBookingDetail).map(v => (
                    <div key={v.id} className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">{v.name}</span>
                      <span className="font-bold text-blue-700 text-xs">Rp{v.price.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-blue-200/50">
                  <div className="text-slate-600 font-semibold text-xs">
                    <span>Tanggal: {selectedBookingDetail.date}</span>
                    {selectedBookingDetail.time && <span> • {selectedBookingDetail.time} WIB</span>}
                  </div>
                  <div className="font-black text-blue-800 text-sm">
                    Total: Rp{getBookingTotalPrice(selectedBookingDetail).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Supporting Document Previews */}
              {(selectedBookingDetail.patient?.ktpUrl || selectedBookingDetail.patient?.passportUrl) && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-700">Berkas Dokumen Pendukung:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedBookingDetail.patient?.ktpUrl && (
                      <a
                        href={selectedBookingDetail.patient.ktpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-blue-600 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <FileText size={14} />
                        <span>Lihat KTP di Cloud</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {selectedBookingDetail.patient?.passportUrl && (
                      <a
                        href={selectedBookingDetail.patient.passportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-cyan-600 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <FileText size={14} />
                        <span>Lihat Passport di Cloud</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-slate-100">
                {role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      const b = selectedBookingDetail;
                      setSelectedBookingDetail(null);
                      setEicvModalBooking(b);
                    }}
                    className="w-full sm:flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Upload size={16} />
                    <span>Kirim E-ICV (PDF) ke Akun Peserta</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedBookingDetail(null)}
                  className="w-full sm:w-auto px-5 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
