import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, CheckCircle2, AlertTriangle, FileText, ArrowLeft, Trash2, 
  UploadCloud, ExternalLink, RefreshCw, Clock, Check, ChevronRight,
  ShieldAlert, Info, Sparkles, X, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, AppNotification } from '../store/AppContext';
import { uploadFileToSupabase } from '../services/supabaseStorageService';
import { isSupabaseConfigured } from '../lib/supabase';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Notifications() {
  const navigate = useNavigate();
  const { 
    user, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification,
    reuploadDocument,
    bookings
  } = useAppStore();

  const [filter, setFilter] = useState<'all' | 'revisi' | 'unread'>('all');
  
  // Reupload Modal state
  const [activeRevisionNotif, setActiveRevisionNotif] = useState<AppNotification | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Filter notifications for this user or broadcast
  const userNotifications = notifications.filter(n => {
    if (!n.userId) return true;
    if (!user) return true;
    return n.userId === user.id || n.userId === user.nik || n.userId === user.email || n.userId === 'user';
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const filteredNotifications = userNotifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'revisi') return n.type === 'document_revision';
    return true;
  });

  const handleOpenReuploadModal = (notif: AppNotification) => {
    setActiveRevisionNotif(notif);
    setSelectedFile(null);
    setUploadSuccess(false);
    setUploadError(null);
    if (!notif.read) {
      markNotificationAsRead(notif.id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleSubmitReupload = async () => {
    if (!selectedFile || !activeRevisionNotif) {
      setUploadError('Silakan pilih file foto / dokumen terlebih dahulu.');
      return;
    }

    const bookingId = activeRevisionNotif.bookingId || bookings[0]?.id;
    if (!bookingId) {
      setUploadError('Data booking tidak ditemukan.');
      return;
    }

    const docType = activeRevisionNotif.documentType === 'passport' ? 'passport' : 'ktp';

    setIsUploading(true);
    setUploadError(null);

    try {
      let fileUrl = URL.createObjectURL(selectedFile);
      if (isSupabaseConfigured) {
        const uploadRes = await uploadFileToSupabase(selectedFile, 'documents', `${docType}_revisi`);
        if (uploadRes.url) {
          fileUrl = uploadRes.url;
        }
      }

      await reuploadDocument(bookingId, docType, fileUrl, selectedFile.name);
      setUploadSuccess(true);
      setTimeout(() => {
        setActiveRevisionNotif(null);
        setUploadSuccess(false);
      }, 2000);
    } catch (err: any) {
      setUploadError('Gagal mengunggah dokumen: ' + (err.message || 'Kesalahan jaringan'));
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Baru saja';
    try {
      return formatDistanceToNow(parseISO(isoString), { addSuffix: true, locale: id });
    } catch (e) {
      return 'Baru saja';
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-28">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#0F3DDE] to-[#10487D] text-white px-6 pt-12 pb-6 sticky top-0 z-40 rounded-b-[32px] shadow-lg">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="text-center">
            <h1 className="font-extrabold text-lg text-white">Notifikasi & Pesan</h1>
            <p className="text-[11px] text-blue-200">Pemberitahuan & Perintah Petugas</p>
          </div>

          <button 
            onClick={() => markAllNotificationsAsRead()} 
            title="Tandai semua dibaca"
            className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer text-xs font-bold"
          >
            <Check size={18} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-5 bg-black/15 p-1 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              filter === 'all' ? 'bg-white text-[#0F3DDE] shadow-sm' : 'text-blue-100 hover:text-white'
            }`}
          >
            Semua ({userNotifications.length})
          </button>
          <button
            onClick={() => setFilter('revisi')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              filter === 'revisi' ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-blue-100 hover:text-white'
            }`}
          >
            <AlertTriangle size={13} />
            Perintah Revisi
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              filter === 'unread' ? 'bg-white text-[#0F3DDE] shadow-sm' : 'text-blue-100 hover:text-white'
            }`}
          >
            Belum Dibaca {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 pt-6 max-w-lg mx-auto space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-[28px] p-8 text-center border border-slate-100 shadow-sm mt-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Bell size={28} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base mb-1">Belum Ada Notifikasi</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Semua instruksi verifikasi dokumen, konfirmasi jadwal, dan status vaksinasi akan ditampilkan di sini.
            </p>
          </div>
        ) : (
          filteredNotifications.map(notif => {
            const isRevision = notif.type === 'document_revision';
            const isVerified = notif.type === 'document_verified';

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-[24px] p-5 border transition-all shadow-sm relative overflow-hidden ${
                  !notif.read ? 'border-blue-200 ring-2 ring-blue-500/10' : 'border-slate-100'
                } ${isRevision ? 'bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30' : ''}`}
                onClick={() => {
                  if (!notif.read) markNotificationAsRead(notif.id);
                }}
              >
                {/* Status bar left accent */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                  isRevision ? 'bg-amber-500' : isVerified ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />

                <div className="pl-2">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isRevision 
                          ? 'bg-amber-100 text-amber-700' 
                          : isVerified 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isRevision ? <AlertTriangle size={16} /> : isVerified ? <CheckCircle2 size={16} /> : <Info size={16} />}
                      </div>
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isRevision 
                            ? 'bg-amber-100 text-amber-800' 
                            : isVerified 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-blue-50 text-blue-700'
                        }`}>
                          {isRevision ? 'Perintah Revisi Dokumen' : isVerified ? 'Dokumen Sesuai' : 'Informasi Pelayanan'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {formatTime(notif.createdAt)}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Hapus notifikasi"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-slate-800 text-sm mb-1.5">{notif.title}</h4>
                  
                  {/* Message body */}
                  <div className={`text-xs text-slate-600 leading-relaxed p-3 rounded-2xl mb-3 ${
                    isRevision ? 'bg-amber-500/10 border border-amber-200/60 font-medium text-amber-950' : 'bg-slate-50'
                  }`}>
                    {notif.message}
                  </div>

                  {/* Admin Signature & Action */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Sparkles size={11} className="text-blue-500" />
                      {notif.adminName || 'Admin RSUD Al-Mulk'}
                    </span>

                    {isRevision && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReuploadModal(notif);
                        }}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md hover:from-amber-600 hover:to-orange-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <UploadCloud size={14} />
                        <span>Upload Ulang Dokumen</span>
                      </button>
                    )}

                    {isVerified && (
                      <button
                        onClick={() => navigate('/status')}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Lihat Bukti Pendaftaran</span>
                        <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal Upload Ulang Dokumen */}
      <AnimatePresence>
        {activeRevisionNotif && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Unggah Revisi Dokumen</h3>
                    <p className="text-[11px] text-slate-500">Perbaikan dokumen persyaratan vaksinasi</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveRevisionNotif(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {uploadSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-base mb-1">Dokumen Berhasil Dikirim!</h4>
                  <p className="text-xs text-slate-500">
                    Tim Medis RSUD Al-Mulk akan memverifikasi ulang dokumen Anda secepatnya.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Admin instruction reminder box */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-1">
                      Catatan Perbaikan dari Petugas:
                    </span>
                    <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                      "{activeRevisionNotif.message}"
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Pilih Foto / Dokumen Baru ({activeRevisionNotif.documentType === 'passport' ? 'Paspor' : 'KTP'})
                    </label>
                    
                    <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-5 text-center bg-slate-50 hover:bg-blue-50/20 transition-all cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-2 border border-slate-100">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">
                        {selectedFile ? selectedFile.name : 'Ketuk untuk memilih foto dokumen'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Format JPG, PNG, atau PDF (Maks. 5MB). Pastikan tulisan terbaca jelas.
                      </p>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
                      {uploadError}
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveRevisionNotif(null)}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitReupload}
                      disabled={isUploading || !selectedFile}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
                      <span>Kirim Dokumen Baru</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
