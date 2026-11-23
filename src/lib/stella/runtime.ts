import "server-only";
// Conecta el núcleo de Stella con el mundo real (Supabase, Anthropic, Resend). Lo usan las rutas.
import Anthropic from "@anthropic-ai/sdk";
import { validateEmail, validatePhone } from "@/lib/lead";
import { sendStellaContactEmail } from "@/lib/email";
import { readConfig } from "./config";
import { dbStore } from "./store";
import type { ChatDeps, ContactDeps, IncomingRequest, ModelClient } from "./chat";

let client: Anthropic | null = null;
const model = (): ModelClient => {
  // 2 reintentos (429, 5xx y errores de red) con espera creciente, y 25 s como máximo por intento.
  client ??= new Anthropic({ maxRetries: 2, timeout: 25_000 });
  return client;
};

export function chatDeps(): ChatDeps {
  return { store: dbStore, config: readConfig(), model };
}

export function contactDeps(): ContactDeps {
  return { ...chatDeps(), notify: sendStellaContactEmail, validatePhone, validateEmail };
}

/** Extrae lo necesario de la petición HTTP (la IP viene de la cabecera que pone Vercel). */
export async function toIncoming(req: Request): Promise<IncomingRequest> {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return { host: req.headers.get("host"), origin: req.headers.get("origin"), ip, bodyText: await req.text() };
}
