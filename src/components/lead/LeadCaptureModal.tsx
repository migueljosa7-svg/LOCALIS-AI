"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  Building2,
  User,
  Phone,
  Mail,
  Store,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLead } from "./LeadProvider";
import {
  LEAD_SECTORS,
  submitLead,
  validateLead,
  type LeadData,
  type LeadErrors,
} from "@/lib/lead";

const EMPTY: LeadData = {
  businessName: "",
  sector: "",
  contactName: "",
  phone: "",
  email: "",
};

const FIELD_BASE =
  "w-full rounded-xl bg-[#0B0F17]/70 border border-white/10 px-4 py-3 pl-11 text-sm text-foreground placeholder:text-muted/70 transition-all focus-ring";

export default function LeadCaptureModal() {
  const { isOpen, closeLead, source } = useLead();
  const [form, setForm] = useState<LeadData>(EMPTY);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [degraded, setDegraded] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Reset al abrir + foco inicial + bloqueo de scroll + cierre con Escape.
  useEffect(() => {
    if (!isOpen) return;
    setForm(EMPTY);
    setErrors({});
    setStatus("idle");
    setDegraded(false);
    const t = setTimeout(() => firstFieldRef.current?.focus(), 220);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "submitting") closeLead();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, status, closeLead]);

  const update = (key: keyof LeadData) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    const found = validateLead(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstErr = document.querySelector<HTMLElement>("[data-lead-error='true']");
      firstErr?.focus();
      return;
    }
    setStatus("submitting");
    try {
      const res = await submitLead({ ...form, source });
      if (!res.ok) throw new Error("submit-failed");
      setDegraded(Boolean(res.degraded));
      setStatus("done");
    } catch {
      // Sin red / API caída: no perdemos la solicitud (ya persistida en local).
      setDegraded(true);
      setStatus("done");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#0B0F17]/85 backdrop-blur-sm overflow-y-auto"
          onClick={() => status !== "submitting" && closeLead()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="glass border-glow rounded-2xl w-full max-w-lg relative overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
            <button
              type="button"
              onClick={() => status !== "submitting" && closeLead()}
              aria-label="Cerrar"
              className="absolute top-4 right-4 z-10 glass p-2 rounded-lg hover:border-cyan-500/40 transition-all cursor-pointer disabled:opacity-50"
              disabled={status === "submitting"}
            >
              <X size={16} />
            </button>

            <AnimatePresence mode="wait">
              {status === "done" ? (
                <SuccessView onClose={closeLead} degraded={degraded} />
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative p-6 sm:p-8"
                >
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
                      <Sparkles size={12} /> Demo gratuita · Sin compromiso
                    </span>
                    <h3 className="text-2xl font-bold font-display">Solicitar Demo</h3>
                    <p className="text-sm text-muted mt-1.5">
                      Cuéntanos sobre tu negocio y te mostramos LOCALIS AI en acción.
                      {source && <span className="ml-1 text-cyan-400/90">(Plan: {source})</span>}
                    </p>
                  </div>
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <Field icon={<Building2 size={16} />} label="Nombre del negocio" error={errors.businessName}>
                      <input
                        ref={firstFieldRef}
                        type="text"
                        value={form.businessName}
                        onChange={(e) => update("businessName")(e.target.value)}
                        placeholder="Frutería Pepe"
                        className={FIELD_BASE}
                        data-lead-error={errors.businessName ? "true" : undefined}
                      />
                    </Field>

                    <Field icon={<Store size={16} />} label="Sector" error={errors.sector}>
                      <div className="relative">
                        <select
                          value={form.sector}
                          onChange={(e) => update("sector")(e.target.value)}
                          className={cn(FIELD_BASE, "appearance-none pr-10 cursor-pointer")}
                          data-lead-error={errors.sector ? "true" : undefined}
                        >
                          <option value="" disabled>
                            Selecciona tu sector…
                          </option>
                          {LEAD_SECTORS.map((s) => (
                            <option key={s} value={s} className="bg-[#0B0F17]">
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                        />
                      </div>
                    </Field>

                    <Field icon={<User size={16} />} label="Nombre de contacto" error={errors.contactName}>
                      <input
                        type="text"
                        value={form.contactName}
                        onChange={(e) => update("contactName")(e.target.value)}
                        placeholder="María García"
                        className={FIELD_BASE}
                        data-lead-error={errors.contactName ? "true" : undefined}
                      />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field icon={<Phone size={16} />} label="Teléfono / WhatsApp" error={errors.phone}>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update("phone")(e.target.value)}
                          placeholder="+34 600 000 000"
                          className={FIELD_BASE}
                          data-lead-error={errors.phone ? "true" : undefined}
                        />
                      </Field>

                      <Field icon={<Mail size={16} />} label="Email" error={errors.email}>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email")(e.target.value)}
                          placeholder="hola@minegocio.com"
                          className={FIELD_BASE}
                          data-lead-error={errors.email ? "true" : undefined}
                        />
                      </Field>
                    </div>

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Enviando solicitud…
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Solicitar Demo
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-muted text-center leading-relaxed pt-1">
                      Al enviar aceptas que un especialista de LOCALIS AI te contacte. Sin spam.
                      Protegemos tus datos según la RGPD.
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function SuccessView({ onClose, degraded }: { onClose: () => void; degraded?: boolean }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.05 }}
        className="mx-auto w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5"
      >
        <CheckCircle2 size={40} className="text-emerald-400" />
      </motion.div>
      <h3 className="text-2xl font-bold font-display mb-2">
        Solicitud <span className="gradient-text">Recibida</span>
      </h3>
      <p className="text-muted text-sm leading-relaxed max-w-sm mx-auto">
        Un especialista de <span className="text-cyan-400 font-semibold">LOCALIS AI</span> te contactará
        en breve para agendar tu demo personalizada.
      </p>
      {degraded && (
        <p className="mt-3 text-[11px] text-amber-300/90">
          Conexión inestable: guardamos tu solicitud en este dispositivo para no perderla.
        </p>
      )}
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <Sparkles size={12} /> Respuesta habitual en menos de 24 h
      </div>
      <button
        type="button"
        onClick={onClose}
        autoFocus
        className="mt-7 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer"
      >
        Cerrar
      </button>
    </motion.div>
  );
}

function Field({
  icon,
  label,
  error,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted mb-1.5 block">{label}</span>
      <div className="relative">
        <span
          className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none",
            error ? "text-red-400" : "text-muted"
          )}
        >
          {icon}
        </span>
        {children}
      </div>
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="block text-[11px] text-red-400 mt-1 overflow-hidden"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

