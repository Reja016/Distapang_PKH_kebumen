'use client';

import React from 'react';
import { bulan, ProduksiItem } from './types';

interface ProduksiTableProps {
  title: string;
  subtitle: string;
  icon: string;
  badgeLabel: string;
  firstColLabel?: string;
  data: ProduksiItem[];
}

export default function ProduksiTable({
  title,
  subtitle,
  icon,
  badgeLabel,
  firstColLabel = 'JENIS TERNAK',
  data,
}: ProduksiTableProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="font-bold text-base text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          {badgeLabel}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-right whitespace-nowrap">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-300 dark:border-slate-700">
            <tr>
              <th className="p-3.5 text-left sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 border-r border-slate-300 dark:border-slate-700">
                {firstColLabel}
              </th>
              {bulan.map((b) => (
                <th key={b} className="p-3.5 border-r border-slate-300 dark:border-slate-700">{b}</th>
              ))}
              <th className="p-3.5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold border-l border-slate-300 dark:border-slate-700">
                TOTAL (KG)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
            {data.map((row, i) => (
              <tr key={i} className="odd:bg-white even:bg-slate-100 dark:odd:bg-slate-900/60 dark:even:bg-slate-800/50 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 transition-colors">
                <td className="p-3.5 font-bold text-left text-slate-900 dark:text-slate-100 sticky left-0 bg-inherit z-10 border-r border-slate-300 dark:border-slate-700">
                  {row.jenis}
                </td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.jan).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.feb).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.mar).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.apr).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.mei).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.jun).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.jul).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.agt).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.sep).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.okt).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.nov).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans border-r border-slate-300 dark:border-slate-700">{Number(row.des).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans font-bold text-emerald-700 dark:text-emerald-400 bg-slate-50/80 dark:bg-slate-800/80 border-l border-slate-300 dark:border-slate-700">
                  {Number(row.total).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
