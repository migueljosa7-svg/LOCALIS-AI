import "server-only";

// ════════════════════════════════════════════════════════════════
//  Acceso a la base de datos (Supabase, API REST/PostgREST) — SOLO SERVIDOR.
//
//  Variables de entorno (Vercel → Settings → Environment Variables):
//    SUPABASE_URL               https://<proyecto>.supabase.co
//    SUPABASE_SERVICE_ROLE_KEY  clave secreta: "Secret key" (sb_secret_…) o la antigua
//                               "service_role" (eyJ…). Nunca NEXT_PUBLIC_.
//
//  Las tablas tienen RLS activado y ninguna política pública: solo este
//  servidor (con la clave service_role) puede leer o escribir.
//  Sin variables configuradas, todas las funciones devuelven
//  { ok:false, reason:"not-configured" } y la web sigue funcionando.
// ════════════════════════════════════════════════════════════════

export const LEAD_STATUSES = ["nuevo", "contactado", "propuesta", "ganado", "perdido"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const OPP_STATUSES = ["investigada", "auditoria_lista", "propuesta_lista", "contactada", "descartada", "cliente"] as const;
export type OppStatus = (typeof OPP_STATUSES)[number];

export interface LeadRow {
  id: string;
  created_at: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  service: string;
  source: string | null;
  details: string | null;
  prompt: string | null;
  status: LeadStatus;
  notes: string | null;
  email_notified: boolean;
}

export interface OpportunityRow {
  id: string;
  created_at: string;
  researched_at: string;
  company: string;
  locality: string;
  sector: string;
  website: string | null;
  source_url: string;
  problem: string;
  evidence: string;
  evidence_type: "hecho" | "hipotesis";
  recommended_service: string;
  score: number;
  priority: "alta" | "media" | "baja";
  status: OppStatus;
  next_step: string | null;
  notes: string | null;
}

type Result<T> = { ok: true; data: T } | { ok: false; reason: "not-configured" | "error"; message?: string };

/**
 * Cabeceras de autenticación de Supabase.
 * - Clave antigua "service_role" (JWT, empieza por "eyJ"): apikey + Authorization: Bearer.
 * - Clave nueva "secret" (sb_secret_…): SOLO apikey. No es un JWT y Supabase la rechaza
 *   ("Invalid JWT") si se envía en Authorization.
 */
export function authHeaders(key: string): Record<string, string> {
  return key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
}

function config() {
  // Acepta la "Project URL" (https://<proyecto>.supabase.co) y también la "API URL"
  // que muestra Supabase (…/rest/v1/). Sin quitarla, la ruta quedaría duplicada
  // (/rest/v1/rest/v1/leads) y Supabase responde 404 PGRST125.
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

export function dbConfigured(): boolean {
  return config() !== null;
}

async function rest<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<Result<T>> {
  const cfg = config();
  if (!cfg) return { ok: false, reason: "not-configured" };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
      ...init,
      cache: "no-store",
      signal: ctrl.signal,
      headers: {
        ...authHeaders(cfg.key),
        "Content-Type": "application/json",
        ...(init.prefer ? { Prefer: init.prefer } : {}),
      },
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.error(`[db] ${init.method ?? "GET"} ${path.split("?")[0]} → ${res.status} ${detail}`);
      // Código y mensaje de PostgREST (p. ej. 42501 permission denied). No contienen claves.
      let info = "";
      try {
        const j = JSON.parse(detail) as { code?: string; message?: string };
        info = [j.code, j.message].filter(Boolean).join(" ").slice(0, 160);
      } catch {}
      return { ok: false, reason: "error", message: `HTTP ${res.status}${info ? " · " + info : ""}` };
    }
    const text = await res.text();
    return { ok: true, data: (text ? JSON.parse(text) : null) as T };
  } catch (err) {
    console.error(`[db] ${path.split("?")[0]} falló:`, err instanceof Error ? err.message : err);
    return { ok: false, reason: "error", message: err instanceof Error && err.name === "AbortError" ? "tiempo agotado" : "sin conexión (revisa SUPABASE_URL)" };
  } finally {
    clearTimeout(timer);
  }
}

// ── Leads ─────────────────────────────────────────────────────────
export interface NewLead {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  service: string;
  source: string | null;
  details: string | null;
  prompt: string | null;
}

export async function insertLead(l: NewLead): Promise<Result<LeadRow>> {
  const r = await rest<LeadRow[]>("leads", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({
      business_name: l.businessName,
      contact_name: l.contactName,
      email: l.email,
      phone: l.phone,
      service: l.service,
      source: l.source,
      details: l.details,
      prompt: l.prompt,
    }),
  });
  if (!r.ok) return r;
  const row = r.data?.[0];
  return row ? { ok: true, data: row } : { ok: false, reason: "error", message: "empty" };
}

export async function markLeadNotified(id: string): Promise<void> {
  await rest(`leads?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ email_notified: true }) });
}

export async function listLeads(status?: LeadStatus): Promise<Result<LeadRow[]>> {
  const filter = status ? `&status=eq.${status}` : "";
  return rest<LeadRow[]>(`leads?select=*&order=created_at.desc&limit=500${filter}`);
}

export async function updateLead(id: string, patch: { status?: LeadStatus; notes?: string }): Promise<Result<LeadRow[]>> {
  return rest<LeadRow[]>(`leads?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
}

// ── Oportunidades (Lead Engine) ──────────────────────────────────
export async function listOpportunities(): Promise<Result<OpportunityRow[]>> {
  return rest<OpportunityRow[]>("opportunities?select=*&order=score.desc,researched_at.desc&limit=500");
}

export async function updateOpportunity(id: string, patch: { status?: OppStatus; notes?: string; next_step?: string }): Promise<Result<OpportunityRow[]>> {
  return rest<OpportunityRow[]>(`opportunities?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
}
