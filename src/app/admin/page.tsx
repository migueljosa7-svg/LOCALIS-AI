import type { Metadata } from "next";
import { dbConfigured, listLeads, rest } from "@/lib/db";
import Link from "next/link";
import { listBusinesses, monthUsage } from "@/lib/stella/store";
import { buildOverview, envChecks, type DesignLite } from "@/lib/admin/overview";
import { STAGE_LABEL, type DesignRow, type DesignStage } from "@/lib/builder/store";

// Panel interno. Protegido por src/middleware.ts (usuario y contraseña).
// Solo muestra datos reales de la base de datos: nunca cifras de ejemplo.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel interno", robots: { index: false, follow: false } };

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

  const [leads, biz, usage, designsRes] = await Promise.all([
    listLeads(),
    listBusinesses(),
    monthUsage(),
    rest<DesignRow[]>("design_requests?select=id,created_at,stage,lead_id,config&order=created_at.desc&limit=200"),
  ]);
  const allLeads = leads.ok ? leads.data : [];
  const designs: DesignLite[] = designsRes.ok ? designsRes.data.map((d) => ({ id: d.id, created_at: d.created_at, stage: d.stage, name: d.config?.business?.name || "Sin nombre" })) : [];
  const ov = buildOverview({
    now: Date.now(),
    leads: allLeads,
    businesses: biz.ok ? biz.data : [],
    usage: usage.ok ? usage.data : [],
    designs,
    env: envChecks().filter((e) => e.required && !e.ok).map((e) => ({ ok: false, label: "falta " + e.name })),
  });

  return (
    <main className="space-y-12 px-4 py-8 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Panel interno</h1>
        <p className="mt-1 text-sm text-muted">Datos reales de la base de datos · actualizado al cargar la página.</p>
        <section aria-labelledby="resumen-h" className="mt-6 space-y-5">
          <h2 id="resumen-h" className="sr-only">
            Resumen
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="resumen-tarjetas">
            <Card label="Leads" value={ov.leads.total} note={`${ov.leads.last7} en los últimos 7 días · ${ov.leads.byStatus["nuevo"] ?? 0} nuevos`} href="/admin/leads?estado=nuevo" />
            <Card label="Clientes" value={ov.leads.clients} note="leads en estado «ganado»" href="/admin/clientes" />
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
        {!leads.ok && (
          <p role="alert" className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Error al leer la base de datos (leads). Revisa Entorno.
            <span className="mt-1 block font-mono text-xs opacity-80">leads: {leads.message ?? leads.reason}.</span>
          </p>
        )}
      </header>
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
