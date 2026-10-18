'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Scale,
  ArrowLeft,
  Tag,
} from 'lucide-react';
import { usePageAuth } from '@/hooks/usePageAuth';
import { showToast } from '@/components/common/CustomToast';

// Komponen Modular Pasar Hewan
import {
  CatatHewanItem,
  HargaPasarItem,
  AVAILABLE_FIELDS_PASAR_HEWAN,
} from '@/components/kesmavet/pasar-hewan/types';
import CatatHewanForm from '@/components/kesmavet/pasar-hewan/CatatHewanForm';
import CatatHewanTable from '@/components/kesmavet/pasar-hewan/CatatHewanTable';
import InputHargaTab from '@/components/kesmavet/pasar-hewan/InputHargaTab';
import { UniversalAuditModal } from '@/components/common/UniversalAuditModal';

export default function PasarHewanPage() {
  const { isReady, canCreate, canEdit, isAdmin } = usePageAuth('kesmavet', 'pasar-hewan');

  // Tab Menu: 'catat' | 'harga'
  const [activeTab, setActiveTab] = useState<'catat' | 'harga'>('catat');

  // State Universal Audit & Koreksi
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [auditTarget, setAuditTarget] = useState<CatatHewanItem | null>(null);

  // Filter Tanggal & Pasar
  const now = new Date();
  const currentMonthNum = now.getMonth() + 1;
  const currentYearNum = now.getFullYear();

  const [selectedBulan, setSelectedBulan] = useState<number>(currentMonthNum);
  const [selectedTahun, setSelectedTahun] = useState<number>(currentYearNum);
  const [selectedPasarFilter, setSelectedPasarFilter] = useState<'all' | 'Kebumen' | 'Gombong'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data States
  const [catatList, setCatatList] = useState<CatatHewanItem[]>([]);
  const [hargaList, setHargaList] = useState<HargaPasarItem[]>([]);
  const [isLoadingCatat, setIsLoadingCatat] = useState<boolean>(true);
  const [isLoadingHarga, setIsLoadingHarga] = useState<boolean>(true);

  // State Item yang sedang diedit
  const [editingItem, setEditingItem] = useState<CatatHewanItem | null>(null);

  // Fetch Data Catat Hewan
  const loadCatatData = async () => {
    try {
      setIsLoadingCatat(true);
      const params = new URLSearchParams({
        bulan: String(selectedBulan),
        tahun: String(selectedTahun),
      });

      if (selectedPasarFilter !== 'all') {
        params.append('pasar', selectedPasarFilter);
      }
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }

      const res = await fetch(`/api/pasar-hewan/catat?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCatatList(json.data || []);
      } else {
        showToast.error(json.error || 'Gagal memuat data catatan hewan');
      }
    } catch (err: any) {
      showToast.error('Gagal mengambil data: ' + err.message);
    } finally {
      setIsLoadingCatat(false);
    }
  };

  // Fetch Data Harga Pasar
  const loadHargaData = async () => {
    try {
      setIsLoadingHarga(true);
      const res = await fetch('/api/pasar-hewan/harga');
      const json = await res.json();
      if (json.success) {
        setHargaList(json.data || []);
      }
    } catch (err: any) {
      console.warn('Gagal memuat data harga:', err);
    } finally {
      setIsLoadingHarga(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadCatatData();
      loadHargaData();
    }
  }, [isReady, selectedBulan, selectedTahun, selectedPasarFilter, searchQuery]);

  const handleEditClick = (item: CatatHewanItem) => {
    setEditingItem(item);
    // Smooth scroll ke formulir di atas
    const formElem = document.getElementById('catat-hewan-form');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24">
      {/* ── HEADER TOP APP BAR (Ringkas & Bersih) ── */}
      <header className="border-b border-purple-200/80 dark:border-purple-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/kesmavet"
              className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
              aria-label="Kembali ke Modul Kesmavet"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white truncate flex items-center gap-2">
                <Store size={20} className="text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Pasar Hewan Kebumen &amp; Gombong</span>
              </h1>
            </div>
          </div>

          {/* Tab Navigasi Submenu */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setActiveTab('catat')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'catat'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              <Scale size={15} />
              <span>Catat Hewan</span>
            </button>
            <button
              onClick={() => setActiveTab('harga')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'harga'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              <Tag size={15} />
              <span>Input Harga</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── KONTEN UTAMA ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* SUBMENU 1: CATAT HEWAN (Form Langsung Terbuka + Tabel Data) */}
        {activeTab === 'catat' && (
          <div className="space-y-6">
            {/* Form Masuk Cepat (Langsung di halaman, tidak hanya modal popup) */}
            {canEdit && (
              <CatatHewanForm
                editingItem={editingItem}
                onSuccess={() => {
                  setEditingItem(null);
                  loadCatatData();
                }}
                onCancelEdit={() => setEditingItem(null)}
                canEdit={canEdit}
              />
            )}

            {/* Tabel Catat Hewan & Statistik */}
            <CatatHewanTable
              catatList={catatList}
              isLoading={isLoadingCatat}
              onRefresh={loadCatatData}
              onEdit={handleEditClick}
              onOpenAudit={(item) => {
                setAuditTarget(item);
                setShowAuditModal(true);
              }}
              canEdit={canEdit}
              isAdmin={isAdmin}
              selectedBulan={selectedBulan}
              setSelectedBulan={setSelectedBulan}
              selectedTahun={selectedTahun}
              setSelectedTahun={setSelectedTahun}
              selectedPasarFilter={selectedPasarFilter}
              setSelectedPasarFilter={setSelectedPasarFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        )}

        {/* SUBMENU 2: INPUT HARGA (Auto Tren & Format Ribuan Titik) */}
        {activeTab === 'harga' && (
          <InputHargaTab
            hargaList={hargaList}
            isLoading={isLoadingHarga}
            onRefresh={loadHargaData}
            canEdit={canEdit}
          />
        )}
      </main>

      {/* ── MODAL UNIVERSAL AUDIT & KOREKSI (Petugas ke Admin) ── */}
      <UniversalAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        tableName="pasar_hewan_catat"
        recordId={auditTarget?.id}
        recordName={
          auditTarget
            ? `${auditTarget.nama_pemilik} (${auditTarget.jenis_ternak}, Pasar ${auditTarget.pasar})`
            : 'Data Catat Pasar Hewan'
        }
        moduleKey="kesmavet"
        submenuKey="pasar-hewan"
        availableFields={AVAILABLE_FIELDS_PASAR_HEWAN}
      />
    </div>
  );
}
