'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Boxes,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { usePageAuth } from '@/hooks/usePageAuth';
import { useUserAreaRestriction } from '@/hooks/useUserAreaRestriction';
import {
  MasterBarang,
  DroppingDinasItem,
  DistribusiBaItem,
  StokDinasLedger,
  StokPuskeswanItem,
  PenggunaanObatItem,
  DAFTAR_PUSKESWAN_GUDANG,
} from '@/components/keswan/stok-gudang/types';
import GudangDashboardTab from '@/components/keswan/stok-gudang/GudangDashboardTab';
import PemasukanDinasTab from '@/components/keswan/stok-gudang/PemasukanDinasTab';
import DistribusiBatab from '@/components/keswan/stok-gudang/DistribusiBatab';
import PuskeswanApotekTab from '@/components/keswan/stok-gudang/PuskeswanApotekTab';
import {
  ModalBarang,
  ModalDroppingDinas,
  ModalBuatDistribusi,
  ModalCatatPenggunaan,
} from '@/components/keswan/stok-gudang/GudangModals';
import BeritaAcaraPrintModal from '@/components/keswan/stok-gudang/BeritaAcaraPrintModal';
import UploadBuktiBaModal from '@/components/keswan/stok-gudang/UploadBuktiBaModal';

export default function StokGudangKeswanPage() {
  const { isReady, canCreate, canEdit } = usePageAuth('keswan', 'stok-gudang');
  const { isAdmin, allowedPuskeswan } = useUserAreaRestriction();

  // Active Tab: 'dashboard' | 'pemasukan' | 'distribusi' | 'puskeswan'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pemasukan' | 'distribusi' | 'puskeswan'>(
    'dashboard'
  );

  // Data States
  const [masterBarang, setMasterBarang] = useState<MasterBarang[]>([]);
  const [droppingDinas, setDroppingDinas] = useState<DroppingDinasItem[]>([]);
  const [distribusi, setDistribusi] = useState<DistribusiBaItem[]>([]);
  const [stokDinas, setStokDinas] = useState<StokDinasLedger[]>([]);
  const [stokPuskeswan, setStokPuskeswan] = useState<StokPuskeswanItem[]>([]);
  const [penggunaan, setPenggunaan] = useState<PenggunaanObatItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Selected Puskeswan untuk Apotek Tab
  const initialPuskId = useMemo(() => {
    if (!isAdmin && allowedPuskeswan && allowedPuskeswan.length > 0) {
      const match = DAFTAR_PUSKESWAN_GUDANG.find(
        (p) => p.nama.toUpperCase() === allowedPuskeswan[0].toUpperCase()
      );
      if (match) return match.id;
    }
    return 1;
  }, [isAdmin, allowedPuskeswan]);

  const [selectedPuskId, setSelectedPuskId] = useState<number>(initialPuskId);

  // Modal States
  const [isModalBarangOpen, setIsModalBarangOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState<MasterBarang | null>(null);

  const [isModalDroppingOpen, setIsModalDroppingOpen] = useState(false);

  const [isModalDistribusiOpen, setIsModalDistribusiOpen] = useState(false);
  const [distribusiDefaultBarangId, setDistribusiDefaultBarangId] = useState<number | undefined>(undefined);
  const [distribusiIsDarurat, setDistribusiIsDarurat] = useState<boolean>(false);

  const [isModalPenggunaanOpen, setIsModalPenggunaanOpen] = useState(false);
  const [penggunaanInitialStock, setPenggunaanInitialStock] = useState<StokPuskeswanItem | null>(null);

  const [printBaItem, setPrintBaItem] = useState<DistribusiBaItem | null>(null);
  const [uploadBaItem, setUploadBaItem] = useState<DistribusiBaItem | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Muat Data dari API
  const loadGudangData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stok-gudang?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      const result = await res.json();
      if (result.success && result.data) {
        setMasterBarang(result.data.masterBarang || []);
        setDroppingDinas(result.data.droppingDinas || []);
        setDistribusi(result.data.distribusi || []);
        setStokDinas(result.data.stokDinas || []);
        setStokPuskeswan(result.data.stokPuskeswan || []);
        setPenggunaan(result.data.penggunaan || []);
      } else {
        showToast('error', result.error || 'Gagal memuat data gudang.');
      }
    } catch {
      showToast('error', 'Gagal terhubung ke database gudang.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGudangData();
  }, []);

  // Handler Hapus Dropping
  const handleDeleteDropping = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data dropping masuk ini?')) return;
    try {
      const res = await fetch(`/api/stok-gudang?type=dropping&id=${id}`, { method: 'DELETE' });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('success', resJson.message);
        loadGudangData();
      } else {
        showToast('error', resJson.error);
      }
    } catch {
      showToast('error', 'Gagal menghapus data.');
    }
  };

  // Handler Hapus Distribusi
  const handleDeleteDistribusi = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan distribusi ini? Stok puskeswan terkait akan disesuaikan.')) return;
    try {
      const res = await fetch(`/api/stok-gudang?type=distribusi&id=${id}`, { method: 'DELETE' });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('success', resJson.message);
        loadGudangData();
      } else {
        showToast('error', resJson.error);
      }
    } catch {
      showToast('error', 'Gagal membatalkan distribusi.');
    }
  };

  // Handler Hapus Penggunaan
  const handleDeletePenggunaan = async (id: number) => {
    if (!confirm('Hapus catatan penggunaan obat ini? Stok puskeswan akan dikembalikan.')) return;
    try {
      const res = await fetch(`/api/stok-gudang?type=penggunaan&id=${id}`, { method: 'DELETE' });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('success', resJson.message);
        loadGudangData();
      } else {
        showToast('error', resJson.error);
      }
    } catch {
      showToast('error', 'Gagal menghapus catatan penggunaan.');
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Memverifikasi otorisasi modul...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ── TOAST NOTIFIKASI ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* ── HEADER HALAMAN & BREADCRUMB ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Stok Gudang Obat &amp; Alat Keswan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pengelolaan inventaris farmasi dinas, alokasi droping 8 puskeswan, Berita Acara, dan rekam apotek
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadGudangData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            Refresh
          </button>

          {canCreate && (
            <>
              <button
                onClick={() => {
                  setEditingBarang(null);
                  setIsModalBarangOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Barang
              </button>

              <button
                onClick={() => setIsModalDroppingOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Dropping Masuk
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 4 TAB UTAMA ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Dashboard &amp; Stok Dinas
        </button>

        <button
          onClick={() => setActiveTab('pemasukan')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pemasukan'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Pemasukan Dropping Dinas ({droppingDinas.length})
        </button>

        <button
          onClick={() => setActiveTab('distribusi')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'distribusi'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Distribusi &amp; Berita Acara BA ({distribusi.length})
        </button>

        <button
          onClick={() => setActiveTab('puskeswan')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'puskeswan'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Apotek Puskeswan &amp; Rekam Penggunaan ({penggunaan.length})
        </button>
      </div>

      {/* ── KONTEN TAB ── */}
      {activeTab === 'dashboard' && (
        <GudangDashboardTab
          stokDinas={stokDinas}
          masterBarang={masterBarang}
          onOpenDistribusi={(idBarang, isDarurat) => {
            setDistribusiDefaultBarangId(idBarang);
            setDistribusiIsDarurat(!!isDarurat);
            setIsModalDistribusiOpen(true);
          }}
          onOpenBufferConfig={(barang) => {
            setEditingBarang(barang);
            setIsModalBarangOpen(true);
          }}
          canEdit={canEdit}
        />
      )}

      {activeTab === 'pemasukan' && (
        <PemasukanDinasTab
          droppings={droppingDinas}
          masterBarang={masterBarang}
          onOpenTambahDropping={() => setIsModalDroppingOpen(true)}
          onDeleteDropping={handleDeleteDropping}
          canEdit={canEdit}
        />
      )}

      {activeTab === 'distribusi' && (
        <DistribusiBatab
          distribusi={distribusi}
          onOpenCreateDistribusi={(isDarurat) => {
            setDistribusiDefaultBarangId(undefined);
            setDistribusiIsDarurat(!!isDarurat);
            setIsModalDistribusiOpen(true);
          }}
          onOpenPrintBa={(item) => setPrintBaItem(item)}
          onOpenUploadBa={(item) => setUploadBaItem(item)}
          onDeleteDistribusi={handleDeleteDistribusi}
          canEdit={canEdit}
        />
      )}

      {activeTab === 'puskeswan' && (
        <PuskeswanApotekTab
          stokPuskeswan={stokPuskeswan}
          penggunaan={penggunaan}
          selectedPuskId={selectedPuskId}
          setSelectedPuskId={setSelectedPuskId}
          onOpenCatatPenggunaan={(stockItem) => {
            setPenggunaanInitialStock(stockItem || null);
            setIsModalPenggunaanOpen(true);
          }}
          onDeletePenggunaan={handleDeletePenggunaan}
          canEdit={canEdit}
          isAdmin={isAdmin}
        />
      )}

      {/* ── MODALS ── */}
      {isModalBarangOpen && (
        <ModalBarang
          isOpen={isModalBarangOpen}
          onClose={() => setIsModalBarangOpen(false)}
          onSuccess={() => {
            showToast('success', 'Master barang berhasil disimpan.');
            loadGudangData();
          }}
          initialData={editingBarang}
        />
      )}

      {isModalDroppingOpen && (
        <ModalDroppingDinas
          isOpen={isModalDroppingOpen}
          onClose={() => setIsModalDroppingOpen(false)}
          onSuccess={() => {
            showToast('success', 'Dropping masuk dinas berhasil disimpan.');
            loadGudangData();
          }}
          masterBarang={masterBarang}
        />
      )}

      {isModalDistribusiOpen && (
        <ModalBuatDistribusi
          isOpen={isModalDistribusiOpen}
          onClose={() => setIsModalDistribusiOpen(false)}
          onSuccess={() => {
            showToast('success', 'Distribusi dan Berita Acara berhasil diterbitkan.');
            loadGudangData();
          }}
          stokDinas={stokDinas}
          defaultIdBarang={distribusiDefaultBarangId}
          initialIsDarurat={distribusiIsDarurat}
        />
      )}

      {isModalPenggunaanOpen && (
        <ModalCatatPenggunaan
          isOpen={isModalPenggunaanOpen}
          onClose={() => setIsModalPenggunaanOpen(false)}
          onSuccess={() => {
            showToast('success', 'Pemakaian obat berhasil dicatat dan stok puskeswan dikurangi.');
            loadGudangData();
          }}
          stokPuskeswan={stokPuskeswan}
          selectedPuskId={selectedPuskId}
          initialStockItem={penggunaanInitialStock}
        />
      )}

      {printBaItem && (
        <BeritaAcaraPrintModal
          item={printBaItem}
          onClose={() => setPrintBaItem(null)}
        />
      )}

      {uploadBaItem && (
        <UploadBuktiBaModal
          item={uploadBaItem}
          onClose={() => setUploadBaItem(null)}
          onSuccess={() => {
            showToast('success', 'Bukti tanda terima Berita Acara berhasil diunggah.');
            loadGudangData();
          }}
        />
      )}
    </div>
  );
}
