import { AppointmentsPanel } from "./AppointmentsPanel";
import { AiMetricsPanel } from "./AiMetricsPanel";
import { StellaChatPanel } from "./StellaChatPanel";
import { GpsMapPanel } from "./GpsMapPanel";
import { NavItem } from "./NavItem";
import type { Business } from "@/types";

export default function DashboardShell({
  activeBusiness,
}: {
  activeBusiness: Business;
}) {
  return (
    <div className="glass rounded-2xl border border-border overflow-hidden">
      <DashboardHeader activeBusiness={activeBusiness} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        <Sidebar />
        <div className="lg:col-span-3 p-5 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppointmentsPanel />
            <AiMetricsPanel />
            <StellaChatPanel />
            <GpsMapPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardHeader({ activeBusiness }: { activeBusiness: Business }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background/50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-cobalt-500 flex items-center justify-center text-white">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 2C4.79086 2 3 3.79086 3 6C3 7.65685 4.65685 9 6.5 9C7.33795 9 8 8.33795 8 7.5C8 7.22386 7.77614 7 7.5 7C7.22386 7 7 7.22386 7 7.5C7 8.33795 7.66205 9 8.5 9C10.3431 9 12 7.65685 12 6C12 3.79086 9.20914 2 7 2Z"
              fill="currentColor"
              className="text-cyan-400"
              fillOpacity="0.3"
            />
            <circle cx="7" cy="6" r="1.5" fill="currentColor" className="text-cyan-400" />
            <path
              d="M7 4.5C6.44772 4.5 6 4.94772 6 5.5C6 6.05228 6.44772 6.5 7 6.5C7.55228 6.5 8 6.05228 8 5.5C8 4.94772 7.55228 4.5 7 4.5Z"
              fill="currentColor"
              className="text-cyan-400"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-sm">{activeBusiness.name}</h3>
          <p className="text-xs text-muted">{activeBusiness.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full font-medium">
          Conectado
        </span>
        <button
          className="glass p-2 rounded-lg hover:border-cyan-500/30 transition-all"
          aria-label="Cerrar sesion"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 1L2 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 1L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Sidebar() {
  const navItems = [
    { icon: "Citas", label: "Citas activas" },
    { icon: "IA", label: "Metricas IA" },
    { icon: "Chat", label: "Chat de Stella" },
    { icon: "Mapa", label: "Mapa de flota" },
    { icon: "Doc", label: "Facturas" },
    { icon: "GPS", label: "Repartos GPS" },
  ];
  return (
    <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-border bg-background/30 lg:bg-background/50">
      <div className="p-4 space-y-2">
        {navItems.map((item, i) => (
          <NavItem key={i} icon={item.icon} label={item.label} />
        ))}
      </div>
    </div>
  );
}
