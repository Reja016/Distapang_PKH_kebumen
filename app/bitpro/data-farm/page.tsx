'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import {
  ArrowLeft,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Building2,
  PackageCheck,
  Activity,
  Layers,
  TrendingUp,
  Download,
  MapPin,
  Compass,
  CheckCircle2,
  AlertCircle,
  Phone,
  LayoutGrid,
  RefreshCw,
} from 'lucide-react';

/* ======================= TIPE DATA & KONFIGURASI ======================= */
type CommodityKey = 'broiler' | 'petelur' | 'sapi' | 'domba' | 'babi';

const KECAMATAN_DESA_MAP: Record<string, string[]> = {
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

const KECAMATAN_LIST = Object.keys(KECAMATAN_DESA_MAP);

const COMMODITY_META: Record<CommodityKey, any> = {
  broiler: {
    title: 'Ayam Broiler',
    subtitle: 'Ayam Pedaging',
    icon: Building2,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badge: 'Unggas Daging',
  },
  petelur: {
    title: 'Ayam Petelur',
    subtitle: 'Ayam Ras Petelur',
    icon: PackageCheck,
    iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
    badge: 'Unggas Telur',
  },
  sapi: {
    title: 'Sapi Potong',
    subtitle: 'Ternak Sapi Potong Binaan',
    icon: Activity,
    iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
    jenisTernak: 'Sapi Potong',
    badge: 'Ruminansia Besar',
  },
  domba: {
    title: 'Domba & Kambing',
    subtitle: 'Ternak Ruminansia Kecil',
    icon: Layers,
    iconColor: 'text-lime-700 bg-lime-50 border-lime-200',
    jenisTernak: 'Domba',
    badge: 'Ruminansia Kecil',
  },
  babi: {
    title: 'Babi',
    subtitle: 'Peternakan Non-Ruminansia',
    icon: TrendingUp,
    iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
    jenisTernak: 'Babi',
    badge: 'Non-Ruminansia',
  },
};

const COMMODITY_ORDER: CommodityKey[] = ['broiler', 'petelur', 'sapi', 'domba', 'babi'];

function parseNum(v: string | undefined | number): number {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  const m = String(v).replace(/[^0-9]/g, '');
  return m ? parseInt(m, 10) : 0;
}
function formatNum(n: number): string {
  return n.toLocaleString('id-ID');
}

export default function DataFarmPage() {
  const { isReady, canEdit } = usePageAuth('bitpro', 'data-farm');
  const [dataBroiler, setDataBroiler] = useState<any[]>([]);
  const [dataPetelur, setDataPetelur] = useState<any[]>([]);
  const [dataGeneral, setDataGeneral] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab switcher komoditas
  const [activeCommodity, setActiveCommodity] = useState<CommodityKey | 'overview'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [targetCategory, setTargetCategory] = useState<CommodityKey>('broiler');
  const [formValues, setFormValues] = useState<any>({});
  
  // GPS Geolocation state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // SEDOT DATA DARI MYSQL
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/get-farm');
      const data = await response.json();
      setDataBroiler(data.dataBroiler || []);
      setDataPetelur(data.dataPetelur || []);
      setDataGeneral(data.dataGeneral || []);
    } catch (error) {
      console.error('Gagal menyedot data farm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getBaseData = (key: CommodityKey): any[] => {
    if (key === 'broiler') return dataBroiler;
    if (key === 'petelur') return dataPetelur;
    const jenis = COMMODITY_META[key].jenisTernak;
    return dataGeneral.filter((d) => d.jenis_ternak === jenis);
  };

  const getFilteredData = (key: CommodityKey): any[] => {
    const base = getBaseData(key);
    if (!searchTerm.trim()) return base;
    const term = searchTerm.toLowerCase();
    return base.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(term))
    );
  };

  const getStats = (key: CommodityKey) => {
    const base = getBaseData(key);
    const jumlahFarm = base.length;
    let totalPopulasi = 0;
    let label = 'Kapasitas Kandang';
    if (key === 'broiler') {
      totalPopulasi = base.reduce((sum, d) => sum + parseNum(d.jumlah_populasi), 0);
      label = 'Populasi (Ekor)';
    } else if (key === 'petelur') {
      totalPopulasi = base.reduce((sum, d) => sum + parseNum(d.populasi_total), 0);
      label = 'Populasi (Ekor)';
    } else {
      totalPopulasi = base.reduce((sum, d) => sum + parseNum(d.kapasitas_kandang), 0);
      label = 'Kapasitas (Ekor)';
    }
    return { jumlahFarm, totalPopulasi, label };
  };

  // Open modal Tambah Baru
  const openAddModal = (cat?: CommodityKey) => {
    const activeCat = cat || (activeCommodity !== 'overview' ? activeCommodity : 'broiler');
    setTargetCategory(activeCat);
    setEditingItem(null);
    setFormValues({
      kecamatan: 'AYAH',
      desa: KECAMATAN_DESA_MAP['AYAH']?.[0] || '',
      mandiri_kemitraan: 'Kemitraan',
      status_kepemilikan: 'Milik Sendiri',
      lintang: '',
      bujur: '',
      alamat: '',
    });
    setGpsStatus(null);
    setIsModalOpen(true);
  };

  // Open modal Edit Data
  const openEditModal = (item: any, cat: CommodityKey) => {
    setTargetCategory(cat);
    setEditingItem(item);
    
    const kec = (item.kecamatan || '').toUpperCase().trim();
    const matchedKec = KECAMATAN_LIST.find((k) => k === kec) || (KECAMATAN_LIST[0]);

    setFormValues({
      ...item,
      kecamatan: matchedKec,
      desa: item.desa || item.kelurahan_desa || '',
      lintang: item.lintang || '',
      bujur: item.bujur || '',
      alamat: item.alamat || '',
    });
    setGpsStatus(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormValues({});
    setGpsStatus(null);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'kecamatan') {
      const kecUpper = value.toUpperCase();
      const firstDesa = KECAMATAN_DESA_MAP[kecUpper]?.[0] || '';
      setFormValues((prev: any) => ({
        ...prev,
        kecamatan: kecUpper,
        desa: firstDesa,
        kelurahan_desa: firstDesa,
      }));
    } else {
      setFormValues((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  // Ambil titik lokasi koordinat GPS secara otomatis dari device/browser
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser / Perangkat Anda tidak mendukung fitur Geolocation / GPS.');
      return;
    }
    setGpsLoading(true);
    setGpsStatus('Mencari sinyal satelit GPS...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);

        setFormValues((prev: any) => ({
          ...prev,
          lintang: lat,
          bujur: lng,
        }));

        setGpsStatus(`GPS Terkunci: ${lat}, ${lng}`);

        // Coba Reverse Geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'id' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setFormValues((prev: any) => ({
                ...prev,
                alamat: prev.alamat || data.display_name,
              }));
              const locName = data.address?.village || data.address?.suburb || data.address?.road || 'Lokasi Terdeteksi';
              setGpsStatus(`GPS Sukses: ${lat}, ${lng} (${locName})`);
            }
          }
        } catch {
          // Tetap simpan lintang & bujur jika reverse geocoding gagal
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.warn('GPS Geolocation Error:', error);
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus('Izin akses lokasi ditolak. Silakan ketik alamat & koordinat secara manual.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGpsStatus('Sinyal GPS tidak terdeteksi. Silakan ketik manual.');
        } else if (error.code === error.TIMEOUT) {
          setGpsStatus('Waktu pencarian GPS habis. Silakan ketik manual.');
        } else {
          setGpsStatus('Gagal mengambil GPS. Silakan gunakan input manual.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Simpan atau Perbarui Data Farm (POST / PUT)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const cat = targetCategory === 'broiler' ? 'broiler' : targetCategory === 'petelur' ? 'petelur' : 'general';
      const payload = {
        ...formValues,
        kecamatan: (formValues.kecamatan || '').toUpperCase(),
        desa: formValues.desa || formValues.kelurahan_desa || '',
        kelurahan_desa: formValues.desa || formValues.kelurahan_desa || '',
        jenis_ternak: formValues.jenis_ternak || COMMODITY_META[targetCategory].jenisTernak || 'Lainnya',
      };

      const isEdit = !!editingItem?.db_id;
      const url = '/api/get-farm';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit
        ? { id: editingItem.db_id, kategori: cat, data: payload }
        : { kategori: cat, data: payload };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        alert(isEdit ? 'Data farm berhasil diperbarui!' : 'Data farm berhasil disimpan ke database MySQL!');
        fetchData();
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan data farm.');
    }
    closeModal();
  };

  // Hapus Data Farm (DELETE)
  const handleDelete = async (item: any) => {
    if (!canEdit) return;
    const farmName = item.nama_peternak || item.nama_unit_farm || item.nama_badan_usaha || 'data farm ini';
    if (!confirm(`Apakah Anda yakin ingin menghapus "${farmName}" dari database?`)) return;

    try {
      if (item.db_id) {
        const res = await fetch(`/api/get-farm?id=${item.db_id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          alert('Data farm berhasil dihapus dari database!');
          fetchData();
        } else {
          alert('Gagal menghapus: ' + json.error);
        }
      } else {
        alert('Data berhasil dihapus.');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus data farm.');
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Broiler
    if (dataBroiler.length > 0) {
      const wsBroiler = XLSX.utils.json_to_sheet(dataBroiler);
      XLSX.utils.book_append_sheet(wb, wsBroiler, 'Ayam_Broiler');
    }
    // 2. Petelur
    if (dataPetelur.length > 0) {
      const wsPetelur = XLSX.utils.json_to_sheet(dataPetelur);
      XLSX.utils.book_append_sheet(wb, wsPetelur, 'Ayam_Petelur');
    }
    // 3. General (Babi, Sapi, Domba)
    if (dataGeneral.length > 0) {
      const wsGeneral = XLSX.utils.json_to_sheet(dataGeneral);
      XLSX.utils.book_append_sheet(wb, wsGeneral, 'Ternak_Lainnya');
    }

    XLSX.writeFile(wb, `Data_Farm_Peternakan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const currentDesaList = useMemo(() => {
    const kec = (formValues.kecamatan || 'AYAH').toUpperCase();
    return KECAMATAN_DESA_MAP[kec] || [];
  }, [formValues.kecamatan]);

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center animate-spin shadow-xs">
            <RefreshCw size={22} />
          </div>
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-emerald-800">
            Memuat Data Sebaran Farm Kabupaten...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER (Tema Hijau Bitpro) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/bitpro"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Modul Bitpro"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/bitpro" className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors truncate">
                  Bitpro
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Database Sebaran Farm</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Database &amp; Sebaran Farm Peternakan
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              title="Export Excel"
              aria-label="Export Excel"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button
              onClick={fetchData}
              title="Muat Ulang"
              aria-label="Muat Ulang"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-4 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        
        {/* ── TOP COMMODITY TAB BAR (Navigasi Langsung Sekali Klik) ── */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => {
              setActiveCommodity('overview');
              setSearchTerm('');
            }}
            className={`min-h-touch h-11 px-4 sm:px-5 rounded-t-2xl text-xs sm:text-sm font-bold border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeCommodity === 'overview'
                ? 'bg-white border-slate-200 text-emerald-700 border-b-white translate-y-px shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-100/70'
            }`}
          >
            <LayoutGrid size={16} />
            <span>Ringkasan Semua</span>
          </button>

          {COMMODITY_ORDER.map((key) => {
            const meta = COMMODITY_META[key];
            const stats = getStats(key);
            const isActive = activeCommodity === key;
            const IconComp = meta.icon;

            return (
              <button
                key={key}
                onClick={() => {
                  setActiveCommodity(key);
                  setSearchTerm('');
                }}
                className={`min-h-touch h-11 px-4 sm:px-5 rounded-t-2xl text-xs sm:text-sm font-bold border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-white border-slate-200 text-emerald-700 border-b-white translate-y-px shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-100/70'
                }`}
              >
                <IconComp size={15} />
                <span>{meta.title}</span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {stats.jumlahFarm}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── VIEW 1: OVERVIEW KARTU KOMODITAS ── */}
        {activeCommodity === 'overview' ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 bg-emerald-50/70 border border-emerald-200 p-5 rounded-3xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight">
                  Kategori Komoditas Farm Peternakan
                </h2>
                <p className="text-xs sm:text-sm text-emerald-800/80 mt-1">
                  Pilih salah satu komoditas peternakan atau gunakan tab di atas untuk melihat &amp; mengelola data farm.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-emerald-700 bg-white px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                  Total: {dataBroiler.length + dataPetelur.length + dataGeneral.length} Unit Farm
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {COMMODITY_ORDER.map((key) => {
                const meta = COMMODITY_META[key];
                const stats = getStats(key);
                const IconComp = meta.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveCommodity(key);
                      setSearchTerm('');
                    }}
                    className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:border-emerald-600 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[220px] cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${meta.iconColor}`}>
                          <IconComp size={24} />
                        </div>
                        <span className="text-xs font-sans font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {meta.badge}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors mb-1">
                        {meta.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {meta.subtitle}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        <p className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-bold">
                          Jumlah Farm
                        </p>
                        <p className="text-2xl font-black font-sans text-slate-900">
                          {stats.jumlahFarm} <span className="text-xs font-normal text-slate-500">Unit</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-bold">
                          {stats.label}
                        </p>
                        <p className="text-lg font-black font-sans text-emerald-600">
                          {formatNum(stats.totalPopulasi)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── VIEW 2: TABEL RINCIAN KOMODITAS ── */
          (() => {
            const meta = COMMODITY_META[activeCommodity];
            const filteredData = getFilteredData(activeCommodity);
            const HeaderIcon = meta.icon;

            return (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Header Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${meta.iconColor} shrink-0`}>
                      <HeaderIcon size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        Data Farm Peternakan {meta.title}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Menampilkan {filteredData.length} unit usaha peternakan terdaftar di Kabupaten Kebumen
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative min-w-[200px] sm:min-w-[260px]">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari farm, desa, kecamatan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full min-h-touch h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => openAddModal(activeCommodity)}
                        className="min-h-touch h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        <Plus size={16} />
                        <span>Tambah Data Farm</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto max-h-[70vh]">
                    <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0 z-20 border-b border-slate-200 shadow-sm">
                        <tr>
                          <th className="p-4 w-14 text-center border-r border-slate-200">NO</th>
                          <th className="p-4 border-r border-slate-200">NAMA USAHA / FARM</th>
                          <th className="p-4 border-r border-slate-200">KECAMATAN</th>
                          <th className="p-4 border-r border-slate-200">DESA</th>
                          <th className="p-4 border-r border-slate-200">STATUS</th>
                          <th className="p-4 text-right font-sans border-r border-slate-200">KAPASITAS KANDANG</th>
                          <th className="p-4 border-r border-slate-200">KOORDINAT (GPS)</th>
                          {canEdit && <th className="p-4 text-center w-36">AKSI</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {filteredData.length > 0 ? (
                          filteredData.map((item, idx) => (
                            <tr key={item.db_id || item.no || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4 text-center font-bold font-sans text-slate-400 border-r border-slate-100">
                                {idx + 1}
                              </td>
                              <td className="p-4 font-bold text-slate-900 border-r border-slate-100">
                                {item.nama_peternak || item.nama_unit_farm || item.nama_badan_usaha || item.nama_unit_farm_perusahaan || item.nama_unit_farm_mandiri || '-'}
                                {item.telp_hp && (
                                  <span className="flex items-center gap-1 text-[11px] font-normal text-slate-400 font-mono mt-0.5">
                                    <Phone size={11} className="text-slate-400 shrink-0" />
                                    <span>{item.telp_hp}</span>
                                  </span>
                                )}
                              </td>
                              <td className="p-4 font-semibold text-slate-700 border-r border-slate-100">
                                {item.kecamatan || '-'}
                              </td>
                              <td className="p-4 text-slate-600 border-r border-slate-100">
                                {item.desa || item.kelurahan_desa || '-'}
                              </td>
                              <td className="p-4 border-r border-slate-100">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  (item.mandiri_kemitraan || item.status_kepemilikan || '').toLowerCase().includes('kemitraan')
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {item.mandiri_kemitraan || item.status_kepemilikan || 'Mandiri'}
                                </span>
                              </td>
                              <td className="p-4 text-right font-sans font-bold text-emerald-700 bg-emerald-50/30 border-r border-slate-100">
                                {item.kapasitas_kandang ? formatNum(parseNum(item.kapasitas_kandang)) : '-'}
                              </td>
                              <td className="p-4 text-slate-500 font-mono text-[11px] border-r border-slate-100">
                                {item.lintang && item.bujur ? (
                                  <a
                                    href={`https://maps.google.com/?q=${item.lintang},${item.bujur}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                                    title="Buka di Google Maps"
                                  >
                                    <MapPin size={13} className="text-rose-500 shrink-0" />
                                    <span>{item.lintang}, {item.bujur}</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-300 italic">Belum diset</span>
                                )}
                              </td>
                              {canEdit && (
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => openEditModal(item, activeCommodity)}
                                      title="Edit Data Farm"
                                      className="min-h-touch h-8 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                                    >
                                      <Edit2 size={13} className="text-blue-600" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item)}
                                      title="Hapus Data Farm"
                                      className="min-h-touch h-8 px-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                                    >
                                      <Trash2 size={13} className="text-rose-600" />
                                      <span>Hapus</span>
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={canEdit ? 8 : 7} className="p-12 text-center text-slate-400 font-medium text-xs">
                              Tidak ada data farm yang cocok dengan pencarian &quot;{searchTerm}&quot;.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          })()
        )}

      </main>

      {/* ── MODAL TAMBAH / EDIT DATA FARM ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    {editingItem ? `Edit Data Farm` : `Tambah Data Farm Baru`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kategori Komoditas: <strong className="text-emerald-700">{COMMODITY_META[targetCategory].title}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Bagian 1: Identitas Usaha */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Identitas Usaha &amp; Pengelola
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Badan Usaha / Perusahaan
                    </label>
                    <input
                      type="text"
                      name="nama_badan_usaha"
                      placeholder="Contoh: PT. Sumber Unggas Jaya / CV. Makmur"
                      value={formValues.nama_badan_usaha || ''}
                      onChange={handleFieldChange}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Unit Farm / Nama Peternak <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="nama_peternak"
                      placeholder="Contoh: Farm Pak Sutrisno"
                      value={formValues.nama_peternak || formValues.nama_unit_farm || ''}
                      onChange={(e) => {
                        handleFieldChange(e);
                        setFormValues((prev: any) => ({ ...prev, nama_unit_farm: e.target.value }));
                      }}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Status Kepemilikan / Kemitraan
                    </label>
                    <select
                      name="mandiri_kemitraan"
                      value={formValues.mandiri_kemitraan || formValues.status_kepemilikan || 'Kemitraan'}
                      onChange={(e) => {
                        handleFieldChange(e);
                        setFormValues((prev: any) => ({ ...prev, status_kepemilikan: e.target.value }));
                      }}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-emerald-600 outline-none cursor-pointer"
                    >
                      <option value="Kemitraan">Kemitraan</option>
                      <option value="Mandiri">Mandiri</option>
                      <option value="Perusahaan">Perusahaan</option>
                      <option value="Kelompok">Kelompok Ternak</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      No. Telepon / HP
                    </label>
                    <input
                      type="text"
                      name="telp_hp"
                      placeholder="Contoh: 081234567890"
                      value={formValues.telp_hp || ''}
                      onChange={handleFieldChange}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Wilayah & Lokasi GPS */}
              <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MapPin size={14} className="text-emerald-700" />
                    Wilayah &amp; Lokasi Koordinat GPS
                  </h4>

                  {/* Tombol Ambil Lokasi GPS Otomatis */}
                  <button
                    type="button"
                    onClick={handleGetGpsLocation}
                    disabled={gpsLoading}
                    className="min-h-touch h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <Compass size={13} className={gpsLoading ? 'animate-spin' : ''} />
                    <span>{gpsLoading ? 'Mendeteksi...' : 'Ambil Titik GPS'}</span>
                  </button>
                </div>

                {gpsStatus && (
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>{gpsStatus}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Dropdown Kecamatan */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kecamatan <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="kecamatan"
                      required
                      value={(formValues.kecamatan || 'AYAH').toUpperCase()}
                      onChange={handleFieldChange}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-emerald-600 outline-none cursor-pointer uppercase"
                    >
                      {KECAMATAN_LIST.map((kec) => (
                        <option key={kec} value={kec}>
                          {kec}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Desa Berdasarkan Kecamatan */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Desa / Kelurahan <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="desa"
                      required
                      value={formValues.desa || formValues.kelurahan_desa || ''}
                      onChange={handleFieldChange}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-emerald-600 outline-none cursor-pointer"
                    >
                      {currentDesaList.map((desa) => (
                        <option key={desa} value={desa}>
                          {desa}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input Lintang (Latitude) Manual / Auto */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Lintang (*Latitude*) — Otomatis / Manual
                    </label>
                    <input
                      type="text"
                      name="lintang"
                      placeholder="Contoh: -7.671234"
                      value={formValues.lintang || ''}
                      onChange={handleFieldChange}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:border-emerald-600 outline-none"
                    />
                  </div>

                  {/* Input Bujur (Longitude) Manual / Auto */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Bujur (*Longitude*) — Otomatis / Manual
                    </label>
                    <input
                      type="text"
                      name="bujur"
                      placeholder="Contoh: 109.654321"
                      value={formValues.bujur || ''}
                      onChange={handleFieldChange}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:border-emerald-600 outline-none"
                    />
                  </div>

                  {/* Input Alamat Lengkap */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Alamat Lengkap / Dusun / RT-RW
                    </label>
                    <input
                      type="text"
                      name="alamat"
                      placeholder="Contoh: Dusun Karanganyar RT 02/03, Desa Candirenggo"
                      value={formValues.alamat || ''}
                      onChange={handleFieldChange}
                      className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Kapasitas & Teknis Peternakan */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Kapasitas &amp; Teknis Kandang
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kapasitas Kandang (Ekor/Tahun)
                    </label>
                    <input
                      type="text"
                      name="kapasitas_kandang"
                      placeholder="Contoh: 10.000"
                      value={formValues.kapasitas_kandang || ''}
                      onChange={handleFieldChange}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Jumlah Populasi Aktif (Ekor)
                    </label>
                    <input
                      type="text"
                      name="jumlah_populasi"
                      placeholder="Contoh: 8.500"
                      value={formValues.jumlah_populasi || formValues.populasi_total || ''}
                      onChange={(e) => {
                        handleFieldChange(e);
                        setFormValues((prev: any) => ({ ...prev, populasi_total: e.target.value }));
                      }}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:border-emerald-600 outline-none"
                    />
                  </div>

                  {targetCategory === 'broiler' && (
                    <>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Jumlah Produksi Siap Potong (Ekor/Tahun)
                        </label>
                        <input
                          type="text"
                          name="jumlah_produksi"
                          placeholder="Contoh: 50.000"
                          value={formValues.jumlah_produksi || ''}
                          onChange={handleFieldChange}
                          className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:border-emerald-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Bobot Rata-rata Panen (Kg/Ekor)
                        </label>
                        <input
                          type="text"
                          name="bobot_rata2_panen"
                          placeholder="Contoh: 1.8"
                          value={formValues.bobot_rata2_panen || ''}
                          onChange={handleFieldChange}
                          className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:border-emerald-600 outline-none"
                        />
                      </div>
                    </>
                  )}

                  {targetCategory === 'petelur' && (
                    <>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Produksi Telur Konsumsi (Kg/Tahun)
                        </label>
                        <input
                          type="text"
                          name="produksi_telur_kg_tahun"
                          placeholder="Contoh: 45.000"
                          value={formValues.produksi_telur_kg_tahun || ''}
                          onChange={handleFieldChange}
                          className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:border-emerald-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Konsumsi Pakan (Gram/Ekor/Hari)
                        </label>
                        <input
                          type="text"
                          name="konsumsi_pakan"
                          placeholder="Contoh: 110"
                          value={formValues.konsumsi_pakan || ''}
                          onChange={handleFieldChange}
                          className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:border-emerald-600 outline-none"
                        />
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Catatan Siklus / Keterangan Lain
                    </label>
                    <input
                      type="text"
                      name="catatan"
                      placeholder="Contoh: Siklus 6-7 kali/tahun, Closed House"
                      value={formValues.catatan || ''}
                      onChange={handleFieldChange}
                      className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-touch h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  Simpan Data Farm
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}