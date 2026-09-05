import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  X, Printer, Download, CheckCircle2, AlertTriangle, 
  ShieldCheck, FileText, Calendar, User, Building2, 
  Loader2, Check
} from 'lucide-react';
import { AnaphylacticHistoryRecord } from '../data/anaphylacticData';
import { renderHtmlToCanvas } from '../utils/html2canvasHelper';
import { jsPDF } from 'jspdf';

interface AnaphylacticReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AnaphylacticHistoryRecord | null;
}

export const AnaphylacticReportModal: React.FC<AnaphylacticReportModalProps> = ({
  isOpen,
  onClose,
  record
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !record) return null;

  // Format Indonesian date
  const formatIndoDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatIndoDate(record.tanggalPemeriksaan);
  const isAllGood = record.itemsKurang === 0 && record.itemsRusak === 0;

  // Download PDF matching 100% of the UI
  const handleDownloadPdf = async () => {
    const element = reportContentRef.current;
    if (!element) return;

    setIsGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      // Create high-resolution canvas from DOM with oklch color sanitizer
      const canvas = await renderHtmlToCanvas(element, {
        scale: 2.5, // 300 DPI high resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 8; // 8mm margin
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      if (contentHeight <= pdfHeight - (margin * 2)) {
        // Fits on single page
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight, undefined, 'FAST');
      } else {
        // Multi-page handling
        let heightLeft = contentHeight;
        let position = margin;

        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
        heightLeft -= (pdfHeight - margin * 2);

        while (heightLeft > 0) {
          position = heightLeft - contentHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
          heightLeft -= (pdfHeight - margin * 2);
        }
      }

      const safeDate = record.tanggalPemeriksaan || new Date().toISOString().slice(0, 10);
      const fileName = `Laporan_Resmi_Monitoring_Anafilaktik_Kit_${safeDate}.pdf`;
      pdf.save(fileName);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (error) {
      console.error('Gagal membuat PDF:', error);
      // Fallback to print
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:z-auto">
      
      {/* Screen Overlay Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none print:my-0 print:p-0 print:transform-none print:static print:overflow-visible"
      >
        {/* Modal Top Toolbar (Screen Only) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                Laporan Resmi Monitoring Anafilaktik Kit
              </h3>
              <p className="text-[11px] text-slate-300">
                UOBK RSUD Al-Mulk Kota Sukabumi &bull; Format Standar Akreditasi Kemenkes RI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer ${
                downloadSuccess 
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              } disabled:opacity-60`}
              title="Download Dokumen PDF Resmi"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span className="hidden sm:inline">Membuat PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check size={15} strokeWidth={2.5} />
                  <span>PDF Terdownload!</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 active:scale-95 transition-all cursor-pointer"
              title="Cetak Fisik ke Printer"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
              title="Tutup"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Paper Area (100% Identical Screen & Print) */}
        <div 
          ref={reportContentRef}
          id="anaphylactic-official-report-content"
          className="p-6 sm:p-9 max-h-[80vh] overflow-y-auto bg-white text-slate-900 print:max-h-none print:overflow-visible print:p-4 print:m-0 print:w-full"
        >
          
          {/* ==========================================================
              KOP SURAT RESMI RSUD AL-MULK
              ========================================================== */}
          <div className="text-center pb-2 relative">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-sm border border-rose-700 shrink-0">
                <span className="leading-none select-none font-sans font-black">+</span>
              </div>
              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-800">
                  Pemerintah Kota Sukabumi &bull; Dinas Kesehatan
                </h3>
                <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-950">
                  UOBK RSUD AL-MULK KOTA SUKABUMI
                </h1>
                <p className="text-[11px] text-slate-600 font-medium">
                  Jl. Pelabuhan II KM. 6, Lembursitu, Kota Sukabumi, Jawa Barat 43168 | Telp: (0266) 6243088
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  Sertifikasi & Standar Akreditasi Kemenkes RI - Pelayanan Vaksinasi & Penanganan Kegawatdaruratan
                </p>
              </div>
            </div>

            {/* Garis Ganda Kop Surat Resmi */}
            <div className="border-b-[2.5px] border-slate-900 mt-2.5 mb-[1.5px]" />
            <div className="border-b-[0.75px] border-slate-900 mb-3" />
          </div>

          {/* Judul & Nomor Dokumen Berita Acara */}
          <div className="text-center py-2.5 mb-2">
            <h2 className="text-sm sm:text-base font-black tracking-wide uppercase text-slate-900 underline decoration-slate-400 decoration-1 underline-offset-4">
              BERITA ACARA & LAPORAN MONITORING SYOCK ANAFILAKTIK KIT
            </h2>
            <p className="text-[11px] font-mono text-slate-600 mt-1">
              Nomor: BA-KIT/VAKSIN/{record.tanggalPemeriksaan.replace(/-/g, '')}/{record.id.slice(-4).toUpperCase()}
            </p>
          </div>

          {/* Metadata Grid (Identitas Pemeriksaan) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
              
              <div className="flex items-center gap-2">
                <span className="w-36 font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                  <Building2 size={13} className="text-slate-500" /> Unit / Ruangan
                </span>
                <span className="font-semibold text-slate-900">: {record.unitRuangan}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-36 font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                  <Calendar size={13} className="text-slate-500" /> Tanggal Periksa
                </span>
                <span className="font-semibold text-slate-900">: {formattedDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-36 font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                  <User size={13} className="text-slate-500" /> Petugas Pemeriksa
                </span>
                <span className="font-semibold text-slate-900">: {record.namaPetugas}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-36 font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                  <ShieldCheck size={13} className="text-slate-500" /> Status Kelaikan
                </span>
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  : 
                  {isAllGood ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[11px]">
                      <CheckCircle2 size={12} className="text-emerald-700" />
                      100% SIAP PAKAI (Lengkap)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-extrabold text-[11px]">
                      <AlertTriangle size={12} className="text-amber-700" />
                      {record.persentaseKesiapan}% Siap ({record.itemsKurang} Perlu Restok)
                    </span>
                  )}
                </span>
              </div>

            </div>
          </div>

          {/* Tabel Detail Obat & Alat Medis (Persis 100% dengan Aplikasi) */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-5">
            <table className="w-full text-left text-[10.5px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black uppercase tracking-wider border-b border-slate-300">
                  <th className="py-2 px-2 text-center w-9 border-r border-slate-300">No</th>
                  <th className="py-2 px-3 border-r border-slate-300">Nama Obat / Alat</th>
                  <th className="py-2 px-3 border-r border-slate-300">Spesifikasi</th>
                  <th className="py-2 px-2 text-center w-14 border-r border-slate-300">Awal</th>
                  <th className="py-2 px-2 text-center w-14 border-r border-slate-300">Sisa</th>
                  <th className="py-2 px-3 border-r border-slate-300">No. Batch</th>
                  <th className="py-2 px-3 border-r border-slate-300">Exp. Date</th>
                  <th className="py-2 px-2 text-center w-16 border-r border-slate-300">Kondisi</th>
                  <th className="py-2 px-2 text-center w-24">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {record.items.map((item, idx) => {
                  const isKurang = Number(item.stokSisa) < item.stokAwal;
                  const isRusak = item.kondisi === 'Tidak';

                  return (
                    <tr 
                      key={item.no} 
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'} ${
                        isKurang ? 'text-rose-900 font-semibold' : 'text-slate-800'
                      }`}
                    >
                      <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200">
                        {item.no}
                      </td>
                      <td className="py-1.5 px-3 font-bold border-r border-slate-200 text-slate-900">
                        {item.nama}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600 border-r border-slate-200">
                        {item.spesifikasi}
                      </td>
                      <td className="py-1.5 px-2 text-center font-semibold border-r border-slate-200">
                        {item.stokAwal}
                      </td>
                      <td className={`py-1.5 px-2 text-center font-black border-r border-slate-200 ${
                        isKurang ? 'text-rose-600 bg-rose-50' : 'text-slate-900'
                      }`}>
                        {item.stokSisa}
                      </td>
                      <td className="py-1.5 px-3 font-mono text-[10px] text-slate-600 border-r border-slate-200">
                        {item.noBatch}
                      </td>
                      <td className="py-1.5 px-3 font-medium text-slate-700 border-r border-slate-200">
                        {item.expDate}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200">
                        {item.kondisi}
                      </td>
                      <td className="py-1.5 px-2 text-center text-[10px] font-bold">
                        {isKurang ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                            Perlu Restok
                          </span>
                        ) : isRusak ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold">
                            Rusak
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                            Lengkap
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Evaluasi / Catatan Khusus */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 text-xs">
            <span className="font-bold text-slate-800 block mb-1">Catatan & Rekomendasi Hasil Pemeriksaan:</span>
            <p className="text-slate-700 leading-relaxed italic">
              "{record.catatanPetugas || 'Seluruh perlengkapan syock anafilaktik kit telah diperiksa dan disesuaikan dengan pedoman penanganan kejadian ikutan pasca imunisasi (KIPI) UOBK RSUD Al-Mulk.'}"
            </p>
          </div>

          {/* Lembar Tanda Tangan Resmi (Anti Page-Break) */}
          <div className="print-avoid-break grid grid-cols-2 gap-10 text-xs font-semibold text-slate-900 pt-1">
            <div className="text-center space-y-14">
              <div>
                <p className="text-slate-600 text-[11px]">Sukabumi, {formattedDate}</p>
                <p className="font-bold text-slate-900 mt-0.5">Petugas Pemeriksa,</p>
              </div>
              <div>
                <div className="border-b border-slate-900 w-48 mx-auto" />
                <p className="mt-1.5 font-black text-slate-950">{record.namaPetugas}</p>
                <p className="text-[10px] text-slate-600 font-medium">Petugas Ruangan / Vaksinasi</p>
              </div>
            </div>

            <div className="text-center space-y-14">
              <div>
                <p className="text-slate-600 text-[11px]">Mengetahui,</p>
                <p className="font-bold text-slate-900 mt-0.5">Penanggung Jawab Farmasi / Ruangan,</p>
              </div>
              <div>
                <div className="border-b border-slate-900 w-48 mx-auto" />
                <p className="mt-1.5 font-black text-slate-950">Apt. Penanggung Jawab, S.Farm</p>
                <p className="text-[10px] text-slate-600 font-medium">NIP. 19870514 201101 2 003</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer (Screen Only) */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500 font-medium">
            Dokumen terarsip resmi &bull; {record.items.length} item diperiksa
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              {isGeneratingPdf ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              <span>Download PDF Resmi</span>
            </button>
          </div>
        </div>

      </motion.div>

    </div>
  );
};

