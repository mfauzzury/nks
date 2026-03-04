"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronRight, RotateCcw } from "lucide-react";
import { getPublicZakatTypes, type PublicZakatType } from "@/lib/payer-portal-api";

function BotFace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Head */}
      <rect x="8" y="14" width="48" height="40" rx="12" fill="currentColor" opacity="0.15" />
      <rect x="8" y="14" width="48" height="40" rx="12" stroke="currentColor" strokeWidth="2.5" />
      {/* Antenna */}
      <line x1="32" y1="14" x2="32" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="5" r="3" fill="currentColor" />
      {/* Eyes */}
      <circle cx="23" cy="30" r="4" fill="currentColor" />
      <circle cx="41" cy="30" r="4" fill="currentColor" />
      <circle cx="24.5" cy="28.5" r="1.5" fill="white" />
      <circle cx="42.5" cy="28.5" r="1.5" fill="white" />
      {/* Smile */}
      <path d="M22 40 C26 46, 38 46, 42 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <circle cx="17" cy="37" r="3" fill="currentColor" opacity="0.12" />
      <circle cx="47" cy="37" r="3" fill="currentColor" opacity="0.12" />
    </svg>
  );
}

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  options?: { label: string; value: string }[];
  optionsDisabled?: boolean;
};

const CATEGORIES: Record<string, { label: string; codes: string[] }> = {
  pendapatan: {
    label: "Pendapatan & Simpanan",
    codes: ["ZPENDAPATAN", "ZSIMPANAN", "ZKWSP"],
  },
  perniagaan: {
    label: "Perniagaan & Pelaburan",
    codes: ["ZPERNIAGAAN", "ZSAHAM", "ZKRIPTO", "ZHARTA"],
  },
  logam: {
    label: "Emas & Perak",
    codes: ["ZEMAS", "ZPERAK"],
  },
  pertanian: {
    label: "Pertanian & Ternakan",
    codes: ["ZTANAMAN", "ZPADI", "ZTERNAKAN"],
  },
  wajib: {
    label: "Zakat Fitrah & Fidyah",
    codes: ["ZFITRAH", "FIDYAH"],
  },
  lain: {
    label: "Lain-lain",
    codes: ["QADHA"],
  },
};

let msgId = 0;
function nextId() {
  return ++msgId;
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [zakatTypes, setZakatTypes] = useState<PublicZakatType[]>([]);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  // Load zakat types on first open
  useEffect(() => {
    if (!open || loaded) return;
    getPublicZakatTypes()
      .then((res) => {
        const active = (res.data.types || []).filter((t) => t.isActive !== false);
        setZakatTypes(active);
      })
      .catch(() => setZakatTypes([]))
      .finally(() => setLoaded(true));
  }, [open, loaded]);

  // Show initial message on first open
  useEffect(() => {
    if (open && messages.length === 0 && loaded) {
      showWelcome();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loaded]);

  function showWelcome() {
    const categoryOptions = Object.entries(CATEGORIES).map(([key, cat]) => ({
      label: cat.label,
      value: `cat:${key}`,
    }));
    categoryOptions.push({ label: "Senarai semua jenis zakat", value: "all" });

    setMessages([
      {
        id: nextId(),
        from: "bot",
        text: "Assalamualaikum! Saya boleh membantu anda mengetahui tentang jenis-jenis zakat. Sila pilih kategori:",
        options: categoryOptions,
      },
    ]);
  }

  function disablePreviousOptions() {
    setMessages((prev) => prev.map((m) => (m.options ? { ...m, optionsDisabled: true } : m)));
  }

  function handleOption(value: string) {
    if (value === "restart") {
      showWelcome();
      scrollBottom();
      return;
    }

    disablePreviousOptions();

    if (value === "all") {
      const userMsg: Message = { id: nextId(), from: "user", text: "Senarai semua jenis zakat" };
      const listText = zakatTypes.map((t) => `- ${t.name}`).join("\n");
      const botMsg: Message = {
        id: nextId(),
        from: "bot",
        text: `Berikut adalah senarai jenis zakat yang tersedia:\n\n${listText}\n\nPilih kategori untuk maklumat lanjut:`,
        options: [
          ...Object.entries(CATEGORIES).map(([key, cat]) => ({
            label: cat.label,
            value: `cat:${key}`,
          })),
          { label: "Mula semula", value: "restart" },
        ],
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      scrollBottom();
      return;
    }

    if (value.startsWith("cat:")) {
      const catKey = value.replace("cat:", "");
      const cat = CATEGORIES[catKey];
      if (!cat) return;

      const userMsg: Message = { id: nextId(), from: "user", text: cat.label };

      const typesInCat = zakatTypes.filter((t) => cat.codes.includes(t.code));
      if (typesInCat.length === 0) {
        const botMsg: Message = {
          id: nextId(),
          from: "bot",
          text: "Tiada jenis zakat dalam kategori ini buat masa ini.",
          options: [{ label: "Kembali ke menu utama", value: "restart" }],
        };
        setMessages((prev) => [...prev, userMsg, botMsg]);
        scrollBottom();
        return;
      }

      const botMsg: Message = {
        id: nextId(),
        from: "bot",
        text: `Dalam kategori ${cat.label}, terdapat ${typesInCat.length} jenis zakat. Pilih untuk maklumat lanjut:`,
        options: [
          ...typesInCat.map((t) => ({ label: t.name, value: `type:${t.code}` })),
          { label: "Kembali ke menu utama", value: "restart" },
        ],
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      scrollBottom();
      return;
    }

    if (value.startsWith("type:")) {
      const code = value.replace("type:", "");
      const type = zakatTypes.find((t) => t.code === code);
      if (!type) return;

      const userMsg: Message = { id: nextId(), from: "user", text: type.name };
      const desc = type.description || "Tiada penerangan tersedia buat masa ini.";
      const botMsg: Message = {
        id: nextId(),
        from: "bot",
        text: `**${type.name}**\n\n${desc}`,
        options: [
          { label: "Lihat kategori lain", value: "restart" },
          { label: "Bayar zakat ini", value: "pay" },
        ],
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      scrollBottom();
      return;
    }

    if (value === "pay") {
      const userMsg: Message = { id: nextId(), from: "user", text: "Bayar zakat" };
      const botMsg: Message = {
        id: nextId(),
        from: "bot",
        text: "Untuk membuat bayaran zakat, sila ke portal pembayar. Anda boleh bayar sebagai individu atau korporat.",
        options: [
          { label: "Log Masuk / Daftar", value: "link:/portal/login" },
          { label: "Mula semula", value: "restart" },
        ],
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      scrollBottom();
      return;
    }

    if (value.startsWith("link:")) {
      window.location.href = value.replace("link:", "");
    }
  }

  function renderText(text: string) {
    return text.split("\n").map((line, i) => {
      // Bold **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {i > 0 && <br />}
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
        </span>
      );
    });
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#7E30E1] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#6b28c0] active:scale-95 ${
          open ? "" : "chatbot-attention"
        }`}
        aria-label="Chatbot"
      >
        {open ? <X className="h-6 w-6" /> : <BotFace className="chatbot-attention-icon h-8 w-8" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b bg-[#7E30E1] px-4 py-3 text-white">
            <BotFace className="h-7 w-7" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Panduan Zakat</p>
              <p className="text-xs opacity-80">Tanya saya tentang jenis zakat</p>
            </div>
            <button
              onClick={() => {
                showWelcome();
                scrollBottom();
              }}
              className="rounded-full p-1 hover:bg-white/20"
              title="Mula semula"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {!loaded && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#7E30E1] border-t-transparent" />
                Memuatkan...
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%] space-y-2">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-[#7E30E1] text-white rounded-br-md"
                        : "bg-slate-100 text-slate-800 rounded-bl-md"
                    }`}
                  >
                    {renderText(msg.text)}
                  </div>
                  {msg.options && !msg.optionsDisabled && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleOption(opt.value)}
                          className="inline-flex items-center gap-1 rounded-full border border-[#7E30E1]/30 bg-white px-3 py-1.5 text-xs font-medium text-[#7E30E1] transition-colors hover:bg-[#7E30E1] hover:text-white"
                        >
                          {opt.label}
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
