import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  LogOut, 
  ChevronDown,
  Calendar,
  FileText,
  BriefcaseMedical,
  Bell,
  Plane,
  Settings
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';

export function TravelNavbar() {
  const { user, role, notifications, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Scroll state for dynamic glassmorphism elevation
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  // Real-time Clock & Date state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const dayStr = dayNames[currentTime.getDay()];
  const dateStr = `${dayStr}, ${currentTime.getDate()} ${monthNames[currentTime.getMonth()]} ${currentTime.getFullYear()}`;
  const timeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter(n => {
    if (n.read) return false;
    if (!n.userId) return true;
    if (!user) return true;
    return n.userId === user.id || n.userId === user.nik || n.userId === user.email || n.userId === 'user';
  }).length;

  return (
    <header 
      className={`sticky top-0 z-50 text-white transition-all duration-300 ${
        isHomePage
          ? scrolled
            ? 'bg-[#0038D1]/85 backdrop-blur-2xl border-b border-white/20 shadow-[0_8px_32px_rgba(0,56,209,0.30)]'
            : 'bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.08)]'
          : 'bg-[#0038D1]/90 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_rgba(0,56,209,0.25)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* ========================================================================= */}
        {/* LOGO RESMI: Shield Logo SIVAKSIN + UOBK RSUD AL-MULK KOTA SUKABUMI         */}
        {/* ========================================================================= */}
        <div 
          onClick={() => navigate('/home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Logo Shield 3D: Clean High-Res Smooth White Outline Sejajar Judul & Subjudul */}
          <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shrink-0">
            <img 
              src="/sivaksin_shield_logo_outlined.png" 
              alt="Logo Resmi SIVAKSIN" 
              className="w-full h-full object-contain filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.22)] transition-all" 
            />
          </div>

          <div className="flex flex-col justify-center">
            <span className="font-['League_Spartan',sans-serif] text-[22px] sm:text-2xl font-black tracking-wider text-white leading-tight drop-shadow-sm">
              SIVAKSIN
            </span>
            <span className="text-[9px] sm:text-[9.5px] tracking-[0.14em] uppercase font-bold text-sky-100/90 leading-tight drop-shadow-xs">
              UOBK RSUD AL-MULK KOTA SUKABUMI
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER NAV LINKS: Beranda, Jadwal, Informed Consent, E-ICV, Riwayat, Kit  */}
        {/* Mewah dengan tipografi putih glassmorphism                                 */}
        {/* ========================================================================= */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-bold text-white/90">
          <button 
            onClick={() => navigate('/home')}
            className={`transition-all duration-200 hover:text-white cursor-pointer relative py-1 drop-shadow-xs ${
              location.pathname === '/home' || location.pathname === '/' ? 'text-white font-black' : 'hover:opacity-100 opacity-90'
            }`}
          >
            Beranda
            {(location.pathname === '/home' || location.pathname === '/') && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
            )}
          </button>

          <button 
            onClick={() => navigate('/schedule')}
            className={`transition-all duration-200 hover:text-white cursor-pointer relative py-1 drop-shadow-xs ${
              location.pathname === '/schedule' ? 'text-white font-black' : 'hover:opacity-100 opacity-90'
            }`}
          >
            Jadwal
            {location.pathname === '/schedule' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
            )}
          </button>

          <button 
            onClick={() => navigate('/informed-consent')}
            className={`transition-all duration-200 hover:text-white cursor-pointer relative py-1 drop-shadow-xs ${
              location.pathname === '/informed-consent' ? 'text-white font-black' : 'hover:opacity-100 opacity-90'
            }`}
          >
            Informed Consent
            {location.pathname === '/informed-consent' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
            )}
          </button>

          <button 
            onClick={() => navigate('/certificate')}
            className={`transition-all duration-200 hover:text-white cursor-pointer relative py-1 drop-shadow-xs ${
              location.pathname === '/certificate' ? 'text-white font-black' : 'hover:opacity-100 opacity-90'
            }`}
          >
            E-ICV
            {location.pathname === '/certificate' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
            )}
          </button>

          <button 
            onClick={() => navigate('/history')}
            className={`transition-all duration-200 hover:text-white cursor-pointer relative py-1 drop-shadow-xs ${
              location.pathname === '/history' ? 'text-white font-black' : 'hover:opacity-100 opacity-90'
            }`}
          >
            Riwayat
            {location.pathname === '/history' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
            )}
          </button>

          <button 
            onClick={() => navigate('/anafilaktik')}
            className={`transition-all duration-200 hover:text-white cursor-pointer relative py-1 drop-shadow-xs ${
              location.pathname === '/anafilaktik' ? 'text-white font-black' : 'hover:opacity-100 opacity-90'
            }`}
          >
            Kit Syok
            {location.pathname === '/anafilaktik' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
            )}
          </button>
        </nav>

        {/* ========================================================================= */}
        {/* RIGHT ACTION: Widget Jam & Tanggal + Tombol Pengaturan Icon               */}
        {/* ========================================================================= */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Widget Jam dan Tanggal Realtime (Tanpa Card, Tanpa Icon — Langsung Teks) */}
          <div className="flex flex-col text-right leading-tight select-none">
            <span className="text-[12px] font-black tracking-wider text-white font-mono drop-shadow-xs">{timeStr}</span>
            <span className="text-[9.5px] font-bold text-sky-100/90 drop-shadow-xs">{dateStr}</span>
          </div>

          {/* Icon Tombol Pengaturan (Glassmorphic Frost, Icon Putih) */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              title="Pengaturan Aplikasi"
              className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs cursor-pointer group"
            >
              <Settings size={20} className="transition-transform duration-500 group-hover:rotate-90 text-white" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 text-slate-800 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2.5 border-b border-slate-100 font-bold text-slate-900 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-[#0038D1] flex items-center justify-center font-black text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate font-bold text-slate-900">{user?.name || 'Administrator SIVAKSIN'}</p>
                    <p className="text-[10px] text-slate-400 font-normal uppercase">{role || 'Petugas RSUD Al-Mulk'}</p>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 text-slate-700 hover:text-[#0038D1] transition-colors flex items-center gap-2 font-medium"
                  >
                    <Settings size={14} />
                    <span>Pengaturan Aplikasi</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/history');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 text-slate-700 hover:text-[#0038D1] transition-colors flex items-center gap-2 font-medium"
                  >
                    <FileText size={14} />
                    <span>Buku Register SIMRS</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/certificate');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 text-slate-700 hover:text-[#0038D1] transition-colors flex items-center gap-2 font-medium"
                  >
                    <ShieldCheck size={14} />
                    <span>Sertifikat Kuning (E-ICV)</span>
                  </button>
                </div>

                {user ? (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors flex items-center gap-2 font-bold border-t border-slate-100 mt-1"
                  >
                    <LogOut size={14} />
                    <span>Keluar Akun</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 text-[#0038D1] transition-colors flex items-center gap-2 font-bold border-t border-slate-100 mt-1"
                  >
                    <User size={14} />
                    <span>Login Petugas SIMRS</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/15 border border-white/25 text-white cursor-pointer transition-colors hover:bg-white/25"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0038D1]/95 backdrop-blur-2xl border-t border-white/20 px-6 py-4 space-y-3 text-sm font-bold shadow-2xl animate-fadeIn text-white">
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/home');
            }}
            className="w-full text-left py-2 text-white hover:text-sky-200"
          >
            Beranda
          </button>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/schedule');
            }}
            className="w-full text-left py-2 text-sky-100 hover:text-white"
          >
            Jadwal Pelayanan
          </button>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/informed-consent');
            }}
            className="w-full text-left py-2 text-sky-100 hover:text-white"
          >
            Informed Consent
          </button>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/certificate');
            }}
            className="w-full text-left py-2 text-sky-100 hover:text-white"
          >
            E-ICV (Sertifikat Vaksinasi)
          </button>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/history');
            }}
            className="w-full text-left py-2 text-sky-100 hover:text-white"
          >
            Riwayat (Data Register Pelayanan)
          </button>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/anafilaktik');
            }}
            className="w-full text-left py-2 text-sky-100 hover:text-white"
          >
            Kit Syok
          </button>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/profile');
            }}
            className="w-full text-left py-2 text-sky-100 hover:text-white flex items-center gap-2 border-t border-white/20 pt-3"
          >
            <Settings size={16} />
            <span>Pengaturan Sistem</span>
          </button>
        </div>
      )}
    </header>
  );
}
