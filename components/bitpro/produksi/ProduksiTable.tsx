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
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3.5 text-left sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                {firstColLabel}
              </th>
              {bulan.map((b) => (
                <th key={b} className="p-3.5">{b}</th>
              ))}
              <th className="p-3.5 bg-slate-100 text-slate-900 font-bold border-l border-slate-200">
                TOTAL (KG)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5 font-bold text-left text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100">
                  {row.jenis}
                </td>
                <td className="p-3.5 font-sans">{Number(row.jan).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans">{Number(row.feb).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans">{Number(row.mar).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans">{Number(row.apr).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans">{Number(row.mei).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans">{Number(row.jun).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans">{Number(row.jul).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans">{Number(row.agt).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans">{Number(row.sep).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans">{Number(row.okt).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans">{Number(row.nov).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans">{Number(row.des).toLocaleString('id-ID')}</td>
                <td className="p-3.5 font-sans font-bold text-emerald-700 bg-slate-50/80 border-l border-slate-100">
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
