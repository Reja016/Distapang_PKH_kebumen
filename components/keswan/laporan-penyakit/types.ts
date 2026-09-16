export interface PenyakitFormValues {
  kecamatan_id: string;
  kecamatan_nama: string;
  puskeswan_id: string;
  diagnosa_nama: string;
  jumlah_kasus: number;
  keterangan: string;
}

export interface CaseItem {
  id: number;
  tahun: number;
  kecamatan_id: string;
  kecamatan_nama: string;
  puskeswan_id: string;
  diagnosa_nama: string;
  jumlah_kasus: number;
  keterangan: string | null;
}
