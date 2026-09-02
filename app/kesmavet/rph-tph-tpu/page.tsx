'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import {
  ArrowLeft,
  Download,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Layers,
  Phone,
  MapPin,
  ShieldCheck,
  Building2,
  Filter,
  FileText,
  UploadCloud,
  Eye,
  Paperclip,
  Image as ImageIcon,
  FileCheck,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';

// Data JSON Pelaku Usaha Pemotongan Hewan (101 Entri Awal)
const initialDataRph = [
  {
    no: 1,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Tratas Rt 03 Rw 01, Desa Sidomukti, Kec. Kuwarasan, Kab. Kebumen',
    nama_tph_r_u: 'RPU Pangestu',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Mahfanda Aldin',
    no_telp: '087735300037',
    status_ijin_usaha: '',
    lokasi_rpu:
      'Tratas Rt 03 Rw 01, Desa Sidomukti, Kec. Kuwarasan, Kab. Kebumen',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: 'Sudah (Disperindag)',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 2,
    lokasi_desa_kecamatan_alamat_pemilik: 'Sidoagung',
    nama_tph_r_u: 'Haryanto',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Haryanto',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: '',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: '',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 3,
    lokasi_desa_kecamatan_alamat_pemilik: 'Desa Sidoagung, Kec. Sruweng',
    nama_tph_r_u: 'RPU ASRIYAH',
    jenis_unit_usaha: 'RPU',
    pemilik: 'Asriyah',
    no_telp: '85156338895',
    status_ijin_usaha: '',
    lokasi_rpu: 'Dusun Pacalbalung,Desa Sidoagung, Kec. Sruweng, Kab Kebumen',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: 'Sudah (disperindag)',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 4,
    lokasi_desa_kecamatan_alamat_pemilik: 'Desa Sidoagung, Kec. Sruweng',
    nama_tph_r_u: 'RPU ZAIN',
    jenis_unit_usaha: 'RPU',
    pemilik: 'Mugiarti',
    no_telp: '81329706588',
    status_ijin_usaha: '',
    lokasi_rpu: 'Dusun Pacalbalung,Desa Sidoagung, Kec. Sruweng, Kab Kebumen',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: 'Sudah (disperindag)',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 5,
    lokasi_desa_kecamatan_alamat_pemilik: 'Desa Sidoagung, Kec. Sruweng',
    nama_tph_r_u: 'RPU FITRIA',
    jenis_unit_usaha: 'RPU',
    pemilik: 'Muhajir',
    no_telp: '81327051625',
    status_ijin_usaha: '',
    lokasi_rpu: 'Dusun Pacalbalung,Desa Sidoagung, Kec. Sruweng, Kab Kebumen',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: 'Sudah (disperindag)',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 6,
    lokasi_desa_kecamatan_alamat_pemilik: 'Sido gede',
    nama_tph_r_u: 'Ayam Broiler Segar Prembun',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Diana Herdiana Wati',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Sidogede Prembun',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: 'ada',
    sertifikat_nkv: '-',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 7,
    lokasi_desa_kecamatan_alamat_pemilik: 'Sidogede',
    nama_tph_r_u: 'Pak Muslim',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Muslim',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Sidogede Rt 03 / Rw 01',
    pemotongan_per_hari_ekor: '35',
    sertifikat_halal: '',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '2100',
  },
  {
    no: 8,
    lokasi_desa_kecamatan_alamat_pemilik: 'Kabuaran',
    nama_tph_r_u: 'Pak giman',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Giman',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Kepek Kabuaran Prembun',
    pemotongan_per_hari_ekor: '30',
    sertifikat_halal: 'belum',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1800',
  },
  {
    no: 9,
    lokasi_desa_kecamatan_alamat_pemilik: 'Karanganyar',
    nama_tph_r_u: 'Kios Ayam Nugraha',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Siti Aminah',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Karanganyar',
    pemotongan_per_hari_ekor: '200',
    sertifikat_halal: 'belum',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '12000',
  },
  {
    no: 10,
    lokasi_desa_kecamatan_alamat_pemilik: 'Karanganyar',
    nama_tph_r_u: 'Pemotongan Ayam Zain',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Mugiarti',
    no_telp: '81329706588',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Karanganyar',
    pemotongan_per_hari_ekor: '200',
    sertifikat_halal: 'belum',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '12000',
  },
  {
    no: 11,
    lokasi_desa_kecamatan_alamat_pemilik: 'Karanganyar',
    nama_tph_r_u: 'Ayam Potong Bu Asriyah',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Asriyah',
    no_telp: '85156338895',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Karanganyar',
    pemotongan_per_hari_ekor: '200',
    sertifikat_halal: 'belum',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '12000',
  },
  {
    no: 12,
    lokasi_desa_kecamatan_alamat_pemilik: 'Karanganyar',
    nama_tph_r_u: 'Pemotongan Ayam Bu Pon',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Turisman',
    no_telp: '81391636730',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Karanganyar',
    pemotongan_per_hari_ekor: '200',
    sertifikat_halal: 'belum',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '12000',
  },
  {
    no: 13,
    lokasi_desa_kecamatan_alamat_pemilik: 'Sidomulyo, Karanganyar',
    nama_tph_r_u: 'RPU TURISMAN',
    jenis_unit_usaha: 'RPU',
    pemilik: 'Turisman',
    no_telp: '81391636730',
    status_ijin_usaha: '',
    lokasi_rpu: 'Sidomulyo, Desa Sidomulyo, Kec.Karanganyar, Kab Kebumen',
    pemotongan_per_hari_ekor: '200',
    sertifikat_halal: 'sudah (disperindag)',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '12000',
  },
  {
    no: 14,
    lokasi_desa_kecamatan_alamat_pemilik: 'Semanding',
    nama_tph_r_u: 'H Paiman',
    jenis_unit_usaha: 'TPH-R',
    pemilik: '',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Jl.Potongan , Desa Semanding',
    pemotongan_per_hari_ekor: '2',
    sertifikat_halal: 'ada',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '30',
  },
  {
    no: 15,
    lokasi_desa_kecamatan_alamat_pemilik: 'Gombong',
    nama_tph_r_u: 'H Manisman',
    jenis_unit_usaha: 'TPH-R',
    pemilik: '',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pemotongan di RPH',
    pemotongan_per_hari_ekor: '1',
    sertifikat_halal: 'ada',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '15',
  },
  {
    no: 16,
    lokasi_desa_kecamatan_alamat_pemilik: 'Gombong',
    nama_tph_r_u: 'Pak Elim',
    jenis_unit_usaha: 'TPH-B',
    pemilik: '',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pemotongan di RPH',
    pemotongan_per_hari_ekor: '1',
    sertifikat_halal: 'TPH B',
    sertifikat_nkv: 'tidak',
    rata2_produksi_per_bulan_kg: '10',
  },
  {
    no: 17,
    lokasi_desa_kecamatan_alamat_pemilik: 'Gombong',
    nama_tph_r_u: 'Pak Intras',
    jenis_unit_usaha: 'TPH-B',
    pemilik: '',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pemotongan di RPH',
    pemotongan_per_hari_ekor: '1',
    sertifikat_halal: 'TPH B',
    sertifikat_nkv: 'tidak',
    rata2_produksi_per_bulan_kg: '10',
  },
  {
    no: 18,
    lokasi_desa_kecamatan_alamat_pemilik: 'Desa Wonokriyo/Kec. Gombong',
    nama_tph_r_u: 'RPU CABUT BULU DAN POTONGAN AYAM ANDRI',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Andriyanto',
    no_telp: '081326965865',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Gombong',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: 'sudah (disperindag)',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 19,
    lokasi_desa_kecamatan_alamat_pemilik: 'Gombong',
    nama_tph_r_u: 'Pemotongan mAs Arief',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Arief Jami Faisal',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Gombong',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 20,
    lokasi_desa_kecamatan_alamat_pemilik: 'Desa Kemukus, Kec. Gombong',
    nama_tph_r_u: 'RPU PAK BAMBANG',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Sudarmiya Tiningsih',
    no_telp: '085878748120',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Gombong',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: 'sudah (disperindag',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 21,
    lokasi_desa_kecamatan_alamat_pemilik: 'Gombong',
    nama_tph_r_u: 'RPA FAIZ',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Faizatul Fuadah',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Gombong',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 22,
    lokasi_desa_kecamatan_alamat_pemilik: 'Gombong',
    nama_tph_r_u: 'RPA Pangestu',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Mahfanda Aldin',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Gombong',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 23,
    lokasi_desa_kecamatan_alamat_pemilik: 'Semanding, Gombong',
    nama_tph_r_u: 'RPH Gombong',
    jenis_unit_usaha: 'RPH',
    pemilik: '',
    no_telp: '082135423674 (drh. Rizki) 081802695072 (drh. Suci)',
    status_ijin_usaha: '',
    lokasi_rpu: 'jl. Potongan Semanding satu, Desa Semanding, Kec. Gombong',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: 'sudah',
    sertifikat_nkv: 'proses',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 24,
    lokasi_desa_kecamatan_alamat_pemilik: 'Sadang Kulon/ Sadang',
    nama_tph_r_u: 'Bp. Suyit',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Bp. Suyit',
    no_telp: '085956379134',
    status_ijin_usaha: 'belum',
    lokasi_rpu: 'dk. Kalipetir 04/03, Sadangkulon',
    pemotongan_per_hari_ekor: '75-100',
    sertifikat_halal: 'belum',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '6000',
  },
  {
    no: 25,
    lokasi_desa_kecamatan_alamat_pemilik: 'Sadang Kulon/ Sadang',
    nama_tph_r_u: 'Sutijah',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Sutijah',
    no_telp: '085215948968',
    status_ijin_usaha: 'belum',
    lokasi_rpu: 'sadangkulon, sadang',
    pemotongan_per_hari_ekor: '30',
    sertifikat_halal: 'belum',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1800',
  },
  {
    no: 26,
    lokasi_desa_kecamatan_alamat_pemilik: 'Banioro/Karangsambung',
    nama_tph_r_u: 'Ayam Potong Bu. Salamah',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Salamah',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Jalan, Panjer, Banioro, Karangsambung, Kebumen Regency, Centr',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: 'belum',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 27,
    lokasi_desa_kecamatan_alamat_pemilik: 'Langse/Karangsambung',
    nama_tph_r_u: 'Kasim Broiler',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Kasim',
    no_telp: '082133090079',
    status_ijin_usaha: 'belum',
    lokasi_rpu: 'dukuh gelagah amba rt 2 rw 2, Langse',
    pemotongan_per_hari_ekor: '60 s/d 70',
    sertifikat_halal: 'belum',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 28,
    lokasi_desa_kecamatan_alamat_pemilik: 'Balingasal',
    nama_tph_r_u: 'Pak Sakiman',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Sakiman',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Dusun Kenayan RT 2 / RW 1, desa Balingasal',
    pemotongan_per_hari_ekor: '35',
    sertifikat_halal: 'ada',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '2100',
  },
  {
    no: 29,
    lokasi_desa_kecamatan_alamat_pemilik: 'Korowelang',
    nama_tph_r_u: 'Pemotongan Ayam Subhan',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Subhan',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Korowelang',
    pemotongan_per_hari_ekor: '15',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '900',
  },
  {
    no: 30,
    lokasi_desa_kecamatan_alamat_pemilik: 'Mekarsari',
    nama_tph_r_u: 'Pemotongan Ayam Rasiyo',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Rasiyo (Nasir Machmud /anak)',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Duduhan RT 3 RW 3 Mekarsari',
    pemotongan_per_hari_ekor: '100',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '6000',
  },
  {
    no: 31,
    lokasi_desa_kecamatan_alamat_pemilik: 'Tanjungsari',
    nama_tph_r_u: 'Nur Taufik',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Nur Taufik',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Tanjungsari',
    pemotongan_per_hari_ekor: '80',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '4800',
  },
  {
    no: 32,
    lokasi_desa_kecamatan_alamat_pemilik: 'Tanjungsari',
    nama_tph_r_u: 'Umam',
    jenis_unit_usaha: '',
    pemilik: 'Umam',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Tanjungsari',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 33,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Duduhan, Desa Mekarsari, Kec. Kutowinangun, Kab. Kebumen',
    nama_tph_r_u: 'RPU ABS PREMBUN',
    jenis_unit_usaha: 'RPU',
    pemilik: 'Diana Herdiyana Wati',
    no_telp: '081333591994',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Kutowinangun',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: 'sudah (disperindag)',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '0',
  },
  {
    no: 34,
    lokasi_desa_kecamatan_alamat_pemilik: 'Korowelang',
    nama_tph_r_u: 'Manisah',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Manisah',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Korowelang',
    pemotongan_per_hari_ekor: '25',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1500',
  },
  {
    no: 35,
    lokasi_desa_kecamatan_alamat_pemilik: 'Mekarsari',
    nama_tph_r_u: 'Mohamad Tulud',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Mohamad Tulud',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Duduhan RT 2/ RW 3 Mekarsari',
    pemotongan_per_hari_ekor: '25',
    sertifikat_halal: '-',
    sertifikat_nkv: '-',
    rata2_produksi_per_bulan_kg: '1500',
  },
  {
    no: 36,
    lokasi_desa_kecamatan_alamat_pemilik: 'Mekarsari',
    nama_tph_r_u: 'Bambang Ismanto',
    jenis_unit_usaha: '',
    pemilik: 'Bambang Ismanto',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Duduhan RT 2/ RW 3 Mekarsari',
    pemotongan_per_hari_ekor: '20',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1200',
  },
  {
    no: 37,
    lokasi_desa_kecamatan_alamat_pemilik: 'Mekarsari',
    nama_tph_r_u: 'Hj. Roisah',
    jenis_unit_usaha: '',
    pemilik: 'Hj. Roisah',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Duduhan RT 2/ RW 3 Mekarsari',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 38,
    lokasi_desa_kecamatan_alamat_pemilik: 'Mekarsari',
    nama_tph_r_u: 'Toha Salim',
    jenis_unit_usaha: '',
    pemilik: 'Toha Salim',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Kuwaon RT 2/ RW 1 Mekarsari',
    pemotongan_per_hari_ekor: '60',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3600',
  },
  {
    no: 39,
    lokasi_desa_kecamatan_alamat_pemilik: 'Mekarsari',
    nama_tph_r_u: 'Ismiatun',
    jenis_unit_usaha: '',
    pemilik: 'Ismiatun',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Patokan 3/4 Mekarsari',
    pemotongan_per_hari_ekor: '25',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1500',
  },
  {
    no: 40,
    lokasi_desa_kecamatan_alamat_pemilik: 'Kewayuhan',
    nama_tph_r_u: '',
    jenis_unit_usaha: 'TPH-R',
    pemilik: 'Bakir Sutopo',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Kewayuhan',
    pemotongan_per_hari_ekor: '1',
    sertifikat_halal: 'ada (disperindag)',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '10',
  },
  {
    no: 41,
    lokasi_desa_kecamatan_alamat_pemilik: 'Kewayuhan',
    nama_tph_r_u: '',
    jenis_unit_usaha: 'TPH-R',
    pemilik: 'Supriyadi',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Kewayuhan',
    pemotongan_per_hari_ekor: '1',
    sertifikat_halal: 'ada (diseprindag)',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '10',
  },
  {
    no: 42,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Dukuh Mertokondo, Rt. 004/Rw004, Desa Kutosari Kebumen',
    nama_tph_r_u: 'RPU SUPER BAROKAH',
    jenis_unit_usaha: 'RPU',
    pemilik: 'Syamsul Kurnia',
    no_telp: '082324259345',
    status_ijin_usaha: 'ada',
    lokasi_rpu: 'Dk. Krajan Rt.001/Rw 001 Desa Kedawung Pejagoan',
    pemotongan_per_hari_ekor: '500',
    sertifikat_halal: 'ID33110021067310125',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '30000',
  },
  {
    no: 43,
    lokasi_desa_kecamatan_alamat_pemilik: 'Wonotirto',
    nama_tph_r_u: '',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Supriyono',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Karanggayam',
    pemotongan_per_hari_ekor: '25',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1500',
  },
  {
    no: 44,
    lokasi_desa_kecamatan_alamat_pemilik: 'Mergosono',
    nama_tph_r_u: 'Sugaianto',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Sugianto',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: '',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '-',
  },
  {
    no: 45,
    lokasi_desa_kecamatan_alamat_pemilik: 'Arjowinangun',
    nama_tph_r_u: 'RPU Bapak Hamid (Pak Lurah)',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Hamid',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: '',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '-',
  },
  {
    no: 46,
    lokasi_desa_kecamatan_alamat_pemilik: 'Buluspesantren',
    nama_tph_r_u: 'Setrojenar',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Bp. Sihim',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'setrojenar',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '-',
  },
  {
    no: 47,
    lokasi_desa_kecamatan_alamat_pemilik: 'Buayan',
    nama_tph_r_u: 'Pangestu Broiler',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Wakhidin',
    no_telp: '0821-3922-5865',
    status_ijin_usaha: '',
    lokasi_rpu: 'Meto lor 1/4 Rogodadi, Buayan, Kebumen',
    pemotongan_per_hari_ekor: '8000',
    sertifikat_halal: 'ID33110024117160725',
    sertifikat_nkv: 'Berproses',
    rata2_produksi_per_bulan_kg: '480000',
  },
  {
    no: 48,
    lokasi_desa_kecamatan_alamat_pemilik: 'Jladri',
    nama_tph_r_u: 'Saludin',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Saludin',
    no_telp: '0821-3782-2233',
    status_ijin_usaha: '',
    lokasi_rpu: 'Desa Jladri Kecamatan Buayan',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 49,
    lokasi_desa_kecamatan_alamat_pemilik: 'Jladri',
    nama_tph_r_u: 'Sodik',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Sodik',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Desa Jladri Kecamatan Buayan',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 50,
    lokasi_desa_kecamatan_alamat_pemilik: 'Mergosono',
    nama_tph_r_u: 'Sugaianto',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Sugianto',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: '',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '0',
  },
  {
    no: 51,
    lokasi_desa_kecamatan_alamat_pemilik: 'Sikayu',
    nama_tph_r_u: '',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Suwarni',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: '',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '0',
  },
  {
    no: 52,
    lokasi_desa_kecamatan_alamat_pemilik: 'Kalijaya, Alian',
    nama_tph_r_u: 'RPU Sucipto',
    jenis_unit_usaha: 'RPU',
    pemilik: 'Sucipto',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Delisen, Kalijaya',
    pemotongan_per_hari_ekor: '5000',
    sertifikat_halal: 'ada',
    sertifikat_nkv: 'Tingkat III',
    rata2_produksi_per_bulan_kg: '300000',
  },
  {
    no: 53,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Dusun Delisen, Desa Kalijaya, Kec. Alian, Kab. Kebumen',
    nama_tph_r_u: 'RPU UD  Wahyu Jaya',
    jenis_unit_usaha: 'RPU',
    pemilik: 'Suratman',
    no_telp: '081548338303',
    status_ijin_usaha: 'sudah',
    lokasi_rpu: 'Dk Delisen Rt 02/Rw 01; Aneka Usaha',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: 'No:MUI-LPPOM-1502114930723 Tanggal 7 Juli 2023',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 54,
    lokasi_desa_kecamatan_alamat_pemilik: 'Surotrunan, Alian',
    nama_tph_r_u: 'Ahmad broiler',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Ahmad',
    no_telp: '082322951116',
    status_ijin_usaha: '',
    lokasi_rpu: 'Dk kebebekan surotrunan',
    pemotongan_per_hari_ekor: '45',
    sertifikat_halal: 'Belum',
    sertifikat_nkv: 'Belum',
    rata2_produksi_per_bulan_kg: '2700',
  },
  {
    no: 55,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Desa Jatimulyo Rt 04/Rw04, Kecamatan Alian, Kab. Kebumen',
    nama_tph_r_u: 'RPU KEBUMEN JAYA FARM',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Wahyu sugiantoro',
    no_telp: '081327417131',
    status_ijin_usaha: 'sudah',
    lokasi_rpu: 'dk Jatimalang, Jatimulyo',
    pemotongan_per_hari_ekor: '100',
    sertifikat_halal: 'sudah',
    sertifikat_nkv: 'Proses',
    rata2_produksi_per_bulan_kg: '6000',
  },
  {
    no: 56,
    lokasi_desa_kecamatan_alamat_pemilik: 'Karangkembang',
    nama_tph_r_u: 'Kharisun',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Kharisun',
    no_telp: '082133336550',
    status_ijin_usaha: 'belum',
    lokasi_rpu: 'dk. Era 2/1 Karangkembang',
    pemotongan_per_hari_ekor: '75',
    sertifikat_halal: 'belum',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '4500',
  },
  {
    no: 57,
    lokasi_desa_kecamatan_alamat_pemilik: '',
    nama_tph_r_u: '',
    jenis_unit_usaha: '',
    pemilik: '',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: '',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: '',
    sertifikat_nkv: '',
    rata2_produksi_per_bulan_kg: '',
  },
  {
    no: 58,
    lokasi_desa_kecamatan_alamat_pemilik: 'Surotrunan, Alian',
    nama_tph_r_u: 'Hangry',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Topan Ali Purba',
    no_telp: '082137164182',
    status_ijin_usaha: 'belum',
    lokasi_rpu: 'dk kebebekan 3/4 Surotrunan',
    pemotongan_per_hari_ekor: '40',
    sertifikat_halal: 'belum',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '2400',
  },
  {
    no: 59,
    lokasi_desa_kecamatan_alamat_pemilik: 'Ambalresmi, Ambal',
    nama_tph_r_u: 'Kaswardiyanto',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Kaswardiyanto',
    no_telp: '081805879319',
    status_ijin_usaha: '',
    lokasi_rpu: 'Ambalresmi, Ambal',
    pemotongan_per_hari_ekor: '40',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '2400',
  },
  {
    no: 60,
    lokasi_desa_kecamatan_alamat_pemilik: 'Ambalresmi, Ambal',
    nama_tph_r_u: 'Sugito',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Sugito',
    no_telp: '085799329023',
    status_ijin_usaha: '',
    lokasi_rpu: 'Ambalresmi, Ambal',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 61,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Desa Sumberjati, Rt03/Rw04, Kec. Ambal, Kab. Kebumen',
    nama_tph_r_u: 'KARENZ BROILER',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Karyanto',
    no_telp: '082223585456',
    status_ijin_usaha: '',
    lokasi_rpu: 'Sumberjati, Ambal',
    pemotongan_per_hari_ekor: '1200',
    sertifikat_halal: 'sudah (disperindag)',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '72000',
  },
  {
    no: 62,
    lokasi_desa_kecamatan_alamat_pemilik: 'Blengorwetan, Ambal',
    nama_tph_r_u: 'Jihan Broiler',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Tunut',
    no_telp: '085759006750',
    status_ijin_usaha: '',
    lokasi_rpu: 'Blengorwetan, Ambal',
    pemotongan_per_hari_ekor: '300',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '18000',
  },
  {
    no: 63,
    lokasi_desa_kecamatan_alamat_pemilik: 'Blengorkulon, Ambal',
    nama_tph_r_u: 'Anugrah Broiler',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'H. Warisman',
    no_telp: '088220129838',
    status_ijin_usaha: '',
    lokasi_rpu: 'Blengorkulon, Ambal',
    pemotongan_per_hari_ekor: '40',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '2400',
  },
  {
    no: 64,
    lokasi_desa_kecamatan_alamat_pemilik: 'Selotumpeng, Mirit',
    nama_tph_r_u: 'MS Suyat',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Rusdiyono',
    no_telp: '085292825369',
    status_ijin_usaha: '',
    lokasi_rpu: 'Selotumpeng, Mirit',
    pemotongan_per_hari_ekor: '300',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '18000',
  },
  {
    no: 65,
    lokasi_desa_kecamatan_alamat_pemilik: 'Wergonayan, Mirit',
    nama_tph_r_u: 'Rudy',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Rudy',
    no_telp: '081393717244',
    status_ijin_usaha: '',
    lokasi_rpu: 'Wergonayan, Mirit',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 66,
    lokasi_desa_kecamatan_alamat_pemilik: 'Tlogopragoto',
    nama_tph_r_u: 'Sri Fajar Komsiati',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Sri Fajar Komsiati',
    no_telp: '083120496479',
    status_ijin_usaha: '',
    lokasi_rpu: 'Tlogopragoto, Mirit',
    pemotongan_per_hari_ekor: '40',
    sertifikat_halal: '',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '2400',
  },
  {
    no: 67,
    lokasi_desa_kecamatan_alamat_pemilik: 'Adimulyo',
    nama_tph_r_u: 'PT. Nindya',
    jenis_unit_usaha: 'TPH-U',
    pemilik: 'Takhrir / Katamsi',
    no_telp: '081330535616',
    status_ijin_usaha: '',
    lokasi_rpu: 'Desa Mangunharjo rt06/04 Adimulyo',
    pemotongan_per_hari_ekor: '10000',
    sertifikat_halal: 'sudah',
    sertifikat_nkv: 'Berproses',
    rata2_produksi_per_bulan_kg: '600000',
  },
  {
    no: 68,
    lokasi_desa_kecamatan_alamat_pemilik: 'Adimulyo',
    nama_tph_r_u: 'TPH Avika Farm',
    jenis_unit_usaha: 'TPH-R',
    pemilik: 'Nugroho Wisnu B',
    no_telp: '087715478640',
    status_ijin_usaha: '',
    lokasi_rpu: 'Kemujan, Adimulyo',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '0',
  },
  {
    no: 69,
    lokasi_desa_kecamatan_alamat_pemilik: 'Sitiadi',
    nama_tph_r_u: 'RPHU PT. Cemerlang Unggas Lestari',
    jenis_unit_usaha: 'RPU',
    pemilik: 'milik PT',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'jl. Puring-Gombong No. 117 Area sawah, Sitiadi',
    pemotongan_per_hari_ekor: '7500',
    sertifikat_halal: 'ada',
    sertifikat_nkv: 'RPH-U 330503-237',
    rata2_produksi_per_bulan_kg: '450000',
  },
  {
    no: 70,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Puring Kulon Rt.03/Rw 02, Desa Sitiadi, Kec. Puring, Kab. Kebumen',
    nama_tph_r_u: 'RPU NUGRAHA',
    jenis_unit_usaha: 'RPU',
    pemilik: 'Siti Aminatun',
    no_telp: '08122725614',
    status_ijin_usaha: '',
    lokasi_rpu:
      'Puring Kulon Rt.03/Rw 02, Desa Sitiadi, Kec. Puring, Kab. Kebumen',
    pemotongan_per_hari_ekor: '',
    sertifikat_halal: 'sudah(disperindag)',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '0',
  },
  {
    no: 71,
    lokasi_desa_kecamatan_alamat_pemilik: 'Demangsari RT 1 RW 2, Ayah',
    nama_tph_r_u: 'RPA Satar Chicken',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Satar',
    no_telp: '081327366729',
    status_ijin_usaha: '',
    lokasi_rpu: 'Demangsari RT 1 RW 2',
    pemotongan_per_hari_ekor: '250',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '15000',
  },
  {
    no: 72,
    lokasi_desa_kecamatan_alamat_pemilik: 'Pasar Rwowokele',
    nama_tph_r_u: 'Az Zahra Broiler',
    jenis_unit_usaha: 'TPu',
    pemilik: 'Lili Riyanti',
    no_telp: '085750460866',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Rowokele',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 73,
    lokasi_desa_kecamatan_alamat_pemilik: 'Bejiruyung, Sempor',
    nama_tph_r_u: 'Barokah',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Pak Supri / Najwa',
    no_telp: '082220429508',
    status_ijin_usaha: '',
    lokasi_rpu: 'Jl. Kaligandu, RT 03/1 Bejiruyung, sempor',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 74,
    lokasi_desa_kecamatan_alamat_pemilik: 'Semanding RT 4/4',
    nama_tph_r_u: 'Pak Kadar',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Pak Kadar',
    no_telp: '81328267114',
    status_ijin_usaha: '',
    lokasi_rpu: 'Semanding RT 4/4',
    pemotongan_per_hari_ekor: '100',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '6000',
  },
  {
    no: 75,
    lokasi_desa_kecamatan_alamat_pemilik: 'Semanding RT 4/4',
    nama_tph_r_u: 'Sumber Rejeki',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Nurfiya',
    no_telp: '85645112119',
    status_ijin_usaha: '',
    lokasi_rpu: 'Karanggayam RT 7 RW 5',
    pemotongan_per_hari_ekor: '35',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '2100',
  },
  {
    no: 76,
    lokasi_desa_kecamatan_alamat_pemilik: 'Karanggayam RT 7 RW 5',
    nama_tph_r_u: 'Bu surya',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Surya',
    no_telp: '81385644372',
    status_ijin_usaha: '',
    lokasi_rpu: 'Dukung Klangon RT 02 RW Desa Sidoagung , Karanganyar',
    pemotongan_per_hari_ekor: '250',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '15000',
  },
  {
    no: 77,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Dukung Klangon RT 02 RW Desa Sidoagung , Karanganyar',
    nama_tph_r_u: 'Muslimin',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Muslimin',
    no_telp: '82225977197',
    status_ijin_usaha: '',
    lokasi_rpu: 'Kewayuhan Dukuh Taleban RT 02 w 03',
    pemotongan_per_hari_ekor: '400',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '24000',
  },
  {
    no: 78,
    lokasi_desa_kecamatan_alamat_pemilik: 'Kewayuhan Dukuh Taleban RT 02 w 03',
    nama_tph_r_u: 'Barokah',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Bambang',
    no_telp: '8871379029',
    status_ijin_usaha: '',
    lokasi_rpu: 'Dk Pernak 1/3 Kedungwinangun',
    pemotongan_per_hari_ekor: '25',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1500',
  },
  {
    no: 79,
    lokasi_desa_kecamatan_alamat_pemilik: 'Dk Pernak 1/3 Kedungwinangun',
    nama_tph_r_u: 'Sari Pitik',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Agus',
    no_telp: '85227010232',
    status_ijin_usaha: '',
    lokasi_rpu: 'Dk Rendeng 1/3 Sidomulyo',
    pemotongan_per_hari_ekor: '250',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '15000',
  },
  {
    no: 80,
    lokasi_desa_kecamatan_alamat_pemilik: 'Dk Rendeng 1/3 Sidomulyo',
    nama_tph_r_u: 'Ayam Kembar',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Sulam Taufik',
    no_telp: '0852-1594-8968',
    status_ijin_usaha: '',
    lokasi_rpu: 'DK. Siluk 3/4 Sadangkulon',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 81,
    lokasi_desa_kecamatan_alamat_pemilik: 'DK. Siluk 3/4 Sadangkulon',
    nama_tph_r_u: 'Bu Salamah',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Salamah',
    no_telp: '0813 9111 7359',
    status_ijin_usaha: '',
    lokasi_rpu: 'Desa Banioro',
    pemotongan_per_hari_ekor: '25',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1500',
  },
  {
    no: 82,
    lokasi_desa_kecamatan_alamat_pemilik: 'Desa Banioro',
    nama_tph_r_u: 'Karminah',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Karminah',
    no_telp: '83862269875',
    status_ijin_usaha: '',
    lokasi_rpu: 'karang cangkring rt 03 rw 02 tlogorejo bonorowo',
    pemotongan_per_hari_ekor: '25',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1500',
  },
  {
    no: 83,
    lokasi_desa_kecamatan_alamat_pemilik:
      'karang cangkring rt 03 rw 02 tlogorejo bonorowo',
    nama_tph_r_u: 'Surip',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Surip',
    no_telp: '087872456892',
    status_ijin_usaha: '',
    lokasi_rpu: 'Dk Kranggan RT 3 RW 4 Desa Prembun, Kec.Prembun',
    pemotongan_per_hari_ekor: '5',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '300',
  },
  {
    no: 84,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Dk Kranggan RT 3 RW 4 Desa Prembun, Kec.Prembun',
    nama_tph_r_u: 'Berkah Lestari',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Mugiem',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Padureso',
    pemotongan_per_hari_ekor: '850',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '51000',
  },
  {
    no: 85,
    lokasi_desa_kecamatan_alamat_pemilik: 'Padureso',
    nama_tph_r_u: 'Puji Astuti',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Puji Astuti',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Ungaran RT 2 RW 5 Kec.Kutowinangun',
    pemotongan_per_hari_ekor: '13',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '780',
  },
  {
    no: 86,
    lokasi_desa_kecamatan_alamat_pemilik: 'Ungaran RT 2 RW 5 Kec.Kutowinangun',
    nama_tph_r_u: 'Lembu Mas',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Nanang',
    no_telp: '88238400692',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Wonokriyo / Kalitengah',
    pemotongan_per_hari_ekor: '15',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '900',
  },
  {
    no: 87,
    lokasi_desa_kecamatan_alamat_pemilik: 'Pasar Wonokriyo / Kalitengah',
    nama_tph_r_u: 'Pak Wakhidin',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Ibu Ginah',
    no_telp: '81226338781',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Wonokriyo / Somagede',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 88,
    lokasi_desa_kecamatan_alamat_pemilik: 'Pasar Wonokriyo / Somagede',
    nama_tph_r_u: 'Siti Mutmainah (RPU AHM kutowinangun)',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Mas Didin',
    no_telp: '',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Tumenggungan',
    pemotongan_per_hari_ekor: '100',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '6000',
  },
  {
    no: 89,
    lokasi_desa_kecamatan_alamat_pemilik: 'Pasar Tumenggungan',
    nama_tph_r_u: 'badriyah ( kuwayuhan)',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Suwarti',
    no_telp: '82220150054',
    status_ijin_usaha: '',
    lokasi_rpu: 'Pasar Tumenggungan',
    pemotongan_per_hari_ekor: '30',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1800',
  },
  {
    no: 90,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Arjowinangun RT 2 / 2, Buluspesantren',
    nama_tph_r_u: 'RPU New Broiler',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Atik Muhimatun / Hamid',
    no_telp: '85747313332',
    status_ijin_usaha: '',
    lokasi_rpu: 'Arjowinangun RT 2 / 2, Buluspesantren',
    pemotongan_per_hari_ekor: '100',
    sertifikat_halal: 'halal',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '3000',
  },
  {
    no: 91,
    lokasi_desa_kecamatan_alamat_pemilik: 'Krajan RT 3 /1, Padureso',
    nama_tph_r_u: 'Subur Jaya',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Subur Gunawan',
    no_telp: '81573654703',
    status_ijin_usaha: '',
    lokasi_rpu: 'Krajan RT 3 /1, Padureso',
    pemotongan_per_hari_ekor: '30',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '900',
  },
  {
    no: 92,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Sidobunder, RT 1 RW 1, Puring, Kebumen',
    nama_tph_r_u: 'Adem Ayem',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Septiana Retno Lestari',
    no_telp: '895329231822',
    status_ijin_usaha: '',
    lokasi_rpu: 'Sidobunder, RT 1 RW 1, Puring, Kebumen',
    pemotongan_per_hari_ekor: '30',
    sertifikat_halal: 'halal',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '900',
  },
  {
    no: 93,
    lokasi_desa_kecamatan_alamat_pemilik: 'Tamanwinangun RT 3 RW 5',
    nama_tph_r_u: 'Kencleng',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Dani Riyadi',
    no_telp: '82329355617',
    status_ijin_usaha: '',
    lokasi_rpu: 'Tamanwinangun RT 3 RW 5',
    pemotongan_per_hari_ekor: '30',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '900',
  },
  {
    no: 94,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Jl. Pemandian Barat Dk. Era, Karangkembang, Alian',
    nama_tph_r_u: 'Ayam Potong Pak Kharisun',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Kharisun',
    no_telp: '88227219400',
    status_ijin_usaha: '',
    lokasi_rpu:
      '/ Pasar Sruni /Jl. Pemandian Barat Dk. Era, Karangkembang, Alian',
    pemotongan_per_hari_ekor: '3-',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '900',
  },
  {
    no: 95,
    lokasi_desa_kecamatan_alamat_pemilik:
      'Dk. Taleban RT 2 RW 3, Kuwayuhan, Pejagoan',
    nama_tph_r_u: 'Muslimin',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Muslimin',
    no_telp: '08225977197/087790034000',
    status_ijin_usaha: '',
    lokasi_rpu: 'Dk. Taleban RT 2 RW 3, Kuwayuhan, Pejagoan',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: 'halal',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1500',
  },
  {
    no: 96,
    lokasi_desa_kecamatan_alamat_pemilik: 'Tlogopragoto, Mirit',
    nama_tph_r_u: 'Supriyono',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Supriyono',
    no_telp: '81227425917',
    status_ijin_usaha: '',
    lokasi_rpu: 'Tlogopragoto, Mirit',
    pemotongan_per_hari_ekor: '20',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '600',
  },
  {
    no: 97,
    lokasi_desa_kecamatan_alamat_pemilik: 'Grogol beningsari',
    nama_tph_r_u: 'Toko RJ',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Muslihatun',
    no_telp: '85227876107',
    status_ijin_usaha: '',
    lokasi_rpu: 'Grogol, Beningsari',
    pemotongan_per_hari_ekor: '50',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '1500',
  },
  {
    no: 98,
    lokasi_desa_kecamatan_alamat_pemilik: 'Bocor RT 6 RW 1',
    nama_tph_r_u: 'Nasehudin',
    jenis_unit_usaha: 'TPU',
    pemilik: 'ABS Kebumen',
    no_telp: '85134583141',
    status_ijin_usaha: '',
    lokasi_rpu: 'Bocor RT 6 RW 1, Buluspesantren',
    pemotongan_per_hari_ekor: '25',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '750',
  },
  {
    no: 99,
    lokasi_desa_kecamatan_alamat_pemilik: 'Argopeni RT 2 RW 3, Kebumen',
    nama_tph_r_u: 'Sofiyanto',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Argo Mulia',
    no_telp: '87700040707',
    status_ijin_usaha: '',
    lokasi_rpu: 'Argopeni RT 2 RW 3, Kebumen',
    pemotongan_per_hari_ekor: '250',
    sertifikat_halal: '-',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '7500',
  },
  {
    no: 100,
    lokasi_desa_kecamatan_alamat_pemilik: 'Kuwayuhan',
    nama_tph_r_u: 'Mursiyah',
    jenis_unit_usaha: 'TPU',
    pemilik: 'Mrs Broiler',
    no_telp: '85227761833',
    status_ijin_usaha: '',
    lokasi_rpu: 'Kuwayuhan',
    pemotongan_per_hari_ekor: '20',
    sertifikat_halal: 'halal',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '600',
  },
  {
    no: 101,
    lokasi_desa_kecamatan_alamat_pemilik: 'Kuwayuhan, Pejagoan',
    nama_tph_r_u: 'Muslimin',
    jenis_unit_usaha: 'TPH (ayam, Bebek, Sapi)',
    pemilik: 'Muslimin',
    no_telp: '08225977197/ 087790034000',
    status_ijin_usaha: '',
    lokasi_rpu: 'Kuwayuhan, Pejagoan',
    pemotongan_per_hari_ekor: '-',
    sertifikat_halal: 'halal',
    sertifikat_nkv: 'belum',
    rata2_produksi_per_bulan_kg: '-',
  },
];

// Tipe data satu entri unit pemotongan dengan dukungan upload berkas
export interface RphItem {
  no: number;
  lokasi_desa_kecamatan_alamat_pemilik?: string;
  nama_tph_r_u?: string;
  jenis_unit_usaha?: string;
  pemilik?: string;
  no_telp?: string;
  status_ijin_usaha?: string;
  lokasi_rpu?: string;
  pemotongan_per_hari_ekor?: string;
  sertifikat_halal?: string;
  sertifikat_nkv?: string;
  rata2_produksi_per_bulan_kg?: string;
  // Upload berkas dokumen
  file_sertifikat_halal?: string;
  file_sertifikat_halal_name?: string;
  file_sertifikat_nkv?: string;
  file_sertifikat_nkv_name?: string;
  file_izin_usaha?: string;
  file_izin_usaha_name?: string;
  file_foto_fasilitas?: string;
  file_foto_fasilitas_name?: string;
}

const LS_KEY = 'data_rph_tph_tpu_v1';

// Skema kosong untuk form tambah/edit
const emptyForm: RphItem = {
  no: 0,
  lokasi_desa_kecamatan_alamat_pemilik: '',
  nama_tph_r_u: '',
  jenis_unit_usaha: 'TPU',
  pemilik: '',
  no_telp: '',
  status_ijin_usaha: '',
  lokasi_rpu: '',
  pemotongan_per_hari_ekor: '',
  sertifikat_halal: '',
  sertifikat_nkv: '',
  rata2_produksi_per_bulan_kg: '',
  file_sertifikat_halal: '',
  file_sertifikat_halal_name: '',
  file_sertifikat_nkv: '',
  file_sertifikat_nkv_name: '',
  file_izin_usaha: '',
  file_izin_usaha_name: '',
  file_foto_fasilitas: '',
  file_foto_fasilitas_name: '',
};

const FIELD_LABELS: Record<string, string> = {
  nama_tph_r_u: 'Nama TPH/RPU / Unit Usaha',
  jenis_unit_usaha: 'Jenis Unit Usaha',
  pemilik: 'Nama Pemilik / Pengelola',
  no_telp: 'No. Telp / WhatsApp',
  status_ijin_usaha: 'Status Ijin Usaha / Legalitas',
  lokasi_rpu: 'Lokasi RPU / TPH',
  lokasi_desa_kecamatan_alamat_pemilik: 'Lokasi Desa / Kecamatan / Alamat Lengkap',
  pemotongan_per_hari_ekor: 'Estimasi Pemotongan per Hari (ekor)',
  sertifikat_halal: 'Keterangan Sertifikat Halal',
  sertifikat_nkv: 'Keterangan Sertifikat NKV',
  rata2_produksi_per_bulan_kg: 'Rata-rata Produksi Daging per Bulan (kg)',
};

export default function RphTphTpuPage() {
  const { isReady, canEdit } = usePageAuth('kesmavet', 'rph-tph-tpu');
  const [dataRph, setDataRph] = useState<RphItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNo, setEditingNo] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<RphItem>(emptyForm);
  const [confirmDeleteNo, setConfirmDeleteNo] = useState<number | null>(null);

  // State untuk modal pratinjau dokumen / PDF / Foto
  const [previewDoc, setPreviewDoc] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    fileName: string;
  }>({
    isOpen: false,
    title: '',
    url: '',
    fileName: '',
  });

  // Load data dari database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/pemotongan-hewan');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: RphItem[] = json.data.map((row: any, idx: number) => ({
            no: row.id || idx + 1,
            nama_tph_r_u: row.nama_usaha || '',
            jenis_unit_usaha: row.jenis || '',
            pemilik: row.pemilik || '',
            no_telp: row.kontak || '',
            status_ijin_usaha: row.status_perijinan || '',
            lokasi_rpu: row.lokasi || '',
            lokasi_desa_kecamatan_alamat_pemilik: row.alamat_pemilik || '',
            pemotongan_per_hari_ekor: row.pemotongan_per_hari_ekor ? String(row.pemotongan_per_hari_ekor) : '',
            sertifikat_halal: row.sertifikat_halal || '',
            sertifikat_nkv: row.sertifikat_nkv || '',
            rata2_produksi_per_bulan_kg: row.produksi_per_bulan_kg ? String(row.produksi_per_bulan_kg) : '',
            file_sertifikat_halal: '',
            file_sertifikat_halal_name: '',
            file_sertifikat_nkv: '',
            file_sertifikat_nkv_name: '',
            file_izin_usaha: '',
            file_izin_usaha_name: '',
            file_foto_fasilitas: '',
            file_foto_fasilitas_name: '',
          }));
          setDataRph(mapped);
        }
      } catch (err) {
        console.error('Gagal memuat data RPH/TPH:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const filteredData = dataRph.filter((item) => {
    const matchSearch =
      (item.nama_tph_r_u || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.pemilik || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.lokasi_rpu || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.lokasi_desa_kecamatan_alamat_pemilik || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchKategori =
      selectedKategori === 'Semua' ||
      (item.jenis_unit_usaha || '').toUpperCase().includes(selectedKategori.toUpperCase());

    return matchSearch && matchKategori;
  });

  const openAddModal = () => {
    setEditingNo(null);
    setFormValues(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (item: RphItem) => {
    setEditingNo(item.no);
    setFormValues({ ...item });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNo(null);
    setFormValues(emptyForm);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Handler Upload Berkas File (PDF / Gambar)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'file_sertifikat_halal' | 'file_sertifikat_nkv' | 'file_izin_usaha' | 'file_foto_fasilitas',
    nameKey: 'file_sertifikat_halal_name' | 'file_sertifikat_nkv_name' | 'file_izin_usaha_name' | 'file_foto_fasilitas_name'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran berkas maksimal 15 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormValues((prev) => {
        const next = {
          ...prev,
          [fieldKey]: base64,
          [nameKey]: file.name,
        };
        // Auto-sinkronisasi teks keterangan jika kosong
        if (fieldKey === 'file_sertifikat_halal' && (!prev.sertifikat_halal || prev.sertifikat_halal.toLowerCase().includes('belum'))) {
          next.sertifikat_halal = 'Sudah Halal (Berkas Terlampir)';
        }
        if (fieldKey === 'file_sertifikat_nkv' && (!prev.sertifikat_nkv || prev.sertifikat_nkv.toLowerCase().includes('belum'))) {
          next.sertifikat_nkv = 'Ada Sertifikat NKV (Berkas Terlampir)';
        }
        if (fieldKey === 'file_izin_usaha' && (!prev.status_ijin_usaha || prev.status_ijin_usaha.trim() === '')) {
          next.status_ijin_usaha = 'Ada NIB / Izin Usaha (Berkas Terlampir)';
        }
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (
    fieldKey: 'file_sertifikat_halal' | 'file_sertifikat_nkv' | 'file_izin_usaha' | 'file_foto_fasilitas',
    nameKey: 'file_sertifikat_halal_name' | 'file_sertifikat_nkv_name' | 'file_izin_usaha_name' | 'file_foto_fasilitas_name'
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldKey]: '',
      [nameKey]: '',
    }));
  };

  const openDocPreview = (title: string, url: string, fileName: string) => {
    setPreviewDoc({
      isOpen: true,
      title,
      url,
      fileName,
    });
  };

  const closeDocPreview = () => {
    setPreviewDoc({
      isOpen: false,
      title: '',
      url: '',
      fileName: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formValues.nama_tph_r_u || !formValues.nama_tph_r_u.trim()) {
      alert('Nama TPH/RPU wajib diisi.');
      return;
    }

    try {
      const payload = {
        id: editingNo,
        nama_usaha: formValues.nama_tph_r_u,
        jenis: formValues.jenis_unit_usaha || 'RPH',
        pemilik: formValues.pemilik,
        alamat_pemilik: formValues.lokasi_desa_kecamatan_alamat_pemilik || '',
        kontak: formValues.no_telp || '-',
        lokasi: formValues.lokasi_rpu || formValues.lokasi_desa_kecamatan_alamat_pemilik || '-',
        status_perijinan: formValues.status_ijin_usaha || 'Belum Berizin',
        sertifikat_halal: formValues.sertifikat_halal || 'Tidak',
        sertifikat_nkv: formValues.sertifikat_nkv || 'Tidak',
        produksi_per_bulan_kg: Number(formValues.rata2_produksi_per_bulan_kg) || 0,
        pemotongan_per_hari_ekor: Number(formValues.pemotongan_per_hari_ekor) || 0,
      };

      if (editingNo !== null) {
        const res = await fetch('/api/pemotongan-hewan', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setDataRph((prev) =>
            prev.map((item) => (item.no === editingNo ? { ...formValues, no: editingNo } : item))
          );
          alert('Data RPH/TPH berhasil diperbarui di database!');
        } else {
          alert('Gagal memperbarui: ' + json.error);
        }
      } else {
        const res = await fetch('/api/pemotongan-hewan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          const nextNo = json.insertId || (dataRph.length > 0 ? Math.max(...dataRph.map((d) => Number(d.no) || 0)) + 1 : 1);
          setDataRph((prev) => [{ ...formValues, no: nextNo }, ...prev]);
          alert('Data RPH/TPH baru berhasil disimpan ke database!');
        } else {
          alert('Gagal menyimpan: ' + json.error);
        }
      }
    } catch {
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
    }
    closeModal();
  };

  const handleDelete = async (no: number) => {
    try {
      const res = await fetch(`/api/pemotongan-hewan?id=${no}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setDataRph((prev) => prev.filter((item) => item.no !== no));
      } else {
        alert('Gagal menghapus: ' + json.error);
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus data.');
    }
    setConfirmDeleteNo(null);
  };

  const handleExportExcel = () => {
    const exportData = dataRph.map((item) => ({
      No: item.no,
      'Nama TPH/RPU': item.nama_tph_r_u,
      'Jenis Unit Usaha': item.jenis_unit_usaha,
      Pemilik: item.pemilik,
      'No. Telp': item.no_telp,
      'Status Ijin Usaha': item.status_ijin_usaha,
      'Lokasi RPU/TPH': item.lokasi_rpu,
      'Lokasi Desa/Kecamatan/Alamat Pemilik': item.lokasi_desa_kecamatan_alamat_pemilik,
      'Pemotongan per Hari (ekor)': item.pemotongan_per_hari_ekor,
      'Sertifikat Halal': item.sertifikat_halal,
      'Berkas Halal Terlampir': item.file_sertifikat_halal_name ? 'Ada File' : 'Tidak Ada',
      'Sertifikat NKV': item.sertifikat_nkv,
      'Berkas NKV Terlampir': item.file_sertifikat_nkv_name ? 'Ada File' : 'Tidak Ada',
      'Berkas Izin Usaha': item.file_izin_usaha_name ? 'Ada File' : 'Tidak Ada',
      'Foto Fasilitas': item.file_foto_fasilitas_name ? 'Ada File' : 'Tidak Ada',
      'Rata-rata Produksi per Bulan (kg)': item.rata2_produksi_per_bulan_kg,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data RPH-TPH-TPU');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Data_RPH_TPH_TPU_${today}.xlsx`);
  };

  const countRPU = dataRph.filter((d) => (d.jenis_unit_usaha || '').toUpperCase().includes('RPU')).length;
  const countTPU = dataRph.filter(
    (d) =>
      (d.jenis_unit_usaha || '').toUpperCase().includes('TPU') ||
      (d.jenis_unit_usaha || '').toUpperCase().includes('TPH')
  ).length;
  const countHalal = dataRph.filter(
    (d) =>
      (d.sertifikat_halal || '').toLowerCase().includes('sudah') ||
      (d.sertifikat_halal || '').toLowerCase().includes('ada') ||
      (d.sertifikat_halal || '').toLowerCase().includes('halal') ||
      (d.sertifikat_halal || '').toLowerCase().includes('id33')
  ).length;
  const countNKV = dataRph.filter(
    (d) =>
      (d.sertifikat_nkv || '').toLowerCase().includes('tingkat') ||
      (d.sertifikat_nkv || '').toLowerCase().includes('rph')
  ).length;

  if (loading || !isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-purple-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER (Tema Ungu - Lega & Bernapas) ── */}
      <header className="border-b border-purple-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/kesmavet"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Kesmavet"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/kesmavet" className="text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors truncate">
                  Kesmavet
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-purple-700 whitespace-nowrap">RPH &amp; TPU</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Database Rumah Potong &amp; Tempat Pemotongan Hewan
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              title="Export Excel"
              aria-label="Export Excel"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            {canEdit && (
              <button
                onClick={openAddModal}
                title="Tambah Unit"
                aria-label="Tambah Unit"
                className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl bg-purple-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 hover:bg-purple-700 transition-all shadow-xs cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Tambah Unit</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Total Unit Terdata
            </p>
            <p className="font-sans text-2xl sm:text-3xl font-bold text-slate-900">
              {dataRph.length} <span className="text-xs font-normal text-slate-500">Unit</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Unit RPU & TPU
            </p>
            <p className="font-sans text-2xl sm:text-3xl font-bold text-purple-600">
              {countRPU + countTPU} <span className="text-xs font-normal text-slate-500">Unggas/Hewan</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Sertifikasi Halal
            </p>
            <p className="font-sans text-2xl sm:text-3xl font-bold text-vitality">
              {countHalal} <span className="text-xs font-normal text-slate-500">Tersertifikasi</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Memiliki NKV
            </p>
            <p className="font-sans text-2xl sm:text-3xl font-bold text-lime">
              {countNKV} <span className="text-xs font-normal text-slate-500">Unit</span>
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {['Semua', 'RPU', 'TPU', 'TPH', 'RPH'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedKategori(cat)}
                className={`min-h-touch h-9 px-3.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedKategori === cat
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama usaha, pemilik, lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-touch h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Main Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="p-3.5 w-12 text-center">NO</th>
                  <th className="p-3.5">NAMA UNIT USAHA</th>
                  <th className="p-3.5">JENIS</th>
                  <th className="p-3.5">PEMILIK</th>
                  <th className="p-3.5">KONTAK</th>
                  <th className="p-3.5">LOKASI USAHA</th>
                  <th className="p-3.5 text-center font-sans">KAPASITAS (EKOR/HR)</th>
                  <th className="p-3.5 text-center">STATUS HALAL</th>
                  <th className="p-3.5 text-center">STATUS NKV</th>
                  <th className="p-3.5 text-center">DOKUMEN TERLAMPIR</th>
                  {canEdit && <th className="p-3.5 text-center w-24 sticky right-0 bg-slate-50">AKSI</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    const isHalal =
                      (item.sertifikat_halal || '').toLowerCase().includes('sudah') ||
                      (item.sertifikat_halal || '').toLowerCase().includes('ada') ||
                      (item.sertifikat_halal || '').toLowerCase().includes('halal') ||
                      (item.sertifikat_halal || '').toLowerCase().includes('id33') ||
                      !!item.file_sertifikat_halal;

                    const isNKV =
                      (item.sertifikat_nkv || '').toLowerCase().includes('tingkat') ||
                      (item.sertifikat_nkv || '').toLowerCase().includes('rph') ||
                      (item.sertifikat_nkv || '').toLowerCase().includes('ada') ||
                      !!item.file_sertifikat_nkv;

                    return (
                      <tr key={item.no} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 text-center font-sans font-bold text-slate-600">{item.no}</td>
                        <td className="p-3.5 font-extrabold text-slate-950 text-sm">{item.nama_tph_r_u || '-'}</td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
                            {item.jenis_unit_usaha || '-'}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{item.pemilik || '-'}</td>
                        <td className="p-3.5 font-sans font-bold text-slate-800">{item.no_telp || '-'}</td>
                        <td className="p-3.5 font-semibold text-slate-800 max-w-xs truncate" title={item.lokasi_rpu || item.lokasi_desa_kecamatan_alamat_pemilik}>
                          {item.lokasi_rpu || item.lokasi_desa_kecamatan_alamat_pemilik || '-'}
                        </td>
                        <td className="p-3.5 text-center font-sans font-extrabold text-sm text-purple-700">
                          {item.pemotongan_per_hari_ekor || '-'}
                        </td>
                        <td className="p-3.5 text-center">
                          {isHalal ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Halal
                            </span>
                          ) : (
                            <span className="text-slate-500 font-bold text-xs">Belum</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {isNKV ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                              ✓ NKV
                            </span>
                          ) : (
                            <span className="text-slate-500 font-bold text-xs">Belum</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {item.file_sertifikat_halal && (
                              <button
                                onClick={() => openDocPreview('Sertifikat Halal', item.file_sertifikat_halal!, item.file_sertifikat_halal_name || 'Sertifikat_Halal.pdf')}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 transition-colors shadow-2xs"
                                title="Lihat Berkas Halal"
                              >
                                <FileCheck size={12} className="text-emerald-600" />
                                <span>Halal</span>
                              </button>
                            )}
                            {item.file_sertifikat_nkv && (
                              <button
                                onClick={() => openDocPreview('Sertifikat NKV', item.file_sertifikat_nkv!, item.file_sertifikat_nkv_name || 'Sertifikat_NKV.pdf')}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1 transition-colors shadow-2xs"
                                title="Lihat Berkas NKV"
                              >
                                <ShieldCheck size={12} className="text-blue-600" />
                                <span>NKV</span>
                              </button>
                            )}
                            {item.file_izin_usaha && (
                              <button
                                onClick={() => openDocPreview('Surat Izin Usaha / NIB', item.file_izin_usaha!, item.file_izin_usaha_name || 'Izin_Usaha.pdf')}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 flex items-center gap-1 transition-colors shadow-2xs"
                                title="Lihat Berkas Izin Usaha"
                              >
                                <FileText size={12} className="text-purple-600" />
                                <span>Izin</span>
                              </button>
                            )}
                            {item.file_foto_fasilitas && (
                              <button
                                onClick={() => openDocPreview('Foto Fasilitas Tempat Pemotongan', item.file_foto_fasilitas!, item.file_foto_fasilitas_name || 'Foto_Fasilitas.jpg')}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 transition-colors shadow-2xs"
                                title="Lihat Foto Fasilitas"
                              >
                                <ImageIcon size={12} className="text-amber-600" />
                                <span>Foto</span>
                              </button>
                            )}
                            {!item.file_sertifikat_halal && !item.file_sertifikat_nkv && !item.file_izin_usaha && !item.file_foto_fasilitas && (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </div>
                        </td>
                        {canEdit && (
                          <td className="p-3.5 text-center sticky right-0 bg-white shadow-[-5px_0_10px_rgba(0,0,0,0.03)]">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEditModal(item)}
                                className="min-h-touch h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                                title="Edit Data"
                              >
                                <Edit2 size={12} />
                              </button>
                              {confirmDeleteNo === item.no ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(item.no)}
                                    className="h-7 px-2 rounded-lg bg-red-600 text-white font-bold text-[10px]"
                                  >
                                    Ya
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteNo(null)}
                                    className="h-7 px-2 rounded-lg bg-slate-200 text-slate-700 font-bold text-[10px]"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteNo(item.no)}
                                  className="min-h-touch h-7 w-7 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                                  title="Hapus Data"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={canEdit ? 11 : 10} className="p-12 text-center text-slate-400 font-medium">
                      Pencarian &quot;{searchTerm}&quot; tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ── MODAL TAMBAH / EDIT DENGAN UPLOAD FILE LENGKAP ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {editingNo !== null ? 'Edit Unit Usaha Pemotongan' : 'Tambah Unit Usaha Pemotongan Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi data identitas unit usaha dan lampirkan berkas dokumen persyaratan (PDF / Foto).
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              
              {/* ── SEKSI 1: PROFIL & DATA LAPANGAN ── */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                  <Building2 size={15} className="text-purple-600" />
                  <span>1. Identitas & Profil Unit Usaha</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Unit */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Nama TPH/RPU / Unit Usaha *
                    </label>
                    <input
                      type="text"
                      name="nama_tph_r_u"
                      value={formValues.nama_tph_r_u ?? ''}
                      onChange={handleFieldChange}
                      required
                      placeholder="Contoh: RPU Pangestu / Kios Daging Sejahtera"
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-500 focus:bg-white outline-none"
                    />
                  </div>

                  {/* Jenis Unit Usaha */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Jenis Unit Usaha
                    </label>
                    <select
                      name="jenis_unit_usaha"
                      value={formValues.jenis_unit_usaha ?? 'TPU'}
                      onChange={handleFieldChange}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-500 focus:bg-white outline-none"
                    >
                      <option value="TPU">TPU (Tempat Pemotongan Unggas)</option>
                      <option value="TPH">TPH (Tempat Pemotongan Hewan)</option>
                      <option value="TPH-U">TPH-U (Tempat Penjualan Daging / Unggas)</option>
                      <option value="RPU">RPU (Rumah Potong Unggas)</option>
                      <option value="RPH">RPH (Rumah Potong Hewan Ruminansia)</option>
                    </select>
                  </div>

                  {/* Pemilik */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Nama Pemilik / Pengelola
                    </label>
                    <input
                      type="text"
                      name="pemilik"
                      value={formValues.pemilik ?? ''}
                      onChange={handleFieldChange}
                      placeholder="Nama pemilik unit usaha"
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-500 focus:bg-white outline-none"
                    />
                  </div>

                  {/* Kontak */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      No. Telp / WhatsApp
                    </label>
                    <input
                      type="text"
                      name="no_telp"
                      value={formValues.no_telp ?? ''}
                      onChange={handleFieldChange}
                      placeholder="Contoh: 081234567890"
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-500 focus:bg-white outline-none"
                    />
                  </div>

                  {/* Lokasi Alamat */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Lokasi Desa / Kecamatan / Alamat Lengkap Pemilik
                    </label>
                    <input
                      type="text"
                      name="lokasi_desa_kecamatan_alamat_pemilik"
                      value={formValues.lokasi_desa_kecamatan_alamat_pemilik ?? ''}
                      onChange={handleFieldChange}
                      placeholder="Contoh: Desa Sidomukti, RT 03 RW 01, Kec. Kuwarasan"
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-500 focus:bg-white outline-none"
                    />
                  </div>

                  {/* Lokasi RPU */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Lokasi Spesifik RPU / TPH (Jika Berbeda)
                    </label>
                    <input
                      type="text"
                      name="lokasi_rpu"
                      value={formValues.lokasi_rpu ?? ''}
                      onChange={handleFieldChange}
                      placeholder="Contoh: Pasar Karanganyar / Kompleks RPH Pejagoan"
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-500 focus:bg-white outline-none"
                    />
                  </div>

                  {/* Kapasitas Potong */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Kapasitas Potong per Hari (ekor)
                    </label>
                    <input
                      type="text"
                      name="pemotongan_per_hari_ekor"
                      value={formValues.pemotongan_per_hari_ekor ?? ''}
                      onChange={handleFieldChange}
                      placeholder="Contoh: 50 / 200"
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-500 focus:bg-white outline-none"
                    />
                  </div>

                  {/* Rata-rata Produksi */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Rata-rata Produksi per Bulan (kg)
                    </label>
                    <input
                      type="text"
                      name="rata2_produksi_per_bulan_kg"
                      value={formValues.rata2_produksi_per_bulan_kg ?? ''}
                      onChange={handleFieldChange}
                      placeholder="Contoh: 1500"
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-500 focus:bg-white outline-none"
                    />
                  </div>

                  {/* Status Izin */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Status Ijin Usaha / Legalitas
                    </label>
                    <input
                      type="text"
                      name="status_ijin_usaha"
                      value={formValues.status_ijin_usaha ?? ''}
                      onChange={handleFieldChange}
                      placeholder="Contoh: NIB Terbit / Dalam Proses"
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-500 focus:bg-white outline-none"
                    />
                  </div>

                  {/* Keterangan Halal */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Keterangan Sertifikat Halal
                    </label>
                    <input
                      type="text"
                      name="sertifikat_halal"
                      value={formValues.sertifikat_halal ?? ''}
                      onChange={handleFieldChange}
                      placeholder="Contoh: ID3311000... / Sudah Halal"
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-500 focus:bg-white outline-none"
                    />
                  </div>

                  {/* Keterangan NKV */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Keterangan Sertifikat NKV
                    </label>
                    <input
                      type="text"
                      name="sertifikat_nkv"
                      value={formValues.sertifikat_nkv ?? ''}
                      onChange={handleFieldChange}
                      placeholder="Contoh: NKV Tingkat 2 / RPH-3305... / Belum"
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ── SEKSI 2: UPLOAD BERKAS DOKUMEN PERSYARATAN ── */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                    <Paperclip size={15} className="text-purple-600" />
                    <span>2. Dokumen Persyaratan & Berkas Legalitas (Upload File PDF / Foto)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Maks 15 MB per file</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* UPLOAD 1: SERTIFIKAT HALAL */}
                  <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <FileCheck size={15} />
                        </div>
                        <span className="font-bold text-slate-900 text-xs">Sertifikat Halal (BPJPH/MUI)</span>
                      </div>
                      {formValues.file_sertifikat_halal && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          Terlampir
                        </span>
                      )}
                    </div>

                    {formValues.file_sertifikat_halal ? (
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="min-w-0 flex items-center gap-2">
                          <FileText size={16} className="text-emerald-600 shrink-0" />
                          <span className="text-xs text-slate-800 font-semibold truncate">
                            {formValues.file_sertifikat_halal_name || 'Berkas_Halal.pdf'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openDocPreview('Sertifikat Halal', formValues.file_sertifikat_halal!, formValues.file_sertifikat_halal_name || 'Berkas_Halal.pdf')}
                            className="h-7 px-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Eye size={12} />
                            <span>Lihat</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('file_sertifikat_halal', 'file_sertifikat_halal_name')}
                            className="h-7 w-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-emerald-300 bg-white hover:bg-emerald-50/60 cursor-pointer transition-colors text-center">
                        <UploadCloud size={20} className="text-emerald-600 mb-1" />
                        <span className="text-xs font-bold text-emerald-800">Pilih File Sertifikat Halal</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Format PDF atau Foto Scan (Maks 15MB)</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileUpload(e, 'file_sertifikat_halal', 'file_sertifikat_halal_name')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* UPLOAD 2: SERTIFIKAT NKV */}
                  <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                          <ShieldCheck size={15} />
                        </div>
                        <span className="font-bold text-slate-900 text-xs">Sertifikat NKV Resmi</span>
                      </div>
                      {formValues.file_sertifikat_nkv && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                          Terlampir
                        </span>
                      )}
                    </div>

                    {formValues.file_sertifikat_nkv ? (
                      <div className="p-2.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="min-w-0 flex items-center gap-2">
                          <FileText size={16} className="text-blue-600 shrink-0" />
                          <span className="text-xs text-slate-800 font-semibold truncate">
                            {formValues.file_sertifikat_nkv_name || 'Berkas_NKV.pdf'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openDocPreview('Sertifikat NKV', formValues.file_sertifikat_nkv!, formValues.file_sertifikat_nkv_name || 'Berkas_NKV.pdf')}
                            className="h-7 px-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Eye size={12} />
                            <span>Lihat</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('file_sertifikat_nkv', 'file_sertifikat_nkv_name')}
                            className="h-7 w-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-blue-300 bg-white hover:bg-blue-50/60 cursor-pointer transition-colors text-center">
                        <UploadCloud size={20} className="text-blue-600 mb-1" />
                        <span className="text-xs font-bold text-blue-800">Pilih File Sertifikat NKV</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Format PDF atau Foto Scan (Maks 15MB)</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileUpload(e, 'file_sertifikat_nkv', 'file_sertifikat_nkv_name')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* UPLOAD 3: SURAT IZIN USAHA / NIB */}
                  <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                          <FileText size={15} />
                        </div>
                        <span className="font-bold text-slate-900 text-xs">Surat Izin Usaha / NIB</span>
                      </div>
                      {formValues.file_izin_usaha && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                          Terlampir
                        </span>
                      )}
                    </div>

                    {formValues.file_izin_usaha ? (
                      <div className="p-2.5 rounded-xl bg-white border border-purple-200 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="min-w-0 flex items-center gap-2">
                          <FileText size={16} className="text-purple-600 shrink-0" />
                          <span className="text-xs text-slate-800 font-semibold truncate">
                            {formValues.file_izin_usaha_name || 'Izin_Usaha.pdf'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openDocPreview('Surat Izin Usaha / NIB', formValues.file_izin_usaha!, formValues.file_izin_usaha_name || 'Izin_Usaha.pdf')}
                            className="h-7 px-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Eye size={12} />
                            <span>Lihat</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('file_izin_usaha', 'file_izin_usaha_name')}
                            className="h-7 w-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-purple-300 bg-white hover:bg-purple-50/60 cursor-pointer transition-colors text-center">
                        <UploadCloud size={20} className="text-purple-600 mb-1" />
                        <span className="text-xs font-bold text-purple-800">Pilih File Izin Usaha / NIB</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Format PDF atau Foto Scan (Maks 15MB)</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileUpload(e, 'file_izin_usaha', 'file_izin_usaha_name')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* UPLOAD 4: FOTO FASILITAS / TEMPAT PEMOTONGAN */}
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                          <ImageIcon size={15} />
                        </div>
                        <span className="font-bold text-slate-900 text-xs">Foto Fasilitas Tempat Potong</span>
                      </div>
                      {formValues.file_foto_fasilitas && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                          Terlampir
                        </span>
                      )}
                    </div>

                    {formValues.file_foto_fasilitas ? (
                      <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="min-w-0 flex items-center gap-2">
                          <img
                            src={formValues.file_foto_fasilitas}
                            alt="Preview Fasilitas"
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <span className="text-xs text-slate-800 font-semibold truncate">
                            {formValues.file_foto_fasilitas_name || 'Foto_Fasilitas.jpg'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openDocPreview('Foto Fasilitas Pemotongan', formValues.file_foto_fasilitas!, formValues.file_foto_fasilitas_name || 'Foto_Fasilitas.jpg')}
                            className="h-7 px-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Eye size={12} />
                            <span>Lihat</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('file_foto_fasilitas', 'file_foto_fasilitas_name')}
                            className="h-7 w-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-amber-300 bg-white hover:bg-amber-50/60 cursor-pointer transition-colors text-center">
                        <UploadCloud size={20} className="text-amber-600 mb-1" />
                        <span className="text-xs font-bold text-amber-800">Pilih Foto Dokumentasi Lapangan</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Format Gambar JPG / PNG / WebP (Maks 15MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'file_foto_fasilitas', 'file_foto_fasilitas_name')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                </div>
              </div>

              {/* ── TOMBOL AKSI MODAL ── */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs sm:text-sm font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-touch h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  {editingNo !== null ? 'Simpan Perubahan' : 'Simpan Data Unit Usaha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL PRATINJAU DOKUMEN / PDF / FOTO ── */}
      {previewDoc.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    {previewDoc.title}
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-md">
                    {previewDoc.fileName}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDocPreview}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 min-h-[380px] max-h-[520px] bg-slate-50 rounded-2xl border border-slate-200 p-2 overflow-hidden flex items-center justify-center">
              {previewDoc.url.startsWith('data:application/pdf') || previewDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-full min-h-[460px] rounded-xl border border-slate-200 bg-white"
                  title={previewDoc.title}
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-w-full max-h-[480px] object-contain rounded-xl shadow-xs"
                />
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Dokumen Tersimpan di Database Unit Usaha Kesmavet
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  download={previewDoc.fileName || 'dokumen_pemotongan.pdf'}
                  className="min-h-touch h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download size={14} />
                  <span>Unduh File</span>
                </a>
                <button
                  type="button"
                  onClick={closeDocPreview}
                  className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

