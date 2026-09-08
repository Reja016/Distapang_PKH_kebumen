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

---

*Setiap ada penambahan tabel atau kolom baru di masa depan, query penyesuaian akan otomatis dicatat di sini dan diberikan langsung di ruang chat.*
