"use client";

import { useEffect, useRef } from "react";

/* ════════════════════════════════════════════════════════════════
   Mapa de telemetría GPS (demo) — plano estilizado de Zaragoza.

   Rendimiento: el bucle requestAnimationFrame NO usa estado de React.
   Mueve los marcadores con setAttribute("transform") y pinta el tramo
   recorrido con stroke-dasharray → 0 re-renders por frame. Al padre solo
   se le notifica la telemetría del repartidor activo ~3 veces por segundo.
   Se pausa fuera de pantalla, con la pestaña oculta y con reduced-motion.
   ════════════════════════════════════════════════════════════════ */

export interface Driver {
  id: string;
  name: string;
  vehicle: string;
  orderId: string;
  customer: string;
  zone: string;
  speedKmh: number;
  /** Ruta en coordenadas del viewBox 800×500 (salida desde el local). */
  path: string;
  /** Segundos de animación por trayecto (tiempo comprimido de la demo). */
  loopSec: number;
  /** Desfase inicial 0..1 para que no salgan todos a la vez. */
  offset: number;
}

export interface Telemetry {
  id: string;
  progress: number;
  remainingM: number;
  etaMin: number;
  speedKmh: number;
}

export const HUB = { x: 404, y: 292 };
const METERS_PER_UNIT = 7.5; // ≈ 6 km de ancho de mapa

export const DRIVERS: Driver[] = [
  {
    id: "luis",
    name: "Luis G.",
    vehicle: "Moto eléctrica",
    orderId: "#104",
    customer: "Ana L. · Actur",
    zone: "Actur",
    speedKmh: 24,
    path: "M404 292 C 420 250, 436 222, 452 188 S 498 128, 548 112 S 628 84, 668 70",
    loopSec: 22,
    offset: 0.35,
  },
  {
    id: "marta",
    name: "Marta R.",
    vehicle: "Furgoneta",
    orderId: "#108",
    customer: "Rest. La Esquina · Delicias",
    zone: "Delicias",
    speedKmh: 19,
    path: "M404 292 C 360 300, 318 286, 272 300 S 190 342, 150 336 S 98 322, 72 330",
    loopSec: 26,
    offset: 0.6,
  },
  {
    id: "pedro",
    name: "Pedro M.",
    vehicle: "Bici cargo",
    orderId: "#111",
    customer: "Clínica Dental Sol · Romareda",
    zone: "Romareda",
    speedKmh: 15,
    path: "M404 292 C 414 330, 396 360, 410 392 S 452 430, 470 452",
    loopSec: 18,
    offset: 0.1,
  },
];

const LANDMARKS = [
  { x: 372, y: 214, label: "Basílica del Pilar" },
  { x: 214, y: 258, label: "Aljafería" },
  { x: 92, y: 360, label: "Estación Delicias" },
  { x: 470, y: 472, label: "Parque Grande" },
  { x: 650, y: 52, label: "Actur" },
];

export default function TelemetryMap({
  activeId,
  onSelect,
  onTelemetry,
  onDelivered,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  onTelemetry: (t: Telemetry) => void;
  onDelivered: (driverId: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const trailRefs = useRef<Record<string, SVGPathElement | null>>({});
  const markerRefs = useRef<Record<string, SVGGElement | null>>({});

  // Refs para leer los props más recientes desde el bucle sin reiniciarlo.
  const activeRef = useRef(activeId);
  const telemetryCb = useRef(onTelemetry);
  const deliveredCb = useRef(onDelivered);
  const emitRef = useRef<() => void>(() => {});
  activeRef.current = activeId;
  telemetryCb.current = onTelemetry;
  deliveredCb.current = onDelivered;

  // Al cambiar de repartidor activo, refresca el panel al instante.
  useEffect(() => {
    emitRef.current();
  }, [activeId]);

  useEffect(() => {
    const lengths: Record<string, number> = {};
    const progress: Record<string, number> = {};
    for (const d of DRIVERS) {
      const p = pathRefs.current[d.id];
      lengths[d.id] = p ? p.getTotalLength() : 1;
      progress[d.id] = d.offset;
    }

    const place = (d: Driver) => {
      const path = pathRefs.current[d.id];
      const marker = markerRefs.current[d.id];
      const trail = trailRefs.current[d.id];
      if (!path || !marker) return;
      const len = lengths[d.id];
      const t = Math.min(1, progress[d.id]);
      const pt = path.getPointAtLength(len * t);
      marker.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      if (trail) trail.setAttribute("stroke-dasharray", `${(len * t).toFixed(1)} ${len.toFixed(1)}`);
    };

    const emit = () => {
      const d = DRIVERS.find((x) => x.id === activeRef.current) ?? DRIVERS[0];
      const t = Math.min(1, progress[d.id]);
      const remainingM = Math.max(0, lengths[d.id] * (1 - t) * METERS_PER_UNIT);
      const jitter = t >= 1 ? 0 : Math.round(Math.sin(performance.now() / 900) * 2);
      const speed = t >= 1 ? 0 : d.speedKmh + jitter;
      telemetryCb.current({
        id: d.id,
        progress: t,
        remainingM,
        etaMin: t >= 1 ? 0 : Math.max(1, Math.round(remainingM / ((d.speedKmh * 1000) / 60))),
        speedKmh: speed,
      });
    };

    emitRef.current = emit;
    DRIVERS.forEach(place);
    emit();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let visible = false;
    let raf = 0;
    let last = 0;
    let lastEmit = 0;
    const holdUntil: Record<string, number> = {};

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000); // tope tras pestañas en segundo plano
      last = now;
      for (const d of DRIVERS) {
        if (holdUntil[d.id] && now < holdUntil[d.id]) continue;
        if (holdUntil[d.id]) {
          holdUntil[d.id] = 0;
          progress[d.id] = 0;
        }
        progress[d.id] += dt / d.loopSec;
        if (progress[d.id] >= 1) {
          progress[d.id] = 1;
          holdUntil[d.id] = now + 1800; // entrega: pausa breve en destino
          deliveredCb.current(d.id);
        }
        place(d);
      }
      if (now - lastEmit > 320) {
        lastEmit = now;
        emit();
      }
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        if (visible) start();
        else stop();
      },
      { rootMargin: "100px" }
    );
    if (wrapRef.current) io.observe(wrapRef.current);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      <svg
        viewBox="0 0 800 500"
        width="800"
        height="500"
        className="block w-full h-auto"
        role="img"
        aria-label="Mapa de Zaragoza con tres repartidores propios en ruta desde el local hasta sus clientes"
      >
        <defs>
          <radialGradient id="tm-vignette" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#0F1624" />
            <stop offset="100%" stopColor="#0A0E15" />
          </radialGradient>
          <linearGradient id="tm-route" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <pattern id="tm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="800" height="500" fill="url(#tm-vignette)" />
        <rect width="800" height="500" fill="url(#tm-grid)" />

        {/* Parque Grande */}
        <ellipse cx="462" cy="470" rx="70" ry="34" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.12)" />

        {/* Río Ebro + Huerva */}
        <path d="M-20 196 C 90 170, 190 228, 300 214 S 470 168, 560 176 S 720 214, 820 186" stroke="rgba(59,130,246,0.22)" strokeWidth="26" fill="none" strokeLinecap="round" />
        <path d="M-20 196 C 90 170, 190 228, 300 214 S 470 168, 560 176 S 720 214, 820 186" stroke="rgba(96,165,250,0.35)" strokeWidth="1.5" fill="none" />
        <path d="M520 520 C 500 450, 470 400, 452 350 S 420 270, 430 210" stroke="rgba(59,130,246,0.14)" strokeWidth="7" fill="none" />

        {/* Rondas y avenidas principales */}
        <g fill="none" stroke="rgba(255,255,255,0.075)" strokeWidth="3" strokeLinecap="round">
          <ellipse cx="410" cy="300" rx="340" ry="200" strokeDasharray="2 10" />
          <path d="M260 236 C 320 250, 380 240, 440 250 S 520 270, 560 250" />
          <path d="M404 292 L 440 520" />
          <path d="M404 292 L 120 420" />
          <path d="M404 292 L 760 360" />
          <path d="M330 150 L 360 0" />
          <path d="M470 160 L 700 20" />
        </g>
        <g fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1.5">
          <path d="M0 270 H800" />
          <path d="M0 400 H800" />
          <path d="M150 0 V500" />
          <path d="M560 0 V500" />
          <path d="M680 0 V500" />
        </g>
        {/* Puentes */}
        <g stroke="rgba(226,232,240,0.25)" strokeWidth="3" strokeLinecap="round">
          <path d="M340 192 L 346 232" />
          <path d="M452 168 L 458 210" />
          <path d="M560 162 L 562 202" />
        </g>

        {/* Hitos */}
        <g fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" fontSize="14" fill="rgba(148,163,184,0.9)">
          {LANDMARKS.map((l) => (
            <g key={l.label}>
              <circle cx={l.x} cy={l.y} r="3" fill="rgba(148,163,184,0.7)" />
              <text x={l.x + 7} y={l.y + 4}>{l.label}</text>
            </g>
          ))}
          <text x="610" y="232" fill="rgba(96,165,250,0.6)" fontStyle="italic">Río Ebro</text>
        </g>

        {/* Rutas: base tenue + tramo recorrido brillante */}
        {DRIVERS.map((d) => {
          const active = d.id === activeId;
          return (
            <g key={d.id}>
              <path
                ref={(el) => {
                  pathRefs.current[d.id] = el;
                }}
                d={d.path}
                fill="none"
                stroke={active ? "rgba(0,242,254,0.25)" : "rgba(148,163,184,0.16)"}
                strokeWidth={active ? 4 : 3}
                strokeDasharray="6 7"
                strokeLinecap="round"
              />
              <path
                ref={(el) => {
                  trailRefs.current[d.id] = el;
                }}
                d={d.path}
                fill="none"
                stroke={active ? "url(#tm-route)" : "rgba(0,242,254,0.45)"}
                strokeWidth={active ? 4.5 : 3}
                strokeLinecap="round"
                strokeDasharray="0 9999"
              />
              <circle cx={endPoint(d.path).x} cy={endPoint(d.path).y} r={active ? 7 : 5} fill="#10B981" stroke="#0B0F17" strokeWidth="2.5" />
            </g>
          );
        })}

        {/* Local del negocio */}
        <g transform={`translate(${HUB.x} ${HUB.y})`}>
          <circle r="22" fill="rgba(59,130,246,0.12)" />
          <rect x="-11" y="-11" width="22" height="22" rx="7" fill="#0B0F17" stroke="#3B82F6" strokeWidth="2.5" />
          <path d="M-5 1 L0 -5 L5 1 V6 H-5 Z" fill="#60A5FA" />
          <text y="-30" textAnchor="middle" fontSize="15" fontWeight="600" fill="#E2E8F0" fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
            Tu local
          </text>
        </g>

        {/* Repartidores */}
        {DRIVERS.map((d) => {
          const active = d.id === activeId;
          return (
            <g
              key={d.id}
              ref={(el) => {
                markerRefs.current[d.id] = el;
              }}
              transform={`translate(${HUB.x} ${HUB.y})`}
              onClick={() => onSelect(d.id)}
              style={{ cursor: "pointer" }}
              aria-hidden="true"
            >
              <circle r="22" fill="transparent" />
              <circle r={active ? 11 : 8} fill="rgba(0,242,254,0.35)" className="tm-pulse" />
              <circle r={active ? 8 : 6} fill={active ? "#00F2FE" : "#67F8FF"} stroke="#0B0F17" strokeWidth="2.5" />
              {active && (
                <g transform="translate(14 -30)">
                  <rect width={d.name.length * 9 + 20} height="28" rx="9" fill="rgba(11,15,23,0.92)" stroke="rgba(0,242,254,0.5)" />
                  <text x="10" y="19" fontSize="15" fontWeight="600" fill="#E2E8F0" fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
                    {d.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Último punto "x y" de una ruta SVG (las rutas terminan en coordenadas absolutas). */
function endPoint(d: string): { x: number; y: number } {
  const nums = d.match(/-?\d+(\.\d+)?/g) ?? ["0", "0"];
  return { x: Number(nums[nums.length - 2]), y: Number(nums[nums.length - 1]) };
}
