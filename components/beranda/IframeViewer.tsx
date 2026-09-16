'use client';

import React, { forwardRef } from 'react';
import { Activity } from 'lucide-react';
import { SubmenuItem } from './types';

interface IframeViewerProps {
  isDark: boolean;
  activeSubmenu: SubmenuItem;
  isIframeLoading: boolean;
  onIframeLoad: () => void;
}

const IframeViewer = forwardRef<HTMLIFrameElement, IframeViewerProps>(
  ({ isDark, activeSubmenu, isIframeLoading, onIframeLoad }, ref) => {
    return (
      <div className="flex-1 flex flex-col relative w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Loading overlay for iframe */}
        {isIframeLoading && (
          <div
            className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 backdrop-blur-xs ${
              isDark ? 'bg-slate-950/80 text-slate-200' : 'bg-white/80 text-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center animate-spin text-emerald-600">
              <Activity size={20} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider">
              Memuat Menu {activeSubmenu.name}...
            </p>
          </div>
        )}

        {/* Seamless Embedded View */}
        <iframe
          ref={ref}
          src={activeSubmenu.href}
          onLoad={onIframeLoad}
          className={`w-full h-full border-0 flex-1 ${isDark ? 'bg-slate-950' : 'bg-white'}`}
          title={activeSubmenu.name}
        />
      </div>
    );
  }
);

IframeViewer.displayName = 'IframeViewer';

export default IframeViewer;
