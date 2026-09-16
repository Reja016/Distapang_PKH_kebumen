'use client';

import React from 'react';

interface KttSidebarProps {
  totalCount: number;
  kecamatanIndex: { kecamatan: string; jumlah: number }[];
  filterKecamatan: string;
  onPilihKecamatan: (kec: string) => void;
}

export default function KttSidebar({
  totalCount,
  kecamatanIndex,
  filterKecamatan,
  onPilihKecamatan,
}: KttSidebarProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 font-sans">
          Wilayah Kecamatan
        </h3>
        <span className="text-[11px] font-sans text-slate-400">
          {kecamatanIndex.filter((k) => k.jumlah > 0).length}/26 Aktif
        </span>
      </div>

      <div className="max-h-[520px] overflow-y-auto space-y-1 pr-1">
        <button
          onClick={() => onPilihKecamatan("")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            !filterKecamatan
              ? "bg-emerald-600 text-white font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>Semua Wilayah</span>
          <span className="font-sans text-xs">{totalCount}</span>
        </button>

        {kecamatanIndex.map(({ kecamatan, jumlah }) => {
          const active = filterKecamatan.trim().toUpperCase() === kecamatan.trim().toUpperCase();
          return (
            <button
              key={kecamatan}
              onClick={() => onPilihKecamatan(kecamatan)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                active
                  ? "bg-emerald-600 text-white font-bold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{kecamatan}</span>
              <span className={`font-sans text-xs ${active ? "text-white" : "text-slate-400"}`}>
                {jumlah}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
