import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

function formatAnimalName(name: string) {
  if (!name) return '-';
  return name
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function GET() {
  try {
    // 1. QUERY POPULASI MURNI DARI DATABASE MYSQL (Triwulan Terakhir 2025)
    let populasi16: { komoditas: string; total: number }[] = [];
    let populasiTernak8: { komoditas: string; total: number }[] = [];
    let populasiUnggas8: { komoditas: string; total: number }[] = [];

    const [popRows]: any = await pool.query(`
      SELECT 
        COALESCE(SUM(total_sapi_potong), 0) AS sapi_potong,
        COALESCE(SUM(total_sapi_perah), 0) AS sapi_perah,
        COALESCE(SUM(total_kerbau), 0) AS kerbau,
        COALESCE(SUM(total_kuda), 0) AS kuda,
        COALESCE(SUM(total_kambing), 0) AS kambing,
        COALESCE(SUM(total_domba), 0) AS domba,
        COALESCE(SUM(total_babi), 0) AS babi,
        COALESCE(SUM(ayam_kampung), 0) AS ayam_kampung,
        COALESCE(SUM(ayam_petelur), 0) AS ayam_petelur,
        COALESCE(SUM(ayam_broiller), 0) AS ayam_broiler,
        COALESCE(SUM(puyuh), 0) AS puyuh,
        COALESCE(SUM(itik), 0) AS itik,
        COALESCE(SUM(entog), 0) AS entog,
        COALESCE(SUM(angsa), 0) AS angsa,
        COALESCE(SUM(merpati), 0) AS merpati,
        COALESCE(SUM(kelinci), 0) AS kelinci
      FROM populasi 
      WHERE tahun = 2025 
        AND triwulan = (SELECT COALESCE(MAX(triwulan), 4) FROM populasi WHERE tahun = 2025)
    `);

    if (popRows && popRows.length > 0) {
      const p = popRows[0];
      populasi16 = [
        { komoditas: 'Sapi Potong', total: Number(p.sapi_potong) || 0 },
        { komoditas: 'Sapi Perah', total: Number(p.sapi_perah) || 0 },
        { komoditas: 'Kerbau', total: Number(p.kerbau) || 0 },
        { komoditas: 'Kuda', total: Number(p.kuda) || 0 },
        { komoditas: 'Kambing', total: Number(p.kambing) || 0 },
        { komoditas: 'Domba', total: Number(p.domba) || 0 },
        { komoditas: 'Babi', total: Number(p.babi) || 0 },
        { komoditas: 'Ayam Kampung', total: Number(p.ayam_kampung) || 0 },
        { komoditas: 'Ayam Petelur', total: Number(p.ayam_petelur) || 0 },
        { komoditas: 'Ayam Broiler', total: Number(p.ayam_broiler) || 0 },
        { komoditas: 'Puyuh', total: Number(p.puyuh) || 0 },
        { komoditas: 'Itik', total: Number(p.itik) || 0 },
        { komoditas: 'Entog', total: Number(p.entog) || 0 },
        { komoditas: 'Angsa', total: Number(p.angsa) || 0 },
        { komoditas: 'Merpati', total: Number(p.merpati) || 0 },
        { komoditas: 'Kelinci', total: Number(p.kelinci) || 0 },
      ];

      populasiTernak8 = [
        { komoditas: 'Kambing', total: Number(p.kambing) || 0 },
        { komoditas: 'Sapi Potong', total: Number(p.sapi_potong) || 0 },
        { komoditas: 'Domba', total: Number(p.domba) || 0 },
        { komoditas: 'Kelinci', total: Number(p.kelinci) || 0 },
        { komoditas: 'Babi', total: Number(p.babi) || 0 },
        { komoditas: 'Kuda', total: Number(p.kuda) || 0 },
        { komoditas: 'Kerbau', total: Number(p.kerbau) || 0 },
        { komoditas: 'Sapi Perah', total: Number(p.sapi_perah) || 0 },
      ].sort((a, b) => b.total - a.total);

      populasiUnggas8 = [
        { komoditas: 'Ayam Broiler', total: Number(p.ayam_broiler) || 0 },
        { komoditas: 'Ayam Kampung', total: Number(p.ayam_kampung) || 0 },
        { komoditas: 'Itik', total: Number(p.itik) || 0 },
        { komoditas: 'Entog', total: Number(p.entog) || 0 },
        { komoditas: 'Ayam Petelur', total: Number(p.ayam_petelur) || 0 },
        { komoditas: 'Puyuh', total: Number(p.puyuh) || 0 },
        { komoditas: 'Merpati', total: Number(p.merpati) || 0 },
        { komoditas: 'Angsa', total: Number(p.angsa) || 0 },
      ].sort((a, b) => b.total - a.total);
    }

    // 2. QUERY PRODUKSI DAGING & TELUR (tabel produksi)
    let dataDaging: { jenis: string; total: number }[] = [];
    let dataTelur: { jenis: string; total: number }[] = [];

    const [prodRows]: any = await pool.query(`
      SELECT 
        jenis,
        hewan,
        ROUND(SUM(total), 2) AS total
      FROM produksi
      GROUP BY jenis, hewan
      ORDER BY total DESC
    `);

    if (prodRows && prodRows.length > 0) {
      prodRows.forEach((r: any) => {
        const item = {
          jenis: formatAnimalName(r.hewan || r.jenis),
          total: Number(r.total) || 0,
        };
        const rawJenis = String(r.jenis || '').toLowerCase();
        const rawHewan = String(r.hewan || '').toLowerCase();

        if (rawJenis.includes('telur') || rawHewan.includes('telur')) {
          dataTelur.push(item);
        } else {
          dataDaging.push(item);
        }
      });
    }

    // 3. QUERY SEBARAN KTT / FARM (tabel ktt_master)
    let sebaranFarm: { komoditas: string; jumlah_farm: number; total_populasi: string }[] = [];
    const [kttRows]: any = await pool.query(`
      SELECT 
        jenis_kelompok,
        COUNT(*) AS total_kelompok,
        SUM(anggota_laki + anggota_perempuan) AS total_anggota
      FROM ktt_master
      GROUP BY jenis_kelompok
      ORDER BY total_kelompok DESC
    `);

    if (kttRows && kttRows.length > 0) {
      sebaranFarm = kttRows.map((k: any) => ({
        komoditas: k.jenis_kelompok || 'Kelompok Tani Ternak',
        jumlah_farm: Number(k.total_kelompok) || 0,
        total_populasi: `${(Number(k.total_anggota) || 0).toLocaleString('id-ID')} Anggota`,
      }));
    }

    // 4. QUERY PUSKESWAN (tabel puskeswan_profil)
    let puskeswanList: any[] = [];
    const [puskRows]: any = await pool.query('SELECT * FROM puskeswan_profil ORDER BY id ASC');
    if (puskRows && puskRows.length > 0) {
      puskeswanList = puskRows.map((p: any, i: number) => {
        let parsedLayanan = ['Pelayanan Klinik', 'Pusling', 'IB & PKB', 'Vaksinasi PMK'];
        if (p.layanan) {
          try {
            parsedLayanan = typeof p.layanan === 'string' ? JSON.parse(p.layanan) : p.layanan;
          } catch (e) {
            // fallback
          }
        }

        return {
          no: i + 1,
          nama: p.nama,
          wilayah: p.wilayah_binaan || 'Kabupaten Kebumen',
          kecamatan: typeof p.wilayah_binaan === 'string'
            ? p.wilayah_binaan.split(',').map((k: string) => k.replace(/Kecamatan\s*/i, '').replace(/Kec\.?\s*/i, '').trim())
            : ['Kebumen'],
          koordinator: p.dokter_hewan || 'drh. Medik Terpadu',
          status: 'Aktif Melayani',
          alamat: p.alamat || 'Dinas Pertanian dan Pangan Kebumen',
          mapUrl: p.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.nama + ' Kebumen')}`,
          layanan: Array.isArray(parsedLayanan) ? parsedLayanan : ['Pelayanan Pasif', 'Pusling', 'IB & PKB'],
        };
      });
    }

    // 5. QUERY VAKSINASI (tabel vaksinasi_bulanan & vaksin_apbd_target)
    let vaksinasiList: any[] = [];
    const [vakRows]: any = await pool.query(`
      SELECT
        puskeswan,
        target,
        pengambilan AS realisasi,
        ROUND((pengambilan / NULLIF(target, 0)) * 100, 1) AS persen
      FROM vaksinasi_bulanan
      ORDER BY no_urut ASC, id ASC
    `);

    if (vakRows && vakRows.length > 0) {
      vaksinasiList = vakRows.map((r: any) => ({
        desa: r.puskeswan.startsWith('PUSKESWAN') ? r.puskeswan : `PUSKESWAN ${r.puskeswan}`,
        jenis: 'Vaksinasi PMK & LSD',
        target: Number(r.target) || 0,
        realisasi: Number(r.realisasi) || 0,
        persen: Number(r.persen) || 0,
        total: Number(r.realisasi) || 0,
      }));
    }

    // 6. QUERY RPH / TPU / TPH (tabel pemotongan_hewan)
    let rphList: any[] = [];
    const [rphRows]: any = await pool.query('SELECT * FROM pemotongan_hewan ORDER BY id ASC LIMIT 50');
    if (rphRows && rphRows.length > 0) {
      rphList = rphRows.map((r: any) => ({
        nama: r.nama_usaha || 'Unit Usaha Pemotongan',
        jenis: r.jenis || 'TPU',
        pemilik: r.pemilik || '-',
        desa: r.lokasi || r.alamat_pemilik || 'Kabupaten Kebumen',
        halal: r.sertifikat_halal ? 'Sudah Ada' : 'Belum Ada',
      }));
    }

    // 7. QUERY NKV (tabel pembinaan_nkv)
    let nkvList: any[] = [];
    const [nkvRows]: any = await pool.query('SELECT * FROM pembinaan_nkv ORDER BY id_pembinaan ASC');
    if (nkvRows && nkvRows.length > 0) {
      nkvList = nkvRows.map((n: any) => ({
        nama_pt: n.nama_usaha,
        jenis_usaha: n.jenis_usaha || 'Usaha Peternakan',
        alamat: n.keterangan || 'Kabupaten Kebumen',
        status_nkv: n.pengeluaran_rekomendasi ? 'Terbit Rekomendasi' : 'Proses Pembinaan',
      }));
    }

    // 8. QUERY POPULASI SAPI PO (tabel bitpro_sklb_populasi_sapi_po)
    let totalSapiPo = 0;
    try {
      const [sapiPoRows]: any = await pool.query(
        `SELECT COALESCE(SUM(populasi), 0) AS total FROM bitpro_sklb_populasi_sapi_po WHERE tahun = 2025`
      );
      if (sapiPoRows && sapiPoRows.length > 0 && Number(sapiPoRows[0].total) > 0) {
        totalSapiPo = Number(sapiPoRows[0].total) || 0;
      } else {
        const [sapiPoAny]: any = await pool.query(
          `SELECT COALESCE(SUM(populasi), 0) AS total FROM bitpro_sklb_populasi_sapi_po`
        );
        if (sapiPoAny && sapiPoAny.length > 0) {
          totalSapiPo = Number(sapiPoAny[0].total) || 0;
        }
      }
    } catch (e) {
      console.warn('Query Sapi PO warning:', e);
    }

    return NextResponse.json({
      success: true,
      data: {
        populasi16,
        populasiTernak8,
        populasiUnggas8,
        dataDaging,
        dataTelur,
        sebaranFarm,
        totalSapiPo,
        puskeswanList,
        vaksinasiList,
        rphList,
        nkvList,
      },
    });
  } catch (error: any) {
    console.error('Error GET portal-stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
