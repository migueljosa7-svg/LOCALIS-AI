"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANTS } from "@/lib/plans";
import { useLead } from "@/components/lead/LeadProvider";

export default function PricingSection() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { openLead } = useLead();

  const handleCta = (planId: string, planName: string) => {
    setSelectedPlan(planId);
    openLead(planName);
  };

  return (
    <div id="precios" className="w-full py-20 lg:py-28 bg-surface-elevated relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,_rgba(16,185,129,0.12),_transparent_50%)]" />
      </div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Precios 2026
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Planes transparentes <span className="gradient-text">y sin sorpresas</span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
            Crecimiento escalable. Puedes cambiar de plan en cualquier momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
          {PLANTS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "pricing-card rounded-2xl p-6 lg:p-8 border text-center relative w-full min-w-0",
                plan.highlighted && "highlighted",
                selectedPlan === plan.id && "border-cyan-400 ring-2 ring-cyan-400/60"
              )}
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold font-display">{plan.name}</h3>
                <p className="text-xs text-muted mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold font-display">
                  {plan.priceMonth} EUR
                  <span className="text-base font-normal text-muted">/mes</span>
                </span>
                <p className="text-xs text-muted mt-1">o {plan.priceYear} EUR/ano</p>
              </div>

              <ul className="space-y-2.5 mb-8 text-left">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleCta(plan.id, plan.name)}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-95",
                  plan.highlighted
                    ? "bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white hover:shadow-neonglow"
                    : "glass text-foreground border border-border hover:border-cyan-500/30"
                )}
              >
                {plan.cta}
              </button>
              {selectedPlan === plan.id && (
                <p className="mt-3 text-xs text-cyan-400 flex items-center justify-center gap-1">
                  <ArrowRight size={12} /> Completa tus datos para contratar {plan.name}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted">
            {selectedPlan
              ? `Plan ${PLANTS.find((p) => p.id === selectedPlan)?.name} seleccionado. Puedes cambiarlo antes de contratar.`
              : "Todos los planes incluyen soporte tecnico. Selecciona un plan para continuar."}
          </p>
        </div>
      </div>
    </div>
  );
}
