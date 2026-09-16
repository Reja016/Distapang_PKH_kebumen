import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Bulanan, BULAN_LABEL, BULAN_KEY, n } from './types';

interface VaksinasiBulananTabProps {
  selectedYear: number;
  canEdit: boolean;
  canCreate?: boolean;
  bulanan: Bulanan[];
  totalBulanan: { target: number; pengambilan: number; realisasi: number; kekurangan: number };
  editingBulananCell: { id: number; field: 'target' | 'pengambilan' } | null;
  editBulananValue: string;
  setEditBulananValue: (val: string) => void;
  saveEditBulananCell: () => void;
  setEditingBulananCell: (val: { id: number; field: 'target' | 'pengambilan' } | null) => void;
  startEditBulananCell: (id: number, field: 'target' | 'pengambilan', currentVal: number) => void;
  bulananInputRef: React.RefObject<HTMLInputElement | null>;
  openAddBulanan: () => void;
  openEditBulanan: (item: Bulanan) => void;
  deleteBulanan: (item: Bulanan) => void;
}

export default function VaksinasiBulananTab({
  selectedYear,
  canEdit,
  canCreate,
  bulanan,
  totalBulanan,
  editingBulananCell,
  editBulananValue,
  setEditBulananValue,
  saveEditBulananCell,
  setEditingBulananCell,
  startEditBulananCell,
  bulananInputRef,
  openAddBulanan,
  openEditBulanan,
  deleteBulanan,
}: VaksinasiBulananTabProps) {

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">
            Capaian Vaksinasi Per Puskeswan (Akumulasi Bulanan {selectedYear})
          </h3>
          <p className="text-xs text-slate-600 font-semibold">
            Target dan realisasi droping vaksin per puskeswan tahun {selectedYear} &bull; Klik kotak Target / Ambil untuk edit langsung
          </p>
        </div>
        {(canCreate ?? canEdit) && (
          <button
            onClick={openAddBulanan}
            className="min-h-touch h-10 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah Puskeswan</span>
          </button>
        )}

      </div>

      <div className="border-2 border-slate-700 bg-white shadow-md rounded-xl overflow-hidden -mx-4 sm:mx-0">
        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
            <thead className="bg-slate-200 text-slate-900 font-extrabold uppercase tracking-wider border-b-2 border-slate-700">
              <tr>
                <th className="p-3 text-center w-12 sticky left-0 bg-slate-300 z-10 border-r-2 border-slate-500 font-black">NO</th>
                <th className="p-3 sticky left-12 bg-slate-300 z-10 border-r-2 border-slate-700 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.15)] font-black">PUSKESWAN</th>
                <th className="p-3 text-right font-sans border-r-2 border-slate-500 min-w-[100px] font-black">TARGET</th>
                <th className="p-3 text-right font-sans border-r-2 border-slate-500 min-w-[100px] font-black">AMBIL</th>
                <th className="p-3 text-right font-sans text-emerald-950 bg-emerald-100 font-black border-r-2 border-slate-500">REALISASI</th>
                <th className="p-3 text-right font-sans text-rose-950 bg-rose-100 font-black border-r-2 border-slate-500">KURANG</th>
                {BULAN_LABEL.slice(1).map((m) => (
                  <th key={m} className="p-3 text-right font-sans border-r-2 border-slate-500 font-black">{m}</th>
                ))}
                {canEdit && <th className="p-3 text-center w-20 font-black">AKSI</th>}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-400 text-slate-900 font-medium">
              {bulanan.map((row) => {
                const isEditingTarget = editingBulananCell?.id === row.id && editingBulananCell?.field === 'target';
                const isEditingAmbil = editingBulananCell?.id === row.id && editingBulananCell?.field === 'pengambilan';

                return (
                  <tr key={row.id} className="hover:bg-blue-50/50 transition-colors border-b-2 border-slate-400">
                    <td className="p-3 text-center font-black text-slate-700 sticky left-0 bg-slate-100 z-10 border-r-2 border-slate-500">
                      {row.no_urut}
                    </td>
                    <td className="p-3 font-black text-slate-950 sticky left-12 bg-white z-10 border-r-2 border-slate-700 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.12)]">
                      {row.puskeswan}
                    </td>

                    {/* Editable Target */}
                    <td
                      onClick={() => startEditBulananCell(row.id, 'target', row.target)}
                      className="p-2 text-right font-sans border-r-2 border-slate-400 cursor-pointer"
                    >
                      {isEditingTarget ? (
                        <input
                          ref={bulananInputRef as any}
                          type="number"
                          value={editBulananValue}
                          onChange={(e) => setEditBulananValue(e.target.value)}
                          onBlur={saveEditBulananCell}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditBulananCell();
                            else if (e.key === 'Escape') setEditingBulananCell(null);
                          }}
                          className="w-24 text-right py-1 px-2 text-xs font-black border-2 border-blue-600 ring-2 ring-blue-300 rounded-md bg-white text-blue-900"
                        />
                      ) : (
                        <div className="py-1 px-2 rounded-md border-2 border-blue-500 bg-blue-50 font-black text-blue-950 hover:border-blue-700 hover:bg-blue-100 transition-all shadow-xs">
                          {row.target.toLocaleString('id-ID')}
                        </div>
                      )}
                    </td>

                    {/* Editable Pengambilan */}
                    <td
                      onClick={() => startEditBulananCell(row.id, 'pengambilan', row.pengambilan)}
                      className="p-2 text-right font-sans border-r-2 border-slate-400 cursor-pointer"
                    >
                      {isEditingAmbil ? (
                        <input
                          ref={bulananInputRef as any}
                          type="number"
                          value={editBulananValue}
                          onChange={(e) => setEditBulananValue(e.target.value)}
                          onBlur={saveEditBulananCell}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditBulananCell();
                            else if (e.key === 'Escape') setEditingBulananCell(null);
                          }}
                          className="w-24 text-right py-1 px-2 text-xs font-black border-2 border-blue-600 ring-2 ring-blue-300 rounded-md bg-white text-blue-900"
                        />
                      ) : (
                        <div className="py-1 px-2 rounded-md border-2 border-blue-500 bg-blue-50 font-black text-blue-950 hover:border-blue-700 hover:bg-blue-100 transition-all shadow-xs">
                          {row.pengambilan.toLocaleString('id-ID')}
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-right font-sans font-black text-emerald-950 bg-emerald-100/70 border-r-2 border-slate-400">
                      {row.realisasi.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-right font-sans font-black text-rose-950 bg-rose-100/70 border-r-2 border-slate-400">
                      {row.kekurangan.toLocaleString('id-ID')}
                    </td>
                    {BULAN_KEY.map((k) => (
                      <td key={k} className="p-3 text-right font-sans border-r-2 border-slate-400 font-bold">
                        {n(row[k]) > 0 ? n(row[k]).toLocaleString('id-ID') : '-'}
                      </td>
                    ))}
                    {canEdit && (
                      <td className="p-3 text-center border-l-2 border-slate-400">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditBulanan(row)}
                            className="h-7 w-7 border border-slate-300 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => deleteBulanan(row)}
                            className="h-7 w-7 border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-slate-200 font-black text-slate-900 border-t-2 border-slate-400">
                <td colSpan={2} className="p-3 text-center sticky left-0 bg-slate-200 z-10 border-r-2 border-slate-400">
                  JUMLAH TOTAL
                </td>
                <td className="p-3 text-right font-sans border-r border-slate-300">{totalBulanan.target.toLocaleString('id-ID')}</td>
                <td className="p-3 text-right font-sans border-r border-slate-300">{totalBulanan.pengambilan.toLocaleString('id-ID')}</td>
                <td className="p-3 text-right font-sans text-emerald-900 border-r border-slate-300">{totalBulanan.realisasi.toLocaleString('id-ID')}</td>
                <td className="p-3 text-right font-sans text-rose-800 border-r border-slate-300">{totalBulanan.kekurangan.toLocaleString('id-ID')}</td>
                {BULAN_KEY.map((k) => {
                  const sumM = bulanan.reduce((sum, r) => sum + n(r[k]), 0);
                  return (
                    <td key={k} className="p-3 text-right font-sans border-r border-slate-300">
                      {sumM > 0 ? sumM.toLocaleString('id-ID') : '-'}
                    </td>
                  );
                })}
                {canEdit && <td />}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
