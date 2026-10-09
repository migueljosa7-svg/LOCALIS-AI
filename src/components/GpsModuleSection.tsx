"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export const SECTORS = [
  { id: "fruteria", label: "Fruterias y comercio" },
  { id: "floristeria", label: "Floristerias y gourmet" },
  { id: "panaderia", label: "Panaderias" },
  { id: "restaurante", label: "Restauracion y delivery" },
] as const;

export type SectorId = (typeof SECTORS)[number]["id"];

export const SECTOR_BENEFITS: Record<SectorId, string[]> = {
  fruteria: ["Pedidos online 24/7", "Confirmacion por WhatsApp", "Inventario con IA"],
  floristeria: ["Rastreo de ramos", "Presupuestos automaticos", "Recordatorios de entrega"],
  panaderia: ["Produccion diaria", "Envios programados", "Cadena de frio"],
  restaurante: ["Menu online", "Pedidos en tiempo real", "Enlace de rastreo"],
};

export default function GpsModuleSection() {
  const [monthlySales, setMonthlySales] = useState(5000);
  const [commission, setCommission] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [activeSector, setActiveSector] = useState<SectorId>("fruteria");

  const fee = Math.round((monthlySales * commission) / 100);

  return (
    <section id="gps" className="w-full py-20 lg:py-28 bg-bg-elevated relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(0,242,254,0.15),_transparent_50%)]" />
      </div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            LOCALIS GPS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Envios en tiempo real <span className="gradient-text">sin comisiones</span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
            Despliega tu propio modulo GPS con enlaces de rastreo nativos.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full">
          <div className="glass rounded-2xl p-6 lg:p-8 border border-border w-full min-w-0">
            <h3 className="text-lg font-bold font-display mb-2">Cuanto ahorrarias?</h3>
            <p className="text-sm text-muted mb-6">
              Glovo / Just Eat cobran ~30%. LOCALIS GPS cobra 0%.
            </p>
            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">
                  Ventas mensuales: {monthlySales.toLocaleString("es-ES")} EUR
                </label>
                <input
                  type="range"
                  min={500}
                  max={50000}
                  step={500}
                  value={monthlySales}
                  onChange={(e) => {
                    setMonthlySales(Number(e.target.value));
                    setShowResult(true);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">
                  Comision competidores: {commission}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={35}
                  step={1}
                  value={commission}
                  onChange={(e) => {
                    setCommission(Number(e.target.value));
                    setShowResult(true);
                  }}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5"
                >
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted">Competidores</p>
                      <p className="text-xl sm:text-2xl font-bold text-red-400">
                        {fee.toLocaleString("es-ES")} EUR
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">LOCALIS (0%)</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-400">0 EUR</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Ahorro / mes</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                        {fee.toLocaleString("es-ES")} EUR
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-400 font-medium">
                    Ahorras {(fee * 12).toLocaleString("es-ES")} EUR al anio.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setShowResult((v) => !v)}
              className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-all cursor-pointer hover:scale-[1.02]"
            >
              {showResult ? "Ocultar calculo" : "Ver calculo de ahorro"}
            </button>
          </div>
          <GpsBenefits activeSector={activeSector} setActiveSector={setActiveSector} />
        </div>
      </div>
    </section>
  );
}

function GpsBenefits({
  activeSector,
  setActiveSector,
}: {
  activeSector: SectorId;
  setActiveSector: (id: SectorId) => void;
}) {
  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="glass rounded-2xl border border-border w-full overflow-hidden">
        <div className="flex flex-wrap gap-2 p-4 border-b border-border">
          {SECTORS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSector(s.id)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02] active:scale-95",
                activeSector === s.id
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "glass text-muted border border-border hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.ul
              key={activeSector}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 text-sm"
            >
              {SECTOR_BENEFITS[activeSector].map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-muted">{b}</span>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
