'use client';

import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = kecamatanIndex.filter((k) => k.jumlah > 0).length;

  const currentSelectionLabel = filterKecamatan
    ? `Kec. ${filterKecamatan}`
    : 'Semua Wilayah';

  return (
    <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm lg:sticky lg:top-24 transition-colors">
      {/* Header: Clickable on mobile to toggle dropdown, static on desktop */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="w-full flex items-center justify-between pb-2 lg:pb-3 border-b border-slate-100 dark:border-slate-800 text-left cursor-pointer lg:cursor-default select-none"
      >
        <div className="flex items-center gap-2">
          <MapPin size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
              Wilayah Kecamatan
            </h3>
            <p className="text-[11px] font-sans text-emerald-700 dark:text-emerald-400 lg:hidden font-semibold">
              {currentSelectionLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-sans text-slate-400 dark:text-slate-500 hidden sm:inline lg:inline">
            {activeCount}/26 Aktif
          </span>
          <div className="lg:hidden w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Kecamatan List: collapsible on mobile, always visible on desktop */}
      <div
        className={`mt-2 lg:mt-0 ${
          mobileOpen ? 'block' : 'hidden'
        } lg:block max-h-[320px] lg:max-h-[520px] overflow-y-auto space-y-1 pr-1`}
      >
        <button
          onClick={() => {
            onPilihKecamatan('');
            setMobileOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            !filterKecamatan
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400'
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
              onClick={() => {
                onPilihKecamatan(kecamatan);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                active
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              <span>{kecamatan}</span>
              <span
                className={`font-sans text-xs ${
                  active ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {jumlah}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
