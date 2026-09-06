import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/AppContext';
import { 
  User, Settings, Shield, LogOut, ChevronRight, HelpCircle, 
  FileText, ChevronLeft, Camera, Save, Phone, MapPin, Hash, 
  CheckCircle2, UploadCloud, Database, Cloud, Loader2, ExternalLink,
  Image as ImageIcon, Sparkles, RefreshCw, Check, AlertCircle, Trash2,
  Syringe, Plus, Edit3, Search, SlidersHorizontal, X, ArrowUpRight,
  Award, ArrowLeft
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabase';
import { uploadFileToSupabase } from '../services/supabaseStorageService';
import { saveAppSettingsToSupabase, fetchAppSettingsFromSupabase } from '../services/appDataSupabaseService';
import SupabaseConfigModal from '../components/SupabaseConfigModal';
import OfficialDocHeader, { SukabumiCoatOfArms, RsudAlMulkLogo } from '../components/OfficialDocHeader';

export default function Profile() {
  const { 
    user, 
    role, 
    logout, 
    updateUser, 
    isSupabaseOnline, 
    refreshAllCloudData, 
    appLogo, 
    setAppLogo,
    docLogoLeft,
    docLogoRight,
    setDocLogoLeft,
    setDocLogoRight,
    eicvStock,
    eicvStatus,
    eicvNote,
    updateEicvAvailability,
    vaccines,
    addVaccine,
    updateVaccine,
    deleteVaccine,
    updateVaccineStock
  } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialViewParam = searchParams.get('view') as any;
  const [currentView, setCurrentView] = useState<'main' | 'edit_profile' | 'support_data' | 'app_settings' | 'logo_settings' | 'doc_logo_settings' | 'vaccine_settings' | 'eicv_settings'>(
    initialViewParam === 'doc_logo_settings' ? 'doc_logo_settings' : 
    initialViewParam === 'eicv_settings' ? 'eicv_settings' : 'main'
  );

  // Vaccine management states
  const [vaccineSearch, setVaccineSearch] = useState('');
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isEditingVaccine, setIsEditingVaccine] = useState(false);
  const [editingVaccineId, setEditingVaccineId] = useState<string | null>(null);
  const [vaccineForm, setVaccineForm] = useState({
    name: '',
    price: 350000,
    stock: 50,
    category: 'Wajib' as 'Wajib' | 'Dianjurkan' | 'Rutin',
    description: '',
    benefits: 'Sertifikat Internasional (ICV), Perlindungan Medis Terstandarisasi'
  });
  const [isSavingVaccine, setIsSavingVaccine] = useState(false);
  const [vaccineFeedbackMsg, setVaccineFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editName, setEditName] = useState(user?.name || user?.full_name || '');
  const [editAvatar, setEditAvatar] = useState<string>(user?.avatar_url || user?.avatar || localStorage.getItem('sivaksin_user_avatar') || '');

  useEffect(() => {
    if (user) {
      if (user.name || user.full_name) {
        setEditName(user.name || user.full_name);
      }
      const currentAv = user.avatar_url || user.avatar || localStorage.getItem('sivaksin_user_avatar');
      if (currentAv) {
        setEditAvatar(currentAv);
      }
    }
  }, [user]);
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(appLogo || localStorage.getItem('app_logo'));
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoSuccessMsg, setLogoSuccessMsg] = useState<string | null>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState<string | null>(null);
  
  const [isUploadingKtp, setIsUploadingKtp] = useState(false);
  const [isUploadingPassport, setIsUploadingPassport] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const quickAvatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const leftDocLogoInputRef = useRef<HTMLInputElement>(null);
  const rightDocLogoInputRef = useRef<HTMLInputElement>(null);

  // Document Logos (Kop Surat: Kiri = Pemkot Sukabumi, Kanan = RSUD Al-Mulk)
  const [leftDocLogoFile, setLeftDocLogoFile] = useState<File | null>(null);
  const [leftDocLogoPreview, setLeftDocLogoPreview] = useState<string | null>(docLogoLeft || localStorage.getItem('sivaksin_doc_logo_left'));
  const [isUploadingLeftDocLogo, setIsUploadingLeftDocLogo] = useState(false);

  const [rightDocLogoFile, setRightDocLogoFile] = useState<File | null>(null);
  const [rightDocLogoPreview, setRightDocLogoPreview] = useState<string | null>(docLogoRight || localStorage.getItem('sivaksin_doc_logo_right'));
  const [isUploadingRightDocLogo, setIsUploadingRightDocLogo] = useState(false);

  const [docLogoFeedback, setDocLogoFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setLeftDocLogoPreview(docLogoLeft || localStorage.getItem('sivaksin_doc_logo_left'));
  }, [docLogoLeft]);

  useEffect(() => {
    setRightDocLogoPreview(docLogoRight || localStorage.getItem('sivaksin_doc_logo_right'));
  }, [docLogoRight]);

  // E-ICV Availability Management States
  const [inputEicvStock, setInputEicvStock] = useState<number>(eicvStock || 150);
  const [inputEicvStatus, setInputEicvStatus] = useState<string>(eicvStatus || 'Tersedia');
  const [inputEicvNote, setInputEicvNote] = useState<string>(eicvNote || 'Blanko Resmi E-ICV / Buku Kuning Siap Diterbitkan di RSUD Al-Mulk');
  const [isSavingEicv, setIsSavingEicv] = useState(false);
  const [eicvFeedback, setEicvFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setInputEicvStock(eicvStock);
    setInputEicvStatus(eicvStatus);
    setInputEicvNote(eicvNote);
  }, [eicvStock, eicvStatus, eicvNote]);

  const handleSaveEicv = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEicv(true);
    try {
      await updateEicvAvailability(Number(inputEicvStock), inputEicvStatus, inputEicvNote.trim());
      setEicvFeedback({ type: 'success', text: 'Ketersediaan E-ICV berhasil disimpan dan langsung aktif realtime di Halaman Utama!' });
      setTimeout(() => setEicvFeedback(null), 4000);
    } catch (err: any) {
      setEicvFeedback({ type: 'error', text: 'Gagal memperbarui: ' + (err.message || 'Error') });
    } finally {
      setIsSavingEicv(false);
    }
  };

  useEffect(() => {
    fetchAppSettingsFromSupabase().then(({ settings }) => {
      if (settings?.app_logo) {
        setLogoPreview(settings.app_logo);
        setAppLogo(settings.app_logo);
      } else {
        const saved = localStorage.getItem('app_logo');
        if (saved) setLogoPreview(saved);
      }
      if (settings?.doc_logo_left) {
        setLeftDocLogoPreview(settings.doc_logo_left);
        setDocLogoLeft(settings.doc_logo_left);
      } else {
        const saved = localStorage.getItem('sivaksin_doc_logo_left');
        if (saved) {
          setLeftDocLogoPreview(saved);
          setDocLogoLeft(saved);
        }
      }
      if (settings?.doc_logo_right) {
        setRightDocLogoPreview(settings.doc_logo_right);
        setDocLogoRight(settings.doc_logo_right);
      } else {
        const saved = localStorage.getItem('sivaksin_doc_logo_right');
        if (saved) {
          setRightDocLogoPreview(saved);
          setDocLogoRight(saved);
        }
      }
    });
  }, [setAppLogo, setDocLogoLeft, setDocLogoRight]);

  const [supportData, setSupportData] = useState({
    nik: user?.nik || '',
    alamat: user?.alamat || '',
    no_hp: user?.no_hp || '',
    no_passport: user?.no_passport || '',
    ktp_file: user?.ktp_file || (user?.ktp_url ? 'KTP_Supabase_Cloud.jpg' : null),
    ktp_url: user?.ktp_url || '',
    passport_file: user?.passport_file || (user?.passport_url ? 'Passport_Supabase_Cloud.jpg' : null),
    passport_url: user?.passport_url || ''
  });

  // Handle avatar upload (works for both quick avatar button and edit profile)
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        alert('Ukuran foto profil maksimal 8MB.');
        e.target.value = '';
        return;
      }

      setIsUploadingAvatar(true);
      setAvatarSuccessMsg(null);

      // Local preview
      const previewUrl = URL.createObjectURL(file);
      setEditAvatar(previewUrl);

      try {
        let finalUrl = previewUrl;

        // Upload ke Supabase Storage (bucket assets / avatars / documents)
        const result = await uploadFileToSupabase(file, 'assets', 'avatar');
        if (result.url) {
          finalUrl = result.url;
        }

        setEditAvatar(finalUrl);
        localStorage.setItem('sivaksin_user_avatar', finalUrl);
        
        // Simpan langsung ke database Supabase tabel `users`
        if (updateUser) {
          await updateUser({ 
            avatar_url: finalUrl, 
            avatar: finalUrl,
            name: editName || user?.name || user?.full_name 
          });
        }

        setAvatarSuccessMsg('Foto profil berhasil diunggah & tersimpan di Supabase Cloud!');
        setTimeout(() => setAvatarSuccessMsg(null), 4000);
      } catch (err: any) {
        console.error("Avatar upload error:", err.message);
        alert('Gagal mengunggah foto profil: ' + (err.message || 'Terjadi kesalahan'));
      } finally {
        setIsUploadingAvatar(false);
        if (e.target) {
          e.target.value = '';
        }
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (confirm('Hapus foto profil dan kembalikan ke inisial huruf nama?')) {
      setIsUploadingAvatar(true);
      try {
        setEditAvatar('');
        localStorage.removeItem('sivaksin_user_avatar');
        if (updateUser) {
          await updateUser({ avatar_url: '', avatar: '' });
        }
        setAvatarSuccessMsg('Foto profil berhasil dihapus dan kembali ke inisial.');
        setTimeout(() => setAvatarSuccessMsg(null), 3000);
      } catch (e: any) {
        alert('Gagal menghapus foto profil: ' + e.message);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const saveProfile = async () => {
    if (updateUser) {
      await updateUser({ 
        name: editName, 
        avatar_url: editAvatar || user?.avatar_url, 
        avatar: editAvatar || user?.avatar 
      });
    }
    setCurrentView('main');
  };

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran logo maksimal 5 MB.');
        return;
      }
      setLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  const handleApplyLogo = async () => {
    if (!logoFile && !logoPreview) return;
    setIsUploadingLogo(true);
    setLogoSuccessMsg(null);

    try {
      let finalLogoUrl = logoPreview;

      if (logoFile) {
        if (isSupabaseConfigured) {
          const uploadResult = await uploadFileToSupabase(logoFile, 'assets', 'app_logo');
          if (uploadResult.url) {
            finalLogoUrl = uploadResult.url;
            await saveAppSettingsToSupabase({ app_logo: uploadResult.url });
          }
        } else {
          // Read base64
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = (e) => {
              if (e.target?.result) {
                finalLogoUrl = e.target.result as string;
              }
              resolve();
            };
            reader.readAsDataURL(logoFile);
          });
        }
      }

      if (finalLogoUrl) {
        setAppLogo(finalLogoUrl);
        setLogoPreview(finalLogoUrl);
        setLogoSuccessMsg('Logo aplikasi berhasil diperbarui di Welcome, Login, Beranda, & Sidebar!');
        setTimeout(() => setLogoSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert('Gagal menyimpan logo: ' + err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleResetLogo = async () => {
    if (confirm('Kembalikan logo aplikasi ke logo standar default?')) {
      setAppLogo(null);
      setLogoPreview(null);
      setLogoFile(null);
      if (isSupabaseConfigured) {
        await saveAppSettingsToSupabase({ app_logo: null });
      }
      setLogoSuccessMsg('Logo dikembalikan ke standar default.');
      setTimeout(() => setLogoSuccessMsg(null), 3000);
    }
  };

  // --- Handlers for Document Logos (Informed Consent Kop Surat) ---
  const handleLeftDocLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran logo maksimal 5 MB.');
        return;
      }
      setLeftDocLogoFile(file);
      const objUrl = URL.createObjectURL(file);
      setLeftDocLogoPreview(objUrl);
    }
  };

  const handleApplyLeftDocLogo = async () => {
    if (!leftDocLogoFile && !leftDocLogoPreview) return;
    setIsUploadingLeftDocLogo(true);
    setDocLogoFeedback(null);
    try {
      let finalUrl = leftDocLogoPreview;
      if (leftDocLogoFile) {
        if (isSupabaseConfigured) {
          const res = await uploadFileToSupabase(leftDocLogoFile, 'assets', 'doc_logo_pemkot');
          if (res.url) {
            finalUrl = res.url;
            await saveAppSettingsToSupabase({ doc_logo_left: res.url });
          }
        } else {
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = (e) => {
              if (e.target?.result) finalUrl = e.target.result as string;
              resolve();
            };
            reader.readAsDataURL(leftDocLogoFile);
          });
        }
      }
      if (finalUrl) {
        setDocLogoLeft(finalUrl);
        setLeftDocLogoPreview(finalUrl);
        setDocLogoFeedback({
          type: 'success',
          text: 'Logo Pemerintah Kota Sukabumi (Kiri Kop) berhasil disimpan dan diterapkan pada seluruh formulir resmi!'
        });
        setTimeout(() => setDocLogoFeedback(null), 4000);
      }
    } catch (err: any) {
      setDocLogoFeedback({ type: 'error', text: 'Gagal menyimpan logo: ' + err.message });
    } finally {
      setIsUploadingLeftDocLogo(false);
    }
  };

  const handleResetLeftDocLogo = async () => {
    if (confirm('Kembalikan logo sebelah kiri (Pemerintah Kota Sukabumi) ke lambang resmi default?')) {
      setDocLogoLeft(null);
      setLeftDocLogoFile(null);
      setLeftDocLogoPreview(null);
      if (isSupabaseConfigured) {
        await saveAppSettingsToSupabase({ doc_logo_left: '' });
      }
      setDocLogoFeedback({
        type: 'success',
        text: 'Logo Pemerintah Kota Sukabumi berhasil dikembalikan ke lambang resmi default.'
      });
      setTimeout(() => setDocLogoFeedback(null), 4000);
    }
  };

  const handleRightDocLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran logo maksimal 5 MB.');
        return;
      }
      setRightDocLogoFile(file);
      const objUrl = URL.createObjectURL(file);
      setRightDocLogoPreview(objUrl);
    }
  };

  const handleApplyRightDocLogo = async () => {
    if (!rightDocLogoFile && !rightDocLogoPreview) return;
    setIsUploadingRightDocLogo(true);
    setDocLogoFeedback(null);
    try {
      let finalUrl = rightDocLogoPreview;
      if (rightDocLogoFile) {
        if (isSupabaseConfigured) {
          const res = await uploadFileToSupabase(rightDocLogoFile, 'assets', 'doc_logo_rsud');
          if (res.url) {
            finalUrl = res.url;
            await saveAppSettingsToSupabase({ doc_logo_right: res.url });
          }
        } else {
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = (e) => {
              if (e.target?.result) finalUrl = e.target.result as string;
              resolve();
            };
            reader.readAsDataURL(rightDocLogoFile);
          });
        }
      }
      if (finalUrl) {
        setDocLogoRight(finalUrl);
        setRightDocLogoPreview(finalUrl);
        setDocLogoFeedback({
          type: 'success',
          text: 'Logo RSUD Al-Mulk (Kanan Kop) berhasil disimpan dan diterapkan pada seluruh formulir resmi!'
        });
        setTimeout(() => setDocLogoFeedback(null), 4000);
      }
    } catch (err: any) {
      setDocLogoFeedback({ type: 'error', text: 'Gagal menyimpan logo: ' + err.message });
    } finally {
      setIsUploadingRightDocLogo(false);
    }
  };

  const handleResetRightDocLogo = async () => {
    if (confirm('Kembalikan logo sebelah kanan (RSUD Al-Mulk) ke logo resmi default?')) {
      setDocLogoRight(null);
      setRightDocLogoFile(null);
      setRightDocLogoPreview(null);
      if (isSupabaseConfigured) {
        await saveAppSettingsToSupabase({ doc_logo_right: '' });
      }
      setDocLogoFeedback({
        type: 'success',
        text: 'Logo RSUD Al-Mulk berhasil dikembalikan ke logo resmi default.'
      });
      setTimeout(() => setDocLogoFeedback(null), 4000);
    }
  };

  const handleSupportKtpUpload = async (file: File) => {
    setIsUploadingKtp(true);
    try {
      const res = await uploadFileToSupabase(file, 'documents', 'ktp');
      if (res.url) {
        setSupportData(prev => ({
          ...prev,
          ktp_file: file.name,
          ktp_url: res.url!
        }));
      } else {
        setSupportData(prev => ({ ...prev, ktp_file: file.name }));
      }
    } catch (e) {
      setSupportData(prev => ({ ...prev, ktp_file: file.name }));
    } finally {
      setIsUploadingKtp(false);
    }
  };

  const handleSupportPassportUpload = async (file: File) => {
    setIsUploadingPassport(true);
    try {
      const res = await uploadFileToSupabase(file, 'documents', 'passport');
      if (res.url) {
        setSupportData(prev => ({
          ...prev,
          passport_file: file.name,
          passport_url: res.url!
        }));
      } else {
        setSupportData(prev => ({ ...prev, passport_file: file.name }));
      }
    } catch (e) {
      setSupportData(prev => ({ ...prev, passport_file: file.name }));
    } finally {
      setIsUploadingPassport(false);
    }
  };

  const saveSupportData = async () => {
    if (updateUser) {
      await updateUser({ 
        nik: supportData.nik, 
        alamat: supportData.alamat, 
        no_hp: supportData.no_hp, 
        no_passport: supportData.no_passport,
        ktp_file: supportData.ktp_file,
        ktp_url: supportData.ktp_url,
        passport_file: supportData.passport_file,
        passport_url: supportData.passport_url
      });
    }
    setCurrentView('main');
  };

  // User avatar URL
  const currentAvatar = user?.avatar_url || user?.avatar || editAvatar || localStorage.getItem('sivaksin_user_avatar');

  // VIEW: EDIT PROFIL & UPLOAD FOTO
  const renderEditProfile = () => (
    <div className="bg-slate-50 min-h-screen relative w-full h-full flex flex-col font-sans">
      <div className="bg-white px-4 py-4 sticky top-0 z-40 shadow-xs border-b border-slate-200">
        <div className="max-w-3xl mx-auto flex items-center gap-3 w-full">
          <button onClick={() => setCurrentView('main')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
            <ChevronLeft className="text-slate-700" />
          </button>
          <h1 className="font-bold text-lg text-slate-800">Ubah Foto & Profil Pengguna</h1>
        </div>
      </div>

      <div className="px-6 py-8 flex-1 flex flex-col items-center max-w-2xl mx-auto w-full">
        
        {/* Avatar Upload Container */}
        <div className="relative mb-6">
          <div 
            onClick={() => avatarInputRef.current?.click()}
            className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl overflow-hidden border-4 border-white cursor-pointer hover:opacity-95 transition-opacity"
            title="Klik untuk memilih foto profil baru"
          >
            {currentAvatar ? (
              <img src={currentAvatar} alt="Foto Profil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-black text-4xl">
                {(user?.name || user?.full_name || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <input 
            type="file" 
            accept="image/*" 
            ref={avatarInputRef} 
            onChange={handleAvatarFileSelect} 
            className="hidden" 
          />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            {isUploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            <span>{isUploadingAvatar ? 'Mengunggah Foto ke Supabase...' : 'Unggah / Ganti Foto Profil'}</span>
          </button>

          {currentAvatar && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isUploadingAvatar}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Hapus foto profil dan gunakan inisial"
            >
              <Trash2 size={13} />
              <span>Hapus Foto</span>
            </button>
          )}
        </div>

        {/* Supabase Storage & DB Status Indicator */}
        <div className="w-full mb-4 px-3.5 py-2 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-[11px] text-blue-800">
          <div className="flex items-center gap-1.5">
            <Cloud size={14} className="text-blue-600 shrink-0" />
            <span className="font-semibold">Penyimpanan Cloud Supabase:</span>
          </div>
          <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md shadow-2xs border border-blue-100">
            Tabel users & Storage assets
          </span>
        </div>

        {avatarSuccessMsg && (
          <div className="w-full mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{avatarSuccessMsg}</span>
          </div>
        )}

        <div className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 pl-1">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={20} />
              </div>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Nama lengkap Anda"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 w-full">
          <button 
            type="button"
            onClick={saveProfile}
            disabled={isUploadingAvatar}
            className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            <span>Simpan Profil</span>
          </button>
        </div>
      </div>
    </div>
  );

  // VIEW: PENGATURAN LOGO APLIKASI
  const renderLogoSettings = () => (
    <div className="bg-slate-50 min-h-screen relative w-full h-full flex flex-col font-sans">
      <div className="bg-white px-4 py-4 sticky top-0 z-40 shadow-xs border-b border-slate-200">
        <div className="max-w-3xl mx-auto flex items-center gap-3 w-full">
          <button onClick={() => setCurrentView('main')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
            <ChevronLeft className="text-slate-700" />
          </button>
          <h1 className="font-bold text-lg text-slate-800">Pengaturan Logo Aplikasi</h1>
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto w-full space-y-6">
        
        {logoSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{logoSuccessMsg}</span>
          </div>
        )}

        {/* Upload Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-black text-slate-900 text-base">Unggah Logo Aplikasi SIVAKSIN</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Logo yang diunggah akan otomatis ditampilkan di <strong>Welcome Page</strong>, <strong>Halaman Login</strong>, <strong>Header Halaman Utama</strong>, dan <strong>Sidebar Navigator</strong>.
            </p>
          </div>

          <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-28 h-28 bg-white rounded-3xl p-2 shadow-md border border-slate-200 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon size={36} />
                  <span className="text-[10px] font-bold mt-1">Belum Ada Logo</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <UploadCloud size={16} />
                <span>Pilih File Logo (PNG/JPG/SVG)</span>
              </button>
              <p className="text-[11px] text-slate-400 font-medium">Maksimal ukuran 5MB, format transparan disarankan</p>
            </div>

            <input 
              type="file" 
              accept="image/*" 
              ref={logoInputRef} 
              onChange={handleLogoFileSelect} 
              className="hidden" 
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleApplyLogo}
              disabled={isUploadingLogo}
              className="w-full sm:flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
              <span>{isUploadingLogo ? 'Menyimpan Logo...' : 'Terapkan & Simpan Logo Aplikasi'}</span>
            </button>

            {logoPreview && (
              <button
                type="button"
                onClick={handleResetLogo}
                className="w-full sm:w-auto px-4 h-12 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 border border-rose-200 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Reset Logo Default</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Preview Placement Cards */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span>Simulasi Tampilan Logo di Berbagai Halaman:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Preview Welcome Page */}
            <div className="bg-gradient-to-br from-indigo-950 via-blue-900 to-cyan-700 rounded-2xl p-4 text-center text-white space-y-2 border border-blue-800">
              <p className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider">Welcome Page</p>
              <div className="w-14 h-14 bg-white rounded-2xl mx-auto p-1.5 shadow-md flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Welcome" className="w-full h-full object-contain" />
                ) : (
                  <Shield className="text-blue-600" size={24} />
                )}
              </div>
              <p className="text-xs font-black tracking-wider">SIVAKSIN</p>
            </div>

            {/* Preview Login Page */}
            <div className="bg-gradient-to-br from-indigo-950 via-blue-900 to-cyan-700 rounded-2xl p-4 text-center text-white space-y-2 border border-blue-800">
              <p className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider">Login Page</p>
              <div className="w-12 h-12 bg-white rounded-xl mx-auto p-1 shadow-md flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Login" className="w-full h-full object-contain" />
                ) : (
                  <Shield className="text-blue-600" size={20} />
                )}
              </div>
              <p className="text-[11px] font-bold">Masuk Akun SIVAKSIN</p>
            </div>

            {/* Preview Header / Sidebar */}
            <div className="bg-[#003B73] rounded-2xl p-4 text-center text-white space-y-2 border border-blue-900">
              <p className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider">Header & Sidebar</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl p-1 shadow-md flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Sidebar" className="w-full h-full object-contain" />
                  ) : (
                    <Shield className="text-blue-600" size={16} />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black leading-none">SIVAKSIN</p>
                  <p className="text-[9px] text-blue-200 font-medium">RSUD Al-Mulk</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  // VIEW: PENGATURAN LOGO FORMULIR RESMI (KOP SURAT)
  const renderDocLogoSettings = () => (
    <div className="bg-slate-50 min-h-screen relative w-full h-full flex flex-col font-sans">
      <div className="bg-white px-4 py-4 sticky top-0 z-40 shadow-xs border-b border-slate-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('main')} 
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="text-slate-700" />
            </button>
            <div>
              <h1 className="font-black text-lg text-slate-900">Pengaturan Logo Formulir (Kop Surat)</h1>
              <p className="text-xs text-slate-500">
                Atur logo instansi resmi untuk menu Informed Consent & formulir medis
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/consent?doc=consent')}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Buka Informed Consent</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Feedback Alert */}
        {docLogoFeedback && (
          <div 
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300 ${
              docLogoFeedback.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {docLogoFeedback.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{docLogoFeedback.text}</span>
          </div>
        )}

        {/* Informational Guidance */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-md border border-blue-800 space-y-2">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={20} />
            <h3 className="font-black text-sm uppercase tracking-wide text-cyan-200">
              Standar Kop Surat Resmi Formulir Vaksinasi
            </h3>
          </div>
          <p className="text-xs text-blue-100/90 leading-relaxed">
            Sesuai regulasi administrasi instansi medis, tampilan kop surat formulir terdiri dari <strong>Logo Pemerintah Kota Sukabumi di sebelah kiri</strong> dan <strong>Logo Rumah Sakit RSUD Al-Mulk di sebelah kanan</strong>. Logo formulir ini disimpan terpisah dan <strong>tidak disamakan dengan logo aplikasi</strong> agar menjaga integritas dokumen kedinasan.
          </p>
        </div>

        {/* 2-Column Upload Cards for Left (Pemkot) and Right (RSUD) Logos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. KIRI: LOGO PEMERINTAH KOTA SUKABUMI */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-black text-[11px] uppercase tracking-wider">
                  Sebelah Kiri Kop
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Informed Consent</span>
              </div>
              <h4 className="font-black text-slate-900 text-base">
                Logo Pemerintah Kota Sukabumi
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Akan ditampilkan pada sudut kiri atas kop surat seluruh formulir resmi.
              </p>
            </div>

            {/* Preview Box */}
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-24 h-28 bg-white rounded-2xl p-2 shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden">
                {leftDocLogoPreview ? (
                  <img
                    src={leftDocLogoPreview}
                    alt="Logo Pemkot Sukabumi"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <SukabumiCoatOfArms className="w-16 h-22 drop-shadow-xs" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-700">
                  {leftDocLogoPreview ? 'Logo Kustom Aktif' : 'Default: Lambang Resmi Kota Sukabumi'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">PNG / JPG / SVG (Maks. 5MB)</p>
              </div>

              <button
                type="button"
                onClick={() => leftDocLogoInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <UploadCloud size={14} />
                <span>Pilih File Logo Pemkot</span>
              </button>

              <input
                type="file"
                accept="image/*"
                ref={leftDocLogoInputRef}
                onChange={handleLeftDocLogoSelect}
                className="hidden"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleApplyLeftDocLogo}
                disabled={isUploadingLeftDocLogo || (!leftDocLogoFile && !leftDocLogoPreview)}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploadingLeftDocLogo ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Check size={15} strokeWidth={2.5} />
                )}
                <span>{isUploadingLeftDocLogo ? 'Menyimpan...' : 'Terapkan Logo Pemkot'}</span>
              </button>

              {leftDocLogoPreview && (
                <button
                  type="button"
                  onClick={handleResetLeftDocLogo}
                  title="Kembalikan ke lambang default"
                  className="px-3 h-11 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer border border-slate-200"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          {/* 2. KANAN: LOGO RUMAH SAKIT RSUD AL-MULK */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[11px] uppercase tracking-wider">
                  Sebelah Kanan Kop
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Informed Consent</span>
              </div>
              <h4 className="font-black text-slate-900 text-base">
                Logo Rumah Sakit RSUD Al-Mulk
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Akan ditampilkan pada sudut kanan atas kop surat seluruh formulir resmi.
              </p>
            </div>

            {/* Preview Box */}
            <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-24 h-28 bg-white rounded-2xl p-2 shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden">
                {rightDocLogoPreview ? (
                  <img
                    src={rightDocLogoPreview}
                    alt="Logo RSUD Al-Mulk"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <RsudAlMulkLogo className="w-16 h-22 drop-shadow-xs" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-700">
                  {rightDocLogoPreview ? 'Logo Kustom Aktif' : 'Default: Logo Resmi RSUD Al-Mulk'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">PNG / JPG / SVG (Maks. 5MB)</p>
              </div>

              <button
                type="button"
                onClick={() => rightDocLogoInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <UploadCloud size={14} />
                <span>Pilih File Logo RSUD</span>
              </button>

              <input
                type="file"
                accept="image/*"
                ref={rightDocLogoInputRef}
                onChange={handleRightDocLogoSelect}
                className="hidden"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleApplyRightDocLogo}
                disabled={isUploadingRightDocLogo || (!rightDocLogoFile && !rightDocLogoPreview)}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploadingRightDocLogo ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Check size={15} strokeWidth={2.5} />
                )}
                <span>{isUploadingRightDocLogo ? 'Menyimpan...' : 'Terapkan Logo RSUD'}</span>
              </button>

              {rightDocLogoPreview && (
                <button
                  type="button"
                  onClick={handleResetRightDocLogo}
                  title="Kembalikan ke logo default"
                  className="px-3 h-11 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer border border-slate-200"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Live Simulation of Kop Surat with Arial Font */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <span>Live Preview Kop Surat Resmi (Standar Font Arial)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pratinjau tampilan dokumen Informed Consent dengan font Arial sesuai instruksi kedinasan.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">
              Font: Arial, Sans-Serif
            </span>
          </div>

          {/* Document Preview Box */}
          <div className="bg-slate-100 p-3 sm:p-6 rounded-2xl overflow-x-auto">
            <div 
              className="bg-white text-black p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 max-w-2xl mx-auto"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              {/* Kop Surat */}
              <OfficialDocHeader fontFamily="Arial, Helvetica, sans-serif" />

              {/* Form Title */}
              <div className="text-center my-4">
                <h3 className="font-black text-[13px] sm:text-[14px] uppercase underline tracking-wider text-black">
                  FORMULIR PERSETUJUAN / IZIN* TINDAKAN VAKSINASI
                </h3>
              </div>

              {/* Sample snippet */}
              <div className="text-[11px] text-slate-600 space-y-2 mt-3 leading-relaxed">
                <p>Saya yang bertanda tangan di bawah ini :</p>
                <div className="pl-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-500">Nama</span>
                    <span>:</span>
                    <span className="font-semibold text-slate-800">Contoh Pasien Vaksinasi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-500">Alamat</span>
                    <span>:</span>
                    <span className="font-semibold text-slate-800">Kota Sukabumi, Jawa Barat</span>
                  </div>
                </div>
                <p className="pt-2 text-slate-500 italic text-[10px]">
                  *) Tampilan dokumen lengkap dengan font Arial dan kop surat resmi siap dicetak di menu Informed Consent.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => navigate('/consent?doc=consent')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <span>Buka Formulir Informed Consent Lengkap</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  // VIEW: DATA PENDUKUNG
  const renderSupportData = () => (
    <div className="bg-slate-50 min-h-screen relative w-full h-full flex flex-col font-sans">
      <div className="bg-white px-4 py-4 sticky top-0 z-40 shadow-xs border-b border-slate-200">
        <div className="max-w-3xl mx-auto flex items-center gap-3 w-full">
          <button onClick={() => setCurrentView('main')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
            <ChevronLeft className="text-slate-700" />
          </button>
          <h1 className="font-bold text-lg text-slate-800">Data Pendukung Pasien</h1>
        </div>
      </div>

      <div className="px-6 py-6 flex-1 flex flex-col overflow-y-auto max-w-3xl mx-auto w-full space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 pl-1">Nomor KTP (NIK)</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Hash size={20} />
            </div>
            <input 
              type="text" 
              value={supportData.nik}
              onChange={(e) => setSupportData({...supportData, nik: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-blue-500 transition-all"
              placeholder="16 Digit NIK"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 pl-1">Alamat Lengkap</label>
          <div className="relative">
            <div className="absolute left-4 top-4 text-slate-400">
              <MapPin size={20} />
            </div>
            <textarea 
              value={supportData.alamat}
              onChange={(e) => setSupportData({...supportData, alamat: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-blue-500 transition-all min-h-[100px]"
              placeholder="Alamat domisili"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 pl-1">Nomor HP / WhatsApp</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Phone size={20} />
            </div>
            <input 
              type="tel" 
              value={supportData.no_hp}
              onChange={(e) => setSupportData({...supportData, no_hp: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-blue-500 transition-all"
              placeholder="0812xxxxxxxx"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 pl-1">Nomor Passport</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <FileText size={20} />
            </div>
            <input 
              type="text" 
              value={supportData.no_passport}
              onChange={(e) => setSupportData({...supportData, no_passport: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Nomor Passport"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between pl-1">
            <label className="text-sm font-bold text-slate-700">Upload KTP</label>
            {supportData.ktp_url && (
              <a href={supportData.ktp_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline">
                Lihat di Cloud <ExternalLink size={12} />
              </a>
            )}
          </div>
          <label className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-500 bg-white/50 hover:bg-white transition-colors cursor-pointer relative overflow-hidden">
            <input 
              type="file" 
              accept="image/*,.pdf" 
              disabled={isUploadingKtp}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              onChange={(e) => {
                if(e.target.files && e.target.files[0]) {
                  handleSupportKtpUpload(e.target.files[0]);
                }
              }} 
            />
            {isUploadingKtp ? (
              <div className="text-center py-2">
                <Loader2 size={24} className="animate-spin text-blue-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-600">Mengunggah ke Supabase...</span>
              </div>
            ) : supportData.ktp_file ? (
              <div className="text-center">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1"><CheckCircle2 size={16} /></div>
                <span className="text-[11px] font-bold text-slate-700 block truncate max-w-[200px]">{supportData.ktp_file}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Tersimpan di Cloud</span>
              </div>
            ) : (
              <>
                <UploadCloud size={20} className="mb-1 text-slate-400" />
                <span className="text-[11px] font-medium text-center">Tap untuk upload KTP (Max 5MB)</span>
              </>
            )}
          </label>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between pl-1">
            <label className="text-sm font-bold text-slate-700">Upload Passport</label>
            {supportData.passport_url && (
              <a href={supportData.passport_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline">
                Lihat di Cloud <ExternalLink size={12} />
              </a>
            )}
          </div>
          <label className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-500 bg-white/50 hover:bg-white transition-colors cursor-pointer relative overflow-hidden">
            <input 
              type="file" 
              accept="image/*,.pdf" 
              disabled={isUploadingPassport}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              onChange={(e) => {
                if(e.target.files && e.target.files[0]) {
                  handleSupportPassportUpload(e.target.files[0]);
                }
              }} 
            />
            {isUploadingPassport ? (
              <div className="text-center py-2">
                <Loader2 size={24} className="animate-spin text-blue-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-600">Mengunggah ke Supabase...</span>
              </div>
            ) : supportData.passport_file ? (
              <div className="text-center">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1"><CheckCircle2 size={16} /></div>
                <span className="text-[11px] font-bold text-slate-700 block truncate max-w-[200px]">{supportData.passport_file}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Tersimpan di Cloud</span>
              </div>
            ) : (
              <>
                <UploadCloud size={20} className="mb-1 text-slate-400" />
                <span className="text-[11px] font-medium text-center">Tap untuk upload Passport (Max 5MB)</span>
              </>
            )}
          </label>
        </div>

        <div className="mt-8 pb-8 pt-4 w-full">
          <button 
            type="button"
            onClick={saveSupportData}
            className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Save size={18} />
            <span>Simpan Data Pendukung</span>
          </button>
        </div>
      </div>
    </div>
  );

  // VIEW: PENGATURAN APLIKASI
  const renderAppSettings = () => (
    <div className="bg-slate-50 min-h-screen relative w-full h-full flex flex-col font-sans">
       <div className="bg-white px-4 py-4 sticky top-0 z-40 shadow-xs border-b border-slate-200">
         <div className="max-w-3xl mx-auto flex items-center gap-3 w-full">
           <button onClick={() => setCurrentView('main')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
             <ChevronLeft className="text-slate-700" />
           </button>
           <h1 className="font-bold text-lg text-slate-800">Pengaturan Sistem & Database</h1>
         </div>
       </div>
 
       <div className="p-6 max-w-3xl mx-auto w-full space-y-6">
         {/* Supabase Cloud Connection Status Card */}
         <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Supabase Cloud Database</h3>
                  <p className="text-xs text-slate-500">Penyimpanan Terpusat & Realtime</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                isSupabaseOnline 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isSupabaseOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isSupabaseOnline ? 'Online / Terhubung' : 'Offline / Sesi Lokal'}
              </span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Semua data input vaksin, booking pasien, profil pengguna, dan file upload (KTP, Passport, Logo) dikonfigurasikan agar langsung tersimpan di Supabase Cloud.
            </p>

            <div className="flex flex-wrap gap-2">
              <button 
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Settings size={14} />
                Konfigurasi Kunci API Supabase
              </button>
              <button 
                type="button"
                onClick={() => {
                  refreshAllCloudData();
                  alert('Sinkronisasi data dari Supabase Cloud dimulai...');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                Sinkronisasi Ulang Data
              </button>
            </div>
         </div>
       </div>

       <SupabaseConfigModal 
         isOpen={isSupabaseModalOpen} 
         onClose={() => setIsSupabaseModalOpen(false)} 
         onSaved={refreshAllCloudData} 
       />
    </div>
  );

  const renderVaccineSettings = () => {
    const totalStock = vaccines.reduce((acc, v) => acc + (v.stock || 0), 0);
    const lowStockCount = vaccines.filter(v => (v.stock || 0) < 10 && (v.stock || 0) > 0).length;
    const outOfStockCount = vaccines.filter(v => (v.stock || 0) <= 0).length;

    const filteredVaccines = vaccines.filter(v => 
      v.name.toLowerCase().includes(vaccineSearch.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(vaccineSearch.toLowerCase())) ||
      (v.category && v.category.toLowerCase().includes(vaccineSearch.toLowerCase()))
    );

    const openAddVaccineModal = () => {
      setIsEditingVaccine(false);
      setEditingVaccineId(null);
      setVaccineForm({
        name: '',
        price: 350000,
        stock: 50,
        category: 'Wajib',
        description: '',
        benefits: 'Sertifikat Internasional (ICV), Perlindungan Medis Terstandarisasi'
      });
      setIsVaccineModalOpen(true);
    };

    const openEditVaccineModal = (v: any) => {
      setIsEditingVaccine(true);
      setEditingVaccineId(v.id);
      setVaccineForm({
        name: v.name,
        price: v.price,
        stock: v.stock,
        category: v.category || 'Wajib',
        description: v.description || '',
        benefits: Array.isArray(v.benefits) ? v.benefits.join(', ') : (v.benefits || 'Sertifikat Internasional (ICV)')
      });
      setIsVaccineModalOpen(true);
    };

    const handleSaveVaccine = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!vaccineForm.name.trim()) {
        alert('Nama vaksin wajib diisi!');
        return;
      }
      if (vaccineForm.price < 0) {
        alert('Harga vaksin tidak boleh bernilai negatif!');
        return;
      }

      setIsSavingVaccine(true);
      const benefitsArray = vaccineForm.benefits
        .split(',')
        .map(b => b.trim())
        .filter(Boolean);

      try {
        if (isEditingVaccine && editingVaccineId) {
          await updateVaccine(editingVaccineId, {
            name: vaccineForm.name.trim(),
            price: Number(vaccineForm.price),
            stock: Math.max(0, Number(vaccineForm.stock)),
            category: vaccineForm.category,
            description: vaccineForm.description.trim() || `Vaksinasi resmi ${vaccineForm.name.trim()} RSUD Al-Mulk`,
            benefits: benefitsArray.length > 0 ? benefitsArray : ['Sertifikat Internasional (ICV)']
          });
          setVaccineFeedbackMsg({ type: 'success', text: `Data vaksin "${vaccineForm.name}" dan stok berhasil diperbarui!` });
        } else {
          const newId = `vax_${Date.now()}`;
          await addVaccine({
            id: newId,
            name: vaccineForm.name.trim(),
            price: Number(vaccineForm.price),
            stock: Math.max(0, Number(vaccineForm.stock)),
            category: vaccineForm.category,
            description: vaccineForm.description.trim() || `Vaksinasi resmi ${vaccineForm.name.trim()} RSUD Al-Mulk`,
            benefits: benefitsArray.length > 0 ? benefitsArray : ['Sertifikat Internasional (ICV)']
          });
          setVaccineFeedbackMsg({ type: 'success', text: `Vaksin baru "${vaccineForm.name}" berhasil ditambahkan & terhubung!` });
        }
        setIsVaccineModalOpen(false);
        setTimeout(() => setVaccineFeedbackMsg(null), 4500);
      } catch (err: any) {
        setVaccineFeedbackMsg({ type: 'error', text: err.message || 'Gagal menyimpan data vaksin ke Supabase' });
      } finally {
        setIsSavingVaccine(false);
      }
    };

    const handleDeleteVaccine = async (id: string, name: string) => {
      if (confirm(`Hapus vaksin "${name}" dari sistem? Tindakan ini akan menghapus pilihan vaksin dari menu Booking dan memperbarui database Supabase.`)) {
        try {
          await deleteVaccine(id);
          setVaccineFeedbackMsg({ type: 'success', text: `Vaksin "${name}" telah berhasil dihapus dari sistem.` });
          setTimeout(() => setVaccineFeedbackMsg(null), 4000);
        } catch (err: any) {
          alert('Gagal menghapus vaksin: ' + err.message);
        }
      }
    };

    return (
      <div className="bg-slate-50 min-h-screen relative w-full h-full font-sans pb-16">
        {/* Sticky Header */}
        <div className="bg-white px-4 py-4 sticky top-0 z-40 shadow-xs border-b border-slate-200">
          <div className="max-w-3xl mx-auto flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentView('main')} 
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Kembali ke Menu Profil"
              >
                <ChevronLeft className="text-slate-700" />
              </button>
              <div>
                <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Syringe size={20} className="text-blue-600" />
                  Pengaturan Data & Stok Vaksin
                </h1>
                <p className="text-xs text-slate-500">Terintegrasi otomatis dengan Menu Booking & Database</p>
              </div>
            </div>

            <button 
              type="button"
              onClick={openAddVaccineModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Tambah Vaksin</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6">
          {/* Feedback message banner */}
          {vaccineFeedbackMsg && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-300 ${
              vaccineFeedbackMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-2.5">
                {vaccineFeedbackMsg.type === 'success' ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-rose-600 shrink-0" />
                )}
                <span>{vaccineFeedbackMsg.text}</span>
              </div>
              <button onClick={() => setVaccineFeedbackMsg(null)} className="opacity-70 hover:opacity-100 cursor-pointer ml-2">
                ✕
              </button>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Jenis</span>
              <p className="text-2xl font-black text-slate-800">{vaccines.length}</p>
              <span className="text-[10px] text-slate-500 font-medium">Vaksin Terdaftar</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Stok</span>
              <p className="text-2xl font-black text-blue-600">{totalStock}</p>
              <span className="text-[10px] text-slate-500 font-medium">Dosis Tersedia</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Stok Kritis</span>
              <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-500' : 'text-slate-700'}`}>{lowStockCount}</p>
              <span className="text-[10px] text-slate-500 font-medium">&lt; 10 Dosis</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Stok Habis</span>
              <p className={`text-2xl font-black ${outOfStockCount > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>{outOfStockCount}</p>
              <span className="text-[10px] text-slate-500 font-medium">{outOfStockCount > 0 ? 'Perlu Restok' : 'Semua Siap'}</span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input 
                type="text" 
                value={vaccineSearch}
                onChange={(e) => setVaccineSearch(e.target.value)}
                placeholder="Cari nama vaksin, kategori, atau indikasi..." 
                className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs"
              />
            </div>
            
            <button 
              type="button" 
              onClick={() => refreshAllCloudData()}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
              title="Sinkronkan dengan Database Cloud Supabase"
            >
              <RefreshCw size={14} className={isSupabaseOnline ? 'text-emerald-600' : 'text-slate-400'} />
              <span>Sinkron Data</span>
            </button>
          </div>

          {/* Realtime Integration Info Card */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="text-xs">
              <p className="font-bold text-blue-900 mb-0.5">Integrasi Otomatis Booking & Stok</p>
              <p className="text-blue-700 leading-relaxed">
                Setiap kali pasien mendaftar dan memilih vaksin di menu <strong>Booking</strong>, jumlah stok vaksin di bawah ini akan <strong>otomatis berkurang 1</strong> dan langsung diperbarui di database cloud Supabase secara realtime.
              </p>
            </div>
          </div>

          {/* List of Vaccines */}
          <div className="space-y-4">
            {filteredVaccines.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
                <Syringe size={36} className="text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">Tidak ada vaksin yang cocok</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Silakan ubah kata kunci pencarian atau klik tombol "Tambah Vaksin" untuk mendaftarkan jenis vaksin baru.
                </p>
                <button 
                  type="button" 
                  onClick={openAddVaccineModal}
                  className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm cursor-pointer"
                >
                  <Plus size={14} /> Tambah Vaksin Baru
                </button>
              </div>
            ) : (
              filteredVaccines.map((v) => {
                const isCritical = (v.stock || 0) < 10 && (v.stock || 0) > 0;
                const isOut = (v.stock || 0) <= 0;

                return (
                  <div 
                    key={v.id} 
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4 transition-all hover:border-blue-200"
                  >
                    {/* Top Row: Info and Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-800 text-base">{v.name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            v.category === 'Wajib' 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : v.category === 'Dianjurkan'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {v.category || 'Wajib'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{v.description}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditVaccineModal(v)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          title="Edit Data & Harga Vaksin"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVaccine(v.id, v.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Hapus Vaksin"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Price & Stock Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                          Harga Layanan Vaksin
                        </span>
                        <span className="text-lg font-black text-blue-700">
                          Rp{v.price.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                          Status Ketersediaan
                        </span>
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Stok Habis
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Kritis ({v.stock} Dosis)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Tersedia ({v.stock} Dosis)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Direct Stock Adjusters */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 flex items-center justify-between gap-2 border border-slate-100">
                      <span className="text-xs font-bold text-slate-600">Sesuaikan Jumlah Stok:</span>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          type="button"
                          onClick={() => updateVaccineStock(v.id, Math.max(0, (v.stock || 0) - 10))}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                          title="Kurangi 10 Dosis"
                        >
                          -10
                        </button>
                        <button 
                          type="button"
                          onClick={() => updateVaccineStock(v.id, Math.max(0, (v.stock || 0) - 1))}
                          className="w-8 h-8 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
                          title="Kurangi 1 Dosis"
                        >
                          -1
                        </button>

                        <input 
                          type="number" 
                          min={0}
                          value={v.stock} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            updateVaccineStock(v.id, Math.max(0, val));
                          }}
                          className="w-16 h-8 bg-white border border-slate-300 rounded-xl text-center font-black text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
                          title="Ketik langsung jumlah stok"
                        />

                        <button 
                          type="button"
                          onClick={() => updateVaccineStock(v.id, (v.stock || 0) + 1)}
                          className="w-8 h-8 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
                          title="Tambah 1 Dosis"
                        >
                          +1
                        </button>
                        <button 
                          type="button"
                          onClick={() => updateVaccineStock(v.id, (v.stock || 0) + 10)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
                          title="Tambah 10 Dosis"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Tambah / Edit Vaksin */}
        {isVaccineModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Syringe size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">
                      {isEditingVaccine ? 'Edit Data & Harga Vaksin' : 'Tambah Jenis Vaksin Baru'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Sinkronisasi otomatis ke Supabase Cloud</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsVaccineModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveVaccine} className="space-y-4">
                {/* Nama Vaksin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Vaksin <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={vaccineForm.name}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, name: e.target.value })}
                    placeholder="Contoh: Meningitis Menveo ACW135Y" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                {/* Harga & Stok Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Harga Vaksin (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input 
                        type="number" 
                        required
                        min={0}
                        step={5000}
                        value={vaccineForm.price}
                        onChange={(e) => setVaccineForm({ ...vaccineForm, price: Number(e.target.value) })}
                        placeholder="350000" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Jumlah Stok Tersedia <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      value={vaccineForm.stock}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, stock: Number(e.target.value) })}
                      placeholder="50" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Kategori Vaksin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kategori / Regulasi
                  </label>
                  <select 
                    value={vaccineForm.category}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Wajib">Wajib (Umroh / Haji / International Traveler)</option>
                    <option value="Dianjurkan">Dianjurkan (Pencegahan & Mobilitas)</option>
                    <option value="Rutin">Rutin / Perlindungan Lanjutan</option>
                  </select>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Deskripsi / Indikasi Vaksin
                  </label>
                  <textarea 
                    rows={3}
                    value={vaccineForm.description}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, description: e.target.value })}
                    placeholder="Contoh: Perlindungan terhadap infeksi bakteri meningokokus tipe A, C, W-135, dan Y. Wajib untuk jamaah Umroh." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed"
                  />
                </div>

                {/* Manfaat */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Manfaat / Sertifikat (Pisahkan dengan koma)
                  </label>
                  <input 
                    type="text" 
                    value={vaccineForm.benefits}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, benefits: e.target.value })}
                    placeholder="Sertifikat ICV Kuning, Perlindungan 2 Tahun, QR Verifikasi" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="pt-3 flex gap-2.5 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsVaccineModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingVaccine}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingVaccine ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Menyimpan ke Cloud...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>{isEditingVaccine ? 'Simpan Perubahan' : 'Tambahkan Vaksin'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEicvSettings = () => {
    return (
      <div className="bg-slate-50 min-h-screen pb-16 font-sans">
        {/* Header Bar */}
        <div className="bg-white px-6 py-4 sticky top-0 z-40 shadow-xs border-b border-slate-200">
          <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('main')} 
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight">
                Pengaturan Ketersediaan E-ICV
              </h1>
              <p className="text-xs text-slate-500">
                Kelola kuota blanko E-ICV & Buku Kuning realtime untuk Halaman Utama
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
          {/* Feedback Alert */}
          {eicvFeedback && (
            <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border transition-all ${
              eicvFeedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{eicvFeedback.text}</span>
              </div>
              <button onClick={() => setEicvFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Pratinjau Widget di Halaman Utama
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                Live Realtime
              </span>
            </div>

            <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30 shrink-0">
                    <Award size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                      Sertifikat Internasional
                    </span>
                    <h3 className="font-extrabold text-base text-white leading-tight">
                      Ketersediaan Blanko E-ICV
                    </h3>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${
                  inputEicvStatus === 'Tersedia' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
                    : inputEicvStatus === 'Terbatas' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' 
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                }`}>
                  ● {inputEicvStatus}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-3 relative z-10">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-slate-300 font-medium">Stok Blanko Buku Kuning:</span>
                  <span className="text-xl font-black text-emerald-300">{inputEicvStock} <span className="text-xs font-bold text-white">Buku</span></span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {inputEicvNote || 'Blanko Resmi E-ICV / Buku Kuning Siap Diterbitkan di RSUD Al-Mulk'}
                </p>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between relative z-10 pt-1">
                <span>UOBK RSUD Al-Mulk Kota Sukabumi</span>
                <span className="text-emerald-400 font-semibold">Terkoneksi Kemenkes RI</span>
              </div>
            </div>
          </div>

          {/* Form Pengaturan Ketersediaan E-ICV */}
          <form onSubmit={handleSaveEicv} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-emerald-600" />
              <span>Formulir Pengaturan Ketersediaan E-ICV</span>
            </h3>

            {/* Input Stok Blanko */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jumlah Stok Blanko E-ICV / Buku Kuning (Buku)
              </label>
              <div className="relative">
                <input 
                  type="number"
                  min="0"
                  value={inputEicvStock}
                  onChange={(e) => setInputEicvStock(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="Contoh: 150"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  Buku / Blanko
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Masukkan jumlah sisa blanko fisik buku kuning yang tersedia di klinik vaksinasi.
              </p>
            </div>

            {/* Pilihan Status Ketersediaan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Status Ketersediaan untuk Pasien
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: 'Tersedia', label: 'Tersedia (Ready)', color: 'border-emerald-500 text-emerald-700 bg-emerald-50/50' },
                  { value: 'Terbatas', label: 'Terbatas (< 30)', color: 'border-amber-500 text-amber-700 bg-amber-50/50' },
                  { value: 'Habis', label: 'Habis (Restock)', color: 'border-rose-500 text-rose-700 bg-rose-50/50' }
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setInputEicvStatus(s.value)}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      inputEicvStatus === s.value 
                        ? `${s.color} ring-2 ring-emerald-500/20 shadow-xs` 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Catatan / Pengumuman */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Catatan / Pengumuman Ketersediaan E-ICV
              </label>
              <textarea 
                rows={3}
                value={inputEicvNote}
                onChange={(e) => setInputEicvNote(e.target.value)}
                placeholder="Contoh: Blanko Resmi E-ICV / Buku Kuning Siap Diterbitkan di RSUD Al-Mulk untuk Jamaah Umroh & Pelaut..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white leading-relaxed transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Teks ini akan langsung muncul di widget informasi Halaman Utama bagi seluruh pengguna.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentView('main')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Kembali
              </button>

              <button
                type="submit"
                disabled={isSavingEicv}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingEicv ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menyimpan ke Cloud...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Simpan Ketersediaan E-ICV</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (currentView === 'edit_profile') return renderEditProfile();
  if (currentView === 'logo_settings') return renderLogoSettings();
  if (currentView === 'doc_logo_settings') return renderDocLogoSettings();
  if (currentView === 'support_data') return renderSupportData();
  if (currentView === 'app_settings') return renderAppSettings();
  if (currentView === 'vaccine_settings') return renderVaccineSettings();
  if (currentView === 'eicv_settings') return renderEicvSettings();

  return (
    <div className="bg-slate-50 min-h-screen relative w-full h-full font-sans pb-12">
      
      {/* Hidden file input for quick avatar upload */}
      <input 
        type="file" 
        accept="image/*" 
        ref={quickAvatarInputRef} 
        onChange={handleAvatarFileSelect} 
        className="hidden" 
      />

      <div className="bg-white px-6 py-4 sticky top-0 z-40 shadow-xs border-b border-slate-200 mb-6">
        <div className="max-w-3xl mx-auto w-full">
          <h1 className="font-bold text-xl text-slate-800">Profil & Pengaturan</h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-6 relative z-10 max-w-3xl mx-auto w-full">
        
        {/* User Card with Quick Avatar Upload */}
        <div className="rounded-3xl p-6 shadow-sm border border-slate-200 bg-white flex flex-col sm:flex-row items-center sm:items-start gap-5 relative overflow-hidden">
          
          {/* Avatar Container with Camera Badge & Hover Effect */}
          <div className="relative shrink-0 group">
            <div 
              onClick={() => !isUploadingAvatar && quickAvatarInputRef.current?.click()}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-md overflow-hidden border-2 border-white cursor-pointer relative"
              title="Klik untuk Upload / Ganti Foto Profil"
            >
              {currentAvatar ? (
                <img src={currentAvatar} alt="Foto Profil" className="w-full h-full object-cover" />
              ) : (
                (user?.name || user?.full_name || 'U').charAt(0).toUpperCase()
              )}

              {/* Uploading overlay or hover indicator */}
              {isUploadingAvatar ? (
                <div className="absolute inset-0 bg-blue-900/70 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                  <Loader2 size={22} className="animate-spin text-white" />
                  <span>Cloud...</span>
                </div>
              ) : (
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                  <Camera size={18} />
                  <span>Ubah</span>
                </div>
              )}
            </div>

            {/* Camera Badge Icon on bottom corner */}
            <button
              type="button"
              onClick={() => !isUploadingAvatar && quickAvatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white cursor-pointer active:scale-95 transition-all"
              title="Pilih dan Unggah Foto Profil"
            >
              {isUploadingAvatar ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="text-xl font-black text-slate-900 truncate">
              {user?.name || user?.full_name || 'Pengguna RSUD Al-Mulk'}
            </h2>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {user?.email || 'pasien@sivaksin.id'}
            </p>
            
            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-blue-200">
                {role === 'admin' ? 'Administrator' : 'Pasien Terdaftar'}
              </span>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg flex items-center gap-1 border ${
                isSupabaseOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <Cloud size={10} /> {isSupabaseOnline ? 'Supabase Terhubung' : 'Lokal'}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                onClick={() => !isUploadingAvatar && quickAvatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Sedang Menyimpan ke Supabase...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={13} />
                    <span>+ Tambah / Upload Foto Profil Baru</span>
                  </>
                )}
              </button>

              {currentAvatar && !isUploadingAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium hover:underline cursor-pointer"
                >
                  Hapus Foto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Success Alert on Main Profile */}
        {avatarSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{avatarSuccessMsg}</span>
            </div>
            <button onClick={() => setAvatarSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Menu Section */}
        <div className="space-y-3">
          <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider pl-2">
            Pengaturan & Layanan Vaksin
          </h3>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <MenuItem 
              icon={<Syringe className="text-emerald-600" />} 
              label="Pengaturan Data & Stok Vaksin" 
              sublabel="Atur nama vaksin, harga (Rp), stok tersedia, dan tambah jenis baru"
              onClick={() => setCurrentView('vaccine_settings')} 
            />
            <MenuItem 
              icon={<User className="text-blue-600" />} 
              label="Ubah Profil & Foto Pengguna" 
              sublabel="Atur foto profil avatar dan nama lengkap pengguna"
              onClick={() => setCurrentView('edit_profile')} 
            />
            <MenuItem 
              icon={<ImageIcon className="text-cyan-600" />} 
              label="Pengaturan Logo Aplikasi" 
              sublabel="Atur logo untuk Welcome page, Login page, Header, & Sidebar"
              onClick={() => setCurrentView('logo_settings')} 
            />
            <MenuItem 
              icon={<Award className="text-amber-500" />} 
              label="Pengaturan Logo Formulir (Kop Surat)" 
              sublabel="Atur Logo Pemkot Sukabumi (Kiri) & Logo RSUD Al-Mulk (Kanan) untuk Informed Consent"
              onClick={() => setCurrentView('doc_logo_settings')} 
            />
            <MenuItem 
              icon={<Award className="text-teal-600" />} 
              label="Pengaturan Ketersediaan E-ICV" 
              sublabel="Atur kuota blanko E-ICV & status ketersediaan realtime untuk Halaman Utama"
              onClick={() => setCurrentView('eicv_settings')} 
            />
            <MenuItem 
              icon={<FileText className="text-indigo-600" />} 
              label="Data Pendukung (KTP & Passport)" 
              sublabel="Kelola nomor identitas, alamat, dan berkas pasien"
              onClick={() => setCurrentView('support_data')} 
            />
            <MenuItem 
              icon={<Database className="text-emerald-600" />} 
              label="Integrasi & Database Supabase Cloud" 
              sublabel="Pengaturan sinkronisasi database cloud realtime"
              onClick={() => setIsSupabaseModalOpen(true)} 
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider pl-2">
            Bantuan & Kebijakan
          </h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <MenuItem 
              icon={<HelpCircle className="text-slate-500" />} 
              label="Pusat Bantuan & Layanan RSUD Al-Mulk" 
              sublabel="Panduan vaksinasi internasional dan kontak klinik"
            />
            <MenuItem 
              icon={<Shield className="text-slate-500" />} 
              label="Kebijakan Privasi & Keamanan Medis" 
              sublabel="Standar perlindungan data rekam medis pasien"
            />
          </div>
        </div>

        {role === 'admin' && (
          <button 
            type="button"
            onClick={() => navigate('/admin')}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Shield size={18} />
            <span>Masuk ke Panel Administrator</span>
          </button>
        )}

        <button 
          type="button"
          onClick={() => {
            if (logout) logout();
            navigate('/login');
          }}
          className="w-full bg-white text-rose-600 font-bold py-3.5 rounded-2xl shadow-xs border border-rose-200 flex items-center justify-center gap-2 cursor-pointer hover:bg-rose-50 transition-colors active:scale-95"
        >
          <LogOut size={18} />
          <span>Keluar dari Akun</span>
        </button>
      </div>

      <SupabaseConfigModal 
        isOpen={isSupabaseModalOpen} 
        onClose={() => setIsSupabaseModalOpen(false)} 
        onSaved={refreshAllCloudData} 
      />
    </div>
  );
}

function MenuItem({ 
  icon, 
  label, 
  sublabel,
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  sublabel?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{label}</p>
          {sublabel && <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{sublabel}</p>}
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-300 shrink-0 ml-2" />
    </div>
  );
}
