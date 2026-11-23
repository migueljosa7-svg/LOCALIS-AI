/**
 * Variables de entorno del email de leads, con valores por defecto seguros.
 * (Supabase, panel y Stella leen las suyas directamente en src/lib/db.ts,
 * src/middleware.ts y src/lib/stella/businesses.ts.)
 */
function str(name: string, fallback = ""): string {
  const v = process.env[name];
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

export const env = {
  leadInbox: str("LEAD_INBOX_EMAIL", "migueljosa7@gmail.com"),
  // Email de leads (Resend): sin API key el formulario funciona pero no envía correos.
  resendApiKey: str("RESEND_API_KEY", ""),
  emailFrom: str("EMAIL_FROM", "LOCALIS AI <onboarding@resend.dev>"),
} as const;

export type AppEnv = typeof env;
