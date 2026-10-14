"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { LngLat } from "@/lib/routes";

/**
 * LOCALIS GPS - Mapa SVG puro (sin API keys, sin dependencias externas).
 * Diseño futurista / night-mode: cuadrícula estelar, camino animado,
 * marcador del repartidor en movimiento y puntos de entrega.
 */
const SVG_WIDTH = 720;
const SVG_HEIGHT = 420;

const ROUTE_SVG: [number, number][] = [
  [52, 400],
  [120, 362],
  [200, 316],
  [292, 272],
  [396, 236],
  [498, 214],
  [588, 200],
  [656, 189],
  [700, 182],
];
const DEST_SVG: [number, number] = [700, 182];
const DELIVERY_INDICES = [3, 5, 7];
const DRIVER_RADIUS = 8;
const DELIVERY_RADIUS = 5;

export interface SvgMapProps {
  position: LngLat;
  onPositionChange?: (pos: LngLat) => void;
  height?: number;
  className?: string;
  interactive?: boolean;
}

function interpolateRoute(route: [number, number][], t: number): [number, number] {
  const segments = route.length - 1;
  const clamped = Math.min(1, Math.max(0, t));
  const raw = clamped * segments;
  const i = Math.min(segments - 1, Math.floor(raw));
  const f = raw - i;
  const a = route[i];
  const b = route[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f] as [number, number];
}


export default function SvgMap({
  position: _position,
  onPositionChange,
  height = 420,
  className,
  interactive: _interactive = true,
}: SvgMapProps) {
  const [t, setT] = useState(0);
  const cbRef = useRef(onPositionChange);
  cbRef.current = onPositionChange;

  // Bucle de animación con rAF + prefers-reduced-motion (antes: setInterval a 10fps
  // con setState continuo que forzaba re-render del padre vía onPositionChange).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setT(0.35);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const DURATION = 26000; // 26 s por vuelta completa
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setT((prev) => {
        const next = prev + dt / DURATION;
        return next > 1.02 ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const driverPos = useMemo<[number, number]>(
    () => interpolateRoute(ROUTE_SVG, Math.min(1, t)),
    [t],
  );

  // El progreso se deriva del propio `t` (0..1) — sin haversine por frame.
  const progressPct = Math.round(Math.min(1, Math.max(0, t)) * 100);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border bg-[#0B0F17] select-none",
        "shadow-2xl shadow-cyan-500/5",
        className,
      )}
      style={{ height, minHeight: height }}
      role="region"
      aria-label="Mapa GPS LOCALIS - rastreo en vivo del repartidor"
    >
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        <rect
          x={0}
          y={0}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          fill="#0B0F17"
        />

        {Array.from({ length: 28 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 25.714 + 4}
            y1={0}
            x2={i * 25.714 + 4}
            y2={SVG_HEIGHT}
            stroke="rgba(255,255,255,0.04)"
            strokeDasharray="2 6"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * 26.25 + 4}
            x2={SVG_WIDTH}
            y2={i * 26.25 + 4}
            stroke="rgba(255,255,255,0.04)"
            strokeDasharray="2 6"
            strokeWidth={1}
          />
        ))}

        <circle cx={24} cy={24} r={8} fill="rgba(0,242,254,0.06)" stroke="rgba(0,242,254,0.15)" strokeWidth={1} />
        <circle cx={SVG_WIDTH - 24} cy={24} r={8} fill="rgba(0,242,254,0.06)" stroke="rgba(0,242,254,0.15)" strokeWidth={1} />
        <circle cx={24} cy={SVG_HEIGHT - 24} r={8} fill="rgba(0,242,254,0.06)" stroke="rgba(0,242,254,0.15)" strokeWidth={1} />
        <circle cx={SVG_WIDTH - 24} cy={SVG_HEIGHT - 24} r={8} fill="rgba(0,242,254,0.06)" stroke="rgba(0,242,254,0.15)" strokeWidth={1} />

        <line x1={0} y1={250} x2={SVG_WIDTH} y2={250} stroke="rgba(255,255,255,0.07)" strokeWidth={2} />
        <line x1={330} y1={0} x2={330} y2={SVG_HEIGHT} stroke="rgba(255,255,255,0.07)" strokeWidth={2} />
        <line x1={480} y1={0} x2={480} y2={SVG_HEIGHT} stroke="rgba(255,255,255,0.07)" strokeWidth={2} />

        <path
          d={`M ${ROUTE_SVG.map((p) => p.join(",")).join(" L ")}`}
          fill="none"
          stroke="rgba(0,242,254,0.18)"
          strokeWidth={3}
          strokeDasharray="14 9"
          strokeLinecap="round"
        />

        {DELIVERY_INDICES.map((idx, i) => {
          const [x, y] = ROUTE_SVG[idx];
          return (
            <g key={`delivery-${i}`}>
              <circle
                cx={x}
                cy={y}
                r={DELIVERY_RADIUS}
                fill="rgba(16,185,129,0.25)"
                stroke="#10B981"
                strokeWidth={2}
              >
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur={2.2 + i * 0.4 + "s"}
                  repeatCount="indefinite"
                />
              </circle>
              <text
                x={x + 12}
                y={y - 10}
                fontSize={10}
                fill="#10B981"
                fontFamily="monospace"
                fontWeight={700}
                opacity={0.9}
              >
                #{i + 1}
              </text>
            </g>
          );
        })}

        {/* Destino */}
        <g>
          <circle cx={DEST_SVG[0]} cy={DEST_SVG[1]} r={14} fill="rgba(16,185,129,0.15)" />
          <circle cx={DEST_SVG[0]} cy={DEST_SVG[1]} r={6} fill="#10B981" stroke="#0B0F17" strokeWidth={2} />
        </g>

        {/* Repartidor (posición animada real) */}
        <g>
          <circle cx={driverPos[0]} cy={driverPos[1]} r={16} fill="rgba(0,242,254,0.18)">
            <animate attributeName="r" values="10;20;10" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle
            cx={driverPos[0]}
            cy={driverPos[1]}
            r={DRIVER_RADIUS}
            fill="#00F2FE"
            stroke="#0B0F17"
            strokeWidth={2.5}
            style={{ filter: "drop-shadow(0 0 8px rgba(0,242,254,0.9))" }}
          />
          <circle cx={driverPos[0]} cy={driverPos[1]} r={2.5} fill="#0B0F17" />
        </g>

        {/* Etiqueta de progreso */}
        <g>
          <rect x={16} y={16} width={176} height={34} rx={10} fill="rgba(11,15,23,0.82)" stroke="rgba(0,242,254,0.25)" />
          <circle cx={34} cy={33} r={5} fill="#00F2FE">
            <animate attributeName="opacity" values="1;0.4;1" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <text x={46} y={30} fontSize={11} fill="#E2E8F0" fontWeight={700} fontFamily="monospace">
            REPARTIDOR EN VIVO
          </text>
          <text x={46} y={43} fontSize={10} fill="#00F2FE" fontFamily="monospace">
            Ruta {progressPct}% · ETA ~{Math.max(1, Math.round((100 - progressPct) / 12))} min
          </text>
        </g>
      </svg>
    </div>
  );
}
