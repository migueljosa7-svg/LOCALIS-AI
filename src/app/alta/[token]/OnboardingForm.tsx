"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { saveOnboardingAction, type OnboardingState } from "../actions";

export interface OnboardingDefaults {
  name: string;
  sector: string;
  area: string;
  description: string;
  website: string;
  address: string;
  extra: string;
  services: string;
  faqs: string;
  hours: string;
  whatsapp: string;
  phone: string;
  notifyEmail: string;
  domains: string;
  privacyUrl: string;
  notAvailable: string;
}

const input = "mt-1 min-h-[48px] w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-base outline-none placeholder:text-muted focus:border-cyan-500/60";
const label = "block text-sm font-semibold";
const hint = "mt-0.5 block text-xs font-normal text-muted";

export default function OnboardingForm({ token, d }: { token: string; d: OnboardingDefaults }) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(saveOnboardingAction, {});
  if (state.done) {
    return (
      <div role="status" className="space-y-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-6 text-center" data-testid="alta-hecho">
        <CheckCircle2 size={40} className="mx-auto text-emerald-300" aria-hidden="true" />
        <h2 className="font-display text-2xl font-bold">¡Gracias! Hemos recibido tu información</h2>
        <p className="text-sm text-emerald-100">La revisaremos y te avisaremos antes de activar nada. Puedes cerrar esta página; si quieres añadir algo más, vuelve a abrir el mismo enlace.</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="token" value={token} />
      {state.errors?.length ? (
        <div role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <ul className="list-disc pl-5">
            {state.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <legend className="px-2 font-display text-lg font-bold">1 · Tu negocio</legend>
        <label className={label}>
          Nombre del negocio
          <input name="name" defaultValue={d.name} required maxLength={120} className={input} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Sector
            <input name="sector" defaultValue={d.sector} maxLength={120} placeholder="Peluquería, clínica, taller…" className={input} />
          </label>
          <label className={label}>
            Ciudad o zona
            <input name="area" defaultValue={d.area} maxLength={120} className={input} />
          </label>
          <label className={label}>
            Tu página web
            <input name="website" defaultValue={d.website} type="url" placeholder="https://" className={input} />
          </label>
          <label className={label}>
            Dirección
            <input name="address" defaultValue={d.address} maxLength={200} className={input} />
          </label>
        </div>
        <label className={label}>
          ¿Qué hace tu negocio? (2–3 frases)
          <textarea name="description" defaultValue={d.description} rows={3} maxLength={700} className={input} />
        </label>
        <label className={label}>
          Información que debe conocer el asistente
          <span className={hint}>Cosas específicas: formas de pago, aparcamiento, idiomas, política de cancelación… Solo lo que sea cierto.</span>
          <textarea name="extra" defaultValue={d.extra} rows={3} maxLength={400} className={input} />
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <legend className="px-2 font-display text-lg font-bold">2 · Servicios, precios y horario</legend>
        <label className={label}>
          Servicios y precios (uno por línea)
          <span className={hint}>Formato: Nombre | Precio | Detalle. El precio y el detalle son opcionales. El asistente NO inventará precios que no pongas aquí.</span>
          <textarea name="services" defaultValue={d.services} rows={7} placeholder={"Corte de pelo | 15 € | Incluye lavado\nTinte | desde 35 €"} className={input + " font-mono text-sm"} />
        </label>
        <label className={label}>
          Horario
          <input name="hours" defaultValue={d.hours} maxLength={300} placeholder="L–V 9:00–20:00, S 10:00–14:00" className={input} />
        </label>
        <label className={label}>
          Preguntas frecuentes (una por línea)
          <span className={hint}>Formato: Pregunta | Respuesta.</span>
          <textarea name="faqs" defaultValue={d.faqs} rows={6} placeholder={"¿Aceptáis tarjeta? | Sí, Visa y Mastercard."} className={input + " font-mono text-sm"} />
        </label>
        <label className={label}>
          Cosas que NO ofreces (una por línea, opcional)
          <textarea name="notAvailable" defaultValue={d.notAvailable} rows={2} className={input} />
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <legend className="px-2 font-display text-lg font-bold">3 · Contacto</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            WhatsApp del negocio
            <span className={hint}>Con prefijo de país, solo números. Ej.: 34600123456</span>
            <input name="whatsapp" defaultValue={d.whatsapp} inputMode="numeric" className={input} />
          </label>
          <label className={label}>
            Teléfono
            <input name="phone" defaultValue={d.phone} type="tel" maxLength={40} className={input} />
          </label>
          <label className={label}>
            Email donde quieres recibir los contactos
            <input name="notifyEmail" defaultValue={d.notifyEmail} type="email" maxLength={160} className={input} />
          </label>
          <label className={label}>
            Política de privacidad de tu web
            <span className={hint}>Dirección https:// donde está publicada.</span>
            <input name="privacyUrl" defaultValue={d.privacyUrl} type="url" placeholder="https://" className={input} />
          </label>
        </div>
        <label className={label}>
          Dominio de tu web (donde se instalará el asistente)
          <span className={hint}>Ej.: minegocio.es</span>
          <input name="domains" defaultValue={d.domains} className={input} />
        </label>
      </fieldset>

      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          No rellenar
          <input name="website_confirm" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex items-start gap-2.5 text-sm leading-snug">
        <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-400" />
        <span>
          Confirmo que esta información es correcta y autorizo a LOCALIS AI a usarla para configurar el asistente de mi negocio.{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">
            Política de privacidad
          </a>
        </span>
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary min-h-[56px] w-full text-base disabled:opacity-60">
        {pending ? "Guardando…" : "Enviar mi información"}
      </button>
      <p className="text-center text-xs text-muted">Esto no activa nada: LOCALIS AI revisará tu ficha y te avisará antes de activar tu asistente.</p>
    </form>
  );
}
