'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePageAuth } from '@/hooks/usePageAuth';
import { ArrowLeft, CheckCircle, XCircle, Clock, Check, X, ShieldAlert } from 'lucide-react';

// Helper to format keys like "nama_kegiatan" to "Nama Kegiatan"
const formatLabel = (key: string) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function PusatKoreksiPage() {
  const { isReady, isAdmin, userRole, handleLogout } = usePageAuth('bitpro', 'pusat-koreksi');
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (isReady && isAdmin) {
      fetchRequests();
    }
  }, [isReady, isAdmin]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/correction-requests?status=PENDING');
      const json = await res.json();
      if (json.success) {
        setRequests(json.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async (id: number, action: 'APPROVE' | 'REJECT') => {
    let rejectReason = '';
    if (action === 'REJECT') {
      const p = prompt('Alasan penolakan:');
      if (p === null) return;
      rejectReason = p;
    } else {
      if (!confirm('Apakah Anda yakin menyetujui perubahan ini? Data akan langsung diperbarui ke database.')) return;
    }

    setProcessingId(id);
    try {
      const res = await fetch('/api/correction-requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: id, action, reject_reason: rejectReason })
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        fetchRequests();
      } else {
        alert('Gagal: ' + json.error);
      }
    } catch (e) {
      alert('Terjadi kesalahan.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isReady) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="p-8 bg-white rounded-3xl shadow-xl text-center max-w-md">
          <ShieldAlert size={64} className="mx-auto text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Akses Ditolak</h2>
          <p className="text-slate-500 mb-6">Halaman ini khusus untuk Administrator.</p>
          <Link href="/beranda" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/beranda" className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Riwayat Pengajuan Data</h1>
            <p className="text-xs text-slate-500">Antrean pengajuan perbaikan dan penghapusan data dari petugas</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Clock className="text-orange-500" />
              Menunggu Persetujuan ({requests.length})
            </h2>
            <button onClick={fetchRequests} className="text-xs text-blue-600 hover:underline">
              Refresh Data
            </button>
          </div>

          <div className="p-0 overflow-x-auto bg-white">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500">Memuat data...</div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4 opacity-50" />
                <p>Tidak ada pengajuan perbaikan yang tertunda.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    <th className="p-4 whitespace-nowrap">Tanggal & Modul</th>
                    <th className="p-4 whitespace-nowrap">Pengaju</th>
                    <th className="p-4 min-w-[200px]">Detail Perubahan (Usulan)</th>
                    <th className="p-4 whitespace-nowrap">Alasan</th>
                    <th className="p-4 whitespace-nowrap text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => {
                    let parsed = {};
                    try {
                      parsed = typeof req.proposed_changes === 'string' ? JSON.parse(req.proposed_changes) : req.proposed_changes;
                    } catch {}

                    return (
                      <tr key={req.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="p-4 align-top">
                          <div className="text-xs font-bold text-slate-800 mb-1">
                            {new Date(req.created_at).toLocaleString('id-ID')}
                          </div>
                          <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider inline-block">
                            {req.module} / {req.submenu}
                          </span>
                        </td>
                        
                        <td className="p-4 align-top">
                          <div className="text-sm font-bold text-blue-700">{req.requested_by}</div>
                        </td>

                        <td className="p-4 align-top">
                          <div className="text-xs text-slate-500 mb-2 font-medium">Data ID: {req.record_id}</div>
                          <div className="space-y-1.5">
                            {Object.entries(parsed).map(([key, val]) => (
                              <div key={key} className="bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
                                <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">{formatLabel(key)}</span>
                                <span className="text-xs text-slate-800 font-medium break-words">{String(val)}</span>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="p-4 align-top">
                          <div className="text-xs text-slate-700 max-w-[200px] leading-relaxed">
                            {req.reason || '-'}
                          </div>
                        </td>

                        <td className="p-4 align-top">
                          <div className="flex flex-col gap-2 w-28 mx-auto">
                            <button
                              disabled={processingId === req.id}
                              onClick={() => handleProcess(req.id, 'APPROVE')}
                              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              <Check size={14} /> ACC
                            </button>
                            <button
                              disabled={processingId === req.id}
                              onClick={() => handleProcess(req.id, 'REJECT')}
                              className="w-full py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              <X size={14} /> Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
