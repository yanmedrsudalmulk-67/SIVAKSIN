import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { FileText, Download, Share2, Clock, CheckCircle2, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function History() {
  const navigate = useNavigate();
  const { bookings, vaccines, deleteBooking, role } = useAppStore();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus booking ini?')) {
      await deleteBooking(id);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen relative w-full h-full">
      <div className="absolute top-20 -left-10 w-64 h-64 bg-brand-200/50 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="bg-white/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-40 shadow-sm border-b border-slate-100/50 mb-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="font-bold text-xl text-slate-800">Riwayat Vaksinasi</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Daftar pemesanan dan status pelaksanaan vaksinasi Anda</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-10 max-w-7xl mx-auto w-full relative z-10">
        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Belum Ada Riwayat</h3>
            <p className="text-sm text-slate-500">Anda belum melakukan booking vaksinasi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.slice().reverse().map((booking, i) => {
              const vaccine = vaccines.find(v => v.id === booking.vaccineId);
            const isCompleted = booking.status === 'selesai' || true; // Simulate some completed for UI demo if needed.
            // Let's just use the actual status, but mock one completed if we want to show certificate.

            // Wait, I will render completed design for 'selesai', otherwise upcoming.
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={booking.id} 
                className="glass-card rounded-2xl p-5 border border-slate-100 overflow-hidden relative transition-all hover:bg-white/80"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-xs font-semibold text-slate-500">ID: {booking.id}</div>
                      {role === 'admin' && (
                        <button onClick={(e) => handleDelete(booking.id, e)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800">{vaccine?.name}</h3>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    booking.status === 'menunggu' ? 'bg-orange-100 text-orange-600' :
                    booking.status === 'terverifikasi' ? 'bg-blue-100 text-blue-600' : 'bg-health-100 text-health-600'
                  }`}>
                    {booking.status}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium">Tanggal</span>
                    <span className="font-semibold text-slate-700">{booking.date}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium">Waktu</span>
                    <span className="font-semibold text-slate-700">{booking.time} WIB</span>
                  </div>
                </div>

                {booking.status === 'menunggu' && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5"><Clock size={14}/> Menunggu Pembayaran</span>
                    <button className="text-brand-600 font-bold hover:underline">Bayar</button>
                  </div>
                )}

                {/* Certificate Display if Completed or Verified */}
                {(booking.status === 'selesai' || booking.status === 'terverifikasi') && (
                  <div className="pt-4 mt-2 border-t border-dashed border-slate-200">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-health-100 text-health-500 flex items-center justify-center">
                           <CheckCircle2 size={16} />
                         </div>
                         <span className="text-sm font-semibold text-health-600">Sertifikat Tersedia</span>
                       </div>
                       <button onClick={() => navigate('/certificate')} className="px-4 py-2 bg-health-50 text-health-600 rounded-xl font-bold text-xs hover:bg-health-100 transition-colors">
                          Lihat E-ICV
                       </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
          </div>
        )}
      </div>
    </div>
  );
}
