import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { SAMPLE_APPOINTMENTS } from "@/lib/demoSamples";
import type { Appointment } from "@/types";

const STATUS_CLASS: Record<Appointment["status"], string> = {
  confirmed: "bg-emerald-500/10 text-emerald-400",
  pending: "bg-yellow-500/10 text-yellow-400",
  completed: "bg-cyan-500/10 text-cyan-400",
  cancelled: "bg-red-500/10 text-red-400",
};

export function AppointmentsPanel() {
  return (
    <div className="glass rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-sm">Citas activas</h4>
        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-full">
          {SAMPLE_APPOINTMENTS.length}
        </span>
      </div>
      <div className="space-y-3">
        {SAMPLE_APPOINTMENTS.map((apt) => (
          <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Calendar size={12} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{apt.customerName}</p>
              <p className="text-xs text-muted">{apt.service} · {apt.date} {apt.time}</p>
            </div>
            <span className={cn("text-xs px-2 py-1 rounded-full shrink-0", STATUS_CLASS[apt.status])}>
              {apt.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
