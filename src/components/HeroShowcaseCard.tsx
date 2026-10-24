import { CalendarCheck, ReceiptText, Bot } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import RouteMarker from "./effects/RouteMarker";

const CHAT = [
  { from: "client", text: "Hola, ¿tenéis hueco el jueves por la mañana?", delay: "0.5s" },
  { from: "stella", text: "¡Hola Lucía! Jueves 11:00 libre. ¿Te lo reservo?", delay: "1.4s" },
  { from: "client", text: "Sí, perfecto 🙌", delay: "2.3s" },
  { from: "stella", text: "Hecho ✅ Cita confirmada y recordatorio activado.", delay: "3.2s" },
] as const;

// Ruta del mini-mapa (coordenadas del viewBox 320×160). ROUTE dibuja la calle y
// ROUTE_SEGS (los mismos tramos con los puntos de control explícitos) mueve al repartidor.
const ROUTE = "M28 132 C 70 128, 86 92, 128 90 S 196 112, 222 76 S 270 34, 296 30";
const ROUTE_START = [28, 132] as const;
const ROUTE_SEGS = [
  { c1: [70, 128], c2: [86, 92], p: [128, 90] },
  { c1: [170, 88], c2: [196, 112], p: [222, 76] },
  { c1: [248, 40], c2: [270, 34], p: [296, 30] },
] as const;

// Componente de servidor (sin JS): las animaciones son CSS y SVG nativo.
export default function HeroShowcaseCard() {
  return (
    <div className="relative w-full min-w-0 animate-fade-rise [animation-delay:150ms]">
      {/* Notificaciones flotantes (solo pantallas grandes) */}
      <div className="hero-float hidden xl:flex absolute -left-8 -top-7 z-10 glass-strong rounded-2xl px-4 py-3 items-center gap-3 shadow-glass chat-message [animation-delay:3.6s]">
        <span className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
          <CalendarCheck size={18} aria-hidden="true" />
        </span>
        <span className="text-xs leading-tight">
          <span className="block font-semibold text-foreground">Cita creada</span>
          <span className="text-muted">Google Calendar · Jue 11:00</span>
        </span>
      </div>
      <div className="hero-float hidden xl:flex absolute -right-6 -bottom-8 z-10 glass-strong rounded-2xl px-4 py-3 items-center gap-3 shadow-glass chat-message [animation-delay:4.2s]">
        <span className="w-9 h-9 rounded-xl bg-cobalt-500/10 border border-cobalt-500/30 flex items-center justify-center text-cobalt-400">
          <ReceiptText size={18} aria-hidden="true" />
        </span>
        <span className="text-xs leading-tight">
          <span className="block font-semibold text-foreground">Factura F-104 enviada</span>
          <span className="text-muted">IVA incluido · PDF</span>
        </span>
      </div>

      <div className="hero-card rounded-[1.75rem] p-3 sm:p-4">
        {/* Barra de ventana */}
        <div className="flex items-center justify-between gap-2 px-2 pb-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          </div>
          <span className="text-[11px] font-medium text-muted tracking-wide truncate">Panel LOCALIS · Frutería Pepe</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 shrink-0">
            <span className="live-dot" aria-hidden="true" /> En vivo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Chat de WhatsApp gestionado por Stella */}
          <div className="rounded-2xl bg-[#0B0F17]/80 border border-white/[0.07] p-3.5 flex flex-col min-h-[248px]">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/[0.06]">
              <span className="w-8 h-8 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
                <WhatsAppIcon size={16} />
              </span>
              <span className="text-[13px] font-semibold">WhatsApp · Stella IA</span>
              <Bot size={15} className="ml-auto text-cyan-400" aria-hidden="true" />
            </div>
            <div className="space-y-2" role="log" aria-label="Ejemplo de conversación de WhatsApp atendida por Stella">
              {CHAT.map((m, i) => (
                <p
                  key={i}
                  className={
                    "chat-message max-w-[88%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug " +
                    (m.from === "client"
                      ? "bg-white/[0.06] text-foreground rounded-tl-md"
                      : "ml-auto bg-cyan-500/[0.12] border border-cyan-500/20 text-cyan-50 rounded-tr-md")
                  }
                  style={{ animationDelay: m.delay }}
                >
                  {m.text}
                </p>
              ))}
            </div>
          </div>

          {/* Mini mapa GPS */}
          <div className="rounded-2xl bg-[#0B0F17]/80 border border-white/[0.07] p-3.5 flex flex-col">
            <div className="flex items-center justify-between pb-3">
              <span className="text-[13px] font-semibold">Reparto #104</span>
              <span className="text-[11px] text-muted">
                ETA <span className="text-cyan-400 font-semibold">6 min</span>
              </span>
            </div>
            <div className="relative overflow-hidden rounded-xl">
            <svg
              viewBox="0 0 320 160"
              width="320"
              height="160"
              className="w-full h-auto rounded-xl bg-[#0A0E15]"
              role="img"
              aria-label="Mapa de un repartidor propio avanzando hacia el cliente"
            >
              <path d="M-10 58 C 60 40, 120 70, 190 52 S 300 30, 340 44" stroke="rgba(59,130,246,0.28)" strokeWidth="14" fill="none" strokeLinecap="round" />
              <g stroke="rgba(255,255,255,0.06)" strokeWidth="1.5">
                <path d="M0 110 H320" />
                <path d="M0 142 H320" />
                <path d="M60 0 V160" />
                <path d="M150 0 V160" />
                <path d="M240 0 V160" />
                <path d="M0 18 L320 96" />
              </g>
              <path d={ROUTE} stroke="rgba(0,242,254,0.22)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d={ROUTE} stroke="#00F2FE" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="5 7" />
              <circle cx="296" cy="30" r="6" fill="#10B981" stroke="#0B0F17" strokeWidth="2" />
              <circle cx="28" cy="132" r="4" fill="#3B82F6" />
            </svg>
            <RouteMarker name="hero-route" start={ROUTE_START} segs={[...ROUTE_SEGS]} viewW={320} viewH={160} duration={9} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                <p className="text-[10.5px] text-muted">Citas hoy</p>
                <p className="text-base font-bold font-display tabular-nums">12</p>
              </div>
              <div className="rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20 px-3 py-2">
                <p className="text-[10.5px] text-emerald-300/90">Comisiones ahorradas</p>
                <p className="text-base font-bold font-display tabular-nums text-emerald-400">318 €</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
