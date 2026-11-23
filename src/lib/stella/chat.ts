// Núcleo de Stella: reglas de seguridad, límites, coste y llamada al modelo.
// Sin dependencias de Next ni de Supabase: todo lo externo entra por `deps`, así se prueba sin red.
import type Anthropic from "@anthropic-ai/sdk";
import { costMicro } from "./cost";
import { hashKey, verifyToken, type StellaTokenPayload } from "./token";
import { FORM_MARKER, buildSystemPrompt } from "./prompt";
import type { StellaConfig } from "./config";
import type { RateRule, StellaStore } from "./types";
import type { StellaBusiness } from "./ficha";

export const MAX_TURNS = 24;
export const MAX_CHARS = 1000;
export const MAX_HISTORY_CHARS = 12_000;
export const MAX_BODY_BYTES = 40_000;
export const MAX_OUTPUT_TOKENS = 1500;
export const MAX_REPLY_CHARS = 1500;

/** Subconjunto del cliente de Anthropic que usamos (se sustituye en los tests). */
export interface ModelClient {
  messages: { create(params: Anthropic.MessageCreateParamsNonStreaming): Promise<Anthropic.Message> };
}

export interface ChatDeps {
  store: StellaStore;
  config: StellaConfig;
  /** Se crea solo cuando hace falta (no se toca la API si la petición se rechaza antes). */
  model: () => ModelClient;
  now?: () => number;
}

export interface IncomingRequest {
  /** cabecera Host de esta petición */
  host: string | null;
  /** cabecera Origin */
  origin: string | null;
  ip: string;
  bodyText: string;
}

export type Outcome = { status: number; body: Record<string, unknown> };

const FALLBACK_MSG = "Ahora mismo no puedo responder. Escríbenos por WhatsApp y te atendemos.";
const fail = (status: number, error: string, extra: Record<string, unknown> = {}): Outcome => ({ status, body: { ok: false, error, ...extra } });

/** Comprobaciones comunes a /api/stella y /api/stella/contact. */
async function authenticate(
  deps: ChatDeps,
  req: IncomingRequest,
  body: Record<string, unknown>
): Promise<{ ok: true; payload: StellaTokenPayload; business: StellaBusiness } | { ok: false; out: Outcome }> {
  if (!deps.config.enabled || !deps.config.secret) return { ok: false, out: fail(503, "Stella no está activada.") };
  // Capa 1 (no es autenticación, solo descarta tráfico ajeno): la petición debe venir de nuestro propio dominio.
  let originHost = "";
  try {
    originHost = new URL(req.origin ?? "").host;
  } catch {}
  if (!req.host || originHost !== req.host) return { ok: false, out: fail(403, "Origen no permitido.") };

  // Capa 2: token firmado, emitido por la página del chat tras validar negocio y dominio.
  const t = await verifyToken(deps.config.secret, body.token, deps.now ? Math.floor(deps.now() / 1000) : undefined);
  if (!t.ok) return { ok: false, out: fail(401, "La sesión del chat ha caducado. Cierra y vuelve a abrir el chat.", { code: "token" }) };

  // Capa 3: el negocio sale SIEMPRE del token, nunca del cuerpo. Si el cuerpo dice otro, se rechaza.
  if (body.business !== undefined && body.business !== t.payload.b) return { ok: false, out: fail(400, "Solicitud no válida.") };
  const business = await deps.store.getBusiness(t.payload.b);
  if (!business) return { ok: false, out: fail(404, "Asistente no encontrado.") };
  if (!business.active && !t.payload.t) return { ok: false, out: fail(403, "Este asistente no está activo.") };
  return { ok: true, payload: t.payload, business };
}

function gateMessage(reason: string): Outcome {
  if (reason === "unavailable") return fail(503, FALLBACK_MSG, { fallback: true });
  if (reason.startsWith("rate:ip") || reason.startsWith("rate:session") || reason.startsWith("rate:burst"))
    return fail(429, "Estás escribiendo muy rápido o demasiado. Espera un momento o escríbenos por WhatsApp.");
  // Topes de negocio o globales (presupuesto agotado, saturación): Stella se aparta y ofrece WhatsApp.
  return fail(503, FALLBACK_MSG, { fallback: true });
}

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

export function parseHistory(raw: unknown): Turn[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_TURNS) return null;
  const turns: Turn[] = [];
  let total = 0;
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, role === "user" ? MAX_CHARS : 4000);
    if (!text) return null;
    total += text.length;
    turns.push({ role, content: text });
  }
  if (total > MAX_HISTORY_CHARS) return null;
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns.length && turns[turns.length - 1].role === "user" ? turns : null;
}

function parseBody(text: string): Record<string, unknown> | null {
  if (text.length > MAX_BODY_BYTES) return null;
  try {
    const v = JSON.parse(text) as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Limpia la respuesta del modelo: quita etiquetas internas, detecta la marca del formulario y acota la longitud. */
export function cleanReply(raw: string): { reply: string; showForm: boolean } {
  const showForm = raw.includes(FORM_MARKER);
  let reply = raw.split(FORM_MARKER).join("");
  reply = reply.replace(/<\/?(thinking|reasoning|system|instructions?)[^>]*>/gi, "").trim();
  if (reply.length > MAX_REPLY_CHARS) reply = reply.slice(0, MAX_REPLY_CHARS).replace(/\s+\S*$/, "") + "…";
  return { reply, showForm };
}

// ── Chat ──────────────────────────────────────────────────────────
export async function handleChat(deps: ChatDeps, req: IncomingRequest): Promise<Outcome> {
  const body = parseBody(req.bodyText);
  if (!body) return fail(400, "Solicitud no válida.");
  const auth = await authenticate(deps, req, body);
  if (!auth.ok) return auth.out;
  const { payload, business } = auth;

  const history = parseHistory(body.messages);
  if (!history) return fail(400, "Solicitud no válida.");

  const secret = deps.config.secret!;
  const ipKey = await hashKey(secret, req.ip);
  const rates: RateRule[] = [
    { name: "burst", key: `tok:${payload.s}:burst`, window: 3, limit: 2 },
    { name: "session", key: `tok:${payload.s}:chat`, window: 4 * 3600, limit: 40 },
    { name: "ip", key: `ip:${ipKey}:chat`, window: 600, limit: 30 },
    { name: "business", key: `biz:${business.id}:min`, window: 60, limit: 40 },
    { name: "global", key: "all:min", window: 60, limit: 150 },
  ];
  const gate = await deps.store.gate({
    businessId: business.id,
    rates,
    // Un tope de 0 significa «no se puede gastar nada» (no «sin límite»): mínimo 1 micro-USD, así el SQL siempre lo aplica.
    bizDayMicro: Math.max(1, Math.round(business.dailyBudgetUsd * 1_000_000)),
    bizMonthMicro: Math.max(1, Math.round(business.monthlyBudgetUsd * 1_000_000)),
    globalDayMicro: deps.config.globalDailyMicro,
    globalMonthMicro: deps.config.globalMonthlyMicro,
  });
  if (!gate.ok) {
    if (gate.reason.startsWith("budget")) console.warn(`[stella] tope de gasto alcanzado (${business.id}): ${gate.reason}`);
    return gateMessage(gate.reason);
  }

  try {
    const response = await deps.model().messages.create({
      model: deps.config.model,
      max_tokens: MAX_OUTPUT_TOKENS,
      output_config: { effort: "low" }, // chat breve: menos espera y menos coste
      system: buildSystemPrompt(business),
      messages: history.map((t) => ({ role: t.role, content: t.content })),
    });
    const cost = costMicro(deps.config.model, response.usage);
    await deps.store
      .addUsage({
        businessId: business.id,
        messages: 1,
        inputTokens: (response.usage.input_tokens ?? 0) + (response.usage.cache_read_input_tokens ?? 0) + (response.usage.cache_creation_input_tokens ?? 0),
        outputTokens: response.usage.output_tokens ?? 0,
        costMicro: cost,
        errors: 0,
        contacts: 0,
      })
      .catch(() => {});

    if (response.stop_reason === "refusal") {
      return { status: 200, body: { ok: true, reply: "Prefiero no responder a eso. ¿Te ayudo con algo sobre nuestros servicios?", showForm: false } };
    }
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const { reply, showForm } = cleanReply(text);
    // En pruebas (token del panel o negocios «prueba-…») se devuelve de qué modelo y con cuántos tokens salió la respuesta:
    // son datos que solo da la API de Anthropic, así se comprueba que no es una respuesta simulada. No son secretos.
    const meta = payload.t || business.id.startsWith("prueba-") ? { model: response.model, inputTokens: response.usage.input_tokens ?? 0, outputTokens: response.usage.output_tokens ?? 0 } : undefined;
    return { status: 200, body: { ok: true, reply: reply || "¿Me lo puedes repetir de otra forma?", showForm, ...(meta ? { meta } : {}) } };
  } catch (err) {
    // Se registra el tipo de error y el negocio, NUNCA el contenido de la conversación.
    const kind = (err as { status?: number })?.status ?? (err instanceof Error ? err.name : "desconocido");
    console.error(`[stella] fallo del modelo (negocio ${business.id}, modelo ${deps.config.model}): ${kind}`);
    await deps.store
      .addUsage({ businessId: business.id, messages: 0, inputTokens: 0, outputTokens: 0, costMicro: 0, errors: 1, contacts: 0 })
      .catch(() => {});
    return fail(502, FALLBACK_MSG, { fallback: true });
  }
}

// ── Contacto con consentimiento explícito ─────────────────────────
export interface ContactDeps extends ChatDeps {
  /** Aviso por email al negocio; nunca lanza. Devuelve true si se envió. */
  notify: (b: StellaBusiness, c: { name: string; phone: string; email: string; message: string }) => Promise<boolean>;
  validatePhone: (v: string) => string | null;
  validateEmail: (v: string) => string | null;
}

export async function handleContact(deps: ContactDeps, req: IncomingRequest): Promise<Outcome> {
  const body = parseBody(req.bodyText);
  if (!body) return fail(400, "Solicitud no válida.");
  const auth = await authenticate(deps, req, body);
  if (!auth.ok) return auth.out;
  const { payload, business } = auth;

  // Trampa anti-bots: el campo «website» está oculto para personas.
  if (typeof body.website === "string" && body.website.trim() !== "") return { status: 200, body: { ok: true } };

  const s = (k: string, max: number) => String(body[k] ?? "").trim().slice(0, max);
  const name = s("nombre", 120);
  const phone = s("telefono", 40);
  const email = s("email", 160).toLowerCase();
  const message = s("mensaje", 400);
  if (body.consentimiento !== true) return fail(422, "Debes aceptar que usemos tus datos para contactarte.");
  if (name.length < 2) return fail(422, "Escribe tu nombre.");
  const phoneErr = deps.validatePhone(phone);
  if (phoneErr) return fail(422, phoneErr);
  if (email) {
    const e = deps.validateEmail(email);
    if (e) return fail(422, e);
  }

  const ipKey = await hashKey(deps.config.secret!, req.ip);
  const gate = await deps.store.gate({
    businessId: business.id,
    rates: [
      { name: "session", key: `tok:${payload.s}:contact`, window: 3600, limit: 3 },
      { name: "ip", key: `ip:${ipKey}:contact`, window: 3600, limit: 6 },
    ],
    bizDayMicro: 0,
    bizMonthMicro: 0,
    globalDayMicro: 0,
    globalMonthMicro: 0,
  });
  if (!gate.ok) return gate.reason.startsWith("rate:") ? fail(429, "Has enviado varios formularios seguidos. Escríbenos por WhatsApp.") : gateMessage(gate.reason);

  // Pruebas desde /admin: no se guarda ningún contacto ni se envía correo.
  if (payload.t) return { status: 200, body: { ok: true, test: true } };

  const when = new Date((deps.now?.() ?? Date.now())).toISOString();
  const stored = await deps.store.insertContact({
    businessName: business.name,
    contactName: name,
    email,
    phone,
    service: "Stella · contacto desde la web",
    source: `stella:${business.id}`,
    details: [message && `Mensaje: ${message}`, `Consentimiento: aceptado el ${when} (chat de ${payload.h || "web del negocio"}).`].filter(Boolean).join("\n"),
    prompt: null,
  });
  const notified = await deps.notify(business, { name, phone, email, message });
  await deps.store
    .addUsage({ businessId: business.id, messages: 0, inputTokens: 0, outputTokens: 0, costMicro: 0, errors: stored.ok || notified ? 0 : 1, contacts: stored.ok ? 1 : 0 })
    .catch(() => {});
  if (!stored.ok && !notified) {
    console.error(`[stella] contacto NO registrado (negocio ${business.id})`);
    return fail(503, "No hemos podido guardar tus datos. Escríbenos por WhatsApp, por favor.", { fallback: true });
  }
  return { status: 200, body: { ok: true } };
}
