'use client';

import React from 'react';

interface SapiTimeHistoryTabProps {
  historyList: any[];
}

export function SapiTimeHistoryTab({ historyList }: SapiTimeHistoryTabProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs animate-in fade-in">
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
        Riwayat Log Aktivitas Sistem
      </h2>
      <div className="space-y-3">
        {historyList.map((item, idx) => (
          <div
            key={idx}
            className="flex gap-3.5 items-start p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors"
          >
            <div className="text-xl p-2.5 bg-white rounded-lg border border-slate-200 shrink-0">
              {item.icon}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-slate-900 mb-0.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="truncate">{item.cattle}</span>
                <span className="text-[11px] font-normal text-slate-400">
                  {new Date(item.date).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </h4>
              <p className="text-xs text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
        {historyList.length === 0 && (
          <p className="text-center text-slate-400 py-10 text-xs">
            Belum ada riwayat aktivitas.
          </p>
        )}
      </div>
    </div>
  );
}
