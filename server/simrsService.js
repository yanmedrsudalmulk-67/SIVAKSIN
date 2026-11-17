import mysql from 'mysql2/promise';
import './env.js';

// Konfigurasi Database SIMRS Khanza RSUD Al-Mulk (dibaca dari .env.local / environment)
const SIMRS_CONFIG = {
  host: process.env.SIMRS_HOST || 'localhost',
  port: Number(process.env.SIMRS_PORT || 3306),
  user: process.env.SIMRS_USER || '',
  password: process.env.SIMRS_PASSWORD || '',
  database: process.env.SIMRS_DATABASE || 'db_almulk',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 7000
};

// Default Dokter & Poli Vaksinasi Internasional
export const DEFAULT_SIMRS_CONFIG = {
  kd_poli: 'U0029',
  nm_poli: 'MEDICAL CHECK UP VAKSIN INTERNASIONAL',
  kd_dokter: 'D00057',
  nm_dokter: 'dr. M. Arifin Ramadhani',
  kd_pj: 'A02' // TUNAI
};

// Daftar Dokter Pemeriksa di Poli Vaksinasi Internasional
export const AVAILABLE_DOCTORS = [
  { kd_dokter: 'D00057', nm_dokter: 'dr. M. Arifin Ramadhani' },
  { kd_dokter: 'D00179', nm_dokter: 'dr. Chrysman Andreria Hatulely' }
];

// Daftar Perawat Vaksinator
export const AVAILABLE_VACCINATORS = [
  { nip: 'D00237', nama: 'Adi Tresa Purnama, A.M.Kep' },
  { nip: 'D00110', nama: 'Rany Nelvia Hermawati, Amd.Kep' }
];

// Daftar Petugas Administrasi
export const AVAILABLE_ADMIN_OFFICERS = [
  { nip: 'D00230', nama: 'Ina Nuraeni, S.AP' },
  { nip: 'D00134', nama: 'Yussy Alfiani Rachman, S.T' },
  { nip: 'D00287', nama: 'Giandeno Arianda, S.K.M' },
  { nip: 'D00029', nama: 'Rafiul Qomar, S.Sos' }
];

let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(SIMRS_CONFIG);
  }
  return pool;
}

/**
 * Uji koneksi ke database SIMRS Khanza
 */
export async function testSimrsConnection() {
  try {
    const p = getPool();
    const [rows] = await p.query('SELECT 1 as connected');
    return {
      success: true,
      connected: rows?.[0]?.connected === 1,
      host: SIMRS_CONFIG.host,
      database: SIMRS_CONFIG.database,
      poli: `${DEFAULT_SIMRS_CONFIG.kd_poli} - ${DEFAULT_SIMRS_CONFIG.nm_poli}`,
      dokter: `${DEFAULT_SIMRS_CONFIG.kd_dokter} - ${DEFAULT_SIMRS_CONFIG.nm_dokter}`
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      host: SIMRS_CONFIG.host,
      database: SIMRS_CONFIG.database
    };
  }
}

/**
 * Hitung umur dalam format Khanza: "X Th Y Bl Z Hr"
 */
function calculateAge(dobStr, targetDateStr = null) {
  if (!dobStr) return { umurStr: '0 Th 0 Bl 0 Hr', umurdaftar: 0, sttsumur: 'Th' };
  const dob = new Date(dobStr);
  const target = targetDateStr ? new Date(targetDateStr) : new Date();
  if (isNaN(dob.getTime())) return { umurStr: '0 Th 0 Bl 0 Hr', umurdaftar: 0, sttsumur: 'Th' };

  let years = target.getFullYear() - dob.getFullYear();
  let months = target.getMonth() - dob.getMonth();
  let days = target.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonthDays = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) {
    years = 0;
    months = 0;
    days = 0;
  }

  const umurStr = `${years} Th ${months} Bl ${days} Hr`;
  let umurdaftar = years;
  let sttsumur = 'Th';

  if (years === 0) {
    if (months > 0) {
      umurdaftar = months;
      sttsumur = 'Bl';
    } else {
      umurdaftar = Math.max(1, days);
      sttsumur = 'Hr';
    }
  }

  return { umurStr, umurdaftar, sttsumur };
}

/**
 * Format tanggal ke YYYY-MM-DD
 */
function formatDate(dateInput) {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Daftarkan atau Sinkronkan Booking SIVAKSIN ke SIMRS Khanza (reg_periksa & booking_registrasi)
 */
export async function syncBookingToSimrs(booking, options = {}) {
  if (!booking || !booking.patient) {
    throw new Error('Data booking atau data pasien tidak valid.');
  }

  const p = getPool();
  const patient = booking.patient;
  const patientName = (patient.fullName || patient.name || patient.nama || 'PASIEN VAKSIN').trim().toUpperCase();
  const nik = (patient.nik || '').trim();
  const dob = formatDate(patient.dob || patient.birthDate);
  const rawGender = (patient.gender || '').toLowerCase();
  const jk = (rawGender.includes('p') || rawGender.includes('wanita') || rawGender.includes('fem')) ? 'P' : 'L';
  const address = (patient.address || patient.alamat || '-').trim();
  const phone = (patient.phone || patient.whatsapp || patient.no_tlp || '-').trim();
  
  // Jika options.useCurrentDate true atau status booking adalah 'ditunda', gunakan tanggal hari ini
  const today = formatDate(new Date());
  const regDate = (options.useCurrentDate || booking.status === 'ditunda' || !booking.date) 
    ? today 
    : formatDate(booking.date);

  const { umurStr, umurdaftar, sttsumur } = calculateAge(dob, regDate);

  // Dokter Pemeriksa (dr. M. Arifin Ramadhani D00057 atau dr. Chrysman Andreria Hatulely D00179)
  const doctorCode = options.doctorCode || booking.doctor_code || booking.kd_dokter || DEFAULT_SIMRS_CONFIG.kd_dokter;
  const doctorObj = AVAILABLE_DOCTORS.find(d => d.kd_dokter === doctorCode) || {
    kd_dokter: doctorCode,
    nm_dokter: booking.doctor_name || (doctorCode === 'D00179' ? 'dr. Chrysman Andreria Hatulely' : DEFAULT_SIMRS_CONFIG.nm_dokter)
  };
  const doctorName = doctorObj.nm_dokter;

  // 1. Cek apakah pasien sudah memiliki nomor rekam medis tersimpan
  let no_rkm_medis = booking.simrs_no_rkm_medis || patient.simrs_no_rkm_medis || patient.no_rkm_medis || null;
  let stts_daftar = no_rkm_medis ? 'Lama' : 'Baru';

  if (!no_rkm_medis && nik && nik !== '-' && nik.length >= 10) {
    const [rowsByNik] = await p.query(
      'SELECT no_rkm_medis, nm_pasien, no_ktp FROM pasien WHERE no_ktp = ? LIMIT 1',
      [nik]
    );
    if (rowsByNik.length > 0) {
      no_rkm_medis = rowsByNik[0].no_rkm_medis;
      stts_daftar = 'Lama';
    }
  }

  if (!no_rkm_medis && patientName) {
    const [rowsByName] = await p.query(
      'SELECT no_rkm_medis, nm_pasien FROM pasien WHERE nm_pasien = ? AND tgl_lahir = ? LIMIT 1',
      [patientName, dob]
    );
    if (rowsByName.length > 0) {
      no_rkm_medis = rowsByName[0].no_rkm_medis;
      stts_daftar = 'Lama';
    }
  }

  // 2. Jika pasien baru (belum ada no_rkm_medis), generate nomor RM baru dan insert ke tabel pasien
  if (!no_rkm_medis) {
    stts_daftar = 'Baru';

    // Ambil nomor RM urut dari set_no_rkm_medis
    const [setRmRows] = await p.query('SELECT no_rkm_medis FROM set_no_rkm_medis LIMIT 1');
    let nextNum = 172500;
    if (setRmRows.length > 0 && setRmRows[0].no_rkm_medis) {
      nextNum = Number(setRmRows[0].no_rkm_medis) + 1;
    }

    no_rkm_medis = String(nextNum).padStart(6, '0');

    // Update counter RM di SIMRS
    await p.query('UPDATE set_no_rkm_medis SET no_rkm_medis = ?', [no_rkm_medis]);

    // Insert pasien baru
    const insertPasienSql = `
      INSERT INTO pasien (
        no_rkm_medis, nm_pasien, no_ktp, jk, tmp_lahir, tgl_lahir, nm_ibu, alamat, gol_darah,
        pekerjaan, stts_nikah, agama, tgl_daftar, no_tlp, umur, pnd, keluarga, namakeluarga,
        kd_pj, no_peserta, kd_kel, kd_kec, kd_kab, pekerjaanpj, alamatpj, kelurahanpj,
        kecamatanpj, kabupatenpj, perusahaan_pasien, suku_bangsa, bahasa_pasien, cacat_fisik,
        email, nip, kd_prop, propinsipj
      ) VALUES (
        ?, ?, ?, ?, '-', ?, '-', ?, '-',
        '-', 'BELUM MENIKAH', 'ISLAM', CURDATE(), ?, ?, '-', 'DIRI SENDIRI', ?,
        ?, '-', 0, 0, 0, '-', ?, '-',
        '-', '-', '-', 4, 3, 5,
        '-', 'D00237', 0, '-'
      )
    `;

    await p.query(insertPasienSql, [
      no_rkm_medis,
      patientName,
      nik || '-',
      jk,
      dob,
      address,
      phone,
      umurStr,
      patientName,
      DEFAULT_SIMRS_CONFIG.kd_pj,
      address
    ]);
  }

  // 3. Cek apakah sudah pernah diperiksa di poli ini (status_poli)
  let status_poli = 'Baru';
  const [visitedRows] = await p.query(
    'SELECT 1 FROM reg_periksa WHERE no_rkm_medis = ? AND kd_poli = ? LIMIT 1',
    [no_rkm_medis, DEFAULT_SIMRS_CONFIG.kd_poli]
  );
  if (visitedRows.length > 0) {
    status_poli = 'Lama';
  }

  // 4. Cek apakah sudah terdaftar di reg_periksa untuk tanggal yang sama atau sudah punya no_rawat
  let existingReg = [];
  if (booking.simrs_no_rawat) {
    const [byNoRawat] = await p.query(
      'SELECT no_reg, no_rawat, tgl_registrasi, stts, kd_dokter FROM reg_periksa WHERE no_rawat = ? LIMIT 1',
      [booking.simrs_no_rawat]
    );
    if (byNoRawat.length > 0) {
      existingReg = byNoRawat;
    }
  }

  if (existingReg.length === 0) {
    const [byRmDate] = await p.query(
      'SELECT no_reg, no_rawat, tgl_registrasi, stts, kd_dokter FROM reg_periksa WHERE no_rkm_medis = ? AND kd_poli = ? AND tgl_registrasi = ? LIMIT 1',
      [no_rkm_medis, DEFAULT_SIMRS_CONFIG.kd_poli, regDate]
    );
    if (byRmDate.length > 0) {
      existingReg = byRmDate;
    }
  }

  if (existingReg.length > 0) {
    const reg = existingReg[0];

    // JIKA DOKTER BERBEDA DENGAN DOKTER YANG DIPILIH, UPDATE DI SIMRS KHANZA
    if (reg.kd_dokter !== doctorCode) {
      try {
        await p.query(
          'UPDATE reg_periksa SET kd_dokter = ? WHERE no_rawat = ?',
          [doctorCode, reg.no_rawat]
        );
        await p.query(
          'UPDATE booking_registrasi SET kd_dokter = ? WHERE no_rkm_medis = ? AND (tanggal_periksa = ? OR kd_poli = ?)',
          [doctorCode, no_rkm_medis, reg.tgl_registrasi, DEFAULT_SIMRS_CONFIG.kd_poli]
        );
        console.log(`[SIMRS Doctor Update] Berhasil mengubah dokter di SIMRS: No.Rawat ${reg.no_rawat} -> ${doctorCode} (${doctorName})`);
      } catch (errUpd) {
        console.error('[SIMRS Doctor Update Error]:', errUpd.message);
      }
    }

    return {
      success: true,
      already_registered: true,
      no_rkm_medis,
      no_rawat: reg.no_rawat,
      no_reg: reg.no_reg,
      tgl_registrasi: reg.tgl_registrasi,
      stts: reg.stts,
      nm_pasien: patientName,
      kd_poli: DEFAULT_SIMRS_CONFIG.kd_poli,
      nm_poli: DEFAULT_SIMRS_CONFIG.nm_poli,
      kd_dokter: doctorCode,
      nm_dokter: doctorName,
      message: `Pasien terdaftar di SIMRS dengan No. Rawat ${reg.no_rawat} (Dokter: ${doctorName})`
    };
  }

  // 5. Generate no_rawat untuk tanggal tersebut: format YYYY/MM/DD/NNNNNN
  const dateParts = regDate.split('-');
  const datePrefix = `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
  
  const [maxRawatRows] = await p.query(
    'SELECT MAX(RIGHT(no_rawat, 6)) AS max_no FROM reg_periksa WHERE tgl_registrasi = ?',
    [regDate]
  );
  let nextRawatCounter = 1;
  if (maxRawatRows.length > 0 && maxRawatRows[0].max_no) {
    nextRawatCounter = Number(maxRawatRows[0].max_no) + 1;
  }
  const no_rawat = `${datePrefix}/${String(nextRawatCounter).padStart(6, '0')}`;

  // 6. Generate nomor antrean no_reg untuk dokter & poli pada tanggal tersebut
  const [maxRegRows] = await p.query(
    'SELECT MAX(CAST(no_reg AS UNSIGNED)) AS max_reg FROM reg_periksa WHERE tgl_registrasi = ? AND kd_poli = ? AND kd_dokter = ?',
    [regDate, DEFAULT_SIMRS_CONFIG.kd_poli, doctorCode]
  );
  let nextRegCounter = 1;
  if (maxRegRows.length > 0 && maxRegRows[0].max_reg) {
    nextRegCounter = Number(maxRegRows[0].max_reg) + 1;
  }
  const no_reg = String(nextRegCounter).padStart(3, '0');

  // 7. Insert ke tabel reg_periksa SIMRS Khanza
  const insertRegSql = `
    INSERT INTO reg_periksa (
      no_reg, no_rawat, tgl_registrasi, jam_reg, kd_dokter, no_rkm_medis, kd_poli,
      p_jawab, almt_pj, hubunganpj, biaya_reg, stts, stts_daftar, status_lanjut,
      kd_pj, umurdaftar, sttsumur, status_bayar, status_poli
    ) VALUES (
      ?, ?, ?, CURTIME(), ?, ?, ?,
      ?, ?, 'DIRI SENDIRI', 0, 'Belum', ?, 'Ralan',
      ?, ?, ?, 'Belum Bayar', ?
    )
  `;

  await p.query(insertRegSql, [
    no_reg,
    no_rawat,
    regDate,
    doctorCode,
    no_rkm_medis,
    DEFAULT_SIMRS_CONFIG.kd_poli,
    patientName,
    address,
    stts_daftar,
    DEFAULT_SIMRS_CONFIG.kd_pj,
    umurdaftar,
    sttsumur,
    status_poli
  ]);

  // 8. Insert juga ke tabel booking_registrasi untuk riwayat booking terpusat di SIMRS
  try {
    const insertBookingSql = `
      INSERT INTO booking_registrasi (
        tanggal_booking, jam_booking, no_rkm_medis, tanggal_periksa,
        kd_dokter, kd_poli, no_reg, kd_pj, limit_reg, waktu_kunjungan, status
      ) VALUES (
        CURDATE(), CURTIME(), ?, ?,
        ?, ?, ?, ?, 0, CONCAT(?, ' 09:00:00'), 'Belum'
      )
      ON DUPLICATE KEY UPDATE status = 'Belum'
    `;

    await p.query(insertBookingSql, [
      no_rkm_medis,
      regDate,
      doctorCode,
      DEFAULT_SIMRS_CONFIG.kd_poli,
      no_reg,
      DEFAULT_SIMRS_CONFIG.kd_pj,
      regDate
    ]);
  } catch (errBooking) {
    console.warn('[SIMRS booking_registrasi note]:', errBooking.message);
  }

  return {
    success: true,
    no_rawat,
    no_reg,
    no_rkm_medis,
    tgl_registrasi: regDate,
    stts_daftar,
    nm_pasien: patientName,
    kd_poli: DEFAULT_SIMRS_CONFIG.kd_poli,
    nm_poli: DEFAULT_SIMRS_CONFIG.nm_poli,
    kd_dokter: doctorCode,
    nm_dokter: doctorName,
    message: `Pendaftaran berhasil masuk ke SIMRS Khanza Poli Vaksinasi Internasional (No. Rawat: ${no_rawat}, Antrean: ${no_reg})`
  };
}

/**
 * Hapus / batalkan pendaftaran pasien di SIMRS Khanza (reg_periksa & booking_registrasi).
 * Digunakan saat pasien ditunda vaksinnya karena penyakit/kondisi medis, atau saat data pendaftaran dihapus dari SIVAKSIN.
 */
export async function deleteBookingFromSimrs(booking) {
  if (!booking) {
    return { success: false, error: 'Data booking kosong' };
  }

  const p = getPool();
  const no_rawat = booking.simrs_no_rawat || booking.no_rawat;
  const no_rkm_medis = booking.simrs_no_rkm_medis || booking.patient?.simrs_no_rkm_medis || booking.patient?.no_rkm_medis;
  const regDate = formatDate(booking.date);

  let deletedReg = 0;
  let deletedBooking = 0;

  try {
    // 1. Hapus dari booking_registrasi jika ada no_rkm_medis
    if (no_rkm_medis) {
      try {
        const [resBooking] = await p.query(
          'DELETE FROM booking_registrasi WHERE no_rkm_medis = ? AND (tanggal_periksa = ? OR kd_poli = ?)',
          [no_rkm_medis, regDate, DEFAULT_SIMRS_CONFIG.kd_poli]
        );
        deletedBooking = resBooking.affectedRows;
      } catch (errBooking) {
        console.warn('[SIMRS delete booking_registrasi note]:', errBooking.message);
      }
    }

    // 2. Hapus dari reg_periksa
    if (no_rawat) {
      const [resReg] = await p.query('DELETE FROM reg_periksa WHERE no_rawat = ?', [no_rawat]);
      deletedReg = resReg.affectedRows;
    } else if (no_rkm_medis) {
      const [resReg] = await p.query(
        'DELETE FROM reg_periksa WHERE no_rkm_medis = ? AND kd_poli = ? AND tgl_registrasi = ?',
        [no_rkm_medis, DEFAULT_SIMRS_CONFIG.kd_poli, regDate]
      );
      deletedReg = resReg.affectedRows;
    }

    return {
      success: true,
      deletedReg,
      deletedBooking,
      no_rawat,
      no_rkm_medis,
      message: `Pendaftaran di SIMRS berhasil dibatalkan/dihapus (No. Rawat: ${no_rawat || '-'}).`
    };
  } catch (err) {
    console.error('[SIMRS delete error]:', err.message);
    return {
      success: false,
      error: err.message,
      no_rawat,
      no_rkm_medis
    };
  }
}

/**
 * Update langsung dokter pemeriksa di SIMRS Khanza berdasarkan no_rawat
 */
export async function updateSimrsDoctor(no_rawat, doctorCode) {
  if (!no_rawat || !doctorCode) {
    return { success: false, error: 'no_rawat dan doctorCode harus diisi' };
  }
  const doctorObj = AVAILABLE_DOCTORS.find(d => d.kd_dokter === doctorCode) || {
    kd_dokter: doctorCode,
    nm_dokter: doctorCode === 'D00179' ? 'dr. Chrysman Andreria Hatulely' : DEFAULT_SIMRS_CONFIG.nm_dokter
  };

  try {
    const p = getPool();
    const [resReg] = await p.query(
      'UPDATE reg_periksa SET kd_dokter = ? WHERE no_rawat = ?',
      [doctorCode, no_rawat]
    );

    // Ambil no_rkm_medis untuk update booking_registrasi
    const [rows] = await p.query('SELECT no_rkm_medis, tgl_registrasi FROM reg_periksa WHERE no_rawat = ? LIMIT 1', [no_rawat]);
    if (rows.length > 0) {
      await p.query(
        'UPDATE booking_registrasi SET kd_dokter = ? WHERE no_rkm_medis = ? AND (tanggal_periksa = ? OR kd_poli = ?)',
        [doctorCode, rows[0].no_rkm_medis, rows[0].tgl_registrasi, DEFAULT_SIMRS_CONFIG.kd_poli]
      );
    }

    console.log(`[SIMRS Direct Doctor Update] No.Rawat: ${no_rawat} -> ${doctorCode} (${doctorObj.nm_dokter}), affected: ${resReg.affectedRows}`);
    return {
      success: true,
      no_rawat,
      kd_dokter: doctorCode,
      nm_dokter: doctorObj.nm_dokter,
      affectedRows: resReg.affectedRows
    };
  } catch (err) {
    console.error('[SIMRS updateSimrsDoctor error]:', err.message);
    return { success: false, error: err.message };
  }
}
