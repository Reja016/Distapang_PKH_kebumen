'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  AlertTriangle,
  Building2,
  Pill,
  ShieldAlert,
  Loader2,
  Save,
  Boxes,
} from 'lucide-react';
import {
  MasterBarang,
  StokDinasLedger,
  StokPuskeswanItem,
  DAFTAR_PUSKESWAN_GUDANG,
  SUMBER_ANGGARAN_OPTIONS,
  SATUAN_KEMASAN_OPTIONS,
} from './types';

// ── 1. MODAL TAMBAH / EDIT MASTER BARANG ──
interface ModalBarangProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: MasterBarang | null;
}

export function ModalBarang({ isOpen, onClose, onSuccess, initialData }: ModalBarangProps) {
  const [namaBarang, setNamaBarang] = useState('');
  const [kategori, setKategori] = useState('Obat');
  const [satuanKemasan, setSatuanKemasan] = useState('Botol');
  const [minStokDinas, setMinStokDinas] = useState(10);
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setNamaBarang(initialData.nama_barang || '');
      setKategori(initialData.kategori || 'Obat');
      setSatuanKemasan(initialData.satuan_kemasan || 'Botol');
      setMinStokDinas(Number(initialData.min_stok_dinas ?? 10));
      setKeterangan(initialData.keterangan || '');
    } else {
      setNamaBarang('');
      setKategori('Obat');
      setSatuanKemasan('Botol');
      setMinStokDinas(10);
      setKeterangan('');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang.trim()) {
      setErrorMsg('Nama barang wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/stok-gudang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_BARANG',
          id_barang: initialData?.id_barang,
          nama_barang: namaBarang.trim(),
          kategori,
          satuan_kemasan: satuanKemasan,
          min_stok_dinas: Number(minStokDinas || 10),
          keterangan,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(resJson.error || 'Gagal menyimpan master barang.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-base">
              {initialData ? 'Ubah Data Master Barang' : 'Tambah Master Barang / Obat'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Nama Produk / Obat / Alat</label>
            <input
              type="text"
              required
              placeholder="Contoh: Flunixin Meglumine, Penstrep, Spuit 10ml..."
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                <option value="Obat">Obat</option>
                <option value="Vaksin">Vaksin</option>
                <option value="Alat Medis">Alat Medis</option>
                <option value="Desinfektan">Desinfektan</option>
                <option value="Vitamin / Suplemen">Vitamin / Suplemen</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Satuan Kemasan</label>
              <select
                value={satuanKemasan}
                onChange={(e) => setSatuanKemasan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                {SATUAN_KEMASAN_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Batas Minimum Stok Penyangga Dinas (Safety Buffer)
            </label>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              required
              value={minStokDinas}
              onChange={(e) => setMinStokDinas(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Bila stok dinas tersisa mencapai angka ini, tombol distribusi biasa terkunci dan hanya dapat disalurkan melalui jalur darurat.
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-1">Keterangan / Deskripsi (Opsional)</label>
            <textarea
              rows={2}
              placeholder="Indikasi, penyimpanan suhu dingin, dll..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Master Barang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 2. MODAL TAMBAH DROPPING MASUK KE DINAS ──
interface ModalDroppingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  masterBarang: MasterBarang[];
}

export function ModalDroppingDinas({ isOpen, onClose, onSuccess, masterBarang }: ModalDroppingProps) {
  const [idBarang, setIdBarang] = useState<number>(masterBarang[0]?.id_barang || 0);
  const [sumberAnggaran, setSumberAnggaran] = useState('APBD Kabupaten');
  const [tahun, setTahun] = useState(2026);
  const [bulan, setBulan] = useState('Juli');
  const [nomorBatch, setNomorBatch] = useState('');
  const [tanggalKadaluarsa, setTanggalKadaluarsa] = useState('');
  const [jumlah, setJumlah] = useState<number | ''>(100);
  const [hargaSatuanDisplay, setHargaSatuanDisplay] = useState<string>('');
  const [yangMenerima, setYangMenerima] = useState('');
  const [nipPenerima, setNipPenerima] = useState('');
  const [yangMenyerahkan, setYangMenyerahkan] = useState('');
  const [nipPenyerah, setNipPenyerah] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (masterBarang.length > 0 && !idBarang) {
      setIdBarang(masterBarang[0].id_barang);
    }
    setErrorMsg('');
  }, [masterBarang, isOpen]);

  if (!isOpen) return null;

  const selectedB = masterBarang.find((b) => b.id_barang === idBarang);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numJumlah = typeof jumlah === 'number' ? jumlah : parseInt(String(jumlah), 10);
    const numHarga = hargaSatuanDisplay ? parseInt(hargaSatuanDisplay.replace(/\D/g, ''), 10) : 0;

    if (!idBarang || !numJumlah || numJumlah <= 0) {
      setErrorMsg('Pilih obat dan tentukan jumlah yang masuk (minimal 1).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const selectedB = masterBarang.find((b) => b.id_barang === idBarang);
      const res = await fetch('/api/stok-gudang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TAMBAH_DROPPING_DINAS',
          tahun,
          bulan,
          id_barang: idBarang,
          nomor_batch: nomorBatch.trim() || `BATCH-${Date.now().toString().slice(-4)}`,
          tanggal_kadaluarsa: tanggalKadaluarsa || null,
          sumber_anggaran: sumberAnggaran,
          satuan_kemasan: selectedB?.satuan_kemasan || 'Botol',
          jumlah: numJumlah,
          harga_satuan: numHarga,
          yang_menerima: yangMenerima,
          nip_penerima: nipPenerima,
          yang_menyerahkan: yangMenyerahkan,
          nip_penyerah: nipPenyerah,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(resJson.error || 'Gagal menyimpan data dropping.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base">Catat Dropping Masuk ke Gudang Dinas</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Pilih Barang */}
          <div>
            <label className="block font-semibold mb-1">Pilih Produk / Obat</label>
            <select
              value={idBarang}
              onChange={(e) => setIdBarang(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
            >
              {masterBarang.map((b) => (
                <option key={b.id_barang} value={b.id_barang}>
                  {b.nama_barang} ({b.satuan_kemasan} - {b.kategori})
                </option>
              ))}
            </select>
          </div>

          {/* Sumber Anggaran & Periode */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-semibold mb-1">Sumber Anggaran</label>
              <select
                value={sumberAnggaran}
                onChange={(e) => setSumberAnggaran(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                {SUMBER_ANGGARAN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Tahun</label>
              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Bulan</label>
              <input
                type="text"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Batch & Tanggal Expired */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Nomor Batch</label>
              <input
                type="text"
                required
                placeholder="Contoh: B-2026-07A"
                value={nomorBatch}
                onChange={(e) => setNomorBatch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Tanggal Kadaluarsa</label>
              <input
                type="date"
                required
                value={tanggalKadaluarsa}
                onChange={(e) => setTanggalKadaluarsa(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Jumlah & Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold">Jumlah Masuk (Volume)</label>
                {selectedB?.satuan_kemasan && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Satuan: {selectedB.satuan_kemasan}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    const cur = typeof jumlah === 'number' ? jumlah : parseInt(String(jumlah) || '0', 10);
                    if (cur > 1) setJumlah(cur - 1);
                  }}
                  className="h-10 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-l-xl font-bold border border-r-0 border-slate-200 dark:border-slate-700 select-none active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  title="Kurang 1"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  required
                  placeholder="0"
                  value={jumlah === '' ? '' : jumlah}
                  onChange={(e) => {
                    const val = e.target.value;
                    setJumlah(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                  }}
                  className="w-full h-10 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 outline-none font-bold text-center text-emerald-600 dark:text-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-base"
                />
                <button
                  type="button"
                  onClick={() => {
                    const cur = typeof jumlah === 'number' ? jumlah : parseInt(String(jumlah) || '0', 10);
                    setJumlah(cur + 1);
                  }}
                  className="h-10 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-r-xl font-bold border border-l-0 border-slate-200 dark:border-slate-700 select-none active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  title="Tambah 1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* Quick helper chips for mobile */}
              <div className="flex items-center gap-1.5 mt-1.5">
                {[10, 50, 100].map((add) => (
                  <button
                    key={add}
                    type="button"
                    onClick={() => {
                      const cur = typeof jumlah === 'number' ? jumlah : parseInt(String(jumlah) || '0', 10);
                      setJumlah(cur + add);
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    +{add}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setJumlah('')}
                  className="px-2 py-0.5 text-[10px] font-medium text-slate-400 hover:text-rose-500 transition-colors ml-auto cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold">Harga Satuan (Rp)</label>
                <span className="text-[11px] text-slate-400 font-medium">Opsional</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-xs font-bold text-slate-400">Rp</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={hargaSatuanDisplay}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setHargaSatuanDisplay(raw ? Number(raw).toLocaleString('id-ID') : '');
                  }}
                  className="w-full h-10 pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                {[
                  { label: '10 rb', val: 10000 },
                  { label: '50 rb', val: 50000 },
                  { label: '100 rb', val: 100000 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      const cur = hargaSatuanDisplay ? parseInt(hargaSatuanDisplay.replace(/\D/g, ''), 10) : 0;
                      setHargaSatuanDisplay(Number(cur + item.val).toLocaleString('id-ID'));
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    +{item.label}
                  </button>
                ))}
                {hargaSatuanDisplay && (
                  <button
                    type="button"
                    onClick={() => setHargaSatuanDisplay('')}
                    className="px-2 py-0.5 text-[10px] font-medium text-slate-400 hover:text-rose-500 transition-colors ml-auto cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Penyerah & Penerima */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block font-semibold mb-1">Yang Menyerahkan</label>
              <input
                type="text"
                placeholder="Nama pihak penyerah"
                value={yangMenyerahkan}
                onChange={(e) => setYangMenyerahkan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none mb-1.5"
              />
              <input
                type="text"
                placeholder="NIP Penyerah"
                value={nipPenyerah}
                onChange={(e) => setNipPenyerah(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Yang Menerima (Dinas)</label>
              <input
                type="text"
                placeholder="Nama penerima dinas"
                value={yangMenerima}
                onChange={(e) => setYangMenerima(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none mb-1.5"
              />
              <input
                type="text"
                placeholder="NIP Penerima"
                value={nipPenerima}
                onChange={(e) => setNipPenerima(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-[11px]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Dropping
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 3. MODAL BUAT DISTRIBUSI KE PUSKESWAN (Dropping Terencana / Amprahan Insidental) ──
interface ModalDistribusiProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  stokDinas: StokDinasLedger[];
  defaultIdBarang?: number;
  initialIsDarurat?: boolean;
}

export function ModalBuatDistribusi({
  isOpen,
  onClose,
  onSuccess,
  stokDinas,
  defaultIdBarang,
  initialIsDarurat = false,
}: ModalDistribusiProps) {
  const [idPuskeswan, setIdPuskeswan] = useState<number>(1);
  const [idBarang, setIdBarang] = useState<number>(defaultIdBarang || stokDinas[0]?.id_barang || 0);
  const [nomorBatch, setNomorBatch] = useState<string>('');
  const [jumlah, setJumlah] = useState<number>(10);
  const [jenisDistribusi, setJenisDistribusi] = useState<'DROPING_TERENCANA' | 'AMPRAHAN_INSIDENTAL'>(
    initialIsDarurat ? 'AMPRAHAN_INSIDENTAL' : 'DROPING_TERENCANA'
  );
  const [isDarurat, setIsDarurat] = useState<boolean>(initialIsDarurat);
  const [alasanDarurat, setAlasanDarurat] = useState<string>('');
  const [yangMenyerahkan, setYangMenyerahkan] = useState<string>('');
  const [nipPenyerah, setNipPenyerah] = useState<string>('');
  const [yangMenerima, setYangMenerima] = useState<string>('');
  const [nipPenerima, setNipPenerima] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedLedger = stokDinas.find((s) => s.id_barang === idBarang);

  useEffect(() => {
    if (defaultIdBarang) {
      setIdBarang(defaultIdBarang);
    } else if (stokDinas.length > 0 && !idBarang) {
      setIdBarang(stokDinas[0].id_barang);
    }
    setIsDarurat(initialIsDarurat);
    if (initialIsDarurat) {
      setJenisDistribusi('AMPRAHAN_INSIDENTAL');
    }
  }, [defaultIdBarang, initialIsDarurat, stokDinas, isOpen]);

  useEffect(() => {
    if (selectedLedger && selectedLedger.batches.length > 0) {
      setNomorBatch(selectedLedger.batches[0].nomor_batch);
    }
  }, [idBarang, selectedLedger]);

  if (!isOpen) return null;

  const selectedBatchInfo = selectedLedger?.batches.find((b) => b.nomor_batch === nomorBatch);
  const maxAvailable = selectedLedger?.saldo_dinas || 0;
  const minBuffer = selectedLedger?.min_stok_dinas || 10;
  const isBufferTriggered = maxAvailable - jumlah < minBuffer;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idBarang || !idPuskeswan || jumlah <= 0) {
      setErrorMsg('Data distribusi belum lengkap.');
      return;
    }

    if (jumlah > maxAvailable) {
      setErrorMsg(`Jumlah melebihi saldo gudang dinas (${maxAvailable} unit).`);
      return;
    }

    if (isBufferTriggered && !isDarurat) {
      setErrorMsg(
        `Pengambilan ini akan membuat stok dinas tersisa ${maxAvailable - jumlah} unit (di bawah batas minimum ${minBuffer} unit). Untuk menyalurkan stok penyangga ini, centang opsi 'Pengambilan Darurat' atau hubungi Admin.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const selectedPusk = DAFTAR_PUSKESWAN_GUDANG.find((p) => p.id === idPuskeswan);
      const res = await fetch('/api/stok-gudang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BUAT_DISTRIBUSI',
          id_puskeswan: idPuskeswan,
          nama_puskeswan: selectedPusk?.nama || 'MIRIT',
          id_barang: idBarang,
          nama_barang: selectedLedger?.nama_barang,
          nomor_batch: nomorBatch || selectedBatchInfo?.nomor_batch,
          tanggal_kadaluarsa: selectedBatchInfo?.tanggal_kadaluarsa,
          sumber_anggaran: selectedBatchInfo?.sumber_anggaran || 'APBD Kabupaten',
          tahun_anggaran: selectedBatchInfo?.tahun_anggaran || '2026',
          satuan_kemasan: selectedLedger?.satuan_kemasan || 'Botol',
          jumlah,
          jenis_distribusi: jenisDistribusi,
          is_darurat: isDarurat,
          alasan_darurat: alasanDarurat,
          yang_menyerahkan: yangMenyerahkan,
          nip_penyerah: nipPenyerah,
          yang_menerima: yangMenerima,
          nip_penerima: nipPenerima,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(resJson.error || 'Gagal menyimpan distribusi.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-base">
              {isDarurat ? 'Penyaluran Amprahan Darurat' : 'Distribusi Obat ke Puskeswan'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Tujuan Puskeswan */}
          <div>
            <label className="block font-semibold mb-1">Tujuan Puskeswan (8 Cabang)</label>
            <select
              value={idPuskeswan}
              onChange={(e) => setIdPuskeswan(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
            >
              {DAFTAR_PUSKESWAN_GUDANG.map((p) => (
                <option key={p.id} value={p.id}>
                  Puskeswan {p.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Barang */}
          <div>
            <label className="block font-semibold mb-1">Pilih Obat / Barang dari Gudang Dinas</label>
            <select
              value={idBarang}
              onChange={(e) => setIdBarang(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
            >
              {stokDinas.map((b) => (
                <option key={b.id_barang} value={b.id_barang}>
                  {b.nama_barang} (Saldo Dinas: {b.saldo_dinas} {b.satuan_kemasan} | Buffer: {b.min_stok_dinas})
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Batch ID */}
          {selectedLedger && (
            <div>
              <label className="block font-semibold mb-1">Nomor Batch yang Dikeluarkan</label>
              <select
                value={nomorBatch}
                onChange={(e) => setNomorBatch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono"
              >
                {selectedLedger.batches.map((b) => (
                  <option key={b.nomor_batch} value={b.nomor_batch}>
                    {b.nomor_batch} • Saldo: {b.saldo_batch} • Exp: {b.tanggal_kadaluarsa || '-'} ({b.sumber_anggaran})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Jenis Distribusi & Jumlah */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Jenis Distribusi</label>
              <select
                value={jenisDistribusi}
                onChange={(e: any) => setJenisDistribusi(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                <option value="DROPING_TERENCANA">Dropping Terencana (Rutin)</option>
                <option value="AMPRAHAN_INSIDENTAL">Amprahan Insidental (Mendesak)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Jumlah Distribusi ({selectedLedger?.satuan_kemasan || 'unit'})
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (jumlah > 1) setJumlah(jumlah - 1);
                  }}
                  className="h-10 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-l-xl font-bold border border-r-0 border-slate-200 dark:border-slate-700 select-none active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  title="Kurang 1"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={maxAvailable}
                  required
                  placeholder="0"
                  value={jumlah === 0 ? '' : jumlah}
                  onChange={(e) => {
                    const val = e.target.value;
                    setJumlah(val === '' ? 0 : Math.min(maxAvailable, Math.max(0, parseInt(val, 10) || 0)));
                  }}
                  className="w-full h-10 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 outline-none font-black text-center text-blue-600 dark:text-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-base"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (jumlah < maxAvailable) setJumlah(jumlah + 1);
                  }}
                  className="h-10 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-r-xl font-bold border border-l-0 border-slate-200 dark:border-slate-700 select-none active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  title="Tambah 1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* PERINGATAN BUFFER DARURAT */}
          {isBufferTriggered && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Penyangga Stok Minimum Terpicu!</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Sisa stok dinas setelah penyaluran ini: <strong>{maxAvailable - jumlah} unit</strong> (di bawah batas minimum <strong>{minBuffer} unit</strong>).
              </p>
              <label className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-100 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDarurat}
                  onChange={(e) => setIsDarurat(e.target.checked)}
                  className="rounded text-amber-600"
                />
                Konfirmasi Otorisasi Pengambilan Darurat (Admin Approved)
              </label>
              {isDarurat && (
                <input
                  type="text"
                  placeholder="Alasan darurat (misal: Wabah mendesak di Klirong...)"
                  value={alasanDarurat}
                  onChange={(e) => setAlasanDarurat(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 rounded-lg outline-none text-xs"
                />
              )}
            </div>
          )}

          {/* Penyerah & Penerima */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block font-semibold mb-1">Yang Menyerahkan (Dinas)</label>
              <input
                type="text"
                placeholder="Nama petugas dinas"
                value={yangMenyerahkan}
                onChange={(e) => setYangMenyerahkan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none mb-1.5"
              />
              <input
                type="text"
                placeholder="NIP Penyerah"
                value={nipPenyerah}
                onChange={(e) => setNipPenyerah(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Yang Menerima (Puskeswan)</label>
              <input
                type="text"
                placeholder="Nama dokter / petugas puskeswan"
                value={yangMenerima}
                onChange={(e) => setYangMenerima(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none mb-1.5"
              />
              <input
                type="text"
                placeholder="NIP Penerima"
                value={nipPenerima}
                onChange={(e) => setNipPenerima(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-[11px]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Terbitkan Berita Acara &amp; Distribusi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 4. MODAL CATAT PEMAKAIAN OBAT DI PUSKESWAN (Sistem Apotek) ──
interface ModalPenggunaanProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  stokPuskeswan: StokPuskeswanItem[];
  selectedPuskId: number;
  initialStockItem?: StokPuskeswanItem | null;
}

export function ModalCatatPenggunaan({
  isOpen,
  onClose,
  onSuccess,
  stokPuskeswan,
  selectedPuskId,
  initialStockItem,
}: ModalPenggunaanProps) {
  const availableStock = stokPuskeswan.filter(
    (s) => s.id_puskeswan === selectedPuskId && s.sisa_stok > 0
  );

  const [selectedBatchKey, setSelectedBatchKey] = useState<string>('');
  const [jumlahPenggunaan, setJumlahPenggunaan] = useState<number>(1);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().slice(0, 10));
  const [keterangan, setKeterangan] = useState<string>('');
  const [petugas, setPetugas] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialStockItem) {
      setSelectedBatchKey(`${initialStockItem.id_barang}___${initialStockItem.nomor_batch}`);
    } else if (availableStock.length > 0 && !selectedBatchKey) {
      setSelectedBatchKey(`${availableStock[0].id_barang}___${availableStock[0].nomor_batch}`);
    }
    setErrorMsg('');
  }, [initialStockItem, availableStock, isOpen]);

  if (!isOpen) return null;

  const currentSelectedStock = availableStock.find(
    (s) => `${s.id_barang}___${s.nomor_batch}` === selectedBatchKey
  );
  const sisaStok = currentSelectedStock?.sisa_stok || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedStock) {
      setErrorMsg('Pilih obat yang akan dicatat pemakaiannya.');
      return;
    }

    if (jumlahPenggunaan <= 0 || jumlahPenggunaan > sisaStok) {
      setErrorMsg(`Jumlah pemakaian harus antara 1 sampai ${sisaStok} unit.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/stok-gudang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CATAT_PENGGUNAAN',
          tanggal,
          id_puskeswan: selectedPuskId,
          nama_puskeswan: currentSelectedStock.nama_puskeswan,
          id_barang: currentSelectedStock.id_barang,
          nomor_batch: currentSelectedStock.nomor_batch,
          jumlah_penggunaan: jumlahPenggunaan,
          keterangan,
          petugas,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(resJson.error || 'Gagal mencatat pemakaian.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-base">Catat Pemakaian Obat (Apotek)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {availableStock.length === 0 ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-center">
              Tidak ada stok obat yang tersedia di puskeswan ini. Hubungi dinas untuk permohonan droping / amprahan.
            </div>
          ) : (
            <>
              <div>
                <label className="block font-semibold mb-1">Pilih Obat dari Stok Puskeswan</label>
                <select
                  value={selectedBatchKey}
                  onChange={(e) => setSelectedBatchKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
                >
                  {availableStock.map((s) => (
                    <option key={`${s.id_barang}___${s.nomor_batch}`} value={`${s.id_barang}___${s.nomor_batch}`}>
                      {s.nama_barang} (Sisa: {s.sisa_stok} {s.satuan_kemasan} | Batch: {s.nomor_batch})
                    </option>
                  ))}
                </select>
              </div>

              {currentSelectedStock && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Sumber Anggaran:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {currentSelectedStock.sumber_anggaran} (T.A {currentSelectedStock.tahun_anggaran})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tgl Kadaluarsa:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {currentSelectedStock.tanggal_kadaluarsa ? String(currentSelectedStock.tanggal_kadaluarsa).slice(0, 10) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sisa Stok Tersedia:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {sisaStok} {currentSelectedStock.satuan_kemasan}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tanggal Pemakaian</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    Jumlah ({currentSelectedStock?.satuan_kemasan || 'unit'})
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (jumlahPenggunaan > 1) setJumlahPenggunaan(jumlahPenggunaan - 1);
                      }}
                      className="h-10 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-l-xl font-bold border border-r-0 border-slate-200 dark:border-slate-700 select-none active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                      title="Kurang 1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max={sisaStok}
                      required
                      placeholder="0"
                      value={jumlahPenggunaan === 0 ? '' : jumlahPenggunaan}
                      onChange={(e) => {
                        const val = e.target.value;
                        setJumlahPenggunaan(val === '' ? 0 : Math.min(sisaStok, Math.max(0, parseInt(val, 10) || 0)));
                      }}
                      className="w-full h-10 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 outline-none font-black text-center text-rose-600 dark:text-rose-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-base"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (jumlahPenggunaan < sisaStok) setJumlahPenggunaan(jumlahPenggunaan + 1);
                      }}
                      className="h-10 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-r-xl font-bold border border-l-0 border-slate-200 dark:border-slate-700 select-none active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                      title="Tambah 1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Keterangan / Kasus Penanganan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengobatan BEF pada sapi warga Desa Bocor..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Petugas Lapangan</label>
                <input
                  type="text"
                  placeholder="Nama petugas medis / pemeriksa"
                  value={petugas}
                  onChange={(e) => setPetugas(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl">
                  {errorMsg}
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableStock.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan &amp; Kurangi Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
