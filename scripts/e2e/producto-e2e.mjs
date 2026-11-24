// E2E del cierre de producto: resumen y filtros del panel, alta guiada, enlace de incorporación del cliente (sin panel),
// importador (bloqueo de direcciones internas), aislamiento y geolocalización/mapas. Chrome real + Supabase y Anthropic SIMULADOS.
//   node scripts/e2e/producto-e2e.mjs
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
const BASE = "http://localhost:3100";
const results = [];
const check = (name, cond, detail = "") => {
  results.push({ name, ok: Boolean(cond), detail });
  console.log(`${cond ? "  ✔" : "  ✖"} ${name}${!cond && detail ? `  → ${detail}` : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const supa = await startSupabase(root);
const anth = await startAnthropic();
const env = { ...process.env, NODE_ENV: "production", PORT: "3100", SUPABASE_URL: `http://127.0.0.1:${PORTS.supabase}`, SUPABASE_SERVICE_ROLE_KEY: "eyJ-clave-falsa-e2e", ANTHROPIC_API_KEY: "sk-ant-clave-falsa-e2e", ANTHROPIC_BASE_URL: `http://127.0.0.1:${PORTS.anthropic}`, ADMIN_USER: ADMIN.username, ADMIN_PASSWORD: ADMIN.password, NEXT_PUBLIC_SITE_URL: BASE };
delete env.RESEND_API_KEY;
const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3100"], { env, stdio: "ignore" });
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(`${BASE}/robots.txt`)).ok) break; } catch {}
  await sleep(500);
}
const q = (sql, p) => supa.db.query(sql, p);
const daysAgo = (d) => new Date(Date.now() - d * 86_400_000).toISOString();

// Datos FICTICIOS de ejemplo
const L = (name, status, source, ago, notified = true) => q(`insert into leads (business_name, contact_name, email, phone, service, source, status, email_notified, created_at) values ($1,'Persona Ficticia','f@ejemplo.com','600111222','Comercio minorista',$2,$3,$4,$5)`, [name, source, status, notified, daysAgo(ago)]);
await L("Lead Viejo SL", "nuevo", "auditoria", 5, false);
await L("Lead Stella SL", "nuevo", "stella-pedido", 1);
await L("Cliente Ganado SL", "ganado", "disena-tu-web", 20);
await L("Contacto de Ana", "contactado", "stella:peluqueria-ana", 2);
await q(`insert into stella_businesses (id, name, about, services, whatsapp, privacy_url, domains, active, monthly_budget_usd) values ('peluqueria-ana','Peluquería Ana','Peluquería de barrio con 20 años.', '[{"name":"Corte","price":"15 €"}]'::jsonb,'34600111222','https://ana.es/p',array['ana.es'], true, 5)`);
await q(`insert into stella_usage (business_id, day, messages, cost_micro, errors, contacts) values ('peluqueria-ana', current_date, 120, 4400000, 3, 6)`);
await q(`insert into design_requests (config, stage, created_at) values ('{"business":{"name":"Casa Luis","sector":"restaurante"},"template":"moderno"}'::jsonb, 'recibida', $1)`, [daysAgo(4)]);

const browser = await chromium.launch({ executablePath: CHROME });
const newCtx = async (opts = {}) => {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => { try { localStorage.setItem("localis-cookie-consent", JSON.stringify({ analytics: false, marketing: false, necessary: true, version: "2026-10-24" })); } catch {} });
  return ctx;
};
const noH = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

try {
  // ═══ 1. Resumen y filtros ═════════════════════════════════════
  console.log("\n[panel] resumen, filtros y móvil");
  for (const [name, vp, mobile] of [["escritorio", { width: 1400, height: 900 }, false], ["móvil", { width: 390, height: 844 }, true]]) {
    const ctx = await newCtx({ httpCredentials: ADMIN, viewport: vp, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    await page.goto(`${BASE}/admin`, { waitUntil: "load" });
    const cards = await page.getByTestId("resumen-tarjetas").innerText();
    check(`[panel ${name}] tarjetas: 4 leads, 1 cliente, 1 proyecto pendiente, 1/1 Stella activa`, /Leads\s*4/i.test(cards) && /Clientes\s*1/i.test(cards) && /Proyectos pendientes\s*1/i.test(cards) && /Stella activa\s*1\/1/i.test(cards), cards.replace(/\n/g, " "));
    const aten = await page.getByTestId("resumen-atencion").innerText();
    check(`[panel ${name}] «Requiere atención»: lead viejo, aviso sin email, diseño sin revisar, 88 % del tope y errores`, /sin contactar/.test(aten) && /sin aviso por email/.test(aten) && /sin revisar/.test(aten) && /88 %/.test(aten) && /3 error/.test(aten), aten.replace(/\n/g, " ").slice(0, 300));
    check(`[panel ${name}] navegación única con 4 apartados`, (await page.getByRole("navigation", { name: "Panel interno" }).getByRole("link").count()) === 4);
    check(`[panel ${name}] sin desbordamiento horizontal de la página`, await noH(page));
    await page.goto(`${BASE}/admin?estado=nuevo`, { waitUntil: "load" });
    check(`[panel ${name}] filtro por estado «nuevo» (2 de 4)`, (await page.getByRole("heading", { name: /Leads \(2 de 4\)/ }).count()) === 1);
    await page.goto(`${BASE}/admin?origen=stella`, { waitUntil: "load" });
    check(`[panel ${name}] filtro por origen «Stella» (pedido y contacto, 2 de 4)`, (await page.getByRole("heading", { name: /Leads \(2 de 4\)/ }).count()) === 1);
    await page.goto(`${BASE}/admin?estado=ganado&origen=diseno`, { waitUntil: "load" });
    check(`[panel ${name}] filtros combinados (1 de 4)`, (await page.getByRole("heading", { name: /Leads \(1 de 4\)/ }).count()) === 1);
    if (mobile) await page.screenshot({ path: path.join(outDir, "p01-panel-movil.png"), fullPage: false });
    else {
      await page.goto(`${BASE}/admin`, { waitUntil: "load" });
      await page.screenshot({ path: path.join(outDir, "p01-panel-escritorio.png") });
    }
    for (const p of ["/admin/entorno", "/admin/stella", "/admin/diseno"]) {
      await page.goto(`${BASE}${p}`, { waitUntil: "load" });
      check(`[panel ${name}] ${p} sin desbordamiento`, await noH(page));
    }
    check(`[panel ${name}] sin errores de JavaScript`, errs.length === 0, errs.join(" | "));
    await ctx.close();
  }
  const envCtx = await newCtx({ httpCredentials: ADMIN });
  const ep = await envCtx.newPage();
  await ep.goto(`${BASE}/admin/entorno`, { waitUntil: "load" });
  const envTxt = await ep.locator("main").innerText();
  check("[entorno] muestra qué variables están y faltan, sin valores ni claves", /ANTHROPIC_API_KEY/.test(envTxt) && /RESEND_API_KEY/.test(envTxt) && !/sk-ant-clave-falsa|eyJ-clave-falsa|contrasena-e2e/.test(envTxt));
  check("[entorno] indica que no se usa ninguna API de mapas de pago", /ninguna|No se usa/.test(envTxt));
  await envCtx.close();

  // ═══ 1b. Comprobación de integraciones desde el panel ═════════
  console.log("[integraciones] botones de comprobación (Supabase y almacén simulados, Resend sin clave)");
  {
    const ictx = await newCtx({ httpCredentials: ADMIN, viewport: { width: 1280, height: 900 } });
    const ip = await ictx.newPage();
    await ip.goto(`${BASE}/admin/entorno`, { waitUntil: "load" });
    await ip.getByTestId("btn-supabase").click();
    const res = ip.getByTestId("resultado-supabase");
    await res.waitFor({ timeout: 30000 });
    const t = await res.innerText();
    check("[integraciones] «Comprobar Supabase y almacén» pasa todas las comprobaciones y borra su imagen de prueba", /Todo correcto/.test(t) && !/✗/.test(t) && /Subir imagen/.test(t) && /Borrar la imagen/.test(t) && supa.storage.size === 0, t.split(String.fromCharCode(10)).filter((l, i, a) => l.startsWith("✗") || (i > 0 && a[i-1].startsWith("✗"))).join(" / ") + " storage=" + supa.storage.size);
    check("[integraciones] el resultado no contiene claves ni valores", !/eyJ-clave-falsa|sk-ant-clave|contrasena-e2e/.test(t));
    await ip.getByTestId("btn-resend").click();
    const rr = ip.getByTestId("resultado-resend");
    await rr.waitFor({ timeout: 15000 });
    check("[integraciones] sin RESEND_API_KEY el botón de correo lo explica y no envía nada", /Falta RESEND_API_KEY/.test(await rr.innerText()));
    check("[integraciones] sin desbordamiento horizontal", await noH(ip));
    await ictx.close();
  }

  // ═══ 2. Alta guiada ═══════════════════════════════════════════
  console.log("\n[alta] asistente guiado y enlace para el cliente");
  const actx = await newCtx({ httpCredentials: ADMIN, viewport: { width: 1280, height: 900 } });
  const ap = await actx.newPage();
  await ap.goto(`${BASE}/admin/stella/nuevo`, { waitUntil: "load" });
  check("[alta] el asistente muestra 5 pasos y empieza en el 1", (await ap.getByRole("navigation", { name: "Pasos del alta" }).getByRole("button").count()) === 5 && (await ap.locator('input[name="id"]').isVisible()));
  await ap.locator('input[name="id"]').fill("Mal Id!");
  await ap.locator('input[name="name"]').fill("Taller de Prueba");
  await ap.getByRole("button", { name: "Siguiente →" }).click();
  check("[alta] no deja avanzar con un identificador inválido y lo explica", (await ap.getByText(/solo admite minúsculas/).count()) >= 1 && (await ap.locator('input[name="id"]').isVisible()));
  await ap.locator('input[name="id"]').fill("taller-prueba");
  await ap.locator('textarea[name="about"]').fill("Taller ficticio de pruebas, revisiones y neumáticos en Zaragoza.");
  await ap.getByRole("button", { name: "Siguiente →" }).click();
  await ap.locator('textarea[name="services"]').fill("Cambio de aceite | 49 €\nRevisión | consultar");
  await ap.getByRole("button", { name: "Siguiente →" }).click();
  await ap.locator('input[name="whatsapp"]').fill("34600000001");
  await ap.getByRole("button", { name: "Siguiente →" }).click();
  await ap.locator('textarea[name="domains"]').fill("tallerprueba.example.com");
  await ap.getByRole("button", { name: "Siguiente →" }).click();
  const rev = await ap.getByTestId("alta-revision").innerText();
  check("[alta] el paso de revisión resume lo creado y lista lo que falta para activar (política de privacidad)", /Taller de Prueba/.test(rev) && /2/.test(rev) && /política de privacidad/i.test(rev) && /data-negocio="taller-prueba"/.test(rev), rev.replace(/\n/g, " ").slice(0, 300));
  await ap.getByRole("button", { name: /Crear negocio/ }).click();
  await ap.waitForURL(/\/admin\/stella\/taller-prueba\?aviso=creado/, { timeout: 15000 });
  const biz = (await q("select * from stella_businesses where id='taller-prueba'")).rows[0];
  check("[alta] el negocio se crea DESACTIVADO con la ficha completa", biz && biz.active === false && biz.services.length === 2 && biz.whatsapp === "34600000001" && biz.domains[0] === "tallerprueba.example.com");

  const link = (await ap.getByTestId("enlace-alta").innerText()).trim();
  check("[alta] la ficha del negocio muestra el enlace de incorporación del cliente", /\/alta\/[A-Za-z0-9_.-]+$/.test(link), link.slice(0, 60));
  const clientUrl = link.replace(/^https:\/\/[^/]+/, BASE);

  // ═══ 3. El cliente completa su ficha SIN entrar al panel ═════════
  const cctx = await newCtx({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); // sin credenciales
  const cp = await cctx.newPage();
  await cp.goto(clientUrl, { waitUntil: "load" });
  check("[cliente] abre el enlace sin usuario ni contraseña y ve SU negocio", (await cp.getByRole("heading", { name: /Taller de Prueba/ }).count()) === 1);
  check("[cliente] el formulario no tiene campos de administración (activar, topes de gasto, notas, identificador)", (await cp.locator('[name="dailyBudgetUsd"], [name="monthlyBudgetUsd"], [name="notes"], [name="id"], [name="active"]').count()) === 0);
  check("[cliente] la página no muestra datos de otros negocios", !(await cp.locator("body").innerText()).includes("Peluquería Ana"));
  check("[cliente] sin desbordamiento horizontal en móvil", await noH(cp));
  await cp.locator('textarea[name="description"]').fill("Taller de coches familiar con 15 años de experiencia.");
  await cp.locator('input[name="address"]').fill("Calle Ficticia 5, Zaragoza");
  await cp.locator('textarea[name="extra"]').fill("Aparcamiento gratuito.");
  await cp.locator('textarea[name="services"]').fill("Cambio de aceite | 49 € | Incluye filtro\nNeumáticos | desde 60 €");
  await cp.locator('input[name="hours"]').fill("L–V 8:00–18:00");
  await cp.locator('textarea[name="faqs"]').fill("¿Hacéis ITV? | No, solo preparación.");
  await cp.locator('input[name="privacyUrl"]').fill("https://tallerprueba.example.com/privacidad");
  await cp.getByRole("button", { name: "Enviar mi información" }).click();
  await cp.waitForTimeout(500);
  const stillForm = await cp.getByTestId("alta-hecho").count();
  check("[cliente] sin marcar el consentimiento no se guarda", stillForm === 0 && (await q("select about from stella_businesses where id='taller-prueba'")).rows[0].about.indexOf("15 años") < 0);
  await cp.locator('input[name="consent"]').check();
  await cp.getByRole("button", { name: "Enviar mi información" }).click();
  await cp.getByTestId("alta-hecho").waitFor({ timeout: 15000 });
  const after = (await q("select * from stella_businesses where id='taller-prueba'")).rows[0];
  check("[cliente] su información se guarda (descripción, web/dirección/extra, servicios, horario, preguntas, privacidad)", /15 años/.test(after.about) && /Dirección: Calle Ficticia 5/.test(after.about) && /Información adicional: Aparcamiento/.test(after.about) && after.services.length === 2 && after.hours === "L–V 8:00–18:00" && after.faqs.length === 1 && /privacidad/.test(after.privacy_url));
  check("[cliente] NO se activa: sigue desactivado y los topes de gasto no cambian", after.active === false && Number(after.monthly_budget_usd) === 5 && Number(after.daily_budget_usd) === 1);
  check("[cliente] queda marcado para revisión en las notas internas", /\[cliente\] completó su ficha/.test(after.notes ?? ""));
  const other = (await q("select count(*)::int n from stella_businesses where id <> 'taller-prueba' and updated_at > now() - interval '1 minute' and name not in ('Peluquería Ana')")).rows[0].n;
  check("[aislamiento] el enlace de un negocio no modificó ningún otro", other === 0);
  // Enlace manipulado o ajeno
  const bad = await newCtx();
  const bp = await bad.newPage();
  await bp.goto(`${BASE}/alta/${clientUrl.split("/alta/")[1].slice(0, -4)}XXXX`, { waitUntil: "load" });
  check("[cliente] un enlace manipulado muestra «no válido o caducado» y ningún dato", (await bp.getByTestId("alta-invalido").count()) === 1 && !(await bp.locator("body").innerText()).includes("Taller de Prueba"));
  await bp.goto(`${BASE}/alta/token-inventado`, { waitUntil: "load" });
  check("[cliente] un token inventado tampoco da acceso", (await bp.getByTestId("alta-invalido").count()) === 1);
  await bad.close();
  // El panel avisa de que hay una ficha por revisar
  await ap.goto(`${BASE}/admin`, { waitUntil: "load" });
  check("[alta] el resumen del panel avisa de que el cliente completó su ficha", /Taller de Prueba: el cliente completó su ficha/.test(await ap.getByTestId("resumen-atencion").innerText()));
  // Una ficha ACTIVA ya no se puede editar con el enlace
  await q("update stella_businesses set active = true where id='taller-prueba'");
  await sleep(11000); // caché de fichas (10 s)
  await cp.goto(clientUrl, { waitUntil: "load" });
  check("[cliente] con la ficha ya ACTIVA el enlace no permite editarla", (await cp.getByText("Tu asistente ya está activo").count()) === 1 && (await cp.locator('textarea[name="description"]').count()) === 0);
  await q("update stella_businesses set active = false where id='taller-prueba'");
  await cctx.close();

  // ═══ 4. Duplicar plantilla e importador ══════════════════════
  console.log("\n[importador] solo direcciones públicas");
  await ap.goto(`${BASE}/admin/stella/nuevo?clonar=taller-prueba`, { waitUntil: "load" });
  check("[duplicar] «Duplicar esta ficha» precarga servicios, preguntas y horario sin copiar id ni dominios", (await ap.locator('textarea[name="services"]').inputValue()).includes("Cambio de aceite") && (await ap.locator('input[name="id"]').inputValue()) === "" && (await ap.locator('textarea[name="domains"]').inputValue()) === "");
  for (const bad2 of ["http://localhost:3100/", "http://127.0.0.1:54321/rest/v1/leads", "http://169.254.169.254/latest/meta-data/", "file:///etc/passwd", "http://[::1]/"]) {
    await ap.goto(`${BASE}/admin/stella/nuevo?web=${encodeURIComponent(bad2)}`, { waitUntil: "load" });
    check(`[importador] bloquea ${bad2}`, (await ap.getByTestId("import-error").count()) === 1 && (await ap.getByTestId("import-ok").count()) === 0, await ap.getByTestId("import-error").innerText().catch(() => "sin mensaje"));
  }
  await actx.close();

  // ═══ 5. Geolocalización y mapas (navegador real) ══════════════
  console.log("\n[ubicación] geolocalización, permisos y mapas");
  async function geoFlow(label, ctxOpts, expectGrant) {
    const ctx = await newCtx({ viewport: { width: 1440, height: 900 }, ...ctxOpts });
    const page = await ctx.newPage();
    const seen = [];
    page.on("request", (r) => seen.push(`${r.method()} ${r.url()} ${r.postData() ?? ""}`));
    await page.goto(`${BASE}/disena-tu-web`, { waitUntil: "load" });
    await page.getByRole("button", { name: /Restaurante o bar/ }).click();
    await page.getByRole("button", { name: "Empezar a diseñar" }).click();
    for (let i = 0; i < 6; i++) await page.getByRole("button", { name: /^Siguiente/ }).click();
    await page.getByLabel(/^Dirección/).fill("Calle Ficticia 5");
    await page.getByLabel(/^Ciudad o zona/).fill("Zaragoza");
    const bp = page.locator('[data-testid="preview-scroll"] .bp');
    await bp.locator('[data-sec="location"]').scrollIntoViewIfNeeded();
    const view = bp.getByRole("link", { name: "Ver en Google Maps" });
    check(`[ubicación ${label}] «Ver en Google Maps» enlaza al mapa con la dirección y sin claves`, (await view.getAttribute("href")) === "https://www.google.com/maps/search/?api=1&query=Calle%20Ficticia%205%2C%20Zaragoza" && (await view.getAttribute("rel")).includes("noopener"));
    check(`[ubicación ${label}] «Cómo llegar» enlaza a la ruta de Google Maps`, /maps\/dir\/\?api=1&destination=Calle%20Ficticia/.test((await bp.getByRole("link", { name: "Cómo llegar", exact: true }).getAttribute("href")) ?? ""));
    check(`[ubicación ${label}] sin pulsar nada NO se pide ni se lee la ubicación`, (await page.evaluate(() => window.__geoCalls ?? 0)) === 0);
    if (expectGrant) {
      // Google Maps se simula (no se sale a internet); se captura la dirección a la que abre el navegador.
      await ctx.route("https://www.google.com/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<html>mapa</html>" }));
      const reqP = ctx.waitForEvent("request", { predicate: (r) => r.url().startsWith("https://www.google.com/maps/dir/"), timeout: 10000 });
      await bp.getByTestId("geo-desde-aqui").click();
      const got = await reqP.catch(() => null);
      if (!got) console.log("   (diagnóstico) aviso:", await bp.getByTestId("geo-aviso").innerText().catch(() => "sin aviso"), "· páginas abiertas:", ctx.pages().map((x) => x.url()).join(" , "), "· botón:", await bp.getByTestId("geo-desde-aqui").innerText());
      const u = new URL(got ? got.url() : "https://x.invalid/");
      check(`[ubicación ${label}] con permiso, abre la ruta con origen = la posición del usuario y destino = el negocio`, u.searchParams.get("origin") === "41.65,-0.88" && u.searchParams.get("destination") === "Calle Ficticia 5, Zaragoza", u.toString());
      check(`[ubicación ${label}] las coordenadas NO se enviaron a ningún servidor de LOCALIS (ni URL ni cuerpo)`, !seen.some((s) => /41\.65/.test(s) && !/google\.com/.test(s)));
    } else {
      await bp.getByTestId("geo-desde-aqui").click();
      await bp.getByTestId("geo-aviso").waitFor({ timeout: 10000 });
      const msg = await bp.getByTestId("geo-aviso").innerText();
      check(`[ubicación ${label}] si NO hay permiso se explica con claridad y se ofrece «Cómo llegar»`, /no has dado permiso|no pasa nada|Cómo llegar/i.test(msg), msg);
      check(`[ubicación ${label}] los botones de mapa siguen funcionando tras denegar`, (await view.count()) === 1);
    }
    await ctx.close();
  }
  await geoFlow("permiso concedido", { geolocation: { latitude: 41.65, longitude: -0.88 }, permissions: ["geolocation"] }, true);
  await geoFlow("permiso denegado", { permissions: [] }, false);
  const noAddr = await newCtx({ viewport: { width: 1440, height: 900 } });
  const np = await noAddr.newPage();
  await np.goto(`${BASE}/disena-tu-web`, { waitUntil: "load" });
  await np.getByRole("button", { name: /Restaurante o bar/ }).click();
  await np.getByRole("button", { name: "Empezar a diseñar" }).click();
  check("[ubicación] sin dirección no se muestran botones de mapa (no se inventa ninguna ubicación)", (await np.locator('[data-testid="preview-scroll"] .bp').getByText(/Cuando añadas tu dirección/).count()) === 1);
  await noAddr.close();

  // ═══ 6. Rutas nuevas ═════════════════════════════════════════
  const api = await pwRequest.newContext({ baseURL: BASE, maxRedirects: 0 });
  check("[rutas] /alta/<token inválido> → 200 con aviso (no 500) y /admin/entorno sin contraseña → 401", (await api.get("/alta/xxx", { failOnStatusCode: false })).status() === 200 && (await api.get("/admin/entorno", { failOnStatusCode: false })).status() === 401);
} catch (e) {
  check("EJECUCIÓN SIN EXCEPCIONES", false, String(e.stack ?? e).slice(0, 700));
}

await browser.close();
next.kill();
await supa.close();
await anth.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas.`);
if (failed.length) console.log("FALLOS:\n" + failed.map((f) => `- ${f.name}: ${f.detail}`).join("\n"));
fs.writeFileSync(path.join(outDir, "resultado-producto.json"), JSON.stringify(results, null, 2));
process.exit(failed.length ? 1 : 0);
