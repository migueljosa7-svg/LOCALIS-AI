// Estado de Stella en la web de LOCALIS (solo booleanos: nunca se muestra ni se devuelve ningún valor secreto).
import { readConfig } from "./config";

export interface SiteStatus {
  /** El chat real está encendido en esta web. */
  live: boolean;
  /** Mostrar el aviso «pendiente de configuración» (solo fuera de producción). */
  showPending: boolean;
  checks: { label: string; ok: boolean; how: string }[];
}

export function siteStatus(env: Record<string, string | undefined> = process.env): SiteStatus {
  const cfg = readConfig(env);
  const widget = env.STELLA_SITE_WIDGET?.trim().toLowerCase() === "on";
  const live = widget && cfg.enabled;
  return {
    live,
    // En producción, sin configurar, la web queda como siempre (sin avisos). En Preview y local se explica qué falta.
    showPending: !live && env.VERCEL_ENV !== "production",
    checks: [
      { label: "Clave de la IA (ANTHROPIC_API_KEY)", ok: Boolean(env.ANTHROPIC_API_KEY?.trim()), how: "Añádela en Vercel → Settings → Environment Variables (marca Preview)." },
      { label: "Base de datos (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY)", ok: Boolean(env.SUPABASE_URL?.trim() && env.SUPABASE_SERVICE_ROLE_KEY?.trim()), how: "Ya las usa la captación de leads; deben estar también en Preview." },
      { label: "Interruptor STELLA_SITE_WIDGET = on", ok: widget, how: "Añádela con el valor on (marca Preview)." },
      { label: "Stella no está apagada (STELLA_ENABLED)", ok: env.STELLA_ENABLED?.trim().toLowerCase() !== "false", how: "Quita STELLA_ENABLED=false." },
    ],
  };
}
