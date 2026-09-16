export const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const LOKASI_CONFIGS = [
  { key: 'rph_kebumen', label: '1. RPH Kebumen', subtitle: 'Unit Pemotongan Hewan Resmi Kebumen' },
  { key: 'luar_rph_kebumen', label: '2. Luar RPH Kebumen', subtitle: 'Pemotongan Masyarakat / Wilayah Luar RPH Kebumen' },
  { key: 'rph_gombong', label: '3. RPH Gombong', subtitle: 'Unit Pemotongan Hewan Resmi Gombong (Termasuk Babi)' },
  { key: 'luar_rph_gombong', label: '4. Luar RPH Gombong', subtitle: 'Pemotongan Masyarakat / Wilayah Luar RPH Gombong (Termasuk Babi)' },
];

export const KOMODITAS_LIST = ['Sapi Potong', 'Kuda', 'Babi', 'Kambing', 'Domba'];

export interface RphFormData {
  nama_usaha: string;
  jenis: string;
  pemilik: string;
  alamat_pemilik: string;
  kontak: string;
  lokasi: string;
  status_perijinan: string;
  sertifikat_halal: string;
  sertifikat_nkv: string;
}

export const INITIAL_RPH_FORM: RphFormData = {
  nama_usaha: '',
  jenis: 'TPU',
  pemilik: '',
  alamat_pemilik: '',
  kontak: '',
  lokasi: '',
  status_perijinan: '',
  sertifikat_halal: '',
  sertifikat_nkv: 'belum',
};

export const getTableSummary = (rows: any[]) => {
  const summary = {
    po_jantan: 0, po_betina_prod: 0, po_betina_non_prod: 0, po_total: 0,
    so_jantan: 0, so_betina_prod: 0, so_betina_non_prod: 0, so_total: 0,
    simmental_jantan: 0, simmental_betina_prod: 0, simmental_betina_non_prod: 0, simmental_total: 0,
    limousine_jantan: 0, limousine_betina_prod: 0, limousine_betina_non_prod: 0, limousine_total: 0,
    babi_jantan: 0, babi_betina: 0, babi_total: 0,
    total_jantan: 0, total_betina_prod: 0, total_betina_non_prod: 0,
    grand_total: 0,
  };

  (rows || []).forEach((r) => {
    const pj = Number(r.po_jantan) || 0;
    const pbp = Number(r.po_betina_prod) || 0;
    const pbnp = Number(r.po_betina_non_prod) || 0;

    const sj = Number(r.so_jantan) || 0;
    const sbp = Number(r.so_betina_prod) || 0;
    const sbnp = Number(r.so_betina_non_prod) || 0;

    const smj = Number(r.simmental_jantan) || 0;
    const smbp = Number(r.simmental_betina_prod) || 0;
    const smbnp = Number(r.simmental_betina_non_prod) || 0;

    const lj = Number(r.limousine_jantan) || 0;
    const lbp = Number(r.limousine_betina_prod) || 0;
    const lbnp = Number(r.limousine_betina_non_prod) || 0;

    const bj = Number(r.babi_jantan) || 0;
    const bb = Number(r.babi_betina) || Number(r.babi_betina_prod) || 0;

    summary.po_jantan += pj; summary.po_betina_prod += pbp; summary.po_betina_non_prod += pbnp;
    summary.so_jantan += sj; summary.so_betina_prod += sbp; summary.so_betina_non_prod += sbnp;
    summary.simmental_jantan += smj; summary.simmental_betina_prod += smbp; summary.simmental_betina_non_prod += smbnp;
    summary.limousine_jantan += lj; summary.limousine_betina_prod += lbp; summary.limousine_betina_non_prod += lbnp;
    summary.babi_jantan += bj; summary.babi_betina += bb;

    summary.total_jantan += pj + sj + smj + lj + bj;
    summary.total_betina_prod += pbp + sbp + smbp + lbp + bb;
    summary.total_betina_non_prod += pbnp + sbnp + smbnp + lbnp;
  });

  summary.po_total = summary.po_jantan + summary.po_betina_prod + summary.po_betina_non_prod;
  summary.so_total = summary.so_jantan + summary.so_betina_prod + summary.so_betina_non_prod;
  summary.simmental_total = summary.simmental_jantan + summary.simmental_betina_prod + summary.simmental_betina_non_prod;
  summary.limousine_total = summary.limousine_jantan + summary.limousine_betina_prod + summary.limousine_betina_non_prod;
  summary.babi_total = summary.babi_jantan + summary.babi_betina;
  summary.grand_total = summary.total_jantan + summary.total_betina_prod + summary.total_betina_non_prod;

  return summary;
};
