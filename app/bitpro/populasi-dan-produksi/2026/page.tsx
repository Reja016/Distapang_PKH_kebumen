'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  Calculator,
  Building2,
  Layers,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';

const DATA_WILAYAH: Record<string, string[]> = {
  AYAH: ['AYAH', 'CANDIRENGGO', 'MANGUNWENI', 'TLOGOSARI', 'KALIBANGKANG', 'WATUKELIR', 'KALIPOH', 'ARGOSARI', 'BANJARARJO', 'ARGOPENI', 'KARANGDUWUR', 'SRATI', 'JINTUNG', 'PASIR', 'JATIJAJAR', 'DEMANGSARI', 'KEDUNGWERU', 'BULUREJO'],
  BUAYAN: ['KARANGBOLONG', 'JLADRI', 'ADIWARNO', 'RANGKAH', 'WONODADI', 'GEBLUG', 'ROGODADI', 'PAKURAN', 'BUAYAN', 'SIKAYU', 'KARANGSARI', 'ROGODONO', 'BANYUMUDAL', 'TUGU', 'NOGORAJI', 'MERGOSONO', 'SEMAMPIR', 'JOGOMULYO', 'PURBOWANGI', 'JATIROTO'],
  PURING: ['TAMBAKMULYO', 'SUROREJAN', 'WALUYOREJO', 'SIDOHARJO', 'PULIHARJO', 'PURWOSARI', 'KRANDEGAN', 'KALENG', 'TUKINGGEDONG', 'PURWOHARJO', 'SITIADI', 'BANJAREJA', 'WETONKULON', 'PESURUHAN', 'WETONWETAN', 'KEDALEMANKULON', 'KEDALEMANWETAN', 'SRUSUHJURUTENGAH', 'BUMIREJO', 'ARJOWINANGUN', 'MADUREJO', 'SIDOBUNDER', 'SIDODADI'],
  PETANAHAN: ['KARANGREJO', 'KARANGGADUNG', 'TEGALRETNO', 'AMPELSARI', 'MUNGGU', 'KEWANGUNAN', 'KARANGDUWUR', 'PETANAHAN', 'KEBONSARI', 'GROGOLPENATUS', 'GROGOLBENINGSARI', 'JOGOMERTAN', 'TANJUNGSARI', 'SIDOMULYO', 'GRUJUGAN', 'KRITIG', 'NAMPUDADI', 'TRESNOREJO', 'PODOURIP', 'JATIMULYO', 'BANJARWINANGUN'],
  KLIRONG: ['JOGOSIMO', 'TANGGULANGIN', 'PANDANLOR', 'TAMBAKPROGATEN', 'GEBANGSARI', 'KLEGENREJO', 'BENDOGARAP', 'KEDUNGSARI', 'JERUKAGUNG', 'KLEGENWONOSARI', 'KLIRONG', 'KALIWUNGU', 'JATIMALANG', 'KARANGGLONGGONG', 'RANTEREJO', 'WOTBUWONO', 'TAMBAKAGUNG', 'SITIREJO', 'GADUNGREJO', 'DOROWATI', 'BUMIHARJO', 'KEBADONGAN', 'PODOLUHUR', 'KEDUNGWINANGUN'],
  BULUSPESANTREN: ['AYAMPUTIH', 'SETROJENAR', 'BRECONG', 'BANJURPASAR', 'INDROSARI', 'BULUSPESANTREN', 'BANJURMUKADAN', 'WALUYO', 'BOCOR', 'MADURETNO', 'AMBALKUMOLO', 'RANTEWRINGIN', 'TAMBAKREJO', 'SANGUBANYU', 'ARJOWINANGUN', 'AMPIH', 'JOGOPATEN', 'KLOPOSAWIT', 'SIDOMORO', 'TANJUNGREJO', 'TANJUNGSARI'],
  AMBAL: ['ENTAK', 'PLEMPUKANKEMBARAN', 'KENOYOJAYAN', 'AMBALRESMI', 'KAIBONPETANGKURAN', 'KAIBON', 'SUMBERJATI', 'BLENGORWETAN', 'BLENGORKULON', 'BENERWETAN', 'BENERKULON', 'AMBALKLIWONAN', 'PASARSENEN', 'PUCANGAN', 'AMBALKEBREK', 'GONDANGLEGI', 'BANJARSARI', 'LAJER', 'SINGOSARI', 'SIDOLUHUR', 'SINUNGREJO', 'AMBARWINANGUN', 'PENEKET', 'SIDOREJO', 'SIDOMULYO', 'SIDOMUKTI', 'PRASUTAN', 'KRADENAN', 'PAGEDANGAN', 'SUROBAYAN', 'DUKUHREJOSARI', 'KEMBANGSAWIT'],
  MIRIT: ['MIRITPETIKUSAN', 'TLOGODEPOK', 'MIRIT', 'TLOGOPRAGOTO', 'LEMBUPURWO', 'WIROMARTAN', 'ROWO', 'SINGOYUDAN', 'WERGONAYAN', 'SELOTUMPENG', 'SITIBENTAR', 'KARANGGEDE', 'KERTODESO', 'PATUKREJOMULYO', 'PATUKGAWEMULYO', 'MANGUNRANAN', 'PEKUTAN', 'WIROGATEN', 'WINONG', 'NGABEAN', 'SARWOGADUNG', 'KRUBUNGAN'],
  BONOROWO: ['PATUKREJO', 'NGASINAN', 'PUJODADI', 'BALOREJO', 'TLOGOREJO', 'ROWOSARI', 'BONOROWO', 'SIRNOBOYO', 'BONJOKKIDUL', 'BONJOKLOR', 'MRENTUL'],
  PREMBUN: ['TERSOBO', 'PREMBUN', 'KABEKELAN', 'TUNGGALROSO', 'KEDUNGWARU', 'BAGUNG', 'SIDOGEDE', 'SEMBIRKADIPATEN', 'KEDUNGBULUS', 'MULYOSRI', 'PESUNINGAN', 'PECARIKAN', 'KABUARAN'],
  PADURESO: ['PEJENGKOLAN', 'BALINGASAL', 'MERDEN', 'KALIJERING', 'KALIGUBUK', 'SIDOTOTO', 'RAHAYU', 'SENDANGDALEM', 'PADURESO'],
  KUTOWINANGUN: ['PEKUNDEN', 'TANJUNGMERU', 'KUWARISAN', 'KUTOWINANGUN', 'LUNDONG', 'MEKARSARI', 'BABADSARI', 'UNGARAN', 'MRINEN', 'PEJAGATAN', 'TRIWARNO', 'KOROWELANG', 'JLEGIWINANGUN', 'LUMBU', 'TANJUNGSARI', 'KALIPUTIH', 'TUNJUNGSETO', 'PESALAKAN', 'KARANGSARI'],
  ALIAN: ['BOJONGSARI', 'SUROTRUNAN', 'KAMBANGSARI', 'JATIMULYO', 'TANUHARJO', 'KARANGTANJUNG', 'KEMANGGUHAN', 'KALIJAYA', 'KARANGKEMBANG', 'SELILING', 'TLOGOWULUNG', 'KALIPUTIH', 'WONOKROMO', 'SAWANGAN', 'KALIRANCANG', 'KRAKAL'],
  PONCOWARNO: ['JATIPURUS', 'LEREPKEBUMEN', 'BLATER', 'PONCOWARNO', 'TEGALREJO', 'JEMBANGAN', 'KEDUNGDOWO', 'KARANGTENGAH', 'TIRTOMOYO', 'SOKA', 'KEBAPANGAN'],
  KEBUMEN: ['MUKTISARI', 'MURTIREJO', 'DEPOKREJO', 'MENGKOWO', 'GESIKAN', 'KALIBAGOR', 'ARGOPENI', 'JATISARI', 'KALIREJO', 'SELANG', 'ADIKARSO', 'TAMANWINANGUN', 'PANJER', 'KEMBARAN', 'SUMBERADI', 'WONOSARI', 'ROWOREJO', 'TANAHSARI', 'BANDUNG', 'CANDIMULYO', 'KALIJIREK', 'CANDIWULAN', 'KAWEDUSAN', 'KEBUMEN', 'KUTOSARI', 'BUMIREJO', 'GEMEKSEKTI', 'KARANGSARI', 'JEMUR'],
  PEJAGOAN: ['LOGEDE', 'KUWAYUHAN', 'KEDAWUNG', 'PEJAGOAN', 'KEBULUSAN', 'ADITIRTO', 'KARANGPOH', 'JEMUR', 'PRIGI', 'KEBAGORAN', 'PENGARINGAN', 'PENIRON', 'WATULAWANG'],
  SRUWENG: ['MENGANTI', 'TRIKARSO', 'SIDOHARJO', 'GIWANGRETNO', 'JABRES', 'SRUWENG', 'KARANGGEDANG', 'PURWODESO', 'KLEPUSANGGAR', 'TANGGERAN', 'KARANGSARI', 'KARANGPULE', 'PAKURAN', 'PENGEMPON', 'KEJAWANG', 'KARANGJAMBU', 'SIDOAGUNG', 'PENUSUPAN', 'DONOSARI', 'PANDANSARI', 'CONDONGCAMPUR'],
  ADIMULYO: ['ADIMULYO', 'ADIKARSO', 'BANYUROTO', 'BONJOK', 'CANDIWULAN', 'CARUBAN', 'JOJOGAN', 'KEMUJAN', 'MANIKEN', 'MELES', 'PEKUNCEN', 'SEKORTEJO', 'SIDOMUKTI', 'SUGIHWARAS', 'TAMBAKHARJO', 'TEGALSARI', 'TEMANGGAL', 'WIJAYAKUSUMA', 'WLAHAR'],
  KUWARASAN: ['BANJARSARI', 'BENDUNGAN', 'GANDUSARI', 'GUMAWANG', 'GUNUNGMUJIL', 'HARJODOWO', 'JATIMULYO', 'KALIPURWO', 'KAMULYAN', 'KUWARASAN', 'KUWARU', 'LEMBUKARA', 'MADURESO', 'MANGUNSARI', 'PONDOKGEBANG', 'PURWODADI', 'SAWANGAN', 'SERUT', 'SIDOMUKTI', 'TAMBAKSMULYO', 'WONOYOSO', 'PURWOKERTO'],
  ROWOKELE: ['BUMIAGUNG', 'GHATAK', 'JATILUHUR', 'KALISARI', 'KARANGGAYAM', 'KRETEK', 'PRINGTUTUL', 'REDIN', 'ROWOKELE', 'SUKORAHAYU', 'WAGIRPANDAN', 'WONOHARJO'],
  SEMPOR: ['BEJIRAHAYU', 'BONOSARI', 'DONOREJO', 'JATINEGARA', 'KEDUNGWADAS', 'KEDUNGWRINGIN', 'PEKUNCEN', 'SAMPIREJO', 'SEMPOR', 'SIDOHARJO', 'SOMAGEDE', 'TUNJUNGSETO'],
  GOMBONG: ['BANJARSARI', 'KALITENGAH', 'KEDUNGPUJI', 'KLOPOGODO', 'KEMUKUS', 'PATEMON', 'SEMANDING', 'SEMMAWUR', 'WONOKRIYO', 'WONOSIGRO', 'GOMBONG'],
  KARANGANYAR: ['CANDI', 'GIRIPURNO', 'GRENGGENG', 'JATILUHUR', 'KARANGKEMIRI', 'PANINGKABAN', 'PLARANGAN', 'POKOR', 'SIDOMULYO', 'WONOREJO', 'KARANGANYAR'],
  KARANGGAYAM: ['BINANGUN', 'CLAPAR', 'GUNUNGGELAP', 'GUNTUR', 'KALIBENING', 'KALIREJO', 'KARANGGAYAM', 'KARANGMOJO', 'KARANGREJO', 'KARANGTENGAH', 'KEBAK', 'LOGANDU', 'PAGEBANGAN', 'PENIMBUN', 'SELOHARJO', 'WONOTIRTO'],
  SADANG: ['CANGKRING', 'KEDUNGGONG', 'PUCANGAN', 'SADANGKULON', 'SADANGWETAN', 'SEBORO', 'WONOSARI'],
  KARANGSAMBUNG: ['BANIORO', 'KALIGENDING', 'KALISANA', 'KARANGSAMBUNG', 'LANGSE', 'PENCIL', 'PLUMBON', 'PUJOTIRTO', 'SELING', 'TLEPOK', 'TOTOGAN', 'WADASMALANG', 'WIDORO'],
};

// 60 Header Standar Dinas untuk Ekspor Excel
const HEADERS = [
  'AJ Sapi', 'AB Sapi', 'MJ Sapi', 'MB Sapi', 'DJ Sapi', 'DB Sapi', 'Total Sapi Potong',
  'AJ Perah', 'AB Perah', 'MJ Perah', 'MB Perah', 'DJ Perah', 'DB Perah', 'Total Sapi Perah',
  'AJ Kerbau', 'AB Kerbau', 'MJ Kerbau', 'MB Kerbau', 'DJ Kerbau', 'DB Kerbau', 'Total Kerbau',
  'AJ Kuda', 'AB Kuda', 'MJ Kuda', 'MB Kuda', 'DJ Kuda', 'DB Kuda', 'Total Kuda',
  'AJ Kambing', 'AB Kambing', 'MJ Kambing', 'MB Kambing', 'DJ Kambing', 'DB Kambing', 'Total Kambing',
  'AJ Domba', 'AB Domba', 'MJ Domba', 'MB Domba', 'DJ Domba', 'DB Domba', 'Total Domba',
  'AJ Babi', 'AB Babi', 'MJ Babi', 'MB Babi', 'DJ Babi', 'DB Babi', 'Total Babi',
  'Ayam Kampung', 'Ayam Petelur', 'Ayam Broiler', 'Puyuh', 'Itik', 'Entog', 'Angsa', 'Merpati',
  'Kelinci Jantan', 'Kelinci Betina',
];

interface RuminantConfig {
  id: string;
  name: string;
  prefix: string;
  totalKey: string;
  icon: string;
}

const RUMINANT_BIG: RuminantConfig[] = [
  { id: 'sapi-potong', name: 'Sapi Potong', prefix: 'Sapi', totalKey: 'Total Sapi Potong', icon: '🐂' },
  { id: 'sapi-perah', name: 'Sapi Perah', prefix: 'Perah', totalKey: 'Total Sapi Perah', icon: '🐄' },
  { id: 'kerbau', name: 'Kerbau', prefix: 'Kerbau', totalKey: 'Total Kerbau', icon: '🐃' },
  { id: 'kuda', name: 'Kuda', prefix: 'Kuda', totalKey: 'Total Kuda', icon: '🐎' },
];

const RUMINANT_SMALL: RuminantConfig[] = [
  { id: 'kambing', name: 'Kambing', prefix: 'Kambing', totalKey: 'Total Kambing', icon: '🐐' },
  { id: 'domba', name: 'Domba', prefix: 'Domba', totalKey: 'Total Domba', icon: '🐑' },
];

const MONOGASTRIC: RuminantConfig[] = [
  { id: 'babi', name: 'Babi', prefix: 'Babi', totalKey: 'Total Babi', icon: '🐖' },
];

const UNGGAS = [
  { key: 'Ayam Kampung', name: 'Ayam Kampung', icon: '🐔', desc: 'Buras / Unggas Lokal' },
  { key: 'Ayam Petelur', name: 'Ayam Petelur', icon: '🥚', desc: 'Layer Komersial' },
  { key: 'Ayam Broiler', name: 'Ayam Broiler', icon: '🍗', desc: 'Pedaging Komersial' },
  { key: 'Itik', name: 'Itik / Bebek', icon: '🦆', desc: 'Unggas Air Petelur/Pedaging' },
  { key: 'Entog', name: 'Entog / Manila', icon: '🦢', desc: 'Unggas Air Pedaging' },
  { key: 'Puyuh', name: 'Burung Puyuh', icon: '🐦', desc: 'Petelur / Aneka Unggas' },
  { key: 'Angsa', name: 'Angsa', icon: '🪿', desc: 'Unggas Air Besar' },
  { key: 'Merpati', name: 'Burung Merpati', icon: '🕊️', desc: 'Merpati / Burung Dara' },
];

const ANEKA_TERNAK = [
  { key: 'Kelinci Jantan', name: 'Kelinci Jantan (♂)', icon: '🐰', desc: 'Pejantan / Calon Bibit' },
  { key: 'Kelinci Betina', name: 'Kelinci Betina (♀)', icon: '🐇', desc: 'Indukan Produktif' },
];

const CATEGORIES = [
  { id: 'besar', label: 'Ruminansia Besar', icon: '🐂', desc: 'Sapi Potong, Sapi Perah, Kerbau, Kuda' },
  { id: 'kecil', label: 'Ruminansia Kecil', icon: '🐐', desc: 'Kambing & Domba' },
  { id: 'monogastrik', label: 'Babi', icon: '🐖', desc: 'Data Populasi Ternak Babi' },
  { id: 'unggas', label: 'Unggas', icon: '🐔', desc: 'Ayam, Itik, Entog, Puyuh, dll' },
  { id: 'aneka', label: 'Aneka Ternak', icon: '🐰', desc: 'Kelinci Jantan & Betina' },
];

function InputPopulasi2026Content() {
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || '2026';
  const [tw, setTw] = useState('TW 1');
  const [kec, setKec] = useState('');
  const [desa, setDesa] = useState('');
  const [activeCategory, setActiveCategory] = useState('besar');
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedData, setSavedData] = useState<any[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Fungsi kalkulasi otomatis total per jenis ternak ruminansia
  const calculateTotal = (prefix: string) => {
    const aj = Number(values[`AJ ${prefix}`]) || 0;
    const ab = Number(values[`AB ${prefix}`]) || 0;
    const mj = Number(values[`MJ ${prefix}`]) || 0;
    const mb = Number(values[`MB ${prefix}`]) || 0;
    const dj = Number(values[`DJ ${prefix}`]) || 0;
    const db = Number(values[`DB ${prefix}`]) || 0;
    return aj + ab + mj + mb + dj + db;
  };

  // Grand Total ternak di desa saat ini
  const grandTotalDesa = useMemo(() => {
    let sum = 0;
    // Ruminants totals
    [...RUMINANT_BIG, ...RUMINANT_SMALL, ...MONOGASTRIC].forEach((r) => {
      sum += calculateTotal(r.prefix);
    });
    // Unggas
    UNGGAS.forEach((u) => {
      sum += Number(values[u.key]) || 0;
    });
    // Aneka
    ANEKA_TERNAK.forEach((a) => {
      sum += Number(values[a.key]) || 0;
    });
    return sum;
  }, [values]);

  // Helper ringkasan spesies ringkas untuk mobile & desktop
  const getConciseSummary = (vals: Record<string, string>) => {
    if (!vals || typeof vals !== 'object') return [];
    const summary: { name: string; total: number }[] = [];
    
    // Ruminansia Besar, Kecil & Monogastrik
    [...RUMINANT_BIG, ...RUMINANT_SMALL, ...MONOGASTRIC].forEach((r) => {
      const sum = ['AJ', 'AB', 'MJ', 'MB', 'DJ', 'DB'].reduce(
        (acc, age) => acc + (Number(vals[`${age} ${r.prefix}`]) || 0),
        0
      );
      if (sum > 0) {
        summary.push({ name: r.name, total: sum });
      } else if (Number(vals[r.totalKey]) > 0) {
        summary.push({ name: r.name, total: Number(vals[r.totalKey]) });
      }
    });

    // Unggas
    UNGGAS.forEach((u) => {
      const val = Number(vals[u.key]) || 0;
      if (val > 0) summary.push({ name: u.name, total: val });
    });

    // Aneka Ternak (Kelinci)
    const kelinci = (Number(vals['Kelinci Jantan']) || 0) + (Number(vals['Kelinci Betina']) || 0);
    if (kelinci > 0) {
      summary.push({ name: 'Kelinci', total: kelinci });
    } else if (Number(vals['Kelinci']) > 0) {
      summary.push({ name: 'Kelinci', total: Number(vals['Kelinci']) });
    }

    return summary;
  };

  // Handler pengubahan nilai input angka
  const handleInputChange = (key: string, val: string) => {
    // Validasi angka positif
    const cleaned = val.replace(/[^0-9]/g, '');
    const newValues = { ...values, [key]: cleaned };

    // Auto-update total kolom jika ini adalah ruminansia
    [...RUMINANT_BIG, ...RUMINANT_SMALL, ...MONOGASTRIC].forEach((r) => {
      if (key.includes(r.prefix)) {
        const aj = Number(key === `AJ ${r.prefix}` ? cleaned : newValues[`AJ ${r.prefix}`]) || 0;
        const ab = Number(key === `AB ${r.prefix}` ? cleaned : newValues[`AB ${r.prefix}`]) || 0;
        const mj = Number(key === `MJ ${r.prefix}` ? cleaned : newValues[`MJ ${r.prefix}`]) || 0;
        const mb = Number(key === `MB ${r.prefix}` ? cleaned : newValues[`MB ${r.prefix}`]) || 0;
        const dj = Number(key === `DJ ${r.prefix}` ? cleaned : newValues[`DJ ${r.prefix}`]) || 0;
        const db = Number(key === `DB ${r.prefix}` ? cleaned : newValues[`DB ${r.prefix}`]) || 0;
        const total = aj + ab + mj + mb + dj + db;
        newValues[r.totalKey] = total > 0 ? String(total) : '';
      }
    });

    setValues(newValues);
  };

  // Tombol reset/kosongkan kategori aktif
  const handleClearCategory = (catId: string) => {
    const updated = { ...values };
    if (catId === 'besar') {
      RUMINANT_BIG.forEach((r) => {
        ['AJ', 'AB', 'MJ', 'MB', 'DJ', 'DB'].forEach((age) => {
          delete updated[`${age} ${r.prefix}`];
        });
        delete updated[r.totalKey];
      });
    } else if (catId === 'kecil') {
      RUMINANT_SMALL.forEach((r) => {
        ['AJ', 'AB', 'MJ', 'MB', 'DJ', 'DB'].forEach((age) => {
          delete updated[`${age} ${r.prefix}`];
        });
        delete updated[r.totalKey];
      });
    } else if (catId === 'unggas') {
      UNGGAS.forEach((u) => {
        delete updated[u.key];
      });
    } else if (catId === 'aneka') {
      ANEKA_TERNAK.forEach((a) => {
        delete updated[a.key];
      });
    } else if (catId === 'monogastrik') {
      MONOGASTRIC.forEach((r) => {
        ['AJ', 'AB', 'MJ', 'MB', 'DJ', 'DB'].forEach((age) => {
          delete updated[`${age} ${r.prefix}`];
        });
        delete updated[r.totalKey];
      });
    }
    setValues(updated);
  };

  // Navigasi langkah kategori
  const currentIndex = CATEGORIES.findIndex((c) => c.id === activeCategory);
  const goToNextCategory = () => {
    if (currentIndex < CATEGORIES.length - 1) {
      setActiveCategory(CATEGORIES[currentIndex + 1].id);
    }
  };
  const goToPrevCategory = () => {
    if (currentIndex > 0) {
      setActiveCategory(CATEGORIES[currentIndex - 1].id);
    }
  };

  // Hitung jumlah data terisi di setiap tab
  const getCategoryCount = (catId: string) => {
    let count = 0;
    if (catId === 'besar') {
      RUMINANT_BIG.forEach((r) => {
        if (calculateTotal(r.prefix) > 0) count++;
      });
    } else if (catId === 'kecil') {
      RUMINANT_SMALL.forEach((r) => {
        if (calculateTotal(r.prefix) > 0) count++;
      });
    } else if (catId === 'unggas') {
      UNGGAS.forEach((u) => {
        if (Number(values[u.key]) > 0) count++;
      });
    } else if (catId === 'aneka') {
      ANEKA_TERNAK.forEach((a) => {
        if (Number(values[a.key]) > 0) count++;
      });
    } else if (catId === 'monogastrik') {
      MONOGASTRIC.forEach((r) => {
        if (calculateTotal(r.prefix) > 0) count++;
      });
    }
    return count;
  };

  // Fetch data dari database MySQL
  const [isLoadingData, setIsLoadingData] = useState(false);

  const fetchDatabaseData = async () => {
    try {
      setIsLoadingData(true);
      const res = await fetch(`/api/populasi-2026?tw=${encodeURIComponent(tw)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSavedData(json.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data populasi 2026:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, [tw]);

  // Simpan data desa
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kec || !desa) {
      alert('Pilih Kecamatan & Desa terlebih dahulu!');
      return;
    }

    // Pastikan seluruh total terhitung sebelum simpan
    const completeValues = { ...values };
    [...RUMINANT_BIG, ...RUMINANT_SMALL, ...MONOGASTRIC].forEach((r) => {
      const tot = calculateTotal(r.prefix);
      if (tot > 0) {
        completeValues[r.totalKey] = String(tot);
      }
    });

    try {
      const editingItem = editIdx !== null ? savedData[editIdx] : null;
      const payload = {
        id: editingItem ? editingItem.id : undefined,
        tw,
        kec,
        desa,
        values: completeValues,
        grandTotal: grandTotalDesa,
      };

      const res = await fetch('/api/populasi-2026', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        alert(json.message || 'Data populasi berhasil disimpan ke database!');
        setEditIdx(null);
        setValues({});
        setDesa('');
        setActiveCategory('besar');
        fetchDatabaseData();
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan ke database.');
    }
  };

  const handleEdit = (idx: number) => {
    const d = savedData[idx];
    setTw(d.tw || tw);
    setKec(d.kec);
    setDesa(d.desa);
    setValues(d.values || {});
    setEditIdx(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (idx: number) => {
    const item = savedData[idx];
    if (confirm(`Hapus entri data populasi desa ${item.desa}?`)) {
      if (item.id) {
        try {
          const res = await fetch(`/api/populasi-2026?id=${item.id}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.success) {
            setSavedData(savedData.filter((_, i) => i !== idx));
          } else {
            alert('Gagal menghapus: ' + json.error);
          }
        } catch {
          alert('Terjadi kesalahan koneksi.');
        }
      } else {
        setSavedData(savedData.filter((_, i) => i !== idx));
      }
    }
  };

  // Ekspor Excel Lengkap 60 Kolom
  const handleDownload = () => {
    if (savedData.length === 0) return alert('Belum ada data desa untuk diexport.');
    const data = savedData.map((d, i) => {
      const row: Record<string, any> = {
        No: i + 1,
        'Triwulan': d.tw,
        'Kecamatan': d.kec,
        'Desa': d.desa,
      };
      HEADERS.forEach((h) => {
        row[h] = Number(d.values[h]) || 0;
      });
      row['TOTAL TERNAK DESA'] = d.grandTotal || 0;
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DataPopulasi2026');
    XLSX.writeFile(wb, `Data_Populasi_Kebumen_2026_${tw}.xlsx`);
  };

  // Fitur Bulk Upload Excel
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rows || rows.length === 0) {
          alert('File Excel kosong atau format tidak sesuai.');
          return;
        }

        const imported = rows.map((r) => {
          const valObj: Record<string, string> = {};
          let totalDesa = 0;
          HEADERS.forEach((h) => {
            if (r[h] !== undefined && r[h] !== null) {
              valObj[h] = String(r[h]);
              totalDesa += Number(r[h]) || 0;
            }
          });
          return {
            tw: r['Triwulan'] || r['TW'] || tw,
            kec: String(r['Kecamatan'] || '').toUpperCase(),
            desa: String(r['Desa'] || '').toUpperCase(),
            values: valObj,
            grandTotal: totalDesa,
          };
        }).filter((item) => item.kec && item.desa);

        const res = await fetch('/api/populasi-2026', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imported),
        });
        const json = await res.json();

        if (json.success) {
          alert(`Berhasil mengimpor dan menyimpan ${imported.length} data populasi desa ke database!`);
          setShowBulkUpload(false);
          fetchDatabaseData();
        } else {
          alert('Gagal menyimpan impor: ' + json.error);
        }
      } catch {
        alert('Gagal membaca file Excel. Pastikan format kolom sesuai.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-24">
      
      {/* ── TOP HEADER (Lega & Bernapas) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/bitpro/populasi-dan-produksi"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Menu Populasi"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/bitpro" className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors truncate">
                  Bitpro
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Populasi {year}</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Data Populasi Ternak {year}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowBulkUpload(true)}
              title="Import Excel"
              aria-label="Import Excel"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <UploadCloud size={16} className="text-emerald-700" />
              <span className="hidden sm:inline">Import Excel</span>
            </button>

            <button
              onClick={handleDownload}
              title="Export Excel"
              aria-label="Export Excel"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* ── FORMULIR DATA POPULASI PER DESA ── */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Header Form & Telemetri Realtime */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <h2 className="font-bold text-base sm:text-lg text-slate-900">
                  {editIdx !== null ? 'Edit Data Populasi Desa ✏️' : 'Formulir Input Data Populasi Per Desa'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih wilayah dan masukkan jumlah ternak per kategori. Total akan dihitung otomatis.
              </p>
            </div>

            {/* Realtime Grand Total Card */}
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Calculator size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Total Ternak Terinput
                </span>
                <span className="text-lg font-bold text-emerald-900">
                  {grandTotalDesa.toLocaleString('id-ID')} <span className="text-xs font-normal">Ekor</span>
                </span>
              </div>
            </div>
          </div>

          {/* Wilayah & Triwulan Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Triwulan (TW)
              </label>
              <select
                value={tw}
                onChange={(e) => setTw(e.target.value)}
                className="w-full min-h-touch h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 outline-none shadow-2xs"
              >
                <option>TW 1</option>
                <option>TW 2</option>
                <option>TW 3</option>
                <option>TW 4</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Kecamatan
              </label>
              <select
                value={kec}
                onChange={(e) => {
                  setKec(e.target.value);
                  setDesa('');
                }}
                required
                className="w-full min-h-touch h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 outline-none shadow-2xs"
              >
                <option value="">-- Pilih Kecamatan --</option>
                {Object.keys(DATA_WILAYAH).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Desa / Kelurahan
              </label>
              <select
                value={desa}
                onChange={(e) => setDesa(e.target.value)}
                disabled={!kec}
                required
                className="w-full min-h-touch h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 outline-none shadow-2xs disabled:opacity-50"
              >
                <option value="">{kec ? '-- Pilih Desa --' : 'Pilih Kecamatan Terlebih Dahulu'}</option>
                {kec &&
                  DATA_WILAYAH[kec]?.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* ── TAB NAVIGASI 5 KATEGORI TERNAK ── */}
          <div className="space-y-4">
            
            {/* Tab Buttons (Scrollable di Mobile) */}
            <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar scroll-smooth -mx-6 px-6 sm:mx-0 sm:px-0">
              {CATEGORIES.map((cat) => {
                const active = activeCategory === cat.id;
                const filledCount = getCategoryCount(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`min-h-touch h-12 px-4 sm:px-5 rounded-t-2xl text-xs sm:text-sm font-bold border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      active
                        ? 'bg-white border-slate-200 text-emerald-700 border-b-white translate-y-px shadow-xs'
                        : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-100/70'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    {filledCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                        {filledCount} Terisi
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Bar per Kategori */}
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-semibold text-slate-500">
                {CATEGORIES.find((c) => c.id === activeCategory)?.desc}
              </span>
              <button
                type="button"
                onClick={() => handleClearCategory(activeCategory)}
                className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Kosongkan Kategori Ini (Set 0)
              </button>
            </div>

            {/* ── KONTEN TAB 1: RUMINANSIA BESAR ── */}
            {activeCategory === 'besar' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
                {RUMINANT_BIG.map((r) => (
                  <RuminantInputCard
                    key={r.id}
                    config={r}
                    values={values}
                    onChange={handleInputChange}
                    totalValue={calculateTotal(r.prefix)}
                  />
                ))}
              </div>
            )}

            {/* ── KONTEN TAB 2: RUMINANSIA KECIL ── */}
            {activeCategory === 'kecil' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
                {RUMINANT_SMALL.map((r) => (
                  <RuminantInputCard
                    key={r.id}
                    config={r}
                    values={values}
                    onChange={handleInputChange}
                    totalValue={calculateTotal(r.prefix)}
                  />
                ))}
              </div>
            )}

            {/* ── KONTEN TAB 3: UNGGAS ── */}
            {activeCategory === 'unggas' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
                {UNGGAS.map((u) => (
                  <div key={u.key} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{u.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{u.name}</h4>
                        <p className="text-[10px] text-slate-400">{u.desc}</p>
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={values[u.key] || ''}
                        onChange={(e) => handleInputChange(u.key, e.target.value)}
                        className="w-full min-h-touch h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-base font-bold text-slate-900 text-center sm:text-right focus:border-emerald-500 focus:bg-white outline-none shadow-2xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── KONTEN TAB 4: ANEKA TERNAK (KELINCI) ── */}
            {activeCategory === 'aneka' && (
              <div className="p-6 rounded-3xl border border-slate-200 bg-white space-y-4 animate-in fade-in duration-200 max-w-2xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🐰</span>
                    <div>
                      <h4 className="font-bold text-base text-slate-900">Populasi Kelinci</h4>
                      <p className="text-xs text-slate-500">Data populasi ternak kelinci jantan dan betina</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Total: {((Number(values['Kelinci Jantan']) || 0) + (Number(values['Kelinci Betina']) || 0)).toLocaleString('id-ID')} Ekor
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {ANEKA_TERNAK.map((a) => (
                    <div key={a.key} className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        {a.name}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={values[a.key] || ''}
                        onChange={(e) => handleInputChange(a.key, e.target.value)}
                        className="w-full min-h-touch h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-base font-bold text-slate-900 text-center sm:text-right focus:border-emerald-500 focus:bg-white outline-none shadow-2xs"
                      />
                      <p className="text-[11px] text-slate-400">{a.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── KONTEN TAB 5: MONOGASTRIK (BABI) ── */}
            {activeCategory === 'monogastrik' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
                {MONOGASTRIC.map((r) => (
                  <RuminantInputCard
                    key={r.id}
                    config={r}
                    values={values}
                    onChange={handleInputChange}
                    totalValue={calculateTotal(r.prefix)}
                  />
                ))}
              </div>
            )}

          </div>

          {/* ── BOTTOM NAV & SUBMIT BAR ── */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Step navigation buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={goToPrevCategory}
                disabled={currentIndex === 0}
                className="min-h-touch h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                onClick={goToNextCategory}
                disabled={currentIndex === CATEGORIES.length - 1}
                className="min-h-touch h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {editIdx !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setEditIdx(null);
                    setValues({});
                    setDesa('');
                  }}
                  className="w-full sm:w-auto min-h-touch h-11 px-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Batal Edit
                </button>
              )}
              <button
                type="submit"
                className="w-full sm:w-auto min-h-touch h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>{editIdx !== null ? 'Perbarui Data Desa' : 'Simpan Data Desa'}</span>
              </button>
            </div>

          </div>

        </form>

        {/* ── TABEL DATA DESA TERISI SIAP EXPORT ── */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-0">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-700" />
                <span>Rekapitulasi Desa Terinput ({savedData.length} Desa)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Data siap diekspor ke format berkas Excel resmi 60 kolom dinas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={savedData.length === 0}
                className="min-h-touch h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Download size={15} strokeWidth={2.5} />
                <span>Unduh Excel ({savedData.length})</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5 w-12 text-center">NO</th>
                  <th className="p-3.5">TRIWULAN</th>
                  <th className="p-3.5">KECAMATAN</th>
                  <th className="p-3.5">DESA</th>
                  <th className="p-3.5">RINGKASAN TERNAK TERISI</th>
                  <th className="p-3.5 text-center w-24">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {savedData.length > 0 ? (
                  savedData.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-center font-sans text-slate-400">{i + 1}</td>
                      <td className="p-3.5 font-bold text-emerald-800">{d.tw}</td>
                      <td className="p-3.5 font-bold text-slate-900">{d.kec}</td>
                      <td className="p-3.5 text-slate-700 font-semibold">{d.desa}</td>
                      <td className="p-3.5">
                        {/* Tampilan Mobile: Ringkas & Padat */}
                        <div className="sm:hidden space-y-1.5 py-1">
                          {getConciseSummary(d.values).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {getConciseSummary(d.values).map((s) => (
                                <span
                                  key={s.name}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-200 text-[11px]"
                                >
                                  <span className="font-semibold text-slate-600">{s.name}:</span>
                                  <strong className="font-extrabold text-emerald-800">{s.total.toLocaleString('id-ID')}</strong>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Semua 0 / Belum terisi</span>
                          )}
                        </div>

                        {/* Tampilan Desktop: Lengkap per Rincian Usia */}
                        <div className="hidden sm:flex flex-wrap gap-1.5 max-w-xl py-1">
                          {Object.entries(d.values).filter(([k, v]) => v && v !== '0' && !k.startsWith('Total')).length > 0 ? (
                            Object.entries(d.values)
                              .filter(([k, v]) => v && v !== '0' && !k.startsWith('Total'))
                              .map(([k, v]) => (
                                <span
                                  key={k}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-medium shadow-2xs hover:border-emerald-400 transition-colors"
                                >
                                  <span className="text-slate-500 font-semibold">{k}:</span>
                                  <span className="font-extrabold text-emerald-700">{String(v)}</span>
                                </span>
                              ))
                          ) : getConciseSummary(d.values).length > 0 ? (
                            getConciseSummary(d.values).map((s) => (
                              <span
                                key={s.name}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-emerald-300 bg-emerald-50 text-slate-800 text-xs font-medium shadow-2xs hover:border-emerald-400 transition-colors"
                              >
                                <span className="text-slate-600 font-semibold">{s.name}:</span>
                                <span className="font-extrabold text-emerald-800">{s.total.toLocaleString('id-ID')}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">Semua 0 / Belum terisi</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(i)}
                            className="min-h-touch h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit Data Desa"
                          >
                            <Edit2 size={13} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(i)}
                            className="min-h-touch h-8 w-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Hapus Data Desa"
                          >
                            <Trash2 size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 text-sm font-medium">
                      Belum ada data desa yang diinput pada sesi tahun 2026.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ── MODAL BULK UPLOAD EXCEL ── */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Import File Excel Data Populasi</h3>
                  <p className="text-xs text-slate-500">Unggah berkas rekap data populasi seluruh desa</p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkUpload(false)}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Format file Excel harus memiliki kolom header: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold">Kecamatan</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold">Desa</code>, dan nama-nama kolom komoditas.
              </p>
              
              <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 cursor-pointer transition-colors text-center">
                <UploadCloud size={28} className="text-emerald-600 mb-2" />
                <span className="text-xs font-bold text-emerald-900">Pilih Berkas Excel (.xlsx / .xls)</span>
                <span className="text-[10px] text-slate-400 mt-1">Sistem akan membaca seluruh baris desa secara otomatis</span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkUpload(false)}
                className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── KOMPONEN KARTU INPUT RUMINANSIA DENGAN MATRIKS UMUR & GENDER ──
function RuminantInputCard({
  config,
  values,
  onChange,
  totalValue,
}: {
  config: RuminantConfig;
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  totalValue: number;
}) {
  const { name, prefix, icon } = config;

  return (
    <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4 hover:border-emerald-200 transition-colors">
      
      {/* Card Header with Auto Calculated Total */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{icon}</span>
          <div>
            <h4 className="font-bold text-base text-slate-900">{name}</h4>
            <span className="text-[11px] text-slate-400">Struktur Umur & Gender</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total</span>
          <span className="text-sm font-bold text-emerald-800 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 font-sans">
            {totalValue.toLocaleString('id-ID')} Ekor
          </span>
        </div>
      </div>

      {/* Matriks Input: Jantan & Betina */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Kolom Jantan */}
        <div className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-300 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-blue-200 text-blue-900 font-extrabold text-xs">
            <span className="flex items-center gap-1">
              <span>♂️</span>
              <span>JANTAN</span>
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-bold text-blue-950 mb-0.5">Anak Jantan</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`AJ ${prefix}`] || ''}
                onChange={(e) => onChange(`AJ ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-blue-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-blue-950 mb-0.5">Muda Jantan</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`MJ ${prefix}`] || ''}
                onChange={(e) => onChange(`MJ ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-blue-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-blue-950 mb-0.5">Dewasa Jantan</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`DJ ${prefix}`] || ''}
                onChange={(e) => onChange(`DJ ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-blue-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Kolom Betina */}
        <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-rose-200 text-rose-900 font-extrabold text-xs">
            <span className="flex items-center gap-1">
              <span>♀️</span>
              <span>BETINA</span>
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-bold text-rose-950 mb-0.5">Anak Betina</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`AB ${prefix}`] || ''}
                onChange={(e) => onChange(`AB ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-rose-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-rose-600 focus:ring-1 focus:ring-rose-500 outline-none shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-rose-950 mb-0.5">Muda Betina</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`MB ${prefix}`] || ''}
                onChange={(e) => onChange(`MB ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-rose-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-rose-600 focus:ring-1 focus:ring-rose-500 outline-none shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-rose-950 mb-0.5">Dewasa Betina</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`DB ${prefix}`] || ''}
                onChange={(e) => onChange(`DB ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-rose-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-rose-600 focus:ring-1 focus:ring-rose-500 outline-none shadow-2xs"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function InputPopulasi2026() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-500 uppercase tracking-widest animate-pulse">
          Memuat Data Populasi...
        </div>
      }
    >
      <InputPopulasi2026Content />
    </Suspense>
  );
}

