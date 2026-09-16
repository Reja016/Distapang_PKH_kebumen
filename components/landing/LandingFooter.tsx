'use client';

import React from 'react';

export function LandingFooter() {
  return (
    <footer className="border-t-2 border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-8 lg:px-9 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 mt-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
        <span className="font-extrabold text-blue-600 dark:text-blue-400">SiMantap</span>
        <span>·</span>
        <span>Dinas Pertanian dan Pangan Kabupaten Kebumen</span>
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} Bidang Peternakan dan Kesehatan Hewan Kebumen.
      </p>
    </footer>
  );
}
