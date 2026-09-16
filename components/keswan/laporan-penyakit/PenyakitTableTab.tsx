import React from 'react';
import { Search, Loader2, Edit2, Trash2 } from 'lucide-react';
import {
  PUSKESWAN_ZONES,
  DIAGNOSA_LIST,
  DIAGNOSA_COLOR_MAP,
  getZoneByKecamatanId,
} from '@/lib/penyakitData';

interface PenyakitTableTabProps {
  searchTable: string;
  setSearchTable: (s: string) => void;
  filterPuskeswan: string;
  setFilterPuskeswan: (s: string) => void;
  filterDiagnosa: string;
  setFilterDiagnosa: (s: string) => void;
  filteredCases: any[];
  isLoadingCases: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  setEditingItem: (item: any) => void;
  setFormValues: (vals: any) => void;
  setShowAddModal: (show: boolean) => void;
  handleDeleteCase: (id: number) => Promise<void>;
}

export default function PenyakitTableTab({
  searchTable,
  setSearchTable,
  filterPuskeswan,
  setFilterPuskeswan,
  filterDiagnosa,
  setFilterDiagnosa,
  filteredCases,
  isLoadingCases,
  isAdmin,
  canEdit,
  setEditingItem,
  setFormValues,
  setShowAddModal,
  handleDeleteCase,
}: PenyakitTableTabProps) {
  return (
    <div className="space-y-4">
      {/* Toolbar Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              placeholder="Cari kecamatan, diagnosa, atau keterangan..."
              className="w-full h-10 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Puskeswan */}
          <select
            value={filterPuskeswan}
            onChange={(e) => setFilterPuskeswan(e.target.value)}
            className="h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">Semua Puskeswan</option>
            {Object.values(PUSKESWAN_ZONES).map((z) => (
              <option key={z.id} value={z.id}>
                {z.nama}
              </option>
            ))}
          </select>

          {/* Filter Diagnosa */}
          <select
            value={filterDiagnosa}
            onChange={(e) => setFilterDiagnosa(e.target.value)}
            className="h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">Semua Diagnosa</option>
            {DIAGNOSA_LIST.map((d) => (
              <option key={d.nama} value={d.nama}>
                {d.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table CRUD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-blue-900 text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 w-12 text-center">NO</th>
                <th className="p-3.5">KECAMATAN</th>
                <th className="p-3.5">WILAYAH PUSKESWAN</th>
                <th className="p-3.5">DIAGNOSA PENYAKIT</th>
                <th className="p-3.5 text-center">JUMLAH KASUS</th>
                <th className="p-3.5">KETERANGAN</th>
                {(isAdmin || canEdit) && <th className="p-3.5 text-center w-24">AKSI</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoadingCases ? (
                <tr>
                  <td colSpan={isAdmin || canEdit ? 7 : 6} className="p-8 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mr-2 text-blue-600" size={16} />
                    Memuat data laporan penyakit...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin || canEdit ? 7 : 6} className="p-8 text-center text-slate-400">
                    Belum ada data kasus penyakit yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredCases.map((row, idx) => {
                  const zone = getZoneByKecamatanId(row.kecamatan_id);
                  return (
                    <tr key={row.id || idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3.5 text-center font-semibold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900">{row.kecamatan_nama}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {zone ? zone.nama : row.puskeswan_id}
                        </span>
                      </td>
                      <td className="p-3.5 font-extrabold flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: DIAGNOSA_COLOR_MAP[row.diagnosa_nama] || '#64748B' }}
                        />
                        <span>{row.diagnosa_nama}</span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                        {row.jumlah_kasus || 1} Ekor
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate">{row.keterangan || '-'}</td>
                      {(isAdmin || canEdit) && (
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingItem(row);
                                setFormValues({
                                  kecamatan_id: row.kecamatan_id,
                                  kecamatan_nama: row.kecamatan_nama,
                                  puskeswan_id: row.puskeswan_id,
                                  diagnosa_nama: row.diagnosa_nama,
                                  jumlah_kasus: row.jumlah_kasus || 1,
                                  keterangan: row.keterangan || '',
                                });
                                setShowAddModal(true);
                              }}
                              className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteCase(row.id)}
                                className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
