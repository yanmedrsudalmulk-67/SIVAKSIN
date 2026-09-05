import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isDangerAll?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Ya, Hapus Data',
  isDangerAll = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 text-center space-y-4"
      >
        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
          isDangerAll ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
        }`}>
          {isDangerAll ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed px-2">
            {description}
          </p>
        </div>

        {isDangerAll && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-[11px] text-rose-700 font-medium text-left">
            ⚠️ <strong>Perhatian:</strong> Penghapusan ini berlaku pada tabel saat ini dan akan disinkronkan ke Supabase jika terhubung. Anda tetap dapat memuat ulang 20 item standar kapan saja.
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
