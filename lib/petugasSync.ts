import pool from '@/lib/db';

export const KECAMATAN_SEEDS = [
  { id_kecamatan: 1, kecamatan: 'Ayah' },
  { id_kecamatan: 2, kecamatan: 'Buayan' },
  { id_kecamatan: 3, kecamatan: 'Puring' },
  { id_kecamatan: 4, kecamatan: 'Petanahan' },
  { id_kecamatan: 5, kecamatan: 'Klirong' },
  { id_kecamatan: 6, kecamatan: 'Buluspesantren' },
  { id_kecamatan: 7, kecamatan: 'Ambal' },
  { id_kecamatan: 8, kecamatan: 'Mirit' },
  { id_kecamatan: 9, kecamatan: 'Bonorowo' },
  { id_kecamatan: 10, kecamatan: 'Prembun' },
  { id_kecamatan: 11, kecamatan: 'Padureso' },
  { id_kecamatan: 12, kecamatan: 'Kutowinangun' },
  { id_kecamatan: 13, kecamatan: 'Alian' },
  { id_kecamatan: 14, kecamatan: 'Poncowarno' },
  { id_kecamatan: 15, kecamatan: 'Kebumen' },
  { id_kecamatan: 16, kecamatan: 'Pejagoan' },
  { id_kecamatan: 17, kecamatan: 'Sruweng' },
  { id_kecamatan: 18, kecamatan: 'Adimulyo' },
  { id_kecamatan: 19, kecamatan: 'Kuwarasan' },
  { id_kecamatan: 20, kecamatan: 'Rowokele' },
  { id_kecamatan: 21, kecamatan: 'Sempor' },
  { id_kecamatan: 22, kecamatan: 'Gombong' },
  { id_kecamatan: 23, kecamatan: 'Karanganyar' },
  { id_kecamatan: 24, kecamatan: 'Karanggayam' },
  { id_kecamatan: 25, kecamatan: 'Sadang' },
  { id_kecamatan: 26, kecamatan: 'Karangsambung' },
];

export const WILAYAH_BINAAN_SEEDS = [
  { id_wilayah_binaan: 1, id_puskeswan: 1, id_kecamatan: 8, nama_puskeswan: 'Puskeswan Mirit', binaan: 'MIRIT' },
  { id_wilayah_binaan: 2, id_puskeswan: 1, id_kecamatan: 7, nama_puskeswan: 'Puskeswan Mirit', binaan: 'AMBAL' },
  { id_wilayah_binaan: 3, id_puskeswan: 1, id_kecamatan: 9, nama_puskeswan: 'Puskeswan Mirit', binaan: 'BONOROWO' },
  { id_wilayah_binaan: 4, id_puskeswan: 2, id_kecamatan: 5, nama_puskeswan: 'Puskeswan Klirong', binaan: 'KLIRONG' },
  { id_wilayah_binaan: 5, id_puskeswan: 2, id_kecamatan: 4, nama_puskeswan: 'Puskeswan Klirong', binaan: 'PETANAHAN' },
  { id_wilayah_binaan: 6, id_puskeswan: 2, id_kecamatan: 18, nama_puskeswan: 'Puskeswan Klirong', binaan: 'ADIMULYO' },
  { id_wilayah_binaan: 7, id_puskeswan: 3, id_kecamatan: 3, nama_puskeswan: 'Puskeswan Gombong', binaan: 'PURING' },
  { id_wilayah_binaan: 8, id_puskeswan: 3, id_kecamatan: 22, nama_puskeswan: 'Puskeswan Gombong', binaan: 'GOMBONG' },
  { id_wilayah_binaan: 9, id_puskeswan: 3, id_kecamatan: 21, nama_puskeswan: 'Puskeswan Gombong', binaan: 'SEMPOR' },
  { id_wilayah_binaan: 10, id_puskeswan: 3, id_kecamatan: 19, nama_puskeswan: 'Puskeswan Gombong', binaan: 'KUWARASAN' },
  { id_wilayah_binaan: 11, id_puskeswan: 4, id_kecamatan: 2, nama_puskeswan: 'Puskeswan Buayan', binaan: 'BUAYAN' },
  { id_wilayah_binaan: 12, id_puskeswan: 4, id_kecamatan: 1, nama_puskeswan: 'Puskeswan Buayan', binaan: 'AYAH' },
  { id_wilayah_binaan: 13, id_puskeswan: 4, id_kecamatan: 20, nama_puskeswan: 'Puskeswan Buayan', binaan: 'ROWOKELE' },
  { id_wilayah_binaan: 14, id_puskeswan: 5, id_kecamatan: 13, nama_puskeswan: 'Puskeswan Alian', binaan: 'ALIAN' },
  { id_wilayah_binaan: 15, id_puskeswan: 5, id_kecamatan: 25, nama_puskeswan: 'Puskeswan Alian', binaan: 'SADANG' },
  { id_wilayah_binaan: 16, id_puskeswan: 5, id_kecamatan: 26, nama_puskeswan: 'Puskeswan Alian', binaan: 'KARANGSAMBUNG' },
  { id_wilayah_binaan: 17, id_puskeswan: 6, id_kecamatan: 11, nama_puskeswan: 'Puskeswan Prembun', binaan: 'PADURESO' },
  { id_wilayah_binaan: 18, id_puskeswan: 6, id_kecamatan: 10, nama_puskeswan: 'Puskeswan Prembun', binaan: 'PREMBUN' },
  { id_wilayah_binaan: 19, id_puskeswan: 6, id_kecamatan: 12, nama_puskeswan: 'Puskeswan Prembun', binaan: 'KUTOWINANGUN' },
  { id_wilayah_binaan: 20, id_puskeswan: 7, id_kecamatan: 15, nama_puskeswan: 'Puskeswan Kebumen', binaan: 'KEBUMEN' },
  { id_wilayah_binaan: 21, id_puskeswan: 7, id_kecamatan: 14, nama_puskeswan: 'Puskeswan Kebumen', binaan: 'PONCOWARNO' },
  { id_wilayah_binaan: 22, id_puskeswan: 7, id_kecamatan: 6, nama_puskeswan: 'Puskeswan Kebumen', binaan: 'BULUSPESANTREN' },
  { id_wilayah_binaan: 23, id_puskeswan: 8, id_kecamatan: 16, nama_puskeswan: 'Puskeswan Karanganyar', binaan: 'PEJAGOAN' },
  { id_wilayah_binaan: 24, id_puskeswan: 8, id_kecamatan: 23, nama_puskeswan: 'Puskeswan Karanganyar', binaan: 'KARANGANYAR' },
  { id_wilayah_binaan: 25, id_puskeswan: 8, id_kecamatan: 24, nama_puskeswan: 'Puskeswan Karanganyar', binaan: 'KARANGGAYAM' },
  { id_wilayah_binaan: 26, id_puskeswan: 8, id_kecamatan: 17, nama_puskeswan: 'Puskeswan Karanganyar', binaan: 'SRUWENG' },
];

export const INITIAL_PETUGAS_IB_SEEDS = [
  { no_urut: 1, nama_petugas: 'Dino Eko Tunggal, A.Md', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: null, id_wilayah_binaan: 11, wilayah_puskeswan: 'Puskeswan Buayan', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 2, nama_petugas: 'Tugino', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: 20, id_wilayah_binaan: 11, wilayah_puskeswan: 'Puskeswan Buayan', wilayah_kerja_tambahan: 'Kec. Rowokele, Kec. Buayan', wt2: 2, wt3: null, wt4: null, wt5: null },
  { no_urut: 3, nama_petugas: 'Suyanto, A.Md', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: null, id_wilayah_binaan: 11, wilayah_puskeswan: 'Puskeswan Buayan', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 4, nama_petugas: 'Achmad Zaenurrochman', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: 3, id_wilayah_binaan: 11, wilayah_puskeswan: 'Puskeswan Buayan', wilayah_kerja_tambahan: 'Kec. Puring', wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 5, nama_petugas: 'Sutono', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: 3, id_wilayah_binaan: 11, wilayah_puskeswan: 'Puskeswan Buayan', wilayah_kerja_tambahan: 'Kec. Puring', wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 6, nama_petugas: 'Sigit Ary Widodo', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: null, id_wilayah_binaan: 11, wilayah_puskeswan: 'Puskeswan Buayan', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 7, nama_petugas: 'Muhlihun', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: 3, id_wilayah_binaan: 7, wilayah_puskeswan: 'Puskeswan Gombong', wilayah_kerja_tambahan: 'Kec. Puring, Kec. Adimulyo', wt2: 18, wt3: null, wt4: null, wt5: null },
  { no_urut: 8, nama_petugas: 'Fathurrohman', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: 21, id_wilayah_binaan: 23, wilayah_puskeswan: 'Puskeswan Karanganyar', wilayah_kerja_tambahan: 'Kec. Sempor, Kec. Karanganyar', wt2: 23, wt3: null, wt4: null, wt5: null },
  { no_urut: 9, nama_petugas: 'David Sardiono', kompetensi: 'IB, Paramedik', wt1: 2, id_wilayah_binaan: 7, wilayah_puskeswan: 'Puskeswan Gombong', wilayah_kerja_tambahan: 'Kec. Buayan, Kec. Karanganyar', wt2: 23, wt3: null, wt4: null, wt5: null },
  { no_urut: 10, nama_petugas: 'Khabib', kompetensi: 'IB, PKB', wt1: null, id_wilayah_binaan: 1, wilayah_puskeswan: 'Puskeswan Mirit', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 11, nama_petugas: 'Taufik Adi Nugroho, S.Pt', kompetensi: 'IB', wt1: 14, id_wilayah_binaan: 17, wilayah_puskeswan: 'Puskeswan Prembun', wilayah_kerja_tambahan: 'Kec. Poncowarno, Kec. Alian', wt2: 13, wt3: null, wt4: null, wt5: null },
  { no_urut: 12, nama_petugas: 'Saiman Hadi Sumanto', kompetensi: 'IB, Paramedik', wt1: null, id_wilayah_binaan: 11, wilayah_puskeswan: 'Puskeswan Buayan', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 13, nama_petugas: 'Mokhamad Rofingi, S.Pt', kompetensi: 'IB', wt1: 18, id_wilayah_binaan: 23, wilayah_puskeswan: 'Puskeswan Karanganyar', wilayah_kerja_tambahan: 'Kec. Adimulyo', wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 14, nama_petugas: 'Ir. Sada Heru Sucipto', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: 19, id_wilayah_binaan: 7, wilayah_puskeswan: 'Puskeswan Gombong', wilayah_kerja_tambahan: 'Kec. Kuwarasan, Kec. Buayan', wt2: 2, wt3: null, wt4: null, wt5: null },
  { no_urut: 15, nama_petugas: 'drh. Ayu Dewi Puspitasari', kompetensi: 'IB, PKB, ATR', wt1: 19, id_wilayah_binaan: 7, wilayah_puskeswan: 'Puskeswan Gombong', wilayah_kerja_tambahan: 'Kec. Kuwarasan, Kec. Buayan', wt2: 2, wt3: null, wt4: null, wt5: null },
  { no_urut: 16, nama_petugas: 'Parsito, A.Md.', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: null, id_wilayah_binaan: 7, wilayah_puskeswan: 'Puskeswan Gombong', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 17, nama_petugas: 'Wahyudin', kompetensi: 'IB, Paramedik', wt1: null, id_wilayah_binaan: 1, wilayah_puskeswan: 'Puskeswan Mirit', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 18, nama_petugas: 'Rois Khalwani, S.Pt', kompetensi: 'IB', wt1: 23, id_wilayah_binaan: 4, wilayah_puskeswan: 'Puskeswan Klirong', wilayah_kerja_tambahan: 'Kec. Karanganyar, Kec. Pejagoan', wt2: 16, wt3: null, wt4: null, wt5: null },
  { no_urut: 19, nama_petugas: 'Subakir', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: null, id_wilayah_binaan: 23, wilayah_puskeswan: 'Puskeswan Karanganyar', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 20, nama_petugas: 'Joko Setyono', kompetensi: 'IB, PKB, Paramedik', wt1: null, id_wilayah_binaan: 20, wilayah_puskeswan: 'Puskeswan Kebumen', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 21, nama_petugas: 'Suroto, A.Md', kompetensi: 'IB, PKB, ATR, T.E, Paramedik', wt1: null, id_wilayah_binaan: 23, wilayah_puskeswan: 'Puskeswan Karanganyar', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 22, nama_petugas: 'Rokhmat', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: null, id_wilayah_binaan: 23, wilayah_puskeswan: 'Puskeswan Karanganyar', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 23, nama_petugas: 'Sutrisno, S.ST', kompetensi: 'IB, PKB, ATR, Paramedik', wt1: null, id_wilayah_binaan: 4, wilayah_puskeswan: 'Puskeswan Klirong', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 24, nama_petugas: 'Rijalul Haq, S.Tr.Pt', kompetensi: 'IB', wt1: null, id_wilayah_binaan: 4, wilayah_puskeswan: 'Puskeswan Klirong', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 25, nama_petugas: 'Amin Nur Hidayat, S.Pt', kompetensi: 'IB', wt1: 14, id_wilayah_binaan: 14, wilayah_puskeswan: 'Puskeswan Alian', wilayah_kerja_tambahan: 'Kec. Poncowarno, Kec. Buluspesantren', wt2: 6, wt3: null, wt4: null, wt5: null },
  { no_urut: 26, nama_petugas: 'Abah Rahmadal Hasan, S.Tr.Pt', kompetensi: 'IB', wt1: 14, id_wilayah_binaan: 14, wilayah_puskeswan: 'Puskeswan Alian', wilayah_kerja_tambahan: 'Kec. Poncowarno, Kec. Buluspesantren', wt2: 6, wt3: null, wt4: null, wt5: null },
  { no_urut: 27, nama_petugas: 'Suratman, A.Md', kompetensi: 'IB, Paramedik', wt1: null, id_wilayah_binaan: 1, wilayah_puskeswan: 'Puskeswan Mirit', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 28, nama_petugas: 'Tomi Wahyudin, A.Md. Vet', kompetensi: 'IB, Paramedik', wt1: 2, id_wilayah_binaan: 7, wilayah_puskeswan: 'Puskeswan Gombong', wilayah_kerja_tambahan: 'Kec. Buayan', wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 29, nama_petugas: 'Veria Ariyanti, S.Tr.Pt', kompetensi: 'IB', wt1: null, id_wilayah_binaan: 1, wilayah_puskeswan: 'Puskeswan Mirit', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 30, nama_petugas: 'Dwi Wahyono, S.Pt', kompetensi: 'IB', wt1: null, id_wilayah_binaan: 7, wilayah_puskeswan: 'Puskeswan Gombong', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 31, nama_petugas: 'drh. Wahyu Eri Setyawan', kompetensi: 'IB, PKB, ATR, Medik Vet', wt1: null, id_wilayah_binaan: 20, wilayah_puskeswan: 'Puskeswan Kebumen', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 32, nama_petugas: "Ahmad Wiji Mu'aziz", kompetensi: 'IB', wt1: 2, id_wilayah_binaan: 7, wilayah_puskeswan: 'Puskeswan Gombong', wilayah_kerja_tambahan: 'Kec. Buayan, Kec. Rowokele', wt2: 20, wt3: null, wt4: null, wt5: null },
  { no_urut: 33, nama_petugas: 'Ali Khoirul Aziz, S.Tr.Vet.', kompetensi: 'IB, Paramedik', wt1: 26, id_wilayah_binaan: 17, wilayah_puskeswan: 'Puskeswan Prembun', wilayah_kerja_tambahan: 'Kec. Karangsambung, Kec. Sadang', wt2: 25, wt3: null, wt4: null, wt5: null },
  { no_urut: 34, nama_petugas: 'Faizal Ibnu Darmawan', kompetensi: 'IB', wt1: null, id_wilayah_binaan: 14, wilayah_puskeswan: 'Puskeswan Alian', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 35, nama_petugas: 'slamet', kompetensi: 'IB', wt1: null, id_wilayah_binaan: 1, wilayah_puskeswan: 'Puskeswan Mirit', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 36, nama_petugas: 'Puskeswan Mirit', kompetensi: 'IB', wt1: null, id_wilayah_binaan: 1, wilayah_puskeswan: 'Puskeswan Mirit', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 37, nama_petugas: 'Puskeswan Prembun', kompetensi: 'IB', wt1: null, id_wilayah_binaan: 17, wilayah_puskeswan: 'Puskeswan Prembun', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 38, nama_petugas: 'Puskeswan Kebumen', kompetensi: 'IB', wt1: null, id_wilayah_binaan: 20, wilayah_puskeswan: 'Puskeswan Kebumen', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 39, nama_petugas: 'Puskeswan Klirong', kompetensi: 'Keswan', wt1: null, id_wilayah_binaan: 4, wilayah_puskeswan: 'Puskeswan Klirong', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 40, nama_petugas: 'Puskeswan Gombong', kompetensi: 'Keswan', wt1: null, id_wilayah_binaan: 7, wilayah_puskeswan: 'Puskeswan Gombong', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 41, nama_petugas: 'Puskeswan Buayan', kompetensi: 'Keswan', wt1: null, id_wilayah_binaan: 11, wilayah_puskeswan: 'Puskeswan Buayan', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 42, nama_petugas: 'Puskeswan Alian', kompetensi: 'Keswan', wt1: null, id_wilayah_binaan: 14, wilayah_puskeswan: 'Puskeswan Alian', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
  { no_urut: 43, nama_petugas: 'Puskeswan Karanganyar', kompetensi: 'Keswan', wt1: null, id_wilayah_binaan: 23, wilayah_puskeswan: 'Puskeswan Karanganyar', wilayah_kerja_tambahan: null, wt2: null, wt3: null, wt4: null, wt5: null },
];

/**
 * Peta nama petugas di tabel petugas_ib ke nama akun di tabel anggota_users.
 */
export const OFFICER_NAME_TO_ANGGOTA_NAME: Record<string, string> = {
  'dino eko tunggal, a.md': 'dino eko',
  'tugino': 'tugino',
  'suyanto, a.md': 'suyatno',
  'achmad zaenurrochman': 'achmad zaenurrohman',
  'sutono': 'sutono',
  'sigit ary widodo': 'sigit ari',
  'muhlihun': 'muhlihun',
  'fathurrohman': 'fathurrohman',
  'david sardiono': 'david sardiono',
  'khabib': 'khabib',
  'taufik adi nugroho, s.pt': 'taufik adi n',
  'saiman hadi sumanto': 'saiman hadi s',
  'mokhamad rofingi, s.pt': 'mokhamad rofingi',
  'ir. sada heru sucipto': 'sada heru',
  'parsito, a.md.': 'parsito',
  'wahyudin': 'wahyudin',
  'rois khalwani, s.pt': 'rois khalwani',
  'subakir': 'subakir',
  'joko setyono': 'joko setyono',
  'suroto, a.md': 'suroto',
  'rokhmat': 'rochmat',
  'sutrisno, s.st': 'sutrisno',
  'rijalul haq, s.tr.pt': 'rijalul haq',
  'amin nur hidayat, s.pt': 'amin nur h.',
  'abah rahmadal hasan, s.tr.pt': 'abah ramadal',
  'tomi wahyudin, a.md. vet': 'tomi w',
  'veria ariyanti, s.tr.pt': 'veria ariyanti',
  'dwi wahyono, s.pt': 'dwi wahyono',
  'drh. wahyu eri setyawan': 'wahyu eri',
  "ahmad wiji mu'aziz": 'akhmad wiji mu\\',
  'ali khoirul aziz, s.tr.vet.': 'ali khoirul aziz',
  'faizal ibnu darmawan': 'faizal ibnu dermawan',
  'slamet': 'slamet',
  'puskeswan mirit': 'puskeswan mirit',
  'puskeswan prembun': 'puskeswan prembun',
  'puskeswan kebumen': 'puskeswan kebumen',
  'puskeswan klirong': 'puskeswan klirong',
  'puskeswan gombong': 'puskeswan gombong',
  'puskeswan buayan': 'puskeswan buayan',
  'puskeswan alian': 'puskeswan alian',
  'puskeswan karanganyar': 'puskeswan karanganyar',
};

/**
 * Membersihkan gelar & karakter khusus untuk pencocokan nama
 */
function normalizeName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/^(drh\.|ir\.)\s*/i, '')
    .replace(/,\s*(a\.md\.?|s\.pt|s\.st|s\.tr\.pt|s\.tr\.vet\.?|medik vet|vet|m\.si)\.?/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Memastikan tabel kecamatan, wilayah_binaan, dan petugas_ib ada dan terisi lengkap
 * serta menautkan seluruh petugas_ib ke anggota_users.id secara otomatis.
 */
export async function ensurePetugasIbTable(): Promise<void> {
  try {
    // 1. Pastikan tabel kecamatan ada
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS kecamatan (
        id_kecamatan INT AUTO_INCREMENT PRIMARY KEY,
        kecamatan VARCHAR(100) NOT NULL
      ) ENGINE=InnoDB;
    `);

    // Isi data awal kecamatan jika kosong
    try {
      const [kecCount]: any = await pool.query(`SELECT COUNT(*) as total FROM kecamatan`);
      if (!kecCount || kecCount[0]?.total === 0) {
        for (const k of KECAMATAN_SEEDS) {
          await pool.execute(
            `INSERT IGNORE INTO kecamatan (id_kecamatan, kecamatan) VALUES (?, ?)`,
            [k.id_kecamatan, k.kecamatan]
          );
        }
      }
    } catch (e: any) {
      console.warn('[kecamatan Seed Warning]:', e.message);
    }

    // 2. Pastikan tabel wilayah_binaan ada
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS wilayah_binaan (
        id_wilayah_binaan INT AUTO_INCREMENT PRIMARY KEY,
        id_puskeswan INT,
        id_kecamatan INT,
        nama_puskeswan VARCHAR(150),
        binaan VARCHAR(100)
      ) ENGINE=InnoDB;
    `);

    // Isi data awal wilayah_binaan jika kosong
    try {
      const [wbCount]: any = await pool.query(`SELECT COUNT(*) as total FROM wilayah_binaan`);
      if (!wbCount || wbCount[0]?.total === 0) {
        for (const wb of WILAYAH_BINAAN_SEEDS) {
          await pool.execute(
            `INSERT IGNORE INTO wilayah_binaan (id_wilayah_binaan, id_puskeswan, id_kecamatan, nama_puskeswan, binaan)
             VALUES (?, ?, ?, ?, ?)`,
            [wb.id_wilayah_binaan, wb.id_puskeswan, wb.id_kecamatan, wb.nama_puskeswan, wb.binaan]
          );
        }
      }
    } catch (e: any) {
      console.warn('[wilayah_binaan Seed Warning]:', e.message);
    }

    // 3. Pastikan tabel petugas_ib ada
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS petugas_ib (
        id_kompetensi INT AUTO_INCREMENT PRIMARY KEY,
        id_user INT,
        no_urut INT DEFAULT 1,
        nama_petugas VARCHAR(150),
        kompetensi VARCHAR(100) DEFAULT 'IB',
        wilayah_puskeswan VARCHAR(100),
        id_wilayah_binaan INT,
        wilayah_kerja_tambahan TEXT,
        wt1 INT,
        wt2 INT,
        wt3 INT,
        wt4 INT,
        wt5 INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 4. Migrasi dinamis kolom petugas_ib jika tabel sudah ada dari skema lama
    try {
      const [cols]: any = await pool.query(`SHOW COLUMNS FROM petugas_ib`);
      const colNames = (cols || []).map((c: any) => c.Field.toLowerCase());

      if (!colNames.includes('id_user')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN id_user INT DEFAULT NULL`);
      }
      if (!colNames.includes('wilayah_puskeswan')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wilayah_puskeswan VARCHAR(100) DEFAULT NULL`);
      } else {
        try {
          await pool.query(`ALTER TABLE petugas_ib MODIFY COLUMN wilayah_puskeswan VARCHAR(100) NULL DEFAULT NULL`);
        } catch {}
      }
      if (!colNames.includes('wilayah_kerja_tambahan')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wilayah_kerja_tambahan VARCHAR(150) DEFAULT NULL`);
      }
      if (!colNames.includes('wt1')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wt1 INT DEFAULT NULL`);
      }
      if (!colNames.includes('wt2')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wt2 INT DEFAULT NULL`);
      }
      if (!colNames.includes('wt3')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wt3 INT DEFAULT NULL`);
      }
      if (!colNames.includes('wt4')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wt4 INT DEFAULT NULL`);
      }
      if (!colNames.includes('wt5')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wt5 INT DEFAULT NULL`);
      }
      if (!colNames.includes('kompetensi')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN kompetensi VARCHAR(100) DEFAULT 'IB'`);
      }
    } catch (colErr: any) {
      console.warn('[petugas_ib Dynamic Migration]:', colErr.message);
    }

    // 5. Isi data awal petugas_ib jika masih kosong
    try {
      const [pCount]: any = await pool.query(`SELECT COUNT(*) as total FROM petugas_ib`);
      if (!pCount || pCount[0]?.total === 0) {
        for (const p of INITIAL_PETUGAS_IB_SEEDS) {
          await pool.execute(
            `INSERT INTO petugas_ib (no_urut, nama_petugas, kompetensi, wt1, id_wilayah_binaan, wilayah_puskeswan, wilayah_kerja_tambahan, wt2, wt3, wt4, wt5)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [p.no_urut, p.nama_petugas, p.kompetensi, p.wt1, p.id_wilayah_binaan, p.wilayah_puskeswan, p.wilayah_kerja_tambahan, p.wt2, p.wt3, p.wt4, p.wt5]
          );
        }
      }
    } catch (e: any) {
      console.warn('[petugas_ib Seed Warning]:', e.message);
    }

    // 6. SINKRONISASI OTOMATIS: Hubungkan petugas_ib.id_user ke anggota_users.id
    try {
      const [users]: any = await pool.query(`SELECT id, nama, nip_username FROM anggota_users`);
      if (Array.isArray(users) && users.length > 0) {
        const userMapByName = new Map<string, any>();
        const userMapByNorm = new Map<string, any>();

        users.forEach((u) => {
          userMapByName.set(u.nama.toLowerCase().trim(), u);
          userMapByNorm.set(normalizeName(u.nama), u);
        });

        const [petugasList]: any = await pool.query(`SELECT id_kompetensi, id_user, nama_petugas FROM petugas_ib`);
        if (Array.isArray(petugasList)) {
          for (const p of petugasList) {
            const rawName = (p.nama_petugas || '').toLowerCase().trim();
            const targetMappedName = OFFICER_NAME_TO_ANGGOTA_NAME[rawName] || rawName;

            let matchedUser = userMapByName.get(targetMappedName);
            if (!matchedUser) {
              matchedUser = userMapByNorm.get(normalizeName(targetMappedName));
            }
            if (!matchedUser) {
              matchedUser = userMapByNorm.get(normalizeName(rawName));
            }

            if (matchedUser && p.id_user !== matchedUser.id) {
              await pool.query(
                `UPDATE petugas_ib SET id_user = ? WHERE id_kompetensi = ?`,
                [matchedUser.id, p.id_kompetensi]
              );
            }
          }
        }
      }
    } catch (linkErr: any) {
      console.warn('[petugas_ib Auto-Link Warning]:', linkErr.message);
    }

    // 7. Sinkronisasi khusus 8 akun Puskeswan ke wilayah puskeswannya
    try {
      const PUSKESWAN_SEEDS = [
        { name: 'Puskeswan Mirit', pusk: 'Puskeswan Mirit', defaultWbId: 1 },
        { name: 'Puskeswan Klirong', pusk: 'Puskeswan Klirong', defaultWbId: 4 },
        { name: 'Puskeswan Gombong', pusk: 'Puskeswan Gombong', defaultWbId: 7 },
        { name: 'Puskeswan Buayan', pusk: 'Puskeswan Buayan', defaultWbId: 11 },
        { name: 'Puskeswan Alian', pusk: 'Puskeswan Alian', defaultWbId: 14 },
        { name: 'Puskeswan Prembun', pusk: 'Puskeswan Prembun', defaultWbId: 17 },
        { name: 'Puskeswan Kebumen', pusk: 'Puskeswan Kebumen', defaultWbId: 20 },
        { name: 'Puskeswan Karanganyar', pusk: 'Puskeswan Karanganyar', defaultWbId: 23 },
      ];

      for (const ps of PUSKESWAN_SEEDS) {
        const [uRows]: any = await pool.query(
          `SELECT id FROM anggota_users WHERE LOWER(nama) = LOWER(?) LIMIT 1`,
          [ps.name]
        );
        if (uRows && uRows.length > 0) {
          const uId = uRows[0].id;
          const [pRows]: any = await pool.query(
            `SELECT id_kompetensi, id_user, wilayah_puskeswan FROM petugas_ib 
             WHERE id_user = ? OR LOWER(nama_petugas) = LOWER(?) LIMIT 1`,
            [uId, ps.name]
          );

          if (pRows && pRows.length > 0) {
            await pool.query(
              `UPDATE petugas_ib SET id_user = ?, wilayah_puskeswan = ?, id_wilayah_binaan = COALESCE(id_wilayah_binaan, ?) WHERE id_kompetensi = ?`,
              [uId, ps.pusk, ps.defaultWbId, pRows[0].id_kompetensi]
            );
          } else {
            const [maxRows]: any = await pool.query(`SELECT COALESCE(MAX(no_urut), 0) + 1 AS next_no FROM petugas_ib`);
            const nextNo = maxRows?.[0]?.next_no || 1;
            await pool.query(
              `INSERT INTO petugas_ib (id_user, no_urut, nama_petugas, kompetensi, wilayah_puskeswan, id_wilayah_binaan)
               VALUES (?, ?, ?, 'Keswan', ?, ?)`,
              [uId, nextNo, ps.name, ps.pusk, ps.defaultWbId]
            );
          }
        }
      }
    } catch (seedErr: any) {
      console.warn('[Puskeswan Seed Warning]:', seedErr.message);
    }
  } catch (err: any) {
    console.warn('[ensurePetugasIbTable Error]:', err.message);
  }
}

/**
 * Sinkronisasi wilayah kerja petugas ke tabel `petugas_ib` saat data akun dibuat / diedit
 */
export async function syncPetugasIbRecord(
  userId: number,
  nama: string,
  role: string,
  isRestricted: boolean,
  puskeswanUtama?: string | null,
  wt1?: number | string | null,
  wt2?: number | string | null,
  wt3?: number | string | null,
  wt4?: number | string | null,
  wt5?: number | string | null,
  kompetensi?: string
): Promise<void> {
  await ensurePetugasIbTable();

  // Cari apakah data di petugas_ib sudah ada:
  // Prioritas 1: cocokkan id_user
  // Prioritas 2: cocokkan nama eksak atau nama alias terpetakan
  // Prioritas 3: LIKE nama
  let existingId: number | null = null;

  const [byUser]: any = await pool.query(
    `SELECT id_kompetensi FROM petugas_ib WHERE id_user = ? LIMIT 1`,
    [userId]
  );
  if (byUser && byUser.length > 0) {
    existingId = byUser[0].id_kompetensi;
  } else {
    const rawLower = (nama || '').toLowerCase().trim();
    const reverseMapped = Object.keys(OFFICER_NAME_TO_ANGGOTA_NAME).find(
      (k) => OFFICER_NAME_TO_ANGGOTA_NAME[k] === rawLower
    );
    const [byName]: any = await pool.query(
      `SELECT id_kompetensi FROM petugas_ib WHERE LOWER(nama_petugas) = LOWER(?) OR LOWER(nama_petugas) = LOWER(?) LIMIT 1`,
      [nama, reverseMapped || nama]
    );
    if (byName && byName.length > 0) {
      existingId = byName[0].id_kompetensi;
    } else {
      const norm = normalizeName(nama);
      const [byNorm]: any = await pool.query(
        `SELECT id_kompetensi, nama_petugas FROM petugas_ib`
      );
      if (Array.isArray(byNorm)) {
        const found = byNorm.find((p) => normalizeName(p.nama_petugas) === norm);
        if (found) {
          existingId = found.id_kompetensi;
        }
      }
    }
  }

  const komp = kompetensi || (role.toLowerCase() === 'puskeswan' ? 'Keswan' : 'IB');

  // Jika admin memilih TIDAK dibatasi wilayahnya (Tingkat Kabupaten)
  if (!isRestricted || !puskeswanUtama) {
    if (existingId) {
      await pool.query(
        `UPDATE petugas_ib SET 
          id_user = ?,
          nama_petugas = ?,
          wilayah_puskeswan = NULL,
          id_wilayah_binaan = NULL,
          wilayah_kerja_tambahan = NULL,
          wt1 = NULL, wt2 = NULL, wt3 = NULL, wt4 = NULL, wt5 = NULL,
          kompetensi = COALESCE(?, kompetensi)
        WHERE id_kompetensi = ?`,
        [userId, nama, komp, existingId]
      );
    }
    return;
  }

  // Jika DIBATASI wilayahnya:
  const pUtama = puskeswanUtama.trim();

  // Cari default id_wilayah_binaan untuk puskeswanUtama
  let defaultWbId: number | null = null;
  const [wbRows]: any = await pool.query(
    `SELECT id_wilayah_binaan FROM wilayah_binaan WHERE LOWER(nama_puskeswan) = LOWER(?) LIMIT 1`,
    [pUtama]
  );
  if (wbRows && wbRows.length > 0) {
    defaultWbId = wbRows[0].id_wilayah_binaan;
  }

  // Parse wt1 s/d wt5 sebagai id_kecamatan
  const parseWt = (val: any): number | null => {
    if (val === null || val === undefined || val === '' || val === 0 || val === '0') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const finalWt1 = parseWt(wt1);
  const finalWt2 = parseWt(wt2);
  const finalWt3 = parseWt(wt3);
  const finalWt4 = parseWt(wt4);
  const finalWt5 = parseWt(wt5);

  const activeKecIds = [finalWt1, finalWt2, finalWt3, finalWt4, finalWt5].filter((id): id is number => id !== null);

  let wtStr = '';
  if (activeKecIds.length > 0) {
    const [kecRows]: any = await pool.query(
      `SELECT DISTINCT id_kecamatan, binaan FROM wilayah_binaan WHERE id_kecamatan IN (?)`,
      [activeKecIds]
    );
    const kecMap = new Map<number, string>();
    if (Array.isArray(kecRows)) {
      kecRows.forEach((r: any) => {
        const titleCase = r.binaan.charAt(0).toUpperCase() + r.binaan.slice(1).toLowerCase();
        kecMap.set(Number(r.id_kecamatan), titleCase);
      });
    }
    const kecNames = activeKecIds
      .map((id) => kecMap.get(id))
      .filter(Boolean)
      .map((k) => `Kec. ${k}`);
    wtStr = Array.from(new Set(kecNames)).join(', ');
  }

  if (existingId) {
    await pool.query(
      `UPDATE petugas_ib SET 
        id_user = ?,
        nama_petugas = ?,
        wilayah_puskeswan = ?,
        id_wilayah_binaan = COALESCE(?, id_wilayah_binaan),
        wilayah_kerja_tambahan = ?,
        wt1 = ?, wt2 = ?, wt3 = ?, wt4 = ?, wt5 = ?,
        kompetensi = COALESCE(?, kompetensi)
      WHERE id_kompetensi = ?`,
      [
        userId,
        nama,
        pUtama,
        defaultWbId,
        wtStr || null,
        finalWt1, finalWt2, finalWt3, finalWt4, finalWt5,
        komp,
        existingId,
      ]
    );
  } else {
    const [maxRows]: any = await pool.query(`SELECT COALESCE(MAX(no_urut), 0) + 1 AS next_no FROM petugas_ib`);
    const nextNo = maxRows?.[0]?.next_no || 1;

    await pool.query(
      `INSERT INTO petugas_ib 
        (id_user, no_urut, nama_petugas, kompetensi, wilayah_puskeswan, id_wilayah_binaan, wilayah_kerja_tambahan, wt1, wt2, wt3, wt4, wt5)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        nextNo,
        nama,
        komp,
        pUtama,
        defaultWbId,
        wtStr || null,
        finalWt1, finalWt2, finalWt3, finalWt4, finalWt5,
      ]
    );
  }
}
