export type NKVRecord = {
  id: string;
  namaUsaha: string;
  jenisUsaha: string;
  proses: string;
  pembinaan1: string;
  hasil1: string;
  pembinaan2: string;
  hasil2: string;
  pelatihanHigiene: string;
  pengeluaranRekomendasi: string;
  keterangan: string;
};

export const INITIAL_NKV_DATA: NKVRecord[] = [
  {
    id: '1',
    namaUsaha: 'RPH Kebumen (UPTD)',
    jenisUsaha: 'RPH Ruminansia',
    proses: 'Sertifikasi NKV Tingkat II',
    pembinaan1: '14 Maret 2025',
    hasil1: 'Kelayakan dasar & alur sanitasi memenuhi syarat',
    pembinaan2: '20 Mei 2025',
    hasil2: 'Perbaikan sarana cold storage telah selesai',
    pelatihanHigiene: 'Sudah Bersertifikat (2 Juleha & 4 Petugas)',
    pengeluaranRekomendasi: 'Rekomendasi Diterbitkan (No: 524/112/2025)',
    keterangan: 'Telah terverifikasi Dinas Peternakan Provinsi',
  },
  {
    id: '2',
    namaUsaha: 'RPH Gombong (UPTD)',
    jenisUsaha: 'RPH Ruminansia',
    proses: 'Pembinaan & Audit Lapangan',
    pembinaan1: '10 Februari 2025',
    hasil1: 'Penataan drainase limbah cair perlu optimasi',
    pembinaan2: '18 Juni 2025',
    hasil2: 'Instalasi IPAL berfungsi optimal',
    pelatihanHigiene: 'Sudah Bersertifikat (3 Petugas)',
    pengeluaranRekomendasi: 'Rekomendasi Diterbitkan (No: 524/145/2025)',
    keterangan: 'Menunggu penerbitan nomor resmi provinsi',
  },
  {
    id: '3',
    namaUsaha: 'TPU Unggas Barokah Petanahan',
    jenisUsaha: 'TPU Unggas',
    proses: 'Penerbitan Rekomendasi NKV',
    pembinaan1: '05 April 2025',
    hasil1: 'Pemisahan area bersih dan kotor terlaksana',
    pembinaan2: '12 Juli 2025',
    hasil2: 'Uji residu & cemaran mikroba nihil',
    pelatihanHigiene: 'Sudah Bersertifikat (1 Pengelola)',
    pengeluaranRekomendasi: 'Rekomendasi Diterbitkan (No: 524/189/2025)',
    keterangan: 'NKV Level III Aktif',
  },
  {
    id: '4',
    namaUsaha: 'UD Berkah Telur Kutowinangun',
    jenisUsaha: 'Gudang Telur Konsumsi',
    proses: 'Pengajuan Sertifikasi Baru',
    pembinaan1: '22 Januari 2025',
    hasil1: 'Sistem pencatatan batch & suhu ruang diperiksa',
    pembinaan2: '15 Agustus 2025',
    hasil2: 'Pendingin dan tata ruang higienis siap audit',
    pelatihanHigiene: 'Proses Sertifikasi Higiene Sanitasi',
    pengeluaranRekomendasi: 'Dalam Proses Validasi',
    keterangan: 'Dijadwalkan visitasi tim penilai',
  },
];
