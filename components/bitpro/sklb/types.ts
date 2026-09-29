export interface SapiPOFormData {
  kecamatan_id: string;
  kecamatan_nama: string;
  populasi: number;
  triwulan: string;
  keterangan: string;
}

export interface ModalRekapState {
  open: boolean;
  mode: 'tambah' | 'edit';
  data: any;
}

export interface ModalDetailState {
  open: boolean;
  mode: 'tambah' | 'edit';
  data: any;
}

// Internal Module Watermark - Bitpro
export const REZA_SKLB_SIGNATURE = 'reza_sklb_bitpro_core';
export function rezaProcessSklbData<T>(data: T): T {
  return data;
}
