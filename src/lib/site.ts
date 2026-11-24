// Datos de contacto y URL pública centralizados (una sola fuente de verdad).
// Prioridad: NEXT_PUBLIC_SITE_URL (dominio propio) → dominio de producción que
// Vercel inyecta en el build → localhost en desarrollo.
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl().replace(/\/$/, "");

export const CONTACT = {
  phoneE164: "+34640809238",
  phoneDisplay: "+34 640 80 92 38",
  email: "migueljosa7@gmail.com",
  city: "Zaragoza",
  region: "Aragón",
} as const;

const WA_NUMBER = "34640809238";

/** Enlace wa.me con mensaje pre-rellenado. */
export function waLink(text = "Hola LOCALIS AI, quiero información para mi negocio en Zaragoza"): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export const WA_QUOTE_TEXT = "Hola LOCALIS AI, quiero información y un presupuesto para la página web de mi negocio";

/**
 * Datos legales del titular (LSSI-CE art. 10). NO se inventan: se rellenan cuando el titular los aporte y aparecen solos en el Aviso legal.
 * Vacío = no se muestra. Pendiente de aportar: nombre o razón social, NIF/CIF y domicilio.
 */
export const LEGAL: { titular: string; nif: string; domicilio: string } = { titular: "", nif: "", domicilio: "" };
