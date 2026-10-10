/**
 * Bloque visual de impacto: métricas numéricas de lo que Stella aporta al negocio.
 *
 * Desglose:
 *  - Horas ahorradas al mes en gestión de citas y facturación.
 *  - Comisiones de delivery evitadas (0% vs 30% de plataformas externas).
 *  - Incremento de visibilidad SEO local en Google Maps.
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Metric {
  value: string;
  label: string;
  sublabel: string;
  icon: ReactNode;
}

const METRICS: Metric[] = [
  {
    value: "86",
    label: "horas",
    sublabel: "Ahorra al mes en gestión de citas y facturación.",
    icon: (
      <>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </>
    ),
  },
  {
    value: "0%",
    label: "comisión",
    sublabel: "Evita las comisiones de delivery (vs 30% de Glovo / Just Eat).",
    icon: (
      <>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <polyline points="12 8 12 12 16 14" />
        </svg>
      </>
    ),
  },
  {
    value: "+62",
    label: "sitios",
    sublabel: "Posicionamientos locales en Google Maps por catálogo." ,
    icon: (
      <>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
          <line x1="13" y1="2" x2="13" y2="21" />
        </svg>
      </>
    ),
  },
];

export default function AiImpactBlock() {
  return (
    <section
      id="impacto-ia"
      className="w-full py-20 lg:py-28 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5 relative overflow-hidden"
    >
      <div className="orb orb-emerald w-[420px] h-[420px] top-10 -right-40 animate-float" aria-hidden />
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Impacto de la IA
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Lo que aporta <span className="gradient-text">Stella a tu negocio</span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
            Números concretos, deducibles y verificables sobre el ahorro de costes y el crecimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className={cn(
                "glass border-glow rounded-2xl p-6 sm:p-8 text-center transition-all hover:-translate-y-1 hover:shadow-neonglow",
                "border border-border/60",
              )}
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                {m.icon}
              </div>
              <p className="text-4xl sm:text-5xl font-bold font-display gradient-text mt-4">
                {m.value}
              </p>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mt-2">
                {m.label}
              </p>
              <p className="text-sm text-muted mt-2 leading-relaxed">{m.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Barra de impacto adicional */}
        <div className="mt-12 glass border-glow rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Horario de cobertura</p>
              <p className="text-lg font-bold font-display">24/7 sin fronteras</p>
              <p className="text-xs text-muted">Atención, citas y facturación fuera del horario habitual.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Reducción de costes administrativos</p>
              <p className="text-lg font-bold font-display">-72%</p>
              <p className="text-xs text-muted">Menos horas en facturación, ticketación y seguimiento.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Reputación local</p>
              <p className="text-lg font-bold font-display">+38%</p>
              <p className="text-xs text-muted">Mejor gestión de reseñas y referidos, más visibilidad en Maps.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
