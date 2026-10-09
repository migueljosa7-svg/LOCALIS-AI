"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface LeadContextValue {
  /** Abre el modal de captura. `source` permite etiquetar el origen del CTA. */
  openLead: (source?: string) => void;
  closeLead: () => void;
  isOpen: boolean;
  source: string | null;
}

const LeadContext = createContext<LeadContextValue | null>(null);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  const openLead = useCallback((from?: string) => {
    setSource(from ?? null);
    setIsOpen(true);
  }, []);

  const closeLead = useCallback(() => setIsOpen(false), []);

  const value = useMemo<LeadContextValue>(
    () => ({ openLead, closeLead, isOpen, source }),
    [openLead, closeLead, isOpen, source]
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
