"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** Datos con los que se pre-rellena el formulario (p. ej. desde el configurador). */
export interface LeadPrefill {
  /** Debe coincidir con una opción de LEAD_SECTORS. */
  sector?: string;
  /** Resumen legible de la configuración elegida; se envía con el lead. */
  details?: string;
}

interface LeadContextValue {
  /** Abre el modal de captura. `source` etiqueta el origen del CTA. */
  openLead: (source?: string, prefill?: LeadPrefill) => void;
  closeLead: () => void;
  isOpen: boolean;
  source: string | null;
  prefill: LeadPrefill | null;
}

const LeadContext = createContext<LeadContextValue | null>(null);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<LeadPrefill | null>(null);

  const openLead = useCallback((from?: string, data?: LeadPrefill) => {
    setSource(from ?? null);
    setPrefill(data ?? null);
    setIsOpen(true);
  }, []);

  const closeLead = useCallback(() => setIsOpen(false), []);

  const value = useMemo<LeadContextValue>(
    () => ({ openLead, closeLead, isOpen, source, prefill }),
    [openLead, closeLead, isOpen, source, prefill]
  );

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
}

export function useLead(): LeadContextValue {
  const ctx = useContext(LeadContext);
  if (!ctx) {
    throw new Error("useLead debe usarse dentro de <LeadProvider>.");
  }
  return ctx;
}
