import type { Metadata } from "next";
import Link from "next/link";
import { rest } from "@/lib/db";
import { STAGE_LABEL, type DesignRow, type DesignStage } from "@/lib/builder/store";
import { SECTORS, TEMPLATES } from "@/lib/builder/model";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Diseños de clientes", robots: { index: false, follow: false } };

const fmt = (iso: string) => new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function DesignsPage() {
  const r = await rest<DesignRow[]>("design_requests?select=id,created_at,stage,lead_id,config&order=created_at.desc&limit=100");
  const rows = r.ok ? r.data : [];
  const count = (s: DesignStage) => rows.filter((x) => x.stage === s).length;
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <p className="text-sm"><Link href="/admin" className="text-cyan-300 underline">← Resumen</Link></p>
      <h1 className="font-display text-3xl font-bold">Diseños de clientes</h1>
      <p className="text-sm text-muted">Cada solicitud de «Diseña tu web» con todas las decisiones del cliente. Ábrela para ver su web, sus colores, imágenes y botones.</p>
      {!r.ok && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">No se pudo leer ({r.message ?? r.reason}). ¿Has ejecutado <code>supabase/configurador.sql</code>? Mira la guía B.</p>}
      {r.ok && (
        <ul className="flex flex-wrap gap-2 text-xs">
          {(Object.keys(STAGE_LABEL) as DesignStage[]).map((s) => <li key={s} className="rounded-full border border-white/10 px-3 py-1">{STAGE_LABEL[s]}: <strong>{count(s)}</strong></li>)}
        </ul>
      )}
      {r.ok && rows.length === 0 && <p className="text-sm text-muted">Todavía no ha llegado ninguna solicitud de diseño.</p>}
      <ul className="space-y-3">
        {rows.map((x) => (
          <li key={x.id} className="rounded-2xl border border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`/admin/diseno/${x.id}`} className="font-display text-lg font-bold text-cyan-300 underline">{x.config?.business?.name || "Sin nombre de negocio"}</Link>
                <p className="text-xs text-muted">{fmt(x.created_at)} · {SECTORS.find((s) => s.id === x.config?.business?.sector)?.label} · {TEMPLATES.find((t) => t.id === x.config?.template)?.label}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{STAGE_LABEL[x.stage]}</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
