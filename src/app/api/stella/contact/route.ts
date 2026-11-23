import { NextResponse } from "next/server";
import { handleContact } from "@/lib/stella/chat";
import { contactDeps, toIncoming } from "@/lib/stella/runtime";

// Stella · contacto con consentimiento explícito (casilla del formulario, no decisión de la IA).
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const out = await handleContact(contactDeps(), await toIncoming(req));
    return NextResponse.json(out.body, { status: out.status, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[stella] error inesperado en contacto:", err instanceof Error ? err.name : "desconocido");
    return NextResponse.json({ ok: false, error: "No hemos podido guardar tus datos. Escríbenos por WhatsApp, por favor." }, { status: 500 });
  }
}
