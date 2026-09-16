export type KendaraanRecord = {
  id: string;
  namaPemegang: string;
  merkType: string;
  tahun: string;
  nopolLama: string;
  nopolBaru: string;
  nomorMesin: string;
  nomorRangka: string;
  keterangan?: string;
};

export type KendaraanFormData = Omit<KendaraanRecord, 'id'>;

export const INITIAL_KENDARAAN_DATA: KendaraanRecord[] = [
  {
    id: '1',
    namaPemegang: 'Kepala Dinas Pertanian & Pangan',
    merkType: 'Toyota Kijang Innova 2.0 G M/T',
    tahun: '2021',
    nopolLama: 'AA 1234 AD',
    nopolBaru: 'AA 1 D',
    nomorMesin: '1TR-FE8923145',
    nomorRangka: 'MHF11GB40K0029141',
    keterangan: 'Kendaraan Dinas Operasional Pimpinan',
  },
  {
    id: '2',
    namaPemegang: 'Kabid Peternakan & Keswan',
    merkType: 'Toyota Avanza 1.3 E M/T',
    tahun: '2019',
    nopolLama: 'AA 9876 AD',
    nopolBaru: 'AA 1045 D',
    nomorMesin: '1NR-VE7623910',
    nomorRangka: 'MHF12BB20J0018274',
    keterangan: 'Operasional Bidang Peternakan',
  },
  {
    id: '3',
    namaPemegang: 'Medik Veteriner / Puskeswan Kebumen',
    merkType: 'Honda Supra X 125 FI',
    tahun: '2020',
    nopolLama: 'AA 4521 AD',
    nopolBaru: 'AA 6120 D',
    nomorMesin: 'JB91E1492014',
    nomorRangka: 'MH1JB9115LK892301',
    keterangan: 'Pelayanan Lapangan & Vaksinasi',
  },
  {
    id: '4',
    namaPemegang: 'Petugas Inseminator Wilayah Prembun',
    merkType: 'Yamaha Jupiter Z1',
    tahun: '2018',
    nopolLama: 'AA 3319 AD',
    nopolBaru: 'AA 6482 D',
    nomorMesin: '2SU-928172',
    nomorRangka: 'MH32SU004JJ910283',
    keterangan: 'Pelayanan Inseminasi Buatan (IB)',
  },
  {
    id: '5',
    namaPemegang: 'Petugas Pengawas Kesmavet & RPH',
    merkType: 'Honda Revo X FI',
    tahun: '2022',
    nopolLama: 'AA 5104 AD',
    nopolBaru: 'AA 6301 D',
    nomorMesin: 'JB92E2019481',
    nomorRangka: 'MH1JB9219NK109284',
    keterangan: 'Pengawasan Peredaran Daging & NKV',
  },
];
