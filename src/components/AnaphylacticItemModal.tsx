import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, Plus, Edit2, PackagePlus, AlertCircle, Calendar, Hash, Check } from 'lucide-react';
import { AnaphylacticItem } from '../data/anaphylacticData';

interface AnaphylacticItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: AnaphylacticItem) => void;
  initialItem?: AnaphylacticItem | null;
  suggestedNo?: number;
}

export const AnaphylacticItemModal: React.FC<AnaphylacticItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  suggestedNo = 1
}) => {
  const isEditing = Boolean(initialItem);

  const [formData, setFormData] = useState<AnaphylacticItem>({
    no: suggestedNo,
    nama: '',
    spesifikasi: '',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '-',
    expDate: '-',
    kondisi: 'Baik',
    kategori: 'Obat'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialItem) {
        setFormData({ ...initialItem });
      } else {
        setFormData({
          no: suggestedNo,
          nama: '',
          spesifikasi: '',
          stokAwal: 1,
          stokSisa: 1,
          noBatch: '-',
          expDate: '-',
          kondisi: 'Baik',
          kategori: 'Obat'
        });
      }
      setErrors({});
    }
  }, [isOpen, initialItem, suggestedNo]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.nama.trim()) {
      errs.nama = 'Nama obat atau alat wajib diisi';
    }
    if (formData.stokAwal < 1) {
      errs.stokAwal = 'Stok awal minimal 1';
    }
    if (formData.stokSisa < 0) {
      errs.stokSisa = 'Stok sisa tidak boleh negatif';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...formData,
      nama: formData.nama.trim(),
      spesifikasi: formData.spesifikasi.trim() || '-',
      noBatch: formData.noBatch.trim() || '-',
      expDate: formData.expDate.trim() || '-'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
              {isEditing ? <Edit2 size={20} /> : <PackagePlus size={22} />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {isEditing ? `Edit Item #${formData.no}` : 'Tambah Item Anafilaktik Kit'}
              </h3>
              <p className="text-xs text-rose-200/80">
                {isEditing ? 'Perbarui data obat atau alat medis di kit' : 'Tambahkan obat atau alat baru ke daftar standar'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Row 1: No & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Hash size={13} className="text-slate-400" />
                No. Urut
              </label>
              <input
                type="number"
                min={1}
                value={formData.no}
                onChange={(e) => setFormData({ ...formData, no: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
                disabled={isEditing}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Item
              </label>
              <select
                value={formData.kategori || 'Obat'}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
              >
                <option value="Obat">Obat (Injeksi / Ampul)</option>
                <option value="Alat">Alat Medis (Spuit / Selang / Jarum)</option>
                <option value="Cairan">Cairan Infus (RL / NaCl)</option>
                <option value="Kassa">Kassa / Plester / Pembalut</option>
              </select>
            </div>
          </div>

          {/* Row 2: Nama & Spesifikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Obat / Alat <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Adrenalin / Spuit"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none transition-all ${
                  errors.nama ? 'border-rose-500' : 'border-slate-200 focus:border-rose-500'
                }`}
              />
              {errors.nama && <span className="text-[11px] text-rose-600 font-bold mt-0.5 block">{errors.nama}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Spesifikasi / Ukuran
              </label>
              <input
                type="text"
                placeholder="Contoh: Ampul / 3 cc / Dewasa"
                value={formData.spesifikasi}
                onChange={(e) => setFormData({ ...formData, spesifikasi: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Row 3: Stok Awal & Stok Sisa */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stok Awal (Standar)
              </label>
              <input
                type="number"
                min={1}
                value={formData.stokAwal}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                  setFormData(prev => ({
                    ...prev,
                    stokAwal: val,
                    // If adding new, sync initial sisa
                    stokSisa: isEditing ? prev.stokSisa : val
                  }));
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stok Sisa (Riil)
              </label>
              <input
                type="number"
                min={0}
                value={formData.stokSisa}
                onChange={(e) => setFormData({ ...formData, stokSisa: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kondisi Fisik
              </label>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, kondisi: 'Baik' })}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    formData.kondisi === 'Baik'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Baik
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, kondisi: 'Tidak' })}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    formData.kondisi === 'Tidak'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tidak
                </button>
              </div>
            </div>
          </div>

          {/* Row 4: No Batch & Exp Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Batch
              </label>
              <input
                type="text"
                placeholder="Contoh: 76344001-1 atau -"
                value={formData.noBatch}
                onChange={(e) => setFormData({ ...formData, noBatch: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" />
                Tanggal Expired
              </label>
              <input
                type="text"
                placeholder="Contoh: Mar 2027 atau -"
                value={formData.expDate}
                onChange={(e) => setFormData({ ...formData, expDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              {isEditing ? <Save size={14} /> : <Plus size={14} />}
              <span>{isEditing ? 'Simpan Perubahan' : 'Tambahkan Item'}</span>
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
