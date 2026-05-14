import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/AppContext';
import { User, Settings, Shield, LogOut, ChevronRight, HelpCircle, FileText, ChevronLeft, Camera, Save, Phone, MapPin, Hash, CheckCircle2, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, role, setRole, logout, updateUser } = useAppStore();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'main' | 'edit_profile' | 'support_data'>('main');

  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState<string>(user?.avatar || '');

  const [supportData, setSupportData] = useState({
    nik: user?.nik || '',
    alamat: user?.alamat || '',
    no_hp: user?.no_hp || '',
    no_passport: user?.no_passport || '',
    ktp_file: user?.ktp_file || null,
    passport_file: user?.passport_file || null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supportFileInputRef = useRef<HTMLInputElement>(null);
  const supportPassportFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const saveProfile = () => {
    if (updateUser) {
      updateUser({ name: editName, avatar: editAvatar });
    }
    setCurrentView('main');
  };

  const saveSupportData = () => {
    if (updateUser) {
      updateUser({ 
        nik: supportData.nik, 
        alamat: supportData.alamat, 
        no_hp: supportData.no_hp, 
        no_passport: supportData.no_passport,
        ktp_file: supportData.ktp_file,
        passport_file: supportData.passport_file
      });
    }
    setCurrentView('main');
  };

  const renderEditProfile = () => (
    <div className="bg-slate-50 min-h-screen relative w-full h-full flex flex-col">
      <div className="bg-white/80 backdrop-blur-xl px-4 py-4 sticky top-0 z-40 shadow-sm border-b border-slate-100 flex items-center gap-3">
        <button onClick={() => setCurrentView('main')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="text-slate-700" />
        </button>
        <h1 className="font-bold text-lg text-slate-800">Ubah Profil</h1>
      </div>

      <div className="px-6 py-8 flex-1 flex flex-col items-center">
        <div className="relative mb-8">
          <div className="w-28 h-28 bg-gradient-to-br from-brand-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-md overflow-hidden border-4 border-white">
            {editAvatar ? (
              <img src={editAvatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               user?.name?.charAt(0) || 'U'
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-brand-500 transition-colors"
          >
            <Camera size={18} />
          </button>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            className="hidden" 
          />
        </div>

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
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                placeholder="Nama lengkap Anda"
              />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 w-full">
          <button 
            onClick={saveProfile}
            className="w-full h-14 bg-brand-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/30"
          >
            <Save size={20} />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );

  const renderSupportData = () => (
    <div className="bg-slate-50 min-h-screen relative w-full h-full flex flex-col">
      <div className="bg-white/80 backdrop-blur-xl px-4 py-4 sticky top-0 z-40 shadow-sm border-b border-slate-100 flex items-center gap-3">
        <button onClick={() => setCurrentView('main')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="text-slate-700" />
        </button>
        <h1 className="font-bold text-lg text-slate-800">Data Pendukung</h1>
      </div>

      <div className="px-6 py-6 flex-1 flex flex-col overflow-y-auto">
        <div className="w-full space-y-4">
          
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
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-brand-500 transition-all"
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
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-brand-500 transition-all min-h-[100px]"
                placeholder="Alamat domisili"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 pl-1">Nomor HP</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Phone size={20} />
              </div>
              <input 
                type="tel" 
                value={supportData.no_hp}
                onChange={(e) => setSupportData({...supportData, no_hp: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-brand-500 transition-all"
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
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-brand-500 transition-all"
                placeholder="Nomor Passport"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 pl-1">Upload KTP</label>
            <label className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-500 bg-white/50 hover:bg-white transition-colors cursor-pointer relative overflow-hidden">
              <input type="file" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => {
                if(e.target.files && e.target.files[0]) {
                   setSupportData({...supportData, ktp_file: e.target.files[0].name });
                }
              }} />
              {supportData.ktp_file ? (
                  <div className="text-center">
                    <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-1"><CheckCircle2 size={16} /></div>
                    <span className="text-[11px] font-bold text-slate-700 block truncate max-w-[200px]">{supportData.ktp_file}</span>
                  </div>
              ) : (
                <>
                  <UploadCloud size={20} className="mb-1" />
                  <span className="text-[11px] font-medium text-center">Tap untuk upload<br/>(Max 2MB)</span>
                </>
              )}
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 pl-1">Upload Passport</label>
            <label className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-500 bg-white/50 hover:bg-white transition-colors cursor-pointer relative overflow-hidden">
              <input type="file" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => {
                if(e.target.files && e.target.files[0]) {
                   setSupportData({...supportData, passport_file: e.target.files[0].name });
                }
              }} />
              {supportData.passport_file ? (
                  <div className="text-center">
                    <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-1"><CheckCircle2 size={16} /></div>
                    <span className="text-[11px] font-bold text-slate-700 block truncate max-w-[200px]">{supportData.passport_file}</span>
                  </div>
              ) : (
                <>
                  <UploadCloud size={20} className="mb-1" />
                  <span className="text-[11px] font-medium text-center">Tap untuk upload<br/>(Max 2MB)</span>
                </>
              )}
            </label>
          </div>

        </div>

        <div className="mt-8 pb-8 pt-4 w-full">
          <button 
            onClick={saveSupportData}
            className="w-full h-14 bg-brand-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/30"
          >
            <Save size={20} />
            Simpan Data
          </button>
        </div>
      </div>
    </div>
  );

  if (currentView === 'edit_profile') return renderEditProfile();
  if (currentView === 'support_data') return renderSupportData();

  return (
    <div className="bg-slate-50 min-h-screen relative w-full h-full">
      <div className="absolute top-10 -right-10 w-48 h-48 bg-health-200/40 rounded-full blur-[60px] pointer-events-none"></div>
      
      <div className="bg-white/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-40 shadow-sm border-b border-slate-100/50 mb-4">
        <h1 className="font-bold text-xl text-slate-800">Profil Saya</h1>
      </div>

      <div className="px-6 pb-6 space-y-6 relative z-10">
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10">
            <User size={120} />
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md z-10 overflow-hidden border-2 border-white">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="z-10">
            <h2 className="text-xl font-bold text-slate-800">{user?.name || 'User'}</h2>
            <p className="text-sm text-slate-500">{user?.email || 'user@example.com'}</p>
            <div className="mt-1 inline-block px-2 py-0.5 bg-brand-100 text-brand-700 text-[10px] font-bold rounded uppercase tracking-wider">
              {role}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 pl-2">Pengaturan</h3>
          <div className="glass-card rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <MenuItem icon={<User />} label="Ubah Profil" onClick={() => setCurrentView('edit_profile')} />
            <div className="h-px bg-slate-100/50 mx-4" />
            <MenuItem icon={<FileText />} label="Data Pendukung (KTP/Passport)" onClick={() => setCurrentView('support_data')} />
            <div className="h-px bg-slate-100/50 mx-4" />
            <MenuItem icon={<Settings />} label="Pengaturan Aplikasi" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 pl-2">Bantuan & Info</h3>
          <div className="glass-card rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <MenuItem icon={<HelpCircle />} label="Pusat Bantuan (FAQ)" />
            <div className="h-px bg-slate-100/50 mx-4" />
            <MenuItem icon={<Shield />} label="Kebijakan Privasi" />
          </div>
        </div>

        {role === 'admin' && (
          <button 
            onClick={() => navigate('/admin')}
            className="w-full bg-brand-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-brand-800 flex items-center justify-center gap-2"
          >
            <Shield size={18} />
            Masuk ke Admin Panel
          </button>
        )}

        <button 
          onClick={() => {
            if (logout) logout();
            navigate('/');
          }}
          className="w-full bg-white text-red-500 font-bold py-4 rounded-xl shadow-sm border border-red-100 flex items-center justify-center gap-2 mt-8"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white active:bg-slate-50 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3 text-slate-700 font-medium text-sm">
        {React.cloneElement(icon as React.ReactElement, { size: 20, className: 'text-slate-400' })}
        {label}
      </div>
      <ChevronRight size={18} className="text-slate-300" />
    </div>
  );
}
