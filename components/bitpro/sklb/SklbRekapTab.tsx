'use client';

import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface SklbRekapTabProps {
  tabelKiri: any[];
  tabelKanan: any[];
  selectedYear: number;
  canCreate?: boolean;
  canEdit: boolean;
  onOpenModalRekap: (mode: 'tambah' | 'edit', data: any) => void;
  onDeleteRekap: (id: number) => void;
}

export function SklbRekapTab({
  tabelKiri,
  tabelKanan,
  selectedYear,
  canCreate,
  canEdit,
  onOpenModalRekap,
  onDeleteRekap,
}: SklbRekapTabProps) {
  const sum = (data: any[], key: string) =>
    data.reduce((acc, row) => acc + (row[key] || 0), 0);

  const TabelRekapCapaian = ({
    data,
    judul,
    grup,
  }: {
    data: any[];
    judul: string;
    grup: string;
  }) => (
    <div className="rounded-none border-2 border-slate-300 bg-white overflow-hidden flex flex-col h-full">
      <div className="p-3.5 bg-slate-100 border-b-2 border-slate-300 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-tight">
            {judul}
          </h3>
          <span className="text-[11px] font-sans text-slate-600">
            {data.length} Lokasi Terjadwal
          </span>
        </div>
        {(canCreate ?? canEdit) && (
          <button
            onClick={() =>
              onOpenModalRekap('tambah', {
                grup,
                no_urut: data.length + 1,
                tahun: selectedYear,
              })
            }
            className="rounded-none min-h-touch h-8 px-3 bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-xs text-center whitespace-nowrap border-collapse">
          <thead className="bg-slate-200/90 text-slate-800 font-bold uppercase tracking-wider border-b-2 border-slate-300">
            <tr>
              <th className="p-2.5 border border-slate-300 w-10">NO</th>
              <th className="p-2.5 border border-slate-300">TANGGAL</th>
              <th className="p-2.5 border border-slate-300 text-left">DESA</th>
              <th className="p-2.5 border border-slate-300 text-left">KECAMATAN</th>
              <th className="p-2.5 border border-slate-300 font-sans">TARGET</th>
              <th className="p-2.5 border border-slate-300 font-sans">CAPAIAN</th>
              <th className="p-2.5 border border-slate-300 font-sans">SELISIH</th>
              {canEdit && <th className="p-2.5 border border-slate-300 w-20">AKSI</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={canEdit ? 8 : 7}
                  className="p-8 text-center text-slate-400 font-semibold"
                >
                  Belum ada data untuk tahun {selectedYear}. Klik &quot;Tarik Data Rekap&quot; atau &quot;+ Tambah&quot;.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id || row.no_urut} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 border border-slate-200 font-sans text-slate-500">
                    {row.no_urut}
                  </td>
                  <td className="p-2.5 border border-slate-200 font-sans">{row.tanggal}</td>
                  <td className="p-2.5 border border-slate-200 font-bold text-slate-900 text-left">
                    {row.desa}
                  </td>
                  <td className="p-2.5 border border-slate-200 text-slate-700 text-left">
                    {row.kecamatan}
                  </td>
                  <td className="p-2.5 border border-slate-200 font-sans font-bold">{row.target}</td>
                  <td className="p-2.5 border border-slate-200 font-sans font-black text-emerald-700">
                    {row.capaian}
                  </td>
                  <td className="p-2.5 border border-slate-200 font-sans font-bold text-slate-800">
                    {row.selisih}
                  </td>
                  {canEdit && (
                    <td className="p-2.5 border border-slate-200">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenModalRekap('edit', row)}
                          className="rounded-none h-7 w-7 border border-slate-300 bg-white text-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-100"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteRekap(row.id)}
                          className="rounded-none h-7 w-7 border border-rose-300 bg-rose-50 text-rose-700 flex items-center justify-center cursor-pointer hover:bg-rose-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {data.length > 0 && (
            <tfoot>
              <tr className="bg-slate-200 font-black text-slate-900 border-t-2 border-slate-400">
                <td colSpan={4} className="p-2.5 border border-slate-300 text-right uppercase">
                  TOTAL
                </td>
                <td className="p-2.5 border border-slate-300 font-sans">{sum(data, 'target')}</td>
                <td className="p-2.5 border border-slate-300 font-sans text-emerald-800">
                  {sum(data, 'capaian')}
                </td>
                <td className="p-2.5 border border-slate-300 font-sans">{sum(data, 'selisih')}</td>
                {canEdit && <td className="p-2.5 border border-slate-300" />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start animate-in fade-in duration-200">
      <TabelRekapCapaian
        data={tabelKiri}
        judul={`Capaian SKLB ${selectedYear} — Tim Timur`}
        grup="Tabel Kiri"
      />
      <TabelRekapCapaian
        data={tabelKanan}
        judul={`Capaian SKLB ${selectedYear} — Tim Barat`}
        grup="Tabel Kanan"
      />
    </div>
  );
}
