export interface Bulanan {
  id: number;
  no_urut: number;
  puskeswan: string;
  target: number;
  pengambilan: number;
  realisasi: number;
  kekurangan: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  mei: number;
  jun: number;
  jul: number;
  agu: number;
  sep: number;
  okt: number;
  nov: number;
  des: number;
}

export interface Harian {
  id: number;
  puskeswan: string;
  tanggal: string;
  jumlah: number;
}

export interface Droping {
  id: number;
  tanggal: string;
  merk_vaksin: string;
  jumlah: number;
  keterangan: string | null;
}

export interface ApbdTarget {
  id: number;
  no_urut: number;
  puskeswan: string;
  target_lsd: number;
  target_ndai: number;
  target_rabies: number;
  target_aphtovaks: number;
  pengambilan_ndai: string | null;
  pengambilan_aphtovaks: string | null;
  catatan: string | null;
}

export const BULAN_LABEL = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const BULAN_LONG = [
  '',
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const BULAN_KEY: (keyof Bulanan)[] = [
  'jan',
  'feb',
  'mar',
  'apr',
  'mei',
  'jun',
  'jul',
  'agu',
  'sep',
  'okt',
  'nov',
  'des',
];

export const fallbackPuskeswan: Bulanan[] = [
  { id: 1, no_urut: 1, puskeswan: 'MIRIT', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 2, no_urut: 2, puskeswan: 'KLIRONG', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 3, no_urut: 3, puskeswan: 'GOMBONG', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 4, no_urut: 4, puskeswan: 'BUAYAN', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 5, no_urut: 5, puskeswan: 'ALIAN', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 6, no_urut: 6, puskeswan: 'PREMBUN', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 7, no_urut: 7, puskeswan: 'KEBUMEN', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 8, no_urut: 8, puskeswan: 'KARANGANYAR', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
];

export function daysInMonth(month: number, year = 2027) {
  return new Date(year, month, 0).getDate();
}

export const n = (v: any) => Number(v) || 0;

export const emptyBulananForm = { no_urut: 0, puskeswan: '', target: 0, pengambilan: 0 };
export const emptyDropingForm = { tanggal: '', merk_vaksin: '', jumlah: 0, keterangan: '' };
