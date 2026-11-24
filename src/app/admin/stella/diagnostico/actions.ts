"use server";

import Anthropic from "@anthropic-ai/sdk";
import { readConfig } from "@/lib/stella/config";
import { costMicro } from "@/lib/stella/cost";
import { describeError, hint } from "@/lib/stella/errors";

// Diagnóstico de la conexión REAL con Anthropic, lanzado a mano desde el panel (protegido por usuario y contraseña).
// Hace una petición mínima (unos 20 tokens: una fracción de céntimo). Nunca devuelve la clave.

export interface CallResult {
  ok: boolean;
  ms: number;
  model?: string;
  text?: string;
  inputTokens?: number;
  outputTokens?: number;
  costMicro?: number;
  error?: { status: number | null; type: string | null; message: string | null; requestId: string | null; hint: string };
}
export interface DiagState {
  ran?: boolean;
  production?: CallResult;
  minimal?: CallResult;
}

async function call(model: string, withEffort: boolean): Promise<CallResult> {
  const t0 = Date.now();
  try {
    const client = new Anthropic({ maxRetries: 0, timeout: 20_000 });
    const r = await client.messages.create({
      model,
      max_tokens: 64,
      ...(withEffort ? { output_config: { effort: "low" as const } } : {}),
      system: "Eres un asistente de pruebas. Responde con una sola palabra.",
      messages: [{ role: "user", content: "Responde solo: ok" }],
    });
    const text = r.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();
    return { ok: true, ms: Date.now() - t0, model: r.model, text: text.slice(0, 80), inputTokens: r.usage.input_tokens, outputTokens: r.usage.output_tokens, costMicro: costMicro(model, r.usage) };
  } catch (err) {
    const i = describeError(err);
    return { ok: false, ms: Date.now() - t0, error: { status: i.status, type: i.type, message: i.message, requestId: i.requestId, hint: hint(i) } };
  }
}

export async function runDiagnosticAction(prev: DiagState): Promise<DiagState> {
  void prev;
  const cfg = readConfig();
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    return { ran: true, production: { ok: false, ms: 0, error: { status: null, type: null, message: null, requestId: null, hint: "No hay ANTHROPIC_API_KEY en este entorno (Vercel → Environment Variables → marca Preview) o falta el Redeploy." } } };
  }
  // 1) Con la MISMA forma de petición que usa el chat (modelo configurado + esfuerzo bajo).
  const production = await call(cfg.model, true);
  // 2) Solo si falla: petición mínima sin parámetros opcionales, para saber si el problema es el formato o la cuenta.
  const minimal = production.ok ? undefined : await call(cfg.model, false);
  return { ran: true, production, minimal };
}
