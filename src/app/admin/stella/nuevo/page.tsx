import type { Metadata } from "next";
import Link from "next/link";
import BusinessForm, { type FormDefaults } from "../BusinessForm";
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
export default async function NewBusinessPage({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const { lead: leadId } = await searchParams;
  let lead: LeadRow | null = null;
  if (leadId && /^[0-9a-f-]{36}$/i.test(leadId)) {
    const r = await rest<LeadRow[]>(`leads?select=*&id=eq.${encodeURIComponent(leadId)}&limit=1`);
    lead = r.ok ? (r.data[0] ?? null) : null;
  }
  const digits = (lead?.phone ?? "").replace(/\D/g, "");
  const d: FormDefaults = {
    id: lead ? slug(lead.business_name) : "",
    name: lead?.business_name ?? "",
    sector: "",
    area: "",
    about: "",
    services: "",
    faqs: "",
    hours: "",
    whatsapp: digits.length === 9 ? `34${digits}` : digits,
    phone: lead?.phone ?? "",
    notifyEmail: lead?.email ?? "",
    greeting: lead ? defaultGreeting(lead.business_name) : "",
    notAvailable: "",
    privacyUrl: "",
    domains: "",
    dailyBudgetUsd: "1",
    monthlyBudgetUsd: "5",
    notes: lead ? `Origen: solicitud recibida el ${new Date(lead.created_at).toLocaleDateString("es-ES")} (${lead.contact_name}, ${lead.email}).` : "",
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
