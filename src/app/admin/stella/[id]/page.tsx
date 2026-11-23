import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BusinessForm from "../BusinessForm";
import { toggleActiveAction } from "../actions";
import { listLeadsBySource } from "@/lib/db";
import { activationChecklist, faqsToText, servicesToText } from "@/lib/stella/ficha";
import { fetchBusiness, monthUsage } from "@/lib/stella/store";
import { microToUsd } from "@/lib/stella/cost";
import { readConfig } from "@/lib/stella/config";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stella · negocio", robots: { index: false, follow: false } };

const AVISOS: Record<string, { tone: "ok" | "warn"; text: string }> = {
  creado: { tone: "ok", text: "Negocio creado y desactivado. Completa la ficha, haz una prueba y actívalo." },
  guardado: { tone: "ok", text: "Cambios guardados." },
  activado: { tone: "ok", text: "Stella ACTIVADA para este negocio." },
  desactivado: { tone: "ok", text: "Stella DESACTIVADA: el chat dejará de funcionar en su web en unos segundos." },
  faltan: { tone: "warn", text: "No se puede activar: faltan datos (mira «Antes de activar»)." },
  error: { tone: "warn", text: "No se pudo cambiar el estado. Inténtalo de nuevo." },
};
const fmt = (iso: string) => new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const usd = (n: number) => `${n.toFixed(2).replace(".", ",")} $`;

export default async function BusinessPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aviso?: string }> }) {
  const { id } = await params;
  const { aviso } = await searchParams;
  const b = await fetchBusiness(id);
  if (!b || b.builtin) notFound();

  const [usage, contacts] = await Promise.all([monthUsage(id), listLeadsBySource(`stella:${id}`)]);
  const rows = usage.ok ? usage.data : [];
  const sum = (k: "messages" | "contacts" | "errors") => rows.reduce((a, r) => a + r[k], 0);
  const cost = microToUsd(rows.reduce((a, r) => a + Number(r.cost_micro), 0));
  const today = new Date().toISOString().slice(0, 10);
  const costToday = microToUsd(rows.filter((r) => r.day === today).reduce((a, r) => a + Number(r.cost_micro), 0));
  const missing = activationChecklist(b);
  const cfg = readConfig();
  const snippet = `<script src="${SITE_URL}/stella.js" data-negocio="${b.id}" defer></script>`;
  const notice = aviso ? AVISOS[aviso] : undefined;

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <p className="text-sm">
        <Link href="/admin/stella" className="text-cyan-300 underline">
          ← Negocios de Stella
        </Link>
      </p>

      {notice && (
        <p role="status" className={"rounded-xl border px-4 py-3 text-sm " + (notice.tone === "ok" ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100" : "border-amber-400/40 bg-amber-500/10 text-amber-100")}>
          {notice.text}
        </p>
      )}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{b.name}</h1>
          <p className="text-sm text-muted">id: {b.id}</p>
        </div>
        <form action={toggleActiveAction} className="flex items-center gap-3">
          <input type="hidden" name="id" value={b.id} />
          <input type="hidden" name="active" value={b.active ? "0" : "1"} />
          <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (b.active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-muted")}>{b.active ? "Activo" : "Desactivado"}</span>
          <button type="submit" className={"min-h-[44px] rounded-xl px-4 text-sm font-bold " + (b.active ? "border border-red-400/40 text-red-200" : "bg-emerald-400 text-[#04121a]")}>
            {b.active ? "Desactivar" : "Activar"}
          </button>
        </form>
      </header>

      {!b.active && (
        <section aria-labelledby="chk-h" className="rounded-2xl border border-white/10 p-4">
          <h2 id="chk-h" className="font-display text-lg font-bold">
            Antes de activar
          </h2>
          {missing.length === 0 ? (
            <p className="mt-2 text-sm text-emerald-200">Ficha completa. Haz una prueba y verifica el dominio antes de pulsar «Activar».</p>
          ) : (
            <ul className="mt-2 list-disc pl-5 text-sm text-amber-100">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section aria-labelledby="prueba-h" className="rounded-2xl border border-white/10 p-4">
        <h2 id="prueba-h" className="font-display text-lg font-bold">
          Probar Stella de este negocio
        </h2>
        <p className="mt-1 text-sm text-muted">
          {cfg.enabled
            ? "Abre el chat real con la ficha guardada, aunque el negocio esté desactivado. Gasta unos céntimos de IA y no guarda contactos."
            : "La IA está apagada (falta ANTHROPIC_API_KEY): la prueba mostrará un aviso hasta que se configure."}
        </p>
        <Link href={`/admin/stella/${b.id}/prueba`} className="btn btn-primary mt-3 min-h-[44px]">
          Abrir prueba
        </Link>
      </section>

      <section aria-labelledby="inst-h" className="rounded-2xl border border-white/10 p-4">
        <h2 id="inst-h" className="font-display text-lg font-bold">
          Código de instalación
        </h2>
        <p className="mt-1 text-sm text-muted">Se pega en la web del cliente justo antes de &lt;/body&gt;. Solo funciona en los dominios autorizados: {b.domains.join(", ") || "ninguno todavía"}.</p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-black/40 p-3 text-xs select-all">{snippet}</pre>
      </section>

      <section aria-labelledby="uso-h" className="rounded-2xl border border-white/10 p-4">
        <h2 id="uso-h" className="font-display text-lg font-bold">
          Consumo de este mes
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Mensajes</dt>
            <dd className="font-display text-xl font-bold">{sum("messages")}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Contactos</dt>
            <dd className="font-display text-xl font-bold">{sum("contacts")}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Coste de IA</dt>
            <dd className="font-display text-xl font-bold">{usd(cost)}</dd>
            <dd className="text-xs text-muted">tope {usd(b.monthlyBudgetUsd)}/mes</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Hoy</dt>
            <dd className="font-display text-xl font-bold">{usd(costToday)}</dd>
            <dd className="text-xs text-muted">tope {usd(b.dailyBudgetUsd)}/día</dd>
          </div>
        </dl>
        {sum("errors") > 0 && <p className="mt-2 text-xs text-amber-200">{sum("errors")} errores del modelo este mes (mira los registros de Vercel).</p>}
      </section>

      <section aria-labelledby="cont-h">
        <h2 id="cont-h" className="font-display text-lg font-bold">
          Contactos generados ({contacts.ok ? contacts.data.length : "—"})
        </h2>
        {!contacts.ok ? (
          <p className="mt-2 text-sm text-red-200">No se pudieron leer los contactos ({contacts.message}).</p>
        ) : contacts.data.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Todavía no ha dejado sus datos nadie. Cada contacto aparece aquí y en el panel principal (origen «stella:{b.id}»).</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {contacts.data.map((c) => (
              <li key={c.id} className="rounded-xl border border-white/10 p-3 text-sm">
                <p className="font-semibold">
                  {c.contact_name} · <a className="text-cyan-300 underline" href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a>
                  {c.email && (
                    <>
                      {" "}
                      · <a className="text-cyan-300 underline" href={`mailto:${c.email}`}>{c.email}</a>
                    </>
                  )}
                </p>
                <p className="text-xs text-muted">{fmt(c.created_at)} · estado: {c.status}</p>
                {c.details && <p className="mt-1 whitespace-pre-line text-xs">{c.details}</p>}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted">Para cambiar el estado de un contacto o añadir notas, usa el panel principal (/admin).</p>
      </section>

      <section aria-labelledby="ficha-h">
        <h2 id="ficha-h" className="mb-4 font-display text-2xl font-bold">
          Ficha del negocio
        </h2>
        <BusinessForm
          mode="edit"
          defaults={{
            id: b.id,
            name: b.name,
            sector: b.sector,
            area: b.area,
            about: b.about,
            services: servicesToText(b.services),
            faqs: faqsToText(b.faqs),
            hours: b.hours ?? "",
            whatsapp: b.whatsapp,
            phone: b.phone ?? "",
            notifyEmail: b.notifyEmail ?? "",
            greeting: b.greeting,
            notAvailable: b.notAvailable.join("\n"),
            privacyUrl: b.privacyUrl,
            domains: b.domains.join("\n"),
            dailyBudgetUsd: String(b.dailyBudgetUsd),
            monthlyBudgetUsd: String(b.monthlyBudgetUsd),
            notes: b.notes ?? "",
          }}
        />
      </section>
    </main>
  );
}
