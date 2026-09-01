'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Download,
  Camera,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  X,
  Map as MapIcon,
  FileText,
  AlertTriangle,
  ChevronRight,
  Filter,
  Calendar,
  Layers,
} from 'lucide-react';

// --- DATA & TIPE ---
const DATA_WILAYAH = {
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
  PEJAGOAN: ['LOGEDE', 'KUWAYUHAN', 'KEDAWUNG', 'PEJAGOan', 'KEBULUSAN', 'ADITIRTO', 'KARANGPOH', 'JEMUR', 'PRIGI', 'KEBAGORAN', 'PENGARINGAN', 'PENIRON', 'WATULAWANG'],
  SRUWENG: ['MENGANTI', 'TRIKARSO', 'SIDOHARJO', 'GIWANGRETNO', 'JABRES', 'SRUWENG', 'KARANGGEDANG', 'PURWODESO', 'KLEPUSANGGAR', 'TANGGERAN', 'KARANGSARI', 'KARANGPULE', 'PAKURAN', 'PENGEMPON', 'KEJAWANG', 'KARANGJAMBU', 'SIDOAGUNG', 'PENUSUPAN', 'DONOSARI', 'PANDANSARI', 'CONDONGCAMPUR'],
  KARANGSAMBUNG: ['WIDORO', 'SELING', 'KEDUNGWARU', 'PENCIL', 'KALIGENDING', 'PLUMBON', 'PUJOTIRTO', 'WADASMALANG', 'TLEPOK', 'KALISANA', 'LANGSE', 'BANIORO', 'KARANGSAMBUNG', 'TOTOGAN'],
  SADANG: ['PUCANGAN', 'SEBORO', 'WONOSARI', 'SADANGKULON', 'CANGKRING', 'SADANGWETAN', 'KEDUNGGONG'],
};

const DAFTAR_TAHUN = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'];
const DAFTAR_JENIS_TERNAK = ['Sapi', 'Kambing', 'Domba', 'Ayam KUB', 'Ayam Petelur'];

const buatNamaFileFoto = (namaKtt: string, id: string | number) => {
  const namaAman = (namaKtt || 'monev').trim().replace(/[^a-zA-Z0-9]+/g, '_');
  return `foto-${namaAman}-${id}.jpg`;
};

type StatusBA = 'Ada' | 'Tidak';

const KONDISI_KOSONG = {
  awalJantan: 0,
  awalBetina: 0,
  matiBangkaiJantan: 0,
  matiBangkaiBetina: 0,
  matiBangkaiBA: 'Tidak' as StatusBA,
  matiBangkaiBAPdf: null as string | null,
  matiBangkaiBAName: null as string | null,
  matiPotongJantan: 0,
  matiPotongBetina: 0,
  matiPotongBA: 'Tidak' as StatusBA,
  matiPotongBAPdf: null as string | null,
  matiPotongBAName: null as string | null,
  jualJantan: 0,
  jualBetina: 0,
  jualBA: 'Tidak' as StatusBA,
  jualBAPdf: null as string | null,
  jualBAName: null as string | null,
  beliJantan: 0,
  beliBetina: 0,
  lahirJantan: 0,
  lahirBetina: 0,
  matiAnakJantan: 0,
  matiAnakBetina: 0,
  jualAnakJantan: 0,
  jualAnakBetina: 0,
};
type KondisiTernak = typeof KONDISI_KOSONG;

function hitungKondisi(k: KondisiTernak) {
  const a = (k.awalJantan || 0) + (k.awalBetina || 0);
  const bJantan = (k.matiBangkaiJantan || 0) + (k.matiPotongJantan || 0);
  const bBetina = (k.matiBangkaiBetina || 0) + (k.matiPotongBetina || 0);
  const b = bJantan + bBetina;
  const c = (k.jualJantan || 0) + (k.jualBetina || 0);
  const d = (k.beliJantan || 0) + (k.beliBetina || 0);
  const e = a - b - c + d;
  const f = (k.lahirJantan || 0) + (k.lahirBetina || 0);
  const g = (k.matiAnakJantan || 0) + (k.matiAnakBetina || 0);
  const h = (k.jualAnakJantan || 0) + (k.jualAnakBetina || 0);
  const i = e + f - g - h;
  return { a, b, c, d, e, f, g, h, i };
}

function migrasiKondisi(raw: any): KondisiTernak {
  if (raw && typeof raw === 'object' && 'awalJantan' in raw) {
    return { ...KONDISI_KOSONG, ...raw };
  }
  return { ...KONDISI_KOSONG, awalJantan: Number(raw?.jantan) || 0, awalBetina: Number(raw?.betina) || 0 };
}

type FieldData = {
  id: string;
  tahun: string;
  kec: string;
  desa: string;
  namaKtt: string;
  alamat: string;
  kegiatan: string;
  jenis: string;
  waktuMonev: string;
  kondisi: KondisiTernak;
  lat: number | null;
  lng: number | null;
  photo: string | null;
  catatan: string;
};

const FORM_KOSONG = {
  tahun: '2026',
  kec: '',
  desa: '',
  ktt: '',
  alamat: '',
  kegiatan: '',
  jenis: 'Sapi',
  waktuMonev: '',
  photo: null as string | null,
  lat: null as number | null,
  lng: null as number | null,
  catatan: '',
};

function BarisTernak({
  label,
  jantan,
  betina,
  onJantan,
  onBetina,
  showBA = false,
  ba,
  onBA,
  baPdf,
  baPdfName,
  onUploadBAPdf,
  onRemoveBAPdf,
}: any) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
            {label} — Jantan
          </label>
          <input
            type="number"
            min={0}
            value={jantan}
            onChange={(e) => onJantan(Number(e.target.value))}
            className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white font-sans font-bold text-center text-sm focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
            {label} — Betina
          </label>
          <input
            type="number"
            min={0}
            value={betina}
            onChange={(e) => onBetina(Number(e.target.value))}
            className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white font-sans font-bold text-center text-sm focus:border-emerald-500 outline-none"
          />
        </div>
        {showBA && (
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
              Status Berita Acara
            </label>
            <select
              value={ba}
              onChange={(e) => onBA(e.target.value as StatusBA)}
              className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white font-sans font-bold text-sm focus:border-emerald-500 outline-none"
            >
              <option value="Tidak">Tidak Ada BA</option>
              <option value="Ada">Ada BA Resmi</option>
            </select>
          </div>
        )}
      </div>

      {/* Upload Berkas BA Terpisah Menempel di Masing-masing Form */}
      {showBA && ba === 'Ada' && (
        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-2 animate-in fade-in duration-200">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
            <FileText size={14} className="text-red-600 shrink-0" />
            <span>Upload Berkas Berita Acara (PDF) — {label}</span>
          </label>

          {baPdf ? (
            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-300 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="text-red-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800 truncate">{baPdfName || 'Dokumen_BA.pdf'}</span>
              </div>
              <button
                type="button"
                onClick={onRemoveBAPdf}
                className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-0.5 hover:bg-red-50 rounded transition-colors"
              >
                Hapus / Ganti
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept=".pdf"
              onChange={onUploadBAPdf}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
          )}
        </div>
      )}
    </div>
  );
}

function KondisiSection({ nomor, title, total, totalLabel, children }: any) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h5 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-bold text-xs flex items-center justify-center">
            {nomor}
          </span>
          <span>{title}</span>
        </h5>
        <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
          {totalLabel}: {total} Ekor
        </span>
      </div>
      {children}
    </div>
  );
}

export default function MonevKTT() {
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  
  // TABS: 'form' (Input Pendataan) & 'dashboard' (Peta & Laporan)
  const [activeTab, setActiveTab] = useState<'form' | 'dashboard'>('form');

  // Filter Tahun Bantuan (Untuk mengorganisir input & database)
  const [daftarTahun, setDaftarTahun] = useState<string[]>(DAFTAR_TAHUN);
  const [tahunBantuanFilter, setTahunBantuanFilter] = useState('2026');
  const [showAddTahunModal, setShowAddTahunModal] = useState(false);
  const [inputTahunBaru, setInputTahunBaru] = useState('');

  // Filter Dropdown Peta & Laporan Lapangan
  const [filterPetaKecamatan, setFilterPetaKecamatan] = useState('Semua');

  const [dbLapangan, setDbLapangan] = useState<FieldData[]>([]);

  // Form State
  const [formTahun, setFormTahun] = useState(FORM_KOSONG.tahun);
  const [formKec, setFormKec] = useState(FORM_KOSONG.kec);
  const [formDesa, setFormDesa] = useState(FORM_KOSONG.desa);
  const [formKtt, setFormKtt] = useState(FORM_KOSONG.ktt);
  const [formAlamat, setFormAlamat] = useState(FORM_KOSONG.alamat);
  const [formKegiatan, setFormKegiatan] = useState(FORM_KOSONG.kegiatan);
  const [formJenis, setFormJenis] = useState(FORM_KOSONG.jenis);
  const [formWaktuMonev, setFormWaktuMonev] = useState(FORM_KOSONG.waktuMonev);
  const [formPhoto, setFormPhoto] = useState<string | null>(FORM_KOSONG.photo);
  const [formLat, setFormLat] = useState<number | null>(FORM_KOSONG.lat);
  const [formLng, setFormLng] = useState<number | null>(FORM_KOSONG.lng);
  const [formCatatan, setFormCatatan] = useState(FORM_KOSONG.catatan);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [formKondisi, setFormKondisi] = useState<KondisiTernak>({ ...KONDISI_KOSONG });
  const updateKondisi = (field: keyof KondisiTernak, value: any) => {
    setFormKondisi((prev) => ({ ...prev, [field]: value }));
  };
  const kalkulasi = hitungKondisi(formKondisi);

  // Helper File Upload PDF BA
  const handlePdfUploadGeneric = (e: React.ChangeEvent<HTMLInputElement>, fieldPdf: keyof KondisiTernak, fieldName: keyof KondisiTernak) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Hanya file dokumen PDF (.pdf) yang diperbolehkan!');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file PDF maksimal 10 MB!');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormKondisi((prev) => ({
        ...prev,
        [fieldPdf]: reader.result as string,
        [fieldName]: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removePdfGeneric = (fieldPdf: keyof KondisiTernak, fieldName: keyof KondisiTernak) => {
    setFormKondisi((prev) => ({
      ...prev,
      [fieldPdf]: null,
      [fieldName]: null,
    }));
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  // Kamera State
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const fetchDatabase = async () => {
    try {
      const resLap = await fetch('/api/monev-lapangan');
      const dataLap = await resLap.json();
      if (Array.isArray(dataLap)) {
        const formatLap = dataLap.map((d: any) => ({
          id: d.id,
          tahun: d.tahun || '2026',
          kec: d.kec,
          desa: d.desa,
          namaKtt: d.namaKtt,
          alamat: d.alamat || '',
          kegiatan: d.kegiatan,
          jenis: d.jenis,
          waktuMonev: d.waktuMonev || '',
          kondisi: migrasiKondisi(typeof d.kondisi === 'string' ? JSON.parse(d.kondisi) : d.kondisi),
          lat: d.lat,
          lng: d.lng,
          photo: d.photo,
          catatan: d.catatan || '',
        }));
        setDbLapangan(formatLap);
      }
    } catch (err) {
      console.error('Gagal mengambil database monev', err);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchDatabase();

    // Muat daftar tahun kustom dari localStorage jika ada
    try {
      const savedYears = localStorage.getItem('monev_ktt_daftar_tahun');
      if (savedYears) {
        const parsed = JSON.parse(savedYears);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = Array.from(new Set([...parsed, ...DAFTAR_TAHUN])).sort((a, b) => Number(b) - Number(a));
          setDaftarTahun(merged);
        }
      }
    } catch (e) {
      console.error(e);
    }

    if (typeof window !== 'undefined' && !(window as any).L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, []);

  const handleTambahTahunBaru = (e: React.FormEvent) => {
    e.preventDefault();
    const th = inputTahunBaru.trim();
    if (!th || isNaN(Number(th)) || Number(th) < 1900 || Number(th) > 2100) {
      alert('Mohon masukkan 4 digit tahun yang valid (contoh: 2027)!');
      return;
    }
    if (daftarTahun.includes(th)) {
      alert(`Tahun Bantuan ${th} sudah ada dalam daftar.`);
      setTahunBantuanFilter(th);
      setFormTahun(th);
      setShowAddTahunModal(false);
      setInputTahunBaru('');
      return;
    }
    const updated = [th, ...daftarTahun.filter((x) => x !== th)].sort((a, b) => Number(b) - Number(a));
    setDaftarTahun(updated);
    try {
      localStorage.setItem('monev_ktt_daftar_tahun', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setTahunBantuanFilter(th);
    setFormTahun(th);
    setShowAddTahunModal(false);
    setInputTahunBaru('');
    alert(`Tahun Bantuan ${th} berhasil ditambahkan ke daftar!`);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Filter Data untuk Peta Sesuai Dropdown Kecamatan
  const dbLapanganUntukPeta = useMemo(() => {
    if (filterPetaKecamatan === 'Semua') return dbLapangan;
    return dbLapangan.filter((d) => d.kec === filterPetaKecamatan);
  }, [dbLapangan, filterPetaKecamatan]);

  // Inisialisasi Peta Leaflet
  useEffect(() => {
    if (!leafletLoaded || !isClient || activeTab !== 'dashboard') return;
    const L = (window as any).L;
    const mapContainer = document.getElementById('map-dashboard');
    if (mapContainer && !mapInstanceRef.current) {
      const map = L.map('map-dashboard').setView([-7.668, 109.651], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }
  }, [leafletLoaded, isClient, activeTab]);

  // Update Titik Marker Sesuai Filter Dropdown Kecamatan
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const L = (window as any).L;
    markersLayerRef.current.clearLayers();
    const bounds: [number, number][] = [];

    dbLapanganUntukPeta.forEach((data) => {
      if (data.lat && data.lng) {
        const totalAset = hitungKondisi(data.kondisi).i;
        const icon = L.divIcon({
          html: `<div style="background:#059669;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });
        const marker = L.marker([data.lat, data.lng], { icon });
        marker.bindPopup(`
          <div style="font-family:sans-serif; text-align:center; padding:4px;">
            <b style="color:#059669; font-size:14px;">${data.namaKtt}</b><br/>
            <span style="font-size:12px; color:#666;">${data.desa}, ${data.kec} (Tahun ${data.tahun})</span><br/>
            <b style="font-size:13px; color:#111;">Aset: ${totalAset} Ekor (${data.jenis})</b>
            ${data.photo ? `<br/><img src="${data.photo}" style="width:110px; height:75px; object-fit:cover; margin-top:6px; border-radius:6px;" />` : ''}
          </div>
        `);
        marker.addTo(markersLayerRef.current);
        bounds.push([data.lat, data.lng]);
      }
    });

    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      mapInstanceRef.current.setView([-7.668, 109.651], 10);
    }
  }, [dbLapanganUntukPeta, leafletLoaded, activeTab]);

  const handleDownloadDashboard = () => {
    if (dbLapangan.length === 0) return alert('Belum ada data lapangan untuk diekspor!');
    const rows = dbLapangan.map((d, i) => {
      const h = hitungKondisi(d.kondisi);
      return {
        No: i + 1,
        'Tahun Bantuan': d.tahun,
        Kecamatan: d.kec,
        Desa: d.desa,
        'Nama KTT': d.namaKtt,
        Komoditas: d.jenis,
        'Waktu Monev': d.waktuMonev || '-',
        'Awal (a)': h.a,
        'Mati (b)': h.b,
        'BA Mati': d.kondisi.matiBangkaiBA === 'Ada' ? 'Ada BA' : '-',
        'Jual (c)': h.c,
        'BA Jual': d.kondisi.jualBA === 'Ada' ? 'Ada BA' : '-',
        'Beli (d)': h.d,
        'Sisa Pokok (e)': h.e,
        'Lahir (f)': h.f,
        'Mati Anak (g)': h.g,
        'Jual Anak (h)': h.h,
        'Total Aset (i)': h.i,
        Latitude: d.lat || '-',
        Longitude: d.lng || '-',
        Catatan: d.catatan || '-',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monev_KTT');
    XLSX.writeFile(wb, `Laporan_Monev_KTT_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung fitur Geolocation.');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormLat(Number(pos.coords.latitude.toFixed(6)));
        setFormLng(Number(pos.coords.longitude.toFixed(6)));
        setIsGettingLocation(false);
      },
      () => {
        alert('Gagal mengambil titik GPS. Pastikan izin lokasi diizinkan di browser Anda.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openCamera = async () => {
    setShowCameraModal(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      setCameraError('Kamera tidak dapat diakses. Gunakan unggah dari file.');
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setFormPhoto(canvas.toDataURL('image/jpeg', 0.9));
    }
    closeCamera();
    if (formLat === null || formLng === null) handleGetLocation();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setFormPhoto(evt.target?.result as string);
    reader.readAsDataURL(file);
    if (formLat === null || formLng === null) handleGetLocation();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormTahun(tahunBantuanFilter === 'Semua Tahun' ? '2026' : tahunBantuanFilter);
    setFormKec(FORM_KOSONG.kec);
    setFormDesa(FORM_KOSONG.desa);
    setFormKtt(FORM_KOSONG.ktt);
    setFormAlamat(FORM_KOSONG.alamat);
    setFormKegiatan(FORM_KOSONG.kegiatan);
    setFormJenis(FORM_KOSONG.jenis);
    setFormWaktuMonev(FORM_KOSONG.waktuMonev);
    setFormPhoto(FORM_KOSONG.photo);
    setFormLat(FORM_KOSONG.lat);
    setFormLng(FORM_KOSONG.lng);
    setFormCatatan(FORM_KOSONG.catatan);
    setFormKondisi({ ...KONDISI_KOSONG });
  };

  const handleSubmitLapangan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKec || !formDesa || !formKtt) return alert('Mohon lengkapi data kelompok!');

    const isEdit = !!editingId;
    const finalId = isEdit ? editingId : Date.now().toString();

    const payload = {
      id: finalId,
      tahun: formTahun,
      kec: formKec,
      desa: formDesa,
      namaKtt: formKtt,
      alamat: formAlamat,
      kegiatan: formKegiatan,
      jenis: formJenis,
      waktuMonev: formWaktuMonev,
      kondisi: formKondisi,
      lat: formLat,
      lng: formLng,
      photo: formPhoto,
      catatan: formCatatan,
      isEdit,
    };

    try {
      await fetch('/api/monev-lapangan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await fetchDatabase();
      alert(isEdit ? 'Data lapangan & Berita Acara berhasil diperbarui!' : 'Data lapangan & Berita Acara berhasil disimpan ke database!');
      resetForm();
    } catch {
      alert('Gagal menyimpan data ke database.');
    }
  };

  const handleEditClick = (data: FieldData) => {
    setEditingId(data.id);
    setFormTahun(data.tahun || '2026');
    setFormKec(data.kec);
    setFormDesa(data.desa);
    setFormKtt(data.namaKtt);
    setFormAlamat(data.alamat || '');
    setFormKegiatan(data.kegiatan);
    setFormJenis(data.jenis);
    setFormWaktuMonev(data.waktuMonev || '');
    setFormKondisi(migrasiKondisi(data.kondisi));
    setFormLat(data.lat);
    setFormLng(data.lng);
    setFormPhoto(data.photo);
    setFormCatatan(data.catatan || '');
    setActiveTab('form');
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data lapangan ini?')) return;
    try {
      await fetch(`/api/monev-lapangan?id=${id}`, { method: 'DELETE' });
      await fetchDatabase();
      if (editingId === id) resetForm();
    } catch {
      alert('Gagal menghapus data.');
    }
  };

  // Switch year in filter
  const handleSelectTahunBantuan = (th: string) => {
    setTahunBantuanFilter(th);
    if (th !== 'Semua Tahun' && !editingId) {
      setFormTahun(th);
    }
  };

  // Filtered DB Lapangan by selected Tahun Bantuan
  const dbLapanganFiltered = useMemo(() => {
    if (tahunBantuanFilter === 'Semua Tahun') return dbLapangan;
    return dbLapangan.filter((d) => d.tahun === tahunBantuanFilter);
  }, [dbLapangan, tahunBantuanFilter]);

  if (!isClient) return null;
  const kecamatanTerpakai = Array.from(new Set(dbLapangan.map((d) => d.kec))).sort();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER (Tema Hijau Bitpro - Solid Icons) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/bitpro"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Bitpro"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/bitpro" className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors truncate">
                  Bitpro
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Monev KTT</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Monitoring &amp; Evaluasi Kelompok Tani Ternak
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadDashboard}
              title="Export Excel"
              aria-label="Export Excel"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* KPI Stat Cards (Solid Icon Styling) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Kelompok Terpantau
              </p>
              <p className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900">
                {dbLapangan.length} <span className="text-xs font-semibold text-slate-400">KTT</span>
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Total Aset Ternak
              </p>
              <p className="font-sans text-2xl sm:text-3xl font-extrabold text-emerald-700">
                {dbLapangan.reduce((acc, curr) => acc + hitungKondisi(curr.kondisi).i, 0)} <span className="text-xs font-semibold text-slate-400">Ekor</span>
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MapPin size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Sebaran Kecamatan
              </p>
              <p className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900">
                {kecamatanTerpakai.length} <span className="text-xs font-semibold text-slate-400">Wilayah</span>
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Terverifikasi GPS
              </p>
              <p className="font-sans text-2xl sm:text-3xl font-extrabold text-emerald-700">
                {dbLapangan.filter((d) => d.lat !== null).length} <span className="text-xs font-semibold text-slate-400">Titik</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── 2 VIEW TABS: INPUT PENDATAAN (TAB 1) & PETA LAPORAN (TAB 2) ── */}
        <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { key: 'form', label: editingId ? 'Edit Data Lapangan ✏️' : 'Input Pendataan Lapangan', icon: Plus },
            { key: 'dashboard', label: 'Peta & Laporan Lapangan', icon: MapIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`min-h-touch h-11 px-4 sm:px-6 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-white border-slate-200 text-emerald-700 border-b-white translate-y-px shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-100/60'
                }`}
              >
                <Icon size={16} strokeWidth={2.5} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: INPUT PENDATAAN LAPANGAN (MENGIKUTI TAHUN BANTUAN) ── */}
        {activeTab === 'form' && (
          <div ref={formSectionRef} className="space-y-8 animate-in fade-in duration-200">
            
            {/* ── PILIHAN TAHUN BANTUAN (FILTER DATABASE) ── */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Filter size={16} strokeWidth={2.5} className="text-emerald-600" />
                    <span>Pilih Tahun Bantuan Database</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Formulir input dan daftar kelompok akan menyesuaikan tahun bantuan yang dipilih
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                  Tahun Aktif: {tahunBantuanFilter}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {['Semua Tahun', ...daftarTahun].map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => handleSelectTahunBantuan(th)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tahunBantuanFilter === th
                        ? 'bg-emerald-600 text-white shadow-xs scale-105'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {th === 'Semua Tahun' ? 'Semua Tahun' : `Bantuan ${th}`}
                  </button>
                ))}

                {/* Tombol Tambah Tahun Bantuan Baru */}
                <button
                  type="button"
                  onClick={() => setShowAddTahunModal(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  title="Tambah Tahun Bantuan Baru"
                >
                  <Plus size={13} strokeWidth={2.5} /> Tambah Tahun
                </button>
              </div>
            </div>

            {/* ── FORMULIR PENDATAAN ── */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {editingId ? 'Edit Data Pemantauan Lapangan' : `Input Data Monev Lapangan (Tahun Bantuan ${formTahun})`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pencatatan perkembangan populasi ternak bantuan kelompok
                  </p>
                </div>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="min-h-touch h-9 px-3.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitLapangan} className="space-y-6">
                
                {/* 1. Wilayah */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>1. Informasi Wilayah &amp; Kelompok</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Tahun Bantuan <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formTahun}
                        onChange={(e) => setFormTahun(e.target.value)}
                        className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none"
                      >
                        {daftarTahun.map((th) => (
                          <option key={th} value={th}>Tahun Bantuan {th}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Kecamatan <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formKec}
                        onChange={(e) => {
                          setFormKec(e.target.value);
                          setFormDesa('');
                        }}
                        className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none"
                      >
                        <option value="">Pilih Kecamatan</option>
                        {Object.keys(DATA_WILAYAH).map((kec) => (
                          <option key={kec} value={kec}>{kec}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Desa <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formDesa}
                        onChange={(e) => setFormDesa(e.target.value)}
                        disabled={!formKec}
                        className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none disabled:opacity-50"
                      >
                        <option value="">Pilih Desa</option>
                        {formKec &&
                          (DATA_WILAYAH as any)[formKec]?.map((desa: string) => (
                            <option key={desa} value={desa}>{desa}</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Nama KTT <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: KTT Lembu Sejahtera"
                        value={formKtt}
                        onChange={(e) => setFormKtt(e.target.value)}
                        className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Jenis Komoditas Ternak
                      </label>
                      <select
                        value={formJenis}
                        onChange={(e) => setFormJenis(e.target.value)}
                        className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none"
                      >
                        {DAFTAR_JENIS_TERNAK.map((j) => (
                          <option key={j} value={j}>{j}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Waktu Pelaksanaan Monev
                      </label>
                      <input
                        type="date"
                        value={formWaktuMonev}
                        onChange={(e) => setFormWaktuMonev(e.target.value)}
                        className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Rincian Mutasi & Kondisi Ternak (Dengan Berkas Berita Acara Terpisah Menempel di Setiap Form) */}
                <div className="space-y-4">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Rincian Mutasi &amp; Kondisi Ternak (Beserta Berita Acara Terkait)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KondisiSection nomor="a" title="Ternak Awal Bantuan" total={kalkulasi.a} totalLabel="Total Awal">
                      <BarisTernak
                        label="Awal"
                        jantan={formKondisi.awalJantan}
                        betina={formKondisi.awalBetina}
                        onJantan={(v: any) => updateKondisi('awalJantan', v)}
                        onBetina={(v: any) => updateKondisi('awalBetina', v)}
                      />
                    </KondisiSection>

                    <KondisiSection nomor="b" title="Kematian Ternak Pokok" total={kalkulasi.b} totalLabel="Total Mati">
                      <BarisTernak
                        label="Mati"
                        showBA
                        jantan={formKondisi.matiBangkaiJantan}
                        betina={formKondisi.matiBangkaiBetina}
                        ba={formKondisi.matiBangkaiBA}
                        baPdf={formKondisi.matiBangkaiBAPdf}
                        baPdfName={formKondisi.matiBangkaiBAName}
                        onJantan={(v: any) => updateKondisi('matiBangkaiJantan', v)}
                        onBetina={(v: any) => updateKondisi('matiBangkaiBetina', v)}
                        onBA={(v: any) => updateKondisi('matiBangkaiBA', v)}
                        onUploadBAPdf={(e: any) => handlePdfUploadGeneric(e, 'matiBangkaiBAPdf', 'matiBangkaiBAName')}
                        onRemoveBAPdf={() => removePdfGeneric('matiBangkaiBAPdf', 'matiBangkaiBAName')}
                      />
                    </KondisiSection>

                    <KondisiSection nomor="c" title="Penjualan Ternak Pokok" total={kalkulasi.c} totalLabel="Total Dijual">
                      <BarisTernak
                        label="Jual"
                        showBA
                        jantan={formKondisi.jualJantan}
                        betina={formKondisi.jualBetina}
                        ba={formKondisi.jualBA}
                        baPdf={formKondisi.jualBAPdf}
                        baPdfName={formKondisi.jualBAName}
                        onJantan={(v: any) => updateKondisi('jualJantan', v)}
                        onBetina={(v: any) => updateKondisi('jualBetina', v)}
                        onBA={(v: any) => updateKondisi('jualBA', v)}
                        onUploadBAPdf={(e: any) => handlePdfUploadGeneric(e, 'jualBAPdf', 'jualBAName')}
                        onRemoveBAPdf={() => removePdfGeneric('jualBAPdf', 'jualBAName')}
                      />
                    </KondisiSection>

                    <KondisiSection nomor="d" title="Pembelian / Penambahan" total={kalkulasi.d} totalLabel="Total Dibeli">
                      <BarisTernak
                        label="Beli"
                        jantan={formKondisi.beliJantan}
                        betina={formKondisi.beliBetina}
                        onJantan={(v: any) => updateKondisi('beliJantan', v)}
                        onBetina={(v: any) => updateKondisi('beliBetina', v)}
                      />
                    </KondisiSection>

                    <KondisiSection nomor="f" title="Kelahiran Anak" total={kalkulasi.f} totalLabel="Total Lahir">
                      <BarisTernak
                        label="Lahir"
                        jantan={formKondisi.lahirJantan}
                        betina={formKondisi.lahirBetina}
                        onJantan={(v: any) => updateKondisi('lahirJantan', v)}
                        onBetina={(v: any) => updateKondisi('lahirBetina', v)}
                      />
                    </KondisiSection>

                    <KondisiSection nomor="g" title="Kematian Anak Ternak" total={kalkulasi.g} totalLabel="Mati Anak">
                      <BarisTernak
                        label="Mati Anak"
                        jantan={formKondisi.matiAnakJantan}
                        betina={formKondisi.matiAnakBetina}
                        onJantan={(v: any) => updateKondisi('matiAnakJantan', v)}
                        onBetina={(v: any) => updateKondisi('matiAnakBetina', v)}
                      />
                    </KondisiSection>
                  </div>

                  {/* Total Summary Callout */}
                  <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-800 block">
                        Hasil Kalkulasi Sistem
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 font-medium">
                        Sisa Ternak Pokok (e): <span className="font-sans font-bold">{kalkulasi.e} Ekor</span> · Kelahiran (f): <span className="font-sans font-bold">{kalkulasi.f} Ekor</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 font-sans block">Total Aset Akhir (i = e + f - g - h)</span>
                      <span className="font-sans font-extrabold text-2xl text-emerald-700">{kalkulasi.i} Ekor</span>
                    </div>
                  </div>
                </div>

                {/* 3. GPS & Foto Dokumentasi */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin size={16} strokeWidth={2.5} className="text-emerald-600" />
                    <span>3. Lokasi Koordinat GPS &amp; Foto Dokumentasi</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600">
                          Titik Koordinat (Tersimpan ke Peta)
                        </label>
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={isGettingLocation}
                          className="text-xs text-emerald-700 font-bold hover:underline"
                        >
                          {isGettingLocation ? 'Mencari GPS...' : '📍 Ambil GPS Otomatis'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="any"
                          placeholder="Latitude (cth: -7.668)"
                          value={formLat ?? ''}
                          onChange={(e) => setFormLat(e.target.value ? Number(e.target.value) : null)}
                          className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                        />
                        <input
                          type="number"
                          step="any"
                          placeholder="Longitude (cth: 109.651)"
                          value={formLng ?? ''}
                          onChange={(e) => setFormLng(e.target.value ? Number(e.target.value) : null)}
                          className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Foto Lapangan
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={openCamera}
                          className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50"
                        >
                          <Camera size={14} strokeWidth={2.5} /> Kamera
                        </button>
                        <label className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer">
                          <ImageIcon size={14} strokeWidth={2.5} /> Galeri
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                        {formPhoto && (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={14} strokeWidth={2.5} /> Foto Siap
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Catatan Tambahan / Rekomendasi Petugas
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Catatan kondisi kandang, pakan, kesehatan, atau tindak lanjut..."
                      value={formCatatan}
                      onChange={(e) => setFormCatatan(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    className="min-h-touch h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex-1 cursor-pointer"
                  >
                    {editingId ? 'Perbarui Data Lapangan' : 'Simpan Data Lapangan'}
                  </button>
                </div>

              </form>
            </div>

            {/* ── TABEL RIWAYAT DATA MENGIKUTI TAHUN BANTUAN YANG DIPILIH ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <span>Daftar Data Lapangan (Tahun Bantuan: {tahunBantuanFilter})</span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {dbLapanganFiltered.length} Kelompok
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data terekam di sistem monev lapangan Dinas Pertanian dan Pangan
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3.5 text-center w-12">No</th>
                      <th className="px-4 py-3.5">Tahun Bantuan</th>
                      <th className="px-4 py-3.5">Nama KTT</th>
                      <th className="px-4 py-3.5">Wilayah</th>
                      <th className="px-4 py-3.5">Komoditas</th>
                      <th className="px-4 py-3.5 text-right">Awal</th>
                      <th className="px-4 py-3.5 text-right">Sisa Pokok</th>
                      <th className="px-4 py-3.5 text-right">Total Aset</th>
                      <th className="px-4 py-3.5 text-center">GPS &amp; Berkas BA</th>
                      <th className="px-4 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbLapanganFiltered.map((d, idx) => {
                      const h = hitungKondisi(d.kondisi);
                      const baMati = d.kondisi.matiBangkaiBAPdf;
                      const baJual = d.kondisi.jualBAPdf;
                      const baLegacy = (d.kondisi as any)?.pdfBA;

                      return (
                        <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3.5 text-center font-bold text-emerald-700 text-xs">{idx + 1}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-800">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                              {d.tahun}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-900">{d.namaKtt}</td>
                          <td className="px-4 py-3.5 text-slate-600 text-xs">
                            {d.desa}, {d.kec}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                              {d.jenis}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-slate-700">{h.a}</td>
                          <td className="px-4 py-3.5 text-right font-bold text-slate-700">{h.e}</td>
                          <td className="px-4 py-3.5 text-right font-extrabold text-emerald-700">{h.i} Ekor</td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                              {d.lat ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-0.5" title={`Lat: ${d.lat}, Lng: ${d.lng}`}>
                                  <CheckCircle2 size={13} strokeWidth={2.5} /> GPS
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">-</span>
                              )}

                              {d.photo && (
                                <a
                                  href={d.photo}
                                  download={buatNamaFileFoto(d.namaKtt, d.id)}
                                  className="text-emerald-700 hover:underline font-bold ml-0.5"
                                >
                                  Foto
                                </a>
                              )}

                              {baMati && (
                                <a
                                  href={baMati}
                                  download={d.kondisi.matiBangkaiBAName || 'BA_Kematian.pdf'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"
                                  title="Berita Acara Kematian"
                                >
                                  <FileText size={11} strokeWidth={2.5} className="text-red-600" />
                                  <span>BA Mati</span>
                                </a>
                              )}

                              {baJual && (
                                <a
                                  href={baJual}
                                  download={d.kondisi.jualBAName || 'BA_Penjualan.pdf'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"
                                  title="Berita Acara Penjualan"
                                >
                                  <FileText size={11} strokeWidth={2.5} className="text-amber-700" />
                                  <span>BA Jual</span>
                                </a>
                              )}

                              {!baMati && !baJual && baLegacy && (
                                <a
                                  href={baLegacy}
                                  download={(d.kondisi as any).pdfBAName || 'Berita_Acara.pdf'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"
                                >
                                  <FileText size={11} strokeWidth={2.5} className="text-red-600" />
                                  <span>BA</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEditClick(d)}
                                className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={13} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(d.id)}
                                className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 size={13} strokeWidth={2.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {dbLapanganFiltered.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-5 py-10 text-center text-slate-400 font-medium">
                          Belum ada data monev lapangan tersimpan untuk Tahun Bantuan {tahunBantuanFilter}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 2: PETA & LAPORAN LAPANGAN ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Interactive Leaflet Map dengan Filter Dropdown Kecamatan */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <MapPin size={18} strokeWidth={2.5} className="text-emerald-600" />
                    <span>Peta Sebaran Titik Bantuan Ternak KTT</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Menampilkan {dbLapanganUntukPeta.filter((d) => d.lat !== null).length} titik GPS terverifikasi
                  </p>
                </div>

                {/* Dropdown Filter Kecamatan Peta */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Filter Titik:</span>
                  <select
                    value={filterPetaKecamatan}
                    onChange={(e) => setFilterPetaKecamatan(e.target.value)}
                    className="min-h-touch h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white focus:bg-white text-xs font-bold text-slate-800 focus:border-emerald-600 outline-none transition-colors"
                  >
                    <option value="Semua">🗺️ Semua Titik (Seluruh Kecamatan)</option>
                    {kecamatanTerpakai.map((kec) => {
                      const count = dbLapangan.filter((d) => d.kec === kec && d.lat !== null).length;
                      return (
                        <option key={kec} value={kec}>
                          📍 Kecamatan {kec} ({count} Titik)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="w-full h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                <div id="map-dashboard" className="w-full h-full absolute inset-0 z-0" />
              </div>
            </div>

            {/* List Grouped by Kecamatan (Menyesuaikan Filter Dropdown Peta) */}
            <div className="space-y-6">
              {kecamatanTerpakai
                .filter((kec) => (filterPetaKecamatan === 'Semua' ? true : kec === filterPetaKecamatan))
                .map((kec) => {
                  const dataKec = dbLapangan.filter((d) => d.kec === kec);
                  const totalTernakKec = dataKec.reduce((acc, curr) => acc + hitungKondisi(curr.kondisi).i, 0);

                  return (
                    <div key={kec} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <MapPin size={16} strokeWidth={2.5} className="text-emerald-600" />
                          <span>Kecamatan {kec}</span>
                        </h4>
                        <span className="text-xs font-sans font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {dataKec.length} Kelompok · {totalTernakKec} Ekor Aset
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="p-3.5">WAKTU</th>
                              <th className="p-3.5">TAHUN</th>
                              <th className="p-3.5">NAMA KTT</th>
                              <th className="p-3.5">DESA</th>
                              <th className="p-3.5">KOMODITAS</th>
                              <th className="p-3.5 text-right">AWAL</th>
                              <th className="p-3.5 text-right">SISA</th>
                              <th className="p-3.5 text-right">TOTAL ASET</th>
                              <th className="p-3.5 text-center">GPS &amp; BERKAS BA</th>
                              <th className="p-3.5 text-center w-24">AKSI</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-800">
                            {dataKec.map((d) => {
                              const h = hitungKondisi(d.kondisi);
                              const baMati = d.kondisi.matiBangkaiBAPdf;
                              const baJual = d.kondisi.jualBAPdf;
                              const baLegacy = (d.kondisi as any)?.pdfBA;

                              return (
                                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3.5 font-sans text-xs text-slate-500">
                                    {d.waktuMonev || new Date(Number(d.id)).toLocaleDateString('id-ID')}
                                  </td>
                                  <td className="p-3.5 font-bold text-xs text-slate-700">
                                    {d.tahun}
                                  </td>
                                  <td className="p-3.5 font-bold text-slate-900">
                                    {d.namaKtt}
                                  </td>
                                  <td className="p-3.5 text-slate-600 text-xs">{d.desa}</td>
                                  <td className="p-3.5 text-xs">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                                      {d.jenis}
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-right font-sans text-xs font-bold text-slate-700">{h.a}</td>
                                  <td className="p-3.5 text-right font-sans text-xs font-bold text-slate-700">{h.e}</td>
                                  <td className="p-3.5 text-right font-sans text-xs font-extrabold text-emerald-600">{h.i} Ekor</td>
                                  <td className="p-3.5 text-center">
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                                      {d.lat ? (
                                        <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                          <CheckCircle2 size={12} strokeWidth={2.5} /> GPS
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 text-[11px]">No GPS</span>
                                      )}
                                      {d.photo && (
                                        <a
                                          href={d.photo}
                                          download={buatNamaFileFoto(d.namaKtt, d.id)}
                                          className="text-emerald-700 hover:underline font-bold"
                                        >
                                          Foto
                                        </a>
                                      )}
                                      {baMati && (
                                        <a
                                          href={baMati}
                                          download={d.kondisi.matiBangkaiBAName || 'BA_Kematian.pdf'}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"
                                          title="Berita Acara Kematian"
                                        >
                                          <FileText size={11} strokeWidth={2.5} className="text-red-600" />
                                          <span>BA Mati</span>
                                        </a>
                                      )}
                                      {baJual && (
                                        <a
                                          href={baJual}
                                          download={d.kondisi.jualBAName || 'BA_Penjualan.pdf'}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"
                                          title="Berita Acara Penjualan"
                                        >
                                          <FileText size={11} strokeWidth={2.5} className="text-amber-700" />
                                          <span>BA Jual</span>
                                        </a>
                                      )}
                                      {!baMati && !baJual && baLegacy && (
                                        <a
                                          href={baLegacy}
                                          download={(d.kondisi as any).pdfBAName || 'Berita_Acara.pdf'}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"
                                        >
                                          <FileText size={11} strokeWidth={2.5} className="text-red-600" />
                                          <span>BA</span>
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3.5 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => handleEditClick(d)}
                                        className="min-h-touch h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                                        aria-label="Edit"
                                      >
                                        <Edit2 size={13} strokeWidth={2.5} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteClick(d.id)}
                                        className="min-h-touch h-8 w-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                                        aria-label="Hapus"
                                      >
                                        <Trash2 size={13} strokeWidth={2.5} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        )}

      </main>

      {/* ── MODAL TAMBAH TAHUN BANTUAN BARU ── */}
      {showAddTahunModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar size={18} strokeWidth={2.5} className="text-emerald-600" />
                <span>Tambah Tahun Bantuan Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddTahunModal(false);
                  setInputTahunBaru('');
                }}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Masukkan tahun bantuan baru untuk diinputkan ke dalam sistem pemantauan monev KTT.
            </p>

            <form onSubmit={handleTambahTahunBaru} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tahun Bantuan (4 Digit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1990}
                  max={2099}
                  placeholder="Contoh: 2027"
                  value={inputTahunBaru}
                  onChange={(e) => setInputTahunBaru(e.target.value)}
                  className="w-full min-h-touch h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 text-sm font-bold outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTahunModal(false);
                    setInputTahunBaru('');
                  }}
                  className="flex-1 min-h-touch h-10 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-touch h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Tambahkan Tahun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL KAMERA ── */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-center text-base">Ambil Foto Lapangan</h3>
            <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={takePhoto}
                className="flex-1 min-h-touch h-11 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700"
              >
                📸 Ambil Foto
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="min-h-touch h-11 px-5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}