'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  FileSpreadsheet,
  Search,
  Pill,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { StokPuskeswanItem, PenggunaanObatItem, DAFTAR_PUSKESWAN_GUDANG } from './types';

interface PuskeswanApotekTabProps {
  stokPuskeswan: StokPuskeswanItem[];
  penggunaan: PenggunaanObatItem[];
  selectedPuskId: number;
  setSelectedPuskId: (id: number) => void;
  onOpenCatatPenggunaan: (item?: StokPuskeswanItem) => void;
  onDeletePenggunaan: (id: number) => void;
  canEdit: boolean;
  isAdmin: boolean;
}

export default function PuskeswanApotekTab({
  stokPuskeswan,
  penggunaan,
  selectedPuskId,
  setSelectedPuskId,
  onOpenCatatPenggunaan,
  onDeletePenggunaan,
  canEdit,
  isAdmin,
}: PuskeswanApotekTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'stok' | 'penggunaan'>('stok');
  const [searchTerm, setSearchTerm] = useState('');

  const currentPuskeswan =
    DAFTAR_PUSKESWAN_GUDANG.find((p) => p.id === selectedPuskId) || DAFTAR_PUSKESWAN_GUDANG[0];

  // Filter stok puskeswan terpilih
  const currentPuskStockList = stokPuskeswan.filter((s) => {
    const matchPusk = selectedPuskId === 0 || s.id_puskeswan === selectedPuskId;
    const matchSearch =
      s.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nomor_batch.toLowerCase().includes(searchTerm.toLowerCase());
    return matchPusk && matchSearch;
  });

  // Filter log penggunaan puskeswan terpilih
  const currentPuskPenggunaanList = penggunaan.filter((p) => {
    const matchPusk = selectedPuskId === 0 || p.id_puskeswan === selectedPuskId;
    const matchSearch =
      p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nomor_batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.keterangan || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchPusk && matchSearch;
  });

  // Ekspor Excel 7 Kolom Sesuai Catatan Atasan
  const handleExportLaporanPenggunaan = () => {
    const exportData = currentPuskPenggunaanList.map((p, idx) => ({
      No: idx + 1,
      Tanggal: p.tanggal ? String(p.tanggal).slice(0, 10) : '-',
      Puskeswan: p.nama_puskeswan,
      '1. Nama Produk': p.nama_produk,
      '2. Nomor Batch': p.nomor_batch,
      '3. Sumber Anggaran': p.sumber_anggaran,
      '4. T.A': p.tahun_anggaran,
      '5. Tanggal Kadaluarsa': p.tanggal_kadaluarsa ? String(p.tanggal_kadaluarsa).slice(0, 10) : '-',
      '6. Jumlah Penggunaan': p.jumlah_penggunaan,
      '7. Kemasan': p.kemasan,
      'Keterangan / Kasus': p.keterangan || '-',
      Petugas: p.petugas || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Penggunaan_Obat');
    XLSX.writeFile(
      wb,
      `Laporan_Penggunaan_Obat_${currentPuskeswan.nama}_${Date.now()}.xlsx`
    );
  };

  return (
    <div className="space-y-6">
      {/* ── 1. PILIH WILAYAH PUSKESWAN (8 CABANG) ── */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Puskeswan {currentPuskeswan.nama}
            </h3>
            <p className="text-xs text-slate-500">
              Pencatatan saldo obat &amp; pelaporan rekam penggunaan lapangan (Model Apotek)
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Ganti Puskeswan:
            </span>
            <select
              value={selectedPuskId}
              onChange={(e) => setSelectedPuskId(Number(e.target.value))}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              {DAFTAR_PUSKESWAN_GUDANG.map((p) => (
                <option key={p.id} value={p.id}>
                  Puskeswan {p.nama}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── 2. SUB-TAB SWITCHER (STOK AKTIF vs LAPORAN PENGGUNAAN) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
          <button
            onClick={() => setActiveSubTab('stok')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'stok'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Pill className="w-4 h-4" />
            Tabel Saldo Stok Puskeswan ({currentPuskStockList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('penggunaan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'penggunaan'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            Laporan Rekam Penggunaan (7 Kolom) ({currentPuskPenggunaanList.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'penggunaan' && (
            <button
              onClick={handleExportLaporanPenggunaan}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Unduh Rekap Excel
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => onOpenCatatPenggunaan()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Catat Pemakaian Obat
            </button>
          )}
        </div>
      </div>

      {/* ── 3. TOOLBAR PENCARIAN ── */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={
            activeSubTab === 'stok'
              ? 'Cari nama obat atau nomor batch di stok puskeswan...'
              : 'Cari rekam pemakaian obat, batch, atau keterangan pelayanan...'
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100 shadow-xs"
        />
      </div>

      {/* ── 4A. TAMPILAN TABEL SALDO STOK PUSKESWAN (Boleh habis sampai 0) ── */}
      {activeSubTab === 'stok' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-300 dark:border-slate-700">
                  <th className="p-3.5 text-center w-12 border-r border-slate-300 dark:border-slate-700">No</th>
                  <th className="p-3.5 border-r border-slate-300 dark:border-slate-700">Nama Produk / Obat</th>
                  <th className="p-3.5 border-r border-slate-300 dark:border-slate-700">No. Batch</th>
                  <th className="p-3.5 border-r border-slate-300 dark:border-slate-700">Sumber Anggaran</th>
                  <th className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">T.A</th>
                  <th className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">Tgl Kadaluarsa</th>
                  <th className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">Kemasan</th>
                  <th className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">Diterima</th>
                  <th className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">Terpakai</th>
                  <th className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">Sisa Stok</th>
                  <th className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">Status</th>
                  {canEdit && <th className="p-3.5 text-center w-24">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                {currentPuskStockList.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-slate-400">
                      Puskeswan {currentPuskeswan.nama} belum memiliki alokasi stok obat atau barang yang dicari tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  currentPuskStockList.map((item, idx) => (
                    <tr
                      key={item.id_stok_puskeswan || idx}
                      className="odd:bg-white even:bg-slate-100 dark:odd:bg-slate-900/60 dark:even:bg-slate-800/50 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <td className="p-3.5 text-center font-mono text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-700">{idx + 1}</td>
                      <td className="p-3.5 border-r border-slate-300 dark:border-slate-700">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {item.nama_barang}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-semibold border-r border-slate-300 dark:border-slate-700">
                        {item.nomor_batch}
                      </td>
                      <td className="p-3.5 border-r border-slate-300 dark:border-slate-700">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {item.sumber_anggaran}
                        </span>
                      </td>
                      <td className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">{item.tahun_anggaran}</td>
                      <td className="p-3.5 text-center whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                        {item.tanggal_kadaluarsa ? String(item.tanggal_kadaluarsa).slice(0, 10) : '-'}
                      </td>
                      <td className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">{item.satuan_kemasan}</td>
                      <td className="p-3.5 text-center font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-300 dark:border-slate-700">
                        {item.stok_masuk.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5 text-center font-semibold text-rose-600 dark:text-rose-400 border-r border-slate-300 dark:border-slate-700">
                        {item.stok_keluar.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5 text-center font-black text-sm border-r border-slate-300 dark:border-slate-700">
                        <span
                          className={
                            item.sisa_stok === 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {item.sisa_stok.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">
                        {item.sisa_stok > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> TERSEDIA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <AlertCircle className="w-3 h-3" /> HABIS (0)
                          </span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => onOpenCatatPenggunaan(item)}
                            disabled={item.sisa_stok <= 0}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                              item.sisa_stok <= 0
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            Pakai
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 4B. TAMPILAN TABEL LAPORAN PENGGUNAAN 7 KOLOM (SESUAI CATATAN ATASAN) ── */}
      {activeSubTab === 'penggunaan' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Buku Catatan Pemakaian Obat &amp; Bahan Medis
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Setiap mutasi pemakaian langsung mengurangi sisa stok puskeswan secara otomatis
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {currentPuskPenggunaanList.length} catatan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-300 dark:border-slate-700">
                  <th className="p-3.5 text-center w-12 border-r border-slate-300 dark:border-slate-700">No</th>
                  <th className="p-3.5 border-r border-slate-300 dark:border-slate-700">Tanggal</th>
                  <th className="p-3.5 font-bold border-r border-slate-300 dark:border-slate-700">1. Nama Produk</th>
                  <th className="p-3.5 font-mono border-r border-slate-300 dark:border-slate-700">2. Nomor Batch</th>
                  <th className="p-3.5 font-bold border-r border-slate-300 dark:border-slate-700">3. Sumber Anggaran</th>
                  <th className="p-3.5 text-center font-bold border-r border-slate-300 dark:border-slate-700">4. T.A</th>
                  <th className="p-3.5 text-center font-bold border-r border-slate-300 dark:border-slate-700">5. Tgl Kadaluarsa</th>
                  <th className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400 border-r border-slate-300 dark:border-slate-700">
                    6. Jmlh Penggunaan
                  </th>
                  <th className="p-3.5 text-center font-bold border-r border-slate-300 dark:border-slate-700">7. Kemasan</th>
                  <th className="p-3.5 border-r border-slate-300 dark:border-slate-700">Keterangan / Kasus</th>
                  <th className="p-3.5 border-r border-slate-300 dark:border-slate-700">Petugas</th>
                  {canEdit && <th className="p-3.5 text-center w-16">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                {currentPuskPenggunaanList.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-slate-400">
                      Belum ada catatan pemakaian obat yang dilaporkan untuk Puskeswan {currentPuskeswan.nama}.
                    </td>
                  </tr>
                ) : (
                  currentPuskPenggunaanList.map((item, idx) => (
                    <tr
                      key={item.id_penggunaan}
                      className="odd:bg-white even:bg-slate-100 dark:odd:bg-slate-900/60 dark:even:bg-slate-800/50 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <td className="p-3.5 text-center font-mono text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-700">{idx + 1}</td>
                      <td className="p-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400 border-r border-slate-300 dark:border-slate-700">
                        {item.tanggal ? String(item.tanggal).slice(0, 10) : '-'}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-300 dark:border-slate-700">
                        {item.nama_produk}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-semibold border-r border-slate-300 dark:border-slate-700">
                        {item.nomor_batch}
                      </td>
                      <td className="p-3.5 border-r border-slate-300 dark:border-slate-700">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {item.sumber_anggaran}
                        </span>
                      </td>
                      <td className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">{item.tahun_anggaran}</td>
                      <td className="p-3.5 text-center whitespace-nowrap text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-700">
                        {item.tanggal_kadaluarsa ? String(item.tanggal_kadaluarsa).slice(0, 10) : '-'}
                      </td>
                      <td className="p-3.5 text-right font-black text-rose-600 dark:text-rose-400 text-sm border-r border-slate-300 dark:border-slate-700">
                        {item.jumlah_penggunaan.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5 text-center border-r border-slate-300 dark:border-slate-700">{item.kemasan}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 border-r border-slate-300 dark:border-slate-700">
                        {item.keterangan || '-'}
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap border-r border-slate-300 dark:border-slate-700">
                        {item.petugas || '-'}
                      </td>
                      {canEdit && (
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => onDeletePenggunaan(item.id_penggunaan)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Hapus pemakaian & kembalikan stok"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
