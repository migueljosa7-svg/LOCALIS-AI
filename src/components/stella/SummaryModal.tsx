"use client";

import { motion } from "framer-motion";
import { TrendingUp, CalendarCheck, Euro, Users, ArrowUpRight } from "lucide-react";
import { AppModal } from "./StellaActions";

// Barras del gráfico de caja diaria (simulado, 7 últimos días).
const WEEK = [
  { d: "Lun", v: 620 },
  { d: "Mar", v: 480 },
  { d: "Mié", v: 710 },
  { d: "Jue", v: 540 },
  { d: "Vie", v: 980 },
  { d: "Sáb", v: 1240 },
  { d: "Hoy", v: 1463, highlight: true },
];

const SUMMARY_CITAS = [
  { time: "09:00", name: "Beatriz G.", service: "Pedido fruta orgánica", status: "completada" },
  { time: "11:00", name: "Ana Martínez", service: "Café especial + tostada", status: "confirmada" },
  { time: "14:30", name: "Carlos Ruiz", service: "Ramo de claveles", status: "pendiente" },
  { time: "16:00", name: "Diego F.", service: "Corte + barba", status: "confirmada" },
];

const max = Math.max(...WEEK.map((x) => x.v));

export function SummaryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AppModal open={open} onClose={onClose} title="Resumen operativo de hoy">
      <div className="space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi icon={<Euro size={14} />} label="Facturado hoy" value="1.463 €" delta="+18%" />
          <Kpi icon={<CalendarCheck size={14} />} label="Citas hoy" value="12" delta="+3" />
          <Kpi icon={<Users size={14} />} label="Clientes" value="27" delta="+5" />
          <Kpi icon={<TrendingUp size={14} />} label="Ticket medio" value="54,2 €" delta="+6%" />
        </div>

        {/* Gráfico de barras: caja diaria */}
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">Caja diaria · últimos 7 días</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <ArrowUpRight size={12} /> +18% vs ayer
            </span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {WEEK.map((b, i) => (
              <div key={b.d} className="flex-1 flex flex-col items-center gap-1.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(b.v / max) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                  className={
                    "w-full rounded-t-md " +
                    (b.highlight
                      ? "bg-gradient-to-t from-cyan-500 to-emerald-400"
                      : "bg-gradient-to-t from-cobalt-500/50 to-cyan-500/40")
                  }
                />
                <span
                  className={
                    "text-[10px] " + (b.highlight ? "text-cyan-400 font-semibold" : "text-muted")
                  }
                >
                  {b.d}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de citas */}
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <p className="text-sm font-semibold mb-3">Citas de hoy</p>
          <div className="space-y-2">
            {SUMMARY_CITAS.map((c) => (
              <div
                key={c.time}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-background/50 border border-border/40"
              >
                <span className="text-xs font-mono text-cyan-400 w-10 shrink-0">{c.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{c.name}</p>
                  <p className="text-[11px] text-muted truncate">{c.service}</p>
                </div>
                <span
                  className={
                    "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 " +
                    (c.status === "confirmada"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : c.status === "pendiente"
                      ? "bg-yellow-500/15 text-yellow-400"
                      : "bg-cyan-500/15 text-cyan-400")
                  }
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow transition-all cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </AppModal>
  );
}

function Kpi({
  icon,
  label,
  value,
  delta,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-muted mb-1">
        <span className="text-cyan-400">{icon}</span>
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="text-base font-bold">{value}</p>
      <p className="text-[10px] text-emerald-400 font-medium">{delta} vs ayer</p>
    </div>
  );
}
