'use client';

import React from 'react';
import {
  Menu,
  PanelLeftOpen,
  PanelLeftClose,
  RefreshCw,
  Maximize2,
  ArrowLeft,
} from 'lucide-react';
import { SubmenuItem } from './types';

interface DashboardHeaderProps {
  isDark: boolean;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setSidebarOpen: (open: boolean) => void;
  activeSubmenu: SubmenuItem | null;
  onBackToOverview: () => void;
  onRefreshIframe: () => void;
  isIframeLoading: boolean;
  currentDateStr: string;
}

export default function DashboardHeader({
  isDark,
  isCollapsed,
  toggleCollapse,
  setSidebarOpen,
  activeSubmenu,
  onBackToOverview,
  onRefreshIframe,
  isIframeLoading,
  currentDateStr,
}: DashboardHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-30 h-14 border-b px-4 sm:px-6 flex items-center justify-between backdrop-blur-md shrink-0 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white/95 border-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile drawer open button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className={`md:hidden p-1.5 rounded-lg border ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-300'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
          title="Buka Menu"
        >
          <Menu size={18} />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className={`hidden md:flex p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-2xs'
          }`}
          title={isCollapsed ? 'Perbesar Sidebar' : 'Perkecil Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>

        {/* Breadcrumb Info */}
        <div className="flex items-center gap-2">
          {activeSubmenu ? (
            <>
              <button
                onClick={onBackToOverview}
                className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Beranda</span>
              </button>
              <span className="text-slate-400 text-xs">/</span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {activeSubmenu.moduleName}
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">/</span>
              <span className="text-xs font-bold text-emerald-600 truncate">
                {activeSubmenu.name}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                Dashboard Petugas
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {currentDateStr}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {activeSubmenu && (
          <>
            {/* Refresh View Iframe */}
            <button
              onClick={onRefreshIframe}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Segarkan Halaman"
            >
              <RefreshCw size={14} className={isIframeLoading ? 'animate-spin' : ''} />
            </button>

            {/* Buka di Tab Baru */}
            <a
              href={activeSubmenu.href}
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Buka Halaman Ini di Tab Baru"
            >
              <Maximize2 size={14} />
            </a>

            {/* Tombol Kembali ke Overview */}
            <button
              onClick={onBackToOverview}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`} 
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Kembali</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
