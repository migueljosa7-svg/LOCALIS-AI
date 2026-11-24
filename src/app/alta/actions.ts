"use server";

import { buildFicha, type FichaInput } from "@/lib/stella/ficha";
import { composeAbout, ABOUT_MAX } from "@/lib/stella/about";
import { readConfig } from "@/lib/stella/config";
import { readOnboardingToken } from "@/lib/stella/onboarding";
import { fetchBusiness, saveBusiness } from "@/lib/stella/store";

// El cliente completa la ficha de SU negocio con un enlace firmado. Nunca puede activar Stella, cambiar presupuestos,
// ver otros negocios ni editar una ficha que ya está activa (solo el panel puede hacerlo).

export interface OnboardingState {
  errors?: string[];
  done?: boolean;
}

const hits = new Map<string, { n: number; reset: number }>();
function limited(key: string): boolean {
  const now = Date.now();
  const e = hits.get(key);
  if (!e || now > e.reset) {
    hits.set(key, { n: 1, reset: now + 3_600_000 });
    return false;
  }
  return ++e.n > 20;
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "");

export async function saveOnboardingAction(_prev: OnboardingState, form: FormData): Promise<OnboardingState> {
  void _prev;
  const cfg = readConfig();
  const id = cfg.secret ? await readOnboardingToken(cfg.secret, str(form, "token")) : null;
  if (!id) return { errors: ["Este enlace no es válido o ha caducado. Pide uno nuevo a LOCALIS AI."] };
  if (limited(id)) return { errors: ["Has enviado demasiados cambios seguidos. Inténtalo de nuevo en una hora."] };
  if (str(form, "website_confirm")) return { done: true }; // trampa anti-robots

  const b = await fetchBusiness(id);
  if (!b || b.builtin) return { errors: ["No encontramos tu negocio. Pide un enlace nuevo a LOCALIS AI."] };
  if (b.active) return { errors: ["Tu asistente ya está activo. Para cambiar información escribe a LOCALIS AI y lo actualizamos juntos."] };
  if (str(form, "consent") !== "on") return { errors: ["Marca la casilla para que LOCALIS AI pueda usar esta información."] };

  const about = composeAbout({ description: str(form, "description"), website: str(form, "website"), address: str(form, "address"), extra: str(form, "extra") });
  if (about.length > ABOUT_MAX) return { errors: [`La descripción, la dirección y la información adicional suman ${about.length} caracteres: el máximo es ${ABOUT_MAX}. Acorta algún texto.`] };
  const input: FichaInput = {
    id,
    name: str(form, "name") || b.name,
    sector: str(form, "sector"),
    area: str(form, "area"),
    about,
    services: str(form, "services"),
    faqs: str(form, "faqs"),
    hours: str(form, "hours"),
    whatsapp: str(form, "whatsapp"),
    phone: str(form, "phone"),
    notifyEmail: str(form, "notifyEmail"),
    greeting: b.greeting,
    notAvailable: str(form, "notAvailable"),
    privacyUrl: str(form, "privacyUrl"),
    domains: str(form, "domains"),
    // Lo que no puede tocar el cliente se conserva tal cual:
    dailyBudgetUsd: String(b.dailyBudgetUsd),
    monthlyBudgetUsd: String(b.monthlyBudgetUsd),
    notes: `${(b.notes ?? "").replace(/\n?\[cliente\][^\n]*/g, "").trim()}\n[cliente] completó su ficha el ${new Date().toISOString().slice(0, 10)}: revisar antes de activar.`.trim(),
  };
  const built = buildFicha(input);
  if (!built.ok) return { errors: built.errors };
  const r = await saveBusiness(built.value, { create: false });
  if (!r.ok) return { errors: ["No hemos podido guardar tu información. Inténtalo de nuevo en unos minutos."] };
  return { done: true };
}
