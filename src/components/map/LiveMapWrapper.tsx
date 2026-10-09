"use client";

import dynamic from "next/dynamic";
import type { LngLat } from "@/lib/routes";

const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="map-container rounded-xl bg-surface-card border border-border flex items-center justify-center" style={{ minHeight: 320 }}>
      <span className="text-sm text-muted animate-pulse">Cargando mapa en vivo...</span>
    </div>
  ),
});

export default function LiveMapWrapper(props: {
  height?: number;
  onPositionChange?: (pos: LngLat) => void;
  interactive?: boolean;
}) {
  return <LiveMap {...props} />;
}
