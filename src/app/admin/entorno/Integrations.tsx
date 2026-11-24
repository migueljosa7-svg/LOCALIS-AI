"use client";

import { useActionState } from "react";
import { checkSupabaseAction, sendTestEmailAction, type DbState, type MailState } from "./actions";

export default function Integrations() {
  const [db, dbAction, dbPending] = useActionState<DbState, FormData>(checkSupabaseAction as never, {});
  const [mail, mailAction, mailPending] = useActionState<MailState, FormData>(sendTestEmailAction as never, {});
  const failed = db.results?.filter((r) => !r.ok).length ?? 0;
  return (
    <section aria-labelledby="int-h" className="space-y-6">
      <h2 id="int-h" className="font-display text-lg font-bold">
        Comprobar las integraciones reales (desde este despliegue)
      </h2>

      <form action={dbAction} className="space-y-3 rounded-2xl border border-white/10 p-4">
        <h3 className="font-semibold">Supabase y almacén de imágenes</h3>
        <p className="text-sm text-muted">Comprueba que existen las tablas y los permisos, que el almacén de imágenes es privado y que se puede subir, recuperar y borrar una imagen diminuta de prueba (la crea y la borra en el momento). No toca leads ni datos de clientes.</p>
        <button type="submit" disabled={dbPending} className="btn btn-primary min-h-[48px] px-6 disabled:opacity-60" data-testid="btn-supabase">
          {dbPending ? "Comprobando…" : "Comprobar Supabase y almacén"}
        </button>
        {db.results && (
          <div data-testid="resultado-supabase">
            <p className={"mt-2 font-semibold " + (failed ? "text-red-300" : "text-emerald-300")}>{failed ? `${failed} comprobación(es) con problemas` : "Todo correcto"}</p>
            <ul className="mt-2 space-y-1.5">
              {db.results.map((r) => (
                <li key={r.name} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                  <span className={r.ok ? "text-emerald-300" : "text-red-300"}>
                    {r.ok ? "✓" : "✗"} {r.name}
                  </span>
                  <span className="block text-xs text-muted">{r.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>

      <form action={mailAction} className="space-y-3 rounded-2xl border border-white/10 p-4">
        <h3 className="font-semibold">Resend (correo)</h3>
        <p className="text-sm text-muted">Envía UN correo de prueba al email de avisos del propio negocio (LEAD_INBOX_EMAIL). No se envía nada a clientes.</p>
        <button type="submit" disabled={mailPending} className="btn btn-primary min-h-[48px] px-6 disabled:opacity-60" data-testid="btn-resend">
          {mailPending ? "Enviando…" : "Enviar correo de prueba a mi email"}
        </button>
        {mail.result && (
          <p role="status" data-testid="resultado-resend" className={"rounded-xl border px-3 py-2 text-sm " + (mail.result.ok ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100" : "border-red-400/40 bg-red-500/10 text-red-100")}>
            {mail.result.ok ? "✓" : "✗"} Destinatario: {mail.result.to} · estado {mail.result.status ?? "sin respuesta"} · {mail.result.detail}
          </p>
        )}
      </form>
    </section>
  );
}
