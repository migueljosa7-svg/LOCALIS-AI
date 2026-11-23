// Configuración de Stella leída de variables de entorno (solo servidor). Sin efectos secundarios.
//
//  ANTHROPIC_API_KEY              clave de la API de Claude (sin ella Stella queda apagada)
//  STELLA_MODEL                   modelo (por defecto claude-haiku-5-5)
//  STELLA_ENABLED=false           interruptor general: apaga Stella en toda la plataforma
//  STELLA_SIGNING_SECRET          secreto para firmar sesiones (si falta, se deriva de la clave de Supabase)
//  STELLA_GLOBAL_DAILY_USD        tope de gasto diario sumando todos los negocios (def. 3)
//  STELLA_GLOBAL_MONTHLY_USD      tope de gasto mensual global (def. 20)
//  STELLA_SITE_WIDGET=on          muestra Stella también en la web de LOCALIS (def. apagado)

import { usdToMicro } from "./cost";

export const DEFAULT_MODEL = "claude-haiku-5-5";

export interface StellaConfig {
  enabled: boolean;
  model: string;
  /** null si no hay forma de firmar sesiones (entonces Stella no puede funcionar). */
  secret: string | null;
  globalDailyMicro: number;
  globalMonthlyMicro: number;
}

function num(v: string | undefined, fallback: number): number {
  const n = Number(v);
  return v !== undefined && v.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function readConfig(env: Record<string, string | undefined> = process.env): StellaConfig {
  const secret = env.STELLA_SIGNING_SECRET?.trim() || (env.SUPABASE_SERVICE_ROLE_KEY?.trim() ? `stella-v1:${env.SUPABASE_SERVICE_ROLE_KEY.trim()}` : null);
  return {
    enabled: Boolean(env.ANTHROPIC_API_KEY?.trim()) && env.STELLA_ENABLED?.trim().toLowerCase() !== "false" && secret !== null,
    model: env.STELLA_MODEL?.trim() || DEFAULT_MODEL,
    secret,
    globalDailyMicro: usdToMicro(num(env.STELLA_GLOBAL_DAILY_USD, 3)),
    globalMonthlyMicro: usdToMicro(num(env.STELLA_GLOBAL_MONTHLY_USD, 20)),
  };
}
