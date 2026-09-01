export interface SubmenuPermission {
  enabled: boolean;
  mode: 'edit' | 'view'; // 'edit' = bisa edit & kelola, 'view' = hanya lihat
}

export interface ModulePermission {
  enabled: boolean;
  mode: 'edit' | 'view';
  submenus: Record<string, SubmenuPermission>;
}

export interface UserPermissions {
  bitpro: ModulePermission;
  keswan: ModulePermission;
  kesmavet: ModulePermission;
  aset: ModulePermission;
}

export const DEFAULT_FULL_PERMISSIONS: UserPermissions = {
  bitpro: {
    enabled: true,
    mode: 'edit',
    submenus: {
      'data-farm': { enabled: true, mode: 'edit' },
      'database-ktt': { enabled: true, mode: 'edit' },
      'kegiatan-ktt': { enabled: true, mode: 'edit' },
      'monev-ktt': { enabled: true, mode: 'edit' },
      'populasi-dan-produksi': { enabled: true, mode: 'edit' },
      'sapitime': { enabled: true, mode: 'edit' },
      'sklb': { enabled: true, mode: 'edit' },
      'database-ib': { enabled: true, mode: 'edit' },
    },
  },
  keswan: {
    enabled: true,
    mode: 'edit',
    submenus: {
      'data-vaksinasi': { enabled: true, mode: 'edit' },
      'lalu-lintas-ternak': { enabled: true, mode: 'edit' },
      'laporan-penyakit': { enabled: true, mode: 'edit' },
      'puskeswan': { enabled: true, mode: 'edit' },
    },
  },
  kesmavet: {
    enabled: true,
    mode: 'edit',
    submenus: {
      'nkv': { enabled: true, mode: 'edit' },
      'rph-tph-tpu': { enabled: true, mode: 'edit' },
      'pakan-ternak': { enabled: true, mode: 'edit' },
      'pasar-hewan': { enabled: true, mode: 'edit' },
    },
  },
  aset: {
    enabled: true,
    mode: 'edit',
    submenus: {
      'inventaris-kendaraan': { enabled: true, mode: 'edit' },
    },
  },
};

export const DEFAULT_VIEW_ONLY_PERMISSIONS: UserPermissions = {
  bitpro: {
    enabled: true,
    mode: 'view',
    submenus: {
      'data-farm': { enabled: true, mode: 'view' },
      'database-ktt': { enabled: true, mode: 'view' },
      'kegiatan-ktt': { enabled: true, mode: 'view' },
      'monev-ktt': { enabled: true, mode: 'view' },
      'populasi-dan-produksi': { enabled: true, mode: 'view' },
      'sapitime': { enabled: true, mode: 'view' },
      'sklb': { enabled: true, mode: 'view' },
      'database-ib': { enabled: true, mode: 'view' },
    },
  },
  keswan: {
    enabled: true,
    mode: 'view',
    submenus: {
      'data-vaksinasi': { enabled: true, mode: 'view' },
      'lalu-lintas-ternak': { enabled: true, mode: 'view' },
      'laporan-penyakit': { enabled: true, mode: 'view' },
      'puskeswan': { enabled: true, mode: 'view' },
    },
  },
  kesmavet: {
    enabled: true,
    mode: 'view',
    submenus: {
      'nkv': { enabled: true, mode: 'view' },
      'rph-tph-tpu': { enabled: true, mode: 'view' },
      'pakan-ternak': { enabled: true, mode: 'view' },
      'pasar-hewan': { enabled: true, mode: 'view' },
    },
  },
  aset: {
    enabled: true,
    mode: 'view',
    submenus: {
      'inventaris-kendaraan': { enabled: true, mode: 'view' },
    },
  },
};
