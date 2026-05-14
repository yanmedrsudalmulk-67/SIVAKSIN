import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Bell, User, Plus } from 'lucide-react';
import { cn } from '../utils/cn';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const hidePaths = ['/', '/login', '/splash'];
  
  if (hidePaths.includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white/80 backdrop-blur-2xl border-t border-slate-100 px-6 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] pb-[calc(0.25rem+env(safe-area-inset-bottom))] pt-2">
      <NavItem to="/home" icon={<Home size={24} />} label="Home" />
      <NavItem to="/history" icon={<Calendar size={24} />} label="Jadwal" />
      
      {/* Center prominent button for Register */}
      <div 
        onClick={() => navigate('/register')}
        className="relative -top-5 w-[60px] h-[60px] bg-gradient-to-tr from-[#2563eb] to-[#4f46e5] rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] border-[4px] border-white cursor-pointer active:scale-95 transition-transform hover:shadow-[0_12px_25px_rgba(37,99,235,0.4)]"
      >
        <Plus size={28} strokeWidth={2.5} />
      </div>
      
      <NavItem to="/notifications" icon={<Bell size={24} />} label="Notif" />
      <NavItem to="/profile" icon={<User size={24} />} label="Profil" />
    </nav>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex flex-col items-center justify-center transition-all w-16 h-12 relative",
        isActive ? "text-[#2563eb]" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {({ isActive }) => (
        <>
          <div className={cn("transition-all duration-300 absolute", isActive ? "-translate-y-2 opacity-100" : "translate-y-0 opacity-100")}>
            {React.cloneElement(icon as React.ReactElement, { 
              strokeWidth: isActive ? 2.5 : 1.5,
              className: isActive ? "text-[#2563eb]" : "text-slate-400"
            })}
          </div>
          <span className={cn("text-[9px] font-extrabold tracking-widest uppercase transition-all duration-300 absolute bottom-0 text-[#2563eb]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
