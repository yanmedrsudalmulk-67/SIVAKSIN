import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchVaccinesFromSupabase,
  updateVaccineStockInSupabase,
  fetchBookingsFromSupabase,
  createBookingInSupabase,
  updateBookingStatusInSupabase,
  deleteBookingInSupabase,
  fetchUserProfileFromSupabase,
  upsertUserProfileToSupabase,
  fetchAppSettingsFromSupabase
} from '../services/appDataSupabaseService';

type UserRole = 'guest' | 'user' | 'admin';

export interface Vaccine {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  benefits: string[];
}

export interface Booking {
  id: string;
  vaccineId: string;
  date: string;
  time: string;
  status: 'menunggu' | 'terverifikasi' | 'selesai';
  patient: any;
  user_id?: string;
}

interface AppState {
  role: UserRole;
  user: any | null;
  bookings: Booking[];
  vaccines: Vaccine[];
  users: any[];
  isSupabaseOnline: boolean;
  appLogo: string | null;
}

interface AppContextType extends AppState {
  setRole: (role: UserRole) => void;
  setUser: (user: any) => void;
  setAppLogo: (logo: string | null) => void;
  updateUser: (updates: any) => Promise<void>;
  addBooking: (booking: Booking) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  updateVaccineStock: (id: string, newStock: number) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  registerUser: (userData: any) => Promise<{success: boolean, error?: string}>;
  loginUser: (userData: any) => Promise<boolean>;
  logout: () => void;
  refreshAllCloudData: () => Promise<void>;
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

const defaultBookings: Booking[] = [
  {
    id: 'BK-RSAM01',
    vaccineId: 'v1',
    date: '2026-06-10',
    time: '09:00 WIB',
    status: 'terverifikasi',
    patient: {
      name: 'Budi Santoso',
      nik: '3272010101900001',
      passport: 'A9821321',
      handphone: '08123456789',
      purpose: 'Umroh',
      selectedVaccine: 'v1',
      selectedDate: '2026-06-10',
      selectedTime: '09:00 WIB'
    }
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
  const [appLogo, setAppLogoState] = useState<string | null>(() => localStorage.getItem('app_logo') || null);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(isSupabaseConfigured);
  const [, setIsLoading] = useState(true);

  const setAppLogo = (newLogo: string | null) => {
    setAppLogoState(newLogo);
    if (newLogo) {
      localStorage.setItem('app_logo', newLogo);
    } else {
      localStorage.removeItem('app_logo');
    }
    window.dispatchEvent(new Event('app_logo_updated'));
  };

  useEffect(() => {
    const handleLogoUpdate = () => {
      setAppLogoState(localStorage.getItem('app_logo') || null);
    };
    window.addEventListener('app_logo_updated', handleLogoUpdate);
    window.addEventListener('storage', handleLogoUpdate);
    return () => {
      window.removeEventListener('app_logo_updated', handleLogoUpdate);
      window.removeEventListener('storage', handleLogoUpdate);
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
      if (settings?.app_logo) {
        localStorage.setItem('app_logo', settings.app_logo);
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
    const { booking: savedCloudBooking, error } = await createBookingInSupabase(newBooking);
    const finalBooking = (savedCloudBooking as Booking) || newBooking;

    setBookings(prev => [finalBooking, ...prev.filter(b => b.id !== booking.id)]);
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    await updateBookingStatusInSupabase(id, status);
  };

  const updateVaccineStock = async (id: string, newStock: number) => {
    setVaccines(prev => prev.map(v => v.id === id ? { ...v, stock: newStock } : v));
    await updateVaccineStockInSupabase(id, newStock);
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
        isSupabaseOnline,
        appLogo,
        setRole,
        setUser,
        setAppLogo,
        updateUser,
        addBooking,
        updateBookingStatus,
        updateVaccineStock,
        deleteBooking,
        registerUser,
        loginUser,
        logout,
        refreshAllCloudData
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

