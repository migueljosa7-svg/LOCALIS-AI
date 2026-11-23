"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, X, CheckCircle2, UserRound } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";

export interface StellaPublicConfig {
  id: string;
  name: string;
  greeting: string;
  /** solo dígitos con prefijo; puede estar vacío */
  whatsapp: string;
  phone?: string;
  privacyUrl: string;
  /** token de sesión firmado por el servidor */
  token: string;
}

type Msg = { role: "user" | "assistant"; content: string; meta?: { model: string; inputTokens: number; outputTokens: number } };

const SUGGESTIONS = ["¿Qué servicios ofrecéis?", "¿Cómo puedo contactar?", "Quiero que me llamen"];

/** Chat de Stella. Se muestra dentro del iframe que instala /stella.js (embedded) o en la prueba del panel. */
export default function StellaChat({ config, autoFocus = true, embedded = false }: { config: StellaPublicConfig; autoFocus?: boolean; embedded?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; expired?: boolean } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, showForm, saved]);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Con el foco dentro del iframe, Escape no llega a la web del cliente: se lo pedimos nosotros.
  useEffect(() => {
    if (!embedded) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && window.parent.postMessage({ type: "stella:close" }, "*");
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embedded]);

  const wa = config.whatsapp ? `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Hola ${config.name}, vengo del chat de la web`)}` : null;

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
        body: JSON.stringify({ token: config.token, messages: next.slice(-24) }),
        signal: AbortSignal.timeout(50_000),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; reply?: string; error?: string; showForm?: boolean; code?: string; meta?: Msg["meta"] };
      if (!res.ok || !data.ok || !data.reply) {
        setError({ text: data.error || "No he podido responder.", expired: data.code === "token" });
        return;
      }
      setMessages([...next, { role: "assistant", content: data.reply, meta: data.meta }]);
      if (data.showForm) setShowForm(true);
    } catch (e) {
      setError({ text: e instanceof Error && e.name === "TimeoutError" ? "No he podido responder a tiempo." : "No hay conexión con el asistente." });
    } finally {
      setBusy(false);
      if (!showForm) inputRef.current?.focus();
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#0B0F17] text-foreground">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
          <Bot size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">Stella · {config.name}</p>
          <p className="text-[11px] text-muted">Asistente virtual con IA</p>
        </div>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#25D366] px-3 text-xs font-bold text-[#05210f]">
            <WhatsAppIcon size={15} /> WhatsApp
          </a>
        )}
        {embedded && (
          <button
            type="button"
            onClick={() => window.parent.postMessage({ type: "stella:close" }, "*")}
            aria-label="Cerrar chat"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-white/5 hover:text-foreground"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-label="Conversación con Stella">
        <Bubble role="assistant">{config.greeting}</Bubble>
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.content}
            {m.meta && (
              <span className="mt-1.5 block text-[10px] text-emerald-300/80" data-testid="stella-meta">
                Respuesta real de {m.meta.model} · {m.meta.inputTokens} + {m.meta.outputTokens} tokens
              </span>
            )}
          </Bubble>
        ))}
        {busy && (
          <div className="flex gap-1 px-1 py-2" role="status" aria-label="Stella está escribiendo">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-cyan-300/70 motion-reduce:animate-none" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
        {showForm && !saved && <ContactForm config={config} onSaved={() => setSaved(true)} onCancel={() => setShowForm(false)} />}
        {saved && (
          <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            <CheckCircle2 size={15} aria-hidden="true" /> Datos enviados a {config.name}. Te contactarán pronto.
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error.text}{" "}
            {error.expired ? (
              <button type="button" onClick={() => window.location.reload()} className="font-semibold underline">
                Reiniciar chat
              </button>
            ) : (
              wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  Escribir por WhatsApp
                </a>
              )
            )}
          </p>
        )}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="min-h-[40px] rounded-full border border-cyan-500/30 bg-cyan-500/[0.06] px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/15">
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
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-base outline-none placeholder:text-muted focus:border-cyan-500/50"
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar mensaje" className="btn btn-primary h-11 w-11 shrink-0 p-0 disabled:opacity-40">
            <Send size={17} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[10.5px] leading-snug text-muted">Stella es una IA y puede equivocarse. No escribas datos personales en el chat.</p>
          {!showForm && !saved && (
            <button type="button" onClick={() => setShowForm(true)} className="inline-flex min-h-[32px] shrink-0 items-center gap-1 text-[11px] font-semibold text-cyan-300 underline">
              <UserRound size={12} aria-hidden="true" /> Quiero que me llamen
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function ContactForm({ config, onSaved, onCancel }: { config: StellaPublicConfig; onSaved: () => void; onCancel: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const id = `stella-form-${config.id}`;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/stella/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: config.token,
          nombre: f.get("nombre"),
          telefono: f.get("telefono"),
          email: f.get("email"),
          mensaje: f.get("mensaje"),
          website: f.get("website"),
          consentimiento: f.get("consentimiento") === "on",
        }),
        signal: AbortSignal.timeout(30_000),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) setErr(data.error || "No se han podido enviar tus datos.");
      else onSaved();
    } catch {
      setErr("No hay conexión. Inténtalo de nuevo o escribe por WhatsApp.");
    } finally {
      setBusy(false);
    }
  }

  const field = "min-h-[44px] w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-base outline-none placeholder:text-muted focus:border-cyan-500/50";
  return (
    <form onSubmit={submit} aria-labelledby={`${id}-t`} className="space-y-2.5 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.05] p-3.5">
      <p id={`${id}-t`} className="text-sm font-semibold">
        Deja tus datos y {config.name} te contactará
      </p>
      <div>
        <label htmlFor={`${id}-n`} className="mb-1 block text-xs text-muted">
          Nombre
        </label>
        <input id={`${id}-n`} name="nombre" required minLength={2} maxLength={120} autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor={`${id}-t2`} className="mb-1 block text-xs text-muted">
          Teléfono
        </label>
        <input id={`${id}-t2`} name="telefono" type="tel" required maxLength={40} autoComplete="tel" inputMode="tel" className={field} />
      </div>
      <div>
        <label htmlFor={`${id}-e`} className="mb-1 block text-xs text-muted">
          Email (opcional)
        </label>
        <input id={`${id}-e`} name="email" type="email" maxLength={160} autoComplete="email" className={field} />
      </div>
      <div>
        <label htmlFor={`${id}-m`} className="mb-1 block text-xs text-muted">
          ¿Qué necesitas? (opcional)
        </label>
        <textarea id={`${id}-m`} name="mensaje" rows={2} maxLength={400} className={field} />
      </div>
      {/* Trampa para robots: las personas no ven este campo. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          No rellenar
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex items-start gap-2 text-xs leading-snug">
        <input type="checkbox" name="consentimiento" required className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-400" />
        <span>
          Acepto que {config.name} use estos datos para contactarme sobre mi consulta.{" "}
          <a href={config.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline">
            Política de privacidad
          </a>
        </span>
      </label>
      {err && (
        <p role="alert" className="text-xs text-red-200">
          {err}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="btn btn-primary min-h-[44px] flex-1 disabled:opacity-50">
          {busy ? "Enviando…" : "Enviar mis datos"}
        </button>
        <button type="button" onClick={onCancel} className="min-h-[44px] rounded-xl px-3 text-xs text-muted underline">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={role === "user" ? "flex justify-end" : "flex"}>
      <p
        className={
          "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed " +
          (role === "user" ? "rounded-br-md bg-cyan-500/90 text-[#04121a]" : "rounded-bl-md border border-white/10 bg-white/[0.05]")
        }
      >
        {children}
      </p>
    </div>
  );
}
