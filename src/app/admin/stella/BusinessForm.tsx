"use client";

import { useActionState, useRef, useState } from "react";
import { activationChecklist } from "@/lib/stella/ficha";
import { parseServices, parseFaqs } from "@/lib/stella/ficha";
import { parseDomains } from "@/lib/stella/domains";
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
  // Alta nueva = asistente por pasos con revisión final. Edición = ficha completa en una sola pantalla.
  const guided = mode === "create";
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [snap, setSnap] = useState<Record<string, string> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const STEP_LABELS = ["Negocio", "Lo que sabe", "Contacto", "Seguridad", "Revisar"];
  const read = (): Record<string, string> => {
    const out: Record<string, string> = {};
    if (formRef.current) new FormData(formRef.current).forEach((v, k) => (out[k] = String(v)));
    return out;
  };
  const go = (n: number) => {
    const v = read();
    if (n > step && step === 1) {
      if (!/^[a-z0-9-]{2,40}$/.test((v.id ?? "").trim())) return setStepError("El identificador solo admite minúsculas, números y guiones (2–40). Ej.: peluqueria-ana");
      if ((v.name ?? "").trim().length < 2) return setStepError("Escribe el nombre del negocio.");
    }
    setStepError("");
    if (n === 5) setSnap(v);
    setStep(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };
  const show = (n: number) => !guided || step === n;
  const d = defaults;
  return (
    <form ref={formRef} action={action} noValidate={guided} onSubmit={(e) => guided && step !== 5 && e.preventDefault()} className="space-y-8">
      {guided && (
        <nav aria-label="Pasos del alta" className="flex gap-1 overflow-x-auto">
          {STEP_LABELS.map((l, i) => (
            <button key={l} type="button" onClick={() => go(i + 1)} aria-current={step === i + 1 ? "step" : undefined} className={"min-h-[44px] shrink-0 rounded-xl px-3 text-sm font-semibold " + (step === i + 1 ? "bg-cyan-400/15 text-cyan-100" : "text-muted hover:bg-white/5")}>
              {i + 1}. {l}
            </button>
          ))}
        </nav>
      )}
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

      <fieldset hidden={!show(1)} className="space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
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

      <fieldset hidden={!show(2)} className="space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
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

      <fieldset hidden={!show(3)} className="space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
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

      <fieldset hidden={!show(4)} className="space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
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

      {guided && step === 5 && snap && <Review v={snap} />}
      {stepError && (
        <p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {stepError}
        </p>
      )}
      {guided ? (
        <div className="flex flex-wrap gap-3">
          {step > 1 && (
            <button type="button" onClick={() => go(step - 1)} className="btn btn-ghost min-h-[48px] px-6">
              ← Atrás
            </button>
          )}
          {step < 5 ? (
            <button key="siguiente" type="button" onClick={() => go(step + 1)} className="btn btn-primary min-h-[48px] px-6">
              Siguiente →
            </button>
          ) : (
            <button key="crear" type="submit" disabled={pending} className="btn btn-primary min-h-[48px] px-6 disabled:opacity-50">
              {pending ? "Guardando…" : "Crear negocio (queda desactivado)"}
            </button>
          )}
        </div>
      ) : (
        <button type="submit" disabled={pending} className="btn btn-primary min-h-[48px] px-6 disabled:opacity-50">
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      )}
    </form>
  );
}

// Paso final del alta: resumen de lo que se va a crear y qué falta para poder activarlo.
function Review({ v }: { v: Record<string, string> }) {
  const services = parseServices(v.services ?? "").items;
  const faqs = parseFaqs(v.faqs ?? "").items;
  const domains = parseDomains(v.domains ?? "").hosts;
  const missing = activationChecklist({ name: v.name ?? "", about: v.about ?? "", services, whatsapp: (v.whatsapp ?? "").replace(/\D/g, ""), domains, privacyUrl: (v.privacyUrl ?? "").trim() });
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <section aria-labelledby="rev-h" className="space-y-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.04] p-4 sm:p-5" data-testid="alta-revision">
      <h3 id="rev-h" className="font-display text-lg font-bold">
        5 · Revisa antes de crear
      </h3>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-muted">Negocio</dt>
        <dd>
          {v.name} <code className="text-xs text-muted">({v.id})</code>
        </dd>
        <dt className="text-muted">Servicios</dt>
        <dd>{services.length} · {services.filter((x) => x.price).length} con precio</dd>
        <dt className="text-muted">Preguntas frecuentes</dt>
        <dd>{faqs.length}</dd>
        <dt className="text-muted">Contacto</dt>
        <dd>WhatsApp {v.whatsapp || "—"} · teléfono {v.phone || "—"}</dd>
        <dt className="text-muted">Dominios</dt>
        <dd>{domains.join(", ") || "—"}</dd>
        <dt className="text-muted">Topes de gasto</dt>
        <dd>{v.dailyBudgetUsd || "1"} $/día · {v.monthlyBudgetUsd || "5"} $/mes</dd>
      </dl>
      {missing.length === 0 ? (
        <p className="text-sm text-emerald-200">Ficha completa: podrás activarla tras hacer una prueba.</p>
      ) : (
        <div>
          <p className="text-sm font-semibold text-amber-100">Se creará desactivado. Antes de activar falta:</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-amber-100">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-muted">
        Al crearlo se genera el código de instalación y el enlace para que el cliente complete o corrija su ficha. Código previsto:
        <code className="mt-1 block break-all rounded-lg bg-black/40 p-2">{`<script src="${origin}/stella.js" data-negocio="${v.id}" defer></script>`}</code>
      </p>
    </section>
  );
}
