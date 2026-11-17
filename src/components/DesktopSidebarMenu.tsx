import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Gauge, 
  IdCard, 
  MessageSquare, 
  Calendar, 
  Settings, 
  BriefcaseMedical,
  Bell
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';
import { cn } from '../utils/cn';

export function DesktopSidebarMenu() {
  const { user, notifications, appLogo } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const unreadNotifCount = notifications.filter(n => {
    if (n.read) return false;
    if (!n.userId) return true;
    if (!user) return true;
    return n.userId === user.id || n.userId === user.nik || n.userId === user.email || n.userId === 'user';
  }).length;

  const navItems = [
    {
      to: '/home',
      label: 'Beranda / Dashboard',
      icon: <Gauge size={22} strokeWidth={1.8} />
    },
    {
      to: '/register',
      label: 'Pendaftaran Vaksin',
      icon: <IdCard size={22} strokeWidth={1.8} />
    },
    {
      to: '/history',
      label: 'Buku Register & Riwayat',
      icon: <MessageSquare size={22} strokeWidth={1.8} />
    },
    {
      to: '/certificate',
      label: 'E-ICV Sertifikat',
      icon: <Calendar size={22} strokeWidth={1.8} />
    },
    {
      to: '/anafilaktik',
      label: 'Anafilaktik Kit & SOP',
      icon: <BriefcaseMedical size={22} strokeWidth={1.8} />
    },
    {
      to: '/notifications',
      label: 'Notifikasi & Pesan',
      icon: <Bell size={22} strokeWidth={1.8} />,
      badge: unreadNotifCount > 0 ? unreadNotifCount : undefined
    }
  ];

  return (
    <aside className="absolute -left-[76px] lg:-left-[80px] top-1/2 -translate-y-1/2 w-[76px] lg:w-[80px] h-[550px] z-30 select-none flex flex-col items-center justify-between py-6">
      
      {/* ========================================================================= */}
      {/* ORGANIC CURVED WING SILHOUETTE (Exact Match to User Reference Image)      */}
      {/* ========================================================================= */}
      <svg 
        viewBox="0 0 80 550" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[-10px_12px_24px_rgba(100,115,190,0.22)]"
      >
        {/* Soft Lavender Background Fill */}
        <path
          d="M 80 0
             C 68 25, 46 45, 24 62
             C 8 76, 0 92, 0 110
             L 0 440
             C 0 458, 8 474, 24 488
             C 46 505, 68 525, 80 550
             Z"
          fill="#EEF1FA"
        />
        {/* Crisp Hairline Border along curved outer edge */}
        <path
          d="M 80 0
             C 68 25, 46 45, 24 62
             C 8 76, 0 92, 0 110
             L 0 440
             C 0 458, 8 474, 24 488
             C 46 505, 68 525, 80 550"
          stroke="#D8DEEE"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>

      {/* Top: Stylized 'A' Logo Emblem (Exact Match to Reference Image) */}
      <div className="relative z-10 flex flex-col items-center pt-2">
        <button
          onClick={() => navigate('/home')}
          className="relative group w-11 h-11 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
          title="SIVAKSIN RSUD Al-Mulk"
        >
          {appLogo ? (
            <img src={appLogo} alt="Logo" className="w-9 h-9 object-contain drop-shadow-md" />
          ) : (
            <div className="w-9 h-9 flex items-center justify-center">
              {/* Exact Styled 'A' Emblem from Image */}
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 drop-shadow-[0_4px_10px_rgba(37,99,235,0.35)]">
                <defs>
                  <linearGradient id="logoEmblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E40AF" />
                    <stop offset="50%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <path d="M18 4L30 29H6L18 4Z" fill="url(#logoEmblemGrad)" />
                <path d="M11 20H25" stroke="#EEF1FA" strokeWidth="3" strokeLinecap="round" />
                <path d="M18 12L21.5 20H14.5L18 12Z" fill="#EEF1FA" />
              </svg>
            </div>
          )}

          {/* Hover Tooltip */}
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 text-white text-[11px] font-bold rounded-xl shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 z-50">
            SIVAKSIN RSUD Al-Mulk
          </div>
        </button>
      </div>

      {/* Middle: Clean Line Navigation Icons Stack (Exact Match to Reference Image) */}
      <nav className="relative z-10 flex flex-col items-center gap-5 my-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== '/home' && location.pathname.startsWith(item.to));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive: navActive }) => {
                const active = isActive || navActive;
                return cn(
                  "relative group w-10 h-10 flex items-center justify-center transition-all duration-200 cursor-pointer",
                  active
                    ? "text-[#4F46E5] scale-110 drop-shadow-[0_2px_10px_rgba(79,70,229,0.50)]"
                    : "text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95"
                );
              }}
            >
              {item.icon}

              {/* Unread badge counter */}
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}

              {/* Floating Tooltip to the right */}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 text-white text-[11px] font-bold rounded-xl shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 z-50">
                {item.label}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: Settings Gear Icon (Exact Match to Reference Image) */}
      <div className="relative z-10 flex flex-col items-center pb-2">
        <NavLink
          to="/profile"
          className={({ isActive }) => cn(
            "relative group w-10 h-10 flex items-center justify-center transition-all duration-200 cursor-pointer",
            isActive || location.pathname.startsWith('/profile')
              ? "text-[#4F46E5] scale-110 drop-shadow-[0_2px_10px_rgba(79,70,229,0.50)]"
              : "text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95"
          )}
          title="Pengaturan Akun & Profil"
        >
          <Settings size={22} strokeWidth={1.8} className="group-hover:rotate-45 transition-transform duration-300" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 text-white text-[11px] font-bold rounded-xl shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 z-50">
            Pengaturan & Profil
          </div>
        </NavLink>
      </div>

    </aside>
  );
}
