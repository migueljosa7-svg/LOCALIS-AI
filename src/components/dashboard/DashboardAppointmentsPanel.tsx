"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, X, RefreshCw, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SAMPLE_APPOINTMENTS } from "@/lib/demoSamples";
import type { Appointment } from "@/types";

type Status = Appointment["status"];

const STATUS_CLASS: Record<Status, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-yellow-500/15 text-yellow-400",
  completed: "bg-cyan-500/15 text-cyan-400",
  cancelled: "bg-red-500/15 text-red-400",
};

const STATUS_LABEL: Record<Status, string> = {
  confirmed: "confirmada",
  pending: "pendiente",
  completed: "completada",
  cancelled: "cancelada",
};

export function DashboardAppointmentsPanel() {
  const [appts, setAppts] = useState<Appointment[]>(SAMPLE_APPOINTMENTS);
  const [syncing, setSyncing] = useState<string | null>(null);

  const setStatus = (id: string, status: Status) =>
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const sync = (id: string) => {
    setSyncing(id);
    window.setTimeout(() => {
      setStatus(id, "confirmed");
      setSyncing(null);
    }, 700);
  };

  return (
    <div className="space-y-3">
      {appts.map((a) => (
        <motion.div
          key={a.id}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border border-border bg-background/50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-full bg-cyan-500/15 flex items-center justify-center">
                <User size={14} className="text-cyan-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{a.customerName}</p>
                <p className="text-xs text-muted truncate">{a.service}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={11} /> {a.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {a.time}
                  </span>
                </div>
              </div>
            </div>
            <span className={cn("text-[10px] px-2 py-1 rounded-full font-medium shrink-0", STATUS_CLASS[a.status])}>
              {STATUS_LABEL[a.status]}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <ActionBtn
              onClick={() => setStatus(a.id, "confirmed")}
              disabled={a.status === "confirmed" || a.status === "completed"}
              className="hover:border-emerald-500/40 text-emerald-400"
            >
              <Check size={12} /> Confirmar
            </ActionBtn>
            <ActionBtn
              onClick={() => setStatus(a.id, "cancelled")}
              disabled={a.status === "cancelled"}
              className="hover:border-red-500/40 text-red-400"
            >
              <X size={12} /> Cancelar
            </ActionBtn>
            <ActionBtn
              onClick={() => sync(a.id)}
              disabled={syncing === a.id}
              className="hover:border-cyan-500/40 text-cyan-400"
            >
              <RefreshCw size={12} className={cn(syncing === a.id && "animate-spin")} />
              {syncing === a.id ? "Sincronizando…" : "Sincronizar"}
            </ActionBtn>
          </div>

          <AnimatePresence>
            {a.status === "cancelled" && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[11px] text-red-400 mt-2"
              >
                Se ha notificado al cliente por WhatsApp de la cancelación.
              </motion.p>
            )}
            {a.calendarEvent === null && a.status === "confirmed" && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-[11px] text-emerald-400 mt-2"
              >
                ✓ Evento creado en Google Calendar y confirmación enviada.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background/60 text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </button>
  );
}
