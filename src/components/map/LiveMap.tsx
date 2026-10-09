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
  cbRef.current = onPositionChange;

  useEffect(() => {
    const id = window.setInterval(() => {
      tRef.current += 0.006;
      if (tRef.current > 1.15) tRef.current = 0;
      const p = interpolateRoute(DEMO_ROUTE, Math.min(1, tRef.current));
      setPos(p);
      cbRef.current?.(p);
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  const center = useMemo<LngLat>(
    () => [(DEMO_ROUTE[0][0] + DEMO_DEST[0]) / 2, (DEMO_ROUTE[0][1] + DEMO_DEST[1]) / 2],
    []
  );

  return (
    <div className="map-container rounded-xl overflow-hidden border border-border" style={{ height, minHeight: height }}>
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
