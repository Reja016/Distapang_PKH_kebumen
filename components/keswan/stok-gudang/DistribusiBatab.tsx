'use client';

import React, { useState } from 'react';
import {
  Printer,
  Upload,
  FileCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  Eye,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { DistribusiBaItem } from './types';

interface DistribusiBatabProps {
  distribusi: DistribusiBaItem[];
  onOpenCreateDistribusi: (isDarurat?: boolean) => void;
  onOpenPrintBa: (item: DistribusiBaItem) => void;
  onOpenUploadBa: (item: DistribusiBaItem) => void;
  onDeleteDistribusi: (id: number) => void;
  canEdit: boolean;
}

export default function DistribusiBatab({
  distribusi,
  onOpenCreateDistribusi,
  onOpenPrintBa,
  onOpenUploadBa,
  onDeleteDistribusi,
  canEdit,
}: DistribusiBatabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPusk, setFilterPusk] = useState('ALL');
  const [filterJenis, setFilterJenis] = useState('ALL');
  const [previewBuktiUrl, setPreviewBuktiUrl] = useState<string | null>(null);

  const filteredList = distribusi.filter((d) => {
    const matchSearch =
      d.nomor_ba.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.nama_puskeswan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchPusk = filterPusk === 'ALL' || d.nama_puskeswan.toUpperCase() === filterPusk.toUpperCase();
    const matchJenis =
      filterJenis === 'ALL'
        ? true
        : filterJenis === 'DARURAT'
        ? d.is_darurat
        : d.jenis_distribusi === filterJenis;

    return matchSearch && matchPusk && matchJenis;
  });

  return (
    <div className="space-y-6">
      {/* ── 1. TOOLBAR PENCARIAN & TOMBOL AKSI ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor BA, nama obat, atau puskeswan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={filterPusk}
            onChange={(e) => setFilterPusk(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Semua 8 Puskeswan</option>
            <option value="MIRIT">Puskeswan Mirit</option>
            <option value="KLIRONG">Puskeswan Klirong</option>
            <option value="GOMBONG">Puskeswan Gombong</option>
            <option value="BUAYAN">Puskeswan Buayan</option>
            <option value="ALIAN">Puskeswan Alian</option>
            <option value="PREMBUN">Puskeswan Prembun</option>
            <option value="KEBUMEN">Puskeswan Kebumen</option>
            <option value="KARANGANYAR">Puskeswan Karanganyar</option>
          </select>

          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Semua Jenis Distribusi</option>
            <option value="DROPING_TERENCANA">Dropping Terencana</option>
            <option value="AMPRAHAN_INSIDENTAL">Amprahan Insidental</option>
            <option value="DARURAT">Khusus Status Darurat</option>
          </select>

          {canEdit && (
            <>
              <button
                onClick={() => onOpenCreateDistribusi(false)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Dropping Terencana
              </button>
              <button
                onClick={() => onOpenCreateDistribusi(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
              >
                <AlertTriangle className="w-4 h-4" />
                Ambil Darurat
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 2. TABEL DATA DISTRIBUSI & BERITA ACARA ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-100 dark:border-slate-800">
                <th className="p-3.5 text-center w-12">No</th>
                <th className="p-3.5">Nomor BA &amp; Tanggal</th>
                <th className="p-3.5">Tujuan Puskeswan</th>
                <th className="p-3.5">Nama Obat / Barang</th>
                <th className="p-3.5">No. Batch &amp; Exp</th>
                <th className="p-3.5 text-center">Jumlah</th>
                <th className="p-3.5 text-center">Jenis Distribusi</th>
                <th className="p-3.5 text-center">Bukti Tanda Terima</th>
                <th className="p-3.5 text-center w-36">Aksi &amp; Berita Acara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Belum ada riwayat distribusi atau Berita Acara yang dibuat.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr
                    key={item.id_distribusi}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.nomor_ba}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.tanggal_ba ? String(item.tanggal_ba).slice(0, 10) : '-'}
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        Puskeswan {item.nama_puskeswan}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.nama_barang}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.sumber_anggaran} • {item.tahun_anggaran || '2026'}
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.nomor_batch || '-'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Exp: {item.tanggal_kadaluarsa ? String(item.tanggal_kadaluarsa).slice(0, 10) : '-'}
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-black text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">
                      {item.jumlah.toLocaleString('id-ID')} {item.satuan_kemasan || 'unit'}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {item.is_darurat ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3" /> AMPRAHAN DARURAT
                        </span>
                      ) : item.jenis_distribusi === 'AMPRAHAN_INSIDENTAL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          AMPRAHAN INSIDENTAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          DROPPING TERENCANA
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {item.file_bukti_ba ? (
                        <button
                          onClick={() => setPreviewBuktiUrl(item.file_bukti_ba || null)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Lihat Bukti
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenUploadBa(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload Bukti
                        </button>
                      )}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenPrintBa(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                          title="Cetak Berita Acara dengan Kop Surat Dinas"
                        >
                          <Printer className="w-3.5 h-3.5" /> Kop BA
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => onDeleteDistribusi(item.id_distribusi)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Batalkan distribusi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. MODAL PREVIEW BUKTI TANDA TERIMA ── */}
      {previewBuktiUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-4 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Bukti Dokumen Tanda Terima Berita Acara
              </h4>
              <button
                onClick={() => setPreviewBuktiUrl(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex items-center justify-center">
              {previewBuktiUrl.startsWith('data:application/pdf') ? (
                <iframe src={previewBuktiUrl} className="w-full h-[70vh] rounded-xl border border-slate-200" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewBuktiUrl}
                  alt="Bukti BA"
                  className="max-h-[70vh] object-contain rounded-xl shadow-md"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
