'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Beef,
} from 'lucide-react';
import { usePageAuth } from '@/hooks/usePageAuth';
import { showToast } from '@/components/common/CustomToast';

import {
  HewanKurbanItem,
  AVAILABLE_FIELDS_HEWAN_KURBAN,
} from '@/components/kesmavet/hewan-kurban/types';
import HewanKurbanForm from '@/components/kesmavet/hewan-kurban/HewanKurbanForm';
import HewanKurbanTable from '@/components/kesmavet/hewan-kurban/HewanKurbanTable';
import { UniversalAuditModal } from '@/components/common/UniversalAuditModal';

export default function HewanKurbanPage() {
  const { isReady, canCreate, canEdit, isAdmin } = usePageAuth('kesmavet', 'hewan-kurban');

  // Filter States
  const currentYearNum = new Date().getFullYear();
  const [selectedTahun, setSelectedTahun] = useState<number>(currentYearNum);
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data States
  const [items, setItems] = useState<HewanKurbanItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingItem, setEditingItem] = useState<HewanKurbanItem | null>(null);

  // Universal Audit Modal States
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [auditTarget, setAuditTarget] = useState<HewanKurbanItem | null>(null);

  // Fetch Data Hewan Kurban
  const loadData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        tahun: String(selectedTahun),
      });

      if (selectedKecamatan !== 'all') {
        params.append('kecamatan', selectedKecamatan);
      }
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }

      const res = await fetch(`/api/hewan-kurban?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
      } else {
        showToast.error(json.error || 'Gagal memuat data hewan kurban');
      }
    } catch (err: any) {
      showToast.error('Gagal mengambil data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTahun, selectedKecamatan, searchQuery]);

  const handleEditClick = (item: HewanKurbanItem) => {
    setEditingItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestAudit = (item: HewanKurbanItem) => {
    setAuditTarget(item);
    setShowAuditModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16">
      {/* ── HEADER TOP APP BAR ── */}
      <header className="border-b border-purple-200/80 dark:border-purple-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/kesmavet"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
              aria-label="Kembali ke Modul Kesmavet"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Tim Kerja Kesmavet
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Kebumen
                </span>
              </div>
              <h1 className="text-sm sm:text-xl font-black text-slate-900 dark:text-white truncate flex items-center gap-1.5 sm:gap-2">
                <Beef size={18} className="text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="truncate">Pemotongan Hewan Kurban</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* ── KONTEN UTAMA ── */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* Form Pemotongan Hewan Kurban (Langsung terbuka) */}
        {(canCreate || canEdit) && (
          <HewanKurbanForm
            editingItem={editingItem}
            onSuccess={() => {
              setEditingItem(null);
              loadData();
            }}
            onCancelEdit={() => setEditingItem(null)}
          />
        )}

        {/* Tabel Data Pemotongan Hewan Kurban */}
        <HewanKurbanTable
          items={items}
          isLoading={isLoading}
          onRefresh={loadData}
          onEdit={handleEditClick}
          onRequestAudit={handleRequestAudit}
          canEdit={canEdit}
          isAdmin={isAdmin}
          selectedTahun={selectedTahun}
          setSelectedTahun={setSelectedTahun}
          selectedKecamatan={selectedKecamatan}
          setSelectedKecamatan={setSelectedKecamatan}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </main>

      {/* ── MODAL AUDIT & PERMINTAAN KOREKSI ── */}
      <UniversalAuditModal
        isOpen={showAuditModal}
        onClose={() => {
          setShowAuditModal(false);
          setAuditTarget(null);
        }}
        moduleKey="kesmavet"
        submenuKey="hewan-kurban"
        tableName="hewan_kurban"
        recordId={auditTarget?.id || ''}
        recordTitle={`Hewan Kurban: ${auditTarget?.nama_lokasi || ''} (${auditTarget?.desa || ''}, ${auditTarget?.kecamatan || ''})`}
        availableFields={AVAILABLE_FIELDS_HEWAN_KURBAN}
      />
    </div>
  );
}
