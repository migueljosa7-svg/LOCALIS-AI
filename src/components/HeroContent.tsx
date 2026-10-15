"use client";

import Link from "next/link";
import {
  PlayCircle,
  ArrowRight,
  CheckCircle2,
  Zap,
  Sparkles,
  MapPin,
  MessageCircle,
} from "lucide-react";
import HeroShowcaseCard from "./HeroShowcaseCard";
import { useLead } from "@/components/lead/LeadProvider";

const WA_HERO_URL =
  "https://wa.me/34640809238?text=Hola%2C%20quiero%20reservar%20una%20auditor%C3%ADa%20gratuita%20para%20mi%20negocio%20en%20Zaragoza";

export default function HeroContent() {
  const { openLead } = useLead();
  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        <div className="text-center lg:text-left w-full min-w-0">
          <div className="hero-enter">
            <div className="flex items-center gap-2 mb-4 flex-wrap justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                <MapPin size={12} /> Hecho para negocios en Zaragoza
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 size={12} /> 0% Comisiones
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight font-display">
              <span className="gradient-text">
                Diseño Web e Inteligencia Artificial
              </span>
              <br />
              para Negocios en Zaragoza
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Consigue más clientes, atiende dudas 24/7 con la asistente IA Stella, 
              automatiza tus citas y gestiona tus repartos en tiempo real sin intermediarios.
            </p>

            {/* CTAs optimizados para conversión sin tecnicismos complejos */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
              <Link
                href="#cita"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-cobalt-500 to-cyan-500 text-white font-bold text-sm sm:text-base btn-glow hover:shadow-neonglow hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-lg shadow-cyan-500/25"
              >
                <Sparkles size={19} className="text-cyan-200 animate-pulse" />
                <span>Pedir Cita y Auditoría Gratuita</span>
                <ArrowRight size={17} />
              </Link>
              <Link
                href="#stella"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl glass text-foreground font-semibold text-sm border border-glass-border hover:border-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <PlayCircle size={18} className="text-cyan-400" />
                <span>Probar Stella IA</span>
              </Link>
              <a
                href={WA_HERO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl glass text-emerald-400 font-semibold text-sm border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle size={18} />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Auditoría 100% gratuita</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Atención 24/7 con Stella IA</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Soporte local en Zaragoza</span>
              </div>
            </div>
          </div>
        </div>
        <HeroShowcaseCard />
      </div>
    </div>
  );
}
