# PANDUAN STANDAR OPERASIONAL PROSEDUR (SOP)
## PEMELIHARAAN & PEMBARUAN SISTEM SiMantap PKH KEBUMEN
**Domain Produksi:** [https://simantap.cloud](https://simantap.cloud)  
**Teknologi:** Next.js 14 (App Router) + MySQL + PM2 + cPanel (LiteSpeed)  
**Repositori GitHub:** `https://github.com/Reja016/Distapang_PKH_kebumen.git`

---

## DAFTAR ISI
1. [SOP 1: Alur Pembaruan Fitur (Update Kode & Deployment)](#sop-1-alur-pembaruan-fitur-update-kode--deployment)
2. [SOP 2: Manajemen & Backup Database MySQL](#sop-2-manajemen--backup-database-mysql)
3. [SOP 3: Perintah Darurat & Manajemen PM2 di Server](#sop-3-perintah-darurat--manajemen-pm2-di-server)
4. [SOP 4: Konfigurasi Environment Variable (.env)](#sop-4-konfigurasi-environment-variable-env)
5. [SOP 5: Troubleshooting & Solusi Masalah Umum](#sop-5-troubleshooting--solusi-masalah-umum)

---

## SOP 1: Alur Pembaruan Fitur (Update Kode & Deployment)

Lakukan prosedur ini setiap kali ada revisi, penambahan fitur, atau perbaikan bug pada website.

### Tahap 1: Di Laptop / Komputer Lokal
1. **Pengembangan & Uji Coba Lokal:**
   - Jalankan `npm run dev` dan pastikan fitur bekerja dengan sempurna di `localhost:3000`.
2. **Build Verifikasi Lokal:**
   - Buka terminal laptop, jalankan:
     ```bash
     npm run build
     ```
   - Pastikan proses build selesai tanpa error (menghasilkan folder `.next`).
3. **Kirim Perubahan ke GitHub:**
   - Jalankan perintah git:
     ```bash
     git add .
     git commit -m "Update fitur: [tuliskan fitur yang diubah]"
     git push origin main
     ```
4. **Kompres Folder Hasil Build:**
   - Buka File Explorer di laptop pada folder project `Distapang_PKH`.
   - Klik kanan folder **`.next`** -> pilih **Compress to ZIP file** (beri nama `.next.zip`).

---

### Tahap 2: Di Server Hosting (cPanel Anymhost)
1. **Tarik Kode Terbaru dari GitHub:**
   - Buka **Terminal cPanel**, ketik:
     ```bash
     cd ~/Distapang_PKH_kebumen
     git pull origin main
     ```
2. **Upload & Ekstrak Folder `.next.zip`:**
   - Buka **File Manager** cPanel -> masuk ke folder `Distapang_PKH_kebumen`.
   - Klik **Upload** di menu atas -> unggah file `.next.zip` terbaru dari laptop.
   - Setelah selesai, klik kanan file `.next.zip` -> pilih **Extract** (timpa file lama).
3. **Restart Aplikasi PM2:**
   - Kembali ke **Terminal cPanel**, jalankan perintah restart:
     ```bash
     pm2 restart simantap
     ```
4. **Verifikasi Online:**
   - Buka [https://simantap.cloud](https://simantap.cloud) di browser (gunakan mode Incognito/Ctrl+F5) untuk memastikan pembaruan sudah aktif.

---

## SOP 2: Manajemen & Backup Database MySQL

Untuk mencegah kehilangan data penting dinas, lakukan pencadangan data secara berkala.

### Cara 1: Backup Otomatis dari Menu Admin SiMantap (Paling Cepat)
1. Login ke aplikasi sebagai **Super Admin / Tim IT**.
2. Masuk ke menu **Manajemen Akun / Pengaturan**.
3. Klik tombol **Backup Database (.sql)**.
4. Simpan file `.sql` yang terunduh ke Google Drive atau penyimpanan aman.

### Cara 2: Backup Manual Lewat cPanel phpMyAdmin
1. Login ke **cPanel** -> buka menu **phpMyAdmin**.
2. Klik nama database di sebelah kiri (`uwjrkoit_distapang_pkh`).
3. Klik tab **Export** di bagian atas -> pilih metode **Quick** -> klik **Export / Go**.
4. File `.sql` cadangan akan otomatis terunduh ke laptop Anda.

### Cara Restore (Memulihkan) Database Jika Terjadi Kerusakan:
1. Buka **phpMyAdmin** -> klik nama database Anda.
2. Klik tab **Import** di bagian atas.
3. Klik **Choose File** -> pilih file `.sql` cadangan terakhir Anda.
4. Scroll ke bawah dan klik tombol **Import / Kirim**.

---

## SOP 3: Perintah Darurat & Manajemen PM2 di Server

Semua perintah ini dijalankan melalui **Terminal cPanel**:

| Tujuan | Perintah Terminal |
| :--- | :--- |
| **Cek Status Aplikasi** | `pm2 status` |
| **Lihat Log Error Real-time** | `pm2 logs --lines 50` |
| **Restart Aplikasi** | `pm2 restart simantap` |
| **Hentikan Aplikasi** | `pm2 stop simantap` |
| **Jalankan Aplikasi Baru** | `pm2 start npm --name "simantap" -- start -- -p 41234` |
| **Simpan Konfigurasi PM2** | `pm2 save` |
| **Restart dengan Muat Ulang .env**| `pm2 restart all --update-env` |

---

## SOP 4: Konfigurasi Environment Variable (.env)

Lokasi file: `~/Distapang_PKH_kebumen/.env`

Isi standar konfigurasi produksi:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=uwjrkoit_pkh_admin
DB_PASSWORD=[PASSWORD_DATABASE_ANDA]
DB_NAME=uwjrkoit_distapang_pkh

NEXT_PUBLIC_APP_NAME="SiMantap PKH Kebumen"
```

> **PENTING:** Jika Anda mengubah isi file `.env` di terminal (menggunakan `nano .env`), pastikan untuk menjalankan perintah:
> ```bash
> pm2 restart all --update-env
> ```
> agar Node.js membaca password/database yang baru.

---

## SOP 5: Troubleshooting & Solusi Masalah Umum

### 1. Website Menampilkan Error 502 Bad Gateway / Halaman Putih
* **Penyebab:** Proses PM2 di server terhenti atau restart server.
* **Solusi:**
  1. Buka Terminal cPanel -> ketik `pm2 status`.
  2. Jika statusnya `errored` atau `stopped`, ketik:
     ```bash
     pm2 restart simantap
     ```
  3. Cek pesan errornya dengan: `pm2 logs --lines 30`.

### 2. Website Menampilkan "Access Denied" / Data Tidak Muncul
* **Penyebab:** Izin hak akses user database di cPanel terlepas.
* **Solusi:**
  1. Buka cPanel -> **MySQL Databases**.
  2. Pada bagian **Add User To Database**, pilih User `uwjrkoit_pkh_admin` dan Database `uwjrkoit_distapang_pkh` -> klik **Add**.
  3. Centang **ALL PRIVILEGES** -> klik **Make Changes**.

### 3. File `.htaccess` di Folder `public_html` Terhapus
* **Penyebab:** Konfigurasi proxy terhapus atau tertimpa.
* **Solusi:**
  1. Buka File Manager -> `public_html` -> edit file `.htaccess`.
  2. Pastikan baris proxy berikut berada di paling atas:
     ```apache
     RewriteEngine On
     RewriteBase /
     RewriteRule ^(.*)$ http://127.0.0.1:41234/$1 [P,L]
     RequestHeader set X-Forwarded-Proto "https"
     ```
  3. Simpan perubahan.

---

*Dokumen SOP ini dibuat untuk mempermudah tim teknis/magang Distapang PKH Kebumen dalam mengelola dan menjaga keandalan sistem SiMantap.*
