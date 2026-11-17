import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';

export function DesktopHeader() {
  const { user, role, notifications } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Greeting based on real-time hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';
  
  // Format user display name
  const rawName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'Petugas Medis';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const userAvatar = user?.avatar_url || user?.avatar || localStorage.getItem('sivaksin_user_avatar');

  const unreadCount = notifications.filter(n => {
    if (n.read) return false;
    if (!n.userId) return true;
    if (!user) return true;
    return n.userId === user.id || n.userId === user.nik || n.userId === user.email || n.userId === 'user';
  }).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/history?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="px-6 lg:px-8 pt-5 pb-3 flex items-center justify-between gap-4 border-b border-slate-200/50 bg-white/70 backdrop-blur-md shrink-0 z-20">
      
      {/* Left: Greeting & Subtitle matching the image */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
            {greeting}, {displayName}
          </h1>
          {role === 'admin' && (
            <span className="px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
              Admin
            </span>
          )}
        </div>

        <div className="relative inline-block mt-0.5">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Poli MCU Vaksinasi Internasional RSUD Al-Mulk</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showStatusDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 space-y-2 text-xs">
              <div className="font-bold text-slate-800">Status Sistem & Layanan:</div>
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-semibold">SIMRS Khanza: Terhubung (U0029)</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 bg-blue-50 p-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="font-semibold">Portal APIIK BKK: Siap Sinkron</span>
              </div>
              <button
                onClick={() => {
                  setShowStatusDropdown(false);
                  navigate('/history');
                }}
                className="w-full text-center py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition-colors cursor-pointer"
              >
                Buka Buku Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Search Pill & Action Buttons matching the image */}
      <div className="flex items-center gap-3">
        {/* Search Bar Pill matching the image */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search here / cari peserta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-400/80 rounded-full text-xs font-semibold text-slate-800 placeholder-slate-400 w-52 lg:w-72 outline-none transition-all shadow-inner focus:ring-2 focus:ring-blue-100"
          />
        </form>

        {/* Help / WhatsApp Bantuan Button (?) */}
        <button
          onClick={() => window.open('https://wa.me/6281288882568?text=Halo%20Admin%20Klinik%20Vaksinasi%20RSUD%20Al-Mulk,%20saya%20ingin%20konsultasi%20vaksinasi%20internasional', '_blank')}
          className="w-9 h-9 rounded-full bg-slate-100/90 hover:bg-blue-50 hover:text-blue-600 text-slate-500 flex items-center justify-center transition-all cursor-pointer font-bold text-xs"
          title="Bantuan & Konsultasi Layanan"
        >
          <HelpCircle size={17} />
        </button>

        {/* Notification Bell Button */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 rounded-full bg-slate-100/90 hover:bg-blue-50 hover:text-blue-600 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          title="Notifikasi"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar Pill */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
          title="Profil Pengguna"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-blue-500 transition-all shadow-xs relative">
            {userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#0F3DDE] to-[#2563EB] flex items-center justify-center text-white font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </div>

    </header>
  );
}
