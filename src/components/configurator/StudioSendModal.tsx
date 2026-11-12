"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, Loader2, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { CONTACT } from "@/lib/site";
import { submitLead, validateLead, type LeadErrors } from "@/lib/lead";
import { trackLead } from "@/lib/analytics";
import { sectorById } from "./configModel";
import { buildPrompt, summary, type Quote, type Studio } from "./studioModel";

const WA_NUMBER = CONTACT.phoneE164.replace("+", "");

interface Form {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
}
const EMPTY: Form = { businessName: "", contactName: "", phone: "", email: "" };

export default function StudioSendModal({ open, onClose, studio, quote }: { open: boolean; onClose: () => void; studio: Studio; quote: Quote }) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [copied, setCopied] = useState<"ok" | "error" | null>(null);
  const titleId = useId();
  const uid = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  // Escape, bloqueo de scroll y foco inicial.
  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    setErrors({});
    setCopied(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && status !== "sending" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir/cerrar
  }, [open]);

  if (!mounted || !open) return null;

  const sector = sectorById(studio.sector);
  const text = summary(studio, quote);
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola LOCALIS AI 👋 He diseñado mi web en vuestro estudio:\n\n${text}\n\n¿Me ayudáis a ponerla en marcha?`)}`;
  const prompt = () => buildPrompt(studio, quote, { business: form.businessName, contact: form.contactName });

  const copyPrompt = async () => {
    const value = prompt();
    try {
      await navigator.clipboard.writeText(value);
      setCopied("ok");
    } catch {
      // Respaldo para navegadores sin API de portapapeles.
      try {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        setCopied(ok ? "ok" : "error");
      } catch {
        setCopied("error");
      }
    }
    window.setTimeout(() => setCopied(null), 2500);
  };

  const update = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const lead = { ...form, sector: sector.leadSector };
    const found = validateLead(lead);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-studio-form] [aria-invalid='true']")?.focus());
      return;
    }
    setStatus("sending");
    try {
      await submitLead({ ...lead, source: "Estudio visual", details: text, prompt: prompt() });
      trackLead("estudio_visual", sector.short);
    } finally {
      setStatus("done");
    }
  };

  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`${uid}-${k}`} className="block text-xs font-medium text-foreground/90 mb-1">
        {label}
      </label>
      <input
        id={`${uid}-${k}`}
        value={form[k]}
        onChange={(e) => update(k, e.target.value)}
        aria-invalid={Boolean(errors[k])}
        aria-describedby={errors[k] ? `${uid}-${k}-err` : undefined}
        className={cn("focus-ring w-full min-h-[46px] rounded-xl bg-[#0B0F17]/80 border px-3.5 text-[15px] placeholder:text-muted/70", errors[k] ? "border-red-400/60" : "border-white/10")}
        {...props}
      />
      {errors[k] && (
        <p id={`${uid}-${k}-err`} className="mt-1 text-xs text-red-300">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[78] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-[#05080d]/80 glass-bar animate-fade-rise" onClick={() => status !== "sending" && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="border-glow rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto overscroll-contain p-5 sm:p-7 shadow-glass"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow eyebrow-live">Presupuesto cerrado · {quote.total} €</p>
            <h3 id={titleId} className="mt-3 font-display text-2xl font-bold">
              Envíanos tu diseño
            </h3>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 hover:border-cyan-500/40 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <pre className="mt-4 whitespace-pre-wrap break-words rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.05] p-4 font-sans text-[13px] leading-relaxed text-foreground/90">{text}</pre>

        {status === "done" ? (
          <div className="mt-6 text-center" role="status" aria-live="polite">
            <CheckCircle2 size={40} className="mx-auto text-emerald-400" aria-hidden="true" />
            <p className="mt-3 font-display text-xl font-bold">¡Diseño recibido, {form.contactName.split(" ")[0] || "gracias"}!</p>
            <p className="mt-2 text-sm text-muted">Te contactamos en menos de 24 h laborables con tu propuesta. Si tienes prisa, escríbenos ya:</p>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn mt-4 w-full bg-[#25D366] text-[#05210f]">
              <WhatsAppIcon size={18} /> Enviar también por WhatsApp
            </a>
          </div>
        ) : (
          <>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLead("estudio_whatsapp", sector.short)}
              className="btn mt-5 w-full min-h-[54px] bg-[#25D366] text-[#05210f] text-base"
            >
              <WhatsAppIcon size={20} /> Enviar por WhatsApp al {CONTACT.phoneDisplay}
            </a>

            <div className="my-5 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-white/10" /> o déjanos tus datos y te llamamos <span className="h-px flex-1 bg-white/10" />
            </div>

            <form data-studio-form onSubmit={submit} noValidate className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field("businessName", "Nombre del negocio", { autoComplete: "organization", placeholder: sector.sampleName })}
                {field("contactName", "Tu nombre", { autoComplete: "name", placeholder: "Nombre y apellido" })}
                {field("phone", "Teléfono / WhatsApp", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "612 345 678" })}
                {field("email", "Email", { type: "email", inputMode: "email", autoComplete: "email", placeholder: "tu@negocio.com" })}
              </div>
              <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full disabled:opacity-70">
                {status === "sending" ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
                {status === "sending" ? "Enviando…" : "Enviar mi diseño"}
              </button>
              <p className="text-[11px] text-muted text-center">
                Solo usaremos tus datos para responder a tu solicitud.{" "}
                <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                  Privacidad
                </a>
              </p>
            </form>
          </>
        )}

        <div className="mt-5 pt-4 border-t border-white/[0.07] flex justify-center">
          <button type="button" onClick={copyPrompt} className="inline-flex items-center gap-1.5 text-[11.5px] text-muted hover:text-foreground transition-colors">
            {copied === "ok" ? <Check size={13} className="text-emerald-400" aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
            {copied === "ok" ? "Prompt copiado" : copied === "error" ? "No se pudo copiar" : "Copiar prompt técnico para Claude"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
