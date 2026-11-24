import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildOverview, envChecks } from "../src/lib/admin/overview";

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(f)) out.push(p);
  }
  return out;
}
const SRC = walk(fileURLToPath(new URL("../src", import.meta.url)));

test("seguridad: ningún componente de navegador («use client») lee variables privadas", () => {
  const offenders: string[] = [];
  for (const f of SRC) {
    const t = readFileSync(f, "utf8");
    if (!/^\s*["']use client["']/.test(t)) continue;
    for (const m of t.matchAll(/process\.env\.([A-Z0-9_]+)/g)) if (!/^(NEXT_PUBLIC_[A-Z0-9_]+|NODE_ENV)$/.test(m[1])) offenders.push(`${f}: ${m[1]}`);
  }
  assert.deepEqual(offenders, []);
});

test("seguridad: ninguna variable con nombre de secreto lleva el prefijo NEXT_PUBLIC_ (iría al navegador)", () => {
  const bad: string[] = [];
  for (const f of SRC) for (const m of readFileSync(f, "utf8").matchAll(/NEXT_PUBLIC_[A-Z0-9_]*(SECRET|PASSWORD|SERVICE_ROLE|ANTHROPIC|RESEND|TOKEN_SECRET|PRIVATE)[A-Z0-9_]*/g)) bad.push(`${f}: ${m[0]}`);
  assert.deepEqual(bad, []);
});

test("seguridad: los registros del servidor no imprimen valores de claves", () => {
  const bad: string[] = [];
  for (const f of SRC) {
    const t = readFileSync(f, "utf8");
    for (const m of t.matchAll(/console\.(log|error|warn|info)\([^)]*process\.env\.(ANTHROPIC_API_KEY|SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY|ADMIN_PASSWORD|STELLA_SIGNING_SECRET)/g)) bad.push(`${f}: ${m[0].slice(0, 60)}`);
  }
  assert.deepEqual(bad, []);
});

test("seguridad: el middleware protege todo el panel y su API, y las rutas públicas de alta no dan acceso al panel", () => {
  const mw = readFileSync(fileURLToPath(new URL("../src/middleware.ts", import.meta.url)), "utf8");
  assert.match(mw, /matcher: \[[^\]]*"\/admin\/:path\*"[^\]]*"\/api\/admin\/:path\*"/);
  assert.ok(!/\/alta/.test(mw), "el enlace de alta es público a propósito: se protege con su propio token");
  for (const f of SRC.filter((x) => /app[\\/]admin[\\/].*route\.ts$/.test(x))) assert.fail(`las rutas administrativas deben vivir bajo /api/admin: ${f}`);
});

// ── Resumen del panel ─────────────────────────────────────────────
const now = Date.parse("2026-11-24T12:00:00Z");
const ago = (d: number) => new Date(now - d * 86_400_000).toISOString();

test("resumen: cuenta leads, clientes, proyectos y Stella, y señala lo que requiere atención", () => {
  const o = buildOverview({
    now,
    leads: [
      { id: "1", created_at: ago(5), status: "nuevo", source: "auditoria", email_notified: true, business_name: "A" },
      { id: "2", created_at: ago(1), status: "nuevo", source: "stella:x", email_notified: false, business_name: "B" },
      { id: "3", created_at: ago(30), status: "ganado", source: "disena-tu-web", email_notified: true, business_name: "C" },
    ],
    businesses: [
      { id: "a", name: "Peluquería A", active: true, dailyBudgetUsd: 1, monthlyBudgetUsd: 5, domains: ["a.es"] },
      { id: "b", name: "Taller B", active: false, dailyBudgetUsd: 1, monthlyBudgetUsd: 5, domains: [], notes: "[cliente] completó su ficha" },
    ],
    usage: [{ business_id: "a", day: "2026-11-20", messages: 40, cost_micro: 4_500_000, errors: 2, contacts: 3 }],
    designs: [
      { id: "d1", created_at: ago(4), stage: "recibida", name: "Casa Luis" },
      { id: "d2", created_at: ago(1), stage: "entregada", name: "Hecho" },
      { id: "d3", created_at: ago(1), stage: "en_construccion", name: "En marcha" },
    ],
    env: [{ ok: false, label: "falta RESEND_API_KEY" }],
  });
  assert.equal(o.leads.total, 3);
  assert.equal(o.leads.clients, 1);
  assert.equal(o.leads.byStatus.nuevo, 2);
  assert.equal(o.leads.last7, 2);
  assert.deepEqual(o.projects.pending.map((d) => d.id).sort(), ["d1", "d3"], "entregada no es pendiente");
  assert.deepEqual([o.stella.total, o.stella.active, o.stella.drafts], [2, 1, 1]);
  const a = o.stella.rows.find((r) => r.id === "a")!;
  assert.deepEqual([a.messages, a.contacts, a.pct], [40, 3, 90]);
  assert.equal(a.costUsd, 4.5);
  const texts = o.problems.map((p) => p.text).join(" | ");
  assert.match(texts, /lead\(s\) nuevo\(s\) sin contactar/);
  assert.match(texts, /sin aviso por email/);
  assert.match(texts, /diseño\(s\) recibido\(s\) sin revisar/);
  assert.match(texts, /Peluquería A: ha gastado el 90 %/);
  assert.match(texts, /Peluquería A: 2 error\(es\)/);
  assert.match(texts, /Taller B: el cliente completó su ficha/);
  assert.match(texts, /Configuración: falta RESEND_API_KEY/);
  const empty = buildOverview({ now, leads: [], businesses: [], usage: [], designs: [] });
  assert.deepEqual([empty.leads.total, empty.problems.length], [0, 0]);
});

test("entorno: comprueba si las variables existen sin devolver nunca sus valores", () => {
  const env = { ADMIN_USER: "u", ADMIN_PASSWORD: "corta", SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "SECRETO-SUPABASE", ANTHROPIC_API_KEY: "SECRETO-ANTHROPIC", STELLA_MODEL: "gpt-4" };
  const c = envChecks(env);
  const by = (n: string) => c.find((x) => x.name === n)!;
  assert.equal(by("ADMIN_PASSWORD").ok, false, "menos de 16 caracteres");
  assert.equal(by("SUPABASE_URL").ok, true);
  assert.equal(by("RESEND_API_KEY").ok, false);
  assert.equal(by("STELLA_MODEL").ok, false, "un modelo inválido se detecta");
  assert.equal(envChecks({ STELLA_MODEL: "claude-haiku-5-5" }).find((x) => x.name === "STELLA_MODEL")!.ok, true);
  assert.ok(!JSON.stringify(c).includes("SECRETO"), "no se devuelven valores");
  assert.ok(by("(ninguna)").ok, "no se usa ninguna API de mapas de pago");
});
