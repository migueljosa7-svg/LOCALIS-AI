import {
  CalendarDays,
  ReceiptText,
  MessageCircle,
  MapPin,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Euro,
  Truck,
  Bot,
  type LucideIcon,
} from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import RouteMarker from "@/components/effects/RouteMarker";

const NAV: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: LayoutDashboard, label: "Resumen", active: true },
  { icon: CalendarDays, label: "Agenda" },
  { icon: MessageCircle, label: "Stella · WhatsApp" },
  { icon: ReceiptText, label: "Facturas" },
  { icon: MapPin, label: "Repartos GPS" },
  { icon: Settings, label: "Ajustes" },
];

const KPIS = [
  { icon: Euro, label: "Ventas hoy", value: "1.463 €", delta: "+18 % vs ayer" },
  { icon: CalendarDays, label: "Citas hoy", value: "12", delta: "3 por WhatsApp" },
  { icon: Bot, label: "Respuestas de Stella", value: "86", delta: "100 % atendidas" },
  { icon: Truck, label: "Comisiones ahorradas", value: "318 €", delta: "este mes: 2.140 €" },
];

const APPOINTMENTS = [
  { time: "09:00", name: "Beatriz G.", service: "Cesta de fruta (1 kg)", status: "Completada", tone: "muted" },
  { time: "11:00", name: "Ana M.", service: "Café especial + tostada", status: "Confirmada", tone: "ok" },
  { time: "14:30", name: "Carlos R.", service: "Ramo de claveles", status: "Pendiente", tone: "warn" },
  { time: "16:00", name: "Diego F.", service: "Corte + barba", status: "Confirmada", tone: "ok" },
] as const;

const INVOICES = [
  { id: "F-2026-104", client: "Frutería El Dorado", total: "42,36 €", status: "Enviada" },
  { id: "F-2026-105", client: "Floristería Rosa Mágica", total: "87,12 €", status: "Pagada" },
  { id: "F-2026-106", client: "Taller Mecanizado", total: "340,00 €", status: "Borrador" },
];

const TONE: Record<string, string> = {
  ok: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
  warn: "bg-amber-400/10 text-amber-200 border-amber-400/25",
  muted: "bg-white/[0.04] text-muted border-white/10",
};

const ROUTE = "M30 120 C 80 112, 96 70, 150 72 S 230 100, 262 60 S 320 26, 350 24";
const ROUTE_SEGS = [
  { c1: [80, 112], c2: [96, 70], p: [150, 72] },
  { c1: [204, 74], c2: [230, 100], p: [262, 60] },
  { c1: [294, 20], c2: [320, 26], p: [350, 24] },
] as const;

// Vista previa estática del panel del cliente (componente de servidor: 0 KB de JS).
export default function DashboardPreview() {
  return (
    <section id="demo" aria-labelledby="demo-title" className="cv-auto relative w-full py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="eyebrow mb-5">
            <LayoutDashboard size={13} aria-hidden="true" /> Tu panel de control
          </span>
          <h2 id="demo-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Todo tu negocio, <span className="gradient-text">en una sola pantalla</span>
          </h2>
          <p className="mt-5 text-muted text-base sm:text-lg">
            Citas, conversaciones de Stella, facturas y repartos en directo. Desde el móvil o el ordenador, sin instalar nada.
          </p>
        </div>

        <div className="border-glow rounded-[2rem] overflow-hidden shadow-glass" role="img" aria-label="Vista previa del panel de control de LOCALIS AI con ventas, citas, facturas y repartos">
          {/* Barra superior */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/[0.07] bg-black/25">
            <div className="flex items-center gap-3 min-w-0">
              <BrandMark size={32} id="dash" />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">Frutería El Dorado</p>
                <p className="text-xs text-muted">Plan Pro · Zaragoza</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20">
              <span className="live-dot" aria-hidden="true" /> Stella activa
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
            {/* Menú lateral */}
            <nav aria-hidden="true" className="hidden lg:block border-r border-white/[0.07] bg-black/15 p-4 space-y-1">
              {NAV.map((n) => (
                <span
                  key={n.label}
                  className={
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm " +
                    (n.active ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/25" : "text-muted")
                  }
                >
                  <n.icon size={16} /> {n.label}
                </span>
              ))}
            </nav>

            <div className="p-4 sm:p-6 space-y-4 min-w-0">
              {/* KPIs */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {KPIS.map((k) => (
                  <div key={k.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
                    <p className="flex items-center gap-1.5 text-[11px] text-muted">
                      <k.icon size={13} className="text-cyan-400" aria-hidden="true" /> {k.label}
                    </p>
                    <p className="mt-1.5 font-display text-2xl font-bold text-emerald-400 tabular-nums">{k.value}</p>
                    <p className="text-[11px] text-emerald-300/80 mt-0.5 flex items-center gap-1">
                      <TrendingUp size={11} aria-hidden="true" /> {k.delta}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
                {/* Citas */}
                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.07] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm">Agenda de hoy</p>
                    <span className="text-[11px] text-muted">Sincronizada con Google Calendar</span>
                  </div>
                  <ul className="space-y-2">
                    {APPOINTMENTS.map((a) => (
                      <li key={a.time} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0B0F17]/60 border border-white/[0.05]">
                        <span className="font-mono text-xs text-cyan-300 w-11 shrink-0">{a.time}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">{a.name}</span>
                          <span className="block text-xs text-muted truncate">{a.service}</span>
                        </span>
                        <span className={"text-[11px] px-2 py-0.5 rounded-full border shrink-0 " + TONE[a.tone]}>{a.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Repartos */}
                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.07] p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm">Repartos en curso</p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                      <span className="live-dot" aria-hidden="true" /> 2 en ruta
                    </span>
                  </div>
                  <div className="relative overflow-hidden rounded-xl">
                  <svg viewBox="0 0 380 150" width="380" height="150" className="w-full h-auto rounded-xl bg-[#0A0E15]" aria-hidden="true">
                    <path d="M-10 52 C 70 34, 140 66, 220 46 S 340 26, 390 40" stroke="rgba(59,130,246,0.25)" strokeWidth="12" fill="none" />
                    <g stroke="rgba(255,255,255,0.05)" strokeWidth="1.5">
                      <path d="M0 100 H380" />
                      <path d="M90 0 V150" />
                      <path d="M200 0 V150" />
                      <path d="M300 0 V150" />
                    </g>
                    <path d={ROUTE} stroke="#00F2FE" strokeWidth="2.5" fill="none" strokeDasharray="5 7" strokeLinecap="round" />
                    <circle cx="350" cy="24" r="6" fill="#10B981" stroke="#0B0F17" strokeWidth="2" />
                    <circle cx="30" cy="120" r="5" fill="#3B82F6" />
                  </svg>
                  <RouteMarker name="dash-route" start={[30, 120]} segs={[...ROUTE_SEGS]} viewW={380} viewH={150} duration={10} />
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs">
                    <li className="flex justify-between">
                      <span className="text-muted">Luis G. · pedido #104</span>
                      <span className="text-emerald-400 font-semibold">llega en 4 min</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted">Marta R. · pedido #108</span>
                      <span className="text-emerald-400 font-semibold">llega en 9 min</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Facturas */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.07] p-4">
                <p className="font-semibold text-sm mb-3">Últimas facturas emitidas por Stella</p>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {INVOICES.map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0B0F17]/60 border border-white/[0.05]">
                      <span className="min-w-0">
                        <span className="block text-sm font-medium truncate">{inv.client}</span>
                        <span className="block text-[11px] text-muted">
                          {inv.id} · {inv.status}
                        </span>
                      </span>
                      <span className="font-display font-bold text-sm text-cyan-300 tabular-nums shrink-0">{inv.total}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
