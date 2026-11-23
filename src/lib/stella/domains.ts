// Dominios autorizados de cada negocio. Funciones puras (sin acceso a red ni BD).

const HOST_RE = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

/** Convierte «https://www.Ejemplo.com/inicio» o «ejemplo.com» en el host «www.ejemplo.com». null si no es válido. */
export function normalizeHost(input: string): string | null {
  let s = input.trim().toLowerCase();
  if (!s) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//.test(s)) {
    try {
      const u = new URL(s);
      if (u.protocol !== "https:" && u.protocol !== "http:") return null;
      s = u.hostname;
    } catch {
      return null;
    }
  } else {
    s = s.split(/[/?#]/)[0].replace(/:\d+$/, "");
  }
  s = s.replace(/\.$/, "");
  if (/^\d+\.\d+\.\d+\.\d+$/.test(s) || s === "localhost") return null; // sin IPs ni localhost
  return HOST_RE.test(s) ? s : null;
}

/** Lista escrita a mano (una por línea o separada por comas) → hosts únicos válidos + entradas rechazadas. */
export function parseDomains(raw: string): { hosts: string[]; rejected: string[] } {
  const hosts: string[] = [];
  const rejected: string[] = [];
  for (const part of raw.split(/[\n,;\s]+/).map((p) => p.trim()).filter(Boolean)) {
    const h = normalizeHost(part);
    if (!h) rejected.push(part);
    else if (!hosts.includes(h)) hosts.push(h);
  }
  return { hosts, rejected };
}

/** ejemplo.com y www.ejemplo.com se consideran la misma web. Los subdominios NO se admiten salvo que se listen. */
function variants(host: string): string[] {
  return host.startsWith("www.") ? [host, host.slice(4)] : [host, `www.${host}`];
}

/** ¿El host que incrusta el chat está autorizado? Coincidencia exacta (con o sin www). */
export function hostAllowed(host: string | null | undefined, allowed: string[]): boolean {
  const h = host ? normalizeHost(host) : null;
  if (!h) return false;
  return allowed.some((a) => variants(a).includes(h));
}

/** Valor de la directiva CSP `frame-ancestors`: solo nuestra web y los dominios del negocio. */
export function frameAncestors(allowed: string[]): string {
  const origins = allowed.flatMap((a) => variants(a).map((v) => `https://${v}`));
  return `frame-ancestors 'self'${origins.length ? " " + origins.join(" ") : ""}`;
}
