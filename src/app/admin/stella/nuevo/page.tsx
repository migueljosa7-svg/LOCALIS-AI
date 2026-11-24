import type { Metadata } from "next";
import Link from "next/link";
import BusinessForm, { type FormDefaults } from "../BusinessForm";
import { headers } from "next/headers";
import { rest, type LeadRow } from "@/lib/db";
import { defaultGreeting, servicesToText, faqsToText } from "@/lib/stella/ficha";
import { composeAbout } from "@/lib/stella/about";
import { extractDraft, fetchPublicPage, type Draft } from "@/lib/stella/import";
import { fetchBusiness } from "@/lib/stella/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stella · alta de negocio", robots: { index: false, follow: false } };

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

// Alta de un negocio. Con ?lead=<id> se rellenan los datos desde la solicitud recibida (sin inventar nada más).
export default async function NewBusinessPage({ searchParams }: { searchParams: Promise<{ lead?: string; plantilla?: string; web?: string; clonar?: string }> }) {
  const { lead: leadId, plantilla, web, clonar } = await searchParams;
  // Importar borrador desde la web pública del negocio (solo rellena el formulario; nada se guarda ni se activa).
  let draft: Draft | null = null;
  let importError = "";
  if (web?.trim()) {
    try {
      const page = await fetchPublicPage(web);
      draft = extractDraft(page.html, page.url);
    } catch (e) {
      importError = e instanceof Error ? e.message : "No se pudo importar.";
    }
  }
  // Duplicar un negocio existente como plantilla (servicios, preguntas, horario…): útil para varios negocios del mismo sector.
  const base = clonar && /^[a-z0-9-]{2,40}$/.test(clonar) ? await fetchBusiness(clonar) : null;
  let lead: LeadRow | null = null;
  if (leadId && /^[0-9a-f-]{36}$/i.test(leadId)) {
    const r = await rest<LeadRow[]>(`leads?select=*&id=eq.${encodeURIComponent(leadId)}&limit=1`);
    lead = r.ok ? (r.data[0] ?? null) : null;
  }
  const prueba = plantilla === "prueba";
  const host = ((await headers()).get("host") ?? "").split(":")[0];
  const digits = (lead?.phone ?? "").replace(/\D/g, "");
  const d: FormDefaults = {
    id: prueba ? "prueba-peluqueria" : lead ? slug(lead.business_name) : "",
    name: prueba ? "Peluquería de Prueba" : (lead?.business_name ?? ""),
    sector: prueba ? "Peluquería" : "",
    area: prueba ? "Zaragoza (ficticio)" : "",
    about: prueba ? "Negocio FICTICIO para probar Stella. Peluquería de barrio con 20 años de experiencia en corte, color y tratamientos." : "",
    services: prueba ? "Corte de pelo | 15 € | Incluye lavado\nTinte | desde 35 €\nManicura | 20 €\nPeinado de fiesta | 30 € | Con cita previa" : "",
    faqs: prueba ? "¿Aceptáis tarjeta? | Sí, Visa y Mastercard.\n¿Hay que pedir cita? | Sí, por WhatsApp o por teléfono.\n¿Dónde estáis? | En una calle ficticia de Zaragoza." : "",
    hours: prueba ? "L–V 9:00–20:00, S 10:00–14:00" : "",
    whatsapp: prueba ? "34600000000" :  digits.length === 9 ? `34${digits}` : digits,
    phone: prueba ? "976000000" : (lead?.phone ?? ""),
    notifyEmail: prueba ? "" : (lead?.email ?? ""),
    greeting: lead ? defaultGreeting(lead.business_name) : "",
    notAvailable: "",
    privacyUrl: prueba ? `https://${host}/privacy` : "",
    domains: prueba ? host : "",
    dailyBudgetUsd: "1",
    monthlyBudgetUsd: "5",
    notes: prueba ? "NEGOCIO DE PRUEBA con datos ficticios. Desactivar o borrar al terminar." : lead ? `Origen: solicitud recibida el ${new Date(lead.created_at).toLocaleDateString("es-ES")} (${lead.contact_name}, ${lead.email}).` : "",
  };

  if (draft) {
    const first = (a: string[]) => a[0] ?? "";
    const wa = draft.whatsapp || (first(draft.phones).replace(/\D/g, "").length === 9 ? "34" + first(draft.phones).replace(/\D/g, "") : "");
    d.name = draft.name || d.name;
    d.id = d.id || slug(draft.name);
    d.about = composeAbout({ description: draft.description || draft.headline, website: web ?? "", address: draft.address, extra: "" });
    d.services = draft.priceLines.join("\n");
    d.whatsapp = wa;
    d.phone = first(draft.phones);
    d.notifyEmail = first(draft.emails);
    d.domains = draft.host;
    d.notes = `Borrador IMPORTADO de ${web} el ${new Date().toLocaleDateString("es-ES")}: REVISAR todo antes de activar (puede haber datos desfasados o incompletos).` + (draft.instagram ? ` Instagram: ${draft.instagram}.` : "");
  }
  if (base) {
    d.sector = base.sector;
    d.area = base.area;
    d.services = servicesToText(base.services);
    d.faqs = faqsToText(base.faqs);
    d.hours = base.hours ?? "";
    d.notAvailable = base.notAvailable.join("\n");
    d.dailyBudgetUsd = String(base.dailyBudgetUsd);
    d.monthlyBudgetUsd = String(base.monthlyBudgetUsd);
    d.notes = `Creado duplicando la ficha de «${base.name}»: cambiar todo lo que sea específico de este negocio.`;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <p className="text-sm">
        <Link href="/admin/stella" className="text-cyan-300 underline">
          ← Negocios de Stella
        </Link>
      </p>
      <h1 className="font-display text-3xl font-bold">Dar de alta un negocio</h1>
      <p className="text-sm text-muted">
        El negocio se crea <strong>desactivado</strong>. Rellena su ficha, haz una prueba y actívalo cuando todo esté comprobado.
        {lead && " Datos precargados desde la solicitud: revísalos y completa el resto."}
      </p>
      <form method="get" className="space-y-2 rounded-2xl border border-white/10 p-4" aria-labelledby="imp-h">
        <h2 id="imp-h" className="font-display text-base font-bold">
          ¿Tiene web? Prepara un borrador con su información pública
        </h2>
        <p className="text-xs text-muted">Lee solo la página que indiques (nombre, descripción, teléfono, email y precios visibles) y rellena el formulario. No guarda ni activa nada: tú lo revisas.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input name="web" type="url" defaultValue={web ?? ""} placeholder="https://www.minegocio.es" aria-label="Dirección de la web del negocio" className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-base" />
          {lead && <input type="hidden" name="lead" value={lead.id} />}
          <button type="submit" className="btn btn-ghost min-h-[44px] px-5">
            Importar borrador
          </button>
        </div>
        {importError && (
          <p role="alert" className="text-sm text-red-200" data-testid="import-error">
            {importError}
          </p>
        )}
        {draft && (
          <p role="status" className="text-sm text-emerald-200" data-testid="import-ok">
            Borrador importado: {draft.priceLines.length} línea(s) con precio, {draft.phones.length} teléfono(s), {draft.emails.length} email(s). Revisa cada dato en los pasos siguientes.
          </p>
        )}
      </form>
      <BusinessForm mode="create" defaults={d} leadId={lead?.id} />
    </main>
  );
}
