import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getBusiness, stellaEnabled, type StellaBusiness } from "@/lib/stella/businesses";
import { buildSystemPrompt } from "@/lib/stella/prompt";
import { insertLead, markLeadNotified } from "@/lib/db";
import { sendLeadNotifications } from "@/lib/email";
import { validatePhone, validateEmail } from "@/lib/lead";

// ════════════════════════════════════════════════════════════════
//  Stella · API del chat (servidor). Llama a Claude con la ficha del negocio
//  y, con el consentimiento del visitante, guarda el contacto en Supabase y
//  avisa por email. Sin ANTHROPIC_API_KEY responde 503 y el chat ofrece WhatsApp.
//
//  Variables: ANTHROPIC_API_KEY (obligatoria), STELLA_MODEL (opcional).
// ════════════════════════════════════════════════════════════════

const MODEL = process.env.STELLA_MODEL || "claude-opus-5-5";
const MAX_TURNS = 24; // mensajes de historial aceptados
const MAX_CHARS = 1000; // por mensaje del visitante
const MAX_TOOL_ROUNDS = 3;

// Límite por IP (en memoria de cada instancia; orientativo en Vercel).
const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now > e.reset) {
    hits.set(ip, { count: 1, reset: now + 10 * 60_000 });
    return false;
  }
  e.count += 1;
  return e.count > 40; // 40 mensajes cada 10 minutos
}

const SAVE_TOOL: Anthropic.Beta.BetaTool = {
  name: "guardar_contacto",
  description:
    "Guarda los datos de contacto del visitante para que el negocio le llame. Úsala solo cuando haya dado nombre y teléfono y haya aceptado expresamente que se usen para contactarle.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      nombre: { type: "string", description: "Nombre de la persona" },
      telefono: { type: "string", description: "Teléfono o WhatsApp" },
      email: { type: "string", description: "Email, o cadena vacía si no lo ha dado" },
      negocio: { type: "string", description: "Nombre de su negocio, o cadena vacía" },
      necesidad: { type: "string", description: "Resumen breve de lo que necesita (máx. 300 caracteres)" },
      consentimiento: { type: "boolean", description: "true solo si ha aceptado que se usen sus datos para contactarle" },
    },
    required: ["nombre", "telefono", "email", "negocio", "necesidad", "consentimiento"],
  },
};

type Turn = { role: "user" | "assistant"; content: string };

function parseHistory(raw: unknown): Turn[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_TURNS) return null;
  const turns: Turn[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, role === "user" ? MAX_CHARS : 4000);
    if (!text) return null;
    turns.push({ role, content: text });
  }
  // La conversación debe empezar y terminar con el visitante.
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns.length && turns[turns.length - 1].role === "user" ? turns : null;
}

async function saveContact(b: StellaBusiness, input: Record<string, unknown>): Promise<{ ok: boolean; message: string }> {
  const s = (k: string, max: number) => String(input[k] ?? "").trim().slice(0, max);
  const nombre = s("nombre", 120), telefono = s("telefono", 40), email = s("email", 160).toLowerCase();
  const negocio = s("negocio", 120), necesidad = s("necesidad", 300);
  if (input.consentimiento !== true) return { ok: false, message: "Falta el consentimiento: pregunta si acepta que le contacten." };
  if (nombre.length < 2) return { ok: false, message: "Falta el nombre." };
  const phoneErr = validatePhone(telefono);
  if (phoneErr) return { ok: false, message: `Teléfono no válido: ${phoneErr}` };
  if (email && validateEmail(email)) return { ok: false, message: `Email no válido: ${validateEmail(email)}` };

  const lead = {
    businessName: negocio.length >= 2 ? negocio : `${nombre} (sin negocio indicado)`,
    contactName: nombre,
    email,
    phone: telefono,
    service: `Stella · ${b.name}`,
    source: `stella:${b.id}`,
    details: necesidad || null,
    prompt: null,
  };
  const stored = await insertLead(lead);
  const mail = await sendLeadNotifications({ ...lead, sector: lead.service, details: lead.details ?? undefined }, { inbox: b.notifyEmail });
  if (stored.ok && mail.notified) await markLeadNotified(stored.data.id);
  if (!stored.ok && !mail.notified) {
    console.error(`[stella] contacto NO registrado (${b.id}): db=${stored.ok ? "ok" : stored.reason}`);
    return { ok: false, message: "No se pudo guardar por un error técnico. Pide que escriba por WhatsApp." };
  }
  return { ok: true, message: "Contacto guardado correctamente." };
}

let client: Anthropic | null = null;

export async function POST(req: Request) {
  if (!stellaEnabled()) {
    return NextResponse.json({ ok: false, error: "Stella no está activada." }, { status: 503 });
  }
  // Solo desde nuestras propias páginas (el widget y el iframe son del mismo origen).
  const host = req.headers.get("host");
  let originHost = "";
  try {
    originHost = new URL(req.headers.get("origin") ?? "").host;
  } catch {}
  if (!host || originHost !== host) {
    return NextResponse.json({ ok: false, error: "Origen no permitido." }, { status: 403 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Demasiados mensajes. Espera unos minutos o escríbenos por WhatsApp." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud no válida." }, { status: 400 });
  }
  const business = getBusiness(typeof body.business === "string" ? body.business : null);
  const history = parseHistory(body.messages);
  if (!business || !history) {
    return NextResponse.json({ ok: false, error: "Solicitud no válida." }, { status: 400 });
  }

  client ??= new Anthropic();
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((t) => ({ role: t.role, content: t.content }));
  let leadSaved = false;

  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 4000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default", // si el modelo declina, la API reintenta con otro modelo
        output_config: { effort: "low" }, // chat breve: menos espera y menos coste
        system: [{ type: "text", text: buildSystemPrompt(business), cache_control: { type: "ephemeral" } }],
        tools: [SAVE_TOOL],
        messages,
      });

      if (response.stop_reason === "refusal") {
        return NextResponse.json({ ok: true, reply: "Prefiero no responder a eso. ¿Te ayudo con algo sobre nuestros servicios?", leadSaved });
      }

      if (response.stop_reason === "tool_use") {
        // Se devuelve el contenido completo (incluido el razonamiento) tal cual.
        messages.push({ role: "assistant", content: response.content });
        const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
        for (const block of response.content) {
          if (block.type !== "tool_use") continue;
          if (block.name !== SAVE_TOOL.name || leadSaved) {
            results.push({ type: "tool_result", tool_use_id: block.id, content: "Herramienta no disponible.", is_error: true });
            continue;
          }
          const r = await saveContact(business, block.input as Record<string, unknown>);
          if (r.ok) leadSaved = true;
          results.push({ type: "tool_result", tool_use_id: block.id, content: r.message, is_error: !r.ok });
        }
        messages.push({ role: "user", content: results });
        continue;
      }

      const reply = response.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return NextResponse.json({ ok: true, reply: reply || "¿Me lo puedes repetir de otra forma?", leadSaved });
    }
    return NextResponse.json({ ok: true, reply: "Perdona, no he podido terminar. ¿Me lo repites?", leadSaved });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      console.error("[stella] límite de la API de Claude alcanzado");
    } else if (err instanceof Anthropic.AuthenticationError) {
      console.error("[stella] ANTHROPIC_API_KEY no válida");
    } else if (err instanceof Anthropic.APIError) {
      console.error(`[stella] error de la API ${err.status}: ${err.message}`);
    } else {
      console.error("[stella] error inesperado:", err instanceof Error ? err.message : err);
    }
    return NextResponse.json({ ok: false, error: "Ahora mismo no puedo responder. Escríbenos por WhatsApp y te atendemos.", leadSaved }, { status: 502 });
  }
}
