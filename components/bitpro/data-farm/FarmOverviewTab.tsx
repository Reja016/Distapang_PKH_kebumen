import React from 'react';
import { CommodityKey, COMMODITY_META, COMMODITY_ORDER, formatNum } from './types';

interface FarmOverviewTabProps {
  dataBroiler: any[];
  dataPetelur: any[];
  dataGeneral: any[];
  setActiveCommodity: (key: CommodityKey) => void;
  setSearchTerm: (term: string) => void;
  getStats: (key: CommodityKey) => { jumlahFarm: number; totalPopulasi: number; label: string };
}

export default function FarmOverviewTab({
  dataBroiler,
  dataPetelur,
  dataGeneral,
  setActiveCommodity,
  setSearchTerm,
  getStats,
}: FarmOverviewTabProps) {
  const totalFarms = dataBroiler.length + dataPetelur.length + dataGeneral.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 bg-emerald-50/70 border border-emerald-200 p-5 rounded-3xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight">
            Kategori Komoditas Farm Peternakan
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800/80 mt-1">
            Pilih salah satu komoditas peternakan atau gunakan tab di atas untuk melihat &amp; mengelola data farm.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-bold text-emerald-700 bg-white px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
            Total: {totalFarms} Unit Farm
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {COMMODITY_ORDER.map((key) => {
          const meta = COMMODITY_META[key];
          const stats = getStats(key);
          return (
            <button
              key={key}
              onClick={() => {
                setActiveCommodity(key);
                setSearchTerm('');
              }}
              className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:border-emerald-600 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[220px] cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border text-2xl ${meta.iconColor}`}>
                    <span>{meta.emoji}</span>
                  </div>
                  <span className="text-xs font-sans font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {meta.badge}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors mb-1">
                  {meta.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{meta.subtitle}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-bold">
                    Jumlah Farm
                  </p>
                  <p className="text-2xl font-black font-sans text-slate-900">
                    {stats.jumlahFarm} <span className="text-xs font-normal text-slate-500">Unit</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-bold">
                    {stats.label}
                  </p>
                  <p className="text-lg font-black font-sans text-emerald-600">
                    {formatNum(stats.totalPopulasi)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
