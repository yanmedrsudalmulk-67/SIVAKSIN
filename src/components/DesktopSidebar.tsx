import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Syringe, 
  Calendar, 
  Award, 
  HeartPulse, 
  BriefcaseMedical, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  Activity,
  PhoneCall,
  Sparkles,
  Camera,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';
import { cn } from '../utils/cn';

export function DesktopSidebar() {
  const { user, role, logout, appLogo } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState<string | null>(appLogo || localStorage.getItem('app_logo'));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || user?.avatar || localStorage.getItem('sivaksin_user_avatar'));

  useEffect(() => {
    setLogoUrl(appLogo || localStorage.getItem('app_logo'));
  }, [appLogo]);

  useEffect(() => {
    setAvatarUrl(user?.avatar_url || user?.avatar || localStorage.getItem('sivaksin_user_avatar'));
    const handleAvatarUpdate = () => {
      setAvatarUrl(localStorage.getItem('sivaksin_user_avatar'));
    };
    window.addEventListener('user_avatar_updated', handleAvatarUpdate);
    return () => window.removeEventListener('user_avatar_updated', handleAvatarUpdate);
  }, [user]);

  // Hide sidebar on auth / onboarding splash pages
  const hidePaths = ['/splash', '/login', '/signup'];
  if (hidePaths.includes(location.pathname)) return null;

  const navLinks = [
    { to: '/home', label: 'Beranda', icon: <Home size={19} className="text-white" /> },
    { to: '/register', label: 'Pendaftaran', icon: <Syringe size={19} className="text-white" /> },
    { to: '/history', label: 'Jadwal & Riwayat', icon: <Calendar size={19} className="text-white" /> },
    { to: '/certificate', label: 'E-ICV Sertifikat', icon: <Award size={19} className="text-white" /> },
    { to: '/status', label: 'Cek Status', icon: <HeartPulse size={19} className="text-white" /> },
    { 
      to: '/anafilaktik', 
      label: 'Anafilaktik Kit', 
      icon: <BriefcaseMedical size={19} className="text-white" />,
      badge: 'SOP'
    },
    ...(role === 'admin' || user?.email?.includes('admin') ? [
      { to: '/admin', label: 'Admin Panel', icon: <ShieldCheck size={19} className="text-white" />, badge: 'Admin' }
    ] : [])
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userAvatar = avatarUrl || user?.avatar_url || user?.avatar || localStorage.getItem('sivaksin_user_avatar');

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-gradient-to-b from-[#003B73] via-[#003466] to-[#002850] text-white border-r border-blue-900/40 shadow-2xl shrink-0 min-h-screen sticky top-0 h-screen z-40 print:hidden select-none">
      
      {/* Brand & Logo Header */}
      <div className="p-5 lg:p-6 border-b border-white/10 flex items-center gap-3.5">
        <div 
          onClick={() => navigate('/home')}
          className="w-12 h-12 rounded-2xl bg-white p-1 shadow-lg shadow-black/20 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform overflow-hidden"
          title="Beranda SIVAKSIN"
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo SIVAKSIN" 
              className="w-full h-full object-contain"
              onError={() => setLogoUrl(null)}
            />
          ) : (
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-inner">
              <Activity size={24} className="text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate('/home')}>
          <div className="flex items-center gap-1.5">
            <h1 className="font-black text-lg tracking-wider text-white leading-tight">
              SIVAKSIN
            </h1>
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-white/20 text-cyan-200 border border-white/20">
              RSUD
            </span>
          </div>
          <p className="text-[11px] text-blue-200 font-medium truncate leading-tight mt-0.5">
            RSUD Al-Mulk Sukabumi
          </p>
        </div>
      </div>

      {/* Quick Action: Booking Baru */}
      <div className="px-4 lg:px-5 pt-4 pb-2">
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-black text-xs shadow-lg shadow-cyan-900/40 active:scale-95 transition-all cursor-pointer border border-cyan-300/30"
        >
          <Plus size={16} strokeWidth={3} className="text-white" />
          <span>Daftar Vaksin Baru</span>
        </button>
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 overflow-y-auto px-3.5 lg:px-4 py-3 space-y-1.5 hide-scrollbar">
        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-300/70">
          Menu Utama
        </div>

        {navLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group",
              isActive 
                ? "bg-white/20 text-white shadow-md border-l-4 border-cyan-400 font-black pl-3" 
                : "text-blue-100/90 hover:text-white hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-white shrink-0 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge && (
              <span className={cn(
                "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider text-white",
                item.badge === 'Admin' 
                  ? "bg-amber-500/80 border border-amber-300/40" 
                  : "bg-rose-500/80 border border-rose-300/40"
              )}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        {/* Section Profile & Settings */}
        <div className="pt-4 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-300/70">
          Akun & Pengaturan
        </div>

        <NavLink
          to="/profile"
          className={({ isActive }) => cn(
            "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group",
            isActive 
              ? "bg-white/20 text-white shadow-md border-l-4 border-cyan-400 font-black pl-3" 
              : "text-blue-100/90 hover:text-white hover:bg-white/10"
          )}
        >
          <div className="flex items-center gap-3">
            <UserIcon size={19} className="text-white shrink-0 group-hover:scale-110 transition-transform" />
            <span>Profil & Pengaturan Logo</span>
          </div>
          <ChevronRight size={14} className="text-blue-300" />
        </NavLink>
      </div>

      {/* Emergency Help Badge Box */}
      <div className="px-4 lg:px-5 py-2">
        <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-200">
            <PhoneCall size={13} className="text-cyan-300" />
            <span>Bantuan Layanan 24 Jam</span>
          </div>
          <p className="text-[10.5px] text-blue-100 font-mono">
            (0266) 6243088 / 0812-9999-MULK
          </p>
        </div>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between gap-3">
        <div 
          onClick={() => navigate('/profile')} 
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
          title="Klik untuk buka profil & upload foto"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 border-2 border-white/40 overflow-hidden flex items-center justify-center shrink-0 group-hover:border-cyan-400 transition-colors">
            {userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-black text-white text-sm">
                {(user?.name || user?.full_name || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-white truncate group-hover:text-cyan-200 transition-colors">
              {user?.name || user?.full_name || 'Pengguna Vaksin'}
            </p>
            <p className="text-[10px] text-blue-200 truncate capitalize font-medium">
              {role === 'admin' ? 'Administrator' : 'Pasien Terdaftar'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title="Keluar / Logout"
        >
          <LogOut size={15} />
        </button>
      </div>

    </aside>
  );
}
