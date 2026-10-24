"use client";

import { useState } from "react";
import { Check, ArrowRight, BadgePercent } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/plans";
import { useLead } from "@/components/lead/LeadProvider";

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const { openLead } = useLead();

  return (
    <section id="precios" aria-labelledby="precios-title" className="cv-auto section-band relative w-full py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="eyebrow eyebrow-live mb-5">
            <BadgePercent size={13} aria-hidden="true" /> Tarifa plana · sin comisiones por pedido
          </span>
          <h2 id="precios-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Precios claros, <span className="gradient-text">sin sorpresas</span>
          </h2>
          <p className="mt-5 text-muted text-base sm:text-lg">Cambia de plan o cancela cuando quieras. Sin permanencia.</p>
        </div>

        <div className="flex justify-center mb-10">
          <div role="group" aria-label="Periodo de facturación" className="inline-flex p-1 rounded-2xl bg-white/[0.04] border border-white/10">
            {[
              { v: false, l: "Mensual" },
              { v: true, l: "Anual · 2 meses gratis" },
            ].map((o) => (
              <button
                key={o.l}
                type="button"
                aria-pressed={yearly === o.v}
                onClick={() => setYearly(o.v)}
                className={cn(
                  "min-h-[42px] px-4 rounded-xl text-sm font-semibold transition-colors",
                  yearly === o.v ? "bg-brand" : "text-muted hover:text-foreground"
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto items-stretch">
          {PLANS.map((plan) => {
            const price = yearly ? Math.round(plan.priceYear / 12) : plan.priceMonth;
            return (
              <li
                key={plan.id}
                className={cn(
                  "glow-card lift pricing-card relative rounded-3xl p-6 lg:p-8 flex flex-col border",
                  plan.highlighted ? "highlighted" : "glass"
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Lo más elegido
                  </span>
                )}
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-muted min-h-[3.75rem]">{plan.description}</p>

                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-bold tabular-nums">{price} €</span>
                  <span className="text-muted text-sm">/mes</span>
                </p>
                <p className="text-xs text-muted mt-1 h-4">
                  {yearly ? `${plan.priceYear.toLocaleString("es-ES")} € facturados al año` : `o ${plan.priceYear.toLocaleString("es-ES")} €/año`}
                </p>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground/90">
                      <Check
                        size={16}
                        className={cn("shrink-0 mt-0.5", /comisi/i.test(feature) ? "text-emerald-400" : "text-cyan-400")}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => openLead(`Plan ${plan.name}`)}
                  className={cn("btn w-full mt-8", plan.highlighted ? "btn-primary" : "btn-ghost")}
                >
                  {plan.cta} <ArrowRight size={16} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-10 text-center text-sm text-muted">
          ¿Dudas sobre qué plan encaja contigo?{" "}
          <a href="#cita" className="text-cyan-400 font-semibold hover:text-cyan-300">
            Te lo decimos gratis en la auditoría →
          </a>
        </p>
      </div>
    </section>
  );
}
