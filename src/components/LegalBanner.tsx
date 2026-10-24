"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: string;
}

const STORAGE_KEY = "localis-cookie-consent";
const CURRENT_VERSION = "2026-10-24";
export const OPEN_EVENT = "localis:open-cookie-settings";

type Gtag = (...args: unknown[]) => void;

function readStored(): ConsentState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

/** Comunica la elección a Google Consent Mode v2. */
function applyConsent(state: ConsentState) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  const ads = state.marketing ? "granted" : "denied";
  gtag("consent", "update", {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: state.analytics ? "granted" : "denied",
  });
}

export default function LegalBanner() {
  // Oculto en SSR: solo se muestra tras comprobar que no hay elección guardada
  // (evita el parpadeo del banner a visitantes recurrentes).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (!stored || stored.version !== CURRENT_VERSION) setVisible(true);
    // «Configurar cookies» (pie de página) vuelve a abrir el banner.
    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const decide = (accept: boolean) => {
    const next: ConsentState = { necessary: true, analytics: accept, marketing: accept, version: CURRENT_VERSION };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // modo privado: la elección vale solo para esta visita
    }
    applyConsent(next);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] animate-fade-rise"
    >
      <div className="glass-bar mx-auto max-w-3xl rounded-2xl border border-white/10 shadow-glass px-4 py-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <div className="flex items-start gap-3 text-sm text-muted leading-relaxed">
          <Cookie size={18} className="text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Usamos cookies propias y de Google para medir campañas y mejorar la web.{" "}
            <Link href="/cookies" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
              Política de cookies
            </Link>
          </p>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <button type="button" onClick={() => decide(false)} className="btn btn-ghost flex-1 sm:flex-none min-h-[44px] px-4 text-sm">
            Rechazar
          </button>
          <button type="button" onClick={() => decide(true)} className="btn btn-primary flex-1 sm:flex-none min-h-[44px] px-4 text-sm">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
