'use client';

import React from 'react';
import { BULAN_NAMES, LOKASI_CONFIGS, getTableSummary } from './types';

interface RumpunTableTabProps {
  selectedLokasiKey: string;
  setSelectedLokasiKey: (key: string) => void;
  rumpunData: Record<string, any[]>;
  selectedYear: number;
  canEdit: boolean;
  isAdmin: boolean;
  rumpunSaveMessage: string;
  handleRumpunCellChange: (lokasiKey: string, monthIndex: number, field: string, value: any) => void;
}

export function RumpunTableTab({
  selectedLokasiKey,
  setSelectedLokasiKey,
  rumpunData,
  selectedYear,
  canEdit,
  isAdmin,
  rumpunSaveMessage,
  handleRumpunCellChange,
}: RumpunTableTabProps) {
  const activeCfg = LOKASI_CONFIGS.find((c) => c.key === selectedLokasiKey) || LOKASI_CONFIGS[0];
  const isGombong = activeCfg.key === 'rph_gombong' || activeCfg.key === 'luar_rph_gombong';
  const rows = rumpunData[activeCfg.key] || [];
  const summary = getTableSummary(rows);

  return (
    <div className="space-y-4">
      {/* Horizontal Button Switcher untuk 4 Lokasi */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
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
                    : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700'
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

      {/* TABEL LOKASI TERPILIH DENGAN TOTAL TERPISAH */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4 sm:p-6 animate-in fade-in duration-150">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600" />
              <span>{activeCfg.label}</span>
            </h3>
            <p className="text-xs text-slate-500">{activeCfg.subtitle} &bull; Periode Tahun {selectedYear}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-black text-purple-800">
              Total Pemotongan: {summary.grand_total.toLocaleString('id-ID')} Ekor
            </span>
          </div>
        </div>

        {/* Spreadsheet Inline-Editable Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1280px] text-center text-xs border-collapse">
            <thead>
              {/* Level 1 Header: Rumpun Sapi & Babi & Total Terpisah */}
              <tr className="bg-purple-900 text-white font-bold border border-purple-950">
                <th rowSpan={2} className="p-3 border border-purple-800 text-center w-28 min-w-[110px] bg-purple-950 sticky left-0 z-20">
                  BULAN
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
                  TOTAL BULANAN
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
                {/* Total Terpisah Setiap Bulan */}
                <th className="p-2 border border-purple-200 bg-purple-100/90 text-purple-950 min-w-[68px]">Total J</th>
                <th className="p-2 border border-purple-200 bg-purple-100/90 text-purple-950 min-w-[68px]">Total BP</th>
                <th className="p-2 border border-purple-200 bg-purple-100/90 text-purple-950 min-w-[68px]">Total BT</th>
                <th className="p-2 border border-purple-200 bg-purple-200 text-purple-950 font-black min-w-[80px]">Total Bulan</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, monthIdx) => {
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

                const bj = isGombong ? (Number(row.babi_jantan) || 0) : 0;
                const bb = isGombong ? (Number(row.babi_betina) || Number(row.babi_betina_prod) || 0) : 0;

                const rowTotalJantan = pj + sj + smj + lj + bj;
                const rowTotalBetinaProd = pbp + sbp + smbp + lbp + bb;
                const rowTotalBetinaNon = pbnp + sbnp + smbnp + lbnp;
                const rowGrandTotal = rowTotalJantan + rowTotalBetinaProd + rowTotalBetinaNon;

                return (
                  <tr key={monthIdx} className="hover:bg-purple-50/40 transition-colors">
                    {/* Month Name */}
                    <td className="p-2 border border-slate-200 font-bold text-slate-900 bg-slate-50 sticky left-0 z-10 text-left pl-3.5">
                      {row.bulan || BULAN_NAMES[monthIdx]}
                    </td>

                    {/* PO */}
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.po_jantan ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'po_jantan', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.po_jantan || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.po_betina_prod ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'po_betina_prod', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.po_betina_prod || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.po_betina_non_prod ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'po_betina_non_prod', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.po_betina_non_prod || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>

                    {/* SO */}
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.so_jantan ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'so_jantan', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.so_jantan || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.so_betina_prod ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'so_betina_prod', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.so_betina_prod || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.so_betina_non_prod ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'so_betina_non_prod', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.so_betina_non_prod || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>

                    {/* Simmental */}
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.simmental_jantan ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'simmental_jantan', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.simmental_jantan || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.simmental_betina_prod ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'simmental_betina_prod', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.simmental_betina_prod || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.simmental_betina_non_prod ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'simmental_betina_non_prod', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.simmental_betina_non_prod || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>

                    {/* Limousine */}
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.limousine_jantan ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'limousine_jantan', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.limousine_jantan || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.limousine_betina_prod ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'limousine_betina_prod', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.limousine_betina_prod || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="p-1 border border-slate-200">
                      {canEdit || isAdmin ? (
                        <input
                          type="number"
                          min="0"
                          value={row.limousine_betina_non_prod ?? 0}
                          onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'limousine_betina_non_prod', e.target.value)}
                          className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-slate-800">{(row.limousine_betina_non_prod || 0).toLocaleString('id-ID')}</span>
                      )}
                    </td>

                    {/* Babi (Hanya J dan B - Khusus Gombong & Luar Gombong) */}
                    {isGombong && (
                      <>
                        <td className="p-1 border border-slate-200 bg-rose-50/30">
                          {canEdit || isAdmin ? (
                            <input
                              type="number"
                              min="0"
                              value={row.babi_jantan ?? 0}
                              onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'babi_jantan', e.target.value)}
                              className="w-full h-8 text-center rounded border border-rose-200 focus:border-rose-600 focus:bg-white bg-white font-mono font-bold text-slate-900 text-xs outline-none"
                            />
                          ) : (
                            <span className="font-mono font-bold text-slate-800">{(row.babi_jantan || 0).toLocaleString('id-ID')}</span>
                          )}
                        </td>
                        <td className="p-1 border border-slate-200 bg-rose-50/30">
                          {canEdit || isAdmin ? (
                            <input
                              type="number"
                              min="0"
                              value={row.babi_betina ?? (row.babi_betina_prod || 0)}
                              onChange={(e) => {
                                handleRumpunCellChange(activeCfg.key, monthIdx, 'babi_betina_prod', e.target.value);
                                handleRumpunCellChange(activeCfg.key, monthIdx, 'babi_betina', e.target.value);
                              }}
                              className="w-full h-8 text-center rounded border border-rose-200 focus:border-rose-600 focus:bg-white bg-white font-mono font-bold text-slate-900 text-xs outline-none"
                            />
                          ) : (
                            <span className="font-mono font-bold text-slate-800">{(Number(row.babi_betina) || Number(row.babi_betina_prod) || 0).toLocaleString('id-ID')}</span>
                          )}
                        </td>
                      </>
                    )}

                    {/* TOTAL TERPISAH SETIAP BULAN */}
                    <td className="p-2 border border-slate-200 font-mono font-bold text-slate-900 bg-purple-50/30">
                      {rowTotalJantan.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2 border border-slate-200 font-mono font-bold text-slate-900 bg-purple-50/30">
                      {rowTotalBetinaProd.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2 border border-slate-200 font-mono font-bold text-slate-900 bg-purple-50/30">
                      {rowTotalBetinaNon.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2 border border-slate-200 font-extrabold font-mono text-purple-900 bg-purple-100/70">
                      {rowGrandTotal.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* SUMMARY / TOTALS FOOTER ROW */}
            <tfoot>
              <tr className="bg-purple-100/90 text-purple-950 font-bold border border-purple-200">
                <td className="p-3 border border-purple-200 font-black text-left pl-3.5 sticky left-0 z-10 bg-purple-100">
                  TOTAL TAHUNAN
                </td>
                {/* PO */}
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.po_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.po_betina_prod.toLocaleString('id-ID')}</td>
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.po_betina_non_prod.toLocaleString('id-ID')}</td>
                {/* SO */}
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.so_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.so_betina_prod.toLocaleString('id-ID')}</td>
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.so_betina_non_prod.toLocaleString('id-ID')}</td>
                {/* Simmental */}
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.simmental_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.simmental_betina_prod.toLocaleString('id-ID')}</td>
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.simmental_betina_non_prod.toLocaleString('id-ID')}</td>
                {/* Limousine */}
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.limousine_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.limousine_betina_prod.toLocaleString('id-ID')}</td>
                <td className="p-2 border border-purple-200 font-mono font-bold">{summary.limousine_betina_non_prod.toLocaleString('id-ID')}</td>
                {/* Babi Footer */}
                {isGombong && (
                  <>
                    <td className="p-2 border border-purple-200 font-mono font-bold bg-rose-100/70 text-rose-950">{summary.babi_jantan.toLocaleString('id-ID')}</td>
                    <td className="p-2 border border-purple-200 font-mono font-bold bg-rose-100/70 text-rose-950">{summary.babi_betina.toLocaleString('id-ID')}</td>
                  </>
                )}
                {/* Subtotals Footer */}
                <td className="p-2 border border-purple-200 font-mono font-black text-purple-950 bg-purple-200/60">{summary.total_jantan.toLocaleString('id-ID')}</td>
                <td className="p-2 border border-purple-200 font-mono font-black text-purple-950 bg-purple-200/60">{summary.total_betina_prod.toLocaleString('id-ID')}</td>
                <td className="p-2 border border-purple-200 font-mono font-black text-purple-950 bg-purple-200/60">{summary.total_betina_non_prod.toLocaleString('id-ID')}</td>
                <td className="p-2.5 border border-purple-200 font-black font-mono text-purple-950 bg-purple-300/80 text-sm">
                  {summary.grand_total.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
