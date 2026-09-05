export interface AnaphylacticItem {
  no: number;
  nama: string;
  spesifikasi: string;
  stokAwal: number;
  stokSisa: number;
  noBatch: string;
  expDate: string;
  kondisi: 'Baik' | 'Tidak';
  kategori?: 'Alat' | 'Obat' | 'Cairan' | 'Kassa';
}

export interface AnaphylacticFormMeta {
  unitRuangan: string;
  lokasiKit?: string;
  periodeBulan?: string;
  tanggalPemeriksaan: string;
  namaPetugas: string;
  catatanPetugas?: string;
}

export interface AnaphylacticHistoryRecord {
  id: string;
  tanggalPemeriksaan: string; // YYYY-MM-DD
  unitRuangan: string;
  namaPetugas: string;
  catatanPetugas?: string;
  totalItem: number;
  itemsLengkap: number;
  itemsKurang: number;
  itemsRusak: number;
  persentaseKesiapan: number;
  items: AnaphylacticItem[];
  createdAt: string;
}

export const defaultFormMeta: AnaphylacticFormMeta = {
  unitRuangan: 'Klinik Vaksinasi Internasional',
  lokasiKit: 'Trolley Emergensi / Meja Tindakan Vaksin',
  periodeBulan: 'September 2026',
  tanggalPemeriksaan: '2026-09-04',
  namaPetugas: 'Adi Tresa Purnama',
  catatanPetugas: 'Kotak kit terkunci rapi dengan segel pengaman dalam kondisi baik dan lengkap.',
};

export const defaultAnaphylacticItems: AnaphylacticItem[] = [
  {
    no: 1,
    nama: 'Nasal Canule',
    spesifikasi: 'Dewasa & Anak',
    stokAwal: 2,
    stokSisa: 2,
    noBatch: '22240527/ 21250415',
    expDate: 'Mar 2030',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
  {
    no: 2,
    nama: 'APD',
    spesifikasi: 'Handscoen & Masker',
    stokAwal: 2,
    stokSisa: 2,
    noBatch: '203157681SLZA',
    expDate: 'Mar 2029',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
  {
    no: 3,
    nama: 'Spuit',
    spesifikasi: '3 cc',
    stokAwal: 2,
    stokSisa: 2,
    noBatch: '17062588',
    expDate: 'Mei 2030',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
  {
    no: 4,
    nama: 'Spuit',
    spesifikasi: '5 cc',
    stokAwal: 2,
    stokSisa: 2,
    noBatch: '21052588',
    expDate: 'Apr 2030',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
  {
    no: 5,
    nama: 'Infus Set',
    spesifikasi: 'Macro',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '42001E006',
    expDate: 'Sep 2029',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
  {
    no: 6,
    nama: 'Infus Set',
    spesifikasi: 'Micro',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '22062388',
    expDate: 'Mei 2028',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
  {
    no: 7,
    nama: 'Abocath',
    spesifikasi: 'No. 20',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '3339324M',
    expDate: 'Okt 2029',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
  {
    no: 8,
    nama: 'Abocath',
    spesifikasi: 'No. 22',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '3339122M',
    expDate: 'Okt 2029',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
  {
    no: 9,
    nama: 'Abocath',
    spesifikasi: 'No. 24',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '3339324M',
    expDate: 'Okt 2029',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
  {
    no: 10,
    nama: 'Adrenalin',
    spesifikasi: 'Ampul',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '76344001-1',
    expDate: 'Mar 2027',
    kondisi: 'Baik',
    kategori: 'Obat',
  },
  {
    no: 11,
    nama: 'Diphenhidramin',
    spesifikasi: 'Ampul',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: 'PIB19455',
    expDate: 'Jan 2028',
    kondisi: 'Baik',
    kategori: 'Obat',
  },
  {
    no: 12,
    nama: 'Dexamethasone',
    spesifikasi: 'Ampul',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: 'PID76454',
    expDate: 'Mar 2027',
    kondisi: 'Baik',
    kategori: 'Obat',
  },
  {
    no: 13,
    nama: 'Aminophilin',
    spesifikasi: 'Ampul',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: 'E23K0248A',
    expDate: 'Nov 2026',
    kondisi: 'Baik',
    kategori: 'Obat',
  },
  {
    no: 14,
    nama: 'Ringer Laktat',
    spesifikasi: 'Cairan infus',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: 'F252A50',
    expDate: 'Jan 2027',
    kondisi: 'Baik',
    kategori: 'Cairan',
  },
  {
    no: 15,
    nama: 'Nacl',
    spesifikasi: 'Cairan infus',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '450304',
    expDate: 'Feb 2027',
    kondisi: 'Baik',
    kategori: 'Cairan',
  },
  {
    no: 16,
    nama: 'Plester',
    spesifikasi: '-',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '-',
    expDate: '-',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
  {
    no: 17,
    nama: 'Kassa Steril',
    spesifikasi: '-',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '-',
    expDate: 'Sep 2027',
    kondisi: 'Baik',
    kategori: 'Kassa',
  },
  {
    no: 18,
    nama: 'Kassa Tampon',
    spesifikasi: '-',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '-',
    expDate: '-',
    kondisi: 'Baik',
    kategori: 'Kassa',
  },
  {
    no: 19,
    nama: 'Leukomed',
    spesifikasi: '-',
    stokAwal: 1,
    stokSisa: 1,
    noBatch: '01112488',
    expDate: '-',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
  {
    no: 20,
    nama: 'Alkohol Swab',
    spesifikasi: 'Pcs',
    stokAwal: 6,
    stokSisa: 6,
    noBatch: '202511',
    expDate: 'Nov 2030',
    kondisi: 'Baik',
    kategori: 'Alat',
  },
];

export const initialHistoryRecords: AnaphylacticHistoryRecord[] = [];

