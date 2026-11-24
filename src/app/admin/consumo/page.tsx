import type { Metadata } from "next";
import Link from "next/link";
import { dbConfigured } from "@/lib/db";
import { buildOverview } from "@/lib/admin/overview";
import { listBusinesses, monthUsage } from "@/lib/stella/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Consumo y límites", robots: { index: false, follow: false } };

const usd = (n: number) => n.toFixed(2).replace(".", ",") + " $";

export default async function ConsumoPage() {
  if (!dbConfigured()) return <main className="px-4 py-10"><h1 className="font-display text-3xl font-bold">Consumo y límites</h1><p className="mt-3 text-muted">La base de datos no está conectada (ver Entorno).</p></main>;
  const [biz, usage] = await Promise.all([listBusinesses(), monthUsage()]);
  const businesses = biz.ok ? biz.data : [];
  const ov = buildOverview({ now: Date.now(), leads: [], businesses, usage: usage.ok ? usage.data : [], designs: [] });
  const budgets = new Map(businesses.map((b) => [b.id, b]));
  return (
    <main className="space-y-6 px-4 py-8 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Consumo y límites</h1>
        <p className="mt-1 text-sm text-muted">Gasto de IA de Stella este mes por negocio, calculado con los tokens reales devueltos por Anthropic. Si un negocio llega a su tope, Stella deja de responder y le pasa el cliente a WhatsApp. Total del mes: <strong>{usd(ov.stella.costMonthUsd)}</strong>.</p>
      </header>
      {!usage.ok && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">No se pudo leer el consumo.</p>}
      {ov.stella.rows.length === 0 ? <p className="text-sm text-muted">Todavía no hay negocios de Stella ni consumo.</p> : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-muted">
              <tr><th className="p-3">Negocio</th><th className="p-3">Mensajes</th><th className="p-3">Contactos</th><th className="p-3">Errores</th><th className="p-3">Gasto del mes</th><th className="p-3">Tope diario / mensual</th></tr>
            </thead>
            <tbody>
              {ov.stella.rows.map((r) => (
                <tr key={r.id} className="border-t border-white/[0.07]">
                  <td className="p-3"><Link href={`/admin/stella/${r.id}`} className="text-cyan-300 underline">{r.name}</Link> <span className={r.active ? "text-emerald-300" : "text-muted"}>●</span></td>
                  <td className="p-3">{r.messages}</td>
                  <td className="p-3">{r.contacts}</td>
                  <td className="p-3">{r.errors}</td>
                  <td className="p-3">{usd(r.costUsd)} <span className={r.pct >= 80 ? "text-red-300" : "text-muted"}>({r.pct} %)</span></td>
                  <td className="p-3 text-muted">{usd(budgets.get(r.id)?.dailyBudgetUsd ?? 0)} / {usd(r.monthlyBudgetUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted">Sin crédito en Anthropic no hay consumo: Stella no responde y esta tabla seguirá a cero hasta la primera prueba real.</p>
    </main>
  );
}
