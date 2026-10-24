"use client";

import { useId, useState } from "react";
import { Calculator, ArrowRight, TrendingDown } from "lucide-react";
import AnimatedCounter from "@/components/effects/AnimatedCounter";
import { PLANS } from "@/lib/plans";

const PLAN_FLAT = PLANS.find((p) => p.id === "pro")?.priceMonth ?? 49;

export default function RoiCalculator() {
  const [orders, setOrders] = useState(300);
  const [ticket, setTicket] = useState(22);
  const [fee, setFee] = useState(25);
  const ids = { orders: useId(), ticket: useId(), fee: useId() };

  const monthlyVolume = orders * ticket;
  const platformCost = monthlyVolume * (fee / 100);
  const monthlySave = Math.max(0, platformCost - PLAN_FLAT);
  const yearlySave = monthlySave * 12;
  const keepPct = platformCost > 0 ? Math.min(100, (monthlySave / platformCost) * 100) : 0;

  return (
    <div className="border-glow rounded-3xl p-5 sm:p-8 lg:p-10 shadow-glass">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div>
          <span className="eyebrow eyebrow-live">
            <Calculator size={13} aria-hidden="true" /> Calculadora sin comisiones
          </span>
          <h3 className="mt-4 font-display font-bold text-2xl sm:text-3xl leading-tight">
            ¿Cuánto te están costando <span className="gradient-text">las plataformas de reparto</span>?
          </h3>
          <p className="mt-3 text-sm sm:text-base text-muted">
            Mueve los controles con tus números reales. El cálculo compara la comisión de la plataforma con la tarifa plana del plan Pro ({PLAN_FLAT} €/mes).
          </p>

          <div className="mt-7 space-y-6">
            <Slider id={ids.orders} label="Pedidos a domicilio al mes" value={orders} min={20} max={2000} step={10} onChange={setOrders} display={`${orders.toLocaleString("es-ES")}`} />
            <Slider id={ids.ticket} label="Ticket medio" value={ticket} min={8} max={80} step={1} onChange={setTicket} display={`${ticket} €`} />
            <Slider id={ids.fee} label="Comisión de la plataforma" value={fee} min={20} max={30} step={1} onChange={setFee} display={`${fee} %`} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
              <p className="text-[11px] text-muted">Pagas a la plataforma</p>
              <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-red-300 tabular-nums">
                <AnimatedCounter value={platformCost} suffix=" €/mes" />
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
              <p className="text-[11px] text-muted">Con LOCALIS (tarifa plana)</p>
              <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-cyan-300 tabular-nums">{PLAN_FLAT} €/mes</p>
            </div>
          </div>

          <div className="rounded-3xl p-6 sm:p-7 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.12] via-emerald-500/[0.04] to-transparent text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300/90">Ahorro neto al año</p>
            <p className="mt-2 font-display text-5xl sm:text-6xl font-bold text-emerald-400 tabular-nums">
              <AnimatedCounter value={yearlySave} suffix=" €" />
            </p>
            <p className="mt-2 text-sm text-muted">
              <AnimatedCounter value={monthlySave} suffix=" € al mes" className="text-emerald-300 font-semibold" /> que se quedan en tu caja
            </p>
            <div className="mt-5 h-2.5 rounded-full bg-white/[0.06] overflow-hidden" aria-hidden="true">
              <div
                className="h-full w-full origin-left rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-transform duration-500 ease-out"
                style={{ transform: `scaleX(${keepPct / 100})` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted flex items-center justify-center gap-1">
              <TrendingDown size={12} className="text-emerald-400" aria-hidden="true" />
              Recuperas el {Math.round(keepPct)}% de lo que hoy pagas en comisiones
            </p>
          </div>

          <a href="#cita" className="btn btn-primary w-full">
            Quiero dejar de pagar comisiones <ArrowRight size={17} aria-hidden="true" />
          </a>
          <p className="text-[11px] text-muted text-center">Estimación orientativa. Volumen mensual: {monthlyVolume.toLocaleString("es-ES")} €.</p>
        </div>
      </div>
    </div>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  display: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2.5">
        <label htmlFor={id} className="text-sm font-medium text-foreground/90">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-lg font-bold text-cyan-300 tabular-nums">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range w-full"
        style={{ ["--pct" as string]: `${pct}%` }}
      />
    </div>
  );
}
