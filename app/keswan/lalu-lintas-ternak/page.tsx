'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { usePageAuth } from '@/hooks/usePageAuth';
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
      {/* ── KONTEN UTAMA ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── 2 VIEW TABS: PEMASUKAN vs PENGELUARAN ── */}
        <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveKategori('Pemasukkan')}
            className={`min-h-touch h-11 px-4 sm:px-6 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeKategori === 'Pemasukkan'
                ? 'bg-white border-slate-200 text-emerald-700 border-b-white translate-y-px shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-100/60'
            }`}
          >
            <ArrowDownLeft size={16} strokeWidth={2.5} />
            <span>Data Pemasukan Ternak</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeKategori === 'Pemasukkan'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              {(summary.pemasukan.total_ekor || 0).toLocaleString('id-ID')} Ekor
            </span>
          </button>

          <button
            onClick={() => setActiveKategori('Pengeluaran')}
            className={`min-h-touch h-11 px-4 sm:px-6 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeKategori === 'Pengeluaran'
                ? 'bg-white border-slate-200 text-emerald-700 border-b-white translate-y-px shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-100/60'
            }`}
          >
            <ArrowUpRight size={16} strokeWidth={2.5} />
            <span>Data Pengeluaran Ternak</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeKategori === 'Pengeluaran'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              {(summary.pengeluaran.total_ekor || 0).toLocaleString('id-ID')} Ekor
            </span>
          </button>
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
