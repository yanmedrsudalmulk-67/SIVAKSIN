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
    const element = document.getElementById('print-document-container');
    if (!element) return;
    
    setIsGeneratingPdf(true);
    
    try {
      // Add print mode class temporarily
      const children = Array.from(element.children);
      children.forEach((child) => child.classList.add('print-container'));
      
      const docName = activeDoc === 'permohonan' ? 'Permohonan' 
                    : activeDoc === 'consent' ? 'Informed_Consent' 
                    : 'Skrining';
      const patientName = selectedBooking?.patient?.name?.replace(/ /g, '_') || 'Pasien';

      // Use our robust helper which has color sanitization built-in
      const canvas = await renderHtmlToCanvas(element, {
        scale: 3, // High quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 850, // Narrow window to match our document max-width
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [215, 330], // F4 / Folio Size
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit exactly into F4
      // We want to fill the width of the PDF
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Center the image if it's shorter than the page, or just place it at top
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Dokumen_${docName}_${patientName}.pdf`);

      // Clean up the temporary class
      children.forEach((child) => child.classList.remove('print-container'));
    } catch (err) {
      console.error('Gagal membuat PDF:', err);
      // Fallback to basic print if helper fails
      window.print();
    } finally {
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
    <div className="min-h-screen bg-slate-100 font-sans pb-24 print:bg-white print:p-0 print:m-0">
      {/* Non-print Controls Bar & Header */}
      <div className="print:hidden">
        {/* Top App Bar */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white py-4 sm:py-5 px-4 sm:px-6 shadow-md sticky top-0 z-30 flex items-center min-h-[72px]">
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <ChevronLeft size={22} />
              </button>
              <div className="flex flex-col justify-center">
                <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 leading-tight">
                  <span>INFORMED CONSENT</span>
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight mt-0.5">
                  UOBK RSUD Al-Mulk Kota Sukabumi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Cetak Dokumen</span>
                <span className="sm:hidden">Cetak</span>
              </button>
            </div>
          </div>
        </div>

        {/* Patient Selection & Document Tabs Controls */}
        <div className="max-w-5xl mx-auto px-4 mt-4 space-y-4">
          {/* Booking Selector Card */}
          {bookings.length > 1 && (
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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
                className="w-full sm:w-auto text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
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
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check size={16} className="text-blue-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* 3 Document Switcher Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-200/70 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveDoc('permohonan')}
              className={`py-3 px-2 rounded-xl font-bold text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center cursor-pointer ${
                activeDoc === 'permohonan'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileText size={16} className={activeDoc === 'permohonan' ? 'text-emerald-600' : ''} />
              <span className="leading-tight">1. Form Permohonan</span>
            </button>

            <button
              onClick={() => setActiveDoc('consent')}
              className={`py-3 px-2 rounded-xl font-bold text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center cursor-pointer ${
                activeDoc === 'consent'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileCheck2 size={16} className={activeDoc === 'consent' ? 'text-emerald-600' : ''} />
              <span className="leading-tight">2. Informed Consent</span>
            </button>

            <button
              onClick={() => setActiveDoc('skrining')}
              className={`py-3 px-2 rounded-xl font-bold text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center cursor-pointer ${
                activeDoc === 'skrining'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ClipboardCheck size={16} className={activeDoc === 'skrining' ? 'text-emerald-600' : ''} />
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
              className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all cursor-pointer"
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

      {/* Floating Print / Save Action Bar on Mobile */}
      {selectedBooking && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 print:hidden">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-3">
            <div className="text-xs pl-2 min-w-0">
              <p className="font-bold text-slate-100 truncate">
                {activeDoc === 'permohonan'
                  ? 'Formulir Permohonan'
                  : activeDoc === 'consent'
                  ? 'Informed Consent'
                  : 'Form Skrining Medis'}
              </p>
              <p className="text-[11px] text-emerald-400 font-medium">
                Siap Dicetak (F4/Folio)
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                <Printer size={15} />
                <span>Cetak / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
