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

  const handlePrint = () => {
    window.print();
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
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white pt-safe pb-6 px-4 shadow-md sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft size={22} />
              </button>
              <div>
                <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <span>INFORMED CONSENT</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Dokumen Resmi
                  </span>
                </h1>
                <p className="text-xs text-slate-300 font-medium">
                  UOBK RSUD Al-Mulk Kota Sukabumi • Standar A4
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/profile?view=doc_logo_settings')}
                className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
                title="Atur Logo Pemkot Sukabumi & Logo RSUD Al-Mulk pada Kop Surat"
              >
                <Settings size={15} className="text-amber-300" />
                <span className="hidden sm:inline">Pengaturan Logo Kop</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <Printer size={16} />
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
                    Pilih Data Pasien
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

          {/* Validation Notice Banner */}
          {!validationResult.isComplete ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-xs">
              <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-900">
                  Perhatian: Data Pasien Belum Lengkap ({validationResult.missingFields.length} field)
                </p>
                <p className="text-amber-700 mt-0.5">
                  Field berikut belum terisi pada data pendaftaran:{' '}
                  <span className="font-semibold">{validationResult.missingFields.join(', ')}</span>.
                </p>
                <button
                  onClick={() => navigate('/register')}
                  className="mt-2 text-xs font-bold text-amber-900 underline flex items-center gap-1 hover:text-amber-950 cursor-pointer"
                >
                  Lengkapi data pada menu Booking <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 flex items-center justify-between text-emerald-900 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800">
                  Data Pasien Terintegrasi & Siap Dicetak (100% Valid)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 hidden sm:inline">
                Sumber: Supabase Booking ID #{selectedBooking?.id.substring(0, 8)}
              </span>
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
          <div className="relative">
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
                Siap Dicetak (A4)
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
