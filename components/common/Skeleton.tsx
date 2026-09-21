'use client';

import React from 'react';

/**
 * Komponen dasar Skeleton dengan efek shimmer gelombang kilau cahaya.
 */
export function Skeleton({
  className = '',
  shimmer = true,
  as: Component = 'div',
}: {
  className?: string;
  shimmer?: boolean;
  as?: 'div' | 'span';
}) {
  return (
    <Component
      className={`rounded-md bg-slate-200/90 dark:bg-slate-800/90 ${
        shimmer ? 'skeleton-shimmer' : 'animate-pulse'
      } ${className}`}
    />
  );
}

/**
 * Skeleton khusus Kartu Metrik / Statistik (Persis seperti tampilan Key Metrics)
 */
export function MetricCardSkeleton() {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-2">
        {/* Label judul */}
        <Skeleton className="h-3.5 w-28 sm:w-32 rounded-sm" />
        {/* Nilai angka besar */}
        <Skeleton className="h-8 sm:h-9 w-32 sm:w-44 rounded-lg" />
        {/* Keterangan satuan */}
        <Skeleton className="h-3 w-20 sm:w-24 rounded-sm" />
      </div>
      {/* Lingkaran Ikon */}
      <Skeleton className="w-11 h-11 sm:w-14 sm:h-14 rounded-full shrink-0" />
    </div>
  );
}

/**
 * Skeleton untuk Tabel Data (digunakan saat tabel memuat data dari database)
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
      {/* Header Bar */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      {/* Table Header Row */}
      <div className="grid grid-cols-12 gap-3 p-3 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <div className="col-span-1">
          <Skeleton className="h-4 w-6 rounded-sm" />
        </div>
        <div className="col-span-4">
          <Skeleton className="h-4 w-28 rounded-sm" />
        </div>
        <div className="col-span-4">
          <Skeleton className="h-4 w-24 rounded-sm" />
        </div>
        <div className="col-span-3">
          <Skeleton className="h-4 w-16 rounded-sm" />
        </div>
      </div>

      {/* Table Body Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-3 p-3.5 items-center">
            <div className="col-span-1">
              <Skeleton className="h-4 w-5 rounded-sm" />
            </div>
            <div className="col-span-4 space-y-1.5">
              <Skeleton className="h-4 w-3/4 rounded-sm" />
              <Skeleton className="h-3 w-1/2 rounded-sm opacity-70" />
            </div>
            <div className="col-span-4">
              <Skeleton className="h-4 w-2/3 rounded-sm" />
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <Skeleton className="h-7 w-14 rounded-md" />
              <Skeleton className="h-7 w-14 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Halaman Penuh Dashboard Beranda SiMantap PKH.
 * Menampilkan struktur lengkap Sidebar + Header + Banner + 4 Kartu Modul.
 */
export function DashboardSkeleton({ isDark = false }: { isDark?: boolean }) {
  return (
    <div
      className={`min-h-screen flex font-sans ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* ── SKELETON SIDEBAR (Desktop) ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-6 shrink-0">
        {/* Logo & Judul Instansi */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-24 rounded-sm" />
            <Skeleton className="h-3 w-32 rounded-sm opacity-70" />
          </div>
        </div>

        {/* Menu Navigasi Modul */}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-20 rounded-sm mb-3 opacity-60" />
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl">
              <Skeleton className="w-6 h-6 rounded-lg shrink-0" />
              <Skeleton className="h-4 w-28 rounded-sm flex-1" />
            </div>
          ))}
        </div>

        {/* Profil Akun Bawah */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-20 rounded-sm" />
            <Skeleton className="h-2.5 w-16 rounded-sm opacity-60" />
          </div>
        </div>
      </aside>

      {/* ── SKELETON KONTEN UTAMA ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-32 sm:w-48 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 sm:w-36 rounded-lg hidden sm:block" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </header>

        {/* Body Content Skeleton */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Welcome Banner Skeleton */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2.5 max-w-2xl flex-1">
                <Skeleton className="h-7 w-64 sm:w-80 rounded-lg" />
                <Skeleton className="h-4 w-full sm:w-3/4 rounded-md opacity-80" />
                <Skeleton className="h-4 w-2/3 rounded-md opacity-70" />
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col gap-2 shrink-0 md:w-56 bg-slate-50 dark:bg-slate-950/60">
                <Skeleton className="h-4 w-full rounded-sm" />
                <Skeleton className="h-4 w-full rounded-sm" />
                <Skeleton className="h-4 w-full rounded-sm" />
              </div>
            </div>
          </div>

          {/* Heading Modul */}
          <div className="space-y-1">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3 w-64 rounded-sm opacity-70" />
          </div>

          {/* Grid 4 Kartu Modul Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4"
              >
                {/* Modul Header */}
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-5 w-36 rounded-md" />
                    <Skeleton className="h-3 w-48 rounded-sm opacity-70" />
                  </div>
                </div>

                {/* Submenu Buttons Grid (2 kolom x 2/3 baris) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={j}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50 flex items-center gap-2.5"
                    >
                      <Skeleton className="w-6 h-6 rounded-lg shrink-0" />
                      <Skeleton className="h-3.5 flex-1 rounded-sm" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Skeleton Halaman Submenu (saat berpindah menu di IframeViewer).
 * Menampilkan struktur header halaman, kartu metrik, dan tabel shimmer yang elegan.
 */
export function SubmenuPageSkeleton({
  title = 'Memuat Menu...',
  isDark = false,
}: {
  title?: string;
  isDark?: boolean;
}) {
  return (
    <div
      className={`w-full h-full p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Header Halaman Submenu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
            <Skeleton className="h-6 w-48 sm:w-64 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-full hidden sm:block" />
          </div>
          <Skeleton className="h-3.5 w-60 sm:w-96 rounded-sm opacity-70" />
        </div>

        {/* Action buttons (Tambah, Export, Filter) */}
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-sm" />
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            </div>
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-sm opacity-60" />
          </div>
        ))}
      </div>

      {/* Main Table Card Skeleton */}
      <TableSkeleton rows={6} cols={5} />

      {/* Floating Status Pill */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/95 dark:bg-slate-800/95 border border-slate-700/80 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{title}</span>
        </div>
      </div>
    </div>
  );
}

