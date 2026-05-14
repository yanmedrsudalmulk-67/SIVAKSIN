import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Search, Syringe, Calendar, FileText, Activity, 
  ArrowRight, ShieldAlert, Plane, QrCode, Mic, SlidersHorizontal, 
  MapPin, MessageCircle, FileWarning, Globe, ShieldCheck, Phone, ChevronRight, CheckCircle, BookOpen, Clock,
  Award, HeartPulse, ShieldQuestion, History as HistoryIcon
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';

export default function Home() {
  const { user, vaccines, bookings } = useAppStore();
  const navigate = useNavigate();
  
  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
  
  // Check upcoming booking
  const upcomingBooking = bookings.slice().reverse().find(b => b.status === 'menunggu' || b.status === 'terverifikasi');
  const upcomingVaccine = upcomingBooking ? vaccines.find(v => v.id === upcomingBooking.vaccineId) : null;

  // Carousel
  const banners = [
    { id: 1, title: 'Persiapan Umroh & Haji', desc: 'Diskon 15% paket vaksin meningitis & influenza.', icon: <Plane size={140} strokeWidth={1} />, color: 'from-[#06b6d4] to-[#2563eb]' },
    { id: 2, title: 'Paket Keluarga Ceria', desc: 'Lindungi keluarga Anda dengan vaksin flu tahunan.', icon: <ShieldCheck size={140} strokeWidth={1} />, color: 'from-[#3b82f6] to-[#4338ca]' },
    { id: 3, title: 'Stok Vaksin Tersedia', desc: 'Vaksin Polio OPV/IPV kini tersedia di klinik kami.', icon: <Syringe size={140} strokeWidth={1} />, color: 'from-orange-500 to-red-600' }
  ];
  const [activeBanner, setActiveBanner] = useState(0);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Background Header Premium Version B */}
      <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-br from-[#0F3DDE] via-[#2563EB] to-[#06B6D4] overflow-hidden z-0 shadow-xl rounded-b-[50px]">
        {/* World map transparent pattern */}
        <div className="absolute top-0 right-0 w-full h-[150%] opacity-[0.08] bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-[center_top_-20px] bg-cover mix-blend-screen pointer-events-none"></div>
        
        {/* Stylized Ka'bah / Mecca Silhouette Background */}
        <div className="absolute bottom-[-20px] right-[-30px] w-64 h-64 opacity-[0.12] pointer-events-none mix-blend-overlay">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
            <path d="M50 70L150 70L150 170L50 170Z" fill="white" />
            <path d="M50 85H150V98H50V85Z" fill="#FACC15" />
            <path d="M90 140H110V170H90V140Z" fill="black" opacity="0.5" />
            <circle cx="100" cy="50" r="15" fill="white" opacity="0.3" />
            <path d="M0 180C50 170 150 170 200 180V200H0V180Z" fill="white" opacity="0.2" />
          </svg>
        </div>

        {/* Glow Effects */}
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-cyan-400 rounded-full mix-blend-screen filter blur-[90px] opacity-20 pointer-events-none animate-pulse"></div>
        <div className="absolute top-20 -left-20 w-60 h-60 bg-blue-400 rounded-full mix-blend-screen filter blur-[80px] opacity-30 pointer-events-none"></div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_8s_infinite]"></div>
      </div>

      {/* Header Layout Premium Version B */}
      <div className="pt-safe pb-4 px-6 relative shrink-0 z-10 w-full">
        <div className="flex justify-between items-center mt-6">
          {/* Kiri: Logo Aplikasi Premium */}
          <div className="w-[66px] h-[66px] shrink-0 bg-white/20 rounded-[22px] border border-white/30 flex flex-col items-center justify-center text-white backdrop-blur-xl shadow-lg relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent opacity-60"></div>
            <ShieldCheck size={34} strokeWidth={2.5} className="drop-shadow-md" />
            <span className="font-black text-[8px] leading-tight tracking-[0.25em] opacity-90 mt-1 uppercase">Sivaksin</span>
          </div>

          {/* Tengah: Greeting & Nama User */}
          <div className="flex-1 px-5 pt-1">
            <p className="text-[13px] font-medium text-blue-50/90 leading-none mb-1.5">{greeting},</p>
            <div className="flex items-center gap-2">
              <h2 className="text-[22px] font-bold text-white leading-none shadow-black/50 drop-shadow-sm tracking-tight text-nowrap">
                {user?.name || 'Admin RSAM'}
              </h2>
              <div className="bg-blue-500 rounded-full p-0.5 border border-white/20 shadow-sm">
                <CheckCircle size={14} className="text-white fill-white/20" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Kanan: Notif & Avatar */}
          <div className="flex items-center gap-3 shrink-0">
             <div className="relative">
               <button 
                 onClick={() => setShowNotif(!showNotif)} 
                 className="w-12 h-12 rounded-[18px] bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md shadow-sm text-white hover:bg-white/20 transition-all active:scale-95"
               >
                 <Bell size={22} strokeWidth={2} />
                 <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full shadow-sm text-[8px] flex items-center justify-center font-bold">3</span>
               </button>

               <AnimatePresence>
                 {showNotif && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className="absolute right-0 top-14 w-72 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden z-50 text-slate-800"
                   >
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                       <h4 className="font-bold text-[13px]">Notifikasi</h4>
                       <span className="text-[10px] bg-red-50 border border-red-100 text-red-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">1 Baru</span>
                     </div>
                     <div className="max-h-[300px] overflow-y-auto hide-scrollbar">
                       <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3.5 items-start transition-colors">
                         <div className="mt-0.5 text-orange-500 bg-orange-50/80 border border-orange-100 p-2 rounded-xl shrink-0"><FileWarning size={18} /></div>
                         <div>
                           <p className="text-[12px] font-bold text-slate-800">Ulangi Upload KTP</p>
                           <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Dokumen KTP yang Anda unggah sebelumnya kurang jelas.</p>
                           <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">5 mnt yang lalu</p>
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
             
             <div className="w-12 h-12 rounded-[18px] bg-white p-0.5 shadow-lg border border-white active:scale-95 transition-transform cursor-pointer overflow-hidden bg-gradient-to-tr from-blue-50 to-white flex items-center justify-center">
                <span className="font-black text-xl text-[#0F3DDE]">{user?.name?.charAt(0) || 'A'}</span>
             </div>
          </div>
        </div>

        {/* Hero Card Tengah Version B */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-7 bg-white/20 backdrop-blur-xl border border-white/30 rounded-[30px] p-5 flex items-center justify-between relative overflow-hidden group shadow-2xl"
        >
          <div className="relative z-10 flex-1">
             <h3 className="font-extrabold text-white text-[18px] mb-1.5 leading-tight tracking-tight">Lindungi Diri Anda</h3>
             <div className="text-white/90 text-[12px] font-medium leading-tight space-y-0.5">
                <p>Dengan vaksinasi lengkap</p>
                <p>Perjalanan lebih tenang dan aman</p>
             </div>
          </div>
          
          <div className="relative w-28 h-28 flex items-center justify-center overflow-visible">
             <div className="absolute inset-0 bg-blue-400/30 blur-2xl rounded-full animate-pulse scale-150"></div>
             <motion.div 
               animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="relative z-20"
             >
                <div className="relative flex items-center justify-center">
                  {/* Background Elements */}
                  <div className="bg-white/10 rounded-full p-4 backdrop-blur-md border border-white/30 shadow-2xl relative overflow-hidden">
                    <Syringe size={48} className="text-white drop-shadow-2xl opacity-80" strokeWidth={1.5} />
                  </div>
                  
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-3 -left-3 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center border-2 border-white shadow-xl rotate-[-12deg] z-20"
                  >
                    <ShieldCheck size={26} className="text-white" strokeWidth={2.5} />
                  </motion.div>
                </div>
             </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Search Bar Premium Version B */}
      <div className="px-6 -mt-3 mb-8 relative z-20">
        <div className="relative group shadow-[0_15px_35px_rgba(0,0,0,0.12)] rounded-[28px]">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-[#0F3DDE]/50 group-focus-within:text-[#0F3DDE] transition-colors">
            <Search size={22} strokeWidth={2.5} />
          </div>
          <input 
            type="text" 
            placeholder="Cari layanan, negara tujuan..."
            className="w-full h-16 bg-white rounded-[28px] pl-16 pr-32 text-[14px] font-bold text-slate-800 border-none focus:ring-4 focus:ring-[#0F3DDE]/5 transition-all outline-none placeholder:text-slate-400 placeholder:font-semibold"
          />
          <div className="absolute inset-y-0 right-4 flex items-center gap-0.5">
             <button className="w-10 h-10 flex items-center justify-center text-[#0F3DDE]/60 hover:text-[#0F3DDE] hover:bg-slate-50 rounded-full transition-all active:scale-90">
                <Mic size={20} strokeWidth={2.5} />
             </button>
             <div className="w-[1px] h-5 bg-slate-100 mx-0.5"></div>
             <button className="w-10 h-10 flex items-center justify-center text-[#0F3DDE]/60 hover:text-[#0F3DDE] hover:bg-slate-50 rounded-full transition-all active:scale-90">
                <SlidersHorizontal size={20} strokeWidth={2.5} />
             </button>
          </div>
        </div>
      </div>

      <div className="px-5 mt-2 relative z-20 flex flex-col gap-8">

        {/* Quick Menu / Layanan Utama Premium */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-5 pb-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white relative z-10 mx-2 -mt-2">
            <div className="grid grid-cols-4 gap-y-7 gap-x-2">
                <MenuIcon icon={<Syringe />} label="Booking Vaksin" bg="bg-blue-50/80" color="text-blue-600" ring="ring-blue-100" onClick={() => navigate('/register')} />
                <MenuIcon icon={<Award />} label="E-ICV" bg="bg-emerald-50/80" color="text-emerald-600" ring="ring-emerald-100" onClick={() => navigate('/certificate')} />
                <MenuIcon icon={<Calendar />} label="Jadwal" bg="bg-orange-50/80" color="text-orange-500" ring="ring-orange-100" onClick={() => navigate('/history')} />
                <MenuIcon icon={<MessageCircle />} label="Konsultasi Admin" bg="bg-cyan-50/80" color="text-cyan-600" ring="ring-cyan-100" />
                <MenuIcon icon={<ShieldQuestion />} label="FAQ" bg="bg-indigo-50/80" color="text-indigo-600" ring="ring-indigo-100" />
                <MenuIcon icon={<HeartPulse />} label="Cek Status" bg="bg-rose-50/80" color="text-rose-600" ring="ring-rose-100" onClick={() => navigate('/status')} />
                <MenuIcon icon={<MapPin />} label="Lokasi Klinik" bg="bg-teal-50/80" color="text-teal-600" ring="ring-teal-100" />
                <MenuIcon icon={<HistoryIcon />} label="Riwayat" bg="bg-slate-50/80" color="text-slate-600" ring="ring-slate-200" onClick={() => navigate('/history')} />
            </div>
        </div>

        {/* Jadwal Terdekat User Premium */}
        <div className="mt-2">
          <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="font-extrabold text-slate-800 text-[17px] tracking-tight">Jadwal Saya</h3>
            <button onClick={() => navigate('/history')} className="text-[11px] font-bold text-brand-600 flex items-center gap-0.5 uppercase tracking-wider hover:text-brand-700 transition-colors">
              Lihat Semua <ChevronRight size={14}/>
            </button>
          </div>
          {upcomingBooking ? (
            <div className="bg-white p-5 py-6 rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-slate-100/50 relative overflow-hidden group">
              {/* Decorative gradient corner */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-brand-50 to-transparent rounded-bl-[100px] opacity-70 pointer-events-none"></div>
              
              <div className="flex gap-4 items-center relative z-10 w-full mb-5">
                 <div className="w-[66px] h-[66px] bg-[#eff6ff] text-brand-600 rounded-[20px] flex flex-col items-center justify-center font-bold shadow-sm border border-[#bfdbfe]/50 shrink-0">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-[#3b82f6] mb-0.5">{upcomingBooking.date.split('-')[1]}</span>
                    <span className="text-[26px] leading-none mb-0.5 tracking-tight font-black">{upcomingBooking.date.split('-')[2]}</span>
                 </div>
                 <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-start justify-between mb-1.5 gap-2">
                       <h4 className="font-bold text-slate-800 text-[14px] truncate leading-tight mt-0.5 tracking-tight">{upcomingVaccine?.name.split(' (')[0]}</h4>
                       <div className="px-2 py-1 rounded-[8px] text-[9px] font-extrabold uppercase tracking-widest bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]/80 flex items-center gap-1 shrink-0">
                          <CheckCircle size={10} className="fill-[#16a34a] text-white" /> Terverif
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 w-fit">
                        <Clock size={12} className="text-brand-500" /> {upcomingBooking.time} WIB
                      </p>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50/80 rounded-[18px] p-4 flex items-center justify-between text-xs font-medium text-slate-600 border border-slate-100/80 relative z-10 group-hover:bg-slate-50 transition-colors">
                <span className="flex items-center gap-2 font-semibold text-slate-700">
                  <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                    <MapPin size={12} className="text-[#3b82f6]"/>
                  </div>
                  RSUD Al-Mulk
                </span>
                {upcomingBooking.status === 'menunggu' && (
                   <button className="text-white text-[10px] font-bold px-4 py-2 bg-brand-600 rounded-xl shadow-[0_4px_10px_rgba(37,99,235,0.25)] active:scale-95 transition-transform uppercase tracking-wider">Bayar</button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-[30px] p-8 flex flex-col items-center justify-center text-center shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
              <div className="w-[60px] h-[60px] bg-slate-50 border border-slate-100 rounded-[20px] flex items-center justify-center text-slate-400 mb-4 shadow-sm relative z-10">
                 <Calendar size={28} strokeWidth={1.5} />
              </div>
              <h4 className="font-extrabold text-slate-700 text-[15px] mb-1.5 relative z-10">Belum ada jadwal vaksin</h4>
              <p className="text-[12px] text-slate-500 mb-6 max-w-[240px] leading-relaxed relative z-10">Siapkan dokumen pendukung dan daftar vaksinasi sebelum keberangkatan.</p>
              <button onClick={() => navigate('/register')} className="bg-[#2563eb] text-white text-[12px] font-bold px-6 py-3 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.25)] active:scale-95 transition-transform relative z-10 tracking-wide">
                Booking Sekarang
              </button>
            </div>
          )}
        </div>

        {/* Hero Banner Carousel Premium */}
        <div className="relative w-full h-[155px] rounded-[24px] overflow-hidden shadow-[0_15px_30px_rgba(37,99,235,0.15)] bg-slate-100">
          <AnimatePresence initial={false}>
            <motion.div 
              key={activeBanner}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ 
                duration: 1.2, 
                ease: [0.4, 0, 0.2, 1]
              }}
              className={`absolute inset-0 bg-gradient-to-r ${banners[activeBanner].color} p-5 pb-6 text-white flex flex-col justify-center`}
            >
              <div className="absolute right-0 bottom-0 opacity-[0.08] -mb-8 -mr-8 mix-blend-plus-lighter pointer-events-none">
                {banners[activeBanner].icon}
              </div>
              <h3 className="font-extrabold text-[17px] mb-1.5 relative z-10 w-[65%] leading-tight drop-shadow-sm tracking-wide">{banners[activeBanner].title}</h3>
              <p className="text-[11px] text-white/90 mb-4 relative z-10 max-w-[220px] leading-relaxed drop-shadow-sm">{banners[activeBanner].desc}</p>
              <div className="relative z-10 w-fit">
                <button onClick={() => navigate('/register')} className="bg-white/20 backdrop-blur-xl border border-white/40 text-white text-[10px] font-extrabold px-4 py-2 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 hover:bg-white/30 tracking-[0.1em] uppercase">
                  Lihat Promo
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {banners.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeBanner ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />
            ))}
          </div>
        </div>

        {/* Daftar Vaksin Tersedia */}
        <div>
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="font-bold text-slate-800 text-lg">Daftar Vaksin</h3>
            <button className="text-xs font-bold text-brand-600">Lengkap</button>
          </div>
          
          <div className="space-y-3">
            {vaccines.map((v, i) => {
              const iconColor = i === 0 ? 'bg-orange-100 text-orange-600' : i === 1 ? 'bg-blue-100 text-blue-600' : 'bg-health-100 text-health-600';
              const stockStatus = v.stock > 100 ? { label: 'Tersedia', color: 'text-health-600 bg-health-50 border-health-200' } : 
                                  v.stock > 0 ? { label: 'Hampir Habis', color: 'text-orange-600 bg-orange-50 border-orange-200' } : 
                                  { label: 'Habis', color: 'text-red-600 bg-red-50 border-red-200' };
              
              return (
              <div key={v.id} className="glass-card p-4 rounded-3xl flex flex-col gap-3 border border-slate-100 shadow-sm transition-all hover:shadow-md bg-white">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${iconColor} rounded-2xl flex items-center justify-center shrink-0`}>
                    <Syringe size={28} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm">{v.name.split(' (')[0]}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{v.description}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mb-0.5">Biaya Vaksinasi</span>
                    <span className="text-sm font-black text-brand-700">Rp {(v.price / 1000).toFixed(0)} rb</span>
                  </div>
                   <div className="flex items-center gap-2">
                     <span className={`text-[9px] font-bold px-2 py-1.5 rounded-lg border uppercase tracking-wider ${stockStatus.color}`}>
                       {stockStatus.label}
                     </span>
                     <button onClick={() => navigate('/register')} disabled={v.stock === 0} className={`px-4 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 ${v.stock === 0 ? 'bg-slate-100 text-slate-400' : 'bg-brand-600 text-white shadow-md shadow-brand-500/20'}`}>
                       Booking
                     </button>
                   </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>

        {/* Informasi Negara Tujuan (Horizontal) */}
        <div>
           <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="font-bold text-slate-800 text-lg">Syarat Negara</h3>
            <button className="text-xs font-bold text-brand-600">Lihat Semua</button>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
             <div className="w-60 shrink-0 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
               <div className="flex justify-between items-start mb-3">
                 <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600"><Globe size={20}/></div>
                 <span className="text-[9px] font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2 py-1 rounded-md uppercase tracking-wider">Wajib</span>
               </div>
               <h4 className="font-bold text-slate-800 text-sm mb-1">Saudi Arabia</h4>
               <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">Wajib Vaksin Meningitis (ACW135Y) untuk seluruh jamaah Umroh & Haji.</p>
             </div>
             <div className="w-60 shrink-0 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
               <div className="flex justify-between items-start mb-3">
                 <div className="w-10 h-10 bg-health-50 rounded-xl flex items-center justify-center text-health-600"><Globe size={20}/></div>
                 <span className="text-[9px] font-bold text-health-600 bg-health-50 border border-health-100 px-2 py-1 rounded-md uppercase tracking-wider">Rekomen</span>
               </div>
               <h4 className="font-bold text-slate-800 text-sm mb-1">Malaysia & Singapura</h4>
               <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">Sangat direkomendasikan Vaksin Influenza untuk mencegah penularan.</p>
             </div>
          </div>
        </div>

        {/* Artikel Edukasi */}
        <div>
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="font-bold text-slate-800 text-lg">Pusat Edukasi</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
            <div className="w-64 shrink-0 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <div className="h-28 bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <div className="absolute bottom-3 left-3 flex gap-1">
                  <span className="bg-brand-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Berita</span>
                </div>
              </div>
              <div className="p-4 bg-white">
                <h4 className="font-bold text-slate-800 text-sm mb-1.5 leading-snug line-clamp-2">Syarat Vaksin Umroh Terbaru 2024 dari Kemenag</h4>
                <p className="text-[10px] text-slate-500 line-clamp-2">Kebijakan terbaru dari Kementerian Agama terkait penerbitan sertifikat ICV.</p>
              </div>
            </div>
             <div className="w-64 shrink-0 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col">
              <div className="h-28 bg-orange-100 relative items-center justify-center flex text-orange-400">
                <BookOpen size={40} strokeWidth={1.5} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
              </div>
              <div className="p-4 bg-white">
                <h4 className="font-bold text-slate-800 text-sm mb-1.5 leading-snug line-clamp-2">Panduan Fisik Sebelum Terima Injeksi Vaksin</h4>
                <p className="text-[10px] text-slate-500 line-clamp-2">Hal-hal yang perlu disiapkan tubuh Anda seperti istirahat dan makan yang cukup.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

function MenuIcon({ icon, label, bg, color, ring, onClick }: { icon: React.ReactNode, label: string, bg: string, color: string, ring: string, onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 cursor-pointer group relative" onClick={onClick}>
      <div className={`w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-[24px] flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.05)] ${bg} ${color} transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 group-active:scale-95 group-active:shadow-inner relative overflow-hidden backdrop-blur-xl border border-white/80 ring-1 ${ring}`}>
        <div className="absolute inset-0 bg-white/40 backdrop-blur-md"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/60 to-transparent"></div>
        <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm">
          {React.cloneElement(icon as React.ReactElement, { size: 30, strokeWidth: 1.5 })}
        </div>
      </div>
      <span className="text-[11px] sm:text-xs font-bold text-[#1E293B] text-center leading-tight tracking-tight px-0.5 max-w-[70px]">
        {label}
      </span>
    </div>
  );
}

