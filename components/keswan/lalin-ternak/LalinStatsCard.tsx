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
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Pemasukan
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <ArrowDownLeft size={18} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {(masuk?.total_ekor || 0).toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-slate-500">Ekor Masuk</span>
          </div>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span>♂ Jantan: <strong>{masuk?.total_jantan || 0}</strong></span>
            <span>♀ Betina: <strong>{masuk?.total_betina || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Kartu 2: Pengeluaran Ternak */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Pengeluaran
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <ArrowUpRight size={18} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {(keluar?.total_ekor || 0).toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-slate-500">Ekor Keluar</span>
          </div>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span>♂ Jantan: <strong>{keluar?.total_jantan || 0}</strong></span>
            <span>♀ Betina: <strong>{keluar?.total_betina || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Kartu 3: Pasar Hewan Kebumen */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pasar Hewan Kebumen
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Store size={18} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {((masuk?.kebumen || 0) + (keluar?.kebumen || 0)).toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-slate-500">Ekor Total</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span>Masuk: <strong>{masuk?.kebumen || 0}</strong></span>
            <span>Keluar: <strong>{keluar?.kebumen || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Kartu 4: Pasar Hewan Gombong */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pasar Hewan Gombong
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Store size={18} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {((masuk?.gombong || 0) + (keluar?.gombong || 0)).toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-slate-500">Ekor Total</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span>Masuk: <strong>{masuk?.gombong || 0}</strong></span>
            <span>Keluar: <strong>{keluar?.gombong || 0}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
