"use client";

import { Calendar, Smartphone } from "lucide-react";

export default function HeroShowcaseCard() {
  return (
    <div className="hero-card hero-enter rounded-2xl p-4 sm:p-6 lg:p-8 w-full min-w-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full">
        <div className="glass rounded-xl p-4 lg:p-5 flex flex-col w-full min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Calendar size={14} className="text-cyan-400" />
            </div>
            <span className="text-sm font-semibold">Stella AI</span>
            <span className="text-xs text-emerald-400 ml-auto">Online</span>
          </div>
          <div className="flex-1 space-y-3">
            <div className="chat-message bg-cyan-500/10 border border-cyan-500/20 rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
              <p className="text-sm">Hola, ¿cita en Zaragoza para el jueves?</p>
            </div>
            <div className="chat-message bg-background border border-border rounded-2xl rounded-br-sm p-3 max-w-[85%] ml-auto">
              <p className="text-sm text-muted">Hueco confirmado: Jueves 11:00.</p>
            </div>
            <div className="chat-message bg-cyan-500/10 border border-cyan-500/20 rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
              <p className="text-sm">¿Confirmación y recordatorio por WhatsApp?</p>
            </div>
            <div className="chat-message bg-background border border-border rounded-2xl rounded-br-sm p-3 max-w-[85%] ml-auto">
              <p className="text-sm text-muted">Enviado. Cita en Google Calendar.</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 lg:p-5 flex flex-col w-full min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Smartphone size={14} className="text-emerald-400" />
            </div>
            <span className="text-sm font-semibold">LOCALIS GPS · Zaragoza</span>
            <span className="text-xs text-emerald-400 ml-auto">En vivo</span>
          </div>
          <div className="map-container flex-1 rounded-xl bg-background/50 min-h-[220px]" />
          <div className="flex items-center justify-between mt-3 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium">Luis García (Centro)</span>
            </div>
            <span className="text-cyan-400">ETA 11:25</span>
          </div>
        </div>
      </div>
    </div>
  );
}
