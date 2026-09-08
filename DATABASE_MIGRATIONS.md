# CATATAN MEMORI & MIGRATION LOG SISTEM SiMantap PKH
**Status Produksi:** LIVE di [https://simantap.cloud](https://simantap.cloud)  
**Database Server:** MySQL cPanel (`uwjrkoit_distapang_pkh`)  
**Port Aplikasi PM2:** `41234`  
**Git Repository:** `https://github.com/Reja016/Distapang_PKH_kebumen.git`

---

## ⚠️ ATURAN EMAS PERUBAHAN DATABASE (DATABASE MIGRATION RULE)

Setiap kali asisten AI / pengembang membuat fitur baru atau mengubah struktur database:
1. **DILARANG MERESET/DROP DATABASE PRODUKSI.**
2. **WAJIB MEMBERIKAN QUERY SQL KHUSUS (`ALTER TABLE` / `CREATE TABLE`)** yang siap disalin oleh pengguna ke tab **SQL phpMyAdmin cPanel**.
3. **Catat riwayat query pembaruan di tabel riwayat di bawah ini.**

---

## RIWAYAT PERUBAHAN SKEMA DATABASE (DATABASE MIGRATION LOG)

| Tanggal | Fitur / Kebutuhan | Query SQL untuk cPanel (phpMyAdmin) | Status |
| :--- | :--- | :--- | :--- |
| **08-09-2026** | Inisialisasi Database Produksi Awal | Import awal via `database_simantap.sql` | ✅ Selesai (Live) |
| **08-09-2026** | Pembaruan Wilayah Pelayanan 8 Puskeswan | ```sql<br>UPDATE puskeswan_profil SET wilayah_binaan = 'Kecamatan Padureso, Kecamatan Prembun, Kecamatan Kutowinangun' WHERE nama LIKE '%Prembun%';<br>UPDATE puskeswan_profil SET wilayah_binaan = 'Kecamatan Mirit, Kecamatan Ambal, Kecamatan Bonorowo' WHERE nama LIKE '%Mirit%';<br>UPDATE puskeswan_profil SET wilayah_binaan = 'Kecamatan Kebumen, Kecamatan Poncowarno, Kecamatan Buluspesantren' WHERE nama LIKE '%Kebumen%';<br>UPDATE puskeswan_profil SET wilayah_binaan = 'Kecamatan Alian, Kecamatan Sadang, Kecamatan Karangsambung' WHERE nama LIKE '%Alian%';<br>UPDATE puskeswan_profil SET wilayah_binaan = 'Kecamatan Klirong, Kecamatan Petanahan, Kecamatan Adimulyo' WHERE nama LIKE '%Klirong%';<br>UPDATE puskeswan_profil SET wilayah_binaan = 'Kecamatan Pejagoan, Kecamatan Karanganyar, Kecamatan Karanggayam, Kecamatan Sruweng' WHERE nama LIKE '%Karanganyar%';<br>UPDATE puskeswan_profil SET wilayah_binaan = 'Kecamatan Puring, Kecamatan Gombong, Kecamatan Sempor, Kecamatan Kuwarasan' WHERE nama LIKE '%Gombong%';<br>UPDATE puskeswan_profil SET wilayah_binaan = 'Kecamatan Buayan, Kecamatan Ayah, Kecamatan Rowokele' WHERE nama LIKE '%Buayan%';<br>``` | ⚡ Siap Eksekusi di phpMyAdmin |

---

*Setiap ada penambahan tabel atau kolom baru di masa depan, query penyesuaian akan otomatis dicatat di sini dan diberikan langsung di ruang chat.*
