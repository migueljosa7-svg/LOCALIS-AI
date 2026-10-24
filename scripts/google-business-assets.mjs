// ════════════════════════════════════════════════════════════════════
//  Generador de recursos para Google Business Profile (y redes sociales)
//
//  Uso:
//    npm run build && npm start        (en otra terminal, o cualquier URL pública)
//    npm run assets:google             → usa http://localhost:3000
//    BASE_URL=https://tu-dominio.com npm run assets:google
//
//  Genera en public/google-business-assets/:
//    logo-720x720.png               Logo (Google lo recorta en círculo: margen seguro)
//    logo-wordmark-1080x1080.png    Logo + nombre (perfiles sociales)
//    portada-2048x1152.png          Foto de portada 16:9 con captura real de la web
//    servicio-*-1200x900.png        Banners 4:3 para publicaciones / fotos de servicio
//    og-image.png (en /public)      Imagen para compartir enlaces (1200×630)
//
//  Requisitos de Google Business: JPG/PNG, 10 KB–5 MB, mínimo 250×250 (logo)
//  y 480×270 (portada); recomendado 720×720 y 16:9.
//  Si no hay servidor disponible, las imágenes se generan solo con diseño
//  vectorial (sin capturas).
// ════════════════════════════════════════════════════════════════════
import sharp from "sharp";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "google-business-assets");
const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
mkdirSync(OUT, { recursive: true });

const C = { bg: "#0B0F17", cyan: "#00F2FE", cobalt: "#3B82F6", emerald: "#10B981", text: "#E2E8F0", muted: "#94A3B8" };
const FONT = "Bahnschrift, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Parte un texto en líneas de como máximo `max` caracteres. */
function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  return lines;
}

// ── Piezas SVG reutilizables ─────────────────────────────────────────
const defs = `
  <defs>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.cobalt}"/>
    </linearGradient>
    <linearGradient id="textgrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#8FFBFF"/><stop offset="0.4" stop-color="${C.cyan}"/><stop offset="1" stop-color="#60A5FA"/>
    </linearGradient>
    <radialGradient id="glowC" cx="0.15" cy="0.05" r="0.75">
      <stop offset="0" stop-color="${C.cyan}" stop-opacity="0.20"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0.95" cy="0.95" r="0.75">
      <stop offset="0" stop-color="${C.cobalt}" stop-opacity="0.24"/><stop offset="1" stop-color="${C.cobalt}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="rgba(255,255,255,0.035)" stroke-width="1.5"/>
    </pattern>
  </defs>`;

const background = (w, h) => `
  <rect width="${w}" height="${h}" fill="${C.bg}"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <rect width="${w}" height="${h}" fill="url(#glowC)"/>
  <rect width="${w}" height="${h}" fill="url(#glowB)"/>`;

/** Logotipo (mismo dibujo que src/components/brand/BrandMark.tsx, viewBox 48). */
const mark = (x, y, size) => `
  <g transform="translate(${x} ${y}) scale(${size / 48})">
    <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="#10161F" stroke="url(#brand)" stroke-width="2"/>
    <path d="M24 9.5c-6.6 0-12 5.2-12 11.7 0 8.6 12 17.8 12 17.8s12-9.2 12-17.8c0-6.5-5.4-11.7-12-11.7Z" fill="none" stroke="url(#brand)" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M24 14.6l1.7 4.6 4.6 1.7-4.6 1.7-1.7 4.6-1.7-4.6-4.6-1.7 4.6-1.7 1.7-4.6Z" fill="${C.cyan}"/>
  </g>`;

const wordmark = (x, y, size) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="700" fill="${C.text}" letter-spacing="-1">LOCALIS <tspan fill="url(#textgrad)">AI</tspan></text>`;

const chip = (x, y, label, color = C.cyan, size = 22) => {
  const w = Math.round(label.length * size * 0.62 + size * 1.6);
  const h = Math.round(size * 1.9);
  return `<g transform="translate(${x} ${y})">
    <rect width="${w}" height="${h}" rx="${h / 2}" fill="${color}" fill-opacity="0.10" stroke="${color}" stroke-opacity="0.45" stroke-width="2"/>
    <text x="${w / 2}" y="${h / 2 + size * 0.36}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="700" letter-spacing="2" fill="${color}">${esc(label)}</text>
  </g>`;
};

const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`);

async function save(name, input, dir = OUT) {
  const file = join(dir, name);
  await sharp(input).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(file);
  const kb = Math.round(statSync(file).size / 1024);
  const meta = await sharp(file).metadata();
  console.log(`  ✔ ${name.padEnd(36)} ${meta.width}×${meta.height}  ${kb} KB${kb > 5000 ? "  ⚠ >5 MB" : ""}`);
  return file;
}

/** Recorta con esquinas redondeadas y añade sombra/halo para pegar una captura. */
async function framedShot(buf, maxW, maxH, radius = 28) {
  const resized = await sharp(buf).resize(maxW, maxH, { fit: "inside", withoutEnlargement: false }).png().toBuffer();
  const { width: w, height: h } = await sharp(resized).metadata();
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" fill="#fff"/></svg>`);
  const rounded = await sharp(resized).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const border = Buffer.from(
    `<svg width="${w}" height="${h}">${defs}<rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="${radius}" fill="none" stroke="url(#brand)" stroke-opacity="0.65" stroke-width="3"/></svg>`
  );
  const framed = await sharp(rounded).composite([{ input: border }]).png().toBuffer();
  const pad = 60;
  const glow = await sharp(
    Buffer.from(`<svg width="${w + pad * 2}" height="${h + pad * 2}"><rect x="${pad}" y="${pad}" width="${w}" height="${h}" rx="${radius}" fill="${C.cyan}" fill-opacity="0.30"/></svg>`)
  )
    .blur(28)
    .png()
    .toBuffer();
  return { framed, glow, w, h, pad };
}

// ── 1. Capturas reales de la web (opcional) ──────────────────────────
async function captureShots() {
  let chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    console.log("  · playwright-core no instalado: se omiten las capturas.");
    return null;
  }
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(String(res.status));
  } catch {
    console.log(`  · ${BASE_URL} no responde: arranca la web (npm run build && npm start) para incluir capturas reales.`);
    return null;
  }

  const launchOpts = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: process.env.CHROME_CHANNEL || "chrome" };
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...launchOpts });
  } catch {
    browser = await chromium.launch({ headless: true, channel: "msedge" });
  }
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: "no-preference" });
  // Oculta el banner de cookies y los elementos flotantes para capturas limpias.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("localis-cookie-consent", JSON.stringify({ necessary: true, analytics: false, marketing: false, version: "2026-10-24" }));
      sessionStorage.setItem("localis-pwa-dismissed", "1");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".no-print,.hero-float{display:none!important}" });

  const shots = {};
  const grab = async (key, selector, wait = 1500) => {
    const el = page.locator(selector).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(wait);
    shots[key] = await el.screenshot({ animations: "allow" });
    console.log(`  ✔ captura ${key}`);
  };

  await grab("hero", "#inicio .hero-card", 5200);
  await page.locator("#stella").scrollIntoViewIfNeeded();
  await page.getByText("Demo completada").waitFor({ timeout: 25000 }).catch(() => {});
  await grab("stella", "#stella .border-glow", 600);
  await grab("gps", "#reparto .border-glow", 3500);
  await grab("ahorro", "#ahorro", 1800);
  await grab("panel", "#demo .border-glow", 1500);
  await grab("web", "#web ul", 800);
  await browser.close();
  return shots;
}

// ── 2. Composiciones ─────────────────────────────────────────────────
async function logos() {
  await save("logo-720x720.png", svg(720, 720, `${background(720, 720)}${mark(170, 170, 380)}`));
  await save(
    "logo-wordmark-1080x1080.png",
    svg(1080, 1080, `${background(1080, 1080)}${mark(340, 230, 400)}
      <text x="540" y="790" text-anchor="middle" font-family="${FONT}" font-size="104" font-weight="700" fill="${C.text}" letter-spacing="-2">LOCALIS <tspan fill="url(#textgrad)">AI</tspan></text>
      <text x="540" y="860" text-anchor="middle" font-family="${FONT}" font-size="38" fill="${C.muted}">Webs con IA y GPS · Zaragoza</text>`)
  );
}

async function ogImage() {
  const W = 1200, H = 630;
  await save(
    "og-image.png",
    svg(W, H, `${background(W, H)}
      ${mark(72, 64, 72)}${wordmark(164, 116, 44)}
      <text font-family="${FONT}" font-weight="700" font-size="70" letter-spacing="-2">
        <tspan x="72" y="262" fill="${C.text}">Webs con IA que</tspan>
        <tspan x="72" y="344" fill="url(#textgrad)">atienden, agendan</tspan>
        <tspan x="72" y="426" fill="url(#textgrad)">y reparten <tspan fill="${C.text}">por ti</tspan></tspan>
      </text>
      <text x="72" y="494" font-family="${FONT}" font-size="30" fill="${C.muted}">Stella IA 24/7 · WhatsApp · Citas · Facturas · GPS de reparto</text>
      ${chip(72, 530, "ZARAGOZA", C.cyan, 20)}${chip(250, 530, "0% COMISIONES", C.emerald, 20)}
      ${mark(860, 210, 260)}`),
    join(ROOT, "public")
  );
}

async function cover(shots) {
  const W = 2048, H = 1152;
  const base = svg(W, H, `${background(W, H)}
    ${mark(120, 110, 100)}${wordmark(246, 182, 60)}
    <text font-family="${FONT}" font-weight="700" font-size="104" letter-spacing="-3">
      <tspan x="120" y="430" fill="${C.text}">Webs con IA que</tspan>
      <tspan x="120" y="550" fill="url(#textgrad)">atienden, agendan</tspan>
      <tspan x="120" y="670" fill="url(#textgrad)">y reparten <tspan fill="${C.text}">por ti</tspan></tspan>
    </text>
    <text x="120" y="770" font-family="${FONT}" font-size="40" fill="${C.muted}">Stella IA 24/7 por WhatsApp · Citas · Facturas</text>
    <text x="120" y="828" font-family="${FONT}" font-size="40" fill="${C.muted}">GPS de reparto propio para PYMEs</text>
    ${chip(120, 900, "ZARAGOZA", C.cyan, 26)}${chip(360, 900, "0% COMISIONES", C.emerald, 26)}
    <text x="120" y="1060" font-family="${FONT}" font-size="34" font-weight="600" fill="${C.text}">+34 640 80 92 38</text>
    ${shots?.hero ? "" : mark(1250, 300, 560)}`);

  const layers = [];
  if (shots?.hero) {
    const { framed, glow, w, h, pad } = await framedShot(shots.hero, 900, 860, 36);
    const left = 1080 + Math.round((900 - w) / 2);
    const top = Math.round((H - h) / 2);
    layers.push({ input: glow, left: left - pad, top: top - pad }, { input: framed, left, top });
  }
  await save("portada-2048x1152.png", await sharp(base).composite(layers).png().toBuffer());
}

const BANNERS = [
  { key: "stella", file: "servicio-stella-ia-1200x900.png", chip: "STELLA IA · 24/7", color: C.cyan, title: "Atiende WhatsApp, agenda y factura sola", sub: "Tu asistente con IA responde al instante, de día y de noche." },
  { key: "gps", file: "servicio-gps-reparto-1200x900.png", chip: "GPS EN TIEMPO REAL", color: C.emerald, title: "Tus repartos en directo, con tus repartidores", sub: "Seguimiento en el mapa y enlace por WhatsApp para tu cliente." },
  { key: "ahorro", file: "servicio-sin-comisiones-1200x900.png", chip: "0% COMISIONES", color: C.emerald, title: "Deja de pagar el 20–30 % a las plataformas", sub: "Calcula en segundos lo que ahorras con tu propio reparto." },
  { key: "panel", file: "servicio-panel-control-1200x900.png", chip: "PANEL DE CONTROL", color: C.cyan, title: "Todo tu negocio en una sola pantalla", sub: "Citas, facturas, conversaciones y repartos en directo." },
  { key: "web", file: "servicio-diseno-web-1200x900.png", chip: "DISEÑO WEB · ZARAGOZA", color: C.cyan, title: "Webs rápidas que captan clientes", sub: "SEO local, WhatsApp y Stella IA integrados desde el primer día." },
];

async function banners(shots) {
  const W = 1200, H = 900;
  for (const b of BANNERS) {
    const lines = wrap(b.title, 30);
    const titleSize = 58;
    const titleY = 190;
    const subY = titleY + (lines.length - 1) * 66 + 62;
    const shotTop = subY + 50;
    const base = svg(W, H, `${background(W, H)}
      ${chip(60, 56, b.chip, b.color, 20)}
      ${mark(1040, 50, 96)}
      <text font-family="${FONT}" font-weight="700" font-size="${titleSize}" letter-spacing="-1.5" fill="${C.text}">
        ${lines.map((l, i) => `<tspan x="60" y="${titleY + i * 66}">${esc(l)}</tspan>`).join("")}
      </text>
      <text x="60" y="${subY}" font-family="${FONT}" font-size="28" fill="${C.muted}">${esc(b.sub)}</text>
      ${shots?.[b.key] ? "" : `${mark(450, shotTop + 40, 300)}`}
      <text x="60" y="${H - 34}" font-family="${FONT}" font-size="22" font-weight="600" fill="${C.muted}">LOCALIS AI · Zaragoza · +34 640 80 92 38</text>`);

    const layers = [];
    if (shots?.[b.key]) {
      const maxH = H - shotTop - 80;
      const { framed, glow, w, h, pad } = await framedShot(shots[b.key], 1080, maxH, 26);
      const left = Math.round((W - w) / 2);
      layers.push({ input: glow, left: left - pad, top: shotTop - pad }, { input: framed, left, top: shotTop });
    }
    await save(b.file, await sharp(base).composite(layers).png().toBuffer());
  }
}

// ── Main ─────────────────────────────────────────────────────────────
console.log(`\nLOCALIS AI · recursos para Google Business (fuente: ${BASE_URL})\n`);
console.log("Capturas de la web:");
const shots = await captureShots();
console.log("\nComposiciones:");
await logos();
await ogImage();
await cover(shots);
await banners(shots);

writeFileSync(
  join(OUT, "README.md"),
  `# Recursos para Google Business Profile

Generados con \`npm run assets:google\` (script: \`scripts/google-business-assets.mjs\`).

| Archivo | Uso en Google Business | Medidas |
|---|---|---|
| logo-720x720.png | Logotipo (se muestra recortado en círculo) | 720×720 |
| logo-wordmark-1080x1080.png | Logo con nombre (redes sociales, Google Posts) | 1080×1080 |
| portada-2048x1152.png | Foto de portada | 2048×1152 (16:9) |
| servicio-*-1200x900.png | Fotos de servicios y publicaciones | 1200×900 (4:3) |
| ../og-image.png | Vista previa al compartir la web | 1200×630 |

Requisitos de Google: JPG o PNG, entre 10 KB y 5 MB, sin marcos ni texto excesivo en fotos
de producto. Para regenerar con capturas reales: \`npm run build && npm start\` y, en otra
terminal, \`npm run assets:google\` (o \`BASE_URL=https://tu-dominio npm run assets:google\`).
`
);
console.log(`\nListo → ${OUT}\n`);
