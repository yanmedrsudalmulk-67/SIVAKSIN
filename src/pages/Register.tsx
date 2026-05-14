import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, CheckCircle2, UploadCloud, Calendar as CalendarIcon, Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { format, addDays } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Register() {
  const navigate = useNavigate();
  const { vaccines, addBooking } = useAppStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', nik: '', passport: '', dob: '', gender: 'Laki-laki', handphone: '', email: '', 
    address: '', targetCountry: '', purpose: 'Umroh',
    ktpFile: null as File | null, passportFile: null as File | null,
    selectedVaccine: '', selectedDate: '', selectedTime: '',
    paymentMethod: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleUpdate = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplete = () => {
    addBooking({
      id: `BK${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      vaccineId: formData.selectedVaccine,
      date: formData.selectedDate,
      time: formData.selectedTime,
      status: 'menunggu',
      patient: formData
    });
    setStep(5);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3, 4].map(i => (
        <React.Fragment key={i}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step === i ? 'bg-brand-600 text-white' : 
            step > i ? 'bg-health-500 text-white' : 'bg-slate-200 text-slate-400'
          }`}>
            {step > i ? <CheckCircle2 size={16} /> : i}
          </div>
          {i < 4 && <div className={`w-8 h-1 rounded-full ${step > i ? 'bg-health-500' : 'bg-slate-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-6 flex flex-col relative w-full h-full">
      {/* Background decoration inside the mobile frame */}
      <div className="absolute top-1/4 -right-1/4 w-64 h-64 bg-brand-200/50 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl px-4 py-4 flex items-center gap-4 sticky top-0 z-40 shadow-sm border-b border-slate-100/50">
        {step < 5 ? (
          <button onClick={step === 1 ? () => navigate(-1) : prevStep} className="p-2 -ml-2 rounded-xl hover:bg-slate-100">
            <ChevronLeft size={24} className="text-slate-700" />
          </button>
        ) : <div className="w-10"></div>}
        <h1 className="font-bold text-lg text-slate-800 flex-1 text-center pr-10">
          {step === 1 ? 'Biodata Pasien' : 
           step === 2 ? 'Pilih Vaksin' : 
           step === 3 ? 'Jadwal Vaksinasi' : 
           step === 4 ? 'Pembayaran' : 'Selesai'}
        </h1>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {step < 5 && <StepIndicator />}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col gap-4">
              <div className="glass-card p-5 rounded-2xl border border-slate-100 space-y-4">
                <Input label="Nama Sesuai KTP/Passport" value={formData.name} onChange={(v) => handleUpdate('name', v)} />
                <Input label="NIK" type="number" value={formData.nik} onChange={(v) => handleUpdate('nik', v)} />
                <Input label="Nomor Passport" value={formData.passport} onChange={(v) => handleUpdate('passport', v)} />
                <Input label="Nomor WhatsApp" type="tel" value={formData.handphone} onChange={(v) => handleUpdate('handphone', v)} />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tujuan Perjalanan</label>
                  <select 
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none backdrop-blur-sm"
                    value={formData.purpose}
                    onChange={(e) => handleUpdate('purpose', e.target.value)}
                  >
                    <option value="Umroh">Ibadah Umroh</option>
                    <option value="Haji">Ibadah Haji</option>
                    <option value="Kerja">Bekerja / Pekerja Migran</option>
                    <option value="Pendidikan">Pendidikan / Pelajar</option>
                    <option value="Wisata">Wisata / Turis</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-sm font-semibold text-slate-700">Upload KTP</label>
                  <label className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-colors cursor-pointer relative overflow-hidden">
                    <input type="file" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => {
                      if(e.target.files && e.target.files[0]) {
                        handleUpdate('ktpFile', e.target.files[0]);
                      }
                    }} />
                    {formData.ktpFile ? (
                       <div className="text-center">
                         <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-2"><CheckCircle2 size={20} /></div>
                         <span className="text-sm font-bold text-slate-700 block truncate max-w-[200px]">{formData.ktpFile.name}</span>
                       </div>
                    ) : (
                      <>
                        <UploadCloud size={24} className="mb-2" />
                        <span className="text-xs font-medium text-center">Klik untuk upload KTP<br/>(Max 2MB)</span>
                      </>
                    )}
                  </label>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-semibold text-slate-700">Upload Passport (Opsional)</label>
                  <label className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-colors cursor-pointer relative overflow-hidden">
                    <input type="file" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => {
                      if(e.target.files && e.target.files[0]) {
                        handleUpdate('passportFile', e.target.files[0]);
                      }
                    }} />
                    {formData.passportFile ? (
                       <div className="text-center">
                         <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-2"><CheckCircle2 size={20} /></div>
                         <span className="text-sm font-bold text-slate-700 block truncate max-w-[200px]">{formData.passportFile.name}</span>
                       </div>
                    ) : (
                      <>
                        <UploadCloud size={24} className="mb-2" />
                        <span className="text-xs font-medium text-center">Klik untuk upload Passport<br/>(Max 2MB)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div className="mt-auto pt-6">
                <Button onClick={nextStep} disabled={!formData.name || !formData.nik || !formData.handphone}>Selanjutnya</Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
              <div className="space-y-4">
                {vaccines.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => handleUpdate('selectedVaccine', v.id)}
                    className={`glass-card p-5 rounded-2xl transition-all cursor-pointer ${
                      formData.selectedVaccine === v.id ? 'border-brand-500 ring-4 ring-brand-50 bg-white/90' : 'border-slate-100 hover:border-brand-200 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800">{v.name}</h3>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.selectedVaccine === v.id ? 'border-brand-500' : 'border-slate-300'}`}>
                        {formData.selectedVaccine === v.id && <div className="w-2.5 h-2.5 bg-brand-500 rounded-full" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{v.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-health-600 font-semibold bg-health-50 px-2 py-1 rounded-md">Stok: {v.stock}</span>
                      <span className="font-bold text-brand-700">Rp{v.price.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-6">
                <Button onClick={nextStep} disabled={!formData.selectedVaccine}>Selanjutnya</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
              <div className="glass-card p-6 rounded-2xl border border-slate-100 mb-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CalendarIcon size={18} className="text-brand-500"/> Pilih Tanggal</h3>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  {[0, 1, 2, 3, 4, 5, 6].map(i => {
                    const date = addDays(new Date(), i);
                    const formatted = format(date, 'yyyy-MM-dd');
                    const isActive = formData.selectedDate === formatted;
                    return (
                      <div 
                        key={i} 
                        onClick={() => handleUpdate('selectedDate', formatted)}
                        className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
                          isActive ? 'bg-brand-500 border-brand-500 text-white shadow-md' : 'bg-white/50 border-white text-slate-600 hover:bg-white/80'
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase">{format(date, 'EEEE', { locale: id }).substring(0, 3)}</span>
                        <span className={`text-xl font-bold mt-1 ${isActive ? "text-white" : "text-slate-800"}`}>{format(date, 'd')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-brand-500"/> Pilih Waktu</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'].map(time => {
                    const isActive = formData.selectedTime === time;
                    return (
                      <div 
                        key={time}
                        onClick={() => handleUpdate('selectedTime', time)}
                        className={`py-3 rounded-xl text-center text-sm font-semibold cursor-pointer border-2 transition-all ${
                          isActive ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white/50 border-white text-slate-600 hover:bg-white/80'
                        }`}
                      >
                        {time}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="mt-auto pt-6">
                <Button onClick={nextStep} disabled={!formData.selectedDate || !formData.selectedTime}>Selanjutnya</Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
              <div className="glass-card p-6 rounded-2xl border border-slate-100 mb-6">
                <h3 className="font-bold text-slate-800 mb-4">Ringkasan Pesanan</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-200/50 pb-3">
                    <span className="text-slate-500">Layanan</span>
                    <span className="font-semibold text-slate-800">{vaccines.find(v => v.id === formData.selectedVaccine)?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-3">
                    <span className="text-slate-500">Jadwal</span>
                    <span className="font-semibold text-slate-800">{formData.selectedDate} • {formData.selectedTime}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-3">
                    <span className="text-slate-500">Pasien</span>
                    <span className="font-semibold text-slate-800">{formData.name}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-bold text-slate-800">Total Pembayaran</span>
                    <span className="font-bold text-brand-600 text-lg">
                      Rp{vaccines.find(v => v.id === formData.selectedVaccine)?.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 mb-4 px-2">Metode Pembayaran</h3>
              <div className="space-y-3">
                {['Transfer Bank/Virtual Account', 'QRIS', 'E-Wallet (OVO, GoPay)'].map(method => (
                   <div 
                     key={method}
                     onClick={() => handleUpdate('paymentMethod', method)}
                     className={`glass-card p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                       formData.paymentMethod === method ? 'border-brand-500 bg-white/90' : 'border-white hover:border-brand-200'
                     }`}
                   >
                     <CreditCard className={formData.paymentMethod === method ? 'text-brand-500' : 'text-slate-400'} size={24} />
                     <span className="font-semibold text-sm text-slate-700">{method}</span>
                   </div>
                ))}
              </div>
              <div className="mt-auto pt-6">
                <Button onClick={handleComplete} disabled={!formData.paymentMethod}>Bayar Sekarang</Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-health-100 text-health-500 flex items-center justify-center">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Berhasil!</h2>
              <p className="text-slate-500 text-sm mb-8">
                Jadwal vaksinasi Anda telah dikonfirmasi. Mohon datang 15 menit sebelum waktu yang dijadwalkan membawa KTP asli.
              </p>
              <div className="w-full space-y-3">
                <Button onClick={() => navigate('/history')}>Lihat Riwayat</Button>
                <button onClick={() => navigate('/home')} className="w-full py-4 font-semibold text-brand-600 hover:bg-brand-50 rounded-2xl transition-colors">
                  Kembali ke Beranda
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (val: string) => void, type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
        placeholder={`Masukkan ${label.toLowerCase()}`}
      />
    </div>
  )
}

function Button({ children, disabled, onClick }: { children: React.ReactNode, disabled?: boolean, onClick?: () => void }) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
        disabled ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/30'
      }`}
    >
      {children}
    </button>
  );
}
