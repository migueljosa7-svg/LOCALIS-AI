"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MapPin, CalendarDays, ReceiptText, X, Truck, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarCard, CalendarModal } from "./StellaActions";
import { InvoiceCard, InvoiceModal } from "./InvoiceModal";
import { SummaryModal } from "./SummaryModal";
import LiveMapWrapper from "@/components/map/LiveMapWrapper";
import { remainingMeters, haversineMeters, DEMO_ROUTE, type LngLat } from "@/lib/routes";
import {
  detectIntent,
  type StellaMode,
  type StellaAction,
  type IntentId,
} from "./stellaEngine";

type Mode = StellaMode;
type Action = StellaAction;

interface Msg {
  id: string;
  role: "user" | "ai";
  text: string;
  action?: Action;
  intent?: IntentId;
}

const MODES: { id: Mode; label: string; icon: typeof CalendarDays }[] = [
  { id: "general", label: "Stella (todo)", icon: CalendarDays },
  { id: "citas", label: "Citas y agenda", icon: CalendarDays },
  { id: "facturacion", label: "Facturación ERP", icon: ReceiptText },
  { id: "gps", label: "Rastreo GPS", icon: MapPin },
];

const GREETINGS: Record<Mode, string> = {
  general: "Hola 👋 Soy Stella. Pídeme una factura, el resumen de ventas, una cita o el GPS de un pedido.",
  citas: "Hola 👋 Estoy en Modo Citas. Pregúntame por huecos libres o pide una cita.",
  facturacion: "Modo Facturación activo 🧾 Pide una factura y te la preparo al instante.",
  gps: "Modo GPS activo 📍 Dime el pedido y abro el mapa en vivo del repartidor.",
};

const SCRIPTS: Record<Mode, string[]> = {
  general: ["Genera la factura de Pepe", "Resumen del día", "¿Dónde está el pedido #104?"],
  citas: ["Tiene hueco el jueves a las 11:00", "¿Qué citas tengo mañana?"],
  facturacion: ["Genera la factura de Frutería Pepe", "¿Cuánto llevo facturado este mes?"],
  gps: ["¿Dónde está el pedido #104?", "¿Cuánto falta para la entrega?"],
};

const GENERIC_CHIPS = ["¿Qué puedes hacer?", "Resumen del día"];

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
    const { reply, action, intent } = detectIntent(text, mode);
    window.setTimeout(() => {
      setMsgs((p) => [...p, { id: "a" + Date.now(), role: "ai", text: reply, action, intent }]);
      setTyping(false);
      // Despliega la tarjeta/modal/drawer asociada a la intención detectada.
      if (action === "tracking") setTrackOpen(true);
      if (action === "invoice") setInvOpen(true);
      if (action === "calendar") setCalOpen(true);
      if (action === "summary") setSumOpen(true);
    }, 850);
  };

  const speak = () => {
    if (typing || listening) return;
    setListening(true);
    window.setTimeout(() => {
      setListening(false);
      const line = SCRIPTS[mode][Math.floor(Math.random() * SCRIPTS[mode].length)];
      send(line);
    }, 1400);
  };

  const chips = [
    ...SCRIPTS[mode].map((s) => ({ label: s, text: s })),
    { label: GENERIC_CHIPS[0], text: GENERIC_CHIPS[0] },
    { label: GENERIC_CHIPS[1], text: GENERIC_CHIPS[1] },
  ];

  return (
    <section id="stella" className="w-full py-20 lg:py-28 relative overflow-hidden">
      <div className="orb orb-cyan w-[420px] h-[420px] -top-40 -left-32 animate-float" aria-hidden />
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Stella AI · Demo completa
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Elige un modo y <span className="gradient-text">habla con Stella</span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
            Consola multi-modal: voz, texto y escenarios reales por sector.
          </p>
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
                Online
              </span>
            </div>

            <div className="h-72 lg:h-96 overflow-y-auto p-4 space-y-3 w-full">
              <AnimatePresence initial={false}>
                {msgs.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
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
                      {m.action === "calendar" && <CalendarCard onOpen={() => setCalOpen(true)} />}
                      {m.action === "invoice" && <InvoiceCard onOpen={() => setInvOpen(true)} />}
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
                            <p className="text-xs font-semibold">Pedido #104 · en ruta</p>
                          </div>
                          <p className="text-sm font-bold">Luis García · ETA 4 min</p>
                          <button
                            type="button"
                            onClick={() => setTrackOpen(true)}
                            className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer transition-all hover:scale-[1.02]"
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

      <CalendarModal open={calOpen} onClose={() => setCalOpen(false)} />
      <InvoiceModal open={invOpen} onClose={() => setInvOpen(false)} />
      <SummaryModal open={sumOpen} onClose={() => setSumOpen(false)} />

      <AnimatePresence>
        {trackOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-[60] bg-[#0B0F17] border-l border-border p-4 flex flex-col gap-3 overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-display">Pedido #104 · en vivo</h3>
              <button
                type="button"
                onClick={() => setTrackOpen(false)}
                aria-label="Cerrar mapa"
                className="glass p-2 rounded-lg hover:border-cyan-500/40 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <LiveMapWrapper height={300} onPositionChange={setPos} />
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

