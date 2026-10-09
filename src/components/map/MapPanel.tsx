"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, CheckCircle2 } from "lucide-react";
import AnimatedCounter from "@/components/effects/AnimatedCounter";

export default function MapPanel({
  distance,
  etaMin,
  speedKmh,
  savedEuro,
}: {
  distance: number;
  etaMin: number;
  speedKmh: number;
  savedEuro: number;
}) {
  const [copied, setCopied] = useState(false);
  const msg =
    "Tu pedido va en camino 🚚 (demo LOCALIS GPS). Sigue tu repartidor en vivo aqui: https://localis.ai/t/demo-104";

  const share = () => {
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank", "noopener");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-glow rounded-2xl p-5 space-y-4 w-full"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Pedido #104 · Ana Lopez</p>
          <h4 className="font-bold font-display text-lg">En camino</h4>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          En vivo
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-background/60 border border-border p-3">
          <p className="text-lg font-bold text-cyan-400">
            <AnimatedCounter value={distance} decimals={0} suffix=" m" />
          </p>
          <p className="text-[10px] text-muted mt-0.5">Distancia restante</p>
        </div>
        <div className="rounded-xl bg-background/60 border border-border p-3">
          <p className="text-lg font-bold text-emerald-400">
            <AnimatedCounter value={etaMin} decimals={0} suffix=" min" />
          </p>
          <p className="text-[10px] text-muted mt-0.5">Llegada estimada</p>
        </div>
        <div className="rounded-xl bg-background/60 border border-border p-3">
          <p className="text-lg font-bold text-cobalt-400">
            <AnimatedCounter value={speedKmh} decimals={0} suffix=" km/h" />
          </p>
          <p className="text-[10px] text-muted mt-0.5">Velocidad media</p>
        </div>
      </div>

      <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Ahorro vs Glovo/Just Eat (30%)</p>
          <p className="font-bold text-emerald-400">
            +<AnimatedCounter value={savedEuro} prefix="" suffix=" EUR" />
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
    </motion.div>
  );
}
