import React from 'react';
import { FileSpreadsheet, Download, Edit2, Trash2 } from 'lucide-react';

interface PopulasiTableProps {
  savedData: any[];
  canEdit?: boolean;
  handleDownload: () => void;
  handleEdit: (idx: number) => void;
  handleDelete: (idx: number) => Promise<void>;
  getConciseSummary: (vals: Record<string, string>) => { name: string; total: number }[];
  year: string;
}

export default function PopulasiTable({
  savedData,
  canEdit = true,
  handleDownload,
  handleEdit,
  handleDelete,
  getConciseSummary,
  year,
}: PopulasiTableProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-0">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-emerald-700" />
            <span>Rekapitulasi Desa Terinput ({savedData.length} Desa)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Data siap diekspor ke format berkas Excel resmi 60 kolom dinas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={savedData.length === 0}
            className="min-h-touch h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Download size={15} strokeWidth={2.5} />
            <span>Unduh Excel ({savedData.length})</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3.5 w-12 text-center">NO</th>
              <th className="p-3.5">TRIWULAN</th>
              <th className="p-3.5">KECAMATAN</th>
              <th className="p-3.5">DESA</th>
              <th className="p-3.5">RINGKASAN TERNAK TERISI</th>
              {canEdit && <th className="p-3.5 text-center w-24">AKSI</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {savedData.length > 0 ? (
              savedData.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-3.5 text-center font-sans text-slate-400">{i + 1}</td>
                  <td className="p-3.5 font-bold text-emerald-800">{d.tw}</td>
                  <td className="p-3.5 font-bold text-slate-900">{d.kec}</td>
                  <td className="p-3.5 text-slate-700 font-semibold">{d.desa}</td>
                  <td className="p-3.5">
                    {/* Tampilan Mobile: Ringkas & Padat */}
                    <div className="sm:hidden space-y-1.5 py-1">
                      {getConciseSummary(d.values).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {getConciseSummary(d.values).map((s) => (
                            <span
                              key={s.name}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-200 text-[11px]"
                            >
                              <span className="font-semibold text-slate-600">{s.name}:</span>
                              <strong className="font-extrabold text-emerald-800">{s.total.toLocaleString('id-ID')}</strong>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Semua 0 / Belum terisi</span>
                      )}
                    </div>

                    {/* Tampilan Desktop: Lengkap per Rincian Usia */}
                    <div className="hidden sm:flex flex-wrap gap-1.5 max-w-xl py-1">
                      {Object.entries(d.values).filter(([k, v]) => v && v !== '0' && !k.startsWith('Total')).length > 0 ? (
                        Object.entries(d.values)
                          .filter(([k, v]) => v && v !== '0' && !k.startsWith('Total'))
                          .map(([k, v]) => (
                            <span
                              key={k}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-medium shadow-2xs hover:border-emerald-400 transition-colors"
                            >
                              <span className="text-slate-500 font-semibold">{k}:</span>
                              <span className="font-extrabold text-emerald-700">{String(v)}</span>
                            </span>
                          ))
                      ) : getConciseSummary(d.values).length > 0 ? (
                        getConciseSummary(d.values).map((s) => (
                          <span
                            key={s.name}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-emerald-300 bg-emerald-50 text-slate-800 text-xs font-medium shadow-2xs hover:border-emerald-400 transition-colors"
                          >
                            <span className="text-slate-600 font-semibold">{s.name}:</span>
                            <span className="font-extrabold text-emerald-800">{s.total.toLocaleString('id-ID')}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Semua 0 / Belum terisi</span>
                      )}
                    </div>
                  </td>
                  {canEdit && (
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(i)}
                          className="min-h-touch h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit Data Desa"
                        >
                          <Edit2 size={13} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(i)}
                          className="min-h-touch h-8 w-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus Data Desa"
                        >
                          <Trash2 size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canEdit ? 6 : 5} className="p-12 text-center text-slate-400 text-sm font-medium">
                  Belum ada data desa yang diinput pada sesi tahun {year}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
