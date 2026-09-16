'use client';

import React from 'react';
import { User } from 'lucide-react';
import { Cattle, getCattleStatusData } from './types';

interface SapiTimeSummaryTabProps {
  cattleList: Cattle[];
}

export function SapiTimeSummaryTab({ cattleList }: SapiTimeSummaryTabProps) {
  const sortedCattle = [...cattleList].map(getCattleStatusData).sort((a: any, b: any) => {
    const aDays = a.daysUntil ?? 999;
    const bDays = b.daysUntil ?? 999;
    return aDays - bDays;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="bg-emerald-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Monitoring Status Reproduksi Ternak
            </h2>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Pemantauan siklus estrus, masa bunting, dan perkiraan kelahiran
            </p>
          </div>
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-bold">
            Total: {cattleList.length} Ekor
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4 w-16">No</th>
                <th className="px-6 py-4">Data Peternak &amp; Sapi</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sisa Waktu</th>
                <th className="px-6 py-4 w-[25%]">Progress Siklus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCattle.length > 0 ? (
                sortedCattle.map((cattleData: any, idx: number) => {
                  let progressVal = 0;
                  if (cattleData.eventType === 'birth') {
                    progressVal = Math.min(100, ((285 - Math.max(0, cattleData.daysUntil)) / 285) * 100);
                  } else if (cattleData.eventType === 'estrus') {
                    progressVal = Math.min(
                      100,
                      (((cattleData.cycleLength || 21) - Math.max(0, cattleData.daysUntil)) / (cattleData.cycleLength || 21)) * 100
                    );
                  } else {
                    progressVal = 100;
                  }

                  return (
                    <tr key={cattleData.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-emerald-700 text-xs">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            <User size={15} className="text-slate-400" />
                            {cattleData.ownerName || 'Peternak Tidak Diketahui'}
                          </span>
                          <span className="font-medium text-slate-500 text-xs mt-0.5 ml-5">
                            Sapi: <strong className="text-emerald-700">{cattleData.name}</strong> • ID: {cattleData.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                            cattleData.status === 'Bunting'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {cattleData.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold text-xs"
                          style={{ backgroundColor: cattleData.bgHex, color: cattleData.colorHex }}
                        >
                          {cattleData.eventType === 'birth' || cattleData.eventType === 'estrus'
                            ? `${cattleData.daysUntil} Hari Lagi`
                            : 'Aman'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressVal}%`, backgroundColor: cattleData.colorHex }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Belum ada data sapi di Database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Siklus Estrus Rata-rata</p>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            21 <span className="text-sm font-semibold text-slate-500">Hari</span>
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Lama Estrus Rata-rata</p>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            18 <span className="text-sm font-semibold text-slate-500">Jam</span>
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Masa Kebuntingan Normal</p>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            285 <span className="text-sm font-semibold text-slate-500">Hari</span>
          </p>
        </div>
      </div>
    </div>
  );
}
