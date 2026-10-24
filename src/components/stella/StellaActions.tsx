"use client";

import { useEffect, useId } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Calendar, X } from "lucide-react";

export function AppModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const titleId = useId();

  // Escape para cerrar + bloqueo del scroll de fondo mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-[#05080d]/80 glass-bar"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="border-glow rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto overscroll-contain p-5 sm:p-6 relative shadow-glass"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 id={titleId} className="font-bold font-display text-lg">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                autoFocus
                className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-lg border border-white/10 hover:border-cyan-500/40 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CalendarCard({ onOpen, dayLabel, dayDate, time, service, kind }: { onOpen: () => void; dayLabel?: string; dayDate?: string; time?: string; service?: string; kind?: "availability" | "booking" }) {
  const title = service ?? "Corte + barba · Cliente nuevo";
  const when = dayLabel && dayDate && time ? `${cap(dayLabel)} ${dayDate} · ${time} (45 min)` : "Jueves 10 de septiembre · 11:00 (45 min)";
  const badge = kind === "availability" ? "huecos libres detectados" : "hueco libre confirmado";
  return (
    <div className="border-glow rounded-xl p-4 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <Calendar size={14} className="text-cyan-400" />
        <p className="text-xs font-semibold">Google Calendar · sincronizado</p>
      </div>
      <p className="text-sm font-bold">{title}</p>
      <p className="text-xs text-muted mt-1">{when}</p>
      <div className="flex gap-2 mt-3">
        <span className="text-[10px] px-2 py-1 rounded-md bg-cyan-500/15 text-cyan-400 font-medium">
          {badge}
        </span>
        <span className="text-[10px] px-2 py-1 rounded-md bg-[#25D366]/15 text-[#5ee08f] font-medium">
          WhatsApp enviado
        </span>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer transition-all hover:scale-[1.02]"
      >
        Ver en calendario →
      </button>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function CalendarModal({ open, onClose, dayLabel, dayDate, time, service, client }: { open: boolean; onClose: () => void; dayLabel?: string; dayDate?: string; time?: string; service?: string; client?: string }) {
  const title = service ? `${service} · ${client ?? "Cliente nuevo"}` : "Corte + barba · Cliente nuevo";
  const when = dayLabel && dayDate && time ? `${cap(dayLabel)} ${dayDate} · ${time} - ${addMinutes(time, 45)}` : "Jueves 10 sept · 11:00 - 11:45";
  return (
    <AppModal open={open} onClose={onClose} title="Vista previa de cita">
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-background/60 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-cyan-500 to-cobalt-500" />
          <div className="p-4 space-y-2 text-sm">
            <p className="font-bold">{title}</p>
            <p className="text-muted">{when}</p>
            <p className="text-muted">Cliente: {client ?? "Carlos Ruiz"} · +34 623 456 789</p>
            <p className="text-xs text-cyan-300">Recordatorio por WhatsApp 2 h antes</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-primary w-full"
        >
          Confirmado
        </button>
      </div>
    </AppModal>
  );
}

function addMinutes(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(2026, 0, 1, h, m + mins);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
