"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, CornerDownLeft } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya asisten data SiMantap. Anda dapat menanyakan ringkasan populasi ternak, sebaran farm, atau data produksi di Kebumen.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, koneksi ke asisten sedang mengalami gangguan. Silakan coba kembali sesaat lagi." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating launcher button — 56px touch target */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Tutup Asisten AI" : "Buka Asisten AI"}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 w-14 h-14 rounded-2xl bg-obsidian text-white border-2 border-azure shadow-[0_12px_32px_rgba(33,146,255,0.25)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-azure/40"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-azure" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-lime border-2 border-obsidian" />
        )}
      </button>

      {/* Chat window — clean, responsive, human-crafted */}
      {open && (
        <div className="fixed inset-x-4 bottom-22 sm:inset-x-auto sm:right-7 sm:bottom-24 z-50 sm:w-[400px] h-[500px] max-h-[80vh] rounded-2xl bg-obsidian-surface text-slate-100 border border-obsidian-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 bg-obsidian-soft border-b border-obsidian-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-azure/15 border border-azure/30 flex items-center justify-center text-azure">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white tracking-tight">Asisten Data SiMantap</h3>
                <p className="text-xs text-lime font-mono flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                  Sistem Aktif
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup jendela chat"
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-border/50 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 text-sm leading-relaxed">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-azure text-white rounded-br-none shadow-md font-medium"
                      : "bg-obsidian-soft text-slate-200 border border-obsidian-border rounded-bl-none font-normal"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian-soft border border-obsidian-border text-slate-300 text-xs w-fit">
                <span className="w-2 h-2 rounded-full bg-azure animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-vitality animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-lime animate-bounce [animation-delay:0.4s]" />
                <span className="font-medium ml-1">Mencari data dinas...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input field */}
          <div className="p-3 bg-obsidian-soft border-t border-obsidian-border flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Tanyakan data peternakan..."
              className="flex-1 bg-obsidian border border-obsidian-border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-azure transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Kirim pertanyaan"
              className="min-w-touch min-h-touch h-10 w-10 rounded-xl bg-azure text-white flex items-center justify-center hover:bg-azure/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}