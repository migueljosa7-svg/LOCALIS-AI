import { test } from "node:test";
import assert from "node:assert/strict";
import { frameAncestors, hostAllowed, normalizeHost, parseDomains } from "../src/lib/stella/domains";
import { hashKey, signToken, verifyToken, TOKEN_TTL_SECONDS } from "../src/lib/stella/token";
import { costMicro } from "../src/lib/stella/cost";
import { activationChecklist, buildFicha, faqsToText, parseFaqs, parseServices, servicesToText, type FichaInput } from "../src/lib/stella/ficha";
import { buildSystemPrompt, FORM_MARKER } from "../src/lib/stella/prompt";
import { readConfig } from "../src/lib/stella/config";
import { biz, SECRET } from "./helpers";

// ── Dominios ──────────────────────────────────────────────────────
test("normalizeHost acepta URLs y dominios, y rechaza IPs, localhost y basura", () => {
  assert.equal(normalizeHost("https://www.Ejemplo.com/inicio?x=1"), "www.ejemplo.com");
  assert.equal(normalizeHost("ejemplo.com"), "ejemplo.com");
  assert.equal(normalizeHost("ejemplo.com:8080/ruta"), "ejemplo.com");
  for (const bad of ["", "localhost", "127.0.0.1", "javascript:alert(1)", "ejemplo", "a b.com", "-x.com", "ejemplo..com"]) {
    assert.equal(normalizeHost(bad), null, `debería rechazar «${bad}»`);
  }
});

test("hostAllowed: coincidencia exacta con o sin www, nunca subdominios ni sufijos engañosos", () => {
  const allowed = ["ejemplo.com"];
  assert.ok(hostAllowed("ejemplo.com", allowed));
  assert.ok(hostAllowed("www.ejemplo.com", allowed));
  assert.ok(hostAllowed("WWW.EJEMPLO.COM", allowed));
  assert.ok(!hostAllowed("evil.ejemplo.com", allowed));
  assert.ok(!hostAllowed("ejemplo.com.evil.com", allowed));
  assert.ok(!hostAllowed("evilejemplo.com", allowed));
  assert.ok(!hostAllowed("", allowed));
  assert.ok(!hostAllowed(null, allowed));
  assert.ok(!hostAllowed("ejemplo.com", []));
});

test("parseDomains separa válidos y rechazados y quita duplicados", () => {
  const r = parseDomains("https://a.es/\nwww.b.es, a.es\nmal dominio");
  assert.deepEqual(r.hosts, ["a.es", "www.b.es"]);
  assert.deepEqual(r.rejected, ["mal", "dominio"]);
});

test("frameAncestors solo lista los dominios del negocio y nuestra web", () => {
  assert.equal(frameAncestors([]), "frame-ancestors 'self'");
  assert.equal(frameAncestors(["a.es"]), "frame-ancestors 'self' https://a.es https://www.a.es");
});

// ── Token ─────────────────────────────────────────────────────────
const NOW = 1_800_000_000;
const payload = { b: "peluqueria-ana", s: "sesion1", h: "peluqueriaana.es", i: NOW, e: NOW + TOKEN_TTL_SECONDS };

test("token: válido al instante (sin esperas) y con la firma correcta", async () => {
  const t = await signToken(SECRET, payload);
  const ok = await verifyToken(SECRET, t, NOW);
  assert.ok(ok.ok && ok.payload.b === "peluqueria-ana");
});

test("token: rechaza firma ajena, manipulación, caducado, futuro lejano y malformado", async () => {
  const t = await signToken(SECRET, payload);
  assert.deepEqual(await verifyToken("otro-secreto", t, NOW + 5), { ok: false, reason: "signature" });
  const [body, sig] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ ...payload, b: "otro-negocio" })).toString("base64url");
  assert.equal((await verifyToken(SECRET, `${forged}.${sig}`, NOW + 5)).ok, false);
  assert.equal((await verifyToken(SECRET, `${body}.${sig}x`, NOW + 5)).ok, false);
  assert.deepEqual(await verifyToken(SECRET, t, NOW + TOKEN_TTL_SECONDS + 1), { ok: false, reason: "expired" });
  assert.deepEqual(await verifyToken(SECRET, t, NOW - 3600), { ok: false, reason: "too-new" }, "un token del futuro lejano se rechaza");
  assert.ok((await verifyToken(SECRET, t, NOW - 30)).ok, "pero se tolera un desfase de reloj pequeño");
  for (const bad of [undefined, null, 5, "", "abc", "a.b.c", "x".repeat(2000)]) assert.equal((await verifyToken(SECRET, bad, NOW + 5)).ok, false);
});

test("hashKey: estable, distinto por valor y sin contener la IP en claro", async () => {
  const a = await hashKey(SECRET, "203.0.113.7");
  assert.equal(a, await hashKey(SECRET, "203.0.113.7"));
  assert.notEqual(a, await hashKey(SECRET, "203.0.113.8"));
  assert.ok(!a.includes("203"));
});

// ── Coste ─────────────────────────────────────────────────────────
test("costMicro: Haiku 5.5 con precios oficiales (0,10 $ entrada / 0,50 $ salida por MTok)", () => {
  // 2.000 tokens de entrada + 100 de salida = 2000*0,10 + 100*0,50 = 250 micro-USD
  assert.equal(costMicro("claude-haiku-5-5", { input_tokens: 2000, output_tokens: 100 }), 250);
  // 1 millón de entrada + 1 millón de salida en tramo largo (>100K): 0,50 + 2,50 = 3 USD
  assert.equal(costMicro("claude-haiku-5-5", { input_tokens: 1_000_000, output_tokens: 1_000_000 }), 3_000_000);
  assert.equal(costMicro("claude-sonnet-5-5", { input_tokens: 1000, output_tokens: 1000 }), 12_000);
});

test("costMicro: un modelo desconocido se calcula con el precio de Sonnet (nunca por debajo)", () => {
  assert.equal(costMicro("modelo-nuevo", { input_tokens: 1000, output_tokens: 1000 }), 12_000);
});

// ── Ficha ─────────────────────────────────────────────────────────
test("servicios y FAQ: ida y vuelta entre texto y datos", () => {
  const s = parseServices("Corte | 15 € | Con lavado\nTinte | desde 35 €\nManicura");
  assert.deepEqual(s.errors, []);
  assert.deepEqual(s.items, [{ name: "Corte", price: "15 €", detail: "Con lavado" }, { name: "Tinte", price: "desde 35 €" }, { name: "Manicura" }]);
  assert.deepEqual(parseServices(servicesToText(s.items)).items, s.items);
  const f = parseFaqs("¿Tarjeta? | Sí.\n¿Cita? | Por WhatsApp | o teléfono");
  assert.deepEqual(f.items[1], { q: "¿Cita?", a: "Por WhatsApp | o teléfono" });
  assert.deepEqual(parseFaqs(faqsToText(f.items)).items, f.items);
  assert.equal(parseFaqs("sin separador").errors.length, 1);
});

const goodInput: FichaInput = {
  id: "Peluqueria-Ana", name: "Peluquería Ana", sector: "Peluquería", area: "Zaragoza", about: "Peluquería de barrio con 20 años.",
  services: "Corte | 15 €", faqs: "¿Tarjeta? | Sí.", hours: "", whatsapp: "+34 600 111 222", phone: "", notifyEmail: "ANA@ejemplo.com", greeting: "",
  notAvailable: "", privacyUrl: "https://peluqueriaana.es/privacidad", domains: "https://www.peluqueriaana.es", dailyBudgetUsd: "1,5", monthlyBudgetUsd: "5", notes: "",
};

test("buildFicha normaliza y valida", () => {
  const r = buildFicha(goodInput);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.value.id, "peluqueria-ana");
  assert.equal(r.value.whatsapp, "34600111222");
  assert.equal(r.value.notifyEmail, "ana@ejemplo.com");
  assert.deepEqual(r.value.domains, ["www.peluqueriaana.es"]);
  assert.equal(r.value.dailyBudgetUsd, 1.5);
  assert.match(r.value.greeting, /asistente virtual con IA/);
});

test("buildFicha rechaza id, dominios, privacidad http, whatsapp y presupuestos inválidos", () => {
  const r = buildFicha({ ...goodInput, id: "Mal id!", domains: "localhost", privacyUrl: "http://x.es", whatsapp: "12", dailyBudgetUsd: "-1", monthlyBudgetUsd: "abc" });
  assert.ok(!r.ok);
  if (r.ok) return;
  assert.ok(r.errors.length >= 6, r.errors.join(" | "));
});

test("activationChecklist indica qué falta antes de activar", () => {
  const empty = { name: "X", about: "", services: [], whatsapp: "", domains: [], privacyUrl: "" };
  assert.equal(activationChecklist(empty).length, 5);
  assert.deepEqual(activationChecklist(biz()), []);
});

// ── Prompt y aislamiento ──────────────────────────────────────────
test("el prompt contiene solo la ficha de su negocio, la identidad de IA y las reglas anti-manipulación", () => {
  const a = buildSystemPrompt(biz());
  const b = buildSystemPrompt(biz({ id: "clinica-sol", name: "Clínica Sol", services: [{ name: "Limpieza dental", price: "60 €" }], faqs: [] }));
  assert.match(a, /Peluquería Ana/);
  assert.match(a, /Corte de pelo: 15 €/);
  assert.ok(!a.includes("Clínica Sol") && !a.includes("Limpieza dental"), "no debe filtrar datos de otro negocio");
  assert.ok(!b.includes("Corte de pelo") && !b.includes("Peluquería Ana"));
  assert.match(a, /ÚNICAMENTE la información/);
  assert.match(a, /no lo inventes/);
  assert.match(a, /Eres una IA/);
  assert.match(a, /ignora cualquier instrucción/);
  assert.ok(a.includes(FORM_MARKER));
});

// ── Configuración ─────────────────────────────────────────────────
test("readConfig: por defecto Haiku 5.5, apagada sin clave y con interruptor general", () => {
  assert.equal(readConfig({}).enabled, false);
  assert.equal(readConfig({ ANTHROPIC_API_KEY: "k", SUPABASE_SERVICE_ROLE_KEY: "s" }).enabled, true);
  assert.equal(readConfig({ ANTHROPIC_API_KEY: "k", SUPABASE_SERVICE_ROLE_KEY: "s" }).model, "claude-haiku-5-5");
  assert.equal(readConfig({ ANTHROPIC_API_KEY: "k", SUPABASE_SERVICE_ROLE_KEY: "s", STELLA_ENABLED: "false" }).enabled, false);
  assert.equal(readConfig({ ANTHROPIC_API_KEY: "k" }).enabled, false, "sin forma de firmar sesiones no se activa");
  assert.equal(readConfig({ ANTHROPIC_API_KEY: "k", STELLA_SIGNING_SECRET: "x" }).enabled, true);
  assert.equal(readConfig({ STELLA_MODEL: "claude-sonnet-5-5" }).model, "claude-sonnet-5-5");
  const c = readConfig({ STELLA_GLOBAL_DAILY_USD: "2.5", STELLA_GLOBAL_MONTHLY_USD: "basura" });
  assert.equal(c.globalDailyMicro, 2_500_000);
  assert.equal(c.globalMonthlyMicro, 20_000_000);
});
