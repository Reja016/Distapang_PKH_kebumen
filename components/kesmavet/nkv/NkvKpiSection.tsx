'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { NKVRecord } from './types';

interface NkvKpiSectionProps {
  dataNkv: NKVRecord[];
}

export default function NkvKpiSection({ dataNkv }: NkvKpiSectionProps) {
  const diterbitkanCount = dataNkv.filter((d) =>
    d.pengeluaranRekomendasi.toLowerCase().includes('diterbitkan')
  ).length;

  const prosesCount = dataNkv.filter(
    (d) => !d.pengeluaranRekomendasi.toLowerCase().includes('diterbitkan')
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
          <ShieldCheck size={24} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Unit Usaha</p>
          <p className="text-2xl font-extrabold text-slate-900">
            {dataNkv.length} <span className="text-xs text-slate-500 font-semibold">Usaha</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
          <CheckCircle2 size={24} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rekomendasi Diterbitkan</p>
          <p className="text-2xl font-extrabold text-emerald-700">
            {diterbitkanCount} <span className="text-xs text-slate-500 font-semibold">Unit</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
          <Clock size={24} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dalam Proses / Audit</p>
          <p className="text-2xl font-extrabold text-amber-800">
            {prosesCount} <span className="text-xs text-slate-500 font-semibold">Unit</span>
          </p>
        </div>
      </div>
    </div>
  );
}
