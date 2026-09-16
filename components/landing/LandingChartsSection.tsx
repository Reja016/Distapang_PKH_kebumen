'use client';

import React from 'react';
import { Activity, BarChart3, TrendingUp, PackageCheck } from 'lucide-react';
import {
  PALETTE_TERNAK,
  PALETTE_UNGGAS,
  PALETTE_DAGING,
  PALETTE_TELUR,
  PopulasiItem,
} from './types';

interface LandingChartsSectionProps {
  populasiTernak8: PopulasiItem[];
  totalTernakHewan: number;
  maxTernak: number;

  populasiUnggas8: PopulasiItem[];
  totalUnggas: number;
  maxUnggas: number;

  dataProduksiDaging: { jenis: string; ton: number }[];
  totalProdDagingTon: number;
  maxDagingTon: number;

  dataProduksiTelur: { jenis: string; ton: number }[];
  totalProdTelurTon: number;
  maxTelurTon: number;
}

export default function LandingChartsSection({
  populasiTernak8,
  totalTernakHewan,
  maxTernak,
  populasiUnggas8,
  totalUnggas,
  maxUnggas,
  dataProduksiDaging,
  totalProdDagingTon,
  maxDagingTon,
  dataProduksiTelur,
  totalProdTelurTon,
  maxTelurTon,
}: LandingChartsSectionProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* 1. POPULASI HEWAN TERNAK */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs space-y-4 sm:space-y-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300">
              <Activity size={14} />
              <span>Ruminansia &amp; Non-Ruminansia</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 px-3 py-1 rounded-md border border-blue-100 dark:border-blue-800">
              Total: {totalTernakHewan.toLocaleString('id-ID')} Ekor
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Populasi Hewan Ternak
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            Distribusi populasi komoditas hewan ternak Kabupaten Kebumen
          </p>
        </div>

        {/* Vertical Bar Chart Container */}
        <div className="pt-5 pb-2 px-1 sm:px-2 rounded-2xl bg-slate-50/50 dark:bg-slate-900/60 border-2 border-slate-200/80 dark:border-slate-700/80">
          <div className="grid grid-cols-8 gap-1 sm:gap-1.5 items-end h-48 sm:h-56">
            {populasiTernak8.map((row, i) => {
              const color = PALETTE_TERNAK[i % PALETTE_TERNAK.length];
              const percent = row.total > 0 ? Math.max(12, Math.round((row.total / maxTernak) * 100)) : 4;

              return (
                <div key={row.komoditas} className="flex flex-col items-center justify-end h-full group relative min-w-0">
                  <div className="mb-1 text-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-extrabold ${color.light} dark:bg-slate-800 ${color.text} border ${color.border} dark:border-slate-700 shadow-2xs whitespace-nowrap`}>
                      {row.total >= 1000 ? `${(row.total / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}rb` : row.total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="w-full max-w-[24px] sm:max-w-[32px] bg-slate-200/60 dark:bg-slate-700/60 rounded-t-lg flex flex-col justify-end p-0.5 overflow-hidden h-full">
                    <div
                      className={`w-full rounded-t-md bg-gradient-to-t ${color.gradient} transition-all duration-700 shadow-xs group-hover:brightness-110`}
                      style={{ height: `${percent}%` }}
                    />
                  </div>

                  <div className="mt-2 text-center flex flex-col items-center gap-0.5 w-full min-w-0">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight px-0.5" title={`${row.komoditas}: ${row.total.toLocaleString('id-ID')} Ekor`}>
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
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs space-y-4 sm:space-y-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300">
              <BarChart3 size={14} />
              <span>Komoditas Unggas</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/40 px-3 py-1 rounded-md border border-amber-100 dark:border-amber-800">
              Total: {totalUnggas.toLocaleString('id-ID')} Ekor
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Populasi Unggas
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            Distribusi populasi komoditas unggas Kabupaten Kebumen
          </p>
        </div>

        {/* Vertical Bar Chart Container */}
        <div className="pt-5 pb-2 px-1 sm:px-2 rounded-2xl bg-slate-50/50 dark:bg-slate-900/60 border-2 border-slate-200/80 dark:border-slate-700/80">
          <div className="grid grid-cols-8 gap-1 sm:gap-1.5 items-end h-48 sm:h-56">
            {populasiUnggas8.map((row, i) => {
              const color = PALETTE_UNGGAS[i % PALETTE_UNGGAS.length];
              const percent = row.total > 0 ? Math.max(12, Math.round((row.total / maxUnggas) * 100)) : 4;

              return (
                <div key={row.komoditas} className="flex flex-col items-center justify-end h-full group relative min-w-0">
                  <div className="mb-1 text-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-extrabold ${color.light} dark:bg-slate-800 ${color.text} border ${color.border} dark:border-slate-700 shadow-2xs whitespace-nowrap`}>
                      {row.total >= 1000000 ? `${(row.total / 1000000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}jt` : row.total >= 1000 ? `${(row.total / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}rb` : row.total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="w-full max-w-[24px] sm:max-w-[32px] bg-slate-200/60 dark:bg-slate-700/60 rounded-t-lg flex flex-col justify-end p-0.5 overflow-hidden h-full">
                    <div
                      className={`w-full rounded-t-md bg-gradient-to-t ${color.gradient} transition-all duration-700 shadow-xs group-hover:brightness-110`}
                      style={{ height: `${percent}%` }}
                    />
                  </div>

                  <div className="mt-2 text-center flex flex-col items-center gap-0.5 w-full min-w-0">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight px-0.5" title={`${row.komoditas}: ${row.total.toLocaleString('id-ID')} Ekor`}>
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
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs space-y-4 sm:space-y-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300">
              <TrendingUp size={14} />
              <span>Hasil Ternak Potong</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40 px-3 py-1 rounded-md border border-rose-100 dark:border-rose-800">
              Total: {totalProdDagingTon.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ton
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Produksi Daging
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            Realisasi produksi daging ternak dan unggas Kabupaten Kebumen
          </p>
        </div>

        {/* Vertical Bar Chart Container */}
        <div className="pt-5 pb-2 px-1 sm:px-2 rounded-2xl bg-slate-50/50 dark:bg-slate-900/60 border-2 border-slate-200/80 dark:border-slate-700/80">
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 items-end h-48 sm:h-56">
            {dataProduksiDaging.map((row, i) => {
              const color = PALETTE_DAGING[i % PALETTE_DAGING.length];
              const percent = row.ton > 0 ? Math.max(12, Math.round((row.ton / maxDagingTon) * 100)) : 4;

              return (
                <div key={row.jenis} className="flex flex-col items-center justify-end h-full group relative min-w-0">
                  <div className="mb-1 text-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-extrabold ${color.light} dark:bg-slate-800 ${color.text} border ${color.border} dark:border-slate-700 shadow-2xs whitespace-nowrap`}>
                      {row.ton >= 100 ? `${Math.round(row.ton).toLocaleString('id-ID')} Ton` : `${row.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ton`}
                    </span>
                  </div>

                  <div className="w-full max-w-[30px] sm:max-w-[42px] bg-slate-200/60 dark:bg-slate-700/60 rounded-t-lg flex flex-col justify-end p-0.5 overflow-hidden h-full">
                    <div
                      className={`w-full rounded-t-md bg-gradient-to-t ${color.gradient} transition-all duration-700 shadow-xs group-hover:brightness-110`}
                      style={{ height: `${percent}%` }}
                    />
                  </div>

                  <div className="mt-2 text-center flex flex-col items-center gap-0.5 w-full min-w-0">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight px-0.5" title={`${row.jenis}: ${row.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Ton`}>
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
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs space-y-4 sm:space-y-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300">
              <PackageCheck size={14} />
              <span>Hasil Ternak Petelur</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/40 px-3 py-1 rounded-md border border-amber-100 dark:border-amber-800">
              Total: {totalProdTelurTon.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ton
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Produksi Telur
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            Realisasi produksi telur unggas petelur Kabupaten Kebumen
          </p>
        </div>

        {/* Vertical Bar Chart Container */}
        <div className="pt-5 pb-2 px-1 sm:px-2 rounded-2xl bg-slate-50/50 dark:bg-slate-900/60 border-2 border-slate-200/80 dark:border-slate-700/80">
          <div className="grid grid-cols-5 gap-2 sm:gap-3 items-end h-48 sm:h-56">
            {dataProduksiTelur.map((row, i) => {
              const color = PALETTE_TELUR[i % PALETTE_TELUR.length];
              const percent = row.ton > 0 ? Math.max(12, Math.round((row.ton / maxTelurTon) * 100)) : 4;

              return (
                <div key={row.jenis} className="flex flex-col items-center justify-end h-full group relative min-w-0">
                  <div className="mb-1 text-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-extrabold ${color.light} dark:bg-slate-800 ${color.text} border ${color.border} dark:border-slate-700 shadow-2xs whitespace-nowrap`}>
                      {row.ton >= 100 ? `${Math.round(row.ton).toLocaleString('id-ID')} Ton` : `${row.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ton`}
                    </span>
                  </div>

                  <div className="w-full max-w-[34px] sm:max-w-[48px] bg-slate-200/60 dark:bg-slate-700/60 rounded-t-lg flex flex-col justify-end p-0.5 overflow-hidden h-full">
                    <div
                      className={`w-full rounded-t-md bg-gradient-to-t ${color.gradient} transition-all duration-700 shadow-xs group-hover:brightness-110`}
                      style={{ height: `${percent}%` }}
                    />
                  </div>

                  <div className="mt-2 text-center flex flex-col items-center gap-0.5 w-full min-w-0">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight px-0.5" title={`${row.jenis}: ${row.ton.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Ton`}>
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
  );
}
