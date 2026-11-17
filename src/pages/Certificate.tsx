import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { jsPDF } from 'jspdf';
import {
  ChevronLeft,
  Award,
  Download,
  ExternalLink,
  FileText,
  ShieldCheck,
  Clock,
  Search,
  CheckCircle2,
  Globe,
  Calendar,
  UserCheck,
  Building2,
  Printer,
  Sparkles,
  BookOpenCheck,
} from 'lucide-react';
import { useAppStore } from '../store/AppContext';
import {
  getVisibleCertificateBookings,
  getCertificateStats,
  isCertificateIssued,
} from '../utils/certificateHelper';

export default function Certificate() {
  const navigate = useNavigate();
  const { user, role, bookings, vaccines, eicvStock, eicvStatus } = useAppStore();
  const [selected, setSelected] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const scopedBookings = useMemo(
    () => getVisibleCertificateBookings(bookings, user, role, ''),
    [bookings, user, role]
  );

  const visibleBookings = useMemo(
    () => getVisibleCertificateBookings(bookings, user, role, searchQuery),
    [bookings, user, role, searchQuery]
  );

  const stats = useMemo(() => getCertificateStats(scopedBookings), [scopedBookings]);

  const booking =
    visibleBookings.find((b) => b.id === selected) ||
    visibleBookings.find((b) => isCertificateIssued(b)) ||
    visibleBookings[0] ||
    null;

  const pdf = booking?.patient?.e_icv_url;
  const issued = isCertificateIssued(booking);
  const patientName =
    booking?.patient?.name || booking?.patient?.fullName || user?.name || 'Peserta Vaksinasi';
  const passportNo = booking?.patient?.passport || booking?.patient?.no_passport || '—';
  const nikNo = booking?.patient?.nik || '—';
  const targetCountry =
    booking?.patient?.targetCountry || booking?.patient?.negaraTujuan || booking?.patient?.purpose || 'Arab Saudi';
  const doctorName = booking?.doctor_name || 'dr. M. Arifin Ramadhani';
  const fileName =
    booking?.patient?.e_icv_file_name ||
    `Sertifikat_E-ICV_${patientName.replace(/\s+/g, '_')}.pdf`;

  const vaccineNames = useMemo(() => {
    if (!booking) return '—';
    const ids: string[] =
      Array.isArray(booking.vaccineIds) && booking.vaccineIds.length > 0
        ? booking.vaccineIds
        : Array.isArray(booking.patient?.selectedVaccines) && booking.patient.selectedVaccines.length > 0
          ? booking.patient.selectedVaccines
          : booking.vaccineId
            ? [booking.vaccineId]
            : [];
    const matched = vaccines.filter((v) => ids.includes(v.id)).map((v) => v.name);
    if (matched.length > 0) return matched.join(', ');
    return booking.patient?.selectedVaccineNames || 'Vaksinasi Internasional (ICV)';
  }, [booking, vaccines]);

  const issuedDateFormatted = useMemo(() => {
    const raw = booking?.patient?.e_icv_issued_at || booking?.date;
    if (!raw) return '—';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, [booking]);

  const handleDownloadGeneratedPdf = () => {
    if (!booking) return;
    if (pdf) {
      const a = document.createElement('a');
      a.href = pdf;
      a.download = fileName;
      a.click();
      return;
    }
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [215, 330],
    });

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PEMERINTAH KOTA SUKABUMI', 107.5, 18, { align: 'center' });
    doc.setFontSize(13);
    doc.text('DINAS KESEHATAN', 107.5, 24, { align: 'center' });
    doc.setFontSize(16);
    doc.text('UOBK RSUD AL-MULK', 107.5, 31, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Jl. Pelabuhan II KM 6, Lembursitu Kota Sukabumi Tlp.(0266) 6243088', 107.5, 37, {
      align: 'center',
    });

    doc.setLineWidth(0.8);
    doc.line(15, 43, 200, 43);
    doc.setLineWidth(0.2);
    doc.line(15, 44.5, 200, 44.5);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ELECTRONIC INTERNATIONAL CERTIFICATE OF VACCINATION (E-ICV)', 107.5, 55, {
      align: 'center',
    });
    doc.setFontSize(10);
    doc.text('SURAT KETERANGAN VAKSINASI INTERNASIONAL RESMI', 107.5, 61, { align: 'center' });

    doc.setLineWidth(0.4);
    doc.rect(18, 68, 179, 80);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('IDENTITAS PEMEGANG SERTIFIKAT:', 22, 76);

    doc.setFont('Helvetica', 'normal');
    doc.text(`1. Nama Lengkap       : ${patientName}`, 22, 85);
    doc.text(`2. Nomor Paspor       : ${passportNo}`, 22, 92);
    doc.text(`3. NIK                : ${nikNo}`, 22, 99);
    doc.text(`4. Negara Tujuan      : ${targetCountry}`, 22, 106);
    doc.text(`5. Jenis Vaksin       : ${vaccineNames}`, 22, 113);
    doc.text(`6. Nomor Registrasi   : ${booking.id}`, 22, 120);
    doc.text(`7. Tanggal Vaksinasi  : ${booking.date || '—'}`, 22, 127);
    doc.text(`8. Dokter Pemeriksa   : ${doctorName}`, 22, 134);
    doc.text(`9. Faskes Penerbit    : UOBK RSUD Al-Mulk Kota Sukabumi`, 22, 141);

    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(
      'Dokumen ini diterbitkan secara sah oleh UOBK RSUD Al-Mulk Kota Sukabumi.',
      107.5,
      160,
      { align: 'center' }
    );

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Sukabumi, ${issuedDateFormatted}`, 142, 180);
    doc.text('Tim Medis & Vaksinator RSUD Al-Mulk', 142, 186);
    doc.setFont('Helvetica', 'bold');
    doc.text(`( ${doctorName} )`, 142, 212);

    doc.save(fileName);
  };

  const timelineSteps = [
    { label: 'Pendaftaran', done: Boolean(booking) },
    {
      label: 'Verifikasi',
      done: Boolean(
        booking &&
          ['terverifikasi', 'selesai'].includes(booking.status || '')
      ),
    },
    { label: 'Vaksinasi', done: Boolean(booking && booking.status === 'selesai') || issued },
    { label: 'E-ICV Terbit', done: issued },
  ];

  return (
    <div className="font-sans pb-24 max-w-5xl mx-auto px-2 sm:px-4 space-y-5">
      {/* Header Card (Rounded matching Schedule & History) */}
      <div className="bg-gradient-to-r from-[#0038D1] via-[#1D4ED8] to-[#1E40AF] text-white rounded-3xl px-5 sm:px-7 py-5 sm:py-6 shadow-[0_12px_35px_-5px_rgba(0,56,209,0.28)] border border-white/15">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-4">
          <div className="flex items-center justify-between sm:justify-start">
            <button
              onClick={() => navigate('/home')}
              title="Kembali ke Beranda"
              aria-label="Kembali ke Beranda"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            <span className="sm:hidden text-[11px] font-extrabold px-3 py-1.5 rounded-2xl bg-white/15 border border-white/20 text-white">
              Stok: {eicvStock || 18} ICV / E-ICV
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-none">
                SERTIFIKAT E-ICV
              </h1>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                Sah Kemenkes RI
              </span>
            </div>
            <p className="text-xs text-blue-100/95 font-medium mt-1.5 leading-snug">
              Electronic International Certificate of Vaccination • UOBK RSUD Al-Mulk Kota Sukabumi
            </p>
          </div>

          <div className="hidden sm:flex items-center justify-end">
            <div className="px-3.5 py-2 rounded-2xl bg-white/15 border border-white/20 text-right backdrop-blur-md">
              <span className="text-[9.5px] uppercase tracking-wider font-bold text-blue-100 block leading-none">
                Stok ICV / E-ICV ({eicvStatus || 'Tersedia'})
              </span>
              <span className="text-xs font-black text-white mt-1 block leading-none">
                {eicvStock || 18} ICV / E-ICV
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notice Banner */}
      {role === 'admin' && (
        <div className="p-4 rounded-3xl border border-emerald-200 bg-emerald-50/90 flex flex-wrap items-center justify-between gap-3 text-sm text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <span className="text-xs sm:text-sm font-semibold">
              Kelola dan unggah file PDF sertifikat E-ICV resmi peserta melalui halaman Admin.
            </span>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Kelola Sertifikat →
          </button>
        </div>
      )}

      {/* Summary KPI + Search & Participant Selector Card (All Rounded) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_8px_30px_-4px_rgba(15,23,42,0.06)] space-y-4">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-3 sm:p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                E-ICV Terbit
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-900">{stats.issued}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 hidden sm:flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50/80 border border-amber-100 p-3 sm:p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                Proses / Menunggu
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-900">{stats.pending}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 hidden sm:flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50/80 border border-blue-100 p-3 sm:p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
                Stok ICV / E-ICV
              </span>
              <span className="text-lg sm:text-xl font-black text-blue-900">
                {eicvStock || 18}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 hidden sm:flex items-center justify-center">
              <Award size={18} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama peserta, nomor paspor, NIK, atau ID booking..."
              aria-label="Cari peserta sertifikat E-ICV"
              className="w-full h-11 pl-10 pr-4 text-xs sm:text-[13px] font-semibold text-slate-800 bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {visibleBookings.length > 0 && (
            <select
              aria-label="Pilih pendaftaran peserta"
              value={booking?.id || ''}
              onChange={(e) => setSelected(e.target.value)}
              className="h-11 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-xs font-bold text-slate-800 sm:max-w-xs outline-none focus:border-blue-500 cursor-pointer"
            >
              {visibleBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.patient?.name || b.patient?.fullName || 'Peserta'} ({b.id}) •{' '}
                  {isCertificateIssued(b) ? 'E-ICV Terbit' : 'Menunggu'}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-[340px_1fr] gap-5 items-start">
        {/* Left Card: Participant & Certificate Metadata */}
        <aside className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06)] overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                issued
                  ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100/80 text-amber-800 border border-amber-200'
              }`}
            >
              {issued ? <ShieldCheck size={14} /> : <Clock size={14} />}
              <span>{issued ? 'Sertifikat E-ICV Terbit' : 'Menunggu Penerbitan'}</span>
            </span>

            <h2 className="font-black text-lg text-slate-900 mt-4 leading-snug">
              {booking ? patientName : 'Belum Ada Pendaftaran'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1 font-mono">
              {booking?.id || 'Silakan daftar vaksinasi terlebih dahulu'}
            </p>
          </div>

          <dl className="p-6 space-y-4 text-sm">
            {[
              ['Nomor Paspor', passportNo],
              ['NIK (KTP)', nikNo],
              ['Negara Tujuan', booking ? targetCountry : '—'],
              ['Tanggal Vaksinasi', booking?.date || '—'],
              ['Tanggal Terbit E-ICV', issued ? issuedDateFormatted : '—'],
              ['Dokter Pemeriksa', booking ? doctorName : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3">
                <dt className="text-xs font-semibold text-slate-400 shrink-0">{label}</dt>
                <dd className="text-xs font-bold text-slate-800 text-right">{value}</dd>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-100">
              <dt className="text-xs font-semibold text-slate-400 mb-1.5">Jenis Vaksin</dt>
              <dd className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-100 rounded-2xl px-3.5 py-2.5">
                {vaccineNames}
              </dd>
            </div>
          </dl>

          {/* 4-Step Issuance Progress */}
          <div className="mx-6 mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Alur Penerbitan E-ICV
            </p>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {timelineSteps.map((step) => (
                <div key={step.label} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      step.done
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step.done ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-600 leading-tight">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-6 mb-6 p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-[11.5px] text-slate-600 leading-relaxed flex gap-2.5">
            <ShieldCheck size={16} className="shrink-0 text-blue-700 mt-0.5" />
            <span>
              Sertifikat E-ICV resmi diterbitkan dan diverifikasi oleh UOBK RSUD Al-Mulk Kota
              Sukabumi sesuai standar WHO & Kemenkes RI.
            </span>
          </div>
        </aside>

        {/* Right Card: Certificate Preview / PDF / Digital E-ICV + Guidelines */}
        <section className="space-y-5">
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base">Dokumen Sertifikat E-ICV</h2>
                  <p className="text-xs text-slate-500 mt-0.5 break-all">
                    {pdf
                      ? fileName
                      : issued
                        ? `${fileName} (Siap diunduh & dicetak)`
                        : 'Pratinjau sertifikat resmi akan tampil setelah vaksinasi selesai'}
                  </p>
                </div>
              </div>

              {booking && issued && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadGeneratedPdf}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Download size={15} />
                    <span>Unduh PDF</span>
                  </button>
                  {pdf ? (
                    <a
                      href={pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Buka sertifikat di tab baru"
                      className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all"
                    >
                      <ExternalLink size={16} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      aria-label="Cetak sertifikat"
                      className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all cursor-pointer"
                    >
                      <Printer size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {pdf ? (
              <div className="p-4 sm:p-5 bg-slate-50">
                <object
                  data={pdf}
                  type="application/pdf"
                  className="w-full h-[600px] rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="p-12 text-center text-sm text-slate-500 rounded-2xl bg-white">
                    Gunakan tombol Unduh PDF atau buka di tab baru untuk melihat dokumen PDF.
                  </div>
                </object>
              </div>
            ) : booking && issued ? (
              <div className="p-5 sm:p-6 bg-slate-50/70">
                {/* Digital E-ICV Official Preview Card */}
                <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-[#FFFBEB] to-amber-100/70 border-2 border-amber-300/80 p-5 sm:p-7 shadow-sm relative overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-amber-300/60">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                        <Award size={26} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block">
                          Kementerian Kesehatan RI • WHO IHR 2005
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5">
                          Electronic International Certificate of Vaccination
                        </h3>
                        <p className="text-xs font-semibold text-amber-900/80 mt-0.5">
                          Diterbitkan oleh UOBK RSUD Al-Mulk Kota Sukabumi
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold shadow-xs">
                      <CheckCircle2 size={13} />
                      TERVERIFIKASI SAH
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-center pt-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200/70">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Nama Pemegang
                        </span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">
                          {patientName}
                        </span>
                      </div>

                      <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200/70">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Nomor Paspor / Registrasi
                        </span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block font-mono">
                          {passportNo} • {booking.id}
                        </span>
                      </div>

                      <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200/70">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Vaksin Diberikan
                        </span>
                        <span className="text-xs font-extrabold text-blue-800 mt-0.5 block">
                          {vaccineNames}
                        </span>
                      </div>

                      <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200/70">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Tanggal Vaksin & Tujuan
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">
                          {booking.date || '—'} • {targetCountry}
                        </span>
                      </div>

                      <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200/70 sm:col-span-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <UserCheck size={15} className="text-emerald-700" />
                          <span className="font-bold text-slate-700">
                            Dokter Pemeriksa: <strong className="text-slate-900">{doctorName}</strong>
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-xl">
                          Terbit: {issuedDateFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-white rounded-3xl p-4 border border-amber-200/80 shadow-xs shrink-0 mx-auto sm:mx-0">
                      <QRCode
                        value={`SIVAKSIN-RSUD-ALMULK|${booking.id}|${patientName}|${passportNo}|${booking.date}`}
                        size={112}
                        level="M"
                      />
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mt-2.5">
                        QR Verifikasi E-ICV
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 border border-blue-100">
                  <FileText size={30} />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  {booking
                    ? `Sertifikat untuk ${patientName} Sedang Diproses`
                    : 'Belum Ada Pendaftaran Vaksinasi'}
                </h3>
                <p className="max-w-md text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  {booking
                    ? 'Pendaftaran Anda sudah tercatat. Sertifikat E-ICV resmi akan otomatis tampil dan dapat diunduh setelah tindakan vaksinasi selesai diverifikasi petugas RSUD Al-Mulk.'
                    : 'Silakan lakukan pendaftaran vaksinasi internasional terlebih dahulu. Sertifikat E-ICV yang diterbitkan akan langsung tersedia pada halaman ini.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
                  <button
                    onClick={() => navigate(booking ? '/history' : '/register')}
                    className="px-5 py-2.5 rounded-2xl bg-[#0038D1] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    {booking ? 'Lihat Buku Register' : 'Daftar Vaksinasi Sekarang'} →
                  </button>
                  {booking && (
                    <button
                      onClick={() => navigate('/informed-consent')}
                      className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Buka Informed Consent
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Informational Cards (Always Populated & Rounded) */}
          <div className="grid sm:grid-cols-3 gap-3.5">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-1.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Globe size={18} />
              </div>
              <h4 className="text-xs font-black text-slate-900">Berlaku Internasional</h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Sertifikat ICV / E-ICV sah untuk syarat Umroh, Haji, serta perjalanan dinas maupun
                wisata luar negeri.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-1.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpenCheck size={18} />
              </div>
              <h4 className="text-xs font-black text-slate-900">Integrasi SatuSehat & APIIK</h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Penerbitan dokumen ICV / E-ICV terhubung dengan sistem Kemenkes RI & BKK Bandung.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-1.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <h4 className="text-xs font-black text-slate-900">Masa Berlaku & Aktivasi</h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Vaksin Meningitis berlaku 2 tahun dan efektif minimal 10–14 hari sebelum tanggal
                keberangkatan.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Building2 size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">
                  Klinik Vaksinasi Internasional UOBK RSUD Al-Mulk
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Calendar size={12} /> Senin – Jum'at, 08.00 – 14.00 WIB • Jl. Pelabuhan II KM 6,
                  Kota Sukabumi
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
            >
              Daftar Baru
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
