"use client";

import { useActionState } from "react";
import { runDiagnosticAction, type CallResult, type DiagState } from "./actions";

function Result({ title, r }: { title: string; r: CallResult }) {
  return (
    <div className={"rounded-2xl border p-4 text-sm " + (r.ok ? "border-emerald-400/40 bg-emerald-500/10" : "border-red-400/40 bg-red-500/10")} data-testid={r.ok ? "diag-ok" : "diag-error"}>
      <p className="font-semibold">
        {r.ok ? "✓" : "✗"} {title} <span className="font-normal text-muted">({r.ms} ms)</span>
      </p>
      {r.ok ? (
        <ul className="mt-2 space-y-1 text-emerald-100">
          <li>Respuesta REAL de Anthropic: «{r.text}»</li>
          <li>
            Modelo devuelto por la API: <code>{r.model}</code>
          </li>
          <li>
            Tokens: {r.inputTokens} de entrada + {r.outputTokens} de salida · coste ≈ {((r.costMicro ?? 0) / 1_000_000).toFixed(6)} $
          </li>
        </ul>
      ) : (
        <ul className="mt-2 space-y-1 text-red-100">
          <li>
            Estado HTTP: <strong>{r.error?.status ?? "sin respuesta"}</strong> · tipo: <strong>{r.error?.type ?? "—"}</strong>
          </li>
          {r.error?.message && <li>Mensaje de Anthropic: «{r.error.message}»</li>}
          {r.error?.requestId && (
            <li>
              Id de petición (para reclamar a Anthropic): <code>{r.error.requestId}</code>
            </li>
          )}
          <li className="font-semibold">Qué hacer: {r.error?.hint}</li>
        </ul>
      )}
    </div>
  );
}

export default function DiagnosticForm() {
  const [state, action, pending] = useActionState<DiagState, FormData>(runDiagnosticAction, {});
  return (
    <form action={action} className="space-y-4">
      <button type="submit" disabled={pending} className="btn btn-primary min-h-[48px] px-6 disabled:opacity-60">
        {pending ? "Consultando a Anthropic…" : "Hacer una petición real mínima a Anthropic"}
      </button>
      <p className="text-xs text-muted">Gasta una fracción de céntimo (unos 20 tokens). No usa ninguna conversación ni datos de clientes.</p>
      {state.production && <Result title="Petición con la misma forma que usa el chat" r={state.production} />}
      {state.minimal && <Result title="Petición mínima sin parámetros opcionales (para comparar)" r={state.minimal} />}
      {state.production && !state.production.ok && state.minimal?.ok && (
        <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          La petición mínima funciona pero la del chat no: el fallo está en un parámetro opcional del chat (por ejemplo el nivel de esfuerzo). Pásame el mensaje de arriba.
        </p>
      )}
    </form>
  );
}
