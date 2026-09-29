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
    // 1. QUERY POPULASI (Adaptif: Mendukung Skema Ternormalisasi maupun Skema Kolom Lebar)
    let populasi16: { komoditas: string; total: number }[] = [];
    let populasiTernak8: { komoditas: string; total: number }[] = [];
    let populasiUnggas8: { komoditas: string; total: number }[] = [];

    try {
      let popMap: Record<string, number> = {};

      // Strategi 1: Coba Skema Ternormalisasi (id_hewan + JOIN tabel hewan)
      try {
        const [normRows]: any = await pool.query(`
          SELECT 
            LOWER(TRIM(REPLACE(h.jenis_hewan, ' ', '_'))) as k,
            SUM(p.total) as total
          FROM populasi p
          JOIN hewan h ON p.id_hewan = h.id_hewan
          WHERE p.tahun = (SELECT COALESCE(MAX(tahun), 2025) FROM populasi)
            AND p.triwulan = (SELECT COALESCE(MAX(triwulan), 4) FROM populasi WHERE tahun = (SELECT COALESCE(MAX(tahun), 2025) FROM populasi))
          GROUP BY h.id_hewan, h.jenis_hewan
        `);

        if (normRows && normRows.length > 0) {
          const aliasMap: Record<string, string> = {
            sapi_potong: 'sapi_potong',
            sapi_perah: 'sapi_perah',
            kerbau: 'kerbau',
            kuda: 'kuda',
            kambing: 'kambing',
            domba: 'domba',
            babi: 'babi',
            ayam_kampung: 'ayam_kampung',
            ayam_petelur: 'ayam_petelur',
            ayam_broiler: 'ayam_broiler',
            ayam_broiller: 'ayam_broiler',
            puyuh: 'puyuh',
            itik: 'itik',
            entog: 'entog',
            angsa: 'angsa',
            merpati: 'merpati',
            kelinci: 'kelinci',
          };

          for (const r of normRows) {
            const rawKey = String(r.k || '').toLowerCase();
            const mappedKey = aliasMap[rawKey] || rawKey;
            popMap[mappedKey] = (popMap[mappedKey] || 0) + (Number(r.total) || 0);
          }
        }
      } catch (normErr) {
        // Abaikan jika bukan skema ternormalisasi, lanjut ke Strategi 2
      }

      // Strategi 2: Jika Strategi 1 belum menghasilkan data, coba Skema Kolom Lebar (Wide Table)
      const totalFromNorm = Object.values(popMap).reduce((a, b) => a + b, 0);
      if (totalFromNorm === 0) {
        try {
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
            WHERE tahun = (SELECT COALESCE(MAX(tahun), 2025) FROM populasi)
              AND triwulan = (SELECT COALESCE(MAX(triwulan), 4) FROM populasi WHERE tahun = (SELECT COALESCE(MAX(tahun), 2025) FROM populasi))
          `);

          if (popRows && popRows.length > 0) {
            const r = popRows[0];
            popMap = {
              sapi_potong: Number(r.sapi_potong) || 0,
              sapi_perah: Number(r.sapi_perah) || 0,
              kerbau: Number(r.kerbau) || 0,
              kuda: Number(r.kuda) || 0,
              kambing: Number(r.kambing) || 0,
              domba: Number(r.domba) || 0,
              babi: Number(r.babi) || 0,
              ayam_kampung: Number(r.ayam_kampung) || 0,
              ayam_petelur: Number(r.ayam_petelur) || 0,
              ayam_broiler: Number(r.ayam_broiler) || 0,
              puyuh: Number(r.puyuh) || 0,
              itik: Number(r.itik) || 0,
              entog: Number(r.entog) || 0,
              angsa: Number(r.angsa) || 0,
              merpati: Number(r.merpati) || 0,
              kelinci: Number(r.kelinci) || 0,
            };
          }

          // Fallback seluruh tahun jika triwulan belum ada
          const totalAll = Object.values(popMap).reduce((a, b) => a + b, 0);
          if (totalAll === 0) {
            const [fallbackPop]: any = await pool.query(`
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
              WHERE tahun = (SELECT COALESCE(MAX(tahun), 2025) FROM populasi)
            `);
            if (fallbackPop && fallbackPop.length > 0) {
              const r = fallbackPop[0];
              popMap = {
                sapi_potong: Number(r.sapi_potong) || 0,
                sapi_perah: Number(r.sapi_perah) || 0,
                kerbau: Number(r.kerbau) || 0,
                kuda: Number(r.kuda) || 0,
                kambing: Number(r.kambing) || 0,
                domba: Number(r.domba) || 0,
                babi: Number(r.babi) || 0,
                ayam_kampung: Number(r.ayam_kampung) || 0,
                ayam_petelur: Number(r.ayam_petelur) || 0,
                ayam_broiler: Number(r.ayam_broiler) || 0,
                puyuh: Number(r.puyuh) || 0,
                itik: Number(r.itik) || 0,
                entog: Number(r.entog) || 0,
                angsa: Number(r.angsa) || 0,
                merpati: Number(r.merpati) || 0,
                kelinci: Number(r.kelinci) || 0,
              };
            }
          }
        } catch (wideErr) {
          // Abaikan error wide table
        }
      }

      populasi16 = [
        { komoditas: 'Sapi Potong', total: popMap['sapi_potong'] || 0 },
        { komoditas: 'Sapi Perah', total: popMap['sapi_perah'] || 0 },
        { komoditas: 'Kerbau', total: popMap['kerbau'] || 0 },
        { komoditas: 'Kuda', total: popMap['kuda'] || 0 },
        { komoditas: 'Kambing', total: popMap['kambing'] || 0 },
        { komoditas: 'Domba', total: popMap['domba'] || 0 },
        { komoditas: 'Babi', total: popMap['babi'] || 0 },
        { komoditas: 'Ayam Kampung', total: popMap['ayam_kampung'] || 0 },
        { komoditas: 'Ayam Petelur', total: popMap['ayam_petelur'] || 0 },
        { komoditas: 'Ayam Broiler', total: popMap['ayam_broiler'] || 0 },
        { komoditas: 'Puyuh', total: popMap['puyuh'] || 0 },
        { komoditas: 'Itik', total: popMap['itik'] || 0 },
        { komoditas: 'Entog', total: popMap['entog'] || 0 },
        { komoditas: 'Angsa', total: popMap['angsa'] || 0 },
        { komoditas: 'Merpati', total: popMap['merpati'] || 0 },
        { komoditas: 'Kelinci', total: popMap['kelinci'] || 0 },
      ];

      populasiTernak8 = [
        { komoditas: 'Kambing', total: popMap['kambing'] || 0 },
        { komoditas: 'Sapi Potong', total: popMap['sapi_potong'] || 0 },
        { komoditas: 'Domba', total: popMap['domba'] || 0 },
        { komoditas: 'Kelinci', total: popMap['kelinci'] || 0 },
        { komoditas: 'Babi', total: popMap['babi'] || 0 },
        { komoditas: 'Kuda', total: popMap['kuda'] || 0 },
        { komoditas: 'Kerbau', total: popMap['kerbau'] || 0 },
        { komoditas: 'Sapi Perah', total: popMap['sapi_perah'] || 0 },
      ].sort((a, b) => b.total - a.total);

      populasiUnggas8 = [
        { komoditas: 'Ayam Broiler', total: popMap['ayam_broiler'] || 0 },
        { komoditas: 'Ayam Kampung', total: popMap['ayam_kampung'] || 0 },
        { komoditas: 'Itik', total: popMap['itik'] || 0 },
        { komoditas: 'Entog', total: popMap['entog'] || 0 },
        { komoditas: 'Ayam Petelur', total: popMap['ayam_petelur'] || 0 },
        { komoditas: 'Puyuh', total: popMap['puyuh'] || 0 },
        { komoditas: 'Merpati', total: popMap['merpati'] || 0 },
        { komoditas: 'Angsa', total: popMap['angsa'] || 0 },
      ].sort((a, b) => b.total - a.total);
    } catch (popErr) {
      console.warn('Gagal memuat data populasi:', popErr);
    }

    // 2. QUERY PRODUKSI DAGING & TELUR (tabel produksi - Adaptif nama kolom/relasi)
    let dataDaging: { jenis: string; total: number }[] = [];
    let dataTelur: { jenis: string; total: number }[] = [];

    try {
      // Daging: Coba kolom 'hewan' langsung
      try {
        const [dagingRows]: any = await pool.query(`
          SELECT 
            hewan,
            ROUND(SUM(total), 2) AS total
          FROM produksi
          WHERE jenis = 'pemotongan'
          GROUP BY hewan
          ORDER BY total DESC
        `);

        if (dagingRows && dagingRows.length > 0) {
          dataDaging = dagingRows.map((r: any) => ({
            jenis: formatAnimalName(r.hewan),
            total: Number(r.total) || 0,
          }));
        }
      } catch {
        // Fallback JOIN dengan tabel hewan jika kolom 'hewan' tidak ada
        const [dagingJoin]: any = await pool.query(`
          SELECT 
            h.jenis_hewan AS hewan,
            ROUND(SUM(p.total), 2) AS total
          FROM produksi p
          JOIN hewan h ON p.id_hewan = h.id_hewan
          WHERE p.jenis = 'pemotongan'
          GROUP BY h.id_hewan, h.jenis_hewan
          ORDER BY total DESC
        `);

        if (dagingJoin && dagingJoin.length > 0) {
          dataDaging = dagingJoin.map((r: any) => ({
            jenis: formatAnimalName(r.hewan),
            total: Number(r.total) || 0,
          }));
        }
      }

      // Telur: Coba kolom 'hewan' langsung
      try {
        const [telurRows]: any = await pool.query(`
          SELECT 
            hewan,
            ROUND(SUM(total), 2) AS total
          FROM produksi
          WHERE jenis = 'telur'
          GROUP BY hewan
          ORDER BY total DESC
        `);

        if (telurRows && telurRows.length > 0) {
          dataTelur = telurRows.map((r: any) => ({
            jenis: formatAnimalName(r.hewan),
            total: Number(r.total) || 0,
          }));
        }
      } catch {
        // Fallback JOIN dengan tabel hewan jika kolom 'hewan' tidak ada
        const [telurJoin]: any = await pool.query(`
          SELECT 
            h.jenis_hewan AS hewan,
            ROUND(SUM(p.total), 2) AS total
          FROM produksi p
          JOIN hewan h ON p.id_hewan = h.id_hewan
          WHERE p.jenis = 'telur'
          GROUP BY h.id_hewan, h.jenis_hewan
          ORDER BY total DESC
        `);

        if (telurJoin && telurJoin.length > 0) {
          dataTelur = telurJoin.map((r: any) => ({
            jenis: formatAnimalName(r.hewan),
            total: Number(r.total) || 0,
          }));
        }
      }
    } catch (prodErr) {
      console.warn('Gagal memuat data produksi:', prodErr);
    }

    // 3. QUERY SEBARAN KTT / FARM (tabel ktt_master)
    let sebaranFarm: { komoditas: string; jumlah_farm: number; total_populasi: string }[] = [];
    try {
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
    } catch (kttErr) {
      console.warn('Gagal memuat data ktt_master:', kttErr);
    }

    // 4. QUERY PUSKESWAN (tabel puskeswan_profil - Adaptif PK id_puskeswan maupun id)
    let puskeswanList: any[] = [];
    try {
      const [puskRows]: any = await pool.query('SELECT * FROM puskeswan_profil ORDER BY 1 ASC');
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

          const namaPusk = p.nama_puskeswan || p.nama || `Puskeswan ${i + 1}`;

          return {
            no: i + 1,
            nama: namaPusk,
            wilayah: p.wilayah_binaan || 'Kabupaten Kebumen',
            kecamatan: typeof p.wilayah_binaan === 'string'
              ? p.wilayah_binaan.split(',').map((k: string) => k.replace(/Kecamatan\s*/i, '').replace(/Kec\.?\s*/i, '').trim())
              : ['Kebumen'],
            koordinator: p.dokter_hewan || 'drh. Medik Terpadu',
            status: 'Aktif Melayani',
            alamat: p.alamat || 'Dinas Pertanian dan Pangan Kebumen',
            mapUrl: p.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(namaPusk + ' Kebumen')}`,
            layanan: Array.isArray(parsedLayanan) ? parsedLayanan : ['Pelayanan Pasif', 'Pusling', 'IB & PKB'],
          };
        });
      }
    } catch (puskErr) {
      console.warn('Gagal memuat puskeswan_profil:', puskErr);
    }

    // 5. QUERY VAKSINASI (tabel vaksinasi_bulanan & fallback agregasi tabel vaksinasi)
    let vaksinasiList: any[] = [];
    try {
      const [vakRows]: any = await pool.query(`
        SELECT
          puskeswan,
          target,
          pengambilan AS realisasi,
          ROUND((pengambilan / NULLIF(target, 0)) * 100, 1) AS persen
        FROM vaksinasi_bulanan
        ORDER BY 1 ASC
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
    } catch (vakErr) {
      // Jika tabel vaksinasi_bulanan tidak ada, fallback ke tabel vaksinasi
      try {
        const [vakRelRows]: any = await pool.query(`
          SELECT 
            puskeswan,
            3000 AS target,
            SUM(jumlah) AS realisasi,
            ROUND((SUM(jumlah) / 3000) * 100, 1) AS persen
          FROM vaksinasi
          GROUP BY puskeswan
          ORDER BY puskeswan ASC
        `);
        if (vakRelRows && vakRelRows.length > 0) {
          vaksinasiList = vakRelRows.map((r: any) => ({
            desa: r.puskeswan.toUpperCase().startsWith('PUSKESWAN') ? r.puskeswan.toUpperCase() : `PUSKESWAN ${r.puskeswan.toUpperCase()}`,
            jenis: 'Vaksinasi PMK & LSD',
            target: Number(r.target) || 3000,
            realisasi: Number(r.realisasi) || 0,
            persen: Number(r.persen) || 0,
            total: Number(r.realisasi) || 0,
          }));
        }
      } catch (vakRelErr) {
        console.warn('Gagal memuat fallback data vaksinasi:', vakRelErr);
      }
    }

    // 6. QUERY RPH / TPU / TPH (tabel pemotongan_hewan - Adaptif PK id maupun id_tph)
    let rphList: any[] = [];
    try {
      const [rphRows]: any = await pool.query('SELECT * FROM pemotongan_hewan ORDER BY 1 ASC LIMIT 50');
      if (rphRows && rphRows.length > 0) {
        rphList = rphRows.map((r: any) => ({
          nama: r.nama_usaha || 'Unit Usaha Pemotongan',
          jenis: r.jenis || 'TPU',
          pemilik: r.pemilik || '-',
          desa: r.lokasi || r.alamat_pemilik || 'Kabupaten Kebumen',
          halal: r.sertifikat_halal ? 'Sudah Ada' : 'Belum Ada',
        }));
      }
    } catch (rphErr) {
      console.warn('Gagal memuat pemotongan_hewan:', rphErr);
    }

    // 7. QUERY NKV (tabel pembinaan_nkv)
    let nkvList: any[] = [];
    try {
      const [nkvRows]: any = await pool.query('SELECT * FROM pembinaan_nkv ORDER BY 1 ASC');
      if (nkvRows && nkvRows.length > 0) {
        nkvList = nkvRows.map((n: any) => ({
          nama_pt: n.nama_usaha,
          jenis_usaha: n.jenis_usaha || 'Usaha Peternakan',
          alamat: n.keterangan || 'Kabupaten Kebumen',
          status_nkv: n.pengeluaran_rekomendasi ? 'Terbit Rekomendasi' : 'Proses Pembinaan',
        }));
      }
    } catch (nkvErr) {
      console.warn('Gagal memuat pembinaan_nkv:', nkvErr);
    }

    // 8. QUERY POPULASI SAPI PO (tabel bitpro_sklb_populasi_sapi_po dengan fallback skema alternatif)
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
      // Fallback: hitung dari tabel populasi jika tabel SKLB belum ada
      try {
        const [sapiPoFallback]: any = await pool.query(
          `SELECT COALESCE(SUM(p.total), 0) AS total 
           FROM populasi p 
           JOIN hewan h ON p.id_hewan = h.id_hewan 
           WHERE LOWER(h.jenis_hewan) LIKE '%sapi%po%'`
        );
        if (sapiPoFallback && sapiPoFallback.length > 0) {
          totalSapiPo = Number(sapiPoFallback[0].total) || 0;
        }
      } catch (e2) {
        console.warn('Query Sapi PO warning:', e2);
      }
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
