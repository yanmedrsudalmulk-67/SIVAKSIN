import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Award, QrCode, Download, Share2, Mail, Printer, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store/AppContext';

export default function Certificate() {
  const navigate = useNavigate();
  const { user } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header Premium */}
      <div className="bg-gradient-to-br from-[#0a192f] via-brand-800 to-[#1e3a8a] text-white pt-safe pb-8 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0 z-10 transition-all">
        <div className="absolute top-0 right-0 w-full h-[150%] opacity-[0.05] bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-[center_top_-20px] bg-cover mix-blend-screen pointer-events-none"></div>
        <div className="flex items-center justify-between mb-8 relative z-10 mt-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-95 transition-transform hover:bg-white/20">
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-bold text-lg tracking-wide uppercase drop-shadow-sm">E-ICV</h2>
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 pointer-events-none"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-1 drop-shadow-md">E-ICV</h1>
          <p className="text-brand-100 text-[13px] opacity-90 leading-relaxed font-medium">
            Unduh dan verifikasi sertifikat vaksin internasional Anda
          </p>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20 flex flex-col gap-6">
        {/* Card Sertifikat Utama */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-100/50 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-40 h-40 bg-gradient-to-bl from-brand-50 to-transparent rounded-bl-[120px] opacity-70 pointer-events-none"></div>
          
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">{user?.name || 'Jamaah'}</p>
              <h3 className="font-extrabold text-slate-800 text-[16px] tracking-tight">Passport: C8392019</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100 shrink-0">
               <Award size={24} strokeWidth={2} />
            </div>
          </div>

          <div className="space-y-4 mb-6">
             <div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Jenis Vaksin</p>
               <div className="flex flex-col gap-1.5">
                 <span className="text-[13px] font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">Meningitis Vaccine (ACW135Y)</span>
                 <span className="text-[13px] font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">Polio Vaccine (OPV/IPV)</span>
                 <span className="text-[13px] font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">Influenza Vaccine</span>
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Tanggal</p>
                  <p className="text-[13px] font-bold text-slate-700">12 Ags 2024</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Lokasi</p>
                  <p className="text-[13px] font-bold text-slate-700">RSUD Al-Mulk</p>
                </div>
             </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Status Sertifikat</span>
            <div className="px-3 py-1.5 rounded-[10px] text-[10px] font-extrabold uppercase tracking-widest bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] flex items-center gap-1.5 shadow-sm">
               <ShieldCheck size={14} className="fill-[#16a34a] text-white" /> Terverifikasi
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="grid grid-cols-2 gap-3">
           <button className="bg-white p-4 rounded-[24px] border border-slate-100/50 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform hover:border-brand-200">
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><Download size={20} /></div>
              <span className="text-[11px] font-bold text-slate-700">Download PDF</span>
           </button>
           <button className="bg-white p-4 rounded-[24px] border border-slate-100/50 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform hover:border-emerald-200">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Share2 size={20} /></div>
              <span className="text-[11px] font-bold text-slate-700">Share WhatsApp</span>
           </button>
           <button className="bg-white p-4 rounded-[24px] border border-slate-100/50 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform hover:border-blue-200">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Mail size={20} /></div>
              <span className="text-[11px] font-bold text-slate-700">Kirim Email</span>
           </button>
           <button className="bg-white p-4 rounded-[24px] border border-slate-100/50 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform hover:border-slate-300">
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center"><Printer size={20} /></div>
              <span className="text-[11px] font-bold text-slate-700">Print Dokumen</span>
           </button>
        </div>

        {/* Security Section */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[24px] p-5 flex items-center gap-4 shadow-sm mb-6">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-emerald-100">
             <ShieldCheck size={24} className="text-[#16a34a]" />
           </div>
           <div>
              <p className="text-[12px] font-bold text-[#166534] leading-snug">Sertifikat ini valid dan terenkripsi. Dapat diverifikasi secara digital melalui portal resmi Kementerian Kesehatan.</p>
           </div>
        </div>

        {/* Riwayat Sertifikat */}
        <div className="pb-8">
           <h3 className="font-extrabold text-slate-800 text-[16px] mb-4 tracking-tight px-1">Riwayat Sertifikat</h3>
           <div className="space-y-3">
              <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center justify-between">
                 <div>
                    <h4 className="font-bold text-slate-700 text-[13px]">Meningitis (2021)</h4>
                    <p className="text-[11px] text-slate-500 font-medium">10 Jan 2021</p>
                 </div>
                 <div className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                    Expired
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
