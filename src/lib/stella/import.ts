// Importación de un BORRADOR desde la web pública de un negocio. Solo se usa desde el panel (autenticado) y
// nunca publica nada: el resultado rellena el formulario de alta para que una persona lo revise.
// Protecciones: solo http(s) en puertos 80/443, sin credenciales en la URL, sin IPs privadas ni localhost (SSRF),
// redirecciones revisadas una a una, tiempo y tamaño limitados.
import { lookup as dnsLookup } from "node:dns/promises";

export function isPrivateIp(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return isPrivateIp(v.slice(7));
  if (v === "::1" || v === "::" || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb") || v.startsWith("fc") || v.startsWith("fd")) return true;
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(v);
  if (!m) return v.includes(":") ? false : true; // algo que no es una IP válida: se trata como no seguro
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

export type Lookup = (host: string) => Promise<{ address: string }[]>;
const defaultLookup: Lookup = (h) => dnsLookup(h, { all: true });

export async function assertPublicUrl(raw: string, lookup: Lookup = defaultLookup): Promise<URL> {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    throw new Error("La dirección no es válida. Escribe algo como https://www.minegocio.es");
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("Solo se admiten direcciones http:// o https://");
  if (u.username || u.password) throw new Error("La dirección no puede llevar usuario ni contraseña.");
  if (u.port && u.port !== "80" && u.port !== "443") throw new Error("Solo se admiten los puertos web habituales (80 y 443).");
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, ""); // las IPv6 llegan entre corchetes
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".localhost")) throw new Error("No se pueden importar direcciones internas.");
  if (/^[\d.]+$/.test(host) || host.includes(":")) {
    if (isPrivateIp(host)) throw new Error("No se pueden importar direcciones internas.");
  }
  let addrs: { address: string }[];
  try {
    addrs = await lookup(host);
  } catch {
    throw new Error("No se encuentra esa web (el dominio no responde).");
  }
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) throw new Error("No se pueden importar direcciones internas.");
  return u;
}

export interface FetchDeps {
  lookup?: Lookup;
  fetchImpl?: typeof fetch;
}

const MAX_BYTES = 1_500_000;

export async function fetchPublicPage(raw: string, deps: FetchDeps = {}): Promise<{ url: string; html: string }> {
  const doFetch = deps.fetchImpl ?? fetch;
  let url = (await assertPublicUrl(raw, deps.lookup)).toString();
  for (let hop = 0; hop < 4; hop++) {
    const res = await doFetch(url, { redirect: "manual", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "LOCALIS-AI-importador/1.0 (borrador de ficha; revisión humana)", Accept: "text/html" } });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error("La web redirige a un sitio no válido.");
      url = (await assertPublicUrl(new URL(loc, url).toString(), deps.lookup)).toString();
      continue;
    }
    if (!res.ok) throw new Error(`La web respondió con error ${res.status}.`);
    if (!/text\/html|application\/xhtml/i.test(res.headers.get("content-type") ?? "")) throw new Error("La dirección no es una página web (HTML).");
    const reader = res.body?.getReader();
    if (!reader) throw new Error("La web no devolvió contenido.");
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_BYTES) {
        await reader.cancel();
        break; // basta con el principio de la página
      }
      chunks.push(value);
    }
    return { url, html: new TextDecoder("utf-8").decode(Buffer.concat(chunks)) };
  }
  throw new Error("Demasiadas redirecciones.");
}

// ── Extracción del borrador ───────────────────────────────────────
export interface Draft {
  name: string;
  description: string;
  headline: string;
  phones: string[];
  emails: string[];
  whatsapp: string;
  instagram: string;
  facebook: string;
  address: string;
  /** líneas «Nombre | precio» encontradas en la página (hay que revisarlas) */
  priceLines: string[];
  host: string;
}

const decode = (s: string): string =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&euro;/g, "€")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
const text = (html: string): string => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const meta = (html: string, key: string): string => {
  const m = new RegExp(`<meta[^>]+(?:name|property)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i").exec(html) ?? new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${key}["']`, "i").exec(html);
  return m ? decode(m[1]).trim() : "";
};

export function extractDraft(html: string, pageUrl: string): Draft {
  const clean = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>|<!--[\s\S]*?-->/gi, " ");
  const title = text((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(clean) ?? [])[1] ?? "");
  const siteName = meta(html, "og:site_name");
  const h1 = text((/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(clean) ?? [])[1] ?? "");
  const description = meta(html, "description") || meta(html, "og:description");
  const body = clean;

  const phones = Array.from(new Set((body.match(/(?:\+34|0034)?[\s.-]?\b[6-9]\d{2}[\s.-]?\d{2,3}[\s.-]?\d{2,3}[\s.-]?\d{0,3}\b/g) ?? []).map((p) => p.replace(/[^\d+]/g, "")).filter((p) => /^(\+?34|0034)?[6-9]\d{8}$/.test(p)))).slice(0, 4);
  const emails = Array.from(new Set((body.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? []).map((e) => e.toLowerCase()).filter((e) => !/\.(png|jpe?g|webp|gif|svg)$/.test(e)))).slice(0, 3);
  const wa = /wa\.me\/(\+?\d{9,15})|api\.whatsapp\.com\/send\?phone=(\+?\d{9,15})/i.exec(html);
  const ig = /https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9._-]+/i.exec(html);
  const fb = /https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9._/-]+/i.exec(html);
  const street = /"streetAddress"\s*:\s*"([^"]+)"/i.exec(html);
  const locality = /"addressLocality"\s*:\s*"([^"]+)"/i.exec(html);

  // Líneas con precio: el texto de cada elemento de lista / párrafo corto que contiene «€».
  const priceLines: string[] = [];
  for (const m of body.matchAll(/<(?:li|p|td|h3|h4|span)[^>]*>([\s\S]{3,160}?)<\/(?:li|p|td|h3|h4|span)>/gi)) {
    const t = text(m[1]);
    const pm = /(.{3,70}?)[\s:–—-]*((?:desde\s+)?\d{1,4}(?:[.,]\d{1,2})?\s?€|€\s?\d{1,4}(?:[.,]\d{1,2})?)/i.exec(t);
    if (pm && !priceLines.some((x) => x.startsWith(pm[1].trim()))) priceLines.push(`${pm[1].trim().replace(/[|]/g, " ")} | ${pm[2].trim()}`);
    if (priceLines.length >= 15) break;
  }

  let host = "";
  try {
    host = new URL(pageUrl).hostname.replace(/^www\./, "");
  } catch {}
  return {
    name: siteName || (title.split(/[|\-–—·]/)[0] ?? "").trim() || h1,
    description: description.slice(0, 500),
    headline: h1.slice(0, 140),
    phones,
    emails,
    whatsapp: wa ? (wa[1] ?? wa[2] ?? "").replace(/\D/g, "") : "",
    instagram: ig?.[0] ?? "",
    facebook: fb?.[0] ?? "",
    address: [street?.[1], locality?.[1]].filter(Boolean).join(", "),
    priceLines,
    host,
  };
}
