'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileCheck2,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { usePageAuth } from '@/hooks/usePageAuth';
import NotificationBell from '@/components/common/NotificationBell';
import { UniversalAuditModal } from '@/components/common/UniversalAuditModal';
import {
  LalinTernakItem,
  KategoriLalin,
  WilayahPasar,
  LalinSummary,
} from '@/components/keswan/lalin-ternak/types';
import LalinStatsCard from '@/components/keswan/lalin-ternak/LalinStatsCard';
import LalinTable from '@/components/keswan/lalin-ternak/LalinTable';
import LalinModalForm from '@/components/keswan/lalin-ternak/LalinModalForm';

const EMPTY_SUMMARY: LalinSummary = {
  pemasukan: {
    total_ekor: 0,
    total_jantan: 0,
    total_betina: 0,
    kebumen: 0,
    gombong: 0,
    transaksi: 0,
  },
  pengeluaran: {
    total_ekor: 0,
    total_jantan: 0,
    total_betina: 0,
    kebumen: 0,
    gombong: 0,
    transaksi: 0,
  },
};

export default function LaluLintasTernakPage() {
  const { isReady, canCreate, canEdit } = usePageAuth('keswan', 'lalu-lintas-ternak');

  // Tab Utama: 'Pemasukkan' vs 'Pengeluaran'
  const [activeKategori, setActiveKategori] = useState<KategoriLalin>('Pemasukkan');

  // Filter Wilayah Pasar: 'ALL' | 'Kebumen' | 'Gombong'
  const [activeWilayah, setActiveWilayah] = useState<WilayahPasar | 'ALL'>('ALL');

  // Data state
  const [dataList, setDataList] = useState<LalinTernakItem[]>([]);
  const [summary, setSummary] = useState<LalinSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<LalinTernakItem | null>(null);

  // Audit modal states
  const [auditTarget, setAuditTarget] = useState<LalinTernakItem | null>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

  // Fetch data dari API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `/api/lalin-ternak?kategori=${activeKategori}&wilayah=${activeWilayah}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setDataList(json.data || []);
        if (json.summary) {
          setSummary(json.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load lalin ternak:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeKategori, activeWilayah]);

  useEffect(() => {
    if (isReady) {
      fetchData();
    }
  }, [isReady, fetchData]);

  // Handler Hapus Data
  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan lalu lintas ternak ini?')) {
      return;
    }
    try {
      const res = await fetch(`/api/lalin-ternak?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert('Gagal menghapus data: ' + (json.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus data.');
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: LalinTernakItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenAudit = (item: LalinTernakItem) => {
    setAuditTarget(item);
    setShowAuditModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* ── HEADER HALAMAN ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/beranda"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <FileCheck2 size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Lalu Lintas Ternak (SKKH)
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Kesehatan Hewan
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Pencatatan mutasi ternak masuk & keluar Pasar Hewan Kebumen & Gombong
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
              title="Segarkan data"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <NotificationBell />
          </div>
        </div>
      </header>

      {/* ── KONTEN UTAMA ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ── TAB NAVIGASI UTAMA: PEMASUKAN vs PENGELUARAN ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs w-full sm:w-auto">
            <button
              onClick={() => setActiveKategori('Pemasukkan')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeKategori === 'Pemasukkan'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ArrowDownLeft size={16} />
              <span>Data Pemasukan Ternak</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeKategori === 'Pemasukkan'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {(summary.pemasukan.total_ekor || 0).toLocaleString('id-ID')} Ekor
              </span>
            </button>

            <button
              onClick={() => setActiveKategori('Pengeluaran')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeKategori === 'Pengeluaran'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ArrowUpRight size={16} />
              <span>Data Pengeluaran Ternak</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeKategori === 'Pengeluaran'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {(summary.pengeluaran.total_ekor || 0).toLocaleString('id-ID')} Ekor
              </span>
            </button>
          </div>

          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="min-h-touch h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={18} />
              <span>Input {activeKategori === 'Pemasukkan' ? 'Pemasukan' : 'Pengeluaran'}</span>
            </button>
          )}
        </div>

        {/* ── KARTU STATISTIK ── */}
        <LalinStatsCard summary={summary} />

        {/* ── TABEL UTAMA ── */}
        <LalinTable
          data={dataList}
          kategori={activeKategori}
          activeWilayah={activeWilayah}
          setActiveWilayah={setActiveWilayah}
          canEdit={canEdit}
          onAdd={handleOpenAdd}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onAudit={handleOpenAudit}
          isLoading={isLoading}
        />
      </main>

      {/* ── MODAL FORM TAMBAH / EDIT ── */}
      <LalinModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        initialData={editingItem}
        defaultKategori={activeKategori}
        defaultWilayah={activeWilayah === 'ALL' ? 'Kebumen' : activeWilayah}
      />

      {/* ── UNIVERSAL AUDIT MODAL ── */}
      {showAuditModal && auditTarget && (
        <UniversalAuditModal
          isOpen={showAuditModal}
          onClose={() => {
            setShowAuditModal(false);
            setAuditTarget(null);
          }}
          recordId={auditTarget.id_lalin}
          tableName="Lalin_ternak"
          moduleKey="keswan"
          submenuKey="lalu-lintas-ternak"
          availableFields={[
            { key: 'kategori', label: 'Kategori' },
            { key: 'wilayah', label: 'Pasar Hewan' },
            { key: 'tanggal_pengiriman', label: 'Tanggal' },
            { key: 'no_skkh', label: 'Nomor SKKH' },
            { key: 'nama_pemilik', label: 'Nama Pemilik' },
            { key: 'alamat_pemilik', label: 'Alamat Pemilik' },
            { key: 'jenis_ternak', label: 'Jenis Ternak' },
            { key: 'umur', label: 'Umur' },
            { key: 'jumlah', label: 'Jumlah Total (Ekor)' },
            { key: 'jumlah_jantan', label: 'Jumlah Jantan' },
            { key: 'jumlah_betina', label: 'Jumlah Betina' },
            { key: 'asal_ternak', label: 'Asal Ternak' },
            { key: 'tujuan_ternak', label: 'Tujuan Ternak' },
            { key: 'ket', label: 'Keterangan' },
          ]}
        />
      )}
    </div>
  );
}
