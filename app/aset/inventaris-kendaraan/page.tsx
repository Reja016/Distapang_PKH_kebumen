'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import { ArrowLeft, Plus, Download } from 'lucide-react';
import { KendaraanRecord, KendaraanFormData } from '@/components/aset/types';
import { KendaraanModalForm } from '@/components/aset/KendaraanModalForm';
import { KendaraanTable } from '@/components/aset/KendaraanTable';

const initialFormData: KendaraanFormData = {
  namaPemegang: '',
  merkType: '',
  tahun: new Date().getFullYear().toString(),
  nopolLama: '',
  nopolBaru: '',
  nomorMesin: '',
  nomorRangka: '',
  keterangan: '',
};

export default function InventarisKendaraanPage() {
  const { isReady, canCreate, canEdit } = usePageAuth('aset', 'inventaris-kendaraan');
  const [dataKendaraan, setDataKendaraan] = useState<KendaraanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<KendaraanFormData>(initialFormData);

  // Load data dari database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/aset-kendaraan');
        const json = await res.json();
        if (json.success) {
          const mapped: KendaraanRecord[] = json.data.map((row: any) => ({
            id: String(row.id_aset),
            namaPemegang: row.nama_pemegang,
            merkType: row.merk_type,
            tahun: String(row.tahun),
            nopolLama: row.nopol_lama || '',
            nopolBaru: row.nopol_baru,
            nomorMesin: row.nomor_mesin,
            nomorRangka: row.nomor_rangka,
            keterangan: '',
          }));
          setDataKendaraan(mapped);
        }
      } catch (err) {
        console.error('Gagal memuat data kendaraan:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...initialFormData,
      tahun: new Date().getFullYear().toString(),
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: KendaraanRecord) => {
    setEditingId(item.id);
    setFormData({
      namaPemegang: item.namaPemegang,
      merkType: item.merkType,
      tahun: item.tahun,
      nopolLama: item.nopolLama,
      nopolBaru: item.nopolBaru,
      nomorMesin: item.nomorMesin,
      nomorRangka: item.nomorRangka,
      keterangan: item.keterangan || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      alert('Hanya Administrator yang memiliki hak akses untuk menghapus data!');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus data kendaraan dinas ini?')) {
      try {
        const res = await fetch(`/api/aset-kendaraan?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          setDataKendaraan((prev) => prev.filter((item) => item.id !== id));
        } else {
          alert('Gagal menghapus: ' + json.error);
        }
      } catch {
        alert('Terjadi kesalahan saat menghapus data.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && !canEdit) {
      alert('Hanya Administrator yang memiliki hak akses untuk mengubah (edit) data!');
      return;
    }
    if (!editingId && !canCreate) {
      alert('Anda tidak memiliki hak akses untuk menambah data!');
      return;
    }
    if (!formData.namaPemegang) {
      alert('Nama Pemegang kendaraan wajib diisi!');
      return;
    }
    setSaving(true);

    try {
      if (editingId) {
        const res = await fetch('/api/aset-kendaraan', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_aset: editingId,
            nama_pemegang: formData.namaPemegang,
            merk_type: formData.merkType,
            tahun: formData.tahun,
            nopol_lama: formData.nopolLama,
            nopol_baru: formData.nopolBaru,
            nomor_mesin: formData.nomorMesin,
            nomor_rangka: formData.nomorRangka,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setDataKendaraan((prev) =>
            prev.map((item) => (item.id === editingId ? { ...item, ...formData } : item))
          );
          alert('Data kendaraan dinas berhasil diperbarui!');
        } else {
          alert('Gagal memperbarui: ' + json.error);
        }
      } else {
        const res = await fetch('/api/aset-kendaraan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama_pemegang: formData.namaPemegang,
            merk_type: formData.merkType,
            tahun: formData.tahun,
            nopol_lama: formData.nopolLama,
            nopol_baru: formData.nopolBaru,
            nomor_mesin: formData.nomorMesin,
            nomor_rangka: formData.nomorRangka,
          }),
        });
        const json = await res.json();
        if (json.success) {
          const newRecord: KendaraanRecord = {
            id: String(json.insertId),
            ...formData,
          };
          setDataKendaraan((prev) => [...prev, newRecord]);
          alert('Data kendaraan dinas baru berhasil ditambahkan!');
        } else {
          alert('Gagal menyimpan: ' + json.error);
        }
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSaving(false);
    }
    setShowModal(false);
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return dataKendaraan.filter((item) => {
      return (
        item.namaPemegang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.merkType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nopolLama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nopolBaru.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nomorMesin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nomorRangka.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tahun.includes(searchTerm)
      );
    });
  }, [dataKendaraan, searchTerm]);

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = filteredData.map((d, index) => ({
      No: index + 1,
      'Nama Pemegang': d.namaPemegang,
      'Merk / Type': d.merkType,
      Tahun: d.tahun,
      'Nomor Polisi (Lama)': d.nopolLama,
      'Nomor Polisi (Baru)': d.nopolBaru,
      'Nomor Mesin': d.nomorMesin,
      'Nomor Rangka': d.nomorRangka,
      Keterangan: d.keterangan || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaris_Kendaraan');
    XLSX.writeFile(wb, `Inventaris_Kendaraan_Dinas_Distapang_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading || !isReady) return null;

  return (
    <div className="min-h-screen bg-amber-50/30 text-slate-900 font-sans selection:bg-amber-600 selection:text-white pb-20">
      {/* ── TOP HEADER (Tema Amber) ── */}
      <header className="border-b border-amber-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/aset"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Modul Aset"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/aset" className="text-xs font-semibold text-slate-500 hover:text-amber-700 transition-colors truncate">
                  Aset
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-amber-700 whitespace-nowrap">Inventaris Kendaraan</span>
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                Inventaris Kendaraan Dinas
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              className="min-h-touch min-w-touch h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            {canCreate && (
              <button
                onClick={handleOpenAdd}
                className="min-h-touch min-w-touch h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Tambah Kendaraan</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <KendaraanTable
          dataKendaraan={dataKendaraan}
          filteredData={filteredData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          canEdit={canEdit}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      </main>

      {/* ── MODAL FORM TAMBAH / EDIT DATA KENDARAAN ── */}
      <KendaraanModalForm
        showModal={showModal}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
