'use client';

import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { DistribusiBaItem } from './types';

interface BeritaAcaraPrintModalProps {
  item: DistribusiBaItem | null;
  onClose: () => void;
}

export default function BeritaAcaraPrintModal({ item, onClose }: BeritaAcaraPrintModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!item) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = (dStr: string) => {
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-black w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Toolbar (Disembunyikan saat dicetak) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-lg">Pratinjau Berita Acara Serah Terima</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Area Surat Berita Acara (Dicetak) */}
        <div ref={printAreaRef} className="p-8 sm:p-12 overflow-y-auto print:p-0 print:m-0">
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-ba, #printable-ba * {
                visibility: visible;
              }
              #printable-ba {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px;
                color: black !important;
                background: white !important;
              }
            }
          `}</style>

          <div id="printable-ba" className="space-y-6 text-slate-900 leading-relaxed font-serif">
            {/* KOP RESMI DINAS */}
            <div className="flex items-center gap-4 pb-4 border-b-4 border-double border-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-simantap.png"
                alt="Logo Dinas"
                className="w-20 h-20 object-contain shrink-0"
              />
              <div className="text-center flex-1">
                <h3 className="text-base font-bold tracking-wider uppercase">Pemerintah Kabupaten Kebumen</h3>
                <h2 className="text-xl sm:text-2xl font-black tracking-wide uppercase">Dinas Pertanian dan Pangan</h2>
                <p className="text-xs sm:text-sm font-sans text-slate-700 mt-1">
                  Jalan Arungbinang No. 2 Kebumen, Jawa Tengah 54311
                </p>
                <p className="text-xs font-sans text-slate-600">
                  Telepon: (0287) 381180 | Pos-el: distapang@kebumenkab.go.id | Laman: distapang.kebumenkab.go.id
                </p>
              </div>
            </div>

            {/* JUDUL BERITA ACARA */}
            <div className="text-center pt-2">
              <h4 className="text-lg font-bold underline uppercase tracking-wider">
                Berita Acara Serah Terima Obat & Alat Kesehatan Hewan
              </h4>
              <p className="text-sm font-sans mt-1">
                Nomor: <span className="font-semibold">{item.nomor_ba}</span>
              </p>
              {item.is_darurat ? (
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-sans font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  DISTRIBUSI AMPRAHAN INSIDENTAL (STATUS DARURAT)
                </span>
              ) : (
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-sans font-medium bg-blue-50 text-blue-900 border border-blue-200">
                  DISTRIBUSI DROPPING TERENCANA
                </span>
              )}
            </div>

            {/* PEMBUKA */}
            <p className="text-sm text-justify indent-8">
              Pada hari ini, <strong>{formattedDate(item.tanggal_ba)}</strong>, telah dilaksanakan serah terima barang farmasi dan perbekalan kesehatan hewan dari Gudang Farmasi Dinas Pertanian dan Pangan Kabupaten Kebumen kepada Puskeswan {item.nama_puskeswan} dengan rincian pihak-pihak sebagai berikut:
            </p>

            {/* PIHAK YANG TERLIBAT */}
            <div className="space-y-3 text-sm pl-4">
              <div>
                <p className="font-bold">I. PIHAK PERTAMA (Yang Menyerahkan):</p>
                <div className="grid grid-cols-[130px_10px_1fr] text-slate-800 pl-4 mt-0.5">
                  <span>Nama</span><span>:</span><span>{item.yang_menyerahkan || 'Petugas Gudang Farmasi'}</span>
                  <span>NIP</span><span>:</span><span>{item.nip_penyerah || '-'}</span>
                  <span>Jabatan</span><span>:</span><span>Pengelola Gudang Obat & Vaksin Dinas Pertanian dan Pangan</span>
                </div>
              </div>

              <div>
                <p className="font-bold">II. PIHAK KEDUA (Yang Menerima):</p>
                <div className="grid grid-cols-[130px_10px_1fr] text-slate-800 pl-4 mt-0.5">
                  <span>Nama</span><span>:</span><span>{item.yang_menerima || 'Petugas Puskeswan'}</span>
                  <span>NIP</span><span>:</span><span>{item.nip_penerima || '-'}</span>
                  <span>Unit Kerja</span><span>:</span><span>Puskeswan {item.nama_puskeswan}</span>
                </div>
              </div>
            </div>

            {/* ISI PERNYATAAN */}
            <p className="text-sm text-justify">
              Pihak Pertama telah menyerahkan kepada Pihak Kedua, dan Pihak Kedua menyatakan telah menerima dalam keadaan baik dan cukup, barang-barang dengan rincian sebagai berikut:
            </p>

            {/* TABEL RINCIAN BARANG */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-collapse border-black">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-black p-2 w-10">No</th>
                    <th className="border border-black p-2">Nama Produk / Obat</th>
                    <th className="border border-black p-2">No. Batch</th>
                    <th className="border border-black p-2">Sumber Anggaran</th>
                    <th className="border border-black p-2 w-14">T.A</th>
                    <th className="border border-black p-2">Tgl Expired</th>
                    <th className="border border-black p-2">Kemasan</th>
                    <th className="border border-black p-2 w-20">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-2 text-center">1</td>
                    <td className="border border-black p-2 font-semibold">{item.nama_barang}</td>
                    <td className="border border-black p-2 font-mono text-center">{item.nomor_batch || '-'}</td>
                    <td className="border border-black p-2">{item.sumber_anggaran || 'APBD Kabupaten'}</td>
                    <td className="border border-black p-2 text-center">{item.tahun_anggaran || '2026'}</td>
                    <td className="border border-black p-2 text-center">{item.tanggal_kadaluarsa || '-'}</td>
                    <td className="border border-black p-2 text-center">{item.satuan_kemasan || 'Botol'}</td>
                    <td className="border border-black p-2 text-center font-bold text-sm">{item.jumlah}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {item.alasan_darurat && (
              <p className="text-xs italic bg-slate-50 p-2 rounded-sm border border-slate-300">
                Catatan Darurat / Keterangan: {item.alasan_darurat}
              </p>
            )}

            {/* PENUTUP */}
            <p className="text-sm text-justify">
              Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya dalam rangkap 2 (dua) untuk dipergunakan sebagaimana mestinya.
            </p>

            {/* TANDA TANGAN */}
            <div className="pt-6 grid grid-cols-2 text-center text-sm font-sans">
              <div>
                <p className="font-medium text-slate-700">Pihak Kedua (Yang Menerima),</p>
                <p className="text-xs text-slate-500">Puskeswan {item.nama_puskeswan}</p>
                <div className="h-24 flex items-end justify-center">
                  <div className="border-b border-black w-48 text-center pb-1 font-bold">
                    {item.yang_menerima || '( ........................................ )'}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1">NIP. {item.nip_penerima || '........................................'}</p>
              </div>

              <div>
                <p className="font-medium text-slate-700">Pihak Pertama (Yang Menyerahkan),</p>
                <p className="text-xs text-slate-500">Dinas Pertanian dan Pangan Kebumen</p>
                <div className="h-24 flex items-end justify-center">
                  <div className="border-b border-black w-48 text-center pb-1 font-bold">
                    {item.yang_menyerahkan || '( ........................................ )'}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1">NIP. {item.nip_penyerah || '........................................'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
