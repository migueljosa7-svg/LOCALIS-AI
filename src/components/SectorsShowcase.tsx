"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import AnimatedCounter from "@/components/effects/AnimatedCounter";

interface Vertical {
  id: string;
  icon: string;
  label: string;
  accent: string;
  metrics: { label: string; value: number; suffix: string; decimals: number }[];
  features: string[];
  mockTitle: string;
  mockRows: { k: string; v: string }[];
}

const VERTICALS: Vertical[] = [
  {
    id: "food",
    icon: "🍎",
    label: "Fruterías y Alimentación",
    accent: "#F97316",
    metrics: [
      { label: "Pedidos/semana", value: 180, suffix: "", decimals: 0 },
      { label: "Ahorro mensual", value: 420, suffix: " EUR", decimals: 0 },
      { label: "Clientes fijos", value: 64, suffix: "%", decimals: 0 },
    ],
    features: ["Pedidos online 24/7", "Inventario con IA", "Entrega con GPS propio"],
    mockTitle: "Panel frutería",
    mockRows: [
      { k: "Pedido #231", v: "En reparto · ETA 8 min" },
      { k: "Stock manzanas", v: "42 kg · OK" },
      { k: "Facturas hoy", v: "6 · 214 EUR" },
    ],
  },
  {
    id: "resto",
    icon: "🍕",
    label: "Restauración y Fast Food",
    accent: "#8B5CF6",
    metrics: [
      { label: "Comidas/día", value: 130, suffix: "", decimals: 0 },
      { label: "Comisiones evitadas", value: 38, suffix: "%", decimals: 0 },
      { label: "Tiempo medio", value: 22, suffix: " min", decimals: 0 },
    ],
    features: ["Menú online propio", "Repartidores integrados", "Cobros sin intermediarios"],
    mockTitle: "Panel restaurante",
    mockRows: [
      { k: "Mesa 7 · takeaway", v: "Listo para recoger" },
      { k: "Ruta repartidor 2", v: "3 entregas activas" },
      { k: "Ingresos hoy", v: "1.240 EUR" },
    ],
  },
  {
    id: "beauty",
    icon: "💈",
    label: "Peluquerías, Estética y Salud",
    accent: "#F472B6",
    metrics: [
      { label: "Citas automatizadas", value: 210, suffix: "/mes", decimals: 0 },
      { label: "No-shows reducidos", value: 71, suffix: "%", decimals: 0 },
      { label: "Horas ahorradas", value: 36, suffix: "h", decimals: 0 },
    ],
    features: ["Agenda con Google Calendar", "Recordatorios WhatsApp", "Ficha de cliente IA"],
    mockTitle: "Panel agenda",
    mockRows: [
      { k: "11:00 · Corte + barba", v: "Confirmada · Carlos" },
      { k: "12:30 · Coloración", v: "Pendiente · Laura" },
      { k: "16:00 · Consulta", v: "Confirmada · Marta" },
    ],
  },
  {
    id: "talleres",
    icon: "🛠️",
    label: "Talleres y Servicios a Domicilio",
    accent: "#14B8A6",
    metrics: [
      { label: "Incidencias/semana", value: 48, suffix: "", decimals: 0 },
      { label: "Respuesta media", value: 4, suffix: " min", decimals: 0 },
      { label: "Satisfacción", value: 4.9, suffix: "/5", decimals: 1 },
    ],
    features: ["Citas de emergencia", "Técnicos con GPS", "Presupuestos automáticos"],
    mockTitle: "Panel taller",
    mockRows: [
      { k: "Incidencia #88", v: "Técnico en ruta · 3 km" },
      { k: "Presupuesto #12", v: "Enviado · 340 EUR" },
      { k: "Piezas pendientes", v: "2 órdenes" },
    ],
  },
  {
    id: "public",
    icon: "🏛️",
    label: "Ayuntamientos y Eventos Municipales",
    accent: "#3B82F6",
    metrics: [
      { label: "Flotas gestionadas", value: 24, suffix: "", decimals: 0 },
      { label: "Eventos cubiertos", value: 96, suffix: "", decimals: 0 },
      { label: "Cumplimiento B2G", value: 99.8, suffix: "%", decimals: 1 },
    ],
    features: ["Dashboard B2G", "Flotas municipales", "Informes de auditoría"],
    mockTitle: "Panel municipal",
    mockRows: [
      { k: "Flota servicios", v: "12 vehículos activos" },
      { k: "Evento 17 sept", v: "Planificado · 8 rutas" },
      { k: "Informe mensual", v: "Generado por IA" },
    ],
  },
];

export default function SectorsShowcase() {
  const [activeId, setActiveId] = useState(VERTICALS[0].id);
  const active = VERTICALS.find((v) => v.id === activeId)!;

  return (
    <section id="sectores" className="w-full py-20 lg:py-28 relative overflow-hidden">
      <div className="orb orb-cobalt w-[360px] h-[360px] bottom-0 -left-24 animate-float" aria-hidden />
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-cobalt-500/10 border border-cobalt-500/20 text-cobalt-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Sectores
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Cada industria, <span className="gradient-text">su interfaz adaptada</span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
            Haz clic en un sector: métricas, funciones y panel cambian al instante.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {VERTICALS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setActiveId(v.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer hover:scale-[1.02] active:scale-95",
                activeId === v.id
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-neonglow"
                  : "glass text-muted border border-border hover:text-foreground"
              )}
            >
              <span>{v.icon}</span>
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full"
          >
            {/* Info */}
            <div className="glass border-glow rounded-2xl p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: active.accent + "22", border: `1px solid ${active.accent}55` }}
                >
                  {active.icon}
                </span>
                <h3 className="text-xl font-bold font-display">{active.label}</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {active.metrics.map((m) => (
                  <div key={m.label} className="rounded-xl bg-background/60 border border-border p-3 text-center">
                    <p className="text-lg font-bold" style={{ color: active.accent }}>
                      <AnimatedCounter value={m.value} suffix={m.suffix} decimals={m.decimals} />
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
              <ul className="space-y-2.5">
                {active.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: active.accent }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock UI adaptada al sector */}
            <div className="glass border-glow rounded-2xl p-6 lg:p-8">
              <p className="text-xs uppercase tracking-widest text-muted mb-4">{active.mockTitle} · demo</p>
              <div className="rounded-xl border border-border bg-background/60 overflow-hidden">
                <div
                  className="h-1.5"
                  style={{ background: `linear-gradient(90deg, ${active.accent}, transparent)` }}
                />
                <div className="p-4 space-y-3">
                  {active.mockRows.map((r) => (
                    <div
                      key={r.k}
                      className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0"
                    >
                      <span className="text-sm font-medium">{r.k}</span>
                      <span className="text-xs font-semibold" style={{ color: active.accent }}>
                        {r.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-background/50 border border-border p-3">
                  <p className="text-[10px] text-muted">Estado flota</p>
                  <p className="text-sm font-bold text-emerald-400">2 repartidores activos</p>
                </div>
                <div className="rounded-xl bg-background/50 border border-border p-3">
                  <p className="text-[10px] text-muted">IA Stella</p>
                  <p className="text-sm font-bold text-cyan-400">Respondiendo 24/7</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

