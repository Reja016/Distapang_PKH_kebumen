'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  X,
  Send,
  History,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Users,
  Building2,
  MapPin,
  Shield,
  Layers,
  Sparkles,
  Info,
  AlertTriangle,
  Flame,
  Radio,
} from 'lucide-react';

interface BroadcastAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onSuccess?: () => void;
}

export const TARGET_PUSKESWAN_LIST = [
  'Puskeswan Mirit',
  'Puskeswan Klirong',
  'Puskeswan Kebumen',
  'Puskeswan Gombong',
  'Puskeswan Buayan',
  'Puskeswan Prembun',
  'Puskeswan Alian',
  'Puskeswan Karanganyar',
];

export const TARGET_BIDANG_LIST = [
  { key: 'keswan', label: 'Bidang Keswan (Kesehatan Hewan & Apotek)' },
  { key: 'bitpro', label: 'Bidang Bitpro (Bibit, Produksi, IB & SapiTime)' },
  { key: 'kesmavet', label: 'Bidang Kesmavet (RPH, TPU & NKV)' },
  { key: 'aset', label: 'Bidang Aset & Inventaris' },
];

export const PRESET_LINKS = [
  { label: '-- Tidak Ada Tautan --', url: '' },
  { label: 'Stok Gudang Obat (Keswan)', url: '/keswan/stok-gudang' },
  { label: 'Vaksinasi PMK (Keswan)', url: '/keswan/data-vaksinasi' },
  { label: 'Laporan Penyakit Hewan (Keswan)', url: '/keswan/laporan-penyakit' },
  { label: 'SapiTime Monitoring (Bitpro)', url: '/bitpro/sapitime' },
  { label: 'Database IB (Bitpro)', url: '/bitpro/database-ib' },
  { label: 'Monev KTT (Bitpro)', url: '/bitpro/monev-ktt' },
  { label: 'RPH & Pemotongan (Kesmavet)', url: '/kesmavet/rph-tph-tpu' },
  { label: 'Inventaris Kendaraan (Aset)', url: '/aset/inventaris-kendaraan' },
  { label: 'Pusat Koreksi & Riwayat', url: '/admin/pusat-koreksi' },
];

export default function BroadcastAnnouncementModal({
  isOpen,
  onClose,
  isDark,
  onSuccess,
}: BroadcastAnnouncementModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'info' | 'warning' | 'urgent'>('info');
  const [targetGroup, setTargetGroup] = useState<'ALL' | 'PUSKESWAN' | 'BIDANG' | 'ROLE'>('ALL');
  const [selectedPuskeswan, setSelectedPuskeswan] = useState(TARGET_PUSKESWAN_LIST[0]);
  const [selectedBidang, setSelectedBidang] = useState(TARGET_BIDANG_LIST[0].key);
  const [selectedRole, setSelectedRole] = useState('Petugas Teknis');
  const [linkPreset, setLinkPreset] = useState('');
  const [customLink, setCustomLink] = useState('');

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ambil riwayat pengumuman saat tab 'history' dibuka
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/announcements?manage=true');
      const data = await res.json();
      if (data.success) {
        setHistoryList(data.announcements || []);
      }
    } catch (err) {
      console.error('Gagal memuat riwayat:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchHistory();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Resolve target value & label
  let targetType = targetGroup;
  let targetValue = 'ALL';
  let targetLabel = 'Semua Pengguna (Broadcast)';

  if (targetGroup === 'PUSKESWAN') {
    targetValue = selectedPuskeswan;
    targetLabel = `Tim ${selectedPuskeswan}`;
  } else if (targetGroup === 'BIDANG') {
    targetValue = selectedBidang;
    const found = TARGET_BIDANG_LIST.find((b) => b.key === selectedBidang);
    targetLabel = found ? found.label : selectedBidang;
  } else if (targetGroup === 'ROLE') {
    targetValue = selectedRole;
    targetLabel = `Role: ${selectedRole}`;
  }

  const effectiveLink = customLink.trim() || linkPreset;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatusMsg({ type: 'error', text: 'Judul dan isi pengumuman wajib diisi.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          category,
          target_type: targetType,
          target_value: targetValue,
          target_label: targetLabel,
          link: effectiveLink || null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMsg({ type: 'success', text: json.message });
        setTitle('');
        setMessage('');
        setCustomLink('');
        setLinkPreset('');
        if (onSuccess) onSuccess();
        // Switch ke history setelah berhasil
        setTimeout(() => {
          setActiveTab('history');
          fetchHistory();
        }, 1200);
      } else {
        setStatusMsg({ type: 'error', text: json.error || 'Gagal mengirim pengumuman.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus pengumuman ini? Banner tidak akan tampil lagi di dashboard petugas.')) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchHistory();
        if (onSuccess) onSuccess();
      } else {
        alert(json.error);
      }
    } catch {
      alert('Gagal menghapus pengumuman.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header Modal */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                Broadcast Pengumuman Dinas
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Admin Tool
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Siarkan pengumuman ke seluruh dinas atau tim wilayah/bidang tertentu secara terarah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigasi: Buat Baru vs Riwayat */}
        <div
          className={`px-4 sm:px-6 pt-3 border-b flex gap-4 shrink-0 text-xs font-bold ${
            isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
          }`}
        >
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Send size={14} />
            <span>Kirim Pengumuman Baru</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <History size={14} />
            <span>Riwayat Broadcast ({historyList.length})</span>
          </button>
        </div>

        {/* Status Message Notification */}
        {statusMsg && (
          <div
            className={`mx-4 sm:mx-6 mt-4 p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target Tim Penerima */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users size={14} className="text-amber-500" />
                    Target Tim Penerima Pengumuman
                  </label>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {targetLabel}
                  </span>
                </div>

                {/* 4 Opsi Target Group */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetGroup('ALL')}
                    className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      targetGroup === 'ALL'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Radio size={14} />
                    <span>Semua Tim (Publik)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetGroup('PUSKESWAN')}
                    className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      targetGroup === 'PUSKESWAN'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin size={14} />
                    <span>Tim Puskeswan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetGroup('BIDANG')}
                    className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      targetGroup === 'BIDANG'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 size={14} />
                    <span>Tim Bidang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetGroup('ROLE')}
                    className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      targetGroup === 'ROLE'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Shield size={14} />
                    <span>Role Akun</span>
                  </button>
                </div>

                {/* Sub Selector jika memilih PUSKESWAN */}
                {targetGroup === 'PUSKESWAN' && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Pilih Puskeswan Sasaran:
                    </label>
                    <select
                      value={selectedPuskeswan}
                      onChange={(e) => setSelectedPuskeswan(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                      }`}
                    >
                      {TARGET_PUSKESWAN_LIST.map((p) => (
                        <option key={p} value={p}>
                          🏥 {p}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sub Selector jika memilih BIDANG */}
                {targetGroup === 'BIDANG' && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Pilih Bidang Sasaran:
                    </label>
                    <select
                      value={selectedBidang}
                      onChange={(e) => setSelectedBidang(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                      }`}
                    >
                      {TARGET_BIDANG_LIST.map((b) => (
                        <option key={b.key} value={b.key}>
                          🏢 {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sub Selector jika memilih ROLE */}
                {targetGroup === 'ROLE' && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Pilih Role Sasaran:
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                      }`}
                    >
                      <option value="Petugas Teknis">Petugas Teknis Lapangan</option>
                      <option value="Administrator">Administrator Dinas</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Judul & Kategori Urgensi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Judul Pengumuman *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Batas Akhir Input Dropping Obat Triwulan I"
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Tingkat Urgensi
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
                    }`}
                  >
                    <option value="info">🔵 Informasi Biasa</option>
                    <option value="warning">🟡 Penting / Pengingat</option>
                    <option value="urgent">🔴 Mendesak / Instruksi</option>
                  </select>
                </div>
              </div>

              {/* Pesan Pengumuman */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Isi Pesan Pengumuman *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan isi instruksi atau pengumuman secara jelas untuk petugas..."
                  className={`w-full p-3 rounded-xl border text-xs font-normal focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              {/* Tautan Cepat / Link Modul (Opsional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <ExternalLink size={12} className="text-slate-400" />
                    Pintasan Modul (Opsional)
                  </label>
                  <select
                    value={linkPreset}
                    onChange={(e) => {
                      setLinkPreset(e.target.value);
                      if (e.target.value) setCustomLink('');
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
                    }`}
                  >
                    {PRESET_LINKS.map((pl) => (
                      <option key={pl.url} value={pl.url}>
                        {pl.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Atau URL Kustom
                  </label>
                  <input
                    type="text"
                    value={customLink}
                    onChange={(e) => {
                      setCustomLink(e.target.value);
                      if (e.target.value) setLinkPreset('');
                    }}
                    placeholder="/keswan/stok-gudang"
                    className={`w-full p-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {/* Preview Banner Mini */}
              {title.trim() && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Pratinjau Banner di Dashboard Petugas:
                  </p>
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      category === 'urgent'
                        ? isDark
                          ? 'bg-rose-950/40 border-rose-900/80 text-rose-200'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                        : category === 'warning'
                        ? isDark
                          ? 'bg-amber-950/40 border-amber-900/80 text-amber-200'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                        : isDark
                        ? 'bg-blue-950/40 border-blue-900/80 text-blue-200'
                        : 'bg-blue-50 border-blue-200 text-blue-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <Megaphone className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white/60 dark:bg-black/40 border border-current">
                              {targetLabel}
                            </span>
                            <span className="text-[10px] font-medium opacity-80">
                              Diterbitkan oleh Admin
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm mt-1">{title}</h4>
                          <p className="text-xs mt-1 leading-relaxed opacity-90 whitespace-pre-line">
                            {message || 'Isi pengumuman...'}
                          </p>
                          {effectiveLink && (
                            <div className="mt-2.5">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-2xs">
                                Buka Halaman Terkait <ExternalLink size={10} />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tombol Kirim */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Send size={14} className={isSubmitting ? 'animate-pulse' : ''} />
                  <span>{isSubmitting ? 'Menyiarkan...' : 'Siarkan Pengumuman Sekarang'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Tab Riwayat Pengumuman */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b dark:border-slate-800">
                <span>Daftar pengumuman yang pernah disiarkan:</span>
                <button
                  onClick={fetchHistory}
                  className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Segarkan
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                  Memuat riwayat pengumuman...
                </div>
              ) : historyList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                  Belum ada pengumuman yang disiarkan.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                        isDark
                          ? 'bg-slate-950/60 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              item.category === 'urgent'
                                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                : item.category === 'warning'
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            }`}
                          >
                            {item.category.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            🎯 {item.target_label || item.target_value}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            WIB
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed line-clamp-2">
                          {item.message}
                        </p>
                        {item.link && (
                          <div className="pt-1">
                            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                              🔗 {item.link}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                        title="Hapus Pengumuman"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
