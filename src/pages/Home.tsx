import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Search, Syringe, Calendar, FileText, Activity, 
  ArrowRight, ShieldAlert, Plane, QrCode, Mic, SlidersHorizontal, 
  MapPin, MessageCircle, FileWarning, Globe, ShieldCheck, Shield, Phone, ChevronRight, CheckCircle, BookOpen, Clock,
  Award, HeartPulse, BriefcaseMedical, History as HistoryIcon, Camera, Image as ImageIcon
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';

export default function Home() {
  const { user, vaccines, bookings, appLogo } = useAppStore();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState<string | null>(appLogo || localStorage.getItem('app_logo'));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || user?.avatar || localStorage.getItem('sivaksin_user_avatar'));

  useEffect(() => {
    setLogoUrl(appLogo || localStorage.getItem('app_logo'));
    const handleUpdate = () => {
      setLogoUrl(localStorage.getItem('app_logo'));
    };
    window.addEventListener('app_logo_updated', handleUpdate);
    return () => window.removeEventListener('app_logo_updated', handleUpdate);
  }, [appLogo]);

  useEffect(() => {
    setAvatarUrl(user?.avatar_url || user?.avatar || localStorage.getItem('sivaksin_user_avatar'));
    const handleAvatarUpdate = () => {
      setAvatarUrl(localStorage.getItem('sivaksin_user_avatar'));
    };
    window.addEventListener('user_avatar_updated', handleAvatarUpdate);
    return () => window.removeEventListener('user_avatar_updated', handleAvatarUpdate);
  }, [user]);
  
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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const userAvatar = avatarUrl || user?.avatar_url || user?.avatar || localStorage.getItem('sivaksin_user_avatar');



  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Background Header Premium Version B */}
      <div className="absolute top-0 inset-x-0 h-[300px] md:h-[320px] bg-gradient-to-br from-[#0F3DDE] via-[#2563EB] to-[#06B6D4] overflow-hidden z-0 shadow-xl rounded-b-[50px] md:rounded-b-[40px]">
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
      <div className="pt-safe pb-4 px-6 md:px-8 relative shrink-0 z-10 w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mt-6 md:mt-4">
          {/* Kiri: Avatar Pengguna */}
          <div 
             onClick={() => navigate('/profile')}
             className="relative w-[56px] h-[56px] sm:w-[62px] sm:h-[62px] shrink-0 bg-white p-1 shadow-lg border-2 border-white/80 active:scale-95 transition-all cursor-pointer rounded-[20px] flex items-center justify-center overflow-hidden"
             title="Profil Pengguna"
          >
             <div className="w-full h-full rounded-[16px] overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center">
               {userAvatar ? (
                 <img src={userAvatar} alt="Foto Profil" className="w-full h-full object-cover" />
               ) : (
                 <span className="font-black text-2xl text-[#0F3DDE]">
                   {(user?.name || user?.full_name || 'A').charAt(0).toUpperCase()}
                 </span>
               )}
             </div>
          </div>

          {/* Tengah: Greeting & Nama User */}
          <div className="flex-1 px-4 sm:px-5 pt-1 min-w-0">
            <p className="text-[12px] sm:text-[13px] font-medium text-blue-100 leading-none mb-1.5">{greeting},</p>
            <h2 className="text-[19px] sm:text-[22px] font-bold text-white leading-none shadow-black/50 drop-shadow-sm tracking-tight truncate">
              {user?.name || user?.full_name || 'Sahabat Sehat'}
            </h2>
          </div>

          {/* Kanan: App Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Logo Display */}
            {logoUrl && (
              <div 
                onClick={() => navigate('/profile')}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-[18px] bg-white p-1 shadow-md border border-white/40 overflow-hidden cursor-pointer hover:scale-105 transition-transform shrink-0"
                title="Logo Aplikasi SIVAKSIN"
              >
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
            )}
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
                    className="absolute -bottom-3 -right-3 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center border-2 border-white shadow-xl rotate-[12deg] z-20"
                  >
                    <ShieldCheck size={26} className="text-white" strokeWidth={2.5} />
                  </motion.div>
                </div>
             </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Search Bar Premium Version B */}
      <div className="px-6 md:px-8 -mt-3 mb-8 relative z-20 max-w-7xl mx-auto w-full">
        <div className="relative group shadow-[0_15px_35px_rgba(0,0,0,0.12)] rounded-[28px] max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-[#0F3DDE]/50 group-focus-within:text-[#0F3DDE] transition-colors">
            <Search size={22} strokeWidth={2.5} />
          </div>
          <input 
            type="text" 
            placeholder="Cari layanan, negara tujuan..."
            className="w-full h-16 bg-white rounded-[28px] pl-16 pr-32 text-[14px] font-bold text-slate-800 border-none focus:ring-4 focus:ring-[#0F3DDE]/5 transition-all outline-none placeholder:text-slate-400 placeholder:font-semibold"
          />
          <div className="absolute inset-y-0 right-4 flex items-center gap-0.5">
             <button className="w-10 h-10 flex items-center justify-center text-[#0F3DDE]/60 hover:text-[#0F3DDE] hover:bg-slate-50 rounded-full transition-all active:scale-90 cursor-pointer">
                <Mic size={20} strokeWidth={2.5} />
             </button>
             <div className="w-[1px] h-5 bg-slate-100 mx-0.5"></div>
             <button className="w-10 h-10 flex items-center justify-center text-[#0F3DDE]/60 hover:text-[#0F3DDE] hover:bg-slate-50 rounded-full transition-all active:scale-90 cursor-pointer">
                <SlidersHorizontal size={20} strokeWidth={2.5} />
             </button>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 mt-2 relative z-20 flex flex-col gap-8 max-w-7xl mx-auto w-full">

        {/* Quick Menu / Layanan Utama Premium */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-5 pb-6 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white relative z-10 mx-2 md:mx-0 -mt-2">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-y-7 gap-x-2 md:gap-4">
                <MenuIcon icon={<Syringe />} label="Booking Vaksin" bg="bg-blue-50/80" color="text-blue-600" ring="ring-blue-100" onClick={() => navigate('/register')} />
                <MenuIcon icon={<Award />} label="E-ICV" bg="bg-emerald-50/80" color="text-emerald-600" ring="ring-emerald-100" onClick={() => navigate('/certificate')} />
                <MenuIcon icon={<Calendar />} label="Jadwal" bg="bg-orange-50/80" color="text-orange-500" ring="ring-orange-100" onClick={() => navigate('/history')} />
                <MenuIcon icon={<MessageCircle />} label="Konsultasi Admin" bg="bg-cyan-50/80" color="text-cyan-600" ring="ring-cyan-100" />
                <MenuIcon icon={<BriefcaseMedical />} label="Anafilaktik Kit" bg="bg-rose-50/80" color="text-rose-600" ring="ring-rose-100" onClick={() => navigate('/anafilaktik')} />
                <MenuIcon icon={<HeartPulse />} label="Cek Status" bg="bg-rose-50/80" color="text-rose-600" ring="ring-rose-100" onClick={() => navigate('/status')} />
                <MenuIcon icon={<MapPin />} label="Lokasi RS" bg="bg-teal-50/80" color="text-teal-600" ring="ring-teal-100" />
                <MenuIcon icon={<HistoryIcon />} label="Riwayat" bg="bg-slate-50/80" color="text-slate-600" ring="ring-slate-200" onClick={() => navigate('/history')} />
            </div>
        </div>

        {/* Responsive Content Grid: On mobile stacks naturally, on desktop becomes a 12-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column (lg:col-span-8) - on mobile appears after Jadwal Saya (order-2 lg:order-1) */}
          <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">
            
            {/* Hero Banner Carousel Premium */}
            <div className="relative w-full h-[155px] md:h-[180px] rounded-[24px] overflow-hidden shadow-[0_15px_30px_rgba(37,99,235,0.15)] bg-slate-100">
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
                  className={`absolute inset-0 bg-gradient-to-r ${banners[activeBanner].color} p-5 pb-6 md:p-7 text-white flex flex-col justify-center`}
                >
                  <div className="absolute right-0 bottom-0 opacity-[0.08] -mb-8 -mr-8 mix-blend-plus-lighter pointer-events-none">
                    {banners[activeBanner].icon}
                  </div>
                  <h3 className="font-extrabold text-[17px] md:text-[20px] mb-1.5 relative z-10 w-[70%] leading-tight drop-shadow-sm tracking-wide">{banners[activeBanner].title}</h3>
                  <p className="text-[11px] md:text-[13px] text-white/90 mb-4 relative z-10 max-w-[320px] leading-relaxed drop-shadow-sm">{banners[activeBanner].desc}</p>
                  <div className="relative z-10 w-fit">
                    <button onClick={() => navigate('/register')} className="bg-white/20 backdrop-blur-xl border border-white/40 text-white text-[10px] md:text-xs font-extrabold px-4 py-2 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 hover:bg-white/30 tracking-[0.1em] uppercase cursor-pointer">
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
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Daftar Vaksin Tersedia</h3>
                  <p className="text-xs text-slate-500 font-medium">Layanan vaksinasi bersertifikat resmi ICV internasional</p>
                </div>
                <button onClick={() => navigate('/register')} className="text-xs font-bold text-brand-600 hover:text-brand-800 cursor-pointer">Lengkap</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {vaccines.map((v, i) => {
                  const iconColor = i === 0 ? 'bg-orange-100 text-orange-600' : i === 1 ? 'bg-blue-100 text-blue-600' : 'bg-health-100 text-health-600';
                  const stockStatus = v.stock > 100 ? { label: 'Tersedia', color: 'text-health-600 bg-health-50 border-health-200' } : 
                                      v.stock > 0 ? { label: 'Hampir Habis', color: 'text-orange-600 bg-orange-50 border-orange-200' } : 
                                      { label: 'Habis', color: 'text-red-600 bg-red-50 border-red-200' };
                  
                  return (
                  <div key={v.id} className="glass-card p-4 rounded-3xl flex flex-col justify-between gap-3 border border-slate-100 shadow-sm transition-all hover:shadow-md bg-white">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 ${iconColor} rounded-2xl flex items-center justify-center shrink-0`}>
                        <Syringe size={28} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{v.name.split(' (')[0]}</h4>
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
                        <button onClick={() => navigate('/register')} disabled={v.stock === 0} className={`px-4 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer ${v.stock === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-600 text-white shadow-md shadow-brand-500/20 hover:bg-brand-700'}`}>
                          Booking
                        </button>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>

            {/* Syarat Negara & Pusat Edukasi (Side by side on tablet/desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informasi Negara Tujuan */}
              <div>
                <div className="flex justify-between items-end mb-3 px-1">
                  <h3 className="font-bold text-slate-800 text-base">Syarat Negara</h3>
                  <button className="text-xs font-bold text-brand-600">Lihat Semua</button>
                </div>
                <div className="space-y-3">
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600"><Globe size={18}/></div>
                      <span className="text-[9px] font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-md uppercase tracking-wider">Wajib</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Saudi Arabia</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">Wajib Vaksin Meningitis (ACW135Y) untuk seluruh jamaah Umroh & Haji.</p>
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-9 h-9 bg-health-50 rounded-xl flex items-center justify-center text-health-600"><Globe size={18}/></div>
                      <span className="text-[9px] font-bold text-health-600 bg-health-50 border border-health-100 px-2 py-0.5 rounded-md uppercase tracking-wider">Rekomen</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Malaysia & Singapura</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">Sangat direkomendasikan Vaksin Influenza untuk mencegah penularan.</p>
                  </div>
                </div>
              </div>

              {/* Artikel Edukasi */}
              <div>
                <div className="flex justify-between items-end mb-3 px-1">
                  <h3 className="font-bold text-slate-800 text-base">Pusat Edukasi</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs flex flex-col">
                    <div className="h-20 bg-slate-800 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                      <div className="absolute bottom-2 left-3 flex gap-1">
                        <span className="bg-brand-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Berita</span>
                      </div>
                    </div>
                    <div className="p-3.5 bg-white">
                      <h4 className="font-bold text-slate-800 text-xs mb-1 leading-snug line-clamp-2">Syarat Vaksin Umroh Terbaru 2024 dari Kemenag</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2">Kebijakan terbaru dari Kementerian Agama terkait penerbitan sertifikat ICV.</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs flex flex-col">
                    <div className="h-20 bg-orange-100 relative items-center justify-center flex text-orange-400">
                      <BookOpen size={32} strokeWidth={1.5} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                    </div>
                    <div className="p-3.5 bg-white">
                      <h4 className="font-bold text-slate-800 text-xs mb-1 leading-snug line-clamp-2">Panduan Fisik Sebelum Terima Injeksi Vaksin</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2">Hal-hal yang perlu disiapkan tubuh Anda seperti istirahat dan makan yang cukup.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Sidebar Column on Desktop (lg:col-span-4) - on mobile appears right after quick menu (order-1 lg:order-2) */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
            
            {/* Jadwal Terdekat User Premium */}
            <div>
              <div className="flex justify-between items-end mb-4 px-2">
                <h3 className="font-extrabold text-slate-800 text-[17px] tracking-tight">Jadwal Saya</h3>
                <button onClick={() => navigate('/history')} className="text-[11px] font-bold text-brand-600 flex items-center gap-0.5 uppercase tracking-wider hover:text-brand-700 transition-colors cursor-pointer">
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
                       <button className="text-white text-[10px] font-bold px-4 py-2 bg-brand-600 rounded-xl shadow-[0_4px_10px_rgba(37,99,235,0.25)] active:scale-95 transition-transform uppercase tracking-wider cursor-pointer">Bayar</button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-[30px] p-7 flex flex-col items-center justify-center text-center shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
                  <div className="w-[56px] h-[56px] bg-slate-50 border border-slate-100 rounded-[20px] flex items-center justify-center text-slate-400 mb-3.5 shadow-sm relative z-10">
                     <Calendar size={26} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-extrabold text-slate-700 text-[14px] mb-1 relative z-10">Belum ada jadwal vaksin</h4>
                  <p className="text-[11px] text-slate-500 mb-5 max-w-[240px] leading-relaxed relative z-10">Siapkan dokumen pendukung dan daftar vaksinasi sebelum keberangkatan.</p>
                  <button onClick={() => navigate('/register')} className="bg-[#2563eb] hover:bg-blue-700 text-white text-[11px] font-bold px-5 py-2.5 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.25)] active:scale-95 transition-all relative z-10 tracking-wide cursor-pointer">
                    Booking Sekarang
                  </button>
                </div>
              )}
            </div>

            {/* Quick Syock Anafilaktik Kit Widget */}
            <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 text-white rounded-[28px] p-5 shadow-lg border border-rose-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/30 text-rose-300 flex items-center justify-center border border-rose-400/30">
                    <BriefcaseMedical size={16} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">Monitoring Syock Kit</h4>
                    <p className="text-[10px] text-rose-200/80">SOP Tanggap Darurat Al-Mulk</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Siap Pakai
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                Pemeriksaan berkala isi ampul Epinefrin, spuit, dan peralatan anafilaktik kit di ruang imunisasi.
              </p>
              <button 
                onClick={() => navigate('/anafilaktik')}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buka Form & Laporan Resmi</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Jam Buka & Info Kontak Al-Mulk */}
            <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Pelayanan Vaksinasi</h4>
                  <p className="text-[10px] text-slate-500">Senin - Jumat: 08.00 - 14.00 WIB</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Layanan WhatsApp:</span>
                <span className="font-bold text-blue-600">0812-8888-ALMULK</span>
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

