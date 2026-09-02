export interface JadwalHari {
  hari: string;
  jam: string;
  isTutup?: boolean;
}

export interface PuskeswanProfil {
  id: string | number;
  nama: string;
  kode: string;
  wilayah_binaan: string;
  alamat: string;
  maps_url?: string;
  dokter_hewan: string;
  kontak: string;
  jam_operasional: string;
  jadwal_harian: JadwalHari[];
  layanan: string[];
  fasilitas: string[];
  foto?: string;
  galeri_foto: string[];
  keterangan?: string;
}

export const DEFAULT_JADWAL_HARIAN: JadwalHari[] = [
  { hari: 'Senin', jam: '07.30 - 15.30 WIB' },
  { hari: 'Selasa', jam: '07.30 - 15.30 WIB' },
  { hari: 'Rabu', jam: '07.30 - 15.30 WIB' },
  { hari: 'Kamis', jam: '07.30 - 15.30 WIB' },
  { hari: 'Jumat', jam: '07.30 - 14.30 WIB' },
  { hari: 'Sabtu', jam: 'Layanan Panggilan Darurat (On-Call)', isTutup: true },
  { hari: 'Minggu', jam: 'Layanan Panggilan Darurat (On-Call)', isTutup: true },
];

export const initialPuskeswanProfiles: PuskeswanProfil[] = [
  {
    id: '1',
    nama: 'Puskeswan Mirit',
    kode: 'MIRIT',
    wilayah_binaan: 'Kecamatan Mirit, Kecamatan Bonorowo',
    alamat: 'Jl. Daendels, Desa Mirit, Kec. Mirit, Kabupaten Kebumen, Jawa Tengah 54395',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Puskeswan+Mirit+Kebumen',
    dokter_hewan: 'drh. H. Bambang Suhartono',
    kontak: '0812-3456-7890',
    jam_operasional: 'Senin - Jumat: 07.30 - 15.30 WIB (Panggilan Darurat 24 Jam)',
    jadwal_harian: [
      { hari: 'Senin', jam: '07.30 - 15.30 WIB' },
      { hari: 'Selasa', jam: '07.30 - 15.30 WIB' },
      { hari: 'Rabu', jam: '07.30 - 15.30 WIB' },
      { hari: 'Kamis', jam: '07.30 - 15.30 WIB' },
      { hari: 'Jumat', jam: '07.30 - 14.30 WIB' },
      { hari: 'Sabtu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
      { hari: 'Minggu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
    ],
    layanan: ['Pemeriksaan & Pengobatan Hewan', 'Inseminasi Buatan (IB)', 'Pemeriksaan Kebuntingan (PKB)', 'Vaksinasi PMK & LSD', 'Pelayanan Keliling (Pusling)'],
    fasilitas: ['Ruang Tindakan Medis', 'Cold Storage Vaksin', 'Kendaraan Pusling Roda 4', 'Peralatan Bedah Minor'],
    foto: '/images/modules/keswan.jpg',
    galeri_foto: [
      '/images/modules/keswan.jpg',
      '/images/beranda-hero-bg.jpg',
    ],
    keterangan: 'Pusat pelayanan kesehatan hewan pesisir timur Kabupaten Kebumen.',
  },
  {
    id: '2',
    nama: 'Puskeswan Klirong',
    kode: 'KLIRONG',
    wilayah_binaan: 'Kecamatan Klirong, Kecamatan Buluspesantren, Kecamatan Petanahan',
    alamat: 'Jl. Raya Klirong No. 12, Desa Kradenan, Kec. Klirong, Kabupaten Kebumen, Jawa Tengah 54381',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Puskeswan+Klirong+Kebumen',
    dokter_hewan: 'drh. Tri Wahyuni',
    kontak: '0813-9876-5432',
    jam_operasional: 'Senin - Jumat: 07.30 - 15.30 WIB (Panggilan Darurat 24 Jam)',
    jadwal_harian: [
      { hari: 'Senin', jam: '07.30 - 15.30 WIB' },
      { hari: 'Selasa', jam: '07.30 - 15.30 WIB' },
      { hari: 'Rabu', jam: '07.30 - 15.30 WIB' },
      { hari: 'Kamis', jam: '07.30 - 15.30 WIB' },
      { hari: 'Jumat', jam: '07.30 - 14.30 WIB' },
      { hari: 'Sabtu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
      { hari: 'Minggu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
    ],
    layanan: ['Pemeriksaan & Pengobatan Hewan', 'Inseminasi Buatan (IB)', 'Pemeriksaan Kebuntingan (PKB)', 'Vaksinasi PMK & LSD', 'Konsultasi Manajemen Ternak'],
    fasilitas: ['Ruang Periksa & Konsultasi', 'Termos Nitrogen Cair & Straw IB', 'Sepeda Motor Operasional Petugas', 'Alat USG Portable'],
    foto: '/images/modules/keswan.jpg',
    galeri_foto: [
      '/images/modules/keswan.jpg',
    ],
    keterangan: 'Melayani sentra peternakan sapi potong pesisir selatan.',
  },
  {
    id: '3',
    nama: 'Puskeswan Gombong',
    kode: 'GOMBONG',
    wilayah_binaan: 'Kecamatan Gombong, Kecamatan Kuwarasan, Kecamatan Puring',
    alamat: 'Jl. Kartini No. 45, Wonokriyo, Kec. Gombong, Kabupaten Kebumen, Jawa Tengah 54412',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Puskeswan+Gombong+Kebumen',
    dokter_hewan: 'drh. Arif Rahman Hakim',
    kontak: '0811-2233-4455',
    jam_operasional: 'Senin - Jumat: 07.30 - 15.30 WIB (Panggilan Darurat 24 Jam)',
    jadwal_harian: [
      { hari: 'Senin', jam: '07.30 - 15.30 WIB' },
      { hari: 'Selasa', jam: '07.30 - 15.30 WIB' },
      { hari: 'Rabu', jam: '07.30 - 15.30 WIB' },
      { hari: 'Kamis', jam: '07.30 - 15.30 WIB' },
      { hari: 'Jumat', jam: '07.30 - 14.30 WIB' },
      { hari: 'Sabtu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
      { hari: 'Minggu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
    ],
    layanan: ['Pemeriksaan Klinik & Bedah Minor', 'Inseminasi Buatan (IB)', 'Pemeriksaan Kebuntingan (PKB)', 'Surat Keterangan Kesehatan Hewan (SKKH)', 'Vaksinasi Rabies & PMK'],
    fasilitas: ['Klinik Hewan Rujukan Barat', 'Laboratorium Sederhana', 'Ruang Rawat Inap Sementara', 'Kulkas Khusus Vaksin'],
    foto: '/images/modules/keswan.jpg',
    galeri_foto: [
      '/images/modules/keswan.jpg',
    ],
    keterangan: 'Pusat rujukan penanganan kasus medis veteriner Kebumen bagian barat.',
  },
  {
    id: '4',
    nama: 'Puskeswan Buayan',
    kode: 'BUAYAN',
    wilayah_binaan: 'Kecamatan Buayan, Kecamatan Ayah, Kecamatan Rowokele',
    alamat: 'Jl. Karangbolong KM 2, Desa Buayan, Kec. Buayan, Kabupaten Kebumen, Jawa Tengah 54474',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Puskeswan+Buayan+Kebumen',
    dokter_hewan: 'drh. Siti Aminah',
    kontak: '0852-1122-3344',
    jam_operasional: 'Senin - Jumat: 07.30 - 15.30 WIB (Panggilan Darurat 24 Jam)',
    jadwal_harian: [
      { hari: 'Senin', jam: '07.30 - 15.30 WIB' },
      { hari: 'Selasa', jam: '07.30 - 15.30 WIB' },
      { hari: 'Rabu', jam: '07.30 - 15.30 WIB' },
      { hari: 'Kamis', jam: '07.30 - 15.30 WIB' },
      { hari: 'Jumat', jam: '07.30 - 14.30 WIB' },
      { hari: 'Sabtu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
      { hari: 'Minggu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
    ],
    layanan: ['Pemeriksaan & Pengobatan Hewan', 'Inseminasi Buatan (IB)', 'Pemberantasan Parasit & Cacingan', 'Vaksinasi PMK & LSD', 'Pelayanan Pos Keswan Desa'],
    fasilitas: ['Ruang Tindakan', 'Kotak Vaksin Lapangan (Coolbox)', 'Motor Operasional Lapangan', 'Peralatan Restrain Hewan'],
    foto: '/images/modules/keswan.jpg',
    galeri_foto: [
      '/images/modules/keswan.jpg',
    ],
    keterangan: 'Melayani peternak di wilayah karst dan pegunungan selatan.',
  },
  {
    id: '5',
    nama: 'Puskeswan Alian',
    kode: 'ALIAN',
    wilayah_binaan: 'Kecamatan Alian, Kecamatan Kebumen (Sebagian), Kecamatan Poncowarno, Kecamatan Sadang',
    alamat: 'Jl. Pemandian Barat No. 8, Krakal, Kec. Alian, Kabupaten Kebumen, Jawa Tengah 54352',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Puskeswan+Alian+Kebumen',
    dokter_hewan: 'drh. Hendro Prasetyo',
    kontak: '0877-6655-4433',
    jam_operasional: 'Senin - Jumat: 07.30 - 15.30 WIB (Panggilan Darurat 24 Jam)',
    jadwal_harian: [
      { hari: 'Senin', jam: '07.30 - 15.30 WIB' },
      { hari: 'Selasa', jam: '07.30 - 15.30 WIB' },
      { hari: 'Rabu', jam: '07.30 - 15.30 WIB' },
      { hari: 'Kamis', jam: '07.30 - 15.30 WIB' },
      { hari: 'Jumat', jam: '07.30 - 14.30 WIB' },
      { hari: 'Sabtu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
      { hari: 'Minggu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
    ],
    layanan: ['Pemeriksaan & Pengobatan Hewan', 'Inseminasi Buatan (IB)', 'Pemeriksaan Kebuntingan (PKB)', 'Pengobatan Scabies & BEF', 'Vaksinasi Massal PMK'],
    fasilitas: ['Ruang Farmasi Veteriner', 'Kontainer Nitrogen Cair', 'Perangkat Sanitasi & Desinfeksi', 'Kendaraan Lapangan'],
    foto: '/images/modules/keswan.jpg',
    galeri_foto: [
      '/images/modules/keswan.jpg',
    ],
    keterangan: 'Melayani kawasan sentra peternakan sapi PO dan kambing Jawa Randu.',
  },
  {
    id: '6',
    nama: 'Puskeswan Prembun',
    kode: 'PREMBUN',
    wilayah_binaan: 'Kecamatan Prembun, Kecamatan Padureso, Kecamatan Kutowinangun',
    alamat: 'Jl. Raya Prembun - Kebumen KM 16, Desa Prembun, Kec. Prembun, Kabupaten Kebumen, Jawa Tengah 54394',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Puskeswan+Prembun+Kebumen',
    dokter_hewan: 'drh. Nur Hidayati',
    kontak: '0819-0123-4567',
    jam_operasional: 'Senin - Jumat: 07.30 - 15.30 WIB (Panggilan Darurat 24 Jam)',
    jadwal_harian: [
      { hari: 'Senin', jam: '07.30 - 15.30 WIB' },
      { hari: 'Selasa', jam: '07.30 - 15.30 WIB' },
      { hari: 'Rabu', jam: '07.30 - 15.30 WIB' },
      { hari: 'Kamis', jam: '07.30 - 15.30 WIB' },
      { hari: 'Jumat', jam: '07.30 - 14.30 WIB' },
      { hari: 'Sabtu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
      { hari: 'Minggu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
    ],
    layanan: ['Pemeriksaan & Pengobatan Hewan', 'Inseminasi Buatan (IB)', 'Pemeriksaan Kebuntingan (PKB)', 'Vaksinasi PMK & Penanganan BEF', 'Pusling Terpadu'],
    fasilitas: ['Ruang Konsultasi & Pengobatan', 'Penyimpanan Cold Chain', 'Peralatan Bedah Minor', 'Sepeda Motor Petugas Teknis'],
    foto: '/images/modules/keswan.jpg',
    galeri_foto: [
      '/images/modules/keswan.jpg',
    ],
    keterangan: 'Pintu gerbang pelayanan kesehatan hewan Kebumen bagian timur.',
  },
  {
    id: '7',
    nama: 'Puskeswan Kebumen',
    kode: 'KEBUMEN',
    wilayah_binaan: 'Kecamatan Kebumen Kota, Kecamatan Pejagoan',
    alamat: 'Jl. Arungbinang No. 22, Kebumen, Kec. Kebumen, Kabupaten Kebumen, Jawa Tengah 54311',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Puskeswan+Kebumen+Jl+Arungbinang',
    dokter_hewan: 'drh. Agus Setyawan, M.Si',
    kontak: '0812-9988-7766',
    jam_operasional: 'Senin - Jumat: 07.30 - 15.30 WIB (Panggilan Darurat 24 Jam)',
    jadwal_harian: [
      { hari: 'Senin', jam: '07.30 - 15.30 WIB' },
      { hari: 'Selasa', jam: '07.30 - 15.30 WIB' },
      { hari: 'Rabu', jam: '07.30 - 15.30 WIB' },
      { hari: 'Kamis', jam: '07.30 - 15.30 WIB' },
      { hari: 'Jumat', jam: '07.30 - 14.30 WIB' },
      { hari: 'Sabtu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
      { hari: 'Minggu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
    ],
    layanan: ['Klinik Hewan Kecil & Besar', 'Inseminasi Buatan (IB)', 'Pemeriksaan Kebuntingan (PKB)', 'Pemberian SKKH & Sertifikasi', 'Vaksinasi Rabies & PMK'],
    fasilitas: ['Klinik Hewan Terpadu', 'Alat Operasi Sterilisasi & Bedah', 'Mikroskop & Laboratorium Sederhana', 'Ruang Tunggu Pasien Hewan'],
    foto: '/images/modules/keswan.jpg',
    galeri_foto: [
      '/images/modules/keswan.jpg',
    ],
    keterangan: 'Pusat pelayanan veteriner perkotaan dan rujukan dinas.',
  },
  {
    id: '8',
    nama: 'Puskeswan Karanganyar',
    kode: 'KARANGANYAR',
    wilayah_binaan: 'Kecamatan Karanganyar, Kecamatan Sruweng, Kecamatan Sempor, Kecamatan Karanggayam',
    alamat: 'Jl. Revolusi No. 88, Karanganyar, Kec. Karanganyar, Kabupaten Kebumen, Jawa Tengah 54364',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Puskeswan+Karanganyar+Kebumen',
    dokter_hewan: 'drh. Dwi Kurniawan',
    kontak: '0853-4455-6677',
    jam_operasional: 'Senin - Jumat: 07.30 - 15.30 WIB (Panggilan Darurat 24 Jam)',
    jadwal_harian: [
      { hari: 'Senin', jam: '07.30 - 15.30 WIB' },
      { hari: 'Selasa', jam: '07.30 - 15.30 WIB' },
      { hari: 'Rabu', jam: '07.30 - 15.30 WIB' },
      { hari: 'Kamis', jam: '07.30 - 15.30 WIB' },
      { hari: 'Jumat', jam: '07.30 - 14.30 WIB' },
      { hari: 'Sabtu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
      { hari: 'Minggu', jam: 'Panggilan Darurat (On-Call)', isTutup: true },
    ],
    layanan: ['Pemeriksaan & Pengobatan Hewan', 'Inseminasi Buatan (IB)', 'Pemeriksaan Kebuntingan (PKB)', 'Vaksinasi Massal PMK & LSD', 'Pelayanan Daerah Pegunungan'],
    fasilitas: ['Ruang Tindakan Medis', 'Cold Storage Vaksin', 'Kendaraan Operasional 4WD', 'Alat Penanganan Trauma Hewan'],
    foto: '/images/modules/keswan.jpg',
    galeri_foto: [
      '/images/modules/keswan.jpg',
    ],
    keterangan: 'Melayani peternak di wilayah barat laut dan perbukitan Sempor-Karanggayam.',
  },
];
