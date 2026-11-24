import type { Metadata } from "next";
import Link from "next/link";
import { LEAD_STATUSES, OPP_STATUSES, dbConfigured, listLeads, listOpportunities } from "@/lib/db";
import RowEditor from "../RowEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leads", robots: { index: false, follow: false } };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const ORIGINS: { id: string; label: string; test: (src: string | null) => boolean }[] = [
  { id: "stella", label: "Stella", test: (x) => (x ?? "").startsWith("stella") },
  { id: "diseno", label: "Diseña tu web", test: (x) => x === "disena-tu-web" },
  { id: "web", label: "Formularios de la web", test: (x) => !(x ?? "").startsWith("stella") && x !== "disena-tu-web" },
];

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ estado?: string; origen?: string }> }) {
  const { estado, origen } = await searchParams;
  if (!dbConfigured()) return <main className="px-4 py-10"><h1 className="font-display text-3xl font-bold">Leads</h1><p className="mt-3 text-muted">La base de datos no está conectada (ver Entorno).</p></main>;
  const [leads, opps] = await Promise.all([listLeads(), listOpportunities()]);
  const allLeads = leads.ok ? leads.data : [];
  const originDef = ORIGINS.find((o) => o.id === origen);
  const leadRows = allLeads.filter((l) => (!estado || l.status === estado) && (!originDef || originDef.test(l.source)));
  const oppRows = opps.ok ? opps.data : [];
  const count = (s: string) => allLeads.filter((l) => l.status === s).length;
  return (
    <main className="space-y-12 px-4 py-8 lg:px-8">
      <h1 className="font-display text-3xl font-bold">Leads y oportunidades</h1>
      {(!leads.ok || !opps.ok) && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Error al leer la base de datos ({!leads.ok ? "leads" : "oportunidades"}). Revisa Entorno.
          <span className="mt-1 block font-mono text-xs opacity-80">
            {!leads.ok && <>leads: {leads.message ?? leads.reason}. </>}
            {!opps.ok && <>oportunidades: {opps.message ?? opps.reason}.</>}
          </span>
        </p>
      )}
      <section id="leads" aria-labelledby="leads-h">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="leads-h" className="font-display text-2xl font-bold">
            Leads ({leadRows.length}{leadRows.length !== allLeads.length ? ` de ${allLeads.length}` : ""})
          </h2>
          <ul className="flex flex-wrap gap-2 text-xs">
            {LEAD_STATUSES.map((s) => (
              <li key={s}>
                <Link href={`/admin/leads?estado=${s}${origen ? `&origen=${origen}` : ""}`} className={"inline-flex min-h-[36px] items-center rounded-full border px-3 " + (estado === s ? "border-cyan-400 bg-cyan-400/15" : "border-white/10")}>
                  {s}: <strong className="ml-1">{count(s)}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" aria-label="Filtros de leads">
          <span className="text-muted">Origen:</span>
          {ORIGINS.map((o) => (
            <Link key={o.id} href={`/admin/leads?origen=${o.id}${estado ? `&estado=${estado}` : ""}`} className={"inline-flex min-h-[36px] items-center rounded-full border px-3 " + (origen === o.id ? "border-cyan-400 bg-cyan-400/15" : "border-white/10")}>
              {o.label}
            </Link>
          ))}
          {(estado || origen) && (
            <Link href="/admin/leads" className="inline-flex min-h-[36px] items-center rounded-full border border-white/20 px-3 text-cyan-300">
              Quitar filtros
            </Link>
          )}
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
                      {l.source === "disena-tu-web" && (() => {
                        const m = /\/admin\/diseno\/([0-9a-f-]{36})/i.exec(l.details ?? "");
                        return m ? <Link href={`/admin/diseno/${m[1]}`} className="mt-1 inline-block rounded-full bg-cyan-500/15 px-2 py-0.5 text-[11px] font-bold text-cyan-300">VER SU WEB DISEÑADA →</Link> : <span className="mt-1 inline-block text-[11px] text-amber-200">Diseño solo en el prompt técnico</span>;
                      })()}
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
