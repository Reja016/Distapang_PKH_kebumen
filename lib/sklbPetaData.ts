import { INITIAL_KAPASITAS_PAKAN, KEBUMEN_MAP_VIEWBOX, KapasitasPakanKecamatan } from './pakanData';

export { KEBUMEN_MAP_VIEWBOX };
export const KECAMATAN_ITEMS: KapasitasPakanKecamatan[] = INITIAL_KAPASITAS_PAKAN;

// ── PALET WARNA HIJAU SESUAI TEMA BITPRO / SKLB ──
export function getSapiPOColor(pop: number): { fill: string; textColor: string; strokeColor: string } {
  if (pop <= 500) return { fill: '#DCFCE7', textColor: '#064E3B', strokeColor: '#86EFAC' };
  if (pop <= 1000) return { fill: '#86EFAC', textColor: '#064E3B', strokeColor: '#34D399' };
  if (pop <= 2000) return { fill: '#34D399', textColor: '#064E3B', strokeColor: '#10B981' };
  if (pop <= 3500) return { fill: '#10B981', textColor: '#FFFFFF', strokeColor: '#059669' };
  if (pop <= 5500) return { fill: '#059669', textColor: '#FFFFFF', strokeColor: '#047857' };
  if (pop <= 7500) return { fill: '#047857', textColor: '#FFFFFF', strokeColor: '#064E3B' };
  return { fill: '#064E3B', textColor: '#FFFFFF', strokeColor: '#022C22' };
}

export const SAPI_PO_LEGEND = [
  { label: '≤ 500', color: '#DCFCE7', text: '#064E3B' },
  { label: '501 – 1.000', color: '#86EFAC', text: '#064E3B' },
  { label: '1.001 – 2.000', color: '#34D399', text: '#064E3B' },
  { label: '2.001 – 3.500', color: '#10B981', text: '#FFFFFF' },
  { label: '3.501 – 5.500', color: '#059669', text: '#FFFFFF' },
  { label: '5.501 – 7.500', color: '#047857', text: '#FFFFFF' },
  { label: '> 7.500', color: '#064E3B', text: '#FFFFFF' },
];
