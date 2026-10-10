import dynamic from "next/dynamic";
import type { LngLat } from "@/lib/routes";

// SvgMap no requiere Browser APIs en tiempo de compilación, pero se envuelve en
// dynamic para garantizar SSR seguro y una primera carga sin bloqueos.
const SvgMap = dynamic(
  () => import("./SvgMap").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="map-container rounded-xl bg-surface-card border border-border flex items-center justify-center" style={{ minHeight: 320 }}>
        <span className="text-sm text-muted animate-pulse">Cargando mapa GPS...</span>
      </div>
    ),
  },
);

export interface SvgMapWrapperProps {
  position: LngLat;
  onPositionChange?: (pos: LngLat) => void;
  height?: number;
  className?: string;
  interactive?: boolean;
}

export default function SvgMapWrapper({
  position,
  onPositionChange,
  height = 430,
  className,
  interactive = true,
}: SvgMapWrapperProps) {
  return (
    <SvgMap
      position={position}
      onPositionChange={onPositionChange}
      height={height}
      className={className}
      interactive={interactive}
    />
  );
}
