"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bot, Send, X, Sparkles, ArrowRight } from "lucide-react";
import { getAuthSession, checkModuleAccess, checkSubmenuAccess } from "@/lib/auth";

type PageLinkInfo = {
  moduleKey: "bitpro" | "keswan" | "kesmavet" | "aset" | "admin";
  submenuKey: string;
  label: string;
  href: string;
  adminOnly?: boolean;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  pageLink?: PageLinkInfo | null;
};

export default function AiChatWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const [canAccessWidget, setCanAccessWidget] = useState(false);
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

  // Verifikasi Hak Akses: Hanya tampilkan widget untuk Administrator, Tim Bitpro, Tim Keswan, dan Tim Kesmavet
  useEffect(() => {
    if (pathname !== "/beranda") {
      setCanAccessWidget(false);
      return;
    }

    const session = getAuthSession();
    if (!session) {
      setCanAccessWidget(false);
      return;
    }

    const role = (session.role || "").toLowerCase();
    const nama = (session.nama || "").toLowerCase();

    // 1. Petugas Lapangan & Puskeswan DILARANG akses widget AI
    if (role.includes("lapangan") || nama.includes("puskeswan")) {
      setCanAccessWidget(false);
      return;
    }

    // 2. Administrator, Tim Bitpro, Tim Keswan, Tim Kesmavet DIIZINKAN akses
    const isAdmin = role.includes("admin") || nama.includes("admin");
    const isBitpro = session.permissions?.bitpro?.enabled === true;
    const isKeswan = session.permissions?.keswan?.enabled === true;
    const isKesmavet = session.permissions?.kesmavet?.enabled === true;

    if (isAdmin || isBitpro || isKeswan || isKesmavet) {
      setCanAccessWidget(true);
    } else {
      setCanAccessWidget(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Cek apakah pengguna yang sedang login memiliki hak akses RBAC ke halaman terkait
  function canUserAccessPageLink(pageLink?: PageLinkInfo | null): boolean {
    if (!pageLink) return false;
    const session = getAuthSession();
    if (!session) return false;

    if (pageLink.adminOnly || pageLink.moduleKey === "admin") {
      return (session.role || "").toLowerCase() === "administrator";
    }

    return (
      checkModuleAccess(pageLink.moduleKey) &&
      checkSubmenuAccess(pageLink.moduleKey, pageLink.submenuKey)
    );
  }

  // Navigasi ke halaman data sesuai mekanisme dashboard /beranda
  function handleNavigateToPage(pageLink: PageLinkInfo) {
    if (!canUserAccessPageLink(pageLink)) return;

    if (pageLink.moduleKey !== "admin" && pathname === "/beranda") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", pageLink.submenuKey);
        window.history.pushState({ tab: pageLink.submenuKey }, "", url.toString());
        window.dispatchEvent(new PopStateEvent("popstate"));
        return;
      } catch {}
    }

    router.push(pageLink.href);
  }

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
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          pageLink: data.pageLink || null,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, koneksi ke asisten sedang mengalami gangguan. Silakan coba kembali sesaat lagi.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Hanya tampilkan widget AI Chat di Dashboard ('/beranda') dan khusus akun yang berhak
  if (pathname !== "/beranda" || !canAccessWidget) {
    return null;
  }

  return (
    <>
      {/* 1. Tombol Bulat Pembuka Chat (Floating Launcher Button) */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Tutup Asisten AI" : "Buka Asisten AI"}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-30 w-14 h-14 rounded-2xl bg-white dark:bg-obsidian text-slate-800 dark:text-white border-2 border-azure shadow-[0_12px_32px_rgba(33,146,255,0.25)] flex items-center justify-center transition-all duration-200 sm:hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-azure/40"
      >
        {open ? (
          <X className="w-6 h-6 text-slate-700 dark:text-white" />
        ) : (
          <Bot className="w-6 h-6 text-azure" />
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-lime border-2 border-white dark:border-obsidian" />
        )}
      </button>

      {/* 2. KOTAK UTAMA POPUP CHAT — Ubah angka /85 pada bg-white/85 dan dark:bg-zinc-950/85 untuk mengatur transparansi */}
      {open && (
        <div className="fixed inset-x-4 bottom-22 sm:inset-x-auto sm:right-7 sm:bottom-24 z-50 sm:w-[400px] h-[500px] max-h-[80vh] rounded-2xl bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* 3. HEADER POPUP — Latar bagian atas */}
          <div className="px-5 py-4 bg-slate-50/80 dark:bg-zinc-900/80 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-azure/15 border border-azure/30 flex items-center justify-center text-azure">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
                  Asisten Data SiMantap
                </h3>
                <p className="text-xs text-emerald-600 dark:text-lime font-mono flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-lime animate-pulse" />
                  Sistem Aktif
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup jendela chat"
              className="w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4. AREA ISI CHAT (Conversation History) — Ubah bg-transparent jika ingin memberi warna khusus di tengah */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 text-sm leading-relaxed bg-transparent">
            {messages.map((m, i) => {
              const showPageButton =
                m.role === "assistant" && canUserAccessPageLink(m.pageLink);

              return (
                <div
                  key={i}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  {/* 5. BALON CHAT (Bubble Chat User vs AI) */}
                  <div
                    className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-azure text-white rounded-br-none shadow-md font-medium"
                        : "bg-slate-100/90 dark:bg-zinc-900/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-zinc-800 rounded-bl-none font-normal shadow-sm"
                    }`}
                  >
                    {m.content}

                    {/* Tombol Pintas Halaman Data (Opsi B - Hanya tampil jika sesuai RBAC user) */}
                    {showPageButton && m.pageLink && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => handleNavigateToPage(m.pageLink!)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-azure hover:underline focus:outline-none"
                        >
                          <span>Lihat {m.pageLink.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Indikator Loading */}
            {loading && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 text-xs w-fit">
                <span className="w-2 h-2 rounded-full bg-azure animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-vitality animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-lime animate-bounce [animation-delay:0.4s]" />
                <span className="font-medium ml-1">Mencari data dinas...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* 6. AREA INPUT PESAN BAWAH */}
          <div className="p-3 bg-slate-50/80 dark:bg-zinc-900/80 border-t border-slate-200/80 dark:border-zinc-800 flex items-center gap-2">
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
              className="flex-1 bg-white/90 dark:bg-zinc-950/90 border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-azure transition-colors"
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