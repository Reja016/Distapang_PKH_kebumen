'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  getAuthSession,
  clearAuthSession,
  checkModuleAccess,
  checkSubmenuAccess,
  getSubmenuPermissionMode,
} from '@/lib/auth';

type ModuleKey = 'bitpro' | 'keswan' | 'kesmavet' | 'aset';

interface UsePageAuthResult {
  isReady: boolean;       // Sudah selesai cek auth
  canEdit: boolean;       // true = bisa tambah/edit/hapus, false = hanya lihat
  userName: string;       // Nama user yang login
  userRole: string;       // Role user
  handleLogout: () => Promise<void>;
}

/**
 * Hook terpusat untuk cek autentikasi & hak akses di setiap halaman submenu.
 * - Jika tidak ada sesi → redirect ke /login
 * - Jika modul tidak diizinkan → redirect ke /beranda
 * - Jika submenu tidak diizinkan → redirect ke /[module]
 * - Returns canEdit berdasarkan mode 'edit' atau 'view'
 */
export function usePageAuth(
  moduleKey: ModuleKey,
  submenuKey: string,
  fallbackPath?: string
): UsePageAuthResult {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const check = async () => {
      const localUser = getAuthSession();
      const { data: supaData } = await supabase.auth.getSession();

      // Tidak ada sesi sama sekali → redirect login
      if (!localUser && !supaData.session) {
        router.push('/login');
        return;
      }

      // Cek akses modul
      if (!checkModuleAccess(moduleKey)) {
        alert(`Akses ke modul ini dibatasi oleh Administrator.`);
        router.push('/beranda');
        return;
      }

      // Cek akses submenu
      if (!checkSubmenuAccess(moduleKey, submenuKey)) {
        alert(`Akses ke halaman ini dibatasi oleh Administrator.`);
        router.push(fallbackPath || `/${moduleKey}`);
        return;
      }

      // Set info user
      if (localUser) {
        setUserName(localUser.nama || localUser.nip_username);
        setUserRole(localUser.role || 'Petugas Teknis');
        // Administrator selalu bisa edit
        if (localUser.role === 'Administrator') {
          setCanEdit(true);
        } else {
          const mode = getSubmenuPermissionMode(moduleKey, submenuKey);
          setCanEdit(mode === 'edit');
        }
      } else if (supaData.session) {
        const email = supaData.session.user?.email || '';
        setUserName(email);
        // Jika login via Supabase dan mengandung 'admin' → full edit
        setUserRole(email.toLowerCase().includes('admin') ? 'Administrator' : 'Petugas Teknis');
        setCanEdit(true); // Supabase legacy user = full access
      }

      setIsReady(true);
    };

    check();
  }, [moduleKey, submenuKey, fallbackPath, router]);

  const handleLogout = async () => {
    clearAuthSession();
    try {
      await supabase.auth.signOut();
    } catch {}
    router.push('/login');
  };

  return { isReady, canEdit, userName, userRole, handleLogout };
}
