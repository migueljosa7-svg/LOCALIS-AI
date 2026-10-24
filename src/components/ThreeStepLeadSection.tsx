"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Globe, Bot, Navigation, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Building2, User, Phone, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitLead, validateLead, type LeadErrors } from "@/lib/lead";
import { trackLead } from "@/lib/analytics";
import WhatsAppIcon from "./WhatsAppIcon";
import { CONTACT, WA_AUDIT_TEXT, waLink } from "@/lib/site";

type Service = "web" | "ia" | "gps";

const SERVICES: { value: Service; title: string; description: string; icon: typeof Globe; sector: string }[] = [
  { value: "web", title: "Página web", description: "Web rápida, con tu marca y lista para captar clientes en Google.", icon: Globe, sector: "Servicio: Página web" },
  { value: "ia", title: "Asistente Stella IA", description: "Atención por WhatsApp, citas y facturas en automático 24/7.", icon: Bot, sector: "Servicio: Asistente IA para citas" },
  { value: "gps", title: "Reparto con GPS", description: "Tus repartidores en el mapa y seguimiento para el cliente, sin comisiones.", icon: Navigation, sector: "Servicio: Sistema GPS de reparto" },
];

const STEPS = ["Tu necesidad", "Tus datos", "¡Listo!"];

interface FormState {
  service: Service;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
}

const EMPTY: FormState = { service: "web", businessName: "", contactName: "", phone: "", email: "" };

export default function ThreeStepLeadSection() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const sector = SERVICES.find((s) => s.value === form.service)?.sector ?? "Servicio";
    const lead = { businessName: form.businessName, sector, contactName: form.contactName, phone: form.phone, email: form.email };
    const found = validateLead(lead);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Lleva el foco al primer campo con error (accesibilidad).
      const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await submitLead({ ...lead, source: "landing-cita-3pasos" });
      trackLead("form_cita", form.service);
    } finally {
      setSubmitting(false);
      setStep(2);
    }
  };

  return (
    <section id="cita" aria-labelledby="cita-title" className="relative w-full py-20 lg:py-28">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="eyebrow mb-5">
            <CheckCircle2 size={13} aria-hidden="true" /> 3 pasos · menos de 1 minuto
          </span>
          <h2 id="cita-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Reserva tu <span className="gradient-text">auditoría y demo gratuita</span>
          </h2>
          <p className="mt-5 text-muted text-base sm:text-lg">
            Sin compromiso. Analizamos tu negocio y te enseñamos, con tus datos, cuánto puedes ganar y ahorrar.
          </p>
        </div>

        <div className="border-glow rounded-[2rem] p-5 sm:p-8 lg:p-10 shadow-glass max-w-3xl mx-auto">
          {/* Indicador de pasos */}
          <ol className="flex items-center gap-2 mb-8" aria-label="Progreso del formulario">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-2 flex-1 last:flex-none" aria-current={i === step ? "step" : undefined}>
                <span
                  className={cn(
                    "w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    i < step ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : i === step ? "bg-brand" : "bg-white/[0.05] text-muted border border-white/10"
                  )}
                >
                  {i < step ? <Check size={14} aria-hidden="true" /> : i + 1}
                </span>
                <span className={cn("text-xs font-semibold hidden sm:inline whitespace-nowrap", i <= step ? "text-foreground" : "text-muted")}>{label}</span>
                {i < STEPS.length - 1 && <span className={cn("h-px flex-1 mx-1", i < step ? "bg-cyan-500/50" : "bg-white/10")} aria-hidden="true" />}
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <fieldset>
                  <legend className="font-display font-semibold text-lg mb-4">¿Qué necesita tu negocio?</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SERVICES.map((svc) => {
                      const selected = form.service === svc.value;
                      return (
                        <label
                          key={svc.value}
                          className={cn(
                            "relative cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-colors active:scale-[0.99] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan-400",
                            selected ? "border-cyan-500/70 bg-cyan-500/[0.07]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                          )}
                        >
                          <input
                            type="radio"
                            name="service"
                            value={svc.value}
                            checked={selected}
                            onChange={() => update("service", svc.value)}
                            className="sr-only"
                          />
                          <span className="flex sm:block items-center gap-3">
                            <span
                              className={cn(
                                "w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border",
                                selected ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300" : "bg-white/[0.04] border-white/10 text-muted"
                              )}
                            >
                              <svc.icon size={20} aria-hidden="true" />
                            </span>
                            <span className="sm:mt-3 block">
                              <span className="block font-semibold text-[15px]">{svc.title}</span>
                              <span className="block text-xs text-muted leading-relaxed mt-1">{svc.description}</span>
                            </span>
                          </span>
                          {selected && (
                            <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                              <Check size={12} aria-hidden="true" />
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-primary w-full mt-6">
                    Continuar <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </fieldset>
              )}

              {step === 1 && (
                <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field id={`${uid}-biz`} label="Nombre de tu negocio" icon={<Building2 size={16} />} error={errors.businessName}>
                      <input
                        id={`${uid}-biz`}
                        type="text"
                        value={form.businessName}
                        onChange={(e) => update("businessName", e.target.value)}
                        placeholder="Ej. Frutería Pepe"
                        autoComplete="organization"
                        aria-invalid={Boolean(errors.businessName)}
                        aria-describedby={errors.businessName ? `${uid}-biz-err` : undefined}
                        className={inputCls(errors.businessName)}
                      />
                    </Field>
                    <Field id={`${uid}-name`} label="Tu nombre" icon={<User size={16} />} error={errors.contactName}>
                      <input
                        id={`${uid}-name`}
                        type="text"
                        value={form.contactName}
                        onChange={(e) => update("contactName", e.target.value)}
                        placeholder="Tu nombre"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.contactName)}
                        aria-describedby={errors.contactName ? `${uid}-name-err` : undefined}
                        className={inputCls(errors.contactName)}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field id={`${uid}-tel`} label="Teléfono / WhatsApp" icon={<Phone size={16} />} error={errors.phone}>
                      <input
                        id={`${uid}-tel`}
                        type="tel"
                        inputMode="tel"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="612 345 678"
                        autoComplete="tel"
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? `${uid}-tel-err` : undefined}
                        className={inputCls(errors.phone)}
                      />
                    </Field>
                    <Field id={`${uid}-mail`} label="Email" icon={<Mail size={16} />} error={errors.email}>
                      <input
                        id={`${uid}-mail`}
                        type="email"
                        inputMode="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="tu@negocio.com"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? `${uid}-mail-err` : undefined}
                        className={inputCls(errors.email)}
                      />
                    </Field>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(0)} className="btn btn-ghost px-4" aria-label="Volver al paso anterior">
                      <ArrowLeft size={17} aria-hidden="true" />
                    </button>
                    <button type="submit" disabled={submitting} className="btn btn-primary flex-1 disabled:opacity-70">
                      {submitting ? (
                        <>
                          <Loader2 size={17} className="animate-spin" aria-hidden="true" /> Enviando…
                        </>
                      ) : (
                        <>
                          Reservar mi auditoría gratis <ArrowRight size={17} aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11.5px] text-muted text-center leading-relaxed">
                    Solo usaremos tus datos para contactarte sobre tu solicitud.{" "}
                    <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                      Política de privacidad
                    </a>
                    .
                  </p>
                </form>
              )}

              {step === 2 && (
                <div className="text-center py-4" role="status" aria-live="polite">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5">
                    <CheckCircle2 size={32} className="text-emerald-400" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-2xl">¡Solicitud recibida, {form.contactName.split(" ")[0] || "gracias"}!</h3>
                  <p className="text-muted mt-3 max-w-md mx-auto leading-relaxed">
                    Te contactamos en menos de 24 h laborables para preparar tu demo personalizada. Si tienes prisa, escríbenos ya por
                    WhatsApp.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
                    <a href={waLink(WA_AUDIT_TEXT)} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-[#05210f]">
                      <WhatsAppIcon size={18} /> Hablar ya por WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setStep(0);
                        setForm(EMPTY);
                        setErrors({});
                      }}
                      className="btn btn-ghost"
                    >
                      Enviar otra solicitud
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted">¿Prefieres hablar ahora mismo?</p>
          <a
            href={waLink(WA_AUDIT_TEXT)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5ee08f] hover:text-[#7ff0a8]"
          >
            <WhatsAppIcon size={18} /> WhatsApp {CONTACT.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}

function inputCls(error?: string) {
  return cn(
    "focus-ring w-full min-h-[50px] rounded-xl bg-[#0B0F17]/80 border pl-11 pr-4 text-[15px] text-foreground placeholder:text-muted/70 transition-colors",
    error ? "border-red-400/60" : "border-white/10"
  );
}

function Field({ id, label, icon, error, children }: { id: string; label: string; icon: ReactNode; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground/90 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none", error ? "text-red-300" : "text-muted")} aria-hidden="true">
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p id={`${id}-err`} className="text-xs text-red-300 mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
