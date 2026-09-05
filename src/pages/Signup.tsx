import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { User, Lock, ArrowRight, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { registerUser } = useAppStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Semua kolom harus diisi.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Register user
    const result = await registerUser({ username, email, password });
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Gagal mendaftar. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative font-sans">
      <div className="absolute top-0 inset-x-0 h-64 bg-brand-900 rounded-b-[40px] shadow-lg pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-md mx-auto relative z-10 px-6 pt-12 pb-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center mb-3 shadow-xl">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">Daftar Akun</h1>
          <p className="text-blue-100 text-sm mt-1">SIVAKSIN RSUD Al-Mulk</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex-1 relative"
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1">Username</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                  placeholder="Buat username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1">Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                  placeholder="Masukkan email aktif"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1">Kata Sandi</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                  placeholder="Buat kata sandi"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 pl-1">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                  placeholder="Ulangi kata sandi"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-brand-600 text-white rounded-2xl font-bold text-lg mt-6 flex items-center justify-center gap-2 hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/30 disabled:opacity-70"
            >
              {isLoading ? (
                <><Loader2 size={20} className="animate-spin" /> Memproses...</>
              ) : (
                <>Daftar Akun <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-medium text-slate-500">
            Sudah punya akun?{' '}
            <button 
              type="button"
              onClick={() => navigate('/login')} 
              className="text-brand-600 font-bold hover:underline"
            >
              Masuk
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
