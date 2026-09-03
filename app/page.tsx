'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { saveAuthSession } from '@/lib/auth';
import {
  ArrowRight,
  Menu,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Building2,
  Users,
  Stethoscope,
  Syringe,
  AlertCircle,
  CheckCircle2,
  Lock,
  Activity,
  TrendingUp,
  PackageCheck,
  FlaskConical,
  Landmark,
  Search,
  MapPin,
  LayoutGrid,
  List,
  Navigation,
  ExternalLink,
  Loader2,
} from 'lucide-react';

const PALETTE_TERNAK = [
  { bg: 'bg-blue-600', gradient: 'from-blue-600 to-blue-700', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  { bg: 'bg-sky-500', gradient: 'from-sky-500 to-sky-600', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50' },
  { bg: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50' },
  { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  { bg: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
  { bg: 'bg-rose-500', gradient: 'from-rose-500 to-rose-600', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50' },
  { bg: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
  { bg: 'bg-slate-400', gradient: 'from-slate-400 to-slate-500', text: 'text-slate-600', border: 'border-slate-200', light: 'bg-slate-50' },
];

const PALETTE_UNGGAS = [
  { bg: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
  { bg: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' },
  { bg: 'bg-blue-600', gradient: 'from-blue-600 to-blue-700', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  { bg: 'bg-sky-500', gradient: 'from-sky-500 to-sky-600', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50' },
  { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  { bg: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50' },
  { bg: 'bg-violet-500', gradient: 'from-violet-500 to-violet-600', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-50' },
  { bg: 'bg-pink-500', gradient: 'from-pink-500 to-pink-600', text: 'text-pink-600', border: 'border-pink-200', light: 'bg-pink-50' },
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
    step: '1. Bitpro',
    label: 'Bitpro',
    caption: 'Perbibitan & Produksi Ternak',
    image: '/card-bitpro.png',
    icon: Activity,
    accent: '#059669',
  },
  {
    key: 'keswan',
    step: '2. Keswan',
    label: 'Keswan',
    caption: 'Kesehatan Hewan & Puskeswan',
    image: '/card-keswan.png',
    icon: Stethoscope,
    accent: '#0284c7',
  },
  {
    key: 'kesmavet',
    step: '3. Kesmavet',
    label: 'Kesmavet',
    caption: 'Kesehatan Masyarakat Veteriner',
    image: '/card-kesmavet.png',
    icon: FlaskConical,
    accent: '#4f46e5',
  },
] as const;

export default function LandingPage() {
  const router = useRouter();

  // ── 100% PURE DATABASE STATES (Semua dari MySQL) ──
  const [populasi16, setPopulasi16] = useState<{ komoditas: string; total: number }[]>([]);
  const [populasiTernak8, setPopulasiTernak8] = useState<{ komoditas: string; total: number }[]>([]);
  const [populasiUnggas8, setPopulasiUnggas8] = useState<{ komoditas: string; total: number }[]>([]);
  const [dagingList, setDagingList] = useState<{ jenis: string; total: number }[]>([]);
  const [telurList, setTelurList] = useState<{ jenis: string; total: number }[]>([]);
  const [sebaranFarmList, setSebaranFarmList] = useState<{ komoditas: string; jumlah_farm: number; total_populasi: string }[]>([]);
  const [puskeswanList, setPuskeswanList] = useState<any[]>([]);
  const [vaksinasiList, setVaksinasiList] = useState<any[]>([]);
  const [rphList, setRphList] = useState<any[]>([]);
  const [nkvList, setNkvList] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // State Auth Modal & Navigation
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dashboard state
  const [activeModule, setActiveModule] = useState<'bitpro' | 'keswan' | 'kesmavet'>('bitpro');
  const [detailView, setDetailView] = useState<string | null>(null);
  const [subTabProd, setSubTabProd] = useState<'populasi' | 'daging' | 'telur'>('populasi');
  const [expandedPuskeswanLayanan, setExpandedPuskeswanLayanan] = useState<number | null>(null);
  const [expandedTableLayanan, setExpandedTableLayanan] = useState<number | null>(null);
  const [searchVaksin, setSearchVaksin] = useState('');
  const [searchPuskeswan, setSearchPuskeswan] = useState('');
  const [puskeswanViewMode, setPuskeswanViewMode] = useState<'cards' | 'table'>('cards');

  // Form login
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── FETCH LANGSUNG 100% DATA REAL DARI DATABASE MYSQL ──
  useEffect(() => {
    const loadPortalData = async () => {
      try {
        setIsDataLoading(true);
        const res = await fetch('/api/portal-stats');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            setPopulasi16(d.populasi16 || []);
            setPopulasiTernak8(d.populasiTernak8 || []);
            setPopulasiUnggas8(d.populasiUnggas8 || []);
            setDagingList(d.dataDaging || []);
            setTelurList(d.dataTelur || []);
            setSebaranFarmList(d.sebaranFarm || []);
            setPuskeswanList(d.puskeswanList || []);
            setVaksinasiList(d.vaksinasiList || []);
            setRphList(d.rphList || []);
            setNkvList(d.nkvList || []);
          }
        }
      } catch (err) {
        console.error('Gagal memuat data portal dari database:', err);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadPortalData();
  }, []);

  // Cek sesi login
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.push('/beranda');
    };
    checkSession();
  }, [router]);

  // Handler Login Petugas
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

      // Fallback Supabase
      const formattedEmail = loginId.includes('@') ? loginId : `${loginId}@pkh.kebumenkab.go.id`;
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formattedEmail,
        password,
      });

      if (signInError) {
        setError('Akses ditolak. Periksa kembali ID Petugas/NIP atau kata sandi Anda.');
        setIsLoading(false);
      } else {
        router.push('/beranda');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan saat memproses login. Silakan coba kembali.');
      setIsLoading(false);
    }
  };

  // ── KALKULASI TOTAL STATISTIK DARI DATABASE SECARA OTOMATIS ──
  const totalPopulasi = useMemo(() => populasi16.reduce((sum, d) => sum + d.total, 0), [populasi16]);
  const totalDagingKg = useMemo(() => dagingList.reduce((sum, d) => sum + d.total, 0), [dagingList]);
  const totalTelurKg = useMemo(() => telurList.reduce((sum, d) => sum + d.total, 0), [telurList]);
  const totalFarm = useMemo(() => sebaranFarmList.reduce((sum, d) => sum + d.jumlah_farm, 0), [sebaranFarmList]);

  const totalTernakHewan = useMemo(() => populasiTernak8.reduce((sum, d) => sum + d.total, 0), [populasiTernak8]);
  const totalUnggas = useMemo(() => populasiUnggas8.reduce((sum, d) => sum + d.total, 0), [populasiUnggas8]);

  const dataProduksiDaging = useMemo(() => [...dagingList]
    .map((d) => ({ jenis: d.jenis, ton: d.total / 1000 }))
    .sort((a, b) => b.ton - a.ton), [dagingList]);

  const dataProduksiTelur = useMemo(() => [...telurList]
    .map((d) => ({ jenis: d.jenis, ton: d.total / 1000 }))
    .sort((a, b) => b.ton - a.ton), [telurList]);

  const totalProdDagingTon = totalDagingKg / 1000;
  const totalProdTelurTon = totalTelurKg / 1000;

  const maxTernak = populasiTernak8[0]?.total || 1;
  const maxUnggas = populasiUnggas8[0]?.total || 1;
  const maxDagingTon = dataProduksiDaging[0]?.ton || 1;
  const maxTelurTon = dataProduksiTelur[0]?.ton || 1;

  // 4 Kartu Metrik Sekunder Teratas (Dihitung Otomatis dari Database)
  const topUnggas = populasiUnggas8[0] || { komoditas: 'Unggas Terbesar', total: 0 };
  const topDaging = dataProduksiDaging[0] || { jenis: 'Daging Terbesar', ton: 0 };
  const topTelur = dataProduksiTelur[0] || { jenis: 'Telur Terbesar', ton: 0 };
  const sapiPotongPop = populasi16.find((x) => x.komoditas === 'Sapi Potong')?.total || 0;

  const filteredVaksinasi = vaksinasiList.filter((row: any) =>
    (row.desa || '').toLowerCase().includes(searchVaksin.toLowerCase()) ||
    (row.jenis || '').toLowerCase().includes(searchVaksin.toLowerCase())
  );

  const filteredPuskeswan = puskeswanList.filter((p: any) => {
    if (!searchPuskeswan) return true;
    const q = searchPuskeswan.toLowerCase();
    return (
      (p.nama || '').toLowerCase().includes(q) ||
      (p.wilayah || '').toLowerCase().includes(q) ||
      (p.koordinator || '').toLowerCase().includes(q) ||
      (p.kecamatan || []).some((kec: string) => (kec || '').toLowerCase().includes(q))
    );
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-900 font-sans p-0 sm:p-3 md:p-6 selection:bg-blue-600 selection:text-white flex flex-col items-center">
      
      {/* ─────────────────────────────────────────────
          MAIN DASHBOARD CONTAINER (Theme: Biru Putih)
      ───────────────────────────────────────────── */}
      <div className="max-w-[1360px] w-full mx-auto bg-white sm:rounded-3xl lg:rounded-[32px] shadow-sm sm:border sm:border-blue-100/80 overflow-hidden flex flex-col min-h-screen sm:min-h-[94vh]">
        
        {/* ─────────────────────────────────────────────
            1. TOPBAR / HEADER (Blue & White)
        ───────────────────────────────────────────── */}
        <header className="border-b border-blue-50/80 px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 flex items-center justify-between bg-white sticky top-0 z-30">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50/60 border border-blue-100 p-1 flex items-center justify-center shrink-0 shadow-2xs">
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
                <Landmark size={18} />
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-base sm:text-xl text-blue-600 tracking-tight">
                SiMantap
              </span>
              <div className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] sm:text-xs font-semibold">
                <span>Kebumen</span>
              </div>
            </div>
          </div>

          {/* Right Section: Desktop Nav Links & Action Buttons */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 ml-auto">
            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
              <a href="#ringkasan" className="hover:text-blue-600 transition-colors">
                Ringkasan Wilayah
              </a>
              <a href="#puskeswan" className="hover:text-blue-600 transition-colors">
                Puskeswan Aktif
              </a>
              <a href="#modul" className="hover:text-blue-600 transition-colors">
                Modul Data
              </a>
            </nav>

            {/* Right Action: Officer Login Button & Mobile Menu */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLoginModal(true)}
                className="h-9 sm:h-10 px-3.5 sm:px-5 rounded-full bg-blue-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-xs hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Masuk Petugas</span>
                <ArrowRight size={14} className="hidden xs:inline" />
              </button>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Buka Menu"
                className="md:hidden w-9 h-9 rounded-full border border-blue-100 bg-blue-50/50 text-slate-700 flex items-center justify-center active:bg-blue-100 cursor-pointer"
              >
                {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>
        </header>

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
            <a
              href="#puskeswan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2.5 text-sm font-semibold text-slate-800 hover:text-blue-600"
            >
              <Stethoscope size={16} className="text-blue-600" />
              <span>Puskeswan Aktif</span>
            </a>
            <a
              href="#modul"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2.5 text-sm font-semibold text-slate-800 hover:text-blue-600"
            >
              <Activity size={16} className="text-blue-600" />
              <span>Modul Data</span>
            </a>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            2. DASHBOARD BODY
        ───────────────────────────────────────────── */}
        <div className="p-3.5 sm:p-6 md:p-8 lg:p-9 space-y-6 sm:space-y-7 flex-1">
          
          {/* ── TOP HERO / STEP BANNER WITH ILLUSTRATED MODULE CARDS ── */}
          <section
            id="ringkasan"
            className="rounded-2xl sm:rounded-3xl border border-blue-100/90 bg-[#f8fbff] p-4 sm:p-6 lg:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xs"
          >
            <div className="max-w-md xl:max-w-lg">
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white border border-blue-200/80 text-[11px] sm:text-xs font-semibold text-blue-700 mb-2.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <span>Portal Resmi Dinas Pertanian dan Pangan Kebumen</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-snug mb-2">
                Satu Ekosistem untuk Data <span className="text-blue-600">Peternakan Kebumen</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">
                Sistem Informasi Manajemen Terpadu yang mengintegrasikan data Perbibitan &amp; Produksi (Bitpro), Kesehatan Hewan (Keswan), dan Kesehatan Masyarakat Veteriner (Kesmavet) langsung dari basis data resmi secara real-time.
              </p>
              
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-blue-700">
                <span>Pilih kartu modul untuk membuka data</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* ── KARTU MODUL BERGAMBAR (Bitpro, Keswan, Kesmavet) ── */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full lg:w-auto shrink-0 justify-items-center">
              {MODULES.map((mod) => (
                <div
                  key={mod.key}
                  onClick={() => {
                    setActiveModule(mod.key as any);
                    setDetailView(null);
                    scrollToSection('modul');
                  }}
                  className="group relative w-full max-w-[110px] xs:max-w-[130px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[170px] xl:max-w-[185px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer border border-slate-200/70 bg-white"
                >
                  <img
                    src={mod.image}
                    alt={`Kartu Modul ${mod.label}`}
                    className="w-full h-auto object-cover block transition-transform duration-300 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors pointer-events-none" />
                </div>
              ))}
            </div>
          </section>

          {/* ── SECTION 1: STAT CARDS (100% Dynamic MySQL Database) ── */}
          <section className="space-y-3.5 sm:space-y-4">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                    Ringkasan Wilayah (2025)
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Rekapitulasi live tersinkronisasi langsung dari database MySQL
                  </p>
                </div>
                <button
                  onClick={() => scrollToSection('puskeswan')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                  title="Lihat Unit Puskeswan Aktif"
                >
                  <Stethoscope size={13} className="text-sky-600" />
                  <span>{puskeswanList.length} Puskeswan Aktif</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setActiveModule('bitpro');
                  setDetailView('populasi');
                  scrollToSection('modul');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors self-start xs:self-auto cursor-pointer"
              >
                <span>Lihat Detail Sensus</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* 4 Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* Stat 1: Total Populasi */}
              <div
                onClick={() => {
                  setActiveModule('bitpro');
                  setDetailView('populasi');
                  setSubTabProd('populasi');
                  scrollToSection('modul');
                }}
                className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-200 hover:shadow-xs transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500 mb-1 truncate">
                    Total Populasi Ternak
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                    {isDataLoading ? (
                      <span className="inline-flex items-center gap-1 text-base text-slate-400 font-normal">
                        <Loader2 className="animate-spin" size={16} /> Memuat...
                      </span>
                    ) : (
                      totalPopulasi.toLocaleString('id-ID')
                    )}
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
                className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between gap-3 cursor-pointer hover:border-sky-200 hover:shadow-xs transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500 mb-1 truncate">
                    Produksi Daging
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                    {isDataLoading ? (
                      <span className="inline-flex items-center gap-1 text-base text-slate-400 font-normal">
                        <Loader2 className="animate-spin" size={16} /> Memuat...
                      </span>
                    ) : (
                      totalProdDagingTon.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                    )}
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
                className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-200 hover:shadow-xs transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500 mb-1 truncate">
                    Produksi Telur
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                    {isDataLoading ? (
                      <span className="inline-flex items-center gap-1 text-base text-slate-400 font-normal">
                        <Loader2 className="animate-spin" size={16} /> Memuat...
                      </span>
                    ) : (
                      totalProdTelurTon.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                    )}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-1 truncate">
                    Ton / tahun
                  </p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <PackageCheck size={22} />
                </div>
              </div>

              {/* Stat 4: Kelompok Tani Ternak */}
              <div
                onClick={() => {
                  setActiveModule('bitpro');
                  setDetailView('farm');
                  scrollToSection('modul');
                }}
                className="p-4 sm:p-5 rounded-2xl bg-[#f0f6ff] border border-blue-100 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-200 hover:shadow-xs transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500 mb-1 truncate">
                    Kelompok Tani Ternak (KTT)
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                    {isDataLoading ? (
                      <span className="inline-flex items-center gap-1 text-base text-slate-400 font-normal">
                        <Loader2 className="animate-spin" size={16} /> Memuat...
                      </span>
                    ) : (
                      `${totalFarm.toLocaleString('id-ID')} Unit`
                    )}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-1 truncate">
                    Poktan &amp; KTT terdaftar di database
                  </p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Building2 size={22} />
                </div>
              </div>

            </div>

            {/* 4 Secondary Metric Cards (Dihitung 100% Dinamis dari Database) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-blue-50 shadow-2xs">
                <p className="text-xs text-slate-500 font-medium truncate">{topUnggas.komoditas}</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mt-0.5 truncate">
                  {topUnggas.total.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Ekor · Unggas Terbanyak</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-blue-50 shadow-2xs">
                <p className="text-xs text-slate-500 font-medium truncate">{topDaging.jenis}</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mt-0.5 truncate">
                  {topDaging.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Ton Daging / Tahun</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-blue-50 shadow-2xs">
                <p className="text-xs text-slate-500 font-medium truncate">{topTelur.jenis}</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mt-0.5 truncate">
                  {topTelur.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Ton Telur / Tahun</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-blue-50 shadow-2xs">
                <p className="text-xs text-slate-500 font-medium truncate">Sapi Potong</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mt-0.5 truncate">
                  {sapiPotongPop.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Ekor Sapi Terdata</p>
              </div>
            </div>
          </section>

          {/* ── SECTION: DATA UNIT PUSKESWAN AKTIF (Dari Database) ── */}
          <section id="puskeswan" className="space-y-4 sm:space-y-5 scroll-mt-20">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-bold text-sky-700 mb-1">
                    <Stethoscope size={13} className="text-sky-600" />
                    <span>Cakupan Pelayanan Kesehatan Hewan Terpadu</span>
                  </div>
                  <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                    Data {puskeswanList.length} Unit Puskeswan Aktif Kabupaten Kebumen
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Rekapitulasi resmi cakupan kecamatan binaan, koordinator dokter hewan, dan pos pelayanan keliling (Pusling)
                  </p>
                </div>
              </div>

              <Link
                href="/keswan/puskeswan"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors self-start xs:self-auto"
              >
                <span>Buka Lembar Kerja Kinerja</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* 3 Stat Ringkasan Cards (Blue & White Theme) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Card 1: Total Unit */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3 shadow-2xs">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500 mb-1 truncate">Unit Puskeswan Aktif</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{puskeswanList.length} Unit</p>
                  <p className="text-[11px] sm:text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    100% Beroperasi Aktif
                  </p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 size={22} />
                </div>
              </div>

              {/* Card 2: Wilayah Binaan (Kecamatan) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between gap-3 shadow-2xs">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500 mb-1 truncate">Cakupan Wilayah</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">26 Kecamatan</p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1 truncate">
                    Seluruh Kab. Kebumen
                  </p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin size={22} />
                </div>
              </div>

              {/* Card 3: Tenaga Medik */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#f0f6ff] border border-blue-100 flex items-center justify-between gap-3 shadow-2xs">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500 mb-1 truncate">Koordinator Medik</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{puskeswanList.length} Dokter</p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1 truncate">
                    Dokter Hewan Binaan
                  </p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users size={22} />
                </div>
              </div>
            </div>

            {/* Search & View Switcher Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  value={searchPuskeswan}
                  onChange={(e) => setSearchPuskeswan(e.target.value)}
                  placeholder="Cari puskeswan, kecamatan binaan, atau dokter..."
                  className="w-full h-9 pl-9 pr-8 rounded-xl border border-blue-200/80 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
                {searchPuskeswan && (
                  <button
                    type="button"
                    onClick={() => setSearchPuskeswan('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-slate-500 font-medium mr-1 hidden xs:inline">
                  Menampilkan <span className="font-bold text-blue-700">{filteredPuskeswan.length}</span> dari {puskeswanList.length} unit
                </span>

                <div className="inline-flex rounded-xl border border-blue-100 bg-white p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPuskeswanViewMode('cards')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      puskeswanViewMode === 'cards'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    <LayoutGrid size={13} />
                    <span>Kartu Wilayah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPuskeswanViewMode('table')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      puskeswanViewMode === 'table'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    <List size={13} />
                    <span>Tabel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CARD GRID VIEW */}
            {puskeswanViewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPuskeswan.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                    Tidak ditemukan Puskeswan dengan kata kunci &quot;<span className="font-semibold text-slate-800">{searchPuskeswan}</span>&quot;
                  </div>
                ) : (
                  filteredPuskeswan.map((item: any, idx: number) => (
                    <div
                      key={item.no || idx}
                      className="rounded-2xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/20 p-4 sm:p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group space-y-4 shadow-2xs"
                    >
                      <div className="space-y-3">
                        {/* Card Top */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
                              {(idx + 1) < 10 ? `0${idx + 1}` : idx + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                                <span>{item.nama}</span>
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-semibold text-blue-700">
                                  <Stethoscope size={11} className="text-blue-600" />
                                  {item.koordinator}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {item.status || 'Aktif Melayani'}
                          </span>
                        </div>

                        {/* Wilayah Pelayanan Binaan */}
                        <div className="pt-2 border-t border-blue-50">
                          <p className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                            <MapPin size={12} className="text-sky-600" />
                            <span>Wilayah Pelayanan Binaan ({item.kecamatan?.length || 1} Kecamatan):</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(item.kecamatan || ['Kebumen']).map((kec: string) => (
                              <span
                                key={kec}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-blue-200/90 text-blue-900 shadow-2xs"
                              >
                                Kec. {kec}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Lokasi Google Maps */}
                        <div className="pt-2 border-t border-blue-50">
                          <p className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                            <Navigation size={12} className="text-emerald-600" />
                            <span>Lokasi Google Maps:</span>
                          </p>
                          <a
                            href={item.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-between gap-2 w-full px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/90 text-xs font-semibold transition-all group/map shadow-2xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover/map:scale-105 transition-transform">
                                <MapPin size={13} />
                              </div>
                              <span className="truncate">{item.alamat}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 shrink-0 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                              <span>Buka Maps</span>
                              <ExternalLink size={11} />
                            </span>
                          </a>
                        </div>
                      </div>

                      {/* Card Bottom: Dropdown Fasilitas & Layanan Medis */}
                      <div className="pt-3 border-t border-blue-50/80">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPuskeswanLayanan(
                              expandedPuskeswanLayanan === (item.no || idx + 1) ? null : (item.no || idx + 1)
                            )
                          }
                          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 transition-all text-left cursor-pointer group/drop shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover/drop:scale-105 transition-transform">
                              <Stethoscope size={13} />
                            </div>
                            <span className="text-xs font-bold text-slate-800 truncate">
                              Fasilitas &amp; Layanan Medis
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold shrink-0 hidden xs:inline">
                              {item.layanan?.length || 4}
                            </span>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full bg-white flex items-center justify-center text-blue-600 transition-transform duration-200 shadow-2xs shrink-0 ${
                              expandedPuskeswanLayanan === (item.no || idx + 1) ? 'rotate-180 bg-blue-600 text-white' : ''
                            }`}
                          >
                            <ChevronDown size={14} />
                          </div>
                        </button>

                        {/* Dropdown Menu Content */}
                        {expandedPuskeswanLayanan === (item.no || idx + 1) && (
                          <div className="mt-2 p-3 rounded-xl bg-slate-50/90 border border-blue-100 animate-in slide-in-from-top-2 duration-200 space-y-1.5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200/60 flex items-center justify-between">
                              <span>Daftar Layanan Medis:</span>
                              <span className="text-blue-600 font-semibold">{item.layanan?.length || 4} Layanan</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                              {(item.layanan || ['Pelayanan Klinik', 'Pusling', 'IB & PKB', 'Vaksinasi']).map((lay: string, layIdx: number) => (
                                <div
                                  key={layIdx}
                                  className="flex items-center gap-2 p-2 rounded-lg bg-white border border-blue-100/90 text-xs font-medium text-slate-800 shadow-2xs"
                                >
                                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                  <span className="truncate">{lay}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="overflow-x-auto rounded-xl border border-blue-100 shadow-2xs bg-white">
                <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                  <thead className="bg-blue-50/70 text-slate-700 font-semibold border-b border-blue-100">
                    <tr>
                      <th className="p-3 sm:p-3.5 w-12 text-center">NO</th>
                      <th className="p-3 sm:p-3.5">NAMA PUSKESWAN</th>
                      <th className="p-3 sm:p-3.5">WILAYAH PELAYANAN BINAAN</th>
                      <th className="p-3 sm:p-3.5">KOORDINATOR MEDIK</th>
                      <th className="p-3 sm:p-3.5">LOKASI GOOGLE MAPS</th>
                      <th className="p-3 sm:p-3.5">FASILITAS &amp; LAYANAN MEDIS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50/80 text-slate-800">
                    {filteredPuskeswan.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3 sm:p-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                              <Stethoscope size={14} />
                            </div>
                            <span>{row.nama}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {(row.kecamatan || ['Kebumen']).map((kec: string) => (
                              <span key={kec} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                                Kec. {kec}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            {row.koordinator}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <a
                            href={row.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all group/tabmap"
                          >
                            <MapPin size={13} className="text-emerald-600 group-hover/tabmap:scale-110 transition-transform" />
                            <span>Buka Maps</span>
                            <ExternalLink size={11} className="text-emerald-600" />
                          </a>
                        </td>
                        <td className="p-3.5">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedTableLayanan(
                                  expandedTableLayanan === (row.no || idx + 1) ? null : (row.no || idx + 1)
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all cursor-pointer"
                            >
                              <Stethoscope size={13} className="text-blue-600" />
                              <span>Fasilitas &amp; Layanan ({row.layanan?.length || 4})</span>
                              <ChevronDown
                                size={13}
                                className={`transition-transform duration-200 ${
                                  expandedTableLayanan === (row.no || idx + 1) ? 'rotate-180' : ''
                                }`}
                              />
                            </button>

                            {/* Table Dropdown Menu */}
                            {expandedTableLayanan === (row.no || idx + 1) && (
                              <div className="absolute right-0 top-full mt-1.5 w-64 p-3 rounded-xl bg-white border border-blue-200 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 space-y-1.5">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                                  <span>{row.nama}</span>
                                  <span className="text-blue-600 font-semibold">{row.layanan?.length || 4} Layanan</span>
                                </p>
                                <div className="space-y-1">
                                  {(row.layanan || ['Pelayanan Klinik', 'Pusling', 'IB & PKB', 'Vaksinasi']).map((lay: string, layIdx: number) => (
                                    <div
                                      key={layIdx}
                                      className="flex items-center gap-2 text-xs font-medium text-slate-800 py-1 px-1.5 rounded-lg bg-slate-50 border border-slate-100"
                                    >
                                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                      <span className="truncate">{lay}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </section>

          {/* ── SECTION 2: POPULASI HEWAN TERNAK & POPULASI UNGGAS (100% QUERY DATABASE) ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* 1. POPULASI HEWAN TERNAK */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100/80 bg-white shadow-2xs space-y-4 sm:space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] sm:text-[11px] font-bold text-blue-700">
                    <Activity size={12} />
                    <span>Ruminansia &amp; Non-Ruminansia</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-blue-600 bg-blue-50/70 px-2.5 py-0.5 rounded-md border border-blue-100">
                    Total: {totalTernakHewan.toLocaleString('id-ID')} Ekor
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Populasi Hewan Ternak
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Distribusi komoditas hewan ternak dari database MySQL (2025)
                </p>
              </div>

              {/* Vertical Bar Chart Container */}
              <div className="pt-5 pb-2 px-1 sm:px-2 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="grid grid-cols-8 gap-1 sm:gap-1.5 items-end h-48 sm:h-56">
                  {populasiTernak8.map((row, i) => {
                    const color = PALETTE_TERNAK[i % PALETTE_TERNAK.length];
                    const percent = row.total > 0 ? Math.max(12, Math.round((row.total / maxTernak) * 100)) : 4;

                    return (
                      <div key={row.komoditas} className="flex flex-col items-center justify-end h-full group relative min-w-0">
                        {/* Floating Value Pill */}
                        <div className="mb-1 text-center">
                          <span className={`inline-block px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${color.light} ${color.text} border ${color.border} shadow-2xs whitespace-nowrap`}>
                            {row.total >= 1000 ? `${(row.total / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}rb` : row.total.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Bar Column */}
                        <div className="w-full max-w-[24px] sm:max-w-[32px] bg-slate-200/60 rounded-t-lg flex flex-col justify-end p-0.5 overflow-hidden h-full">
                          <div
                            className={`w-full rounded-t-md bg-gradient-to-t ${color.gradient} transition-all duration-700 shadow-xs group-hover:brightness-110`}
                            style={{ height: `${percent}%` }}
                          />
                        </div>

                        {/* Label */}
                        <div className="mt-2 text-center flex flex-col items-center gap-0.5 w-full min-w-0">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight px-0.5" title={`${row.komoditas}: ${row.total.toLocaleString('id-ID')} Ekor`}>
                            {row.komoditas}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. POPULASI UNGGAS */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100/80 bg-white shadow-2xs space-y-4 sm:space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] sm:text-[11px] font-bold text-amber-700">
                    <BarChart3 size={12} />
                    <span>Komoditas Unggas</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-amber-600 bg-amber-50/70 px-2.5 py-0.5 rounded-md border border-amber-100">
                    Total: {totalUnggas.toLocaleString('id-ID')} Ekor
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Populasi Unggas
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Distribusi komoditas unggas dari database MySQL (2025)
                </p>
              </div>

              {/* Vertical Bar Chart Container */}
              <div className="pt-5 pb-2 px-1 sm:px-2 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="grid grid-cols-8 gap-1 sm:gap-1.5 items-end h-48 sm:h-56">
                  {populasiUnggas8.map((row, i) => {
                    const color = PALETTE_UNGGAS[i % PALETTE_UNGGAS.length];
                    const percent = row.total > 0 ? Math.max(12, Math.round((row.total / maxUnggas) * 100)) : 4;

                    return (
                      <div key={row.komoditas} className="flex flex-col items-center justify-end h-full group relative min-w-0">
                        {/* Floating Value Pill */}
                        <div className="mb-1 text-center">
                          <span className={`inline-block px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${color.light} ${color.text} border ${color.border} shadow-2xs whitespace-nowrap`}>
                            {row.total >= 1000000 ? `${(row.total / 1000000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}jt` : row.total >= 1000 ? `${(row.total / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}rb` : row.total.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Bar Column */}
                        <div className="w-full max-w-[24px] sm:max-w-[32px] bg-slate-200/60 rounded-t-lg flex flex-col justify-end p-0.5 overflow-hidden h-full">
                          <div
                            className={`w-full rounded-t-md bg-gradient-to-t ${color.gradient} transition-all duration-700 shadow-xs group-hover:brightness-110`}
                            style={{ height: `${percent}%` }}
                          />
                        </div>

                        {/* Label */}
                        <div className="mt-2 text-center flex flex-col items-center gap-0.5 w-full min-w-0">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight px-0.5" title={`${row.komoditas}: ${row.total.toLocaleString('id-ID')} Ekor`}>
                            {row.komoditas}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. PRODUKSI DAGING */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-sky-100/80 bg-white shadow-2xs space-y-4 sm:space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] sm:text-[11px] font-bold text-rose-700">
                    <TrendingUp size={12} />
                    <span>Hasil Ternak Potong</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-rose-600 bg-rose-50/70 px-2.5 py-0.5 rounded-md border border-rose-100">
                    Total: {totalProdDagingTon.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ton
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Produksi Daging
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Realisasi produksi daging ternak &amp; unggas dari database (2025)
                </p>
              </div>

              {/* Vertical Bar Chart Container */}
              <div className="pt-5 pb-2 px-1 sm:px-2 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="grid grid-cols-6 gap-1.5 sm:gap-2 items-end h-48 sm:h-56">
                  {dataProduksiDaging.map((row, i) => {
                    const color = PALETTE_DAGING[i % PALETTE_DAGING.length];
                    const percent = row.ton > 0 ? Math.max(12, Math.round((row.ton / maxDagingTon) * 100)) : 4;

                    return (
                      <div key={row.jenis} className="flex flex-col items-center justify-end h-full group relative min-w-0">
                        {/* Floating Value Pill */}
                        <div className="mb-1 text-center">
                          <span className={`inline-block px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${color.light} ${color.text} border ${color.border} shadow-2xs whitespace-nowrap`}>
                            {row.ton >= 100 ? `${Math.round(row.ton).toLocaleString('id-ID')} Ton` : `${row.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ton`}
                          </span>
                        </div>

                        {/* Bar Column */}
                        <div className="w-full max-w-[30px] sm:max-w-[42px] bg-slate-200/60 rounded-t-lg flex flex-col justify-end p-0.5 overflow-hidden h-full">
                          <div
                            className={`w-full rounded-t-md bg-gradient-to-t ${color.gradient} transition-all duration-700 shadow-xs group-hover:brightness-110`}
                            style={{ height: `${percent}%` }}
                          />
                        </div>

                        {/* Label */}
                        <div className="mt-2 text-center flex flex-col items-center gap-0.5 w-full min-w-0">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight px-0.5" title={`${row.jenis}: ${row.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Ton`}>
                            {row.jenis}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. PRODUKSI TELUR */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-100/80 bg-white shadow-2xs space-y-4 sm:space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] sm:text-[11px] font-bold text-amber-700">
                    <PackageCheck size={12} />
                    <span>Hasil Ternak Petelur</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-amber-600 bg-amber-50/70 px-2.5 py-0.5 rounded-md border border-amber-100">
                    Total: {totalProdTelurTon.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ton
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Produksi Telur
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Realisasi produksi telur unggas petelur dari database (2025)
                </p>
              </div>

              {/* Vertical Bar Chart Container */}
              <div className="pt-5 pb-2 px-1 sm:px-2 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="grid grid-cols-5 gap-2 sm:gap-3 items-end h-48 sm:h-56">
                  {dataProduksiTelur.map((row, i) => {
                    const color = PALETTE_TELUR[i % PALETTE_TELUR.length];
                    const percent = row.ton > 0 ? Math.max(12, Math.round((row.ton / maxTelurTon) * 100)) : 4;

                    return (
                      <div key={row.jenis} className="flex flex-col items-center justify-end h-full group relative min-w-0">
                        {/* Floating Value Pill */}
                        <div className="mb-1 text-center">
                          <span className={`inline-block px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${color.light} ${color.text} border ${color.border} shadow-2xs whitespace-nowrap`}>
                            {row.ton >= 100 ? `${Math.round(row.ton).toLocaleString('id-ID')} Ton` : `${row.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ton`}
                          </span>
                        </div>

                        {/* Bar Column */}
                        <div className="w-full max-w-[34px] sm:max-w-[48px] bg-slate-200/60 rounded-t-lg flex flex-col justify-end p-0.5 overflow-hidden h-full">
                          <div
                            className={`w-full rounded-t-md bg-gradient-to-t ${color.gradient} transition-all duration-700 shadow-xs group-hover:brightness-110`}
                            style={{ height: `${percent}%` }}
                          />
                        </div>

                        {/* Label */}
                        <div className="mt-2 text-center flex flex-col items-center gap-0.5 w-full min-w-0">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight px-0.5" title={`${row.jenis}: ${row.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Ton`}>
                            {row.jenis}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </section>

          {/* ── SECTION 3: OPERATIONS / SERVICE CARDS (Blue & White Theme) ── */}
          <section id="modul" className="space-y-3.5 sm:space-y-4 scroll-mt-20">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                  Modul Pelayanan &amp; Layanan Data
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Akses cepat informasi sektoral, kelompok ternak, kesehatan hewan, dan veteriner
                </p>
              </div>

              {detailView && (
                <button
                  onClick={() => setDetailView(null)}
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-xl border border-slate-200 bg-white transition-colors self-start xs:self-auto shadow-2xs cursor-pointer"
                >
                  ← Kembali ke Ringkasan
                </button>
              )}
            </div>

            {/* Dynamic Content: Detail Table View or Service Grid */}
            {detailView ? (
              <div className="rounded-2xl sm:rounded-3xl border border-blue-100 bg-white p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 sm:space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-50">
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-slate-900">
                      {detailView === 'populasi' && 'Data Lengkap Sensus Populasi & Produksi Ternak'}
                      {detailView === 'farm' && 'Data Kelompok Tani Ternak (KTT) & Poktan Terdaftar'}
                      {detailView === 'puskeswan' && 'Ringkasan Wilayah & Data Unit Puskeswan Aktif'}
                      {detailView === 'vaksinasi' && 'Data Realisasi Vaksinasi PMK & LSD Kabupaten Kebumen'}
                      {detailView === 'rph_tph' && 'Data RPH & TPH/TPU Terbina'}
                      {detailView === 'nkv' && 'Data Sertifikasi Nomor Kontrol Veteriner (NKV)'}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Tersinkronisasi 100% dengan basis data Dinas Pertanian dan Pangan Kebumen
                    </p>
                  </div>

                  <button
                    onClick={() => setDetailView(null)}
                    className="h-8 sm:h-9 px-3.5 rounded-xl border border-blue-100 bg-blue-50/50 text-xs font-bold text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
                  >
                    ← Kembali
                  </button>
                </div>

                {/* Subtabs for Populasi */}
                {detailView === 'populasi' && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      { key: 'populasi', label: 'Populasi Ternak' },
                      { key: 'daging', label: 'Produksi Daging' },
                      { key: 'telur', label: 'Produksi Telur' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setSubTabProd(tab.key as any)}
                        className={`h-7 sm:h-8 px-3 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                          subTabProd === tab.key
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'border border-blue-100 bg-blue-50/40 text-slate-600 hover:text-blue-600'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Bar for Vaksinasi */}
                {detailView === 'vaksinasi' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        type="text"
                        value={searchVaksin}
                        onChange={(e) => setSearchVaksin(e.target.value)}
                        placeholder="Cari nama puskeswan..."
                        className="w-full h-9 pl-9 pr-8 rounded-xl border border-blue-200/80 bg-blue-50/30 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      {searchVaksin && (
                        <button
                          type="button"
                          onClick={() => setSearchVaksin('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          title="Hapus pencarian"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 self-end sm:self-auto font-medium">
                      Menampilkan <span className="font-bold text-blue-700">{filteredVaksinasi.length}</span> unit
                    </div>
                  </div>
                )}

                {/* Table Layout for detail views */}
                <div className="overflow-x-auto rounded-xl border border-blue-100 shadow-2xs">
                  {detailView === 'populasi' && subTabProd === 'populasi' && (
                    <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                      <thead className="bg-blue-50/70 text-slate-700 font-semibold border-b border-blue-100">
                        <tr>
                          <th className="p-3 sm:p-3.5 w-12 sm:w-14 text-center">NO</th>
                          <th className="p-3 sm:p-3.5">KOMODITAS TERNAK</th>
                          <th className="p-3 sm:p-3.5 text-right font-semibold">TOTAL POPULASI (2025)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50/80 text-slate-800">
                        {populasi16.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3 sm:p-3.5 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-3.5 font-bold text-slate-900">{row.komoditas}</td>
                            <td className="p-3.5 text-right font-bold text-blue-600">
                              {row.total.toLocaleString('id-ID')} Ekor
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {detailView === 'populasi' && subTabProd === 'daging' && (
                    <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                      <thead className="bg-blue-50/70 text-slate-700 font-semibold border-b border-blue-100">
                        <tr>
                          <th className="p-3 sm:p-3.5 w-12 sm:w-14 text-center">NO</th>
                          <th className="p-3 sm:p-3.5">JENIS TERNAK POTONG</th>
                          <th className="p-3 sm:p-3.5 text-right font-semibold">TOTAL PRODUKSI DAGING (2025)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50/80 text-slate-800">
                        {dagingList.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3 sm:p-3.5 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-3.5 font-bold text-slate-900">{row.jenis}</td>
                            <td className="p-3.5 text-right font-bold text-blue-600">
                              {(row.total / 1000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Ton
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {detailView === 'populasi' && subTabProd === 'telur' && (
                    <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                      <thead className="bg-blue-50/70 text-slate-700 font-semibold border-b border-blue-100">
                        <tr>
                          <th className="p-3 sm:p-3.5 w-12 sm:w-14 text-center">NO</th>
                          <th className="p-3 sm:p-3.5">KOMODITAS UNGGAS PETELUR</th>
                          <th className="p-3 sm:p-3.5 text-right font-semibold">TOTAL PRODUKSI TELUR (2025)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50/80 text-slate-800">
                        {telurList.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3 sm:p-3.5 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-3.5 font-bold text-slate-900">{row.jenis}</td>
                            <td className="p-3.5 text-right font-bold text-blue-600">
                              {(row.total / 1000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Ton
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {detailView === 'farm' && (
                    <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                      <thead className="bg-blue-50/70 text-slate-700 font-semibold border-b border-blue-100">
                        <tr>
                          <th className="p-3 sm:p-3.5 w-12 sm:w-14 text-center">NO</th>
                          <th className="p-3 sm:p-3.5">JENIS KELOMPOK TERNAK</th>
                          <th className="p-3.5 text-center font-semibold">JUMLAH KELOMPOK</th>
                          <th className="p-3.5 text-right font-semibold">TOTAL ANGGOTA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50/80 text-slate-800">
                        {sebaranFarmList.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3.5 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-3.5 font-bold text-slate-900">{row.komoditas}</td>
                            <td className="p-3.5 text-center font-bold text-slate-900">{row.jumlah_farm.toLocaleString('id-ID')} Kelompok</td>
                            <td className="p-3.5 text-right font-bold text-blue-600">
                              {row.total_populasi}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* 3. DATA VAKSINASI PMK & LSD */}
                  {detailView === 'vaksinasi' && (
                    <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                      <thead className="bg-blue-50/70 text-slate-700 font-semibold border-b border-blue-100">
                        <tr>
                          <th className="p-3 sm:p-3.5 w-12 sm:w-14 text-center">NO</th>
                          <th className="p-3 sm:p-3.5">NAMA PUSKESWAN</th>
                          <th className="p-3 sm:p-3.5 text-center">PROGRAM VAKSINASI</th>
                          <th className="p-3.5 text-center">TARGET DOSIS</th>
                          <th className="p-3.5 text-center">REALISASI DOSIS</th>
                          <th className="p-3.5 text-right">CAPAIAN (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50/80 text-slate-800">
                        {filteredVaksinasi.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-3.5 font-bold text-slate-900">{row.desa}</td>
                            <td className="p-3.5 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                {row.jenis}
                              </span>
                            </td>
                            <td className="p-3.5 text-center text-slate-600">{Number(row.target).toLocaleString('id-ID')} Dosis</td>
                            <td className="p-3.5 text-center font-bold text-slate-900">{Number(row.realisasi).toLocaleString('id-ID')} Dosis</td>
                            <td className="p-3.5 text-right font-bold text-emerald-600">
                              {row.persen}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* 4. DATA RPH & TPH TERBINA */}
                  {detailView === 'rph_tph' && (
                    <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                      <thead className="bg-blue-50/70 text-slate-700 font-semibold border-b border-blue-100">
                        <tr>
                          <th className="p-3 sm:p-3.5 w-12 sm:w-14 text-center">NO</th>
                          <th className="p-3 sm:p-3.5">NAMA TEMPAT / USAHA</th>
                          <th className="p-3 sm:p-3.5 text-center">JENIS</th>
                          <th className="p-3 sm:p-3.5">PEMILIK</th>
                          <th className="p-3 sm:p-3.5">LOKASI DESA/KECAMATAN</th>
                          <th className="p-3 sm:p-3.5 text-right font-semibold">SERTIFIKAT HALAL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50/80 text-slate-800">
                        {rphList.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3 sm:p-3.5 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                              <Building2 size={15} className="text-indigo-600 shrink-0" />
                              <span>{row.nama}</span>
                            </td>
                            <td className="p-3.5 text-center">
                              <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                                {row.jenis}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-700">{row.pemilik}</td>
                            <td className="p-3.5 text-slate-600">{row.desa}</td>
                            <td className="p-3.5 text-right">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                  row.halal.includes('Sudah')
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {row.halal}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* 5. DATA SERTIFIKASI NKV */}
                  {detailView === 'nkv' && (
                    <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                      <thead className="bg-blue-50/70 text-slate-700 font-semibold border-b border-blue-100">
                        <tr>
                          <th className="p-3 sm:p-3.5 w-12 sm:w-14 text-center">NO</th>
                          <th className="p-3 sm:p-3.5">NAMA USAHA / PT</th>
                          <th className="p-3 sm:p-3.5">BIDANG USAHA</th>
                          <th className="p-3 sm:p-3.5">KETERANGAN / REKOMENDASI</th>
                          <th className="p-3 sm:p-3.5 text-right font-semibold">STATUS NKV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50/80 text-slate-800">
                        {nkvList.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3 sm:p-3.5 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                              <span>{row.nama_pt}</span>
                            </td>
                            <td className="p-3.5 text-slate-700 font-medium">{row.jenis_usaha}</td>
                            <td className="p-3.5 text-slate-600">{row.alamat}</td>
                            <td className="p-3.5 text-right">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                  row.status_nkv.includes('Terbit')
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {row.status_nkv}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : (
              /* Service Cards Grid (Blue & White Palette) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                
                {/* 1. Sensus Populasi */}
                <div
                  onClick={() => {
                    setActiveModule('bitpro');
                    setDetailView('populasi');
                    setSubTabProd('populasi');
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl border border-blue-100/90 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Activity size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 truncate">Populasi &amp; Produksi</p>
                    <p className="text-xs text-slate-400 truncate">{populasi16.length} komoditas ternak</p>
                  </div>
                </div>

                {/* 2. Sebaran Data Farm / KTT */}
                <div
                  onClick={() => {
                    setActiveModule('bitpro');
                    setDetailView('farm');
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl border border-blue-100/90 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 truncate">Kelompok Tani Ternak (KTT)</p>
                    <p className="text-xs text-slate-400 truncate">{totalFarm.toLocaleString('id-ID')} unit kelompok terdata</p>
                  </div>
                </div>

                {/* 3. Puskeswan Aktif */}
                <div
                  onClick={() => {
                    setActiveModule('keswan');
                    setDetailView(null);
                    scrollToSection('puskeswan');
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl border border-blue-100/90 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Stethoscope size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 truncate">Puskeswan Aktif</p>
                    <p className="text-xs text-slate-400 truncate">{puskeswanList.length} unit pelayanan 26 kecamatan</p>
                  </div>
                </div>

                {/* 4. Vaksinasi PMK */}
                <div
                  onClick={() => {
                    setActiveModule('keswan');
                    setDetailView('vaksinasi');
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl border border-blue-100/90 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Syringe size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 truncate">Vaksinasi PMK &amp; LSD</p>
                    <p className="text-xs text-slate-400 truncate">{vaksinasiList.length} unit wilayah capaian</p>
                  </div>
                </div>

                {/* 5. RPH & TPH */}
                <div
                  onClick={() => {
                    setActiveModule('kesmavet');
                    setDetailView('rph_tph');
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl border border-blue-100/90 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 truncate">RPH &amp; TPU/TPH Terbina</p>
                    <p className="text-xs text-slate-400 truncate">{rphList.length} unit usaha terdaftar</p>
                  </div>
                </div>

                {/* 6. Sertifikasi NKV */}
                <div
                  onClick={() => {
                    setActiveModule('kesmavet');
                    setDetailView('nkv');
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl border border-blue-100/90 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 truncate">Sertifikasi NKV</p>
                    <p className="text-xs text-slate-400 truncate">{nkvList.length} unit usaha ASUH</p>
                  </div>
                </div>

              </div>
            )}
          </section>

        </div>

        {/* ─────────────────────────────────────────────
            3. FOOTER (Clean Blue & White)
        ───────────────────────────────────────────── */}
        <footer className="border-t border-blue-50 py-5 sm:py-6 px-4 sm:px-8 lg:px-9 text-xs text-slate-500 bg-white mt-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <span className="font-bold text-blue-600">SiMantap</span>
            <span>·</span>
            <span>Dinas Pertanian dan Pangan Kabupaten Kebumen</span>
          </div>
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} Bidang Peternakan dan Kesehatan Hewan Kebumen.
          </p>
        </footer>

      </div>

      {/* ─────────────────────────────────────────────
          4. MODAL LOGIN PETUGAS (Blue & White Theme)
      ───────────────────────────────────────────── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-blue-100 bg-white p-5 sm:p-8 relative shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setShowLoginModal(false)}
              aria-label="Tutup jendela login"
              className="w-9 h-9 rounded-full border border-blue-100 bg-blue-50/50 text-slate-400 hover:text-blue-600 absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="mb-5 sm:mb-6 text-left">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Masuk Sistem SiMantap
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan ID Petugas / NIP / Username dan kata sandi Anda
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ID Petugas / NIP / Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: superadmin / 19800101... / nama@dinas.go.id"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-blue-100 bg-blue-50/30 text-sm font-sans outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-3.5 pr-11 rounded-xl border border-blue-100 bg-blue-50/30 text-sm font-sans outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    className="w-10 h-10 absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 mt-5 shadow-xs hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Masuk ke Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                Sistem Informasi Manajemen Peternakan Terpadu &bull; Distapang Kebumen
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}