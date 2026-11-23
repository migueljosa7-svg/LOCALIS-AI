import { NextResponse } from "next/server";
import { validateLead } from "@/lib/lead";
import { sendLeadNotifications } from "@/lib/email";
import { insertLead, markLeadNotified } from "@/lib/db";

// Límite básico por IP (en memoria de cada instancia; orientativo en Vercel).
const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const MAX_HITS = 10;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_HITS;
}

function clean(s: unknown, max = 200): string {
  return String(s ?? "").trim().slice(0, max);
}

const FALLBACK_ERROR =
  "No hemos podido registrar tu solicitud. Escríbenos por WhatsApp al +34 640 80 92 38 y te atendemos al momento.";

/**
 * Recepción de leads:
 *   1. valida en servidor (mismas reglas que el navegador);
 *   2. guarda el lead en la base de datos (si está configurada);
 *   3. envía el aviso por email (si Resend está configurado).
 * Responde ok solo si el lead quedó guardado o avisado por email. Si no se pudo
 * ninguna de las dos cosas, devuelve 503 y el formulario muestra el error real
 * (con WhatsApp como alternativa): nunca un "recibido" falso.
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json({ ok: false, error: "Demasiadas solicitudes. Inténtalo de nuevo en un minuto." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Solicitud no válida." }, { status: 400 });
    }

    const data = (body ?? {}) as Record<string, unknown>;
    const lead = {
      businessName: clean(data.businessName, 120),
      sector: clean(data.sector, 80),
      contactName: clean(data.contactName, 120),
      phone: clean(data.phone, 40),
      email: clean(data.email, 160).toLowerCase(),
      source: data.source == null ? null : clean(data.source, 120),
      details: data.details == null ? null : clean(data.details, 1200),
      prompt: data.prompt == null ? null : clean(data.prompt, 8000),
    };

    const errors = validateLead(lead);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 422 });
    }

    // 1) Guardar (fuente de verdad del CRM).
    const stored = await insertLead({
      businessName: lead.businessName,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      service: lead.sector,
      source: lead.source,
      details: lead.details,
      prompt: lead.prompt,
    });

    // 2) Avisar por email (nunca lanza excepciones).
    const mail = await sendLeadNotifications(lead);
    if (stored.ok && mail.notified) await markLeadNotified(stored.data.id);

    const saved = stored.ok;
    const notified = mail.notified;
    if (!saved && !notified) {
      console.error(`[api/lead] lead NO registrado: db=${stored.ok ? "ok" : stored.reason} email=${mail.attempted ? "falló" : "sin configurar"}`);
      return NextResponse.json({ ok: false, error: FALLBACK_ERROR }, { status: 503 });
    }
    if (!saved) console.warn(`[api/lead] lead solo avisado por email (db: ${stored.ok ? "ok" : stored.reason})`);
    if (!notified) console.warn(`[api/lead] lead guardado sin aviso por email (${mail.attempted ? "envío fallido" : "Resend sin configurar"})`);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[api/lead] error inesperado:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: FALLBACK_ERROR }, { status: 500 });
  }
}
