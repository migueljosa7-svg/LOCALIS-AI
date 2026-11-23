// Consulta mínima (compatible con el runtime Edge del middleware) de los dominios autorizados de un negocio.
// No importa nada de servidor: solo fetch. Si algo falla devuelve [] → el CSP queda en «solo nuestra web».
import { frameAncestors } from "./domains";

const TTL_MS = 30_000;
const cache = new Map<string, { at: number; hosts: string[] }>();

export async function allowedHostsFor(id: string): Promise<string[]> {
  if (!/^[a-z0-9-]{2,40}$/.test(id)) return [];
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.hosts;
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/stella_businesses?select=domains,active&id=eq.${encodeURIComponent(id)}&limit=1`, {
      headers: key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key },
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as { domains?: string[]; active?: boolean }[];
    const hosts = rows[0]?.active && Array.isArray(rows[0].domains) ? rows[0].domains : [];
    cache.set(id, { at: Date.now(), hosts });
    return hosts;
  } catch {
    return [];
  }
}

export async function embedCsp(id: string | null): Promise<string> {
  return frameAncestors(id ? await allowedHostsFor(id) : []);
}
