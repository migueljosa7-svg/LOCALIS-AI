import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanReply, handleChat, handleContact, parseHistory, type ChatDeps, type ContactDeps, type IncomingRequest } from "../src/lib/stella/chat";
import { authorizeEmbed, issueTestToken } from "../src/lib/stella/embed";
import { signToken, verifyToken } from "../src/lib/stella/token";
import { biz, config, fakeModel, FakeStore, SECRET } from "./helpers";

const NOW_MS = 1_800_000_000_000;
const NOW = NOW_MS / 1000;
const HOST = "localis-ai-one.vercel.app";
const clock = () => NOW_MS + 10_000; // 10 s después de emitir el token

async function tokenFor(b = "peluqueria-ana", extra: Record<string, unknown> = {}) {
  return signToken(SECRET, { b, s: "ses1", h: "peluqueriaana.es", i: NOW, e: NOW + 3600, ...extra });
}
const req = (body: unknown, over: Partial<IncomingRequest> = {}): IncomingRequest => ({
  host: HOST, origin: `https://${HOST}`, ip: "203.0.113.7", bodyText: typeof body === "string" ? body : JSON.stringify(body), ...over,
});
const msgs = [{ role: "user", content: "¿Cuánto cuesta un corte?" }];

function setup(opts: { store?: FakeStore; model?: ReturnType<typeof fakeModel> } = {}) {
  const store = opts.store ?? new FakeStore(biz(), biz({ id: "clinica-sol", name: "Clínica Sol", services: [{ name: "Limpieza dental", price: "60 €" }], domains: ["clinicasol.es"] }));
  const model = opts.model ?? fakeModel();
  const deps: ChatDeps = { store, config: config(), model: () => model, now: clock };
  return { store, model, deps };
}

// ── Autenticación y aislamiento ───────────────────────────────────
test("chat: rechaza peticiones sin Origin propio, sin token o con token manipulado — sin llamar al modelo", async () => {
  const { deps, model } = setup();
  const good = { token: await tokenFor(), messages: msgs };
  assert.equal((await handleChat(deps, req(good, { origin: "https://malo.com" }))).status, 403);
  assert.equal((await handleChat(deps, req(good, { origin: null }))).status, 403);
  assert.equal((await handleChat(deps, req({ messages: msgs }))).status, 401);
  assert.equal((await handleChat(deps, req({ token: "a.b", messages: msgs }))).status, 401);
  const t = await tokenFor();
  assert.equal((await handleChat(deps, req({ token: t.slice(0, -2) + "xx", messages: msgs }))).status, 401);
  assert.equal((await handleChat(deps, req("no es json"))).status, 400);
  assert.equal((await handleChat(deps, req("x".repeat(50_000)))).status, 400);
  assert.equal(model.calls.length, 0, "ninguna petición rechazada debe gastar IA");
});

test("chat: token caducado o recién emitido (<1 s) se rechaza", async () => {
  const { store, model } = setup();
  const old = await signToken(SECRET, { b: "peluqueria-ana", s: "s", h: "x", i: NOW - 7200, e: NOW - 3600 });
  assert.equal((await handleChat({ store, config: config(), model: () => model, now: clock }, req({ token: old, messages: msgs }))).status, 401);
  const fresh = await tokenFor();
  assert.equal((await handleChat({ store, config: config(), model: () => model, now: () => NOW_MS }, req({ token: fresh, messages: msgs }))).status, 401);
});

test("chat: el negocio sale del token; pedir otro negocio en el cuerpo se rechaza y no cruza datos", async () => {
  const { deps, model, store } = setup();
  const r = await handleChat(deps, req({ token: await tokenFor("peluqueria-ana"), business: "clinica-sol", messages: msgs }));
  assert.equal(r.status, 400);
  assert.equal(model.calls.length, 0);
  // Con el token de la peluquería, el modelo recibe SOLO la ficha de la peluquería.
  const ok = await handleChat(deps, req({ token: await tokenFor("peluqueria-ana"), messages: msgs }));
  assert.equal(ok.status, 200);
  const system = String(model.calls[0].system);
  assert.match(system, /Peluquería Ana/);
  assert.ok(!system.includes("Clínica Sol") && !system.includes("Limpieza dental"));
  assert.equal(store.gateCalls[0].businessId, "peluqueria-ana");
});

test("chat: negocio inexistente → 404, desactivado → 403, y el token de prueba del panel sí vale", async () => {
  const { deps, model, store } = setup();
  assert.equal((await handleChat(deps, req({ token: await tokenFor("no-existe"), messages: msgs }))).status, 404);
  store.businesses.set("peluqueria-ana", biz({ active: false }));
  assert.equal((await handleChat(deps, req({ token: await tokenFor(), messages: msgs }))).status, 403);
  assert.equal(model.calls.length, 0);
  const test = await handleChat(deps, req({ token: await tokenFor("peluqueria-ana", { t: 1 }), messages: msgs }));
  assert.equal(test.status, 200);
});

test("chat: Stella apagada (sin clave o interruptor) → 503 sin tocar nada", async () => {
  const { store, model } = setup();
  const r = await handleChat({ store, config: config({ enabled: false }), model: () => model, now: clock }, req({ token: await tokenFor(), messages: msgs }));
  assert.equal(r.status, 503);
  assert.equal(model.calls.length, 0);
  assert.equal(store.gateCalls.length, 0);
});

// ── Límites y presupuestos ────────────────────────────────────────
test("chat: límites persistentes superados → 429 y el modelo NO se llama; la IP no se envía en claro", async () => {
  const { deps, model, store } = setup();
  store.gateResult = { ok: false, reason: "rate:ip" };
  const r = await handleChat(deps, req({ token: await tokenFor(), messages: msgs }));
  assert.equal(r.status, 429);
  assert.equal(model.calls.length, 0);
  const rates = store.gateCalls[0].rates;
  assert.deepEqual(rates.map((x) => x.name).sort(), ["burst", "business", "global", "ip", "session"]);
  assert.ok(!JSON.stringify(rates).includes("203.0.113.7"), "la IP no debe guardarse en claro");
});

test("chat: presupuesto de negocio o global agotado → 503 con salida a WhatsApp y sin gasto", async () => {
  const { deps, model, store } = setup();
  for (const reason of ["budget:business-day", "budget:business-month", "budget:global-day", "budget:global-month", "rate:global", "unavailable"]) {
    store.gateResult = { ok: false, reason };
    const r = await handleChat(deps, req({ token: await tokenFor(), messages: msgs }));
    assert.equal(r.status, 503, reason);
    assert.equal(r.body.fallback, true);
  }
  assert.equal(model.calls.length, 0);
  assert.equal(store.gateCalls[0].bizDayMicro, 1_000_000);
  assert.equal(store.gateCalls[0].bizMonthMicro, 5_000_000);
  assert.equal(store.gateCalls[0].globalDayMicro, 3_000_000);
});

test("chat: un tope de gasto a 0 significa «nada de gasto», nunca «sin límite»", async () => {
  const store = new FakeStore(biz({ dailyBudgetUsd: 0, monthlyBudgetUsd: 0 }));
  const { deps } = setup({ store });
  await handleChat(deps, req({ token: await tokenFor(), messages: msgs }));
  assert.equal(store.gateCalls[0].bizDayMicro, 1);
  assert.equal(store.gateCalls[0].bizMonthMicro, 1);
});

// ── Respuesta y coste ─────────────────────────────────────────────
test("chat: respuesta correcta, con Haiku, esfuerzo bajo, marca de formulario y consumo registrado", async () => {
  const model = fakeModel({ text: `Puedes dejar tus datos. ${"[[FORMULARIO]]"}`, usage: { input_tokens: 2000, output_tokens: 100 } });
  const { deps, store } = setup({ model });
  const r = await handleChat(deps, req({ token: await tokenFor(), messages: msgs }));
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true, reply: "Puedes dejar tus datos.", showForm: true });
  const call = model.calls[0];
  assert.equal(call.model, "claude-haiku-5-5");
  assert.equal(call.max_tokens, 1500);
  assert.deepEqual(call.output_config, { effort: "low" });
  assert.deepEqual(store.usage[0], { businessId: "peluqueria-ana", messages: 1, inputTokens: 2000, outputTokens: 100, costMicro: 250, errors: 0, contacts: 0 });
});

test("chat: un fallo del modelo → 502 con WhatsApp, error contabilizado y sin contenido en los registros", async () => {
  const logged: string[] = [];
  const orig = console.error;
  console.error = (...a: unknown[]) => void logged.push(a.join(" "));
  try {
    const model = fakeModel({ error: Object.assign(new Error("secreto: mi teléfono es 600123456"), { status: 529 }) });
    const { deps, store } = setup({ model });
    const r = await handleChat(deps, req({ token: await tokenFor(), messages: [{ role: "user", content: "mi DNI es 12345678Z" }] }));
    assert.equal(r.status, 502);
    assert.equal(r.body.fallback, true);
    assert.equal(store.usage[0].errors, 1);
    const all = logged.join("\n");
    assert.match(all, /529/);
    assert.ok(!all.includes("12345678Z") && !all.includes("600123456"), "los registros no deben contener la conversación ni el mensaje de error");
  } finally {
    console.error = orig;
  }
});

test("chat: rechazo del modelo (refusal) se resuelve con un mensaje seguro", async () => {
  const { deps } = setup({ model: fakeModel({ stop: "refusal", text: "" }) });
  const r = await handleChat(deps, req({ token: await tokenFor(), messages: msgs }));
  assert.equal(r.status, 200);
  assert.match(String(r.body.reply), /Prefiero no responder/);
});

test("parseHistory: valida estructura, tamaños y que termine con el visitante", () => {
  assert.equal(parseHistory([]), null);
  assert.equal(parseHistory("hola"), null);
  assert.equal(parseHistory([{ role: "system", content: "x" }]), null, "no se aceptan mensajes de sistema desde el navegador");
  assert.equal(parseHistory([{ role: "user", content: "a" }, { role: "assistant", content: "b" }]), null);
  assert.equal(parseHistory(Array.from({ length: 25 }, () => ({ role: "user", content: "a" }))), null);
  const big = (role: "user" | "assistant", n: number) => ({ role, content: "x".repeat(n) });
  assert.equal(parseHistory([big("user", 1000), big("assistant", 4000), big("user", 1000), big("assistant", 4000), big("user", 1000), big("assistant", 4000), big("user", 1000)]), null, "historial demasiado largo");
  const h = parseHistory([{ role: "assistant", content: "hola" }, { role: "user", content: "x".repeat(5000) }]);
  assert.equal(h?.length, 1);
  assert.equal(h?.[0].content.length, 1000);
});

test("cleanReply: quita etiquetas internas y acota la longitud", () => {
  assert.deepEqual(cleanReply("<thinking>plan</thinking>Hola"), { reply: "planHola", showForm: false });
  assert.ok(cleanReply("a ".repeat(2000)).reply.length <= 1501);
});

// ── Contacto con consentimiento ───────────────────────────────────
function contactSetup() {
  const store = new FakeStore(biz());
  const notified: unknown[] = [];
  const deps: ContactDeps = {
    store, config: config(), model: () => fakeModel(), now: clock,
    notify: async (b, c) => (notified.push({ b: b.id, c }), true),
    validatePhone: (v) => (/^\+?\d[\d\s]{8,}$/.test(v) ? null : "Teléfono no válido"),
    validateEmail: (v) => (/^[^@\s]+@[^@\s]+\.\w+$/.test(v) ? null : "Email no válido"),
  };
  return { store, deps, notified };
}
const form = { nombre: "María López", telefono: "600 123 456", email: "maria@ejemplo.com", mensaje: "Quiero cita el jueves", consentimiento: true };

test("contacto: sin casilla de consentimiento NO se guarda nada", async () => {
  const { deps, store } = contactSetup();
  const r = await handleContact(deps, req({ token: await tokenFor(), ...form, consentimiento: false }));
  assert.equal(r.status, 422);
  assert.equal(store.contacts.length, 0);
  assert.equal((await handleContact(deps, req({ token: await tokenFor(), ...form, consentimiento: "true" }))).status, 422);
});

test("contacto: guardado con origen del negocio, registro del consentimiento y aviso por email", async () => {
  const { deps, store, notified } = contactSetup();
  const r = await handleContact(deps, req({ token: await tokenFor(), ...form }));
  assert.equal(r.status, 200);
  assert.equal(store.contacts.length, 1);
  const lead = store.contacts[0];
  assert.equal(lead.source, "stella:peluqueria-ana");
  assert.equal(lead.businessName, "Peluquería Ana");
  assert.match(lead.details ?? "", /Consentimiento: aceptado el 2027-/);
  assert.match(lead.details ?? "", /Quiero cita el jueves/);
  assert.equal(notified.length, 1);
  assert.equal(store.usage[0].contacts, 1);
});

test("contacto: validaciones, trampa anti-robots, prueba del panel y límites", async () => {
  const { deps, store, notified } = contactSetup();
  assert.equal((await handleContact(deps, req({ token: await tokenFor(), ...form, nombre: "A" }))).status, 422);
  assert.equal((await handleContact(deps, req({ token: await tokenFor(), ...form, telefono: "abc" }))).status, 422);
  assert.equal((await handleContact(deps, req({ token: await tokenFor(), ...form, email: "mal" }))).status, 422);
  const bot = await handleContact(deps, req({ token: await tokenFor(), ...form, website: "http://spam" }));
  assert.equal(bot.status, 200, "el robot cree que ha funcionado");
  const test = await handleContact(deps, req({ token: await tokenFor("peluqueria-ana", { t: 1 }), ...form }));
  assert.deepEqual(test.body, { ok: true, test: true });
  assert.equal(store.contacts.length, 0);
  assert.equal(notified.length, 0);
  store.gateResult = { ok: false, reason: "rate:ip" };
  assert.equal((await handleContact(deps, req({ token: await tokenFor(), ...form }))).status, 429);
  assert.equal(store.contacts.length, 0);
});

test("contacto: si ni la base de datos ni el email funcionan, se avisa (no hay «recibido» falso)", async () => {
  const { deps, store } = contactSetup();
  store.contactOk = false;
  deps.notify = async () => false;
  const r = await handleContact(deps, req({ token: await tokenFor(), ...form }));
  assert.equal(r.status, 503);
  assert.equal(r.body.fallback, true);
});

// ── Autorización del chat incrustado ──────────────────────────────
const embedReq = (over: Record<string, unknown> = {}) => ({
  negocio: "peluqueria-ana", referer: "https://www.peluqueriaana.es/", fetchDest: "iframe", host: HOST, ip: "203.0.113.7", ...over,
});
const embedDeps = (store: FakeStore) => ({ store, config: config(), now: () => NOW_MS });

test("embed: web autorizada (con o sin www) recibe un token firmado ligado al negocio", async () => {
  const store = new FakeStore(biz());
  const r = await authorizeEmbed(embedDeps(store), embedReq());
  assert.ok(r.ok);
  if (!r.ok) return;
  const v = await verifyToken(SECRET, r.token, NOW + 5);
  assert.ok(v.ok && v.payload.b === "peluqueria-ana" && v.payload.h === "www.peluqueriaana.es");
  assert.ok((await authorizeEmbed(embedDeps(store), embedReq({ referer: "https://peluqueriaana.es/contacto" }))).ok);
});

test("embed: se deniega por dominio, estado, apertura directa, id inválido, apagado y límite", async () => {
  const store = new FakeStore(biz(), biz({ id: "inactivo", active: false }));
  const d = embedDeps(store);
  const reason = async (o: Record<string, unknown>, deps = d) => { const r = await authorizeEmbed(deps, embedReq(o)); return r.ok ? "ok" : r.reason; };
  assert.equal(await reason({ referer: "https://otra-web.com/" }), "domain");
  assert.equal(await reason({ referer: "https://peluqueriaana.es.evil.com/" }), "domain");
  assert.equal(await reason({ referer: null }), "domain");
  assert.equal(await reason({ referer: "https://localis-ai-one.vercel.app/" }), "domain", "nuestra propia web NO vale para negocios de clientes");
  assert.equal(await reason({ negocio: "inactivo", referer: "https://x.es/" }), "inactive");
  assert.equal(await reason({ negocio: "no-existe" }), "not-found");
  assert.equal(await reason({ negocio: "../../etc" }), "not-found");
  assert.equal(await reason({ negocio: undefined }), "not-found");
  assert.equal(await reason({ fetchDest: "document" }), "not-framed");
  assert.equal(await reason({}, { ...d, config: config({ enabled: false }) }), "disabled");
  store.gateResult = { ok: false, reason: "rate:embed" };
  assert.equal(await reason({}), "rate");
  store.gateResult = { ok: false, reason: "unavailable" };
  assert.equal(await reason({}), "unavailable");
});

test("embed: la ficha interna de LOCALIS solo se muestra en nuestra propia web", async () => {
  const localis = biz({ id: "localis", name: "LOCALIS AI", domains: [], builtin: true });
  const store = new FakeStore(localis);
  const r = await (async (referer: string) => { const x = await authorizeEmbed(embedDeps(store), embedReq({ negocio: "localis", referer })); return x.ok; });
  assert.equal(await r(`https://${HOST}/`), true);
  assert.equal(await r("https://otra-web.com/"), false);
});

test("token de prueba del panel: válido, marcado como prueba y ligado al negocio", async () => {
  const t = await issueTestToken(config(), "peluqueria-ana", NOW);
  assert.ok(t);
  const v = await verifyToken(SECRET, t, NOW + 1);
  assert.ok(v.ok && v.payload.t === 1 && v.payload.b === "peluqueria-ana");
  assert.equal(await issueTestToken(config({ secret: null }), "x"), null);
});
