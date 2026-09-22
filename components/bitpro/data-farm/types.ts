import {
  Building2,
  PackageCheck,
  Activity,
  Layers,
  TrendingUp,
} from 'lucide-react';

export type CommodityKey = 'broiler' | 'petelur' | 'sapi' | 'domba' | 'babi';

export const KECAMATAN_DESA_MAP: Record<string, string[]> = {
  AYAH: ['Argopeni', 'Argosari', 'Ayah', 'Candirenggo', 'Jatijajar', 'Jintung', 'Kalibangkang', 'Kalipoh', 'Karangduwur', 'Kedungweru', 'Mangunweni', 'Pasir', 'Srati', 'Tlogosari', 'Watukelir'],
  BUAYAN: ['Adiwarno', 'Avian', 'Buayan', 'Geblug', 'Jatiroto', 'Jladri', 'Jogomulyo', 'Karangbolong', 'Karangsari', 'Pakuran', 'Pringtutul', 'Rangkah', 'Rogodadi', 'Rogodono', 'Sikayu', 'Tugu', 'Wonodadi'],
  PURING: ['Arjowinangun', 'Banjarejo', 'Kaleng', 'Kedaleman Kulon', 'Kedaleman Wetan', 'Krandegan', 'Madurejo', 'Pasuruhan', 'Puliharjo', 'Purwosari', 'Puring', 'Sidoagung', 'Sidodadi', 'Sidoharjo', 'Silado', 'Sitiadi', 'Srusuh Jurutengah', 'Surorejan', 'Tambakmulyo', 'Tukinggedong', 'Waluyorejo', 'Weton Kulon', 'Weton Wetan'],
  PETANAHAN: ['Ampelsari', 'Banjarwinangun', 'Grogol Beningsari', 'Grogol Penatus', 'Grujugan', 'Jagamertan', 'Jatimulyo', 'Karanggadung', 'Karangrejo', 'Kebonsari', 'Kritig', 'Kuwarasan', 'Munggu', 'Nampudadi', 'Petanahan', 'Podourip', 'Sidomulyo', 'Tanjungsari', 'Tegalretno', 'Tresnorejo'],
  KLIRONG: ['Bendogarap', 'Dorowati', 'Gadungrejo', 'Gebangsari', 'Jatimalang', 'Jerukagung', 'Klegenrejo', 'Klegenwonosari', 'Klirong', 'Pandanlor', 'Podoluhur', 'Ranterejo', 'Sitirejo', 'Sukorejo', 'Tambakagung', 'Tambakkirong', 'Tambakprogaten', 'Tanggulangin', 'Tanjungsari', 'Wotbuwono'],
  BULUSPESANTREN: ['Ambalkliwonan', 'Banjurmukadan', 'Banjurpasar', 'Bocor', 'Brevir', 'Buluspesantren', 'Indrosari', 'Jogopaten', 'Klapasawit', 'Maduretno', 'Ranpak', 'Rantewringin', 'Sangubanyu', 'Setrojenar', 'Sidomoro', 'Tambakrejo', 'Tanjungrejo', 'Tanjungsari'],
  AMBAL: ['Ambalkebrek', 'Ambalkliwonan', 'Ambalresmi', 'Ambarwinangun', 'Benerkulon', 'Benerwetan', 'Blengorkulon', 'Blengorwetan', 'Dukuhrejosari', 'Entak', 'Gondanglegi', 'Kaibon', 'Kaibonpetangkuran', 'Kembangsawit', 'Kenojayan', 'Kradenan', 'Lajer', 'Pagedangan', 'Pasarsenen', 'Prasutan', 'Pringtutul', 'Sidoluhur', 'Sidomukti', 'Sidomulyo', 'Singosari', 'Sinungrejo', 'Sumberjati', 'Surobayan'],
  MIRIT: ['Karanggede', 'Kertodeso', 'Krubungan', 'Lembupurba', 'Mangunranan', 'Mirit', 'Miritpetikusan', 'Ngabeyan', 'Patukgawemulyo', 'Patukrejomulyo', 'Pekutan', 'Rowo', 'Sarwogadung', 'Selotumpeng', 'Singoyudan', 'Sitibentar', 'Tlogodepok', 'Tlogopragoto', 'Wergonayan', 'Wiromartan'],
  BONOROWO: ['Balorejo', 'Bonjokkidul', 'Bonjoklor', 'Bonorowo', 'Mrentul', 'Ngasinan', 'Patukgawemulyo', 'Pujodadi', 'Rawodadi', 'Rowosari', 'Sirnoboyo', 'Tlogorejo', 'Tunjungan'],
  PREMBUN: ['Bagung', 'Buniayu', 'Kabekelan', 'Kabuaran', 'Kedungbulus', 'Kedungwaru', 'Mulyosri', 'Pecarikan', 'Pesuningan', 'Prembun', 'Sembirkadipaten', 'Sidogede', 'Tersobo', 'Tunggalroso', 'Wiromartan'],
  PADURESO: ['Balingasal', 'Kaligubug', 'Kalijering', 'Merden', 'Padureso', 'Pejengkolan', 'Rahayu', 'Sendangdalem', 'Sidototo'],
  KUTOWINANGUN: ['Babadsari', 'Jlegiwinangun', 'Kaliputih', 'Karangsari', 'Korowelang', 'Kotayasa', 'Kuwarisan', 'Kutowinangun', 'Lundong', 'Mekarsari', 'Mrinen', 'Pejagatan', 'Pekisan', 'Tanjungmeru', 'Tanjungsari', 'Triwarno'],
  ALIAN: ['Bojongsari', 'Jatimulyo', 'Kalijaya', 'Kalirancang', 'Kambangsari', 'Karangkembang', 'Karangtanjung', 'Kemangguan', 'Krakal', 'Sawangan', 'Seleling', 'Surotrunan', 'Tanuharjo', 'Tlogowulung', 'Wonokromo'],
  PONCOWARNO: ['Blater', 'Bocor', 'Jatipurus', 'Jembangan', 'Karangtengah', 'Kebonsari', 'Lerepkebumen', 'Poncowarno', 'Sitalang', 'Tirtomoyo', 'Tirtosari', 'Wonosari'],
  KEBUMEN: ['Adikarso', 'Argopeni', 'Bandung', 'Candimulyo', 'Candiwulan', 'Depokrejo', 'Gemeksekti', 'Gesikan', 'Jatisari', 'Jemur', 'Kalibagor', 'Kalirejo', 'Karangsari', 'Kawedusan', 'Kebumen', 'Kembaran', 'Kutosari', 'Mengkowo', 'Muktisari', 'Panjer', 'Roworejo', 'Selang', 'Sumberadi', 'Tamanwinangun', 'Tanahsari'],
  PEJAGOAN: ['Aditirto', 'Kebagoran', 'Kebulusan', 'Kedawung', 'Kuwayuhan', 'Logede', 'Pejagoan', 'Pengaringan', 'Peniron', 'Perambatan', 'Prigi', 'Watulawang', 'Jemur'],
  SRUWENG: ['Condongcampur', 'Donosari', 'Giwangretno', 'Jabres', 'Karanggedang', 'Karangjambu', 'Karangpule', 'Kejawang', 'Klepusanggar', 'Menganti', 'Pakuran', 'Pandansari', 'Pengempon', 'Purwodeso', 'Sidoagung', 'Sidoharjo', 'Sruweng', 'Sukoharjo', 'Tanggeran', 'Trikarso'],
  ADIMULYO: ['Adikarto', 'Adimulyo', 'Arjomulyo', 'Arjosari', 'Banyuroto', 'Bonjok', 'Candi', 'Caruban', 'Joho', 'Kemujan', 'Mangunharjo', 'Meles', 'Pekuwon', 'Sekarteja', 'Sidamukti', 'Sidamulyo', 'Sugihwaras', 'Tambakharjo', 'Tegalsari', 'Temanggal', 'Tepakyang', 'Wajasari'],
  KUWARASAN: ['Bendungan', 'Gandusari', 'Gumawang', 'Gunungmujil', 'Harjodowo', 'Jatimulyo', 'Kalitengah', 'Kamulyan', 'Kuwarasan', 'Kuwaru', 'Lemahduwur', 'Madureso', 'Mangli', 'Ori', 'Pringtutul', 'Purwodadi', 'Sawangan', 'Serut', 'Sidomulyo', 'Tambaksari', 'Wonoyoso'],
  ROWOKELE: ['Bumiagung', 'Giyanti', 'Jatiluhur', 'Kalisari', 'Karangduwur', 'Kretek', 'Pringtutul', 'Redisari', 'Rowokele', 'Sukoharjo', 'Wagirpandan', 'Wonoharjo'],
  SEMPOR: ['Bejiruyung', 'Bonosari', 'Donorojo', 'Jatinegoro', 'Kalibeji', 'Kedungwringin', 'Pekuncen', 'Sampang', 'Sempor', 'Semali', 'Sidoharum', 'Somagede', 'Tunjungseto'],
  GOMBONG: ['Banjarsari', 'Gombong', 'Kalitengah', 'Kedungpuji', 'Kemukus', 'Klopogodo', 'Panjangsari', 'Patemon', 'Semanding', 'Semondo', 'Sidayu', 'Wero', 'Wonokriyo', 'Wonosigro'],
  KARANGANYAR: ['Candi', 'Giripurno', 'Grenggeng', 'Jatiluhur', 'Karanganyar', 'Karangkemiri', 'Karanglewas', 'Panjatan', 'Plarangan', 'Pohkumbang', 'Sidomulyo', 'Wonorejo'],
  KARANGGAYAM: ['Clapar', 'Ginandong', 'Giritirto', 'Glontor', 'Gunungsari', 'Kalibening', 'Kalirejo', 'Karanggayam', 'Karangmojo', 'Karangrejo', 'Karangtengah', 'Kebakalan', 'Logandu', 'Pagebangan', 'Penimbun', 'Selogiri', 'Wonotolo'],
  SADANG: ['Cangkring', 'Kalibening', 'Karanggayam', 'Sadang Kulon', 'Sadang Wetan', 'Seboro', 'Wonosari'],
  KARANGSAMBUNG: ['Banioro', 'Kaligending', 'Kalisana', 'Karangsambung', 'Kedungwaru', 'Langse', 'Pembayan', 'Plumbon', 'Pujotirto', 'Seling', 'Totogan', 'Wadasmalang', 'Widoro'],
};

export const KECAMATAN_LIST = Object.keys(KECAMATAN_DESA_MAP);

export const COMMODITY_META: Record<CommodityKey, any> = {
  broiler: {
    title: 'Ayam Broiler',
    emoji: '🍗',
    subtitle: 'Ayam Pedaging',
    icon: Building2,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badge: 'Unggas Daging',
  },
  petelur: {
    title: 'Ayam Petelur',
    emoji: '🥚',
    subtitle: 'Ayam Ras Petelur',
    icon: PackageCheck,
    iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
    badge: 'Unggas Telur',
  },
  sapi: {
    title: 'Sapi Potong',
    emoji: '🐂',
    subtitle: 'Ternak Sapi Potong Binaan',
    icon: Activity,
    iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
    jenisTernak: 'Sapi Potong',
    badge: 'Ruminansia Besar',
  },
  domba: {
    title: 'Domba & Kambing',
    emoji: '🐑',
    subtitle: 'Ternak Ruminansia Kecil',
    icon: Layers,
    iconColor: 'text-lime-700 bg-lime-50 border-lime-200',
    jenisTernak: 'Domba',
    badge: 'Ruminansia Kecil',
  },
  babi: {
    title: 'Babi',
    emoji: '🐖',
    subtitle: 'Peternakan Non-Ruminansia',
    icon: TrendingUp,
    iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
    jenisTernak: 'Babi',
    badge: 'Non-Ruminansia',
  },
};

export const COMMODITY_ORDER: CommodityKey[] = ['broiler', 'petelur', 'sapi', 'domba', 'babi'];

export function parseNum(v: string | undefined | number): number {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  const m = String(v).replace(/[^0-9]/g, '');
  return m ? parseInt(m, 10) : 0;
}

export function formatNum(n: number): string {
  return n.toLocaleString('id-ID');
}
