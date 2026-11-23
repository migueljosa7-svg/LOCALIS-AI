import type { Metadata } from "next";
import Link from "next/link";
import BusinessForm, { type FormDefaults } from "../BusinessForm";
import { headers } from "next/headers";
import { rest, type LeadRow } from "@/lib/db";
import { defaultGreeting } from "@/lib/stella/ficha";

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
export default async function NewBusinessPage({ searchParams }: { searchParams: Promise<{ lead?: string; plantilla?: string }> }) {
  const { lead: leadId, plantilla } = await searchParams;
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
      <BusinessForm mode="create" defaults={d} leadId={lead?.id} />
    </main>
  );
}
