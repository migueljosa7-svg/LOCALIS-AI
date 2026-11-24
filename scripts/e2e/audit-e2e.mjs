// Auditoría de rutas, autenticación, regresión del circuito de leads y comportamiento de Stella sin clave / con error de la IA.
// Contra la web compilada (`next build`) con un Supabase y un Anthropic SIMULADOS. node scripts/e2e/audit-e2e.mjs
//   E2E_PROD=1 → simula entorno de producción (VERCEL_ENV=production): /prueba-stella debe dar 404.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium, request as pwRequest } from "playwright-core";
import { PORTS, startAnthropic, startSupabase } from "./harness.mjs";

const root = process.cwd();
const outDir = process.env.E2E_OUT || path.join(root, ".next", "e2e-out");
fs.mkdirSync(outDir, { recursive: true });
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ADMIN = { username: "admin-e2e", password: "contrasena-e2e-de-16+-caracteres" };
const PROD = process.env.E2E_PROD === "1";
const results = [];
const check = (name, cond, detail = "") => {
  results.push({ name, ok: Boolean(cond), detail });
  console.log(`${cond ? "  ✔" : "  ✖"} ${name}${!cond && detail ? `  → ${detail}` : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UUID = "11111111-2222-3333-4444-555555555555";

const supa = await startSupabase(root);
const anth = await startAnthropic();
const baseEnv = { ...process.env, NODE_ENV: "production", SUPABASE_URL: `http://127.0.0.1:${PORTS.supabase}`, SUPABASE_SERVICE_ROLE_KEY: "eyJ-clave-falsa-e2e", ADMIN_USER: ADMIN.username, ADMIN_PASSWORD: ADMIN.password };
delete baseEnv.RESEND_API_KEY;
delete baseEnv.STELLA_SITE_WIDGET;
if (PROD) baseEnv.VERCEL_ENV = "production";
const servers = [];
async function start(port, extra) {
  const env = { ...baseEnv, PORT: String(port), ...extra };
  for (const k of Object.keys(extra)) if (extra[k] === undefined) delete env[k];
  const p = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], { env, stdio: "ignore" });
  servers.push(p);
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/robots.txt`)).ok) return `http://127.0.0.1:${port}`; } catch {}
    await sleep(500);
  }
  throw new Error(`no arrancó ${port}`);
}
// A: con clave (Anthropic simulado) · B: SIN clave · C: clave pero la API de Anthropic no responde
const A = await start(3100, { ANTHROPIC_API_KEY: "sk-ant-clave-falsa-e2e", ANTHROPIC_BASE_URL: `http://127.0.0.1:${PORTS.anthropic}` });
const B = await start(3101, { ANTHROPIC_API_KEY: undefined });
const C = await start(3102, { ANTHROPIC_API_KEY: "sk-ant-clave-falsa-e2e", ANTHROPIC_BASE_URL: "http://127.0.0.1:1" });

const q = (sql, p) => supa.db.query(sql, p);
await q(`insert into stella_businesses (id, name, about, services, faqs, whatsapp, privacy_url, domains, active) values ('prueba-peluqueria','Peluquería de Prueba','Negocio ficticio para pruebas de auditoría.', '[{"name":"Corte","price":"15 €"}]'::jsonb,'[]'::jsonb,'34600000000','https://cliente-prueba.com/privacy', array['cliente-prueba.com'], true)`);

const noRedirect = (base, extra = {}) => pwRequest.newContext({ baseURL: base, maxRedirects: 0, ...extra });
const anon = await noRedirect(A);
const auth = await noRedirect(A, { httpCredentials: ADMIN, extraHTTPHeaders: { Authorization: "Basic " + Buffer.from(`${ADMIN.username}:${ADMIN.password}`).toString("base64") } });
const st = async (ctx, url, opts = {}) => (await ctx.fetch(url, { failOnStatusCode: false, ...opts })).status();

try {
  console.log(`\n[rutas] públicas y privadas (${PROD ? "simulando producción" : "Preview/local"})`);
  for (const p of ["/", "/privacy", "/terms", "/cookies", "/disena-tu-web", "/robots.txt", "/sitemap.xml", "/stella.js", "/dashboard"]) check(`[rutas] ${p} → 200`, (await st(anon, p)) === 200);
  check("[rutas] una ruta inexistente → 404", (await st(anon, "/no-existe")) === 404);
  check("[rutas] «/#admin» es un fragmento del navegador: el servidor recibe «/» (la portada), no el panel", (await st(anon, "/#admin")) === 200);
  for (const p of ["/admin", "/admin/stella", "/admin/stella/nuevo", "/admin/stella/prueba-peluqueria", "/admin/stella/prueba-peluqueria/prueba", "/admin/diseno", `/admin/diseno/${UUID}`, `/api/admin/design-image?id=${UUID}&u=u1`])
    check(`[auth] sin contraseña ${p} → 401`, (await st(anon, p)) === 401);
  check("[auth] PATCH /api/admin/leads sin contraseña → 401", (await st(anon, `/api/admin/leads/${UUID}`, { method: "PATCH", data: { status: "contactado" }, headers: { Origin: A } })) === 401);
  check("[auth] un «server action» a /admin/stella sin contraseña → 401", (await st(anon, "/admin/stella/nuevo", { method: "POST", headers: { "Next-Action": "00abcdef", "Content-Type": "text/plain", Origin: A }, data: "[]" })) === 401);
  const wrong = await noRedirect(A, { extraHTTPHeaders: { Authorization: "Basic " + Buffer.from("admin-e2e:mala-contrasena-larga-1234").toString("base64") } });
  check("[auth] contraseña incorrecta → 401", (await st(wrong, "/admin")) === 401);
  for (const p of ["/admin", "/admin/stella", "/admin/stella/nuevo", "/admin/diseno", "/admin/stella/prueba-peluqueria"]) check(`[auth] con contraseña ${p} → 200`, (await st(auth, p)) === 200);
  check("[auth] negocio inexistente en el panel → 404", (await st(auth, "/admin/stella/no-existe")) === 404);
  check("[rutas] /api/stella GET → 405 y POST vacío → 4xx (no 500)", (await st(anon, "/api/stella")) === 405 && (await st(anon, "/api/stella", { method: "POST", data: "" })) < 500);
  check("[rutas] /api/design/request GET → 405", (await st(anon, "/api/design/request")) === 405);
  const emb = await anon.get("/stella/embed?negocio=localis", { failOnStatusCode: false });
  check("[rutas] /stella/embed existe (200) y abierto directamente explica que solo funciona dentro de una web autorizada", emb.status() === 200 && /solo se muestra dentro de la web del negocio|no está autorizado|no está disponible/.test(await emb.text()));
  check(`[rutas] /prueba-stella → ${PROD ? "404 (producción)" : "200 (solo fuera de producción)"}`, (await st(anon, "/prueba-stella")) === (PROD ? 404 : 200));
  const home = await anon.get("/");
  const html = await home.text();
  check("[rutas] enlaces internos de la home: /disena-tu-web, /privacy, /terms existen y apuntan a rutas reales", ["/disena-tu-web", "/privacy", "/terms"].every((h) => html.includes(`href="${h}"`)));
  check("[cabeceras] nosniff, Referrer-Policy y X-Frame-Options en la web; sin X-Powered-By", home.headers()["x-content-type-options"] === "nosniff" && !!home.headers()["referrer-policy"] && home.headers()["x-frame-options"] === "SAMEORIGIN" && !home.headers()["x-powered-by"]);
  check("[exposición] el HTML público no contiene claves ni secretos", !/sk-ant-clave|eyJ-clave|contrasena-e2e/.test(html));

  console.log("\n[leads] regresión del circuito de leads (ya probado por ti; aquí solo se comprueba que no se ha roto)");
  const lead = { businessName: "Negocio Ficticio SL", sector: "Comercio minorista", contactName: "Persona Ficticia", phone: "600 123 456", email: "ficticio@ejemplo.com", source: "auditoria" };
  check("[leads] POST /api/lead válido → 200 y se guarda en la base de datos", (await st(anon, "/api/lead", { method: "POST", data: lead })) === 200 && (await q("select count(*)::int n from leads where business_name='Negocio Ficticio SL'")).rows[0].n === 1);
  check("[leads] datos inválidos → 422 (teléfono y email)", (await st(anon, "/api/lead", { method: "POST", data: { ...lead, phone: "abc", email: "x" } })) === 422);
  const id = (await q("select id from leads limit 1")).rows[0].id;
  check("[leads] Resend sin configurar no rompe el guardado (el lead queda sin aviso por email)", (await q("select email_notified from leads where id=$1", [id])).rows[0].email_notified === false);
  check("[leads] cambiar estado desde el panel (PATCH con Origin propio) → 200", (await st(auth, `/api/admin/leads/${id}`, { method: "PATCH", data: { status: "contactado" }, headers: { Origin: A } })) === 200 && (await q("select status from leads where id=$1", [id])).rows[0].status === "contactado");
  check("[leads] PATCH con Origin ajeno → 403 y estado inválido → 400", (await st(auth, `/api/admin/leads/${id}`, { method: "PATCH", data: { status: "perdido" }, headers: { Origin: "https://malo.com" } })) === 403 && (await st(auth, `/api/admin/leads/${id}`, { method: "PATCH", data: { status: "inventado" }, headers: { Origin: A } })) === 400);
  check("[auth] PATCH con «Origin: null» o malformado → 403 (no 500)", (await st(auth, `/api/admin/leads/${id}`, { method: "PATCH", data: { status: "perdido" }, headers: { Origin: "null" } })) === 403 && (await st(auth, `/api/admin/leads/${id}`, { method: "PATCH", data: { status: "perdido" }, headers: { Origin: "no es una url" } })) === 403);
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ httpCredentials: ADMIN, viewport: { width: 1400, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem("localis-cookie-consent", JSON.stringify({ analytics: false, marketing: false, necessary: true, version: "2026-10-24" })); } catch {} });
  const page = await ctx.newPage();
  await page.goto(`${A}/admin/leads`, { waitUntil: "load" });
  await page.locator(`#st-${id}`).selectOption("propuesta");
  await page.getByText("Guardado").first().waitFor({ timeout: 10000 });
  await page.reload({ waitUntil: "load" });
  check("[leads] el cambio de estado persiste al recargar /admin (circuito completo en navegador)", (await page.locator(`#st-${id}`).inputValue()) === "propuesta");
  check("[leads] el lead muestra su origen en /admin", (await page.getByText("auditoria").count()) >= 1);
  await browser.close();

  console.log("\n[stella] sin clave y con fallo de la IA");
  const noKey = await noRedirect(B);
  const e0 = await noKey.get("/stella/embed?negocio=prueba-peluqueria", { headers: { Referer: "https://cliente-prueba.com/", "Sec-Fetch-Dest": "iframe" }, failOnStatusCode: false });
  check("[stella] SIN API key: el chat incrustado dice «no disponible» (no hay chat ni respuestas)", e0.status() === 200 && /no est[aá] disponible/.test(await e0.text()));
  check("[stella] SIN API key: /api/stella → 503 «no está activada»", (await st(noKey, "/api/stella", { method: "POST", data: { messages: [] }, headers: { Origin: B } })) === 503);
  const homeB = await (await noKey.get("/plataforma")).text();
  check("[stella] SIN API key: la página de plataforma no monta el chat real (stella.js) y muestra el aviso de pendiente", !homeB.includes("stella.js") && (PROD || homeB.includes("stella-pendiente")));
  const ca = await noRedirect(C);
  const e1 = await ca.get("/stella/embed?negocio=prueba-peluqueria", { headers: { Referer: "https://cliente-prueba.com/", "Sec-Fetch-Dest": "iframe" }, failOnStatusCode: false });
  const token = ((await e1.text()).match(/\\?"token\\?":\\?"([A-Za-z0-9_.-]+)\\?"/) ?? [])[1];
  check("[stella] con clave se emite sesión para el dominio autorizado", Boolean(token));
  const bad = await ca.post("/api/stella", { data: { token, messages: [{ role: "user", content: "hola" }] }, headers: { Origin: C }, failOnStatusCode: false });
  const bj = await bad.json().catch(() => ({}));
  check("[stella] si la API de Anthropic NO responde: 502 con salida a WhatsApp, sin romper la web", bad.status() === 502 && bj.fallback === true && (await st(ca, "/")) === 200, `${bad.status()} ${JSON.stringify(bj)}`);
  check("[stella] el fallo queda contado como error del negocio (no como consumo)", (await q("select coalesce(sum(errors),0)::int e, coalesce(sum(cost_micro),0)::int c from stella_usage where business_id='prueba-peluqueria'")).rows[0].e >= 1);
} catch (e) {
  check("EJECUCIÓN SIN EXCEPCIONES", false, String(e.stack ?? e).slice(0, 600));
}

servers.forEach((s) => s.kill());
await supa.close();
await anth.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas.`);
if (failed.length) console.log("FALLOS:\n" + failed.map((f) => `- ${f.name}: ${f.detail}`).join("\n"));
fs.writeFileSync(path.join(outDir, "resultado-auditoria.json"), JSON.stringify(results, null, 2));
process.exit(failed.length ? 1 : 0);
