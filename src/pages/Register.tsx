import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, CheckCircle2, UploadCloud, Calendar as CalendarIcon, Clock, CreditCard, User, FileText, Phone, Plane, ChevronDown, Check, Loader2, Syringe, AlertCircle, Sparkles, Plus, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { uploadFileToSupabase } from '../services/supabaseStorageService';
import { isSupabaseConfigured } from '../lib/supabase';
import { format, addDays } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Register() {
  const navigate = useNavigate();
  const { vaccines, addBooking, user, updateUser } = useAppStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingKtp, setIsUploadingKtp] = useState(false);
  const [isUploadingPassport, setIsUploadingPassport] = useState(false);
  const [uploadKtpStatus, setUploadKtpStatus] = useState<string>('');
  const [uploadPassportStatus, setUploadPassportStatus] = useState<string>('');

  const [formData, setFormData] = useState({
    name: user?.name || '', 
    nik: user?.nik || '', 
    passport: user?.no_passport || '', 
    dob: '', 
    gender: 'Laki-laki', 
    handphone: user?.no_hp || '', 
    email: user?.email || '', 
    address: user?.alamat || '', 
    targetCountry: '', 
    purpose: 'Umroh',
    ktpFile: null as File | null,
    ktpUrl: user?.ktp_url || '',
    passportFile: null as File | null,
    passportUrl: user?.passport_url || '',
    selectedVaccines: [] as string[], 
    selectedVaccine: '', 
    selectedDate: '', 
    selectedTime: '',
    paymentMethod: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleUpdate = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleVaccineSelection = (vaccineId: string) => {
    setFormData(prev => {
      const currentList = prev.selectedVaccines || [];
      const isSelected = currentList.includes(vaccineId);
      const updated = isSelected 
        ? currentList.filter(id => id !== vaccineId)
        : [...currentList, vaccineId];
      return {
        ...prev,
        selectedVaccines: updated,
        selectedVaccine: updated.length > 0 ? updated[0] : ''
      };
    });
  };

  const selectAllAvailableVaccines = () => {
    const available = vaccines.filter(v => (v.stock || 0) > 0).map(v => v.id);
    setFormData(prev => ({
      ...prev,
      selectedVaccines: available,
      selectedVaccine: available[0] || ''
    }));
  };

  const clearVaccineSelection = () => {
    setFormData(prev => ({
      ...prev,
      selectedVaccines: [],
      selectedVaccine: ''
    }));
  };

  const selectedVaccinesList = useMemo(() => {
    return vaccines.filter(v => formData.selectedVaccines.includes(v.id));
  }, [vaccines, formData.selectedVaccines]);

  const totalVaccinePrice = useMemo(() => {
    return selectedVaccinesList.reduce((sum, v) => sum + (v.price || 0), 0);
  }, [selectedVaccinesList]);

  // Available business days (Senin - Jum'at only, minimal 14 hari ke depan)
  const availableDates = useMemo(() => {
    const list: Date[] = [];
    let checkDate = new Date();
    // Generate next 15 weekdays
    while (list.length < 15) {
      const day = checkDate.getDay();
      // 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jum'at
      if (day >= 1 && day <= 5) {
        list.push(new Date(checkDate));
      }
      checkDate = addDays(checkDate, 1);
    }
    return list;
  }, []);

  // Time slots strictly between 08.00 - 14.00 WIB
  const availableTimeSlots = [
    { time: '08:00', label: '08:00 WIB', session: 'Pagi' },
    { time: '08:30', label: '08:30 WIB', session: 'Pagi' },
    { time: '09:00', label: '09:00 WIB', session: 'Pagi' },
    { time: '09:30', label: '09:30 WIB', session: 'Pagi' },
    { time: '10:00', label: '10:00 WIB', session: 'Pagi' },
    { time: '10:30', label: '10:30 WIB', session: 'Pagi' },
    { time: '11:00', label: '11:00 WIB', session: 'Pagi' },
    { time: '11:30', label: '11:30 WIB', session: 'Pagi' },
    { time: '12:30', label: '12:30 WIB', session: 'Siang' },
    { time: '13:00', label: '13:00 WIB', session: 'Siang' },
    { time: '13:30', label: '13:30 WIB', session: 'Siang' },
    { time: '14:00', label: '14:00 WIB', session: 'Siang' },
  ];

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      handleUpdate('selectedDate', '');
      return;
    }
    const [y, m, d] = val.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const day = dateObj.getDay();
    if (day === 0 || day === 6) {
      alert("Mohon maaf, layanan vaksinasi internasional hanya buka pada hari Senin s/d Jum'at (Sabtu dan Minggu libur).");
      return;
    }
    handleUpdate('selectedDate', val);
  };

  const handleKtpUpload = async (file: File) => {
    handleUpdate('ktpFile', file);
    if (!isSupabaseConfigured) {
      setUploadKtpStatus('Disimpan di sesi lokal');
      return;
    }

    setIsUploadingKtp(true);
    setUploadKtpStatus('Mengunggah dokumen...');
    try {
      const result = await uploadFileToSupabase(file, 'documents', 'ktp');
      if (result.url) {
        handleUpdate('ktpUrl', result.url);
        setUploadKtpStatus('Dokumen berhasil diunggah');
      } else {
        setUploadKtpStatus(result.error || 'Upload gagal');
      }
    } catch (e: any) {
      setUploadKtpStatus('Gagal upload: ' + e.message);
    } finally {
      setIsUploadingKtp(false);
    }
  };

  const handlePassportUpload = async (file: File) => {
    handleUpdate('passportFile', file);
    if (!isSupabaseConfigured) {
      setUploadPassportStatus('Disimpan di sesi lokal');
      return;
    }

    setIsUploadingPassport(true);
    setUploadPassportStatus('Mengunggah dokumen...');
    try {
      const result = await uploadFileToSupabase(file, 'documents', 'passport');
      if (result.url) {
        handleUpdate('passportUrl', result.url);
        setUploadPassportStatus('Dokumen berhasil diunggah');
      } else {
        setUploadPassportStatus(result.error || 'Upload gagal');
      }
    } catch (e: any) {
      setUploadPassportStatus('Gagal upload: ' + e.message);
    } finally {
      setIsUploadingPassport(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const bookingPayload = {
        name: formData.name,
        nik: formData.nik,
        passport: formData.passport,
        dob: formData.dob,
        gender: formData.gender,
        handphone: formData.handphone,
        email: formData.email,
        address: formData.address,
        purpose: formData.purpose,
        targetCountry: formData.targetCountry,
        ktp_url: formData.ktpUrl || null,
        ktp_file_name: formData.ktpFile?.name || null,
        passport_url: formData.passportUrl || null,
        passport_file_name: formData.passportFile?.name || null,
        selectedVaccines: formData.selectedVaccines,
        selectedVaccineNames: selectedVaccinesList.map(v => v.name).join(', '),
        selectedVaccine: selectedVaccinesList.map(v => v.name).join(', '),
        totalPrice: totalVaccinePrice,
        selectedDate: formData.selectedDate,
        selectedTime: formData.selectedTime,
        paymentMethod: formData.paymentMethod
      };

      await addBooking({
        id: `BK${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        vaccineId: formData.selectedVaccines[0] || formData.selectedVaccine || 'v1',
        vaccineIds: formData.selectedVaccines,
        date: formData.selectedDate,
        time: formData.selectedTime,
        status: 'menunggu',
        patient: bookingPayload
      });

      // Update user details in cloud if user is logged in
      if (user?.id && updateUser) {
        updateUser({
          name: formData.name,
          nik: formData.nik,
          no_passport: formData.passport,
          no_hp: formData.handphone,
          alamat: formData.address,
          ktp_url: formData.ktpUrl || user.ktp_url,
          passport_url: formData.passportUrl || user.passport_url
        });
      }

      setStep(5);
    } catch (err) {
      console.error('Booking submission error:', err);
      setStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ['Biodata', 'Vaksin', 'Jadwal', 'Bayar'];

  const StepIndicator = () => (
    <div className="px-2 mb-8 mt-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-4 h-[3px] bg-slate-200 rounded-full -z-10"></div>
        <div className="absolute left-0 top-4 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full -z-10 transition-all duration-500 ease-out" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
        
        {stepLabels.map((label, index) => {
          const i = index + 1;
          const isActive = step === i;
          const isCompleted = step > i;
          
          return (
            <div key={i} className="flex flex-col items-center gap-2.5">
              <motion.div 
                initial={false}
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm ${
                  isActive ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white ring-4 ring-blue-100 shadow-[0_4px_10px_rgba(37,99,235,0.4)]' : 
                  isCompleted ? 'bg-blue-500 text-white shadow-[0_2px_5px_rgba(37,99,235,0.2)]' : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={3.5} /> : i}
              </motion.div>
              <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide transition-colors ${isActive ? 'text-blue-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-safe flex flex-col relative w-full h-full font-sans">
      {/* Background medical pattern blur */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none -translate-x-1/4 -translate-y-1/2"></div>
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[100px] pointer-events-none -translate-x-1/2"></div>

      {/* Header Premium */}
      <div className="bg-white/90 backdrop-blur-xl px-5 py-4 flex flex-col justify-center sticky top-0 z-40 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border-b border-slate-100">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-4">
          {step < 5 ? (
            <button onClick={step === 1 ? () => navigate(-1) : prevStep} className="w-10 h-10 rounded-2xl bg-white/50 backdrop-blur-md flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform hover:bg-slate-50 relative z-10 shrink-0 cursor-pointer">
              <ChevronLeft size={22} className="text-slate-700" strokeWidth={2.5} />
            </button>
          ) : <div className="w-10 shrink-0"></div>}
          <div className="flex-1 text-center pr-10">
            <h1 className="font-extrabold text-[18px] text-slate-800 tracking-tight leading-tight">
              {step === 1 ? 'Biodata Pelaku Perjalanan' : 
               step === 2 ? 'Pilih Vaksin' : 
               step === 3 ? 'Jadwal Vaksinasi' : 
               step === 4 ? 'Pembayaran' : 'Booking Berhasil'}
            </h1>
            {step === 1 && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 opacity-80">LENGKAPI DATA UNTUK LAYANAN VAKSINASI INTERNASIONAL</p>}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col relative z-20 max-w-3xl mx-auto w-full">
        {step < 5 && <StepIndicator />}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col gap-5">
              
              <div className="bg-white p-6 sm:p-7 rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input icon={<User size={20}/>} label="Nama Sesuai KTP/Passport" value={formData.name} onChange={(v) => handleUpdate('name', v)} placeholder="Misal: John Doe" />
                  <Input icon={<CreditCard size={20}/>} label="Nomor Induk Kependudukan (NIK)" type="number" value={formData.nik} onChange={(v) => handleUpdate('nik', v)} placeholder="16 Digit NIK Anda" />
                  <Input icon={<FileText size={20}/>} label="Nomor Passport" value={formData.passport} onChange={(v) => handleUpdate('passport', v)} placeholder="Misal: A1234567" />
                  <Input icon={<Phone size={20}/>} label="Nomor WhatsApp" type="tel" value={formData.handphone} onChange={(v) => handleUpdate('handphone', v)} placeholder="Misal: 08123456789" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[13px] font-extrabold text-slate-800 pl-1">Tujuan Perjalanan</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                      <Plane size={20} />
                    </div>
                    <select 
                      className="w-full h-[56px] lg:h-[60px] bg-white border border-slate-200 rounded-[18px] lg:rounded-[20px] pl-12 pr-10 text-[14px] font-bold text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer hover:border-slate-300"
                      value={formData.purpose}
                      onChange={(e) => handleUpdate('purpose', e.target.value)}
                    >
                      <option value="Umroh">Ibadah Umroh</option>
                      <option value="Haji">Ibadah Haji</option>
                      <option value="Kerja">Bekerja / Pekerja Migran</option>
                      <option value="Pendidikan">Pendidikan / Pelajar</option>
                      <option value="Wisata">Wisata / Turis</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 -mx-6 my-2"></div>

                {/* Upload KTP */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5">
                      <span>Upload KTP</span>
                      <span className="text-red-500">*</span>
                    </label>
                    {uploadKtpStatus && (
                      <span className="text-[11px] font-semibold text-blue-600">
                        {uploadKtpStatus}
                      </span>
                    )}
                  </div>
                  <label className="border-2 border-dashed border-slate-200 rounded-[20px] p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden group">
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                      disabled={isUploadingKtp}
                      onChange={(e) => {
                        if(e.target.files && e.target.files[0]) {
                          handleKtpUpload(e.target.files[0]);
                        }
                      }} 
                    />
                    {isUploadingKtp ? (
                      <div className="text-center relative z-0 flex flex-col items-center py-2">
                        <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
                        <span className="text-[13px] font-bold text-slate-700">Mengunggah dokumen...</span>
                      </div>
                    ) : formData.ktpFile ? (
                       <div className="text-center relative z-0">
                         <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-200 animate-in zoom-in-50"><CheckCircle2 size={28} /></div>
                         <span className="text-[13px] font-bold text-slate-800 block truncate max-w-[220px] bg-white px-3 py-1 rounded-lg border border-slate-100">{formData.ktpFile.name}</span>
                         {formData.ktpUrl ? (
                           <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">✓ Dokumen Berhasil Diunggah</span>
                         ) : (
                           <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden relative">
                             <div className="absolute inset-y-0 left-0 bg-emerald-500 w-full animate-[progress_1s_ease-out]"></div>
                           </div>
                         )}
                       </div>
                    ) : (
                      <div className="relative z-0 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-3 text-blue-500 group-hover:scale-110 group-hover:bg-blue-50 transition-all">
                          <UploadCloud size={30} strokeWidth={1.5} />
                        </div>
                        <span className="text-[14px] font-extrabold text-slate-700 mb-1">Tap untuk upload dokumen KTP</span>
                        <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">KTP asli (Foto/PDF Max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Upload Passport */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5">
                      <span>Upload Passport</span>
                      <span className="text-slate-400 font-medium text-[11px]">(Opsional)</span>
                    </label>
                    {uploadPassportStatus && (
                      <span className="text-[11px] font-semibold text-blue-600">
                        {uploadPassportStatus}
                      </span>
                    )}
                  </div>
                  <label className="border-2 border-dashed border-slate-200 rounded-[20px] p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden group">
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                      disabled={isUploadingPassport}
                      onChange={(e) => {
                        if(e.target.files && e.target.files[0]) {
                          handlePassportUpload(e.target.files[0]);
                        }
                      }} 
                    />
                    {isUploadingPassport ? (
                      <div className="text-center relative z-0 flex flex-col items-center py-2">
                        <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
                        <span className="text-[13px] font-bold text-slate-700">Mengunggah dokumen...</span>
                      </div>
                    ) : formData.passportFile ? (
                       <div className="text-center relative z-0">
                         <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-200 animate-in zoom-in-50"><CheckCircle2 size={28} /></div>
                         <span className="text-[13px] font-bold text-slate-800 block truncate max-w-[220px] bg-white px-3 py-1 rounded-lg border border-slate-100">{formData.passportFile.name}</span>
                         {formData.passportUrl ? (
                           <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">✓ Dokumen Berhasil Diunggah</span>
                         ) : (
                           <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden relative">
                             <div className="absolute inset-y-0 left-0 bg-emerald-500 w-full animate-[progress_1s_ease-out]"></div>
                           </div>
                         )}
                       </div>
                    ) : (
                      <div className="relative z-0 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400 group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                          <UploadCloud size={30} strokeWidth={1.5} />
                        </div>
                        <span className="text-[14px] font-extrabold text-slate-700 mb-1">Tap untuk upload dokumen Passport</span>
                        <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">Passport asli (Foto/PDF Max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>

              </div>
              
              {/* Sticky Bottom Area for Step 1 */}
              <div className="sticky bottom-4 mt-2">
                <Button onClick={nextStep} disabled={!formData.name || !formData.nik || !formData.handphone || !formData.purpose}>Lanjut ke Pemilihan Vaksin</Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
              {/* Guidance banner */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border border-blue-100/80 rounded-[22px] p-4 mb-4 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Syringe size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[14px]">Pilih Jenis Vaksin</h4>
                      <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">
                        Anda dapat memilih <strong>lebih dari 1 jenis vaksin</strong> sekaligus (misal: Meningitis + Influenza) untuk satu kali jadwal kedatangan.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-blue-200/50 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-200/60 shadow-2xs">
                    <CheckCircle2 size={13} className="text-blue-600" />
                    <span>{formData.selectedVaccines.length} Vaksin Dipilih</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={selectAllAvailableVaccines} 
                      className="text-blue-700 hover:text-blue-800 font-bold hover:underline cursor-pointer text-[11px]"
                    >
                      Pilih Semua
                    </button>
                    {formData.selectedVaccines.length > 0 && (
                      <>
                        <span className="text-slate-300">•</span>
                        <button 
                          type="button" 
                          onClick={clearVaccineSelection} 
                          className="text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer text-[11px]"
                        >
                          Reset
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Vaccine Cards */}
              <div className="space-y-3.5">
                {vaccines.map(v => {
                  const isOutOfStock = (v.stock || 0) <= 0;
                  const isSelected = formData.selectedVaccines.includes(v.id);

                  return (
                    <div 
                      key={v.id} 
                      onClick={() => {
                        if (!isOutOfStock) {
                          toggleVaccineSelection(v.id);
                        }
                      }}
                      className={`bg-white p-4 sm:p-5 rounded-[24px] shadow-sm transition-all border-2 ${
                        isOutOfStock 
                          ? 'opacity-60 border-slate-100 bg-slate-50/70 cursor-not-allowed' 
                          : isSelected 
                            ? 'border-blue-600 bg-blue-50/25 ring-4 ring-blue-500/10 cursor-pointer shadow-md' 
                            : 'border-slate-100 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="pr-3 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-slate-800 text-[15px]">{v.name}</h3>
                            {v.category && (
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                v.category === 'Wajib' 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                Vaksin {v.category}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Checkbox box indicator */}
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                          isOutOfStock 
                            ? 'border-slate-200 bg-slate-100 text-slate-400'
                            : isSelected 
                              ? 'border-blue-600 bg-blue-600 text-white shadow-xs' 
                              : 'border-slate-300 bg-white hover:border-blue-400'
                        }`}>
                          {isSelected && !isOutOfStock && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      
                      <p className="text-[12px] text-slate-500 mb-3 line-clamp-2 leading-relaxed">{v.description}</p>
                      
                      <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-100">
                        <div>
                          {isOutOfStock ? (
                            <span className="text-rose-700 font-extrabold bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider">
                              Stok Habis
                            </span>
                          ) : v.stock < 10 ? (
                            <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider">
                              Stok Kritis: {v.stock}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider">
                              Stok Tersedia: {v.stock}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-black text-blue-700 text-[16px]">Rp{v.price.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sticky bottom selection bar */}
              <div className="sticky bottom-4 mt-6 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-[24px] border border-slate-200/80 shadow-lg space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Total ({formData.selectedVaccines.length} Vaksin):</span>
                    <div className="text-lg font-black text-blue-700">
                      Rp{totalVaccinePrice.toLocaleString('id-ID')}
                    </div>
                  </div>
                  {formData.selectedVaccines.length === 0 && (
                    <span className="text-[11px] text-rose-500 font-bold bg-rose-50 px-2.5 py-1 rounded-lg">
                      Pilih minimal 1 vaksin
                    </span>
                  )}
                </div>
                <Button 
                  onClick={nextStep} 
                  disabled={formData.selectedVaccines.length === 0}
                >
                  Lanjut ke Penjadwalan {formData.selectedVaccines.length > 0 ? `(${formData.selectedVaccines.length} Vaksin)` : ''}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
              {/* Jadwal Operasional Info Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-xl flex-shrink-0 mt-0.5 shadow-sm">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">Ketentuan Jadwal Vaksinasi</h4>
                  <p className="text-xs font-medium text-blue-700 mt-0.5 leading-relaxed">
                    Pelayanan buka setiap hari <strong className="font-bold text-blue-950">Senin s/d Jum'at</strong> pukul <strong className="font-bold text-blue-950">08.00 - 14.00 WIB</strong> (Sabtu, Minggu & Hari Libur Nasional Tutup).
                  </p>
                </div>
              </div>

              {/* Pilih Tanggal Vaksinasi (Senin - Jum'at) */}
              <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] mb-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                    <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><CalendarIcon size={20}/></div>
                    Pilih Hari & Tanggal
                  </h3>
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                    Senin - Jum'at
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium mb-3">
                  Pilih salah satu tanggal operasional yang tersedia di bawah ini:
                </p>

                {/* Horizontal Weekday Cards */}
                <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2 -mx-2 px-2">
                  {availableDates.map((date, idx) => {
                    const formatted = format(date, 'yyyy-MM-dd');
                    const isActive = formData.selectedDate === formatted;
                    const dayName = format(date, 'EEEE', { locale: id });
                    const isFriday = date.getDay() === 5;

                    return (
                      <div 
                        key={idx} 
                        onClick={() => handleUpdate('selectedDate', formatted)}
                        className={`flex-shrink-0 w-[72px] h-[92px] rounded-[22px] flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
                          isActive 
                            ? 'bg-gradient-to-b from-blue-600 to-indigo-700 border-transparent text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)] scale-105' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/40'
                        }`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${
                          isActive ? 'text-blue-100' : isFriday ? 'text-indigo-600' : 'text-slate-400'
                        }`}>
                          {dayName.substring(0, 3)}
                        </span>
                        <span className={`text-[22px] font-black leading-none ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          {format(date, 'd')}
                        </span>
                        <span className={`text-[10px] font-bold mt-1 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                          {format(date, 'MMM', { locale: id })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Optional Calendar Date Input */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">Atau pilih tanggal lain:</label>
                  <input
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={formData.selectedDate}
                    onChange={handleCustomDateChange}
                    className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Pilih Jam Layanan (08.00 - 14.00 WIB) */}
              <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                    <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><Clock size={20}/></div>
                    Pilih Jam Layanan
                  </h3>
                  <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                    08.00 - 14.00 WIB
                  </span>
                </div>

                {/* Sesi Pagi */}
                <div className="mb-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Sesi Pagi (08:00 - 11:30)
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {availableTimeSlots.filter(t => t.session === 'Pagi').map(slot => {
                      const isActive = formData.selectedTime === slot.label;
                      return (
                        <div 
                          key={slot.time}
                          onClick={() => handleUpdate('selectedTime', slot.label)}
                          className={`h-11 flex flex-col items-center justify-center rounded-[16px] text-xs font-black cursor-pointer border-2 transition-all ${
                            isActive 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' 
                              : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'
                          }`}
                        >
                          <span>{slot.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sesi Siang */}
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Sesi Siang (12:30 - 14:00)
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {availableTimeSlots.filter(t => t.session === 'Siang').map(slot => {
                      const isActive = formData.selectedTime === slot.label;
                      return (
                        <div 
                          key={slot.time}
                          onClick={() => handleUpdate('selectedTime', slot.label)}
                          className={`h-11 flex flex-col items-center justify-center rounded-[16px] text-xs font-black cursor-pointer border-2 transition-all ${
                            isActive 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                              : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'
                          }`}
                        >
                          <span>{slot.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-4 mt-auto">
                <Button onClick={nextStep} disabled={!formData.selectedDate || !formData.selectedTime}>
                  Lanjut ke Konfirmasi
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
              <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-[40px] -mr-10 -mt-10"></div>
                <h3 className="font-extrabold text-slate-800 mb-4 text-[16px] relative z-10 flex items-center justify-between">
                  <span>Detail Tagihan</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    {selectedVaccinesList.length} Jenis Vaksin
                  </span>
                </h3>
                
                <div className="space-y-4 text-[13px] relative z-10">
                  <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-[16px] border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-blue-600"><User size={18}/></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pasien</span>
                        <span className="font-extrabold text-slate-800">{formData.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Daftar Vaksin yang dipilih */}
                  <div className="border-b border-slate-100 pb-3 pt-1">
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-wider block mb-2 px-1">
                      Vaksin yang Dipilih:
                    </span>
                    <div className="space-y-2">
                      {selectedVaccinesList.map(v => (
                        <div key={v.id} className="flex justify-between items-center bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-800 block text-xs truncate">{v.name}</span>
                            {v.category && (
                              <span className="text-[10px] text-slate-400 font-medium">Kategori: {v.category}</span>
                            )}
                          </div>
                          <span className="font-bold text-slate-700 text-xs shrink-0">
                            Rp{v.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-3 px-1">
                    <span className="text-slate-500 font-medium">Jadwal Kunjungan</span>
                    <span className="font-bold text-slate-800">{formData.selectedDate} • {formData.selectedTime} WIB</span>
                  </div>

                  <div className="flex justify-between pt-2 px-1 items-center">
                    <div>
                      <span className="font-extrabold text-slate-800 text-[14px] block">Total Bayar</span>
                      <span className="text-[11px] text-slate-400">Termasuk sertifikat e-ICV</span>
                    </div>
                    <span className="font-black text-blue-600 text-[22px]">
                      Rp{totalVaccinePrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="font-extrabold text-slate-800 mb-4 px-2 tracking-tight">Metode Pembayaran</h3>
              <div className="space-y-3 mb-6">
                {['Transfer Bank / Virtual Account', 'QRIS', 'E-Wallet (OVO, GoPay)'].map(method => (
                   <div 
                     key={method}
                     onClick={() => handleUpdate('paymentMethod', method)}
                     className={`bg-white p-4 h-[72px] rounded-[20px] border-2 transition-all cursor-pointer flex items-center justify-between group ${
                       formData.paymentMethod === method ? 'border-blue-500 bg-blue-50/30 shadow-sm' : 'border-slate-100 hover:border-slate-300'
                     }`}
                   >
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.paymentMethod === method ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                         <CreditCard size={20} />
                       </div>
                       <span className="font-bold text-[14px] text-slate-700">{method}</span>
                     </div>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === method ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                        {formData.paymentMethod === method && <Check size={12} className="text-white" strokeWidth={3} />}
                     </div>
                   </div>
                ))}
              </div>
              <div className="sticky bottom-4 mt-auto">
                <Button onClick={handleComplete} disabled={!formData.paymentMethod || isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" /> Memproses Booking...
                    </span>
                  ) : (
                    'Selesaikan Booking'
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-8 mt-10">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-[40px]"></div>
                <div className="w-28 h-28 bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white rounded-[32px] flex items-center justify-center shadow-[0_15px_40px_rgba(16,185,129,0.3)] relative z-10 rotate-[10deg] hover:rotate-0 transition-transform duration-500">
                  <CheckCircle2 size={56} strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="text-[24px] font-black text-slate-800 mb-3 tracking-tight">Booking Berhasil!</h2>
              <p className="text-slate-500 text-[14px] font-medium mb-10 max-w-[280px] leading-relaxed">
                Jadwal vaksinasi Anda telah dikonfirmasi. Tunjukkan QR Code saat tiba di klinik.
              </p>
              <div className="w-full space-y-3 mt-auto mb-6 relative z-10">
                <Button onClick={() => navigate('/history')} className="!shadow-[0_10px_30px_rgba(37,99,235,0.25)]">Lihat E-Ticket & Riwayat</Button>
                <button onClick={() => navigate('/home')} className="w-full h-[56px] font-extrabold text-[#0F3DDE] hover:bg-blue-50 rounded-[20px] transition-colors border border-transparent hover:border-blue-100">
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

function Input({ label, value, onChange, type = "text", icon, placeholder }: { label: string, value: string, onChange: (val: string) => void, type?: string, icon?: React.ReactNode, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[13px] font-extrabold text-slate-800 pl-1">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-[56px] lg:h-[60px] bg-white border border-slate-200 rounded-[18px] lg:rounded-[20px] text-[14px] font-bold text-slate-800 placeholder:text-slate-400/80 placeholder:font-semibold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all hover:border-slate-300 ${icon ? 'pl-[3.25rem] pr-4' : 'px-4'}`}
          placeholder={placeholder || `Masukkan ${label.toLowerCase()}`}
        />
      </div>
    </div>
  )
}

function Button({ children, disabled, onClick, className = '' }: { children: React.ReactNode, disabled?: boolean, onClick?: () => void, className?: string }) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`w-full h-[56px] lg:h-[60px] rounded-[20px] font-extrabold text-[15px] tracking-[0.02em] transition-all overflow-hidden relative group active:scale-[0.98] flex items-center justify-center gap-2 ${
        disabled ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-[0_8px_25px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_35px_rgba(37,99,235,0.45)] hover:-translate-y-0.5'
      } ${className}`}
    >
      {!disabled && (
         <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
      )}
      <span className="relative z-10 drop-shadow-sm">{children}</span>
    </button>
  );
}
