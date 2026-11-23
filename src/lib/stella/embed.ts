// Autorización del chat incrustado: decide si una web puede mostrar el chat de un negocio y, si es así,
// emite el token de sesión. Lógica pura (sin Next ni Supabase) para poder probarla.
import { hashKey, randomId, signToken, TOKEN_TTL_SECONDS } from "./token";
import { hostAllowed, normalizeHost } from "./domains";
import { ID_RE, type StellaBusiness } from "./ficha";
import type { StellaConfig } from "./config";
import type { StellaStore } from "./types";

export type EmbedDenied = "disabled" | "not-found" | "inactive" | "not-framed" | "domain" | "rate" | "unavailable";

export interface EmbedRequest {
  negocio: string | undefined;
  /** cabecera Referer (el iframe lleva referrerpolicy="origin": solo el origen de la web que lo incrusta) */
  referer: string | null;
  /** cabecera Sec-Fetch-Dest: «iframe» cuando lo carga un navegador dentro de un iframe */
  fetchDest: string | null;
  host: string | null;
  ip: string;
}

export type EmbedResult =
  | { ok: true; business: StellaBusiness; token: string; embedHost: string }
  | { ok: false; reason: EmbedDenied };

export async function authorizeEmbed(deps: { store: StellaStore; config: StellaConfig; now?: () => number }, req: EmbedRequest): Promise<EmbedResult> {
  if (!deps.config.enabled || !deps.config.secret) return { ok: false, reason: "disabled" };
  if (!req.negocio || !ID_RE.test(req.negocio)) return { ok: false, reason: "not-found" };
  const business = await deps.store.getBusiness(req.negocio);
  if (!business) return { ok: false, reason: "not-found" };
  if (!business.active) return { ok: false, reason: "inactive" };

  // Los navegadores marcan las cargas dentro de un iframe: abrir la URL directamente no sirve.
  // (Un script puede falsificar estas cabeceras; la defensa real son el CSP frame-ancestors del
  // navegador, los límites persistentes y los topes de gasto.)
  if (req.fetchDest && req.fetchDest !== "iframe") return { ok: false, reason: "not-framed" };

  let refHost = "";
  try {
    refHost = new URL(req.referer ?? "").host;
  } catch {}
  const own = req.host ? normalizeHost(req.host) : null;
  const refNorm = normalizeHost(refHost);
  const fromOwnSite = business.builtin === true && !!own && !!refNorm && own === refNorm;
  if (!fromOwnSite && !hostAllowed(refHost, business.domains)) return { ok: false, reason: "domain" };

  const now = Math.floor((deps.now?.() ?? Date.now()) / 1000);
  const ipKey = await hashKey(deps.config.secret, req.ip);
  const gate = await deps.store.gate({
    businessId: business.id,
    rates: [{ name: "embed", key: `ip:${ipKey}:embed`, window: 3600, limit: 60 }],
    bizDayMicro: 0,
    bizMonthMicro: 0,
    globalDayMicro: 0,
    globalMonthMicro: 0,
  });
  if (!gate.ok) return { ok: false, reason: gate.reason === "unavailable" ? "unavailable" : "rate" };

  const token = await signToken(deps.config.secret, { b: business.id, s: randomId(), h: refHost, i: now, e: now + TOKEN_TTL_SECONDS });
  return { ok: true, business, token, embedHost: refHost };
}

/** Token de prueba para el panel /admin: vale aunque el negocio esté desactivado y no guarda contactos. */
export async function issueTestToken(config: StellaConfig, businessId: string, now = Math.floor(Date.now() / 1000)): Promise<string | null> {
  if (!config.secret) return null;
  return signToken(config.secret, { b: businessId, s: randomId(), h: "panel-admin", i: now - 5, e: now + 3600, t: 1 });
}

export const DENIED_TEXT: Record<EmbedDenied, string> = {
  disabled: "El asistente no está disponible en este momento.",
  "not-found": "Asistente no encontrado.",
  inactive: "El asistente no está disponible en este momento.",
  "not-framed": "Este asistente solo se muestra dentro de la web del negocio.",
  domain: "Este asistente no está autorizado en esta web.",
  rate: "Demasiadas cargas seguidas. Inténtalo de nuevo en unos minutos.",
  unavailable: "El asistente no está disponible en este momento.",
};
