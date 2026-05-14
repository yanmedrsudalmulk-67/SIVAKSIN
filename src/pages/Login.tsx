import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { ShieldCheck, User, Lock, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginUser } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username/Email dan kata sandi harus diisi.');
      return;
    }

    const success = await loginUser({ username, password, email: username });
    if (success) {
      navigate('/home');
    } else {
      setError('Username atau kata sandi tidak sesuai. Jika belum punya akun, silakan daftar.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative font-sans">
      <div className="absolute top-0 inset-x-0 h-64 bg-brand-900 rounded-b-[40px] shadow-lg pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-md mx-auto relative z-10 px-6 pt-16 pb-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center mb-4 shadow-xl">
            <Activity className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-wide">Masuk</h1>
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

          <form onSubmit={handleLogin} className="space-y-5">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                  placeholder="Masukkan username"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                  placeholder="Masukkan kata sandi"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full h-14 bg-brand-600 text-white rounded-2xl font-bold text-lg mt-4 flex items-center justify-center gap-2 hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/30"
            >
              Masuk
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Jamaah belum punya akun?{' '}
            <button 
              onClick={() => navigate('/signup')} 
              className="text-brand-600 font-bold hover:underline"
            >
              Daftar Akun
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
