"use client";

import { useEffect, useState } from "react";

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  version: string;
}

const STORAGE_KEY = "localis-cookie-consent";
const CURRENT_VERSION = "2026-10-10";

function readStored(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

function writeStored(state: ConsentState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode errors
  }
}

export default function LegalBanner() {
  const [accepted, setAccepted] = useState(false);
  const [consent, setConsent] = useState<ConsentState | null>(null);

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setConsent(stored);
      setAccepted(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const next: ConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      version: CURRENT_VERSION,
    };
    setConsent(next);
    setAccepted(true);
    writeStored(next);
  };

  const handleRejectAll = () => {
    const next: ConsentState = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      version: CURRENT_VERSION,
    };
    setConsent(next);
    setAccepted(true);
    writeStored(next);
  };

  // Si el usuario ya ha decidido, no mostramos el banner.
  if (accepted || consent?.version === CURRENT_VERSION) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] glass border-t border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-muted leading-relaxed">
            <span className="font-semibold text-foreground">Acepta los
            cookies</span> para navegar cómodamente y ayudarnos a mejorar la web.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRejectAll}
              className="px-4 py-2 rounded-xl text-sm font-semibold glass border border-glass-border hover:border-red-500/30 text-red-400 transition-all cursor-pointer"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white hover:shadow-neonglow transition-all cursor-pointer"
            >
              Aceptar todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
