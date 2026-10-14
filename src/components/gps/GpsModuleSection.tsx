"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SvgMapWrapper from "@/components/map/SvgMapWrapper";
import MapPanel from "@/components/map/MapPanel";
import RoiCalculator from "./RoiCalculator";
import ErrorBoundary from "@/components/map/ErrorBoundary";

export default function GpsModuleSection() {
  // Progreso simulado estable (0..1) sin re-render a 10 Hz: el mapa SVG
  // anima su propio marcador por rAF y aquí solo mostramos métricas demo.
  const [progress, setProgress] = useState(0.35);
  const [activeOrder, setActiveOrder] = useState("#104");
  const sectionRef = useRef<HTMLElement>(null);

  const distance = Math.round(1240 * (1 - progress));
  const etaMin = Math.max(1, Math.round(distance / 200));
  const speedKmh = 24;
  const savedEuro = 6.45;
  const noop = useCallback(() => {}, []);

  // Ticker pausado fuera de pantalla: métricas vivas sin coste en scroll.
  useEffect(() => {
    const el = sectionRef.current;
    let run = true;
    let obs: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== "undefined") {
      obs = new IntersectionObserver((e) => { run = e[0]?.isIntersecting ?? true; }, { threshold: 0.05 });
      obs.observe(el);
    }
    const id = window.setInterval(() => {
      if (document.hidden || !run) return;
      setProgress((p) => {
        const n = p + 0.02;
        return n > 1 ? 0.05 : n;
      });
    }, 1500);
    return () => {
      window.clearInterval(id);
      obs?.disconnect();
    };
  }, []);

  const orders = ["#104", "#108", "#111"];

  return (
    <section id="gps" ref={sectionRef} className="w-full py-20 lg:py-28 bg-surface-elevated relative overflow-hidden" style={{ contentVisibility: "auto" }}>
      <div className="orb orb-emerald w-[380px] h-[380px] top-10 -right-24" aria-hidden />
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
          <div className="lg:col-span-3">
            <ErrorBoundary>
              <SvgMapWrapper
                height={430}
                position={[40.4188, -3.7038]}
                onPositionChange={noop}
              />
            </ErrorBoundary>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              {orders.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => { setActiveOrder(o); setProgress(0.15 + (o.charCodeAt(1) % 50) / 100); }}
                  aria-pressed={activeOrder === o}
                  className={
                    "text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer " +
                    (activeOrder === o
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                      : "bg-background/50 border-border text-muted hover:text-foreground hover:border-emerald-500/30")
                  }
                >
                  Pedido {o}{activeOrder === o ? " · activo" : ""}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted mt-2 text-center">
              Mapa SVG interactivo · pedido activo {activeOrder} · scroll de página nunca secuestrado
            </p>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <MapPanel distance={distance} etaMin={etaMin} speedKmh={speedKmh} savedEuro={savedEuro} orderId={activeOrder} />
          </div>
        </div>

        <div className="mt-16">
          <RoiCalculator />
        </div>
      </div>
    </section>
  );
}
