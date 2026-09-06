import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Shield, Syringe, Calendar, FileSignature } from 'lucide-react';
import { useAppStore } from '../store/AppContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { appLogo } = useAppStore();
  const [logoUrl, setLogoUrl] = useState<string | null>(appLogo || localStorage.getItem('app_logo'));

  useEffect(() => {
    setLogoUrl(appLogo || localStorage.getItem('app_logo'));
    const handleUpdate = () => {
      setLogoUrl(localStorage.getItem('app_logo'));
    };
    window.addEventListener('app_logo_updated', handleUpdate);
    return () => window.removeEventListener('app_logo_updated', handleUpdate);
  }, [appLogo]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      {/* Top Blue Header matching dashboard */}
      <div className="absolute top-0 inset-x-0 h-[60%] bg-gradient-to-br from-indigo-950 via-blue-800 to-cyan-500 rounded-b-[60px] shadow-xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-transparent mix-blend-screen filter blur-[100px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
      </div>

      <div className="flex-1 flex flex-col z-10 w-full max-w-md mx-auto relative justify-between pb-8">
        {/* Top Section */}
        <div className="pt-20 px-6 flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-36 h-36 mb-8 flex items-center justify-center"
          >
            {/* Solid white background for logo */}
            <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)]"></div>
            {logoUrl ? (
               <img src={logoUrl} alt="Logo" className="absolute inset-0 w-full h-full object-cover rounded-[2.5rem] z-10" />
            ) : (
               <ShieldCheck className="text-blue-600 w-20 h-20 drop-shadow-sm relative z-10" strokeWidth={1.5} />
            )}
          </motion.div>

          {/* Title & Subtitles */}
          <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.3, duration: 0.8 }}
             className="text-center w-full space-y-4"
          >
            <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-100 drop-shadow-sm mb-6">
              SIVAKSIN
            </h1>
            
            <div className="space-y-1.5">
              <p className="text-[12px] md:text-xs text-blue-100/90 font-bold tracking-widest uppercase">
                Sistem Informasi Vaksinasi Internasional
              </p>
              <p className="text-[12px] md:text-xs text-blue-100/90 font-bold tracking-widest uppercase">
                UOBK RSUD Al-Mulk Kota Sukabumi
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="px-6 flex flex-col items-center">
          {/* Features Grid */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-3 gap-2 w-full mt-10 mb-10 bg-white/80 p-5 rounded-3xl border border-white backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center border border-brand-100 shadow-sm text-brand-600">
                <ShieldCheck size={24} />
              </div>
              <span className="text-[10px] text-slate-600 leading-tight font-bold">Aman &<br/>Terpercaya</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-10 bg-slate-200"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-slate-200"></div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center border border-brand-100 shadow-sm text-brand-600">
                <Calendar size={24} />
              </div>
              <span className="text-[10px] text-slate-600 leading-tight font-bold">Jadwal<br/>Fleksibel</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center border border-brand-100 shadow-sm text-brand-600">
                <FileSignature size={24} />
              </div>
              <span className="text-[10px] text-slate-600 leading-tight font-bold">Sertifikat<br/>Internasional</span>
            </div>
          </motion.div>

          {/* Footer Area with CTA */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="w-full relative"
          >
            {/* Colorful blob behind button to emphasize glass effect */}
            <div className="absolute inset-0 bg-brand-500 rounded-full blur-2xl opacity-15"></div>
            
            <button 
              onClick={() => navigate('/login')}
              className="relative w-full h-16 rounded-[2rem] flex items-center justify-center bg-white/70 border border-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] group overflow-hidden transition-transform active:scale-95"
            >
              {/* Inner subtle glow highlight */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white to-transparent opacity-70 pointer-events-none z-0"></div>
              
              {/* Shimmer/Glass effect animation */}
              <motion.div
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-25deg] pointer-events-none z-0"
                animate={{ x: ['-200%', '400%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 0.5 }}
              />

              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <span className="text-xl font-black text-brand-600 tracking-wide pr-2">Ayo Mulai</span>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center shadow-md">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowRight size={22} className="text-white" strokeWidth={2.5} />
                  </motion.div>
                </div>
              </div>
            </button>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
