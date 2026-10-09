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

export default function HeroContent() {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-20 w-full">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
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
                La primera plataforma web con IA Autónoma
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all"
              >

        <motion.div
          className="hero-card rounded-2xl p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto lg:mx-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 h-full">
            <div className="glass rounded-xl p-4 lg:p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Calendar size={14} className="text-cyan-400" />
                </div>
                <span className="text-sm font-semibold">Stella AI</span>
                <span className="text-xs text-emerald-400 ml-auto">Online</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="chat-message bg-cyan-500/10 border border-cyan-500/20 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                  <p className="text-sm">
                    Hola, me pueden reservar una cita para el jueves a las 11:00?
                  </p>
                </div>
                <div className="chat-message bg-background border border-border rounded-2xl rounded-br-sm p-3 max-w-[80%] ml-auto">
                  <p className="text-sm text-muted">
                    Claro! Confirmando cita para Jueves 11:00.
                  </p>
                </div>
                <div className="chat-message bg-cyan-500/10 border border-cyan-500/20 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                  <p className="text-sm">Y enviar notificacion por WhatsApp?</p>
                </div>
                <div className="chat-message bg-background border border-border rounded-2xl rounded-br-sm p-3 max-w-[80%] ml-auto">
                  <p className="text-sm text-muted">
                    Ya lo he enviado. Quedan 2 confirmaciones.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <Calendar size={12} className="text-cyan-400" />
                <span className="text-emerald-400 font-medium">
                  Jueves 10 Sept · 11:00
                </span>
                <span className="text-cyan-400">-&gt;</span>
                <span className="text-emerald-400 font-medium">
                  WhatsApp enviado
                </span>
              </div>
            </div>
            <div className="glass rounded-xl p-4 lg:p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Smartphone size={14} className="text-emerald-400" />
                </div>
                <span className="text-sm font-semibold">LOCALIS GPS</span>
                <span className="text-xs text-emerald-400 ml-auto">En vivo</span>
              </div>
              <div className="map-container flex-1 rounded-xl bg-background/50" />
              <div className="flex items-center justify-between mt-3 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">
                    Luis Garcia (en vivo)
                  </span>
                </div>
                <span className="text-cyan-400">ETA 11:25</span>
              </div>
            </div>
          </div>
        </motion.div>

                <PlayCircle size={18} /> Probar Demo
                <ArrowRight size={16} className="hidden sm:inline" />
              </Link>
              <Link
                href="#gps"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass text-foreground font-semibold text-sm border border-glass-border hover:border-cyan-500/30 transition-all"
              >
                <Smartphone size={18} /> Ver Vídeo Interactivo
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted">
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
                <span>Geo-ubicación en tiempo real</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
