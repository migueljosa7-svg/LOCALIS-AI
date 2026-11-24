import type { Metadata } from "next";
import Link from "next/link";
import { dbConfigured, rest } from "@/lib/db";
import { OPEN_STAGES } from "@/lib/admin/overview";
import { STAGE_LABEL, type DesignRow, type DesignStage } from "@/lib/builder/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Proyectos y webs", robots: { index: false, follow: false } };

const fmt = (iso: string) => new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short" });

export default async function ProyectosPage() {
  if (!dbConfigured()) return <main className="px-4 py-10"><h1 className="font-display text-3xl font-bold">Proyectos y webs</h1><p className="mt-3 text-muted">La base de datos no está conectada (ver Entorno).</p></main>;
  const r = await rest<DesignRow[]>("design_requests?select=id,created_at,stage,lead_id,config&order=created_at.desc&limit=200");
  const rows = r.ok ? r.data : [];
  const stages = Object.keys(STAGE_LABEL) as DesignStage[];
  return (
    <main className="space-y-8 px-4 py-8 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Proyectos y webs</h1>
        <p className="mt-1 text-sm text-muted">Cada solicitud de «Diseña tu web» es un proyecto de web. Aquí ves en qué fase está cada uno; el detalle y los cambios de fase están en su ficha.</p>
      </header>
      {!r.ok && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">No se pudo leer ({r.message ?? r.reason}).</p>}
      {r.ok && rows.length === 0 && <p className="text-sm text-muted">Todavía no hay proyectos. Aparecerán cuando alguien envíe su diseño desde la web.</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stages.map((s) => {
          const list = rows.filter((x) => x.stage === s);
          return (
            <section key={s} aria-labelledby={`st-${s}`} className="rounded-2xl border border-white/10 p-4">
              <h2 id={`st-${s}`} className="flex items-center justify-between font-display text-base font-bold">
                {STAGE_LABEL[s]} <span className={"rounded-full px-2 py-0.5 text-xs " + (OPEN_STAGES.includes(s) ? "bg-cyan-400/15 text-cyan-100" : "bg-white/10")}>{list.length}</span>
              </h2>
              {list.length === 0 ? <p className="mt-2 text-xs text-muted">Ninguno.</p> : (
                <ul className="mt-2 space-y-1">
                  {list.map((x) => (
                    <li key={x.id}>
                      <Link href={`/admin/diseno/${x.id}`} className="flex min-h-[44px] items-center justify-between gap-2 rounded-lg px-2 text-sm hover:bg-white/5">
                        <span className="truncate">{x.config?.business?.name || "Sin nombre"}</span>
                        <span className="shrink-0 text-xs text-muted">{fmt(x.created_at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
