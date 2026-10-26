'use client';

import React from 'react';

export default function KelasBadge({ kelas }: { kelas: string }) {
  if (!kelas || kelas === '-') {
    return <span className="text-xs text-slate-400 dark:text-slate-500 italic">Belum diklasifikasi</span>;
  }

  const k = kelas.trim().toLowerCase();

  let badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  let dotStyle = "bg-slate-400 dark:bg-slate-500";

  if (k.includes('pemula')) {
    badgeStyle = "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
    dotStyle = "bg-sky-500";
  } else if (k.includes('lanjut')) {
    badgeStyle = "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    dotStyle = "bg-emerald-500";
  } else if (k.includes('madya')) {
    badgeStyle = "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    dotStyle = "bg-amber-500";
  } else if (k.includes('utama')) {
    badgeStyle = "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    dotStyle = "bg-purple-500";
  } else if (k.includes('mandiri')) {
    badgeStyle = "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    dotStyle = "bg-indigo-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-sans border transition-colors shadow-2xs ${badgeStyle}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
      {kelas}
    </span>
  );
}
