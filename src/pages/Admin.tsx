import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Users, Syringe, Calendar, Settings, ArrowLeft, Download, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { bookings, vaccines, updateBookingStatus, updateVaccineStock } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'stock'>('bookings');

  // Stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'menunggu').length;
  const verifiedBookings = bookings.filter(b => b.status === 'terverifikasi').length;

  return (
    <div className="bg-slate-50 min-h-screen pb-safe">
      <div className="bg-brand-900 text-white px-6 pt-12 pb-6 sticky top-0 z-40 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/profile')} className="p-2 hover:bg-white/10 rounded-xl -ml-2 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-lg">Admin Panel SIVAKSIN</h1>
          <div className="w-10"></div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-md">
            <div className="text-brand-100 text-xs mb-1">Total Booking</div>
            <div className="text-2xl font-bold">{totalBookings}</div>
          </div>
          <div className="flex-1 bg-health-500/20 rounded-2xl p-4 border border-health-500/30 backdrop-blur-md text-health-100">
            <div className="text-health-200 text-xs mb-1">Terverifikasi</div>
            <div className="text-2xl font-bold">{verifiedBookings}</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex bg-slate-200/50 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'bookings' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500'}`}
          >
            Kelola Booking
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'stock' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500'}`}
          >
            Stok Vaksin
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800">Daftar Reservasi Terbaru</h3>
              <button className="text-xs font-semibold text-brand-600 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg"><Download size={14} /> Export</button>
            </div>
            
            {bookings.length === 0 && <p className="text-center text-slate-500 py-10 text-sm">Belum ada data booking.</p>}
            
            {bookings.slice().reverse().map(b => (
              <div key={b.id} className="glass-card p-4 rounded-2xl border border-slate-100 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-800">{b.patient?.name}</div>
                    <div className="text-xs text-slate-500">{b.id} • {b.date} {b.time}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${b.status === 'menunggu' ? 'bg-orange-100 text-orange-600' : b.status === 'terverifikasi' ? 'bg-blue-100 text-blue-600' : 'bg-health-100 text-health-600'}`}>
                    {b.status}
                  </div>
                </div>

                {b.status === 'menunggu' && (
                  <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100/50">
                    <button 
                      onClick={() => updateBookingStatus(b.id, 'terverifikasi')}
                      className="flex-1 bg-brand-50 text-brand-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-brand-100 transition-colors"
                    >
                      <CheckCircle size={14} /> Verifikasi
                    </button>
                  </div>
                )}
                {b.status === 'terverifikasi' && (
                  <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100/50">
                    <button 
                      onClick={() => updateBookingStatus(b.id, 'selesai')}
                      className="flex-1 bg-health-50 text-health-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-health-100 transition-colors"
                    >
                      <CheckCircle size={14} /> Tandai Selesai
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 mb-2">Manajemen Stok & Harga</h3>
            {vaccines.map(v => (
              <div key={v.id} className="glass-card p-4 rounded-2xl border border-slate-100">
                <div className="font-bold text-slate-800 mb-1">{v.name}</div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Harga: Rp{v.price.toLocaleString('id-ID')}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-100 ${v.stock < 50 ? 'text-orange-500' : 'text-health-500'}`}>Stok: {v.stock}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button onClick={() => updateVaccineStock(v.id, Math.max(0, v.stock - 10))} className="w-10 h-10 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200">-10</button>
                  <input type="number" value={v.stock} readOnly className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 text-center font-bold text-slate-700" />
                  <button onClick={() => updateVaccineStock(v.id, v.stock + 10)} className="w-10 h-10 bg-brand-50 rounded-xl font-bold text-brand-600 hover:bg-brand-100">+10</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
