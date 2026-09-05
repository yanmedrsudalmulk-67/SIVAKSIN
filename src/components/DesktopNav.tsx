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
  Bell, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  ChevronDown,
  Activity,
  FileWarning
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'motion/react';

export function DesktopNav() {
  const { user, role, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo');
    if (savedLogo) setLogoUrl(savedLogo);
  }, []);

  // Hide on auth/welcome pages if any
  const hidePaths = ['/splash', '/login', '/signup'];
  if (hidePaths.includes(location.pathname)) return null;

  const navLinks = [
    { to: '/home', label: 'Beranda', icon: <Home size={18} /> },
    { to: '/register', label: 'Pendaftaran', icon: <Syringe size={18} /> },
    { to: '/history', label: 'Jadwal & Riwayat', icon: <Calendar size={18} /> },
    { to: '/certificate', label: 'E-ICV Sertifikat', icon: <Award size={18} /> },
    { to: '/status', label: 'Cek Status', icon: <HeartPulse size={18} /> },
    { 
      to: '/anafilaktik', 
      label: 'Anafilaktik Kit', 
      icon: <BriefcaseMedical size={18} />,
      badge: 'SOP'
    },
    ...(role === 'admin' || user?.email?.includes('admin') ? [
      { to: '/admin', label: 'Admin Panel', icon: <ShieldCheck size={18} />, badge: 'Admin' }
    ] : [])
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Left: Brand Identity */}
          <div 
            onClick={() => navigate('/home')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Activity size={22} className="text-blue-600" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-wider">SIVAKSIN</span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                  RSUD AL-MULK
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 font-medium leading-none tracking-tight">
                Vaksinasi Internasional Kota Sukabumi
              </p>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="flex items-center gap-1 lg:gap-1.5 overflow-x-auto hide-scrollbar">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-blue-50 text-blue-700 shadow-xs" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider",
                    item.badge === 'Admin' 
                      ? "bg-amber-100 text-amber-800" 
                      : "bg-rose-100 text-rose-700"
                  )}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right: Actions & User Menu */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Booking CTA */}
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span className="hidden xl:inline">Booking Vaksin</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotif(!showNotif);
                  setShowUserMenu(false);
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition-colors relative cursor-pointer"
                title="Notifikasi"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* Notif Dropdown */}
              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 text-slate-800"
                  >
                    <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                      <h4 className="font-bold text-xs text-slate-800">Pemberitahuan</h4>
                      <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                        1 Baru
                      </span>
                    </div>
                    <div className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3 items-start transition-colors">
                      <div className="mt-0.5 text-amber-600 bg-amber-50 p-2 rounded-xl shrink-0">
                        <FileWarning size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Verifikasi Dokumen</p>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                          Lengkapi foto KTP & paspor Anda untuk validasi sertifikat E-ICV.
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1 font-bold">5 menit yang lalu</p>
                      </div>
                    </div>
                    <div className="p-2.5 text-center bg-slate-50/50">
                      <button 
                        onClick={() => {
                          setShowNotif(false);
                          navigate('/status');
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        Lihat Status Lengkap
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotif(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                  {user?.avatar_url || user?.avatar ? (
                    <img src={user.avatar_url || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {user?.name || 'Petugas'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium capitalize leading-none">
                    {role === 'admin' ? 'Administrator' : 'Pasien'}
                  </p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* User Menu Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 py-1"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Pengguna SIVAKSIN'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email || 'rsudalmulk@sukabumi.go.id'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profile');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <UserIcon size={15} className="text-slate-400" />
                      <span>Profil & Pengaturan</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/certificate');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Award size={15} className="text-slate-400" />
                      <span>E-ICV Sertifikat</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Keluar Akun</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
