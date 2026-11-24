import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SECTORS, SECTION_DEFS, applyTemplate, buttonPending, changeSector, defaultConfig, enabledSections, moveSection, reorderSection, sectionsFor, toggleSection,
  TEMPLATES, PALETTES, type SiteConfig,
} from "../src/lib/builder/model";
import { sanitizeConfig, sniffImage, cleanUrl, uploadIds } from "../src/lib/builder/validate";
import { estimate, clampPages } from "../src/lib/builder/estimate";
import { summarize, techBrief } from "../src/lib/builder/summary";
import { contrastRatio } from "../src/lib/builder/contrast";
import { sampleSrc } from "../src/lib/builder/images";
import { TARIFAS } from "../src/lib/pricing";
import { dropMissingUploads, handleDesignRequest, type RequestDeps } from "../src/lib/builder/request";

// ── Modelo ────────────────────────────────────────────────────────
test("cada tipo de negocio genera una configuración válida con cabecera primero y pie al final", () => {
  for (const s of SECTORS) {
    const c = defaultConfig(s.id);
    const allowed = sectionsFor(s.id);
    assert.ok(c.sections.every((x) => allowed.includes(x.id)), `${s.id}: solo secciones permitidas`);
    assert.equal(c.sections[0].id, "header");
    assert.equal(c.sections.at(-1)?.id, "footer");
    assert.ok(enabledSections(c).includes("hero"));
    assert.ok(c.buttons.length >= 1 && c.pages >= 4 && c.pages <= 10);
    assert.deepEqual(sanitizeConfig(c)?.sections.map((x) => x.id), c.sections.map((x) => x.id), `${s.id}: sanear no cambia una config válida`);
  }
});

test("no todas las secciones existen para todos los negocios (p. ej. un profesional no tiene «productos» ni «equipo»)", () => {
  assert.ok(!sectionsFor("profesional").includes("products"));
  assert.ok(!sectionsFor("profesional").includes("team"));
  assert.ok(sectionsFor("restaurante").includes("products"));
});

test("aplicar una plantilla cambia el diseño pero conserva negocio, botones e imágenes", () => {
  let c = defaultConfig("comercio");
  c = { ...c, business: { ...c.business, name: "Frutería Pepe", phone: "976111222" }, buttons: [...c.buttons] };
  const before = JSON.stringify(c.buttons);
  const n = applyTemplate(c, "elegante");
  assert.equal(n.template, "elegante");
  assert.equal(n.theme.fontHeading, "playfair");
  assert.equal(n.business.name, "Frutería Pepe");
  assert.equal(JSON.stringify(n.buttons), before);
  assert.deepEqual(n.images, c.images);
  assert.equal(TEMPLATES.length, 8);
  assert.equal(PALETTES.length, 7);
});

test("cambiar de tipo de negocio no pierde los datos escritos", () => {
  let c = defaultConfig("restaurante");
  c = { ...c, business: { ...c.business, name: "Casa Luis", city: "Zaragoza" } };
  const n = changeSector(c, "profesional");
  assert.equal(n.business.sector, "profesional");
  assert.equal(n.business.name, "Casa Luis");
  assert.ok(n.sections.every((s) => sectionsFor("profesional").includes(s.id)));
});

test("mover secciones: arriba/abajo, arrastrar, y la cabecera y el pie nunca se desplazan", () => {
  const c = defaultConfig("otro");
  const ids = (s: SiteConfig["sections"]) => s.map((x) => x.id);
  const first = c.sections[1].id;
  const second = c.sections[2].id;
  assert.deepEqual(ids(moveSection(c.sections, first, 1)).slice(1, 3), [second, first]);
  assert.deepEqual(ids(moveSection(c.sections, "header", 1)), ids(c.sections), "la cabecera no se mueve");
  assert.deepEqual(ids(moveSection(c.sections, "footer", -1)), ids(c.sections), "el pie no se mueve");
  assert.deepEqual(ids(moveSection(c.sections, first, -1)), ids(c.sections), "no se puede pasar por encima de la cabecera");
  const last = c.sections.at(-2)!.id;
  assert.deepEqual(ids(moveSection(c.sections, last, 1)), ids(c.sections), "no se puede pasar por debajo del pie");
  const dragged = ids(reorderSection(c.sections, last, first));
  assert.equal(dragged[1], last);
  assert.equal(dragged[0], "header");
  assert.equal(dragged.at(-1), "footer");
  assert.equal(new Set(dragged).size, dragged.length);
  assert.ok(toggleSection(c.sections, "hero").find((s) => s.id === "hero")?.enabled === !c.sections.find((s) => s.id === "hero")?.enabled);
});

test("un botón sin teléfono, WhatsApp o enlace queda «pendiente de configuración» (no se inventa nada)", () => {
  const c = defaultConfig("taller");
  const mk = (action: "whatsapp" | "call" | "link" | "form", url = "") => ({ ...c.buttons[0], action, url });
  assert.match(buttonPending(mk("whatsapp"), c.business) ?? "", /WhatsApp/);
  assert.match(buttonPending(mk("call"), c.business) ?? "", /teléfono/);
  assert.match(buttonPending(mk("link"), c.business) ?? "", /enlace/);
  assert.equal(buttonPending(mk("form"), c.business), null);
  assert.equal(buttonPending(mk("whatsapp"), { ...c.business, whatsapp: "600111222" }), null);
  assert.equal(buttonPending(mk("link", "https://ejemplo.com"), c.business), null);
  assert.match(buttonPending(mk("link", "javascript:alert(1)"), c.business) ?? "", /enlace/);
});

// ── Validación (todo lo que llega del navegador es hostil) ────────
test("sanitizeConfig rechaza lo que no es un objeto y sanea valores hostiles", () => {
  assert.equal(sanitizeConfig(null), null);
  assert.equal(sanitizeConfig("hola"), null);
  assert.equal(sanitizeConfig([1, 2]), null);
  const hostile = {
    template: "no-existe",
    pages: 9999,
    business: { name: "<script>alert(1)</script>".repeat(40), sector: "hackeo", email: "A@B.COM", services: [{ name: "x".repeat(500) }, { name: "" }, 5] },
    theme: { colors: { primary: "red; background:url(javascript:1)", background: "#12345" , text: "#ABCDEF" }, fontHeading: "comic", radius: "enorme" },
    sections: [{ id: "hackeo", enabled: true }, { id: "hero", enabled: true }, { id: "hero", enabled: true }, { id: "products", enabled: true }],
    buttons: Array.from({ length: 30 }, (_, i) => ({ id: "<b>", label: `Botón ${i}`, action: "eval", url: "javascript:alert(1)", color: "url(x)", positions: ["header", "techo", "header"] })),
    images: [{ id: "s1" }, { id: "../../etc/passwd" }, { id: "u9" }, { id: "u1", name: "<img onerror=x>" }],
    heroImage: "../x",
    gallery: { ids: ["s1", "zzz", "u1", "u1"] },
    carousel: { style: "volar" },
    comments: "c".repeat(100000),
  };
  const c = sanitizeConfig(hostile)!;
  assert.ok(c);
  assert.equal(c.template, "moderno");
  assert.equal(c.pages, 10);
  assert.equal(c.business.sector, "otro");
  assert.ok(c.business.name.length <= 120);
  assert.equal(c.business.email, "a@b.com");
  assert.equal(c.business.services.length, 1);
  assert.equal(c.business.services[0].name.length, 80);
  assert.match(c.theme.colors.primary, /^#[0-9a-f]{6}$/);
  assert.equal(c.theme.colors.text, "#abcdef");
  assert.notEqual(c.theme.colors.background, "#12345");
  assert.ok(["playfair", "lora", "poppins", "montserrat", "inter", "sistema"].includes(c.theme.fontHeading), "tipografía de la lista blanca");
  assert.ok(["recto", "suave", "redondo"].includes(c.theme.radius));
  assert.deepEqual(c.sections.filter((s) => s.id === "hero").length, 1);
  assert.ok(!c.sections.some((s) => (s.id as string) === "hackeo"));
  assert.ok(c.buttons.length <= 8);
  assert.ok(c.buttons.every((b) => b.url === "" && ["whatsapp", "call", "form", "contact", "link", "section"].includes(b.action)));
  assert.ok(c.buttons.every((b) => b.positions.every((p) => ["header", "hero", "afterServices", "beforeFooter", "sticky"].includes(p)) && new Set(b.positions).size === b.positions.length));
  assert.ok(c.buttons.every((b) => b.color === "button" || /^#[0-9a-f]{6}$/.test(b.color)));
  assert.deepEqual(c.images.map((i) => i.id), ["s1", "u1"]);
  assert.equal(c.heroImage, null);
  assert.ok(c.gallery.ids.every((id) => c.images.some((i) => i.id === id)));
  assert.equal(c.carousel.style, "deslizar");
  assert.equal(c.comments.length, 1500);
});

test("cleanUrl solo admite https:// sin caracteres peligrosos", () => {
  assert.equal(cleanUrl("https://ejemplo.com/a?b=1"), "https://ejemplo.com/a?b=1");
  for (const bad of ["http://x.com", "javascript:alert(1)", "data:text/html,x", "//x.com", "https://x.com/<script>", 'https://x.com/" onclick=', "https://a b.com", ""]) assert.equal(cleanUrl(bad), "", bad);
});

test("sniffImage reconoce JPG, PNG y WebP por su contenido real y rechaza el resto", () => {
  const pad = (a: number[]) => new Uint8Array([...a, ...new Array(20).fill(0)]);
  assert.equal(sniffImage(pad([0xff, 0xd8, 0xff, 0xe0]))?.ext, "jpg");
  assert.equal(sniffImage(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.ext, "png");
  assert.equal(sniffImage(new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50, 0, 0]))?.ext, "webp");
  assert.equal(sniffImage(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>")), null);
  assert.equal(sniffImage(new TextEncoder().encode("<html><script>alert(1)</script></html>")), null);
  assert.equal(sniffImage(pad([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])), null, "GIF no admitido");
  assert.equal(sniffImage(pad([0x4d, 0x5a])), null, "ejecutable");
  assert.equal(sniffImage(new Uint8Array([0xff, 0xd8])), null, "demasiado corto");
});

test("las imágenes de ejemplo se generan en SVG propio y los ids desconocidos no resuelven", () => {
  assert.match(sampleSrc("s1") ?? "", /^data:image\/svg\+xml/);
  assert.ok(sampleSrc("s12"));
  assert.equal(sampleSrc("s13"), null);
  assert.equal(sampleSrc("u1"), null);
});

// ── Presupuesto ───────────────────────────────────────────────────
test("estimación: usa solo las tarifas de referencia (Web Esencial 390 € IVA incluido hasta 5 páginas; Web Pro 590 € + IVA hasta 10) y no inventa ningún precio", () => {
  const c = defaultConfig("otro");
  for (const [pages, expected] of [[4, 390], [5, 390], [6, 590], [8, 590], [10, 590]] as const) {
    const e = estimate({ ...c, pages });
    assert.equal(e.definedTotal, expected, `${pages} páginas`);
    assert.equal(e.lines[0].amount, expected);
    assert.equal(e.priceLabel, expected === 390 ? "390 € IVA incluido" : "590 € + IVA");
  }
  assert.equal(TARIFAS.esencial.price, 390);
  assert.equal(TARIFAS.pro.price, 590);
  assert.equal(TARIFAS.mantenimientoPorPagina, 15);
  assert.equal(clampPages(1), 4);
  assert.equal(clampPages(99), TARIFAS.pro.pages);
  const mant = estimate({ ...c, pages: 5 }).lines.find((l) => /Mantenimiento/.test(l.label));
  assert.ok(mant && mant.kind === "opcional" && mant.amount === undefined && /75 €/.test(mant.detail ?? ""), "el mantenimiento es opcional, con referencia 15 €/página y sin importe cerrado");
  const e = estimate({ ...c, wants: { stella: true, interests: ["tienda", "reservas"] } });
  const withAmount = e.lines.filter((l) => l.amount !== undefined);
  assert.ok(withAmount.every((l) => l.kind === "definido"), "solo las líneas «definido» llevan importe");
  assert.ok(e.lines.some((l) => l.kind === "opcional" && /Stella/.test(l.label)));
  assert.equal(e.lines.filter((l) => l.kind === "no-disponible").length, 2);
  assert.ok(e.lines.some((l) => l.kind === "valorar"));
  assert.equal(e.definedTotal, estimate({ ...c, wants: { stella: false, interests: [] } }).definedTotal, "Stella y los intereses no cambian el precio base");
});

// ── Resúmenes ─────────────────────────────────────────────────────
test("resumen del lead cabe en su campo y el briefing contiene las decisiones de diseño", () => {
  let c = defaultConfig("peluqueria");
  c = { ...c, business: { ...c.business, name: "Peluquería Ana", whatsapp: "", phone: "600111222", goal: "Conseguir reservas o citas" }, comments: "Me gusta el rosa" };
  const s = summarize(c, "https://x.es/admin/diseno/abc");
  assert.ok(s.length <= 1200);
  assert.match(s, /Ver diseño completo: https:\/\/x\.es\/admin\/diseno\/abc/);
  const t = techBrief(c);
  assert.ok(t.length <= 8000);
  for (const needle of ["Peluquería Ana", c.theme.colors.primary, "Secciones en orden", "Botones:", "PENDIENTE: Falta tu WhatsApp", "Me gusta el rosa", "Presupuesto orientativo", "no vinculante"]) assert.ok(t.includes(needle), needle);
});

test("contraste: negro sobre blanco 21:1; gris claro sobre blanco insuficiente", () => {
  assert.ok(Math.abs(contrastRatio("#000000", "#ffffff") - 21) < 0.01);
  assert.ok(contrastRatio("#cccccc", "#ffffff") < 4.5);
});

// ── «Quiero esta web»: núcleo de la solicitud ─────────────────────
const HOST = "localis-ai-one.vercel.app";
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(64).fill(7)]);

function fakeDeps(over: Partial<RequestDeps> = {}) {
  const log = { uploads: [] as string[], designs: [] as unknown[], leads: [] as Record<string, string>[], notified: 0, linked: [] as string[], marked: 0 };
  const deps: RequestDeps = {
    hashIp: async (ip) => `h-${ip}`,
    countRecentByIp: async () => 0,
    uploadImage: async (path) => (log.uploads.push(path), true),
    insertDesign: async (row) => (log.designs.push(row), { ok: true }),
    insertLead: async (l) => (log.leads.push(l), { ok: true, id: "lead-1" }),
    notify: async () => (log.notified++, { notified: true }),
    markNotified: async () => void log.marked++,
    linkLead: async (_d, l) => void log.linked.push(l),
    newId: () => "11111111-2222-3333-4444-555555555555",
    siteUrl: "https://localis-ai-one.vercel.app",
    ...over,
  };
  return { deps, log };
}

function formWith(cfg: unknown, contact: Record<string, unknown> = {}, files: Record<string, Uint8Array> = {}) {
  const f = new FormData();
  f.set("config", JSON.stringify(cfg));
  f.set("contact", JSON.stringify({ businessName: "Peluquería Ana", contactName: "Ana", phone: "600 111 222", email: "ana@ejemplo.com", consent: true, website: "", ...contact }));
  for (const [k, v] of Object.entries(files)) f.set(`file_${k}`, new File([v as BlobPart], k, { type: "image/png" }));
  return f;
}
const incoming = (form: FormData, over = {}) => ({ host: HOST, origin: `https://${HOST}`, contentLength: 1000, ip: "203.0.113.5", form, ...over });
const withUpload = (): SiteConfig => {
  const c = defaultConfig("peluqueria");
  return { ...c, images: [...c.images, { id: "u1", kind: "upload", name: "mi-local.png" }], heroImage: "u1", gallery: { ...c.gallery, ids: ["u1", "s2"] }, carousel: { ...c.carousel, ids: ["s1", "u1"] } };
};

test("solicitud: guarda diseño, sube la imagen, crea el lead de «disena-tu-web» con enlace al panel y avisa", async () => {
  const { deps, log } = fakeDeps();
  const r = await handleDesignRequest(deps, incoming(formWith(withUpload(), {}, { u1: PNG })));
  assert.equal(r.status, 200);
  assert.equal(r.body.reference, "11111111-2222-3333-4444-555555555555");
  assert.deepEqual(log.uploads, ["11111111-2222-3333-4444-555555555555/u1.png"]);
  assert.equal(log.designs.length, 1);
  const lead = log.leads[0];
  assert.equal(lead.source, "disena-tu-web");
  assert.match(lead.details, /\/admin\/diseno\/11111111-2222-3333-4444-555555555555/);
  assert.match(lead.prompt, /BRIEFING DE CONSTRUCCIÓN/);
  assert.ok(lead.details.length <= 1200 && lead.prompt.length <= 8000);
  assert.equal(log.notified, 1);
  assert.deepEqual(log.linked, ["lead-1"]);
  assert.equal(log.marked, 1);
});

test("solicitud: origen ajeno, tamaño excesivo, datos inválidos y falta de consentimiento se rechazan sin guardar nada", async () => {
  const { deps, log } = fakeDeps();
  const ok = formWith(defaultConfig("otro"));
  assert.equal((await handleDesignRequest(deps, incoming(ok, { origin: "https://malo.com" }))).status, 403);
  assert.equal((await handleDesignRequest(deps, incoming(ok, { origin: null }))).status, 403);
  assert.equal((await handleDesignRequest(deps, incoming(ok, { contentLength: 9_000_000 }))).status, 413);
  assert.equal((await handleDesignRequest(deps, incoming(formWith(defaultConfig("otro"), { consent: false })))).status, 422);
  assert.equal((await handleDesignRequest(deps, incoming(formWith(defaultConfig("otro"), { phone: "abc" })))).status, 422);
  assert.equal((await handleDesignRequest(deps, incoming(formWith(defaultConfig("otro"), { email: "sin-arroba" })))).status, 422);
  assert.equal((await handleDesignRequest(deps, incoming(formWith("no-es-objeto" as never)))).status, 400);
  const bad = new FormData();
  bad.set("config", "{no es json");
  bad.set("contact", "{}");
  assert.equal((await handleDesignRequest(deps, incoming(bad))).status, 400);
  assert.equal(log.leads.length + log.designs.length + log.uploads.length, 0);
});

test("solicitud: trampa anti-robots devuelve éxito falso sin guardar; el límite por hora de la base de datos corta con 429", async () => {
  const a = fakeDeps();
  const bot = await handleDesignRequest(a.deps, incoming(formWith(defaultConfig("otro"), { website: "http://spam" })));
  assert.equal(bot.status, 200);
  assert.equal(a.log.leads.length, 0);
  const b = fakeDeps({ countRecentByIp: async () => 5 });
  const r = await handleDesignRequest(b.deps, incoming(formWith(defaultConfig("otro"))));
  assert.equal(r.status, 429);
  assert.equal(b.log.leads.length + b.log.designs.length, 0);
  const c = fakeDeps({ countRecentByIp: async () => null });
  assert.equal((await handleDesignRequest(c.deps, incoming(formWith(defaultConfig("otro"))))).status, 200, "si no se puede contar, no se bloquea a un cliente real");
});

test("solicitud: un archivo que no es imagen real (aunque se llame .png) se rechaza y no se sube", async () => {
  const { deps, log } = fakeDeps();
  const evil = new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>");
  const r = await handleDesignRequest(deps, incoming(formWith(withUpload(), {}, { u1: evil })));
  assert.equal(r.status, 422);
  assert.equal(log.uploads.length, 0);
  assert.equal(log.leads.length, 0);
  const big = new Uint8Array(1_300_000);
  big.set(PNG);
  assert.equal((await handleDesignRequest(deps, incoming(formWith(withUpload(), {}, { u1: big })))).status, 413);
});

test("solicitud: si la imagen no llega o el almacén falla, el diseño se guarda sin ella y se avisa", async () => {
  const a = fakeDeps();
  const r1 = await handleDesignRequest(a.deps, incoming(formWith(withUpload(), {}, {})));
  assert.equal(r1.status, 200);
  assert.equal(r1.body.lostImages, 1);
  const saved = a.log.designs[0] as { config: SiteConfig };
  assert.ok(!saved.config.images.some((i) => i.id === "u1") && saved.config.heroImage === null);
  assert.match(a.log.leads[0].details, /no se pudieron guardar/);
  const b = fakeDeps({ uploadImage: async () => false });
  const r2 = await handleDesignRequest(b.deps, incoming(formWith(withUpload(), {}, { u1: PNG })));
  assert.equal(r2.body.savedImages, 0);
});

test("solicitud: degradación — sin tabla de diseños el lead se crea igualmente con el briefing completo; sin nada → 503", async () => {
  const a = fakeDeps({ insertDesign: async () => ({ ok: false }) });
  const r = await handleDesignRequest(a.deps, incoming(formWith(defaultConfig("taller"))));
  assert.equal(r.status, 200);
  assert.match(a.log.leads[0].details, /no se guardó en la base de datos/);
  assert.match(a.log.leads[0].prompt, /Secciones en orden/);
  assert.equal(a.log.linked.length, 0);
  const b = fakeDeps({ insertDesign: async () => ({ ok: false }), insertLead: async () => ({ ok: false }), notify: async () => ({ notified: false }) });
  assert.equal((await handleDesignRequest(b.deps, incoming(formWith(defaultConfig("taller"))))).status, 503);
});

test("dropMissingUploads quita la imagen y todos sus usos", () => {
  const c = dropMissingUploads(withUpload(), new Set());
  assert.deepEqual(uploadIds(c), []);
  assert.equal(c.heroImage, null);
  assert.ok(!c.gallery.ids.includes("u1") && !c.carousel.ids.includes("u1"));
  assert.equal(SECTION_DEFS.header.fixed, "start");
});
