import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Helper agar tanggal aman masuk ke MySQL
const formatDate = (date: any) => {
  if (!date || date === '0000-00-00') return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
};

export async function GET() {
  try {
    const [cattle] = await pool.query('SELECT * FROM sapitime_master ORDER BY created_at DESC');
    const [ibs] = await pool.query('SELECT * FROM sapitime_ib ORDER BY date DESC');
    const [history] = await pool.query('SELECT * FROM sapitime_history ORDER BY date DESC LIMIT 100');

    // Gabungkan data Sapi dan data IB agar frontend gampang membacanya
    const formattedCattle = (cattle as any[]).map(c => ({
      ...c,
      birthDate: formatDate(c.birthDate),
      lastEstrus: formatDate(c.lastEstrus),
      pregnancyDate: formatDate(c.pregnancyDate),
      inseminations: (ibs as any[]).filter(ib => ib.cattle_id === c.id).map(ib => ({
        ...ib,
        date: formatDate(ib.date),
        pkbSkipDate: formatDate(ib.pkbSkipDate),
        pkbDateActual: formatDate(ib.pkbDateActual),
        birthDate: formatDate(ib.birthDate)
      }))
    }));

    return NextResponse.json({ success: true, cattle: formattedCattle, history });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, payload, history } = await req.json();
    
    // 1. Simpan Riwayat / History Aktivitas
    if (history) {
       await pool.query(
         'INSERT INTO sapitime_history (type, cattle, cattleId, description, icon) VALUES (?, ?, ?, ?, ?)', 
         [history.type, history.cattle, history.cattleId || '', history.description, history.icon]
       );
    }

    // 2. Routing Aksi Database IB & SapiTime
    if (action === 'add_cattle') {
      await pool.query(
        'INSERT INTO sapitime_master (id, name, ownerName, breed, birthDate, kecamatan, desa, status, lastEstrus, pregnancyDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [payload.id, payload.name, payload.ownerName, payload.breed, payload.birthDate || null, payload.kecamatan, payload.desa, payload.status, payload.lastEstrus || null, payload.pregnancyDate || null]
      );
    } 
    else if (action === 'update_cattle') {
      await pool.query(
        'UPDATE sapitime_master SET name=?, ownerName=?, breed=?, birthDate=?, kecamatan=?, desa=?, status=?, lastEstrus=?, pregnancyDate=? WHERE id=?',
        [payload.name, payload.ownerName, payload.breed, payload.birthDate || null, payload.kecamatan, payload.desa, payload.status, payload.lastEstrus || null, payload.pregnancyDate || null, payload.id]
      );
    } 
    else if (action === 'delete_cattle') {
      await pool.query('DELETE FROM sapitime_master WHERE id=?', [payload.id]);
      await pool.query('DELETE FROM sapitime_ib WHERE cattle_id=?', [payload.id]);
    } 
    else if (action === 'add_ib') {
      await pool.query(
        'INSERT INTO sapitime_ib (id, cattle_id, date, time, kecamatan, desa, inseminatorName, strawCode, bullName, bullBreed, rekomendasiPkb, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [payload.id, payload.cattle_id, payload.date, payload.time, payload.kecamatan, payload.desa, payload.inseminatorName, payload.strawCode, payload.bullName, payload.bullBreed, payload.rekomendasiPkb, payload.notes]
      );
    }
    // --- AKSI KHUSUS HALAMAN DATABASE IB ---
    else if (action === 'record_pkb') {
      await pool.query(
        'UPDATE sapitime_ib SET pkbStatus="Sudah Diperiksa", pkbDateActual=?, pkbResult=?, pkbOfficer=?, pkbNotes=?, pkbSkipDate=NULL, pkbSkipReason=NULL WHERE id=?',
        [payload.pkbDateActual, payload.pkbResult, payload.pkbOfficer, payload.pkbNotes, payload.ib_id]
      );
      await pool.query(
        'UPDATE sapitime_master SET status=?, pregnancyDate=? WHERE id=?',
        [payload.newCattleStatus, payload.pregnancyDate || null, payload.cattle_id]
      );
    }
    else if (action === 'skip_pkb') {
      await pool.query(
        'UPDATE sapitime_ib SET pkbStatus="Tidak Diperiksa", pkbSkipDate=?, pkbSkipReason=? WHERE id=?',
        [payload.pkbSkipDate, payload.pkbSkipReason, payload.ib_id]
      );
    }
    else if (action === 'record_birth') {
      await pool.query(
        'UPDATE sapitime_ib SET birthDate=?, calfGender=?, birthNotes=? WHERE id=?',
        [payload.birthDate, payload.calfGender, payload.birthNotes, payload.ib_id]
      );
      await pool.query(
        'UPDATE sapitime_master SET status="Laktasi", pregnancyDate=NULL WHERE id=?',
        [payload.cattle_id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}