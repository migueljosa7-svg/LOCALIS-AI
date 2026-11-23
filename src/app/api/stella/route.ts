import { NextResponse } from "next/server";
import { handleChat } from "@/lib/stella/chat";
import { chatDeps, toIncoming } from "@/lib/stella/runtime";

// Stella · API del chat. Toda la lógica (token, negocio, límites, presupuestos y llamada al modelo)
// está en src/lib/stella/chat.ts, que se prueba con tests sin gastar nada.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const out = await handleChat(chatDeps(), await toIncoming(req));
    return NextResponse.json(out.body, { status: out.status, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[stella] error inesperado:", err instanceof Error ? err.name : "desconocido");
    return NextResponse.json({ ok: false, error: "Ahora mismo no puedo responder. Escríbenos por WhatsApp y te atendemos.", fallback: true }, { status: 500 });
  }
}
