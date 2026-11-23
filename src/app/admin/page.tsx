import type { Metadata } from "next";
import { LEAD_STATUSES, OPP_STATUSES, dbConfigured, listLeads, listOpportunities } from "@/lib/db";
import Link from "next/link";
import RowEditor from "./RowEditor";

// Panel interno. Protegido por src/middleware.ts (usuario y contraseña).
// Solo muestra datos reales de la base de datos: nunca cifras de ejemplo.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel interno", robots: { index: false, follow: false } };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function AdminPage() {
  if (!dbConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold">Panel interno</h1>
        <p className="mt-4 text-muted">
          La base de datos no está conectada. Crea el proyecto en Supabase, ejecuta <code>supabase/schema.sql</code> y añade
          <code> SUPABASE_URL</code> y <code>SUPABASE_SERVICE_ROLE_KEY</code> en Vercel (ver <code>docs/OPERACIONES.md</code>).
        </p>
      </main>
    );
  }

  const [leads, opps] = await Promise.all([listLeads(), listOpportunities()]);
  const leadRows = leads.ok ? leads.data : [];
  const oppRows = opps.ok ? opps.data : [];
  const count = (s: string) => leadRows.filter((l) => l.status === s).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-12">
      <header>
        <h1 className="font-display text-3xl font-bold">Panel interno</h1>
        <p className="mt-1 text-sm text-muted">Datos reales de la base de datos · actualizado al cargar la página.</p>
        <p className="mt-3">
          <Link href="/admin/stella" className="inline-flex min-h-[44px] items-center rounded-xl border border-cyan-500/40 px-4 text-sm font-semibold text-cyan-300">
            Stella · negocios y contactos →
          </Link>
        </p>
        {(!leads.ok || !opps.ok) && (
          <p role="alert" className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Error al leer la base de datos ({!leads.ok ? "leads" : "oportunidades"}). Revisa las variables de Supabase, que el esquema esté creado
            y que se haya ejecutado <code>supabase/fix-permisos.sql</code>.
            <span className="mt-1 block font-mono text-xs opacity-80">
              {!leads.ok && <>leads: {leads.message ?? leads.reason}. </>}
              {!opps.ok && <>oportunidades: {opps.message ?? opps.reason}.</>}
            </span>
          </p>
        )}
      </header>

      <section aria-labelledby="leads-h">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="leads-h" className="font-display text-2xl font-bold">
            Leads ({leadRows.length})
          </h2>
          <ul className="flex flex-wrap gap-2 text-xs">
            {LEAD_STATUSES.map((s) => (
              <li key={s} className="rounded-full border border-white/10 px-3 py-1">
                {s}: <strong>{count(s)}</strong>
              </li>
            ))}
          </ul>
        </div>
        {leadRows.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Todavía no hay leads registrados.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Empresa y contacto</th>
                  <th className="p-3">Servicio</th>
                  <th className="p-3">Detalles</th>
                  <th className="p-3">Seguimiento</th>
                </tr>
              </thead>
              <tbody>
                {leadRows.map((l) => (
                  <tr key={l.id} className="border-t border-white/[0.07] align-top">
                    <td className="p-3 whitespace-nowrap text-muted">{fmtDate(l.created_at)}</td>
                    <td className="p-3">
                      <p className="font-semibold">{l.business_name}</p>
                      <p>{l.contact_name}</p>
                      <p>
                        <a className="text-cyan-300 underline" href={`mailto:${l.email}`}>
                          {l.email}
                        </a>
                      </p>
                      <p>
                        <a className="text-cyan-300 underline" href={`tel:${l.phone.replace(/\s/g, "")}`}>
                          {l.phone}
                        </a>
                      </p>
                    </td>
                    <td className="p-3">
                      {l.source === "stella-pedido" && <p className="mb-1 inline-block rounded-full bg-cyan-500/15 px-2 py-0.5 text-[11px] font-bold text-cyan-300">PEDIDO DE STELLA</p>}
                      <p>{l.service}</p>
                      <p className="text-xs text-muted">{l.source ?? "—"}</p>
                      <p className="text-xs text-muted">{l.email_notified ? "Aviso por email enviado" : "Sin aviso por email"}</p>
                    </td>
                    <td className="p-3 max-w-md">
                      {l.details ? <p className="whitespace-pre-line text-xs text-foreground/85">{l.details}</p> : <span className="text-muted">—</span>}
                      {l.prompt && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-cyan-300">Ver prompt técnico</summary>
                          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-black/40 p-2 text-[11px]">{l.prompt}</pre>
                        </details>
                      )}
                    </td>
                    <td className="p-3">
                      <RowEditor kind="leads" id={l.id} status={l.status} notes={l.notes} options={LEAD_STATUSES} />
                      <Link href={`/admin/stella/nuevo?lead=${l.id}`} className="mt-2 inline-block text-xs text-cyan-300 underline">
                        Crear negocio Stella con estos datos
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="opps-h">
        <h2 id="opps-h" className="font-display text-2xl font-bold">
          Oportunidades investigadas ({oppRows.length})
        </h2>
        <p className="mt-1 text-sm text-muted">
          Cargadas con <code>scripts/import-opportunities.mjs</code>. «Hecho» = comprobado en la fuente; «hipótesis» = pendiente de verificar.
        </p>
        {oppRows.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Todavía no hay oportunidades registradas.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="p-3">Puntos</th>
                  <th className="p-3">Empresa</th>
                  <th className="p-3">Problema y evidencia</th>
                  <th className="p-3">Servicio</th>
                  <th className="p-3">Seguimiento</th>
                </tr>
              </thead>
              <tbody>
                {oppRows.map((o) => (
                  <tr key={o.id} className="border-t border-white/[0.07] align-top">
                    <td className="p-3">
                      <p className="font-display text-xl font-bold">{o.score}</p>
                      <p className="text-xs text-muted">{o.priority}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold">{o.company}</p>
                      <p className="text-xs text-muted">
                        {o.sector} · {o.locality}
                      </p>
                      {o.website ? (
                        <a className="text-xs text-cyan-300 underline break-all" href={o.website} target="_blank" rel="noopener noreferrer nofollow">
                          {o.website}
                        </a>
                      ) : (
                        <p className="text-xs text-amber-200">Sin web</p>
                      )}
                      <p className="text-xs text-muted">Investigada: {o.researched_at}</p>
                    </td>
                    <td className="p-3 max-w-md">
                      <p>{o.problem}</p>
                      <p className="mt-1 text-xs text-muted">
                        <span className={o.evidence_type === "hecho" ? "text-emerald-300" : "text-amber-200"}>{o.evidence_type}</span> · {o.evidence}
                      </p>
                      <a className="text-xs text-cyan-300 underline break-all" href={o.source_url} target="_blank" rel="noopener noreferrer nofollow">
                        fuente
                      </a>
                    </td>
                    <td className="p-3">
                      <p>{o.recommended_service}</p>
                      {o.next_step && <p className="mt-1 text-xs text-muted">Siguiente: {o.next_step}</p>}
                    </td>
                    <td className="p-3">
                      <RowEditor kind="opportunities" id={o.id} status={o.status} notes={o.notes} options={OPP_STATUSES} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
