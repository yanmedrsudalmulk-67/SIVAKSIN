import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { 
  FileText, CheckCircle2, Clock, ChevronLeft, Trash2, 
  Search, Filter, Calendar, Users, Award, 
  ExternalLink, Printer, RefreshCw, X, Eye, 
  MapPin, Phone, Hash, ShieldCheck, AlertCircle, LayoutGrid, Table as TableIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const { bookings, vaccines, deleteBooking, role, refreshAllCloudData, isSupabaseOnline } = useAppStore();

  // Filters State
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Helper to extract Date object from diverse date representations
  const parseBookingDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const directDate = new Date(dateStr);
    if (!isNaN(directDate.getTime())) return directDate;

    // Regex match ISO format YYYY-MM-DD
    const isoMatch = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    }

    // Regex match format DD MonthName YYYY
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
      // Date Object
      const bDate = parseBookingDate(booking.date);

      // Month filter
      if (selectedMonth !== 'all') {
        if (!bDate) return false;
        const monthNum = (bDate.getMonth() + 1).toString();
        if (monthNum !== selectedMonth) return false;
      }

      // Year filter
      if (selectedYear !== 'all') {
        if (!bDate) return false;
        const yearNum = bDate.getFullYear().toString();
        if (yearNum !== selectedYear) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (booking.status !== selectedStatus) return false;
      }

      // Search Query filter (matches patient name, NIK, passport, phone, vaccine name, ID)
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
                Daftar peserta vaksinasi terdaftar, status verifikasi, dan penerbitan sertifikat E-ICV
              </p>
            </div>
          </div>

          {/* Action Buttons: Refresh & View Toggle */}
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

            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'card' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid size={14} />
                <span>Kartu</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon size={14} />
                <span>Tabel</span>
              </button>
            </div>
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
            Menampilkan {filteredBookings.length} Peserta Terdaftar
          </p>
        </div>

        {/* Empty State */}
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
        ) : viewMode === 'card' ? (
          
          /* CARD VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBookings.map((booking, idx) => {
              const vaccine = vaccines.find(v => v.id === booking.vaccineId);
              const patient = booking.patient || {};
              const patientName = patient.name || patient.fullName || patient.nama || 'Peserta Vaksinasi';
              const patientNik = patient.nik || '-';
              const patientPassport = patient.passport || patient.passportNumber || patient.no_passport || '-';
              const patientPhone = patient.handphone || patient.phone || patient.no_hp || '-';
              const purpose = patient.purpose || patient.keperluan || 'Umroh / Internasional';

              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={booking.id}
                  onClick={() => setSelectedBookingDetail(booking)}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Status & ID */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          ID: {booking.id}
                        </span>
                        <h3 className="font-black text-slate-900 text-base mt-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {patientName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          booking.status === 'selesai' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : booking.status === 'terverifikasi'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {booking.status}
                        </span>

                        {role === 'admin' && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(booking.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-lg cursor-pointer"
                            title="Hapus Data Peserta"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Vaccine Info Banner */}
                    <div className="p-3 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl border border-slate-100 mb-3 space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        {getBookingVaccines(booking).map(v => (
                          <span key={v.id} className="text-[11px] font-bold bg-white text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs">
                            {v.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-0.5">
                        <span>Tujuan: {purpose}</span>
                        <span className="font-black text-blue-700">Rp {getBookingTotalPrice(booking).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Patient Summary Details Grid */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-white">
                      <div className="flex items-center gap-2">
                        <Hash size={13} className="text-slate-400 shrink-0" />
                        <span className="text-slate-400 font-medium">NIK:</span>
                        <span className="font-bold text-slate-800 truncate">{patientNik}</span>
                      </div>
                      
                      {patientPassport !== '-' && (
                        <div className="flex items-center gap-2">
                          <FileText size={13} className="text-slate-400 shrink-0" />
                          <span className="text-slate-400 font-medium">Passport:</span>
                          <span className="font-bold text-slate-800 truncate">{patientPassport}</span>
                        </div>
                      )}

                      {patientPhone !== '-' && (
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          <span className="text-slate-400 font-medium">No. HP:</span>
                          <span className="font-bold text-slate-800 truncate">{patientPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Date & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Calendar size={14} className="text-blue-600" />
                      <span>{booking.date || 'Sesuai Jadwal'}</span>
                      {booking.time && <span className="font-bold text-slate-700">• {booking.time} WIB</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {(booking.status === 'selesai' || booking.status === 'terverifikasi') ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/certificate');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                        >
                          <Award size={13} />
                          <span>E-ICV</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBookingDetail(booking);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Detail</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          
          /* TABLE VIEW (Optimal for Desktop & Landscape) */
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
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredBookings.map((booking, index) => {
                    const vaccine = vaccines.find(v => v.id === booking.vaccineId);
                    const patient = booking.patient || {};
                    const patientName = patient.name || patient.fullName || patient.nama || 'Peserta Vaksin';
                    const patientNik = patient.nik || '-';
                    const patientPassport = patient.passport || patient.passportNumber || patient.no_passport || '-';

                    return (
                      <tr 
                        key={booking.id} 
                        onClick={() => setSelectedBookingDetail(booking)}
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer"
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
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            booking.status === 'selesai' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : booking.status === 'terverifikasi'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedBookingDetail(booking)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                              title="Lihat Detail Peserta"
                            >
                              <Eye size={14} />
                            </button>
                            {(booking.status === 'selesai' || booking.status === 'terverifikasi') && (
                              <button
                                onClick={() => navigate('/certificate')}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
                                title="Buka E-Sertifikat ICV"
                              >
                                <Award size={14} />
                              </button>
                            )}
                            {role === 'admin' && (
                              <button
                                onClick={(e) => handleDelete(booking.id, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
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
                {(selectedBookingDetail.status === 'selesai' || selectedBookingDetail.status === 'terverifikasi') ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBookingDetail(null);
                      navigate('/certificate');
                    }}
                    className="w-full sm:flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Award size={16} />
                    <span>Buka / Cetak E-Sertifikat ICV</span>
                  </button>
                ) : null}

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
