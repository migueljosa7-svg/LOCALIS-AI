"use client";

import { memo, useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  MapPin,
  CalendarDays,
  ReceiptText,
  X,
  Truck,
  TrendingUp,
  Bot,
  PlayCircle,
  RotateCcw,
  MessageCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarCard, CalendarModal } from "./StellaActions";
import { InvoiceCard, InvoiceModal } from "./InvoiceModal";
import { SummaryModal } from "./SummaryModal";
import LiveMapWrapper from "@/components/map/LiveMapWrapper";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { remainingMeters, haversineMeters, DEMO_ROUTE, type LngLat } from "@/lib/routes";
import { detectIntent, type StellaMode, type StellaAction, type StellaSlots } from "./stellaEngine";

type Channel = "web" | "whatsapp";

interface Msg {
  id: string;
  role: "user" | "ai";
  text: string;
  channel?: Channel;
  action?: StellaAction;
  slots?: StellaSlots;
  chips?: string[];
}

type LogKind = "reply" | "calendar" | "reminder" | "invoice" | "tracking" | "summary";
interface LogItem {
  id: string;
  kind: LogKind;
  text: string;
  time: string;
}

const MODES: { id: StellaMode; label: string; icon: typeof CalendarDays }[] = [
  { id: "general", label: "Todo", icon: Sparkles },
  { id: "citas", label: "Citas", icon: CalendarDays },
  { id: "facturacion", label: "Facturación", icon: ReceiptText },
  { id: "gps", label: "Reparto GPS", icon: MapPin },
];

const GREETINGS: Record<StellaMode, string> = {
  general: "Hola 👋 Soy Stella, la asistente IA de tu negocio. Atiendo WhatsApp, agendo citas, facturo y sigo tus repartos 24/7. Escríbeme o pulsa «Ver demo automática».",
  citas: "Modo Citas 📅 Pregúntame por huecos libres o pide una cita y la confirmo en Google Calendar con aviso por WhatsApp.",
  facturacion: "Modo Facturación 🧾 Pide una factura y la preparo al momento con IVA y PDF.",
  gps: "Modo Reparto 📍 Dime el número de pedido y abro el mapa en vivo del repartidor.",
};

const SUGGESTIONS: Record<StellaMode, string[]> = {
  general: ["¿Tienes hueco mañana?", "Genera la factura de Pepe", "¿Dónde está el pedido #104?", "Resumen del día"],
  citas: ["Tienes hueco el jueves a las 11:00", "¿Qué citas tengo mañana?", "Reserva el viernes a las 17:30"],
  facturacion: ["Genera la factura de Frutería Pepe", "¿Cuánto llevo facturado este mes?"],
  gps: ["¿Dónde está el pedido #104?", "¿Cuánto falta para la entrega?"],
};

function tomorrowLabel() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
}

function nowHHMM() {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

interface ScriptStep {
  user: string;
  ai: string;
  action?: StellaAction;
  slots?: StellaSlots;
  logs: { kind: LogKind; text: string }[];
}

// Guion del autopiloto: un día normal de un negocio local, de principio a fin.
function buildScript(): ScriptStep[] {
  const day = tomorrowLabel();
  return [
    {
      user: "Hola! ¿Tenéis hueco mañana por la tarde para corte y barba?",
      ai: "¡Hola! 😊 Mañana tengo libre a las 16:00, 16:45 y 18:15. ¿Cuál te viene mejor?",
      logs: [{ kind: "reply", text: "WhatsApp respondido en 2 s (fuera de horario)" }],
    },
    {
      user: "A las 16:45 perfecto",
      ai: "Reservado ✅ Corte + barba mañana a las 16:45. Te llegará la confirmación y un recordatorio 2 h antes.",
      action: "calendar",
      slots: { dayLabel: "mañana", dayDate: day, time: "16:45", service: "Corte + barba", client: "Lucía M.", kind: "booking" },
      logs: [
        { kind: "calendar", text: "Cita creada en Google Calendar · mañana 16:45" },
        { kind: "reminder", text: "Recordatorio por WhatsApp programado" },
      ],
    },
    {
      user: "Genial. ¿Me mandáis la factura del pedido de ayer?",
      ai: "Claro, aquí la tienes: factura F-2026-104 con IVA incluido. También te la he enviado por email 📩",
      action: "invoice",
      slots: { client: "Lucía M." },
      logs: [{ kind: "invoice", text: "Factura F-2026-104 emitida y enviada" }],
    },
    {
      user: "Y el pedido #104, ¿por dónde va?",
      ai: "Va con Luis, a unos 650 m de tu casa. Llega en ~4 min. Te paso el enlace para seguirlo en directo 🛵",
      action: "tracking",
      slots: { orderId: "#104" },
      logs: [{ kind: "tracking", text: "Enlace de seguimiento GPS enviado · sin comisión" }],
    },
  ];
}

const LOG_META: Record<LogKind, { icon: ComponentType<{ size?: number }>; className: string }> = {
  reply: { icon: MessageCircle, className: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25" },
  calendar: { icon: CalendarDays, className: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25" },
  reminder: { icon: WhatsAppGlyph, className: "text-[#25D366] bg-[#25D366]/10 border-[#25D366]/25" },
  invoice: { icon: ReceiptText, className: "text-cobalt-400 bg-cobalt-500/10 border-cobalt-500/30" },
  tracking: { icon: Truck, className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
  summary: { icon: TrendingUp, className: "text-cobalt-400 bg-cobalt-500/10 border-cobalt-500/30" },
};

function WhatsAppGlyph({ size = 14 }: { size?: number }) {
  return <WhatsAppIcon size={size} />;
}

function logsForAction(action: StellaAction, slots?: StellaSlots): { kind: LogKind; text: string }[] {
  switch (action) {
    case "calendar":
      return slots?.kind === "availability"
        ? [{ kind: "calendar", text: `Agenda consultada · ${slots?.options?.length ?? 3} huecos libres` }]
        : [
            { kind: "calendar", text: `Cita creada · ${slots?.dayLabel ?? "jueves"} ${slots?.time ?? "11:00"}` },
            { kind: "reminder", text: "Confirmación enviada por WhatsApp" },
          ];
    case "invoice":
      return [{ kind: "invoice", text: `Factura emitida para ${slots?.client ?? "cliente"}` }];
    case "tracking":
      return [{ kind: "tracking", text: `Seguimiento GPS ${slots?.orderId ?? "#104"} compartido` }];
    case "summary":
      return [{ kind: "summary", text: "Resumen diario generado" }];
    default:
      return [{ kind: "reply", text: "Consulta respondida al instante" }];
  }
}

let uid = 0;
const nextId = (p: string) => `${p}${++uid}`;

export default function StellaConsole() {
  const [mode, setMode] = useState<StellaMode>("general");
  const [msgs, setMsgs] = useState<Msg[]>([{ id: "g0", role: "ai", text: GREETINGS.general }]);
  const [log, setLog] = useState<LogItem[]>([]);
  const [stats, setStats] = useState({ replies: 0, bookings: 0, invoices: 0 });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [autoplay, setAutoplay] = useState<"idle" | "running" | "done">("idle");
  const [calOpen, setCalOpen] = useState(false);
  const [invOpen, setInvOpen] = useState(false);
  const [sumOpen, setSumOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [pos, setPos] = useState<LngLat>(DEMO_ROUTE[0]);
  const [lastSlots, setLastSlots] = useState<StellaSlots>({});
  const [invoiceClient, setInvoiceClient] = useState("Frutería Pepe");
  const [trackOrder, setTrackOrder] = useState("#104");

  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const interactedRef = useRef(false);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Autoscroll solo dentro del chat (nunca mueve la página).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const pushLogs = useCallback((items: { kind: LogKind; text: string }[]) => {
    const time = nowHHMM();
    setLog((prev) => [...items.map((i) => ({ ...i, id: nextId("l"), time })).reverse(), ...prev].slice(0, 8));
    setStats((s) => ({
      replies: s.replies + 1,
      bookings: s.bookings + items.filter((i) => i.kind === "calendar" && /creada/i.test(i.text)).length,
      invoices: s.invoices + items.filter((i) => i.kind === "invoice").length,
    }));
  }, []);

  // ── Autopiloto ───────────────────────────────────────────────
  const runAutoplay = useCallback(() => {
    clearTimers();
    setMode("general");
    setMsgs([{ id: nextId("g"), role: "ai", text: "▶ Demo automática: así atiende Stella un WhatsApp real de principio a fin." }]);
    setLog([]);
    setStats({ replies: 0, bookings: 0, invoices: 0 });
    setAutoplay("running");

    const script = buildScript();
    let t = 700;
    script.forEach((step, i) => {
      later(() => setMsgs((p) => [...p, { id: nextId("u"), role: "user", text: step.user, channel: "whatsapp" }]), t);
      t += 650;
      later(() => setTyping(true), t);
      t += 1300;
      later(() => {
        setTyping(false);
        setMsgs((p) => [...p, { id: nextId("a"), role: "ai", text: step.ai, action: step.action, slots: step.slots, channel: "whatsapp" }]);
        if (step.slots) setLastSlots(step.slots);
        if (step.slots?.client && step.action === "invoice") setInvoiceClient(step.slots.client);
        if (step.slots?.orderId) setTrackOrder(step.slots.orderId);
        pushLogs(step.logs);
        if (i === script.length - 1) {
          later(() => {
            setAutoplay("done");
            setMsgs((p) => [...p, { id: nextId("a"), role: "ai", text: "Demo completada ✨ Ahora pruébame tú: escribe lo que te preguntaría un cliente.", chips: SUGGESTIONS.general }]);
          }, 900);
        }
      }, t);
      t += 1500;
    });
  }, [clearTimers, later, pushLogs]);

  // Arranca solo la primera vez que la sección es visible (si el usuario no ha tocado nada).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !interactedRef.current) {
          obs.disconnect();
          runAutoplay();
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [runAutoplay]);

  const stopAutoplay = () => {
    interactedRef.current = true;
    if (autoplay === "running") {
      clearTimers();
      setTyping(false);
      setAutoplay("done");
    }
  };

  const switchMode = (next: StellaMode) => {
    stopAutoplay();
    setMode(next);
    setMsgs([{ id: nextId("g"), role: "ai", text: GREETINGS[next] }]);
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    stopAutoplay();
    setMsgs((p) => [...p, { id: nextId("u"), role: "user", text, channel: "web" }]);
    setInput("");
    setTyping(true);
    const { reply, action, slots, chips } = detectIntent(text, mode);
    if (slots) setLastSlots(slots);
    if (slots?.client) setInvoiceClient(slots.client);
    if (slots?.orderId) setTrackOrder(slots.orderId);
    later(() => {
      setMsgs((p) => [...p, { id: nextId("a"), role: "ai", text: reply, action, slots, chips }]);
      setTyping(false);
      pushLogs(logsForAction(action ?? null, slots));
    }, 700);
  };

  const speak = () => {
    if (typing || listening) return;
    stopAutoplay();
    setListening(true);
    later(() => {
      setListening(false);
      const lines = SUGGESTIONS[mode];
      send(lines[Math.floor(Math.random() * lines.length)]);
    }, 1400);
  };

  const openCalendar = useCallback(() => setCalOpen(true), []);
  const openInvoice = useCallback(() => setInvOpen(true), []);
  const openSummary = useCallback(() => setSumOpen(true), []);
  const openTracking = useCallback((orderId?: string) => {
    if (orderId) setTrackOrder(orderId);
    setTrackOpen(true);
  }, []);

  const lastChips = [...msgs].reverse().find((m) => m.role === "ai" && m.chips?.length)?.chips;
  const chips = (lastChips ?? SUGGESTIONS[mode]).slice(0, 4);
  const busy = typing || listening || autoplay === "running";

  return (
    <section id="stella" ref={sectionRef} aria-labelledby="stella-title" className="relative w-full py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="eyebrow mb-5">
            <Bot size={13} aria-hidden="true" /> Simulador en vivo · Stella IA
          </span>
          <h2 id="stella-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Mira a Stella trabajar sola: <span className="gradient-text">WhatsApp, citas y facturas 24/7</span>
          </h2>
          <p className="mt-5 text-muted text-base sm:text-lg leading-relaxed">
            Contesta a tus clientes al instante, encuentra huecos en tu agenda, confirma la cita, emite la factura y comparte el
            seguimiento del pedido. Sin que tú toques el móvil.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 max-w-6xl mx-auto">
          {/* ── Chat ─────────────────────────────────────────── */}
          <div className="border-glow rounded-3xl overflow-hidden flex flex-col min-w-0 shadow-glass">
            <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 py-3 border-b border-white/[0.07] bg-black/20">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1" role="group" aria-label="Modo de Stella">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => switchMode(m.id)}
                    aria-pressed={mode === m.id}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 min-h-[38px] px-3 rounded-lg text-xs font-semibold border transition-colors",
                      mode === m.id
                        ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                        : "text-muted border-white/[0.08] hover:text-foreground hover:border-white/20"
                    )}
                  >
                    <m.icon size={13} aria-hidden="true" />
                    {m.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  interactedRef.current = true;
                  runAutoplay();
                }}
                disabled={autoplay === "running"}
                className="ml-auto inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors disabled:opacity-60"
              >
                {autoplay === "running" ? (
                  <>
                    <span className="live-dot" aria-hidden="true" /> Reproduciendo…
                  </>
                ) : autoplay === "done" ? (
                  <>
                    <RotateCcw size={13} aria-hidden="true" /> Repetir demo
                  </>
                ) : (
                  <>
                    <PlayCircle size={14} aria-hidden="true" /> Ver demo automática
                  </>
                )}
              </button>
            </div>

            <div
              ref={scrollRef}
              className="h-[400px] sm:h-[440px] overflow-y-auto overscroll-contain p-4 space-y-3"
              role="log"
              aria-live="polite"
              aria-label="Conversación con Stella"
            >
              <MessageList
                msgs={msgs}
                trackOrder={trackOrder}
                onOpenCalendar={openCalendar}
                onOpenInvoice={openInvoice}
                onOpenSummary={openSummary}
                onOpenTracking={openTracking}
              />
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.05] border border-white/[0.07] rounded-2xl rounded-bl-md px-4 py-3.5" aria-label="Stella está escribiendo">
                    <span className="typing-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
              )}
              {listening && (
                <div className="flex justify-end items-center gap-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-3 w-fit ml-auto">
                  <span className="voice-wave" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="text-xs text-cyan-300 font-medium">Escuchando…</span>
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-white/[0.07] bg-black/20 space-y-3">
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
                {chips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => send(c)}
                    disabled={busy}
                    className="shrink-0 min-h-[38px] px-3 rounded-lg text-xs font-medium text-foreground/90 bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/40 hover:text-cyan-300 transition-colors disabled:opacity-50"
                  >
                    {c}
                  </button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
              >
                <label htmlFor="stella-input" className="sr-only">
                  Escribe un mensaje a Stella
                </label>
                <input
                  id="stella-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={stopAutoplay}
                  placeholder="Escribe como lo haría tu cliente…"
                  autoComplete="off"
                  enterKeyHint="send"
                  className="focus-ring flex-1 min-w-0 min-h-[48px] px-4 rounded-xl text-[15px] bg-[#0B0F17] border border-white/10 text-foreground placeholder:text-muted/80"
                />
                <button
                  type="button"
                  onClick={speak}
                  disabled={typing || listening}
                  aria-label="Dictar por voz (simulado)"
                  className={cn(
                    "shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl border transition-colors disabled:opacity-50",
                    listening ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300" : "bg-white/[0.04] border-white/10 text-foreground hover:border-cyan-500/40"
                  )}
                >
                  <Mic size={18} />
                </button>
                <button type="submit" disabled={typing || !input.trim()} aria-label="Enviar mensaje" className="btn btn-primary shrink-0 w-12 h-12 min-h-0 p-0 disabled:opacity-50">
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* ── Registro de acciones autónomas ───────────────── */}
          <aside className="border-glow rounded-3xl p-4 sm:p-5 flex flex-col shadow-glass" aria-label="Acciones automáticas de Stella">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-[15px]">Acciones de Stella</h3>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <span className="live-dot" aria-hidden="true" /> En vivo
              </span>
            </div>

            <dl className="grid grid-cols-3 gap-2 mb-4">
              {[
                { k: "Respuestas", v: stats.replies },
                { k: "Citas", v: stats.bookings },
                { k: "Facturas", v: stats.invoices },
              ].map((s) => (
                <div key={s.k} className="flex flex-col-reverse rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 px-2 py-2.5 text-center">
                  <dt className="text-[10.5px] text-muted mt-0.5">{s.k}</dt>
                  <dd className="font-display text-xl font-bold text-emerald-400 tabular-nums">{s.v}</dd>
                </div>
              ))}
            </dl>

            <ol className="space-y-2 flex-1 min-h-[180px]">
              <AnimatePresence initial={false}>
                {log.map((item) => {
                  const meta = LOG_META[item.kind];
                  const Icon = meta.icon;
                  return (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-start gap-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06] p-2.5"
                    >
                      <span className={cn("shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center", meta.className)}>
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0 text-[12.5px] leading-snug">
                        <span className="block text-foreground/95">{item.text}</span>
                        <span className="text-[10.5px] text-muted tabular-nums">{item.time} · automático</span>
                      </span>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              {log.length === 0 && (
                <li className="h-full min-h-[180px] flex flex-col items-center justify-center text-center text-xs text-muted gap-2 rounded-xl border border-dashed border-white/10 p-4">
                  <CheckCircle2 size={18} className="text-cyan-400/70" aria-hidden="true" />
                  Cada acción que Stella haga por ti aparecerá aquí en tiempo real.
                </li>
              )}
            </ol>

            <a href="#cita" className="btn btn-primary mt-4 w-full text-sm">
              Quiero a Stella en mi negocio
            </a>
          </aside>
        </div>
      </div>

      <CalendarModal
        open={calOpen}
        onClose={() => setCalOpen(false)}
        dayLabel={lastSlots.dayLabel}
        dayDate={lastSlots.dayDate}
        time={lastSlots.time}
        service={lastSlots.service}
        client={lastSlots.client}
      />
      <InvoiceModal open={invOpen} onClose={() => setInvOpen(false)} client={invoiceClient} />
      <SummaryModal open={sumOpen} onClose={() => setSumOpen(false)} />

      <AnimatePresence>
        {trackOpen && (
          <motion.aside
            key="track"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={`Seguimiento del pedido ${trackOrder}`}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-[75] bg-[#0B0F17] border-l border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex flex-col gap-3 overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-display">Pedido {trackOrder} · en vivo</h3>
              <button
                type="button"
                onClick={() => setTrackOpen(false)}
                aria-label="Cerrar mapa"
                className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-white/10 hover:border-cyan-500/40 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <LiveMapWrapper height={300} onPositionChange={setPos} />
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-3">
                <p className="font-bold text-cyan-400 tabular-nums">{Math.round(remainingMeters(pos))} m</p>
                <p className="text-[10.5px] text-muted">Restantes</p>
              </div>
              <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 p-3">
                <p className="font-bold text-emerald-400 tabular-nums">{Math.max(1, Math.round(remainingMeters(pos) / 200))} min</p>
                <p className="text-[10.5px] text-muted">Llegada</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-3">
                <p className="font-bold text-cobalt-400 tabular-nums">{Math.round(haversineMeters(DEMO_ROUTE[0], pos))} m</p>
                <p className="text-[10.5px] text-muted">Recorridos</p>
              </div>
            </div>
            <p className="text-xs text-muted text-center">Demo con mapa real de Zaragoza (OpenStreetMap)</p>
          </motion.aside>
        )}
      </AnimatePresence>
    </section>
  );
}

// Lista memoizada: escribir en el input no vuelve a renderizar los mensajes.
const MessageList = memo(function MessageList({
  msgs,
  trackOrder,
  onOpenCalendar,
  onOpenInvoice,
  onOpenSummary,
  onOpenTracking,
}: {
  msgs: Msg[];
  trackOrder: string;
  onOpenCalendar: () => void;
  onOpenInvoice: () => void;
  onOpenSummary: () => void;
  onOpenTracking: (orderId?: string) => void;
}) {
  return (
    <>
      {msgs.map((m) => (
        <div key={m.id} className={cn("chat-message flex w-full", m.role === "user" ? "justify-end" : "justify-start")}>
          <div className={cn("max-w-[88%] sm:max-w-[80%] space-y-2", m.role === "user" && "flex flex-col items-end")}>
            {m.channel === "whatsapp" && (
              <span className={cn("inline-flex items-center gap-1 text-[10.5px] font-medium", m.role === "user" ? "text-[#25D366]" : "text-cyan-400/90")}>
                <WhatsAppIcon size={11} /> {m.role === "user" ? "Cliente · WhatsApp" : "Stella · respuesta automática"}
              </span>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-line",
                m.role === "user"
                  ? m.channel === "whatsapp"
                    ? "bg-[#1f3b2c] text-[#e9fbe9] rounded-br-md"
                    : "bg-brand font-medium rounded-br-md"
                  : "bg-white/[0.05] border border-white/[0.07] rounded-bl-md text-foreground"
              )}
            >
              {m.text}
            </div>
            {m.action === "calendar" && (
              <CalendarCard
                onOpen={onOpenCalendar}
                dayLabel={m.slots?.dayLabel}
                dayDate={m.slots?.dayDate}
                time={m.slots?.time}
                service={m.slots?.service}
                kind={m.slots?.kind}
              />
            )}
            {m.action === "referral" && (
              <div className="border-glow rounded-xl p-4 max-w-sm">
                <p className="text-xs font-bold text-foreground mb-1.5">Auditoría gratuita para tu negocio</p>
                <p className="text-xs text-muted mb-3">Analizamos tu negocio y te preparamos una demo de Stella sin compromiso.</p>
                <a href="#cita" className="btn btn-primary w-full min-h-[40px] text-xs">
                  Reservar auditoría →
                </a>
              </div>
            )}
            {m.action === "invoice" && <InvoiceCard onOpen={onOpenInvoice} client={m.slots?.client} />}
            {m.action === "summary" && (
              <div className="border-glow rounded-xl p-4 max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-cyan-400" aria-hidden="true" />
                  <p className="text-xs font-semibold">Resumen operativo de hoy</p>
                </div>
                <p className="text-sm font-bold text-emerald-400">+18% facturado vs ayer</p>
                <p className="text-xs text-muted mt-0.5">1.463 € · 12 citas · 27 clientes</p>
                <button type="button" onClick={onOpenSummary} className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
                  Ver gráfico y citas →
                </button>
              </div>
            )}
            {m.action === "tracking" && (
              <div className="border-glow rounded-xl p-4 max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Truck size={14} className="text-emerald-400" aria-hidden="true" />
                  <p className="text-xs font-semibold">
                    Pedido {m.slots?.orderId ?? trackOrder} · <span className="text-emerald-400">en ruta</span>
                  </p>
                </div>
                <p className="text-sm font-bold">Seguimiento en vivo · sin comisión</p>
                <button
                  type="button"
                  onClick={() => onOpenTracking(m.slots?.orderId)}
                  className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Abrir mapa en vivo →
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
});
