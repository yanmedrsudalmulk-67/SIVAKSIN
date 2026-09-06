import React from 'react';
import OfficialDocHeader from '../OfficialDocHeader';

interface PermohonanVaksinDocProps {
  booking: any;
  vaccinesList?: string;
  isPrintMode?: boolean;
}

export default function PermohonanVaksinDoc({
  booking,
  vaccinesList,
  isPrintMode = false
}: PermohonanVaksinDocProps) {
  const patient = booking?.patient || {};

  // Extract / format data
  const nama = patient.name || patient.fullName || '-';
  const passport = patient.passport || patient.no_passport || '-';
  const nik = patient.nik || '-';
  const npwp = patient.npwp || '-';
  const tempatLahir = patient.pob || patient.tempatLahir || patient.birthPlace || 'Sukabumi';
  const tglLahir = patient.dob || patient.tanggalLahir || '-';
  const jenisKelamin = patient.gender || patient.jenisKelamin || 'Laki-laki';
  const alamat = patient.address || patient.alamat || '-';
  const noTelp = patient.handphone || patient.no_hp || patient.phone || '-';
  const email = patient.email || '-';
  const negaraTujuan = patient.targetCountry || patient.negaraTujuan || '-';
  const tglKeberangkatan = patient.departureDate || patient.tanggalKeberangkatan || '-';
  const jenisVaksin =
    vaccinesList ||
    patient.selectedVaccineNames ||
    patient.selectedVaccine ||
    'Meningitis / Vaksinasi Internasional';
  const namaTravel = patient.travelName || patient.namaTravel || '-';
  const alamatTravel = patient.travelAddress || patient.alamatTravel || '-';

  // Format date helper DD / MM / YYYY
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
    return `Sukabumi, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  };

  return (
    <div
      className={`bg-white text-black font-sans mx-auto p-4 sm:p-8 md:p-12 w-full max-w-[820px] shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-6 print:m-0 print:max-w-none ${
        isPrintMode ? 'print-container' : ''
      }`}
      style={{ minHeight: '297mm', color: '#000000', backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {/* Official Header matching original scan */}
      <OfficialDocHeader fontFamily="Arial, Helvetica, sans-serif" />

      {/* Title */}
      <div className="text-center my-4 sm:my-6">
        <h3 className="font-bold text-[13px] sm:text-[15px] tracking-widest uppercase underline text-black">
          FORMULIR
        </h3>
        <h2 className="font-black text-[14px] sm:text-[16px] tracking-wider uppercase text-black mt-0.5">
          PERMOHONAN VAKSINASI
        </h2>
      </div>

      {/* Opening statement */}
      <p className="text-[11px] sm:text-[13px] text-black mb-3">
        Saya yang bertanda tangan dibawah ini :
      </p>

      {/* 13 Numbered Items matching reference scan layout */}
      <div className="space-y-3 sm:space-y-1.5 text-[11px] sm:text-[12.5px] leading-relaxed text-black">
        {/* 1. Nama */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-12 sm:col-span-4 flex justify-between pr-2">
            <span>1. Nama</span>
            <span className="hidden sm:inline-block">:</span>
          </div>
          <div className="col-span-12 sm:col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            {nama}
          </div>
        </div>

        {/* 2. Nomor Paspor */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>2. Nomor Paspor</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            {passport}
          </div>
        </div>

        {/* 3. NIK */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>3. NIK</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            {nik}
          </div>
        </div>

        {/* 4. NPWP */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>4. NPWP</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            {npwp}
          </div>
        </div>

        {/* 5. Tempat Tanggal Lahir */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>5. Tempat Tanggal Lahir</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px] flex items-center justify-between">
            <span>{tempatLahir}</span>
            <span className="font-mono tracking-wider">{formatDateDisplay(tglLahir)}</span>
          </div>
        </div>

        {/* 6. Jenis Kelamin */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>6. Jenis Kelamin</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            {jenisKelamin}
          </div>
        </div>

        {/* 7. Alamat / No. Telp */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>7. Alamat / No. Telp</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            {alamat}
          </div>
        </div>
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4"></div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            Telp: {noTelp}
          </div>
        </div>

        {/* 8. Alamat email */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>8. Alamat email</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            {email}
          </div>
        </div>

        {/* 9. Negara Tujuan */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>9. Negara Tujuan</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            {negaraTujuan}
          </div>
        </div>

        {/* 10. Tanggal Keberangkatan */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>10. Tanggal Keberangkatan</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px] font-mono tracking-wider">
            {formatDateDisplay(tglKeberangkatan)}
          </div>
        </div>

        {/* 11. Jenis Vaksinasi */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>11. Jenis Vaksinasi</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            {jenisVaksin}
          </div>
        </div>

        {/* 12. Nama Travel / Agen */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>12. Nama Travel / Agen</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            {namaTravel}
          </div>
        </div>

        {/* 13. Alamat Travel / Agen */}
        <div className="grid grid-cols-12 gap-1 items-baseline">
          <div className="col-span-4 flex justify-between pr-2">
            <span>13. Alamat Travel / Agen</span>
            <span>:</span>
          </div>
          <div className="col-span-8 border-b border-dotted border-black/70 font-semibold px-1 pb-0.5 min-h-[20px]">
            {alamatTravel}
          </div>
        </div>
      </div>

      {/* Official Paragraphs matching reference scan */}
      <div className="mt-6 space-y-3.5 text-[12px] text-justify leading-relaxed text-black">
        <p>
          Dengan ini memohon kepada (Klinik KKP, Klinik, atau Rumah Sakit){' '}
          <strong className="underline uppercase">UOBK RSUD AL-MULK KOTA SUKABUMI</strong> agar
          dapat memberikan vaksinasi{' '}
          <strong className="underline">{jenisVaksin}</strong> kepada saya.
        </p>

        <p>
          Dengan ini saya juga menyatakan bahwa semua informasi yang berhubungan dengan vaksinasi ini
          telah saya ketahui, termasuk efek sampingnya atau Kejadian Ikutan Pasca Vaksinasi (KIPI).
        </p>

        <p>
          Demikianlah permohonan ini dibuat agar dapat dipergunakan sebagaimana mestinya.
        </p>
      </div>

      {/* Signature Section matching scan */}
      <div className="mt-8 flex justify-end">
        <div className="text-center w-64">
          <p className="text-[12px] mb-1">{currentDateDisplay()}</p>
          <p className="text-[13px] font-bold mb-16">Pemohon</p>
          <div className="border-b border-black w-48 mx-auto"></div>
          <p className="text-[12.5px] font-bold mt-1">( {nama} )</p>
        </div>
      </div>
    </div>
  );
}
