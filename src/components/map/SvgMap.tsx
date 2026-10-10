"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { LngLat } from "@/lib/routes";

/**
 * LOCALIS GPS - Mapa SVG puro (sin API keys, sin dependencias externas).
 * Diseño futurista / night-mode: cuadrícula estelar, camino animado,
 * marcador del repartidor en movimiento y puntos de entrega.
 * La proyección equirectangular mapea [lat,lng] a viewBox="0 0 720 420".
 */
const SVG_WIDTH = 720;
const SVG_HEIGHT = 420;
const LAT_MIN = 40.4188;
const LAT_MAX = 40.4204;
const LNG_MIN = -3.704;
const LNG_MAX = -3.688;

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

function project([lat, lng]: LngLat): [number, number] {
  const x = 16 + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (SVG_WIDTH - 32);
  const y = (SVG_HEIGHT - 16) - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * (SVG_HEIGHT - 32);
  return [x, y] as [number, number];
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
  position,
  onPositionChange,
  height = 420,
  className,
  interactive = true,
}: SvgMapProps) {
  const [t, setT] = useState(0);
  const cbRef = useRef(onPositionChange);
  cbRef.current = onPositionChange;

  useEffect(() => {
    const id = window.setInterval(() => {
      setT((prev) => {
        const next = prev + 0.006;
        return next > 1.15 ? 0 : next;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  const driverPos = useMemo<[number, number]>(
    () => interpolateRoute(ROUTE_SVG, Math.min(1, t)),
    [t],
  );

  const projectedPos = useMemo(() => project(position), [position]);

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
      </svg>
    </div>
  );
}

function distanceAlongRoute(route: [number, number][], pos: [number, number]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const [x1, y1] = route[i];
    const [x2, y2] = route[i + 1];
    const seg = Math.hypot(x2 - x1, y2 - y1);
    const [px, py] = pos;
    const d1 = Math.hypot(px - x1, py - y1);
    const d2 = Math.hypot(px - x2, py - y2);
    if (d1 <= d2) total += d1;
    else total += seg + d2;
  }
  return total;
}
