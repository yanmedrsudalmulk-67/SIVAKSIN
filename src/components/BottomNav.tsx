import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Bell, User, Plus } from 'lucide-react';
import { useAppStore } from '../store/AppContext';
import { cn } from '../utils/cn';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, user } = useAppStore();
  const hidePaths = ['/', '/login', '/splash'];
  
  if (hidePaths.includes(location.pathname)) return null;

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter(n => {
    if (n.read) return false;
    if (!n.userId) return true;
    if (!user) return true;
    return n.userId === user.id || n.userId === user.nik || n.userId === user.email || n.userId === 'user';
  }).length;

  return (
    <nav className="fixed bottom-0 inset-x-0 w-full max-w-md mx-auto z-50 print:hidden transition-all duration-300 lg:hidden md:landscape:hidden">
      {/* Container wrapper for smooth desktop pill dock experience */}
      <div className="relative w-full md:rounded-[28px] md:border md:border-slate-200/90 md:shadow-[0_12px_36px_rgba(15,23,42,0.14)] md:bg-white/95 md:backdrop-blur-sm">
        
        {/* Background with exact SVG curve matching the image - rounded on desktop */}
        <div className="absolute inset-x-0 bottom-0 h-[76px] flex pointer-events-none drop-shadow-[0_-2px_10px_rgba(0,0,0,0.04)] md:drop-shadow-none bg-transparent items-end z-0 md:rounded-[28px] md:overflow-hidden">
          <div className="flex-1 bg-white h-full"></div>
          <svg width="120" height="76" viewBox="0 0 120 76" xmlns="http://www.w3.org/2000/svg" className="bg-transparent flex-shrink-0">
            <path 
              d="M0,0.5 C16,0.5 20,3 26,16 C34,42 42,65 60,65 C78,65 86,42 94,16 C100,3 104,0.5 120,0.5 L120,76 L0,76 Z" 
              fill="#ffffff" 
            />
          </svg>
          <div className="flex-1 bg-white h-full"></div>
        </div>

        <div className="relative h-[76px] pb-[env(safe-area-inset-bottom)] px-3 sm:px-6 flex items-center justify-between z-10 w-full">
          <NavItem to="/home" icon={<Home size={24} />} label="Home" />
          <NavItem to="/schedule" icon={<Calendar size={24} />} label="Jadwal" />
          
          {/* Center floating button perfectly nested in the curve with a gap */}
          <div className="relative -translate-y-3 flex items-center justify-center w-[72px]">
            <div 
              onClick={() => navigate('/register')}
              className="w-[52px] h-[52px] bg-gradient-to-br from-[#0F3DDE] to-[#06B6D4] rounded-full flex items-center justify-center cursor-pointer shadow-[0_6px_16px_rgba(15,61,222,0.4)] hover:shadow-lg transition-all active:scale-95 group"
            >
              <Plus size={28} strokeWidth={2.5} className="text-white group-hover:rotate-90 transition-transform duration-300" />
            </div>
          </div>
          
          <NavItem 
            to="/notifications" 
            icon={<Bell size={24} />} 
            label="Notif" 
            badgeCount={unreadCount}
          />
          <NavItem to="/profile" icon={<User size={24} />} label="Profil" />
        </div>
      </div>
    </nav>
  );
}

function NavItem({ to, icon, label, badgeCount }: { to: string, icon: React.ReactNode, label: string, badgeCount?: number }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex flex-col items-center justify-center w-[60px] h-full transition-colors pt-2 relative",
        isActive ? "text-[#10487D]" : "text-[#475569] hover:text-[#334155]"
      )}
    >
      {({ isActive }) => (
        <>
          <div className="mb-1.5 flex justify-center w-full relative">
            {React.cloneElement(icon as React.ReactElement, { 
              strokeWidth: isActive ? 2 : 1.5,
              className: cn("transition-all duration-300 mx-auto", isActive ? "scale-105" : "")
            })}
            {typeof badgeCount === 'number' && badgeCount > 0 && (
              <span className="absolute -top-1 right-2 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center shadow-sm animate-pulse">
                {badgeCount > 9 ? '9+' : badgeCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-normal leading-none text-center tracking-wide">
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
