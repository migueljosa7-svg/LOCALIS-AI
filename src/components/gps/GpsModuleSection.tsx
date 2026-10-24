"use client";

import { useCallback, useState } from "react";
import { Bike, Truck, Navigation, Share2, CheckCircle2, Gauge, Clock3, Route as RouteIcon, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import TelemetryMap, { DRIVERS, type Telemetry } from "./TelemetryMap";
import RoiCalculator from "./RoiCalculator";
import ErrorBoundary from "@/components/map/ErrorBoundary";

// Ticket medio y comisión media de plataformas usados en la demo.
const DEMO_TICKET = 24;
const PLATFORM_FEE = 0.25;

function vehicleIcon(vehicle: string) {
  if (/bici/i.test(vehicle)) return Bike;
  if (/furgo/i.test(vehicle)) return Truck;
  return Navigation;
}

export default function GpsModuleSection() {
  const [activeId, setActiveId] = useState(DRIVERS[0].id);
  const [tele, setTele] = useState<Telemetry | null>(null);
  const [delivered, setDelivered] = useState(23);
  const [shared, setShared] = useState(false);

  const onTelemetry = useCallback((t: Telemetry) => {
    // Evita renders si nada visible ha cambiado.
    setTele((prev) =>
      prev &&
      prev.id === t.id &&
      Math.round(prev.remainingM / 10) === Math.round(t.remainingM / 10) &&
      prev.speedKmh === t.speedKmh &&
      prev.etaMin === t.etaMin
        ? prev
        : t
    );
  }, []);
  const onDelivered = useCallback(() => setDelivered((n) => n + 1), []);

  const driver = DRIVERS.find((d) => d.id === activeId) ?? DRIVERS[0];
  const savedToday = delivered * DEMO_TICKET * PLATFORM_FEE;
  const arrived = tele ? tele.progress >= 1 : false;
  const VehicleIcon = vehicleIcon(driver.vehicle);

  const share = () => {
    const msg = `¡Hola! Tu pedido ${driver.orderId} va en camino con ${driver.name}. Síguelo en directo aquí (demo LOCALIS GPS): ${window.location.origin}/#reparto`;
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank", "noopener,noreferrer");
    setShared(true);
    window.setTimeout(() => setShared(false), 2500);
  };

  return (
    <section id="reparto" aria-labelledby="gps-title" className="section-band relative w-full py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="eyebrow eyebrow-live mb-5">
            <span className="live-dot" aria-hidden="true" /> LOCALIS GPS · Telemetría en tiempo real
          </span>
          <h2 id="gps-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Tus repartos en directo, <span className="gradient-text">con tus repartidores</span> y sin comisiones
          </h2>
          <p className="mt-5 text-muted text-base sm:text-lg leading-relaxed">
            Sigue cada pedido en el mapa, comparte el enlace de seguimiento por WhatsApp y deja de regalar entre un{" "}
            <strong className="text-foreground">20 % y un 30 %</strong> de cada venta a Glovo, Uber Eats o Just Eat.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-5">
          {/* Mapa */}
          <div className="border-glow rounded-3xl overflow-hidden shadow-glass min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-white/[0.07] bg-black/20">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <Store size={15} className="text-cobalt-400" aria-hidden="true" /> Frutería Pepe · Zaragoza
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="live-dot" aria-hidden="true" /> {DRIVERS.length} repartidores en ruta
              </span>
            </div>
            <ErrorBoundary>
              <TelemetryMap activeId={activeId} onSelect={setActiveId} onTelemetry={onTelemetry} onDelivered={onDelivered} />
            </ErrorBoundary>
            <div className="flex gap-2 p-3 border-t border-white/[0.07] bg-black/20 overflow-x-auto no-scrollbar" role="group" aria-label="Elegir repartidor">
              {DRIVERS.map((d) => {
                const Icon = vehicleIcon(d.vehicle);
                const active = d.id === activeId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setActiveId(d.id)}
                    aria-pressed={active}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-2 min-h-[44px] px-3 rounded-xl border text-left transition-colors",
                      active ? "bg-cyan-500/10 border-cyan-500/40" : "border-white/[0.08] hover:border-white/20"
                    )}
                  >
                    <Icon size={16} className={active ? "text-cyan-300" : "text-muted"} aria-hidden="true" />
                    <span className="text-xs leading-tight">
                      <span className={cn("block font-semibold", active ? "text-foreground" : "text-foreground/85")}>{d.name}</span>
                      <span className="text-muted">
                        {d.orderId} · {d.zone}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel de telemetría */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className="border-glow rounded-3xl p-5 shadow-glass">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-11 h-11 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-300">
                    <VehicleIcon size={20} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display font-semibold truncate">
                      {driver.name} · {driver.vehicle}
                    </p>
                    <p className="text-xs text-muted truncate">
                      Pedido {driver.orderId} → {driver.customer}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border",
                    arrived ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" : "text-emerald-400 bg-emerald-500/[0.07] border-emerald-500/20"
                  )}
                >
                  {arrived ? <CheckCircle2 size={12} aria-hidden="true" /> : <span className="live-dot" aria-hidden="true" />}
                  {arrived ? "Entregado" : "En ruta"}
                </span>
              </div>

              <dl className="grid grid-cols-3 gap-2 mt-5" aria-live="off">
                <Metric icon={RouteIcon} label="Restante" value={tele ? `${(tele.remainingM / 1000).toFixed(1).replace(".", ",")} km` : "—"} />
                <Metric icon={Clock3} label="Llegada" value={tele ? (arrived ? "Ahora" : `${tele.etaMin} min`) : "—"} live />
                <Metric icon={Gauge} label="Velocidad" value={tele ? `${tele.speedKmh} km/h` : "—"} />
              </dl>

              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-muted mb-1.5">
                  <span>Tu local</span>
                  <span className="tabular-nums">{tele ? Math.round(tele.progress * 100) : 0}%</span>
                  <span>Cliente</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full w-full rounded-full bg-gradient-to-r from-cyan-500 to-cobalt-500 origin-left transition-transform duration-300 ease-linear"
                    style={{ transform: `scaleX(${tele ? tele.progress : 0})` }}
                  />
                </div>
              </div>

              <button type="button" onClick={share} className="btn btn-ghost w-full mt-5 text-sm">
                {shared ? <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
                {shared ? "Abierto en WhatsApp" : "Compartir seguimiento por WhatsApp"}
              </button>
            </div>

            {/* Ahorro en comisiones (métrica clave → esmeralda) */}
            <div className="rounded-3xl p-5 border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.10] to-emerald-500/[0.02]">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/90">Comisiones ahorradas hoy</p>
              <p className="mt-1 font-display text-4xl font-bold text-emerald-400 tabular-nums" aria-live="polite">
                {savedToday.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </p>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                {delivered} entregas propias × {DEMO_TICKET} € de ticket medio × {PLATFORM_FEE * 100}% que habrías pagado a una
                plataforma. <span className="text-emerald-300">Con LOCALIS: 0 € por pedido.</span>
              </p>
            </div>
          </div>
        </div>

        <div id="ahorro" className="mt-14">
          <RoiCalculator />
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  live,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  live?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse rounded-xl border px-2.5 py-3",
        live ? "bg-emerald-500/[0.06] border-emerald-500/20" : "bg-white/[0.03] border-white/[0.07]"
      )}
    >
      <dt className="flex items-center gap-1 text-[10.5px] text-muted mt-1">
        <Icon size={11} aria-hidden="true" /> {label}
      </dt>
      <dd className={cn("font-display text-lg font-bold tabular-nums leading-none", live ? "text-emerald-400" : "text-foreground")}>{value}</dd>
    </div>
  );
}
