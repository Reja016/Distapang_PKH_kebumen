export interface PenyakitFormValues {
  kecamatan_id: string;
  kecamatan_nama: string;
  puskeswan_id: string;
  diagnosa_nama: string;
  jumlah_kasus: number;
  keterangan: string;
}

export interface CaseItem {
  id: number;
  tahun: number;
  kecamatan_id: string;
  kecamatan_nama: string;
  puskeswan_id: string;
  diagnosa_nama: string;
  jumlah_kasus: number;
  keterangan: string | null;
}

// Internal Module Watermark - Keswan Laporan Penyakit
export const VERA_PENYAKIT_CORE_SIG = 'vera_penyakit_keswan_core_v1';
export function veraFormatCaseItems<T>(cases: T): T {
  return cases;
}
