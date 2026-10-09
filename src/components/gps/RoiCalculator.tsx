"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/effects/AnimatedCounter";

const PLAN_FLAT = 49; // Pro plan €/mes
const TRADITIONAL = 0.3; // 30% Glovo/Uber Eats

export default function RoiCalculator() {
  const [orders, setOrders] = useState(300);
  const [ticket, setTicket] = useState(18);

  const monthlyVolume = orders * ticket;
  const traditionalFee = monthlyVolume * TRADITIONAL;
  const localisCost = PLAN_FLAT;
  const monthlySave = Math.max(0, traditionalFee - localisCost);
  const yearlySave = monthlySave * 12;
  const maxBar = 60000;
  const pct = Math.min(100, (yearlySave / maxBar) * 100);

  return (
    <div className="glass border-glow rounded-2xl p-6 lg:p-10 w-full">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold font-display">
          Calculadora de <span className="gradient-text">ahorro y ROI</span>
        </h3>
        <p className="text-sm text-muted mt-2">
          Mueve los sliders y mira el impacto financiero en directo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-muted mb-2">
              Pedidos mensuales: <span className="text-cyan-400 font-bold">{orders.toLocaleString("es-ES")}</span>
            </label>
            <input
              type="range"
              min={10}
              max={2000}
              step={10}
              value={orders}
              onChange={(e) => setOrders(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted mt-1">
              <span>10</span>
              <span>2.000 pedidos/mes</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-2">
              Ticket medio: <span className="text-emerald-400 font-bold">{ticket} EUR</span>
            </label>
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={ticket}
              onChange={(e) => setTicket(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted mt-1">
              <span>5 EUR</span>
              <span>100 EUR</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-background/60 border border-border p-4">
              <p className="text-lg font-bold text-red-400">
                <AnimatedCounter value={traditionalFee} prefix="-" suffix=" EUR" />
              </p>
              <p className="text-[11px] text-muted mt-1">Comisiones Glovo/Uber (30%)</p>
            </div>
            <div className="rounded-xl bg-background/60 border border-border p-4">
              <p className="text-lg font-bold text-cyan-400">
                <AnimatedCounter value={localisCost} prefix="-" suffix=" EUR" />
              </p>
              <p className="text-[11px] text-muted mt-1">LOCALIS AI (tarifa plana)</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-muted mb-1">Ahorro neto anual</p>
            <p className="text-4xl lg:text-5xl font-black font-display gradient-text">
              <AnimatedCounter value={yearlySave} prefix="" suffix=" EUR" />
            </p>
            <p className="text-xs text-muted mt-2">
              {orders.toLocaleString("es-ES")} pedidos · {ticket} EUR de ticket medio
            </p>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs text-muted mb-2">
              <span>Progreso del ahorro</span>
              <span className="text-emerald-400 font-semibold">{pct.toFixed(0)}%</span>
            </div>
            <div className="h-3 rounded-full bg-background/70 border border-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 18 }}
              />
            </div>
            <p className="text-[11px] text-muted mt-2">
              Volumen mensual: <span className="text-foreground font-semibold">{monthlyVolume.toLocaleString("es-ES")} EUR</span>
              {" "}· Ahorro mensual: <span className="text-emerald-400 font-semibold">{monthlySave.toFixed(0)} EUR</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
