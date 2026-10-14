"use client";

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Building2, Smartphone, Sparkles, ArrowRight, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            <input type="tel" value={form.phone} onChange={(e) => update("phone")(e.target.value)} placeholder="+34 640 80 92 38" className={"w-full rounded-xl bg-[#0B0F17]/70 border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" + (errors.phone ? " border-red-500/50" : "")} autoComplete="tel" />
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
              <form onSubmit={(e) => { e.preventDefault(); }}>
                {renderStep()}

                {step === 1 && (
                  <div className="pt-2">
                    <button type="button" onClick={() => { if (Object.keys(validate(1, form)).length > 0) { setErrors(validate(1, form)); return; } setStep(2); }} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Continuar a validación</button>
                  </div>
                )}

                {step === 2 && (
                  <div className="pt-2">
                    <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" disabled={submitting}>
                      {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <><CheckCircle2 size={16} /> Recibir tu demo en menos de 2h</>}
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </AnimatePresence>
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
