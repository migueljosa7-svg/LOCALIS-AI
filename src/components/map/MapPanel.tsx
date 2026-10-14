"use client";

import { useState } from "react";
import { Share2, CheckCircle2 } from "lucide-react";
import { FLEET_DRIVERS } from "@/lib/fleet";

export default function MapPanel({
  distance,
  etaMin,
  speedKmh,
  savedEuro,
  orderId = "#104",
}: {
  distance: number;
  etaMin: number;
  speedKmh: number;
  savedEuro: number;
  orderId?: string;
}) {
  const [copied, setCopied] = useState(false);
  const driver = FLEET_DRIVERS.find((d) => d.orderId === orderId) ?? FLEET_DRIVERS[0];
  const cust = driver.customerName !== "Entregado" ? ` · ${driver.customerName}` : "";
  const msg =
    `Tu pedido va en camino (demo LOCALIS GPS). ${driver.name} lo lleva${cust}. Síguelo en vivo aquí: ${driver.trackingLink}`;

  const share = () => {
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank", "noopener");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="glass border-glow rounded-2xl p-5 space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Pedido {driver.orderId}{cust}</p>
          <h4 className="font-bold font-display text-lg">En camino · {driver.name}</h4>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          En vivo
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-background/60 border border-border p-3">
          <p className="text-lg font-bold text-cyan-400 tabular-nums">
            {Math.round(distance).toLocaleString("es-ES")} m
          </p>
          <p className="text-[10px] text-muted mt-0.5">Distancia restante</p>
        </div>
        <div className="rounded-xl bg-background/60 border border-border p-3">
          <p className="text-lg font-bold text-emerald-400 tabular-nums">
            {etaMin} min
          </p>
          <p className="text-[10px] text-muted mt-0.5">Llegada estimada</p>
        </div>
        <div className="rounded-xl bg-background/60 border border-border p-3">
          <p className="text-lg font-bold text-cobalt-400 tabular-nums">
            {speedKmh} km/h
          </p>
          <p className="text-[10px] text-muted mt-0.5">Velocidad media</p>
        </div>
      </div>

      <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Ahorro vs Glovo/Just Eat (30%)</p>
          <p className="font-bold text-emerald-400 tabular-nums">
            +{savedEuro.toFixed(2).replace(".", ",")} EUR
          </p>
        </div>
        <CheckCircle2 size={20} className="text-emerald-400" />
      </div>

      <button
        type="button"
        onClick={share}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer"
      >
        {copied ? (
          <>
            <CheckCircle2 size={16} /> Enlace abierto en WhatsApp
          </>
        ) : (
          <>
            <Share2 size={16} /> Compartir tracking por WhatsApp
          </>
        )}
      </button>
      <p className="text-[10px] text-muted text-center">
        Demo: abre WhatsApp con mensaje de prueba pre-rellenado.
      </p>
    </div>
  );
}
