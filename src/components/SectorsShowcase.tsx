"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Wrench, Stethoscope, Store, CheckCircle2, ArrowRight, Bot, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Vertical {
  id: string;
  icon: LucideIcon;
  label: string;
  tagline: string;
  pain: string;
  metrics: { label: string; value: string }[];
  features: string[];
  panelTitle: string;
  panelRows: { k: string; v: string; live?: boolean }[];
  stellaLine: string;
  noun: string;
}

const VERTICALS: Vertical[] = [
  {
    id: "hosteleria",
    noun: "restaurante",
    icon: UtensilsCrossed,
    label: "Hostelería",
    tagline: "Restaurantes, bares, cafeterías y comida a domicilio",
    pain: "Reservas por teléfono en plena hora punta y un 30 % de cada pedido a domicilio para la plataforma.",
    metrics: [
      { label: "Comisión por pedido", value: "0 %" },
      { label: "Reservas automáticas", value: "24/7" },
      { label: "Repartidores propios", value: "GPS" },
    ],
    features: ["Carta y pedidos online con tu marca", "Reservas de mesa por WhatsApp con Stella", "Reparto propio con seguimiento en vivo"],
    panelTitle: "Panel restaurante",
    panelRows: [
      { k: "Mesa 6 · 21:30 · 4 pax", v: "Confirmada por WhatsApp" },
      { k: "Pedido #231 · domicilio", v: "En ruta · 6 min", live: true },
      { k: "Comisión ahorrada hoy", v: "+96,40 €", live: true },
    ],
    stellaLine: "«Tenemos mesa a las 21:30 para 4. ¿La reservo a tu nombre?»",
  },
  {
    id: "talleres",
    noun: "taller",
    icon: Wrench,
    label: "Talleres",
    tagline: "Mecánica, chapa, neumáticos y servicios técnicos",
    pain: "Llamadas perdidas con las manos en el motor y presupuestos que se quedan sin respuesta.",
    metrics: [
      { label: "Llamadas atendidas", value: "100 %" },
      { label: "Presupuesto enviado", value: "< 5 min" },
      { label: "Aviso coche listo", value: "Auto" },
    ],
    features: ["Cita previa para revisión, ITV y cambio de aceite", "Presupuestos y facturas automáticas con IVA", "Aviso por WhatsApp cuando el coche está listo"],
    panelTitle: "Panel taller",
    panelRows: [
      { k: "Revisión 30.000 km · 9:00", v: "Confirmada" },
      { k: "Presupuesto #12 · frenos", v: "Aceptado · 340 €", live: true },
      { k: "Seat León 1234-KLM", v: "Listo · cliente avisado" },
    ],
    stellaLine: "«Tu Seat ya está listo. Puedes recogerlo hasta las 19:00 🚗»",
  },
  {
    id: "clinicas",
    noun: "clínica",
    icon: Stethoscope,
    label: "Clínicas",
    tagline: "Dental, fisioterapia, estética y veterinaria",
    pain: "Huecos vacíos por citas olvidadas y recepción saturada de llamadas para cambiar horas.",
    metrics: [
      { label: "Ausencias", value: "−70 %" },
      { label: "Recordatorios", value: "Auto" },
      { label: "Cambios de cita", value: "Self-service" },
    ],
    features: ["Agenda online sincronizada con Google Calendar", "Recordatorios y reprogramación por WhatsApp", "Respuestas a dudas frecuentes de pacientes 24/7"],
    panelTitle: "Panel clínica",
    panelRows: [
      { k: "10:30 · Limpieza dental", v: "Recordatorio enviado" },
      { k: "12:00 · Fisioterapia", v: "Reprogramada por el paciente" },
      { k: "Huecos recuperados hoy", v: "3 citas", live: true },
    ],
    stellaLine: "«Te recuerdo tu cita mañana a las 10:30. ¿Confirmas asistencia?»",
  },
  {
    id: "comercios",
    noun: "comercio",
    icon: Store,
    label: "Comercios locales",
    tagline: "Fruterías, panaderías, floristerías y tiendas de barrio",
    pain: "Pedidos sueltos por WhatsApp, apuntes en libreta y entregas sin control.",
    metrics: [
      { label: "Pedidos online", value: "24/7" },
      { label: "Entrega propia", value: "En vivo" },
      { label: "Comisiones", value: "0 €" },
    ],
    features: ["Tienda online y pedidos por WhatsApp ordenados", "Reparto a domicilio con enlace de seguimiento", "Facturas y resumen de caja diario automáticos"],
    panelTitle: "Panel comercio",
    panelRows: [
      { k: "Pedido #118 · cesta fruta", v: "Preparando" },
      { k: "Reparto #104 · Actur", v: "Llega en 4 min", live: true },
      { k: "Caja de hoy", v: "1.240 € · 38 pedidos", live: true },
    ],
    stellaLine: "«Tu pedido sale ahora. Síguelo en directo con este enlace 🛵»",
  },
];

export default function SectorsShowcase() {
  const [activeId, setActiveId] = useState(VERTICALS[0].id);
  const active = VERTICALS.find((v) => v.id === activeId) ?? VERTICALS[0];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Navegación con flechas entre pestañas (patrón WAI-ARIA Tabs).
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + VERTICALS.length) % VERTICALS.length;
    setActiveId(VERTICALS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="sectores" aria-labelledby="sectores-title" className="cv-auto relative w-full py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="eyebrow mb-5">Soluciones por sector</span>
          <h2 id="sectores-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Hecho a medida para <span className="gradient-text">tu tipo de negocio</span>
          </h2>
          <p className="mt-5 text-muted text-base sm:text-lg">Elige tu sector y mira cómo cambia tu día a día con LOCALIS AI.</p>
        </div>

        <div role="tablist" aria-label="Sectores" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {VERTICALS.map((v, i) => {
            const selected = v.id === activeId;
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`tab-${v.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`panel-${v.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(v.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn(
                  "glow-card group rounded-2xl p-4 sm:p-5 text-left border transition-[background-color,border-color,transform] duration-300 active:scale-[0.98]",
                  selected
                    ? "bg-cyan-500/[0.08] border-cyan-500/45 shadow-[0_20px_50px_-25px_rgba(0,242,254,0.5)]"
                    : "glass hover:border-white/20"
                )}
              >
                <span
                  className={cn(
                    "w-11 h-11 rounded-xl border flex items-center justify-center transition-colors",
                    selected ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300" : "bg-white/[0.04] border-white/10 text-muted group-hover:text-foreground"
                  )}
                >
                  <Icon size={21} aria-hidden="true" />
                </span>
                <span className={cn("mt-3 block font-display font-semibold text-[15px] sm:text-base", selected ? "text-foreground" : "text-foreground/85")}>
                  {v.label}
                </span>
                <span className="mt-0.5 hidden sm:block text-xs text-muted leading-snug">{v.tagline}</span>
              </button>
            );
          })}
        </div>

        <div
          id={`panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${active.id}`}
          className="relative"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5"
            >
              <div className="border-glow rounded-3xl p-6 sm:p-8 shadow-glass">
                <p className="text-sm text-muted leading-relaxed">
                  <span className="font-semibold text-foreground">El problema: </span>
                  {active.pain}
                </p>

                <dl className="grid grid-cols-3 gap-2.5 mt-6">
                  {active.metrics.map((m) => (
                    <div key={m.label} className="flex flex-col-reverse rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 p-3 text-center">
                      <dt className="text-[10.5px] sm:text-[11px] text-muted mt-1 leading-tight">{m.label}</dt>
                      <dd className="font-display text-lg sm:text-2xl font-bold text-emerald-400 leading-none">{m.value}</dd>
                    </div>
                  ))}
                </dl>

                <ul className="mt-6 space-y-3">
                  {active.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[15px] text-foreground/90">
                      <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a href="#cita" className="btn btn-primary mt-7 w-full sm:w-auto">
                  Ver cómo quedaría en mi {active.noun} <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>

              <div className="border-glow rounded-3xl p-6 sm:p-8 shadow-glass flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-muted">{active.panelTitle} · demo</p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <span className="live-dot" aria-hidden="true" /> En vivo
                  </span>
                </div>
                <ul className="mt-4 rounded-2xl border border-white/[0.07] bg-[#0B0F17]/70 divide-y divide-white/[0.06]">
                  {active.panelRows.map((r) => (
                    <li key={r.k} className="flex items-center justify-between gap-3 px-4 py-3.5">
                      <span className="text-sm font-medium min-w-0 truncate">{r.k}</span>
                      <span className={cn("text-xs font-semibold text-right shrink-0", r.live ? "text-emerald-400" : "text-cyan-300")}>{r.v}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.06] p-4 flex gap-3 items-start">
                  <span className="w-9 h-9 shrink-0 rounded-xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center">
                    <Bot size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold text-cyan-300">Stella respondiendo por WhatsApp</p>
                    <p className="text-sm text-foreground/90 mt-0.5">{active.stellaLine}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
