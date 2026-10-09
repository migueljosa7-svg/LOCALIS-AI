"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  PlayCircle,
  ArrowRight,
  Calendar,
  Smartphone,
  CheckCircle2,
  Zap,
} from "lucide-react";
import HeroShowcaseCard from "./HeroShowcaseCard";

export default function HeroContent() {
  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        <div className="text-center lg:text-left w-full min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4 flex-wrap justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                <Zap size={12} /> Plataforma 2026
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 size={12} /> Sin comisiones
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight font-display">
              <span className="gradient-text">
                La primera plataforma web con IA Autonoma
              </span>
              <br />
              y <span className="gradient-text">GPS Integrado</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Automatiza tu agenda, emite facturas, atiende a tus clientes 24/7
              con la IA Stella y controla tus repartos en tiempo real sin
              comisiones.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer"
              >
                <PlayCircle size={18} /> Probar Demo
                <ArrowRight size={16} className="hidden sm:inline" />
              </Link>
              <Link
                href="#gps"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass text-foreground font-semibold text-sm border border-glass-border hover:border-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Smartphone size={18} /> Ver Video Interactivo
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Sin comisiones de terceros</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>24/7 con IA Stella</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Geo-ubicacion en tiempo real</span>
              </div>
            </div>
          </motion.div>
        </div>
        <HeroShowcaseCard />
      </div>
    </div>
  );
}
