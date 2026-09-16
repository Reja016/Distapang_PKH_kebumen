export interface KelompokTani {
  id: number;
  kecamatan: string;
  desa: string;
  namaKelompok: string;
  nomorRegister: string;
  jenisKelompok: string;
  kelasKelompok: string;
  luasLahanHa: number;
  anggotaLaki: number;
  anggotaPerempuan: number;
  namaKetuaKelompok: string;
}

export type KelompokTaniFormValues = Omit<KelompokTani, 'id'>;

export const emptyFormValues: KelompokTaniFormValues = {
  kecamatan: "",
  desa: "",
  namaKelompok: "",
  nomorRegister: "",
  jenisKelompok: "Kelompok Tani Ternak (KTT)",
  kelasKelompok: "Pemula",
  luasLahanHa: 0,
  anggotaLaki: 0,
  anggotaPerempuan: 0,
  namaKetuaKelompok: "",
};

export const KECAMATAN_OPTIONS = [
  "Ayah", "Buayan", "Puring", "Petanahan", "Klirong", "Buluspesantren", "Ambal",
  "Mirit", "Bonorowo", "Prembun", "Padureso", "Kutowinangun", "Alian",
  "Poncowarno", "Kebumen", "Pejagoan", "Sruweng", "Adimulyo", "Kuwarasan",
  "Rowokele", "Sempor", "Gombong", "Karanganyar", "Karanggayam", "Sadang",
  "Karangsambung"
];

export const JENIS_KELOMPOK_OPTIONS = ["Kelompok Tani Ternak (KTT)", "Poktan/Tanaman Pangan", "Kelompok Lainnya"];
export const KELAS_ORDER = ["Pemula", "Lanjut", "Madya", "Utama"];
export const PAGE_SIZE = 10;
