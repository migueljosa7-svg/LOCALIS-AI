// Eventos de conversión para Google Ads / Analytics (gtag cargado en layout.tsx).
// Respeta Consent Mode: si el usuario rechazó cookies, Google solo recibe pings anónimos.

type Gtag = (...args: unknown[]) => void;

/**
 * Etiqueta de conversión de Google Ads ("AW-XXXX/YYYY"). Se obtiene en
 * Google Ads → Objetivos → Conversiones → Configuración de etiqueta.
 * Defínela en Vercel como NEXT_PUBLIC_GADS_LEAD_SEND_TO para medir cada lead.
 */
const LEAD_SEND_TO = process.env.NEXT_PUBLIC_GADS_LEAD_SEND_TO;

export function trackLead(source: string, detail?: string): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", "generate_lead", { lead_source: source, lead_detail: detail ?? "" });
    if (LEAD_SEND_TO) gtag("event", "conversion", { send_to: LEAD_SEND_TO });
  } catch {
    // La analítica nunca debe romper el formulario.
  }
}
