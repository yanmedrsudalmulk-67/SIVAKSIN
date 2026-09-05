import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Award, Download, Share2, Mail, Printer, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store/AppContext';
import QRCode from 'react-qr-code';
import { motion } from 'motion/react';

export default function Certificate() {
  const navigate = useNavigate();
  const { user, bookings, vaccines } = useAppStore();

  // Find user's latest verified booking for the certificate
  const certBooking = useMemo(() => {
    return bookings.slice().reverse().find(b => b.status === "terverifikasi" || b.status === "selesai");
  }, [bookings]);

  const certVaccine = useMemo(() => {
    if (!certBooking) return null;
    return vaccines.find(v => v.id === certBooking.vaccineId);
  }, [certBooking, vaccines]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header Premium */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-500 text-white pt-safe pb-10 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0 z-10 transition-all">
        <div className="absolute top-0 right-0 w-full h-[150%] opacity-[0.05] bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-[center_top_-20px] bg-cover mix-blend-screen pointer-events-none"></div>
        {/* Soft Glow */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8 relative z-10 mt-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-95 transition-transform hover:bg-white/20 cursor-pointer">
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
            </div>
            <div className="w-10 h-10"></div>
          </div>
          
          <div className="relative z-10 text-center flex flex-col items-center justify-center mt-2">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.15)] mb-3 relative"
            >
              <div className="absolute inset-0 rounded-[24px] bg-gradient-to-tr from-white/5 to-white/20 pointer-events-none"></div>
              <Award size={40} className="text-white drop-shadow-md stroke-[1.5px] relative z-10" />
              <ShieldCheck size={18} className="text-emerald-300 absolute bottom-3 right-3 drop-shadow-md z-10 fill-emerald-900/30" />
            </motion.div>
            <p className="text-emerald-100 text-[12px] opacity-90 leading-relaxed font-semibold uppercase tracking-wider max-w-[200px]">
              Electronic International Certificate Vaccine
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 relative z-20 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        
        {/* Empty State jika belum ada sertifikat */}
        {!certBooking ? (
          <div className="bg-white rounded-[28px] p-8 text-center shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <Award size={32} />
            </div>
            <h3 className="text-slate-700 font-bold text-lg mb-2">Belum Tersedia</h3>
            <p className="text-slate-500 text-sm">Anda belum memiliki sertifikat E-ICV yang diverifikasi. Pastikan Anda telah memesan dan melakukan vaksinasi.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[28px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-100/50 relative overflow-hidden group">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
            
            <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-[100px] opacity-70 pointer-events-none"></div>
            <div className="absolute left-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-emerald-100 to-transparent rounded-tr-[100px] opacity-70 pointer-events-none"></div>
            
            {/* Verified Badge */}
            <div className="flex justify-center mb-6 relative">
              <div className="py-2 px-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-2 shadow-sm">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[11px] font-extrabold pb-[1px] uppercase tracking-wider text-emerald-600">Verified International Certificate</span>
              </div>
            </div>

            <div className="flex flex-col mb-6">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Identitas Pasien</p>
              <h3 className="font-extrabold text-slate-800 text-[18px] tracking-tight">{certBooking.patient?.name || user?.name || user?.username || 'Jamaah'}</h3>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm font-semibold text-slate-600">NIK: <span className="text-slate-800">{certBooking.patient?.nik || user?.nik || '3202xxxxxxxxxxxx'}</span></p>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <p className="text-sm font-semibold text-slate-600">Passport: <span className="text-slate-800">{certBooking.patient?.passport || user?.passport_number || '-'}</span></p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 relative">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Detail Vaksinasi</p>
               <h4 className="font-bold text-slate-800 mb-3">{certVaccine?.name || 'Vaksin Internasional'}</h4>
               
               <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Tanggal</p>
                    <p className="text-[13px] font-bold text-slate-700">{certBooking.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Fasilitas</p>
                    <p className="text-[13px] font-bold text-slate-700 leading-tight">UOBK RSUD Al-Mulk Kota Sukabumi</p>
                  </div>
               </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-100 rounded-2xl mb-2 relative bg-white">
              <QRCode 
                 value={`https://sivaksin-verification.example.com/verify/${certBooking.id}`}
                 size={140}
                 bgColor="#ffffff"
                 fgColor="#0f172a"
                 level="M"
              />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3">Scan to Verify</p>
            </div>
            
            <div className="pt-4 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Status</span>
              <div className="px-3 py-1.5 rounded-[10px] text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
                 Verified
              </div>
            </div>
          </div>
        )}

        {/* Tombol Aksi */}
        {certBooking && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
           <button className="bg-white p-3 rounded-[20px] border border-slate-100/50 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform hover:border-brand-200 group cursor-pointer">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-[14px] flex items-center justify-center group-hover:scale-105 transition-transform"><Download size={22} /></div>
              <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">Download PDF</span>
           </button>
           <button className="bg-white p-3 rounded-[20px] border border-slate-100/50 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform hover:border-emerald-200 group cursor-pointer">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-[14px] flex items-center justify-center group-hover:scale-105 transition-transform"><Share2 size={22} /></div>
              <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">Share WA</span>
           </button>
           <button className="bg-white p-3 rounded-[20px] border border-slate-100/50 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform hover:border-blue-200 group cursor-pointer">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[14px] flex items-center justify-center group-hover:scale-105 transition-transform"><Mail size={22} /></div>
              <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">Share Email</span>
           </button>
           <button onClick={handlePrint} className="bg-white p-3 rounded-[20px] border border-slate-100/50 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform hover:border-slate-300 group cursor-pointer">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-[14px] flex items-center justify-center group-hover:scale-105 transition-transform"><Printer size={22} /></div>
              <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">Print Dokumen</span>
           </button>
        </div>
        )}

      </div>
    </div>
  );
}

