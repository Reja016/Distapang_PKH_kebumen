'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePageAuth } from '@/hooks/usePageAuth';
import {
  ArrowLeft,
  LayoutDashboard,
  Database,
  Calendar as CalendarIcon,
  History,
} from 'lucide-react';
import {
  Cattle,
} from '@/components/bitpro/sapitime/types';
import { SapiTimeSummaryTab } from '@/components/bitpro/sapitime/SapiTimeSummaryTab';
import { SapiTimeDatabaseTab } from '@/components/bitpro/sapitime/SapiTimeDatabaseTab';
import { SapiTimeCalendarTab } from '@/components/bitpro/sapitime/SapiTimeCalendarTab';
import { SapiTimeHistoryTab } from '@/components/bitpro/sapitime/SapiTimeHistoryTab';
import {
  ModalEstrusInfo,
  ModalCattleForm,
  ModalCatatIB,
} from '@/components/bitpro/sapitime/SapiTimeModals';

export default function SapiTimePage() {
  const router = useRouter();
  const { isReady, canCreate, canEdit } = usePageAuth('bitpro', 'sapitime');
  const [activeTab, setActiveTab] = useState<'home' | 'database' | 'calendar' | 'history'>('database');
  const [cattleList, setCattleList] = useState<Cattle[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);
  const [formData, setFormData] = useState<any>({
    status: 'Estrus',
    cycleLength: 21,
    kecamatan: '',
    desa: '',
    ownerName: '',
  });

  const [showIBModal, setShowIBModal] = useState(false);
  const [selectedCattleForIB, setSelectedCattleForIB] = useState<Cattle | null>(null);
  const [ibFormData, setIbFormData] = useState<any>({});
  const [showEstrusModal, setShowEstrusModal] = useState(false);

  // 1. Tarik Data dari MySQL API
  const fetchData = async () => {
    try {
      const res = await fetch('/api/sapitime');
      const json = await res.json();
      if (json.success) {
        setCattleList(json.cattle || []);
        setHistoryList(json.history || []);
      }
    } catch (e) {
      console.error('Gagal load data MySQL', e);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('cattleDataUpdated', fetchData);
    return () => {
      window.removeEventListener('cattleDataUpdated', fetchData);
    };
  }, []);

  // 2. Fungsi Eksekusi API ke MySQL
  const executeApi = async (action: string, payload: any, historyObj?: any) => {
    try {
      await fetch('/api/sapitime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload, history: historyObj }),
      });
      fetchData();
      window.dispatchEvent(new Event('cattleDataUpdated'));
    } catch (e) {
      console.error(e);
    }
  };

  // --- CRUD KE MYSQL ---
  const handleAddCattle = async () => {
    if (!canCreate) {
      alert('Anda tidak memiliki izin untuk menambah data sapi.');
      return;
    }
    const newId = `ST${String(cattleList.length + 1).padStart(3, '0')}`;
    const newCattle = { ...formData, id: newId };
    const historyObj = {
      type: 'cattle_added',
      cattle: formData.name,
      cattleId: newId,
      description: `Sapi baru ditambahkan milik ${formData.ownerName}`,
      icon: '➕',
    };

    let initialInseminations: any[] = [];
    if (formData.status === 'Bunting' && formData.pregnancyDate) {
      const pkbDate = new Date(formData.pregnancyDate);
      pkbDate.setDate(pkbDate.getDate() + 90);
      const initialIb = {
        id: Date.now(),
        cattle_id: newId,
        date: formData.pregnancyDate,
        time: '08:00',
        kecamatan: formData.kecamatan,
        desa: formData.desa,
        inseminatorName: 'Petugas Inseminator',
        strawCode: 'STRAW-IB',
        bullName: 'Pejantan Unggul',
        bullBreed: formData.breed || 'Simmental',
        rekomendasiPkb: pkbDate.toLocaleDateString('id-ID'),
        notes: 'Dicatat saat pendaftaran SapiTime',
      };
      initialInseminations = [initialIb];
    }

    setCattleList([...cattleList, { ...newCattle, inseminations: initialInseminations }]);
    setShowAddModal(false);
    setFormData({ status: 'Estrus', cycleLength: 21, kecamatan: '', desa: '', ownerName: '' });
    await executeApi('add_cattle', newCattle, historyObj);

    if (initialInseminations.length > 0) {
      await executeApi('add_ib', initialInseminations[0]);
    }
  };

  const handleEditCattle = (cattle: Cattle) => {
    if (!canEdit) {
      alert('Hanya Administrator yang berhak mengedit data sapi.');
      return;
    }
    setEditingCattle(cattle);
    setFormData({ ...cattle });
    setShowEditModal(false);
    setActiveTab('database');
    setTimeout(() => {
      document.getElementById('form-sapi')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleUpdateCattle = async () => {
    if (!canEdit) {
      alert('Hanya Administrator yang berhak mengedit data sapi.');
      return;
    }
    const updatedCattle = { ...editingCattle, ...formData };
    const historyObj = {
      type: 'cattle_updated',
      cattle: formData.name,
      cattleId: editingCattle?.id,
      description: `Data sapi diperbarui`,
      icon: '✏️',
    };

    setCattleList(cattleList.map((c) => (c.id === editingCattle?.id ? updatedCattle : c)));
    setShowEditModal(false);
    setEditingCattle(null);
    setFormData({ status: 'Estrus', cycleLength: 21, kecamatan: '', desa: '', ownerName: '' });
    await executeApi('update_cattle', updatedCattle, historyObj);
  };

  const handleDeleteCattle = async (id: string) => {
    if (!canEdit) {
      alert('Hanya Administrator yang berhak menghapus data sapi.');
      return;
    }
    if (confirm('Yakin hapus sapi ini? Semua riwayat IB juga akan terhapus!')) {
      setCattleList(cattleList.filter((c) => c.id !== id));
      const historyObj = {
        type: 'cattle_deleted',
        cattle: id,
        cattleId: id,
        description: `Sapi dihapus dari sistem`,
        icon: '🗑️',
      };
      await executeApi('delete_cattle', { id }, historyObj);
    }
  };

  const handleAddInsemination = async () => {
    const pkbDate = new Date(ibFormData.date);
    pkbDate.setDate(pkbDate.getDate() + 90);
    const rekomendasiPkb = pkbDate.toLocaleDateString('id-ID');

    const newIB = { id: Date.now(), cattle_id: selectedCattleForIB?.id, ...ibFormData, rekomendasiPkb };
    const historyObj = {
      type: 'insemination_added',
      cattle: selectedCattleForIB?.name,
      cattleId: selectedCattleForIB?.id,
      description: `Inseminasi Buatan (${newIB.kecamatan}, ${newIB.desa}). PKB: ${rekomendasiPkb}`,
      icon: '💉',
    };

    fetch('https://empty-yak-8.hooks.n8n.cloud/webhook/8b511961-05c4-4392-b818-07c89ccff71d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        statusOperasi: 'BARU',
        idSapi: selectedCattleForIB?.id,
        namaSapi: selectedCattleForIB?.name,
        tanggalIB: newIB.date,
        waktu: newIB.time,
        kecamatan: newIB.kecamatan,
        desa: newIB.desa,
        inseminator: newIB.inseminatorName,
        kodeStraw: newIB.strawCode,
        namaPejantan: newIB.bullName,
        rasPejantan: newIB.bullBreed,
        rekomendasiPkb: newIB.rekomendasiPkb,
        catatan: newIB.notes,
        idInseminasi: newIB.id,
      }),
    }).catch(console.warn);

    setCattleList(
      cattleList.map((c) =>
        c.id === selectedCattleForIB?.id
          ? { ...c, ibDate: newIB.date, inseminations: [...(c.inseminations || []), newIB] }
          : c
      )
    );
    setShowIBModal(false);
    setIbFormData({});
    setSelectedCattleForIB(null);
    await executeApi('add_ib', newIB, historyObj);

    if (window.confirm('Data IB berhasil dicatat ke Database! Ingin langsung membuka Database IB sekarang?')) {
      router.push('/bitpro/database-ib');
    }
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      {/* ── TOP APP BAR (Tema Hijau Bitpro) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/bitpro"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-800 transition-colors shrink-0"
              aria-label="Kembali ke Bitpro"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link
                  href="/bitpro"
                  className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors truncate"
                >
                  Bitpro
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">SapiTime Smart App</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Smart Monitoring Reproduksi Ternak
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('database')}
            className={`min-h-touch h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Database size={16} />
            <span>Database Indukan</span>
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className={`min-h-touch h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Ringkasan Siklus</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`min-h-touch h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CalendarIcon size={16} />
            <span>Kalender Reproduksi</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`min-h-touch h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <History size={16} />
            <span>Riwayat IB &amp; PKB</span>
          </button>
        </div>

        {activeTab === 'database' && (
          <SapiTimeDatabaseTab
            cattleList={cattleList}
            canCreate={canCreate}
            canEdit={canEdit}
            editingCattle={editingCattle}
            setEditingCattle={setEditingCattle}
            formData={formData}
            setFormData={setFormData}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleUpdateCattle={handleUpdateCattle}
            handleAddCattle={handleAddCattle}
            handleEditCattle={handleEditCattle}
            handleDeleteCattle={handleDeleteCattle}
            onOpenIBModal={(cattle) => {
              setSelectedCattleForIB(cattle);
              setIbFormData({ ...ibFormData, kecamatan: cattle.kecamatan, desa: cattle.desa });
              setShowIBModal(true);
            }}
          />
        )}

        {activeTab === 'home' && (
          <SapiTimeSummaryTab cattleList={cattleList} />
        )}

        {activeTab === 'calendar' && (
          <SapiTimeCalendarTab
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            cattleList={cattleList}
            onOpenEstrusModal={() => setShowEstrusModal(true)}
          />
        )}

        {activeTab === 'history' && (
          <SapiTimeHistoryTab historyList={historyList} />
        )}
      </main>

      {/* ── MODAL CEK TANDA ESTRUS ── */}
      <ModalEstrusInfo
        showEstrusModal={showEstrusModal}
        setShowEstrusModal={setShowEstrusModal}
      />

      {/* ── MODAL TAMBAH / EDIT SAPI ── */}
      <ModalCattleForm
        isOpen={showAddModal || showEditModal}
        isEdit={showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={showEditModal ? handleUpdateCattle : handleAddCattle}
      />

      {/* ── MODAL CATAT IB ── */}
      <ModalCatatIB
        showIBModal={showIBModal}
        setShowIBModal={setShowIBModal}
        selectedCattleForIB={selectedCattleForIB}
        ibFormData={ibFormData}
        setIbFormData={setIbFormData}
        handleAddInsemination={handleAddInsemination}
      />
    </div>
  );
}