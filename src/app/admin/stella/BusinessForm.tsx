"use client";

import { useActionState } from "react";
import { saveBusinessAction, type FormState } from "./actions";

export interface FormDefaults {
  id: string;
  name: string;
  sector: string;
  area: string;
  about: string;
  services: string;
  faqs: string;
  hours: string;
  whatsapp: string;
  phone: string;
  notifyEmail: string;
  greeting: string;
  notAvailable: string;
  privacyUrl: string;
  domains: string;
  dailyBudgetUsd: string;
  monthlyBudgetUsd: string;
  notes: string;
}

const input = "mt-1 min-h-[44px] w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-base outline-none placeholder:text-muted focus:border-cyan-500/50";
const label = "block text-sm font-semibold";
const hint = "mt-0.5 block text-xs font-normal text-muted";

export default function BusinessForm({ mode, defaults, leadId }: { mode: "create" | "edit"; defaults: FormDefaults; leadId?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveBusinessAction, {});
  const d = defaults;
  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="mode" value={mode} />
      {leadId && <input type="hidden" name="leadId" value={leadId} />}

      {state.errors?.length ? (
        <div role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <p className="font-semibold">Revisa estos puntos:</p>
          <ul className="mt-1 list-disc pl-5">
            {state.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <legend className="px-2 font-display text-lg font-bold">1 · El negocio</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Identificador
            <span className={hint}>Minúsculas, números y guiones. Va en el código de instalación y no se puede cambiar después. Ej.: peluqueria-ana</span>
            <input name="id" defaultValue={d.id} readOnly={mode === "edit"} required pattern="[a-z0-9\-]{2,40}" className={input + (mode === "edit" ? " opacity-70" : "")} />
          </label>
          <label className={label}>
            Nombre del negocio
            <input name="name" defaultValue={d.name} required maxLength={120} className={input} />
          </label>
          <label className={label}>
            Sector
            <input name="sector" defaultValue={d.sector} maxLength={120} placeholder="Peluquería, clínica dental…" className={input} />
          </label>
          <label className={label}>
            Ciudad o zona
            <input name="area" defaultValue={d.area} maxLength={120} className={input} />
          </label>
        </div>
        <label className={label}>
          Qué hace el negocio (1–3 frases)
          <textarea name="about" defaultValue={d.about} rows={3} maxLength={1200} className={input} />
        </label>
        <label className={label}>
          Horario
          <span className={hint}>Solo si se conoce. Si lo dejas vacío, Stella dirá que no lo sabe.</span>
          <input name="hours" defaultValue={d.hours} maxLength={300} placeholder="L–V 9:00–20:00, S 10:00–14:00" className={input} />
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <legend className="px-2 font-display text-lg font-bold">2 · Lo que Stella sabe</legend>
        <label className={label}>
          Servicios y precios (uno por línea)
          <span className={hint}>Formato: Nombre | Precio | Detalle. El precio y el detalle son opcionales. Stella NO inventa precios que no pongas aquí.</span>
          <textarea name="services" defaultValue={d.services} rows={7} placeholder={"Corte de pelo | 15 € | Incluye lavado\nTinte | desde 35 €\nManicura | 20 €"} className={input + " font-mono text-sm"} />
        </label>
        <label className={label}>
          Preguntas frecuentes (una por línea)
          <span className={hint}>Formato: Pregunta | Respuesta.</span>
          <textarea name="faqs" defaultValue={d.faqs} rows={6} placeholder={"¿Aceptáis tarjeta? | Sí, Visa y Mastercard.\n¿Hay que pedir cita? | Sí, por WhatsApp o teléfono."} className={input + " font-mono text-sm"} />
        </label>
        <label className={label}>
          Cosas que NO ofrece (una por línea, opcional)
          <span className={hint}>Si preguntan por ellas, Stella dirá claramente que no están disponibles.</span>
          <textarea name="notAvailable" defaultValue={d.notAvailable} rows={2} className={input} />
        </label>
        <label className={label}>
          Saludo inicial (opcional)
          <span className={hint}>Debe dejar claro que es una IA. Si lo dejas vacío se usa uno estándar.</span>
          <input name="greeting" defaultValue={d.greeting} maxLength={400} className={input} />
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <legend className="px-2 font-display text-lg font-bold">3 · Contacto y avisos</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            WhatsApp
            <span className={hint}>Solo dígitos con prefijo de país. Ej.: 34600123456</span>
            <input name="whatsapp" defaultValue={d.whatsapp} inputMode="numeric" className={input} />
          </label>
          <label className={label}>
            Teléfono (opcional)
            <input name="phone" defaultValue={d.phone} maxLength={40} type="tel" className={input} />
          </label>
          <label className={label}>
            Email para avisos de nuevos contactos
            <span className={hint}>Los avisos llegan siempre a tu email de LOCALIS; este es una copia extra (necesita dominio verificado en Resend).</span>
            <input name="notifyEmail" defaultValue={d.notifyEmail} type="email" maxLength={160} className={input} />
          </label>
          <label className={label}>
            Política de privacidad del negocio
            <span className={hint}>URL https:// de la web del cliente. Es obligatoria: el visitante la ve junto a la casilla de consentimiento.</span>
            <input name="privacyUrl" defaultValue={d.privacyUrl} type="url" placeholder="https://ejemplo.com/privacidad" className={input} />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <legend className="px-2 font-display text-lg font-bold">4 · Seguridad y gasto</legend>
        <label className={label}>
          Dominios autorizados (uno por línea)
          <span className={hint}>Solo estas webs podrán mostrar el chat. Escribe el dominio sin https://, p. ej. ejemplo.com (www.ejemplo.com se incluye solo).</span>
          <textarea name="domains" defaultValue={d.domains} rows={3} className={input + " font-mono text-sm"} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Tope diario de gasto (USD)
            <span className={hint}>Al alcanzarlo, Stella deja de responder hasta el día siguiente y ofrece WhatsApp.</span>
            <input name="dailyBudgetUsd" defaultValue={d.dailyBudgetUsd} inputMode="decimal" className={input} />
          </label>
          <label className={label}>
            Tope mensual de gasto (USD)
            <input name="monthlyBudgetUsd" defaultValue={d.monthlyBudgetUsd} inputMode="decimal" className={input} />
          </label>
        </div>
        <label className={label}>
          Notas internas (Stella no las ve)
          <textarea name="notes" defaultValue={d.notes} rows={3} maxLength={4000} className={input} />
        </label>
      </fieldset>

      <button type="submit" disabled={pending} className="btn btn-primary min-h-[48px] px-6 disabled:opacity-50">
        {pending ? "Guardando…" : mode === "create" ? "Crear negocio (queda desactivado)" : "Guardar cambios"}
      </button>
    </form>
  );
}
