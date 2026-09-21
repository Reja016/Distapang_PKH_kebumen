import { FieldData, hitungKondisi } from './types';

interface MasterKtt {
  namaKelompok: string;
  kecamatan: string;
  desa: string;
  ketua?: string;
}

const formatTanggalIndo = (waktuStr?: string) => {
  if (waktuStr) {
    const d = new Date(waktuStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export function cetakLaporanRuminansia(
  data: FieldData,
  kttMasterList: MasterKtt[] = []
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Gagal membuka jendela cetak. Pastikan pop-up diizinkan pada browser Anda.');
    return;
  }

  const k = data.kondisi;
  const h = hitungKondisi(k);
  const master = kttMasterList.find(
    (m) =>
      m.namaKelompok.toLowerCase() === (data.namaKtt || '').toLowerCase() ||
      (m.desa.toLowerCase() === (data.desa || '').toLowerCase() && m.kecamatan.toLowerCase() === (data.kec || '').toLowerCase())
  );
  const namaKetua = data.namaKetua || (data.kondisi as any)?.namaKetua || master?.ketua || (data.suratPernyataan?.nama) || '';
  const tanggalHariIni = formatTanggalIndo(data.waktuMonev);

  const bJantan = (k.matiBangkaiJantan || 0) + (k.matiPotongJantan || 0);
  const bBetina = (k.matiBangkaiBetina || 0) + (k.matiPotongBetina || 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Monev Ruminansia - ${data.namaKtt || 'KTT'}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 18mm 12mm 18mm;
        }
        * {
          box-sizing: border-box;
          font-family: 'Times New Roman', Times, serif;
        }
        body {
          margin: 0;
          padding: 0;
          color: #000;
          background: #fff;
          font-size: 10pt;
          line-height: 1.35;
        }
        .header-title {
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 14px;
          line-height: 1.3;
        }
        .identitas-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          font-size: 10pt;
        }
        .identitas-table td {
          padding: 2px 0;
          vertical-align: top;
        }
        .col-label {
          width: 250px;
          font-weight: normal;
        }
        .col-colon {
          width: 16px;
          text-align: center;
        }
        .section-title {
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 5px;
          font-size: 10.5pt;
        }
        .item-row {
          margin-bottom: 6px;
          font-size: 9.5pt;
        }
        .item-label {
          font-weight: normal;
          margin-bottom: 2px;
        }
        .tabel-data {
          width: 100%;
          border-collapse: collapse;
          margin: 3px 0 6px 0;
          font-size: 9.5pt;
        }
        .tabel-data, .tabel-data th, .tabel-data td {
          border: 1px solid #000;
        }
        .tabel-data td {
          padding: 3px 6px;
          vertical-align: middle;
        }
        .catatan-box {
          border: 1px dashed #666;
          min-height: 55px;
          padding: 6px 10px;
          margin-top: 4px;
          margin-bottom: 14px;
          font-size: 9.5pt;
          line-height: 1.4;
          white-space: pre-wrap;
        }
        .signature-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          page-break-inside: avoid;
        }
        .signature-table td {
          vertical-align: top;
          padding: 2px 6px;
        }
        .ttd-container {
          height: 65px;
          display: flex;
          align-items: center;
          margin: 4px 0;
        }
        .ttd-img {
          max-height: 60px;
          max-width: 170px;
          object-fit: contain;
        }
        .ttd-img-petugas {
          max-height: 45px;
          max-width: 120px;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      <div class="header-title">
        LAPORAN HASIL MONITORING DAN EVALUASI<br/>
        PERKEMBANGAN TERNAK HIBAH RUMINANSIA
      </div>

      <table class="identitas-table">
        <tr>
          <td class="col-label">NAMA KELOMPOK</td>
          <td class="col-colon">:</td>
          <td><b>${data.namaKtt || '..........................................................'}</b></td>
        </tr>
        <tr>
          <td class="col-label">ALAMAT</td>
          <td class="col-colon">:</td>
          <td>${data.alamat || `Desa ${data.desa || '-'}, Kec. ${data.kec || '-'}`}</td>
        </tr>
        <tr>
          <td class="col-label">LINTANG/BUJUR LOKASI KEL.</td>
          <td class="col-colon">:</td>
          <td>${data.lat && data.lng ? `${data.lat}, ${data.lng}` : '..........................................................'}</td>
        </tr>
        <tr>
          <td class="col-label">TAHUN BANTUAN / SUMBER HIBAH</td>
          <td class="col-colon">:</td>
          <td>${data.tahun || '................'}${data.sumberDana ? ` (${data.sumberDana})` : ''}</td>
        </tr>
        <tr>
          <td class="col-label">JENIS KOMODITAS TERNAK</td>
          <td class="col-colon">:</td>
          <td>${data.jenis || '..........................................................'}</td>
        </tr>
        <tr>
          <td class="col-label">WAKTU MONEV</td>
          <td class="col-colon">:</td>
          <td>${data.waktuMonev || tanggalHariIni}</td>
        </tr>
        <tr>
          <td class="col-label">HASIL MONEV</td>
          <td class="col-colon">:</td>
          <td></td>
        </tr>
      </table>

      <div class="section-title">A. KONDISI TERNAK</div>

      <div class="item-row">
        <div class="item-label">1. Jumlah Ternak Awal Total : <b>${h.a} ekor (a)</b></div>
        <table class="tabel-data">
          <tr>
            <td style="width: 50%;">Jantan : ${k.awalJantan || 0} ekor</td>
            <td style="width: 50%;">Betina : ${k.awalBetina || 0} ekor</td>
          </tr>
        </table>
      </div>

      <div class="item-row">
        <div class="item-label">2. Kematian ternak pokok</div>
        <table class="tabel-data">
          <tr>
            <td style="width: 28%;">Mati Bangkai</td>
            <td style="width: 36%;">Jantan : ${k.matiBangkaiJantan || 0} ekor<br/><span style="font-size: 8.5pt;">BA : ${k.matiBangkaiBA === 'Ada' ? 'ada' : 'tidak'}</span></td>
            <td style="width: 36%;">Betina : ${k.matiBangkaiBetina || 0} ekor<br/><span style="font-size: 8.5pt;">BA : ${k.matiBangkaiBA === 'Ada' ? 'ada' : 'tidak'}</span></td>
          </tr>
          <tr>
            <td>Mati Potong Paksa</td>
            <td>Jantan : ${k.matiPotongJantan || 0} ekor<br/><span style="font-size: 8.5pt;">BA : ${k.matiPotongBA === 'Ada' ? 'ada' : 'tidak'}</span></td>
            <td>Betina : ${k.matiPotongBetina || 0} ekor<br/><span style="font-size: 8.5pt;">BA : ${k.matiPotongBA === 'Ada' ? 'ada' : 'tidak'}</span></td>
          </tr>
          <tr>
            <td>Total Mati Ternak Pokok</td>
            <td>Jantan : ${bJantan} ekor</td>
            <td>Betina : ${bBetina} Ekor</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Total Mati Ternak Pokok</td>
            <td colspan="2" style="font-weight: bold;">${h.b} ekor (b)</td>
          </tr>
        </table>
      </div>

      <div class="item-row">
        <div class="item-label">3. Penjualan ternak pokok (selain karena Potong Paksa)</div>
        <table class="tabel-data">
          <tr>
            <td style="width: 28%;">Penjualan ternak pokok</td>
            <td style="width: 36%;">Jantan : ${k.jualJantan || 0} ekor<br/><span style="font-size: 8.5pt;">BA : ${k.jualBA === 'Ada' ? 'ada' : 'tidak'}</span></td>
            <td style="width: 36%;">Betina : ${k.jualBetina || 0} Ekor<br/><span style="font-size: 8.5pt;">BA : ${k.jualBA === 'Ada' ? 'ada' : 'tidak'}</span></td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Total ternak pokok dijual</td>
            <td colspan="2" style="font-weight: bold;">${h.c} ekor (c)</td>
          </tr>
        </table>
      </div>

      <div class="item-row">
        <div class="item-label">4. Pembelian ternak pokok</div>
        <table class="tabel-data">
          <tr>
            <td style="width: 28%;">Pembelian ternak pokok</td>
            <td style="width: 36%;">Jantan : ${k.beliJantan || 0} ekor</td>
            <td style="width: 36%;">Betina : ${k.beliBetina || 0} Ekor</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Total ternak pokok dibeli</td>
            <td colspan="2" style="font-weight: bold;">${h.d} ekor (d)</td>
          </tr>
        </table>
      </div>

      <div class="item-row">
        5. Sisa ternak pokok yang masih ada :<br/>
        <b>${h.a}</b> ekor (a) - <b>${h.b}</b> Ekor (b) - <b>${h.c}</b> Ekor (c) + <b>${h.d}</b> Ekor (d) = <b>${h.e} Ekor (e)</b>
      </div>

      <div class="item-row">
        <div class="item-label">6. Kelahiran Anak</div>
        <table class="tabel-data">
          <tr>
            <td style="width: 33%;">Jantan : ${k.lahirJantan || 0} ekor</td>
            <td style="width: 33%;">Betina : ${k.lahirBetina || 0} Ekor</td>
            <td style="width: 34%;">Belum Diketahui : ${k.lahirBelumTahu || 0} Ekor</td>
          </tr>
          <tr>
            <td colspan="3" style="font-weight: bold;">Total Kelahiran Anak : ${h.f} ekor (f)</td>
          </tr>
        </table>
      </div>

      <div class="item-row">
        <div class="item-label">7. Kematian Anak</div>
        <table class="tabel-data">
          <tr>
            <td style="width: 33%;">Jantan : ${k.matiAnakJantan || 0} ekor</td>
            <td style="width: 33%;">Betina : ${k.matiAnakBetina || 0} Ekor</td>
            <td style="width: 34%;">Belum Diketahui : ${k.matiAnakBelumTahu || 0} Ekor</td>
          </tr>
          <tr>
            <td colspan="3" style="font-weight: bold;">Total Kematian Anak : ${h.g} ekor (g)</td>
          </tr>
        </table>
      </div>

      <div class="item-row">
        <div class="item-label">8. Penjualan Anak</div>
        <table class="tabel-data">
          <tr>
            <td style="width: 33%;">Jantan : ${k.jualAnakJantan || 0} ekor</td>
            <td style="width: 33%;">Betina : ${k.jualAnakBetina || 0} Ekor</td>
            <td style="width: 34%;">Belum Diketahui : ${k.jualAnakBelumTahu || 0} Ekor</td>
          </tr>
          <tr>
            <td colspan="3" style="font-weight: bold;">Total Penjualan Anak : ${h.h} ekor (h)</td>
          </tr>
        </table>
      </div>

      <div class="item-row" style="margin-top: 4px;">
        9. Total Aset Ternak Kelompok :<br/>
        <b>${h.e}</b> ekor (e) + <b>${h.f}</b> Ekor (f) - <b>${h.g}</b> Ekor (g) - <b>${h.h}</b> Ekor (h) = <b>${h.i} Ekor (i)</b>
      </div>

      <div class="section-title">B. KETERANGAN LAINNYA :</div>
      <div class="catatan-box">${data.catatan || 'Kondisi ternak terpelihara dengan baik, pakan dan kesehatan tercukupi.'}</div>

      <table class="signature-table">
        <tr>
          <td style="width: 50%;">
            Ketua ${data.namaKtt || 'Kelompok'}<br/>
            <div class="ttd-container">
              <div style="height: 55px;"></div>
            </div>
            <b>(${namaKetua || '................................................'})</b>
          </td>
          <td style="width: 50%;">
            Kebumen, ${tanggalHariIni}<br/>
            Tim Monev :<br/>
            <table style="width: 100%; border: none; font-size: 9.5pt; margin-top: 4px;">
              <tr>
                <td style="border: none; width: 18px; padding: 2px 0; vertical-align: middle;">1.</td>
                <td style="border: none; padding: 2px 0; vertical-align: middle;">${k.namaPetugas1 || '..............................................'}</td>
                <td style="border: none; width: 110px; text-align: center; padding: 2px 0; vertical-align: middle;">
                  ${(k as any).ttdPetugas1 ? `<img src="${(k as any).ttdPetugas1}" style="max-height: 38px; max-width: 95px; object-fit: contain; display: block; margin: 0 auto;" />` : ': .................'}
                </td>
              </tr>
              <tr>
                <td style="border: none; width: 18px; padding: 2px 0; vertical-align: middle;">2.</td>
                <td style="border: none; padding: 2px 0; vertical-align: middle;">${k.namaPetugas2 || '..............................................'}</td>
                <td style="border: none; width: 110px; text-align: center; padding: 2px 0; vertical-align: middle;">
                  ${(k as any).ttdPetugas2 ? `<img src="${(k as any).ttdPetugas2}" style="max-height: 38px; max-width: 95px; object-fit: contain; display: block; margin: 0 auto;" />` : ': .................'}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function cetakLaporanUnggas(
  data: FieldData,
  kttMasterList: MasterKtt[] = []
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Gagal membuka jendela cetak. Pastikan pop-up diizinkan pada browser Anda.');
    return;
  }

  const ku = data.kondisiUnggas || {
    awalTotal: data.kondisi?.awalJantan || 0,
    kematian: data.kondisi?.matiBangkaiJantan || 0,
    dijual: data.kondisi?.jualJantan || 0,
    rataanTelur: 0,
    konsumsiPakan: 0,
    keteranganLain: '',
    fotoTtdPetugas: data.kondisi?.fotoTtdPetugas,
    fotoTtdKetuaCap: data.kondisi?.fotoTtdKetuaCap,
    namaPetugas1: data.kondisi?.namaPetugas1 || '',
    namaPetugas2: data.kondisi?.namaPetugas2 || '',
  };

  const sisa = Math.max(0, (ku.awalTotal || 0) - (ku.kematian || 0) - (ku.dijual || 0));

  const master = kttMasterList.find(
    (m) =>
      m.namaKelompok.toLowerCase() === (data.namaKtt || '').toLowerCase() ||
      (m.desa.toLowerCase() === (data.desa || '').toLowerCase() && m.kecamatan.toLowerCase() === (data.kec || '').toLowerCase())
  );
  const namaKetua = data.namaKetua || (data.kondisi as any)?.namaKetua || (data.kondisiUnggas as any)?.namaKetua || master?.ketua || (data.suratPernyataan?.nama) || '';
  const tanggalHariIni = formatTanggalIndo(data.waktuMonev);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Monev Unggas - ${data.namaKtt || 'KTT'}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 14mm 20mm 14mm 20mm;
        }
        * {
          box-sizing: border-box;
          font-family: 'Times New Roman', Times, serif;
        }
        body {
          margin: 0;
          padding: 0;
          color: #000;
          background: #fff;
          font-size: 11pt;
          line-height: 1.35;
        }
        .header-title {
          text-align: center;
          font-weight: bold;
          font-size: 13pt;
          margin-bottom: 12px;
          text-transform: uppercase;
        }
        .identitas-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        .identitas-table td {
          padding: 2.5px 0;
          font-size: 10.5pt;
          vertical-align: top;
        }
        .col-label {
          width: 250px;
        }
        .col-colon {
          width: 15px;
          text-align: center;
        }
        .section-title {
          font-weight: bold;
          font-size: 11pt;
          margin-top: 10px;
          margin-bottom: 4px;
        }
        .unggas-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        .unggas-table td {
          padding: 3.5px 0;
          font-size: 10.5pt;
          vertical-align: top;
        }
        .catatan-box {
          border: 1px solid #000;
          padding: 8px;
          min-height: 48px;
          font-size: 10pt;
          margin-bottom: 12px;
        }
        .signature-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          page-break-inside: avoid;
        }
        .signature-table td {
          vertical-align: top;
          padding: 2px 6px;
        }
        .ttd-container {
          height: 60px;
          display: flex;
          align-items: center;
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="header-title">
        LAPORAN HASIL MONITORING DAN EVALUASI<br/>
        PERKEMBANGAN TERNAK HIBAH UNGGAS
      </div>

      <table class="identitas-table">
        <tr>
          <td class="col-label">NAMA KELOMPOK</td>
          <td class="col-colon">:</td>
          <td><b>${data.namaKtt || '..........................................................'}</b></td>
        </tr>
        <tr>
          <td class="col-label">ALAMAT</td>
          <td class="col-colon">:</td>
          <td>${data.alamat || `Desa ${data.desa || '-'}, Kec. ${data.kec || '-'}`}</td>
        </tr>
        <tr>
          <td class="col-label">LINTANG/BUJUR LOKASI KEL.</td>
          <td class="col-colon">:</td>
          <td>${data.lat && data.lng ? `${data.lat}, ${data.lng}` : '..........................................................'}</td>
        </tr>
        <tr>
          <td class="col-label">TAHUN BANTUAN</td>
          <td class="col-colon">:</td>
          <td>${data.tahun || '................'}</td>
        </tr>
        <tr>
          <td class="col-label">JENIS KOMODITAS TERNAK</td>
          <td class="col-colon">:</td>
          <td>${data.jenis || '..........................................................'}</td>
        </tr>
        <tr>
          <td class="col-label">WAKTU MONEV</td>
          <td class="col-colon">:</td>
          <td>${data.waktuMonev || tanggalHariIni}</td>
        </tr>
        <tr>
          <td class="col-label">HASIL MONEV</td>
          <td class="col-colon">:</td>
          <td></td>
        </tr>
      </table>

      <div class="section-title">A. KONDISI TERNAK</div>
      <table class="unggas-table">
        <tr>
          <td style="width: 250px;">1. Jumlah Ternak Awal Total</td>
          <td class="col-colon">:</td>
          <td>${ku.awalTotal || 0} ekor (a)</td>
        </tr>
        <tr>
          <td>2. Kematian ternak</td>
          <td class="col-colon">:</td>
          <td>${ku.kematian || 0} ekor (b)</td>
        </tr>
        <tr>
          <td>3. Ternak Dijual</td>
          <td class="col-colon">:</td>
          <td>${ku.dijual || 0} ekor (c)</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">4. Populasi Ternak Saat ini</td>
          <td class="col-colon">:</td>
          <td style="font-weight: bold;">${sisa} ekor (a-b-c)</td>
        </tr>
        <tr>
          <td>5. Rataan Produksi Telur/hari</td>
          <td class="col-colon">:</td>
          <td>${ku.rataanTelur || 0} Butir</td>
        </tr>
        <tr>
          <td>6. Konsumsi Pakan/hari</td>
          <td class="col-colon">:</td>
          <td>${ku.konsumsiPakan || 0} Gram/ekor/hari</td>
        </tr>
      </table>

      <div class="section-title">B. KETERANGAN LAINNYA :</div>
      <div class="catatan-box">${data.catatan || ku.keteranganLain || 'Kondisi kandang dan unggas terpelihara secara baik, pakan dan biosekuriti terjaga.'}</div>

      <table class="signature-table">
        <tr>
          <td style="width: 50%;">
            Ketua ${data.namaKtt || 'Kelompok'}<br/>
            <div class="ttd-container">
              <div style="height: 60px;"></div>
            </div>
            <b>(${namaKetua || '................................................'})</b>
          </td>
          <td style="width: 50%;">
            Kebumen, ${tanggalHariIni}<br/>
            Tim Monev :<br/>
            <table style="width: 100%; border: none; font-size: 10pt; margin-top: 6px;">
              <tr>
                <td style="border: none; width: 20px; padding: 3px 0; vertical-align: middle;">1.</td>
                <td style="border: none; padding: 3px 0; vertical-align: middle;">${ku.namaPetugas1 || '..............................................'}</td>
                <td style="border: none; width: 110px; text-align: center; padding: 3px 0; vertical-align: middle;">
                  ${(ku as any).ttdPetugas1 ? `<img src="${(ku as any).ttdPetugas1}" style="max-height: 38px; max-width: 95px; object-fit: contain; display: block; margin: 0 auto;" />` : ': .................'}
                </td>
              </tr>
              <tr>
                <td style="border: none; width: 20px; padding: 3px 0; vertical-align: middle;">2.</td>
                <td style="border: none; padding: 3px 0; vertical-align: middle;">${ku.namaPetugas2 || '..............................................'}</td>
                <td style="border: none; width: 110px; text-align: center; padding: 3px 0; vertical-align: middle;">
                  ${(ku as any).ttdPetugas2 ? `<img src="${(ku as any).ttdPetugas2}" style="max-height: 38px; max-width: 95px; object-fit: contain; display: block; margin: 0 auto;" />` : ': .................'}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
