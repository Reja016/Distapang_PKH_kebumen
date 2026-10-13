'use client';

import React from 'react';
import { Loader2, Lock, Unlock, ShieldCheck, AlertCircle } from 'lucide-react';
import { BULAN_NAMES, LOKASI_CONFIGS, getKomoditasDailySummary } from './types';
import { isDayLocked, getDayNameIndo } from './timeLock';

interface KomoditasTableTabProps {
  selectedLokasiKey: string;
  setSelectedLokasiKey: (val: string) => void;
  komoditasSaveMessage: string;
  isLoadingKomoditas: boolean;
  komoditasData: Record<string, any[]>;
  selectedYear: number;
  selectedMonth: number;
  canEdit: boolean;
  isAdmin: boolean;
  handleKomoditasCellChange: (lokasiKey: string, dayIndex: number, field: string, val: any) => void;
}

export function KomoditasTableTab({
  selectedLokasiKey,
  setSelectedLokasiKey,
  komoditasSaveMessage,
  isLoadingKomoditas,
  komoditasData,
  selectedYear,
  selectedMonth,
  canEdit,
  isAdmin,
  handleKomoditasCellChange,
}: KomoditasTableTabProps) {
  const activeCfg = LOKASI_CONFIGS.find((c) => c.key === selectedLokasiKey) || LOKASI_CONFIGS[0];
  const rows = komoditasData[activeCfg.key] || [];
  const summary = getKomoditasDailySummary(rows);
  const bulanName = BULAN_NAMES[selectedMonth - 1] || 'Bulan';

  return (
    <div className="space-y-4">
      {/* Location Switcher Toolbar */}
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

        {komoditasSaveMessage && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 animate-in fade-in">
            {komoditasSaveMessage}
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
                <strong>Aturan Pengisian:</strong> Pengisian data pemotongan komoditas hanya berlaku pada hari ini hingga <strong>maksimal 3 hari ke belakang (H-3)</strong>.
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

      {/* Table TPH Komoditas Harian */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-xs overflow-hidden p-4 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600" />
              <span>{activeCfg.label} - Pemotongan Komoditas Ternak</span>
            </h3>
            <p className="text-xs text-slate-500">
              Tempat Pemotongan Hewan (TPH) &bull; Output Harian {bulanName} {selectedYear}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-black text-purple-800">
              Total {bulanName}: {summary.grand_total.toLocaleString('id-ID')} Ekor
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
          <table className="w-full min-w-[1280px] text-center text-xs border-collapse">
            <thead>
              <tr className="bg-purple-900 text-white font-bold border border-purple-950">
                <th rowSpan={2} className="p-3 border border-purple-800 w-36 min-w-[130px] bg-purple-950 sticky left-0 z-20">
                  TANGGAL
                </th>
                <th colSpan={2} className="p-2.5 border border-purple-800 bg-purple-900/95 text-purple-100 text-xs">
                  SAPI POTONG
                </th>
                <th colSpan={2} className="p-2.5 border border-purple-800 bg-purple-900/85 text-purple-100 text-xs">
                  KUDA
                </th>
                <th colSpan={2} className="p-2.5 border border-purple-800 bg-purple-900/95 text-purple-100 text-xs">
                  BABI
                </th>
                <th colSpan={2} className="p-2.5 border border-purple-800 bg-purple-900/85 text-purple-100 text-xs">
                  KAMBING
                </th>
                <th colSpan={2} className="p-2.5 border border-purple-800 bg-purple-900/95 text-purple-100 text-xs">
                  DOMBA
                </th>
                <th colSpan={3} className="p-2.5 border border-purple-800 bg-purple-950 text-purple-100 font-extrabold text-xs">
                  TOTAL HARIAN
                </th>
              </tr>
              <tr className="bg-purple-50 text-purple-950 font-bold border border-purple-200 text-[11px]">
                <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">B</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">B</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">B</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">B</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                <th className="p-2 border border-purple-200 min-w-[65px]">B</th>
                <th className="p-2 border border-purple-200 bg-purple-100/90 text-purple-950 min-w-[75px]">Total J</th>
                <th className="p-2 border border-purple-200 bg-purple-100/90 text-purple-950 min-w-[75px]">Total B</th>
                <th className="p-2 border border-purple-200 bg-purple-200 text-purple-950 font-black min-w-[85px]">Total Hari</th>
              </tr>
            </thead>

            <tbody>
              {isLoadingKomoditas ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mr-2 text-purple-600" size={16} />
                    Memuat data pemotongan komoditas...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-slate-400">
                    Belum ada data untuk periode {bulanName} {selectedYear}.
                  </td>
                </tr>
              ) : (
                rows.map((row, dayIdx) => {
                  const dayNum = row.hari || dayIdx + 1;
                  const dayName = getDayNameIndo(selectedYear, selectedMonth, dayNum);
                  const lockStatus = isDayLocked(selectedYear, selectedMonth, dayNum, isAdmin);
                  const isLocked = !canEdit || lockStatus.isLocked;

                  const sj = Number(row.sapi_jantan) || 0;
                  const sb = Number(row.sapi_betina) || 0;
                  const kj = Number(row.kuda_jantan) || 0;
                  const kb = Number(row.kuda_betina) || 0;
                  const bj = Number(row.babi_jantan) || 0;
                  const bb = Number(row.babi_betina) || 0;
                  const kmj = Number(row.kambing_jantan) || 0;
                  const kmb = Number(row.kambing_betina) || 0;
                  const dj = Number(row.domba_jantan) || 0;
                  const db = Number(row.domba_betina) || 0;

                  const totJantan = sj + kj + bj + kmj + dj;
                  const totBetina = sb + kb + bb + kmb + db;
                  const grandHari = totJantan + totBetina;

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
                      {/* Tanggal Sticky */}
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

                      {/* Sapi: J, B */}
                      <td className="p-1 border border-slate-300 dark:border-slate-700">
                        <input
                          type="number"
                          min="0"
                          disabled={isLocked}
                          value={row.sapi_jantan ?? 0}
                          onChange={(e) => handleKomoditasCellChange(activeCfg.key, dayIdx, 'sapi_jantan', Math.max(0, parseInt(e.target.value, 10) || 0))}
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
                          value={row.sapi_betina ?? 0}
                          onChange={(e) => handleKomoditasCellChange(activeCfg.key, dayIdx, 'sapi_betina', Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                            isLocked
                              ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                              : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                          }`}
                        />
                      </td>

                      {/* Kuda: J, B */}
                      <td className="p-1 border border-slate-300 dark:border-slate-700">
                        <input
                          type="number"
                          min="0"
                          disabled={isLocked}
                          value={row.kuda_jantan ?? 0}
                          onChange={(e) => handleKomoditasCellChange(activeCfg.key, dayIdx, 'kuda_jantan', Math.max(0, parseInt(e.target.value, 10) || 0))}
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
                          value={row.kuda_betina ?? 0}
                          onChange={(e) => handleKomoditasCellChange(activeCfg.key, dayIdx, 'kuda_betina', Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                            isLocked
                              ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                              : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                          }`}
                        />
                      </td>

                      {/* Babi: J, B */}
                      <td className="p-1 border border-slate-300 dark:border-slate-700">
                        <input
                          type="number"
                          min="0"
                          disabled={isLocked}
                          value={row.babi_jantan ?? 0}
                          onChange={(e) => handleKomoditasCellChange(activeCfg.key, dayIdx, 'babi_jantan', Math.max(0, parseInt(e.target.value, 10) || 0))}
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
                          value={row.babi_betina ?? 0}
                          onChange={(e) => handleKomoditasCellChange(activeCfg.key, dayIdx, 'babi_betina', Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                            isLocked
                              ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                              : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                          }`}
                        />
                      </td>

                      {/* Kambing: J, B */}
                      <td className="p-1 border border-slate-300 dark:border-slate-700">
                        <input
                          type="number"
                          min="0"
                          disabled={isLocked}
                          value={row.kambing_jantan ?? 0}
                          onChange={(e) => handleKomoditasCellChange(activeCfg.key, dayIdx, 'kambing_jantan', Math.max(0, parseInt(e.target.value, 10) || 0))}
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
                          value={row.kambing_betina ?? 0}
                          onChange={(e) => handleKomoditasCellChange(activeCfg.key, dayIdx, 'kambing_betina', Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                            isLocked
                              ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                              : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                          }`}
                        />
                      </td>

                      {/* Domba: J, B */}
                      <td className="p-1 border border-slate-300 dark:border-slate-700">
                        <input
                          type="number"
                          min="0"
                          disabled={isLocked}
                          value={row.domba_jantan ?? 0}
                          onChange={(e) => handleKomoditasCellChange(activeCfg.key, dayIdx, 'domba_jantan', Math.max(0, parseInt(e.target.value, 10) || 0))}
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
                          value={row.domba_betina ?? 0}
                          onChange={(e) => handleKomoditasCellChange(activeCfg.key, dayIdx, 'domba_betina', Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className={`w-full h-8 text-center rounded border font-mono font-bold text-xs outline-none ${
                            isLocked
                              ? 'bg-transparent border-transparent text-slate-500 cursor-not-allowed'
                              : 'border-slate-300 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-slate-900'
                          }`}
                        />
                      </td>

                      {/* Total Harian */}
                      <td className="p-2 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 bg-purple-50/30">
                        {totJantan.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 bg-purple-50/30">
                        {totBetina.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 font-mono font-black text-purple-950 bg-purple-100/70">
                        {grandHari.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Footer Summary Total Bulan Ini */}
            <tfoot>
              <tr className="bg-purple-950 text-white font-extrabold border-t-2 border-purple-900">
                <td className="p-3 text-center sticky left-0 z-20 bg-purple-950">
                  TOTAL BULAN {bulanName.toUpperCase()}
                </td>
                {/* Sapi */}
                <td className="p-2">{summary.sapi_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.sapi_betina.toLocaleString('id-ID')}</td>
                {/* Kuda */}
                <td className="p-2">{summary.kuda_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.kuda_betina.toLocaleString('id-ID')}</td>
                {/* Babi */}
                <td className="p-2">{summary.babi_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.babi_betina.toLocaleString('id-ID')}</td>
                {/* Kambing */}
                <td className="p-2">{summary.kambing_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.kambing_betina.toLocaleString('id-ID')}</td>
                {/* Domba */}
                <td className="p-2">{summary.domba_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2">{summary.domba_betina.toLocaleString('id-ID')}</td>
                {/* Grand Total */}
                <td className="p-2 bg-purple-900/90 text-purple-200">{summary.total_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2 bg-purple-900/90 text-purple-200">{summary.total_betina.toLocaleString('id-ID')}</td>
                <td className="p-2 bg-purple-900 font-black text-amber-300 text-sm">{summary.grand_total.toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
