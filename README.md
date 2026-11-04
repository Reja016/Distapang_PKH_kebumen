<div align="center">

# 🌾 SiMantap PKH Kebumen
### **Sistem Informasi Manajemen Terpadu Peternakan & Kesehatan Hewan**
**Dinas Pertanian dan Pangan (Distapang) Kabupaten Kebumen**

[![Website Status](https://img.shields.io/badge/Status-Production%20Live-22c55e?style=for-the-badge&logo=google-chrome&logoColor=white)](https://simantap.cloud)
[![Next.js](https://img.shields.io/badge/Next.js%2014-App%20Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Groq AI](https://img.shields.io/badge/AI-Groq%20Text--to--SQL-f97316?style=for-the-badge&logo=openai&logoColor=white)](https://groq.com/)

<p align="center">
  <b>🌐 Akses Layanan:</b> <a href="https://simantap.cloud">https://simantap.cloud</a>
</p>

---

</div>

## 📌 Tentang SiMantap

**SiMantap PKH** adalah platform digital berbasis web yang dirancang khusus untuk memusatkan, mengintegrasikan, dan mendigitalisasi seluruh rantai data sektor **Peternakan dan Kesehatan Hewan** di lingkungan **Dinas Pertanian dan Pangan (Distapang) Kabupaten Kebumen**.

Platform ini hadir sebagai solusi satu pintu (*one-stop ecosystem*) untuk:
- Menggantikan pelaporan konvensional berbasis kertas menjadi sistem digital terpadu dan terstruktur.
- Membantu petugas dinas, dokter hewan, penyuluh, dan pengambil keputusan dalam memantau populasi ternak, distribusi logistik, riwayat penyakit, hingga rantai pasok pangan hewani secara *real-time*.
- Menyajikan transparansi data harga pangan asal ternak, sebaran kelompok tani, dan informasi layanan masyarakat Kebumen secara terbuka dan interaktif.

---

## ✨ Fitur & Modul Utama

Aplikasi SiMantap terbagi dalam modul operasional sesuai tata kelola bidang di Distapang PKH Kebumen:

### 🥩 1. Bidang Bitpro (Bibit & Produksi Peternakan)
* **Data Populasi Ternak & Unggas:** Pemantauan statistik 8 komoditas ternak dan 8 komoditas unggas per kecamatan (termasuk komoditas unggulan **Sapi PO Kebumen**).
* **Produksi Daging & Telur:** Rekapitulasi target dan realisasi tonase hasil panen peternakan per triwulan dan tahunan.
* **Database & Kegiatan KTT:** Katalog Kelompok Tani Ternak (KTT) binaan se-Kabupaten Kebumen dilengkapi log agenda dan monitoring lapangan (Monev).
* **Data Sebaran Farm:** Pemetaan titik peternakan rakyat dan industri di seluruh kecamatan.
* **SapiTime & Database Inseminasi Buatan (IB):** Pencatatan silsilah, reproduksi, dan jadwal Inseminasi Buatan.
* **SKLB:** Rekap data Surat Keterangan Layak Bibit.

### 🩺 2. Bidang Keswan (Kesehatan Hewan)
* **Data Vaksinasi Penyakit Mulut & Kuku (PMK):** Pemantauan realisasi target APBD, droping vaksin, serta rekapitulasi harian dan bulanan.
* **Lalu Lintas Hewan (Lalin):** Pengawasan arus lalu lintas keluar-masuk hewan ternak lintas daerah untuk mencegah penularan zoonosis.
* **Laporan Penyakit Hewan Terpadu:** Sistem pencatatan insiden kasus kesakitan ternak di lapangan secara berkala.
* **Puskeswan & Puskeswanling:** Direktori profil Pusat Kesehatan Hewan dan jadwal Puskeswan Keliling.
* **Manajemen Stok Gudang:** Kontrol inventaris persediaan obat-obatan, vitamin, dan vaksin medik veteriner.

### 🛡️ 3. Bidang Kesmavet (Kesehatan Masyarakat Veteriner)
* **Pengawasan Hewan Kurban:** Pendataan kelayakan, status kesehatan, dan pemeriksaan ante-mortem/post-mortem saat Idul Adha.
* **Sertifikasi NKV:** Registrasi dan status validitas Nomor Kontrol Veteriner bagi unit usaha produk hewan yang higienis.
* **RPH, TPH & TPU:** Pengawasan Rumah Pemotongan Hewan, Tempat Pemotongan Hewan, dan Tempat Pemotongan Unggas.
* **Pasar Hewan & Pakan Ternak:** Pemantauan aktivitas perdagangan ternak di pasar hewan serta ketersediaan pakan.

### 🚗 4. Manajemen Aset & Inventaris
* Pencatatan inventaris kendaraan dinas operasional lapangan, riwayat pajak, dan kondisi kendaraan petugas PKH.

### 🤖 5. Asisten Cerdas SiMantap AI (Text-to-SQL)
* **Natural Language Data Query:** Pengguna atau pimpinan dapat menanyakan informasi data peternakan dalam bahasa Indonesia sehari-hari (*"Berapa populasi sapi di Kebumen?"*, *"Daftar puskeswan aktif"*).
* Didukung teknologi **Groq LLM** ultra-cepat yang mengubah pertanyaan menjadi query SQL aman secara instan dan membacanya langsung dari database.
* **Failover Multi-Key:** Mekanisme anti-*rate-limit* cerdas yang otomatis beralih ke kunci cadangan jika terjadi lonjakan trafik.

### 🔐 6. Tata Kelola & Keamanan Administrator
* **Role-Based Access Control (RBAC):** Pemisahan hak akses admin dinas, operator bidang, hingga tamu.
* **Pusat Koreksi Data:** Alur persetujuan (*review & approval*) pengajuan revisi data dari lapangan sebelum disimpan permanen ke database.
* **Audit Trail / Logs:** Pencatatan setiap aktivitas penambahan, pengubahan, dan penghapusan data untuk akuntabilitas.
* **Backup & Restore Database:** Fitur pencadangan instan basis data langsung dari antarmuka web.
* **Proteksi Keamanan:** Dilengkapi Cloudflare Turnstile anti-bot dan session idle timeout.

---

## 🛠️ Arsitektur & Teknologi

| Lapisan | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 14](https://nextjs.org/) (App Router) | Server-Side Rendering (SSR) & Client Component modern |
| **Bahasa Pemrograman** | [TypeScript](https://www.typescriptlang.org/) | *Type-safety* ketat untuk keandalan data lintas modul |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/) | Tampilan responsif, bersih, mendukung **Light / Dark Mode** |
| **Visual 3D & Grafis** | [Spline React](https://spline.design/) | Elemen interaktif visual modern di halaman beranda |
| **Backend & Routing** | Next.js API Routes (Serverless Handlers) | *Restful endpoints* terstruktur di folder `app/api/` |
| **Basis Data** | [MySQL](https://www.mysql.com/) via `mysql2` | Relasional database dengan manajemen koneksi pool |
| **Kecerdasan Buatan (AI)** | [Groq SDK](https://groq.com/) / [Google GenAI](https://ai.google.dev/) | Asisten data Text-to-SQL berkecepatan tinggi |
| **Pengolahan Berkas** | `xlsx` (SheetJS) & `jszip` | Ekspor-impor data Excel rekapitulasi lapangan |
| **Notifikasi** | Web Push API | Pengiriman peringatan dan pengumuman kepada petugas |
| **Deployment Server** | Node.js 22 + PM2 + LiteSpeed (cPanel) | Pengelolaan proses produksi dengan monitoring otomatis |

---

## 👥 Tim Pengembang & Kontribusi

Sistem ini dirancang dan dikembangkan sebagai wujud komitmen modernisasi data pertanian dan peternakan di Kabupaten Kebumen:

* **Instansi:** Dinas Pertanian dan Pangan (Distapang) Kabupaten Kebumen — Bidang Peternakan dan Kesehatan Hewan (PKH)
* **Lead Developer / Author:** [Reza (Reja016)](https://github.com/Reja016) & Tim Magang Distapang PKH Kebumen
* **Proyek:** RDN Project

---

## 📄 Lisensi & Hak Cipta

Hak Cipta © 2025–2026 **Dinas Pertanian dan Pangan Kabupaten Kebumen**.  
Seluruh hak cipta dilindungi undang-undang. Sistem dikembangkan untuk keperluan kedinasan dan pelayanan masyarakat Kabupaten Kebumen.

<div align="center">
  <sub>Mewujudkan peternakan Kebumen yang maju, mandiri, dan berdaya saing melalui tata kelola data yang presisi. 🐄🌾</sub>
</div>
