import { MapPin, Truck } from "lucide-react";

export function GpsMapPanel() {
  return (
    <div className="glass rounded-xl p-5 border border-border md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-sm">🗺️ Mapa de flota en vivo</h4>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">● En vivo</span>
      </div>
      <div className="map-container h-48 rounded-xl bg-background/50" />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-background/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted">Luis García · ETA 11:25</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-background/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted">María Sánchez · ETA 11:30</span>
        </div>
      </div>
    </div>
  );
}
