import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchVaccinesFromSupabase,
  updateVaccineStockInSupabase,
  createVaccineInSupabase,
  updateVaccineInSupabase,
  deleteVaccineFromSupabase,
  fetchBookingsFromSupabase,
  createBookingInSupabase,
  updateBookingStatusInSupabase,
  deleteBookingInSupabase,
  fetchUserProfileFromSupabase,
  upsertUserProfileToSupabase,
  fetchAppSettingsFromSupabase,
  saveAppSettingsToSupabase
} from '../services/appDataSupabaseService';

type UserRole = 'guest' | 'user' | 'admin';

export interface Vaccine {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  benefits?: string[];
  category?: 'Wajib' | 'Dianjurkan' | 'Rutin';
  protectionDuration?: string;
}

export interface Booking {
  id: string;
  vaccineId: string;
  vaccineIds?: string[];
  date: string;
  time: string;
  status: 'menunggu' | 'terverifikasi' | 'selesai';
  patient: any;
  user_id?: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  bookingId?: string;
  type: 'document_revision' | 'document_verified' | 'booking_status' | 'general';
  title: string;
  message: string;
  documentType?: 'ktp' | 'passport' | 'all';
  adminName?: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

interface AppState {
  role: UserRole;
  user: any | null;
  bookings: Booking[];
  vaccines: Vaccine[];
  users: any[];
  notifications: AppNotification[];
  isSupabaseOnline: boolean;
  isLoadingCloud: boolean;
  appLogo: string | null;
  docLogoLeft: string | null;
  docLogoRight: string | null;
  heroBgImage: string | null;
  eicvStock: number;
  eicvStatus: string;
  eicvNote: string;
}

interface AppContextType extends AppState {
  setRole: (role: UserRole) => void;
  setUser: (user: any) => void;
  setAppLogo: (logo: string | null) => void | Promise<void>;
  setDocLogoLeft: (logo: string | null) => void | Promise<void>;
  setDocLogoRight: (logo: string | null) => void | Promise<void>;
  setHeroBgImage: (bg: string | null) => void | Promise<void>;
  updateEicvAvailability: (stock: number, status: string, note?: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: any) => Promise<void>;
  addBooking: (booking: Booking) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  addVaccine: (vaccine: Vaccine) => Promise<{ success: boolean; error?: string }>;
  updateVaccine: (id: string, updates: Partial<Vaccine>) => Promise<{ success: boolean; error?: string }>;
  deleteVaccine: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateVaccineStock: (id: string, newStock: number) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  registerUser: (userData: any) => Promise<{success: boolean, error?: string}>;
  loginUser: (userData: any) => Promise<boolean>;
  logout: () => void;
  refreshAllCloudData: () => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  requestDocumentRevision: (bookingId: string, docType: 'ktp' | 'passport' | 'all', instructionMessage: string) => Promise<void>;
  verifyDocumentApproval: (bookingId: string) => Promise<void>;
  reuploadDocument: (bookingId: string, docType: 'ktp' | 'passport', fileUrl: string, fileName?: string) => Promise<void>;
  uploadOfficialEicv: (bookingId: string, fileUrl: string, fileName?: string) => Promise<void>;
}

const defaultVaccines: Vaccine[] = [
  {
    id: 'v1',
    name: 'Meningitis Vaccine (Menveo)',
    price: 350000,
    stock: 120,
    description: 'Vaksin wajib untuk jamaah umroh dan haji.',
    benefits: ['Perlindungan dari radang selaput otak', 'Sertifikat Internasional (ICV)'],
  },
  {
    id: 'v2',
    name: 'Polio Vaccine (OPV/IPV)',
    price: 150000,
    stock: 50,
    description: 'Vaksin tambahan yang diwajibkan beberapa negara.',
    benefits: ['Mencegah kelumpuhan akibat virus polio', 'Aman untuk dewasa'],
  },
  {
    id: 'v3',
    name: 'Influenza Vaccine (Vaxigrip)',
    price: 300000,
    stock: 200,
    description: 'Perlindungan flu tahunan untuk perjalanan wisata atau tugas kerja.',
    benefits: ['Mencegah infeksi virus influenza A dan B', 'Mengurangi risiko komplikasi pernapasan'],
  }
];

const defaultUsers = [
  {
    id: 'u_demo_1',
    username: 'budi.santoso',
    name: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    password: 'password123',
    role: 'user',
    nik: '3272010101900001',
    no_hp: '08123456789'
  }
];

const createDefaultEicvPdf = (): string => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [215, 330] // F4 size
    });

    // Kop Surat
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PEMERINTAH KOTA SUKABUMI', 107.5, 18, { align: 'center' });
    doc.setFontSize(13);
    doc.text('DINAS KESEHATAN', 107.5, 24, { align: 'center' });
    doc.setFontSize(16);
    doc.text('UOBK RSUD AL-MULK', 107.5, 31, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Jl. Pelabuhan II KM 6, Lembursitu Kota Sukabumi Tlp.(0266) 6243088', 107.5, 37, { align: 'center' });
    doc.text('Kode Pos 43169 email: rsudalmulk@gmail.com', 107.5, 42, { align: 'center' });

    // Lines
    doc.setLineWidth(0.8);
    doc.line(15, 46, 200, 46);
    doc.setLineWidth(0.2);
    doc.line(15, 47.5, 200, 47.5);

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ELECTRONIC INTERNATIONAL CERTIFICATE OF VACCINATION (E-ICV)', 107.5, 57, { align: 'center' });
    doc.setFontSize(10);
    doc.text('SURAT KETERANGAN VAKSINASI / IMUNISASI INTERNASIONAL RESMI', 107.5, 63, { align: 'center' });

    // Box
    doc.setLineWidth(0.4);
    doc.rect(18, 70, 179, 72);

    // Patient Details
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('IDENTITAS PEMEGANG SERTIFIKAT:', 22, 78);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('1. Nama Lengkap       : Budi Santoso', 22, 86);
    doc.text('2. Nomor Paspor         : A9821321', 22, 93);
    doc.text('3. NIK                         : 3272010101900001', 22, 100);
    doc.text('4. Tanggal Lahir          : 15 Januari 1990', 22, 107);
    doc.text('5. Jenis Vaksin           : Meningitis / Vaksinasi Internasional', 22, 114);
    doc.text('6. Nomor Registrasi   : BK-RSAM01', 22, 121);
    doc.text('7. Tanggal Penerbitan : 10 Juni 2026', 22, 128);
    doc.text('8. Faskes Penerbit     : UOBK RSUD Al-Mulk Kota Sukabumi', 22, 135);

    // Official Seal / Note
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('Dokumen ini diterbitkan secara sah oleh UOBK RSUD Al-Mulk Kota Sukabumi', 107.5, 150, { align: 'center' });
    doc.text('dan terdaftar dalam database Kementerian Kesehatan RI.', 107.5, 155, { align: 'center' });

    // Signatures
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Sukabumi, 10 Juni 2026', 150, 175);
    doc.text('Tim Medis & Vaksinator RSUD Al-Mulk', 150, 181);

    doc.setFont('Helvetica', 'bold');
    doc.text('( Dr. Hj. Munifah, M.Kes )', 150, 210);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('NIP. 19740512 200212 2 003', 150, 215);

    return doc.output('datauristring');
  } catch (e) {
    return '';
  }
};

const defaultBookings: Booking[] = [
  {
    id: 'BK-RSAM01',
    vaccineId: 'v1',
    date: '2026-06-10',
    time: '09:00 WIB',
    status: 'selesai',
    patient: {
      name: 'Budi Santoso',
      nik: '3272010101900001',
      passport: 'A9821321',
      handphone: '08123456789',
      purpose: 'Umroh',
      selectedVaccine: 'v1',
      selectedDate: '2026-06-10',
      selectedTime: '09:00 WIB',
      e_icv_status: 'diterbitkan',
      e_icv_file_name: 'Sertifikat_E-ICV_Resmi_Budi_Santoso.pdf',
      e_icv_issued_at: '2026-06-10T10:00:00.000Z',
      e_icv_url: createDefaultEicvPdf()
    }
  }
];

const defaultNotifications: AppNotification[] = [
  {
    id: 'notif_welcome',
    title: 'Selamat Datang di SIVAKSIN RSUD Al-Mulk',
    message: 'Layanan pendaftaran vaksinasi internasional beroperasi setiap hari Senin - Jum\'at pukul 08.00 - 14.00 WIB. Pastikan dokumen KTP & Paspor Anda terbaca jelas.',
    type: 'general',
    createdAt: new Date().toISOString(),
    read: false,
  }
];

const loadStorage = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Ignore storage quota errors
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => loadStorage('sivaksin_role', 'guest'));
  const [user, setUserState] = useState<any | null>(() => loadStorage('sivaksin_user', null));
  const [bookings, setBookingsState] = useState<Booking[]>(() => loadStorage('sivaksin_bookings', defaultBookings));
  const [vaccines, setVaccinesState] = useState<Vaccine[]>(() => loadStorage('sivaksin_vaccines', defaultVaccines));
  const [users, setUsersState] = useState<any[]>(() => loadStorage('sivaksin_users', defaultUsers));
  const [notifications, setNotificationsState] = useState<AppNotification[]>(() => loadStorage('sivaksin_notifications', defaultNotifications));
  const [appLogo, setAppLogoState] = useState<string | null>(() => localStorage.getItem('app_logo') || null);
  const [docLogoLeft, setDocLogoLeftState] = useState<string | null>(() => localStorage.getItem('sivaksin_doc_logo_left') || null);
  const [docLogoRight, setDocLogoRightState] = useState<string | null>(() => localStorage.getItem('sivaksin_doc_logo_right') || null);
  const [heroBgImage, setHeroBgImageState] = useState<string | null>(() => localStorage.getItem('sivaksin_hero_bg_image') || null);
  const [eicvStock, setEicvStockState] = useState<number>(() => {
    const saved = localStorage.getItem('sivaksin_eicv_stock');
    return saved !== null ? parseInt(saved, 10) : 150;
  });
  const [eicvStatus, setEicvStatusState] = useState<string>(() => {
    return localStorage.getItem('sivaksin_eicv_status') || 'Tersedia';
  });
  const [eicvNote, setEicvNoteState] = useState<string>(() => {
    return localStorage.getItem('sivaksin_eicv_note') || 'Blanko Resmi E-ICV / Buku Kuning Siap Diterbitkan di RSUD Al-Mulk';
  });
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(isSupabaseConfigured);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [, setIsLoading] = useState(true);

  const setAppLogo = async (newLogo: string | null) => {
    setAppLogoState(newLogo);
    if (newLogo) {
      localStorage.setItem('app_logo', newLogo);
    } else {
      localStorage.removeItem('app_logo');
    }
    window.dispatchEvent(new Event('app_logo_updated'));

    if (isSupabaseConfigured) {
      try {
        await saveAppSettingsToSupabase({ app_logo: newLogo || '' });
      } catch (err: any) {
        console.warn('Sync app logo to Supabase error:', err);
      }
    }
  };

  const setDocLogoLeft = async (newLogo: string | null) => {
    setDocLogoLeftState(newLogo);
    if (newLogo) {
      localStorage.setItem('sivaksin_doc_logo_left', newLogo);
    } else {
      localStorage.removeItem('sivaksin_doc_logo_left');
    }
    window.dispatchEvent(new Event('sivaksin_doc_logos_updated'));

    if (isSupabaseConfigured) {
      try {
        await saveAppSettingsToSupabase({ doc_logo_left: newLogo || '' });
      } catch (err: any) {
        console.warn('Sync doc logo left to Supabase error:', err);
      }
    }
  };

  const setDocLogoRight = async (newLogo: string | null) => {
    setDocLogoRightState(newLogo);
    if (newLogo) {
      localStorage.setItem('sivaksin_doc_logo_right', newLogo);
    } else {
      localStorage.removeItem('sivaksin_doc_logo_right');
    }
    window.dispatchEvent(new Event('sivaksin_doc_logos_updated'));

    if (isSupabaseConfigured) {
      try {
        await saveAppSettingsToSupabase({ doc_logo_right: newLogo || '' });
      } catch (err: any) {
        console.warn('Sync doc logo right to Supabase error:', err);
      }
    }
  };

  const setHeroBgImage = async (newBg: string | null) => {
    setHeroBgImageState(newBg);
    if (newBg) {
      localStorage.setItem('sivaksin_hero_bg_image', newBg);
    } else {
      localStorage.removeItem('sivaksin_hero_bg_image');
    }
    window.dispatchEvent(new Event('sivaksin_hero_bg_updated'));

    if (isSupabaseConfigured) {
      try {
        await saveAppSettingsToSupabase({ hero_bg_image: newBg || '' });
      } catch (err: any) {
        console.warn('Sync hero bg image to Supabase error:', err);
      }
    }
  };

  const updateEicvAvailability = async (newStock: number, newStatus: string, newNote?: string) => {
    setEicvStockState(newStock);
    setEicvStatusState(newStatus);
    if (newNote !== undefined) setEicvNoteState(newNote);

    localStorage.setItem('sivaksin_eicv_stock', newStock.toString());
    localStorage.setItem('sivaksin_eicv_status', newStatus);
    if (newNote !== undefined) localStorage.setItem('sivaksin_eicv_note', newNote);

    window.dispatchEvent(new Event('sivaksin_eicv_updated'));

    if (isSupabaseConfigured) {
      try {
        await saveAppSettingsToSupabase({
          eicv_stock: newStock,
          eicv_status: newStatus,
          eicv_note: newNote
        });
      } catch (err: any) {
        console.warn('Sync eicv availability to Supabase error:', err);
      }
    }
    return { success: true };
  };

  useEffect(() => {
    const handleLogoUpdate = () => {
      setAppLogoState(localStorage.getItem('app_logo') || null);
    };
    const handleDocLogosUpdate = () => {
      setDocLogoLeftState(localStorage.getItem('sivaksin_doc_logo_left') || null);
      setDocLogoRightState(localStorage.getItem('sivaksin_doc_logo_right') || null);
    };
    const handleHeroBgUpdate = () => {
      setHeroBgImageState(localStorage.getItem('sivaksin_hero_bg_image') || null);
    };
    const handleEicvUpdate = () => {
      const s = localStorage.getItem('sivaksin_eicv_stock');
      if (s !== null) setEicvStockState(parseInt(s, 10));
      const st = localStorage.getItem('sivaksin_eicv_status');
      if (st) setEicvStatusState(st);
      const n = localStorage.getItem('sivaksin_eicv_note');
      if (n) setEicvNoteState(n);
    };

    window.addEventListener('app_logo_updated', handleLogoUpdate);
    window.addEventListener('sivaksin_doc_logos_updated', handleDocLogosUpdate);
    window.addEventListener('sivaksin_hero_bg_updated', handleHeroBgUpdate);
    window.addEventListener('sivaksin_eicv_updated', handleEicvUpdate);
    window.addEventListener('storage', handleLogoUpdate);
    window.addEventListener('storage', handleDocLogosUpdate);
    window.addEventListener('storage', handleHeroBgUpdate);
    window.addEventListener('storage', handleEicvUpdate);
    return () => {
      window.removeEventListener('app_logo_updated', handleLogoUpdate);
      window.removeEventListener('sivaksin_doc_logos_updated', handleDocLogosUpdate);
      window.removeEventListener('sivaksin_hero_bg_updated', handleHeroBgUpdate);
      window.removeEventListener('sivaksin_eicv_updated', handleEicvUpdate);
      window.removeEventListener('storage', handleLogoUpdate);
      window.removeEventListener('storage', handleDocLogosUpdate);
      window.removeEventListener('storage', handleHeroBgUpdate);
      window.removeEventListener('storage', handleEicvUpdate);
    };
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    saveStorage('sivaksin_role', newRole);
  };

  const setUser = (newUser: any) => {
    setUserState(newUser);
    saveStorage('sivaksin_user', newUser);
  };

  const setBookings = (newBookings: Booking[] | ((prev: Booking[]) => Booking[])) => {
    setBookingsState(prev => {
      const resolved = typeof newBookings === 'function' ? newBookings(prev) : newBookings;
      saveStorage('sivaksin_bookings', resolved);
      return resolved;
    });
  };

  const setVaccines = (newVaccines: Vaccine[] | ((prev: Vaccine[]) => Vaccine[])) => {
    setVaccinesState(prev => {
      const resolved = typeof newVaccines === 'function' ? newVaccines(prev) : newVaccines;
      saveStorage('sivaksin_vaccines', resolved);
      return resolved;
    });
  };

  const setUsers = (newUsers: any[] | ((prev: any[]) => any[])) => {
    setUsersState(prev => {
      const resolved = typeof newUsers === 'function' ? newUsers(prev) : newUsers;
      saveStorage('sivaksin_users', resolved);
      return resolved;
    });
  };

  const setNotifications = (newNotifs: AppNotification[] | ((prev: AppNotification[]) => AppNotification[])) => {
    setNotificationsState(prev => {
      const resolved = typeof newNotifs === 'function' ? newNotifs(prev) : newNotifs;
      saveStorage('sivaksin_notifications', resolved);
      return resolved;
    });
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newEntry: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newEntry, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const requestDocumentRevision = async (bookingId: string, docType: 'ktp' | 'passport' | 'all', instructionMessage: string) => {
    // 1. Update Booking status & notes
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updatedPatient = {
          ...(b.patient || {}),
          document_status: 'perlu_revisi',
          document_revision_type: docType,
          document_revision_note: instructionMessage,
          document_revision_date: new Date().toISOString()
        };
        const updatedBooking = { ...b, patient: updatedPatient };
        
        // Sync to Supabase in background
        if (isSupabaseConfigured) {
          supabase.from('bookings').update({ patient: updatedPatient }).eq('id', bookingId).then(
            () => {},
            (err) => console.warn('Sync booking document revision to Supabase note:', err)
          );
        }
        return updatedBooking;
      }
      return b;
    }));

    // Find the booking to get target user
    const currentBooking = bookings.find(b => b.id === bookingId);
    const targetUserId = currentBooking?.user_id || currentBooking?.patient?.nik || currentBooking?.patient?.email;

    // 2. Add high-priority revision notification
    const docLabel = docType === 'ktp' ? 'KTP' : docType === 'passport' ? 'Paspor' : 'KTP & Paspor';
    addNotification({
      userId: targetUserId,
      bookingId: bookingId,
      type: 'document_revision',
      title: `Perintah Revisi Dokumen (${docLabel})`,
      message: instructionMessage || `Mohon unggah ulang dokumen ${docLabel} Anda karena belum memenuhi standar verifikasi tim medis RSUD Al-Mulk.`,
      documentType: docType,
      adminName: 'Admin RSUD Al-Mulk',
      actionUrl: '/notifications'
    });
  };

  const verifyDocumentApproval = async (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updatedPatient = {
          ...(b.patient || {}),
          document_status: 'terverifikasi',
          document_verified_date: new Date().toISOString()
        };
        const updatedBooking: Booking = { ...b, status: 'terverifikasi', patient: updatedPatient };

        if (isSupabaseConfigured) {
          supabase.from('bookings').update({ 
            status: 'terverifikasi', 
            patient: updatedPatient 
          }).eq('id', bookingId).then(
            () => {},
            (err) => console.warn('Sync booking document approval to Supabase note:', err)
          );
        }
        return updatedBooking;
      }
      return b;
    }));

    const currentBooking = bookings.find(b => b.id === bookingId);
    const targetUserId = currentBooking?.user_id || currentBooking?.patient?.nik || currentBooking?.patient?.email;

    addNotification({
      userId: targetUserId,
      bookingId: bookingId,
      type: 'document_verified',
      title: 'Dokumen Persyaratan Terverifikasi',
      message: 'Dokumen KTP dan Paspor Anda telah diperiksa dan dinyatakan SESUAI oleh Tim Medis RSUD Al-Mulk. Silakan datang sesuai jadwal pendaftaran Anda.',
      adminName: 'Admin RSUD Al-Mulk',
      actionUrl: '/status'
    });
  };

  const reuploadDocument = async (bookingId: string, docType: 'ktp' | 'passport', fileUrl: string, fileName?: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updatedPatient = {
          ...(b.patient || {}),
          document_status: 'menunggu_verifikasi_ulang',
          [`${docType}_url`]: fileUrl,
          [`${docType}_file`]: fileName || `${docType}_revisi.jpg`,
          [`${docType}_file_name`]: fileName || `${docType}_revisi.jpg`,
          reupload_date: new Date().toISOString()
        };
        const updatedBooking = { ...b, patient: updatedPatient };

        if (isSupabaseConfigured) {
          supabase.from('bookings').update({ patient: updatedPatient }).eq('id', bookingId).then(
            () => {},
            (err) => console.warn('Sync reupload document to Supabase note:', err)
          );
        }
        return updatedBooking;
      }
      return b;
    }));

    // Update user profile too
    if (user) {
      updateUser({
        [`${docType}_url`]: fileUrl
      });
    }

    addNotification({
      userId: user?.id,
      bookingId: bookingId,
      type: 'general',
      title: 'Dokumen Berhasil Dikirim Ulang',
      message: `Dokumen ${docType.toUpperCase()} revisi Anda telah berhasil dikirim ke Admin RSUD Al-Mulk untuk verifikasi ulang.`,
      actionUrl: '/status'
    });
  };

  const uploadOfficialEicv = async (bookingId: string, fileUrl: string, fileName?: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updatedPatient = {
          ...(b.patient || {}),
          e_icv_url: fileUrl,
          e_icv_file_name: fileName || 'Sertifikat_E-ICV_Resmi.pdf',
          e_icv_status: 'diterbitkan',
          e_icv_issued_at: new Date().toISOString()
        };
        const updatedBooking: Booking = { 
          ...b, 
          status: 'selesai', 
          patient: updatedPatient 
        };

        if (isSupabaseConfigured) {
          supabase.from('bookings').update({ 
            status: 'selesai',
            patient: updatedPatient 
          }).eq('id', bookingId).then(
            () => {},
            (err) => console.warn('Sync E-ICV upload to Supabase note:', err)
          );
        }
        return updatedBooking;
      }
      return b;
    }));

    const currentBooking = bookings.find(b => b.id === bookingId);
    const targetUserId = currentBooking?.user_id || currentBooking?.patient?.nik || currentBooking?.patient?.email;

    addNotification({
      userId: targetUserId,
      bookingId: bookingId,
      type: 'general',
      title: 'Sertifikat E-ICV Resmi Telah Diterbitkan',
      message: `Sertifikat Vaksinasi Internasional (E-ICV) resmi Anda telah diterbitkan oleh Tim Medis UOBK RSUD Al-Mulk. Anda dapat melihat, mengunduh, atau mencetaknya melalui menu E-ICV.`,
      adminName: 'Admin RSUD Al-Mulk',
      actionUrl: '/certificate'
    });
  };

  // Sync All Data from Supabase Cloud
  const refreshAllCloudData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsSupabaseOnline(false);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch Vaccines from Supabase
      const { vaccines: cloudVaccines, error: vErr } = await fetchVaccinesFromSupabase();
      if (cloudVaccines && cloudVaccines.length > 0) {
        setVaccines(cloudVaccines);
        setIsSupabaseOnline(true);
      } else if (vErr) {
        setIsSupabaseOnline(false);
      }

      // 2. Fetch Bookings from Supabase
      const currentUser = loadStorage('sivaksin_user', null);
      const currentRole = loadStorage('sivaksin_role', 'guest');
      const { bookings: cloudBookings } = await fetchBookingsFromSupabase(
        currentUser?.id, 
        currentRole
      );
      if (cloudBookings) {
        setBookings(cloudBookings);
        setIsSupabaseOnline(true);
      }

      // 3. Fetch App Settings (Logo, info)
      const { settings } = await fetchAppSettingsFromSupabase();
      if (settings) {
        if (settings.app_logo !== undefined) {
          if (settings.app_logo) {
            localStorage.setItem('app_logo', settings.app_logo);
            setAppLogoState(settings.app_logo);
          } else {
            localStorage.removeItem('app_logo');
            setAppLogoState(null);
          }
        }
        if (settings.doc_logo_left !== undefined) {
          if (settings.doc_logo_left) {
            localStorage.setItem('sivaksin_doc_logo_left', settings.doc_logo_left);
            setDocLogoLeftState(settings.doc_logo_left);
          } else {
            localStorage.removeItem('sivaksin_doc_logo_left');
            setDocLogoLeftState(null);
          }
        }
        if (settings.doc_logo_right !== undefined) {
          if (settings.doc_logo_right) {
            localStorage.setItem('sivaksin_doc_logo_right', settings.doc_logo_right);
            setDocLogoRightState(settings.doc_logo_right);
          } else {
            localStorage.removeItem('sivaksin_doc_logo_right');
            setDocLogoRightState(null);
          }
        }
        if (settings.hero_bg_image !== undefined) {
          if (settings.hero_bg_image) {
            localStorage.setItem('sivaksin_hero_bg_image', settings.hero_bg_image);
            setHeroBgImageState(settings.hero_bg_image);
          } else {
            localStorage.removeItem('sivaksin_hero_bg_image');
            setHeroBgImageState(null);
          }
        }
        if (settings.eicv_stock !== undefined && settings.eicv_stock !== null) {
          localStorage.setItem('sivaksin_eicv_stock', settings.eicv_stock.toString());
          setEicvStockState(settings.eicv_stock);
        }
        if (settings.eicv_status) {
          localStorage.setItem('sivaksin_eicv_status', settings.eicv_status);
          setEicvStatusState(settings.eicv_status);
        }
        if (settings.eicv_note) {
          localStorage.setItem('sivaksin_eicv_note', settings.eicv_note);
          setEicvNoteState(settings.eicv_note);
        }
      }

      // 4. Fetch User Profile if logged in
      const effectiveUserId = currentUser?.id || (currentRole === 'admin' ? 'admin_rsam' : currentUser?.username);
      if (effectiveUserId) {
        const { profile } = await fetchUserProfileFromSupabase(effectiveUserId);
        if (profile) {
          setUser((prev: any) => {
            const merged = { ...prev, ...profile };
            if (profile.avatar_url) {
              localStorage.setItem('sivaksin_user_avatar', profile.avatar_url);
            }
            saveStorage('sivaksin_user', merged);
            return merged;
          });
          window.dispatchEvent(new Event('user_avatar_updated'));
        }
      }
    } catch (err) {
      console.warn('Sync cloud data notice:', err);
      setIsSupabaseOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Supabase Auth & Initial Synchronization
  useEffect(() => {
    refreshAllCloudData();

    if (!isSupabaseConfigured) return;

    try {
      supabase.auth.getSession()
        .then(({ data }) => {
          if (data?.session?.user) {
            fetchUserProfileFromSupabase(data.session.user.id).then(({ profile }) => {
              if (profile) {
                setUser((prev: any) => ({ ...prev, ...profile }));
                if (profile.avatar_url) {
                  localStorage.setItem('sivaksin_user_avatar', profile.avatar_url);
                }
                if (profile.role) setRole(profile.role as UserRole);
                window.dispatchEvent(new Event('user_avatar_updated'));
              }
            });
          }
        })
        .catch(() => {});

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchUserProfileFromSupabase(session.user.id).then(({ profile }) => {
            if (profile) {
              setUser((prev: any) => ({ ...prev, ...profile }));
              if (profile.avatar_url) {
                localStorage.setItem('sivaksin_user_avatar', profile.avatar_url);
              }
              if (profile.role) setRole(profile.role as UserRole);
              window.dispatchEvent(new Event('user_avatar_updated'));
            }
          });
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch (e) {
      // ignore
    }
  }, [refreshAllCloudData]);

  const registerUser = async (userData: any): Promise<{success: boolean, error?: string}> => {
    const newUser = {
      id: `u_${Date.now()}`,
      username: userData.username,
      name: userData.name || userData.username,
      email: userData.email,
      password: userData.password,
      role: 'user' as UserRole,
      nik: userData.nik || '',
      no_hp: userData.no_hp || '',
    };

    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: { data: { name: userData.username } }
        });

        if (authError) {
          console.warn('Supabase auth sign up error, saving locally:', authError.message);
          setUsers(prev => [...prev.filter(u => u.username !== userData.username && u.email !== userData.email), newUser]);
          setUser(newUser);
          setRole('user');
          return { success: true };
        }

        if (authData?.user) {
          try {
            await supabase.from('users').insert([{
              id: authData.user.id,
              username: userData.username,
              name: userData.username,
              email: userData.email,
              role: 'user'
            }]);
          } catch (dbErr) {
            console.warn('Error inserting user to DB table:', dbErr);
          }

          const registeredUser = {
            id: authData.user.id,
            username: userData.username,
            name: userData.username,
            email: userData.email,
            role: 'user' as UserRole
          };
          setUsers(prev => [...prev.filter(u => u.username !== userData.username), registeredUser]);
          setUser(registeredUser);
          setRole('user');
        }
        return { success: true };
      } catch (err: any) {
        console.warn('Supabase register connection error, saving locally:', err);
        setUsers(prev => [...prev.filter(u => u.username !== userData.username && u.email !== userData.email), newUser]);
        setUser(newUser);
        setRole('user');
        return { success: true };
      }
    } else {
      setUsers(prev => [...prev.filter(u => u.username !== userData.username && u.email !== userData.email), newUser]);
      setUser(newUser);
      setRole('user');
      return { success: true };
    }
  };

  const loginUser = async (userData: any): Promise<boolean> => {
    const rawIdentifier = (userData.username || userData.email || '').trim();
    const rawPassword = (userData.password || '').trim();

    // 1. Admin Login Hardcoded
    if (
      (rawIdentifier.toLowerCase() === 'vaksinrsam' || rawIdentifier.toLowerCase() === 'admin' || rawIdentifier.toLowerCase() === 'admin@rsudalmulk.id') &&
      rawPassword === '123456'
    ) {
      let adminUser: any = { 
        id: 'admin_rsam', 
        name: 'Admin RSUD Al-Mulk', 
        username: 'vaksinrsam', 
        email: 'admin@rsudalmulk.id', 
        role: 'admin' 
      };

      if (isSupabaseConfigured) {
        try {
          const { profile } = await fetchUserProfileFromSupabase('admin_rsam');
          if (profile) {
            adminUser = { ...adminUser, ...profile };
            if (profile.avatar_url) {
              localStorage.setItem('sivaksin_user_avatar', profile.avatar_url);
            }
          }
        } catch (e) {
          // ignore
        }
      }

      setUser(adminUser);
      setRole('admin');
      refreshAllCloudData();
      return true;
    }

    // 2. Check Supabase Auth if configured
    if (isSupabaseConfigured) {
      try {
        const loginEmail = rawIdentifier.includes('@') ? rawIdentifier : `${rawIdentifier}@example.com`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: rawPassword
        });

        if (!error && data?.user) {
          const { profile } = await fetchUserProfileFromSupabase(data.user.id);
          const finalProfile: any = profile || {
            id: data.user.id,
            email: data.user.email,
            username: rawIdentifier,
            name: rawIdentifier,
            role: 'user',
            avatar_url: ''
          };

          if (finalProfile.avatar_url) {
            localStorage.setItem('sivaksin_user_avatar', finalProfile.avatar_url);
          }

          setUser(finalProfile);
          const userRole = (finalProfile.role as UserRole) || 'user';
          setRole(userRole);
          refreshAllCloudData();
          return true;
        }

        // If Supabase returned error or email not found, check local users
        console.warn('Supabase login error, checking local fallback:', error?.message);
        const localMatch = users.find(
          u => (u.username?.toLowerCase() === rawIdentifier.toLowerCase() || u.email?.toLowerCase() === rawIdentifier.toLowerCase()) &&
               u.password === rawPassword
        );
        if (localMatch) {
          setUser(localMatch);
          setRole((localMatch.role as UserRole) || 'user');
          return true;
        }
        return false;
      } catch (err) {
        console.warn('Supabase login network exception, checking local fallback:', err);
        const localMatch = users.find(
          u => (u.username?.toLowerCase() === rawIdentifier.toLowerCase() || u.email?.toLowerCase() === rawIdentifier.toLowerCase()) &&
               u.password === rawPassword
        );
        if (localMatch) {
          setUser(localMatch);
          setRole((localMatch.role as UserRole) || 'user');
          return true;
        }
        return false;
      }
    } else {
      // 3. Mock User Login fallback
      const localMatch = users.find(
        u => (u.username?.toLowerCase() === rawIdentifier.toLowerCase() || u.email?.toLowerCase() === rawIdentifier.toLowerCase()) &&
             u.password === rawPassword
      );
      if (localMatch) {
        setUser(localMatch);
        setRole((localMatch.role as UserRole) || 'user');
        return true;
      }
      return false;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut caught:', e);
      }
    }
    setUser(null);
    setRole('guest');
    localStorage.removeItem('sivaksin_user');
    localStorage.removeItem('sivaksin_role');
  };

  const updateUser = async (updates: any) => {
    const targetId = user?.id || (role === 'admin' ? 'admin_rsam' : (user?.username ? `u_${user.username}` : `u_${Date.now()}`));
    
    const updatedUser = {
      ...(user || {}),
      id: targetId,
      ...updates
    };

    setUser(updatedUser);

    if (updates.avatar_url || updates.avatar) {
      const avUrl = updates.avatar_url || updates.avatar;
      localStorage.setItem('sivaksin_user_avatar', avUrl);
      window.dispatchEvent(new Event('user_avatar_updated'));
    }

    if (isSupabaseConfigured) {
      try {
        await upsertUserProfileToSupabase({
          id: targetId,
          username: updatedUser.username || updatedUser.name || 'user',
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role || role,
          nik: updatedUser.nik,
          no_hp: updatedUser.no_hp,
          alamat: updatedUser.alamat,
          no_passport: updatedUser.no_passport,
          avatar_url: updatedUser.avatar_url || updatedUser.avatar,
          ktp_url: updatedUser.ktp_url,
          passport_url: updatedUser.passport_url
        });
      } catch (err) {
        console.warn('Gagal sinkronisasi update profil ke Supabase:', err);
      }
    }
  };

  const addBooking = async (booking: Booking) => {
    const newBooking = { ...booking, user_id: user?.id };
    
    // Simpan langsung ke Supabase Cloud
    const { booking: savedCloudBooking } = await createBookingInSupabase(newBooking);
    const finalBooking = (savedCloudBooking as Booking) || newBooking;

    setBookings(prev => [finalBooking, ...prev.filter(b => b.id !== booking.id)]);

    // Kurangi stok semua vaksin yang dipilih secara otomatis dan sinkronisasi ke Supabase
    const targetVaccineIds: string[] = Array.isArray(booking.vaccineIds) && booking.vaccineIds.length > 0
      ? booking.vaccineIds
      : (booking.vaccineId ? [booking.vaccineId] : []);

    if (targetVaccineIds.length > 0) {
      setVaccines(prevVaccines => {
        let updatedVaccines = [...prevVaccines];
        targetVaccineIds.forEach(vId => {
          const target = updatedVaccines.find(v => v.id === vId);
          if (target) {
            const updatedStock = Math.max(0, (target.stock || 0) - 1);
            // Sync update stok ke Supabase Cloud di background
            updateVaccineStockInSupabase(vId, updatedStock).catch(err => {
              console.warn(`Gagal sync pengurangan stok vaksin (${vId}) ke Supabase:`, err);
            });
            updatedVaccines = updatedVaccines.map(v => v.id === vId ? { ...v, stock: updatedStock } : v);
          }
        });
        return updatedVaccines;
      });
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    await updateBookingStatusInSupabase(id, status);
  };

  const addVaccine = async (newVaccineData: Vaccine): Promise<{ success: boolean; error?: string }> => {
    try {
      setVaccines(prev => {
        const filtered = prev.filter(v => v.id !== newVaccineData.id);
        return [...filtered, newVaccineData];
      });

      const { success, error } = await createVaccineInSupabase({
        id: newVaccineData.id,
        name: newVaccineData.name,
        price: newVaccineData.price,
        stock: newVaccineData.stock,
        description: newVaccineData.description || '',
        benefits: newVaccineData.benefits || ['Sertifikat Internasional (ICV)']
      });

      if (!success && error) {
        console.warn('Note: create vaccine supabase error:', error);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menambahkan vaksin' };
    }
  };

  const updateVaccine = async (id: string, updates: Partial<Vaccine>): Promise<{ success: boolean; error?: string }> => {
    try {
      setVaccines(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));

      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.stock !== undefined) payload.stock = updates.stock;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.benefits !== undefined) payload.benefits = updates.benefits;

      const { success, error } = await updateVaccineInSupabase(id, payload);
      if (!success && error) {
        console.warn('Note: update vaccine supabase error:', error);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal mengubah data vaksin' };
    }
  };

  const deleteVaccine = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setVaccines(prev => prev.filter(v => v.id !== id));
      await deleteVaccineFromSupabase(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menghapus vaksin' };
    }
  };

  const updateVaccineStock = async (id: string, newStock: number) => {
    const validStock = Math.max(0, newStock);
    setVaccines(prev => prev.map(v => v.id === id ? { ...v, stock: validStock } : v));
    await updateVaccineStockInSupabase(id, validStock);
  };

  const deleteBooking = async (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    await deleteBookingInSupabase(id);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        user,
        bookings,
        vaccines,
        users,
        notifications,
        isSupabaseOnline,
        isLoadingCloud,
        appLogo,
        docLogoLeft,
        docLogoRight,
        heroBgImage,
        eicvStock,
        eicvStatus,
        eicvNote,
        setRole,
        setUser,
        setAppLogo,
        setDocLogoLeft,
        setDocLogoRight,
        setHeroBgImage,
        updateEicvAvailability,
        updateUser,
        addBooking,
        updateBookingStatus,
        addVaccine,
        updateVaccine,
        deleteVaccine,
        updateVaccineStock,
        deleteBooking,
        registerUser,
        loginUser,
        logout,
        refreshAllCloudData,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        requestDocumentRevision,
        verifyDocumentApproval,
        reuploadDocument,
        uploadOfficialEicv
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
}

