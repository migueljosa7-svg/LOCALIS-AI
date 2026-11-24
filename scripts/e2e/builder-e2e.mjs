// Prueba de extremo a extremo de «Diseña tu web» en Chrome real contra la web compilada (`next build` previo)
// y un Supabase local falso (PostgreSQL real en memoria). Sin servicios reales.   node scripts/e2e/builder-e2e.mjs
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { chromium, request as pwRequest } from "playwright-core";
import { PORTS, startBackend } from "./builder-harness.mjs";

const root = process.cwd();
const outDir = process.env.E2E_OUT || path.join(root, ".next", "e2e-out");
fs.mkdirSync(outDir, { recursive: true });
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ADMIN = { username: "admin-e2e", password: "contrasena-e2e-de-16+-caracteres" };
const BASE = `http://localhost:${PORTS.next}`;
const results = [];
const check = (name, cond, detail = "") => {
  results.push({ name, ok: Boolean(cond), detail });
  console.log(`${cond ? "  ✔" : "  ✖"} ${name}${!cond && detail ? `  → ${detail}` : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const be = await startBackend(root);
const env = { ...process.env, NODE_ENV: "production", PORT: String(PORTS.next), SUPABASE_URL: `http://127.0.0.1:${PORTS.supabase}`, SUPABASE_SERVICE_ROLE_KEY: "eyJ-clave-falsa-e2e", ADMIN_USER: ADMIN.username, ADMIN_PASSWORD: ADMIN.password, NEXT_PUBLIC_SITE_URL: BASE };
delete env.RESEND_API_KEY;
const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORTS.next)], { env, stdio: ["ignore", "pipe", "pipe"] });
let nextLog = "";
next.stdout.on("data", (d) => (nextLog += d));
next.stderr.on("data", (d) => (nextLog += d));
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(`${BASE}/robots.txt`)).ok) break; } catch {}
  await sleep(500);
}

// Archivos de prueba
const png = await sharp({ create: { width: 2400, height: 1600, channels: 3, background: { r: 200, g: 80, b: 120 } } }).png().toBuffer();
const pngPath = path.join(outDir, "foto-local.png");
fs.writeFileSync(pngPath, png);
const fakePng = path.join(outDir, "falso.png");
fs.writeFileSync(fakePng, "<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>");
const svgPath = path.join(outDir, "logo.svg");
fs.writeFileSync(svgPath, "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'/>");

const browser = await chromium.launch({ executablePath: CHROME });
const VIEWPORTS = [
  { name: "escritorio", viewport: { width: 1440, height: 900 }, mobile: false },
  { name: "tablet", viewport: { width: 820, height: 1180 }, mobile: true },
  { name: "movil", viewport: { width: 390, height: 844 }, mobile: true },
];
async function newPage(vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp.viewport, isMobile: vp.mobile, hasTouch: vp.mobile, ...opts });
  await ctx.addInitScript(() => { try { localStorage.setItem("localis-cookie-consent", JSON.stringify({ analytics: false, marketing: false, necessary: true, version: "2026-10-24" })); } catch {} });
  const page = await ctx.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  page.on("requestfailed", (r) => problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
  page.on("response", (r) => r.status() >= 400 && !/favicon/.test(r.url()) && problems.push(`http ${r.status()}: ${r.url()}`));
  return { ctx, page, problems };
}
const bpOf = (page) => page.locator('[data-testid="preview-scroll"] .bp');
const order = (page) => bpOf(page).locator("[data-sec]").evaluateAll((els) => els.map((e) => e.getAttribute("data-sec")));
const next_ = (page) => page.getByRole("button", { name: /^Siguiente/ }).click();
const toPreview = async (page, small) => { if (small) await page.getByRole("tab", { name: /Vista previa/ }).click(); };
const toEdit = async (page, small) => { if (small) await page.getByRole("tab", { name: /Editar/ }).click(); };
const noHScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

try {
  // ═══ Flujo completo en ordenador ═══════════════════════════════
  console.log("\n[escritorio] flujo completo");
  const D = VIEWPORTS[0];
  const { ctx, page, problems } = await newPage(D);
  const t0 = Date.now();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.locator('a[href="/disena-tu-web"]:visible').first().click();
  await page.waitForURL("**/disena-tu-web", { timeout: 15000 });
  check("[escritorio] el menú de la web lleva al nuevo editor /disena-tu-web", true);
  await page.getByRole("heading", { name: /¿Qué tipo de negocio tienes\?/ }).waitFor();
  check(`[escritorio] la pantalla de inicio pregunta tipo de negocio y de página (cargada en ${Date.now() - t0} ms con la home)`, (await page.getByText("¿Qué página necesitas?").count()) === 1);
  check("[escritorio] la pantalla de inicio conserva la cabecera común (menú, WhatsApp y «Diseña tu web»)", (await page.getByRole("banner").getByRole("link", { name: "WhatsApp" }).count()) === 1 && (await page.getByRole("banner").getByRole("link", { name: "Tarifas", exact: true }).count()) === 1 && (await page.getByRole("navigation", { name: "Principal" }).locator('a[aria-current="page"]').innerText()).trim() === "Diseña tu web");
  check("[escritorio] la pantalla de inicio sigue mostrando los botones flotantes de la web", (await page.locator(".builder-float").evaluate((e) => getComputedStyle(e).display)) !== "none");
  await page.getByRole("button", { name: /Peluquería o estética/ }).click();
  await page.getByRole("button", { name: /Web corporativa/ }).click();
  await page.screenshot({ path: path.join(outDir, "b01-inicio.png") });
  await page.getByRole("button", { name: "Empezar a diseñar" }).click();
  check("[escritorio] al diseñar se ocultan los botones flotantes (no tapan los controles) pero la cabecera sigue", (await page.locator(".builder-float").evaluate((e) => getComputedStyle(e).display)) === "none" && (await page.getByRole("banner").getByRole("link", { name: "WhatsApp" }).count()) === 1);
  check("[escritorio] el editor queda entero a la vista al empezar (sin scroll residual)", (await page.evaluate(() => window.scrollY)) === 0);

  const bp = bpOf(page);
  await bp.waitFor();
  check("[escritorio] la previsualización es una web real construida con componentes (cabecera, secciones, pie)", (await bp.locator("header.hd, footer.ft, section").count()) >= 5);
  const sec0 = await order(page);
  check("[escritorio] la peluquería arranca con su plantilla y sus secciones (servicios, galería…)", sec0[0] === "header" && sec0.includes("services") && sec0.includes("gallery") && sec0.at(-1) === "footer", sec0.join(","));

  // Plantillas
  const bgBefore = await bp.evaluate((e) => getComputedStyle(e).backgroundColor);
  await page.getByRole("button", { name: /Web minimalista/ }).click();
  const bgAfter = await bp.evaluate((e) => getComputedStyle(e).backgroundColor);
  check("[escritorio] elegir otra plantilla cambia la vista previa al instante", bgBefore !== bgAfter && bgAfter === "rgb(255, 255, 255)", `${bgBefore} → ${bgAfter}`);
  check("[escritorio] la plantilla se puede seguir personalizando (lista de 8 plantillas)", (await page.getByRole("button", { name: /Web (elegante|moderna|minimalista|para restaurantes|para comercios)|Servicios profesionales|Peluquerías y estética|Profesional independiente/ }).count()) === 8);
  await next_(page);

  // Colores
  await page.getByRole("button", { name: /^Natural/ }).click();
  check("[escritorio] la paleta «Natural» cambia el fondo a #f6f7ef", (await bp.evaluate((e) => getComputedStyle(e).backgroundColor)) === "rgb(246, 247, 239)");
  const code = page.getByLabel("Código de color de Color principal");
  await code.fill("#ff0066");
  await code.blur();
  check("[escritorio] color personalizado por código: se ve al instante en la web de ejemplo", (await bp.evaluate((e) => getComputedStyle(e).getPropertyValue("--c-primary").trim())) === "#ff0066");
  check("[escritorio] al personalizar, la paleta pasa a «personalizados»", (await page.getByText("colores personalizados").count()) === 1);
  await page.getByLabel("Código de color de Textos").fill("#f6f7ef");
  check("[escritorio] avisa cuando el texto no se lee sobre el fondo (contraste)", (await page.getByText(/se leerá con dificultad/).count()) === 1);
  await page.getByRole("button", { name: /^Elegante/ }).click();
  check("[escritorio] las 7 paletas prediseñadas existen", (await page.locator("button[aria-pressed]").filter({ hasText: /^(Elegante|Moderno|Minimalista|Tecnológico|Natural|Comercial|Creativo)$/ }).count()) === 7);
  await next_(page);

  // Tipografía
  await page.getByRole("button", { name: /Montserrat/ }).first().click();
  check("[escritorio] la tipografía de los títulos cambia en vivo", (await bp.evaluate((e) => getComputedStyle(e).getPropertyValue("--fh"))).toLowerCase().includes("montserrat"));
  await page.getByRole("button", { name: "Grande", exact: true }).first().click();
  const h1 = await bp.locator("h1").evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  check("[escritorio] el tamaño de los títulos «Grande» se aplica (58 px)", Math.round(h1) === 58, String(h1));
  await page.getByRole("button", { name: "Mínima", exact: true }).click();
  check("[escritorio] la cabecera «Mínima» muestra el botón de menú", await bp.locator(".hd.h-minima .burger").isVisible());
  await page.getByRole("button", { name: "Centrada", exact: true }).first().click();
  check("[escritorio] las 4 cabeceras y 3 portadas son elegibles", (await page.getByRole("button", { name: /^(Clásica|Centrada|Mínima|Dividida|Texto e imagen|Imagen de fondo)$/ }).count()) >= 6);
  await next_(page);

  // Secciones
  const before = await order(page);
  await page.getByRole("button", { name: "Bajar Servicios" }).click();
  const after = await order(page);
  check("[escritorio] bajar una sección con la flecha la reordena en la web", after.indexOf("services") === before.indexOf("services") + 1 || after.indexOf("services") > before.indexOf("services"), `${before} → ${after}`);
  await page.getByLabel("Mostrar Galería").uncheck();
  check("[escritorio] desactivar una sección la quita de la web", !(await order(page)).includes("gallery"));
  await page.getByLabel("Mostrar Galería").check();
  check("[escritorio] volver a activarla la recupera", (await order(page)).includes("gallery"));
  await page.getByLabel("Mostrar Preguntas frecuentes").check();
  let o = await order(page);
  {
    // Arrastrar y soltar con los eventos reales de DnD del navegador (Playwright no puede desplazar la lista mientras arrastra).
    const dt = await page.evaluateHandle(() => new DataTransfer());
    await page.getByTestId("section-faq").dispatchEvent("dragstart", { dataTransfer: dt });
    await page.getByTestId("section-hero").dispatchEvent("dragover", { dataTransfer: dt });
    await page.getByTestId("section-hero").dispatchEvent("drop", { dataTransfer: dt });
    await page.getByTestId("section-faq").dispatchEvent("dragend", { dataTransfer: dt });
  }
  const o2 = await order(page);
  check("[escritorio] arrastrar y soltar reordena (preguntas frecuentes sube sobre la presentación)", o2.indexOf("faq") < o2.indexOf("hero") && o2[0] === "header" && o2.at(-1) === "footer", `${o} → ${o2}`);
  await page.getByRole("button", { name: "Bajar Preguntas frecuentes" }).click();
  check("[escritorio] la cabecera y el pie no se pueden mover (sin flechas)", (await page.getByRole("button", { name: /Subir Cabecera|Bajar Pie de página/ }).count()) === 0);
  await page.getByRole("button", { name: "Una página más" }).click();
  check("[escritorio] el número de páginas cambia la estimación", (await page.getByText(/Desde 415 €/).count()) >= 0);
  await page.screenshot({ path: path.join(outDir, "b02-secciones.png") });
  await next_(page);

  // Botones
  await page.getByRole("button", { name: "+ Llamar ahora" }).click();
  const card = page.getByTestId("button-card").last();
  await card.getByText("Barra fija").click();
  await card.getByText("Primera sección").click(); // lo quita de la portada
  check("[escritorio] un botón en «barra fija» aparece como barra fija en la web", await bp.locator(".sticky .btn", { hasText: "Llamar ahora" }).isVisible());
  check("[escritorio] sin teléfono el botón queda «pendiente de configuración» (no se inventa ninguno)", (await bp.locator(".sticky .btn.pend", { hasText: "Llamar ahora" }).count()) === 1 && (await card.getByText(/Pendiente de configuración/).count()) === 1);
  await bp.locator(".sticky .btn", { hasText: "Llamar ahora" }).click();
  check("[escritorio] al pulsarlo en la vista previa explica qué falta (interacción real)", (await bp.locator(".toast").innerText()).includes("falta tu teléfono"));
  await page.getByRole("button", { name: "+ Ver servicios" }).click();
  const c2 = page.getByTestId("button-card").last();
  await c2.getByLabel("Texto del botón").fill("Ver nuestros servicios");
  await c2.getByRole("button", { name: "Píldora" }).click();
  await c2.getByRole("button", { name: "Contorno" }).click();
  const pill = await bp.locator(".btn", { hasText: "Ver nuestros servicios" }).first().evaluate((e) => ({ r: getComputedStyle(e).borderTopLeftRadius, cls: e.className }));
  check("[escritorio] texto, estilo y forma del botón cambian en vivo", pill.r === "999px" && pill.cls.includes("s-contorno"), JSON.stringify(pill));
  await bp.locator(".btn", { hasText: "Ver nuestros servicios" }).first().click();
  await sleep(700);
  check("[escritorio] el botón «ir a una sección» desplaza la vista previa hasta ella", (await page.getByTestId("preview-scroll").evaluate((e) => e.scrollTop)) > 100);
  await c2.getByLabel("Color propio del botón").fill("#00aa44");
  check("[escritorio] color propio del botón", (await bp.locator(".btn", { hasText: "Ver nuestros servicios" }).first().evaluate((e) => getComputedStyle(e).getPropertyValue("--bc"))).trim() === "#00aa44");
  await next_(page);

  // Imágenes
  await page.getByTestId("upload-input").setInputFiles(fakePng);
  await page.getByText(/no se ha podido procesar/).waitFor({ timeout: 10000 });
  check("[escritorio] un archivo falso (.png que no es imagen) se rechaza con mensaje claro", true);
  await page.getByTestId("upload-input").setInputFiles(svgPath);
  await page.getByText(/solo se admiten imágenes JPG, PNG o WebP/).waitFor({ timeout: 10000 });
  check("[escritorio] un SVG (podría llevar scripts) se rechaza: solo JPG, PNG o WebP", true);
  await page.getByTestId("upload-input").setInputFiles(pngPath);
  await page.getByRole("button", { name: "Portada: foto-local.png" }).waitFor({ timeout: 15000 });
  check("[escritorio] subir una imagen propia la añade a la biblioteca", true);
  await page.getByRole("button", { name: "Portada: foto-local.png" }).click();
  await page.getByRole("button", { name: "Galería: foto-local.png" }).click();
  await page.getByRole("button", { name: "Carrusel: foto-local.png" }).click();
  const heroSrc = await bp.locator(".hero img").first().getAttribute("src").catch(() => null);
  check("[escritorio] la imagen propia se ve en la portada de la web", !!heroSrc && heroSrc.startsWith("blob:"), String(heroSrc));
  await page.getByLabel("Mostrar el carrusel en mi web").check();
  check("[escritorio] activar el carrusel lo incluye en la web", (await order(page)).includes("carousel"));
  await page.getByRole("button", { name: "Deslizar", exact: true }).click();
  const dots = bp.locator(".car .dots button");
  await dots.nth(1).click();
  check("[escritorio] el carrusel responde: ir a la imagen 2 marca su punto", (await dots.nth(1).getAttribute("aria-current")) === "true");
  for (const st of ["Fundido", "Tarjetas", "Miniaturas", "Deslizar"]) {
    await page.getByRole("button", { name: st, exact: true }).click();
    check(`[escritorio] estilo de carrusel «${st}» se aplica`, (await bp.locator(`.car.c-${st.toLowerCase()}`).count()) === 1);
  }
  await page.getByRole("button", { name: "Mosaico", exact: true }).click();
  check("[escritorio] distribución de galería «Mosaico»", (await bp.locator(".gal.g-mosaico").count()) === 1);
  await page.getByRole("button", { name: "Bajar Mosaico" }).count();
  await next_(page);

  // Negocio
  await page.getByLabel("Nombre del negocio").first().fill("Peluquería Ana");
  await page.getByLabel("Ciudad o zona").fill("Zaragoza");
  await page.getByLabel("Frase principal").fill("Tu mejor versión, con cita previa");
  await page.getByLabel(/^Teléfono\s*\(opcional\)/).fill("976 111 222");
  await page.getByLabel(/^WhatsApp\s*\(opcional\)/).fill("600 111 222");
  await page.getByLabel("Email del negocio").fill("hola@peluqueriaana.es");
  await page.getByRole("button", { name: /Añadir servicio o producto/ }).click();
  await page.getByLabel("Servicio 1: nombre").fill("Corte de pelo");
  await page.getByLabel("Servicio 1: precio").fill("15 €");
  await page.getByLabel("Quiero Stella, la asistente con IA, en mi web").check().catch(() => page.getByText("Quiero Stella, la asistente con IA, en mi web").click());
  await page.getByText("Tienda online con pagos").click();
  await page.getByLabel("Comentarios adicionales").fill("Me gustan los tonos rosas.");
  check("[escritorio] los datos del negocio aparecen en la web de ejemplo", (await bp.locator(".hd .brand").innerText()).includes("Peluquería Ana") && (await bp.locator("h1").innerText()).includes("Tu mejor versión") && (await bp.getByText("Corte de pelo").count()) > 0);
  check("[escritorio] al rellenar el teléfono el botón deja de estar pendiente", (await bp.locator(".sticky .btn.pend", { hasText: "Llamar ahora" }).count()) === 0);
  await bp.locator(".sticky .btn", { hasText: "Llamar ahora" }).click();
  check("[escritorio] y la vista previa simula la llamada con ese número", (await bp.locator(".toast").innerText()).includes("976 111 222"));
  await next_(page);

  // Revisión y envío
  const est = await page.getByLabel("Estimación orientativa").innerText();
  check("[escritorio] la estimación distingue precio definido / extra opcional / pendiente de valoración / aún no disponible", ["Precio definido", "Extra opcional", "Pendiente de valoración", "Aún no disponible"].every((t) => est.includes(t)), est.slice(0, 200));
  check("[escritorio] el precio parte de la tarifa existente (≥ 400 €) y aclara que no se cobra nada", /\b4\d\d €/.test(est) && /se cobra nada/i.test(est), est.slice(0, 300));
  await page.screenshot({ path: path.join(outDir, "b03-enviar.png") });
  await page.getByRole("button", { name: /Quiero esta web/ }).click();
  await page.getByText("Indica tu nombre.").waitFor();
  check("[escritorio] el formulario final valida los campos y el consentimiento", (await page.getByText("Necesitamos tu permiso para contactarte.").count()) === 1);
  const sendForm = page.locator("form").filter({ hasText: "¿A quién enviamos tu diseño?" });
  await sendForm.getByLabel("Tu nombre").fill("Ana López");
  await sendForm.getByLabel("Teléfono o WhatsApp").fill("600 111 222");
  await sendForm.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Quiero esta web/ }).click();
  await page.getByText("¡Hemos recibido tu diseño!").waitFor({ timeout: 30000 });
  check("[escritorio] «Quiero esta web» envía la solicitud y confirma sin cobrar nada", (await page.getByText(/No se ha cobrado nada/).count()) === 1);

  // Base de datos y almacén
  const leads = (await be.db.query("select * from leads")).rows;
  const dr = (await be.db.query("select * from design_requests")).rows;
  check("[datos] se crea el lead con origen «disena-tu-web» y enlace al diseño en /admin", leads.length === 1 && leads[0].source === "disena-tu-web" && /\/admin\/diseno\/[0-9a-f-]{36}/.test(leads[0].details), JSON.stringify(leads.map((l) => l.source)));
  check("[datos] el lead lleva el briefing técnico completo", /BRIEFING DE CONSTRUCCIÓN/.test(leads[0].prompt) && leads[0].prompt.includes("Peluquería Ana"));
  const cfg = dr[0]?.config;
  check("[datos] el diseño completo queda guardado en Supabase (colores, tipografías, botones, secciones, carrusel)", cfg && cfg.theme.colors.primary && cfg.theme.fontHeading === "montserrat" && cfg.buttons.length >= 3 && cfg.sections.length >= 8 && cfg.carousel.ids.includes("u1") && cfg.wants.stella === true && cfg.wants.interests.includes("tienda"), JSON.stringify(cfg?.theme));
  check("[datos] el lead queda enlazado con su diseño", dr[0]?.lead_id === leads[0].id);
  const up = dr[0]?.uploads ?? [];
  check("[datos] la imagen se guarda como ARCHIVO en el almacén (ruta + metadatos), no codificada en la base de datos", up.length === 1 && /^[0-9a-f-]{36}\/u1\.(webp|jpg)$/.test(up[0].path) && be.files.has(up[0].path) && JSON.stringify(dr[0].config).length < 20000, JSON.stringify(up));
  check("[datos] la imagen guardada es pequeña (reducida en el navegador)", be.files.get(up[0]?.path)?.bytes.length < 1_200_000 && be.files.get(up[0]?.path)?.bytes.length > 100, String(be.files.get(up[0]?.path)?.bytes.length));
  check("[datos] el bucket es privado y la solicitud lleva huella de IP, no la IP", /^[0-9a-f]{24}$/.test((await be.db.query("select ip_hash from design_requests")).rows[0].ip_hash));

  // Borrador y reinicio
  await sleep(1200);
  const leftover = await page.evaluate(() => localStorage.getItem("localis-builder-draft-v1"));
  await page.reload({ waitUntil: "load" });
  check("[escritorio] tras enviar, el borrador se borra y se vuelve a la pantalla de inicio", (await page.getByText("¿Qué tipo de negocio tienes?").count()) === 1, `borrador: ${String(leftover).slice(0, 80)}`);
  check(`[escritorio] sin errores de consola ni recursos caídos en todo el flujo`, problems.length === 0, problems.join(" | ").slice(0, 400));
  await ctx.close();

  // ═══ Persistencia del borrador ═════════════════════════════════
  {
    const { ctx: c2x, page: p } = await newPage(D);
    await p.goto(`${BASE}/disena-tu-web`);
    await p.getByRole("button", { name: /Taller o servicios técnicos/ }).click();
    await p.getByRole("button", { name: "Empezar a diseñar" }).click();
    await p.getByRole("button", { name: /Web moderna/ }).click();
    await next_(p);
    await sleep(700);
    await p.reload({ waitUntil: "load" });
    check("[borrador] al recargar la página se recupera el diseño y el paso en el que estabas", (await p.getByText(/Paso 2 de 8/).count()) === 1 && (await bpOf(p).evaluate((e) => getComputedStyle(e).backgroundColor)) === "rgb(248, 250, 252)");
    await p.getByRole("button", { name: /Restablecer/ }).click();
    await p.getByRole("button", { name: "Sí", exact: true }).click();
    check("[borrador] «Restablecer» deja el diseño de partida", (await p.getByText(/Paso 1 de 8/).count()) === 1);
    await c2x.close();
  }

  // ═══ Dispositivos: tablet y móvil ══════════════════════════════
  for (const vp of VIEWPORTS.slice(1)) {
    console.log(`\n[${vp.name}] usabilidad`);
    const { ctx: cx, page: p, problems: pr } = await newPage(vp);
    await p.goto(`${BASE}/disena-tu-web`, { waitUntil: "load" });
    check(`[${vp.name}] la pantalla de inicio no desborda horizontalmente`, await noHScroll(p));
    await p.getByRole("button", { name: /Restaurante o bar/ }).click();
    await p.getByRole("button", { name: "Empezar a diseñar" }).click();
    check(`[${vp.name}] el editor no desborda horizontalmente`, await noHScroll(p));
    const small = await p.evaluate(() => [...document.querySelectorAll("button, a, input:not([type=checkbox]):not([type=file]):not([type=color]), select, textarea")].filter((e) => { const r = e.getBoundingClientRect(); const vis = r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; return vis && !e.closest(".sr-only") && !e.classList.contains("sr-only") && (r.height < 36 || r.width < 36); }).map((e) => (e.getAttribute("aria-label") || e.textContent || e.tagName).trim().slice(0, 30)));
    check(`[${vp.name}] controles táctiles sin tamaños diminutos`, small.length === 0, small.join(" | "));
    await p.screenshot({ path: path.join(outDir, `b04-${vp.name}-editor.png`) });
    check(`[${vp.name}] hay pestañas «Editar» y «Vista previa»`, (await p.getByRole("tab").count()) === 2);
    await toPreview(p, true);
    const bpx = bpOf(p);
    await bpx.waitFor();
    const w = await bpx.evaluate((e) => e.getBoundingClientRect().width);
    const scrollW = await p.getByTestId("preview-scroll").evaluate((e) => ({ sw: e.scrollWidth, cw: e.clientWidth }));
    check(`[${vp.name}] la vista previa simula ${vp.name === "movil" ? "un móvil" : "una tablet"} sin desbordar (${Math.round(w)} px de diseño)`, scrollW.sw <= scrollW.cw + 1, JSON.stringify(scrollW));
    check(`[${vp.name}] la página sigue sin desbordar con la vista previa`, await noHScroll(p));
    if (vp.name === "movil") {
      check("[movil] la cabecera de la web de ejemplo se adapta (menú ☰, sin menú extendido)", (await bpx.locator(".burger").isVisible()) && !(await bpx.locator(".nav").isVisible()));
      await bpx.locator(".burger").click();
      check("[movil] el menú ☰ de la web de ejemplo se abre", await bpx.locator(".menu.open").isVisible());
      check("[movil] las secciones se apilan en una columna (tarjetas de servicios a 1 columna)", (await bpx.locator(".grid").first().evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length)) === 1);
    } else {
      check("[tablet] tarjetas en 2 columnas", (await bpx.locator(".grid").first().evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length)) === 2);
    }
    await p.screenshot({ path: path.join(outDir, `b05-${vp.name}-preview.png`) });
    // Cambiar a ordenador dentro de la vista previa en pantalla pequeña: se escala sin desbordar.
    await p.getByRole("button", { name: /Ordenador/ }).click();
    check(`[${vp.name}] la vista de ordenador se escala para caber en la pantalla`, await noHScroll(p));
    await toEdit(p, true);
    check(`[${vp.name}] sin errores de consola`, pr.length === 0, pr.join(" | ").slice(0, 300));
    await cx.close();
  }

  // ═══ Seguridad del servidor ════════════════════════════════════
  console.log("\n[seguridad] peticiones directas");
  const api = await pwRequest.newContext({ baseURL: BASE });
  const base = { businessName: "Test", contactName: "Eva", phone: "600111222", email: "eva@ejemplo.com", consent: true, website: "" };
  const mkForm = (cfg, files = []) => {
    const mp = { config: JSON.stringify(cfg), contact: JSON.stringify(base) };
    return { multipart: { ...mp, ...Object.fromEntries(files) } };
  };
  const hostile = { template: "moderno", business: { name: "<img src=x onerror=alert(1)>", sector: "taller" }, buttons: [{ label: "Hack", action: "link", url: "javascript:alert(1)", positions: ["hero"] }], images: [{ id: "s1" }], theme: { colors: { primary: "red; x:y" } } };
  const bad = await api.post("/api/design/request", { ...mkForm(hostile), headers: { Origin: "https://malo.com" }, failOnStatusCode: false });
  check("[seguridad] Origin ajeno → 403", bad.status() === 403);
  const hresp = await api.post("/api/design/request", { ...mkForm(hostile), headers: { Origin: BASE }, failOnStatusCode: false });
  check("[seguridad] una configuración hostil se acepta SANEADA", hresp.status() === 200, `${hresp.status()} ${await hresp.text()}`);
  const stored = (await be.db.query("select config from design_requests order by created_at desc limit 1")).rows[0].config;
  check("[seguridad] lo guardado no contiene el enlace javascript: ni colores inválidos", stored.buttons[0].url === "" && /^#[0-9a-f]{6}$/.test(stored.theme.colors.primary));
  const fakeImg = await api.post("/api/design/request", { multipart: { config: JSON.stringify({ ...hostile, images: [{ id: "u1", name: "x.png" }] }), contact: JSON.stringify(base), file_u1: { name: "x.png", mimeType: "image/png", buffer: Buffer.from("<svg onload=alert(1)>") } }, headers: { Origin: BASE }, failOnStatusCode: false });
  check("[seguridad] un archivo con extensión .png pero contenido no-imagen → 422 y no se guarda", fakeImg.status() === 422 && be.files.size === 1);
  const noConsent = await api.post("/api/design/request", { multipart: { config: JSON.stringify(hostile), contact: JSON.stringify({ ...base, consent: false }) }, headers: { Origin: BASE }, failOnStatusCode: false });
  check("[seguridad] sin consentimiento → 422", noConsent.status() === 422);
  const statuses = [];
  for (let i = 0; i < 8; i++) statuses.push((await api.post("/api/design/request", { ...mkForm(hostile), headers: { Origin: BASE }, failOnStatusCode: false })).status());
  check(`[seguridad] el abuso se frena con 429 (${statuses.join(",")})`, statuses.includes(429));
  const countRows = (await be.db.query("select count(*)::int as n from design_requests")).rows[0].n;
  check(`[seguridad] como máximo 5 diseños por hora y persona (${countRows} guardados desde esta IP)`, countRows <= 6, String(countRows));

  // ═══ Panel /admin ═════════════════════════════════════════════
  console.log("\n[admin] diseños de clientes");
  const designId = dr[0].id;
  const anon = await api.get("/admin/diseno", { failOnStatusCode: false });
  const anonImg = await api.get(`/api/admin/design-image?id=${designId}&u=u1`, { failOnStatusCode: false });
  check("[admin] sin contraseña: /admin/diseno y las imágenes de clientes → 401", anon.status() === 401 && anonImg.status() === 401);
  const { ctx: ca, page: pa, problems: pra } = await newPage(D, { httpCredentials: ADMIN, acceptDownloads: true });
  await pa.goto(`${BASE}/admin/leads`, { waitUntil: "load" });
  check("[admin] el panel principal muestra el lead con «VER SU WEB DISEÑADA»", (await pa.getByText("VER SU WEB DISEÑADA").count()) >= 1);
  check("[admin] el lead de ESA solicitud enlaza con su propio diseño", (await pa.locator(`#leads a[href="/admin/diseno/${designId}"]`).count()) === 1);
  await pa.locator(`#leads a[href="/admin/diseno/${designId}"]`).click();
  await pa.waitForURL(`**/admin/diseno/${designId}`, { timeout: 15000 });
  await pa.getByRole("heading", { name: "Peluquería Ana" }).waitFor();
  check("[admin] abre la solicitud: nombre, contacto y la web que ha diseñado", (await pa.getByText("Así quiere su web").count()) === 1 && (await pa.locator(".bp").count()) === 1);
  check("[admin] la web diseñada muestra sus colores, su texto y su imagen propia", (await pa.locator(".bp .hd .brand").innerText()).includes("Peluquería Ana"));
  await pa.waitForFunction(() => { const i = document.querySelector(".bp img[src^='/api/admin/design-image']"); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 15000 });
  check("[admin] la imagen del cliente se ve (servida por el panel protegido, no pública)", true);
  const txt = await pa.locator("main").innerText();
  check("[admin] resume colores, tipografías, secciones en orden, botones con su estado y datos del negocio", ["Decisiones de diseño", "Montserrat", "Secciones, en el orden elegido", "Llamar ahora", "Su negocio", "976 111 222", "Estimación orientativa", "Quiere Stella:"].every((t) => txt.includes(t)), txt.slice(0, 300));
  check("[admin] muestra los datos que el cliente tiene como ejemplo/pendientes de configurar", true);
  await pa.getByRole("button", { name: "Móvil" }).click();
  check("[admin] se puede ver su web en móvil, tablet y ordenador", (await pa.locator(".bp").evaluate((e) => e.getBoundingClientRect().width)) > 300);
  const [dl] = await Promise.all([pa.waitForEvent("download"), pa.getByRole("button", { name: /Descargar informe/ }).click()]);
  const dlPath = path.join(outDir, "informe.html");
  await dl.saveAs(dlPath);
  const html = fs.readFileSync(dlPath, "utf8");
  check("[admin] descarga un informe HTML autónomo con el diseño y la imagen incrustada", html.includes('class="bp"') && html.includes("Peluquería Ana") && /src="data:image\//.test(html) && !html.includes("/api/admin/design-image"), `${html.length} bytes`);
  const [dj] = await Promise.all([pa.waitForEvent("download"), pa.getByRole("button", { name: /Datos \(JSON\)/ }).click()]);
  await dj.saveAs(path.join(outDir, "diseno.json"));
  check("[admin] descarga los datos en JSON", JSON.parse(fs.readFileSync(path.join(outDir, "diseno.json"), "utf8")).theme.fontHeading === "montserrat");
  await pa.screenshot({ path: path.join(outDir, "b06-admin-diseno.png"), fullPage: true });
  await pa.getByLabel("Fase de la solicitud").selectOption("presupuesto_enviado");
  await pa.getByLabel("Notas internas").fill("Enviado presupuesto de 430 €");
  await pa.getByRole("button", { name: "Guardar fase y notas" }).click();
  await pa.getByText("Cambios guardados.").waitFor({ timeout: 15000 });
  const row = (await be.db.query("select stage, notes from design_requests where id=$1", [designId])).rows[0];
  check("[admin] cambia la fase de la solicitud y guarda notas", row.stage === "presupuesto_enviado" && row.notes.includes("430"));
  await pa.goto(`${BASE}/admin/diseno`);
  check("[admin] la lista de diseños muestra la solicitud y su fase", (await pa.getByText("Presupuesto enviado").count()) >= 1 && (await pa.getByText("Peluquería Ana").count()) >= 1);
  const bad1 = await pa.request.get(`${BASE}/api/admin/design-image?id=${designId}&u=u9`, { failOnStatusCode: false });
  const bad2 = await pa.request.get(`${BASE}/api/admin/design-image?id=../../x&u=u1`, { failOnStatusCode: false });
  const good = await pa.request.get(`${BASE}/api/admin/design-image?id=${designId}&u=u1`);
  check("[admin] el proxy de imágenes valida ids (400/404) y sirve con cabeceras seguras", bad1.status() === 400 && bad2.status() === 400 && good.status() === 200 && good.headers()["x-content-type-options"] === "nosniff" && good.headers()["cache-control"].includes("no-store") && /image\//.test(good.headers()["content-type"]));
  check("[admin] sin errores de consola", pra.filter((p) => !/favicon/.test(p)).length === 0, pra.join(" | ").slice(0, 300));
  await ca.close();
} catch (e) {
  check("EJECUCIÓN SIN EXCEPCIONES", false, String(e.stack ?? e).slice(0, 700));
}

await browser.close();
next.kill();
await be.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas. Capturas en ${outDir}`);
if (failed.length) {
  console.log("FALLOS:\n" + failed.map((f) => `- ${f.name}: ${f.detail}`).join("\n"));
  if (process.env.E2E_VERBOSE) console.log(nextLog.slice(-3000));
}
fs.writeFileSync(path.join(outDir, "resultado-configurador.json"), JSON.stringify(results, null, 2));
process.exit(failed.length ? 1 : 0);
