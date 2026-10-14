"use client";

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Building2, Smartphone, Sparkles, ArrowRight, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitLead } from '@/lib/lead';

type Service = 'web' | 'gps' | 'ia';

interface LeadFormData {
  service: Service;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
}
const STEP_LABELS = {
  service: '1. Que necesita tu negocio?',
  data: '2. Tus datos basicos',
  done: '3. Recibe tu demo en menos de 2h',
} as const;

const SERVICES = [
  { value: 'web' as const, title: 'Pagina web', description: 'Diseño web con IA adaptado a tu marca y publico.', iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-500' },
  { value: 'gps' as const, title: 'Sistema GPS de reparto', description: 'Seguimiento en tiempo real de tus repartidores en Zaragoza.', iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
  { value: 'ia' as const, title: 'Asistente IA para citas', description: 'Atencion personalizada 24/7 con IA Stella (cita, factura, pedidos).', iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500' },
];

const EMPTY_FORM = { service: 'web' as Service, businessName: '', contactName: '', phone: '', email: '' } as LeadFormData;

export default function ThreeStepLeadSection({ onSuccess, triggerLabel = 'Solicitar demo' }: { onSuccess?: () => void; triggerLabel?: string }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<LeadFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof LeadFormData) => (value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  const validate = (stepNum: number, data: LeadFormData): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (stepNum >= 1) {
      if (!data.businessName.trim()) errs.businessName = 'Nombre de tu negocio';
      if (!data.contactName.trim()) errs.contactName = 'Tu nombre';
    }
    if (stepNum >= 2) {
      if (!data.phone.trim()) errs.phone = 'Telefono / WhatsApp';
      else if (data.phone.replace(/[\s]/g, '').length < 9) errs.phone = 'Telefono no valido';
      if (!data.email.trim()) errs.email = 'Email';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errs.email = 'Email no valido';
    }
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const errs = validate(1, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    const sector =
      form.service === "web"
        ? "Servicio: Pagina web"
        : form.service === "gps"
          ? "Servicio: Sistema GPS de reparto"
          : "Servicio: Asistente IA para citas";
    try {
      await submitLead({
        businessName: form.businessName,
        sector,
        contactName: form.contactName,
        phone: form.phone,
        email: form.email,
        source: "landing-cita-3pasos",
      });
    } finally {
      setSubmitting(false);
      setStep(2);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {SERVICES.map((svc) => {
              const isSelected = form.service === svc.value;
              return (
                <button
                  key={svc.value}
                  type="button"
                  onClick={() => setForm({ ...form, service: svc.value })}
                  className={cn(
                    "group rounded-2xl p-5 text-left transition-all border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40",
                    isSelected
                      ? "border-cyan-500 bg-cyan-500/[0.08] shadow-lg shadow-cyan-500/10"
                      : "border-white/10 bg-[#0B0F17]/70 hover:border-white/20 hover:bg-[#0B0F17]/90"
                  )}
                >
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4", svc.iconBg)}>
                    <Sparkles size={20} />
                  </div>
                  <div className={cn("font-semibold text-sm mb-1", isSelected ? "text-cyan-300" : "text-foreground")}>
                    {svc.title}
                  </div>
                  <p className={cn("text-xs leading-relaxed", isSelected ? "text-cyan-200/70" : "text-muted")}>
                    {svc.description}
                  </p>
                  <div className={cn("mt-3 flex items-center gap-1.5 text-xs font-semibold", isSelected ? "text-cyan-400" : "text-muted group-hover:text-cyan-400/70")}>
                    Seleccionar
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        );
      case 1: return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block"><Building2 size={14} className="inline mr-1 text-cyan-400" />Nombre de tu negocio</label>
              <input type="text" value={form.businessName} onChange={(e) => update("businessName")(e.target.value)} placeholder="Ej. El Sazón Bakery" className={"w-full rounded-xl bg-[#0B0F17]/70 border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" + (errors.businessName ? " border-red-500/50" : "")} autoComplete="organization" />
              {errors.businessName && <p className="text-[11px] text-red-400 mt-1">{errors.businessName}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block"><Sparkles size={14} className="inline mr-1 text-cyan-400" />Tu nombre</label>
              <input type="text" value={form.contactName} onChange={(e) => update("contactName")(e.target.value)} placeholder="Tu nombre" className={"w-full rounded-xl bg-[#0B0F17]/70 border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" + (errors.contactName ? " border-red-500/50" : "")} autoComplete="name" />
              {errors.contactName && <p className="text-[11px] text-red-400 mt-1">{errors.contactName}</p>}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted mb-1.5 block"><Smartphone size={14} className="inline mr-1 text-cyan-400" />Telefono / WhatsApp</label>
            <input type="tel" value={form.phone} onChange={(e) => update("phone")(e.target.value)} placeholder="Ej. 612 345 678" className={"w-full rounded-xl bg-[#0B0F17]/70 border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" + (errors.phone ? " border-red-500/50" : "")} autoComplete="tel" />
            {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-muted mb-1.5 block"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1 text-cyan-400"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 8l10 6L22 8" /></svg>Email</label>
            <input type="email" value={form.email} onChange={(e) => update("email")(e.target.value)} placeholder="tu@email.com" className={"w-full rounded-xl bg-[#0B0F17]/70 border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" + (errors.email ? " border-red-500/50" : "")} autoComplete="email" />
            {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
          </div>
        </div>
      );
      case 2: return (
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4"><CheckCircle2 size={32} className="text-emerald-400" /></div>
          <h3 className="text-lg font-bold font-display text-foreground"><span className="text-cyan-400">Tu solicitud está recibida</span>! 🎉</h3>
          <p className="text-sm text-muted mt-2 max-w-sm mx-auto leading-relaxed">Te contactaremos en <strong>menos de 2 horas</strong> para agendar tu demo personalizada en Zaragoza.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href="#cita" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer"><MessageCircle size={16} /> Ir a Citas</Link>
            <button type="button" onClick={() => { setStep(0); setForm(EMPTY_FORM); setErrors({}); }} className="px-6 py-3 rounded-xl glass text-foreground font-semibold text-sm border border-glass-border hover:border-cyan-500/30 transition-all cursor-pointer">Volver a empezar</button>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <section id="cita" className="w-full bg-surface-elevated py-20 lg:py-28 relative overflow-hidden">
      <div className="orb orb-cyan w-[400px] h-[400px] -right-32 top-20" aria-hidden />
      <div className="orb orb-purple w-[320px] h-[320px] -left-24 bottom-16" aria-hidden />
      <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4"><CheckCircle2 size={14} /> 3 pasos para tu demo</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display"><span className="gradient-text">Reserva tu Auditoría Gratuita</span></h2>
          <p className="text-muted mt-4 max-w-xl mx-auto text-lg">Sin compromiso. En menos de 2 horas te explicamos cómo LOCALIS AI puede crecer tu negocio en Zaragoza.</p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            {["service", "data", "done"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all", i <= step ? "bg-cyan-500 text-white" : "bg-white/5 text-muted")}>
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={cn("text-xs font-medium hidden sm:inline", i <= step ? "text-cyan-400" : "text-muted")}>{STEP_LABELS[s as keyof typeof STEP_LABELS]}</span>
                {i < 2 && <div className={cn("flex-1 h-0.5 mx-2 rounded", i < step ? "bg-cyan-500/50" : "bg-white/10")} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              <form onSubmit={handleSubmit} noValidate>
                {renderStep()}

                {step === 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Continuar <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {step === 1 && (
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                      ) : (
                        <><CheckCircle2 size={16} /> Recibir mi demo en menos de 2h</>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* WhatsApp directo */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-sm text-muted">¿Prefieres hablar ahora? Escríbenos directo por WhatsApp:</p>
          <a
            href="https://wa.me/34640809238?text=Hola%20LOCALIS%20AI%2C%20quiero%20reservar%20una%20auditor%C3%ADa%20gratuita%20para%20mi%20negocio%20en%20Zaragoza"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5A] text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-600/20 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
            aria-label="Hablar por WhatsApp con LOCALIS AI - +34 640 80 92 38"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Hablar por WhatsApp - 640 80 92 38
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-muted">
          {["Sin compromiso", "Respuesta en menos de 24h", "Zaragoza y Aragón"].map((item) => (
            <div key={item} className="flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /><span>{item}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}
