'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { clearAuthSession, getLastUserActivity, recordUserActivity } from '@/lib/auth';
import { Clock, LogOut, CheckCircle2 } from 'lucide-react';

interface IdleTimeoutModalProps {
  onLogout: () => Promise<void> | void;
  timeoutMinutes?: number;       // Default 20 menit
  warningMinutes?: number;       // Default 18 menit (muncul 2 menit sebelum logout)
}

export default function IdleTimeoutModal({
  onLogout,
  timeoutMinutes = 20,
  warningMinutes = 18,
}: IdleTimeoutModalProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const isLoggingOutRef = useRef(false);

  const TIMEOUT_MS = timeoutMinutes * 60 * 1000;
  const WARNING_MS = warningMinutes * 60 * 1000;

  // Handler auto-logout saat idle habis
  const triggerAutoLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setShowWarning(false);

    try {
      clearAuthSession();
    } catch {}

    // Arahkan ke halaman login dengan alasan idle
    window.location.href = '/login?reason=idle';
  }, []);

  // Reset timer aktivitas
  const handleKeepAlive = useCallback(() => {
    recordUserActivity();
    setShowWarning(false);
  }, []);

  useEffect(() => {
    // Catat aktivitas saat awal komponen dimuat
    recordUserActivity();

    // Throttled activity recorder (maksimal 1x per 3 detik agar hemat CPU)
    let lastRecorded = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastRecorded > 3000) {
        lastRecorded = now;
        recordUserActivity();
        if (showWarning) {
          setShowWarning(false);
        }
      }
    };

    // Dengarkan aktivitas di window utama
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    // Dengarkan postMessage dari iframe anak jika ada
    const handlePostMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SIMANTAP_USER_ACTIVITY') {
        handleActivity();
      }
    };
    window.addEventListener('message', handlePostMessage);

    // Dengarkan perubahan storage jika user aktif di tab browser lain
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'simantap_last_activity') {
        lastRecorded = Date.now();
        setShowWarning(false);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Interval pemeriksaan setiap 1 detik
    const timerInterval = setInterval(() => {
      const last = getLastUserActivity();
      const elapsed = Date.now() - last;

      if (elapsed >= TIMEOUT_MS) {
        // Waktu habis (20 menit) -> Eksekusi logout otomatis
        clearInterval(timerInterval);
        triggerAutoLogout();
      } else if (elapsed >= WARNING_MS) {
        // Masuk zona peringatan (antara menit 18 dan 20)
        const remaining = Math.max(0, Math.ceil((TIMEOUT_MS - elapsed) / 1000));
        setSecondsLeft(remaining);
        setShowWarning(true);
      } else {
        // Masih aktif -> Sembunyikan modal peringatan
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      events.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
      window.removeEventListener('message', handlePostMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [TIMEOUT_MS, WARNING_MS, showWarning, triggerAutoLogout]);

  if (!showWarning) return null;

  // Format detik menjadi mm:ss
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400/60 dark:border-amber-500/50 shadow-2xl overflow-hidden p-6 sm:p-7 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-labelledby="idle-title"
        aria-describedby="idle-desc"
      >
        {/* Ikon Peringatan Pulsa */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border-2 border-amber-300 dark:border-amber-700/80 shadow-md">
            <Clock size={32} className="animate-pulse" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-900">
            !
          </div>
        </div>

        {/* Judul & Penjelasan */}
        <div className="space-y-1.5">
          <h3 id="idle-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Sesi Akan Berakhir
          </h3>
          <p id="idle-desc" className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
            Tidak ada aktivitas terdeteksi selama <span className="text-amber-600 dark:text-amber-400 font-bold">{warningMinutes} menit</span>. Demi keamanan data dinas, Anda akan otomatis keluar dalam:
          </p>
        </div>

        {/* Badge Timer Hitung Mundur */}
        <div className="py-2.5 px-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 flex items-center gap-2.5 font-mono text-2xl font-black tracking-widest shadow-xs">
          <Clock size={20} className="text-amber-600 dark:text-amber-400" />
          <span>{timeFormatted}</span>
        </div>

        {/* Tombol Aksi */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {/* Tombol Tetap Masuk */}
          <button
            type="button"
            onClick={handleKeepAlive}
            className="w-full min-h-touch py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <CheckCircle2 size={16} />
            <span>Lanjutkan Sesi</span>
          </button>

          {/* Tombol Keluar Sekarang */}
          <button
            type="button"
            onClick={() => onLogout()}
            className="w-full min-h-touch py-2.5 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:border-red-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>Keluar Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
