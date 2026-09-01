'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { saveAuthSession } from '@/lib/auth';
import {
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  Building2,
  Users,
  Stethoscope,
  Syringe,
  CheckCircle2,
  Lock,
  Activity,
  TrendingUp,
  PackageCheck,
  FlaskConical,
  Landmark,
  FileText,
  Search,
  AlertCircle,
  Eye,
  EyeOff,
  Store,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DATA STATISTIK RESMI KEBUMEN (2025)
───────────────────────────────────────────── */
const REKAP_POPULASI_2025 = [
  { komoditas: 'Sapi Potong', total: 64996 },
  { komoditas: 'Sapi Perah', total: 0 },
  { komoditas: 'Kerbau', total: 170 },
  { komoditas: 'Kuda', total: 274 },
  { komoditas: 'Kambing', total: 101255 },
  { komoditas: 'Domba', total: 25552 },
  { komoditas: 'Babi', total: 780 },
  { komoditas: 'Ayam Kampung', total: 864412 },
  { komoditas: 'Ayam Petelur', total: 73976 },
  { komoditas: 'Ayam Broiler', total: 2636000 },
  { komoditas: 'Puyuh', total: 70808 },
  { komoditas: 'Itik', total: 87200 },
  { komoditas: 'Entog', total: 81573 },
  { komoditas: 'Angsa', total: 2153 },
  { komoditas: 'Merpati', total: 54168 },
  { komoditas: 'Kelinci', total: 3907 },
];

const dataDaging = [
  { jenis: 'Sapi Potong', total: 2671799 },
  { jenis: 'Kambing Potong', total: 476066.4 },
  { jenis: 'Ayam Ras Pedaging', total: 11218855 },
  { jenis: 'Domba', total: 35032.42 },
  { jenis: 'Babi', total: 5947.94 },
  { jenis: 'Itik', total: 67869 },
];

const dataTelur = [
  { jenis: 'Ayam Ras Petelur Produktif', total: 641709.53 },
  { jenis: 'Ayam Buras', total: 2389258.2 },
  { jenis: 'Itik', total: 786706.0 },
  { jenis: 'Burung Puyuh', total: 121869 },
  { jenis: 'Entog', total: 687138.55 },
];

const REKAP_SEBARAN_FARM = [
  { komoditas: 'Ayam Broiler', jumlah_farm: 111, total_populasi: '1.435.000 Ekor' },
  { komoditas: 'Ayam Petelur', jumlah_farm: 112, total_populasi: '184.500 Ekor' },
  { komoditas: 'Sapi Potong (KTT Terbina)', jumlah_farm: 3, total_populasi: '116 Ekor' },
  { komoditas: 'Domba & Kambing', jumlah_farm: 5, total_populasi: '445 Ekor' },
  { komoditas: 'Babi (Perorangan)', jumlah_farm: 11, total_populasi: '315 Ekor' },
];

const DATA_SKLB_RESMI = [
  { desa: 'Argopeni', jantan: 8, betina: 48 },
  { desa: 'Miritpetikusan', jantan: 12, betina: 62 },
  { desa: 'Karanggayam', jantan: 6, betina: 35 },
  { desa: 'Prembun', jantan: 9, betina: 54 },
  { desa: 'Kuwarisan', jantan: 7, betina: 41 },
  { desa: 'Sidoagung', jantan: 10, betina: 59 },
  { desa: 'Klirong', jantan: 8, betina: 46 },
  { desa: 'Gombong', jantan: 6, betina: 38 },
  { desa: 'Buayan', jantan: 9, betina: 52 },
  { desa: 'Alian', jantan: 7, betina: 44 },
  { desa: 'Ambal', jantan: 11, betina: 60 },
  { desa: 'Petanahan', jantan: 8, betina: 49 },
  { desa: 'Buluspesantren', jantan: 9, betina: 55 },
  { desa: 'Kutowinangun', jantan: 6, betina: 39 },
  { desa: 'Puring', jantan: 7, betina: 43 },
  { desa: 'Rowokele', jantan: 6, betina: 37 },
  { desa: 'Sempor', jantan: 8, betina: 50 },
  { desa: 'Sadang', jantan: 5, betina: 31 },
  { desa: 'Padureso', jantan: 4, betina: 28 },
  { desa: 'Bonorowo', jantan: 7, betina: 45 },
  { desa: 'Karanganyar', jantan: 8, betina: 47 },
  { desa: 'Sruweng', jantan: 9, betina: 53 },
  { desa: 'Pejagoan', jantan: 7, betina: 42 },
  { desa: 'Poncowarno', jantan: 6, betina: 36 },
];

const DATA_PUSKESWAN_AKTIF = [
  { nama: 'Puskeswan Mirit', wilayah: 'Kec. Mirit, Bonorowo, Ambal', koordinator: 'drh. Triyanto' },
  { nama: 'Puskeswan Klirong', wilayah: 'Kec. Klirong, Buluspesantren, Petanahan', koordinator: 'drh. Agus Sugiharto' },
  { nama: 'Puskeswan Gombong', wilayah: 'Kec. Gombong, Sempor, Rowokele', koordinator: 'drh. Hendra Kurniawan' },
  { nama: 'Puskeswan Buayan', wilayah: 'Kec. Buayan, Ayah, Puring', koordinator: 'drh. Bambang S.' },
  { nama: 'Puskeswan Alian', wilayah: 'Kec. Alian, Sadang, Padureso', koordinator: 'drh. Sri Wahyuni' },
  { nama: 'Puskeswan Prembun', wilayah: 'Kec. Prembun, Kutowinangun, Poncowarno', koordinator: 'drh. Rahmat Hidayat' },
  { nama: 'Puskeswan Kebumen', wilayah: 'Kec. Kebumen, Pejagoan', koordinator: 'drh. Nurul Hidayati' },
  { nama: 'Puskeswan Karanganyar', wilayah: 'Kec. Karanganyar, Karanggayam, Sruweng', koordinator: 'drh. Eko Prasetyo' },
];

const DATA_VAKSINASI_RESMI = [
  { desa: 'Desa Sidomukti', jenis: 'PMK & LSD', jan: 120, feb: 145, mar: 130, apr: 140, mei: 155, jun: 160, jul: 150, agu: 165, sep: 170, okt: 155, nov: 140, des: 165, total: 1795 },
  { desa: 'Desa Sidoagung', jenis: 'PMK & LSD', jan: 110, feb: 135, mar: 125, apr: 130, mei: 145, jun: 150, jul: 140, agu: 155, sep: 160, okt: 145, nov: 135, des: 150, total: 1680 },
  { desa: 'Desa Argopeni', jenis: 'PMK & LSD', jan: 150, feb: 160, mar: 140, apr: 165, mei: 170, jun: 180, jul: 175, agu: 190, sep: 185, okt: 170, nov: 165, des: 180, total: 2030 },
  { desa: 'Desa Miritpetikusan', jenis: 'PMK & LSD', jan: 95, feb: 120, mar: 110, apr: 115, mei: 125, jun: 130, jul: 125, agu: 135, sep: 140, okt: 130, nov: 120, des: 135, total: 1480 },
  { desa: 'Desa Kuwayuhan', jenis: 'PMK & LSD', jan: 80, feb: 105, mar: 95, apr: 100, mei: 110, jun: 115, jul: 110, agu: 120, sep: 125, okt: 115, nov: 105, des: 120, total: 1300 },
  { desa: 'Desa Prembun', jenis: 'PMK & LSD', jan: 140, feb: 155, mar: 150, apr: 160, mei: 165, jun: 175, jul: 170, agu: 180, sep: 185, okt: 170, nov: 160, des: 175, total: 1985 },
  { desa: 'Desa Klirong', jenis: 'PMK & LSD', jan: 130, feb: 140, mar: 135, apr: 145, mei: 150, jun: 160, jul: 155, agu: 165, sep: 170, okt: 155, nov: 145, des: 160, total: 1810 },
  { desa: 'Desa Gombong', jenis: 'PMK & LSD', jan: 160, feb: 175, mar: 165, apr: 180, mei: 185, jun: 195, jul: 190, agu: 205, sep: 200, okt: 185, nov: 175, des: 190, total: 2205 },
  { desa: 'Desa Buayan', jenis: 'PMK & LSD', jan: 105, feb: 125, mar: 115, apr: 120, mei: 130, jun: 135, jul: 130, agu: 140, sep: 145, okt: 135, nov: 125, des: 140, total: 1545 },
  { desa: 'Desa Alian', jenis: 'PMK & LSD', jan: 90, feb: 110, mar: 100, apr: 105, mei: 115, jun: 120, jul: 115, agu: 125, sep: 130, okt: 120, nov: 110, des: 125, total: 1365 },
  { desa: 'Desa Karanggayam', jenis: 'PMK & LSD', jan: 85, feb: 95, mar: 90, apr: 95, mei: 105, jun: 110, jul: 105, agu: 115, sep: 120, okt: 110, nov: 100, des: 115, total: 1245 },
  { desa: 'Desa Kutowinangun', jenis: 'PMK & LSD', jan: 115, feb: 130, mar: 120, apr: 125, mei: 135, jun: 140, jul: 135, agu: 145, sep: 150, okt: 140, nov: 130, des: 145, total: 1610 },
  { desa: 'Desa Petanahan', jenis: 'PMK & LSD', jan: 125, feb: 140, mar: 130, apr: 135, mei: 145, jun: 150, jul: 145, agu: 155, sep: 160, okt: 150, nov: 140, des: 155, total: 1730 },
  { desa: 'Desa Buluspesantren', jenis: 'PMK & LSD', jan: 135, feb: 150, mar: 145, apr: 150, mei: 160, jun: 165, jul: 160, agu: 170, sep: 175, okt: 165, nov: 155, des: 170, total: 1900 },
  { desa: 'Desa Ambal', jenis: 'PMK & LSD', jan: 145, feb: 160, mar: 155, apr: 160, mei: 170, jun: 175, jul: 170, agu: 180, sep: 185, okt: 175, nov: 165, des: 180, total: 2020 },
  { desa: 'Desa Puring', jenis: 'PMK & LSD', jan: 100, feb: 115, mar: 105, apr: 110, mei: 120, jun: 125, jul: 120, agu: 130, sep: 135, okt: 125, nov: 115, des: 130, total: 1430 },
  { desa: 'Desa Sempor', jenis: 'PMK & LSD', jan: 110, feb: 125, mar: 120, apr: 125, mei: 135, jun: 140, jul: 135, agu: 145, sep: 150, okt: 140, nov: 130, des: 145, total: 1600 },
  { desa: 'Desa Ayah', jenis: 'PMK & LSD', jan: 95, feb: 105, mar: 100, apr: 105, mei: 115, jun: 120, jul: 115, agu: 125, sep: 130, okt: 120, nov: 110, des: 125, total: 1365 },
  { desa: 'Desa Rowokele', jenis: 'PMK & LSD', jan: 90, feb: 100, mar: 95, apr: 100, mei: 110, jun: 115, jul: 110, agu: 120, sep: 125, okt: 115, nov: 105, des: 120, total: 1305 },
  { desa: 'Desa Sruweng', jenis: 'PMK & LSD', jan: 115, feb: 130, mar: 125, apr: 130, mei: 140, jun: 145, jul: 140, agu: 150, sep: 155, okt: 145, nov: 135, des: 150, total: 1640 },
];

const DATA_RPH_TPH_RESMI = [
  { nama: 'RPU Pangestu', desa: 'Desa Sidomukti, Kuwarasan', halal: 'Sudah' },
  { nama: 'RPU ASRIYAH', desa: 'Desa Sidoagung, Sruweng', halal: 'Sudah' },
  { nama: 'RPU ZAIN', desa: 'Desa Sidoagung, Sruweng', halal: 'Sudah' },
  { nama: 'RPU FITRIA', desa: 'Desa Sidoagung, Sruweng', halal: 'Sudah' },
  { nama: 'RPH Unggas Ayam Broiler', desa: 'Desa Prembun, Prembun', halal: 'Sudah' },
  { nama: 'TPH Berkah Daging Sapi', desa: 'Desa Argopeni, Ayah', halal: 'Sudah' },
  { nama: 'RPU Barokah Kuwayuhan', desa: 'Desa Kuwayuhan, Pejagoan', halal: 'Sudah' },
  { nama: 'RPH Ruminansia Kebumen', desa: 'Desa Muktisari, Kebumen', halal: 'Sudah' },
  { nama: 'TPH Sumber Rejeki', desa: 'Desa Klirong, Klirong', halal: 'Sudah' },
  { nama: 'TPU Unggas Gombong', desa: 'Desa Wero, Gombong', halal: 'Sudah' },
  { nama: 'RPU Mandiri Jaya', desa: 'Desa Alian, Alian', halal: 'Sudah' },
  { nama: 'TPH Sapi Lembu Makmur', desa: 'Desa Petanahan, Petanahan', halal: 'Sudah' },
  { nama: 'RPU Mitra Ternak', desa: 'Desa Kutowinangun, Kutowinangun', halal: 'Sudah' },
  { nama: 'TPH Kambing Barokah', desa: 'Desa Karanganyar, Karanganyar', halal: 'Belum' },
  { nama: 'RPU Sejahtera Bersama', desa: 'Desa Buayan, Buayan', halal: 'Sudah' },
];

const DATA_NKV_RESMI = [
  { nama_pt: 'PT Kebumen Poultry Mandiri', alamat: 'Jl. Raya Prembun Km 4, Desa Prembun, Kec. Prembun', status_nkv: 'Ada' },
  { nama_pt: 'PT Sumber Unggas Kebumen', alamat: 'Jl. Sempor Lama No. 18, Desa Sidomukti, Kec. Kuwarasan', status_nkv: 'Ada' },
  { nama_pt: 'PT Mitra Ternak Ruminansia', alamat: 'Dusun Pacalbalung, Desa Sidoagung, Kec. Sruweng', status_nkv: 'Ada' },
  { nama_pt: 'RPH Modern Ruminansia Kebumen', alamat: 'Jl. Ronggowarsito No. 12, Pejagoan, Kab. Kebumen', status_nkv: 'Ada' },
  { nama_pt: 'RPU Berkah Unggas Kuwayuhan', alamat: 'Jl. Kuwayuhan Rt 02/03, Pejagoan, Kab. Kebumen', status_nkv: 'Ada' },
  { nama_pt: 'PT Sinar Abadi Farm Kebumen', alamat: 'Desa Argopeni Rt 01/02, Kec. Ayah, Kab. Kebumen', status_nkv: 'Ada' },
  { nama_pt: 'UD Lembu Jaya Makmur', alamat: 'Desa Muktisari Rt 03/01, Kec. Kebumen, Kab. Kebumen', status_nkv: 'Ada' },
  { nama_pt: 'CV Unggas Prima Kebumen', alamat: 'Desa Wero Rt 04/02, Kec. Gombong, Kab. Kebumen', status_nkv: 'Ada' },
  { nama_pt: 'PT Peternakan Terpadu Kebumen', alamat: 'Jl. Lingkar Selatan, Desa Klirong, Kec. Klirong', status_nkv: 'Ada' },
  { nama_pt: 'RPH Ternak Potong Prembun', alamat: 'Jl. Stasiun Prembun No. 05, Kec. Prembun, Kab. Kebumen', status_nkv: 'Ada' },
];

const DATA_POPULASI_TERNAK = [
  { komoditas: 'Kambing', total: 101255 },
  { komoditas: 'Sapi Potong', total: 64996 },
  { komoditas: 'Domba', total: 25552 },
  { komoditas: 'Kelinci', total: 3907 },
  { komoditas: 'Babi', total: 780 },
  { komoditas: 'Kuda', total: 274 },
  { komoditas: 'Kerbau', total: 170 },
  { komoditas: 'Sapi Perah', total: 0 },
];

const DATA_POPULASI_UNGGAS = [
  { komoditas: 'Ayam Broiler', total: 2636000 },
  { komoditas: 'Ayam Kampung', total: 864412 },
  { komoditas: 'Itik', total: 87200 },
  { komoditas: 'Entog', total: 81573 },
  { komoditas: 'Ayam Petelur', total: 73976 },
  { komoditas: 'Puyuh', total: 70808 },
  { komoditas: 'Merpati', total: 54168 },
  { komoditas: 'Angsa', total: 2153 },
];

const PALETTE_DAGING = [
  { bg: 'bg-rose-600', gradient: 'from-rose-500 to-rose-600', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50' },
  { bg: 'bg-red-500', gradient: 'from-red-500 to-red-600', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50' },
  { bg: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' },
  { bg: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
  { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  { bg: 'bg-sky-500', gradient: 'from-sky-500 to-sky-600', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50' },
];

const PALETTE_TELUR = [
  { bg: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
  { bg: 'bg-yellow-500', gradient: 'from-yellow-500 to-yellow-600', text: 'text-yellow-600', border: 'border-yellow-200', light: 'bg-yellow-50' },
  { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  { bg: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50' },
  { bg: 'bg-violet-500', gradient: 'from-violet-500 to-violet-600', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-50' },
];

const MODULES = [
  {
    key: 'bitpro',
    label: 'Bitpro',
    caption: 'Perbibitan & Produksi Ternak',
    icon: Activity,
    accent: '#059669',
  },
  {
    key: 'keswan',
    label: 'Keswan',
    caption: 'Kesehatan Hewan & Puskeswan',
    icon: Stethoscope,
    accent: '#0284c7',
  },
  {
    key: 'kesmavet',
    label: 'Kesmavet',
    caption: 'Kesehatan Masyarakat Veteriner',
    icon: FlaskConical,
    accent: '#7c3aed',
  },
] as const;

export default function LandingPage() {
  const router = useRouter();

  // Navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Dashboard state
  const [activeModule, setActiveModule] = useState<'bitpro' | 'keswan' | 'kesmavet'>('bitpro');
  const [detailView, setDetailView] = useState<string | null>(null);
  const [subTabProd, setSubTabProd] = useState<'populasi' | 'daging' | 'telur'>('populasi');
  const [rankedMetric, setRankedMetric] = useState<'populasi' | 'daging' | 'telur'>('populasi');
  const [searchVaksin, setSearchVaksin] = useState('');

  // Realtime Data State
  const [populasiData, setPopulasiData] = useState(REKAP_POPULASI_2025);
  const [dagingData, setDagingData] = useState(dataDaging);
  const [telurData, setTelurData] = useState(dataTelur);
  const [farmData, setFarmData] = useState(REKAP_SEBARAN_FARM);
  const [puskeswanData, setPuskeswanData] = useState(DATA_PUSKESWAN_AKTIF);
  const [vaksinasiData, setVaksinasiData] = useState(DATA_VAKSINASI_RESMI);
  const [rphData, setRphData] = useState(DATA_RPH_TPH_RESMI);
  const [nkvData, setNkvData] = useState(DATA_NKV_RESMI);

  // Form login state
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check existing session
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.push('/beranda');
    };
    checkSession();
  }, [router]);

  // Realtime Database Fetching
  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        // Fetch Populasi
        const resPopulasi = await fetch('/api/get-populasi');
        if (resPopulasi.ok) {
          const json = await resPopulasi.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            const sumMap: Record<string, number> = {};
            json.data.forEach((row: any) => {
              if (row.data_v && typeof row.data_v === 'object') {
                Object.entries(row.data_v).forEach(([komoditas, val]) => {
                  sumMap[komoditas] = (sumMap[komoditas] || 0) + Number(val || 0);
                });
              }
            });
            const aggregated = Object.entries(sumMap).map(([komoditas, total]) => ({
              komoditas,
              total,
            }));
            if (aggregated.length > 0) {
              setPopulasiData(aggregated);
            }
          }
        }

        // Fetch Produksi
        const resProduksi = await fetch('/api/get-produksi');
        if (resProduksi.ok) {
          const json = await resProduksi.json();
          if (json.daging && json.daging.length > 0) setDagingData(json.daging);
          if (json.telur && json.telur.length > 0) setTelurData(json.telur);
        }

        // Fetch Farm
        const resFarm = await fetch('/api/get-farm');
        if (resFarm.ok) {
          const json = await resFarm.json();
          if (Array.isArray(json) && json.length > 0) {
            const countByKategori: Record<string, { count: number; totalCap: number }> = {};
            json.forEach((f: any) => {
              const cat = f.komoditas || f.kategori || 'Lainnya';
              if (!countByKategori[cat]) countByKategori[cat] = { count: 0, totalCap: 0 };
              countByKategori[cat].count += 1;
              countByKategori[cat].totalCap += Number(f.kapasitas_populasi || f.populasi || 0);
            });
            const farmSummary = Object.entries(countByKategori).map(([komoditas, val]) => ({
              komoditas,
              jumlah_farm: val.count,
              total_populasi: `${val.totalCap.toLocaleString('id-ID')} Ekor`,
            }));
            if (farmSummary.length > 0) setFarmData(farmSummary);
          }
        }

        // Fetch NKV
        const resNkv = await fetch('/api/nkv');
        if (resNkv.ok) {
          const json = await resNkv.json();
          if (Array.isArray(json) && json.length > 0) {
            setNkvData(json.slice(0, 15));
          }
        }

        // Fetch RPH
        const resRph = await fetch('/api/pemotongan-hewan');
        if (resRph.ok) {
          const json = await resRph.json();
          if (Array.isArray(json) && json.length > 0) {
            setRphData(
              json.slice(0, 15).map((r: any) => ({
                nama: r.nama_unit || r.nama || 'Unit RPH/TPH',
                desa: `${r.desa || ''}, ${r.kecamatan || ''}`,
                halal: r.sertifikat_halal ? 'Sudah' : 'Belum',
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Realtime sync fallback to baseline data:', err);
      }
    };

    fetchRealtimeData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip_username: loginId, password }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.user) {
          saveAuthSession(json.user);
          router.push('/beranda');
          return;
        }
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginId.includes('@') ? loginId : `${loginId}@pkh.kebumenkab.go.id`,
        password,
      });

      if (signInError) {
        setError('Akses ditolak. Periksa kembali ID Petugas atau kata sandi Anda.');
      } else {
        router.push('/beranda');
      }
    } catch {
      setError('Terjadi kesalahan koneksi server. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPopulasi = populasiData.reduce((sum, d) => sum + (d.total || 0), 0);
  const totalDaging = dagingData.reduce((sum, d) => sum + (d.total || 0), 0);
  const totalTelur = telurData.reduce((sum, d) => sum + (d.total || 0), 0);
  const totalFarm = farmData.reduce((sum, d) => sum + (d.jumlah_farm || 0), 0);

  const topKomoditas = [...populasiData].filter((d) => d.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);
  const topDaging = [...dagingData].sort((a, b) => b.total - a.total).slice(0, 5);
  const topTelur = [...telurData].sort((a, b) => b.total - a.total).slice(0, 5);

  const totalTernakHewan = DATA_POPULASI_TERNAK.reduce((sum, d) => sum + d.total, 0);
  const totalUnggas = DATA_POPULASI_UNGGAS.reduce((sum, d) => sum + d.total, 0);

  const dataProduksiDagingTon = dagingData
    .map((d) => ({ jenis: d.jenis, ton: d.total / 1000 }))
    .sort((a, b) => b.ton - a.ton);

  const dataProduksiTelurTon = telurData
    .map((d) => ({ jenis: d.jenis, ton: d.total / 1000 }))
    .sort((a, b) => b.ton - a.ton);

  const maxDagingTon = dataProduksiDagingTon[0]?.ton || 1;
  const maxTelurTon = dataProduksiTelurTon[0]?.ton || 1;

  const metricConfigs = {
    populasi: {
      label: 'Populasi Ternak',
      unit: 'Ekor',
      data: topKomoditas,
      max: topKomoditas[0]?.total || 1,
      getName: (r: any) => r.komoditas,
      barColor: '#0284c7',
    },
    daging: {
      label: 'Produksi Daging',
      unit: 'Kg',
      data: topDaging,
      max: topDaging[0]?.total || 1,
      getName: (r: any) => r.jenis,
      barColor: '#e11d48',
    },
    telur: {
      label: 'Produksi Telur',
      unit: 'Kg',
      data: topTelur,
      max: topTelur[0]?.total || 1,
      getName: (r: any) => r.jenis,
      barColor: '#f59e0b',
    },
  };

  const cfg = metricConfigs[rankedMetric];
  const activeMod = MODULES.find((m) => m.key === activeModule) || MODULES[0];

  const filteredVaksinasi = vaksinasiData.filter((v) =>
    v.desa.toLowerCase().includes(searchVaksin.toLowerCase())
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col items-center">
      
      {/* ─────────────────────────────────────────────
          1. TOP NAVIGATION
      ───────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img
                src="/logo-simantap.png"
                alt="Logo SiMantap"
                className="w-full h-full object-contain"
                onError={(e: any) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden text-blue-600 items-center justify-center">
                <Landmark size={20} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-blue-700">
                  SiMantap
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 uppercase tracking-wider">
                  Kebumen
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block leading-none mt-0.5">
                Sistem Informasi Manajemen Peternakan Terpadu
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#ringkasan" className="hover:text-blue-600 transition-colors">
              Ringkasan Wilayah
            </a>
            <a href="#modul" className="hover:text-blue-600 transition-colors">
              Modul Data
            </a>
            <a href="#bantuan" className="hover:text-blue-600 transition-colors">
              Bantuan Akses
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="min-h-touch h-11 px-5 rounded-xl bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Masuk Petugas</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowLoginModal(true)}
              className="min-h-touch h-10 px-3.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Masuk</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Buka Menu"
              className="min-h-touch min-w-touch w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-blue-100 bg-blue-50/40 px-5 py-3.5 space-y-1 animate-in slide-in-from-top-2 duration-200">
            <a
              href="#ringkasan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2.5 text-sm font-semibold text-slate-800 hover:text-blue-600"
            >
              <BarChart3 size={16} className="text-blue-600" />
              <span>Ringkasan Wilayah</span>
            </a>
            <button
              onClick={() => {
                setActiveModule('keswan');
                setDetailView('puskeswan');
                setMobileMenuOpen(false);
                scrollToSection('modul');
              }}
              className="w-full flex items-center gap-2.5 py-2.5 text-sm font-semibold text-slate-800 hover:text-blue-600 text-left"
            >
              <Stethoscope size={16} className="text-blue-600" />
              <span>Puskeswan Aktif</span>
            </button>
            <a
              href="#modul"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2.5 text-sm font-semibold text-slate-800 hover:text-blue-600"
            >
              <Activity size={16} className="text-blue-600" />
              <span>Modul Data</span>
            </a>
            <a
              href="#bantuan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-bold text-slate-800 hover:text-blue-600"
            >
              <ShieldCheck size={16} className="text-slate-500" />
              <span>Bantuan Akses</span>
            </a>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────
          2. HERO SECTION & STATISTIK REALTIME
      ───────────────────────────────────────────── */}
      <section id="ringkasan" className="pt-28 pb-12 sm:pt-36 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Kicker Badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Portal Resmi Bidang Peternakan &amp; Kesehatan Hewan Kebumen</span>
          </div>
        </div>

        {/* Editorial Headline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.18] mb-5">
            Satu Ekosistem untuk Data <br className="hidden sm:inline" />
            <span className="text-blue-600">Peternakan Kebumen</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl mx-auto font-normal text-slate-600">
            Sistem Informasi Manajemen Terpadu yang mengintegrasikan data Perbibitan &amp; Produksi (Bitpro), Kesehatan Hewan (Keswan), dan Kesehatan Masyarakat Veteriner (Kesmavet) secara akurat, transparan, dan terbuka.
          </p>
        </div>

        {/* Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full sm:w-auto min-h-touch h-12 px-7 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Masuk ke Dashboard Dinas</span>
            <ArrowRight size={16} />
          </button>
          
          <a
            href="#modul"
            className="w-full sm:w-auto min-h-touch h-12 px-6 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>Eksplorasi Data Publik</span>
            <ChevronRight size={16} />
          </a>
        </div>

        {/* 4 Blue & White Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          
          {/* Stat 1: Total Populasi */}
          <div
            onClick={() => {
              setActiveModule('bitpro');
              setDetailView('populasi');
              setSubTabProd('populasi');
              scrollToSection('modul');
            }}
            className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1 truncate">
                Total Populasi Ternak
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                {totalPopulasi.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-1 truncate">
                Ekor di seluruh Kebumen
              </p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Activity size={22} />
            </div>
          </div>

          {/* Stat 2: Produksi Daging */}
          <div
            onClick={() => {
              setActiveModule('bitpro');
              setDetailView('populasi');
              setSubTabProd('daging');
              scrollToSection('modul');
            }}
            className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between gap-3 cursor-pointer hover:border-sky-300 hover:shadow-sm transition-all group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1 truncate">
                Produksi Daging
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                {(totalDaging / 1000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-1 truncate">
                Ton / tahun
              </p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <TrendingUp size={22} />
            </div>
          </div>

          {/* Stat 3: Produksi Telur */}
          <div
            onClick={() => {
              setActiveModule('bitpro');
              setDetailView('populasi');
              setSubTabProd('telur');
              scrollToSection('modul');
            }}
            className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1 truncate">
                Produksi Telur
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                {(totalTelur / 1000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-1 truncate">
                Ton / tahun
              </p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <PackageCheck size={22} />
            </div>
          </div>

          {/* Stat 4: Sebaran Farm */}
          <div
            onClick={() => {
              setActiveModule('bitpro');
              setDetailView('farm');
              scrollToSection('modul');
            }}
            className="p-4 sm:p-5 rounded-2xl bg-[#f0f6ff] border border-blue-100 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1 truncate">
                Sebaran Data Farm
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                {totalFarm} Unit
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-1 truncate">
                Peternakan terdata
              </p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Building2 size={22} />
            </div>
          </div>

        </div>

        {/* 4 Secondary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-blue-50 shadow-2xs">
            <p className="text-xs text-slate-500 font-medium truncate">Ayam Broiler</p>
            <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mt-0.5 truncate">2.636.000</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Ekor · Populasi Terbesar</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-blue-50 shadow-2xs">
            <p className="text-xs text-slate-500 font-medium truncate">Ayam Ras Pedaging</p>
            <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mt-0.5 truncate">11.218,9</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Ton Daging / Tahun</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-blue-50 shadow-2xs">
            <p className="text-xs text-slate-500 font-medium truncate">Ayam Buras</p>
            <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mt-0.5 truncate">2.389,3</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Ton Telur / Tahun</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-blue-50 shadow-2xs">
            <p className="text-xs text-slate-500 font-medium truncate">Sapi Potong</p>
            <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mt-0.5 truncate">64.996</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Ekor Sapi Terdata</p>
          </div>
        </div>

        {/* ── DIAGRAM BATANG POPULASI & PRODUKSI (4 GRID) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
          
          {/* 1. Populasi Ternak */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Ruminansia &amp; Non-Ruminansia
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  Populasi Hewan Ternak
                </h3>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                Total: {totalTernakHewan.toLocaleString('id-ID')} Ekor
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              {DATA_POPULASI_TERNAK.map((row, idx) => {
                const maxVal = DATA_POPULASI_TERNAK[0]?.total || 1;
                const percent = Math.max(8, Math.round((row.total / maxVal) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{row.komoditas}</span>
                      <span className="text-blue-700 font-bold">{row.total.toLocaleString('id-ID')} Ekor</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Populasi Unggas */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Komoditas Unggas
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  Populasi Unggas &amp; Burung
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                Total: {totalUnggas.toLocaleString('id-ID')} Ekor
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              {DATA_POPULASI_UNGGAS.map((row, idx) => {
                const maxVal = DATA_POPULASI_UNGGAS[0]?.total || 1;
                const percent = Math.max(8, Math.round((row.total / maxVal) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{row.komoditas}</span>
                      <span className="text-amber-700 font-bold">{row.total.toLocaleString('id-ID')} Ekor</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Produksi Daging */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Produksi Komoditas
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  Produksi Daging (Ton/Tahun)
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                Total: {(totalDaging / 1000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ton
              </span>
            </div>

            <div className="pt-5 pb-2 px-2 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="grid grid-cols-6 gap-2 items-end h-44 sm:h-48">
                {dataProduksiDagingTon.map((row, i) => {
                  const color = PALETTE_DAGING[i % PALETTE_DAGING.length];
                  const percent = row.ton > 0 ? Math.max(12, Math.round((row.ton / maxDagingTon) * 100)) : 6;

                  return (
                    <div key={row.jenis} className="flex flex-col items-center justify-end h-full group relative min-w-0">
                      <div className="mb-1 text-center">
                        <span className={`inline-block px-1 py-0.5 rounded text-[9px] font-bold ${color.light} ${color.text} border ${color.border} shadow-2xs whitespace-nowrap`}>
                          {Math.round(row.ton).toLocaleString('id-ID')} T
                        </span>
                      </div>
                      <div className="w-full max-w-[36px] bg-slate-200/70 rounded-t-lg flex flex-col justify-end p-0.5 overflow-hidden h-full">
                        <div
                          className={`w-full rounded-t-md bg-gradient-to-t ${color.gradient} transition-all duration-700`}
                          style={{ height: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-600 font-medium truncate mt-2 w-full text-center">
                        {row.jenis}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Produksi Telur */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Produksi Telur
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  Produksi Telur (Ton/Tahun)
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                Total: {(totalTelur / 1000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ton
              </span>
            </div>

            <div className="pt-5 pb-2 px-2 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="grid grid-cols-5 gap-2 items-end h-44 sm:h-48">
                {dataProduksiTelurTon.map((row, i) => {
                  const color = PALETTE_TELUR[i % PALETTE_TELUR.length];
                  const percent = row.ton > 0 ? Math.max(12, Math.round((row.ton / maxTelurTon) * 100)) : 6;

                  return (
                    <div key={row.jenis} className="flex flex-col items-center justify-end h-full group relative min-w-0">
                      <div className="mb-1 text-center">
                        <span className={`inline-block px-1 py-0.5 rounded text-[9px] font-bold ${color.light} ${color.text} border ${color.border} shadow-2xs whitespace-nowrap`}>
                          {Math.round(row.ton).toLocaleString('id-ID')} T
                        </span>
                      </div>
                      <div className="w-full max-w-[36px] bg-slate-200/70 rounded-t-lg flex flex-col justify-end p-0.5 overflow-hidden h-full">
                        <div
                          className={`w-full rounded-t-md bg-gradient-to-t ${color.gradient} transition-all duration-700`}
                          style={{ height: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-600 font-medium truncate mt-2 w-full text-center">
                        {row.jenis}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ─────────────────────────────────────────────
          3. MODUL DATA INTERAKTIF
      ───────────────────────────────────────────── */}
      <section id="modul" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Module Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Eksplorasi Modul SiMantap
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pilih bidang teknis untuk melihat rincian tabel &amp; indikator data
            </p>
          </div>

          {/* Module Tab Buttons */}
          <div className="flex gap-2 p-1 rounded-2xl bg-white border border-slate-200 shadow-xs self-start sm:self-auto">
            {MODULES.map((mod) => {
              const isActive = activeModule === mod.key;
              const IconComponent = mod.icon;
              return (
                <button
                  key={mod.key}
                  onClick={() => {
                    setActiveModule(mod.key);
                    setDetailView(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <IconComponent size={15} />
                  <span>{mod.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Panel Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeMod.accent }} />
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Bidang {activeMod.label} — {activeMod.caption}
              </h3>
            </div>
            {detailView && (
              <button
                onClick={() => setDetailView(null)}
                className="h-8 px-3.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                ← Kembali ke Ringkasan
              </button>
            )}
          </div>

          {/* Conditional Content: Detail View vs Module Summary */}
          {detailView ? (
            /* DETAIL TABLE VIEW */
            <div className="space-y-6">
              
              {detailView === 'populasi' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'populasi', label: 'Populasi Ternak' },
                      { key: 'daging', label: 'Produksi Daging' },
                      { key: 'telur', label: 'Produksi Telur' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setSubTabProd(tab.key as any)}
                        className={`h-8 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          subTabProd === tab.key
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3.5 text-center w-14">NO</th>
                          <th className="p-3.5">KOMODITAS</th>
                          <th className="p-3.5 text-right font-bold">TOTAL REALTIME</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {subTabProd === 'populasi' &&
                          populasiData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/40">
                              <td className="p-3.5 text-center text-slate-400">{idx + 1}</td>
                              <td className="p-3.5 font-bold text-slate-900">{row.komoditas}</td>
                              <td className="p-3.5 text-right font-bold text-blue-600">
                                {row.total.toLocaleString('id-ID')} Ekor
                              </td>
                            </tr>
                          ))}
                        {subTabProd === 'daging' &&
                          dagingData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/40">
                              <td className="p-3.5 text-center text-slate-400">{idx + 1}</td>
                              <td className="p-3.5 font-bold text-slate-900">{row.jenis}</td>
                              <td className="p-3.5 text-right font-bold text-rose-600">
                                {(row.total / 1000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Ton
                              </td>
                            </tr>
                          ))}
                        {subTabProd === 'telur' &&
                          telurData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/40">
                              <td className="p-3.5 text-center text-slate-400">{idx + 1}</td>
                              <td className="p-3.5 font-bold text-slate-900">{row.jenis}</td>
                              <td className="p-3.5 text-right font-bold text-amber-600">
                                {(row.total / 1000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Ton
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {detailView === 'farm' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 text-center w-14">NO</th>
                        <th className="p-3.5">KOMODITAS FARM</th>
                        <th className="p-3.5 text-center">JUMLAH FARM</th>
                        <th className="p-3.5 text-right">TOTAL KAPASITAS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {farmData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40">
                          <td className="p-3.5 text-center text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-slate-900">{row.komoditas}</td>
                          <td className="p-3.5 text-center font-bold text-slate-700">{row.jumlah_farm} Unit</td>
                          <td className="p-3.5 text-right font-bold text-blue-600">{row.total_populasi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {detailView === 'puskeswan' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {puskeswanData.map((p, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{p.nama}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Wilayah: {p.wilayah}</p>
                        <p className="text-xs font-semibold text-blue-700 mt-1">Koordinator: {p.koordinator}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detailView === 'vaksinasi' && (
                <div className="space-y-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="text"
                      value={searchVaksin}
                      onChange={(e) => setSearchVaksin(e.target.value)}
                      placeholder="Cari desa / wilayah..."
                      className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3.5 text-center w-14">NO</th>
                          <th className="p-3.5">DESA / WILAYAH</th>
                          <th className="p-3.5 text-center">JENIS VAKSIN</th>
                          <th className="p-3.5 text-right font-bold">TOTAL DOSIS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {filteredVaksinasi.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40">
                            <td className="p-3.5 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-3.5 font-bold text-slate-900">{row.desa}</td>
                            <td className="p-3.5 text-center font-medium text-slate-600">{row.jenis}</td>
                            <td className="p-3.5 text-right font-bold text-blue-600">{row.total.toLocaleString('id-ID')} Dosis</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {detailView === 'nkv' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 text-center w-14">NO</th>
                        <th className="p-3.5">NAMA UNIT USAHA</th>
                        <th className="p-3.5">ALAMAT / WILAYAH</th>
                        <th className="p-3.5 text-center">STATUS NKV</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {nkvData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40">
                          <td className="p-3.5 text-center text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-slate-900">{row.nama_pt}</td>
                          <td className="p-3.5 text-slate-600">{row.alamat}</td>
                          <td className="p-3.5 text-center font-bold text-emerald-600">{row.status_nkv || 'Tersertifikasi'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {detailView === 'rph_tph' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 text-center w-14">NO</th>
                        <th className="p-3.5">NAMA UNIT RPH / TPH</th>
                        <th className="p-3.5">LOKASI</th>
                        <th className="p-3.5 text-center">STATUS HALAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {rphData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40">
                          <td className="p-3.5 text-center text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-slate-900">{row.nama}</td>
                          <td className="p-3.5 text-slate-600">{row.desa}</td>
                          <td className="p-3.5 text-center font-bold text-blue-600">{row.halal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {['ktt', 'sklb', 'keswan_info', 'kesmavet_info'].includes(detailView) && (
                <div className="py-12 px-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto text-xl">
                    <Lock size={22} />
                  </div>
                  <h5 className="font-bold text-base text-slate-900">
                    Akses Khusus Petugas Terdaftar
                  </h5>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Detail mutasi ternak, rekonsiliasi bantuan, dan data operasional dinas dapat diakses melalui login petugas.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="min-h-touch h-10 px-5 rounded-xl bg-blue-600 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      Masuk untuk Akses Lengkap
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* DEFAULT MODULE PREVIEWS */
            <div className="space-y-8">
              
              {/* Bitpro View */}
              {activeModule === 'bitpro' && (
                <>
                  <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold text-slate-900">
                          Peringkat 5 Tertinggi — {cfg.label}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Rekapitulasi resmi tingkat Kabupaten Kebumen
                        </p>
                      </div>

                      <div className="flex gap-1 p-1 rounded-xl bg-slate-200/70 border border-slate-200">
                        {(['populasi', 'daging', 'telur'] as const).map((key) => (
                          <button
                            key={key}
                            onClick={() => setRankedMetric(key)}
                            className={`h-8 px-3 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                              rankedMetric === key
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {cfg.data.map((row: any, i: number) => {
                        const name = cfg.getName(row);
                        const percent = Math.round((row.total / cfg.max) * 100);

                        return (
                          <div key={name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 w-48 shrink-0">
                              <span className={`w-5 h-5 rounded-md font-sans text-xs font-bold flex items-center justify-center ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                {i + 1}
                              </span>
                              <span className="text-xs sm:text-sm font-bold truncate text-slate-900">
                                {name}
                              </span>
                            </div>

                            <div className="flex-1 h-3 rounded-full bg-slate-200/80 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${percent}%`,
                                  backgroundColor: cfg.barColor,
                                }}
                              />
                            </div>

                            <span className="text-xs sm:text-sm font-bold text-right w-36 shrink-0 text-slate-900">
                              {Math.round(row.total).toLocaleString('id-ID')} {cfg.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setDetailView('populasi')}
                      className="p-5 rounded-2xl border border-slate-200 bg-white text-left flex flex-col justify-between min-h-[130px] transition-all hover:border-blue-500 hover:shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <BarChart3 size={18} />
                        </div>
                        <ChevronRight size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 mb-0.5">Populasi &amp; Produksi</p>
                        <p className="text-xs text-slate-500">Tabel sensus komoditas ternak</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setDetailView('farm')}
                      className="p-5 rounded-2xl border border-slate-200 bg-white text-left flex flex-col justify-between min-h-[130px] transition-all hover:border-emerald-500 hover:shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <Building2 size={18} />
                        </div>
                        <ChevronRight size={18} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 mb-0.5">Sebaran Data Farm</p>
                        <p className="text-xs text-slate-500">{totalFarm} unit peternakan terdata</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setDetailView('ktt')}
                      className="p-5 rounded-2xl border border-slate-200 bg-white text-left flex flex-col justify-between min-h-[130px] transition-all hover:border-lime-500 hover:shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-lime-50 text-lime-800 flex items-center justify-center">
                          <Users size={18} />
                        </div>
                        <ChevronRight size={18} className="text-lime-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 mb-0.5">Database KTT</p>
                        <p className="text-xs text-slate-500">Kelompok Tani Ternak binaan</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setDetailView('sklb')}
                      className="p-5 rounded-2xl border border-slate-200 bg-white text-left flex flex-col justify-between min-h-[130px] transition-all hover:border-amber-400 hover:shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <FileText size={18} />
                        </div>
                        <ChevronRight size={18} className="text-amber-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 mb-0.5">Sertifikat SKLB</p>
                        <p className="text-xs text-slate-500">Surat Kelayakan Bibit Ternak</p>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {/* Keswan View */}
              {activeModule === 'keswan' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setDetailView('puskeswan')}
                    className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:border-blue-500 hover:bg-white transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <Stethoscope size={22} />
                      </div>
                      <h4 className="font-bold text-base text-slate-900 mb-1">8 Puskeswan Aktif</h4>
                      <p className="text-xs text-slate-600">
                        Pelayanan rawat, pasif, pusling keliling, dan konsultasi kesehatan ternak di seluruh kecamatan Kebumen.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-4">
                      LIHAT PUSKESWAN &rarr;
                    </span>
                  </div>

                  <div
                    onClick={() => setDetailView('vaksinasi')}
                    className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:border-blue-500 hover:bg-white transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                        <Syringe size={22} />
                      </div>
                      <h4 className="font-bold text-base text-slate-900 mb-1">Vaksinasi PMK &amp; LSD</h4>
                      <p className="text-xs text-slate-600">
                        Pencatatan real-time log harian dosis vaksinasi PMK &amp; LSD, alokasi droping vaksin, dan capaian target.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-sky-600 flex items-center gap-1 mt-4">
                      LIHAT LOG VAKSINASI &rarr;
                    </span>
                  </div>
                </div>
              )}

              {/* Kesmavet View */}
              {activeModule === 'kesmavet' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setDetailView('nkv')}
                    className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:border-purple-500 hover:bg-white transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                        <CheckCircle2 size={22} />
                      </div>
                      <h4 className="font-bold text-base text-slate-900 mb-1">Sertifikasi NKV</h4>
                      <p className="text-xs text-slate-600">
                        Database unit usaha berstandar Nomor Kontrol Veteriner dengan jaminan ASUH (Aman, Sehat, Utuh, Halal).
                      </p>
                    </div>
                    <span className="text-xs font-bold text-purple-600 flex items-center gap-1 mt-4">
                      LIHAT DAFTAR NKV &rarr;
                    </span>
                  </div>

                  <div
                    onClick={() => setDetailView('rph_tph')}
                    className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:border-purple-500 hover:bg-white transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                        <Building2 size={22} />
                      </div>
                      <h4 className="font-bold text-base text-slate-900 mb-1">RPH, TPH, &amp; TPU</h4>
                      <p className="text-xs text-slate-600">
                        Database 101 unit usaha pemotongan ternak ruminansia &amp; unggas dengan legalitas dan sertifikat Halal.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-4">
                      LIHAT UNIT RPH/TPH &rarr;
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </section>

      {/* ─────────────────────────────────────────────
          4. MODAL LOGIN PETUGAS
      ───────────────────────────────────────────── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 relative shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            
            <button
              onClick={() => setShowLoginModal(false)}
              aria-label="Tutup jendela login"
              className="min-h-touch min-w-touch w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 absolute top-5 right-5 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-6 text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                Masuk Sistem SiMantap
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan ID Petugas resmi Dinas Pertanian dan Pangan
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  ID Petugas / NIP / Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="ID Petugas atau NIP"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full min-h-touch h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full min-h-touch h-11 pl-3.5 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    className="min-h-touch min-w-touch w-10 h-10 absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-touch h-12 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 mt-5 shadow-xs hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <span>Masuk ke Dashboard Petugas</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
              Bidang Peternakan dan Kesehatan Hewan Kabupaten Kebumen.
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          5. FOOTER
      ───────────────────────────────────────────── */}
      <footer id="bantuan" className="w-full border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-600 bg-white">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="font-sans text-lg font-bold text-blue-700">SiMantap</span>
            <span>—</span>
            <span>Dinas Pertanian dan Pangan Kabupaten Kebumen</span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Bidang Peternakan dan Kesehatan Hewan · Jl. Tentara Pelajar No. 25, Kebumen, Jawa Tengah.
          </p>
          <p className="text-xs font-semibold text-slate-400 pt-1">
            &copy; {new Date().getFullYear()} Pemerintah Kabupaten Kebumen. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>

    </div>
  );
}