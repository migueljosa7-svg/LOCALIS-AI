import type { Metadata } from "next";
import { LEAD_STATUSES, OPP_STATUSES, dbConfigured, listLeads, listOpportunities, rest } from "@/lib/db";
import Link from "next/link";
import RowEditor from "./RowEditor";
import { listBusinesses, monthUsage } from "@/lib/stella/store";
import { buildOverview, envChecks, type DesignLite } from "@/lib/admin/overview";
import { STAGE_LABEL, type DesignRow, type DesignStage } from "@/lib/builder/store";

// Panel interno. Protegido por src/middleware.ts (usuario y contraseña).
// Solo muestra datos reales de la base de datos: nunca cifras de ejemplo.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel interno", robots: { index: false, follow: false } };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const ORIGINS: { id: string; label: string; test: (src: string | null) => boolean }[] = [
  { id: "stella", label: "Stella", test: (x) => (x ?? "").startsWith("stella") },
  { id: "diseno", label: "Diseña tu web", test: (x) => x === "disena-tu-web" },
  { id: "web", label: "Formularios de la web", test: (x) => !(x ?? "").startsWith("stella") && x !== "disena-tu-web" },
];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ estado?: string; origen?: string }> }) {
  const { estado, origen } = await searchParams;
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

  const [leads, opps, biz, usage, designsRes] = await Promise.all([
    listLeads(),
    listOpportunities(),
    listBusinesses(),
    monthUsage(),
    rest<DesignRow[]>("design_requests?select=id,created_at,stage,lead_id,config&order=created_at.desc&limit=200"),
  ]);
  const allLeads = leads.ok ? leads.data : [];
  const originDef = ORIGINS.find((o) => o.id === origen);
  const leadRows = allLeads.filter((l) => (!estado || l.status === estado) && (!originDef || originDef.test(l.source)));
  const designs: DesignLite[] = designsRes.ok ? designsRes.data.map((d) => ({ id: d.id, created_at: d.created_at, stage: d.stage, name: d.config?.business?.name || "Sin nombre" })) : [];
  const ov = buildOverview({
    now: Date.now(),
    leads: allLeads,
    businesses: biz.ok ? biz.data : [],
    usage: usage.ok ? usage.data : [],
    designs,
    env: envChecks().filter((e) => e.required && !e.ok).map((e) => ({ ok: false, label: "falta " + e.name })),
  });
  const oppRows = opps.ok ? opps.data : [];
  const count = (s: string) => allLeads.filter((l) => l.status === s).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-12">
      <header>
        <h1 className="font-display text-3xl font-bold">Panel interno</h1>
        <p className="mt-1 text-sm text-muted">Datos reales de la base de datos · actualizado al cargar la página.</p>
        <section aria-labelledby="resumen-h" className="mt-6 space-y-5">
          <h2 id="resumen-h" className="sr-only">
            Resumen
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="resumen-tarjetas">
            <Card label="Leads" value={ov.leads.total} note={`${ov.leads.last7} en los últimos 7 días · ${ov.leads.byStatus["nuevo"] ?? 0} nuevos`} href="/admin?estado=nuevo#leads" />
            <Card label="Clientes" value={ov.leads.clients} note="leads en estado «ganado»" href="/admin?estado=ganado#leads" />
            <Card label="Proyectos pendientes" value={ov.projects.pending.length} note="diseños sin entregar" href="/admin/diseno" />
            <Card label="Stella activa" value={`${ov.stella.active}/${ov.stella.total}`} note={`${ov.stella.drafts} borrador(es) · IA este mes ${ov.stella.costMonthUsd.toFixed(2).replace(".", ",")} $`} href="/admin/stella" />
          </div>
          <div className="rounded-2xl border border-white/10 p-4" data-testid="resumen-atencion">
            <h3 className="font-display text-lg font-bold">Requiere atención ({ov.problems.length})</h3>
            {ov.problems.length === 0 ? (
              <p className="mt-1 text-sm text-emerald-300">Todo en orden: no hay nada pendiente de revisar.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {ov.problems.map((p, i) => (
                  <li key={i}>
                    <Link href={p.href} className="flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-sm hover:bg-white/5">
                      <span className={"shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold " + (p.level === "alta" ? "bg-red-500/20 text-red-200" : "bg-amber-500/20 text-amber-100")}>{p.level}</span>
                      {p.text}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 p-4">
              <h3 className="font-display text-lg font-bold">Proyectos de web pendientes</h3>
              {ov.projects.pending.length === 0 ? (
                <p className="mt-1 text-sm text-muted">Ninguno.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {ov.projects.pending.slice(0, 6).map((d) => (
                    <li key={d.id}>
                      <Link href={`/admin/diseno/${d.id}`} className="flex min-h-[44px] items-center justify-between gap-2 rounded-lg px-2 text-sm hover:bg-white/5">
                        <span className="truncate">{d.name}</span>
                        <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px]">{STAGE_LABEL[d.stage as DesignStage] ?? d.stage}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <h3 className="font-display text-lg font-bold">Stella: asistentes y consumo del mes</h3>
              {ov.stella.rows.length === 0 ? (
                <p className="mt-1 text-sm text-muted">Todavía no hay negocios de Stella.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {ov.stella.rows.slice(0, 8).map((r) => (
                    <li key={r.id}>
                      <Link href={`/admin/stella/${r.id}`} className="flex min-h-[44px] items-center justify-between gap-2 rounded-lg px-2 text-sm hover:bg-white/5">
                        <span className="truncate">
                          <span className={r.active ? "text-emerald-300" : "text-muted"}>●</span> {r.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted">
                          {r.messages} msj · {r.contacts} contactos · {r.costUsd.toFixed(2).replace(".", ",")} $ ({r.pct} %)
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
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

      <section id="leads" aria-labelledby="leads-h">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="leads-h" className="font-display text-2xl font-bold">
            Leads ({leadRows.length}{leadRows.length !== allLeads.length ? ` de ${allLeads.length}` : ""})
          </h2>
          <ul className="flex flex-wrap gap-2 text-xs">
            {LEAD_STATUSES.map((s) => (
              <li key={s}>
                <Link href={`/admin?estado=${s}${origen ? `&origen=${origen}` : ""}#leads`} className={"inline-flex min-h-[36px] items-center rounded-full border px-3 " + (estado === s ? "border-cyan-400 bg-cyan-400/15" : "border-white/10")}>
                  {s}: <strong className="ml-1">{count(s)}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" aria-label="Filtros de leads">
          <span className="text-muted">Origen:</span>
          {ORIGINS.map((o) => (
            <Link key={o.id} href={`/admin?origen=${o.id}${estado ? `&estado=${estado}` : ""}#leads`} className={"inline-flex min-h-[36px] items-center rounded-full border px-3 " + (origen === o.id ? "border-cyan-400 bg-cyan-400/15" : "border-white/10")}>
              {o.label}
            </Link>
          ))}
          {(estado || origen) && (
            <Link href="/admin#leads" className="inline-flex min-h-[36px] items-center rounded-full border border-white/20 px-3 text-cyan-300">
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

function Card({ label, value, note, href }: { label: string; value: string | number; note: string; href: string }) {
  return (
    <Link href={href} className="block min-h-[44px] rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-cyan-500/40">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </Link>
  );
}
