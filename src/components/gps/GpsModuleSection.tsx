"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import LiveMapWrapper from "@/components/map/LiveMapWrapper";
import MapPanel from "@/components/map/MapPanel";
import RoiCalculator from "./RoiCalculator";
import { remainingMeters, type LngLat } from "@/lib/routes";

export default function GpsModuleSection() {
  const [pos, setPos] = useState<LngLat>([40.4188, -3.7038]);

  const distance = remainingMeters(pos);
  const etaMin = Math.max(1, Math.round(distance / 200));
  const speedKmh = 24;
  const savedEuro = 6.45;

  return (
    <section id="gps" className="w-full py-20 lg:py-28 bg-surface-elevated relative overflow-hidden">
      <div className="orb orb-emerald w-[380px] h-[380px] top-10 -right-24 animate-float" aria-hidden />
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            LOCALIS GPS · en vivo
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Logística en tiempo real <span className="gradient-text">sin comisiones</span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
            Mapa oscuro interactivo, repartidor animado y panel de entrega en directo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full">
          <RevealBox className="lg:col-span-3">
            <LiveMapWrapper height={430} onPositionChange={setPos} />
            <p className="text-[11px] text-muted mt-2 text-center">
              Tiles CARTO dark · marcador animado en bucle · scroll desactivado para no secuestrar la rueda
            </p>
          </RevealBox>
          <div className="lg:col-span-2 space-y-6">
            <MapPanel distance={distance} etaMin={etaMin} speedKmh={speedKmh} savedEuro={savedEuro} />
          </div>
        </div>

        <div className="mt-16">
          <RoiCalculator />
        </div>
      </div>
    </section>
  );
}

function RevealBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
