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
    nationality: 'INDONESIA',
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
    selectedTime: '',
    doctor_code: 'D00057',
    doctor_name: 'dr. M. Arifin Ramadhani'
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

  // Cek apakah paket bundling Meningitis + Polio aktif
  const isBundlingMeningitisPolio = useMemo(() => {
    const list = selectedVaccinesList.map(v => v.name.toLowerCase());
    const hasMen = list.some(n => n.includes('mening')) || formData.selectedVaccines.includes('v1');
    const hasPol = list.some(n => n.includes('polio')) || formData.selectedVaccines.includes('v2');
    return hasMen && hasPol;
  }, [selectedVaccinesList, formData.selectedVaccines]);

  const totalVaccinePrice = useMemo(() => {
    if (isBundlingMeningitisPolio) {
      const menItem = selectedVaccinesList.find(v => v.name.toLowerCase().includes('mening') || v.id === 'v1');
      const polItem = selectedVaccinesList.find(v => v.name.toLowerCase().includes('polio') || v.id === 'v2');
      const menPrice = menItem?.price || 320000;
      const polPrice = polItem?.price || 310000;
      const normalMenPol = menPrice + polPrice; // 630.000
      const discount = Math.max(0, normalMenPol - 525000); // 105.000
      const subtotal = selectedVaccinesList.reduce((sum, v) => sum + (v.price || 0), 0);
      return Math.max(0, subtotal - discount);
    }
    return selectedVaccinesList.reduce((sum, v) => sum + (v.price || 0), 0);
  }, [selectedVaccinesList, isBundlingMeningitisPolio]);

  // Comprehensive Step Validation
  const isStep1Valid = useMemo(() => {
    return (
      formData.name.trim().length > 0 &&
      formData.nik.trim().length >= 10 &&
      Boolean(formData.dob) &&
      formData.handphone.trim().length > 0 &&
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
        nationality: formData.nationality || 'INDONESIA',
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
        e_icv_status: 'menunggu',
        doctor_code: formData.doctor_code || 'D00057',
        doctor_name: formData.doctor_code === 'D00179' ? 'dr. Chrysman Andreria Hatulely' : 'dr. M. Arifin Ramadhani'
      };

      await addBooking({
        id: newId,
        vaccineId: formData.selectedVaccines[0] || 'v1',
        vaccineIds: formData.selectedVaccines,
        date: formData.selectedDate,
        time: formData.selectedTime,
        status: 'menunggu',
        doctor_code: formData.doctor_code || 'D00057',
        doctor_name: formData.doctor_code === 'D00179' ? 'dr. Chrysman Andreria Hatulely' : 'dr. M. Arifin Ramadhani',
        patient: bookingPayload
      } as any);

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
        <div className="absolute left-0 right-0 top-4 h-[3px] bg-slate-300/70 rounded-full -z-10"></div>
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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-[0_4px_12px_rgba(37,99,235,0.35)]' : 
                  isCompleted ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white border-2 border-slate-200/90 text-slate-400 shadow-xs'
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

  // Pesan validasi yang sesuai dengan field wajib sebenarnya
  const step1WarningText = 'Lengkapi field wajib (*): Nama, NIK (min. 10 digit), Tanggal Lahir, No. WhatsApp/HP, dan Alamat.';
  const step2WarningText = 'Wajib mengunggah dokumen KTP asli sebelum melanjutkan ke pemilihan vaksin.';
  const step3WarningText = formData.selectedVaccines.length === 0
    ? 'Pilih minimal 1 jenis vaksinasi.'
    : !formData.selectedDate
      ? 'Pilih tanggal vaksinasi (Senin - Jumat).'
      : 'Pilih jam layanan vaksinasi (08.00 - 14.00 WIB).';

  const formatDisplayDate = (value: string, pattern = 'd MMM yyyy') => {
    if (!value) return '';
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return value;
    return format(new Date(y, m - 1, d), pattern, { locale: id });
  };

  // Panel ringkasan + tombol aksi untuk mode desktop (lg ke atas)
  const renderDesktopSidebar = () => {
    const action =
      step === 1
        ? { label: 'Lanjut ke Upload Dokumen', onClick: nextStep, disabled: !isStep1Valid, warning: !isStep1Valid ? step1WarningText : '' }
        : step === 2
          ? { label: 'Lanjut ke Vaksin & Jadwal', onClick: nextStep, disabled: !isStep2Valid, warning: !isStep2Valid ? step2WarningText : '' }
          : { label: 'Konfirmasi & Selesaikan Booking', onClick: handleCompleteBooking, disabled: !isStep3Valid || isSubmitting, warning: !isStep3Valid ? step3WarningText : '' };

    const subtotal = selectedVaccinesList.reduce((sum, v) => sum + (v.price || 0), 0);
    const progressPct = Math.round(((step - 1) / 3) * 100 + (step === 1 ? (isStep1Valid ? 33 : 0) : step === 2 ? (isStep2Valid ? 33 : 0) : (isStep3Valid ? 34 : 0)));

    return (
      <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-5">
        {/* Ringkasan */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_-5px_rgba(15,23,42,0.08),0_4px_14px_-2px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ringkasan Pendaftaran</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="font-extrabold text-slate-800 text-[15px]">
                Langkah {step} dari 3 · {stepLabels[step - 1]}
              </h3>
              <span className="text-[11px] font-bold text-blue-600">{Math.min(progressPct, 100)}%</span>
            </div>
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPct, 100)}%` }}
              />
            </div>
          </div>

          <div className="px-6 py-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-1 pb-1">Data Pasien</p>
            <SummaryRow label="Nama" value={formData.name} />
            <SummaryRow label="NIK" value={formData.nik} mono />
            <SummaryRow label="Tanggal Lahir" value={formatDisplayDate(formData.dob)} />
            <SummaryRow label="No. WhatsApp" value={formData.handphone} mono />
            <SummaryRow label="Negara Tujuan" value={formData.targetCountry} />

            {step >= 2 && (
              <>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-4 pb-1">Dokumen</p>
                <SummaryRow label="KTP" value={formData.ktpFile || formData.ktpUrl ? '✓ Terunggah' : ''} />
                <SummaryRow label="Passport" value={formData.passportFile || formData.passportUrl ? '✓ Terunggah' : ''} />
              </>
            )}

            {step >= 3 && (
              <>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-4 pb-1">Vaksin & Jadwal</p>
                <SummaryRow label="Vaksin" value={selectedVaccinesList.map(v => v.name).join(', ')} />
                <SummaryRow label="Tanggal" value={formatDisplayDate(formData.selectedDate, 'EEEE, d MMM yyyy')} />
                <SummaryRow label="Jam" value={formData.selectedTime} />
                <SummaryRow label="Dokter" value={formData.doctor_code === 'D00179' ? 'dr. Chrysman Andreria Hatulely' : 'dr. M. Arifin Ramadhani'} />
              </>
            )}
          </div>

          {step >= 3 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              {isBundlingMeningitisPolio && (
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 mb-1.5">
                  <span className="flex items-center gap-1"><Sparkles size={12} /> Paket Bundling Aktif</span>
                  <span className="line-through text-slate-400 font-medium">Rp{subtotal.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-slate-600">Total Biaya</span>
                <span className="text-xl font-black text-blue-700">Rp{totalVaccinePrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Aksi */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_-5px_rgba(15,23,42,0.08),0_4px_14px_-2px_rgba(15,23,42,0.04)] p-5 space-y-3">
          {action.warning && (
            <div className="text-[12px] text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2 leading-snug">
              <AlertCircle size={15} className="shrink-0 text-amber-600 mt-0.5" />
              <span>{action.warning}</span>
            </div>
          )}
          <Button onClick={action.onClick} disabled={action.disabled}>
            {step === 3 && isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Menyimpan...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {action.label}
                <ArrowRight size={17} />
              </span>
            )}
          </Button>
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="w-full h-11 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ChevronLeft size={16} />
              Kembali ke {stepLabels[step - 2]}
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-400 font-medium text-center px-4 leading-relaxed">
          Layanan Poli Vaksinasi Internasional RSUD Al-Mulk · Senin–Jumat, 08.00–14.00 WIB
        </p>
      </aside>
    );
  };

  return (
    <div className="pb-safe flex flex-col relative w-full h-full font-sans">
      {/* Header Card (Rounded & Elevated) */}
      <div className={`mx-auto w-full px-4 sm:px-6 pt-1 ${step < 4 ? 'max-w-3xl lg:max-w-6xl' : 'max-w-3xl'}`}>
        <div className="bg-white rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.07),0_4px_12px_-2px_rgba(15,23,42,0.04)]">
          {step < 4 ? (
            <button 
              onClick={step === 1 ? () => navigate(-1) : prevStep} 
              title="Kembali"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 flex items-center justify-center border border-slate-200/90 hover:border-blue-200 shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <ChevronLeft size={21} strokeWidth={2.5} />
            </button>
          ) : <div className="w-10 sm:w-11 shrink-0"></div>}
          
          <div className="flex-1 text-center min-w-0">
            <h1 className="font-extrabold text-[17px] sm:text-[19px] text-slate-800 tracking-tight leading-tight">
              {step === 1 ? 'Tahap 1: Biodata Pasien' : 
               step === 2 ? 'Tahap 2: Upload Dokumen' : 
               step === 3 ? 'Tahap 3: Vaksin & Jadwal' : 
               'Booking Berhasil!'}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">
              SIVAKSIN • UOBK RSUD AL-MULK KOTA SUKABUMI
            </p>
          </div>

          {step < 4 ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-700 text-[11px] font-extrabold shrink-0">
              <span>Langkah {step}/3</span>
            </div>
          ) : null}
          {step < 4 && <div className="w-10 sm:hidden shrink-0"></div>}
        </div>
      </div>

      {/* Main Container */}
      <div className={`p-4 sm:p-6 lg:py-7 flex-1 flex flex-col relative z-20 mx-auto w-full ${step < 4 ? 'max-w-3xl lg:max-w-6xl' : 'max-w-3xl'}`}>
        {step < 4 && (
          <div className="w-full lg:max-w-2xl lg:mx-auto lg:mb-2">
            <StepIndicator />
          </div>
        )}

        <div className={step < 4 ? 'flex-1 flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start' : 'flex-1 flex flex-col'}>
        <div className={step < 4 ? 'flex-1 flex flex-col lg:col-span-8 min-w-0' : 'flex-1 flex flex-col'}>
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
              <div className="bg-white p-6 lg:p-8 rounded-[28px] lg:rounded-3xl shadow-[0_10px_35px_-5px_rgba(15,23,42,0.08),0_4px_14px_-2px_rgba(15,23,42,0.04)] border border-slate-200/80 space-y-5 lg:space-y-6">
                <SectionHeader
                  icon={<User size={18} />}
                  title="Identitas Pasien"
                  subtitle="Data ini otomatis digunakan untuk Form Permohonan, Informed Consent, Skrining, dan E-ICV."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-x-5 lg:gap-y-4">
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
                    placeholder="Contoh: X1234567 (Opsional jika non-perjalanan)" 
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
                    <label className="text-[13px] font-bold text-slate-700 pl-1 flex items-center justify-between">
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
                        className="w-full h-[54px] lg:h-12 bg-white border border-slate-200 rounded-[16px] lg:rounded-xl pl-12 pr-4 text-[14px] font-bold text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 pl-1 flex items-center gap-1">
                      <span>Jenis Kelamin</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleUpdate('gender', e.target.value)}
                      className="w-full h-[54px] lg:h-12 bg-white border border-slate-200 rounded-[16px] lg:rounded-xl px-4 text-[14px] font-bold text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
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
                </div>

                <SectionHeader
                  icon={<Phone size={18} />}
                  title="Kontak & Alamat"
                  subtitle="Digunakan untuk konfirmasi jadwal dan pengiriman informasi sertifikat."
                  divider
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-x-5 lg:gap-y-4">
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

                <SectionHeader
                  icon={<Plane size={18} />}
                  title="Rencana Perjalanan"
                  subtitle="Opsional — isi jika vaksinasi untuk keperluan perjalanan internasional."
                  divider
                />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-x-5">
                  {/* Tujuan Perjalanan / Vaksinasi */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 pl-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Tujuan Perjalanan / Keperluan Vaksin</span>
                        <span className="text-[11px] font-medium text-slate-400">(Opsional)</span>
                      </span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                        <Plane size={18} />
                      </div>
                      <select 
                        className="w-full h-[54px] lg:h-12 bg-white border border-slate-200 rounded-[16px] lg:rounded-xl pl-12 pr-10 text-[14px] font-bold text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer hover:border-slate-300"
                        value={formData.purpose}
                        onChange={(e) => handleUpdate('purpose', e.target.value)}
                      >
                        <option value="Kesehatan Pribadi / Vaksinasi Rutin">Kesehatan Pribadi / Vaksinasi Rutin (Non-Perjalanan)</option>
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

                  {/* 1. Tanggal Keberangkatan (Date picker kalender - Opsional jika bepergian) */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 pl-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Tanggal Keberangkatan</span>
                        <span className="text-[11px] font-medium text-slate-400">(Opsional jika bepergian)</span>
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
                        className="w-full h-[54px] lg:h-12 bg-white border border-slate-200 rounded-[16px] lg:rounded-xl pl-12 pr-4 text-[14px] font-bold text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer hover:border-slate-300"
                      />
                    </div>
                  </div>
                  </div>

                  {/* 2. Negara Tujuan (Searchable Dropdown seluruh negara di dunia A-Z) */}
                  <CountrySelect
                    value={formData.targetCountry}
                    onChange={(val) => handleUpdate('targetCountry', val)}
                    required={false}
                  />

                  {/* Travel & Agen (untuk kelengkapan dokumen resmi permohonan) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-x-5">
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

              {/* Step 1 Next Button (Mobile only — desktop uses sidebar) */}
              <div className="lg:hidden sticky bottom-4 mt-2 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-md space-y-2">
                {!isStep1Valid && (
                  <div className="text-[11px] text-amber-800 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-amber-600" />
                    <span>{step1WarningText}</span>
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
              <div className="bg-white p-6 lg:p-8 rounded-[28px] lg:rounded-3xl shadow-[0_10px_35px_-5px_rgba(15,23,42,0.08),0_4px_14px_-2px_rgba(15,23,42,0.04)] border border-slate-200/80 space-y-5 lg:space-y-6">
                <SectionHeader
                  icon={<FileText size={18} />}
                  title="Upload Dokumen Persyaratan"
                  subtitle="Unggah KTP asli (wajib) dan Passport (dianjurkan) untuk proses verifikasi sertifikat internasional."
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
                  <label className="border-2 border-dashed border-slate-200 rounded-[20px] p-6 lg:min-h-[210px] flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden group">
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
                        <span className="text-[13px] font-extrabold text-slate-700 mb-0.5">Klik atau tap untuk upload KTP</span>
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
                  <label className="border-2 border-dashed border-slate-200 rounded-[20px] p-6 lg:min-h-[210px] flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden group">
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
                        <span className="text-[13px] font-extrabold text-slate-700 mb-0.5">Klik atau tap untuk upload Passport</span>
                        <span className="text-[11px] font-medium text-slate-400">Halaman identitas passport yang masih berlaku</span>
                      </div>
                    )}
                  </label>
                </div>
                </div>
              </div>

              {/* Step 2 Buttons (Mobile only) */}
              <div className="lg:hidden sticky bottom-4 mt-auto bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-md space-y-2">
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
              <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-[28px] lg:rounded-3xl shadow-[0_10px_35px_-5px_rgba(15,23,42,0.08),0_4px_14px_-2px_rgba(15,23,42,0.04)] border border-slate-200/80 space-y-4">
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

                {/* Banner Promo Paket Bundling Meningitis + Polio */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl p-3.5 flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-emerald-950">Promo Paket Bundling Umroh & Haji</h5>
                      <p className="text-[11px] text-emerald-700">Meningitis + Polio hanya <strong>Rp525.000</strong> (Normal Rp630.000, Hemat Rp105.000)</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg">
                    HEMAT Rp105.000
                  </span>
                </div>

                {/* List of Vaccines */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
              <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-[28px] lg:rounded-3xl shadow-[0_10px_35px_-5px_rgba(15,23,42,0.08),0_4px_14px_-2px_rgba(15,23,42,0.04)] border border-slate-200/80 space-y-4">
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
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 lg:grid lg:grid-cols-8 lg:overflow-visible lg:mx-0 lg:px-0">
                    {availableDates.map((date, idx) => {
                      const formatted = format(date, 'yyyy-MM-dd');
                      const isActive = formData.selectedDate === formatted;
                      const dayName = format(date, 'EEEE', { locale: id });

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleUpdate('selectedDate', formatted)}
                          className={`shrink-0 w-[74px] h-[90px] lg:w-auto lg:h-[84px] rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
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

                {/* Pilih Dokter Pemeriksa */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Dokter Pemeriksa Poli Vaksinasi Internasional:</span>
                    <span className="text-[11px] font-semibold text-blue-600">Poli U0029</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdate('doctor_code', 'D00057');
                        handleUpdate('doctor_name', 'dr. M. Arifin Ramadhani');
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        formData.doctor_code === 'D00057'
                          ? 'bg-blue-50/90 border-blue-500 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-md">
                          D00057
                        </span>
                        {formData.doctor_code === 'D00057' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <span className="font-extrabold text-xs block text-slate-800">
                        dr. M. Arifin Ramadhani
                      </span>
                      <span className="text-[10px] text-slate-400 block">Dokter Pemeriksa Vaksinasi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleUpdate('doctor_code', 'D00179');
                        handleUpdate('doctor_name', 'dr. Chrysman Andreria Hatulely');
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        formData.doctor_code === 'D00179'
                          ? 'bg-blue-50/90 border-blue-500 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          D00179
                        </span>
                        {formData.doctor_code === 'D00179' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        )}
                      </div>
                      <span className="font-extrabold text-xs block text-slate-800">
                        dr. Chrysman Andreria Hatulely
                      </span>
                      <span className="text-[10px] text-slate-400 block">Dokter Pemeriksa Vaksinasi</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Ringkasan & Konfirmasi Langsung (Mobile only — desktop uses sidebar) */}
              <div className="lg:hidden bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-[28px] shadow-lg space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Total Biaya ({formData.selectedVaccines.length} Vaksin):</span>
                  <div className="text-right">
                    {isBundlingMeningitisPolio && (
                      <span className="line-through text-slate-400 text-xs mr-2 font-normal">
                        Rp{(selectedVaccinesList.reduce((sum, v) => sum + (v.price || 0), 0)).toLocaleString('id-ID')}
                      </span>
                    )}
                    <span className="font-black text-lg text-emerald-400">
                      Rp{totalVaccinePrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {isBundlingMeningitisPolio && (
                  <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-emerald-400" />
                      <span>Paket Bundling (Meningitis + Polio) Aktif</span>
                    </span>
                    <span className="text-emerald-300 font-extrabold text-[11px]">Hemat Rp105.000</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
                  <span className="text-slate-300">Jadwal Vaksin:</span>
                  <span className="font-bold text-white">
                    {formData.selectedDate || 'Belum dipilih'} {formData.selectedTime ? `• ${formData.selectedTime}` : ''}
                  </span>
                </div>
              </div>

              {/* Tombol Konfirmasi & Selesaikan Booking (Mobile only) */}
              <div className="lg:hidden sticky bottom-4 mt-auto bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-md space-y-2">
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Terintegrasi Langsung ke SIMRS RSUD Al-Mulk (Poli Vaksinasi Internasional)</span>
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed mb-8">
                Data registrasi Anda telah tersimpan dan disinkronkan ke SIMRS. Anda dapat langsung mencetak
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

        {step < 4 && renderDesktopSidebar()}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  divider = false
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  divider?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${divider ? 'pt-5 lg:pt-6 border-t border-slate-100' : 'pb-1'}`}>
      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-extrabold text-slate-800 text-[15px] leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-[12px] text-slate-500 font-medium mt-0.5 leading-snug">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  const isEmpty = !value || value.trim() === '';
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-[12px] text-slate-500 font-medium shrink-0">{label}</span>
      <span
        className={`text-[12px] text-right break-words min-w-0 ${
          isEmpty ? 'text-slate-300 font-medium italic' : 'text-slate-800 font-bold'
        } ${mono && !isEmpty ? 'font-mono tracking-tight' : ''}`}
      >
        {isEmpty ? 'Belum diisi' : value}
      </span>
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
      <label className="text-[13px] font-bold text-slate-700 pl-1 flex items-center gap-1">
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
          className={`w-full h-[54px] lg:h-12 bg-white border border-slate-200 rounded-[16px] lg:rounded-xl text-[14px] font-bold text-slate-800 placeholder:text-slate-400/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all hover:border-slate-300 ${icon ? 'pl-[3.25rem] pr-4' : 'px-4'}`}
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
      className={`w-full h-[54px] lg:h-12 rounded-[20px] font-extrabold text-[15px] tracking-[0.02em] transition-all overflow-hidden relative group active:scale-[0.98] flex items-center justify-center gap-2 ${
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
