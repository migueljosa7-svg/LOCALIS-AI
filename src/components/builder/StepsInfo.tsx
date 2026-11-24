"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, Panel, Toggle, inputCls } from "./ui";
import type { StepProps } from "./StepsDesign";
import type { ImageStore } from "./imageStore";
import { estimate, euro, KIND_LABEL, type LineKind } from "@/lib/builder/estimate";
import { LIMITS } from "@/lib/builder/validate";
import { validateEmail, validatePhone } from "@/lib/lead";
import {
  FONTS, INTERESTS, PAGE_TYPES, SECTION_DEFS, SECTORS, TEMPLATES, buttonPending, changeSector, enabledSections,
  type PageTypeId, type SectorId, type SiteConfig,
} from "@/lib/builder/model";

// ── Pantalla de inicio: tipo de negocio y de página ──────────────
export function StartScreen({ cfg, set, onStart }: StepProps & { onStart: () => void }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 pb-28 sm:px-6 sm:py-12 lg:px-8 lg:pb-12">
     <div className="max-w-4xl">
      <p className="eyebrow">Diseña tu web</p>
      <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
        Diseña tu web <span className="gradient-text">y mira cómo queda</span> al instante
      </h1>
      <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
        Elige colores, letras, botones, imágenes y el orden de tu página con una vista previa en directo. Al terminar nos envías tu diseño y te preparamos el presupuesto. No se cobra nada.
      </p>

      <h2 className="mt-9 font-display text-xl font-bold">1. ¿Qué tipo de negocio tienes?</h2>
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SECTORS.map((s) => {
          const on = cfg.business.sector === s.id;
          return (
            <button key={s.id} type="button" aria-pressed={on} onClick={() => set((c) => changeSector(c, s.id as SectorId))} className={cn("min-h-[64px] rounded-2xl border p-3.5 text-left transition-colors", on ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 bg-white/[0.03] hover:border-white/25")}>
              <span className="block text-[15px] font-semibold">{s.label}</span>
              <span className="block text-xs text-muted">{s.hint}</span>
            </button>
          );
        })}
      </div>

      <h2 className="mt-8 font-display text-xl font-bold">2. ¿Qué página necesitas?</h2>
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {PAGE_TYPES.map((p) => {
          const on = cfg.pageType === p.id;
          return (
            <button key={p.id} type="button" aria-pressed={on} onClick={() => set((c) => ({ ...c, pageType: p.id as PageTypeId, pages: p.pages }))} className={cn("min-h-[64px] rounded-2xl border p-3.5 text-left transition-colors", on ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 bg-white/[0.03] hover:border-white/25")}>
              <span className="block text-[15px] font-semibold">{p.label}</span>
              <span className="block text-xs text-muted">{p.hint}</span>
            </button>
          );
        })}
      </div>

      <button type="button" onClick={onStart} className="btn btn-primary mt-9 min-h-[56px] w-full px-8 text-base sm:w-auto">
        Empezar a diseñar
      </button>
     </div>
    </div>
  );
}

// ── Información del negocio ───────────────────────────────────────
export function BusinessStep({ cfg, set, store }: StepProps & { store: ImageStore }) {
  const b = cfg.business;
  const up = (patch: Partial<SiteConfig["business"]>) => set((c) => ({ ...c, business: { ...c.business, ...patch } }));
  const [logoMsg, setLogoMsg] = useState("");
  const text = (key: keyof SiteConfig["business"], label: string, opts: { hint?: string; type?: string; max?: number; optional?: boolean; auto?: string; mode?: "tel" | "email" | "url" | "text" } = {}) => (
    <Field label={label} hint={opts.hint} optional={opts.optional ?? true}>
      {(id) => <input id={id} className={inputCls} type={opts.type ?? "text"} inputMode={opts.mode} autoComplete={opts.auto} maxLength={opts.max ?? 120} value={String(b[key] ?? "")} onChange={(e) => up({ [key]: e.target.value } as never)} />}
    </Field>
  );

  async function onLogo(files: FileList | null) {
    if (!files?.[0]) return;
    setLogoMsg("");
    const { added, errors } = await store.add([files[0]]);
    if (added[0]) {
      set((c) => ({ ...c, images: [...c.images, { id: added[0].id, kind: "upload", name: `Logotipo · ${added[0].name}` }], logoImage: added[0].id, business: { ...c.business, hasLogo: true } }));
      setLogoMsg("Logotipo añadido.");
    } else setLogoMsg(errors[0] ?? "No se ha podido añadir.");
  }

  return (
    <Panel title="Tu negocio" hint="Con esto rellenamos tu web de ejemplo y preparamos tu presupuesto. Puedes dejar en blanco lo que no sepas: lo vemos juntos.">
      {text("name", "Nombre del negocio", { auto: "organization" })}
      {text("city", "Ciudad o zona", { auto: "address-level2" })}
      {text("tagline", "Frase principal", { hint: "El titular grande de tu portada. Ej.: «Tu mejor versión, con cita previa»", max: 140 })}
      <Field label="Descripción del negocio" optional>
        {(id) => <textarea id={id} rows={4} maxLength={700} className={inputCls} value={b.description} onChange={(e) => up({ description: e.target.value })} />}
      </Field>

      <div className="space-y-3 rounded-2xl border border-white/10 p-3.5">
        <p className="text-sm font-semibold">Servicios o productos <span className="text-xs font-normal text-muted">(opcional)</span></p>
        {b.services.map((s, i) => (
          <div key={i} className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <div className="flex gap-2">
              <input aria-label={`Servicio ${i + 1}: nombre`} placeholder="Nombre" className={inputCls} maxLength={80} value={s.name} onChange={(e) => up({ services: b.services.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)) })} />
              <input aria-label={`Servicio ${i + 1}: precio`} placeholder="Precio (opcional)" className={cn(inputCls, "max-w-[9rem]")} maxLength={60} value={s.price} onChange={(e) => up({ services: b.services.map((x, k) => (k === i ? { ...x, price: e.target.value } : x)) })} />
              <button type="button" aria-label={`Quitar servicio ${i + 1}`} onClick={() => up({ services: b.services.filter((_, k) => k !== i) })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-muted hover:text-red-300">
                <Trash2 size={16} />
              </button>
            </div>
            <input aria-label={`Servicio ${i + 1}: descripción`} placeholder="Descripción corta (opcional)" className={inputCls} maxLength={200} value={s.desc} onChange={(e) => up({ services: b.services.map((x, k) => (k === i ? { ...x, desc: e.target.value } : x)) })} />
          </div>
        ))}
        <button type="button" disabled={b.services.length >= LIMITS.maxServices} onClick={() => up({ services: [...b.services, { name: "", price: "", desc: "" }] })} className="btn btn-ghost min-h-[44px] w-full disabled:opacity-40">
          <Plus size={16} aria-hidden="true" /> Añadir servicio o producto
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {text("phone", "Teléfono", { type: "tel", mode: "tel", auto: "tel", max: 40, hint: "Para el botón «Llamar»" })}
        {text("whatsapp", "WhatsApp", { type: "tel", mode: "tel", max: 40, hint: "Para el botón de WhatsApp" })}
        {text("email", "Email del negocio", { type: "email", mode: "email", auto: "email", max: 160 })}
        {text("address", "Dirección", { auto: "street-address", max: 200, hint: "Si tienes local abierto al público" })}
        {text("instagram", "Instagram", { max: 120 })}
        {text("facebook", "Facebook", { max: 120 })}
        {text("domain", "Dominio (si ya tienes uno)", { hint: "Ej.: minegocio.es", max: 120 })}
      </div>
      <Field label="¿Cuál es el objetivo principal de tu web?" optional>
        {(id) => (
          <select id={id} className={inputCls} value={b.goal} onChange={(e) => up({ goal: e.target.value })}>
            <option value="">Elige uno…</option>
            {["Conseguir llamadas", "Conseguir reservas o citas", "Pedir presupuestos", "Vender productos", "Mostrar mi trabajo", "Que me encuentren en Google", "Otro"].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        )}
      </Field>

      <div>
        <p className="text-sm font-semibold">Logotipo <span className="text-xs font-normal text-muted">(opcional)</span></p>
        <input id="logo-input" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onLogo(e.target.files)} />
        <label htmlFor="logo-input" className="btn btn-ghost mt-1.5 min-h-[44px] w-full cursor-pointer">
          {b.hasLogo ? "Cambiar logotipo" : "Subir mi logotipo"}
        </label>
        {logoMsg && <p className="mt-1.5 text-xs text-muted" role="status">{logoMsg}</p>}
        {!b.hasLogo && <Toggle label="Tengo logotipo, lo enviaré después" checked={false} onChange={(v) => up({ hasLogo: v })} />}
      </div>

      <div className="space-y-2.5 rounded-2xl border border-white/10 p-3.5">
        <p className="text-sm font-semibold">Extras</p>
        <Toggle label="Quiero Stella, la asistente con IA, en mi web" hint="Responde dudas con la información de tu negocio y recoge contactos. Se presupuesta aparte." checked={cfg.wants.stella} onChange={(v) => set((c) => ({ ...c, wants: { ...c.wants, stella: v } }))} />
        <p className="pt-1 text-xs text-muted">Todavía no disponibles (si te interesan, los anotamos para avisarte; no se cobran):</p>
        {INTERESTS.map((i) => (
          <Toggle key={i.id} label={i.label} checked={cfg.wants.interests.includes(i.id)} onChange={(v) => set((c) => ({ ...c, wants: { ...c.wants, interests: v ? [...c.wants.interests, i.id] : c.wants.interests.filter((x) => x !== i.id) } }))} />
        ))}
      </div>
      <Field label="Comentarios adicionales" optional hint="Cualquier cosa que quieras que sepamos (webs que te gustan, plazos, dudas…)">
        {(id) => <textarea id={id} rows={3} maxLength={1500} className={inputCls} value={cfg.comments} onChange={(e) => set((c) => ({ ...c, comments: e.target.value }))} />}
      </Field>
    </Panel>
  );
}

// ── Revisión y envío ──────────────────────────────────────────────
const KIND_STYLE: Record<LineKind, string> = {
  definido: "bg-emerald-500/15 text-emerald-200",
  opcional: "bg-cyan-500/15 text-cyan-200",
  valorar: "bg-amber-500/15 text-amber-100",
  "no-disponible": "bg-white/10 text-muted",
};

export function Estimate({ cfg, compact = false }: { cfg: SiteConfig; compact?: boolean }) {
  const e = estimate(cfg);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5" aria-label="Estimación orientativa">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs uppercase tracking-wider text-muted">Estimación orientativa</p>
        <p className="text-right font-display text-xl font-bold leading-tight">{e.priceLabel}</p>
      </div>
      <p className="text-xs text-muted">{e.packName} para {e.pages} páginas. Precio de referencia: no es un presupuesto cerrado ni se cobra nada; el presupuesto final se ajusta a tu proyecto tras revisar tu diseño. El alojamiento y el mantenimiento no están incluidos.</p>
      {!compact && (
        <ul className="mt-3 space-y-2">
          {e.lines.map((l, i) => (
            <li key={i} className="flex items-start justify-between gap-3 text-sm">
              <span>
                <span className={cn("mr-2 rounded-full px-2 py-0.5 text-[10.5px] font-semibold", KIND_STYLE[l.kind])}>{KIND_LABEL[l.kind]}</span>
                {l.label}
                {l.detail && <span className="block text-xs text-muted">{l.detail}</span>}
              </span>
              {l.amount !== undefined && <span className="shrink-0 font-semibold">{l.amount > 0 ? "+" : ""}{euro(l.amount)}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface SubmitState {
  status: "idle" | "sending" | "done";
  error: string | null;
  reference: string | null;
}

export function ReviewStep({ cfg, store, submit, state }: { cfg: SiteConfig; store: ImageStore; submit: (c: ContactForm) => void; state: SubmitState }) {
  const [form, setForm] = useState<ContactForm>({ businessName: cfg.business.name, contactName: "", phone: cfg.business.phone || cfg.business.whatsapp, email: cfg.business.email, consent: false, website: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const t = TEMPLATES.find((x) => x.id === cfg.template);
  const pend = cfg.buttons.map((b) => ({ b, p: buttonPending(b, cfg.business) })).filter((x) => x.p);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.businessName.trim().length < 2) er.businessName = "Indica el nombre de tu negocio.";
    if (form.contactName.trim().length < 2) er.contactName = "Indica tu nombre.";
    const p = validatePhone(form.phone);
    if (p) er.phone = p;
    const m = validateEmail(form.email);
    if (m) er.email = m;
    if (!form.consent) er.consent = "Necesitamos tu permiso para contactarte.";
    setErrs(er);
    if (Object.keys(er).length === 0) submit(form);
  }

  if (state.status === "done") {
    return (
      <div className="space-y-4 text-center" role="status">
        <CheckCircle2 size={44} className="mx-auto text-emerald-400" aria-hidden="true" />
        <h2 className="font-display text-2xl font-bold">¡Hemos recibido tu diseño!</h2>
        <p className="text-muted">Revisaremos tus decisiones (colores, secciones, botones e imágenes) y te contactaremos con el presupuesto definitivo. No se ha cobrado nada ni se ha contratado nada todavía.</p>
        {state.reference && <p className="text-xs text-muted">Referencia: {state.reference.slice(0, 8)}</p>}
      </div>
    );
  }

  const sections = enabledSections(cfg).filter((s) => s !== "header" && s !== "footer");
  const uploads = store.items.length;
  const field = (name: keyof ContactForm, label: string, extra: { type?: string; mode?: "tel" | "email" | "text"; auto?: string } = {}) => (
    <Field label={label}>
      {(id) => (
        <>
          <input id={id} className={cn(inputCls, errs[name] && "border-red-400/60")} type={extra.type ?? "text"} inputMode={extra.mode} autoComplete={extra.auto} aria-invalid={!!errs[name]} value={String(form[name])} onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))} />
          {errs[name] && <p className="mt-1 text-xs text-red-300" role="alert">{errs[name]}</p>}
        </>
      )}
    </Field>
  );

  return (
    <Panel title="Revisa y pide tu web" hint="Esto es lo que vamos a recibir. Si algo no te convence, vuelve atrás: no hay prisa.">
      <ul className="space-y-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-sm">
        <li><span className="text-muted">Plantilla:</span> {t?.label} · {cfg.pages} páginas</li>
        <li className="flex flex-wrap items-center gap-1.5"><span className="text-muted">Colores:</span> {Object.values(cfg.theme.colors).map((h, i) => <span key={i} className="inline-block h-5 w-5 rounded-md border border-white/20" style={{ background: h }} title={h} />)}</li>
        <li><span className="text-muted">Tipografías:</span> {FONTS.find((f) => f.id === cfg.theme.fontHeading)?.label} + {FONTS.find((f) => f.id === cfg.theme.fontBody)?.label}</li>
        <li><span className="text-muted">Secciones:</span> {sections.map((s) => SECTION_DEFS[s].label).join(" → ")}</li>
        <li><span className="text-muted">Botones:</span> {cfg.buttons.map((b) => `«${b.label}»`).join(", ") || "ninguno"}</li>
        <li><span className="text-muted">Imágenes:</span> {uploads} propias · {cfg.images.length - uploads} de ejemplo</li>
      </ul>
      {pend.length > 0 && (
        <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Botones pendientes de configuración: {pend.map((x) => `«${x.b.label}» (${x.p!.toLowerCase()})`).join(", ")}. Puedes completarlos en «Tu negocio» o dejarlos así y lo vemos contigo.
        </p>
      )}
      <Estimate cfg={cfg} />

      <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.04] p-4">
        <h3 className="font-display text-lg font-bold">¿A quién enviamos tu diseño?</h3>
        {field("businessName", "Nombre del negocio", { auto: "organization" })}
        {field("contactName", "Tu nombre", { auto: "name" })}
        {field("phone", "Teléfono o WhatsApp", { type: "tel", mode: "tel", auto: "tel" })}
        {field("email", "Email", { type: "email", mode: "email", auto: "email" })}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
          <label>No rellenar<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} /></label>
        </div>
        <label className="flex items-start gap-2.5 text-sm leading-snug">
          <input type="checkbox" checked={form.consent} onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))} className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-400" aria-invalid={!!errs.consent} />
          <span>
            Acepto que LOCALIS AI use estos datos y las imágenes que subo para preparar mi presupuesto y contactarme.{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">Política de privacidad</a>
          </span>
        </label>
        {errs.consent && <p className="text-xs text-red-300" role="alert">{errs.consent}</p>}
        {state.error && <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">{state.error}</p>}
        <button type="submit" disabled={state.status === "sending"} className="btn btn-primary min-h-[60px] w-full px-8 text-lg disabled:opacity-60">
          {state.status === "sending" ? (<><Loader2 size={20} className="animate-spin" aria-hidden="true" /> Enviando tu diseño…</>) : (<><Send size={20} aria-hidden="true" /> Quiero esta web</>)}
        </button>
        <p className="text-center text-xs text-muted">Sin compromiso. No se cobra nada. Revisaremos tu diseño antes de construir nada.</p>
      </form>
    </Panel>
  );
}

export interface ContactForm {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  consent: boolean;
  website: string;
}

