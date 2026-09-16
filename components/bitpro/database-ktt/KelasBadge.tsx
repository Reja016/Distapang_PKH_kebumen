'use client';

import React from 'react';

export default function KelasBadge({ kelas }: { kelas: string }) {
  if (!kelas || kelas === '-') {
    return <span className="text-xs text-slate-400 italic">Belum diklasifikasi</span>;
  }

  const k = kelas.trim().toLowerCase();

  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let dotStyle = "bg-slate-400";

  if (k.includes('pemula')) {
    badgeStyle = "bg-sky-50/90 text-sky-800 border-sky-200";
    dotStyle = "bg-sky-500";
  } else if (k.includes('lanjut')) {
    badgeStyle = "bg-emerald-50/90 text-emerald-800 border-emerald-200";
    dotStyle = "bg-emerald-500";
  } else if (k.includes('madya')) {
    badgeStyle = "bg-amber-50/90 text-amber-800 border-amber-200";
    dotStyle = "bg-amber-500";
  } else if (k.includes('utama')) {
    badgeStyle = "bg-purple-50/90 text-purple-800 border-purple-200";
    dotStyle = "bg-purple-500";
  } else if (k.includes('mandiri')) {
    badgeStyle = "bg-indigo-50/90 text-indigo-800 border-indigo-200";
    dotStyle = "bg-indigo-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-sans border shadow-2xs ${badgeStyle}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
      {kelas}
    </span>
  );
}
