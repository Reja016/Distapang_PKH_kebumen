'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  ChevronRight,
  Activity,
  TrendingUp,
  PackageCheck,
  Loader2,
} from 'lucide-react';

interface LandingStatsSectionProps {
  isDataLoading: boolean;
  totalPopulasi: number;
  totalProdDagingTon: number;
  totalProdTelurTon: number;
  totalSapiPo: number;
  puskeswanCount: number;
  topUnggas: { komoditas: string; total: number };
  topDaging: { jenis: string; ton: number };
  topTelur: { jenis: string; ton: number };
  sapiPotongPop: number;
  onOpenPopulasi: (subTab: 'populasi' | 'daging' | 'telur') => void;
  onScrollToPuskeswan: () => void;
}

export default function LandingStatsSection({
  isDataLoading,
  totalPopulasi,
  totalProdDagingTon,
  totalProdTelurTon,
  totalSapiPo,
  puskeswanCount,
  topUnggas,
  topDaging,
  topTelur,
  sapiPotongPop,
  onOpenPopulasi,
  onScrollToPuskeswan,
}: LandingStatsSectionProps) {
  const router = useRouter();

  return (
    <section className="space-y-3.5 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ringkasan Wilayah
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Rekapitulasi data resmi peternakan dan kesehatan hewan Kabupaten Kebumen
            </p>
          </div>
          <button
            onClick={onScrollToPuskeswan}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 border-2 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
            title="Lihat Unit Puskeswan Aktif"
          >
            <Stethoscope size={14} className="text-sky-600 dark:text-sky-400" />
            <span>{puskeswanCount} Puskeswan Aktif</span>
          </button>
        </div>

        <button
          onClick={() => onOpenPopulasi('populasi')}
          className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>Lihat Detail Sensus</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 4 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Stat 1: Total Populasi */}
        <div
          onClick={() => onOpenPopulasi('populasi')}
          className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all group"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-0.5 sm:mb-1 truncate">
              Total Populasi Ternak
            </p>
            <p className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isDataLoading ? (
                <span className="inline-flex items-center gap-1 text-base text-slate-400 font-normal">
                  <Loader2 className="animate-spin" size={16} /> Memuat...
                </span>
              ) : (
                totalPopulasi.toLocaleString('id-ID')
              )}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">
              Ekor di seluruh Kebumen
            </p>
          </div>
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs sm:group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Stat 2: Produksi Daging */}
        <div
          onClick={() => onOpenPopulasi('daging')}
          className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 cursor-pointer hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-xs transition-all group"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-0.5 sm:mb-1 truncate">
              Produksi Daging
            </p>
            <p className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isDataLoading ? (
                <span className="inline-flex items-center gap-1 text-base text-slate-400 font-normal">
                  <Loader2 className="animate-spin" size={16} /> Memuat...
                </span>
              ) : (
                totalProdDagingTon.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
              )}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">
              Ton / tahun
            </p>
          </div>
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs sm:group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Stat 3: Produksi Telur */}
        <div
          onClick={() => onOpenPopulasi('telur')}
          className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all group"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-0.5 sm:mb-1 truncate">
              Produksi Telur
            </p>
            <p className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isDataLoading ? (
                <span className="inline-flex items-center gap-1 text-base text-slate-400 font-normal">
                  <Loader2 className="animate-spin" size={16} /> Memuat...
                </span>
              ) : (
                totalProdTelurTon.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
              )}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">
              Ton / tahun
            </p>
          </div>
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs sm:group-hover:scale-105 transition-transform">
            <PackageCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Stat 4: Populasi Sapi PO */}
        <div
          onClick={() => router.push('/bitpro/sklb')}
          className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all group"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-0.5 sm:mb-1 truncate">
              Populasi Sapi PO
            </p>
            <p className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isDataLoading ? (
                <span className="inline-flex items-center gap-1 text-base text-slate-400 font-normal">
                  <Loader2 className="animate-spin" size={16} /> Memuat...
                </span>
              ) : (
                `${totalSapiPo.toLocaleString('id-ID')} Ekor`
              )}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">
              Data resmi populasi ternak Sapi PO Kebumen
            </p>
          </div>
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs sm:group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* 4 Secondary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-[11px] sm:text-sm text-slate-700 dark:text-slate-300 font-bold line-clamp-1">{topUnggas.komoditas}</p>
          <p className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 break-words">
            {topUnggas.total.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Ekor · Unggas Terbanyak</p>
        </div>

        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-[11px] sm:text-sm text-slate-700 dark:text-slate-300 font-bold line-clamp-1">{topDaging.jenis}</p>
          <p className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 break-words">
            {topDaging.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </p>
          <p className="text-[11px] sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Ton Daging / Tahun</p>
        </div>

        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-[11px] sm:text-sm text-slate-700 dark:text-slate-300 font-bold line-clamp-1">{topTelur.jenis}</p>
          <p className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 break-words">
            {topTelur.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </p>
          <p className="text-[11px] sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Ton Telur / Tahun</p>
        </div>

        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-[11px] sm:text-sm text-slate-700 dark:text-slate-300 font-bold line-clamp-1">Sapi Potong</p>
          <p className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 break-words">
            {sapiPotongPop.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Ekor Sapi Terdata</p>
        </div>
      </div>
    </section>
  );
}
