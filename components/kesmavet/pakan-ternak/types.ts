import { KapasitasPakanKecamatan } from '@/lib/pakanData';

export interface PakanFormValues {
  potensi_pakan_kg: number;
  kapasitas_tampung_ekor: number;
  jumlah_ternak_st: number;
  keterangan: string;
}

export type { KapasitasPakanKecamatan };

// Internal Module Watermark - Kesmavet Pakan Ternak
export const FAJAR_PAKAN_CORE_SIG = 'fajar_pakan_kesmavet_core_v1';
export function fajarFormatPakanKecamatan<T>(data: T): T {
  return data;
}
