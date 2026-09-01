'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Plus,
} from 'lucide-react';

export default function PopulasiDanProduksiPage() {
  const router = useRouter();
  const [extraYears, setExtraYears] = useState<number[]>([2027]);
  const [showYearModal, setShowYearModal] = useState<boolean>(false);
  const [targetType, setTargetType] = useState<'populasi' | 'produksi'>('populasi');
  const [inputYear, setInputYear] = useState<string>('2028');

  useEffect(() => {
    const saved = localStorage.getItem('distapang_extra_years');
    if (saved) {
      try {
        setExtraYears(JSON.parse(saved));
      } catch {
        setExtraYears([2027]);
      }
    }
  }, []);

  const handleOpenYear = (yearNum: number, type: 'populasi' | 'produksi') => {
    if (!yearNum || yearNum < 2000 || yearNum > 2100) {
      alert('Masukkan tahun yang valid (2000 - 2100)!');
      return;
    }

    if (!extraYears.includes(yearNum) && yearNum !== 2025 && yearNum !== 2026) {
      const updated = [...extraYears, yearNum].sort((a, b) => a - b);
      setExtraYears(updated);
      localStorage.setItem('distapang_extra_years', JSON.stringify(updated));
    }

    setShowYearModal(false);

    if (type === 'populasi') {
      if (yearNum === 2025) router.push('/bitpro/populasi-dan-produksi/2025');
      else if (yearNum === 2026) router.push('/bitpro/populasi-dan-produksi/2026');
      else router.push(`/bitpro/populasi-dan-produksi/2026?year=${yearNum}`);
    } else {
      if (yearNum === 2025) router.push('/bitpro/populasi-dan-produksi/produksi-2025');
      else if (yearNum === 2026) router.push('/bitpro/populasi-dan-produksi/produksi-2026');
      else router.push(`/bitpro/populasi-dan-produksi/produksi-2026?year=${yearNum}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER ── */}
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
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Populasi &amp; Produksi</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Statistik Populasi dan Produksi Peternakan
              </h1>
            </div>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pilih Kategori &amp; Periode Laporan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Akses lembar kerja data populasi ternak ruminansia, unggas, monogastrik serta tonase produksi daging dan telur se-Kabupaten Kebumen.
          </p>
        </div>

        {/* ── 2 MAIN MODULE CARDS (POPULASI & PRODUKSI) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* SECTION 1: POPULASI */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <BarChart3 size={24} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-sans font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Data Populasi
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                  Populasi Ternak Kabupaten
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Rangkuman jumlah ternak ruminansia besar, kecil, babi, unggas, dan aneka ternak per desa dan kecamatan se-Kabupaten Kebumen.
                </p>
              </div>
            </div>

            {/* Quick Cards Grid for Populasi */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/bitpro/populasi-dan-produksi/2025"
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-600 hover:shadow-sm transition-all text-left flex flex-col justify-between min-h-[90px] group"
                >
                  <span className="text-[11px] font-bold text-slate-500 uppercase">2025 (Paten)</span>
                  <span className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                    <span>Populasi 2025</span>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600" />
                  </span>
                </Link>

                <Link
                  href="/bitpro/populasi-dan-produksi/2026"
                  className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/60 hover:bg-white hover:border-emerald-600 hover:shadow-sm transition-all text-left flex flex-col justify-between min-h-[90px] group"
                >
                  <span className="text-[11px] font-extrabold text-emerald-700 uppercase">2026 (Aktif)</span>
                  <span className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                    <span>Populasi 2026</span>
                    <ChevronRight size={16} className="text-emerald-600" />
                  </span>
                </Link>

                {extraYears.map((yr) => (
                  <Link
                    key={yr}
                    href={`/bitpro/populasi-dan-produksi/2026?year=${yr}`}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-600 hover:shadow-sm transition-all text-left flex flex-col justify-between min-h-[90px] group"
                  >
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">{yr}</span>
                    <span className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                      <span>Populasi {yr}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-600" />
                    </span>
                  </Link>
                ))}
              </div>

              {/* Simple Button Tambah Tahun */}
              <button
                type="button"
                onClick={() => {
                  setTargetType('populasi');
                  setShowYearModal(true);
                }}
                className="w-full min-h-touch h-10 rounded-xl border border-dashed border-emerald-300 hover:border-emerald-500 bg-white hover:bg-emerald-50 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Buka Tahun Lainnya</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: PRODUKSI */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <TrendingUp size={24} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-sans font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Laporan Produksi
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                  Produksi Daging &amp; Telur
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Rekapitulasi bulanan dan diagram proporsi lingkaran tonase daging siap potong dan produksi telur konsumsi se-Kabupaten Kebumen.
                </p>
              </div>
            </div>

            {/* Quick Cards Grid for Produksi */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/bitpro/populasi-dan-produksi/produksi-2025"
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-600 hover:shadow-sm transition-all text-left flex flex-col justify-between min-h-[90px] group"
                >
                  <span className="text-[11px] font-bold text-slate-500 uppercase">2025 (Paten)</span>
                  <span className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                    <span>Produksi 2025</span>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600" />
                  </span>
                </Link>

                <Link
                  href="/bitpro/populasi-dan-produksi/produksi-2026"
                  className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/60 hover:bg-white hover:border-emerald-600 hover:shadow-sm transition-all text-left flex flex-col justify-between min-h-[90px] group"
                >
                  <span className="text-[11px] font-extrabold text-emerald-700 uppercase">2026 (Aktif)</span>
                  <span className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                    <span>Produksi 2026</span>
                    <ChevronRight size={16} className="text-emerald-600" />
                  </span>
                </Link>

                {extraYears.map((yr) => (
                  <Link
                    key={yr}
                    href={`/bitpro/populasi-dan-produksi/produksi-2026?year=${yr}`}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-600 hover:shadow-sm transition-all text-left flex flex-col justify-between min-h-[90px] group"
                  >
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">{yr}</span>
                    <span className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                      <span>Produksi {yr}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-600" />
                    </span>
                  </Link>
                ))}
              </div>

              {/* Simple Button Tambah Tahun */}
              <button
                type="button"
                onClick={() => {
                  setTargetType('produksi');
                  setShowYearModal(true);
                }}
                className="w-full min-h-touch h-10 rounded-xl border border-dashed border-emerald-300 hover:border-emerald-500 bg-white hover:bg-emerald-50 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Buka Tahun Lainnya</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* ── SIMPLE MODAL TAMBAH TAHUN ── */}
      {showYearModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Buka Data Tahun Lain
              </h3>
              <button
                type="button"
                onClick={() => setShowYearModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Ketik Angka Tahun
              </label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={inputYear}
                onChange={(e) => setInputYear(e.target.value)}
                className="w-full min-h-touch h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-base font-bold text-slate-900 focus:bg-white focus:border-emerald-600 outline-none shadow-2xs"
                placeholder="Contoh: 2028"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowYearModal(false)}
                className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleOpenYear(Number(inputYear), targetType)}
                className="flex-1 min-h-touch h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                Buka Data →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
