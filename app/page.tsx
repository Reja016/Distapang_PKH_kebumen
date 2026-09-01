'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  Building2,
  Users,
  FileCheck2,
  Stethoscope,
  Syringe,
  CheckCircle2,
  Layers,
  Sparkles,
  Lock,
  Activity,
  Award,
  Calendar,
  FolderKanban,
  FileText,
  TrendingUp,
  PackageCheck,
  FlaskConical,
  Flame,
  Ambulance,
  Compass,
  Landmark,
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

const TOP_KOMODITAS = [...REKAP_POPULASI_2025].filter((d) => d.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);
const TOP_DAGING = [...dataDaging].sort((a, b) => b.total - a.total).slice(0, 5);
const TOP_TELUR = [...dataTelur].sort((a, b) => b.total - a.total).slice(0, 5);

const TOTAL_POPULASI = REKAP_POPULASI_2025.reduce((sum, d) => sum + d.total, 0);
const TOTAL_DAGING = dataDaging.reduce((sum, d) => sum + d.total, 0);
const TOTAL_TELUR = dataTelur.reduce((sum, d) => sum + d.total, 0);
const TOTAL_FARM = REKAP_SEBARAN_FARM.reduce((sum, d) => sum + d.jumlah_farm, 0);

const METRIC_CONFIGS = {
  populasi: {
    label: 'Populasi Ternak',
    unit: 'Ekor',
    data: TOP_KOMODITAS,
    max: TOP_KOMODITAS[0]?.total ?? 1,
    getName: (r: any) => r.komoditas,
    barColor: '#38E54D',
  },
  daging: {
    label: 'Produksi Daging',
    unit: 'Kg',
    data: TOP_DAGING,
    max: TOP_DAGING[0]?.total ?? 1,
    getName: (r: any) => r.jenis,
    barColor: '#2192FF',
  },
  telur: {
    label: 'Produksi Telur',
    unit: 'Kg',
    data: TOP_TELUR,
    max: TOP_TELUR[0]?.total ?? 1,
    getName: (r: any) => r.jenis,
    barColor: '#EAB308',
  },
} as const;

const MODULES = [
  {
    key: 'bitpro',
    label: 'Bitpro',
    caption: 'Perbibitan & Produksi Ternak',
    icon: Activity,
    accent: '#059669',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    key: 'keswan',
    label: 'Keswan',
    caption: 'Kesehatan Hewan & Puskeswan',
    icon: Stethoscope,
    accent: '#2563eb',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    key: 'kesmavet',
    label: 'Kesmavet',
    caption: 'Kesehatan Masyarakat Veteriner',
    icon: FlaskConical,
    accent: '#7c3aed',
    badge: 'bg-purple-50 text-purple-800 border-purple-200',
  },
] as const;

export default function LandingPage() {
  // Navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dashboard state
  const [activeModule, setActiveModule] = useState<'bitpro' | 'keswan' | 'kesmavet'>('bitpro');
  const [detailView, setDetailView] = useState<string | null>(null);
  const [subTabProd, setSubTabProd] = useState<'populasi' | 'daging' | 'telur'>('populasi');
  const [rankedMetric, setRankedMetric] = useState<keyof typeof METRIC_CONFIGS>('populasi');

  const activeMod = MODULES.find((m) => m.key === activeModule)!;
  const cfg = METRIC_CONFIGS[rankedMetric];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-azure selection:text-white">
      
      {/* ─────────────────────────────────────────────
          1. TOP NAVIGATION (Lega & Bernapas)
      ───────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shadow-xs shrink-0">
              <img
                src="/logo-simantap.png"
                alt="Logo SiMantap"
                className="w-full h-full object-contain"
                onError={(e: any) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden text-azure items-center justify-center">
                <Landmark size={22} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-azure">
                  SiMantap
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 uppercase tracking-wider">
                  Kebumen
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block leading-none mt-1">
                Sistem Informasi Manajemen Peternakan Terpadu
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#ringkasan" className="hover:text-azure transition-colors py-2">
              Ringkasan Wilayah
            </a>
            <a href="#modul" className="hover:text-azure transition-colors py-2">
              Modul Data
            </a>
            <a href="#bantuan" className="hover:text-azure transition-colors py-2">
              Bantuan Akses
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="min-h-touch h-11 px-5 sm:px-6 rounded-xl bg-azure text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs hover:bg-azure/90 active:scale-[0.98] transition-all"
            >
              <span>Masuk Petugas</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/login"
              className="min-h-touch h-10 px-4 rounded-xl bg-azure text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <span>Masuk</span>
              <ArrowRight size={14} />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Buka Menu"
              className="min-h-touch min-w-touch w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-6 py-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <a
              href="#ringkasan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-bold text-slate-800 hover:text-azure"
            >
              <BarChart3 size={16} className="text-azure" />
              <span>Ringkasan Wilayah</span>
            </a>
            <a
              href="#modul"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-bold text-slate-800 hover:text-azure"
            >
              <FolderKanban size={16} className="text-vitality" />
              <span>Modul Data</span>
            </a>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-bold text-azure hover:underline"
            >
              <ShieldCheck size={16} className="text-azure" />
              <span>Masuk Petugas Dinas</span>
            </Link>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────── */}
      <section id="ringkasan" className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pt-44 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Kicker Badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-vitality animate-pulse shrink-0" />
            <span>Portal Resmi Bidang Peternakan & Kesehatan Hewan Kebumen</span>
          </div>
        </div>

        {/* Editorial Headline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.18] mb-5">
            Satu Ekosistem untuk Data <br className="hidden sm:inline" />
            <span className="text-azure">Peternakan Kebumen</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl mx-auto font-normal text-slate-600 text-justify sm:text-center">
            Sistem Informasi Manajemen Terpadu yang mengintegrasikan data Perbibitan &amp; Produksi (Bitpro), Kesehatan Hewan (Keswan), dan Kesehatan Masyarakat Veteriner (Kesmavet) secara akurat, transparan, dan terbuka.
          </p>
        </div>

        {/* Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link
            href="/login"
            className="w-full sm:w-auto min-h-touch h-12 px-7 rounded-xl bg-azure text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-azure/90 active:scale-[0.98] transition-all"
          >
            <span>Masuk ke Dashboard Dinas</span>
            <ArrowRight size={16} />
          </Link>
          
          <a
            href="#modul"
            className="w-full sm:w-auto min-h-touch h-12 px-6 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>Eksplorasi Data Publik</span>
            <ChevronRight size={16} />
          </a>
        </div>

        {/* ─────────────────────────────────────────────
            3. ASYMMETRIC BENTO KPI CARDS
        ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          
          {/* Stat 1: Total Ternak */}
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Activity size={20} />
              </div>
              <span className="text-xs font-sans font-semibold font-semibold px-2.5 py-0.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800">
                TAHUN 2025
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Total Populasi Ternak
            </p>
            <p className="font-sans font-semibold text-2xl sm:text-3xl font-bold text-vitality tracking-tight">
              {TOTAL_POPULASI.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-sans font-semibold">Ekor di seluruh Kebumen</p>
          </div>

          {/* Stat 2: Produksi Daging */}
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-azure flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <span className="text-xs font-sans font-semibold font-semibold px-2.5 py-0.5 rounded-md border border-blue-200 bg-blue-50 text-blue-800">
                PRODUKSI
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Produksi Daging
            </p>
            <p className="font-sans font-semibold text-2xl sm:text-3xl font-bold text-azure tracking-tight">
              {Math.round(TOTAL_DAGING).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-sans font-semibold">Kilogram / tahun</p>
          </div>

          {/* Stat 3: Produksi Telur */}
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <PackageCheck size={20} />
              </div>
              <span className="text-xs font-sans font-semibold font-semibold px-2.5 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-amber-900">
                UNGGAS
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Produksi Telur
            </p>
            <p className="font-sans font-semibold text-2xl sm:text-3xl font-bold text-amber-600 tracking-tight">
              {Math.round(TOTAL_TELUR).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-sans font-semibold">Kilogram / tahun</p>
          </div>

          {/* Stat 4: Sebaran Farm */}
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-800 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <span className="text-xs font-sans font-semibold font-semibold px-2.5 py-0.5 rounded-md border border-lime-200 bg-lime-50 text-lime-900">
                TERVERIFIKASI
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Sebaran Data Farm
            </p>
            <p className="font-sans font-semibold text-2xl sm:text-3xl font-bold text-lime tracking-tight">
              {TOTAL_FARM} Unit
            </p>
            <p className="text-xs text-slate-500 mt-1 font-sans font-semibold">Peternakan terdata</p>
          </div>

        </div>

      </section>

      {/* ─────────────────────────────────────────────
          4. MODUL EXPLORER PANEL
      ───────────────────────────────────────────── */}
      <section id="modul" className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-azure mb-1 block">
              Eksplorasi Data Terpadu
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-slate-900">
              Modul Pelayanan & Laporan
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Pilih modul untuk melihat rekapitulasi data publik atau klik kartu di bawah untuk rincian data.
          </p>
        </div>

        {/* Tab Buttons (Touch Target >= 48px) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          {MODULES.map((mod) => {
            const isActive = activeModule === mod.key;
            return (
              <button
                key={mod.key}
                onClick={() => {
                  setActiveModule(mod.key as any);
                  setDetailView(null);
                }}
                className={`min-h-touch-lg h-14 sm:h-16 px-3 sm:px-5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-white border-azure text-slate-900 shadow-sm ring-2 ring-azure/20'
                    : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border shrink-0 ${isActive ? 'border-azure ring-2 ring-azure/30 shadow-xs' : 'border-slate-200'}`}>
                  <img
                    src={`/images/modules/${mod.key}.jpg`}
                    alt={mod.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 hidden sm:block">
                  <p className="font-bold text-sm leading-tight truncate">{mod.label}</p>
                  <p className="text-xs truncate text-slate-500">{mod.caption}</p>
                </div>
                <div className="sm:hidden text-center w-full">
                  <p className="font-bold text-xs truncate">{mod.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Panel Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
          
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                <img
                  src={`/images/modules/${activeMod.key}.jpg`}
                  alt={activeMod.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-sans text-lg sm:text-xl font-bold text-slate-900">
                {activeMod.label} — {activeMod.caption}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-sans font-semibold uppercase px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                Pratinjau Publik
              </span>
            </div>
          </div>

          {/* Conditional Content: Detail View vs Dashboard Summary */}
          {detailView ? (
            /* DETAIL TABLE VIEW */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">
                    {detailView === 'populasi' && 'Data Lengkap Populasi & Produksi Ternak'}
                    {detailView === 'farm' && 'Sebaran Data Farm Peternakan Kebumen'}
                    {detailView === 'ktt' && 'Database Kelompok Tani Ternak (KTT)'}
                    {detailView === 'sklb' && 'Surat Keterangan Layak Bibit (SKLB)'}
                    {detailView === 'keswan_info' && 'Informasi Puskeswan & Vaksinasi'}
                    {detailView === 'kesmavet_info' && 'Data Usaha & Sertifikasi Halal'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tersinkronisasi dengan basis data Dinas Pertanian dan Pangan Kebumen
                  </p>
                </div>

                <button
                  onClick={() => setDetailView(null)}
                  className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2 self-start sm:self-auto transition-colors"
                >
                  ← Kembali ke Ringkasan
                </button>
              </div>

              {/* Subtabs for Populasi */}
              {detailView === 'populasi' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { key: 'populasi', label: 'Populasi Ternak' },
                    { key: 'daging', label: 'Produksi Daging' },
                    { key: 'telur', label: 'Produksi Telur' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSubTabProd(tab.key as any)}
                      className={`min-h-touch h-9 px-3.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                        subTabProd === tab.key
                          ? 'bg-azure text-white border-azure shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Table Container */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                {detailView === 'populasi' && subTabProd === 'populasi' && (
                  <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 w-14 text-center">NO</th>
                        <th className="p-3.5">KOMODITAS TERNAK</th>
                        <th className="p-3.5 text-right font-sans font-semibold">TOTAL POPULASI (2025)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {REKAP_POPULASI_2025.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 text-center font-sans font-semibold text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-slate-900">
                            {row.komoditas}
                          </td>
                          <td className="p-3.5 text-right font-bold text-vitality">
                            {row.total.toLocaleString('id-ID')} Ekor
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {detailView === 'populasi' && subTabProd === 'daging' && (
                  <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 w-14 text-center">NO</th>
                        <th className="p-3.5">JENIS TERNAK POTONG</th>
                        <th className="p-3.5 text-right font-sans font-semibold">TOTAL PRODUKSI DAGING (2025)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {dataDaging.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 text-center font-sans font-semibold text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-slate-900">{row.jenis}</td>
                          <td className="p-3.5 text-right font-bold text-azure">
                            {row.total.toLocaleString('id-ID')} Kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {detailView === 'populasi' && subTabProd === 'telur' && (
                  <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 w-14 text-center">NO</th>
                        <th className="p-3.5">KOMODITAS UNGGAS PETELUR</th>
                        <th className="p-3.5 text-right font-sans font-semibold">TOTAL PRODUKSI TELUR (2025)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {dataTelur.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 text-center font-sans font-semibold text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-slate-900">{row.jenis}</td>
                          <td className="p-3.5 text-right font-bold text-amber-600">
                            {row.total.toLocaleString('id-ID')} Kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {detailView === 'farm' && (
                  <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 w-14 text-center">NO</th>
                        <th className="p-3.5">KOMODITAS FARM</th>
                        <th className="p-3.5 text-center font-sans font-semibold">JUMLAH FARM</th>
                        <th className="p-3.5 text-right font-sans font-semibold">TOTAL KAPASITAS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {REKAP_SEBARAN_FARM.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 text-center font-sans font-semibold text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-slate-900">{row.komoditas}</td>
                          <td className="p-3.5 text-center font-bold text-slate-900">{row.jumlah_farm} Unit</td>
                          <td className="p-3.5 text-right font-bold text-lime">
                            {row.total_populasi}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {(detailView === 'ktt' || detailView === 'sklb' || detailView === 'keswan_info' || detailView === 'kesmavet_info') && (
                  <div className="py-12 px-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-azure/10 border border-azure/30 text-azure flex items-center justify-center mx-auto text-xl">
                      <Lock size={22} />
                    </div>
                    <h5 className="font-bold text-base text-slate-900">
                      Akses Khusus Petugas Terdaftar
                    </h5>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Detail mutasi ternak, rekonsiliasi bantuan, dan data internal dinas dapat diakses melalui portal internal.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/login"
                        className="min-h-touch h-10 px-5 rounded-xl bg-azure text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs hover:bg-azure/90 active:scale-95 transition-all"
                      >
                        <span>Masuk untuk Akses Lengkap</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* DEFAULT DASHBOARD PREVIEW */
            <div className="space-y-8">
              
              {/* Bitpro View */}
              {activeModule === 'bitpro' && (
                <>
                  {/* Ranked Bar Widget */}
                  <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                      <div>
                        <h4 className="font-sans text-lg sm:text-xl font-bold text-slate-900">
                          Peringkat 5 Tertinggi — {cfg.label}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Rekapitulasi resmi tingkat Kabupaten Kebumen (2025)
                        </p>
                      </div>

                      {/* Metric Toggle */}
                      <div className="flex gap-1 p-1 rounded-xl bg-slate-200/70 border border-slate-200">
                        {(Object.keys(METRIC_CONFIGS) as (keyof typeof METRIC_CONFIGS)[]).map((key) => (
                          <button
                            key={key}
                            onClick={() => setRankedMetric(key)}
                            className={`min-h-touch h-8 px-3 rounded-lg text-xs font-bold uppercase transition-colors ${
                              rankedMetric === key
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {METRIC_CONFIGS[key].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-3.5">
                      {cfg.data.map((row: any, i: number) => {
                        const name = cfg.getName(row);
                        const percent = Math.round((row.total / cfg.max) * 100);

                        return (
                          <div key={name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 w-48 shrink-0">
                              <span className={`w-5 h-5 rounded-md font-sans font-semibold text-xs font-bold flex items-center justify-center ${i === 0 ? 'bg-azure text-white' : 'bg-slate-200 text-slate-700'}`}>
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

                            <span className="font-sans font-semibold text-xs sm:text-sm font-bold text-right w-36 shrink-0 text-slate-900">
                              {Math.round(row.total).toLocaleString('id-ID')} {cfg.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Asymmetric Clickable Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <button
                      onClick={() => setDetailView('populasi')}
                      className="p-5 rounded-2xl border border-slate-200 bg-white text-left flex flex-col justify-between min-h-[130px] transition-all hover:border-azure hover:shadow-sm active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-azure flex items-center justify-center">
                          <BarChart3 size={18} />
                        </div>
                        <ChevronRight size={18} className="text-azure" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 mb-0.5">Populasi & Produksi</p>
                        <p className="text-xs text-slate-500">
                          Tabel data populasi 16 komoditas ternak
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setDetailView('farm')}
                      className="p-5 rounded-2xl border border-slate-200 bg-white text-left flex flex-col justify-between min-h-[130px] transition-all hover:border-vitality hover:shadow-sm active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <Building2 size={18} />
                        </div>
                        <ChevronRight size={18} className="text-vitality" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 mb-0.5">Sebaran Data Farm</p>
                        <p className="text-xs text-slate-500">
                          242 unit kandang unggas & ruminansia
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setDetailView('ktt')}
                      className="p-5 rounded-2xl border border-slate-200 bg-white text-left flex flex-col justify-between min-h-[130px] transition-all hover:border-lime hover:shadow-sm active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-lime-50 text-lime-800 flex items-center justify-center">
                          <Users size={18} />
                        </div>
                        <ChevronRight size={18} className="text-lime" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 mb-0.5">Database KTT</p>
                        <p className="text-xs text-slate-500">
                          Kelompok Tani Ternak binaan
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setDetailView('sklb')}
                      className="p-5 rounded-2xl border border-slate-200 bg-white text-left flex flex-col justify-between min-h-[130px] transition-all hover:border-amber-400 hover:shadow-sm active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <FileText size={18} />
                        </div>
                        <ChevronRight size={18} className="text-amber-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 mb-0.5">Sertifikat SKLB</p>
                        <p className="text-xs text-slate-500">
                          Surat Kelayakan Bibit Ternak
                        </p>
                      </div>
                    </button>

                  </div>
                </>
              )}

              {/* Keswan View */}
              {activeModule === 'keswan' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-azure flex items-center justify-center mb-3">
                      <Stethoscope size={22} />
                    </div>
                    <h4 className="font-bold text-base text-slate-900 mb-1">Puskeswan Aktif</h4>
                    <p className="text-xs text-slate-600 mb-4">
                      Pelayanan rawat, pasif, pusling, dan konsultasi kesehatan ternak di seluruh kecamatan.
                    </p>
                    <button
                      onClick={() => setDetailView('keswan_info')}
                      className="text-xs font-bold text-azure hover:underline flex items-center gap-1"
                    >
                      LIHAT LAYANAN →
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-vitality flex items-center justify-center mb-3">
                      <Syringe size={22} />
                    </div>
                    <h4 className="font-bold text-base text-slate-900 mb-1">Vaksinasi PMK & LSD</h4>
                    <p className="text-xs text-slate-600 mb-4">
                      Monitoring capaian vaksinasi berkala dan penanganan penyakit menular ternak.
                    </p>
                    <button
                      onClick={() => setDetailView('keswan_info')}
                      className="text-xs font-bold text-azure hover:underline flex items-center gap-1"
                    >
                      LIHAT CAPAIAN →
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                      <Ambulance size={22} />
                    </div>
                    <h4 className="font-bold text-base text-slate-900 mb-1">Tanggap Darurat Medis</h4>
                    <p className="text-xs text-slate-600 mb-4">
                      Sistem respon cepat laporan wabah dan pengobatan hewan ternak masyarakat.
                    </p>
                    <button
                      onClick={() => setDetailView('keswan_info')}
                      className="text-xs font-bold text-azure hover:underline flex items-center gap-1"
                    >
                      KONTAK PETUGAS →
                    </button>
                  </div>
                </div>
              )}

              {/* Kesmavet View */}
              {activeModule === 'kesmavet' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                      <Building2 size={22} />
                    </div>
                    <h4 className="font-bold text-base text-slate-900 mb-1">RPH & TPH Terbina</h4>
                    <p className="text-xs text-slate-600 mb-4">
                      Rumah Potong Hewan dan Tempat Pemotongan Hewan resmi berstandar sanitasi.
                    </p>
                    <button
                      onClick={() => setDetailView('kesmavet_info')}
                      className="text-xs font-bold text-lime hover:underline flex items-center gap-1"
                    >
                      LIHAT DATA UNIT →
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-azure flex items-center justify-center mb-3">
                      <CheckCircle2 size={22} />
                    </div>
                    <h4 className="font-bold text-base text-slate-900 mb-1">Sertifikasi Halal & NKV</h4>
                    <p className="text-xs text-slate-600 mb-4">
                      Verifikasi Nomor Kontrol Veteriner dan jaminan kehalalan produk asal hewan.
                    </p>
                    <button
                      onClick={() => setDetailView('kesmavet_info')}
                      className="text-xs font-bold text-lime hover:underline flex items-center gap-1"
                    >
                      STATUS SERTIFIKAT →
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-800 flex items-center justify-center mb-3">
                      <FlaskConical size={22} />
                    </div>
                    <h4 className="font-bold text-base text-slate-900 mb-1">Pengujian Lab Higiene</h4>
                    <p className="text-xs text-slate-600 mb-4">
                      Pemeriksaan laboratorium mutu produk asal hewan yang aman, sehat, utuh, dan halal (ASUH).
                    </p>
                    <button
                      onClick={() => setDetailView('kesmavet_info')}
                      className="text-xs font-bold text-lime hover:underline flex items-center gap-1"
                    >
                      INFO UJI LAB →
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </section>

      {/* ─────────────────────────────────────────────
          5. FOOTER
      ───────────────────────────────────────────── */}
      <footer id="bantuan" className="border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-600 bg-white">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="font-sans text-lg font-bold text-azure">SiMantap</span>
            <span>—</span>
            <span>Dinas Pertanian dan Pangan Kabupaten Kebumen</span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Bidang Peternakan dan Kesehatan Hewan · Jl. Tentara Pelajar No. 25, Kebumen, Jawa Tengah.
          </p>
          <p className="text-xs font-sans font-semibold text-slate-400 pt-1">
            &copy; {new Date().getFullYear()} Pemerintah Kabupaten Kebumen. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>

    </div>
  );
}