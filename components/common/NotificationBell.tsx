'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Activity,
  Info,
  Smartphone,
  SmartphoneNfc,
  Volume2,
  X,
} from 'lucide-react';

interface NotificationItem {
  id: number;
  user_role: string;
  target_user: string | null;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: number;
  created_at: string;
}

interface NotificationBellProps {
  isDark?: boolean;
}

// Suara notifikasi lembut menggunakan Web Audio API (Tanpa file eksternal)
function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Suara ting-ting nada ganda elegan
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignore audio context errors if blocked by browser policy
  }
}

// Konversi VAPID public key dari base64 URL safe ke Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationBell({ isDark = false }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isPushActive, setIsPushActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef<number>(0);

  // Cek kapabilitas Service Worker & Push Notification di browser
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setPushSupported(true);
      setPushPermission(Notification.permission);

      // Cek apakah sudah terdaftar subscription aktif
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          if (sub) setIsPushActive(true);
        })
        .catch(() => {});
    }
  }, []);

  // Fetch daftar notifikasi dari API
  const fetchNotifications = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        const newUnread = data.unreadCount || 0;
        // Jika ada notifikasi baru masuk saat user sedang buka aplikasi, mainkan suara notifikasi
        if (!isInitial && newUnread > prevUnreadRef.current && prevUnreadRef.current >= 0) {
          playNotificationChime();
        }
        prevUnreadRef.current = newUnread;
        setNotifications(data.notifications || []);
        setUnreadCount(newUnread);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    // Polling periodik setiap 35 detik
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 35000);
    return () => clearInterval(interval);
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle subscribe push notification
  const handleTogglePush = async () => {
    if (!pushSupported) {
      alert('Perangkat/browser Anda belum mendukung Web Push Notifications.');
      return;
    }

    try {
      setIsSubscribing(true);

      // 1. Request permission
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm !== 'granted') {
        alert('Izin notifikasi tidak diberikan. Anda tetap dapat melihat notifikasi di aplikasi.');
        setIsSubscribing(false);
        return;
      }

      // 2. Register Service Worker jika belum
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 3. Ambil VAPID Public Key dari server
      const keyRes = await fetch('/api/notifications/subscribe');
      const keyData = await keyRes.json();
      if (!keyData.success || !keyData.publicKey) {
        throw new Error('Gagal mengambil konfigurasi public key push');
      }

      const convertedVapidKey = urlBase64ToUint8Array(keyData.publicKey);

      // 4. Subscribe ke Push Manager
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // 5. Simpan subscription ke backend
      const saveRes = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      const saveData = await saveRes.json();
      if (saveData.success) {
        setIsPushActive(true);
        playNotificationChime();
        alert('🎉 Notifikasi HP & Browser SiMantap PKH Berhasil Diaktifkan!');
      } else {
        throw new Error(saveData.error || 'Gagal menyimpan langganan notifikasi');
      }
    } catch (err: any) {
      console.error('Error enabling push:', err);
      alert('Gagal mengaktifkan notifikasi push: ' + err.message);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Tandai 1 notifikasi sudah dibaca
  const markAsRead = async (id: number) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Tandai semua dibaca
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Format waktu relatif (misal: "Baru saja", "5 mnt lalu", "Kemarin")
  const formatTimeAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

      if (diffSec < 60) return 'Baru saja';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
      if (diffSec < 172800) return 'Kemarin';
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  // Icon & styling berdasarkan tipe notifikasi
  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'koreksi':
        return {
          icon: <ShieldAlert size={14} className="text-amber-500" />,
          label: 'Revisi Data',
          bg: isDark ? 'bg-amber-950/40 text-amber-300 border-amber-800/40' : 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'sapitime_reminder':
        return {
          icon: <Calendar size={14} className="text-blue-500" />,
          label: 'SapiTime Reminder',
          bg: isDark ? 'bg-blue-950/40 text-blue-300 border-blue-800/40' : 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'sapitime_report':
        return {
          icon: <Activity size={14} className="text-emerald-500" />,
          label: 'Laporan Sapi',
          bg: isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      default:
        return {
          icon: <Info size={14} className="text-slate-500" />,
          label: 'Informasi',
          bg: isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Tombol Lonceng di Header */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications(false);
        }}
        className={`relative p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
          isDark
            ? 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-2xs'
        } ${isOpen ? 'ring-2 ring-emerald-500/50' : ''}`}
        title="Pusat Notifikasi"
        aria-label="Notifikasi"
      >
        <Bell size={16} className={unreadCount > 0 ? 'text-amber-500 dark:text-amber-400' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-xs animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel Notifikasi */}
      {isOpen && (
        <div
          className={`absolute right-0 sm:right-auto sm:left-auto md:right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden flex flex-col transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}
          style={{ maxHeight: 'calc(100vh - 80px)' }}
        >
          {/* Header Panel */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/90 border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Bell size={16} />
              </div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight">Pusat Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {unreadCount} baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors"
                  title="Tandai semua sudah dibaca"
                >
                  <CheckCheck size={13} />
                  <span>Baca Semua</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Banner Notifikasi Push HP / Browser */}
          {pushSupported && (
            <div
              className={`px-4 py-2.5 border-b flex items-center justify-between gap-2 text-xs shrink-0 ${
                isPushActive
                  ? isDark
                    ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300'
                    : 'bg-emerald-50/70 border-emerald-100 text-emerald-800'
                  : isDark
                  ? 'bg-slate-800/50 border-slate-800 text-slate-300'
                  : 'bg-amber-50/60 border-amber-100 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone size={15} className={isPushActive ? 'text-emerald-500' : 'text-amber-500'} />
                <span className="font-medium text-[11px]">
                  {isPushActive
                    ? 'Push HP/Browser Aktif'
                    : 'Notifikasi HP Belum Aktif'}
                </span>
              </div>
              {!isPushActive ? (
                <button
                  onClick={handleTogglePush}
                  disabled={isSubscribing}
                  className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubscribing ? 'Mengaktifkan...' : 'Aktifkan'}
                </button>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <Check size={12} /> Terhubung
                </span>
              )}
            </div>
          )}

          {/* List Notifikasi */}
          <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 flex-1 max-h-[360px]">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Memuat notifikasi...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center px-4">
                <Bell size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Belum ada notifikasi baru
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Setiap pengajuan revisi atau laporan kondisi sapi akan muncul di sini secara realtime.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const badge = getNotificationBadge(item.type);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.is_read === 0) markAsRead(item.id);
                    }}
                    className={`p-3.5 transition-colors relative flex gap-3 cursor-pointer ${
                      item.is_read === 0
                        ? isDark
                          ? 'bg-slate-800/40 hover:bg-slate-800/70'
                          : 'bg-emerald-50/30 hover:bg-emerald-50/60'
                        : isDark
                        ? 'hover:bg-slate-800/30'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {item.is_read === 0 && (
                      <span className="absolute top-4 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}

                    {/* Icon Type */}
                    <div className="mt-0.5 shrink-0">
                      <div className="p-1.5 rounded-lg border bg-white dark:bg-slate-800 shadow-2xs">
                        {badge.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatTimeAgo(item.created_at)}
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-bold leading-tight line-clamp-1 ${
                          item.is_read === 0
                            ? isDark
                              ? 'text-white'
                              : 'text-slate-900'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      {/* Tombol Buka Tautan */}
                      {item.link && (
                        <div className="mt-2">
                          <Link
                            href={item.link}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <span>Buka Halaman</span>
                            <ExternalLink size={10} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Panel */}
          <div
            className={`px-4 py-2 border-t text-center text-[10px] text-slate-400 shrink-0 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'
            }`}
          >
            SiMantap PKH • Sistem Notifikasi Terintegrasi
          </div>
        </div>
      )}
    </div>
  );
}
