import { INITIAL_KAPASITAS_PAKAN, KEBUMEN_MAP_VIEWBOX, KapasitasPakanKecamatan } from './pakanData';

export { KEBUMEN_MAP_VIEWBOX };

export interface PuskeswanZone {
  id: string;
  nama: string;
  colorHex: string;
  textColor: string;
  kecamatanList: string[];
  puskeswanX: number;
  puskeswanY: number;
}

export const PUSKESWAN_ZONES: Record<string, PuskeswanZone> = {
  buayan: {
    id: 'buayan',
    nama: 'Puskeswan Buayan',
    colorHex: '#EA580C', // Oranye
    textColor: '#FFFFFF',
    kecamatanList: ['k_ayah', 'k_buayan', 'k_rowokele'],
    puskeswanX: 1018,
    puskeswanY: 17424,
  },
  gombong: {
    id: 'gombong',
    nama: 'Puskeswan Gombong',
    colorHex: '#9A3412', // Coklat Kemerahan / Terakota
    textColor: '#FFFFFF',
    kecamatanList: ['k_gombong', 'k_sempor', 'k_kuwarasan', 'k_puring'],
    puskeswanX: 2548,
    puskeswanY: 11116,
  },
  karanganyar: {
    id: 'karanganyar',
    nama: 'Puskeswan Karanganyar',
    colorHex: '#312E81', // Biru Tua Keunguan / Indigo
    textColor: '#FFFFFF',
    kecamatanList: ['k_karanganyar', 'k_karanggayam', 'k_sruweng', 'k_pejagoan', 'k_adimulyo'],
    puskeswanX: 5218,
    puskeswanY: 13324,
  },
  alian: {
    id: 'alian',
    nama: 'Puskeswan Alian',
    colorHex: '#065F46', // Hijau Tua
    textColor: '#FFFFFF',
    kecamatanList: ['k_alian', 'k_sadang', 'k_karangsambung'],
    puskeswanX: 13180,
    puskeswanY: 12980,
  },
  klirong: {
    id: 'klirong',
    nama: 'Puskeswan Klirong',
    colorHex: '#CA8A04', // Kuning Emas
    textColor: '#FFFFFF',
    kecamatanList: ['k_klirong', 'k_petanahan'],
    puskeswanX: 10920,
    puskeswanY: 17200,
  },
  kebumen: {
    id: 'kebumen',
    nama: 'Puskeswan Kebumen',
    colorHex: '#D97706', // Coklat Muda / Krem
    textColor: '#FFFFFF',
    kecamatanList: ['k_kebumen', 'k_buluspesantren'],
    puskeswanX: 12200,
    puskeswanY: 16500,
  },
  prembun: {
    id: 'prembun',
    nama: 'Puskeswan Prembun',
    colorHex: '#0284C7', // Biru Muda / Cyan
    textColor: '#FFFFFF',
    kecamatanList: ['k_prembun', 'k_padureso', 'k_kutowinangun'],
    puskeswanX: 19800,
    puskeswanY: 16600,
  },
  mirit: {
    id: 'mirit',
    nama: 'Puskeswan Mirit',
    colorHex: '#7DD3FC', // Biru Pastel / Ice Blue
    textColor: '#0F172A',
    kecamatanList: ['k_mirit', 'k_ambal', 'k_bonorowo'],
    puskeswanX: 18400,
    puskeswanY: 21800,
  },
};

export const PUSKESWAN_HOST_BY_KECAMATAN: Record<string, string> = {
  k_buayan: 'buayan',
  buayan: 'buayan',
  k_gombong: 'gombong',
  gombong: 'gombong',
  k_karanganyar: 'karanganyar',
  karanganyar: 'karanganyar',
  k_alian: 'alian',
  alian: 'alian',
  k_klirong: 'klirong',
  klirong: 'klirong',
  k_kebumen: 'kebumen',
  kebumen: 'kebumen',
  k_prembun: 'prembun',
  prembun: 'prembun',
  k_mirit: 'mirit',
  mirit: 'mirit',
};

// ── DAFTAR DIAGNOSA PENYAKIT LENGKAP & KODE WARNA PERSIS PDF ──
export interface DiagnosaInfo {
  nama: string;
  color: string;
  kategori?: string;
}

export const DIAGNOSA_LIST: DiagnosaInfo[] = [
  { nama: 'BEF', color: '#E11D48', kategori: 'Viral' },
  { nama: 'Scabies', color: '#2563EB', kategori: 'Parasit' },
  { nama: 'Thick Paralysis', color: '#4B5563', kategori: 'Parasit' },
  { nama: 'Ektoparasit', color: '#9333EA', kategori: 'Parasit' },
  { nama: 'Cacingan', color: '#854D0E', kategori: 'Parasit' },
  { nama: 'Pink Eye', color: '#D97706', kategori: 'Bakterial' },
  { nama: 'ORF', color: '#475569', kategori: 'Viral' },
  { nama: 'Rhinitis', color: '#EA580C', kategori: 'Pernafasan' },
  { nama: 'Enteritis', color: '#1E40AF', kategori: 'Pencernaan' },
  { nama: 'Pneumonia', color: '#38BDF8', kategori: 'Pernafasan' },
  { nama: 'LSD', color: '#F59E0B', kategori: 'Viral' },
  { nama: 'PMK', color: '#DC2626', kategori: 'Viral' },
  { nama: 'Distokia', color: '#16A34A', kategori: 'Reproduksi' },
  { nama: 'Abortus', color: '#15803D', kategori: 'Reproduksi' },
  { nama: 'Retensi Plasenta', color: '#14532D', kategori: 'Reproduksi' },
  { nama: 'Prolaps Uteri', color: '#0D9488', kategori: 'Reproduksi' },
  { nama: 'Prolaps Vagina', color: '#F43F5E', kategori: 'Reproduksi' },
  { nama: 'Delay Pubertas', color: '#FB923C', kategori: 'Reproduksi' },
  { nama: 'Silent Heat', color: '#0F766E', kategori: 'Reproduksi' },
  { nama: 'Endometriosis', color: '#0284C7', kategori: 'Reproduksi' },
  { nama: 'Hipofungsi Ovari', color: '#1E3A8A', kategori: 'Reproduksi' },
  { nama: 'Abses', color: '#7E22CE', kategori: 'Umum' },
  { nama: 'Hipocaclcemia', color: '#DB2777', kategori: 'Metabolik' },
  { nama: 'Artritis', color: '#E11D48', kategori: 'Umum' },
  { nama: 'Urtikaria', color: '#F97316', kategori: 'Alergi' },
  { nama: 'Myositis', color: '#059669', kategori: 'Otot' },
  { nama: 'Dermatitis', color: '#334155', kategori: 'Kulit' },
  { nama: 'Laminitis', color: '#1E293B', kategori: 'Kuku' },
  { nama: 'Mastitis', color: '#0E7490', kategori: 'Ambing' },
  { nama: 'Miasis', color: '#FB7185', kategori: 'Parasit' },
  { nama: 'Bloat', color: '#06B6D4', kategori: 'Pencernaan' },
  { nama: 'Fraktur', color: '#84CC16', kategori: 'Tulang' },
  { nama: 'Anemia', color: '#A3E635', kategori: 'Darah' },
  { nama: 'Grass Tetani', color: '#0284C7', kategori: 'Metabolik' },
  { nama: 'Indigesti', color: '#1D4ED8', kategori: 'Pencernaan' },
  { nama: 'Malnutrisi', color: '#EF4444', kategori: 'Nutrisi' },
  { nama: 'Gastritis', color: '#047857', kategori: 'Pencernaan' },
  { nama: 'Keracunan', color: '#F97316', kategori: 'Toksik' },
  { nama: 'Atresia Ani', color: '#FB923C', kategori: 'Kongenital' },
  { nama: 'Omphalitis', color: '#65A30D', kategori: 'Infeksi' },
  { nama: 'Luka', color: '#10B981', kategori: 'Trauma' },
  { nama: 'Prolaps', color: '#64748B', kategori: 'Reproduksi' },
];

export const DIAGNOSA_COLOR_MAP: Record<string, string> = DIAGNOSA_LIST.reduce((acc, d) => {
  acc[d.nama] = d.color;
  return acc;
}, {} as Record<string, string>);

// Cari zona puskeswan untuk suatu kecamatan id
export function getZoneByKecamatanId(kecId: string): PuskeswanZone {
  const normId = kecId.toLowerCase();
  for (const zone of Object.values(PUSKESWAN_ZONES)) {
    if (zone.kecamatanList.includes(normId) || zone.kecamatanList.some(k => k.replace('k_', '') === normId.replace('k_', ''))) {
      return zone;
    }
  }
  return PUSKESWAN_ZONES.kebumen;
}

// Data Geometri Peta 26 Kecamatan
export const KECAMATAN_MAP_ITEMS: KapasitasPakanKecamatan[] = INITIAL_KAPASITAS_PAKAN;
