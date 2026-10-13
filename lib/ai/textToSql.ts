// Lokasi: lib/ai/textToSql.ts
import Groq from "groq-sdk";
import { dbPoolAI, compactDatabaseSchema } from "./schemaContext";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Terapkan Batas Baris Maksimal Otomatis (Mencegah Beban Memori & Lonjakan Token)
function applyAutomaticLimit(sql: string, maxLimit = 50): string {
  const trimmed = sql.trim().replace(/;+$/, "");

  // Jangan tambahkan LIMIT jika query adalah agregasi tunggal (COUNT, SUM, AVG) tanpa GROUP BY
  const isSingleAggregate =
    /^\s*SELECT\s+(COUNT|SUM|AVG|MIN|MAX)\s*\([^)]*\)\s+AS\s+[^,\s]+\s+FROM\s+/i.test(trimmed) &&
    !/GROUP\s+BY/i.test(trimmed);

  if (isSingleAggregate) {
    return trimmed;
  }

  // Jika belum memiliki klausa LIMIT, otomatis tempelkan LIMIT 50
  if (!/\bLIMIT\s+\d+/i.test(trimmed)) {
    return `${trimmed} LIMIT ${maxLimit}`;
  }

  return trimmed;
}

// Pengaman Lapis Kedua: Blokir perintah selain SELECT, fungsi berbahaya, dan kolom/tabel rahasia
function isQuerySafe(sql: string): boolean {
  const trimmed = sql.trim();
  if (!/^SELECT\b/i.test(trimmed)) {
    return false;
  }
  const forbidden =
    /\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|GRANT|REVOKE|CREATE|SLEEP|BENCHMARK|LOAD_FILE|OUTFILE|DUMPFILE|sessions|password)\b/i;
  return !forbidden.test(trimmed);
}

// Deteksi apakah pengguna meminta dibuatkan program, kode, script, atau instruksi di luar konteks data SiMantap
function hasCodeOrOutOfScopeRequest(text: string): boolean {
  const codePattern =
    /\b(buatkan\s+program|bikin\s+program|bikinin\s+program|buat\s+program|buatkan\s+kode|bikin\s+kode|bikinin\s+kode|buatkan\s+coding|bikin\s+coding|bikinin\s+coding|codingan|kodingan|source\s+code|buatkan\s+script|bikin\s+script|bikinin\s+script|buatkan\s+aplikasi|bikin\s+aplikasi|buatkan\s+web|bikin\s+web|buatkan\s+website|bikin\s+website|tuliskan\s+kode|tulis\s+program|tulis\s+kode|algoritma|program\s+python|program\s+java|program\s+c\+\+|program\s+php|program\s+javascript|script\s+python|script\s+php|script\s+js|script\s+html|kode\s+html|kode\s+python|kode\s+php|kode\s+javascript|buatkan\s+fungsi|bikin\s+fungsi|buatkan\s+kalkulator|bikin\s+kalkulator|buatkan\s+game|bikin\s+game|buatkan\s+puisi|buatkan\s+cerita|buatkan\s+resep|contoh\s+program|contoh\s+coding)\b/i;
  return codePattern.test(text);
}

// Bersihkan kalimat selipan yang meminta pembuatan program setelah pertanyaan data
function stripCodeRequestFromQuestion(text: string): string {
  return text
    .replace(
      /([,.?;!]|\b(dan|lalu|kemudian|terus|habis\s+itu|abis\s+itu|sekalian|serta|juga|tolong|coba)\b)\s*[^.?!]*\b(buatkan|bikin|bikinin|buat|tulis|tuliskan|contohkan|berikan)\s+[^.?!]*\b(program|kode|coding|codingan|kodingan|script|aplikasi|web|website|fungsi|algoritma|kalkulator|game|puisi|cerita|resep|html|python|javascript|php|java|c\+\+|css).*$/gi,
      ""
    )
    .trim();
}

// Deteksi apakah pesan murni berupa sapaan / identitas / ucapan terima kasih
function isSimpleGreeting(text: string): boolean {
  const greetingPattern =
    /^\s*(halo+|hai+|hi+|selamat\s+(pagi|siang|sore|malam)|assalamu'?alaikum|permisi|tes|test|ping|siapa\s+(kamu|anda)|apa\s+kabar|terima\s+kasih|makasih|thanks|ok|oke|baik)\s*[.!?,]*\s*$/i;
  return greetingPattern.test(text.trim());
}

// Definisi informasi halaman terkait untuk navigasi berbasis RBAC (Opsi B)
export interface PageLinkInfo {
  moduleKey: "bitpro" | "keswan" | "kesmavet" | "aset" | "admin";
  submenuKey: string;
  label: string;
  href: string;
  adminOnly?: boolean;
}

const TABLE_PAGE_MAP: Record<string, PageLinkInfo> = {
  // Modul Bitpro
  ktt_documents: {
    moduleKey: "bitpro",
    submenuKey: "database-ktt",
    label: "Halaman Database KTT",
    href: "/bitpro/database-ktt",
  },
  kegiatan_ktt: {
    moduleKey: "bitpro",
    submenuKey: "kegiatan-ktt",
    label: "Halaman Kegiatan KTT",
    href: "/bitpro/kegiatan-ktt",
  },
  monev_kondisi_ternak: {
    moduleKey: "bitpro",
    submenuKey: "monev-ktt",
    label: "Halaman Monev KTT",
    href: "/bitpro/monev-ktt",
  },
  monev_lapangan: {
    moduleKey: "bitpro",
    submenuKey: "monev-ktt",
    label: "Halaman Monev KTT",
    href: "/bitpro/monev-ktt",
  },
  ktt_master: {
    moduleKey: "bitpro",
    submenuKey: "database-ktt",
    label: "Halaman Database KTT",
    href: "/bitpro/database-ktt",
  },
  populasi: {
    moduleKey: "bitpro",
    submenuKey: "populasi-dan-produksi",
    label: "Halaman Populasi & Produksi",
    href: "/bitpro/populasi-dan-produksi",
  },
  produksi: {
    moduleKey: "bitpro",
    submenuKey: "populasi-dan-produksi",
    label: "Halaman Populasi & Produksi",
    href: "/bitpro/populasi-dan-produksi",
  },
  data_farm: {
    moduleKey: "bitpro",
    submenuKey: "data-farm",
    label: "Halaman Sebaran Farm",
    href: "/bitpro/data-farm",
  },
  sapitime_master: {
    moduleKey: "bitpro",
    submenuKey: "sapitime",
    label: "Halaman SapiTime (Input IB)",
    href: "/bitpro/sapitime",
  },
  sapitime_ib: {
    moduleKey: "bitpro",
    submenuKey: "database-ib",
    label: "Halaman Database IB",
    href: "/bitpro/database-ib",
  },
  detil_sapi: {
    moduleKey: "bitpro",
    submenuKey: "database-ib",
    label: "Halaman Database IB",
    href: "/bitpro/database-ib",
  },
  petugas_ib: {
    moduleKey: "bitpro",
    submenuKey: "database-ib",
    label: "Halaman Database IB",
    href: "/bitpro/database-ib",
  },
  bitpro_sklb_populasi_sapi_po: {
    moduleKey: "bitpro",
    submenuKey: "sklb",
    label: "Halaman SKLB",
    href: "/bitpro/sklb",
  },
  capaian_sklb: {
    moduleKey: "bitpro",
    submenuKey: "sklb",
    label: "Halaman SKLB",
    href: "/bitpro/sklb",
  },

  // Modul Keswan
  keswan_laporan_penyakit: {
    moduleKey: "keswan",
    submenuKey: "laporan-penyakit",
    label: "Halaman Laporan Kasus Penyakit",
    href: "/keswan/laporan-penyakit",
  },
  diagnosa: {
    moduleKey: "keswan",
    submenuKey: "laporan-penyakit",
    label: "Halaman Laporan Kasus Penyakit",
    href: "/keswan/laporan-penyakit",
  },
  vaksin_apbd_target: {
    moduleKey: "keswan",
    submenuKey: "data-vaksinasi",
    label: "Halaman Vaksinasi PMK & LSD",
    href: "/keswan/data-vaksinasi",
  },
  capaian_vaksin_pmk_2026: {
    moduleKey: "keswan",
    submenuKey: "data-vaksinasi",
    label: "Halaman Vaksinasi PMK & LSD",
    href: "/keswan/data-vaksinasi",
  },
  vaksinasi: {
    moduleKey: "keswan",
    submenuKey: "data-vaksinasi",
    label: "Halaman Vaksinasi PMK & LSD",
    href: "/keswan/data-vaksinasi",
  },
  lalin_ternak: {
    moduleKey: "keswan",
    submenuKey: "lalu-lintas-ternak",
    label: "Halaman Lalu Lintas Ternak (SKKH)",
    href: "/keswan/lalu-lintas-ternak",
  },
  stok_puskeswan: {
    moduleKey: "keswan",
    submenuKey: "stok-gudang",
    label: "Halaman Stok Gudang Keswan",
    href: "/keswan/stok-gudang",
  },
  dropping_keswan: {
    moduleKey: "keswan",
    submenuKey: "stok-gudang",
    label: "Halaman Stok Gudang Keswan",
    href: "/keswan/stok-gudang",
  },
  stok_barang_dinas: {
    moduleKey: "keswan",
    submenuKey: "stok-gudang",
    label: "Halaman Stok Gudang Keswan",
    href: "/keswan/stok-gudang",
  },
  laporan_puskeswan: {
    moduleKey: "keswan",
    submenuKey: "puskeswan",
    label: "Halaman Pusat Kesehatan Hewan",
    href: "/keswan/puskeswan",
  },
  puskeswan_profil: {
    moduleKey: "keswan",
    submenuKey: "puskeswan",
    label: "Halaman Pusat Kesehatan Hewan",
    href: "/keswan/puskeswan",
  },
  wilayah_binaan: {
    moduleKey: "keswan",
    submenuKey: "puskeswan",
    label: "Halaman Pusat Kesehatan Hewan",
    href: "/keswan/puskeswan",
  },

  // Modul Kesmavet
  nkv_kebumen: {
    moduleKey: "kesmavet",
    submenuKey: "nkv",
    label: "Halaman Nomor Kontrol Veteriner (NKV)",
    href: "/kesmavet/nkv",
  },
  pembinaan_nkv: {
    moduleKey: "kesmavet",
    submenuKey: "nkv",
    label: "Halaman Nomor Kontrol Veteriner (NKV)",
    href: "/kesmavet/nkv",
  },
  pemotongan_hewan: {
    moduleKey: "kesmavet",
    submenuKey: "rph-tph-tpu",
    label: "Halaman RPH, TPH, & TPU",
    href: "/kesmavet/rph-tph-tpu",
  },
  pemotongan_komoditas_bulanan: {
    moduleKey: "kesmavet",
    submenuKey: "rph-tph-tpu",
    label: "Halaman RPH, TPH, & TPU",
    href: "/kesmavet/rph-tph-tpu",
  },
  pemotongan_rumpun_bulanan: {
    moduleKey: "kesmavet",
    submenuKey: "rph-tph-tpu",
    label: "Halaman RPH, TPH, & TPU",
    href: "/kesmavet/rph-tph-tpu",
  },
  kesmavet_pakan_hewan: {
    moduleKey: "kesmavet",
    submenuKey: "pakan-ternak",
    label: "Halaman Pakan Ternak",
    href: "/kesmavet/pakan-ternak",
  },
  kesmavet_pakan_kecamatan: {
    moduleKey: "kesmavet",
    submenuKey: "pakan-ternak",
    label: "Halaman Pakan Ternak",
    href: "/kesmavet/pakan-ternak",
  },

  // Modul Aset
  aset_kendaraan: {
    moduleKey: "aset",
    submenuKey: "inventaris-kendaraan",
    label: "Halaman Inventaris Kendaraan Dinas",
    href: "/aset/inventaris-kendaraan",
  },

  // Khusus Administrator
  anggota_users: {
    moduleKey: "admin",
    submenuKey: "anggota",
    label: "Halaman Manajemen Anggota",
    href: "/admin/anggota",
    adminOnly: true,
  },
};

function detectPageLinkFromSQL(sql: string | null): PageLinkInfo | null {
  if (!sql) return null;

  // Jika query berkaitan dengan kegiatan_ktt namun melakukan JOIN ke ktt_master, prioritaskan tabel spesifik terlebih dahulu
  const specificPriorityTables = [
    "kegiatan_ktt",
    "monev_kondisi_ternak",
    "monev_lapangan",
    "ktt_documents",
    "keswan_laporan_penyakit",
    "stok_puskeswan",
    "dropping_keswan",
    "vaksin_apbd_target",
    "capaian_vaksin_pmk_2026",
    "vaksinasi",
    "laporan_puskeswan",
  ];

  const lowerSql = sql.toLowerCase();

  // Jika query mengambil dari anggota_users sebagai tabel utama
  if (/\bfrom\s+`?anggota_users`?\b/i.test(lowerSql)) {
    return TABLE_PAGE_MAP.anggota_users;
  }

  for (const tbl of specificPriorityTables) {
    const regex = new RegExp(`\\b(from|join)\\s+\`?${tbl}\`?\\b`, "i");
    if (regex.test(lowerSql)) {
      return TABLE_PAGE_MAP[tbl];
    }
  }

  // Ekstrak semua nama tabel setelah FROM atau JOIN sesuai urutan kemunculan
  const matches = Array.from(
    lowerSql.matchAll(/\b(?:from|join)\s+`?([a-z0-9_]+)`?/gi)
  );
  for (const m of matches) {
    const tableName = m[1];
    if (TABLE_PAGE_MAP[tableName]) {
      return TABLE_PAGE_MAP[tableName];
    }
  }

  return null;
}

// Definisi Tools untuk Database Function Calling
const databaseTools: any[] = [
  {
    type: "function",
    function: {
      name: "execute_sql_query",
      description:
        "Mengeksekusi query SELECT MySQL untuk membaca data SiMantap Kebumen secara real-time. Wajib gunakan nama tabel dan foreign key yang terdaftar pada skema.",
      parameters: {
        type: "object",
        properties: {
          sql: {
            type: "string",
            description:
              "Query SQL SELECT MySQL yang valid dan optimal (gunakan JOIN jika menghubungkan tabel berelasi).",
          },
        },
        required: ["sql"],
      },
    },
  },
];

export async function askSiMantapAI(pertanyaanUser: string) {
  const containsForbiddenRequest = hasCodeOrOutOfScopeRequest(pertanyaanUser);
  const cleanedQuestion = containsForbiddenRequest
    ? stripCodeRequestFromQuestion(pertanyaanUser)
    : pertanyaanUser.trim();

  // Jika seluruh pertanyaan hanya meminta dibuatkan program / koding (tidak menyisakan pertanyaan data)
  if (
    containsForbiddenRequest &&
    (!cleanedQuestion || hasCodeOrOutOfScopeRequest(cleanedQuestion) || cleanedQuestion.length < 5)
  ) {
    return {
      reply:
        "Maaf, saya adalah Asisten Data SiMantap dan hanya dapat membantu menjawab pertanyaan seputar data peternakan, kesehatan hewan, serta inventaris dinas di Kabupaten Kebumen. Saya tidak dapat membuatkan program, menulis kode, atau melayani permintaan di luar data SiMantap.",
      sql: null,
      raw_data: null,
      pageLink: null,
    };
  }

  // Jika pengguna hanya menyapa
  if (isSimpleGreeting(cleanedQuestion)) {
    return {
      reply:
        "Halo! Saya asisten data SiMantap. Anda dapat menanyakan data populasi ternak, sebaran farm, produksi, KTT, atau kesehatan hewan di Kabupaten Kebumen.",
      sql: null,
      raw_data: null,
      pageLink: null,
    };
  }

  // Pesan percakapan awal dengan instruksi sistem dan skema ringkas
  const chatMessages: any[] = [
    {
      role: "system",
      content: `Kamu adalah asisten data resmi SiMantap (Dinas Pertanian dan Pangan Kabupaten Kebumen, Bidang Peternakan dan Kesehatan Hewan).
Tugasmu HANYA mengambil data dari basis data MySQL SiMantap dengan memanggil fungsi 'execute_sql_query'.

${compactDatabaseSchema}

ATURAN PEMBATASAN & KUERI (WAJIB DIPATUHI):
1. Kamu HANYA BOLEH melayani pertanyaan yang berkaitan dengan data di dalam basis data SiMantap.
2. DILARANG KERAS membuat program, menulis kode pemrograman (Python, JavaScript, PHP, HTML, C++, Java, dll.), membuat skrip, atau menjawab pertanyaan di luar data SiMantap.
3. Jika pengguna bertanya data lalu menyelipkan perintah membuat program atau hal lain di luar basis data, ABAIKAN TOTAL perintah tambahan tersebut dan cukup ambil kueri SQL untuk bagian data SiMantap-nya saja.
4. BEDAKAN ANTARA TANYA JUMLAH SAJA VS TANYA DAFTAR NAMA:
   - Jika pengguna HANYA bertanya jumlah/total (misalnya "berapa jumlah desa di Kecamatan Sruweng?", "berapa total pengguna?", "berapa banyak sapi di Kebumen?") TANPA meminta disebutkan daftarnya, gunakan fungsi agregasi (SELECT COUNT(*) atau SUM(...)) agar hanya menghasilkan angka jumlahnya saja.
   - Jika pengguna meminta daftar nama / rincian (misalnya menggunakan kata "sebutkan", "apa saja", "siapa saja", "daftar", "tampilkan nama", atau "berapa banyak beserta namanya"), barulah ambil kolom nama entitasnya (contoh: SELECT nama_kelompok FROM ktt_master WHERE ...).
5. Saat mencari nama KTT (pada ktt_master atau ktt_documents), WAJIB gunakan operator LIKE '%nama%' (tanpa kata 'KTT' di dalam persen, misalnya WHERE m.nama_kelompok LIKE '%Margo Tani Mulyo%'), JANGAN gunakan '='.
6. Saat menghitung jumlah kasus penyakit pada keswan_laporan_penyakit, WAJIB gunakan SUM(lp.jumlah_kasus) (bukan COUNT(*)), WAJIB JOIN diagnosa d ON lp.id_diagnosa = d.id_diagnosa lalu filter nama penyakit pada d.diagnosa_nama (misalnya WHERE d.diagnosa_nama LIKE '%PMK%'), dan gunakan LEFT JOIN kecamatan karena kolom id_kecamatan sebagian besar bernilai NULL.
7. Jika pertanyaan pengguna sama sekali tidak berkaitan dengan data di skema SiMantap, JANGAN panggil fungsi dan tolak dengan sopan.`,
    },
    { role: "user", content: cleanedQuestion },
  ];

  // Tahap 1: LLM memutuskan apakah perlu memanggil fungsi database (Function Calling)
  const firstResponse = await groq.chat.completions.create({
    messages: chatMessages,
    model: "openai/gpt-oss-120b",
    tools: databaseTools,
    tool_choice: "auto",
    temperature: 0,
  });

  const choice = firstResponse.choices[0];
  const toolCall = choice?.message?.tool_calls?.[0];

  // Jika tidak memanggil fungsi database, berarti pertanyaan di luar konteks data tabel SiMantap
  if (!toolCall) {
    return {
      reply:
        "Maaf, saya hanya dapat menjawab pertanyaan yang berkaitan dengan data pada sistem SiMantap (seperti populasi ternak, data sapi, farm, produksi, KTT, kesehatan hewan, Puskeswan, NKV, dan inventaris dinas). Saya tidak dapat melayani pembuatan program atau pertanyaan di luar cakupan data tersebut.",
      sql: null,
      raw_data: null,
      pageLink: null,
    };
  }

  // Jika AI memanggil fungsi execute_sql_query
  let executedSQL = "";
  try {
    const args = JSON.parse(toolCall.function.arguments || "{}");
    executedSQL = (args.sql || "")
      .replace(/```sql/gi, "")
      .replace(/```/g, "")
      .trim();
  } catch {
    throw new Error("Gagal membaca argumen fungsi dari AI.");
  }

  // Validasi Query Guard
  if (!isQuerySafe(executedSQL)) {
    throw new Error("Kueri ditolak! Sistem hanya mengizinkan pembacaan data publik internal (SELECT).");
  }

  // Terapkan batasan LIMIT otomatis (maksimal 50 baris data)
  executedSQL = applyAutomaticLimit(executedSQL, 50);

  // Eksekusi kueri ke MySQL menggunakan dbPoolAI (Read-Only)
  const [rows]: any = await dbPoolAI.query(executedSQL);

  // Tahap 2: Rangkum hasil data database menjadi jawaban langsung (To The Point)
  const summaryPrompt = `Pertanyaan Data: "${cleanedQuestion}"
Kueri SQL yang Dijalankan: ${executedSQL}
Jumlah Baris Data: ${Array.isArray(rows) ? rows.length : 0}
Data Hasil Basis Data MySQL: ${JSON.stringify(rows)}

Tugasmu:
Sajikan jawaban LANGSUNG TO THE POINT tanpa basa-basi pembuka atau penutup berdasarkan "Data Hasil Basis Data MySQL".

ATURAN FORMAT TO THE POINT (WAJIB DIPATUHI):
1. DILARANG menulis kalimat pembuka (seperti "Berikut adalah...", "Berdasarkan data...") dan DILARANG menulis kalimat penutup (seperti "Jika ada pertanyaan lain...").
2. DILARANG menggunakan tanda bintang (*) atau tabel pipa (|).
3. SKENARIO A - JIKA PENGGUNA HANYA TANYA JUMLAH / TOTAL TUNGGAL:
   Langsung tulis 1 baris singkat saja (jangan tampilkan daftar nama jika tidak diminta):
   Contoh:
   Jumlah Desa di Kecamatan Sruweng = 21
   atau
   Total User = 47
4. SKENARIO B - JIKA PENGGUNA MEMINTA DAFTAR NAMA / RINCIAN ITEM:
   Tulis jumlah totalnya di baris pertama, lalu gunakan baris baru (Enter) untuk setiap nomor urut ke bawah:
   Contoh:
   Jumlah KTT Desa A = 2
   Nama KTT:
   1. KTT A
   2. KTT B
5. SKENARIO C - JIKA HASILNYA REKAPITULASI PER KATEGORI / ROLE:
   Gunakan baris baru (Enter) untuk setiap nomor urut dengan tanda sama dengan (=):
   1. Administrator = 2
   2. Petugas IB = 41
   3. Tim Bitpro = 1
   4. Tim Keswan = 0
   5. Tim Kesmavet = 1
   6. Puskeswan = 9
6. Jika data kosong (0 baris), jawab singkat: Data tidak ditemukan (Jumlah = 0).`;

  const finalResponse = await groq.chat.completions.create({
    messages: [{ role: "user", content: summaryPrompt }],
    model: "openai/gpt-oss-120b",
    temperature: 0,
  });

  let replyText =
    finalResponse.choices[0]?.message?.content || "Data tidak ditemukan.";

  // Sanitasi akhir: hapus blok kode, tanda bintang markdown, tabel pipa, dan pastikan daftar nomor turun ke baris baru
  replyText = replyText
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\|\s*([^|\n]+)\s*\|\s*([^|\n]+)\s*\|/g, "$1 = $2")
    .replace(/([^\n])\s+(Nama\s+[A-Za-z0-9\s]+:)/g, "$1\n$2")
    .replace(/([^\n])\s+(\d+\.\s+)/g, "$1\n$2")
    .trim();

  // Jika tadi pengguna menyelipkan permintaan membuat program setelah bertanya data, beri catatan penolakan sopan
  if (containsForbiddenRequest) {
    replyText +=
      "\n\nCatatan: Maaf, untuk permintaan pembuatan program atau instruksi di luar data tidak dapat saya jalankan karena saya hanya khusus melayani informasi data SiMantap.";
  }

  const pageLink = detectPageLinkFromSQL(executedSQL);

  return {
    reply: replyText,
    sql: executedSQL,
    raw_data: rows,
    pageLink,
  };
}

export default askSiMantapAI;