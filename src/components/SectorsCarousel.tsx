"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SECTORS } from "@/lib/sectors";
import { AI_METRICS } from "@/lib/faqs";

export default function SectorsCarousel() {
  const [activeId, setActiveId] = useState<string>(SECTORS[0].id);

  const metricsMap: Record<string, string> = {
    "Ventas IA": "📈",
    "Nueva cuota": "👥",
    "Citas automáticas": "📅",
    "Entregas GPS": "🚚",
    "Ahorro comisiones": "💰",
  };

  return (
    <div id="sectores" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-cobalt-500/10 border border-cobalt-500/20 text-cobalt-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Sectorización
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Industrias que <span className="gradient-text">confían en LOCALIS AI</span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
            Soluciones adaptadas a cada tipo de negocio y sector.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {SECTORS.map((sector) => (
              <button
                key={sector.id}
                onClick={() => setActiveId(sector.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                  activeId === sector.id
                    ? "bg-cyan-500/10 border border-cyan-500/30"
                    : "glass text-foreground border border-border hover:border-cyan-500/20"
                )}
              >
                <span className="text-xl">{sector.icon}</span>
                <span className="text-sm font-medium truncate">{sector.label}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-2xl p-6 lg:p-8 border border-border"
              >
                {SECTORS.find((s) => s.id === activeId) && (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{SECTORS.find((s) => s.id === activeId)?.icon}</span>
                      <h3 className="text-2xl font-bold font-display">
                        {SECTORS.find((s) => s.id === activeId)?.label}
                      </h3>
                    </div>
                    <p className="text-muted mb-6">
                      {SECTORS.find((s) => s.id === activeId)?.benefits[0]}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {SECTORS.find((s) => s.id === activeId)?.benefits.map((b) => (
                        <div key={b} className="flex items-center gap-2 p-3 rounded-xl bg-background/50">
                          <span className="text-cyan-400">●</span>
                          <span className="text-sm text-foreground">{b}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-12 glass rounded-2xl p-6 lg:p-8 border border-border">
          <h3 className="text-lg font-bold font-display mb-6">Resultados de la IA por día</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {AI_METRICS.map((m: { label: string; value: string; change: number; positive: boolean }) => (
              <div key={m.label} className="text-center p-4 rounded-xl bg-background/50">
                <div className="text-2xl mb-1">{metricsMap[m.label as keyof typeof metricsMap] || "📊"}</div>
                <p className="text-xs text-muted">{m.label}</p>
                <p className="text-lg font-bold font-display mt-1">{m.value}</p>
                <div className={cn("flex items-center gap-1 text-xs mt-1", m.positive ? "text-emerald-400" : "text-red-400")}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 7L5 4L8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {m.change > 0 ? "+" : ""}{m.change}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
