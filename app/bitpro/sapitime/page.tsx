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
  Plus,
  Search,
  Edit2,
  Trash2,
  Syringe,
  ChevronLeft,
  ChevronRight,
  Info,
  User,
  Clock,
  Baby,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles,
  Smartphone,
} from 'lucide-react';

// ─────────────────────────────────────────────
// TIPE DATA & HELPER
// ─────────────────────────────────────────────
type Insemination = {
  id: number;
  date: string;
  time: string;
  kecamatan: string;
  desa: string;
  inseminatorName: string;
  strawCode: string;
  bullName: string;
  bullBreed: string;
  rekomendasiPkb: string;
  notes: string;
  pkbSkipDate?: string;
  pkbDateActual?: string;
  birthDate?: string;
};

type Cattle = {
  id: string;
  name: string;
  ownerName: string;
  breed: string;
  birthDate: string;
  kecamatan: string;
  desa: string;
  status: string;
  lastEstrus: string;
  pregnancyDate?: string;
  pregnancyNotes?: string;
  notes: string;
  cycleLength?: number;
  ibDate?: string;
  inseminations: Insemination[];
  createdAt?: string;
  updatedAt?: string;
};

function calculateAge(birthDate: string) {
  if (!birthDate) return '-';
  const birth = new Date(birthDate);
  const today = new Date();
  const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  return `${years} thn ${months} bln`;
}

export default function SapiTimePage() {
  const router = useRouter();
  const { isReady, canEdit } = usePageAuth('bitpro', 'sapitime');
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

  const getCattleStatusData = (c: Cattle) => {
    const today = new Date();
    if (c.status === 'Bunting' && c.pregnancyDate) {
      const pregStart = new Date(c.pregnancyDate);
      const birthDate = new Date(pregStart);
      birthDate.setDate(pregStart.getDate() + 285);
      const daysUntil = Math.ceil((birthDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return {
        ...c,
        daysUntil,
        eventType: 'birth',
        colorHex: daysUntil <= 7 ? '#EF4444' : '#10B981',
        bgHex: daysUntil <= 7 ? '#FEE2E2' : '#D1FAE5',
      };
    }
    if (c.lastEstrus && c.status !== 'Bunting') {
      const lastEstrus = new Date(c.lastEstrus);
      const cycle = c.cycleLength || 21;
      const nextEstrus = new Date(lastEstrus);
      nextEstrus.setDate(lastEstrus.getDate() + cycle);
      const daysUntil = Math.ceil((nextEstrus.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return {
        ...c,
        daysUntil,
        cycleLength: cycle,
        eventType: 'estrus',
        colorHex: daysUntil <= 2 ? '#EF4444' : '#F59E0B',
        bgHex: daysUntil <= 2 ? '#FEE2E2' : '#FEF3C7',
      };
    }
    return { ...c, eventType: 'safe', colorHex: '#6B7280', bgHex: '#F3F4F6' };
  };

  // --- CRUD KE MYSQL ---
  const handleAddCattle = async () => {
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
    setEditingCattle(cattle);
    setFormData({ ...cattle });
    setShowEditModal(false);
    setActiveTab('database');
    setTimeout(() => {
      document.getElementById('form-sapi')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleUpdateCattle = async () => {
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

  const getCalendarEvents = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let events: any[] = [];

    cattleList.forEach((c) => {
      if (c.lastEstrus) {
        const eDate = new Date(c.lastEstrus);
        if (eDate.getFullYear() === year && eDate.getMonth() === month) {
          events.push({ day: eDate.getDate(), type: 'estrus', name: c.name, id: c.id, colorHex: '#F87171', desc: 'Estrus Tercatat' });
        }
        const nextE = new Date(eDate);
        nextE.setDate(nextE.getDate() + (c.cycleLength || 21));
        if (nextE.getFullYear() === year && nextE.getMonth() === month && c.status !== 'Bunting') {
          events.push({ day: nextE.getDate(), type: 'next_estrus', name: c.name, id: c.id, colorHex: '#FBBF24', desc: 'Perkiraan Estrus' });
        }
      }
      if (c.inseminations) {
        c.inseminations.forEach((ib) => {
          const ibDate = new Date(ib.date);
          if (ibDate.getFullYear() === year && ibDate.getMonth() === month) {
            events.push({ day: ibDate.getDate(), type: 'ib', name: c.name, id: c.id, colorHex: '#34D399', desc: `IB oleh ${ib.inseminatorName}` });
          }
          const pkbDate = new Date(ibDate);
          pkbDate.setDate(pkbDate.getDate() + 90);
          if (pkbDate.getFullYear() === year && pkbDate.getMonth() === month) {
            events.push({ day: pkbDate.getDate(), type: 'pkb', name: c.name, id: c.id, colorHex: '#60A5FA', desc: 'Jadwal PKB (90 Hari)' });
          }
        });
      }
      if (c.status === 'Bunting' && c.pregnancyDate) {
        const bDate = new Date(c.pregnancyDate);
        bDate.setDate(bDate.getDate() + 285);
        if (bDate.getFullYear() === year && bDate.getMonth() === month) {
          events.push({ day: bDate.getDate(), type: 'birth', name: c.name, id: c.id, colorHex: '#A78BFA', desc: 'Estimasi Kelahiran' });
        }
      }
    });

    const groupedEvents: { [key: number]: any[] } = {};
    events.forEach((e) => {
      if (!groupedEvents[e.day]) groupedEvents[e.day] = [];
      groupedEvents[e.day].push(e);
    });
    return groupedEvents;
  };

  /* ─────────────────────────────────────────────
     RENDER TAB 1: BERANDA / MONITORING SIKLUS
  ───────────────────────────────────────────── */
  const renderHome = () => {
    const sortedCattle = [...cattleList].map(getCattleStatusData).sort((a: any, b: any) => {
      const aDays = a.daysUntil ?? 999;
      const bDays = b.daysUntil ?? 999;
      return aDays - bDays;
    });

    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="bg-emerald-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Monitoring Status Reproduksi Ternak
              </h2>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Pemantauan siklus estrus, masa bunting, dan perkiraan kelahiran
              </p>
            </div>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-bold">
              Total: {cattleList.length} Ekor
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4 w-16">No</th>
                  <th className="px-6 py-4">Data Peternak & Sapi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Sisa Waktu</th>
                  <th className="px-6 py-4 w-[25%]">Progress Siklus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedCattle.length > 0 ? (
                  sortedCattle.map((cattleData: any, idx: number) => {
                    let progressVal = 0;
                    if (cattleData.eventType === 'birth') {
                      progressVal = Math.min(100, ((285 - Math.max(0, cattleData.daysUntil)) / 285) * 100);
                    } else if (cattleData.eventType === 'estrus') {
                      progressVal = Math.min(
                        100,
                        (((cattleData.cycleLength || 21) - Math.max(0, cattleData.daysUntil)) / (cattleData.cycleLength || 21)) * 100
                      );
                    } else {
                      progressVal = 100;
                    }

                    return (
                      <tr key={cattleData.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-emerald-700 text-xs">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              <User size={15} className="text-slate-400" />
                              {cattleData.ownerName || 'Peternak Tidak Diketahui'}
                            </span>
                            <span className="font-medium text-slate-500 text-xs mt-0.5 ml-5">
                              Sapi: <strong className="text-emerald-700">{cattleData.name}</strong> • ID: {cattleData.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                              cattleData.status === 'Bunting'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {cattleData.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold text-xs"
                            style={{ backgroundColor: cattleData.bgHex, color: cattleData.colorHex }}
                          >
                            {cattleData.eventType === 'birth' || cattleData.eventType === 'estrus'
                              ? `${cattleData.daysUntil} Hari Lagi`
                              : 'Aman'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progressVal}%`, backgroundColor: cattleData.colorHex }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Belum ada data sapi di Database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Siklus Estrus Rata-rata</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              21 <span className="text-sm font-semibold text-slate-500">Hari</span>
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Lama Estrus Rata-rata</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              18 <span className="text-sm font-semibold text-slate-500">Jam</span>
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Masa Kebuntingan Normal</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              285 <span className="text-sm font-semibold text-slate-500">Hari</span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────
     RENDER TAB 2: DATABASE INDUKAN
  ───────────────────────────────────────────── */
  const renderDatabase = () => (
    <div className="animate-in fade-in space-y-6">
      
      {/* ── FORM INLINE PENDAFTARAN / EDIT INDUKAN SAPI ── */}
      {canEdit && (
        <div id="form-sapi" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Plus size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                {editingCattle ? (
                  <>
                    <Edit2 size={18} className="text-emerald-700" />
                    <span>Edit Data Sapi: {editingCattle.name}</span> 
                  </>
                ) : (
                  <span>Data Inseminasi Buatan</span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Input data identitas peternak dan status reproduksi sapi secara langsung
              </p>
            </div>
          </div>

          {editingCattle && (
            <button
              onClick={() => {
                setEditingCattle(null);
                setFormData({ status: 'Estrus', cycleLength: 21, kecamatan: '', desa: '', ownerName: '' });
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              ✕ Batalkan Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Nama Peternak <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900"
              value={formData.ownerName || ''}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              placeholder="Nama pemilik peternak"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Nama Sapi <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Si Manis"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Desa <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900"
              value={formData.desa || ''}
              onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
              placeholder="Desa"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Kecamatan <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900"
              value={formData.kecamatan || ''}
              onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
              placeholder="Kecamatan"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Ras Sapi</label>
            <input
              type="text"
              className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900"
              value={formData.breed || ''}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              placeholder="PO / Simmental / Limousin"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Lahir Sapi</label>
            <input
              type="date"
              className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900"
              value={formData.birthDate || ''}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Status Reproduksi</label>
            <select
              className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900"
              value={formData.status || 'Estrus'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Estrus">Estrus (Birahi)</option>
              <option value="Bunting">Bunting</option>
              <option value="Laktasi">Laktasi / Menyusui</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Estrus Terakhir</label>
            <input
              type="date"
              className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900"
              value={formData.lastEstrus || ''}
              onChange={(e) => setFormData({ ...formData, lastEstrus: e.target.value })}
            />
          </div>
        </div>

        {formData.status === 'Bunting' && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-emerald-900">
                Tanggal Mulai Bunting (Tanggal IB Berhasil)
              </label>
              <input
                type="date"
                className="w-full min-h-touch h-10 px-3.5 border border-emerald-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                value={formData.pregnancyDate || ''}
                onChange={(e) => setFormData({ ...formData, pregnancyDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-emerald-900">Catatan Kebuntingan</label>
              <input
                type="text"
                className="w-full min-h-touch h-10 px-3.5 border border-emerald-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                value={formData.pregnancyNotes || ''}
                onChange={(e) => setFormData({ ...formData, pregnancyNotes: e.target.value })}
                placeholder="Hasil USG / Palpasi Rektal"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
          {editingCattle && (
            <button
              onClick={() => {
                setEditingCattle(null);
                setFormData({ status: 'Estrus', cycleLength: 21, kecamatan: '', desa: '', ownerName: '' });
              }}
              className="min-h-touch h-10 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              Batal
            </button>
          )}
          <button
            onClick={editingCattle ? handleUpdateCattle : handleAddCattle}
            className="min-h-touch h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            {editingCattle ? 'Simpan Perubahan Sapi' : 'Simpan Data Sapi Baru'}
          </button>
        </div>
      </div>
      )}

      {/* ── SEARCH & ACTION TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-1/2">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama peternak atau sapi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-touch h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 text-sm shadow-xs transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => router.push('/bitpro/database-ib')}
            className="min-h-touch h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Syringe size={16} className="text-emerald-700" />
            <span>Database IB ↗</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cattleList
          .filter(
            (c) =>
              c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (c.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((cattle) => (
            <div
              key={cattle.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 truncate flex items-center gap-1.5">
                      <User size={16} className="text-slate-400 shrink-0" />
                      {cattle.ownerName || 'Tanpa Nama'}
                    </h3>
                    <p className="font-bold text-sm text-emerald-700 mt-1 truncate">Sapi: {cattle.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {cattle.id} • {cattle.kecamatan || '-'}, {cattle.desa || '-'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      cattle.status === 'Bunting'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {cattle.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Ras</span>
                    <span className="font-semibold text-slate-800">{cattle.breed}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Umur</span>
                    <span className="font-semibold text-slate-800">{calculateAge(cattle.birthDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Estrus Terakhir</span>
                    <span className="font-semibold text-slate-800">
                      {cattle.lastEstrus ? new Date(cattle.lastEstrus).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Total IB</span>
                    <span className="font-semibold text-slate-800">{cattle.inseminations?.length || 0} Kali</span>
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCattle(cattle)}
                    className="flex-1 min-h-touch h-10 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCattleForIB(cattle);
                      setIbFormData({ ...ibFormData, kecamatan: cattle.kecamatan, desa: cattle.desa });
                      setShowIBModal(true);
                    }}
                    className="flex-1 min-h-touch h-10 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    <Syringe size={13} />
                    <span>Catat IB</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCattle(cattle.id)}
                    title="Hapus Sapi"
                    className="min-h-touch h-10 w-10 bg-red-50 text-red-600 rounded-xl border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────
     RENDER TAB 3: KALENDER REPRODUKSI
  ───────────────────────────────────────────── */
  const renderCalendar = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthEvents = getCalendarEvents();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const allIBs = cattleList
      .flatMap((c) => (c.inseminations || []).map((ib) => ({ ...ib, cattle: c })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="animate-in fade-in space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => setShowEstrusModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-amber-200 bg-amber-50 text-amber-900 rounded-xl font-bold hover:bg-amber-100 transition-colors text-xs sm:text-sm shadow-xs"
          >
            <Info size={16} className="text-amber-700" />
            <span>Cek Tanda-Tanda Birahi (Estrus 3A)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs border-t-4 border-t-emerald-600">
            <h3 className="text-slate-900 font-bold text-base mb-3 flex items-center gap-2">
              <Syringe size={18} className="text-emerald-700" />
              <span>Riwayat Inseminasi Buatan Terbaru</span>
            </h3>
            <div className="space-y-2.5">
              {allIBs.slice(0, 2).map((ib, i) => {
                const diffDays = Math.floor((new Date().getTime() - new Date(ib.date).getTime()) / (1000 * 3600 * 24));
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{ib.cattle.name}</p>
                        <p className="text-[11px] font-semibold text-emerald-700">ID: {ib.cattle.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 text-xs">{new Date(ib.date).toLocaleDateString('id-ID')}</p>
                      <p className="text-[11px] font-medium text-slate-500">
                        {diffDays === 0 ? 'Hari ini' : `${diffDays} hari lalu`}
                      </p>
                    </div>
                  </div>
                );
              })}
              {allIBs.length === 0 && <p className="text-xs text-slate-400 italic text-center py-3">Belum ada riwayat IB</p>}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs border-t-4 border-t-blue-600">
            <h3 className="text-slate-900 font-bold text-base mb-3 flex items-center gap-2">
              <Stethoscope size={18} className="text-blue-600" />
              <span>Jadwal Pemeriksaan Kebuntingan (PKB)</span>
            </h3>
            <div className="space-y-2.5">
              {allIBs.slice(0, 2).map((ib, i) => {
                const pkbDate = new Date(ib.date);
                pkbDate.setDate(pkbDate.getDate() + 90);
                const diffDays = Math.ceil((pkbDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{ib.cattle.name}</p>
                        <p className="text-[11px] font-semibold text-blue-600">
                          IB: {new Date(ib.date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 text-xs">{pkbDate.toLocaleDateString('id-ID')}</p>
                      <p className={`text-[11px] font-bold ${diffDays < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {diffDays < 0 ? `Terlewat ${Math.abs(diffDays)} hari` : `${diffDays} hari lagi`}
                      </p>
                    </div>
                  </div>
                );
              })}
              {allIBs.length === 0 && <p className="text-xs text-slate-400 italic text-center py-3">Belum ada jadwal PKB</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Board Calendar */}
          <div className="bg-emerald-950 border border-emerald-900 rounded-2xl p-5 sm:p-7 lg:col-span-2 text-white shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-emerald-300/60 text-[10px] font-bold uppercase tracking-wider mb-0.5">Papan Reproduksi</p>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {monthNames[currentDate.getMonth()]}{' '}
                  <span className="text-emerald-400 font-normal text-lg">{currentDate.getFullYear()}</span>
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
                    setSelectedDay(null);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border border-white/10"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => {
                    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
                    setSelectedDay(null);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border border-white/10"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-emerald-200/60 font-bold text-xs uppercase tracking-wider mb-3">
              <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-11 sm:h-14 rounded-xl bg-transparent"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDay === day;
                const dayEvents = monthEvents[day] || [];
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`h-11 sm:h-14 flex flex-col items-center justify-start pt-1 rounded-xl relative cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-white text-emerald-950 border-white scale-[1.04] shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                    }`}
                  >
                    <span className="font-bold text-xs sm:text-sm">{day}</span>
                    <div className="flex gap-0.5 absolute bottom-1.5">
                      {dayEvents.slice(0, 3).map((e, idx) => (
                        <div
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: e.colorHex }}
                        ></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div> Estrus
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div> Inseminasi (IB)
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div> Jadwal PKB
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div> Perkiraan Lahir
              </div>
            </div>
          </div>

          {/* Activity Sidebar for Selected Day */}
          <div className="bg-emerald-950 border border-emerald-900 rounded-2xl p-5 sm:p-6 flex flex-col max-h-[500px] text-white shadow-md">
            <h3 className="font-bold text-base text-white mb-4 border-b border-white/10 pb-3">
              {selectedDay ? `Aktivitas Tanggal ${selectedDay}` : 'Daftar Aktivitas Bulan Ini'}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {Object.keys(monthEvents).length === 0 ? (
                <p className="text-emerald-200/50 text-center font-medium mt-10 text-xs">
                  Tidak ada jadwal tercatat bulan ini.
                </p>
              ) : (
                Object.keys(monthEvents)
                  .sort((a, b) => Number(a) - Number(b))
                  .filter((day) => (selectedDay ? Number(day) === selectedDay : true))
                  .map((day) =>
                    monthEvents[Number(day)].map((e, idx) => (
                      <div
                        key={`${day}-${idx}`}
                        className="flex gap-3 items-center bg-white/10 p-3 rounded-xl border border-white/10 text-white"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm text-white shrink-0">
                          {day}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.colorHex }}></div>
                            <span className="font-bold text-white text-xs truncate">{e.name}</span>
                          </div>
                          <span className="text-[11px] text-emerald-200/80 font-medium ml-3.5 truncate">{e.desc}</span>
                        </div>
                      </div>
                    ))
                  )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────
     RENDER TAB 4: RIWAYAT AKTIVITAS
  ───────────────────────────────────────────── */
  const renderHistory = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs animate-in fade-in">
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
        Riwayat Log Aktivitas Sistem
      </h2>
      <div className="space-y-3">
        {historyList.map((item, idx) => (
          <div
            key={idx}
            className="flex gap-3.5 items-start p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors"
          >
            <div className="text-xl p-2.5 bg-white rounded-lg border border-slate-200 shrink-0">{item.icon}</div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-slate-900 mb-0.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="truncate">{item.cattle}</span>
                <span className="text-[11px] font-normal text-slate-400">
                  {new Date(item.date).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </h4>
              <p className="text-xs text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
        {historyList.length === 0 && (
          <p className="text-center text-slate-400 py-10 text-xs">Belum ada riwayat aktivitas.</p>
        )}
      </div>
    </div>
  );

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

          <div className="flex items-center gap-2 shrink-0">
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
            <span>Riwayat IB & PKB</span>
          </button>
        </div>

        {activeTab === 'database' && renderDatabase()}
        {activeTab === 'home' && renderHome()}
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'history' && renderHistory()}
      </main>

      {/* ── MODAL CEK TANDA ESTRUS ── */}
      {showEstrusModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEstrusModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-2xl font-light"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold text-amber-900 mb-5 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-600" />
              <span>Tanda-Tanda Birahi (Estrus 3A)</span>
            </h3>
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <h4 className="font-bold text-amber-900 text-sm mb-1.5">Tanda Utama (Pasti)</h4>
                <ul className="list-disc pl-5 text-xs text-amber-900 font-medium space-y-1">
                  <li>Sapi betina diam saat dinaiki oleh sapi jantan atau sesama sapi betina (*standing heat*).</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">Tanda Pendukung (Gejala 3A)</h4>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1.5">
                  <li><strong>Abuh:</strong> Bibir kelamin (vulva) terlihat sedikit bengkak.</li>
                  <li><strong>Abang:</strong> Selaput lendir bagian dalam vulva berwarna kemerahan.</li>
                  <li><strong>Anget:</strong> Suhu tubuh dan area vulva terasa lebih hangat.</li>
                  <li>Keluar lendir bening transparan dan elastis dari vulva.</li>
                  <li>Sapi terlihat gelisah, sering melenguh (*bengok-bengok*), dan nafsu makan menurun.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH / EDIT SAPI ── */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {showEditModal ? 'Edit Data Sapi' : 'Tambah Indukan Sapi Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Nama Peternak</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-bold"
                  value={formData.ownerName || ''}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Nama pemilik peternak"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Nama Sapi</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-bold"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Si Manis"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Desa</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={formData.desa || ''}
                  onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                  placeholder="Desa"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Kecamatan</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={formData.kecamatan || ''}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  placeholder="Kecamatan"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Ras Sapi</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={formData.breed || ''}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="PO / Simmental / Limousin"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Lahir Sapi</label>
                <input
                  type="date"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={formData.birthDate || ''}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Status Reproduksi</label>
                <select
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-bold"
                  value={formData.status || 'Estrus'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Estrus">Estrus (Birahi)</option>
                  <option value="Bunting">Bunting</option>
                  <option value="Laktasi">Laktasi / Menyusui</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Estrus Terakhir</label>
                <input
                  type="date"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={formData.lastEstrus || ''}
                  onChange={(e) => setFormData({ ...formData, lastEstrus: e.target.value })}
                />
              </div>

              {formData.status === 'Bunting' && (
                <div className="col-span-1 sm:col-span-2 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <label className="block text-xs font-bold mb-1 text-emerald-900">
                    Tanggal Mulai Bunting (Tanggal IB Berhasil)
                  </label>
                  <input
                    type="date"
                    className="w-full min-h-touch h-11 px-3.5 border border-emerald-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                    value={formData.pregnancyDate || ''}
                    onChange={(e) => setFormData({ ...formData, pregnancyDate: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8 pt-5 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="flex-1 min-h-touch h-11 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={showEditModal ? handleUpdateCattle : handleAddCattle}
                disabled={!formData.name || !formData.kecamatan || !formData.desa}
                className="flex-1 min-h-touch h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
              >
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CATAT IB ── */}
      {showIBModal && selectedCattleForIB && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Syringe size={20} className="text-emerald-700" />
                <span>Catat Inseminasi Buatan - Sapi {selectedCattleForIB.name}</span>
              </h3>
              <button
                onClick={() => setShowIBModal(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Pelaksanaan IB</label>
                <input
                  type="date"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={ibFormData.date || ''}
                  onChange={(e) => setIbFormData({ ...ibFormData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Waktu / Jam IB</label>
                <input
                  type="time"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={ibFormData.time || ''}
                  onChange={(e) => setIbFormData({ ...ibFormData, time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Kecamatan</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={ibFormData.kecamatan || ''}
                  onChange={(e) => setIbFormData({ ...ibFormData, kecamatan: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Desa</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={ibFormData.desa || ''}
                  onChange={(e) => setIbFormData({ ...ibFormData, desa: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-1 text-slate-700">Nama Petugas Inseminator</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={ibFormData.inseminatorName || ''}
                  onChange={(e) => setIbFormData({ ...ibFormData, inseminatorName: e.target.value })}
                  placeholder="Nama lengkap petugas inseminator"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Kode Batch Straw</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-bold"
                  value={ibFormData.strawCode || ''}
                  onChange={(e) => setIbFormData({ ...ibFormData, strawCode: e.target.value })}
                  placeholder="Kode sperma beku (straw)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Nama Pejantan</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={ibFormData.bullName || ''}
                  onChange={(e) => setIbFormData({ ...ibFormData, bullName: e.target.value })}
                  placeholder="Nama sapi pejantan"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-1 text-slate-700">Ras Pejantan</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={ibFormData.bullBreed || ''}
                  onChange={(e) => setIbFormData({ ...ibFormData, bullBreed: e.target.value })}
                  placeholder="Contoh: Limousin / Brahman / Simental"
                />
              </div>

              {ibFormData.date && (
                <div className="sm:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <label className="block text-xs font-bold mb-1 text-blue-900">
                    Rekomendasi Jadwal PKB (90 Hari Setelah IB)
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="w-full min-h-touch h-11 px-3.5 border border-blue-300 rounded-xl bg-white text-blue-900 font-bold text-xs cursor-not-allowed"
                    value={new Date(
                      new Date(ibFormData.date).setDate(new Date(ibFormData.date).getDate() + 90)
                    ).toLocaleDateString('id-ID')}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8 pt-5 border-t border-slate-100">
              <button
                onClick={() => setShowIBModal(false)}
                className="flex-1 min-h-touch h-11 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleAddInsemination}
                disabled={!ibFormData.date || !ibFormData.inseminatorName}
                className="flex-1 min-h-touch h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs disabled:opacity-40 transition-colors cursor-pointer"
              >
                Simpan &amp; Kirim Data IB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}