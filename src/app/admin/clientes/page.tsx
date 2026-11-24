import type { Metadata } from "next";
import Link from "next/link";
import { dbConfigured, listLeads } from "@/lib/db";
import { listBusinesses } from "@/lib/stella/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Clientes y negocios", robots: { index: false, follow: false } };

export default async function ClientesPage() {
  if (!dbConfigured()) return <main className="px-4 py-10"><h1 className="font-display text-3xl font-bold">Clientes y negocios</h1><p className="mt-3 text-muted">La base de datos no está conectada (ver Entorno).</p></main>;
  const [leads, biz] = await Promise.all([listLeads(), listBusinesses()]);
  const clients = leads.ok ? leads.data.filter((l) => l.status === "ganado") : [];
  const businesses = biz.ok ? biz.data.filter((b) => !b.builtin) : [];
  return (
    <main className="space-y-10 px-4 py-8 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Clientes y negocios</h1>
        <p className="mt-1 text-sm text-muted">Clientes = leads marcados como «ganado». Negocios = fichas de Stella creadas en el panel. Datos reales.</p>
      </header>
      <section aria-labelledby="cl-h">
        <h2 id="cl-h" className="font-display text-xl font-bold">Clientes ({clients.length})</h2>
        {clients.length === 0 ? <p className="mt-2 text-sm text-muted">Todavía no hay leads en estado «ganado». Cámbialo desde Leads cuando un cliente acepte.</p> : (
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {clients.map((l) => (
              <li key={l.id} className="rounded-2xl border border-white/10 p-4 text-sm">
                <p className="font-semibold">{l.business_name}</p>
                <p>{l.contact_name} · <a className="text-cyan-300 underline" href={`mailto:${l.email}`}>{l.email}</a> · <a className="text-cyan-300 underline" href={`tel:${l.phone.replace(/\s/g, "")}`}>{l.phone}</a></p>
                <p className="text-xs text-muted">{l.service}</p>
                <Link href={`/admin/stella/nuevo?lead=${l.id}`} className="mt-2 inline-block text-xs text-cyan-300 underline">Crear negocio Stella con estos datos</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="nb-h">
        <h2 id="nb-h" className="font-display text-xl font-bold">Negocios con Stella ({businesses.length})</h2>
        {businesses.length === 0 ? <p className="mt-2 text-sm text-muted">Todavía no hay negocios. <Link href="/admin/stella/nuevo" className="text-cyan-300 underline">Crear el primero</Link>.</p> : (
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {businesses.map((b) => (
              <li key={b.id}>
                <Link href={`/admin/stella/${b.id}`} className="flex min-h-[56px] items-center justify-between gap-3 rounded-2xl border border-white/10 p-4 text-sm hover:border-cyan-500/40">
                  <span className="font-semibold">{b.name}</span>
                  <span className={b.active ? "text-emerald-300" : "text-muted"}>{b.active ? "Activo" : "Desactivado"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
