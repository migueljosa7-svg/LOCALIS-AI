// ════════════════════════════════════════════════════════════════
//  Lead Engine v1 · Importador de oportunidades
//
//  Uso:
//    node scripts/import-opportunities.mjs lead-engine/mi-investigacion.csv          (simulación)
//    node scripts/import-opportunities.mjs lead-engine/mi-investigacion.csv --apply  (guarda en Supabase)
//
//  Lee SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY de las variables de entorno o de
//  .env.local (nunca se suben a GitHub). Valida cada fila, calcula la puntuación
//  y la prioridad, y hace "upsert" por empresa + localidad (no duplica).
//
//  Reglas: solo empresas reales con fuente pública (source_url). Cada problema
//  debe indicar evidence_type = "hecho" (comprobado) o "hipotesis".
// ════════════════════════════════════════════════════════════════
import { readFileSync, existsSync } from "node:fs";

const REQUIRED = ["company", "locality", "sector", "source_url", "problem", "evidence", "evidence_type", "recommended_service"];
const NO = new Set(["no", "false", "0"]);

/** Puntuación 0–100: cuánto puede ganar el negocio con una web de captación. */
export function score(row) {
  let s = 0;
  const lacks = (k) => NO.has(String(row[k] ?? "").trim().toLowerCase());
  if (!row.website) s += 40; // sin web: necesidad clara
  else {
    if (lacks("mobile_ok")) s += 25; // web que no se adapta al móvil
    if (lacks("https")) s += 10; // web sin candado
  }
  if (lacks("has_contact_cta")) s += 15; // sin formulario ni botón de WhatsApp
  const reviews = Number(row.google_reviews || 0);
  const rating = Number(String(row.google_rating || "0").replace(",", "."));
  if (reviews >= 20) s += 10; // negocio activo con demanda
  if (rating >= 4) s += 5; // buena reputación: más fácil de convertir
  if (row.evidence_type === "hecho") s += 5; // problema comprobado, no supuesto
  return Math.min(100, s);
}

export const priority = (s) => (s >= 60 ? "alta" : s >= 35 ? "media" : "baja");

function parseCsv(text) {
  const sep = text.split("\n")[0].includes(";") ? ";" : ",";
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  const [header, ...data] = rows;
  const keys = header.map((h) => h.trim().replace(/^﻿/, ""));
  return data.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

function loadEnv() {
  if (existsSync(".env.local")) {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

function validate(r, n) {
  const errs = [];
  for (const k of REQUIRED) if (!r[k]) errs.push(`falta "${k}"`);
  if (r.source_url && !/^https?:\/\//.test(r.source_url)) errs.push("source_url debe empezar por http(s)://");
  if (r.website && !/^https?:\/\//.test(r.website)) errs.push("website debe empezar por http(s):// (o dejarse vacío si no tiene)");
  if (r.evidence_type && !["hecho", "hipotesis"].includes(r.evidence_type)) errs.push('evidence_type debe ser "hecho" o "hipotesis"');
  if (r.researched_at && !/^\d{4}-\d{2}-\d{2}$/.test(r.researched_at)) errs.push("researched_at con formato AAAA-MM-DD");
  return errs.map((e) => `fila ${n}: ${e}`);
}

const [file, flag] = process.argv.slice(2);
if (!file) {
  console.error("Uso: node scripts/import-opportunities.mjs <archivo.csv> [--apply]");
  process.exit(1);
}
const rows = parseCsv(readFileSync(file, "utf8"));
const errors = rows.flatMap((r, i) => validate(r, i + 2));
if (errors.length) {
  console.error(`✖ ${errors.length} error(es); no se importa nada:\n  ` + errors.join("\n  "));
  process.exit(1);
}

const records = rows.map((r) => {
  const s = score(r);
  return {
    company: r.company,
    locality: r.locality,
    sector: r.sector,
    website: r.website || null,
    source_url: r.source_url,
    problem: r.problem,
    evidence: r.evidence,
    evidence_type: r.evidence_type,
    recommended_service: r.recommended_service,
    next_step: r.next_step || null,
    researched_at: r.researched_at || new Date().toISOString().slice(0, 10),
    score: s,
    priority: priority(s),
  };
});

console.log(`${records.length} oportunidad(es) válida(s):`);
for (const r of [...records].sort((a, b) => b.score - a.score)) {
  console.log(`  ${String(r.score).padStart(3)} ${r.priority.padEnd(5)} ${r.company} (${r.locality}) → ${r.recommended_service}`);
}

if (flag !== "--apply") {
  console.log("\nSimulación: no se ha guardado nada. Añade --apply para importar.");
  process.exit(0);
}

loadEnv();
const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✖ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (en el entorno o en .env.local).");
  process.exit(1);
}
const res = await fetch(`${url}/rest/v1/opportunities?on_conflict=company,locality`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify(records),
});
if (!res.ok) {
  console.error(`✖ Supabase respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}
console.log(`✔ ${records.length} oportunidad(es) guardada(s) o actualizada(s) en Supabase.`);
