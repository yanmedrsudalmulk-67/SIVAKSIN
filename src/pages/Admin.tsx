import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { 
  Users, Syringe, Calendar, ArrowLeft, Download, CheckCircle, Search, Filter, 
  Share2, Mail, Printer, Cloud, RefreshCw, FileText, ExternalLink, Plus, 
  CheckCircle2, Clock, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { 
    bookings, 
    vaccines, 
    updateBookingStatus, 
    updateVaccineStock, 
    addVaccine,
    isSupabaseOnline, 
    refreshAllCloudData,
    isLoadingCloud 
  } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'stock' | 'history'>('bookings');
  
  // Modal states
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [showAddVaccineModal, setShowAddVaccineModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Vaccine Form
  const [newVaccine, setNewVaccine] = useState({
    name: '',
    description: '',
    price: 350000,
    stock: 50,
    category: 'Wajib' as const,
    protectionDuration: 'Seumur Hidup / 10 Tahun'
  });

  const handleAddVaccineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccine.name.trim()) return;

    await addVaccine({
      id: `vax_${Date.now()}`,
      name: newVaccine.name,
      description: newVaccine.description || `Vaksin ${newVaccine.name} untuk perlindungan internasional`,
      price: Number(newVaccine.price),
      stock: Number(newVaccine.stock),
      category: newVaccine.category,
      protectionDuration: newVaccine.protectionDuration
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
                      <div className="text-xs font-semibold text-brand-700 mt-1">
                        {vaccines.find(v => v.id === b.vaccineId)?.name || 'Vaksinasi'}
                      </div>
                      {(b.patient?.ktp_url || b.patient?.passport_url) && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {b.patient?.ktp_url && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                              <FileText size={10} /> KTP Tersedia
                            </span>
                          )}
                          {b.patient?.passport_url && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                              <FileText size={10} /> Passport Tersedia
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

        {activeTab === 'stock' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800">Manajemen Stok & Harga Vaksin</h3>
              <button 
                onClick={() => setShowAddVaccineModal(true)}
                className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus size={14} /> Tambah Vaksin
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vaccines.map(v => (
                <div key={v.id} className="glass-card p-4 rounded-2xl border border-slate-100 bg-white flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="font-bold text-slate-800 mb-1">{v.name}</div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-medium text-slate-500">Harga: Rp{v.price.toLocaleString('id-ID')}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-100 ${v.stock < 50 ? 'text-orange-500' : 'text-health-500'}`}>Stok: {v.stock}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateVaccineStock(v.id, Math.max(0, v.stock - 10))} className="w-10 h-10 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 cursor-pointer">-10</button>
                    <input type="number" value={v.stock} readOnly className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 text-center font-bold text-slate-700" />
                    <button onClick={() => updateVaccineStock(v.id, v.stock + 10)} className="w-10 h-10 bg-brand-50 rounded-xl font-bold text-brand-600 hover:bg-brand-100 cursor-pointer">+10</button>
                  </div>
                </div>
              ))}
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
                            <p className="font-bold text-slate-800 text-[14px]">{b.patient?.name}</p>
                            <p className="text-[12px] font-medium text-slate-500 mt-0.5">Passport: {b.patient?.passport || b.patient?.no_passport || '-'}</p>
                         </div>
                         <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${b.status === 'menunggu' ? 'bg-orange-50 text-orange-600 border border-orange-100' : b.status === 'terverifikasi' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {b.status}
                         </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                         <div className="text-[11px] font-bold text-slate-600 truncate bg-slate-100 px-2 py-1 rounded-lg max-w-[200px]">{vax?.name}</div>
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
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 cursor-pointer"
                >
                  Simpan ke Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center pb-0 sm:p-4">
            <div className="bg-white w-full sm:w-[520px] sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom-8">
               <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
                  <h3 className="font-bold text-slate-800 text-lg">Detail Pasien & Dokumen</h3>
                  <button onClick={() => setSelectedPatient(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">✕</button>
               </div>
               
               <div className="p-6 space-y-6">
                  <div>
                     <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Biodata Pasien</p>
                     <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                           <p className="text-[11px] text-slate-500">Nama Lengkap</p>
                           <p className="font-bold text-[14px] text-slate-800">{selectedPatient.patient?.name}</p>
                        </div>
                        <div>
                           <p className="text-[11px] text-slate-500">NIK</p>
                           <p className="font-bold text-[14px] text-slate-800">{selectedPatient.patient?.nik || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[11px] text-slate-500">No. Passport</p>
                           <p className="font-bold text-[14px] text-slate-800">{selectedPatient.patient?.passport || selectedPatient.patient?.passport_number || '-'}</p>
                        </div>
                        <div>
                           <p className="text-[11px] text-slate-500">No. Handphone</p>
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

                  {/* Dokumen Lampiran (KTP & Passport) */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Dokumen Lampiran (Supabase Storage)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              <FileText size={14} className="text-blue-600" /> KTP
                            </span>
                            {selectedPatient.patient?.ktp_url ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Tersedia</span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">Tidak ada</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mb-3">
                            {selectedPatient.patient?.ktp_file_name || selectedPatient.patient?.ktp_file || (selectedPatient.patient?.ktp_url ? 'KTP_Document.jpg' : 'Belum diunggah')}
                          </p>
                        </div>
                        {selectedPatient.patient?.ktp_url && (
                          <a 
                            href={selectedPatient.patient.ktp_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ExternalLink size={12} /> Buka KTP Asli
                          </a>
                        )}
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              <FileText size={14} className="text-purple-600" /> Passport
                            </span>
                            {selectedPatient.patient?.passport_url ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Tersedia</span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">Tidak ada</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mb-3">
                            {selectedPatient.patient?.passport_file_name || selectedPatient.patient?.passport_file || (selectedPatient.patient?.passport_url ? 'Passport_Document.jpg' : 'Belum diunggah')}
                          </p>
                        </div>
                        {selectedPatient.patient?.passport_url && (
                          <a 
                            href={selectedPatient.patient.passport_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ExternalLink size={12} /> Buka Passport Asli
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                     <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Detail Vaksinasi & Jadwal</p>
                     <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[11px] text-slate-500 mb-1">Jenis Vaksin</p>
                        <p className="font-bold text-[14px] text-slate-800 mb-3">{vaccines.find(v => v.id === selectedPatient.vaccineId)?.name}</p>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-[11px] text-slate-500">Tanggal & Jam</p>
                              <p className="font-bold text-[14px] text-slate-800">{selectedPatient.date} {selectedPatient.time}</p>
                           </div>
                           <div>
                              <p className="text-[11px] text-slate-500">Status</p>
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
                  <button onClick={() => setSelectedPatient(null)} className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">Tutup</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

