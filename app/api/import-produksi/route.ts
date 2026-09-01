import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

const dataDaging = [
  { jenis: 'Sapi Potong', jan: 119665.7, feb: 118287.1, mar: 205692.6, apr: 153304.4, mei: 114151.1, jun: 1194451, jul: 119665.7, agt: 128489, sep: 124904.5, okt: 129867.6, nov: 124904.5, des: 138415.2, total: 2671799 },
  { jenis: 'Sapi Perah', jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agt: 0, sep: 0, okt: 0, nov: 0, des: 0, total: 0 },
  { jenis: 'Kerbau Potong', jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 1408.432, jul: 0, agt: 0, sep: 0, okt: 0, nov: 0, des: 0, total: 1408.432 },
  { jenis: 'Kuda', jan: 0, feb: 0, mar: 147.5631, apr: 147.5631, mei: 0, jun: 0, jul: 0, agt: 147.5631, sep: 295.1263, okt: 0, nov: 295.1263, des: 0, total: 1032.942 },
  { jenis: 'Kambing Potong', jan: 5172.347, feb: 4841.558, mar: 5232.491, apr: 5142.275, mei: 5352.778, jun: 419471.3, jul: 5262.563, agt: 5172.347, sep: 4991.916, okt: 5172.347, nov: 5021.988, des: 5232.491, total: 476066.4 },
  { jenis: 'Domba', jan: 658.2292, feb: 658.2292, mar: 658.2292, apr: 658.2292, mei: 658.2292, jun: 27791.9, jul: 658.2292, agt: 658.2292, sep: 658.2292, okt: 658.2292, nov: 658.2292, des: 658.2292, total: 35032.42 },
  { jenis: 'Babi', jan: 743.4926, feb: 400.3422, mar: 514.7257, apr: 457.5339, mei: 400.3422, jun: 400.3422, jul: 514.7257, agt: 285.9587, sep: 514.7257, okt: 457.5339, nov: 571.9174, des: 686.3009, total: 5947.941 },
  { jenis: 'Ayam Ras Petelur Produktif', jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agt: 0, sep: 0, okt: 0, nov: 0, des: 0, total: 0 },
  { jenis: 'Ayam Ras Pedaging', jan: 1105410, feb: 986392, mar: 974854, apr: 974448, mei: 976976, jun: 890107, jul: 971289, agt: 733228, sep: 761197, okt: 930689, nov: 970156, des: 944109, total: 11218855 },
  { jenis: 'Ayam Buras', jan: 66774, feb: 60312, mar: 66774, apr: 64620, mei: 66774, jun: 64620, jul: 66154, agt: 66154, sep: 64020, okt: 65038, nov: 62940, des: 65038, total: 779218 },
  { jenis: 'Itik', jan: 6169, feb: 5592, mar: 6169, apr: 6030, mei: 6231, jun: 6030, jul: 5580, agt: 5580, sep: 5400, okt: 5084, nov: 4920, des: 5084, total: 67869 },
  { jenis: 'Kelinci', jan: 30, feb: 30, mar: 30, apr: 30, mei: 30, jun: 30, jul: 30, agt: 30, sep: 30, okt: 30, nov: 30, des: 30, total: 360 },
  { jenis: 'Burung Puyuh', jan: 209.25, feb: 189, mar: 209.25, apr: 202.5, mei: 209.25, jun: 202.5, jul: 131.75, agt: 131.75, sep: 127.5, okt: 147.25, nov: 142.5, des: 147.25, total: 2049.75 },
  { jenis: 'Angsa', jan: 62, feb: 56, mar: 62, apr: 60, mei: 62, jun: 60, jul: 62, agt: 62, sep: 60, okt: 62, nov: 60, des: 62, total: 730 },
  { jenis: 'Entog', jan: 1426, feb: 1288, mar: 1426, apr: 1380, mei: 1426, jun: 1380, jul: 1364, agt: 1364, sep: 1320, okt: 1550, nov: 1500, des: 1550, total: 16974 },
  { jenis: 'Merpati', jan: 148.8, feb: 134.4, mar: 148.8, apr: 144, mei: 148.8, jun: 144, jul: 139.5, agt: 139.5, sep: 135, okt: 139.5, nov: 135, des: 139.5, total: 1696.8 },
];

const dataTelur = [
  { jenis: 'Ayam Ras Petelur Produktif', jan: 58591, feb: 52921, mar: 58591, apr: 57047, mei: 58949, jun: 57047, jul: 47990, agt: 47990, sep: 46442, okt: 52613, nov: 50916, des: 52613, total: 641709.53 },
  { jenis: 'Ayam Buras', jan: 204648, feb: 184843, mar: 204648, apr: 198046, mei: 204648, jun: 198046, jul: 203152, agt: 203152, sep: 196599, okt: 199302, nov: 192873, des: 199302, total: 2389258.2 },
  { jenis: 'Itik', jan: 70092, feb: 63309, mar: 70092, apr: 68703, mei: 70993, jun: 68703, jul: 61446, agt: 63494, sep: 61446, okt: 63492, nov: 61444, des: 63492, total: 786706.0 },
  { jenis: 'Burung Puyuh', jan: 12579, feb: 11362, mar: 12579, apr: 12174, mei: 12579, jun: 12174, jul: 7602, agt: 7602, sep: 7357, okt: 8714, nov: 8433, des: 8714, total: 121869 },
  { jenis: 'Entog', jan: 58093, feb: 52471, mar: 58093, apr: 56271, mei: 58147, jun: 56271, jul: 58147, agt: 58147, sep: 56271, okt: 59044, nov: 57139, des: 59044, total: 687138.55 },
];

export async function GET() {
  try {
    // 1. Buat tabel produksi
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produksi_2025 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kategori VARCHAR(50),
        jenis VARCHAR(100),
        jan DECIMAL(15,4), feb DECIMAL(15,4), mar DECIMAL(15,4),
        apr DECIMAL(15,4), mei DECIMAL(15,4), jun DECIMAL(15,4),
        jul DECIMAL(15,4), agt DECIMAL(15,4), sep DECIMAL(15,4),
        okt DECIMAL(15,4), nov DECIMAL(15,4), des DECIMAL(15,4),
        total DECIMAL(15,4)
      )
    `);

    // 2. Bersihkan tabel lama
    await pool.query('TRUNCATE TABLE produksi_2025');

    // 3. Masukkan Data Daging
    for (const row of dataDaging) {
      await pool.query(
        'INSERT INTO produksi_2025 (kategori, jenis, jan, feb, mar, apr, mei, jun, jul, agt, sep, okt, nov, des, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['Daging', row.jenis, row.jan, row.feb, row.mar, row.apr, row.mei, row.jun, row.jul, row.agt, row.sep, row.okt, row.nov, row.des, row.total]
      );
    }

    // 4. Masukkan Data Telur
    for (const row of dataTelur) {
      await pool.query(
        'INSERT INTO produksi_2025 (kategori, jenis, jan, feb, mar, apr, mei, jun, jul, agt, sep, okt, nov, des, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['Telur', row.jenis, row.jan, row.feb, row.mar, row.apr, row.mei, row.jun, row.jul, row.agt, row.sep, row.okt, row.nov, row.des, row.total]
      );
    }

    return NextResponse.json({
      status: 'Super Sukses! 🎯',
      pesan: `Tabel produksi siap! Daging: ${dataDaging.length} baris, Telur: ${dataTelur.length} baris.`
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'Gagal', error: 'Cek terminal' }, { status: 500 });
  }
}