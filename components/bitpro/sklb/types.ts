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
