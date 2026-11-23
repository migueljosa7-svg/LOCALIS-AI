"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, X, CheckCircle2 } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";

export interface StellaPublicConfig {
  id: string;
  name: string;
  greeting: string;
  whatsapp: string;
  privacyUrl: string;
}

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["¿Cuánto cuesta una web?", "¿Qué incluye?", "Quiero que me llaméis"];

/** Chat de Stella: lo usan el widget de nuestra web y el iframe que se instala en webs de clientes. */
export default function StellaChat({ config, onClose, autoFocus = true }: { config: StellaPublicConfig; onClose?: () => void; autoFocus?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const wa = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Hola ${config.name}, vengo del chat de la web`)}`;

  async function send(text: string) {
    const content = text.trim().slice(0, 1000);
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stella", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business: config.id, messages: next.slice(-24) }),
        signal: AbortSignal.timeout(45_000),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; reply?: string; error?: string; leadSaved?: boolean };
      if (!res.ok || !data.ok || !data.reply) throw new Error(data.error || "No he podido responder.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
      if (data.leadSaved) setSaved(true);
    } catch (e) {
      setError(e instanceof Error && e.name !== "TimeoutError" ? e.message : "No he podido responder a tiempo.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#0B0F17] text-foreground">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
          <Bot size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">Stella · {config.name}</p>
          <p className="text-[11px] text-muted">Asistente virtual con IA</p>
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#25D366] px-3 text-xs font-bold text-[#05210f]">
          <WhatsAppIcon size={15} /> WhatsApp
        </a>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Cerrar chat" className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-white/5 hover:text-foreground">
            <X size={18} />
          </button>
        )}
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        <Bubble role="assistant">{config.greeting}</Bubble>
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.content}
          </Bubble>
        ))}
        {busy && (
          <div className="flex gap-1 px-1 py-2" aria-label="Stella está escribiendo">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-cyan-300/70" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
        {saved && (
          <p className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            <CheckCircle2 size={15} aria-hidden="true" /> Datos enviados a {config.name}. Te contactarán pronto.
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}{" "}
            <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
              Escribir por WhatsApp
            </a>
          </p>
        )}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-cyan-500/30 bg-cyan-500/[0.06] px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/15">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-white/10 p-3"
      >
        <div className="flex items-end gap-2">
          <label htmlFor={`stella-input-${config.id}`} className="sr-only">
            Escribe tu mensaje
          </label>
          <textarea
            id={`stella-input-${config.id}`}
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={1000}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Escribe tu pregunta…"
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[15px] outline-none placeholder:text-muted focus:border-cyan-500/50"
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar" className="btn btn-primary h-11 w-11 shrink-0 p-0 disabled:opacity-40">
            <Send size={17} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 text-[10.5px] leading-snug text-muted">
          Stella es una IA y puede equivocarse. Si nos dejas tus datos, solo los usaremos para contactarte.{" "}
          <a href={config.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline">
            Privacidad
          </a>
        </p>
      </form>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={role === "user" ? "flex justify-end" : "flex"}>
      <p
        className={
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed " +
          (role === "user" ? "rounded-br-md bg-cyan-500/90 text-[#04121a]" : "rounded-bl-md border border-white/10 bg-white/[0.05]")
        }
      >
        {children}
      </p>
    </div>
  );
}
