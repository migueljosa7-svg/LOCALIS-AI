"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass border-glow rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold font-display text-lg">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="glass p-2 rounded-lg hover:border-cyan-500/40 transition-all cursor-pointer"
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

export function CalendarCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="border-glow rounded-xl p-4 bg-background/60 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <Calendar size={14} className="text-cyan-400" />
        <p className="text-xs font-semibold">Google Calendar · sincronizado</p>
      </div>
      <p className="text-sm font-bold">Corte + barba · Cliente nuevo</p>
      <p className="text-xs text-muted mt-1">Jueves 10 de septiembre · 11:00 (45 min)</p>
      <div className="flex gap-2 mt-3">
        <span className="text-[10px] px-2 py-1 rounded-md bg-cyan-500/15 text-cyan-400 font-medium">
          hueco libre confirmado
        </span>
        <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-medium">
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

export function CalendarModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AppModal open={open} onClose={onClose} title="Vista previa de cita">
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-background/60 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-cyan-500 to-cobalt-500" />
          <div className="p-4 space-y-2 text-sm">
            <p className="font-bold">Corte + barba · Cliente nuevo</p>
            <p className="text-muted">Jueves 10 sept · 11:00 - 11:45</p>
            <p className="text-muted">Cliente: Carlos Ruiz · +34 623 456 789</p>
            <p className="text-xs text-emerald-400">Recordatorio: WhatsApp 15 min antes</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow transition-all cursor-pointer"
        >
          Confirmado
        </button>
      </div>
    </AppModal>
  );
}
