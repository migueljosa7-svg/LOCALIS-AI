// Prueba de extremo a extremo de Stella en un navegador real (Chrome), contra la web compilada
// (`next build` previo) y un entorno local falso (ver harness.mjs). NO usa Supabase ni Anthropic reales.
//   node scripts/e2e/stella-e2e.mjs
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium, request as pwRequest } from "playwright-core";
import { HOSTS, PORTS, startAnthropic, startSupabase, startVhosts } from "./harness.mjs";

const root = process.cwd();
const outDir = process.env.E2E_OUT || path.join(root, ".next", "e2e-out");
fs.mkdirSync(outDir, { recursive: true });
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ADMIN = { username: "admin-e2e", password: "contrasena-e2e-de-16+-caracteres" };

const results = [];
const check = (name, cond, detail = "") => {
  results.push({ name, ok: Boolean(cond), detail });
  console.log(`${cond ? "  ✔" : "  ✖"} ${name}${!cond && detail ? `  → ${detail}` : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Arranque del entorno ──────────────────────────────────────────
const supa = await startSupabase(root);
const anth = await startAnthropic();
const vhosts = await startVhosts(root);
const env = {
  ...process.env,
  PORT: String(PORTS.next),
  NODE_ENV: "production",
  SUPABASE_URL: `http://127.0.0.1:${PORTS.supabase}`,
  SUPABASE_SERVICE_ROLE_KEY: "eyJ-clave-falsa-e2e",
  ANTHROPIC_API_KEY: "sk-ant-clave-falsa-e2e",
  ANTHROPIC_BASE_URL: `http://127.0.0.1:${PORTS.anthropic}`,
  ADMIN_USER: ADMIN.username,
  ADMIN_PASSWORD: ADMIN.password,
  NEXT_PUBLIC_SITE_URL: `https://${HOSTS.site}`,
};
delete env.RESEND_API_KEY;
delete env.STELLA_SITE_WIDGET;
if (process.env.E2E_SITE_WIDGET === "on") env.STELLA_SITE_WIDGET = "on";
if (process.env.E2E_PROD === "1") env.VERCEL_ENV = "production";
const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORTS.next)], { env, stdio: ["ignore", "pipe", "pipe"] });
let nextLog = "";
next.stdout.on("data", (d) => (nextLog += d));
next.stderr.on("data", (d) => (nextLog += d));
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`http://127.0.0.1:${PORTS.next}/robots.txt`)).ok) break;
  } catch {}
  await sleep(500);
}

const db = supa.db;
const q = (sql, p) => db.query(sql, p);
const seed = (id, name, domains, over = {}) =>
  q(
    `insert into stella_businesses (id, name, sector, area, about, services, faqs, whatsapp, phone, privacy_url, domains, active, daily_budget_usd, monthly_budget_usd)
     values ($1,$2,'Peluquería','Zaragoza','Peluquería de barrio con 20 años de experiencia.', $3::jsonb, $4::jsonb, '34600111222','976000000', $5, $6::text[], $7, $8, 5)`,
    [id, name, JSON.stringify([{ name: "Corte de pelo", price: "15 €" }, { name: "Tinte", price: "desde 35 €" }]), JSON.stringify([{ q: "¿Tarjeta?", a: "Sí, Visa." }]), `https://${HOSTS.client}/privacidad`, domains, over.active ?? true, over.daily ?? 1]
  );
await seed("peluqueria-ana", "Peluquería Ana", [HOSTS.client]);
await seed("clinica-sol", "Clínica Sol", ["clinicasol.com"]);
await seed("inactivo", "Negocio Inactivo", [HOSTS.client], { active: false });

const browser = await chromium.launch({
  executablePath: CHROME,
  args: [`--host-resolver-rules=MAP ${HOSTS.site} 127.0.0.1:${PORTS.https}, MAP ${HOSTS.client} 127.0.0.1:${PORTS.https}, MAP ${HOSTS.other} 127.0.0.1:${PORTS.https}`],
});

const VIEWPORTS = [
  { name: "escritorio", viewport: { width: 1280, height: 800 }, mobile: false },
  { name: "tablet", viewport: { width: 820, height: 1180 }, mobile: true },
  { name: "movil", viewport: { width: 390, height: 844 }, mobile: true },
];

async function newPage(vp, opts = {}) {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: vp.viewport, isMobile: vp.mobile, hasTouch: vp.mobile, ...opts });
  // Cookies ya aceptadas: el aviso de cookies de LOCALIS no es objeto de estas pruebas y tapa botones.
  await ctx.addInitScript(() => { try { localStorage.setItem("localis-cookie-consent", JSON.stringify({ analytics: false, marketing: false, necessary: true, version: "2026-10-24" })); } catch {} });
  const page = await ctx.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  page.on("requestfailed", (r) => problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
  return { ctx, page, problems };
}

try {
  // ── 1. Web de cliente autorizada, en los 3 tipos de dispositivo ──
  for (const vp of VIEWPORTS) {
    console.log(`\n[${vp.name}] widget instalado en la web del cliente`);
    const { ctx, page, problems } = await newPage(vp);
    const t0 = Date.now();
    await page.goto(`https://${HOSTS.client}/`, { waitUntil: "load" });
    const loadMs = Date.now() - t0;
    const btn = page.locator('button[aria-controls="stella-panel"]');
    await btn.waitFor({ state: "visible", timeout: 10000 });
    check(`[${vp.name}] el botón del widget es visible aunque la web tenga CSS hostil (button{display:none!important})`, await btn.isVisible());
    const box = await btn.boundingBox();
    check(`[${vp.name}] botón táctil ≥ 44×44 px (${Math.round(box.width)}×${Math.round(box.height)})`, box.width >= 44 && box.height >= 44);
    check(`[${vp.name}] el iframe NO se carga hasta abrir el chat (carga rápida)`, (await page.locator("iframe").count()) === 0);
    const hOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    check(`[${vp.name}] la web del cliente no sufre desbordamiento horizontal por el widget`, hOverflow);

    await btn.click();
    const frame = page.frameLocator('iframe[title="Chat con Stella"]');
    await frame.getByText("asistente virtual con IA de Peluquería Ana").waitFor({ timeout: 15000 });
    check(`[${vp.name}] el chat abre y saluda diciendo que es una IA`, true);
    const rect = await page.locator('iframe[title="Chat con Stella"]').boundingBox();
    if (vp.name === "movil") check(`[movil] el chat ocupa la pantalla completa (${Math.round(rect.width)}×${Math.round(rect.height)})`, Math.abs(rect.width - 390) <= 1 && Math.abs(rect.height - 844) <= 1);
    else check(`[${vp.name}] el chat flotante cabe en la pantalla (${Math.round(rect.width)}×${Math.round(rect.height)})`, rect.width <= vp.viewport.width && rect.y >= 0 && rect.y + rect.height <= vp.viewport.height);
    const f = page.frames().find((x) => x.url().includes("/stella/embed"));
    check(`[${vp.name}] el chat no desborda horizontalmente`, await f.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    const small = await f.evaluate(() => [...document.querySelectorAll("button, a, input, textarea")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 30 || r.width < 30) && e.type !== "checkbox"; }).map((e) => (e.textContent || e.name || e.tagName).trim().slice(0, 25)));
    check(`[${vp.name}] controles del chat sin tamaños diminutos`, small.length === 0, small.join(", "));

    if (vp.name === "escritorio") {
      // Conversación real con el servidor (Anthropic falso).
      await frame.locator("textarea").fill("¿Cuánto cuesta un corte?");
      await frame.getByRole("button", { name: "Enviar mensaje" }).click();
      await frame.getByText("Un corte de pelo cuesta 15 €.").waitFor({ timeout: 15000 });
      check("[escritorio] pregunta → respuesta del servidor (ruta completa: token, límites, modelo, coste)", true);
      await sleep(3200); // respeta el límite anti-ráfagas
      await frame.locator("textarea").fill("Quiero que me llamen");
      await frame.getByRole("button", { name: "Enviar mensaje" }).click();
      await frame.getByText("Deja tus datos y Peluquería Ana te contactará").waitFor({ timeout: 15000 });
      check("[escritorio] la marca [[FORMULARIO]] abre el formulario y no se muestra al visitante", (await frame.getByText("[[FORMULARIO]]").count()) === 0);

      // Sin consentimiento no se puede enviar (validación del navegador) y no se guarda nada.
      await frame.locator('input[name="nombre"]').fill("María López");
      await frame.locator('input[name="telefono"]').fill("600 123 456");
      await frame.getByRole("button", { name: "Enviar mis datos" }).click();
      await sleep(600);
      check("[escritorio] sin marcar el consentimiento NO se envía ni se guarda nada", (await q("select count(*)::int as n from leads")).rows[0].n === 0);
      await frame.locator('input[name="consentimiento"]').check();
      await frame.getByRole("button", { name: "Enviar mis datos" }).click();
      await frame.getByText("Datos enviados a Peluquería Ana").waitFor({ timeout: 15000 });
      const leads = (await q("select * from leads")).rows;
      check("[escritorio] el contacto se guarda con origen stella:peluqueria-ana", leads.length === 1 && leads[0].source === "stella:peluqueria-ana", JSON.stringify(leads.map((l) => l.source)));
      check("[escritorio] se registra el consentimiento con fecha", /Consentimiento: aceptado el \d{4}-/.test(leads[0]?.details ?? ""));
      const usage = (await q("select * from stella_usage where business_id='peluqueria-ana'")).rows[0];
      check("[escritorio] consumo registrado (2 mensajes, 1 contacto, coste en micro-USD)", usage?.messages === 2 && usage?.contacts === 1 && Number(usage?.cost_micro) === 2 * (1800 * 0.1 + 60 * 0.5), JSON.stringify(usage));
      await page.screenshot({ path: path.join(outDir, "01-escritorio-chat.png") });
    }
    await page.screenshot({ path: path.join(outDir, `02-${vp.name}.png`) });
    // Escape cierra y devuelve el foco al botón.
    await page.keyboard.press("Escape");
    await sleep(200);
    check(`[${vp.name}] Escape cierra el chat`, !(await page.locator('iframe[title="Chat con Stella"]').isVisible()));
    check(`[${vp.name}] sin errores de consola ni recursos caídos (carga completa en ${loadMs} ms)`, problems.length === 0, problems.join(" | "));
    await ctx.close();
  }

  // ── 1b. Stella real en la web de LOCALIS y pedido de Stella (solo con E2E_SITE_WIDGET=on) ──
  if (process.env.E2E_SITE_WIDGET === "on") {
    console.log("[web LOCALIS] Stella real + pedido");
    for (const vp of VIEWPORTS) {
      const { ctx, page, problems } = await newPage(vp);
      await page.goto(`https://${HOSTS.site}/`, { waitUntil: "load" });
      check(`[${vp.name}] la sección «Stella real» aparece en la home`, (await page.locator("#stella-real").count()) === 1);
      await page.locator("#stella-real").getByRole("button", { name: "Hablar con Stella ahora" }).click();
      const frame = page.frameLocator('iframe[title="Chat con Stella"]');
      await frame.getByText("asistente virtual con IA de LOCALIS AI").waitFor({ timeout: 20000 });
      check(`[${vp.name}] el botón de la home abre el chat real de LOCALIS`, true);
      if (vp.name === "escritorio") {
        await frame.locator("textarea").fill("¿Cuánto cuesta un corte?");
        await frame.getByRole("button", { name: "Enviar mensaje" }).click();
        await frame.getByText("Un corte de pelo cuesta 15 €.").waitFor({ timeout: 15000 });
        check("[escritorio] Stella de LOCALIS responde por la misma ruta segura", true);
        await page.keyboard.press("Escape");
        await page.locator("#stella-real").getByRole("button", { name: "Quiero Stella en mi web" }).click();
        await page.getByRole("dialog").waitFor({ timeout: 10000 });
        check("[escritorio] «Quiero Stella en mi web» abre el formulario con el pedido precargado", (await page.getByText("Pedido: Stella").count()) > 0);
        await page.screenshot({ path: path.join(outDir, "04-pedido-stella.png") });
      }
      check(`[${vp.name}] home sin errores de consola`, problems.filter((p) => !/googletagmanager|gtag|favicon/.test(p)).length === 0, problems.join(" | ").slice(0, 300));
      await ctx.close();
    }
  }

  // ── 2. Web NO autorizada ─────────────────────────────────────────
  console.log("\n[seguridad] web no autorizada");
  {
    const callsBefore = (await (await fetch(`http://127.0.0.1:${PORTS.anthropic}/__calls`)).json()).length;
    const { ctx, page } = await newPage(VIEWPORTS[0]);
    let apiCalls = 0;
    page.on("request", (r) => r.url().includes("/api/stella") && apiCalls++);
    await page.goto(`https://${HOSTS.other}/`, { waitUntil: "load" });
    await page.locator('button[aria-controls="stella-panel"]').click();
    await sleep(2500);
    const fr = page.frames().find((x) => x.url().includes("/stella/embed"));
    const text = fr ? await fr.evaluate(() => document.body.innerText).catch(() => "") : "";
    check("[seguridad] en una web no autorizada el chat no funciona (sin campo de escritura)", !text.includes("Escribe tu pregunta") && !(fr && (await fr.locator("textarea").count().catch(() => 0)) > 0), text.slice(0, 80));
    check("[seguridad] no se hizo ninguna llamada a la API ni a Anthropic desde ahí", apiCalls === 0 && (await (await fetch(`http://127.0.0.1:${PORTS.anthropic}/__calls`)).json()).length === callsBefore);
    await ctx.close();
  }

  // ── 3. Cabeceras ─────────────────────────────────────────────────
  console.log("\n[seguridad] cabeceras");
  const api = await pwRequest.newContext({ baseURL: `https://127.0.0.1:${PORTS.https}`, ignoreHTTPSErrors: true, extraHTTPHeaders: { Host: HOSTS.site } });
  {
    const e = await api.get("/stella/embed?negocio=peluqueria-ana");
    const csp = e.headers()["content-security-policy"] ?? "";
    check("[cabeceras] /stella/embed fija frame-ancestors solo con 'self' y los dominios del negocio", csp.includes("frame-ancestors 'self' https://cliente-prueba.com https://www.cliente-prueba.com") && !csp.includes("clinicasol") && !csp.includes("otra-web"), csp);
    check("[cabeceras] /stella/embed no lleva X-Frame-Options (lo controla el CSP)", !e.headers()["x-frame-options"]);
    const e2 = await api.get("/stella/embed?negocio=inactivo");
    check("[cabeceras] un negocio desactivado no autoriza ningún dominio de incrustación", (e2.headers()["content-security-policy"] ?? "") === "frame-ancestors 'self'");
    const home = await api.get("/");
    check("[cabeceras] el resto de la web conserva X-Frame-Options: SAMEORIGIN", home.headers()["x-frame-options"] === "SAMEORIGIN");
    const js = await api.get("/stella.js");
    check(`[cabeceras] stella.js con caché corta y ligero (${(await js.body()).length} bytes)`, (js.headers()["cache-control"] ?? "").includes("max-age=300") && (await js.body()).length < 9000);
    if (process.env.E2E_SITE_WIDGET !== "on") check("[producción] la web de LOCALIS sigue igual: sin widget de Stella (STELLA_SITE_WIDGET apagado) y con WhatsApp", !(await home.text()).includes("stella.js") && (await home.text()).includes("wa.me") && !(await home.text()).includes("stella-real"));
  }

  // ── 3b. Stella sin configurar en la web de LOCALIS (Preview) o en producción ──
  if (process.env.E2E_SITE_WIDGET !== "on") {
    const prod = process.env.E2E_PROD === "1";
    console.log(`
[web LOCALIS] Stella sin configurar (${prod ? "producción" : "Preview"})`);
    for (const vp of VIEWPORTS) {
      const { ctx, page, problems } = await newPage(vp);
      let apiCalls = 0;
      page.on("request", (r) => r.url().includes("/api/stella") && apiCalls++);
      await page.goto(`https://${HOSTS.site}/`, { waitUntil: "load" });
      const btn = page.getByTestId("stella-pending-button");
      if (prod) {
        check(`[${vp.name}] en producción sin configurar NO aparece el botón de Stella ni avisos (queda como siempre)`, (await btn.count()) === 0 && (await page.locator("#stella-pendiente").count()) === 0);
      } else {
        await btn.waitFor({ state: "visible", timeout: 10000 });
        const box = await btn.boundingBox();
        const inView = box.x >= 0 && box.y >= 0 && box.x + box.width <= vp.viewport.width && box.y + box.height <= vp.viewport.height;
        check(`[${vp.name}] el botón flotante «Stella · chat IA» es visible en pantalla y táctil (${Math.round(box.width)}×${Math.round(box.height)})`, inView && box.height >= 44);
        const waBox = await page.locator('a[aria-label*="WhatsApp"]').first().boundingBox().catch(() => null);
        if (waBox && waBox.width > 0) check(`[${vp.name}] no se solapa con el botón de WhatsApp`, box.y + box.height <= waBox.y || waBox.y + waBox.height <= box.y || box.x + box.width <= waBox.x || waBox.x + waBox.width <= box.x);
        await page.locator("#stella-pendiente").waitFor();
        check(`[${vp.name}] la home avisa de que el chat real está pendiente y distingue la demostración comercial`, /demostración comercial/.test(await page.locator("#stella-pendiente").innerText()));
        await btn.click();
        const panel = page.getByTestId("stella-pending-panel");
        await panel.waitFor();
        const t = await panel.innerText();
        check(`[${vp.name}] el panel dice claramente que está pendiente de configuración, lista qué falta y NO finge respuestas`, /todavía no está activado/.test(t) && /ANTHROPIC_API_KEY/.test(t) && /STELLA_SITE_WIDGET/.test(t) && (await panel.locator("textarea, input").count()) === 0);
        check(`[${vp.name}] ofrece WhatsApp mientras tanto`, (await panel.locator('a[href*="wa.me"]').count()) === 1);
        check(`[${vp.name}] no se hizo ninguna llamada a la API de Stella`, apiCalls === 0);
        check(`[${vp.name}] el panel no desborda`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        await page.screenshot({ path: path.join(outDir, `05-pendiente-${vp.name}.png`) });
        await page.keyboard.press("Escape");
        check(`[${vp.name}] Escape cierra el panel`, (await panel.count()) === 0);
      }
      check(`[${vp.name}] home sin errores de consola`, problems.filter((p) => !/googletagmanager|gtag|favicon/.test(p)).length === 0, problems.join(" | ").slice(0, 300));
      await ctx.close();
    }
  }

  // ── 4. API: un script externo (peticiones fraudulentas) ──────────
  console.log("\n[seguridad] peticiones directas a la API");
  {
    const callsBefore = (await (await fetch(`http://127.0.0.1:${PORTS.anthropic}/__calls`)).json()).length;
    const post = (p, data, headers = {}) => api.post(p, { data, headers: { Origin: `https://${HOSTS.site}`, "Content-Type": "application/json", ...headers }, failOnStatusCode: false });
    const msgs = [{ role: "user", content: "hola" }];
    check("[api] sin token → 401", (await post("/api/stella", { business: "peluqueria-ana", messages: msgs })).status() === 401);
    check("[api] Origin ajeno → 403", (await post("/api/stella", { messages: msgs, token: "x" }, { Origin: "https://malo.com" })).status() === 403);
    check("[api] token inventado → 401", (await post("/api/stella", { token: "eyJ.firma", messages: msgs })).status() === 401);
    const getToken = async (negocio, referer) => {
      const r = await api.get(`/stella/embed?negocio=${negocio}`, { headers: { Referer: referer, "Sec-Fetch-Dest": "iframe" } });
      return ((await r.text()).match(/\\?"token\\?":\\?"([A-Za-z0-9_.-]+)\\?"/) ?? [])[1];
    };
    check("[api] pedir el chat de otro negocio desde un dominio ajeno no da token", !(await getToken("peluqueria-ana", "https://otra-web.com/")));
    check("[api] abrir /stella/embed como documento (no iframe) no da token", !(await (async () => { const r = await api.get("/stella/embed?negocio=peluqueria-ana", { headers: { Referer: "https://cliente-prueba.com/", "Sec-Fetch-Dest": "document" } }); return ((await r.text()).match(/"token\\?":/) ?? [])[0]; })()));
    const tok = await getToken("peluqueria-ana", "https://cliente-prueba.com/");
    check("[api] la web autorizada obtiene token", Boolean(tok));
    await sleep(1200);
    check("[api] token de Peluquería + cuerpo que pide Clínica Sol → 400, sin gasto", (await post("/api/stella", { token: tok, business: "clinica-sol", messages: msgs })).status() === 400);
    check("[api] token válido → 200", (await post("/api/stella", { token: tok, messages: msgs })).status() === 200);
    const tokSol = await getToken("clinica-sol", "https://clinicasol.com/");
    await sleep(1200);
    await post("/api/stella", { token: tokSol, messages: [{ role: "user", content: "¿Qué ofrecéis?" }] });
    const calls = await (await fetch(`http://127.0.0.1:${PORTS.anthropic}/__calls`)).json();
    const sol = calls.at(-1);
    check("[aislamiento] el modelo de Clínica Sol solo recibió la ficha de Clínica Sol", String(sol.system).includes("Clínica Sol") && !String(sol.system).includes("Peluquería Ana"));
    const ana = calls.filter((c) => String(c.system).includes("Peluquería Ana")).at(-1);
    check("[aislamiento] el modelo de Peluquería Ana no vio datos de Clínica Sol", ana && !String(ana.system).includes("Clínica Sol"));
    check("[modelo] se usa Haiku 5.5 por defecto, max_tokens 1500 y la clave llega a Anthropic", calls.every((c) => c.model === "claude-haiku-5-5" && c.max_tokens === 1500 && c.hasKey), JSON.stringify(calls.map((c) => [c.model, c.max_tokens, c.hasKey])));
    check("[coste] las peticiones rechazadas no llegaron a Anthropic", calls.length - callsBefore === 2, `llamadas nuevas: ${calls.length - callsBefore}`);

    // Ráfaga: un script con token válido es frenado por los límites persistentes.
    const tok2 = await getToken("peluqueria-ana", "https://cliente-prueba.com/");
    await sleep(1200);
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await post("/api/stella", { token: tok2, messages: msgs })).status());
    check(`[abuso] una ráfaga con token válido se frena con 429 (${statuses.join(",")})`, statuses.includes(429) && statuses.filter((s) => s === 200).length <= 3);

    // Tope diario de gasto del negocio.
    await q("update stella_businesses set daily_budget_usd = 0 where id='peluqueria-ana'");
    await sleep(11000); // caché de fichas (10 s)
    const tok3 = await getToken("peluqueria-ana", "https://cliente-prueba.com/");
    await sleep(1200);
    const before = (await (await fetch(`http://127.0.0.1:${PORTS.anthropic}/__calls`)).json()).length;
    const over = await post("/api/stella", { token: tok3, messages: msgs });
    const overBody = await over.json().catch(() => ({}));
    check("[coste] con el tope diario superado, Stella responde 503 con salida a WhatsApp y NO llama a la IA", over.status() === 503 && overBody.fallback === true && (await (await fetch(`http://127.0.0.1:${PORTS.anthropic}/__calls`)).json()).length === before, `${over.status()} ${JSON.stringify(overBody)}`);
    await q("update stella_businesses set daily_budget_usd = 1 where id='peluqueria-ana'");

    // Desactivación: deja de servir en segundos.
    await q("update stella_businesses set active = false where id='peluqueria-ana'");
    await sleep(11000);
    const off = await post("/api/stella", { token: tok3, messages: msgs });
    check("[baja] al desactivar un negocio, su token deja de funcionar (403)", off.status() === 403);
    const gone = await api.get("/stella/embed?negocio=peluqueria-ana", { headers: { Referer: "https://cliente-prueba.com/", "Sec-Fetch-Dest": "iframe" } });
    check("[baja] y el chat muestra «no disponible» en su web", /no est[aá] disponible/.test(await gone.text()));
    await q("update stella_businesses set active = true where id='peluqueria-ana'");
  }

  // ── 5. Panel /admin ──────────────────────────────────────────────
  console.log("\n[admin] gestión de negocios");
  {
    const anon = await api.get("/admin/stella", { failOnStatusCode: false });
    check("[admin] sin contraseña /admin/stella → 401", anon.status() === 401);
    const { ctx, page, problems } = await newPage(VIEWPORTS[0], { httpCredentials: ADMIN });
    await page.goto(`https://${HOSTS.site}/admin/stella`, { waitUntil: "load" });
    check("[admin] lista de negocios con los 3 sembrados", (await page.getByText("Peluquería Ana").count()) > 0 && (await page.getByText("Clínica Sol").count()) > 0);
    await page.goto(`https://${HOSTS.site}/admin/stella/nuevo`);
    await page.fill('input[name="id"]', "taller-paco");
    await page.fill('input[name="name"]', "Taller Paco");
    await page.fill('textarea[name="about"]', "Taller mecánico de coches en Zaragoza, revisiones y neumáticos.");
    await page.fill('textarea[name="services"]', "Cambio de aceite | 49 € | Incluye filtro\nRevisión ITV | consultar");
    await page.fill('textarea[name="faqs"]', "¿Dais cita previa? | Sí, por WhatsApp.");
    await page.fill('input[name="whatsapp"]', "+34 600 999 888");
    await page.fill('input[name="privacyUrl"]', "https://tallerpaco.es/privacidad");
    await page.fill('textarea[name="domains"]', "https://www.tallerpaco.es/");
    await page.getByRole("button", { name: /Crear negocio/ }).click();
    await page.waitForURL(/\/admin\/stella\/taller-paco\?aviso=creado/, { timeout: 15000 });
    check("[admin] alta de negocio desde el formulario (queda DESACTIVADO)", (await page.getByText("Desactivado").count()) > 0);
    const row = (await q("select * from stella_businesses where id='taller-paco'")).rows[0];
    check("[admin] ficha guardada: dominios normalizados, servicios estructurados, WhatsApp limpio", row && row.domains.join() === "www.tallerpaco.es" && row.services.length === 2 && row.whatsapp === "34600999888" && row.active === false, JSON.stringify(row));
    check("[admin] muestra el código de instalación con el id del negocio", (await page.locator("pre").first().innerText()).includes('data-negocio="taller-paco"'));
    // Activar (ficha completa) y desactivar
    await page.getByRole("button", { name: "Activar", exact: true }).click();
    await page.waitForURL(/aviso=activado/, { timeout: 15000 });
    check("[admin] activar el negocio", (await q("select active from stella_businesses where id='taller-paco'")).rows[0].active === true);
    await page.getByRole("button", { name: "Desactivar", exact: true }).click();
    await page.waitForURL(/aviso=desactivado/, { timeout: 15000 });
    check("[admin] desactivar el negocio (baja)", (await q("select active from stella_businesses where id='taller-paco'")).rows[0].active === false);
    // Errores de validación
    await page.goto(`https://${HOSTS.site}/admin/stella/nuevo`);
    await page.fill('input[name="id"]', "taller-paco");
    await page.fill('input[name="name"]', "Duplicado");
    await page.getByRole("button", { name: /Crear negocio/ }).click();
    await page.getByText(/Ya existe un negocio/).waitFor({ timeout: 10000 });
    check("[admin] no permite duplicar identificadores", true);
    // Activar sin datos suficientes
    await q("insert into stella_businesses (id, name) values ('vacio', 'Vacío')");
    await page.goto(`https://${HOSTS.site}/admin/stella/vacio`);
    check("[admin] muestra qué falta antes de activar", (await page.getByText("Antes de activar").count()) > 0);
    await page.getByRole("button", { name: "Activar", exact: true }).click();
    await page.waitForURL(/aviso=faltan/, { timeout: 15000 });
    check("[admin] no deja activar un negocio con la ficha incompleta", (await q("select active from stella_businesses where id='vacio'")).rows[0].active === false);
    // Contactos del negocio
    await page.goto(`https://${HOSTS.site}/admin/stella/peluqueria-ana`);
    check("[admin] el negocio muestra SUS contactos y su consumo", (await page.getByText("María López").count()) > 0 && (await page.getByText("Contactos generados (1)").count()) > 0);
    await page.goto(`https://${HOSTS.site}/admin/stella/clinica-sol`);
    check("[admin] los contactos de otro negocio no aparecen en este", (await page.getByText("María López").count()) === 0);
    await page.screenshot({ path: path.join(outDir, "03-admin-negocio.png"), fullPage: true });
    // Prueba desde el panel con negocio desactivado
    await page.goto(`https://${HOSTS.site}/admin/stella/inactivo/prueba`);
    await page.locator("textarea").first().fill("¿Cuánto cuesta un corte?");
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    await page.getByText("Un corte de pelo cuesta 15 €.").waitFor({ timeout: 15000 });
    check("[admin] la prueba del panel funciona aunque el negocio esté desactivado", true);
    const adminProblems = problems.filter((p) => !/favicon/.test(p));
    check("[admin] sin errores de consola", adminProblems.length === 0, adminProblems.join(" | "));
    // Panel principal enlaza
    await page.goto(`https://${HOSTS.site}/admin`);
    check("[admin] el panel principal enlaza con Stella y muestra el contacto de Stella", (await page.getByText("Stella · negocios y contactos").count()) > 0 && (await page.getByText("stella:peluqueria-ana").count()) > 0);
    await ctx.close();
  }
} catch (e) {
  check("EJECUCIÓN SIN EXCEPCIONES", false, String(e.stack ?? e).slice(0, 600));
}

await browser.close();
next.kill();
await supa.close();
await anth.close();
await vhosts.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas. Capturas en ${outDir}`);
if (failed.length) {
  console.log("FALLOS:\n" + failed.map((f) => `- ${f.name}: ${f.detail}`).join("\n"));
  if (process.env.E2E_VERBOSE) console.log(nextLog.slice(-3000));
}
fs.writeFileSync(path.join(outDir, "resultado.json"), JSON.stringify(results, null, 2));
process.exit(failed.length ? 1 : 0);
