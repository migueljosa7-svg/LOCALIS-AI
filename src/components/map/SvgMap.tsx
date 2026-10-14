"use client";

import { useEffect, useMemo, useState } from "react";

// Mapa callejero de Zaragoza con animacion de repartidor en tiempo real.
const SVGW = 700;
const SVHH = 500;

const MAIN_ROUTE = [
  { x: 50, y: 440 }, { x: 100, y: 410 }, { x: 170, y: 380 },
  { x: 250, y: 350 }, { x: 340, y: 320 }, { x: 420, y: 290 },
  { x: 500, y: 260 }, { x: 580, y: 230 }, { x: 650, y: 210 },
  { x: 690, y: 200 },
];

const STREETS = [
  { x1: 80, y1: 420, x2: 120, y2: 400 },
  { x1: 160, y1: 390, x2: 200, y2: 370 },
  { x1: 240, y1: 360, x2: 280, y2: 340 },
  { x1: 350, y1: 330, x2: 390, y2: 310 },
  { x1: 440, y1: 300, x2: 480, y2: 280 },
  { x1: 520, y1: 270, x2: 560, y2: 250 },
];

const POIS = [
  { id: "pilar", label: "Plaza del Pilar", x: 50, y: 440 },
  { id: "catedral", label: "Catedral", x: 250, y: 350 },
  { id: "espana", label: "Pza. Espana", x: 500, y: 260 },
  { id: "festival", label: "Fiestas del Pilar", x: 580, y: 230 },
];

const C = {
  bg: "#0B0F17",
  street: "#64748b",
  mainStreet: "#a78bfa",
  repartidor: "#22d3ee",
  poi: "#f472b6",
};

function buildRoutePath() {
  return MAIN_ROUTE.map(function (p, i) {
    return (i === 0 ? "M " : "L ") + p.x + " " + p.y;
  }).join(" ");
}

function buildVehiclePoints(x: number, y: number) {
  return x + "," + (y - 5) + " " + (x + 6) + "," + (y + 5) + " " + (x - 6) + "," + (y + 5);
}


export default function SvgMap() {
  const [progress, setProgress] = useState(0.35);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let alive = true;
    let t = progress;
    const step = function () {
      if (!alive) return;
      t += 0.006;
      if (t >= 1) t = 0;
      setProgress(t);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return function () {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [playing]);

  const currentPos = useMemo(function () {
    const segs = MAIN_ROUTE.length - 1;
    const idx = Math.min(segs - 1, Math.floor(progress * segs));
    const f = progress * segs - idx;
    const a = MAIN_ROUTE[idx];
    const b = MAIN_ROUTE[idx + 1];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }, [progress]);

  const routePath = buildRoutePath();
  const vehiclePoints = buildVehiclePoints(currentPos.x, currentPos.y);
  const viewBox = "0 0 " + SVGW + " " + SVHH;

  return (
    <div className="w-full rounded-2xl bg-[#0B0F17] border border-white/10 overflow-hidden" style={{ minHeight: 400 }}>
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F17] via-[#0F172A] to-[#0B0F17]" />
        <svg
          width="100%"
          height="100%"
          viewBox={viewBox}
          className="relative z-10"
          role="application"
          aria-label="Mapa GPS interactivo de reparto en tiempo real de Zaragoza"
        >
          <title>Mapa GPS LOCALIS AI - Zaragoza</title>
          <rect x="0" y="0" width={SVGW} height={SVHH} fill={C.bg} rx="12" />


          {STREETS.map(function (s, i) {
            return (
              <line
                key={"sec" + i}
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke={C.street}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
            );
          })}

          {MAIN_ROUTE.map(function (p, i) {
            const next = MAIN_ROUTE[Math.min(i + 1, MAIN_ROUTE.length - 1)];
            return (
              <line
                key={"main" + i}
                x1={p.x}
                y1={p.y}
                x2={next.x}
                y2={next.y}
                stroke={C.mainStreet}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.7"
              />
            );
          })}

          {POIS.map(function (poi) {
            return (
              <g key={poi.id}>
                <circle cx={poi.x} cy={poi.y} r="6" fill={C.poi} stroke="#fff" strokeWidth="2" />
                <text x={poi.x} y={poi.y - 12} textAnchor="middle" fontSize="9" fill={C.poi} fontWeight="bold">
                  {poi.label}
                </text>
              </g>
            );
          })}


          <path
            d={routePath}
            fill="none"
            stroke={C.repartidor}
            strokeWidth="3"
            strokeDasharray="6 8"
            opacity="0.5"
          />

          <circle cx={currentPos.x} cy={currentPos.y} r="12" fill="transparent" />
          <circle
            cx={currentPos.x}
            cy={currentPos.y}
            r="9"
            fill={C.repartidor}
            stroke="#fff"
            strokeWidth="3"
            opacity="0.3"
          >
            <animate attributeName="r" values="9;14;9" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle
            cx={currentPos.x}
            cy={currentPos.y}
            r="6"
            fill={C.repartidor}
            stroke="#fff"
            strokeWidth="3"
          />
          <polygon points={vehiclePoints} fill={C.repartidor} />

          <g>
            <rect x="12" y="12" width="230" height="180" rx="10" fill="rgba(11,15,23,0.92)" stroke="#334155" strokeWidth="1" />
            <text x="26" y="36" fontSize="12" fill="#e2e8f0" fontWeight="bold">LOCALIS GPS - en vivo</text>
            <text x="26" y="56" fontSize="10" fill="#94a3b8">Repartidor: Miguel</text>
            <text x="26" y="74" fontSize="10" fill="#94a3b8">Pedido: 104 (Fruteria Pepe)</text>
            <text x="26" y="92" fontSize="10" fill="#94a3b8">Zona: Centro - Zaragoza</text>
            <text x="26" y="110" fontSize="10" fill="#94a3b8">Calle actual: C/ Buenos Aires</text>
            <text x="26" y="128" fontSize="10" fill="#22d3ee">ETA: 24 min - 1.240 m restantes</text>
            <text x="26" y="146" fontSize="10" fill="#34d399">Ahorro vs Glovo: 6,45 EUR</text>
            <text x="26" y="166" fontSize="9" fill="#64748b">Actualizacion: cada 15 s</text>
          </g>
        </svg>

        <div className="absolute bottom-4 right-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={function () { setPlaying(function (p) { return !p; }); }}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer flex items-center gap-2"
            aria-label={playing ? "Pausar animacion del repartidor" : "Reanudar animacion del repartidor"}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
            <span className="hidden sm:inline">{playing ? "Pausar" : "Ver como funciona"}</span>
          </button>
        </div>

        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="px-3 py-2 rounded-lg bg-[#0B0F17]/85 border border-white/10 text-white text-xs font-semibold">
            MAPA EN VIVO - ZARAGOZA, ARAGON
          </div>
        </div>
      </div>
    </div>
  );
}
