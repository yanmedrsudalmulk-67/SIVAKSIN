import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type UserRole = 'guest' | 'user' | 'admin';

interface Vaccine {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  benefits: string[];
}

interface Booking {
  id: string;
  vaccineId: string;
  date: string;
  time: string;
  status: 'menunggu' | 'terverifikasi' | 'selesai';
  patient: any;
}

interface AppState {
  role: UserRole;
  user: any | null;
  bookings: Booking[];
  vaccines: Vaccine[];
  users: any[];
}

interface AppContextType extends AppState {
  setRole: (role: UserRole) => void;
  setUser: (user: any) => void;
  updateUser: (updates: any) => void;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  updateVaccineStock: (id: string, newStock: number) => void;
  registerUser: (userData: any) => void;
  loginUser: (userData: any) => Promise<boolean>;
  logout: () => void;
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('guest');
  const [user, setUser] = useState<any | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>(defaultVaccines);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Efek untuk Supabase Auth & Realtime
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Cek Sesi Aktif
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen pada perubahan Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setRole('guest');
        setIsLoading(false);
      }
    });

    // Load data awal
    fetchVaccines();

    return () => subscription.unsubscribe();
  }, []);

  // Fetch dari Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
      if (error) throw error;
      
      setUser(data);
      setRole(data.role as UserRole || 'user');
      fetchBookings(userId, data.role);
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVaccines = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('vaccines').select('*');
    if (!error && data) setVaccines(data as Vaccine[]);
  };

  const fetchBookings = async (userId: string, userRole: string) => {
    if (!isSupabaseConfigured) return;
    let query = supabase.from('bookings').select('*');
    if (userRole !== 'admin') query = query.eq('user_id', userId);
    
    const { data, error } = await query;
    if (!error && data) setBookings(data as Booking[]);
  };

  const registerUser = async (userData: any) => {
    if (isSupabaseConfigured) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email, // Pastikan form punya .email dan .password
        password: userData.password || 'password123', 
        options: { data: { name: userData.username } }
      });
      if (authError) {
        console.error('Register failed', authError);
        return;
      }
      
      // Simpan di profile table
      if (authData.user) {
        await supabase.from('users').insert([{
           id: authData.user.id,
           username: userData.username,
           name: userData.username,
           email: userData.email
        }]);
      }
    } else {
      setUsers(prev => [...prev, userData]);
      setUser({ username: userData.username, name: userData.username });
      setRole('user');
    }
  };

  const loginUser = async (userData: any): Promise<boolean> => {
    if (isSupabaseConfigured) {
       const { data, error } = await supabase.auth.signInWithPassword({
         email: userData.email || userData.username, // Supabase Auth needs email normally, handle mapping
         password: userData.password
       });
       if (error) {
         console.error('Login error', error);
         return false;
       }
       return true; // The onAuthStateChange will trigger fetchUserProfile
    } else {
       // Mock Login fallback
       if (userData.username === 'vaksinrsam' && userData.password === '123456') {
         setUser({ name: 'Admin RSAM', username: 'vaksinrsam' });
         setRole('admin');
         return true;
       }
       const existingUser = users.find(u => u.username === userData.username && u.password === userData.password);
       if (existingUser) {
         setUser({ name: existingUser.username, username: existingUser.username });
         setRole('user');
         return true;
       }
       return false;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setRole('guest');
  };

  const updateUser = async (updates: any) => {
    if (isSupabaseConfigured && user?.id) {
       await supabase.from('users').update(updates).eq('id', user.id);
       setUser((prev: any) => ({ ...prev, ...updates }));
    } else {
       setUser((prev: any) => ({ ...prev, ...updates }));
    }
  };

  const addBooking = async (booking: Booking) => {
    if (isSupabaseConfigured) {
       const newBooking = { ...booking, user_id: user?.id };
       const { error, data } = await supabase.from('bookings').insert([newBooking]).select().single();
       if (!error && data) {
          setBookings(prev => [...prev, data as Booking]);
       }
    } else {
       setBookings(prev => [...prev, booking]);
    }
  };
  
  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    if (isSupabaseConfigured) {
      await supabase.from('bookings').update({ status }).eq('id', id);
    }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const updateVaccineStock = async (id: string, newStock: number) => {
    if (isSupabaseConfigured) {
      await supabase.from('vaccines').update({ stock: newStock }).eq('id', id);
    }
    setVaccines(prev => prev.map(v => v.id === id ? { ...v, stock: newStock } : v));
  };

  return (
    <AppContext.Provider value={{ role, user, bookings, vaccines, users, setRole, setUser, updateUser, addBooking, updateBookingStatus, updateVaccineStock, registerUser, loginUser, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
}
