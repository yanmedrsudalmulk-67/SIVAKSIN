import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const dbFilePath = path.join(dataDir, 'sivaksin_db.json');
const uploadsDir = path.join(rootDir, 'public', 'uploads');

// Pastikan folder data dan uploads tersedia
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Data awal standar (Initial Seed) jika belum ada database lokal
const initialDatabase = {
  vaccines: [
    {
      id: 'v1',
      name: 'Meningitis Vaccine (Menveo)',
      price: 350000,
      stock: 120,
      description: 'Vaksin wajib untuk jamaah umroh dan haji.',
      benefits: ['Perlindungan dari radang selaput otak', 'Sertifikat Internasional (ICV)'],
      category: 'Wajib',
      protectionDuration: '2 Tahun'
    },
    {
      id: 'v2',
      name: 'Polio Vaccine (OPV/IPV)',
      price: 150000,
      stock: 50,
      description: 'Vaksin tambahan yang diwajibkan beberapa negara.',
      benefits: ['Mencegah kelumpuhan akibat virus polio', 'Aman untuk dewasa'],
      category: 'Wajib',
      protectionDuration: 'Seumur Hidup'
    },
    {
      id: 'v3',
      name: 'Influenza Vaccine (Vaxigrip)',
      price: 300000,
      stock: 200,
      description: 'Perlindungan flu tahunan untuk perjalanan wisata atau tugas kerja.',
      benefits: ['Mencegah infeksi virus influenza A dan B', 'Mengurangi risiko komplikasi pernapasan'],
      category: 'Dianjurkan',
      protectionDuration: '1 Tahun'
    }
  ],
  bookings: [
    {
      id: 'BK-RSAM01',
      vaccineId: 'v1',
      vaccineIds: ['v1'],
      date: '2026-06-10',
      time: '09:00 WIB',
      status: 'selesai',
      patient: {
        name: 'Budi Santoso',
        nik: '3272010101900001',
        passport: 'A9821321',
        handphone: '08123456789',
        purpose: 'Umroh',
        selectedVaccine: 'v1',
        selectedVaccines: ['v1'],
        selectedDate: '2026-06-10',
        selectedTime: '09:00 WIB',
        targetCountry: 'Arab Saudi',
        e_icv_status: 'diterbitkan',
        e_icv_file_name: 'Sertifikat_E-ICV_Resmi_Budi_Santoso.pdf',
        e_icv_issued_at: '2026-06-10T10:00:00.000Z'
      }
    }
  ],
  users: [
    {
      id: 'u_admin',
      username: 'admin',
      name: 'Administrator RSUD Al-Mulk',
      email: 'admin@rsudalmulk.sukabumi.go.id',
      password: 'password123',
      role: 'admin',
      nik: '3272011010880001',
      no_hp: '081288882568',
      alamat: 'Jl. Pelabuhan II KM 6, Sukabumi'
    },
    {
      id: 'u_demo_1',
      username: 'budi.santoso',
      name: 'Budi Santoso',
      email: 'budi.santoso@example.com',
      password: 'password123',
      role: 'user',
      nik: '3272010101900001',
      no_hp: '08123456789',
      no_passport: 'A9821321',
      alamat: 'Jl. Surya Kencana No. 45, Kota Sukabumi'
    }
  ],
  app_settings: {
    id: 'main_config',
    hospital_name: 'UOBK RSUD AL-MULK KOTA SUKABUMI',
    phone: '(0266) 6243088',
    address: 'Jl. Pelabuhan II KM. 6, Kel. Lembursitu, Kec. Lembursitu, Kota Sukabumi, Jawa Barat 43169',
    eicv_stock: 150,
    eicv_status: 'Tersedia',
    eicv_note: 'Stok blangko sertifikat internasional (E-ICV) fisik & digital tersedia melimpah di RSUD Al-Mulk.',
    app_logo: null,
    doc_logo_left: null,
    doc_logo_right: null,
    hero_bg_image: null,
    updated_at: new Date().toISOString()
  },
  anaphylactic_items: [
    { no: 1, nama: 'Nasal Canule', spesifikasi: 'Dewasa & Anak', stokAwal: 2, stokSisa: 2, noBatch: '22240527/ 21250415', expDate: 'Mar 2030', kondisi: 'Baik', kategori: 'Alat' },
    { no: 2, nama: 'APD', spesifikasi: 'Masker, Handscoon, Face Shield, Apron', stokAwal: 2, stokSisa: 2, noBatch: '5125', expDate: '2028', kondisi: 'Baik', kategori: 'Alat' },
    { no: 3, nama: 'Bag Valve Mask (Ambu Bag)', spesifikasi: 'Dewasa', stokAwal: 1, stokSisa: 1, noBatch: '133602', expDate: '2029', kondisi: 'Baik', kategori: 'Alat' },
    { no: 4, nama: 'Oksigen Transport', spesifikasi: 'Tabung & Regulator', stokAwal: 1, stokSisa: 1, noBatch: '0562', expDate: '2029', kondisi: 'Baik', kategori: 'Alat' },
    { no: 5, nama: 'Surflo (IV Catheter)', spesifikasi: 'No. 18 / 20 / 22', stokAwal: 2, stokSisa: 2, noBatch: '2405101', expDate: 'Mei 2029', kondisi: 'Baik', kategori: 'Alat' },
    { no: 6, nama: 'Infus Set Dewasa (Makro)', spesifikasi: 'Makro Drip', stokAwal: 2, stokSisa: 2, noBatch: '240409', expDate: 'Apr 2029', kondisi: 'Baik', kategori: 'Alat' },
    { no: 7, nama: 'Cairan Ringer Laktat (RL)', spesifikasi: '500 ml', stokAwal: 2, stokSisa: 2, noBatch: 'C43110A', expDate: 'Nov 2028', kondisi: 'Baik', kategori: 'Cairan' },
    { no: 8, nama: 'Epinefrin / Adrenalin Inj', spesifikasi: '1 mg/ml (Ampul)', stokAwal: 4, stokSisa: 4, noBatch: 'E2401', expDate: 'Jan 2027', kondisi: 'Baik', kategori: 'Obat' },
    { no: 9, nama: 'Dexamethasone Inj', spesifikasi: '5 mg/ml (Ampul)', stokAwal: 2, stokSisa: 2, noBatch: 'DX2309', expDate: 'Sep 2027', kondisi: 'Baik', kategori: 'Obat' },
    { no: 10, nama: 'Diphenhydramine Inj', spesifikasi: '10 mg/ml (Ampul)', stokAwal: 2, stokSisa: 2, noBatch: 'DP2402', expDate: 'Feb 2028', kondisi: 'Baik', kategori: 'Obat' },
    { no: 11, nama: 'Spuit 1 cc (Tuberculin)', spesifikasi: 'Jarum 26G / 27G', stokAwal: 5, stokSisa: 5, noBatch: 'SP1-2401', expDate: '2029', kondisi: 'Baik', kategori: 'Alat' },
    { no: 12, nama: 'Spuit 3 cc', spesifikasi: 'Steril Disposable', stokAwal: 4, stokSisa: 4, noBatch: 'SP3-2402', expDate: '2029', kondisi: 'Baik', kategori: 'Alat' },
    { no: 13, nama: 'Spuit 5 cc', spesifikasi: 'Steril Disposable', stokAwal: 2, stokSisa: 2, noBatch: 'SP5-2403', expDate: '2029', kondisi: 'Baik', kategori: 'Alat' },
    { no: 14, nama: 'Alcohol Swab', spesifikasi: '70% Isopropyl Alcohol', stokAwal: 10, stokSisa: 10, noBatch: 'AS2405', expDate: '2029', kondisi: 'Baik', kategori: 'Alat' },
    { no: 15, nama: 'Tourniquet', spesifikasi: 'Karet Elastis / Quick Release', stokAwal: 1, stokSisa: 1, noBatch: 'TQ-01', expDate: '2030', kondisi: 'Baik', kategori: 'Alat' },
    { no: 16, nama: 'Plester / Micropore', spesifikasi: 'Roll 1/2 inch', stokAwal: 1, stokSisa: 1, noBatch: 'PL-2401', expDate: '2029', kondisi: 'Baik', kategori: 'Alat' },
    { no: 17, nama: 'Kassa Steril', spesifikasi: 'Kotak / Pouch', stokAwal: 5, stokSisa: 5, noBatch: 'KS-2403', expDate: '2029', kondisi: 'Baik', kategori: 'Kassa' },
    { no: 18, nama: 'Tensimeter & Stetoskop', spesifikasi: 'Digital / Aneroid', stokAwal: 1, stokSisa: 1, noBatch: 'TS-01', expDate: '2030', kondisi: 'Baik', kategori: 'Alat' },
    { no: 19, nama: 'Pulse Oximeter', spesifikasi: 'Fingertip LED', stokAwal: 1, stokSisa: 1, noBatch: 'PO-2401', expDate: '2030', kondisi: 'Baik', kategori: 'Alat' },
    { no: 20, nama: 'Gunting Perban / Medis', spesifikasi: 'Stainless Steel', stokAwal: 1, stokSisa: 1, noBatch: 'GM-01', expDate: '2035', kondisi: 'Baik', kategori: 'Alat' }
  ],
  anaphylactic_meta: {
    unitRuangan: 'Klinik Vaksinasi Internasional',
    lokasiKit: 'Trolley Emergensi / Meja Tindakan Vaksin',
    periodeBulan: 'Oktober 2026',
    tanggalPemeriksaan: '2026-10-25',
    namaPetugas: 'Petugas Vaksinasi RSUD Al-Mulk',
    catatanPetugas: 'Kotak kit anafilaktik darurat tersimpan aman, terkunci dan siap siaga 24 jam.'
  },
  anaphylactic_history: [],
  notifications: [
    {
      id: 'notif_local_init',
      title: 'Selamat Datang di SIVAKSIN',
      message: 'Sistem penyimpanan data lokal aktif di komputer ini. Seluruh data pasien, vaksin, dan dokumen tersimpan secara aman dan mandiri di komputer Anda.',
      type: 'general',
      createdAt: new Date().toISOString(),
      read: false
    }
  ]
};

/**
 * Membaca data database dari file JSON lokal
 */
export function getDb() {
  try {
    if (!fs.existsSync(dbFilePath)) {
      saveDb(initialDatabase);
      return initialDatabase;
    }
    const content = fs.readFileSync(dbFilePath, 'utf8');
    const parsed = JSON.parse(content);
    return {
      ...initialDatabase,
      ...parsed
    };
  } catch (error) {
    console.error('Error membaca database lokal:', error);
    return initialDatabase;
  }
}

/**
 * Menyimpan data database ke file JSON lokal secara aman
 */
export function saveDb(data) {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    // Tulis ke temp file terlebih dahulu untuk proteksi atomic write
    const tempPath = `${dbFilePath}.tmp`;
    fs.writeFileSync(tempPath, jsonStr, 'utf8');
    fs.renameSync(tempPath, dbFilePath);
    return true;
  } catch (error) {
    console.error('Error menyimpan database lokal:', error);
    return false;
  }
}

/**
 * Menyimpan file yang diunggah (Base64 atau binary) ke public/uploads/
 */
export function saveUploadedFile(fileData, fileName, prefix = 'doc') {
  try {
    const timestamp = Date.now();
    const safeName = fileName 
      ? fileName.replace(/[^a-zA-Z0-9._-]/g, '_') 
      : `${prefix}_${timestamp}.jpg`;
    const finalFileName = `${prefix}_${timestamp}_${safeName}`;
    const targetPath = path.join(uploadsDir, finalFileName);

    let buffer;
    if (typeof fileData === 'string') {
      if (fileData.includes('base64,')) {
        const base64Content = fileData.split('base64,')[1];
        buffer = Buffer.from(base64Content, 'base64');
      } else {
        buffer = Buffer.from(fileData, 'base64');
      }
    } else if (Buffer.isBuffer(fileData)) {
      buffer = fileData;
    } else {
      throw new Error('Tipe data file tidak didukung');
    }

    fs.writeFileSync(targetPath, buffer);
    return {
      success: true,
      url: `/uploads/${finalFileName}`,
      fileName: finalFileName,
      path: targetPath
    };
  } catch (error) {
    console.error('Error menyimpan file lokal:', error);
    return {
      success: false,
      error: error.message || 'Gagal menyimpan file lokal'
    };
  }
}
