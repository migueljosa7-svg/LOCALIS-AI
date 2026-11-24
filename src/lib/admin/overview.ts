// Resumen del panel: números y avisos «de un vistazo». Funciones puras (sin red ni BD): se prueban con datos de ejemplo.

export interface LeadLite {
  id: string;
  created_at: string;
  status: string;
  source: string | null;
  email_notified: boolean;
  business_name: string;
}
export interface BusinessLite {
  id: string;
  name: string;
  active: boolean;
  dailyBudgetUsd: number;
  monthlyBudgetUsd: number;
  domains: string[];
  notes?: string;
}
export interface UsageLite {
  business_id: string;
  day: string;
  messages: number;
  cost_micro: number | string;
  errors: number;
  contacts: number;
}
export interface DesignLite {
  id: string;
  created_at: string;
  stage: string;
  name: string;
}

export interface Problem {
  level: "alta" | "media";
  text: string;
  href: string;
}

export interface Overview {
  leads: { total: number; byStatus: Record<string, number>; last7: number; clients: number };
  projects: { pending: DesignLite[]; byStage: Record<string, number> };
  stella: { total: number; active: number; drafts: number; rows: { id: string; name: string; active: boolean; messages: number; contacts: number; errors: number; costUsd: number; monthlyBudgetUsd: number; pct: number }[]; costMonthUsd: number };
  problems: Problem[];
}

export const OPEN_STAGES = ["recibida", "en_revision", "presupuesto_enviado", "aceptada", "en_construccion"];
const DAY = 86_400_000;

export function buildOverview(input: { now: number; leads: LeadLite[]; businesses: BusinessLite[]; usage: UsageLite[]; designs: DesignLite[]; env?: { ok: boolean; label: string }[] }): Overview {
  const { now } = input;
  const byStatus: Record<string, number> = {};
  for (const l of input.leads) byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;

  const stageCount: Record<string, number> = {};
  for (const d of input.designs) stageCount[d.stage] = (stageCount[d.stage] ?? 0) + 1;
  const pending = input.designs.filter((d) => OPEN_STAGES.includes(d.stage));

  const rows = input.businesses.map((b) => {
    const u = input.usage.filter((x) => x.business_id === b.id);
    const costUsd = u.reduce((a, x) => a + Number(x.cost_micro), 0) / 1_000_000;
    return {
      id: b.id,
      name: b.name,
      active: b.active,
      messages: u.reduce((a, x) => a + x.messages, 0),
      contacts: u.reduce((a, x) => a + x.contacts, 0),
      errors: u.reduce((a, x) => a + x.errors, 0),
      costUsd,
      monthlyBudgetUsd: b.monthlyBudgetUsd,
      pct: b.monthlyBudgetUsd > 0 ? Math.round((costUsd / b.monthlyBudgetUsd) * 100) : costUsd > 0 ? 100 : 0,
    };
  });

  const problems: Problem[] = [];
  const staleLeads = input.leads.filter((l) => l.status === "nuevo" && now - Date.parse(l.created_at) > 2 * DAY);
  if (staleLeads.length) problems.push({ level: "alta", text: `${staleLeads.length} lead(s) nuevo(s) sin contactar desde hace más de 2 días`, href: "/admin/leads?estado=nuevo" });
  const unmailed = input.leads.filter((l) => !l.email_notified && now - Date.parse(l.created_at) < 14 * DAY);
  if (unmailed.length) problems.push({ level: "media", text: `${unmailed.length} lead(s) de los últimos 14 días sin aviso por email (revisa Resend)`, href: "/admin/leads" });
  const staleDesigns = input.designs.filter((d) => d.stage === "recibida" && now - Date.parse(d.created_at) > 3 * DAY);
  if (staleDesigns.length) problems.push({ level: "alta", text: `${staleDesigns.length} diseño(s) recibido(s) sin revisar desde hace más de 3 días`, href: "/admin/diseno" });
  for (const r of rows) {
    if (r.active && r.pct >= 80) problems.push({ level: "alta", text: `${r.name}: ha gastado el ${r.pct} % de su tope mensual de IA`, href: `/admin/stella/${r.id}` });
    if (r.active && r.errors > 0) problems.push({ level: "media", text: `${r.name}: ${r.errors} error(es) del modelo este mes`, href: `/admin/stella/${r.id}` });
  }
  for (const b of input.businesses) {
    if (!b.active && /\[cliente\]/.test(b.notes ?? "")) problems.push({ level: "media", text: `${b.name}: el cliente completó su ficha, falta revisarla y activarla`, href: `/admin/stella/${b.id}` });
  }
  for (const e of input.env ?? []) if (!e.ok) problems.push({ level: "alta", text: `Configuración: ${e.label}`, href: "/admin/entorno" });

  return {
    leads: { total: input.leads.length, byStatus, last7: input.leads.filter((l) => now - Date.parse(l.created_at) < 7 * DAY).length, clients: byStatus["ganado"] ?? 0 },
    projects: { pending, byStage: stageCount },
    stella: { total: input.businesses.length, active: input.businesses.filter((b) => b.active).length, drafts: input.businesses.filter((b) => !b.active).length, rows, costMonthUsd: rows.reduce((a, r) => a + r.costUsd, 0) },
    problems,
  };
}

// ── Estado de las variables de entorno (SOLO si existen: nunca sus valores) ──
export interface EnvCheck {
  group: string;
  label: string;
  name: string;
  ok: boolean;
  required: boolean;
  how: string;
}

export function envChecks(env: Record<string, string | undefined> = process.env): EnvCheck[] {
  const has = (n: string) => Boolean(env[n]?.trim());
  const adminPass = (env.ADMIN_PASSWORD ?? "").length >= 16;
  const c = (group: string, label: string, name: string, ok: boolean, required: boolean, how: string): EnvCheck => ({ group, label, name, ok, required, how });
  return [
    c("Panel", "Usuario del panel", "ADMIN_USER", has("ADMIN_USER"), true, "Sin él el panel responde 404."),
    c("Panel", "Contraseña del panel (16+ caracteres)", "ADMIN_PASSWORD", adminPass, true, "Con menos de 16 caracteres el panel responde 404."),
    c("Base de datos", "Dirección de Supabase", "SUPABASE_URL", has("SUPABASE_URL"), true, "Project URL, sin /rest/v1/."),
    c("Base de datos", "Clave secreta de Supabase", "SUPABASE_SERVICE_ROLE_KEY", has("SUPABASE_SERVICE_ROLE_KEY"), true, "Secret key (sb_secret_…) o service_role. Nunca la pública."),
    c("Correo", "Clave de Resend", "RESEND_API_KEY", has("RESEND_API_KEY"), true, "Sin ella no llegan los avisos por email (los leads sí se guardan)."),
    c("Correo", "Destinatario de avisos", "LEAD_INBOX_EMAIL", has("LEAD_INBOX_EMAIL"), false, "Por defecto usa el email del proyecto."),
    c("Stella", "Clave de Anthropic", "ANTHROPIC_API_KEY", has("ANTHROPIC_API_KEY"), false, "Sin ella Stella queda apagada (la web funciona igual)."),
    c("Stella", "Modelo (opcional)", "STELLA_MODEL", !has("STELLA_MODEL") || /^claude-(haiku|sonnet|opus)-5-5$/.test(env.STELLA_MODEL ?? ""), false, "Si la defines debe ser claude-haiku-5-5 o claude-sonnet-5-5."),
    c("Stella", "Stella visible en la web de LOCALIS", "STELLA_SITE_WIDGET", env.STELLA_SITE_WIDGET?.trim().toLowerCase() === "on", false, "Pon on para mostrar el chat en tu propia web."),
    c("Mapas", "Clave de mapas de pago", "(ninguna)", true, false, "No se usa ninguna API de mapas de pago: los mapas y rutas son enlaces gratuitos."),
  ];
}
