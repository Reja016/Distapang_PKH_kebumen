import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ApbdTarget, Droping } from './types';

interface VaksinasiApbdTabProps {
  selectedYear: number;
  canEdit: boolean;
  canCreate?: boolean;
  apbdTarget: ApbdTarget[];
  droping: Droping[];
  openAddDroping: () => void;
  openEditDroping: (item: Droping) => void;
  deleteDroping: (item: Droping) => void;
}

export default function VaksinasiApbdTab({
  selectedYear,
  canEdit,
  canCreate,
  apbdTarget,
  droping,
  openAddDroping,
  openEditDroping,
  deleteDroping,
}: VaksinasiApbdTabProps) {

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Target APBD Jateng */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Target Alokasi Vaksin APBD Jateng {selectedYear}
            </h3>
            <p className="text-xs text-slate-500">
              Daftar alokasi vaksin LSD, ND-AI, Rabies, dan Aphtovaks per puskeswan
            </p>
          </div>
        </div>

        <div className="border-2 border-slate-700 bg-white shadow-md rounded-xl overflow-hidden -mx-4 sm:mx-0">
          <div className="overflow-x-auto touch-pan-x">
            <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
              <thead className="bg-slate-200 text-slate-950 font-black uppercase tracking-wider border-b-2 border-slate-700">
                <tr>
                  <th className="p-3 text-center w-12 border-r-2 border-slate-500">NO</th>
                  <th className="p-3 border-r-2 border-slate-500">PUSKESWAN</th>
                  <th className="p-3 text-right font-sans border-r-2 border-slate-500">TARGET LSD</th>
                  <th className="p-3 text-right font-sans border-r-2 border-slate-500">TARGET ND-AI</th>
                  <th className="p-3 text-right font-sans border-r-2 border-slate-500">TARGET RABIES</th>
                  <th className="p-3 text-right font-sans border-r-2 border-slate-500">TARGET APHTOVAKS</th>
                  <th className="p-3 border-r-2 border-slate-500">AMBIL ND-AI</th>
                  <th className="p-3 border-r-2 border-slate-500">AMBIL APHTOVAKS</th>
                  <th className="p-3">CATATAN</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-400 text-slate-900 font-medium">
                {apbdTarget.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/50 transition-colors border-b-2 border-slate-400">
                    <td className="p-3 text-center font-black text-slate-700 border-r-2 border-slate-400 bg-slate-100">{row.no_urut}</td>
                    <td className="p-3 font-black text-slate-950 border-r-2 border-slate-400">{row.puskeswan}</td>
                    <td className="p-3 text-right font-sans font-bold border-r-2 border-slate-400">{row.target_lsd.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-right font-sans font-bold border-r-2 border-slate-400">{row.target_ndai.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-right font-sans font-bold border-r-2 border-slate-400">{row.target_rabies.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-right font-sans font-bold border-r-2 border-slate-400">{row.target_aphtovaks.toLocaleString('id-ID')}</td>
                    <td className="p-3 font-sans font-bold border-r-2 border-slate-400">{row.pengambilan_ndai || '-'}</td>
                    <td className="p-3 font-sans font-bold border-r-2 border-slate-400">{row.pengambilan_aphtovaks || '-'}</td>
                    <td className="p-3 text-slate-700 font-semibold">{row.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Droping Vaksin */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Log Penerimaan / Droping Vaksin</h3>
            <p className="text-xs text-slate-500">Riwayat penerimaan suplai vaksin dari dinas/provinsi</p>
          </div>
          {(canCreate ?? canEdit) && (
            <button
              onClick={openAddDroping}
              className="min-h-touch h-10 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Catat Droping</span>
            </button>
          )}

        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {droping.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-sm">{d.merk_vaksin}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(d.tanggal).toLocaleDateString('id-ID')} · {d.keterangan || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-sans font-bold text-blue-600 text-sm bg-blue-600/10 px-2.5 py-1 rounded-lg">
                    {d.jumlah} Dosis
                  </span>
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditDroping(d)}
                        className="min-h-touch h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => deleteDroping(d)}
                        className="min-h-touch h-7 w-7 rounded-lg border border-red-200 bg-red-50 text-red-600 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
