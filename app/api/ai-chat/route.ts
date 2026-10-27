// Lokasi: app/api/ai-chat/route.ts
import { NextResponse } from "next/server";
import { askSiMantapAI } from "@/lib/ai/textToSql";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    // Mengambil pesan terakhir yang diketik oleh user di widget chat
    const lastMessage = messages[messages.length - 1]?.content;

    if (!lastMessage) {
      return NextResponse.json({ reply: "Pertanyaan tidak boleh kosong." }, { status: 400 });
    }

    // Menjalankan proses Text-to-SQL (Few-Shot + RAG)
    const hasil = await askSiMantapAI(lastMessage);

    // Mengembalikan properti 'reply', 'sql', dan 'pageLink'
    return NextResponse.json({
      reply: hasil.reply,
      sql: hasil.sql,
      pageLink: hasil.pageLink || null,
    });
  } catch (error: any) {
    console.error("Error AI Text-to-SQL:", error?.message || error);
    // Keamanan: Lindungi kredensial, host, database, dan detail teknis internal dari kebocoran
    return NextResponse.json(
      {
        reply: "Saya tidak diberikan akses lebih detil untuk informasi tersebut.",
      },
      { status: 200 }
    );
  }
}
