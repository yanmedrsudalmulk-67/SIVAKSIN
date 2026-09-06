import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { ShieldCheck, User, Lock, ArrowRight, Activity, Eye, EyeOff, Syringe, FileText, Plane, Shield, Loader2, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginUser, appLogo } = useAppStore();

  const [logoUrl, setLogoUrl] = useState<string | null>(appLogo || localStorage.getItem('app_logo'));
  useEffect(() => {
    setLogoUrl(appLogo || localStorage.getItem('app_logo'));
    const handleUpdate = () => {
      setLogoUrl(localStorage.getItem('app_logo'));
    };
    window.addEventListener('app_logo_updated', handleUpdate);
    return () => window.removeEventListener('app_logo_updated', handleUpdate);
  }, [appLogo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username/Email dan kata sandi harus diisi.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Simulate slight network delay for premium feel if it's very fast
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = await loginUser({ username, password, email: username });
    if (success) {
      navigate('/home');
    } else {
      setError('Email atau kata sandi tidak sesuai. Jika belum punya akun, silakan daftar.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative font-sans overflow-x-hidden">
      {/* Header Hero Premium */}
      <div className="absolute top-0 inset-x-0 h-[360px] sm:h-[390px] bg-gradient-to-br from-indigo-950 via-blue-800 to-cyan-500 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        {/* Soft Glow */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-cyan-400 rounded-full mix-blend-screen filter blur-[120px] opacity-40"></div>
        <div className="absolute top-20 -left-20 w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>
        
        {/* Transparent background icons */}
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 right-8 text-white/10">
          <Plane size={80} strokeWidth={1} />
        </motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-1/3 left-6 text-white/10">
          <Syringe size={100} strokeWidth={1} />
        </motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-24 right-1/3 text-white/10">
          <Shield size={60} strokeWidth={1} />
        </motion.div>
        <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-10 left-1/3 text-white/10">
          <FileText size={70} strokeWidth={1} />
        </motion.div>

        {/* Wave curve bottom - aligned with Selamat Datang card header */}
        <div className="absolute bottom-0 inset-x-0 translate-y-[1px]">
          <svg viewBox="0 0 1440 140" className="w-full h-24 sm:h-32 fill-slate-50 relative z-10" preserveAspectRatio="none">
            <path d="M0,50 C320,110 440,10 720,50 C1000,90 1140,20 1440,60 L1440,140 L0,140 Z"></path>
          </svg>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-md mx-auto relative z-10 px-6 pt-6 pb-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-5"
        >
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-20 h-20 bg-white mx-auto flex items-center justify-center mb-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[20px]"
          >
            {logoUrl ? (
               <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-[20px] z-10" />
            ) : (
               <Activity className="text-blue-600 w-10 h-10 stroke-[2px]" />
            )}
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-widest drop-shadow-md">SIVAKSIN</h1>
          <p className="text-cyan-100 text-[11px] font-bold tracking-widest uppercase mt-1 drop-shadow-sm opacity-90">UOBK RSUD AL-MULK KOTA SUKABUMI</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 rounded-[32px] p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-white/80 flex-1 relative mb-6 backdrop-blur-md flex flex-col justify-center"
        >
          <div className="mb-6">
            <h2 className="text-[20px] font-extrabold text-slate-800 mb-2 leading-tight tracking-tight">Selamat Datang Kembali</h2>
            <p className="text-slate-500 text-[13px] font-medium leading-relaxed pr-4">Masuk untuk melanjutkan layanan SIVAKSIN</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 text-red-600 p-3 rounded-[16px] text-sm mb-4 font-semibold flex items-start gap-3 border border-red-100">
              <div className="mt-0.5"><Shield size={16} className="text-red-500" /></div>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 pl-1">Username / Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-100/90 border border-slate-300/80 hover:border-slate-400 rounded-[20px] py-[18px] pl-12 pr-4 text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/15 transition-all shadow-[inset_2px_3px_6px_rgba(0,0,0,0.12),inset_-2px_-2px_5px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-slate-400 placeholder:font-normal text-[14px]"
                  placeholder="Masukan username / email anda"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 pl-1">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-100/90 border border-slate-300/80 hover:border-slate-400 rounded-[20px] py-[18px] pl-12 pr-12 text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/15 transition-all shadow-[inset_2px_3px_6px_rgba(0,0,0,0.12),inset_-2px_-2px_5px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-slate-400 placeholder:font-normal text-[14px]"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 z-10"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end pt-2">
                <a href="#" className="flex-1 text-right text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors">Lupa Kata Sandi?</a>
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={isLoading}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-[54px] relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white rounded-[20px] font-bold text-[15px] mt-6 flex items-center justify-center gap-2.5 shadow-[0_10px_25px_-5px_rgba(14,165,233,0.5),0_4px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_-5px_rgba(14,165,233,0.7)] transition-all duration-300 active:scale-[0.97] group border border-blue-400/30 disabled:opacity-80 disabled:cursor-wait cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin text-white/90" /> 
                  <span className="opacity-90">Memproses...</span>
                </>
              ) : (
                <>
                  <span className="tracking-wide text-[16px]">Masuk</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight size={20} className="opacity-90" />
                  </motion.div>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-[13px] font-semibold text-slate-500">
            Belum punya akun?{' '}
            <button 
              type="button"
              onClick={() => navigate('/signup')} 
              className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all ml-1 underline-offset-4"
            >
              Daftar Sekarang
            </button>
          </div>
        </motion.div>

        </div>
    </div>
  );
}
