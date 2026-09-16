import React from 'react';
import { RuminantConfig } from './types';

interface RuminantInputCardProps {
  config: RuminantConfig;
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  totalValue: number;
}

export default function RuminantInputCard({
  config,
  values,
  onChange,
  totalValue,
}: RuminantInputCardProps) {
  const { name, prefix, icon } = config;

  return (
    <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4 hover:border-emerald-200 transition-colors">
      {/* Card Header with Auto Calculated Total */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{icon}</span>
          <div>
            <h4 className="font-bold text-base text-slate-900">{name}</h4>
            <span className="text-[11px] text-slate-400">Struktur Umur &amp; Gender</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total</span>
          <span className="text-sm font-bold text-emerald-800 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 font-sans">
            {totalValue.toLocaleString('id-ID')} Ekor
          </span>
        </div>
      </div>

      {/* Matriks Input: Jantan & Betina */}
      <div className="grid grid-cols-2 gap-3">
        {/* Kolom Jantan */}
        <div className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-300 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-blue-200 text-blue-900 font-extrabold text-xs">
            <span className="flex items-center gap-1">
              <span>♂️</span>
              <span>JANTAN</span>
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-bold text-blue-950 mb-0.5">Anak Jantan</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`AJ ${prefix}`] || ''}
                onChange={(e) => onChange(`AJ ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-blue-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-blue-950 mb-0.5">Muda Jantan</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`MJ ${prefix}`] || ''}
                onChange={(e) => onChange(`MJ ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-blue-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-blue-950 mb-0.5">Dewasa Jantan</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`DJ ${prefix}`] || ''}
                onChange={(e) => onChange(`DJ ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-blue-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-blue-600 focus:ring-1 focus:ring-blue-500 outline-none shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Kolom Betina */}
        <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-rose-200 text-rose-900 font-extrabold text-xs">
            <span className="flex items-center gap-1">
              <span>♀️</span>
              <span>BETINA</span>
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-bold text-rose-950 mb-0.5">Anak Betina</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`AB ${prefix}`] || ''}
                onChange={(e) => onChange(`AB ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-rose-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-rose-600 focus:ring-1 focus:ring-rose-500 outline-none shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-rose-950 mb-0.5">Muda Betina</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`MB ${prefix}`] || ''}
                onChange={(e) => onChange(`MB ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-rose-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-rose-600 focus:ring-1 focus:ring-rose-500 outline-none shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-rose-950 mb-0.5">Dewasa Betina</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={values[`DB ${prefix}`] || ''}
                onChange={(e) => onChange(`DB ${prefix}`, e.target.value)}
                className="w-full min-h-touch h-10 px-2.5 rounded-xl border border-rose-200 bg-white text-sm font-bold text-slate-900 text-center sm:text-right focus:border-rose-600 focus:ring-1 focus:ring-rose-500 outline-none shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
