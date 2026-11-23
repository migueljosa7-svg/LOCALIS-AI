// Token de sesión de Stella: firmado con HMAC-SHA256 (Web Crypto: funciona en Node y en Edge).
// Lo emite SOLO la página del chat (/stella/embed) tras comprobar negocio, estado y dominio en el
// servidor. La API del chat no acepta nada sin un token válido, vigente y del mismo negocio.
//
// Honestidad técnica: ninguna comprobación del navegador (Origin, Referer) es una autenticación
// completa, porque un script externo puede falsificarlas. Por eso el token NO es la única defensa:
// van además límites persistentes por IP/sesión/negocio y topes de gasto. Ver docs/STELLA-GUIA.md.

export interface StellaTokenPayload {
  /** negocio */
  b: string;
  /** id de sesión aleatorio */
  s: string;
  /** host que incrusta el chat (informativo) */
  h: string;
  /** emitido (segundos epoch) */
  i: number;
  /** caduca (segundos epoch) */
  e: number;
  /** token de prueba emitido desde /admin: puede usarse aunque el negocio esté desactivado */
  t?: 1;
}

export const TOKEN_TTL_SECONDS = 4 * 60 * 60;
/** Margen por desfase de reloj entre servidores: un token «del futuro» más allá de este margen se rechaza. */
export const TOKEN_CLOCK_SKEW_SECONDS = 60;

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function equal(a: Uint8Array, b: Uint8Array): boolean {
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return d === 0;
}

export async function signToken(secret: string, payload: StellaTokenPayload): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  return `${body}.${b64url(await hmac(secret, body))}`;
}

export type VerifyResult = { ok: true; payload: StellaTokenPayload } | { ok: false; reason: "malformed" | "signature" | "expired" | "too-new" };

export async function verifyToken(secret: string, token: unknown, nowSec = Math.floor(Date.now() / 1000)): Promise<VerifyResult> {
  if (typeof token !== "string" || token.length > 1000) return { ok: false, reason: "malformed" };
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return { ok: false, reason: "malformed" };
  let sigBytes: Uint8Array;
  try {
    sigBytes = fromB64url(sig);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (!equal(sigBytes, await hmac(secret, body))) return { ok: false, reason: "signature" };
  let p: StellaTokenPayload;
  try {
    p = JSON.parse(new TextDecoder().decode(fromB64url(body))) as StellaTokenPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (typeof p?.b !== "string" || typeof p.s !== "string" || typeof p.i !== "number" || typeof p.e !== "number") return { ok: false, reason: "malformed" };
  if (nowSec >= p.e) return { ok: false, reason: "expired" };
  if (nowSec < p.i - TOKEN_CLOCK_SKEW_SECONDS) return { ok: false, reason: "too-new" };
  return { ok: true, payload: p };
}

export function randomId(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(12)));
}

/** Huella no reversible de un dato (p. ej. la IP) para los contadores: no se guarda en claro. */
export async function hashKey(secret: string, value: string): Promise<string> {
  return b64url((await hmac(secret, `k:${value}`)).slice(0, 12));
}
