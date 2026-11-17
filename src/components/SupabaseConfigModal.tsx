import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Database, HardDrive, CheckCircle2, RefreshCw, Download, 
  Folder, X, ShieldCheck, Check, Server, Smartphone, Globe, Copy, ExternalLink, Loader2
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function SupabaseConfigModal({
  isOpen,
  onClose,
  onSaved
}: SupabaseConfigModalProps) {
  const [dbStats, setDbStats] = useState<any>({
    vaccines: 0,
    bookings: 0,
    users: 0,
    status: 'checking'
  });
  const [tunnelInfo, setTunnelInfo] = useState<{ active: boolean; url: string | null; isStarting?: boolean }>({ active: false, url: null });
  const [isTogglingTunnel, setIsTogglingTunnel] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 1. Fetch DB Stats
      fetch('/api/db')
        .then(res => res.json())
        .then(data => {
          setDbStats({
            vaccines: data.vaccines?.length || 0,
            bookings: data.bookings?.length || 0,
            users: data.users?.length || 0,
            status: 'online'
          });
        })
        .catch(() => {
          setDbStats({
            vaccines: 3,
            bookings: 1,
            users: 2,
            status: 'local_storage'
          });
        });

      // 2. Fetch Tunnel Status
      fetch('/api/tunnel')
        .then(res => res.json())
        .then(data => {
          setTunnelInfo(data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleTunnel = async () => {
    setIsTogglingTunnel(true);
    try {
      const endpoint = tunnelInfo.active ? '/api/tunnel/stop' : '/api/tunnel/start';
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (tunnelInfo.active) {
        setTunnelInfo({ active: false, url: null });
      } else if (data.url) {
        setTunnelInfo({ active: true, url: data.url });
      }
    } catch (e) {
      alert('Gagal menghubungkan Cloudflare Tunnel');
    } finally {
      setIsTogglingTunnel(false);
    }
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadBackup = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/db');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SIVAKSIN_BACKUP_LOKAL_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Gagal mengunduh backup data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefreshData = () => {
    if (onSaved) onSaved();
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-6 text-white relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <HardDrive size={24} className="text-cyan-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Penyimpanan & Akses SIVAKSIN
                </h3>
                <p className="text-xs text-cyan-100 opacity-90">
                  Data lokal komputer & link akses online HP (4G/5G)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Card: Akses Online HP (Cloudflare Tunnel) */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Akses HP dari Luar Jaringan (Paket Data 4G/5G)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Bebas diakses tanpa harus satu Wi-Fi (Gratis & Aman HTTPS)
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                tunnelInfo.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {tunnelInfo.active ? '● Aktif' : '○ Standby'}
              </span>
            </div>

            {tunnelInfo.url ? (
              <div className="space-y-2 pt-1">
                <div className="p-2.5 bg-white rounded-xl border border-indigo-200 flex items-center justify-between gap-2">
                  <code className="text-[11px] font-mono text-indigo-700 font-bold break-all select-all">
                    {tunnelInfo.url}
                  </code>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(tunnelInfo.url!)}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Salin Link"
                    >
                      {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
                    </button>
                    <a
                      href={tunnelInfo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                      title="Buka di Tab Baru"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <p className="text-[10.5px] text-indigo-900/80 leading-relaxed">
                  📱 Buka link di atas di browser HP Anda. Data tetap tersimpan langsung di komputer ini secara realtime.
                </p>
              </div>
            ) : (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleToggleTunnel}
                  disabled={isTogglingTunnel}
                  className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isTogglingTunnel ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menghubungkan Link Online...</span>
                    </>
                  ) : (
                    <>
                      <Globe size={14} />
                      <span>Aktifkan Link Akses Online HP</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Status Alert Penyimpanan Lokal */}
          <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-emerald-500/20">
              <ShieldCheck size={18} />
            </div>
            <div className="text-xs text-emerald-900 leading-relaxed">
              <p className="font-bold text-emerald-950 text-sm">Offline & Aman di Komputer Anda</p>
              <p className="mt-1 text-emerald-800">
                Aplikasi SIVAKSIN tidak lagi bergantung pada Supabase Cloud. Seluruh data vaksin, pasien, laporan anafilaktik, dan berkas KTP/Paspor tersimpan di komputer ini.
              </p>
            </div>
          </div>

          {/* Lokasi File Penyimpanan */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Folder size={14} className="text-blue-600" />
              Alamat Akses & Direktori
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-medium block text-[10px]">Akses Wi-Fi Lokal (HP di Wi-Fi yang sama):</span>
                  <code className="text-blue-600 font-mono text-[11px] font-bold">
                    http://192.168.100.23:3003
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyLink('http://192.168.100.23:3003')}
                  className="p-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                  title="Salin"
                >
                  <Copy size={13} />
                </button>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-slate-500 font-medium block text-[10px]">Database JSON:</span>
                <code className="text-slate-800 font-mono text-[11px] font-semibold break-all">
                  data/sivaksin_db.json
                </code>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-slate-500 font-medium block text-[10px]">Folder File & Foto Dokumen:</span>
                <code className="text-slate-800 font-mono text-[11px] font-semibold break-all">
                  public/uploads/
                </code>
              </div>
            </div>
          </div>

          {/* Statistik Data */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl text-center">
              <span className="text-lg font-black text-blue-700">{dbStats.vaccines}</span>
              <span className="block text-[10px] font-bold text-slate-500 mt-0.5">Jenis Vaksin</span>
            </div>
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-center">
              <span className="text-lg font-black text-indigo-700">{dbStats.bookings}</span>
              <span className="block text-[10px] font-bold text-slate-500 mt-0.5">Pendaftaran</span>
            </div>
            <div className="p-3 bg-cyan-50/60 border border-cyan-100 rounded-2xl text-center">
              <span className="text-lg font-black text-cyan-700">{dbStats.users}</span>
              <span className="block text-[10px] font-bold text-slate-500 mt-0.5">Pengguna</span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              disabled={isExporting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={16} />
              <span>{isExporting ? 'Sedang Mengunduh...' : 'Unduh Cadangan Database (.JSON)'}</span>
            </button>

            <button
              type="button"
              onClick={handleRefreshData}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              {syncSuccess ? (
                <>
                  <Check size={16} className="text-emerald-600" />
                  <span className="text-emerald-700">Data Berhasil Diperbarui</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Muat Ulang Data dari Komputer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
}
export { SupabaseConfigModal };
