'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import {
  ArrowLeft,
  Download,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

import {
  IBRecord,
  fmtDate,
  estimateBirthInfo,
  calculateCalvingIntervals,
} from '@/components/bitpro/database-ib/types';
import IbTableSection from '@/components/bitpro/database-ib/IbTableSection';
import IbCalvingIntervalSection from '@/components/bitpro/database-ib/IbCalvingIntervalSection';
import IbModals from '@/components/bitpro/database-ib/IbModals';

export default function DatabaseIBPage() {
  const { isReady, canCreate, canEdit } = usePageAuth('bitpro', 'database-ib');
  const [ibList, setIbList] = useState<IBRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showPkbModal, setShowPkbModal] = useState(false);
  const [selectedIbForPkb, setSelectedIbForPkb] = useState<IBRecord | null>(null);
  const [pkbFormData, setPkbFormData] = useState<{
    date: string;
    result: 'Bunting' | 'Tidak Bunting';
    officer: string;
    notes: string;
  }>({ date: '', result: 'Bunting', officer: '', notes: '' });

  const [showSkipPkbModal, setShowSkipPkbModal] = useState(false);
  const [selectedIbForSkip, setSelectedIbForSkip] = useState<IBRecord | null>(null);
  const [skipFormData, setSkipFormData] = useState({ date: '', reason: '' });

  const [showBirthModal, setShowBirthModal] = useState(false);
  const [selectedIbForBirth, setSelectedIbForBirth] = useState<IBRecord | null>(null);
  const [birthFormData, setBirthFormData] = useState<{
    date: string;
    gender: 'Jantan' | 'Betina';
    notes: string;
  }>({ date: '', gender: 'Jantan', notes: '' });

  // 1. Tarik Data dari MySQL (API)
  const loadData = async () => {
    try {
      const res = await fetch('/api/sapitime');
      const json = await res.json();
      if (json.success && json.cattle) {
        const allIBs: IBRecord[] = [];
        json.cattle.forEach((cattle: any) => {
          if (cattle.inseminations && cattle.inseminations.length > 0) {
            cattle.inseminations.forEach((ib: any) => {
              allIBs.push({
                ...ib,
                cattleName: cattle.name,
                ownerName: cattle.ownerName || '',
                cattleId: cattle.id,
              });
            });
          }
        });
        allIBs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setIbList(allIBs);
      }
    } catch (e) {
      console.error('Gagal mengambil data IB dari database', e);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cattleDataUpdated', loadData);
    return () => window.removeEventListener('cattleDataUpdated', loadData);
  }, []);

  // 2. Fungsi Tembak Eksekusi ke MySQL
  const executeApi = async (action: string, payload: any, historyObj?: any) => {
    try {
      await fetch('/api/sapitime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload, history: historyObj }),
      });
      loadData();
      window.dispatchEvent(new Event('cattleDataUpdated'));
    } catch (e) {
      console.error('Gagal menyimpan data ke database', e);
    }
  };

  // Simpan Hasil PKB
  const handleSavePkb = async () => {
    if (!selectedIbForPkb) return;
    if (!canCreate && !canEdit) {
      alert('Anda tidak memiliki izin untuk mencatat hasil PKB.');
      return;
    }

    const payload = {
      ib_id: selectedIbForPkb.id,
      cattle_id: selectedIbForPkb.cattleId,
      pkbDateActual: pkbFormData.date,
      pkbResult: pkbFormData.result,
      pkbOfficer: pkbFormData.officer,
      pkbNotes: pkbFormData.notes,
      pregnancyDate: pkbFormData.result === 'Bunting' ? selectedIbForPkb.date : null,
      newCattleStatus: pkbFormData.result === 'Bunting' ? 'Bunting' : 'Estrus',
    };

    const historyObj = {
      type: 'pkb_recorded',
      cattle: selectedIbForPkb.cattleName,
      cattleId: selectedIbForPkb.cattleId,
      description: `PKB Dicatat: Hasil ${pkbFormData.result} (Oleh: ${pkbFormData.officer})`,
      icon: pkbFormData.result === 'Bunting' ? '🤰' : '❌',
    };

    await executeApi('record_pkb', payload, historyObj);

    setShowPkbModal(false);
    setPkbFormData({ date: '', result: 'Bunting', officer: '', notes: '' });
    setSelectedIbForPkb(null);
  };

  // Tandai Tidak PKB
  const handleSkipPkb = async () => {
    if (!selectedIbForSkip) return;
    if (!canCreate && !canEdit) {
      alert('Anda tidak memiliki izin untuk mengubah status PKB.');
      return;
    }

    const payload = {
      ib_id: selectedIbForSkip.id,
      pkbSkipDate: skipFormData.date,
      pkbSkipReason: skipFormData.reason,
    };

    const historyObj = {
      type: 'pkb_skipped',
      cattle: selectedIbForSkip.cattleName,
      cattleId: selectedIbForSkip.cattleId,
      description: `PKB Tidak Dilakukan${skipFormData.reason ? ` (Alasan: ${skipFormData.reason})` : ''}`,
      icon: '🚫',
    };

    await executeApi('skip_pkb', payload, historyObj);

    setShowSkipPkbModal(false);
    setSkipFormData({ date: '', reason: '' });
    setSelectedIbForSkip(null);
  };

  // Simpan Kelahiran
  const handleSaveBirth = async () => {
    if (!selectedIbForBirth) return;
    if (!canCreate && !canEdit) {
      alert('Anda tidak memiliki izin untuk mencatat kelahiran pedet.');
      return;
    }

    const payload = {
      ib_id: selectedIbForBirth.id,
      cattle_id: selectedIbForBirth.cattleId,
      birthDate: birthFormData.date,
      calfGender: birthFormData.gender,
      birthNotes: birthFormData.notes,
    };

    const historyObj = {
      type: 'birth_recorded',
      cattle: selectedIbForBirth.cattleName,
      cattleId: selectedIbForBirth.cattleId,
      description: `Kelahiran Pedet ${birthFormData.gender} sukses!`,
      icon: '🍼',
    };

    await executeApi('record_birth', payload, historyObj);

    setShowBirthModal(false);
    setBirthFormData({ date: '', gender: 'Jantan', notes: '' });
    setSelectedIbForBirth(null);
  };

  const calvingIntervals = useMemo(() => calculateCalvingIntervals(ibList), [ibList]);

  const avgCalvingIntervalDays = useMemo(() => {
    if (calvingIntervals.length === 0) return null;
    const total = calvingIntervals.reduce((sum, r) => sum + r.intervalHari, 0);
    return Math.round(total / calvingIntervals.length);
  }, [calvingIntervals]);

  // Export ke Excel Multi-Sheet
  const handleExportExcel = () => {
    const dataSheet = ibList.map((ib) => {
      const birthInfo = ib.pkbResult === 'Bunting' && !ib.birthDate ? estimateBirthInfo(ib) : null;
      return {
        'Nama Peternak': ib.ownerName || '-',
        'Nama Sapi': ib.cattleName,
        'ID Sapi': ib.cattleId,
        Kecamatan: ib.kecamatan,
        Desa: ib.desa,
        'Tanggal IB': fmtDate(ib.date),
        'Jam IB': ib.time,
        'Nama Inseminator': ib.inseminatorName,
        'Kode Straw': ib.strawCode,
        'Nama Pejantan': ib.bullName,
        'Ras Pejantan': ib.bullBreed,
        'Rekomendasi PKB': ib.rekomendasiPkb,
        'Status PKB': ib.pkbResult
          ? 'Sudah Diperiksa'
          : ib.pkbStatus === 'Tidak Diperiksa'
          ? 'Tidak Diperiksa'
          : 'Menunggu',
        'Tanggal PKB Aktual': fmtDate(ib.pkbDateActual),
        'Hasil PKB': ib.pkbResult || '-',
        'Petugas PKB': ib.pkbOfficer || '-',
        'Catatan PKB': ib.pkbNotes || '-',
        'Tanggal PKB Dilewati': fmtDate(ib.pkbSkipDate),
        'Alasan PKB Dilewati': ib.pkbSkipReason || '-',
        'Estimasi Tanggal Lahir': birthInfo ? birthInfo.estimatedDateLabel : '-',
        'Estimasi Sisa Hari': birthInfo ? birthInfo.daysRemaining : '-',
        'Tanggal Lahir Aktual': fmtDate(ib.birthDate),
        'Jenis Kelamin Pedet': ib.calfGender || '-',
        'Catatan Kelahiran': ib.birthNotes || '-',
        'Catatan IB': ib.notes || '-',
      };
    });

    const calvingSheet = calvingIntervals.map((row) => ({
      'Nama Peternak': row.ownerName || '-',
      'Nama Sapi': row.cattleName,
      'ID Sapi': row.cattleId,
      'Kelahiran Ke-': row.calvingKe + 1,
      'Kelahiran Sebelumnya': row.kelahiranSebelumnya,
      'Kelahiran Sekarang': row.kelahiranSekarang,
      'Interval (Hari)': row.intervalHari,
      'Interval (Bulan)': row.intervalBulan,
      Kategori: row.kategori,
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(dataSheet);
    XLSX.utils.book_append_sheet(wb, ws1, 'Data Siklus IB');

    if (calvingSheet.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(calvingSheet);
      XLSX.utils.book_append_sheet(wb, ws2, 'Calving Interval');
    }

    const todayLabel = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Data_Siklus_IB_${todayLabel}.xlsx`);
  };

  const filteredIB = ibList.filter(
    (ib) =>
      ib.cattleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ib.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ib.inseminatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ib.kecamatan && ib.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ib.strawCode && ib.strawCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      {/* ── TOP APP BAR (Tema Hijau Bitpro) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/bitpro"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Bitpro"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
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
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Database IB</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Pencatatan Inseminasi Buatan &amp; Reproduksi
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              title="Export Excel"
              aria-label="Export Excel"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <Link
              href="/bitpro/sapitime"
              title="Buka SapiTime"
              aria-label="Buka SapiTime"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
            >
              <Smartphone size={16} className="sm:hidden" />
              <span className="hidden sm:inline">Buka SapiTime</span>
              <ChevronRight size={16} className="hidden sm:inline" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* 1. TABEL UTAMA DATABASE IB */}
        <IbTableSection
          filteredIB={filteredIB}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          canCreate={canCreate}
          canEdit={canEdit}
          onOpenPkb={(ib) => {
            setSelectedIbForPkb(ib);
            setShowPkbModal(true);
          }}
          onOpenSkipPkb={(ib) => {
            setSelectedIbForSkip(ib);
            setShowSkipPkbModal(true);
          }}
          onOpenBirth={(ib) => {
            setSelectedIbForBirth(ib);
            setShowBirthModal(true);
          }}
        />

        {/* 2. ANALISIS CALVING INTERVAL (JARAK BERANAK) */}
        <IbCalvingIntervalSection
          calvingIntervals={calvingIntervals}
          avgCalvingIntervalDays={avgCalvingIntervalDays}
        />
      </main>

      {/* ── MODALS (PKB, SKIP PKB, KELAHIRAN) ── */}
      <IbModals
        showPkbModal={showPkbModal}
        selectedIbForPkb={selectedIbForPkb}
        pkbFormData={pkbFormData}
        setPkbFormData={setPkbFormData}
        onClosePkb={() => setShowPkbModal(false)}
        onSavePkb={handleSavePkb}
        showSkipPkbModal={showSkipPkbModal}
        selectedIbForSkip={selectedIbForSkip}
        skipFormData={skipFormData}
        setSkipFormData={setSkipFormData}
        onCloseSkipPkb={() => setShowSkipPkbModal(false)}
        onSaveSkipPkb={handleSkipPkb}
        showBirthModal={showBirthModal}
        selectedIbForBirth={selectedIbForBirth}
        birthFormData={birthFormData}
        setBirthFormData={setBirthFormData}
        onCloseBirth={() => setShowBirthModal(false)}
        onSaveBirth={handleSaveBirth}
      />
    </div>
  );
}