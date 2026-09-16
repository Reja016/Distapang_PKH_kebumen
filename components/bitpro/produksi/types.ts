export const bulan = [
  'JAN', 'FEB', 'MAR', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGT', 'SEPT', 'OKT', 'NOV', 'DES',
];

export const PALETTE = [
  '#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed',
  '#0891b2', '#ea580c', '#4f46e5', '#db2777', '#16a34a',
  '#ca8a04', '#9333ea', '#0284c7', '#e11d48', '#65a30d',
  '#475569',
];

export interface ProduksiItem {
  jenis: string;
  jan: number | string;
  feb: number | string;
  mar: number | string;
  apr: number | string;
  mei: number | string;
  jun: number | string;
  jul: number | string;
  agt: number | string;
  sep: number | string;
  okt: number | string;
  nov: number | string;
  des: number | string;
  total: number | string;
}

export const DAFTAR_KOMODITAS_IB = [
  // Ruminansia Besar
  'Sapi PO (Peranakan Ongole) Kebumen',
  'Sapi Simmental',
  'Sapi Limousin',
  'Sapi FH (Friesian Holstein) Perah',
  'Sapi Brahman Cross',
  'Sapi Brangus',
  'Sapi Bali / Madura',
  'Kerbau Lumpur Potong',
  'Kerbau Murrah',
  'Kuda Sumbawa / Pacu',
  
  // Ruminansia Kecil
  'Kambing PE (Peranakan Etawah)',
  'Kambing Jawa Randu',
  'Kambing Kacang',
  'Kambing Boer',
  'Domba Batur',
  'Domba Garut',
  'Domba Ekor Gemuk',
  'Domba Texel',
  
  // Unggas
  'Ayam Ras Pedaging (Broiler)',
  'Ayam Ras Petelur (Layer)',
  'Ayam Buras / Kampung',
  'Ayam KUB',
  'Itik Petelur / Bebek',
  'Itik Manila / Entog',
  'Burung Puyuh Petelur',
  'Burung Merpati',
  'Angsa',
  
  // Lainnya
  'Kelinci Pedaging & Hias',
  'Babi Ras Komersial',
];
