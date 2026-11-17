import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { 
  ChevronLeft, Printer, Download, FileText, CheckCircle2, 
  AlertCircle, ShieldCheck, ClipboardCheck, ArrowRight, 
  Check, Share2, Users, FileCheck2, Sparkles, ExternalLink,
  Settings
} from 'lucide-react';
import PermohonanVaksinDoc from '../components/documents/PermohonanVaksinDoc';
import InformedConsentDoc from '../components/documents/InformedConsentDoc';
import SkriningVaksinDoc from '../components/documents/SkriningVaksinDoc';

import html2pdf from 'html2pdf.js';
import { renderHtmlToCanvas } from '../utils/html2canvasHelper';
import { jsPDF } from 'jspdf';

type DocType = 'permohonan' | 'consent' | 'skrining';

export default function InformedConsent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBookingId = searchParams.get('id');
  const initialDocType = (searchParams.get('doc') as DocType) || 'permohonan';

  const { bookings, vaccines, updateBooking } = useAppStore();
  const [activeDoc, setActiveDoc] = useState<DocType>(initialDocType);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    initialBookingId || (bookings.length > 0 ? bookings[0].id : '')
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Selected Booking
  const selectedBooking = useMemo(() => {
    if (selectedBookingId) {
      const found = bookings.find(b => b.id === selectedBookingId);
      if (found) return found;
    }
    return bookings.length > 0 ? bookings[0] : null;
  }, [bookings, selectedBookingId]);

  // Combined vaccine names
  const vaccinesListString = useMemo(() => {
    if (!selectedBooking) return '';
    const ids: string[] = Array.isArray(selectedBooking.vaccineIds) && selectedBooking.vaccineIds.length > 0
      ? selectedBooking.vaccineIds
      : (Array.isArray(selectedBooking.patient?.selectedVaccines) && selectedBooking.patient.selectedVaccines.length > 0)
        ? selectedBooking.patient.selectedVaccines
        : (selectedBooking.vaccineId ? [selectedBooking.vaccineId] : []);

    const matched = vaccines.filter(v => ids.includes(v.id));
    if (matched.length > 0) {
      return matched.map(v => v.name).join(', ');
    }
    return (
      selectedBooking.patient?.selectedVaccineNames ||
      selectedBooking.patient?.selectedVaccine ||
      'Meningitis / Vaksinasi Internasional'
    );
  }, [selectedBooking, vaccines]);

  // Validation Check: check whether essential fields exist
  const validationResult = useMemo(() => {
    if (!selectedBooking) {
      return { isComplete: false, missingFields: ['Data Reservasi Tidak Ditemukan'] };
    }
    const p = selectedBooking.patient || {};
    const missing: string[] = [];

    if (!p.name && !p.fullName) missing.push('Nama Pasien');
    if (!p.nik) missing.push('NIK (KTP)');
    if (!p.passport && !p.no_passport) missing.push('Nomor Passport');
    if (!p.dob && !p.tanggalLahir) missing.push('Tanggal Lahir');
    if (!p.pob && !p.tempatLahir && !p.birthPlace) missing.push('Tempat Lahir');
    if (!p.gender && !p.jenisKelamin) missing.push('Jenis Kelamin');
    if (!p.address && !p.alamat) missing.push('Alamat');
    if (!p.handphone && !p.no_hp && !p.phone) missing.push('Nomor HP/WhatsApp');
    if (!p.targetCountry && !p.negaraTujuan) missing.push('Negara Tujuan');
    if (!p.departureDate && !p.tanggalKeberangkatan) missing.push('Tanggal Keberangkatan');

    return {
      isComplete: missing.length === 0,
      missingFields: missing
    };
  }, [selectedBooking]);

  const handlePrint = async () => {
    const container = document.getElementById('print-document-container');
    if (!container) return;
    
    // Find the actual document sheet (first child)
    const targetDoc = (container.firstElementChild as HTMLElement) || container;
    
    setIsGeneratingPdf(true);
    
    // Save original styles to restore after export
    const origBoxShadow = targetDoc.style.boxShadow;
    const origBorder = targetDoc.style.border;
    const origWidth = targetDoc.style.width;
    const origMaxWidth = targetDoc.style.maxWidth;
    const origPadding = targetDoc.style.padding;
    
    try {
      // Set exact standard F4 dimensions (215mm = 814px at 96 DPI)
      targetDoc.style.boxShadow = 'none';
      targetDoc.style.border = 'none';
      targetDoc.style.width = '814px';
      targetDoc.style.maxWidth = '814px';
      targetDoc.style.padding = '44px 48px';
      
      const docName = activeDoc === 'permohonan' ? 'Permohonan' 
                    : activeDoc === 'consent' ? 'Informed_Consent' 
                    : 'Skrining';
      const patientName = selectedBooking?.patient?.name?.replace(/ /g, '_') || 'Pasien';

      // Ultra-sharp rendering with color sanitization
      const canvas = await renderHtmlToCanvas(targetDoc, {
        scale: 3, // High quality 300+ DPI
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 814,
        windowWidth: 814,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Standard Indonesian Folio / F4 size: 215mm x 330mm
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [215, 330],
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate height proportional to 215mm width
      const imgWidth = pdfWidth; // 215mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Fit into F4 exactly matching on-screen look
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
      pdf.save(`Dokumen_${docName}_${patientName}_F4.pdf`);
    } catch (err) {
      console.error('Gagal membuat PDF:', err);
      // Fallback to basic print if helper fails
      window.print();
    } finally {
      // Always restore original styles
      targetDoc.style.boxShadow = origBoxShadow;
      targetDoc.style.border = origBorder;
      targetDoc.style.width = origWidth;
      targetDoc.style.maxWidth = origMaxWidth;
      targetDoc.style.padding = origPadding;
      setIsGeneratingPdf(false);
    }
  };

  const handleUpdateScreening = async (screeningData: any) => {
    if (!selectedBooking) return;
    try {
      const updatedPatient = {
        ...selectedBooking.patient,
        ...screeningData
      };
      await updateBooking(selectedBooking.id, {
        patient: updatedPatient
      });
      setSaveSuccessMsg('Data skrining berhasil disimpan.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Gagal update skrining:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] font-sans pb-16 print:bg-white print:p-0 print:m-0">
      {/* Non-print Controls Bar & Header */}
      <div className="print:hidden max-w-5xl mx-auto px-4 pt-2">
        {/* Top Action Header: Title + Download Icon Only in Top Right Corner */}
        <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-200/70 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 leading-tight">
              <span>INFORMED CONSENT</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold leading-tight mt-1">
              UOBK RSUD Al-Mulk Kota Sukabumi
            </p>
          </div>

          {/* Tombol Unduh Dokumen: Hanya Icon Saja di Pojok Kanan Atas */}
          <button
            onClick={handlePrint}
            disabled={isGeneratingPdf || !selectedBooking}
            title="Unduh / Cetak Dokumen PDF"
            className="w-11 h-11 rounded-2xl bg-white hover:bg-sky-50 active:scale-95 text-[#0284C7] border border-sky-100 shadow-md shadow-sky-600/10 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 group shrink-0"
          >
            {isGeneratingPdf ? (
              <div className="w-5 h-5 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download size={20} className="text-[#0284C7] group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Patient Selection & Document Tabs Controls */}
        <div className="space-y-4">
          {/* Booking Selector Card */}
          {bookings.length > 1 && (
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Data Pelaku Perjalanan
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {bookings.length} Pendaftaran Tersedia
                  </p>
                </div>
              </div>

              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full sm:w-auto text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0284C7] cursor-pointer"
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.patient?.name || 'Pasien'} ({b.patient?.nik || b.id}) - {b.date}
                  </option>
                ))}
              </select>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="bg-sky-50 border border-sky-200 text-sky-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check size={16} className="text-[#0284C7]" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* 3 Document Switcher Tabs (Sesuai Tema Biru Aplikasi) */}
          <div className="grid grid-cols-3 gap-2 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setActiveDoc('permohonan')}
              className={`py-3 px-2 rounded-xl font-bold text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center cursor-pointer ${
                activeDoc === 'permohonan'
                  ? 'bg-white text-[#0284C7] shadow-sm border border-sky-100'
                  : 'text-slate-600 hover:text-[#0284C7] hover:bg-white/60'
              }`}
            >
              <FileText size={16} className={activeDoc === 'permohonan' ? 'text-[#0284C7]' : ''} />
              <span className="leading-tight">1. Form Permohonan</span>
            </button>

            <button
              onClick={() => setActiveDoc('consent')}
              className={`py-3 px-2 rounded-xl font-bold text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center cursor-pointer ${
                activeDoc === 'consent'
                  ? 'bg-white text-[#0284C7] shadow-sm border border-sky-100'
                  : 'text-slate-600 hover:text-[#0284C7] hover:bg-white/60'
              }`}
            >
              <FileCheck2 size={16} className={activeDoc === 'consent' ? 'text-[#0284C7]' : ''} />
              <span className="leading-tight">2. Informed Consent</span>
            </button>

            <button
              onClick={() => setActiveDoc('skrining')}
              className={`py-3 px-2 rounded-xl font-bold text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center cursor-pointer ${
                activeDoc === 'skrining'
                  ? 'bg-white text-[#0284C7] shadow-sm border border-sky-100'
                  : 'text-slate-600 hover:text-[#0284C7] hover:bg-white/60'
              }`}
            >
              <ClipboardCheck size={16} className={activeDoc === 'skrining' ? 'text-[#0284C7]' : ''} />
              <span className="leading-tight">3. Form Skrining</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Viewer Container */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 mt-6">
        {!selectedBooking ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
            <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base mb-1">Belum Ada Data Booking</h3>
            <p className="text-xs text-slate-500 mb-6">
              Silakan lakukan pendaftaran atau booking vaksinasi terlebih dahulu agar data otomatis
              terintegrasi ke dalam formulir.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              Mulai Booking Vaksin
            </button>
          </div>
        ) : (
          <div id="print-document-container" className="relative">
            {/* Active Document Render */}
            {activeDoc === 'permohonan' && (
              <PermohonanVaksinDoc
                booking={selectedBooking}
                vaccinesList={vaccinesListString}
              />
            )}

            {activeDoc === 'consent' && (
              <InformedConsentDoc
                booking={selectedBooking}
                vaccinesList={vaccinesListString}
              />
            )}

            {activeDoc === 'skrining' && (
              <SkriningVaksinDoc
                booking={selectedBooking}
                onUpdateScreening={handleUpdateScreening}
                canEdit={true}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
