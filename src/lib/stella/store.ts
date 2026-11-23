import "server-only";
// Acceso de Stella a Supabase: fichas de negocios, límites persistentes, consumo y contactos.
// Todo pasa por el servidor con la clave service_role; las tablas no tienen políticas públicas.
import { rest, type LeadRow, type NewLead } from "@/lib/db";
import { LOCALIS_BUSINESS, LOCALIS_ID } from "./builtin";
import { defaultGreeting, type StellaBusiness } from "./ficha";
import type { GateRequest, GateResult, StellaStore, UsageDelta } from "./types";

interface BusinessRow {
  id: string;
  name: string;
  sector: string;
  area: string;
  about: string;
  services: StellaBusiness["services"];
  faqs: StellaBusiness["faqs"];
  hours: string | null;
  whatsapp: string;
  phone: string | null;
  notify_email: string | null;
  greeting: string;
  not_available: string[];
  privacy_url: string;
  domains: string[];
  active: boolean;
  daily_budget_usd: number | string;
  monthly_budget_usd: number | string;
  notes: string | null;
}

export function rowToBusiness(r: BusinessRow): StellaBusiness {
  return {
    id: r.id,
    name: r.name,
    sector: r.sector,
    area: r.area,
    about: r.about,
    services: Array.isArray(r.services) ? r.services : [],
    faqs: Array.isArray(r.faqs) ? r.faqs : [],
    hours: r.hours ?? undefined,
    whatsapp: r.whatsapp,
    phone: r.phone ?? undefined,
    notifyEmail: r.notify_email ?? undefined,
    greeting: r.greeting || defaultGreeting(r.name),
    notAvailable: r.not_available ?? [],
    privacyUrl: r.privacy_url,
    domains: r.domains ?? [],
    active: r.active,
    dailyBudgetUsd: Number(r.daily_budget_usd),
    monthlyBudgetUsd: Number(r.monthly_budget_usd),
    notes: r.notes ?? undefined,
  };
}

export function businessToRow(b: Omit<StellaBusiness, "active" | "builtin">, sourceLeadId?: string | null) {
  return {
    id: b.id,
    name: b.name,
    sector: b.sector,
    area: b.area,
    about: b.about,
    services: b.services,
    faqs: b.faqs,
    hours: b.hours ?? null,
    whatsapp: b.whatsapp,
    phone: b.phone ?? null,
    notify_email: b.notifyEmail ?? null,
    greeting: b.greeting,
    not_available: b.notAvailable,
    privacy_url: b.privacyUrl,
    domains: b.domains,
    daily_budget_usd: b.dailyBudgetUsd,
    monthly_budget_usd: b.monthlyBudgetUsd,
    notes: b.notes ?? null,
    ...(sourceLeadId ? { source_lead_id: sourceLeadId } : {}),
    updated_at: new Date().toISOString(),
  };
}

// Caché muy corta: una desactivación se aplica en segundos aunque haya varias instancias.
const CACHE_MS = 10_000;
const cache = new Map<string, { at: number; value: StellaBusiness | null }>();
export function invalidateBusiness(id: string): void {
  cache.delete(id);
}

export async function fetchBusiness(id: string): Promise<StellaBusiness | null> {
  if (id === LOCALIS_ID) return LOCALIS_BUSINESS;
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
  const r = await rest<BusinessRow[]>(`stella_businesses?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  if (!r.ok) return hit?.value ?? null; // si la BD falla, no se inventa nada
  const value = r.data[0] ? rowToBusiness(r.data[0]) : null;
  cache.set(id, { at: Date.now(), value });
  return value;
}

export async function listBusinesses(): Promise<{ ok: true; data: StellaBusiness[] } | { ok: false; message: string }> {
  const r = await rest<BusinessRow[]>("stella_businesses?select=*&order=created_at.desc&limit=500");
  return r.ok ? { ok: true, data: r.data.map(rowToBusiness) } : { ok: false, message: r.message ?? r.reason };
}

export async function saveBusiness(b: Omit<StellaBusiness, "active" | "builtin">, opts: { create: boolean; sourceLeadId?: string | null }) {
  const body = businessToRow(b, opts.sourceLeadId);
  invalidateBusiness(b.id);
  if (opts.create) {
    return rest<BusinessRow[]>("stella_businesses", { method: "POST", prefer: "return=representation", body: JSON.stringify(body) });
  }
  const { id, ...patch } = body;
  return rest<BusinessRow[]>(`stella_businesses?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", prefer: "return=representation", body: JSON.stringify(patch) });
}

export async function setBusinessActive(id: string, active: boolean) {
  invalidateBusiness(id);
  return rest<BusinessRow[]>(`stella_businesses?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    prefer: "return=representation",
    body: JSON.stringify({ active, updated_at: new Date().toISOString() }),
  });
}

export interface UsageRow {
  business_id: string;
  day: string;
  messages: number;
  input_tokens: number;
  output_tokens: number;
  cost_micro: number;
  errors: number;
  contacts: number;
}

/** Consumo desde el día 1 del mes en curso (todos los negocios o uno). */
export async function monthUsage(businessId?: string) {
  const first = new Date();
  first.setUTCDate(1);
  const from = first.toISOString().slice(0, 10);
  const filter = businessId ? `&business_id=eq.${encodeURIComponent(businessId)}` : "";
  return rest<UsageRow[]>(`stella_usage?select=*&day=gte.${from}${filter}&order=day.desc&limit=1000`);
}

export const dbStore: StellaStore = {
  getBusiness: fetchBusiness,

  async gate(req: GateRequest): Promise<GateResult> {
    const r = await rest<string>("rpc/stella_gate", {
      method: "POST",
      body: JSON.stringify({
        p_business: req.businessId,
        p_rates: req.rates,
        p_biz_day_micro: req.bizDayMicro,
        p_biz_month_micro: req.bizMonthMicro,
        p_global_day_micro: req.globalDayMicro,
        p_global_month_micro: req.globalMonthMicro,
      }),
    });
    if (!r.ok) return { ok: false, reason: "unavailable" };
    return r.data === "ok" ? { ok: true } : { ok: false, reason: String(r.data) };
  },

  async addUsage(d: UsageDelta): Promise<void> {
    await rest("rpc/stella_usage_add", {
      method: "POST",
      body: JSON.stringify({
        p_business: d.businessId,
        p_messages: d.messages,
        p_in: d.inputTokens,
        p_out: d.outputTokens,
        p_cost: d.costMicro,
        p_errors: d.errors,
        p_contacts: d.contacts,
      }),
    });
  },

  async insertContact(lead: NewLead): Promise<{ ok: boolean; id?: string }> {
    const r = await rest<LeadRow[]>("leads", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        business_name: lead.businessName,
        contact_name: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        service: lead.service,
        source: lead.source,
        details: lead.details,
        prompt: null,
      }),
    });
    return r.ok && r.data[0] ? { ok: true, id: r.data[0].id } : { ok: false };
  },
};
