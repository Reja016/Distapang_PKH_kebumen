import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';

// Helper agar tanggal aman masuk ke MySQL
const formatDate = (date: any) => {
  if (!date || date === '0000-00-00') return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
};

// Helper memastikan kolom status_keberhasilan dan mode_keberhasilan ada di MySQL
async function ensureSapitimeColumns() {
  try {
    const [colsRows]: any = await pool.query('SHOW COLUMNS FROM sapitime_ib');
    const cols = (colsRows || []).map((c: any) => c.Field);
    if (!cols.includes('status_keberhasilan')) {
      try {
        await pool.execute("ALTER TABLE sapitime_ib ADD COLUMN status_keberhasilan VARCHAR(50) DEFAULT 'Menunggu PKB'");
      } catch {}
    }
    if (!cols.includes('mode_keberhasilan')) {
      try {
        await pool.execute("ALTER TABLE sapitime_ib ADD COLUMN mode_keberhasilan VARCHAR(20) DEFAULT 'sistem'");
      } catch {}
    }
  } catch (e) {
    console.error('ensureSapitimeColumns error', e);
  }
}

export async function GET() {
  try {
    await ensureSapitimeColumns();
    const [cattle] = await pool.query('SELECT * FROM sapitime_master ORDER BY created_at DESC');
    const [ibs] = await pool.query('SELECT * FROM sapitime_ib ORDER BY date ASC, id ASC');
    const [history] = await pool.query('SELECT * FROM sapitime_history ORDER BY date DESC LIMIT 100');

    // Kelompokkan IB per sapi untuk menentukan urutan (ke-1, ke-2, dst) dan kalkulasi otomatis
    const ibsByCattle: Record<string, any[]> = {};
    (ibs as any[]).forEach(ib => {
      const cId = ib.cattle_id || '';
      if (!ibsByCattle[cId]) ibsByCattle[cId] = [];
      ibsByCattle[cId].push(ib);
    });

    // Gabungkan data Sapi dan data IB agar frontend gampang membacanya
    const formattedCattle = (cattle as any[]).map(c => {
      const cattleIbs = ibsByCattle[c.id] || [];
      const enrichedInseminations = cattleIbs.map((ib, idx) => {
        const isLatest = idx === cattleIbs.length - 1;
        let statusKeberhasilan = ib.status_keberhasilan;
        const modeKeberhasilan = ib.mode_keberhasilan || 'sistem';

        // Jika mode 'sistem' (atau belum diset), hitung status keberhasilan secara otomatis:
        if (modeKeberhasilan === 'sistem' || !statusKeberhasilan) {
          if (ib.birthDate || ib.pkbResult === 'Bunting' || (c.status === 'Bunting' && isLatest)) {
            statusKeberhasilan = 'Berhasil';
          } else if (ib.pkbResult === 'Tidak Bunting') {
            statusKeberhasilan = 'Tidak Berhasil';
          } else if (!isLatest) {
            // Sapi telah di-IB lagi setelah ini, berarti IB siklus ini tidak menghasilkan kebuntingan
            statusKeberhasilan = 'Tidak Berhasil';
          } else {
            statusKeberhasilan = 'Menunggu PKB';
          }
        }

        return {
          ...ib,
          ibOrder: idx + 1,
          totalIbCount: cattleIbs.length,
          status_keberhasilan: statusKeberhasilan,
          mode_keberhasilan: modeKeberhasilan,
          date: formatDate(ib.date),
          pkbSkipDate: formatDate(ib.pkbSkipDate),
          pkbDateActual: formatDate(ib.pkbDateActual),
          birthDate: formatDate(ib.birthDate)
        };
      });

      // Urutkan inseminations terbaru di atas untuk kemudahan baca
      enrichedInseminations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        ...c,
        birthDate: formatDate(c.birthDate),
        lastEstrus: formatDate(c.lastEstrus),
        pregnancyDate: formatDate(c.pregnancyDate),
        inseminations: enrichedInseminations
      };
    });

    return NextResponse.json({ success: true, cattle: formattedCattle, history });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
import { validateAreaAccess } from '@/lib/areaRestriction';

export async function POST(req: Request) {
  try {
    const { action, payload, history } = await req.json();
    const session = await getSessionFromRequest(req as any);
    const userName = session?.nama || session?.nip_username || 'Unknown';

    // Validasi Pembatasan Wilayah Kerja Petugas (Role-Based Area Restriction)
    if (payload?.kecamatan) {
      const areaCheck = await validateAreaAccess(req, payload.kecamatan);
      if (!areaCheck.allowed && areaCheck.errorResponse) {
        return areaCheck.errorResponse;
      }
    }
    
    // 1. Simpan Riwayat / History Aktivitas
    if (history) {
       await pool.query(
         'INSERT INTO sapitime_history (type, cattle, cattleId, description, icon) VALUES (?, ?, ?, ?, ?)', 
         [history.type, history.cattle, history.cattleId || '', history.description, history.icon]
       );
    }

    // Helper for activity logs
    const logActivity = async (table: string, recordId: string, act: string, details: any) => {
      // Determine module and submenu based on context, default to bitpro / database-ib or sapitime
      const moduleKey = 'bitpro';
      const submenuKey = table === 'sapitime_ib' ? 'database-ib' : 'sapitime';
      try {
        await pool.query(
          `INSERT INTO activity_logs (module, submenu, table_name, record_id, action, user_name, details) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [moduleKey, submenuKey, table, recordId, act, userName, JSON.stringify(details)]
        );
      } catch (e) {
        console.error('Failed to log activity:', e);
      }
    };

    // 2. Routing Aksi Database IB & SapiTime
    if (action === 'add_cattle') {
      await pool.query(
        'INSERT INTO sapitime_master (id, name, ownerName, breed, birthDate, kecamatan, desa, status, lastEstrus, pregnancyDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [payload.id, payload.name, payload.ownerName, payload.breed, payload.birthDate || null, payload.kecamatan, payload.desa, payload.status, payload.lastEstrus || null, payload.pregnancyDate || null]
      );
      await logActivity('sapitime', payload.id, 'CREATE', payload);
    } 
    else if (action === 'update_cattle') {
      await pool.query(
        'UPDATE sapitime_master SET name=?, ownerName=?, breed=?, birthDate=?, kecamatan=?, desa=?, status=?, lastEstrus=?, pregnancyDate=? WHERE id=?',
        [payload.name, payload.ownerName, payload.breed, payload.birthDate || null, payload.kecamatan, payload.desa, payload.status, payload.lastEstrus || null, payload.pregnancyDate || null, payload.id]
      );
      await logActivity('sapitime', payload.id, 'UPDATE', payload);
    } 
    else if (action === 'delete_cattle') {
      await pool.query('DELETE FROM sapitime_master WHERE id=?', [payload.id]);
      await pool.query('DELETE FROM sapitime_ib WHERE cattle_id=?', [payload.id]);
      await logActivity('sapitime', payload.id, 'DELETE', { id: payload.id });
    } 
    else if (action === 'add_ib') {
      await pool.query(
        'INSERT INTO sapitime_ib (id, cattle_id, date, time, kecamatan, desa, inseminatorName, strawCode, bullName, bullBreed, rekomendasiPkb, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [payload.id, payload.cattle_id, payload.date, payload.time, payload.kecamatan, payload.desa, payload.inseminatorName, payload.strawCode, payload.bullName, payload.bullBreed, payload.rekomendasiPkb, payload.notes]
      );
      await logActivity('sapitime_ib', payload.id, 'CREATE', payload);
    }
    // --- AKSI KHUSUS HALAMAN DATABASE IB & SAPITIME ---
    else if (action === 'update_ib_success') {
      await ensureSapitimeColumns();
      await pool.query(
        'UPDATE sapitime_ib SET status_keberhasilan = ?, mode_keberhasilan = ? WHERE id = ?',
        [payload.status_keberhasilan, payload.mode_keberhasilan || 'manual', payload.ib_id]
      );
      await logActivity('sapitime_ib', payload.ib_id, 'UPDATE', { action: 'update_ib_success', ...payload });
    }
    else if (action === 'record_pkb') {
      await ensureSapitimeColumns();
      const autoSuccess = payload.pkbResult === 'Bunting' ? 'Berhasil' : 'Tidak Berhasil';
      await pool.query(
        'UPDATE sapitime_ib SET pkbStatus="Sudah Diperiksa", pkbDateActual=?, pkbResult=?, pkbOfficer=?, pkbNotes=?, pkbSkipDate=NULL, pkbSkipReason=NULL, status_keberhasilan=?, mode_keberhasilan="sistem" WHERE id=?',
        [payload.pkbDateActual, payload.pkbResult, payload.pkbOfficer, payload.pkbNotes, autoSuccess, payload.ib_id]
      );
      await pool.query(
        'UPDATE sapitime_master SET status=?, pregnancyDate=? WHERE id=?',
        [payload.newCattleStatus, payload.pregnancyDate || null, payload.cattle_id]
      );
      await logActivity('sapitime_ib', payload.ib_id, 'UPDATE', { action: 'record_pkb', ...payload });
    }
    else if (action === 'skip_pkb') {
      await pool.query(
        'UPDATE sapitime_ib SET pkbStatus="Tidak Diperiksa", pkbSkipDate=?, pkbSkipReason=? WHERE id=?',
        [payload.pkbSkipDate, payload.pkbSkipReason, payload.ib_id]
      );
      await logActivity('sapitime_ib', payload.ib_id, 'UPDATE', { action: 'skip_pkb', ...payload });
    }
    else if (action === 'record_birth') {
      await ensureSapitimeColumns();
      await pool.query(
        'UPDATE sapitime_ib SET birthDate=?, calfGender=?, birthNotes=?, status_keberhasilan="Berhasil", mode_keberhasilan="sistem" WHERE id=?',
        [payload.birthDate, payload.calfGender, payload.birthNotes, payload.ib_id]
      );
      await pool.query(
        'UPDATE sapitime_master SET status="Laktasi", pregnancyDate=NULL WHERE id=?',
        [payload.cattle_id]
      );
      await logActivity('sapitime_ib', payload.ib_id, 'UPDATE', { action: 'record_birth', ...payload });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}