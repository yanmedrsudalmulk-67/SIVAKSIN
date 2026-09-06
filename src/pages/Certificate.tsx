import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Award, Download, Share2, Mail, Printer, ShieldCheck, 
  Clock, FileText, CheckCircle2, ExternalLink, Eye, AlertCircle, Sparkles 
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';
import QRCode from 'react-qr-code';
import { motion } from 'motion/react';

export default function Certificate() {
  const navigate = useNavigate();
  const { user, bookings, vaccines } = useAppStore();
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Find user's latest verified booking for the certificate
  const certBooking = useMemo(() => {
    return bookings.slice().reverse().find(b => b.status === "terverifikasi" || b.status === "selesai");
  }, [bookings]);

  // Check whether Admin has uploaded official E-ICV document
  const isOfficialEicvIssued = Boolean(certBooking?.patient?.e_icv_url);
  const officialEicvUrl = certBooking?.patient?.e_icv_url;
  const officialEicvFileName = certBooking?.patient?.e_icv_file_name || 'Sertifikat_E-ICV_Resmi.pdf';
  const officialEicvIssuedAt = certBooking?.patient?.e_icv_issued_at;

  const certVaccines = useMemo(() => {
    if (!certBooking) return [];
    const ids = Array.isArray(certBooking.vaccineIds) && certBooking.vaccineIds.length > 0
      ? certBooking.vaccineIds
      : (Array.isArray(certBooking.patient?.selectedVaccines) && certBooking.patient.selectedVaccines.length > 0)
        ? certBooking.patient.selectedVaccines
        : (certBooking.vaccineId ? [certBooking.vaccineId] : []);
    
    const matched = vaccines.filter(v => ids.includes(v.id));
    if (matched.length > 0) return matched;
    const single = vaccines.find(v => v.id === certBooking.vaccineId);
    return single ? [single] : [{ id: 'unknown', name: 'Vaksinasi Internasional', price: 0 }];
  }, [certBooking, vaccines]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsapp = () => {
    if (!certBooking) return;
    const patientName = certBooking.patient?.name || user?.name || 'Jamaah';
    const text = encodeURIComponent(
      `Halo, ini bukti Sertifikat Vaksinasi Internasional (E-ICV) atas nama ${patientName} dari UOBK RSUD Al-Mulk Kota Sukabumi.` +
      (officialEicvUrl ? `\nDokumen resmi dapat diakses di: ${officialEicvUrl}` : '')
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header Premium */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-500 text-white pt-safe pb-12 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0 z-10 transition-all">
        <div className="absolute top-0 right-0 w-full h-[150%] opacity-[0.05] bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-[center_top_-20px] bg-cover mix-blend-screen pointer-events-none"></div>
        {/* Soft Glow */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6 relative z-10 mt-4">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-95 transition-transform hover:bg-white/20 cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="font-extrabold text-sm tracking-widest uppercase text-emerald-200">
              SIVAKSIN CERTIFICATE
            </span>
            <div className="w-10 h-10"></div>
          </div>
          
          <div className="relative z-10 text-center flex flex-col items-center justify-center mt-2">
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[26px] flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.15)] mb-3 relative"
            >
              <div className="absolute inset-0 rounded-[26px] bg-gradient-to-tr from-white/5 to-white/20 pointer-events-none"></div>
              <Award size={40} className="text-white drop-shadow-md stroke-[1.5px] relative z-10" />
              {isOfficialEicvIssued && (
                <ShieldCheck size={20} className="text-emerald-300 absolute -bottom-1 -right-1 drop-shadow-md z-10 fill-emerald-950" />
              )}
            </motion.div>
            <h1 className="text-white text-lg font-black tracking-tight">
              Electronic International Certificate Vaccine
            </h1>
            <p className="text-emerald-100 text-[11px] opacity-90 leading-relaxed font-semibold uppercase tracking-wider mt-1">
              UOBK RSUD Al-Mulk Kota Sukabumi
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 relative z-20 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        
        {/* CASE 1: Belum ada pendaftaran vaksin */}
        {!certBooking ? (
          <div className="bg-white rounded-[28px] p-8 text-center shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <Award size={34} />
            </div>
            <h3 className="text-slate-800 font-extrabold text-lg mb-2">Belum Tersedia</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto mb-6">
              Anda belum memiliki pendaftaran vaksinasi internasional yang aktif. Silakan ajukan permohonan melalui menu Booking Vaksinasi.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles size={16} /> Booking Vaksinasi Sekarang
            </button>
          </div>
        ) : !isOfficialEicvIssued ? (
          /* CASE 2: Booking ada, tapi E-ICV belum diunggah petugas medis */
          <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-amber-200/80 relative overflow-hidden">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200/70 shadow-xs">
              <Clock size={32} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px] uppercase tracking-wider mx-auto mb-3">
              <Clock size={12} /> Menunggu Proses Petugas
            </div>

            <h3 className="text-slate-900 font-extrabold text-lg sm:text-xl mb-2 text-center">
              E-ICV belum diterbitkan oleh petugas medis
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed text-center max-w-md mx-auto mb-6">
              Data pendaftaran dan rekam medis Anda telah tersimpan di sistem. Sertifikat resmi E-ICV akan diunggah oleh petugas medis UOBK RSUD Al-Mulk setelah seluruh tahapan skrining dan penyuntikan vaksin selesai divalidasi.
            </p>

            {/* Status ringkasan booking */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Nama Pasien:</span>
                <strong className="text-slate-800 font-bold">{certBooking.patient?.name}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">No. Passport:</span>
                <strong className="text-slate-800 font-bold">{certBooking.patient?.passport || certBooking.patient?.no_passport || '-'}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Jadwal Vaksinasi:</span>
                <strong className="text-slate-800 font-bold">{certBooking.date} • {certBooking.time}</strong>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Status Reservasi:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase text-[10px]">
                  {certBooking.status}
                </span>
              </div>
            </div>

            <div className="mt-5 p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center gap-3 text-xs text-blue-900">
              <AlertCircle size={18} className="text-blue-600 shrink-0" />
              <span>Anda akan menerima <strong>notifikasi otomatis</strong> di akun Anda begitu sertifikat resmi E-ICV diterbitkan.</span>
            </div>
          </div>
        ) : (
          /* CASE 3: E-ICV Resmi telah diterbitkan oleh Admin */
          <div className="space-y-4">
            {/* Banner Penerbitan Resmi */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-[26px] p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                  <CheckCircle2 size={26} className="text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
                      Resmi Diterbitkan
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    Sertifikat E-ICV Siap Digunakan
                  </h3>
                  <p className="text-emerald-100 text-xs mt-0.5">
                    File: <span className="font-semibold underline">{officialEicvFileName}</span>
                    {officialEicvIssuedAt && (
                      <span className="opacity-80"> • {new Date(officialEicvIssuedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Tombol Utama Lihat / Unduh Dokumen Resmi */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={officialEicvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} className="text-emerald-700" />
                  <span>Lihat / Unduh Dokumen Resmi</span>
                </a>
              </div>
            </div>

            {/* Kartu E-ICV Elektronik dengan QR Code Standar */}
            <div className="bg-white rounded-[28px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-100/70 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
              <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-[100px] opacity-70 pointer-events-none"></div>
              
              {/* Verified Badge */}
              <div className="flex justify-center mb-6 relative">
                <div className="py-2 px-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-2 shadow-sm">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">Verified International Certificate</span>
                </div>
              </div>

              <div className="flex flex-col mb-6">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Identitas Pemegang Sertifikat</p>
                <h3 className="font-extrabold text-slate-800 text-[18px] tracking-tight">{certBooking.patient?.name || user?.name || 'Jamaah'}</h3>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <p className="text-xs font-semibold text-slate-600">NIK: <span className="text-slate-800 font-bold">{certBooking.patient?.nik || '-'}</span></p>
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <p className="text-xs font-semibold text-slate-600">Passport: <span className="text-slate-800 font-bold">{certBooking.patient?.passport || certBooking.patient?.no_passport || '-'}</span></p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 relative">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Detail Vaksinasi Internasional ({certVaccines.length} Jenis)</p>
                 <div className="space-y-1.5 mb-3">
                   {certVaccines.map(v => (
                     <div key={v.id} className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                       <span className="font-bold text-slate-800 text-xs">{v.name}</span>
                       {v.category && (
                         <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                           {v.category}
                         </span>
                       )}
                     </div>
                   ))}
                 </div>
                 
                 <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Tanggal Pelayanan</p>
                      <p className="font-bold text-slate-700">{certBooking.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Fasilitas Penerbit</p>
                      <p className="font-bold text-slate-700 leading-tight">UOBK RSUD Al-Mulk Kota Sukabumi</p>
                    </div>
                 </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 rounded-2xl mb-4 relative bg-white">
                <QRCode 
                   value={`https://sivaksin.kotasukabumi.go.id/verify/${certBooking.id}`}
                   size={140}
                   bgColor="#ffffff"
                   fgColor="#0f172a"
                   level="M"
                />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3">Scan to Verify Authenticity</p>
              </div>
              
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Status Validasi</span>
                <div className="px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
                   <CheckCircle2 size={12} /> Valid & Terdaftar
                </div>
              </div>
            </div>

            {/* Tombol Aksi Download & Share */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
               <a 
                 href={officialEicvUrl} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-emerald-300 group cursor-pointer"
               >
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Download size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">Unduh E-ICV</span>
               </a>

               <button 
                 onClick={handleShareWhatsapp} 
                 className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-emerald-300 group cursor-pointer"
               >
                  <div className="w-11 h-11 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Share2 size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">Share WA</span>
               </button>

               <button 
                 onClick={() => setShowPreviewModal(true)} 
                 className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-blue-300 group cursor-pointer"
               >
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Eye size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">Preview</span>
               </button>

               <button 
                 onClick={handlePrint} 
                 className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-slate-300 group cursor-pointer"
               >
                  <div className="w-11 h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Printer size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">Print</span>
               </button>
            </div>
          </div>
        )}

      </div>

      {/* Document In-App Preview Modal */}
      {showPreviewModal && officialEicvUrl && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-emerald-400" />
                <span className="font-extrabold text-sm">Dokumen Resmi E-ICV</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={officialEicvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Buka Tab Baru
                </a>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center min-h-[400px]">
              {officialEicvUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={officialEicvUrl}
                  title="Official E-ICV Document"
                  className="w-full h-[550px] rounded-xl border border-slate-300"
                />
              ) : (
                <img
                  src={officialEicvUrl}
                  alt="Official E-ICV"
                  className="max-h-[550px] max-w-full rounded-xl object-contain shadow-md"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
