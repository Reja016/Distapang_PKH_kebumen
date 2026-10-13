'use client';

import React from 'react';
import { Lock, Unlock, ShieldCheck, AlertCircle } from 'lucide-react';
import { BULAN_NAMES, LOKASI_CONFIGS, getTableSummary } from './types';
import { isDayLocked, getDayNameIndo } from './timeLock';

interface RumpunTableTabProps {
  selectedLokasiKey: string;
  setSelectedLokasiKey: (key: string) => void;
  rumpunData: Record<string, any[]>;
  selectedYear: number;
  selectedMonth: number;
  canEdit: boolean;
  isAdmin: boolean;
  rumpunSaveMessage: string;
  handleRumpunCellChange: (lokasiKey: string, dayIndex: number, field: string, value: any) => void;
}

export function RumpunTableTab({
  selectedLokasiKey,
  setSelectedLokasiKey,
  rumpunData,
  selectedYear,
  selectedMonth,
  canEdit,
  isAdmin,
  rumpunSaveMessage,
  handleRumpunCellChange,
}: RumpunTableTabProps) {
  const activeCfg = LOKASI_CONFIGS.find((c) => c.key === selectedLokasiKey) || LOKASI_CONFIGS[0];
  const isGombong = activeCfg.key === 'rph_gombong' || activeCfg.key === 'luar_rph_gombong';
  const rows = rumpunData[activeCfg.key] || [];
  const summary = getTableSummary(rows);
  const bulanName = BULAN_NAMES[selectedMonth - 1] || 'Bulan';

  return (
    <div className="space-y-4">
      {/* Horizontal Button Switcher untuk 4 Lokasi */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {LOKASI_CONFIGS.map((cfg) => {
            const isActive = selectedLokasiKey === cfg.key;
            return (
              <button
                key={cfg.key}
                onClick={() => setSelectedLokasiKey(cfg.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {rumpunSaveMessage && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 animate-in fade-in">
            {rumpunSaveMessage}
          </span>
        )}
      </div>

      {/* Info Banner Aturan 3 Hari & Role Access */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 text-xs">
        <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-medium">
          {isAdmin ? (
            <>
              <ShieldCheck size={16} className="text-purple-700 dark:text-purple-400 shrink-0" />
              <span>
                <strong>Akses Khusus Administrator:</strong> Anda dapat mengisi &amp; memperbarui data semua tanggal tanpa batasan waktu.
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Aturan Pengisian:</strong> Pengisian data hanya dapat dilakukan pada hari ini hingga <strong>maksimal 3 hari ke belakang (H-3)</strong>. Tanggal yang lebih lama otomatis terkunci.
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
            <Lock size={12} className="text-slate-400" /> Terkunci (&gt;3 hari)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-semibold">
            <Unlock size={12} className="text-emerald-600" /> Aktif (H s/d H-3)
          </span>
        </div>
      </div>

      {/* TABEL LOKASI TERPILIH DENGAN TOTAL TERPISAH */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-xs overflow-hidden space-y-3 p-4 sm:p-6 animate-in fade-in duration-150">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600" />
              <span>{activeCfg.label}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {activeCfg.subtitle} &bull; Output Harian {bulanName} {selectedYear}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-black text-purple-800">
              Total {bulanName}: {summary.grand_total.toLocaleString('id-ID')} Ekor
            </span>
          </div>
        </div>

        {/* Spreadsheet Inline-Editable Table (Baris per Hari) */}
        <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
          <table className="w-full min-w-[1340px] text-center text-xs border-collapse">
            <thead>
              {/* Level 1 Header: Rumpun Sapi & Babi & Total Terpisah */}
              <tr className="bg-purple-900 text-white font-bold border border-purple-950">
                <th rowSpan={2} className="p-3 border border-purple-800 text-center w-36 min-w-[130px] bg-purple-950 sticky left-0 z-20">
                  TANGGAL
                </th>
                <th colSpan={3} className="p-2.5 border border-purple-800 bg-purple-900/95 text-purple-100 text-xs">
                  PERANAKAN ONGOLE (PO)
                </th>
                <th colSpan={3} className="p-2.5 border border-purple-800 bg-purple-900/85 text-purple-100 text-xs">
                  SAPI ONGOLE / JAWA (SO)
                </th>
                <th colSpan={3} className="p-2.5 border border-purple-800 bg-purple-900/95 text-purple-100 text-xs">
                  SIMMENTAL
                </th>
                <th colSpan={3} className="p-2.5 border border-purple-800 bg-purple-900/85 text-purple-100 text-xs">
                  LIMOUSINE
                </th>
                {isGombong && (
                  <th colSpan={2} className="p-2.5 border border-purple-800 bg-rose-900 text-rose-100 font-extrabold text-xs">
                    BABI
                  </th>
                )}
                <th colSpan={4} className="p-2.5 border border-purple-800 bg-purple-950 text-purple-100 font-extrabold text-xs">
                  TOTAL HARIAN
                </th>
              </tr>
              {/* Level 2 Header: Jantan / Betina */}
              <tr className="bg-purple-50 text-purple-950 font-bold border border-purple-200 text-[11px]">
                {/* PO */}
                <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">BP</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">BT</th>
                {/* SO */}
                <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">BP</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">BT</th>
                {/* Simmental */}
                <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">BP</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">BT</th>
                {/* Limousine */}
                <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">BP</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">BT</th>
                {/* Babi (Hanya J dan B) */}
                {isGombong && (
                  <>
                    <th className="p-2 border border-purple-200 bg-rose-100 text-rose-950 font-black min-w-[65px]">J</th>
                    <th className="p-2 border border-purple-200 bg-rose-100 text-rose-950 font-black min-w-[65px]">B</th>
                  </>
                )}
                {/* Total Terpisah Setiap Hari */}
                <th className="p-2 border border-purple-200 bg-purple-100/90 text-purple-950 min-w-[68px]">Total J</th>
                <th className="p-2 border border-purple-200 bg-purple-100/90 text-purple-950 min-w-[68px]">Total BP</th>
                <th className="p-2 border border-purple-200 bg-purple-100/90 text-purple-950 min-w-[68px]">Total BT</th>
                <th className="p-2 border border-purple-200 bg-purple-200 text-purple-950 font-black min-w-[80px]">Total Hari</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, dayIdx) => {
                const dayNum = row.hari || dayIdx + 1;
                const dayName = getDayNameIndo(selectedYear, selectedMonth, dayNum);
                const lockStatus = isDayLocked(selectedYear, selectedMonth, dayNum, isAdmin);
                const isLocked = !canEdit || lockStatus.isLocked;

                const pj = Number(row.po_jantan) || 0;
                const pbp = Number(row.po_betina_prod) || 0;
                const pbnp = Number(row.po_betina_non_prod) || 0;

                const sj = Number(row.so_jantan) || 0;
                const sbp = Number(row.so_betina_prod) || 0;
                const sbnp = Number(row.so_betina_non_prod) || 0;

                const smj = Number(row.simmental_jantan) || 0;
                const smbp = Number(row.simmental_betina_prod) || 0;
                const smbnp = Number(row.simmental_betina_non_prod) || 0;

                const lj = Number(row.limousine_jantan) || 0;
                const lbp = Number(row.limousine_betina_prod) || 0;
                const lbnp = Number(row.limousine_betina_non_prod) || 0;

                const bj = Number(row.babi_jantan) || 0;
                const bb = Number(row.babi_betina_prod) || Number(row.babi_betina) || 0;

                const totJantan = pj + sj + smj + lj + (isGombong ? bj : 0);
                const totBetinaProd = pbp + sbp + smbp + lbp + (isGombong ? bb : 0);
                const totBetinaNonProd = pbnp + sbnp + smbnp + lbnp;
                const grandHari = totJantan + totBetinaProd + totBetinaNonProd;

                const isEven = dayIdx % 2 === 0;

                return (
                  <tr
                    key={dayNum}
                    className={`transition-colors ${
                      lockStatus.isLocked
                        ? 'bg-slate-50/80 hover:bg-slate-100/80 text-slate-500'
                        : isEven
                        ? 'bg-white hover:bg-purple-50/40 text-slate-900'
                        : 'bg-purple-50/20 hover:bg-purple-50/60 text-slate-900'
                    }`}
                  >
                    {/* Sticky Kolom Tanggal */}
                    <td
                      className={`p-2 border border-slate-300 dark:border-slate-700 text-left sticky left-0 z-10 ${
                        lockStatus.isLocked ? 'bg-slate-100' : isEven ? 'bg-white' : 'bg-purple-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 px-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="w-6 text-right font-mono text-purple-950 dark:text-purple-200">
                            {dayNum}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {bulanName.slice(0, 3)} ({dayName})
                          </span>
                        </div>
                        {lockStatus.isLocked ? (
                          <span title={lockStatus.label} className="text-slate-400">
                            <Lock size={13} />
                          </span>
                        ) : (
                          <span title={lockStatus.label} className="text-emerald-600">
                            <Unlock size={13} />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* PO: J, BP, BT */}
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.po_jantan ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'po_jantan', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.po_betina_prod ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'po_betina_prod', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.po_betina_non_prod ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'po_betina_non_prod', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>

                    {/* SO: J, BP, BT */}
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.so_jantan ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'so_jantan', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.so_betina_prod ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'so_betina_prod', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.so_betina_non_prod ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'so_betina_non_prod', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>

                    {/* Simmental: J, BP, BT */}
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.simmental_jantan ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'simmental_jantan', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.simmental_betina_prod ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'simmental_betina_prod', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.simmental_betina_non_prod ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'simmental_betina_non_prod', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>

                    {/* Limousine: J, BP, BT */}
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.limousine_jantan ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'limousine_jantan', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.limousine_betina_prod ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'limousine_betina_prod', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="p-1 border border-slate-300 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={row.limousine_betina_non_prod ?? 0}
                        onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'limousine_betina_non_prod', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                          isLocked
                            ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                            : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                        }`}
                      />
                    </td>

                    {/* Babi (Gombong) */}
                    {isGombong && (
                      <>
                        <td className="p-1 border border-slate-300 dark:border-slate-700 bg-rose-50/40">
                          <input
                            type="number"
                            min="0"
                            disabled={isLocked}
                            value={row.babi_jantan ?? 0}
                            onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'babi_jantan', Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                              isLocked
                                ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                                : 'border-rose-200 focus:border-rose-600 focus:bg-white bg-white text-rose-950'
                            }`}
                          />
                        </td>
                        <td className="p-1 border border-slate-300 dark:border-slate-700 bg-rose-50/40">
                          <input
                            type="number"
                            min="0"
                            disabled={isLocked}
                            value={row.babi_betina_prod ?? row.babi_betina ?? 0}
                            onChange={(e) => handleRumpunCellChange(activeCfg.key, dayIdx, 'babi_betina_prod', Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                              isLocked
                                ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                                : 'border-rose-200 focus:border-rose-600 focus:bg-white bg-white text-rose-950'
                            }`}
                          />
                        </td>
                      </>
                    )}

                    {/* Total Harian */}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 bg-purple-50/30">
                      {totJantan.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 bg-purple-50/30">
                      {totBetinaProd.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 bg-purple-50/30">
                      {totBetinaNonProd.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2 border border-slate-300 dark:border-slate-700 font-mono font-black text-purple-950 bg-purple-100/70">
                      {grandHari.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer Summary Total Bulan Ini */}
            <tfoot>
              <tr className="bg-purple-950 text-white font-extrabold border-t-2 border-purple-900">
                <td className="p-3 text-center sticky left-0 z-20 bg-purple-950">
                  TOTAL BULAN {bulanName.toUpperCase()}
                </td>
                {/* PO */}
                <td className="p-2">{summary.po_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.po_betina_prod.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.po_betina_non_prod.toLocaleString('id-ID')}</td>
                {/* SO */}
                <td className="p-2">{summary.so_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.so_betina_prod.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.so_betina_non_prod.toLocaleString('id-ID')}</td>
                {/* Simmental */}
                <td className="p-2">{summary.simmental_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.simmental_betina_prod.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.simmental_betina_non_prod.toLocaleString('id-ID')}</td>
                {/* Limousine */}
                <td className="p-2">{summary.limousine_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.limousine_betina_prod.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.limousine_betina_non_prod.toLocaleString('id-ID')}</td>
                {/* Babi */}
                {isGombong && (
                  <>
                    <td className="p-2 text-rose-200">{summary.babi_jantan.toLocaleString('id-ID')}</td>
                    <td className="p-2 text-rose-200">{summary.babi_betina.toLocaleString('id-ID')}</td>
                  </>
                )}
                {/* Grand Total */}
                <td className="p-2 bg-purple-900/90 text-purple-200">{summary.total_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2 bg-purple-900/90 text-purple-200">{summary.total_betina_prod.toLocaleString('id-ID')}</td>
                <td className="p-2 bg-purple-900/90 text-purple-200">{summary.total_betina_non_prod.toLocaleString('id-ID')}</td>
                <td className="p-2 bg-purple-900 font-black text-amber-300 text-sm">{summary.grand_total.toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
