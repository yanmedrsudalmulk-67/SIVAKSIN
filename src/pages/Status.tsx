import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Clock, MapPin, UploadCloud, MessageCircle, AlertCircle, Syringe, Calendar } from 'lucide-react';
import { useAppStore } from '../store/AppContext';

export default function Status() {
  const navigate = useNavigate();
  const { user } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header Premium */}
      <div className="bg-gradient-to-br from-[#0a192f] via-brand-800 to-[#1e3a8a] text-white pt-safe pb-8 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0 z-10 transition-all">
        <div className="absolute top-0 right-0 w-full h-[150%] opacity-[0.05] bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-[center_top_-20px] bg-cover mix-blend-screen pointer-events-none"></div>
        <div className="flex items-center justify-between mb-8 relative z-10 mt-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-95 transition-transform hover:bg-white/20">
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-bold text-lg tracking-wide uppercase drop-shadow-sm">Cek Status</h2>
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 pointer-events-none"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-1 drop-shadow-md">Status Vaksinasi</h1>
          <p className="text-brand-100 text-[13px] opacity-90 leading-relaxed font-medium">
            Pantau progress pendaftaran dan jadwal vaksin Anda
          </p>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20 flex flex-col gap-6">
        
        {/* Countdown Reminder */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-[24px] p-5 text-white flex items-center gap-4 shadow-lg shadow-orange-500/20">
           <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shrink-0">
             <Calendar size={24} className="text-white" />
           </div>
           <div>
             <h3 className="font-extrabold text-[14px]">Vaksinasi dalam 2 hari!</h3>
             <p className="text-[11px] font-medium text-orange-50 mt-0.5">Persiapkan fisik Anda dan bawa KTP asli.</p>
           </div>
        </div>

        {/* Detail Booking */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-100/50">
           <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <div>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">ID Booking</span>
                 <span className="font-black text-slate-800 text-[14px] font-mono">BKG-99281-X</span>
              </div>
              <div className="w-10 h-10 bg-brand-50 rounded-2xl text-brand-600 flex items-center justify-center">
                 <Syringe size={20} />
               </div>
           </div>
           
           <div className="space-y-4">
              <div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nama Pasien</p>
                 <p className="text-[14px] font-bold text-slate-700">{user?.name || 'Jamaah'}</p>
              </div>
              <div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Jenis Vaksin</p>
                 <p className="text-[14px] font-bold text-slate-700">Meningitis & Influenza</p>
              </div>
              <div className="flex gap-6 relative">
                 <div className="flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Tanggal</p>
                    <p className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5"><Calendar size={14} className="text-brand-500"/> 12 Ags 2024</p>
                 </div>
                 <div className="w-[1px] bg-slate-100 absolute left-1/2 top-0 bottom-0"></div>
                 <div className="flex-1 pl-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Waktu</p>
                    <p className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5"><Clock size={14} className="text-brand-500"/> 09:00 WIB</p>
                 </div>
              </div>
              <div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Lokasi</p>
                 <p className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5"><MapPin size={14} className="text-brand-500"/> Klinik RSUD Al-Mulk, Ruang 2A</p>
              </div>
           </div>
        </div>

        {/* Status Dokumen & Pembayaran */}
        <div className="grid grid-cols-2 gap-4">
           {/* Upload Progress */}
           <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-[80px] opacity-70 pointer-events-none"></div>
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                 <AlertCircle size={16} strokeWidth={2.5}/>
              </div>
              <h4 className="font-extrabold text-[13px] text-slate-800 mb-1">Dokumen KTP</h4>
              <p className="text-[10px] text-slate-500 mb-3">KTP belum diunggah.</p>
              <button className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors uppercase tracking-wider">
                 <UploadCloud size={14} /> Upload
              </button>
           </div>
           
           {/* Pembayaran */}
           <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-[80px] opacity-70 pointer-events-none"></div>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                 <CheckCircle2 size={16} strokeWidth={2.5}/>
              </div>
              <h4 className="font-extrabold text-[13px] text-slate-800 mb-1">Pembayaran</h4>
              <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded uppercase tracking-wider mb-3">Lunas</p>
              <button className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors uppercase tracking-wider" disabled>
                 Lihat Nota
              </button>
           </div>
        </div>

        {/* Timeline Status (Vertical Stepper) */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-100/50">
           <h3 className="font-extrabold text-slate-800 text-[15px] mb-6 tracking-tight">Timeline Proses</h3>
           <div className="relative pl-6 space-y-8">
              <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-slate-100"></div>

              {/* Step 1 */}
              <div className="relative">
                 <div className="absolute -left-6 top-0.5 w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center z-10 ring-4 ring-white shadow-sm border border-[#16a34a]">
                    <CheckCircle2 size={12} className="text-white" />
                 </div>
                 <div>
                    <h4 className="font-bold text-[14px] text-slate-800 leading-none mb-1">Pendaftaran Berhasil</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">BKG-99281-X telah terdaftar di sistem.</p>
                 </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                 <div className="absolute -left-6 top-0.5 w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center z-10 ring-4 ring-white shadow-sm border border-[#16a34a]">
                    <CheckCircle2 size={12} className="text-white" />
                 </div>
                 <div>
                    <h4 className="font-bold text-[14px] text-slate-800 leading-none mb-1">Pembayaran Terkonfirmasi</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Pembayaran via Transfer Bank berhasil.</p>
                 </div>
              </div>

              {/* Step 3 (Current) */}
              <div className="relative">
                 <div className="absolute left-[11px] -top-8 h-8 w-0.5 bg-brand-500"></div>
                 <div className="absolute -left-6 top-0.5 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center z-10 ring-4 ring-brand-100 shadow-sm border border-brand-500 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                 </div>
                 <div>
                    <h4 className="font-bold text-[14px] text-brand-700 leading-none mb-1">Dokumen Diverifikasi</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">KTP masih menunggu upload. Silahkan upload KTP Anda.</p>
                 </div>
              </div>

              {/* Step 4 */}
              <div className="relative opacity-40">
                 <div className="absolute -left-6 top-0.5 w-6 h-6 bg-white rounded-full flex items-center justify-center z-10 ring-4 ring-white shadow-sm border-2 border-slate-200"></div>
                 <div>
                    <h4 className="font-bold text-[14px] text-slate-800 leading-none mb-1">Jadwal Vaksin Dibuat</h4>
                 </div>
              </div>

              {/* Step 5 */}
              <div className="relative opacity-40">
                 <div className="absolute -left-6 top-0.5 w-6 h-6 bg-white rounded-full flex items-center justify-center z-10 ring-4 ring-white shadow-sm border-2 border-slate-200"></div>
                 <div>
                    <h4 className="font-bold text-[14px] text-slate-800 leading-none mb-1">Pelaksanaan Vaksinasi</h4>
                 </div>
              </div>

              {/* Step 6 */}
              <div className="relative opacity-40">
                 <div className="absolute -left-6 top-0.5 w-6 h-6 bg-white rounded-full flex items-center justify-center z-10 ring-4 ring-white shadow-sm border-2 border-slate-200"></div>
                 <div>
                    <h4 className="font-bold text-[14px] text-slate-800 leading-none mb-1">Sertifikat Terbit</h4>
                 </div>
              </div>
           </div>
        </div>

        {/* Notifikasi Tracking */}
        <div>
           <h3 className="font-extrabold text-slate-800 text-[15px] mb-4 tracking-tight px-2">Log Update</h3>
           <div className="space-y-3">
              <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-start gap-3">
                 <Clock size={16} className="text-slate-400 shrink-0 mt-0.5"/>
                 <div>
                    <p className="text-[12px] font-bold text-slate-700">Pendaftaran diterima oleh sistem</p>
                    <p className="text-[10px] text-slate-400 mt-1">10 Ags 2024 - 08:00 WIB</p>
                 </div>
              </div>
              <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-start gap-3">
                 <Clock size={16} className="text-slate-400 shrink-0 mt-0.5"/>
                 <div>
                    <p className="text-[12px] font-bold text-slate-700">Pembayaran VA BCA berhasil Rp 900.000</p>
                    <p className="text-[10px] text-slate-400 mt-1">10 Ags 2024 - 08:15 WIB</p>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Sticky Button Contact Admin */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
         <button className="w-full bg-[#1e293b] text-white font-extrabold text-[14px] py-4 rounded-[20px] shadow-[0_15px_30px_rgba(0,0,0,0.15)] active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-wide">
            <MessageCircle size={20} /> Hubungi Admin
         </button>
      </div>
    </div>
  );
}
