import { INITIAL_KAPASITAS_PAKAN, KEBUMEN_MAP_VIEWBOX, KapasitasPakanKecamatan } from './pakanData';

export { KEBUMEN_MAP_VIEWBOX };
export const KECAMATAN_ITEMS: KapasitasPakanKecamatan[] = INITIAL_KAPASITAS_PAKAN;

// ── PALET WARNA KREM SAMPAI COKLAT SESUAI REVISI SKLB SAPI PO ──
export function getSapiPOColor(pop: number): { fill: string; textColor: string; strokeColor: string } {
  if (pop <= 500) return { fill: '#FDE8CD', textColor: '#78350F', strokeColor: '#F5CBA7' };
  if (pop <= 1000) return { fill: '#FAD7A0', textColor: '#78350F', strokeColor: '#F5B041' };
  if (pop <= 2000) return { fill: '#F5B041', textColor: '#512E1B', strokeColor: '#EB984E' };
  if (pop <= 3500) return { fill: '#E67E22', textColor: '#FFFFFF', strokeColor: '#CA6F1E' };
  if (pop <= 5500) return { fill: '#BA4A00', textColor: '#FFFFFF', strokeColor: '#A04000' };
  if (pop <= 7500) return { fill: '#873600', textColor: '#FFFFFF', strokeColor: '#6E2C00' };
  return { fill: '#451A03', textColor: '#FFFFFF', strokeColor: '#290E02' };
}

export const SAPI_PO_LEGEND = [
  { label: '≤ 500', color: '#FDE8CD', text: '#78350F' },
  { label: '501 – 1.000', color: '#FAD7A0', text: '#78350F' },
  { label: '1.001 – 2.000', color: '#F5B041', text: '#512E1B' },
  { label: '2.001 – 3.500', color: '#E67E22', text: '#FFFFFF' },
  { label: '3.501 – 5.500', color: '#BA4A00', text: '#FFFFFF' },
  { label: '5.501 – 7.500', color: '#873600', text: '#FFFFFF' },
  { label: '> 7.500', color: '#451A03', text: '#FFFFFF' },
];
