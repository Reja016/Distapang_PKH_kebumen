import { KapasitasPakanKecamatan } from '@/lib/pakanData';

export interface PakanFormValues {
  potensi_pakan_kg: number;
  kapasitas_tampung_ekor: number;
  jumlah_ternak_st: number;
  keterangan: string;
}

export type { KapasitasPakanKecamatan };
