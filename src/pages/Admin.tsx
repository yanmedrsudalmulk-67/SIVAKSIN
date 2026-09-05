import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { 
  Users, Syringe, Calendar, ArrowLeft, Download, CheckCircle, Search, Filter, 
  Share2, Mail, Printer, Cloud, RefreshCw, FileText, ExternalLink, Plus, 
  CheckCircle2, Clock, AlertCircle, Edit3, Trash2, X, Save, Sparkles, Loader2,
  Eye, MessageSquare, AlertTriangle, CheckCheck, ZoomIn, Send, FileCheck, FileWarning
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { 
    bookings, 
    vaccines, 
    updateBookingStatus, 
    updateVaccineStock, 
    addVaccine,
    updateVaccine,
    deleteVaccine,
    isSupabaseOnline, 
    refreshAllCloudData,
    isLoadingCloud,
    requestDocumentRevision,
    verifyDocumentApproval
  } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'stock' | 'history'>('bookings');
  
  // Modal states
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [showAddVaccineModal, setShowAddVaccineModal] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Document Revision & Verification State
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionDocType, setRevisionDocType] = useState<'ktp' | 'passport' | 'all'>('ktp');
  const [revisionMessage, setRevisionMessage] = useState('');
  const [isSendingRevision, setIsSendingRevision] = useState(false);
  
  // Image Lightbox State
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [zoomImageTitle, setZoomImageTitle] = useState('');

  const revisionPresets = [
    'Foto KTP buram / tulisan NIK & Nama tidak terbaca jelas. Mohon unggah ulang foto KTP asli yang terang dan tajam.',
    'Masa berlaku Paspor kurang dari 6 bulan dari jadwal keberangkatan. Mohon periksa kembali atau unggah paspor yang telah diperpanjang.',
    'Foto dokumen terpotong / ada kilau pantulan cahaya (glare). Pastikan seluruh 4 sudut dokumen terlihat utuh.',
    'Nama lengkap atau tanggal lahir pada formulir pendaftaran berbeda dengan data Paspor / KTP. Mohon unggah dokumen yang sesuai.',
    'Dokumen yang diunggah salah / bukan KTP/Paspor yang sah. Mohon unggah dokumen identitas resmi yang valid.'
  ];

  const handleApproveDocument = async () => {
    if (!selectedPatient) return;
    try {
      await verifyDocumentApproval(selectedPatient.id);
      setSelectedPatient((prev: any) => prev ? {
        ...prev,
        status: 'terverifikasi',
        patient: { ...prev.patient, document_status: 'terverifikasi' }
      } : null);
      setAdminFeedback(`Dokumen pasien ${selectedPatient.patient?.name} telah disetujui & notifikasi berhasil terkirim ke pengguna!`);
      setTimeout(() => setAdminFeedback(null), 5000);
    } catch (err: any) {
      alert('Gagal menyetujui dokumen: ' + err.message);
    }
  };

  const handleOpenRevisionModal = () => {
    setRevisionMessage('');
    setRevisionDocType('ktp');
    setShowRevisionModal(true);
  };

  const handleSendRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !revisionMessage.trim()) return;

    setIsSendingRevision(true);
    try {
      await requestDocumentRevision(selectedPatient.id, revisionDocType, revisionMessage.trim());
      setSelectedPatient((prev: any) => prev ? {
        ...prev,
        patient: { 
          ...prev.patient, 
          document_status: 'perlu_revisi',
          revision_note: revisionMessage.trim(),
          revision_doc: revisionDocType
        }
      } : null);
      setShowRevisionModal(false);
      setAdminFeedback(`Perintah revisi dokumen berhasil dikirim ke akun notifikasi ${selectedPatient.patient?.name}!`);
      setTimeout(() => setAdminFeedback(null), 5000);
    } catch (err: any) {
      alert('Gagal mengirim instruksi revisi: ' + err.message);
    } finally {
      setIsSendingRevision(false);
    }
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

  // New Vaccine Form
  const [newVaccine, setNewVaccine] = useState({
    name: '',
    description: '',
    price: 350000,
    stock: 50,
    category: 'Wajib' as 'Wajib' | 'Dianjurkan' | 'Rutin',
    protectionDuration: 'Seumur Hidup / 10 Tahun'
  });

  const handleAddVaccineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccine.name.trim()) return;

    setIsSaving(true);
    try {
      await addVaccine({
        id: `vax_${Date.now()}`,
        name: newVaccine.name.trim(),
        description: newVaccine.description.trim() || `Vaksin ${newVaccine.name} untuk perlindungan internasional`,
        price: Number(newVaccine.price),
        stock: Math.max(0, Number(newVaccine.stock)),
        category: newVaccine.category,
        protectionDuration: newVaccine.protectionDuration,
        benefits: ['Sertifikat Internasional (ICV)', 'Standar Kemenkes RI']
      });

      setShowAddVaccineModal(false);
      setNewVaccine({
        name: '',
        description: '',
        price: 350000,
        stock: 50,
        category: 'Wajib',
        protectionDuration: 'Seumur Hidup / 10 Tahun'
      });
      setAdminFeedback(`Vaksin "${newVaccine.name}" berhasil ditambahkan & terhubung!`);
      setTimeout(() => setAdminFeedback(null), 4000);
    } catch (err: any) {
      alert('Gagal menambah vaksin: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditVaccineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVaccine || !editingVaccine.name.trim()) return;

    setIsSaving(true);
    try {
      await updateVaccine(editingVaccine.id, {
        name: editingVaccine.name.trim(),
        price: Number(editingVaccine.price),
        stock: Math.max(0, Number(editingVaccine.stock)),
        category: editingVaccine.category,
        description: editingVaccine.description,
        benefits: Array.isArray(editingVaccine.benefits) ? editingVaccine.benefits : ['Sertifikat Internasional (ICV)']
      });

      setAdminFeedback(`Data & harga vaksin "${editingVaccine.name}" berhasil diperbarui!`);
      setEditingVaccine(null);
      setTimeout(() => setAdminFeedback(null), 4000);
    } catch (err: any) {
      alert('Gagal memperbarui vaksin: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVaccine = async (id: string, name: string) => {
    if (confirm(`Hapus vaksin "${name}" dari sistem? Data pilihan di menu booking akan diperbarui.`)) {
      try {
        await deleteVaccine(id);
        setAdminFeedback(`Vaksin "${name}" telah dihapus.`);
        setTimeout(() => setAdminFeedback(null), 4000);
      } catch (err: any) {
        alert('Gagal menghapus vaksin: ' + err.message);
      }
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = b.patient?.name?.toLowerCase() || '';
    const passport = (b.patient?.passport || b.patient?.no_passport || '').toLowerCase();
    const nik = (b.patient?.nik || '').toLowerCase();
    const bookingId = b.id.toLowerCase();
    return name.includes(q) || passport.includes(q) || nik.includes(q) || bookingId.includes(q);
  });

  // Stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'menunggu').length;
  const verifiedBookings = bookings.filter(b => b.status === 'terverifikasi').length;

  return (
    <div className="bg-slate-50 min-h-screen pb-safe">
      <div className="bg-brand-900 text-white px-6 pt-12 pb-6 sticky top-0 z-40 rounded-b-3xl shadow-lg">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate('/profile')} className="p-2 hover:bg-white/10 rounded-xl -ml-2 transition-colors cursor-pointer">
              <ArrowLeft size={24} />
            </button>
            <div className="text-center">
              <h1 className="font-bold text-lg">Admin Panel SIVAKSIN</h1>
              <div className="flex items-center justify-center gap-1.5 mt-0.5 text-xs">
                <span className={`inline-block w-2 h-2 rounded-full ${isSupabaseOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span className="text-slate-200">{isSupabaseOnline ? 'Supabase Cloud Terhubung' : 'Mode Offline / Lokal'}</span>
              </div>
            </div>
            <button 
              onClick={() => refreshAllCloudData()} 
              disabled={isLoadingCloud}
              title="Refresh Data dari Cloud"
              className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={20} className={isLoadingCloud ? 'animate-spin text-emerald-300' : ''} />
            </button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-md">
              <div className="text-brand-100 text-xs mb-1">Total Booking</div>
              <div className="text-2xl font-bold">{totalBookings}</div>
            </div>
            <div className="flex-1 bg-amber-500/20 rounded-2xl p-4 border border-amber-500/30 backdrop-blur-md text-amber-100">
              <div className="text-amber-200 text-xs mb-1">Menunggu</div>
              <div className="text-2xl font-bold">{pendingBookings}</div>
            </div>
            <div className="flex-1 bg-health-500/20 rounded-2xl p-4 border border-health-500/30 backdrop-blur-md text-health-100">
              <div className="text-health-200 text-xs mb-1">Terverifikasi</div>
              <div className="text-2xl font-bold">{verifiedBookings}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="flex bg-slate-200/50 p-1 rounded-xl mb-6 overflow-x-auto hide-scrollbar max-w-lg">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 min-w-[120px] py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'bookings' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500'}`}
          >
            Kelola Booking ({pendingBookings})
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            className={`flex-1 min-w-[110px] py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'stock' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500'}`}
          >
            Stok Vaksin ({vaccines.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[120px] py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'history' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500'}`}
          >
            Riwayat Pasien
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800">Daftar Reservasi Terbaru</h3>
              <span className="text-xs text-slate-500">Tersinkronisasi otomatis ke Supabase Cloud</span>
            </div>
            
            {bookings.length === 0 && <p className="text-center text-slate-500 py-10 text-sm">Belum ada data booking.</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.slice().reverse().map(b => (
                <div key={b.id} className="glass-card p-4 rounded-2xl border border-slate-100 flex flex-col justify-between gap-3 bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="cursor-pointer" onClick={() => setSelectedPatient(b)}>
                      <div className="font-bold text-slate-800 hover:text-brand-600 transition-colors">{b.patient?.name}</div>
                      <div className="text-xs text-slate-500">{b.id} • {b.date} {b.time}</div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {getBookingVaccines(b).map(v => (
                          <span key={v.id} className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                            {v.name}
                          </span>
                        ))}
                      </div>
                      {(b.patient?.ktp_url || b.patient?.passport_url || b.patient?.document_status) && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {b.patient?.document_status === 'perlu_revisi' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                              <AlertTriangle size={10} /> Perlu Revisi Dokumen
                            </span>
                          ) : b.patient?.document_status === 'terverifikasi' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCheck size={10} /> Dokumen Valid
                            </span>
                          ) : null}
                          {b.patient?.ktp_url && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                              <FileText size={10} /> KTP
                            </span>
                          )}
                          {b.patient?.passport_url && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                              <FileText size={10} /> Passport
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${b.status === 'menunggu' ? 'bg-orange-100 text-orange-600' : b.status === 'terverifikasi' ? 'bg-blue-100 text-blue-600' : 'bg-health-100 text-health-600'}`}>
                      {b.status}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100/50">
                    <button 
                      onClick={() => setSelectedPatient(b)}
                      className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Detail Dokumen
                    </button>
                    {b.status === 'menunggu' && (
                      <button 
                        onClick={() => updateBookingStatus(b.id, 'terverifikasi')}
                        className="flex-1 bg-brand-50 text-brand-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-brand-100 transition-colors cursor-pointer"
                      >
                        <CheckCircle size={14} /> Verifikasi
                      </button>
                    )}
                    {b.status === 'terverifikasi' && (
                      <button 
                        onClick={() => updateBookingStatus(b.id, 'selesai')}
                        className="flex-1 bg-health-50 text-health-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-health-100 transition-colors cursor-pointer"
                      >
                        <CheckCircle size={14} /> Tandai Selesai
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notification Feedback */}
        {adminFeedback && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{adminFeedback}</span>
            </div>
            <button onClick={() => setAdminFeedback(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">✕</button>
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Manajemen Stok, Nama & Harga Vaksin</h3>
                <p className="text-xs text-slate-500">Perubahan data dan stok otomatis tersinkronisasi ke Menu Booking</p>
              </div>
              <button 
                onClick={() => setShowAddVaccineModal(true)}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <Plus size={15} /> Tambah Jenis Vaksin
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vaccines.map(v => {
                const isOutOfStock = (v.stock || 0) <= 0;
                const isCritical = (v.stock || 0) < 10 && !isOutOfStock;

                return (
                  <div key={v.id} className="p-5 rounded-3xl border border-slate-200 bg-white flex flex-col justify-between shadow-sm hover:border-blue-200 transition-all gap-4">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm">{v.name}</h4>
                          {v.category && (
                            <span className="inline-block mt-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {v.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingVaccine({ ...v })}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Nama, Harga, atau Deskripsi"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVaccine(v.id, v.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Vaksin"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                        {v.description || 'Layanan vaksinasi resmi RSUD Al-Mulk'}
                      </p>

                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-black text-blue-700">Rp{v.price.toLocaleString('id-ID')}</span>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                            Stok Habis
                          </span>
                        ) : isCritical ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                            Kritis: {v.stock}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                            Tersedia: {v.stock}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-2.5 flex items-center justify-between gap-1.5 border border-slate-100">
                      <button 
                        onClick={() => updateVaccineStock(v.id, Math.max(0, (v.stock || 0) - 10))} 
                        className="px-2 py-1.5 bg-white rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer shadow-xs active:scale-95"
                        title="Kurangi 10"
                      >
                        -10
                      </button>
                      <button 
                        onClick={() => updateVaccineStock(v.id, Math.max(0, (v.stock || 0) - 1))} 
                        className="w-7 h-7 bg-white rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                        title="Kurangi 1"
                      >
                        -1
                      </button>
                      <input 
                        type="number" 
                        min={0}
                        value={v.stock} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          updateVaccineStock(v.id, Math.max(0, val));
                        }}
                        className="flex-1 bg-white border border-slate-300 rounded-xl py-1 text-center font-black text-xs text-slate-800 shadow-xs focus:outline-none focus:border-blue-500" 
                        title="Ubah angka stok langsung"
                      />
                      <button 
                        onClick={() => updateVaccineStock(v.id, (v.stock || 0) + 1)} 
                        className="w-7 h-7 bg-blue-50 rounded-xl font-bold text-xs text-blue-600 hover:bg-blue-100 border border-blue-200 flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                        title="Tambah 1"
                      >
                        +1
                      </button>
                      <button 
                        onClick={() => updateVaccineStock(v.id, (v.stock || 0) + 10)} 
                        className="px-2 py-1.5 bg-blue-600 rounded-xl font-bold text-xs text-white hover:bg-blue-700 cursor-pointer shadow-xs active:scale-95"
                        title="Tambah 10"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
             <div className="flex gap-2">
                <div className="flex-1 relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search size={16} />
                   </div>
                   <input 
                     type="text" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Cari nama pasien, NIK, atau no. passport..." 
                     className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-brand-500" 
                   />
                </div>
             </div>

             <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                {filteredBookings.slice().reverse().map((b, i) => {
                   const vax = vaccines.find(v => v.id === b.vaccineId);
                   return (
                   <div key={b.id} onClick={() => setSelectedPatient(b)} className={`p-4 flex flex-col gap-2 cursor-pointer hover:bg-slate-50 transition-colors ${i !== filteredBookings.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800 text-[14px]">{b.patient?.name}</p>
                              {b.patient?.document_status === 'perlu_revisi' && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                                  <AlertTriangle size={9} /> Revisi
                                </span>
                              )}
                              {b.patient?.document_status === 'terverifikasi' && (
                                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                                  <CheckCheck size={9} /> Terverifikasi
                                </span>
                              )}
                            </div>
                            <p className="text-[12px] font-medium text-slate-500 mt-0.5">Passport: {b.patient?.passport || b.patient?.no_passport || '-'}</p>
                         </div>
                         <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${b.status === 'menunggu' ? 'bg-orange-50 text-orange-600 border border-orange-100' : b.status === 'terverifikasi' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {b.status}
                         </div>
                      </div>
                      <div className="flex items-center justify-between mt-1 flex-wrap gap-1.5">
                         <div className="flex flex-wrap gap-1 max-w-[320px]">
                           {getBookingVaccines(b).map(v => (
                             <span key={v.id} className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                               {v.name}
                             </span>
                           ))}
                         </div>
                         <div className="text-[11px] font-bold text-slate-400">{b.date} • {b.time}</div>
                      </div>
                   </div>
                )})}
                {filteredBookings.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">Tidak ada data pasien yang cocok.</div>}
             </div>
          </div>
        )}
      </div>

      {/* Add Vaccine Modal */}
      {showAddVaccineModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Tambah Jenis Vaksin Baru</h3>
            <form onSubmit={handleAddVaccineSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Vaksin *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Vaksin Yellow Fever"
                  value={newVaccine.name}
                  onChange={(e) => setNewVaccine({ ...newVaccine, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Harga (Rp) *</label>
                  <input 
                    type="number" 
                    required
                    value={newVaccine.price}
                    onChange={(e) => setNewVaccine({ ...newVaccine, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stok Awal *</label>
                  <input 
                    type="number" 
                    required
                    value={newVaccine.stock}
                    onChange={(e) => setNewVaccine({ ...newVaccine, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                <select 
                  value={newVaccine.category}
                  onChange={(e) => setNewVaccine({ ...newVaccine, category: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="Wajib">Wajib</option>
                  <option value="Dianjurkan">Dianjurkan</option>
                  <option value="Rutin">Rutin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi</label>
                <textarea 
                  rows={2}
                  placeholder="Keterangan dosis atau ketentuan perjalanan..."
                  value={newVaccine.description}
                  onChange={(e) => setNewVaccine({ ...newVaccine, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddVaccineModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Simpan ke Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vaccine Modal */}
      {editingVaccine && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Edit3 size={18} className="text-blue-600" />
                Edit Data & Harga Vaksin
              </h3>
              <button 
                onClick={() => setEditingVaccine(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditVaccineSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Vaksin *</label>
                <input 
                  type="text" 
                  required
                  value={editingVaccine.name}
                  onChange={(e) => setEditingVaccine({ ...editingVaccine, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Harga (Rp) *</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    step={5000}
                    value={editingVaccine.price}
                    onChange={(e) => setEditingVaccine({ ...editingVaccine, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stok Tersedia *</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    value={editingVaccine.stock}
                    onChange={(e) => setEditingVaccine({ ...editingVaccine, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                <select 
                  value={editingVaccine.category || 'Wajib'}
                  onChange={(e) => setEditingVaccine({ ...editingVaccine, category: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Wajib">Wajib (Umroh / Haji / International Traveler)</option>
                  <option value="Dianjurkan">Dianjurkan</option>
                  <option value="Rutin">Rutin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi / Indikasi</label>
                <textarea 
                  rows={3}
                  value={editingVaccine.description || ''}
                  onChange={(e) => setEditingVaccine({ ...editingVaccine, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingVaccine(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Perbarui di Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center pb-0 sm:p-4">
            <div className="bg-white w-full sm:w-[560px] sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom-8">
               <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Detail Pasien & Verifikasi Dokumen</h3>
                    <p className="text-[11px] text-slate-400 font-medium">ID Reservasi: {selectedPatient.id}</p>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer">✕</button>
               </div>
               
               <div className="p-6 space-y-6">
                  {/* Document Status Banner */}
                  {selectedPatient.patient?.document_status === 'perlu_revisi' ? (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                        <span className="font-extrabold text-xs text-amber-900 uppercase tracking-wider">Status Dokumen: Perlu Revisi</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed pl-6">
                        Catatan dikirim: "{selectedPatient.patient?.revision_note || 'Dokumen belum sesuai persyaratan'}"
                      </p>
                    </div>
                  ) : selectedPatient.patient?.document_status === 'terverifikasi' ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCheck size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-emerald-900 block">Dokumen Sah & Terverifikasi</span>
                        <span className="text-[11px] text-emerald-700">Persyaratan identitas telah disetujui petugas</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Clock size={16} className="text-blue-600 shrink-0" />
                        <div>
                          <span className="font-bold text-xs text-blue-900 block">Menunggu Pemeriksaan Petugas</span>
                          <span className="text-[11px] text-blue-600">Periksa kejelasan foto KTP dan masa berlaku Paspor di bawah</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Biodata Section */}
                  <div>
                     <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Biodata Pelaku Perjalanan</p>
                     <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                           <p className="text-[11px] text-slate-500">Nama Lengkap</p>
                           <p className="font-bold text-[14px] text-slate-800">{selectedPatient.patient?.name}</p>
                        </div>
                        <div>
                           <p className="text-[11px] text-slate-500">NIK (KTP)</p>
                           <p className="font-bold text-[14px] text-slate-800">{selectedPatient.patient?.nik || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[11px] text-slate-500">No. Passport</p>
                           <p className="font-bold text-[14px] text-slate-800">{selectedPatient.patient?.passport || selectedPatient.patient?.passport_number || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[11px] text-slate-500">No. Handphone / WhatsApp</p>
                           <p className="font-bold text-[14px] text-slate-800">{selectedPatient.patient?.handphone || selectedPatient.patient?.no_hp || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[11px] text-slate-500">Tujuan Keberangkatan</p>
                           <p className="font-bold text-[14px] text-slate-800">{selectedPatient.patient?.purpose || 'Umroh / Haji'}</p>
                        </div>
                        <div className="col-span-2">
                           <p className="text-[11px] text-slate-500">Alamat</p>
                           <p className="font-bold text-[13px] text-slate-800">{selectedPatient.patient?.address || selectedPatient.patient?.alamat || '-'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Dokumen Lampiran (KTP & Passport) with Live Preview & Verification Controls */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pemeriksaan Dokumen Persyaratan</p>
                      <span className="text-[10px] font-semibold text-slate-500">Klik foto untuk perbesar</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Card KTP */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-blue-300 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <FileText size={15} className="text-blue-600" /> Foto KTP
                            </span>
                            {selectedPatient.patient?.ktp_url ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Diunggah</span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-md">Tidak ada</span>
                            )}
                          </div>

                          {/* Image preview thumbnail */}
                          {selectedPatient.patient?.ktp_url ? (
                            <div 
                              onClick={() => {
                                setZoomImageUrl(selectedPatient.patient.ktp_url);
                                setZoomImageTitle(`Foto KTP - ${selectedPatient.patient?.name}`);
                              }}
                              className="relative h-32 w-full bg-slate-200 rounded-xl overflow-hidden mb-2.5 cursor-pointer group border border-slate-300/80"
                            >
                              <img 
                                src={selectedPatient.patient.ktp_url} 
                                alt="KTP Pasien" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-all"
                              />
                              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs backdrop-blur-xs">
                                <ZoomIn size={16} /> Perbesar KTP
                              </div>
                            </div>
                          ) : (
                            <div className="h-24 bg-slate-100 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 mb-2.5">
                              <FileWarning size={20} className="mb-1" />
                              <span className="text-[11px] font-medium">KTP belum diunggah</span>
                            </div>
                          )}

                          <p className="text-[11px] text-slate-500 truncate mb-3">
                            {selectedPatient.patient?.ktp_file_name || selectedPatient.patient?.ktp_file || (selectedPatient.patient?.ktp_url ? 'KTP_Document.jpg' : '-')}
                          </p>
                        </div>

                        {selectedPatient.patient?.ktp_url && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setZoomImageUrl(selectedPatient.patient.ktp_url);
                                setZoomImageTitle(`Foto KTP - ${selectedPatient.patient?.name}`);
                              }}
                              className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                            >
                              <ZoomIn size={13} /> Zoom
                            </button>
                            <a 
                              href={selectedPatient.patient.ktp_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <ExternalLink size={13} /> Asli
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Card Paspor */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-purple-300 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <FileText size={15} className="text-purple-600" /> Foto Paspor
                            </span>
                            {selectedPatient.patient?.passport_url ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Diunggah</span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-md">Tidak ada</span>
                            )}
                          </div>

                          {/* Image preview thumbnail */}
                          {selectedPatient.patient?.passport_url ? (
                            <div 
                              onClick={() => {
                                setZoomImageUrl(selectedPatient.patient.passport_url);
                                setZoomImageTitle(`Foto Paspor - ${selectedPatient.patient?.name}`);
                              }}
                              className="relative h-32 w-full bg-slate-200 rounded-xl overflow-hidden mb-2.5 cursor-pointer group border border-slate-300/80"
                            >
                              <img 
                                src={selectedPatient.patient.passport_url} 
                                alt="Paspor Pasien" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-all"
                              />
                              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs backdrop-blur-xs">
                                <ZoomIn size={16} /> Perbesar Paspor
                              </div>
                            </div>
                          ) : (
                            <div className="h-24 bg-slate-100 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 mb-2.5">
                              <FileWarning size={20} className="mb-1" />
                              <span className="text-[11px] font-medium">Paspor belum diunggah</span>
                            </div>
                          )}

                          <p className="text-[11px] text-slate-500 truncate mb-3">
                            {selectedPatient.patient?.passport_file_name || selectedPatient.patient?.passport_file || (selectedPatient.patient?.passport_url ? 'Passport_Document.jpg' : '-')}
                          </p>
                        </div>

                        {selectedPatient.patient?.passport_url && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setZoomImageUrl(selectedPatient.patient.passport_url);
                                setZoomImageTitle(`Foto Paspor - ${selectedPatient.patient?.name}`);
                              }}
                              className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                            >
                              <ZoomIn size={13} /> Zoom
                            </button>
                            <a 
                              href={selectedPatient.patient.passport_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <ExternalLink size={13} /> Asli
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for Document Review (Approve or Request Revision) */}
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 space-y-3">
                      <p className="text-xs font-bold text-slate-700">Tindakan Petugas terhadap Dokumen:</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={handleApproveDocument}
                          className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                        >
                          <FileCheck size={16} />
                          <span>Dokumen Sesuai & Valid</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenRevisionModal}
                          className="py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                        >
                          <MessageSquare size={16} />
                          <span>Minta Perbaikan / Kirim Pesan</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 text-center">
                        Pesan perbaikan yang dikirim akan otomatis masuk ke menu <strong>Notifikasi</strong> pada akun pengguna yang bersangkutan.
                      </p>
                    </div>
                  </div>

                  {/* Vaccine & Schedule */}
                  <div>
                     <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Detail Vaksinasi & Jadwal</p>
                     <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[11px] text-slate-500 mb-1.5">Jenis Vaksin Dipilih ({getBookingVaccines(selectedPatient).length} Jenis)</p>
                        <div className="space-y-1.5 mb-3">
                          {getBookingVaccines(selectedPatient).map(v => (
                            <div key={v.id} className="bg-white p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-xs text-slate-800 block">{v.name}</span>
                                {v.category && <span className="text-[10px] text-slate-400">Kategori: {v.category}</span>}
                              </div>
                              <span className="text-xs font-bold text-blue-700">Rp{v.price.toLocaleString('id-ID')}</span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-[11px] text-slate-500">Tanggal & Jam</p>
                              <p className="font-bold text-[14px] text-slate-800">{selectedPatient.date} {selectedPatient.time}</p>
                           </div>
                           <div>
                              <p className="text-[11px] text-slate-500">Status Reservasi</p>
                              <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${selectedPatient.status === 'selesai' || selectedPatient.status === 'terverifikasi' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                 {selectedPatient.status}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {(selectedPatient.status === 'terverifikasi' || selectedPatient.status === 'selesai') && (
                     <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Kirim Sertifikat (E-ICV)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-3 rounded-xl border border-emerald-200 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer">
                              <Share2 size={18} />
                              <span className="text-[10px] font-bold">WhatsApp</span>
                           </button>
                           <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-xl border border-blue-200 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer">
                              <Mail size={18} />
                              <span className="text-[10px] font-bold">Email</span>
                           </button>
                           <button className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-3 rounded-xl border border-rose-200 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer">
                              <Download size={18} />
                              <span className="text-[10px] font-bold">Unduh PDF</span>
                           </button>
                           <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer">
                              <Printer size={18} />
                              <span className="text-[10px] font-bold">Print</span>
                           </button>
                        </div>
                     </div>
                  )}
               </div>
               
               <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto rounded-b-3xl">
                  <button onClick={() => setSelectedPatient(null)} className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">Tutup</button>
               </div>
            </div>
         </div>
      )}

      {/* Modal Kirim Perintah / Pesan Revisi ke Pengguna */}
      {showRevisionModal && selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Perintah Revisi Dokumen</h3>
                  <p className="text-[11px] text-slate-500">Pasien: <strong className="text-slate-700">{selectedPatient.patient?.name}</strong></p>
                </div>
              </div>
              <button 
                onClick={() => setShowRevisionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRevisionSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Pilih Dokumen yang Belum Sesuai:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRevisionDocType('ktp')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      revisionDocType === 'ktp' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    KTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevisionDocType('passport')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      revisionDocType === 'passport' 
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Paspor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevisionDocType('all')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      revisionDocType === 'all' 
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    KTP & Paspor
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Pilih Alasan Cepat (Template):
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {revisionPresets.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setRevisionMessage(preset)}
                      className="p-2 text-[11px] bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200 rounded-xl cursor-pointer text-slate-700 transition-colors leading-relaxed"
                    >
                      • {preset}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Pesan / Instruksi untuk Pengguna *
                </label>
                <textarea
                  required
                  rows={3}
                  value={revisionMessage}
                  onChange={(e) => setRevisionMessage(e.target.value)}
                  placeholder="Tulis instruksi perbaikan yang jelas untuk pendaftar..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all leading-relaxed"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[11px] text-amber-900 leading-relaxed">
                Pesan ini akan langsung diteruskan ke menu <strong>Notifikasi</strong> di aplikasi pengguna dan pengguna dapat mengunggah dokumen baru langsung dari notifikasi tersebut.
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSendingRevision || !revisionMessage.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs rounded-xl shadow-md hover:from-amber-600 hover:to-orange-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingRevision ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  <span>Kirim Perintah ke Pengguna</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Image Modal */}
      {zoomImageUrl && (
        <div 
          onClick={() => setZoomImageUrl(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-4 animate-in fade-in cursor-zoom-out"
        >
          <div className="w-full max-w-2xl flex justify-between items-center text-white mb-3 px-2" onClick={(e) => e.stopPropagation()}>
            <span className="font-bold text-sm">{zoomImageTitle || 'Pratinjau Dokumen'}</span>
            <button 
              onClick={() => setZoomImageUrl(null)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="max-w-3xl max-h-[80vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img 
              src={zoomImageUrl} 
              alt="Pratinjau Dokumen" 
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

