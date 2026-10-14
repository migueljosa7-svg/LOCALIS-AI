"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DEMO_ROUTE, DEMO_DEST, interpolateRoute, type LngLat } from "@/lib/routes";

const driverIcon = L.divIcon({
  className: "",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: '<div class="driver-marker"><span class="pulse"></span><span class="dot"></span></div>',
});

const destIcon = L.divIcon({
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  html: '<div class="dest-marker"></div>',
});

export default function LiveMap({
  height = 360,
  onPositionChange,
  interactive = true,
}: {
  height?: number;
  onPositionChange?: (pos: LngLat) => void;
  interactive?: boolean;
}) {
  const [pos, setPos] = useState<LngLat>(DEMO_ROUTE[0]);
  const tRef = useRef(0);
  const cbRef = useRef(onPositionChange);
  const wrapRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(true);
  cbRef.current = onPositionChange;

  // Pausa fuera de pantalla: el drawer solo monta el mapa al abrirse,
  // y el intervalo se detiene con IntersectionObserver + document.hidden.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const p = interpolateRoute(DEMO_ROUTE, 0.35);
      setPos(p);
      return;
    }
    const el = wrapRef.current;
    let obs: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== "undefined") {
      obs = new IntersectionObserver(
        (entries) => { runRef.current = entries[0]?.isIntersecting ?? true; },
        { threshold: 0.05 }
      );
      obs.observe(el);
    }
    const id = window.setInterval(() => {
      if (document.hidden || !runRef.current) return;
      tRef.current += 0.03;
      if (tRef.current > 1.15) tRef.current = 0;
      const p = interpolateRoute(DEMO_ROUTE, Math.min(1, tRef.current));
      setPos(p);
      cbRef.current?.(p);
    }, 500);
    return () => {
      window.clearInterval(id);
      obs?.disconnect();
    };
  }, []);

  const center = useMemo<LngLat>(
    () => [(DEMO_ROUTE[0][0] + DEMO_DEST[0]) / 2, (DEMO_ROUTE[0][1] + DEMO_DEST[1]) / 2],
    []
  );

  return (
    <div ref={wrapRef} className="map-container rounded-xl overflow-hidden border border-border" style={{ height, minHeight: height }}>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        zoomControl={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        attributionControl
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <Polyline
          positions={DEMO_ROUTE}
          pathOptions={{ color: "#00F2FE", weight: 4, opacity: 0.75, dashArray: "8 10" }}
        />
        <Marker position={DEMO_DEST} icon={destIcon} />
        <Marker position={pos} icon={driverIcon} />
      </MapContainer>
    </div>
  );
}
