import { NextResponse } from "next/server";
import { handleDesignRequest, type RequestDeps } from "@/lib/builder/request";
import { countRecentByIp, insertDesign, linkLead, uploadImage } from "@/lib/builder/store";
import { insertLead, markLeadNotified } from "@/lib/db";
import { sendLeadNotifications } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

// «Quiero esta web»: guarda el diseño completo, las imágenes (almacén privado) y crea el lead que aparece en /admin.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Capa extra en memoria de cada instancia (la defensa persistente está en el núcleo, por IP en la base de datos).
const hits = new Map<string, { n: number; reset: number }>();
function burst(ip: string): boolean {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now > e.reset) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  return ++e.n > 6;
}

async function hashIp(ip: string): Promise<string> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "localis";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`design:${ip}`)));
  return Array.from(sig.slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

const deps: RequestDeps = {
  hashIp,
  countRecentByIp,
  uploadImage,
  insertDesign: async (row) => ({ ok: (await insertDesign(row)).ok }),
  insertLead: async (l) => {
    const r = await insertLead({ businessName: l.businessName, contactName: l.contactName, email: l.email, phone: l.phone, service: l.service, source: l.source, details: l.details, prompt: l.prompt });
    return r.ok ? { ok: true, id: r.data.id } : { ok: false };
  },
  notify: async (l) => {
    const r = await sendLeadNotifications(l);
    return { notified: r.notified };
  },
  markNotified: markLeadNotified,
  linkLead: async (d, l) => void (await linkLead(d, l)),
  newId: () => crypto.randomUUID(),
  siteUrl: SITE_URL,
};

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (burst(ip)) return NextResponse.json({ ok: false, error: "Demasiados envíos seguidos. Espera un minuto." }, { status: 429 });
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ ok: false, error: "Solicitud no válida." }, { status: 400 });
    }
    const cl = Number(req.headers.get("content-length"));
    const out = await handleDesignRequest(deps, { host: req.headers.get("host"), origin: req.headers.get("origin"), contentLength: Number.isFinite(cl) ? cl : null, ip, form });
    return NextResponse.json(out.body, { status: out.status, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[design] error inesperado:", err instanceof Error ? err.name : "desconocido");
    return NextResponse.json({ ok: false, error: "No hemos podido registrar tu diseño. Escríbenos por WhatsApp al +34 640 80 92 38." }, { status: 500 });
  }
}
