'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { StatusBA } from './types';

interface BarisTernakProps {
  label: string;
  jantan: number;
  betina: number;
  onJantan: (val: number) => void;
  onBetina: (val: number) => void;
  disabled?: boolean;
  showBA?: boolean;
  ba?: StatusBA;
  onBA?: (val: StatusBA) => void;
  baPdf?: string | null;
  baPdfName?: string | null;
  onUploadBAPdf?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBAPdf?: () => void;
}

export function BarisTernak({
  label,
  jantan,
  betina,
  onJantan,
  onBetina,
  disabled = false,
  showBA = false,
  ba,
  onBA,
  baPdf,
  baPdfName,
  onUploadBAPdf,
  onRemoveBAPdf,
}: BarisTernakProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
            {label} — Jantan
          </label>
          <input
            type="number"
            min={0}
            disabled={disabled}
            value={jantan}
            onChange={(e) => onJantan(Number(e.target.value))}
            className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white font-sans font-bold text-center text-sm focus:border-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
            {label} — Betina
          </label>
          <input
            type="number"
            min={0}
            disabled={disabled}
            value={betina}
            onChange={(e) => onBetina(Number(e.target.value))}
            className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white font-sans font-bold text-center text-sm focus:border-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>
        {showBA && (
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
              Status Berita Acara
            </label>
            <select
              value={ba}
              onChange={(e) => onBA && onBA(e.target.value as StatusBA)}
              className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white font-sans font-bold text-sm focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="Tidak">Tidak Ada BA</option>
              <option value="Ada">Ada BA Resmi</option>
            </select>
          </div>
        )}
      </div>

      {/* Upload Berkas BA Terpisah Menempel di Masing-masing Form */}
      {showBA && ba === 'Ada' && (
        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-2 animate-in fade-in duration-200">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
            <FileText size={14} className="text-red-600 shrink-0" />
            <span>Upload Berkas Berita Acara (PDF) — {label}</span>
          </label>

          {baPdf ? (
            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-300 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="text-red-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800 truncate">{baPdfName || 'Dokumen_BA.pdf'}</span>
              </div>
              <button
                type="button"
                onClick={onRemoveBAPdf}
                className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-0.5 hover:bg-red-50 rounded transition-colors cursor-pointer"
              >
                Hapus / Ganti
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept=".pdf"
              onChange={onUploadBAPdf}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
          )}
        </div>
      )}
    </div>
  );
}

interface KondisiSectionProps {
  nomor: string | number;
  title: string;
  total: number;
  totalLabel: string;
  children: React.ReactNode;
}

export function KondisiSection({ nomor, title, total, totalLabel, children }: KondisiSectionProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h5 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-bold text-xs flex items-center justify-center">
            {nomor}
          </span>
          <span>{title}</span>
        </h5>
        <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
          {totalLabel}: {total} Ekor
        </span>
      </div>
      {children}
    </div>
  );
}
