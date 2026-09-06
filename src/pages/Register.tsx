import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, CheckCircle2, UploadCloud, Calendar as CalendarIcon, 
  Clock, CreditCard, User, FileText, Phone, Plane, ChevronDown, 
  Check, Loader2, Syringe, AlertCircle, Sparkles, Building, MapPin, 
  Briefcase, Mail, Hash, FileCheck2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { uploadFileToSupabase } from '../services/supabaseStorageService';
import { isSupabaseConfigured } from '../lib/supabase';
import { format, addDays } from 'date-fns';
import { id } from 'date-fns/locale';
import CountrySelect from '../components/CountrySelect';

export default function Register() {
  const navigate = useNavigate();
  const { vaccines, addBooking, user, updateUser } = useAppStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string>('');

  const [isUploadingKtp, setIsUploadingKtp] = useState(false);
  const [isUploadingPassport, setIsUploadingPassport] = useState(false);
  const [uploadKtpStatus, setUploadKtpStatus] = useState<string>('');
  const [uploadPassportStatus, setUploadPassportStatus] = useState<string>('');

  const [formData, setFormData] = useState({
    name: user?.name || '', 
    nik: user?.nik || '', 
    passport: user?.no_passport || '', 
    npwp: '',
    pob: 'Sukabumi',
    dob: '', 
    gender: 'Laki-laki', 
    occupation: 'Wiraswasta / Karyawan',
    handphone: user?.no_hp || '', 
    email: user?.email || '', 
    address: user?.alamat || '', 
    purpose: 'Umroh',
    departureDate: '',
    targetCountry: 'Arab Saudi', 
    travelName: '',
    travelAddress: '',
    ktpFile: null as File | null,
    ktpUrl: user?.ktp_url || '',
    passportFile: null as File | null,
    passportUrl: user?.passport_url || '',
    selectedVaccines: [] as string[], 
    selectedVaccine: '', 
    selectedDate: '', 
    selectedTime: ''
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

  // Comprehensive Step Validation
  const isStep1Valid = useMemo(() => {
    return (
      formData.name.trim().length > 0 &&
      formData.nik.trim().length >= 16 &&
      formData.passport.trim().length > 0 &&
      Boolean(formData.dob) &&
      formData.handphone.trim().length > 0 &&
      Boolean(formData.departureDate) &&
      formData.targetCountry.trim().length > 0 &&
      formData.address.trim().length > 0
    );
  }, [formData]);

  const isStep2Valid = useMemo(() => {
    return Boolean(formData.ktpFile || formData.ktpUrl);
  }, [formData.ktpFile, formData.ktpUrl]);

  const isStep3Valid = useMemo(() => {
    return (
      formData.selectedVaccines.length > 0 &&
      Boolean(formData.selectedDate) &&
      Boolean(formData.selectedTime)
    );
  }, [formData.selectedVaccines, formData.selectedDate, formData.selectedTime]);

  // Available business days (Senin - Jum'at only)
  const availableDates = useMemo(() => {
    const list: Date[] = [];
    let checkDate = new Date();
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

  // Konfirmasi & Selesaikan Booking (Tahap 3 Selesai -> Langsung Simpan)
  const handleCompleteBooking = async () => {
    setIsSubmitting(true);
    const newId = `BK${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setCreatedBookingId(newId);

    try {
      const bookingPayload = {
        name: formData.name,
        nik: formData.nik,
        passport: formData.passport,
        npwp: formData.npwp,
        pob: formData.pob,
        dob: formData.dob,
        gender: formData.gender,
        occupation: formData.occupation,
        handphone: formData.handphone,
        email: formData.email,
        address: formData.address,
        purpose: formData.purpose,
        departureDate: formData.departureDate,
        targetCountry: formData.targetCountry,
        travelName: formData.travelName,
        travelAddress: formData.travelAddress,
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
        status_screening: 'layak',
        e_icv_status: 'menunggu'
      };

      await addBooking({
        id: newId,
        vaccineId: formData.selectedVaccines[0] || 'v1',
        vaccineIds: formData.selectedVaccines,
        date: formData.selectedDate,
        time: formData.selectedTime,
        status: 'menunggu',
        patient: bookingPayload
      });

      // Update user details if logged in
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

      setStep(4);
    } catch (err) {
      console.error('Booking submission error:', err);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3-step navigation indicator: 1. Biodata -> 2. Dokumen -> 3. Vaksin & Jadwal
  const stepLabels = ['Biodata', 'Dokumen', 'Vaksin & Jadwal'];

  const StepIndicator = () => (
    <div className="px-2 mb-6 mt-1">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-4 h-[3px] bg-slate-200 rounded-full -z-10"></div>
        <div 
          className="absolute left-0 top-4 h-[3px] bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full -z-10 transition-all duration-500 ease-out" 
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
        
        {stepLabels.map((label, index) => {
          const i = index + 1;
          const isActive = step === i;
          const isCompleted = step > i;
          
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <motion.div 
                initial={false}
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 shadow-sm ${
                  isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-[0_4px_10px_rgba(37,99,235,0.3)]' : 
                  isCompleted ? 'bg-emerald-500 text-white shadow-xs' : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={3.5} /> : i}
              </motion.div>
              <span className={`text-[11px] font-extrabold uppercase tracking-wider transition-colors ${isActive ? 'text-blue-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
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
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none mix-blend-multiply"></div>

      {/* Header Bar */}
      <div className="bg-white/95 backdrop-blur-xl px-4 py-3.5 flex flex-col justify-center sticky top-0 z-40 shadow-xs border-b border-slate-100">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
          {step < 4 ? (
            <button 
              onClick={step === 1 ? () => navigate(-1) : prevStep} 
              className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 shadow-xs active:scale-95 transition-transform hover:bg-slate-100 shrink-0 cursor-pointer"
            >
              <ChevronLeft size={22} className="text-slate-700" strokeWidth={2.5} />
            </button>
          ) : <div className="w-10 shrink-0"></div>}
          
          <div className="flex-1 text-center pr-10">
            <h1 className="font-extrabold text-[17px] sm:text-[18px] text-slate-800 tracking-tight leading-tight">
              {step === 1 ? 'Tahap 1: Biodata Pasien' : 
               step === 2 ? 'Tahap 2: Upload Dokumen' : 
               step === 3 ? 'Tahap 3: Vaksin & Jadwal' : 
               'Booking Berhasil!'}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              SIVAKSIN • UOBK RSUD AL-MULK KOTA SUKABUMI
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col relative z-20 max-w-3xl mx-auto w-full">
        {step < 4 && <StepIndicator />}

        <AnimatePresence mode="wait">
          {/* TAHAP 1: BIODATA PASIEN */}
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -8 }} 
              className="flex-1 flex flex-col gap-5"
            >
              <div className="bg-white p-6 rounded-[28px] shadow-xs border border-slate-100 space-y-5">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <User size={18} className="text-blue-600" />
                    <span>Identitas Pasien (Single Source of Truth)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Data ini akan otomatis digunakan untuk Form Permohonan, Informed Consent, Skrining, dan E-ICV.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    icon={<User size={18}/>} 
                    label="Nama Sesuai KTP/Passport" 
                    value={formData.name} 
                    onChange={(v) => handleUpdate('name', v)} 
                    placeholder="Contoh: Muhammad Fikri" 
                    required 
                  />
                  <Input 
                    icon={<CreditCard size={18}/>} 
                    label="Nomor Induk Kependudukan (NIK)" 
                    type="number" 
                    value={formData.nik} 
                    onChange={(v) => handleUpdate('nik', v)} 
                    placeholder="16 Digit NIK KTP" 
                    required 
                  />
                  <Input 
                    icon={<FileText size={18}/>} 
                    label="Nomor Passport" 
                    value={formData.passport} 
                    onChange={(v) => handleUpdate('passport', v)} 
                    placeholder="Contoh: X1234567" 
                    required 
                  />
                  <Input 
                    icon={<Hash size={18}/>} 
                    label="NPWP" 
                    value={formData.npwp} 
                    onChange={(v) => handleUpdate('npwp', v)} 
                    placeholder="Nomor NPWP (Opsional)" 
                  />
                  <Input 
                    icon={<MapPin size={18}/>} 
                    label="Tempat Lahir" 
                    value={formData.pob} 
                    onChange={(v) => handleUpdate('pob', v)} 
                    placeholder="Contoh: Sukabumi" 
                    required 
                  />
                  
                  {/* Tanggal Lahir (Calendar Picker) */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-extrabold text-slate-800 pl-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Tanggal Lahir</span>
                        <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Format: DD/MM/YYYY</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <CalendarIcon size={18} />
                      </div>
                      <input 
                        type="date" 
                        value={formData.dob} 
                        onChange={(e) => handleUpdate('dob', e.target.value)}
                        className="w-full h-[56px] lg:h-[60px] bg-white border border-slate-200 rounded-[18px] lg:rounded-[20px] pl-12 pr-4 text-[14px] font-bold text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-extrabold text-slate-800 pl-1 flex items-center gap-1">
                      <span>Jenis Kelamin</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleUpdate('gender', e.target.value)}
                      className="w-full h-[56px] lg:h-[60px] bg-white border border-slate-200 rounded-[18px] lg:rounded-[20px] px-4 text-[14px] font-bold text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <Input 
                    icon={<Briefcase size={18}/>} 
                    label="Pekerjaan" 
                    value={formData.occupation} 
                    onChange={(v) => handleUpdate('occupation', v)} 
                    placeholder="Contoh: Karyawan Swasta / Wiraswasta" 
                    required 
                  />
                  <Input 
                    icon={<Phone size={18}/>} 
                    label="Nomor WhatsApp / HP" 
                    type="tel" 
                    value={formData.handphone} 
                    onChange={(v) => handleUpdate('handphone', v)} 
                    placeholder="081234567890" 
                    required 
                  />
                  <Input 
                    icon={<Mail size={18}/>} 
                    label="Alamat Email" 
                    type="email" 
                    value={formData.email} 
                    onChange={(v) => handleUpdate('email', v)} 
                    placeholder="nama@email.com" 
                  />
                </div>

                <Input 
                  icon={<MapPin size={18}/>} 
                  label="Alamat Lengkap Sesuai KTP" 
                  value={formData.address} 
                  onChange={(v) => handleUpdate('address', v)} 
                  placeholder="Jl. Pelabuhan II No. XX, Kota Sukabumi" 
                  required 
                />

                <div className="border-t border-slate-100 pt-4 space-y-4">
                  {/* Tujuan Perjalanan */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-extrabold text-slate-800 pl-1 flex items-center gap-1">
                      <span>Tujuan Perjalanan</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                        <Plane size={18} />
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
                        <option value="Wisata">Wisata / Liburan Internasional</option>
                        <option value="Dinas">Perjalanan Dinas / Bisnis</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                  {/* 1. Tanggal Keberangkatan (Date picker kalender - Klik -> pilih -> selesai) */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-extrabold text-slate-800 pl-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Tanggal Keberangkatan</span>
                        <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[11px] font-semibold text-blue-600">Pilih dari Kalender</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none">
                        <CalendarIcon size={20} />
                      </div>
                      <input 
                        type="date"
                        min={format(new Date(), 'yyyy-MM-dd')}
                        value={formData.departureDate}
                        onChange={(e) => handleUpdate('departureDate', e.target.value)}
                        className="w-full h-[56px] lg:h-[60px] bg-white border border-slate-200 rounded-[18px] lg:rounded-[20px] pl-12 pr-4 text-[14px] font-bold text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer hover:border-slate-300"
                        required
                      />
                    </div>
                  </div>

                  {/* 2. Negara Tujuan (Searchable Dropdown seluruh negara di dunia A-Z) */}
                  <CountrySelect
                    value={formData.targetCountry}
                    onChange={(val) => handleUpdate('targetCountry', val)}
                  />

                  {/* Travel & Agen (untuk kelengkapan dokumen resmi permohonan) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <Input 
                      icon={<Building size={18}/>} 
                      label="Nama Travel / Agen" 
                      value={formData.travelName} 
                      onChange={(v) => handleUpdate('travelName', v)} 
                      placeholder="Contoh: PT. Al-Mulk Tour & Travel (Opsional)" 
                    />
                    <Input 
                      icon={<MapPin size={18}/>} 
                      label="Alamat Travel / Agen" 
                      value={formData.travelAddress} 
                      onChange={(v) => handleUpdate('travelAddress', v)} 
                      placeholder="Kota Sukabumi (Opsional)" 
                    />
                  </div>
                </div>
              </div>

              {/* Step 1 Next Button */}
              <div className="sticky bottom-4 mt-2 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-md space-y-2">
                {!isStep1Valid && (
                  <div className="text-[11px] text-amber-800 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-amber-600" />
                    <span>Harap lengkapi semua field wajib (*) termasuk Nama, NIK 16 digit, Paspor, Tanggal Lahir, No. HP, Tanggal Keberangkatan, & Alamat.</span>
                  </div>
                )}
                <Button 
                  onClick={nextStep} 
                  disabled={!isStep1Valid}
                >
                  Lanjut ke Upload Dokumen
                </Button>
              </div>
            </motion.div>
          )}

          {/* TAHAP 2: DOKUMEN (KTP & PASSPORT) */}
          {step === 2 && (
            <motion.div 
              key="step2" 
              initial={{ opacity: 0, x: 15 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -15 }} 
              className="flex-1 flex flex-col gap-5"
            >
              <div className="bg-white p-6 rounded-[28px] shadow-xs border border-slate-100 space-y-5">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    <span>Upload Dokumen Persyaratan</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Unggah KTP asli (Wajib) dan Passport (Dianjurkan) untuk proses verifikasi sertifikat internasional.
                  </p>
                </div>

                {/* Upload KTP */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5">
                      <span>Upload Dokumen KTP</span>
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
                        <span className="text-[13px] font-bold text-slate-700">Mengunggah KTP ke Cloud...</span>
                      </div>
                    ) : formData.ktpFile ? (
                       <div className="text-center relative z-0">
                         <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs border border-emerald-200">
                           <CheckCircle2 size={24} />
                         </div>
                         <span className="text-[13px] font-bold text-slate-800 block truncate max-w-[240px] bg-white px-3 py-1 rounded-lg border border-slate-100">
                           {formData.ktpFile.name}
                         </span>
                         <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">✓ KTP Siap Diverifikasi</span>
                       </div>
                    ) : (
                      <div className="relative z-0 flex flex-col items-center">
                        <div className="w-14 h-14 bg-white shadow-xs border border-slate-100 rounded-full flex items-center justify-center mb-2 text-blue-500 group-hover:scale-105 transition-all">
                          <UploadCloud size={28} />
                        </div>
                        <span className="text-[13px] font-extrabold text-slate-700 mb-0.5">Tap untuk upload KTP</span>
                        <span className="text-[11px] font-medium text-slate-400">Format JPG, PNG, atau PDF (Max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Upload Passport */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5">
                      <span>Upload Dokumen Passport</span>
                      <span className="text-slate-400 font-medium text-[11px]">(Opsional / Dianjurkan)</span>
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
                        <span className="text-[13px] font-bold text-slate-700">Mengunggah Passport...</span>
                      </div>
                    ) : formData.passportFile ? (
                       <div className="text-center relative z-0">
                         <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs border border-emerald-200">
                           <CheckCircle2 size={24} />
                         </div>
                         <span className="text-[13px] font-bold text-slate-800 block truncate max-w-[240px] bg-white px-3 py-1 rounded-lg border border-slate-100">
                           {formData.passportFile.name}
                         </span>
                         <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">✓ Passport Diunggah</span>
                       </div>
                    ) : (
                      <div className="relative z-0 flex flex-col items-center">
                        <div className="w-14 h-14 bg-white shadow-xs border border-slate-100 rounded-full flex items-center justify-center mb-2 text-slate-400 group-hover:text-blue-500 transition-all">
                          <UploadCloud size={28} />
                        </div>
                        <span className="text-[13px] font-extrabold text-slate-700 mb-0.5">Tap untuk upload Passport</span>
                        <span className="text-[11px] font-medium text-slate-400">Halaman identitas passport yang masih berlaku</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Step 2 Buttons */}
              <div className="sticky bottom-4 mt-auto bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-md space-y-2">
                {!isStep2Valid && (
                  <div className="text-[11px] text-amber-800 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-amber-600" />
                    <span>Wajib mengunggah dokumen KTP asli sebelum melanjutkan ke pemilihan vaksin.</span>
                  </div>
                )}
                <Button 
                  onClick={nextStep}
                  disabled={!isStep2Valid}
                >
                  Lanjut ke Pemilihan Vaksin & Jadwal
                </Button>
              </div>
            </motion.div>
          )}

          {/* TAHAP 3: VAKSIN & JADWAL */}
          {step === 3 && (
            <motion.div 
              key="step3" 
              initial={{ opacity: 0, x: 15 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -15 }} 
              className="flex-1 flex flex-col gap-5"
            >
              {/* Vaksin Selection Section */}
              <div className="bg-white p-5 sm:p-6 rounded-[28px] shadow-xs border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      <Syringe size={18} className="text-blue-600" />
                      <span>Pilih Jenis Vaksinasi Internasional</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Bisa memilih lebih dari 1 jenis vaksin sesuai tujuan perjalanan ({formData.targetCountry}).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={selectAllAvailableVaccines}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    {formData.selectedVaccines.length > 0 && (
                      <button 
                        type="button" 
                        onClick={clearVaccineSelection}
                        className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* List of Vaccines */}
                <div className="space-y-3">
                  {vaccines.map(v => {
                    const isOutOfStock = (v.stock || 0) <= 0;
                    const isSelected = formData.selectedVaccines.includes(v.id);

                    return (
                      <div 
                        key={v.id} 
                        onClick={() => {
                          if (!isOutOfStock) toggleVaccineSelection(v.id);
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isOutOfStock
                            ? 'opacity-50 border-slate-100 bg-slate-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/10'
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-extrabold text-slate-900 text-sm">{v.name}</h4>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              Stok: {v.stock}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{v.description}</p>
                          <p className="text-xs font-black text-blue-700 mt-2">
                            Rp{v.price.toLocaleString('id-ID')}
                          </p>
                        </div>

                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Jadwal Pelayanan (Senin - Jum'at, 08.00 - 14.00 WIB) */}
              <div className="bg-white p-5 sm:p-6 rounded-[28px] shadow-xs border border-slate-100 space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      <Clock size={18} className="text-blue-600" />
                      <span>Jadwal Kedatangan Vaksinasi</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Layanan: <strong className="text-slate-700">Senin s/d Jum'at, 08.00 - 14.00 WIB</strong>
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                    RSUD Al-Mulk
                  </span>
                </div>

                {/* Pilih Tanggal (Hari Kerja) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Pilih Tanggal Kedatangan:</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                    {availableDates.map((date, idx) => {
                      const formatted = format(date, 'yyyy-MM-dd');
                      const isActive = formData.selectedDate === formatted;
                      const dayName = format(date, 'EEEE', { locale: id });

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleUpdate('selectedDate', formatted)}
                          className={`shrink-0 w-[74px] h-[90px] rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                          }`}
                        >
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                            {dayName.substring(0, 3)}
                          </span>
                          <span className="text-xl font-black leading-none my-1">
                            {format(date, 'd')}
                          </span>
                          <span className={`text-[10px] font-semibold ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                            {format(date, 'MMM', { locale: id })}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500 font-medium">Atau kalender mandiri:</span>
                    <input
                      type="date"
                      min={format(new Date(), 'yyyy-MM-dd')}
                      value={formData.selectedDate}
                      onChange={handleCustomDateChange}
                      className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-blue-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Pilih Jam Layanan (08:00 - 14:00 WIB) */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700">Pilih Jam Layanan (08.00 - 14.00 WIB):</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {availableTimeSlots.map((slot) => {
                      const isActive = formData.selectedTime === slot.label;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => handleUpdate('selectedTime', slot.label)}
                          className={`h-11 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                            isActive
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                              : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Ringkasan & Konfirmasi Langsung */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-[28px] shadow-lg space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Total Biaya ({formData.selectedVaccines.length} Vaksin):</span>
                  <span className="font-black text-lg text-emerald-400">
                    Rp{totalVaccinePrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
                  <span className="text-slate-300">Jadwal Vaksin:</span>
                  <span className="font-bold text-white">
                    {formData.selectedDate || 'Belum dipilih'} {formData.selectedTime ? `• ${formData.selectedTime}` : ''}
                  </span>
                </div>
              </div>

              {/* Tombol Konfirmasi & Selesaikan Booking */}
              <div className="sticky bottom-4 mt-auto bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-md space-y-2">
                {!isStep3Valid && (
                  <div className="text-[11px] text-amber-800 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-amber-600" />
                    <span>
                      {formData.selectedVaccines.length === 0 
                        ? 'Pilih minimal 1 jenis vaksinasi.' 
                        : !formData.selectedDate 
                          ? 'Pilih tanggal vaksinasi (Senin - Jumat).' 
                          : 'Pilih jam layanan vaksinasi (08.00 - 14.00 WIB).'}
                    </span>
                  </div>
                )}
                <Button 
                  onClick={handleCompleteBooking} 
                  disabled={!isStep3Valid || isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" /> Menyimpan Booking ke Supabase...
                    </span>
                  ) : (
                    'Konfirmasi & Selesaikan Booking'
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* TAHAP 4: BOOKING BERHASIL! */}
          {step === 4 && (
            <motion.div 
              key="step4" 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="flex-1 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-6">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>

              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                Booking Berhasil Terdaftar!
              </h2>
              <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed mb-8">
                Data Anda telah tersimpan secara resmi di database Supabase. Anda dapat langsung mencetak
                Formulir Permohonan, Informed Consent, dan Form Skrining Vaksinasi.
              </p>

              {/* Primary Action Buttons */}
              <div className="w-full max-w-md space-y-3">
                <button
                  onClick={() => navigate(`/informed-consent?id=${createdBookingId}`)}
                  className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
                >
                  <FileCheck2 size={18} />
                  <span>Cetak Informed Consent & Formulir Resmi</span>
                </button>

                <button
                  onClick={() => navigate('/schedule')}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <CalendarIcon size={18} />
                  <span>Lihat Jadwal Saya</span>
                </button>

                <button
                  onClick={() => navigate('/home')}
                  className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
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

function Input({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  icon, 
  placeholder,
  required = false
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  type?: string, 
  icon?: React.ReactNode, 
  placeholder?: string,
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-extrabold text-slate-800 pl-1 flex items-center gap-1">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
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
          className={`w-full h-[56px] lg:h-[60px] bg-white border border-slate-200 rounded-[18px] lg:rounded-[20px] text-[14px] font-bold text-slate-800 placeholder:text-slate-400/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all hover:border-slate-300 ${icon ? 'pl-[3.25rem] pr-4' : 'px-4'}`}
          placeholder={placeholder || `Masukkan ${label.toLowerCase()}`}
          required={required}
        />
      </div>
    </div>
  );
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
