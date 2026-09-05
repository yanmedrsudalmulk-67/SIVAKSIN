import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Database, CheckCircle2, AlertTriangle, Copy, Check, 
  ExternalLink, RefreshCw, KeyRound, Globe, ShieldCheck, Trash2, Save
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection, 
  SUPABASE_SCHEMA_SQL 
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncAll?: () => Promise<void>;
  isSyncing?: boolean;
  onConfigChanged?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onSyncAll,
  isSyncing = false,
  onConfigChanged
}) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [testResult, setTestResult] = useState<{ 
    success: boolean; 
    message: string;
    isPausedOrOffline?: boolean;
    isMissingTables?: boolean;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url || '');
      setKey(cfg.key || '');
      setIsConfigured(cfg.isConfigured);
      setTestResult(null);
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveSupabaseConfig(url, key);
      setIsConfigured(true);
      setIsTesting(true);
      const res = await testSupabaseConnection();
      setTestResult(res);
      setIsTesting(false);
      onConfigChanged?.();
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Gagal menyimpan kredensial' });
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setIsTesting(false);
  };

  const handleClear = () => {
    if (window.confirm('Beralih ke mode Penyimpanan Lokal browser dan putuskan sambungan Supabase?')) {
      clearSupabaseConfig();
      setUrl('');
      setKey('');
      setIsConfigured(false);
      setTestResult({
        success: true,
        message: 'Berhasil beralih ke Mode Penyimpanan Lokal. Data tersimpan di browser Anda tanpa eror jaringan.'
      });
      onConfigChanged?.();
    }
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Database size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Konfigurasi Database Supabase
                </h3>
                {isConfigured ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                    <CheckCircle2 size={11} /> Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                    <AlertTriangle size={11} /> Belum Terhubung
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Penyimpanan cloud terintegrasi untuk data Anafilaktik Kit & SIVAKSIN
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Pengaturan Kredensial
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Skrip SQL Tabel</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-extrabold">
              1-Klik
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'config' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                Kredensial dapat dimasukkan di sini atau melalui variabel lingkungan (Secrets panel) 
                <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-200 font-mono text-slate-800">VITE_SUPABASE_URL</code> 
                dan 
                <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-200 font-mono text-slate-800">VITE_SUPABASE_ANON_KEY</code>.
                Data disimpan otomatis di cloud secara aman.
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Globe size={14} className="text-emerald-600" />
                  Project URL Supabase
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://your-project-id.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              {/* Anon Key */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-emerald-600" />
                  Project Anon Public API Key
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all font-mono break-all"
                />
              </div>

              {/* Status Test Box */}
              {testResult && (
                <div className="space-y-2.5">
                  <div
                    className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {testResult.success ? (
                      <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed font-medium">{testResult.message}</span>
                  </div>

                  {/* Panduan Khusus jika Error Failed to fetch / Server Paused */}
                  {testResult.isPausedOrOffline && (
                    <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs space-y-2">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                        <span>Penyebab &amp; Solusi Utama "Failed to fetch":</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1.5 text-slate-700 pl-1 leading-relaxed">
                        <li>
                          <strong>Proyek Supabase Sedang Dijeda (Paused):</strong> Pada paket gratis Supabase, proyek otomatis dinonaktifkan sementara jika tidak aktif selama 7 hari.
                          <div className="mt-1 pl-4">
                            <a 
                              href="https://supabase.com/dashboard" 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-emerald-700 font-bold underline inline-flex items-center gap-1 hover:text-emerald-800"
                            >
                              Buka Supabase Dashboard <ExternalLink size={11} />
                            </a>
                            <span className="ml-1 text-slate-600">lalu klik tombol <strong>"Restore project"</strong> (membutuhkan waktu ~1-2 menit).</span>
                          </div>
                        </li>
                        <li>
                          <strong>Format URL:</strong> Pastikan URL berformat <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">https://xxxxxxxxxxxx.supabase.co</code> (bukan link halaman admin browser).
                        </li>
                        <li>
                          <strong>Gunakan Penyimpanan Lokal:</strong> Jika Anda belum ingin mengaktifkan cloud, klik tombol <strong>"Gunakan Penyimpanan Lokal"</strong> di bawah ini agar aplikasi berjalan lancar tanpa peringatan eror.
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    {isTesting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Simpan & Hubungkan</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting || !url || !key}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
                    <span>Tes Koneksi</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isConfigured && onSyncAll && (
                    <button
                      type="button"
                      onClick={onSyncAll}
                      disabled={isSyncing}
                      className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                      <span>Sinkron Sekarang</span>
                    </button>
                  )}

                  {isConfigured ? (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                      title="Putuskan Supabase & Gunakan Mode Lokal"
                    >
                      <Trash2 size={14} />
                      <span>Gunakan Mode Lokal</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Jalankan skrip ini sekali di <strong>Supabase &gt; SQL Editor</strong> untuk membuat semua tabel otomatis:
                </p>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                >
                  {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                  {SUPABASE_SCHEMA_SQL}
                </pre>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <span>Skrip telah mencakup tabel Anafilaktik Kit, Vaksin, Booking, dan Pengguna.</span>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                >
                  Buka Supabase <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SupabaseConfigModal;
