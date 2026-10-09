"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Award, Zap, Globe, ArrowRight, Phone, Mail, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANTS } from "@/lib/plans";

export default function PricingSection() {
  return (
    <div id="precios" className="py-20 lg:py-28 bg-bg-elevated relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,_rgba(16,185,129,0.12),_transparent_50%)]" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {PLANTS.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "pricing-card rounded-2xl p-6 lg:p-8 border text-center relative",
                plan.highlighted && "highlighted"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    ✨ Lo más popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold font-display">{plan.name}</h3>
                <p className="text-xs text-muted mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold font-display">
                  €{plan.priceMonth}
                  <span className="text-base font-normal text-muted">/mes</span>
                </span>
                <p className="text-xs text-muted mt-1">
                  o €{plan.priceYear}/año
                </p>
              </div>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-sm transition-all",
                  plan.highlighted
                    ? "bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white hover:shadow-neonglow"
                    : "glass text-foreground border border-border hover:border-cyan-500/30"
                )}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted">
            Todos los planes incluyen soporte técnico. Puedes cambiar de plan en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  );
}
