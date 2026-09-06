import React, { useState } from 'react';
import OfficialDocHeader from '../OfficialDocHeader';

interface SkriningVaksinDocProps {
  booking: any;
  isPrintMode?: boolean;
  onUpdateScreening?: (screeningData: any) => void;
  canEdit?: boolean;
}

export const SCREENING_QUESTIONS = [
  'Apakah anda sedang sakit hari ini?',
  'Apakah anda memiliki alergi terhadap obat-obatan, makanan, komponen vaksin atau lateks?',
  'Apakah anda pernah mengalami reaksi alergi berat setelah menerima vaksinasi?',
  'Apakah anda memiliki penyakit kronis terkait jantung, paru-paru, asthma, ginjal, penyakit metabolik (diabetes), anemia atau penyakit kelainan darah?',
  'Apakah anda menderita kanker, leukemia, HIV/AIDS atau gangguan sistem daya tahan tubuh?',
  'Dalam 3 bulan terakhir, apakah anda mendapatkan pengobatan yang melemahkan daya tahan tubuh, seperti kortison, prednisone, steroid lainnya atau obat anti kanker, atau dalam terapi radiasi?',
  'Apakah anda pernah mengalami kejang atau gangguan sistem syaraf lainnya?',
  'Apakah anda menerima transfusi darah atau produk darah, atau mendapat terapi imun (gamma) globulin, atau obat antiviral dalam satu tahun terakhir?',
  'Apakah anda sedang hamil atau berencana untuk hamil dalam 1 bulan ke depan?',
  'Apakah anda mendapatkan vaksinasi dalam 4 minggu terakhir?',
  'Apakah anda membawa kartu vaksinasi?'
];

export default function SkriningVaksinDoc({
  booking,
  isPrintMode = false,
  onUpdateScreening,
  canEdit = true
}: SkriningVaksinDocProps) {
  const patient = booking?.patient || {};
  const nama = patient.name || patient.fullName || '-';
  const tglLahir = patient.dob || patient.tanggalLahir || '-';

  // Saved answers or default (all 'tidak' except question 11 which might be 'ya')
  const savedAnswers = patient.screeningAnswers || {};
  const [answers, setAnswers] = useState<Record<number, 'ya' | 'tidak' | 'tidak_tahu'>>(() => {
    const initial: Record<number, 'ya' | 'tidak' | 'tidak_tahu'> = {};
    SCREENING_QUESTIONS.forEach((_, idx) => {
      initial[idx] = savedAnswers[idx] || (idx === 10 ? 'ya' : 'tidak');
    });
    return initial;
  });

  const [keterangan, setKeterangan] = useState<Record<number, string>>(
    () => patient.screeningNotes || {}
  );
  const [hasilStatus, setHasilStatus] = useState<'layak' | 'tunda' | 'tidak_layak'>(
    () => patient.screeningResult || 'layak'
  );
  const [petugasCatatan, setPetugasCatatan] = useState<string>(
    () => patient.doctorScreeningNote || ''
  );

  const handleAnswerChange = (idx: number, val: 'ya' | 'tidak' | 'tidak_tahu') => {
    if (!canEdit) return;
    const updated = { ...answers, [idx]: val };
    setAnswers(updated);
    if (onUpdateScreening) {
      onUpdateScreening({
        screeningAnswers: updated,
        screeningNotes: keterangan,
        screeningResult: hasilStatus,
        doctorScreeningNote: petugasCatatan
      });
    }
  };

  const handleKeteranganChange = (idx: number, text: string) => {
    if (!canEdit) return;
    const updated = { ...keterangan, [idx]: text };
    setKeterangan(updated);
    if (onUpdateScreening) {
      onUpdateScreening({
        screeningAnswers: answers,
        screeningNotes: updated,
        screeningResult: hasilStatus,
        doctorScreeningNote: petugasCatatan
      });
    }
  };

  const handleStatusChange = (status: 'layak' | 'tunda' | 'tidak_layak') => {
    if (!canEdit) return;
    setHasilStatus(status);
    if (onUpdateScreening) {
      onUpdateScreening({
        screeningAnswers: answers,
        screeningNotes: keterangan,
        screeningResult: status,
        doctorScreeningNote: petugasCatatan
      });
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return '__ / __ / ____';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day} / ${month} / ${year}`;
    } catch {
      return dateStr;
    }
  };

  const currentDateDisplay = () => {
    const today = new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  };

  return (
    <div
      className={`bg-white text-black font-sans mx-auto p-4 sm:p-8 md:p-10 w-full max-w-[840px] shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-6 print:m-0 print:max-w-none ${
        isPrintMode ? 'print-container' : ''
      }`}
      style={{ minHeight: '297mm', color: '#000000', backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {/* Official Header matching original scan */}
      <OfficialDocHeader fontFamily="Arial, Helvetica, sans-serif" />

      {/* Judul Formulir Skrining */}
      <div className="text-center my-4">
        <h3 className="font-bold text-[14px] tracking-widest uppercase underline text-black">
          FORMULIR
        </h3>
        <h2 className="font-black text-[14px] sm:text-[15px] tracking-wide uppercase text-black mt-0.5">
          DAFTAR TILIK PENAPISAN KONTRAINDIKASI UNTUK VAKSINASI DEWASA
        </h2>
      </div>

      {/* Bar Identitas Pasien */}
      <div className="border border-black px-4 py-2 my-3 text-[11px] sm:text-[12px] flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-slate-50/50 print:bg-transparent font-sans">
        <div>
          <span className="font-medium text-black">Nama Pelaku Perjalanan : </span>
          <strong className="font-bold text-black uppercase">{nama}</strong>
        </div>
        <div>
          <span className="font-medium text-black">Tgl Lahir : </span>
          <strong className="font-bold text-black font-mono">{formatDateDisplay(tglLahir)}</strong>
        </div>
      </div>

      {/* Tabel 11 Pertanyaan Skrining sesuai scan resmi */}
      <div className="overflow-x-auto my-3">
        <table className="w-full min-w-[500px] border-collapse border border-black text-[10px] sm:text-[11px] font-sans">
          <thead>
            <tr className="bg-slate-100 print:bg-slate-100 font-bold text-center border-b border-black">
              <th className="border border-black p-1.5 w-8">No</th>
              <th className="border border-black p-1.5 text-left">Pertanyaan</th>
              <th className="border border-black p-1.5 w-12 text-center">Ya</th>
              <th className="border border-black p-1.5 w-14 text-center">Tidak</th>
              <th className="border border-black p-1.5 w-16 text-center">Tidak Tahu</th>
              <th className="border border-black p-1.5 w-32 text-center">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {SCREENING_QUESTIONS.map((question, idx) => {
              const currentAns = answers[idx];
              return (
                <tr key={idx} className="border-b border-black hover:bg-slate-50/50">
                  <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                  <td className="border border-black p-1.5 leading-snug">{question}</td>
                  <td className="border border-black p-1 text-center">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleAnswerChange(idx, 'ya')}
                      className={`w-5 h-5 mx-auto rounded border flex items-center justify-center font-bold text-xs cursor-pointer ${
                        currentAns === 'ya'
                          ? 'bg-black text-white border-black'
                          : 'border-black/50 hover:bg-slate-100'
                      }`}
                    >
                      {currentAns === 'ya' ? '✓' : ''}
                    </button>
                  </td>
                  <td className="border border-black p-1 text-center">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleAnswerChange(idx, 'tidak')}
                      className={`w-5 h-5 mx-auto rounded border flex items-center justify-center font-bold text-xs cursor-pointer ${
                        currentAns === 'tidak'
                          ? 'bg-black text-white border-black'
                          : 'border-black/50 hover:bg-slate-100'
                      }`}
                    >
                      {currentAns === 'tidak' ? '✓' : ''}
                    </button>
                  </td>
                  <td className="border border-black p-1 text-center">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleAnswerChange(idx, 'tidak_tahu')}
                      className={`w-5 h-5 mx-auto rounded border flex items-center justify-center font-bold text-xs cursor-pointer ${
                        currentAns === 'tidak_tahu'
                          ? 'bg-black text-white border-black'
                          : 'border-black/50 hover:bg-slate-100'
                      }`}
                    >
                      {currentAns === 'tidak_tahu' ? '✓' : ''}
                    </button>
                  </td>
                  <td className="border border-black p-1">
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={keterangan[idx] || ''}
                      onChange={(e) => handleKeteranganChange(idx, e.target.value)}
                      placeholder="-"
                      className="w-full text-[10px] px-1 py-0.5 bg-transparent outline-none border-b border-dotted border-black/30 focus:border-black"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bagian Hasil Keputusan Skrining Medis */}
      <div className="border border-black p-3 my-3 text-[11.5px] font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="font-bold text-black uppercase tracking-wider text-[12px]">
            Hasil Penapisan Medis:
          </span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer font-bold">
              <input
                type="radio"
                name="hasilSkrining"
                checked={hasilStatus === 'layak'}
                onChange={() => handleStatusChange('layak')}
                disabled={!canEdit}
                className="accent-black"
              />
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                LAYAK VAKSIN
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-bold">
              <input
                type="radio"
                name="hasilSkrining"
                checked={hasilStatus === 'tunda'}
                onChange={() => handleStatusChange('tunda')}
                disabled={!canEdit}
                className="accent-black"
              />
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                DITUNDA
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-bold">
              <input
                type="radio"
                name="hasilSkrining"
                checked={hasilStatus === 'tidak_layak'}
                onChange={() => handleStatusChange('tidak_layak')}
                disabled={!canEdit}
                className="accent-black"
              />
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                TIDAK LAYAK
              </span>
            </label>
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold text-black shrink-0">Catatan Khusus Dokter / Petugas:</span>
          <input
            type="text"
            disabled={!canEdit}
            value={petugasCatatan}
            onChange={(e) => {
              setPetugasCatatan(e.target.value);
              if (onUpdateScreening) {
                onUpdateScreening({
                  screeningAnswers: answers,
                  screeningNotes: keterangan,
                  screeningResult: hasilStatus,
                  doctorScreeningNote: e.target.value
                });
              }
            }}
            placeholder="Kondisi tanda vital stabil, tidak ada kontraindikasi mutlak..."
            className="flex-1 border-b border-dotted border-black/70 px-1 py-0.5 outline-none text-[11px] bg-transparent"
          />
        </div>
      </div>

      {/* Bagian Tanda Tangan Dokter & Petugas Skrining */}
      <div className="mt-6 grid grid-cols-2 gap-8 text-[11.5px] font-sans">
        <div className="text-center">
          <p className="mb-0.5">Diisi oleh (Petugas Penapis):</p>
          <p className="text-[10.5px] text-slate-500 mb-12">Tanggal: {currentDateDisplay()}</p>
          <div className="border-b border-black w-48 mx-auto"></div>
          <p className="mt-1 font-bold">( ........................................ )</p>
        </div>

        <div className="text-center">
          <p className="mb-0.5">Diverifikasi oleh (Dokter Penanggung Jawab):</p>
          <p className="text-[10.5px] text-slate-500 mb-12">Tanggal: {currentDateDisplay()}</p>
          <div className="border-b border-black w-48 mx-auto"></div>
          <p className="mt-1 font-bold">( dr. .................................... )</p>
        </div>
      </div>
    </div>
  );
}
