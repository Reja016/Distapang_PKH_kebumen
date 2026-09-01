import OpenAI from "openai";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

let _groq: OpenAI | null = null;
function getGroqClient() {
  if (!_groq) {
    _groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY!,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return _groq;
}

// ============================================================
// LABEL KOLOM POPULASI TERNAK (60 kolom, urutan sesuai halaman Populasi 2025)
// ============================================================
const POPULASI_HEADERS = [
  "AJ Sapi", "AB Sapi", "MJ Sapi", "MB Sapi", "DJ Sapi", "DB Sapi", "Total Sapi Potong",
  "AJ Perah", "AB Perah", "MJ Perah", "MB Perah", "DJ Perah", "DB Perah", "Total Sapi Perah",
  "AJ Kerbau", "AB Kerbau", "MJ Kerbau", "MB Kerbau", "DJ Kerbau", "DB Kerbau", "Total Kerbau",
  "AJ Kuda", "AB Kuda", "MJ Kuda", "MB Kuda", "DJ Kuda", "DB Kuda", "Total Kuda",
  "AJ Kambing", "AB Kambing", "MJ Kambing", "MB Kambing", "DJ Kambing", "DB Kambing", "Total Kambing",
  "AJ Domba", "AB Domba", "MJ Domba", "MB Domba", "DJ Domba", "DB Domba", "Total Domba",
  "AJ Babi", "AB Babi", "MJ Babi", "MB Babi", "DJ Babi", "DB Babi", "Total Babi",
  "Ayam Kampung", "Ayam Petelur", "Ayam Broiler", "Puyuh", "Itik", "Entog", "Angsa", "Merpati",
  "Kelinci Jantan", "Kelinci Betina",
];
// Keterangan singkatan: AJ=Anak Jantan, AB=Anak Betina, MJ=Muda Jantan, MB=Muda Betina, DJ=Dewasa Jantan, DB=Dewasa Betina

function labelisasiPopulasi(dataArray: number[]) {
  const labeled: Record<string, number> = {};
  POPULASI_HEADERS.forEach((label, i) => {
    labeled[label] = Number(dataArray[i]) || 0;
  });
  return labeled;
}

// ============================================================
// TOOL DEFINITIONS
// ============================================================
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_populasi_ternak",
      description:
        "Data populasi ternak per desa/kecamatan (triwulan 4, 2025), sudah berlabel per jenis ternak (Sapi, Kerbau, Kuda, Kambing, Domba, Babi, unggas, kelinci, dsb, termasuk kategori Anak/Muda/Dewasa Jantan/Betina). Gunakan untuk pertanyaan 'populasi sapi/kambing/dll di desa X berapa'.",
      parameters: {
        type: "object",
        properties: {
          kecamatan: { type: "string", description: "Nama kecamatan (opsional)" },
          desa: { type: "string", description: "Nama desa (opsional)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_data_farm",
      description: "Data farm/peternakan (broiler, petelur, atau umum/general) dari modul Bitpro.",
      parameters: {
        type: "object",
        properties: {
          kategori: { type: "string", description: "Salah satu dari: broiler, petelur, general" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_produksi",
      description: "Data produksi peternakan (Daging atau Telur) untuk tahun tertentu.",
      parameters: {
        type: "object",
        properties: {
          tahun: { type: "string", description: "2025 atau 2026" },
          kategori: { type: "string", description: "Daging atau Telur (opsional)" },
        },
        required: ["tahun"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_data_ktt",
      description: "Data KTT (Kelompok Tani Ternak): nama kelompok, ketua, jumlah anggota, luas lahan, lokasi, dsb.",
      parameters: {
        type: "object",
        properties: {
          kecamatan: { type: "string", description: "Nama kecamatan (opsional)" },
          desa: { type: "string", description: "Nama desa (opsional)" },
          nama_kelompok: { type: "string", description: "Nama/kata kunci nama kelompok (opsional)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_monev_lapangan",
      description: "Data hasil Monev (monitoring evaluasi) lapangan ke KTT: kondisi ternak, lokasi, catatan petugas.",
      parameters: {
        type: "object",
        properties: {
          kecamatan: { type: "string", description: "Nama kecamatan (opsional)" },
          desa: { type: "string", description: "Nama desa (opsional)" },
          tahun: { type: "string", description: "Tahun monev (opsional)" },
        },
      },
    },
  },
];

// ============================================================
// IMPLEMENTASI ASLI (query ke MySQL)
// ============================================================

async function get_populasi_ternak(args: { kecamatan?: string; desa?: string }) {
  let sql = "SELECT kecamatan, no_desa, desa, data_v FROM populasi_tw4_2025 WHERE 1=1";
  const params: any[] = [];
  if (args.kecamatan) {
    sql += " AND kecamatan LIKE ?";
    params.push(`%${args.kecamatan}%`);
  }
  if (args.desa) {
    sql += " AND desa LIKE ?";
    params.push(`%${args.desa}%`);
  }
  const [rows]: any = await pool.query(sql, params);
  return rows.map((r: any) => {
    const rawArray = typeof r.data_v === "string" ? JSON.parse(r.data_v) : r.data_v;
    return {
      kecamatan: r.kecamatan,
      desa: r.desa,
      data: labelisasiPopulasi(rawArray),
    };
  });
}

async function get_data_farm(args: { kategori?: string }) {
  let sql = "SELECT * FROM data_farm";
  const params: any[] = [];
  if (args.kategori) {
    sql += " WHERE kategori = ?";
    params.push(args.kategori);
  }
  sql += " ORDER BY id ASC LIMIT 100";
  const [rows]: any = await pool.query(sql, params);
  return rows.map((r: any) => ({
    kategori: r.kategori,
    data: typeof r.data_json === "string" ? JSON.parse(r.data_json) : r.data_json,
  }));
}

async function get_produksi(args: { tahun: string; kategori?: string }) {
  const table = args.tahun === "2026" ? "produksi_2026" : "produksi_2025";
  let sql = `SELECT * FROM ${table}`;
  const params: any[] = [];
  if (args.kategori) {
    sql += " WHERE kategori = ?";
    params.push(args.kategori);
  }
  sql += " ORDER BY id ASC LIMIT 100";
  const [rows]: any = await pool.query(sql, params);
  return rows;
}

async function get_data_ktt(args: { kecamatan?: string; desa?: string; nama_kelompok?: string }) {
  let sql = "SELECT * FROM ktt_master WHERE 1=1";
  const params: any[] = [];
  if (args.kecamatan) {
    sql += " AND kecamatan LIKE ?";
    params.push(`%${args.kecamatan}%`);
  }
  if (args.desa) {
    sql += " AND desa LIKE ?";
    params.push(`%${args.desa}%`);
  }
  if (args.nama_kelompok) {
    sql += " AND nama_kelompok LIKE ?";
    params.push(`%${args.nama_kelompok}%`);
  }
  sql += " ORDER BY id DESC LIMIT 50";
  const [rows]: any = await pool.query(sql, params);
  return rows;
}

async function get_monev_lapangan(args: { kecamatan?: string; desa?: string; tahun?: string }) {
  let sql = "SELECT id, tahun, kec, desa, namaKtt, kegiatan, jenis, waktuMonev, kondisi, catatan FROM monev_lapangan WHERE 1=1";
  const params: any[] = [];
  if (args.kecamatan) {
    sql += " AND kec LIKE ?";
    params.push(`%${args.kecamatan}%`);
  }
  if (args.desa) {
    sql += " AND desa LIKE ?";
    params.push(`%${args.desa}%`);
  }
  if (args.tahun) {
    sql += " AND tahun = ?";
    params.push(args.tahun);
  }
  sql += " ORDER BY id DESC LIMIT 50";
  const [rows]: any = await pool.query(sql, params);
  return rows;
}

const functionMap: Record<string, (args: any) => Promise<any>> = {
  get_populasi_ternak,
  get_data_farm,
  get_produksi,
  get_data_ktt,
  get_monev_lapangan,
};

const SYSTEM_INSTRUCTION = `Kamu adalah asisten AI untuk SiMantap (Sistem Informasi Manajemen Peternakan Terpadu), 
Dinas Pertanian dan Pangan Kabupaten Kebumen, Bidang Peternakan dan Kesehatan Hewan.
Jawab pertanyaan tentang data peternakan (populasi ternak, data farm/Bitpro, produksi daging & telur, KTT, monev lapangan) 
dengan singkat, jelas, dan dalam Bahasa Indonesia.

Untuk data populasi ternak, setiap jenis ternak besar (Sapi, Kerbau, Kuda, Kambing, Domba, Babi) dipecah dalam kategori:
AJ = Anak Jantan, AB = Anak Betina, MJ = Muda Jantan, MB = Muda Betina, DJ = Dewasa Jantan, DB = Dewasa Betina, dan Total = jumlah keseluruhan jenis itu.
Kalau pengguna tanya "berapa populasi sapi" tanpa spesifik kategori, jumlahkan atau gunakan field "Total Sapi Potong" + "Total Sapi Perah" (kecuali user hanya minta salah satunya). 
Kalau pengguna tanya jenis ternak lain (Kelinci, Ayam, Itik, dsb), field-nya sudah langsung berupa angka jumlah, tanpa perlu dijumlahkan lagi.

Jika kamu memanggil function dan hasilnya berupa data JSON, ringkas dan sajikan poin pentingnya saja ke pengguna dengan format yang mudah dibaca, 
jangan tampilkan JSON mentah. Jika data tidak ditemukan, katakan dengan jujur bahwa datanya tidak ada.`;

const MODEL = "llama-3.3-70b-versatile";

// ============================================================
// RETRY HELPER
// ============================================================
async function callGroqWithRetry(params: any, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await getGroqClient().chat.completions.create(params);
    } catch (err: any) {
      if (err?.code === "tool_use_failed" && i < retries) {
        console.log(`Tool call gagal parsing, coba ulang (percobaan ${i + 1})...`);
        continue;
      }
      throw err;
    }
  }
}

// ============================================================
// HANDLER
// ============================================================
export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const { messages } = await req.json();
    console.log("=== Mulai proses AI (Groq) ===");

    const historyRaw = messages.slice(0, -1);
    const firstUserIndex = historyRaw.findIndex((m: any) => m.role === "user");
    const trimmedHistory = firstUserIndex === -1 ? [] : historyRaw.slice(firstUserIndex);

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_INSTRUCTION },
      ...trimmedHistory.map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: messages[messages.length - 1].content },
    ];

    console.log(`Mengirim ke Groq... (${Date.now() - startTime}ms)`);

    let completion = await callGroqWithRetry({
      model: MODEL,
      messages: chatMessages,
      tools,
    });

    console.log(`Respons pertama diterima (${Date.now() - startTime}ms)`);

    let safety = 0;
    let choice = completion.choices[0];

    while (choice.message.tool_calls && choice.message.tool_calls.length > 0 && safety < 5) {
      chatMessages.push(choice.message);

      for (const toolCall of choice.message.tool_calls) {
        const fnName = toolCall.function.name;
        const fnArgs = JSON.parse(toolCall.function.arguments || "{}");
        console.log(`Memanggil function: ${fnName}`, fnArgs);

        const fn = functionMap[fnName];
        const fnResult = fn ? await fn(fnArgs) : { error: "Function tidak ditemukan" };

        chatMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(fnResult),
        });
      }

      console.log(`Mengirim hasil function ke Groq... (${Date.now() - startTime}ms)`);

      completion = await callGroqWithRetry({
        model: MODEL,
        messages: chatMessages,
        tools,
      });

      console.log(`Respons diterima (${Date.now() - startTime}ms)`);
      choice = completion.choices[0];
      safety++;
    }

    const reply = choice.message.content || "Maaf, saya tidak bisa memproses jawaban.";

    console.log(`=== Selesai total dalam ${Date.now() - startTime}ms ===`);
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error(`Error setelah ${Date.now() - startTime}ms:`, err);
    return NextResponse.json({ reply: "Maaf, terjadi kesalahan pada AI assistant." }, { status: 500 });
  }
}