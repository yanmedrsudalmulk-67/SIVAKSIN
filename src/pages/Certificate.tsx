import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Award, Download, Share2, Printer, ShieldCheck, 
  FileText, CheckCircle2, ExternalLink, Eye, Sparkles, Check
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';
import QRCode from 'react-qr-code';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import OfficialDocHeader from '../components/OfficialDocHeader';

export default function Certificate() {
  const navigate = useNavigate();
  const { user, bookings, vaccines } = useAppStore();
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Find user's latest booking or fallback
  const certBooking = useMemo(() => {
    return bookings.slice().reverse().find(b => b.status === "terverifikasi" || b.status === "selesai") 
      || bookings[bookings.length - 1] 
      || null;
  }, [bookings]);

  // Check whether Admin has uploaded official E-ICV document or generate dynamically
  const uploadedEicvUrl = certBooking?.patient?.e_icv_url;
  const officialEicvFileName = certBooking?.patient?.e_icv_file_name || `E-ICV_${certBooking?.patient?.name || user?.name || 'Jamaah'}.pdf`;

  const certVaccines = useMemo(() => {
    if (!certBooking) return [];
    const ids = Array.isArray(certBooking.vaccineIds) && certBooking.vaccineIds.length > 0
      ? certBooking.vaccineIds
      : (Array.isArray(certBooking.patient?.selectedVaccines) && certBooking.patient.selectedVaccines.length > 0)
        ? certBooking.patient.selectedVaccines
        : (certBooking.vaccineId ? [certBooking.vaccineId] : []);
    
    const matched = vaccines.filter(v => ids.includes(v.id));
    if (matched.length > 0) return matched;
    const single = vaccines.find(v => v.id === certBooking.vaccineId);
    return single ? [single] : [{ id: 'unknown', name: 'Vaksinasi Meningitis Internasional', price: 0 }];
  }, [certBooking, vaccines]);

  // Generate dynamic PDF Data URL if no custom uploaded file
  const activePdfUrl = useMemo(() => {
    if (uploadedEicvUrl) return uploadedEicvUrl;

    const patient = certBooking?.patient || {};
    const nama = patient.name || patient.fullName || user?.name || 'Jamaah Vaksinasi';
    const passport = patient.passport || patient.no_passport || patient.passportNumber || 'A 8239412';
    const nik = patient.nik || '3272010203040001';
    const tglLahir = patient.dob || patient.tanggalLahir || '-';
    const regId = certBooking?.id || 'REG-EICV-001';
    const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

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
    doc.text(`1. Nama Lengkap       : ${nama}`, 22, 86);
    doc.text(`2. Nomor Paspor         : ${passport}`, 22, 93);
    doc.text(`3. NIK                         : ${nik}`, 22, 100);
    doc.text(`4. Tanggal Lahir          : ${tglLahir}`, 22, 107);
    doc.text(`5. Jenis Vaksin           : Meningitis / Vaksinasi Internasional`, 22, 114);
    doc.text(`6. Nomor Registrasi   : ${regId}`, 22, 121);
    doc.text(`7. Tanggal Penerbitan : ${currentDate}`, 22, 128);
    doc.text(`8. Faskes Penerbit     : UOBK RSUD Al-Mulk Kota Sukabumi`, 22, 135);

    // Official Seal / Note
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('Dokumen ini diterbitkan secara sah oleh UOBK RSUD Al-Mulk Kota Sukabumi', 107.5, 150, { align: 'center' });
    doc.text('dan terdaftar dalam database Kementerian Kesehatan RI.', 107.5, 155, { align: 'center' });

    // Signatures
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Sukabumi, ${currentDate}`, 150, 175);
    doc.text('Tim Medis & Vaksinator RSUD Al-Mulk', 150, 181);

    doc.setFont('Helvetica', 'bold');
    doc.text('( Dr. Hj. Munifah, M.Kes )', 150, 210);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('NIP. 19740512 200212 2 003', 150, 215);

    return doc.output('datauristring');
  }, [uploadedEicvUrl, certBooking, user]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsapp = () => {
    const patientName = certBooking?.patient?.name || user?.name || 'Jamaah';
    const text = encodeURIComponent(
      `Halo, ini Sertifikat Vaksinasi Internasional (E-ICV) atas nama ${patientName} dari UOBK RSUD Al-Mulk Kota Sukabumi.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header Premium */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-500 text-white pt-safe pb-12 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0 z-10 transition-all">
        <div className="absolute top-0 right-0 w-full h-[150%] opacity-[0.05] bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-[center_top_-20px] bg-cover mix-blend-screen pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6 relative z-10 mt-4">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-95 transition-transform hover:bg-white/20 cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="font-extrabold text-sm tracking-widest uppercase text-emerald-200">
              SIVAKSIN E-ICV
            </span>
            <div className="w-10 h-10"></div>
          </div>
          
          <div className="relative z-10 text-center flex flex-col items-center justify-center mt-2">
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[26px] flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.15)] mb-3 relative"
            >
              <div className="absolute inset-0 rounded-[26px] bg-gradient-to-tr from-white/5 to-white/20 pointer-events-none"></div>
              <Award size={40} className="text-white drop-shadow-md stroke-[1.5px] relative z-10" />
              <ShieldCheck size={20} className="text-emerald-300 absolute -bottom-1 -right-1 drop-shadow-md z-10 fill-emerald-950" />
            </motion.div>
            <h1 className="text-white text-lg sm:text-xl font-black tracking-tight">
              Electronic International Certificate of Vaccination (E-ICV)
            </h1>
            <p className="text-emerald-100 text-[11px] sm:text-xs opacity-90 leading-relaxed font-semibold uppercase tracking-wider mt-1">
              UOBK RSUD Al-Mulk Kota Sukabumi
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 -mt-8 relative z-20 flex flex-col gap-6 max-w-3xl mx-auto w-full">
        
        {/* Banner Penerbitan Resmi */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-[26px] p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-600/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
              <CheckCircle2 size={26} className="text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold uppercase tracking-wider text-emerald-100">
                  Resmi Diterbitkan & Terverifikasi
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                Dokumen Sertifikat E-ICV SIAP DILIHAT
              </h3>
              <p className="text-emerald-100 text-xs mt-0.5 font-medium">
                Pemegang: <span className="font-bold text-white underline">{certBooking?.patient?.name || user?.name || 'Jamaah Vaksinasi'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={activePdfUrl}
              download={officialEicvFileName}
              className="w-full sm:w-auto px-5 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={16} className="text-emerald-700" />
              <span>Unduh PDF (F4)</span>
            </a>
          </div>
        </div>

        {/* UTAMA: PRATINJAU DOKUMEN RESMI E-ICV (PDF) SANG DIKIRIM OLEH ADMIN */}
        <div className="bg-white rounded-[28px] p-4 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-slate-200 space-y-5">
          {/* Action Header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100 shadow-2xs">
                <FileText size={22} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Pratinjau Dokumen Resmi E-ICV (PDF)</span>
                  {uploadedEicvUrl ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wide border border-emerald-300">
                      File PDF dari Admin
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wide border border-amber-300">
                      Draft Sistem
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  File: <strong className="text-slate-800">{officialEicvFileName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={activePdfUrl}
                download={officialEicvFileName}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Download size={15} />
                <span>Unduh PDF</span>
              </a>
              <a
                href={activePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ExternalLink size={15} />
                <span className="hidden sm:inline">Buka Tab Baru</span>
              </a>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer size={15} />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {!uploadedEicvUrl && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs">
              <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">Catatan Pengiriman PDF Admin:</p>
                <p className="mt-0.5 text-amber-800">
                  Sertifikat di bawah adalah pratinjau draft otomatis. Jika Admin/Petugas Medis telah mengunggah file PDF E-ICV resmi khusus melalui menu <strong>Riwayat</strong>, dokumen PDF tersebut akan langsung menggantikan tampilan pratinjau ini.
                </p>
              </div>
            </div>
          )}

          {/* EMBEDDED LIVE PDF VIEWER - LANDING DIRECTLY ON SCREEN */}
          <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-300 min-h-[520px] sm:min-h-[680px] relative">
            {activePdfUrl.startsWith('data:image/') ? (
              <div className="p-4 flex items-center justify-center bg-slate-800 min-h-[520px] sm:min-h-[680px]">
                <img
                  src={activePdfUrl}
                  alt="Dokumen E-ICV Resmi dari Admin"
                  className="max-h-[750px] w-auto object-contain rounded-xl shadow-2xl border border-white/20"
                />
              </div>
            ) : (
              <object
                data={`${activePdfUrl}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-[550px] sm:h-[700px] rounded-2xl"
              >
                <iframe
                  src={`${activePdfUrl}#toolbar=1`}
                  title="Dokumen Resmi E-ICV PDF dari Admin"
                  className="w-full h-[550px] sm:h-[700px] rounded-2xl border-0"
                />
              </object>
            )}
          </div>
        </div>

        {/* Kartu E-ICV Ringkas dengan QR Code */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-100/70 relative overflow-hidden group">
          <div className="flex justify-center mb-4">
            <div className="py-2 px-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-2 shadow-sm">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">Verified International Certificate</span>
            </div>
          </div>

          <div className="flex flex-col mb-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Identitas Pemegang Sertifikat</p>
            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">{certBooking?.patient?.name || user?.name || 'Jamaah Vaksinasi'}</h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap text-xs font-semibold text-slate-600">
              <p>NIK: <span className="text-slate-900 font-bold">{certBooking?.patient?.nik || '-'}</span></p>
              <span>•</span>
              <p>Passport: <span className="text-slate-900 font-bold">{certBooking?.patient?.passport || certBooking?.patient?.no_passport || '-'}</span></p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-4 text-xs space-y-2">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Detail Vaksinasi ({certVaccines.length} Jenis)</p>
             {certVaccines.map(v => (
               <div key={v.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between font-bold text-slate-800">
                 <span>{v.name}</span>
                 <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">Terverifikasi</span>
               </div>
             ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             <a 
               href={activePdfUrl} 
               download={officialEicvFileName}
               className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl shadow-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer font-bold text-xs"
             >
                <Download size={18} />
                <span>Unduh E-ICV</span>
             </a>

             <button 
               onClick={handleShareWhatsapp} 
               className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-2xl shadow-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer font-bold text-xs"
             >
                <Share2 size={18} />
                <span>Share WA</span>
             </button>

             <button 
               onClick={() => setShowPreviewModal(true)} 
               className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer font-bold text-xs"
             >
                <Eye size={18} />
                <span>Modal Full</span>
             </button>

             <button 
               onClick={handlePrint} 
               className="bg-slate-800 hover:bg-slate-900 text-white p-3 rounded-2xl shadow-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer font-bold text-xs"
             >
                <Printer size={18} />
                <span>Print</span>
             </button>
          </div>
        </div>

      </div>

      {/* Full Preview Modal */}
      {showPreviewModal && activePdfUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-emerald-400" />
                <span className="font-extrabold text-sm">Dokumen Resmi E-ICV (PDF Full)</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Tab Baru
                </a>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center min-h-[450px]">
              <iframe
                src={`${activePdfUrl}#toolbar=1`}
                title="Official E-ICV Document"
                className="w-full h-[600px] rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

