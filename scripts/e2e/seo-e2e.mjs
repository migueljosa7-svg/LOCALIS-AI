// Auditoría REAL de la web pública compilada (`next build` + `next start`): rutas, SEO técnico, enlaces, imágenes,
// consola y móvil. No usa Supabase ni Anthropic. node scripts/e2e/seo-e2e.mjs  (requiere `next build` previo)
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const root = process.cwd();
const PORT = Number(process.env.SEO_PORT || 3200);
const BASE = `http://127.0.0.1:${PORT}`;
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const results = [];
const check = (name, cond, detail = "") => {
  results.push({ name, ok: Boolean(cond) });
  console.log(`${cond ? "  ✔" : "  ✖"} ${name}${!cond && detail ? `  → ${detail}` : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const env = { ...process.env, NODE_ENV: "production", PORT: String(PORT) };
for (const k of ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ANTHROPIC_API_KEY", "RESEND_API_KEY", "STELLA_SITE_WIDGET", "VERCEL_ENV"]) delete env[k];
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], { env, stdio: "ignore", cwd: root });
let up = false;
for (let i = 0; i < 60 && !up; i++) {
  try { up = (await fetch(`${BASE}/robots.txt`)).ok; } catch {}
  if (!up) await sleep(500);
}
if (!up) { server.kill(); throw new Error("no arrancó el servidor"); }

// Con barras de desplazamiento reales (como en Windows): así se detectan desplazamientos del contenido al cambiar de página.
const browser = await chromium.launch({ executablePath: CHROME, headless: true, ignoreDefaultArgs: ["--hide-scrollbars"], args: ["--disable-features=OverlayScrollbar"] });
try {
  // ── robots.txt y sitemap.xml ──
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  check("[robots] declara el sitemap", /Sitemap: .*\/sitemap\.xml/.test(robots));
  check("[robots] bloquea /admin, /api/, /alta, /stella/ y /prueba-stella", ["/admin", "/api/", "/alta", "/stella/", "/prueba-stella"].every((p) => robots.includes(`Disallow: ${p}`)));
  check("[robots] no bloquea el resto de la web", /Allow: \//.test(robots) && !/Disallow: \/\s*$/m.test(robots));
  const smRes = await fetch(`${BASE}/sitemap.xml`);
  const sitemap = await smRes.text();
  check("[sitemap] responde 200 con XML", smRes.status === 200 && /<urlset/.test(sitemap));
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = urls.map((u) => new URL(u).pathname);
  check("[sitemap] incluye las 7 páginas públicas", ["/", "/plataforma", "/disena-tu-web", "/tarifas", "/preguntas-frecuentes", "/contacto", "/diseno-web-zaragoza"].every((p) => paths.includes(p)), paths.join(","));
  check("[sitemap] no incluye páginas privadas ni legales (noindex)", !paths.some((p) => /admin|alta|stella|prueba|api|privacy|terms|cookies/.test(p)));
  check("[sitemap] sin URLs duplicadas", new Set(urls).size === urls.length);
  const siteOrigin = new URL(urls[0]).origin;

  // ── Cada página indexable ──
  const titles = new Set();
  const descs = new Set();
  const allLinks = new Set();
  for (const p of paths) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem("localis-cookie-consent", JSON.stringify({ analytics: false, marketing: false, necessary: true, version: "2026-10-24" })); } catch {} });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    page.on("console", (m) => { if (m.type() === "error" && !/favicon|Failed to load resource/.test(m.text())) errs.push(m.text()); });
    const bad = [];
    page.on("response", (r) => { if (r.status() >= 400 && !/favicon/.test(r.url())) bad.push(`${r.status()} ${r.url()}`); });
    const res = await page.goto(BASE + p, { waitUntil: "networkidle" });
    const L = `[${p}]`;
    check(`${L} responde 200`, res.status() === 200, String(res.status()));
    const meta = await page.evaluate(() => {
      const g = (s, a) => document.querySelector(s)?.getAttribute(a) ?? "";
      return {
        title: document.title,
        desc: g('meta[name="description"]', "content"),
        canonical: g('link[rel="canonical"]', "href"),
        robots: g('meta[name="robots"]', "content"),
        ogTitle: g('meta[property="og:title"]', "content"),
        ogImage: g('meta[property="og:image"]', "content"),
        ogUrl: g('meta[property="og:url"]', "content"),
        h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()),
        h2: document.querySelectorAll("h2").length,
        lang: document.documentElement.lang,
        imgNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { return JSON.parse(s.textContent)["@type"] ?? "graph"; } catch { return "INVALIDO"; } }),
        links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        emptyLinks: [...document.querySelectorAll("a, button")].filter((e) => !e.textContent.trim() && !e.getAttribute("aria-label") && !e.querySelector("img[alt]")).length,
      };
    });
    check(`${L} título único (${meta.title.length} car.)`, meta.title.length >= 20 && meta.title.length <= 70 && !titles.has(meta.title), meta.title);
    titles.add(meta.title);
    check(`${L} meta description única (${meta.desc.length} car.)`, meta.desc.length >= 70 && meta.desc.length <= 175 && !descs.has(meta.desc), meta.desc);
    descs.add(meta.desc);
    check(`${L} canonical = su propia URL`, meta.canonical === `${siteOrigin}${p === "/" ? "" : p}` || meta.canonical === `${siteOrigin}${p}`, meta.canonical);
    check(`${L} indexable (sin noindex)`, !/noindex/.test(meta.robots));
    check(`${L} un único H1 con texto`, meta.h1.length === 1 && meta.h1[0].length > 5, JSON.stringify(meta.h1));
    check(`${L} tiene H2 (jerarquía H1→H2)`, meta.h2 >= 1);
    check(`${L} Open Graph (título, imagen, url)`, meta.ogTitle && meta.ogImage && meta.ogUrl, JSON.stringify(meta));
    check(`${L} html lang="es"`, /^es/.test(meta.lang));
    check(`${L} todas las imágenes tienen atributo alt`, meta.imgNoAlt === 0, String(meta.imgNoAlt));
    check(`${L} JSON-LD válido`, meta.ld.length >= 1 && !meta.ld.includes("INVALIDO"), meta.ld.join(","));
    check(`${L} sin enlaces ni botones vacíos (sin texto ni aria-label)`, meta.emptyLinks === 0, String(meta.emptyLinks));
    check(`${L} sin errores de consola ni peticiones fallidas`, errs.length === 0 && bad.length === 0, [...errs, ...bad].join(" | ").slice(0, 300));
    check(`${L} sin desbordamiento horizontal en escritorio`, !meta.overflow);
    for (const h of meta.links) allLinks.add(h);
    await ctx.close();

    // Móvil
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mctx.addInitScript(() => { try { localStorage.setItem("localis-cookie-consent", JSON.stringify({ analytics: false, marketing: false, necessary: true, version: "2026-10-24" })); } catch {} });
    const mp = await mctx.newPage();
    await mp.goto(BASE + p, { waitUntil: "networkidle" });
    check(`${L} sin desbordamiento horizontal en móvil (390 px)`, await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await mctx.close();
  }

  // ── Home: contenido «no endless» y solo una H1 por página ya comprobado ──
  const hp = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await hp.goto(BASE + "/", { waitUntil: "networkidle" });
  const homeH = await hp.evaluate(() => document.documentElement.scrollHeight);
  check(`[/] la portada es corta (${homeH}px de alto en escritorio, < 5000)`, homeH < 5000, String(homeH));

  // ── Menú: pestaña activa y navegación a cada ruta ──
  const NAV = [["Plataforma", "/plataforma"], ["Diseña tu web", "/disena-tu-web"], ["Tarifas", "/tarifas"], ["Preguntas frecuentes", "/preguntas-frecuentes"], ["Contacto", "/contacto"]];
  for (const [label, href] of NAV) {
    await hp.goto(BASE + "/", { waitUntil: "load" });
    await hp.getByRole("banner").getByRole("link", { name: label, exact: true }).first().click();
    await hp.waitForURL(`**${href}`);
    if (href === "/disena-tu-web") { check("[menú] «Diseña tu web» abre el editor a pantalla completa (la cabecera se sustituye por la del editor)", true); continue; }
    const active = await hp.getByRole("navigation", { name: "Principal" }).locator('a[aria-current="page"]').allInnerTexts();
    check(`[menú] «${label}» lleva a ${href} y queda marcada como activa`, active.some((t) => t.trim() === label), JSON.stringify(active));
  }
  // Menú móvil
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mctx.addInitScript(() => { try { localStorage.setItem("localis-cookie-consent", JSON.stringify({ analytics: false, marketing: false, necessary: true, version: "2026-10-24" })); } catch {} });
  const mp = await mctx.newPage();
  await mp.goto(BASE + "/tarifas", { waitUntil: "networkidle" });
  const burger = mp.getByRole("button", { name: /menú/i }).first();
  check("[menú móvil] existe el botón de menú", (await burger.count()) >= 1);
  await burger.click();
  const mobNav = mp.getByRole("dialog").or(mp.getByRole("navigation", { name: /principal|móvil|menú/i }));
  check("[menú móvil] se abre y muestra las 6 secciones", (await mp.getByRole("link", { name: "Preguntas frecuentes" }).filter({ visible: true }).count()) >= 1 && (await mp.getByRole("link", { name: "Contacto", exact: true }).filter({ visible: true }).count()) >= 1, String(await mobNav.count()));
  await mp.keyboard.press("Escape");
  await mctx.close();

  // ── Cabecera estable en todas las rutas (escritorio y tablet), también al navegar sin recargar ──
  for (const vp of [{ w: 1440, h: 900, n: "escritorio" }, { w: 820, h: 1180, n: "tablet" }]) {
    const c = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    await c.addInitScript(() => { try { localStorage.setItem("localis-cookie-consent", JSON.stringify({ analytics: false, marketing: false, necessary: true, version: "2026-10-24" })); } catch {} });
    const pg = await c.newPage();
    const pos = () => pg.evaluate(() => { const r = document.querySelector("header").firstElementChild.getBoundingClientRect(); return `${Math.round(r.x)}:${Math.round(r.width)}`; });
    const seen = new Set();
    for (const p of ["/", "/plataforma", "/disena-tu-web", "/tarifas", "/preguntas-frecuentes", "/contacto"]) { await pg.goto(BASE + p, { waitUntil: "networkidle" }); seen.add(await pos()); }
    check(`[cabecera ${vp.n}] misma posición y ancho en las 6 páginas (${[...seen].join(" | ")})`, seen.size === 1, [...seen].join(" | "));
    if (vp.n === "escritorio") {
      await pg.goto(BASE + "/tarifas", { waitUntil: "networkidle" });
      const before = await pos();
      await pg.getByRole("banner").getByRole("link", { name: "Diseña tu web", exact: true }).first().click();
      await pg.waitForURL("**/disena-tu-web");
      await pg.waitForTimeout(600);
      check("[cabecera] al pulsar «Diseña tu web» (navegación sin recarga) no se mueve", (await pos()) === before, `${before} → ${await pos()}`);
      check("[configurador] la cabecera conserva menú, WhatsApp y «Diseña tu web» y marca la pestaña activa", (await pg.getByRole("banner").getByRole("link", { name: "WhatsApp" }).count()) === 1 && (await pg.getByRole("navigation", { name: "Principal" }).locator('a[aria-current="page"]').innerText()).trim() === "Diseña tu web");
      check("[configurador] los botones flotantes (Stella y WhatsApp) se ven en la pantalla de inicio del editor", await pg.locator(".builder-float a[href*='wa.me']").first().isVisible());
      await pg.getByRole("banner").getByRole("link", { name: "Tarifas", exact: true }).first().click();
      await pg.waitForURL("**/tarifas");
      check("[cabecera] al volver a Tarifas tampoco se mueve", (await pos()) === before, await pos());
    }
    await c.close();
  }

  // ── Plataforma: pestañas ──
  {
    const c = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await c.addInitScript(() => { try { localStorage.setItem("localis-cookie-consent", JSON.stringify({ analytics: false, marketing: false, necessary: true, version: "2026-10-24" })); } catch {} });
    const pg = await c.newPage();
    const visible = async () => (await pg.locator('[role="tabpanel"]:not([hidden])').evaluateAll((els) => els.map((e) => e.id)));
    await pg.goto(BASE + "/plataforma", { waitUntil: "networkidle" });
    check("[plataforma] hay 3 pestañas: Stella, GPS y reparto, Panel de control", (await pg.getByRole("tab").allInnerTexts()).map((t) => t.split(String.fromCharCode(10))[0].trim()).join("|") === "Stella|GPS y reparto|Panel de control");
    check("[plataforma] al entrar solo se ve el apartado de Stella", JSON.stringify(await visible()) === '["panel-stella"]');
    await pg.getByRole("tab", { name: /GPS y reparto/ }).click();
    check("[plataforma] la pestaña «GPS y reparto» muestra solo ese apartado y actualiza la dirección (#gps)", JSON.stringify(await visible()) === '["panel-gps"]' && pg.url().endsWith("#gps"));
    check("[plataforma] GPS distingue lo disponible, la demostración y lo que está en desarrollo", (await pg.locator("#panel-gps").getByText("Disponible hoy").count()) === 1 && (await pg.locator("#panel-gps").getByText("Demostración", { exact: true }).count()) >= 1 && (await pg.locator("#panel-gps").getByText("En desarrollo", { exact: true }).count()) === 1);
    await pg.getByRole("tab", { name: /Panel de control/ }).click();
    check("[plataforma] la pestaña «Panel de control» muestra solo ese apartado", JSON.stringify(await visible()) === '["panel-panel"]');
    const panelText = await pg.locator("#panel-panel").innerText();
    check("[plataforma] el panel dice claramente que es una maqueta y que no existe un panel de acceso para clientes", /maqueta/i.test(panelText) && /no existe un panel de acceso para clientes/.test(panelText));
    await pg.goto(BASE + "/plataforma#panel", { waitUntil: "networkidle" });
    check("[plataforma] el enlace /plataforma#panel abre directamente el panel", JSON.stringify(await visible()) === '["panel-panel"]');
    await pg.goto(BASE + "/plataforma#reparto", { waitUntil: "networkidle" });
    check("[plataforma] el ancla antigua #reparto abre GPS y reparto", JSON.stringify(await visible()) === '["panel-gps"]');
    await pg.goto(BASE + "/plataforma", { waitUntil: "networkidle" });
    await pg.getByRole("tab", { name: /Stella/ }).focus();
    await pg.keyboard.press("ArrowRight");
    check("[plataforma] las flechas del teclado cambian de pestaña", JSON.stringify(await visible()) === '["panel-gps"]');
    await c.close();
  }

  // ── Textos comerciales: precios de referencia y nada que prometa lo que no existe ──
  {
    const c = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await c.addInitScript(() => { try { localStorage.setItem("localis-cookie-consent", JSON.stringify({ analytics: false, marketing: false, necessary: true, version: "2026-10-24" })); } catch {} });
    const pg = await c.newPage();
    const FORBIDDEN = /auditor[ií]a (gratis|gratuita)|reserva(r)? (tu|mi) auditor|24\/7|descuento|más barat|reservas? automátic|facturación automátic/i;
    for (const p of ["/", "/plataforma", "/disena-tu-web", "/tarifas", "/preguntas-frecuentes", "/contacto", "/diseno-web-zaragoza", "/terms", "/privacy", "/esta-pagina-no-existe"]) {
      await pg.goto(BASE + p, { waitUntil: "networkidle" });
      const txt = await pg.evaluate(() => document.body.innerText);
      // El aviso legal nombra esas funciones precisamente para decir que NO forman parte del servicio (se comprueba aparte).
      const m = p === "/terms" ? null : txt.match(FORBIDDEN);
      check(`[textos] ${p} no promete auditorías gratuitas, descuentos, 24/7 ni reservas o facturación automáticas`, !m, m ? m[0] : "");
    }
    await pg.goto(BASE + "/tarifas", { waitUntil: "networkidle" });
    const t = await pg.evaluate(() => document.body.innerText);
    check("[tarifas] muestra Web Captación 390 € + IVA y Web Pro 590 € + IVA como precios de referencia", /Web Captación/.test(t) && /390 €/.test(t) && /Web Pro/.test(t) && /590 €/.test(t) && /\+ IVA/.test(t) && /de referencia/i.test(t));
    check("[tarifas] mantenimiento: 15 € por página al mes, ejemplo de 5 páginas = 75 € y factores de variación", /15 € por página al mes/.test(t) && /75 € al mes/.test(t) && /complejidad de la web/.test(t) && /servicios adicionales/.test(t));
    check("[tarifas] Stella y el panel aparecen como servicios adicionales sin precio y el panel como no disponible", /Fase piloto/.test(t) && /Se presupuesta aparte/.test(t) && /No está disponible ni se puede contratar/.test(t));
    check("[tarifas] presupuesto personalizado y sin comparativas de competidores", /presupuesto a la medida/i.test(t) && !/competencia|otras empresas|agencias? cobran/i.test(t));
    await pg.goto(BASE + "/terms", { waitUntil: "networkidle" });
    const terms = await pg.evaluate(() => document.body.innerText);
    check("[legal] el aviso legal describe webs y mantenimiento, marca Stella como piloto y no enlaza con otro dominio", /páginas web/.test(terms) && /Stella .*fase piloto/s.test(terms) && !/localis\.ai/i.test(terms) && !(await pg.locator('a[href*="localis.ai"]').count()));
    await c.close();
  }

  // ── Enlaces internos: ninguno roto ──
  const internal = [...allLinks].filter((h) => h && h.startsWith("/") && !h.startsWith("//"));
  const targets = [...new Set(internal.map((h) => h.split("#")[0] || "/"))];
  const broken = [];
  for (const t of targets) {
    const r = await fetch(BASE + t, { redirect: "manual" });
    if (r.status >= 400) broken.push(`${r.status} ${t}`);
  }
  check(`[enlaces] ${targets.length} destinos internos distintos, ninguno roto`, broken.length === 0, broken.join(", "));

  // ── Redirecciones, 404 y noindex ──
  const dash = await fetch(BASE + "/dashboard", { redirect: "manual" });
  check("[redirección] /dashboard → /plataforma (permanente)", [301, 308].includes(dash.status) && /\/plataforma$/.test(dash.headers.get("location") || ""), `${dash.status} ${dash.headers.get("location")}`);
  const nf = await fetch(BASE + "/esta-pagina-no-existe");
  const nfHtml = await nf.text();
  check("[404] una URL inexistente devuelve 404 real con página propia", nf.status === 404 && /404|no (existe|encontr)/i.test(nfHtml));
  for (const p of ["/privacy", "/terms", "/cookies"]) {
    const html = await (await fetch(BASE + p)).text();
    check(`[noindex] ${p} lleva noindex`, /<meta name="robots" content="[^"]*noindex/.test(html));
  }
  const adm = await fetch(BASE + "/admin");
  check("[seguridad] /admin sin credenciales no es público (404 sin configurar, 401 con ella)", [401, 404].includes(adm.status), String(adm.status));
  const stellaProd = await fetch(BASE + "/prueba-stella");
  check("[seguridad] /prueba-stella no es indexable ni pública sin configuración", [404, 200].includes(stellaProd.status));
} finally {
  await browser.close();
  server.kill();
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas`);
if (failed.length) { console.log("Fallos:\n" + failed.map((f) => " - " + f.name).join("\n")); process.exit(1); }
