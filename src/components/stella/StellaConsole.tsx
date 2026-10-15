"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MapPin, CalendarDays, ReceiptText, X, Truck, TrendingUp, Bot, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarCard, CalendarModal } from "./StellaActions";
import { InvoiceCard, InvoiceModal } from "./InvoiceModal";
import { SummaryModal } from "./SummaryModal";
import LiveMapWrapper from "@/components/map/LiveMapWrapper";
import { remainingMeters, haversineMeters, DEMO_ROUTE, type LngLat } from "@/lib/routes";
import { detectIntent, type StellaMode, type StellaAction, type IntentId, type StellaSlots } from "./stellaEngine";

type Mode = StellaMode;
type Action = StellaAction;

interface Msg {
  id: string;
  role: "user" | "ai";
  text: string;
  action?: Action;
  intent?: IntentId;
  slots?: StellaSlots;
  chips?: string[];
}

const MODES: { id: Mode; label: string; icon: typeof CalendarDays }[] = [
  { id: "general", label: "Stella (todo)", icon: CalendarDays },
  { id: "citas", label: "Citas y agenda", icon: CalendarDays },
  { id: "facturacion", label: "Facturación ERP", icon: ReceiptText },
  { id: "gps", label: "Rastreo GPS", icon: MapPin },
];

const GREETINGS: Record<Mode, string> = {
  general: "Hola 👋 Soy Stella, tu asistente virtual IA 24/7 para negocios en Zaragoza. Pídeme una cita, una factura, el resumen de ventas, o pide una auditoría gratuita para tu PYME.",
  citas: "Hola 👋 Estoy en Modo Citas. Pregúntame por huecos libres o pide una cita para tu negocio en Zaragoza.",
  facturacion: "Modo Facturación activo 🧾 Pide una factura y te la preparo al instante.",
  gps: "Modo GPS activo 📍 Dime el pedido y abro el mapa en vivo del repartidor en Zaragoza.",
};

const SCRIPTS: Record<Mode, string[]> = {
  general: ["📅 Pedir cita para mi negocio", "Genera la factura de Pepe", "Resumen del día", "¿Dónde está el pedido #104?"],
  citas: ["Tiene hueco el jueves a las 11:00", "¿Qué citas tengo mañana?", "📅 Pedir cita para mi negocio"],
  facturacion: ["Genera la factura de Frutería Pepe", "¿Cuánto llevo facturado este mes?"],
  gps: ["¿Dónde está el pedido #104?", "¿Cuánto falta para la entrega?"],
};

const GENERIC_CHIPS = ["📅 Pedir cita para mi negocio", "¿Qué puedes hacer?", "Resumen del día"];

export default function StellaConsole() {
  const [mode, setMode] = useState<Mode>("general");
  const [msgs, setMsgs] = useState<Msg[]>([{ id: "g0", role: "ai", text: GREETINGS.general }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [invOpen, setInvOpen] = useState(false);
  const [sumOpen, setSumOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [pos, setPos] = useState<LngLat>(DEMO_ROUTE[0]);
  const [lastSlots, setLastSlots] = useState<StellaSlots>({});
  const [invoiceClient, setInvoiceClient] = useState("Frutería Pepe");
  const [trackOrder, setTrackOrder] = useState("#104");
  const [visible, setVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);

  // Limpieza + pausa inteligente: si la consola no está visible,
  // no se abren modales/drawers automáticamente (evita layout shift).
  useEffect(() => {
    const timers = timersRef.current;
    const el = sectionRef.current;
    let obs: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== "undefined") {
      obs = new IntersectionObserver((entries) => setVisible(entries[0]?.isIntersecting ?? true), { threshold: 0.05 });
      obs.observe(el);
    }
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.length = 0;
      obs?.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setMsgs([{ id: "g_" + m + Date.now(), role: "ai", text: GREETINGS[m] }]);
  };

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    const uid = "u" + Date.now();
    setMsgs((p) => [...p, { id: uid, role: "user", text }]);
    setInput("");
    setTyping(true);
    const { reply, action, intent, slots, chips } = detectIntent(text, mode);
    if (slots) setLastSlots(slots);
    if (slots?.client) setInvoiceClient(slots.client);
    if (slots?.orderId) setTrackOrder(slots.orderId);
    const timer = window.setTimeout(() => {
      setMsgs((p) => [...p, { id: "a" + Date.now(), role: "ai", text: reply, action, intent, slots, chips }]);
      setTyping(false);
      // Solo auto-despliega si la sección está visible (60fps + sin sorpresas).
      if (!visible) return;
      if (action === "tracking") setTrackOpen(true);
      if (action === "invoice") setInvOpen(true);
      if (action === "calendar") setCalOpen(true);
      if (action === "summary") setSumOpen(true);
    }, 650);
    timersRef.current.push(timer);
  };

  const speak = () => {
    if (typing || listening) return;
    setListening(true);
    const timer = window.setTimeout(() => {
      setListening(false);
      const line = SCRIPTS[mode][Math.floor(Math.random() * SCRIPTS[mode].length)];
      send(line);
    }, 1400);
    timersRef.current.push(timer);
  };

  const lastAi = [...msgs].reverse().find((m) => m.role === "ai" && m.chips?.length);
  const chips = lastAi?.chips?.map((c) => ({ label: c, text: c })) ?? [
    ...SCRIPTS[mode].map((s) => ({ label: s, text: s })),
    { label: GENERIC_CHIPS[0], text: GENERIC_CHIPS[0] },
    { label: GENERIC_CHIPS[1], text: GENERIC_CHIPS[1] },
  ];

  return (
    <section id="stella" ref={sectionRef} className="w-full py-20 lg:py-28 relative overflow-hidden scroll-mt-20">
      <div id="ai" className="relative -top-28 pointer-events-none" />
      <div className="orb orb-cyan w-[420px] h-[420px] -top-40 -left-32" aria-hidden />
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Stella IA · Asistente Virtual 24/7 para Negocios en Zaragoza
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Tu Asistente Virtual Inteligente: <span className="gradient-text">Atención y Citas 24/7</span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto text-base sm:text-lg">
            Diseñada para PYMEs y comercios locales de Zaragoza. Resuelve dudas de clientes al instante, sincroniza citas con Google Calendar y deriva solicitudes directas a tu agenda.
          </p>
        </div>

        {/* 3 Pilares visuales de Stella */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          <div className="glass rounded-xl p-4 border border-border/60 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Atención 24/7 sin esperas</h4>
              <p className="text-[11px] text-muted mt-0.5">Responde dudas sobre horarios, tarifas y servicios de tu negocio en Zaragoza.</p>
            </div>
          </div>
          <div className="glass rounded-xl p-4 border border-border/60 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CalendarDays size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Agenda y confirma citas</h4>
              <p className="text-[11px] text-muted mt-0.5">Comprueba huecos libres y sincroniza con Google Calendar y avisos por WhatsApp.</p>
            </div>
          </div>
          <div className="glass rounded-xl p-4 border border-border/60 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-cobalt-500/10 border border-cobalt-500/20 flex items-center justify-center text-cobalt-400 shrink-0">
              <ArrowRight size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Derivación directa (#cita)</h4>
              <p className="text-[11px] text-muted mt-0.5">Cualifica las peticiones y transfiere al cliente directamente a tu formulario.</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <div className="glass border-glow rounded-2xl overflow-hidden w-full">
            <div className="flex flex-wrap gap-2 px-4 sm:px-5 py-3 border-b border-border bg-background/50">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => switchMode(m.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02] active:scale-95",
                    mode === m.id
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : "glass text-muted border border-border hover:text-foreground"
                  )}
                >
                  <m.icon size={13} />
                  {m.label}
                </button>
              ))}
              <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online en Zaragoza
              </span>
            </div>

            <div ref={scrollRef} className="h-72 lg:h-96 overflow-y-auto p-4 space-y-3 w-full">
              <AnimatePresence initial={false}>
                {msgs.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div className="max-w-[85%] space-y-2">
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 text-sm whitespace-pre-line",
                          m.role === "user"
                            ? "bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white rounded-br-sm"
                            : "bg-background border border-border rounded-bl-sm"
                        )}
                      >
                        {m.text}
                      </div>
                      {m.action === "calendar" && (
                        <CalendarCard
                          onOpen={() => setCalOpen(true)}
                          dayLabel={m.slots?.dayLabel}
                          dayDate={m.slots?.dayDate}
                          time={m.slots?.time}
                          service={m.slots?.service}
                          kind={m.slots?.kind}
                        />
                      )}
                      {m.action === "referral" && (
                        <div className="border-glow rounded-xl p-4 bg-gradient-to-r from-cyan-500/10 via-cobalt-500/10 to-transparent border border-cyan-500/40 max-w-sm">
                          <div className="flex items-center gap-2 mb-1.5">
                            <CalendarDays size={16} className="text-cyan-400" />
                            <p className="text-xs font-bold text-foreground">Reserva de Auditoría Gratuita en Zaragoza</p>
                          </div>
                          <p className="text-xs text-muted mb-3">En menos de 2 horas analizamos tu negocio y preparamos tu demo con Stella IA sin compromiso.</p>
                          <a
                            href="#cita"
                            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            Pedir Cita en el Formulario (#cita) →
                          </a>
                        </div>
                      )}
                      {m.action === "invoice" && <InvoiceCard onOpen={() => setInvOpen(true)} client={m.slots?.client} />}
                      {m.action === "summary" && (
                        <div className="border-glow rounded-xl p-4 bg-background/60 max-w-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={14} className="text-cyan-400" />
                            <p className="text-xs font-semibold">Resumen operativo de hoy</p>
                          </div>
                          <p className="text-sm font-bold">+18% facturado vs ayer</p>
                          <p className="text-xs text-muted mt-0.5">1.463 € · 12 citas · 27 clientes</p>
                          <button
                            type="button"
                            onClick={() => setSumOpen(true)}
                            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer transition-all hover:scale-[1.02]"
                          >
                            Ver gráfico y citas →
                          </button>
                        </div>
                      )}
                      {m.action === "tracking" && (
                        <div className="border-glow rounded-xl p-4 bg-background/60 max-w-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <Truck size={14} className="text-emerald-400" />
                            <p className="text-xs font-semibold">Pedido {m.slots?.orderId ?? "#104"} · en ruta</p>
                          </div>
                          <p className="text-sm font-bold">{trackOrder === (m.slots?.orderId ?? "#104") ? "En camino · ETA en vivo" : "En camino"} · abre el mapa</p>
                          <button
                            type="button"
                            onClick={() => { if (m.slots?.orderId) setTrackOrder(m.slots.orderId); setTrackOpen(true); }}
                            className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer transition-colors"
                          >
                            Abrir mapa en vivo →
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted">
                    Stella está escribiendo…
                  </div>
                </div>
              )}
              {listening && (
                <div className="flex justify-end items-center gap-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-3 w-fit ml-auto">
                  <div className="voice-wave" aria-label="Stella escuchando">
                    <span /><span /><span /><span /><span />
                  </div>
                  <span className="text-xs text-cyan-400 font-medium">Escuchando…</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 p-4 border-t border-border bg-background/50 w-full">
              <div className="flex flex-wrap gap-2 w-full">
                {chips.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => send(c.text)}
                    disabled={typing || listening}
                    className="px-3 py-2 rounded-lg glass text-xs font-medium text-foreground border border-border hover:border-cyan-500/40 hover:text-cyan-400 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder={`Escribe en modo ${mode}…`}
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl glass text-sm bg-background border border-border focus-ring text-foreground placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={speak}
                  disabled={typing || listening}
                  aria-label="Hablar con Stella"
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer shrink-0 disabled:opacity-50 hover:scale-[1.02] active:scale-95",
                    listening
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                      : "glass border-border text-foreground"
                  )}
                >
                  <Mic size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => send(input)}
                  disabled={typing || listening}
                  className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white btn-glow transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  aria-label="Enviar"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-[60] bg-[#0B0F17] border-l border-border p-4 flex flex-col gap-3 overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-display">Pedido {trackOrder} · en vivo</h3>
              <button
                type="button"
                onClick={() => setTrackOpen(false)}
                aria-label="Cerrar mapa"
                className="glass p-2 rounded-lg hover:border-cyan-500/40 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            {trackOpen && <LiveMapWrapper height={300} onPositionChange={setPos} />}
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="glass rounded-xl p-3">
                <p className="font-bold text-cyan-400">{Math.round(remainingMeters(pos))} m</p>
                <p className="text-[10px] text-muted">Restantes</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="font-bold text-emerald-400">
                  {Math.max(1, Math.round(remainingMeters(pos) / 200))} min
                </p>
                <p className="text-[10px] text-muted">ETA</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="font-bold text-cobalt-400">
                  {Math.round(haversineMeters(DEMO_ROUTE[0], pos))} m
                </p>
                <p className="text-[10px] text-muted">Recorridos</p>
              </div>
            </div>
            <p className="text-xs text-muted text-center">
              Mapa oscuro con marcador animado · demo Leaflet en tiempo real
            </p>
          </motion.aside>
        )}
      </AnimatePresence>
    </section>
  );
}

