'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Store, Scale } from 'lucide-react';
import { LalinSummary } from './types';

interface LalinStatsCardProps {
  summary: LalinSummary;
}

export default function LalinStatsCard({ summary }: LalinStatsCardProps) {
  const masuk = summary.pemasukan;
  const keluar = summary.pengeluaran;

  const totalSemuaEkor = (masuk?.total_ekor || 0) + (keluar?.total_ekor || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Kartu 1: Pemasukan Ternak */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Pemasukan
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
            <ArrowDownLeft size={18} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {(masuk?.total_ekor || 0).toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Ekor Masuk</span>
          </div>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            <span>♂ Jantan: <strong className="text-slate-900 dark:text-white">{masuk?.total_jantan || 0}</strong></span>
            <span>♀ Betina: <strong className="text-slate-900 dark:text-white">{masuk?.total_betina || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Kartu 2: Pengeluaran Ternak */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Pengeluaran
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800">
            <ArrowUpRight size={18} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {(keluar?.total_ekor || 0).toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Ekor Keluar</span>
          </div>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            <span>♂ Jantan: <strong className="text-slate-900 dark:text-white">{keluar?.total_jantan || 0}</strong></span>
            <span>♀ Betina: <strong className="text-slate-900 dark:text-white">{keluar?.total_betina || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Kartu 3: Pasar Hewan Kebumen */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pasar Hewan Kebumen
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800">
            <Store size={18} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {((masuk?.kebumen || 0) + (keluar?.kebumen || 0)).toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Ekor Total</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            <span>Masuk: <strong className="text-slate-900 dark:text-white">{masuk?.kebumen || 0}</strong></span>
            <span>Keluar: <strong className="text-slate-900 dark:text-white">{keluar?.kebumen || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Kartu 4: Pasar Hewan Gombong */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pasar Hewan Gombong
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-800">
            <Store size={18} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {((masuk?.gombong || 0) + (keluar?.gombong || 0)).toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Ekor Total</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            <span>Masuk: <strong className="text-slate-900 dark:text-white">{masuk?.gombong || 0}</strong></span>
            <span>Keluar: <strong className="text-slate-900 dark:text-white">{keluar?.gombong || 0}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
