'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MODULES } from './types';

interface LandingHeroSectionProps {
  onSelectModule: (modKey: 'bitpro' | 'keswan' | 'kesmavet') => void;
}

export default function LandingHeroSection({ onSelectModule }: LandingHeroSectionProps) {
  return (
    <section
      id="ringkasan"
      className="rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-[#f8fbff] dark:bg-slate-900/90 p-4 sm:p-6 lg:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs"
    >
      <div className="max-w-md xl:max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-800 text-xs sm:text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 shadow-2xs">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
          <span className="inline sm:hidden">Portal Resmi Peternakan &amp; Keswan</span>
          <span className="hidden sm:inline">Portal Resmi Bidang Peternakan dan Kesehatan Hewan</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-3">
          Satu Ekosistem untuk Data <span className="text-blue-600 dark:text-blue-400">Peternakan Kebumen</span>
        </h1>
        <p className="text-xs sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed mb-3 sm:mb-4">
          Sistem Informasi Manajemen Terpadu yang mengintegrasikan data Perbibitan &amp; Produksi (Bitpro), Kesehatan Hewan (Keswan), dan Kesehatan Masyarakat Veteriner (Kesmavet).
        </p>
        
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400">
          <span>Pilih modul untuk melihat data</span>
          <ArrowRight size={14} className="shrink-0" />
        </div>
      </div>

      {/* ── KARTU MODUL BERGAMBAR (Bitpro, Keswan, Kesmavet) ── */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full lg:w-auto shrink-0 justify-items-center">
        {MODULES.map((mod) => (
          <div
            key={mod.key}
            onClick={() => onSelectModule(mod.key as 'bitpro' | 'keswan' | 'kesmavet')}
            className="group relative w-full max-w-[110px] xs:max-w-[130px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[170px] xl:max-w-[185px] transition-all duration-300 sm:hover:scale-[1.04] active:scale-[0.97] cursor-pointer drop-shadow-md sm:hover:drop-shadow-xl select-none"
          >
            <img
              src={mod.image}
              alt={`Kartu Modul ${mod.label}`}
              className="w-full h-auto block rounded-2xl sm:rounded-3xl"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
