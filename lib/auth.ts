'use client';

import { UserPermissions, DEFAULT_FULL_PERMISSIONS } from '@/lib/permissions';

export interface AuthSessionUser {
  id: number;
  nama: string;
  nip_username: string;
  role: string;
  status: 'Aktif' | 'Nonaktif';
  permissions: UserPermissions;
}

const AUTH_STORAGE_KEY = 'simantap_auth_session';
const ACTIVITY_STORAGE_KEY = 'simantap_last_activity';

// Catat waktu aktivitas user terakhir (untuk deteksi idle)
export function recordUserActivity() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, Date.now().toString());
  }
}

// Ambil waktu aktivitas terakhir
export function getLastUserActivity(): number {
  if (typeof window === 'undefined') return Date.now();
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    return raw ? parseInt(raw, 10) : Date.now();
  } catch {
    return Date.now();
  }
}

// Simpan sesi user ke localStorage
export function saveAuthSession(user: AuthSessionUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    recordUserActivity();
  }
}

// Ambil sesi user saat ini
export function getAuthSession(): AuthSessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

// Hapus sesi login
export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    // Hapus cookie sesi dari browser
    document.cookie = 'simantap_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    try {
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
  }
}

// Cek apakah user memiliki akses ke Modul tertentu (bitpro, keswan, kesmavet, aset)
export function checkModuleAccess(moduleKey: 'bitpro' | 'keswan' | 'kesmavet' | 'aset'): boolean {
  const user = getAuthSession();
  if (!user) return true; // Default fallback if no session
  if (user.role === 'Administrator') return true;

  const perms = user.permissions;
  if (!perms || !perms[moduleKey]) return true;

  return perms[moduleKey].enabled === true;
}

// Cek apakah user memiliki akses ke Submenu tertentu
export function checkSubmenuAccess(
  moduleKey: 'bitpro' | 'keswan' | 'kesmavet' | 'aset',
  submenuKey: string
): boolean {
  const user = getAuthSession();
  if (!user) return true;
  if (user.role === 'Administrator') return true;

  const perms = user.permissions;
  if (!perms || !perms[moduleKey]) return true;
  if (!perms[moduleKey].enabled) return false;

  const sub = perms[moduleKey].submenus?.[submenuKey];
  if (!sub) return true;

  return sub.enabled === true;
}

// Cek apakah user memiliki izin Edit ('edit') atau Hanya Lihat ('view') pada Submenu tertentu
export function getSubmenuPermissionMode(
  moduleKey: 'bitpro' | 'keswan' | 'kesmavet' | 'aset',
  submenuKey: string
): 'edit' | 'view' {
  const user = getAuthSession();
  if (!user) return 'edit';
  if (user.role === 'Administrator') return 'edit';

  const perms = user.permissions;
  if (!perms || !perms[moduleKey]) return 'edit';

  const sub = perms[moduleKey].submenus?.[submenuKey];
  if (!sub) return perms[moduleKey].mode || 'edit';

  return sub.mode || 'edit';
}
