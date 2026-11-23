"use server";

import { redirect } from "next/navigation";
import { buildFicha, activationChecklist, type FichaInput } from "@/lib/stella/ficha";
import { fetchBusiness, saveBusiness, setBusinessActive } from "@/lib/stella/store";

// Acciones del panel de Stella. Solo se ejecutan con sesión del panel: el middleware protege /admin
// con usuario y contraseña (las acciones se envían a la propia URL de /admin/stella/…).

export interface FormState {
  errors?: string[];
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "");

export async function saveBusinessAction(_prev: FormState, form: FormData): Promise<FormState> {
  const create = str(form, "mode") === "create";
  const input: FichaInput = {
    id: str(form, "id"),
    name: str(form, "name"),
    sector: str(form, "sector"),
    area: str(form, "area"),
    about: str(form, "about"),
    services: str(form, "services"),
    faqs: str(form, "faqs"),
    hours: str(form, "hours"),
    whatsapp: str(form, "whatsapp"),
    phone: str(form, "phone"),
    notifyEmail: str(form, "notifyEmail"),
    greeting: str(form, "greeting"),
    notAvailable: str(form, "notAvailable"),
    privacyUrl: str(form, "privacyUrl"),
    domains: str(form, "domains"),
    dailyBudgetUsd: str(form, "dailyBudgetUsd") || "1",
    monthlyBudgetUsd: str(form, "monthlyBudgetUsd") || "5",
    notes: str(form, "notes"),
  };
  const built = buildFicha(input);
  if (!built.ok) return { errors: built.errors };
  if (built.value.id === "localis") return { errors: ["«localis» es un identificador reservado. Elige otro."] };

  if (create && (await fetchBusiness(built.value.id))) return { errors: [`Ya existe un negocio con el identificador «${built.value.id}».`] };

  const leadId = str(form, "leadId");
  const r = await saveBusiness(built.value, { create, sourceLeadId: /^[0-9a-f-]{36}$/i.test(leadId) ? leadId : null });
  if (!r.ok) {
    return {
      errors: [
        `No se pudo guardar (${r.message ?? r.reason}). ¿Has ejecutado supabase/stella.sql en Supabase? Mira la guía, paso «Preparar Supabase».`,
      ],
    };
  }
  redirect(`/admin/stella/${built.value.id}?aviso=${create ? "creado" : "guardado"}`);
}

export async function toggleActiveAction(form: FormData): Promise<void> {
  const id = str(form, "id");
  const target = str(form, "active") === "1";
  const b = await fetchBusiness(id);
  if (!b || b.builtin) redirect("/admin/stella");
  if (target) {
    const missing = activationChecklist(b);
    if (missing.length) redirect(`/admin/stella/${id}?aviso=faltan`);
  }
  const r = await setBusinessActive(id, target);
  redirect(`/admin/stella/${id}?aviso=${r.ok ? (target ? "activado" : "desactivado") : "error"}`);
}
