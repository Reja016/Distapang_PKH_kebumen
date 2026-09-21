'use client';

import React from 'react';
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  Truck,
  ChevronRight,
} from 'lucide-react';
import { ModuleNavGroup, SubmenuItem, MODULE_NAV_DATA } from './types';
import { checkModuleAccess, checkSubmenuAccess } from '@/lib/auth';

interface DashboardOverviewProps {
  isDark: boolean;
  userDisplay: string;
  userRole: string;
  isAdmin: boolean;
  onSelectSubmenu: (moduleGroup: ModuleNavGroup, sub: SubmenuItem) => void;
}

export default function DashboardOverview({
  isDark,
  userDisplay,
  userRole,
  isAdmin,
  onSelectSubmenu,
}: DashboardOverviewProps) {
  const allowedModules = MODULE_NAV_DATA
    .filter((module) => checkModuleAccess(module.id))
    .map((module) => ({
      ...module,
      submenus: module.submenus.filter((sub) => checkSubmenuAccess(module.id, sub.id)),
    }))
    .filter((module) => module.submenus.length > 0);

  const totalAllowedSubmenus = allowedModules.reduce(
    (acc, m) => acc + m.submenus.length,
    0
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Welcome Banner Bersih & Elegan */}
      <div
        className={`rounded-2xl border p-5 sm:p-7 transition-all ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-slate-800'
            : 'bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-white border-emerald-200/70 shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Selamat Datang, {userDisplay.split(' ')[0] || 'Petugas'}!
            </h2>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Silakan pilih menu di sidebar sebelah kiri atau gunakan kartu pintasan
              di bawah ini. Semua data dan form terbuka{' '}
              <span className="font-semibold text-emerald-600">
                langsung di halaman ini.
              </span>{' '}
            </p>
          </div>

          <div
            className={`rounded-xl border p-3.5 flex flex-col gap-2 shrink-0 md:w-56 ${
              isDark
                ? 'bg-slate-950/60 border-slate-800'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Peran Akun:</span>
              <span className="font-bold text-emerald-600">
                {isAdmin ? 'Administrator' : userRole}
              </span>
            </div>
            <div
              className={`flex items-center justify-between text-xs border-t pt-2 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              <span className="text-slate-500">Total Modul:</span>
              <span className="font-bold">{allowedModules.length} Bidang</span>
            </div>
            <div
              className={`flex items-center justify-between text-xs border-t pt-2 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              <span className="text-slate-500">Total Submenu:</span>
              <span className="font-bold text-emerald-600">{totalAllowedSubmenus} Layanan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Modul: Akses 1-Klik Langsung */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-bold tracking-tight">
            Pusat Kendali & Pintasan Cepat
          </h3>
          <p className="text-xs text-slate-500">
            Klik menu di bawah untuk langsung membuka sistem di halaman ini
          </p>
        </div>

        {allowedModules.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-sm">
            Tidak ada modul yang dapat diakses saat ini. Silakan hubungi Administrator.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {allowedModules.map((module) => {
              return (
                <div
                  key={module.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col transition-all ${
                    isDark
                      ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      : 'border-slate-200 bg-white hover:border-emerald-200 shadow-xs'
                  }`}
                >
                  {/* Header Modul */}
                  <div
                    className={`p-4 sm:p-5 border-b flex items-center justify-between ${
                      isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center p-1.5 border shrink-0 ${
                          isDark
                            ? 'bg-slate-800/90 border-slate-700'
                            : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/icons/modules/${module.id}.png`}
                          alt={`Logo ${module.name}`}
                          className="w-full h-full object-contain scale-110"
                        />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold">
                          {module.name}
                        </h4>
                        <p className="text-xs text-slate-500">{module.shortDesc}</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                        isDark
                          ? module.color.darkBadge
                          : module.color.lightBadge
                      }`}
                    >
                      {module.badge}
                    </span>
                  </div>

                  {/* Submenu Pills 1-Klik Langsung */}
                  <div className="p-4 sm:p-5 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {module.submenus.map((sub) => {
                        const Icon = sub.icon;

                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => onSelectSubmenu(module, sub)}
                            className={`group p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs cursor-pointer ${
                              isDark
                                ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-800 hover:border-slate-700'
                                : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                size={16}
                                className={`shrink-0 text-slate-400 ${module.color.iconHover} transition-colors`}
                              />
                              <span className="font-semibold text-xs truncate">
                                {sub.name}
                              </span>
                            </div>
                            <ChevronRight
                              size={13}
                              className="text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className={`mt-auto py-5 border-t text-center text-xs ${
          isDark
            ? 'border-slate-800/80 text-slate-500'
            : 'border-slate-200 text-slate-500'
        }`}
      >
        © {new Date().getFullYear()} Dinas Pertanian dan Pangan Kabupaten Kebumen.
        Sistem Informasi Manajemen Peternakan Terpadu.
      </footer>
    </div>
  );
}
