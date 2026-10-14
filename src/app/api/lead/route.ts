import { NextResponse } from "next/server";
import { validateLead } from "@/lib/lead";
import { env } from "@/lib/env";
import { sendLeadNotifications } from "@/lib/email";

// Rate-limit en memoria (suficiente para una landing; en producción usar KV/Upstash).
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

function esc(s: unknown, max = 200): string {
  return String(s ?? "").trim().slice(0, max);
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Demasiadas solicitudes. Inténtalo de nuevo en un minuto." },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Cuerpo JSON inválido." }, { status: 400 });
    }

    const data = body as Record<string, unknown>;
    const lead = {
      businessName: esc(data.businessName, 120),
      sector: esc(data.sector, 80),
      contactName: esc(data.contactName, 120),
      phone: esc(data.phone, 40),
      email: esc(data.email, 160).toLowerCase(),
      source: data.source == null ? null : esc(data.source, 120),
    };

    const errors = validateLead(lead);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 422 });
    }

    // EMAIL EN TIEMPO REAL (Resend): aviso al dueno + confirmacion al cliente.
    // Blindado con try/catch: si el proveedor falla o no hay API key, el usuario
    // NUNCA ve un error y el lead sigue respondiéndose ok (persistencia local incluida).
    try {
      const emailResult = await sendLeadNotifications(lead);
      if (process.env.NODE_ENV !== "production") {
        console.log("[lead] email:", emailResult, "inbox=" + env.leadInbox, lead);
      }
    } catch (emailErr) {
      console.warn("[lead] envio de email ignorado:", emailErr);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[api/lead] error inesperado:", err);
    // Jamás pantalla en blanco / 500 crudo: respuesta JSON controlada.
    return NextResponse.json(
      { ok: false, error: "Error interno. Tu solicitud se guardó localmente, te contactaremos igualmente." },
      { status: 500 },
    );
  }
}
