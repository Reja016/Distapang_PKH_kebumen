export const GESTASI_SAPI_HARI = 283;

export type Insemination = {
  id: number;
  date: string;
  time: string;
  kecamatan: string;
  desa: string;
  inseminatorName: string;
  strawCode: string;
  bullName: string;
  bullBreed: string;
  rekomendasiPkb: string;
  notes: string;

  pkbStatus?: 'Sudah Diperiksa' | 'Tidak Diperiksa';
  pkbSkipDate?: string;
  pkbSkipReason?: string;

  pkbDateActual?: string;
  pkbResult?: 'Bunting' | 'Tidak Bunting';
  pkbOfficer?: string;
  pkbNotes?: string;

  birthDate?: string;
  calfGender?: 'Jantan' | 'Betina';
  birthNotes?: string;
};

export type IBRecord = Insemination & {
  cattleName: string;
  ownerName: string;
  cattleId: string;
  ibOrder?: number;
  totalIbCount?: number;
  allInseminations?: Insemination[];
};

export type CalvingIntervalRow = {
  cattleId: string;
  cattleName: string;
  ownerName: string;
  calvingKe: number;
  kelahiranSebelumnya: string;
  kelahiranSekarang: string;
  intervalHari: number;
  intervalBulan: number;
  kategori: string;
};

export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('id-ID') : '-';

export function estimateBirthInfo(ib: IBRecord) {
  const estDate = new Date(ib.date);
  estDate.setDate(estDate.getDate() + GESTASI_SAPI_HARI);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const estDay = new Date(estDate);
  estDay.setHours(0, 0, 0, 0);
  const daysRemaining = Math.round((estDay.getTime() - today.getTime()) / 86400000);

  return {
    estimatedDate: estDate,
    estimatedDateLabel: estDate.toLocaleDateString('id-ID'),
    daysRemaining,
    isOverdue: daysRemaining < 0,
  };
}

export function kategoriCalvingInterval(hari: number): string {
  if (hari <= 365) return 'Sangat Baik';
  if (hari <= 425) return 'Ideal / Baik';
  if (hari <= 450) return 'Cukup';
  return 'Perlu Perhatian';
}

export function calculateCalvingIntervals(list: IBRecord[]): CalvingIntervalRow[] {
  const byCattle: Record<string, { cattleName: string; ownerName: string; births: Date[] }> = {};
  list.forEach((ib) => {
    if (ib.birthDate) {
      if (!byCattle[ib.cattleId]) {
        byCattle[ib.cattleId] = { cattleName: ib.cattleName, ownerName: ib.ownerName, births: [] };
      }
      byCattle[ib.cattleId].births.push(new Date(ib.birthDate));
    }
  });

  const rows: CalvingIntervalRow[] = [];
  Object.entries(byCattle).forEach(([cattleId, data]) => {
    const sorted = [...data.births].sort((a, b) => a.getTime() - b.getTime());
    for (let i = 1; i < sorted.length; i++) {
      const intervalHari = Math.round((sorted[i].getTime() - sorted[i - 1].getTime()) / 86400000);
      rows.push({
        cattleId,
        cattleName: data.cattleName,
        ownerName: data.ownerName,
        calvingKe: i,
        kelahiranSebelumnya: sorted[i - 1].toLocaleDateString('id-ID'),
        kelahiranSekarang: sorted[i].toLocaleDateString('id-ID'),
        intervalHari,
        intervalBulan: +(intervalHari / 30.44).toFixed(1),
        kategori: kategoriCalvingInterval(intervalHari),
      });
    }
  });
  return rows;
}
