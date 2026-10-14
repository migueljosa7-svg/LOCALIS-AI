/**
 * Variables de entorno tipadas con fallbacks seguros.
 * Nunca lances si falta una ENV opcional: usa fallbacks y avisa en dev.
 */
function str(name: string, fallback = ""): string {
  const v = process.env[name];
  if (typeof v === "string" && v.length > 0) return v;
  if (process.env.NODE_ENV !== "production" && fallback === "" && name.startsWith("NEXT_PUBLIC_")) {
    // Silencioso: las públicas vacías son válidas en demo local.
  }
  return fallback;
}

export const env = {
  siteUrl: str("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
  mapboxToken: str("NEXT_PUBLIC_MAPBOX_TOKEN", ""),
  googleClientId: str("NEXT_PUBLIC_GOOGLE_CLIENT_ID", ""),
  whatsappBusinessId: str("NEXT_PUBLIC_WHATSAPP_BUSINESS_ID", ""),
  gpsWsUrl: str("NEXT_PUBLIC_GPS_WS_URL", ""),
  apiBaseUrl: str("NEXT_PUBLIC_API_BASE_URL", ""),
  plausibleDomain: str("NEXT_PUBLIC_PLAUSIBLE_DOMAIN", str("NEXT_PUBLIC_PLausible_DOMAIN", "")),
  // Solo servidor (nunca exponer con NEXT_PUBLIC_):
  googleClientSecret: str("GOOGLE_CLIENT_SECRET", ""),
  whatsappToken: str("WHATSAPP_ACCESS_TOKEN", ""),
  whatsappPhoneNumberId: str("WHATSAPP_PHONE_NUMBER_ID", ""),
  leadInbox: str("LEAD_INBOX_EMAIL", "hola@localis.ai"),
} as const;

export type AppEnv = typeof env;
