import type { Metadata } from "next";
import Link from "next/link";
import { dbConfigured } from "@/lib/db";
import { listBusinesses, monthUsage } from "@/lib/stella/store";
import { readConfig } from "@/lib/stella/config";
import { microToUsd } from "@/lib/stella/cost";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stella · negocios", robots: { index: false, follow: false } };

const usd = (n: number) => `${n.toFixed(2).replace(".", ",")} $`;

export default async function StellaAdminPage() {
  const cfg = readConfig();
  const [list, usage] = dbConfigured() ? await Promise.all([listBusinesses(), monthUsage()]) : [null, null];
  const businesses = list?.ok ? list.data : [];
  const rows = usage?.ok ? usage.data : [];
  const byBiz = (id: string) => {
    const r = rows.filter((x) => x.business_id === id);
    return { messages: r.reduce((a, x) => a + x.messages, 0), cost: microToUsd(r.reduce((a, x) => a + Number(x.cost_micro), 0)), contacts: r.reduce((a, x) => a + x.contacts, 0) };
  };
  const totalCost = microToUsd(rows.reduce((a, x) => a + Number(x.cost_micro), 0));

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header>
        <p className="text-sm">
          <Link href="/admin" className="text-cyan-300 underline">
            ← Panel interno
          </Link>
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Stella · negocios</h1>
        <p className="mt-1 text-sm text-muted">Alta, configuración, activación y consumo de cada negocio que contrata Stella.</p>
      </header>

      <section aria-label="Estado general" className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="IA"
          value={cfg.enabled ? "Activada" : "Apagada"}
          note={cfg.enabled ? `Modelo: ${cfg.model}` : "Falta ANTHROPIC_API_KEY en Vercel (o STELLA_ENABLED=false)"}
          tone={cfg.enabled ? "ok" : "warn"}
        />
        <Stat label="Gasto de IA este mes" value={usd(totalCost)} note={`Tope global: ${usd(microToUsd(cfg.globalMonthlyMicro))}/mes · ${usd(microToUsd(cfg.globalDailyMicro))}/día`} />
        <Stat label="Negocios" value={String(businesses.length)} note={`${businesses.filter((b) => b.active).length} activos`} />
      </section>

      {!dbConfigured() && <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">La base de datos no está conectada (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).</p>}
      {list && !list.ok && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          No se pudo leer la lista ({list.message}). ¿Has ejecutado <code>supabase/stella.sql</code> en Supabase? Mira la guía, paso «Preparar Supabase».
        </p>
      )}

      <p className="text-sm text-muted">
        Stella de LOCALIS (nuestra propia web):{" "}
        <Link href="/admin/stella/nuevo?plantilla=prueba" className="text-cyan-300 underline">
          crear negocio de PRUEBA (datos ficticios)
        </Link>{" "}
        ·{" "}
        <Link href="/admin/stella/localis/prueba" className="text-cyan-300 underline">
          abrir prueba
        </Link>
        .
      </p>

      <section aria-labelledby="neg-h">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="neg-h" className="font-display text-2xl font-bold">
            Negocios
          </h2>
          <Link href="/admin/stella/nuevo" className="btn btn-primary min-h-[44px]">
            + Dar de alta un negocio
          </Link>
        </div>
        {businesses.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Todavía no hay negocios clientes. Pulsa «Dar de alta un negocio» para crear el primero.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {businesses.map((b) => {
              const u = byBiz(b.id);
              return (
                <li key={b.id} className="rounded-2xl border border-white/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link href={`/admin/stella/${b.id}`} className="font-display text-lg font-bold text-cyan-300 underline">
                        {b.name}
                      </Link>
                      <p className="text-xs text-muted">
                        id: {b.id} · {b.domains.join(", ") || "sin dominios"}
                      </p>
                    </div>
                    <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (b.active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-muted")}>{b.active ? "Activo" : "Desactivado"}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Este mes: {u.messages} mensajes · {u.contacts} contactos · {usd(u.cost)} de IA (tope {usd(b.monthlyBudgetUsd)})
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className={"mt-1 font-display text-2xl font-bold " + (tone === "ok" ? "text-emerald-300" : tone === "warn" ? "text-amber-200" : "")}>{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}
