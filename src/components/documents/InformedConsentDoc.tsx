import React from 'react';
import OfficialDocHeader from '../OfficialDocHeader';

interface InformedConsentDocProps {
  booking: any;
  vaccinesList?: string;
  isPrintMode?: boolean;
}

export default function InformedConsentDoc({
  booking,
  vaccinesList,
  isPrintMode = false
}: InformedConsentDocProps) {
  const patient = booking?.patient || {};

  const nama = patient.name || patient.fullName || '-';
  const passport = patient.passport || patient.no_passport || '-';
  const tempatLahir = patient.pob || patient.tempatLahir || patient.birthPlace || 'Sukabumi';
  const tglLahir = patient.dob || patient.tanggalLahir || '-';
  const jenisKelamin = patient.gender || patient.jenisKelamin || 'Laki-laki';
  const pekerjaan = patient.occupation || patient.pekerjaan || 'Pegawai / Wiraswasta';
  const alamat = patient.address || patient.alamat || '-';
  const noTelp = patient.handphone || patient.no_hp || patient.phone || '-';
  const jenisVaksin =
    vaccinesList ||
    patient.selectedVaccineNames ||
    patient.selectedVaccine ||
    'Meningitis / Vaksinasi Internasional';

  // Calculate age if dob available
  const calculateAge = (dobStr?: string) => {
    if (!dobStr || dobStr === '-') return '-';
    try {
      const birthDate = new Date(dobStr);
      if (isNaN(birthDate.getTime())) return '-';
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age > 0 ? `${age} Tahun` : 'Dewasa';
    } catch {
      return '-';
    }
  };

  const currentDateDisplay = () => {
    const today = new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `Sukabumi, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  };

  return (
    <div
      className={`bg-white text-black font-sans mx-auto p-3.5 sm:p-8 md:p-12 w-full max-w-[820px] shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-6 print:m-0 print:max-w-none ${
        isPrintMode ? 'print-container' : ''
      }`}
      style={{ minHeight: '330mm', color: '#000000', backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {/* Kop Surat Resmi */}
      <OfficialDocHeader fontFamily="Arial, Helvetica, sans-serif" />

      {/* Judul Formulir */}
      <div className="text-center my-4 sm:my-6">
        <h2 className="font-black text-[13px] sm:text-[15px] md:text-[16px] tracking-wider uppercase underline text-black leading-tight">
          FORMULIR PERSETUJUAN / IZIN* TINDAKAN VAKSINASI
        </h2>
      </div>

      {/* Bagian Pertama - Pihak yang menyatakan */}
      <div className="text-[11px] sm:text-[12.5px] leading-relaxed text-black space-y-2">
        <p>Saya yang bertanda tangan di bawah ini :</p>

        <div className="space-y-3 sm:space-y-1.5 pl-0 sm:pl-4">
          <div className="grid grid-cols-12 gap-1 items-baseline">
            <div className="col-span-3 flex justify-between pr-2">
              <span>Nama</span>
              <span>:</span>
            </div>
            <div className="col-span-9 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
              {nama}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 items-baseline">
            <div className="col-span-3 flex justify-between pr-2">
              <span>Alamat</span>
              <span>:</span>
            </div>
            <div className="col-span-9 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
              {alamat}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 items-baseline">
            <div className="col-span-3 flex justify-between pr-2">
              <span>No. Telp</span>
              <span>:</span>
            </div>
            <div className="col-span-9 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
              {noTelp}
            </div>
          </div>
        </div>

        {/* Pernyataan persetujuan terhadap sasaran */}
        <div className="pt-2">
          <p className="leading-relaxed">
            Dengan ini menyatakan dengan sesungguhnya telah memberikan{' '}
            <strong className="tracking-wide">PERSETUJUAN / IZIN*</strong> untuk diberikan vaksinasi :
          </p>
          <div className="border-b border-dotted border-black/70 font-semibold px-2 py-1 mt-1 text-[13px] bg-slate-50/50 print:bg-transparent">
            {jenisVaksin}
          </div>
        </div>

        <div className="pt-2">
          <p className="font-semibold text-black">
            Terhadap diri saya sendiri / suami / istri / anak / ayah / ibu saya :
          </p>
        </div>

        {/* Identitas Pasien Penerima Vaksin */}
        <div className="space-y-1.5 pl-4 pt-1">
          <div className="grid grid-cols-12 gap-1 items-baseline">
            <div className="col-span-4 flex justify-between pr-2">
              <span>Nama</span>
              <span>:</span>
            </div>
            <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
              {nama}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 items-baseline">
            <div className="col-span-4 flex justify-between pr-2">
              <span>Umur</span>
              <span>:</span>
            </div>
            <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
              {calculateAge(tglLahir)}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 items-baseline">
            <div className="col-span-4 flex justify-between pr-2">
              <span>Nomor Paspor</span>
              <span>:</span>
            </div>
            <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
              {passport}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 items-baseline">
            <div className="col-span-4 flex justify-between pr-2">
              <span>Tempat tanggal lahir</span>
              <span>:</span>
            </div>
            <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
              {tempatLahir}, {tglLahir}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 items-baseline">
            <div className="col-span-4 flex justify-between pr-2">
              <span>Jenis kelamin</span>
              <span>:</span>
            </div>
            <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
              {jenisKelamin}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 items-baseline">
            <div className="col-span-4 flex justify-between pr-2">
              <span>Pekerjaan</span>
              <span>:</span>
            </div>
            <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
              {pekerjaan}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 items-baseline">
            <div className="col-span-4 flex justify-between pr-2">
              <span>Alamat</span>
              <span>:</span>
            </div>
            <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
              {alamat}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 items-baseline">
            <div className="col-span-4 flex justify-between pr-2">
              <span>No. Telp</span>
              <span>:</span>
            </div>
            <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
              {noTelp}
            </div>
          </div>
        </div>

        {/* Paragraf Penjelasan KIPI & Sukarela */}
        <div className="pt-3 space-y-2 text-[12px] text-justify leading-relaxed">
          <p>
            Yang tujuan, sifat dan perlunya tindakan vaksinasi tersebut di atas, serta risiko yang
            dapat ditimbulkan KIPI (Kejadian Ikutan Pasca Imunisasi) telah cukup dijelaskan dan telah
            saya mengerti semua.
          </p>
          <p>
            Demikian pernyataan persetujuan / izin ini saya buat dengan penuh kesadaran dan tanpa
            paksaan.
          </p>
        </div>
      </div>

      {/* Tanggal */}
      <div className="mt-4 flex justify-end">
        <p className="text-[12px]">{currentDateDisplay()}</p>
      </div>

      {/* Area Tanda Tangan Sesuai Dokumen Asli: 3 Kolom Atas, 1 Kolom Bawah */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-[12px]">
        {/* Saksi I */}
        <div className="flex flex-col items-center">
          <p className="font-bold text-black mb-14 leading-tight">Saksi dari pihak pasien</p>
          <div className="border-b border-black w-40"></div>
          <p className="mt-1">( ........................................ )</p>
        </div>

        {/* Dokter / Operator */}
        <div className="flex flex-col items-center">
          <p className="font-bold text-black mb-14 leading-tight">Dokter / operator</p>
          <div className="border-b border-black w-40"></div>
          <p className="mt-1">( ........................................ )</p>
        </div>

        {/* Yang membuat Keterangan */}
        <div className="flex flex-col items-center">
          <p className="font-bold text-black mb-14 leading-tight">Yang membuat Keterangan</p>
          <div className="border-b border-black w-40"></div>
          <p className="mt-1 font-bold">( {nama} )</p>
        </div>
      </div>

      {/* Saksi II (Pihak RS) di baris bawah */}
      <div className="mt-6 flex justify-start text-center text-[12px]">
        <div className="flex flex-col items-center w-1/3">
          <p className="font-bold text-black mb-14 leading-tight">Saksi dari pihak RS</p>
          <div className="border-b border-black w-40"></div>
          <p className="mt-1">( ........................................ )</p>
        </div>
      </div>

      {/* Catatan Kaki Resmi */}
      <div className="mt-8 pt-2 border-t border-black/40 text-[10.5px] italic text-black/90 space-y-0.5">
        <p>*) Ket : "PERSETUJUAN" buat orang dewasa, kata "IZIN" dicoret</p>
        <p className="pl-4">"IZIN" buat anak-anak, kata "PERSETUJUAN" dicoret</p>
      </div>
    </div>
  );
}
