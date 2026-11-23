// ════════════════════════════════════════════════════════════════
//  Diagnóstico de la conexión con Supabase (contra la base REAL).
//
//  Uso:
//    node scripts/diagnose-supabase.mjs                      (solo lectura)
//    node scripts/diagnose-supabase.mjs --write              (además guarda y relee un lead TEST)
//    node scripts/diagnose-supabase.mjs --env-file .env.production.local --write
//
//  Lee SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY del entorno o del archivo indicado
//  (por defecto .env.local; nunca se suben a GitHub). Hace exactamente las mismas
//  peticiones que la web en producción. NUNCA imprime la clave: solo su tipo,
//  el proyecto al que pertenece y si tiene caracteres sobrantes.
// ════════════════════════════════════════════════════════════════
import { readFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const envFile = args.includes("--env-file") ? args[args.indexOf("--env-file") + 1] : ".env.local";

// Lee el archivo SIN limpiar espacios ni comillas, para detectar valores mal pegados.
const fromFile = {};
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=(.*)$/);
    if (m) fromFile[m[1]] = m[2].replace(/\r$/, "");
  }
}
const rawUrl = process.env.SUPABASE_URL ?? fromFile.SUPABASE_URL;
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? fromFile.SUPABASE_SERVICE_ROLE_KEY;

const out = [];
const ok = (m) => out.push("  ✔ " + m);
const bad = (m) => out.push("  ✖ " + m);
const info = (m) => out.push("  · " + m);
const problems = [];

console.log(`Origen de las variables: ${process.env.SUPABASE_URL ? "entorno" : existsSync(envFile) ? envFile : "ninguno"}\n`);
if (!rawUrl || !rawKey) {
  console.log("✖ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

// Vercel envía el valor tal cual: un espacio, comilla o salto de línea rompe la petición.
function hygiene(name, v) {
  const unquoted = v.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  if (v !== v.trim()) problems.push(`${name} tiene espacios o saltos de línea al principio/final.`);
  if (/^["']|["']$/.test(v.trim())) info(`${name} está entre comillas en el archivo (en .env es normal; en Vercel NO deben ponerse).`);
  if (/\s/.test(unquoted)) problems.push(`${name} contiene espacios o saltos de línea en medio.`);
  return unquoted.trim();
}

// ── 1. URL
console.log("1) SUPABASE_URL");
const given = hygiene("SUPABASE_URL", rawUrl).replace(/\/+$/, "");
if (/\/rest\/v1$/i.test(given)) {
  info("SUPABASE_URL termina en /rest/v1: el código actual de producción añade otro /rest/v1 → 404 PGRST125.");
  info("La rama de desarrollo ya lo corrige; aquí se prueba con la URL corregida.");
}
const url = given.replace(/\/rest\/v1$/i, "");
const urlRef = url.match(/^https:\/\/([a-z0-9]{20})\.supabase\.co$/)?.[1];
if (urlRef) ok(`formato correcto · proyecto ${urlRef}`);
else {
  bad(`formato inesperado: «${url.replace(/\/\/([^.]{4})[^.]*/, "//$1…")}»`);
  if (/dashboard|supabase\.com\//.test(url)) problems.push("SUPABASE_URL es la dirección del panel de Supabase, no la Project URL (https://<proyecto>.supabase.co).");
  else problems.push("SUPABASE_URL debe ser exactamente https://<proyecto>.supabase.co");
}
console.log(out.splice(0).join("\n"));

// ── 2. Clave
console.log("\n2) SUPABASE_SERVICE_ROLE_KEY (no se muestra)");
const key = hygiene("SUPABASE_SERVICE_ROLE_KEY", rawKey);
let keyRef = null;
if (key.startsWith("sb_secret_")) ok("clave nueva «Secret key» (sb_secret_…)");
else if (key.startsWith("sb_publishable_")) { bad("es la clave PUBLISHABLE (pública), no la secreta"); problems.push("La clave es la publishable: usa la Secret key o la service_role."); }
else if (key.startsWith("eyJ")) {
  try {
    const p = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
    keyRef = p.ref ?? null;
    const exp = p.exp ? new Date(p.exp * 1000).toISOString().slice(0, 10) : "sin fecha";
    if (p.role === "service_role") ok(`clave antigua JWT · rol service_role · proyecto ${keyRef} · caduca ${exp}`);
    else {
      bad(`clave antigua JWT con rol «${p.role}» · proyecto ${keyRef}`);
      problems.push(`La clave es la «${p.role}» (pública), no la service_role. Ambas empiezan por eyJ.`);
    }
    if (key.split(".").length !== 3) problems.push("La clave JWT está incompleta (debe tener 3 partes separadas por puntos).");
  } catch {
    bad("empieza por eyJ pero no se puede leer: probablemente está cortada o mal copiada");
    problems.push("La clave JWT está incompleta o mal copiada.");
  }
} else { bad("formato de clave no reconocido"); problems.push("La clave no tiene formato de Supabase."); }
if (urlRef && keyRef && urlRef !== keyRef) {
  bad(`la clave es del proyecto ${keyRef} pero la URL es del proyecto ${urlRef}`);
  problems.push("La clave y la URL pertenecen a proyectos distintos de Supabase.");
} else if (urlRef && keyRef) ok("clave y URL son del mismo proyecto");
console.log(out.splice(0).join("\n"));

// ── 3. Peticiones reales (idénticas a las de producción)
const headers = {
  apikey: key,
  ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
  "Content-Type": "application/json",
};
async function call(method, path, body, prefer) {
  try {
    const r = await fetch(`${url}/rest/v1/${path}`, {
      method,
      headers: { ...headers, ...(prefer ? { Prefer: prefer } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000),
    });
    const text = await r.text();
    let j = null;
    try { j = JSON.parse(text); } catch {}
    return { status: r.status, ok: r.ok, j, text: text.slice(0, 200) };
  } catch (e) {
    return { status: 0, ok: false, j: null, text: e.cause?.code || e.message };
  }
}
function explain(r, table) {
  const code = r.j?.code, msg = r.j?.message || r.j?.msg || r.text;
  bad(`${table}: HTTP ${r.status}${code ? " · " + code : ""} · ${msg}`);
  if (r.status === 0) problems.push(`No se puede conectar con ${url} (${msg}). Revisa SUPABASE_URL o si el proyecto está pausado.`);
  else if (/legacy api keys are disabled/i.test(msg)) problems.push("Las claves antiguas (eyJ…) están DESACTIVADAS en este proyecto. Usa la Secret key (sb_secret_…) o reactívalas en Settings → API Keys.");
  else if (/invalid api key|no api key/i.test(msg)) problems.push("Supabase no reconoce la clave para este proyecto (clave de otro proyecto, regenerada o mal copiada).");
  else if (code === "42501") problems.push(`Sin permiso sobre ${table} con este rol: o la clave no es service_role, o falta ejecutar supabase/fix-permisos.sql en ESTE proyecto.`);
  else if (code === "PGRST205" || r.status === 404) problems.push(`La tabla ${table} no existe en el proyecto de la URL: el esquema se creó en otro proyecto o no se ejecutó supabase/schema.sql.`);
  else if (code === "PGRST301" || code === "PGRST302") problems.push("Supabase rechaza el JWT de la clave (mal copiada o de otro proyecto).");
  else if (code === "PGRST106") problems.push("El esquema public no está expuesto en la Data API (Settings → Data API → Exposed schemas).");
  else if (r.status === 503 || r.status === 540) problems.push("El proyecto de Supabase está pausado o no disponible: reactívalo desde el panel.");
}

console.log("\n3) Lectura (lo que hace /admin)");
for (const t of ["leads", "opportunities"]) {
  const r = await call("GET", `${t}?select=id&limit=1`);
  if (r.ok) ok(`${t}: lectura correcta (HTTP ${r.status}, ${Array.isArray(r.j) ? r.j.length : 0} fila(s) en la muestra)`);
  else explain(r, t);
}
console.log(out.splice(0).join("\n"));

if (WRITE) {
  console.log("\n4) Escritura (lo que hace el formulario) · lead marcado TEST");
  const tag = "TEST-DIAG-" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
  const ins = await call("POST", "leads", {
    business_name: `TEST LOCALIS ${tag} (borrar)`,
    contact_name: "TEST Diagnostico",
    email: "test-localis@example.com",
    phone: "600000005",
    service: "Hostelería",
    source: "TEST-diagnostico-supabase",
    details: `TEST: diagnóstico de conexión ${tag}. Se puede borrar.`,
  }, "return=representation");
  if (!ins.ok) explain(ins, "leads (insertar)");
  else {
    const id = ins.j?.[0]?.id;
    ok(`lead TEST guardado · id ${id} · nombre «TEST LOCALIS ${tag} (borrar)»`);
    const back = await call("GET", `leads?select=id,business_name,status&id=eq.${id}`);
    if (back.ok && back.j?.length === 1) ok("releído desde Supabase: existe de verdad en la tabla");
    else explain(back, "leads (releer)");
  }
  console.log(out.splice(0).join("\n"));
}

console.log("\n══ Resultado");
if (problems.length === 0) console.log("✔ Con estas variables la conexión funciona." + (WRITE ? "" : " (Añade --write para probar también el guardado.)"));
else for (const p of [...new Set(problems)]) console.log("✖ " + p);
process.exit(problems.length ? 1 : 0);
