'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MODULES } from './types';

interface LandingHeroSectionProps {
  onSelectModule: (modKey: 'bitpro' | 'keswan' | 'kesmavet') => void;
}

export default function LandingHeroSection({ onSelectModule }: LandingHeroSectionProps) {
  return (
    <div className="max-w-[1360px] mx-auto px-3.5 sm:px-6 md:px-8 lg:px-9 pt-4 sm:pt-6">
      <section
        id="ringkasan"
        className="rounded-2xl sm:rounded-3xl border border-blue-100/90 dark:border-slate-800 bg-[#f8fbff] dark:bg-slate-900/60 p-4 sm:p-6 lg:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xs"
      >
        <div className="max-w-md xl:max-w-lg">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-blue-200/80 dark:border-slate-700 text-[11px] sm:text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <span>Portal Resmi Bidang Peternakan &amp; Kesehatan Hewan</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug mb-2">
            Satu Ekosistem untuk Data <span className="text-blue-600 dark:text-blue-400">Peternakan Kebumen</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Sistem Informasi Manajemen Terpadu yang mengintegrasikan data Perbibitan &amp; Produksi (Bitpro), Kesehatan Hewan (Keswan), dan Kesehatan Masyarakat Veteriner (Kesmavet) secara akurat, transparan, dan terbuka.
          </p>
          
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
            <span>Pilih kartu modul untuk membuka data</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* ── KARTU MODUL BERGAMBAR (Bitpro, Keswan, Kesmavet) ── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full lg:w-auto shrink-0 justify-items-center">
          {MODULES.map((mod) => (
            <div
              key={mod.key}
              onClick={() => onSelectModule(mod.key as 'bitpro' | 'keswan' | 'kesmavet')}
              className="group relative w-full max-w-[110px] xs:max-w-[130px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[170px] xl:max-w-[185px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-800"
            >
              <img
                src={mod.image}
                alt={`Kartu Modul ${mod.label}`}
                className="w-full h-auto object-cover block transition-transform duration-300 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors pointer-events-none" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
