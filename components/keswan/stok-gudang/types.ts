export interface MasterBarang {
  id_barang: number;
  kode_barang?: string;
  nama_barang: string;
  kategori: string;
  satuan_kemasan: string;
  min_stok_dinas: number;
  keterangan?: string;
}

export interface DroppingDinasItem {
  id_dropping_dinas: number;
  tahun: number;
  bulan: string;
  id_barang: number;
  nama_barang?: string;
  nomor_batch?: string;
  tanggal_kadaluarsa?: string;
  sumber_anggaran?: string;
  satuan_kemasan?: string;
  jumlah: number;
  harga_satuan: number;
  harga_total: number;
  yang_menerima?: string;
  nip_penerima?: string;
  yang_menyerahkan?: string;
  nip_penyerah?: string;
  created_at?: string;
}

export interface DistribusiBaItem {
  id_distribusi: number;
  nomor_ba: string;
  tanggal_ba: string;
  jenis_distribusi: 'DROPING_TERENCANA' | 'AMPRAHAN_INSIDENTAL';
  is_darurat: boolean;
  alasan_darurat?: string;
  id_puskeswan: number;
  nama_puskeswan: string;
  id_barang: number;
  nama_barang: string;
  nomor_batch?: string;
  tanggal_kadaluarsa?: string;
  sumber_anggaran?: string;
  tahun_anggaran?: string | number;
  satuan_kemasan?: string;
  jumlah: number;
  yang_menyerahkan?: string;
  nip_penyerah?: string;
  yang_menerima?: string;
  nip_penerima?: string;
  status_terima: 'PENDING' | 'DITERIMA';
  file_bukti_ba?: string;
  created_at?: string;
}

export interface StokPuskeswanItem {
  id_stok_puskeswan?: number;
  id_puskeswan: number;
  nama_puskeswan: string;
  id_barang: number;
  nama_barang: string;
  nomor_batch: string;
  tanggal_kadaluarsa: string;
  sumber_anggaran: string;
  tahun_anggaran: string | number;
  satuan_kemasan: string;
  stok_masuk: number;
  stok_keluar: number;
  sisa_stok: number;
}

export interface PenggunaanObatItem {
  id_penggunaan: number;
  tanggal: string;
  id_puskeswan: number;
  nama_puskeswan: string;
  id_barang: number;
  nama_produk: string;
  nomor_batch: string;
  sumber_anggaran: string;
  tahun_anggaran: string | number;
  tanggal_kadaluarsa: string;
  jumlah_penggunaan: number;
  kemasan: string;
  keterangan?: string;
  petugas?: string;
}

export interface StokDinasLedger {
  id_barang: number;
  nama_barang: string;
  kategori: string;
  satuan_kemasan: string;
  min_stok_dinas: number;
  total_masuk: number;
  total_terdistribusi: number;
  saldo_dinas: number;
  status_stok: 'AMAN' | 'KRITIS' | 'HABIS';
  batches: {
    nomor_batch: string;
    tanggal_kadaluarsa: string;
    sumber_anggaran: string;
    tahun_anggaran: string | number;
    jumlah_masuk: number;
    jumlah_keluar: number;
    saldo_batch: number;
    is_expired: boolean;
    days_to_expire: number;
  }[];
}

export const DAFTAR_PUSKESWAN_GUDANG = [
  { id: 1, nama: 'MIRIT' },
  { id: 2, nama: 'KLIRONG' },
  { id: 3, nama: 'GOMBONG' },
  { id: 4, nama: 'BUAYAN' },
  { id: 5, nama: 'ALIAN' },
  { id: 6, nama: 'PREMBUN' },
  { id: 7, nama: 'KEBUMEN' },
  { id: 8, nama: 'KARANGANYAR' },
];

export const SUMBER_ANGGARAN_OPTIONS = [
  'APBD Kabupaten',
  'Provinsi Jawa Tengah',
  'APBN Pusat',
];

export const SATUAN_KEMASAN_OPTIONS = [
  'Botol',
  'Vial',
  'Dosis',
  'Tablet/Kapsul',
  'Ampul',
  'Box',
  'Strip',
  'Pcs',
  'Liter',
  'Pack',
];
