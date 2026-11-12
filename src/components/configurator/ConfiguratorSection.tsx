"use client";

import { useMemo, useState } from "react";
import {
  UtensilsCrossed,
  Stethoscope,
  Wrench,
  Store,
  CalendarCheck,
  Navigation,
  MessageCircle,
  ShoppingBag,
  Check,
  Sparkles,
  ArrowRight,
  Clock3,
  Info,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedCounter from "@/components/effects/AnimatedCounter";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { useLead } from "@/components/lead/LeadProvider";
import { waLink } from "@/lib/site";
import {
  ASSUMPTIONS,
  FEATURES,
  PAGE_OPTIONS,
  SECTORS,
  compute,
  defaultConfig,
  sanitize,
  sectorById,
  summarize,
  type Config,
  type FeatureId,
  type PagesId,
  type SectorId,
} from "./configModel";

const SECTOR_ICONS: Record<SectorId, LucideIcon> = {
  restaurante: UtensilsCrossed,
  clinica: Stethoscope,
  taller: Wrench,
  comercio: Store,
};

const FEATURE_ICONS: Record<FeatureId, LucideIcon> = {
  citas: CalendarCheck,
  gps: Navigation,
  whatsapp: MessageCircle,
  catalogo: ShoppingBag,
};

const eur = (n: number) => Math.round(n).toLocaleString("es-ES");

export default function ConfiguratorSection() {
  const [config, setConfig] = useState<Config>(() => defaultConfig("restaurante"));
  const { openLead } = useLead();

  const sector = sectorById(config.sector);
  const result = useMemo(() => compute(config), [config]);
  const hasFeatures = config.features.length > 0;
  const showFee = sector.platformFee > 0 && config.features.includes("gps");

  const update = (patch: Partial<Config>) => setConfig((c) => sanitize({ ...c, ...patch }));

  // Al cambiar de sector se cargan sus valores recomendados (el cliente puede ajustarlos).
  const chooseSector = (id: SectorId) => {
    if (id !== config.sector) setConfig(defaultConfig(id));
  };

  const toggleFeature = (id: FeatureId) =>
    update({ features: config.features.includes(id) ? config.features.filter((f) => f !== id) : [...config.features, id] });

  const summary = summarize(config, result);

  const requestDemo = () => {
    if (!hasFeatures) return;
    openLead("Configurador de web", { sector: sector.leadSector, details: summary });
  };

  return (
    <section id="configurador" aria-labelledby="configurador-title" className="cv-auto relative w-full py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="eyebrow eyebrow-live mb-5">
            <Sparkles size={13} aria-hidden="true" /> Configurador · resultado al instante
          </span>
          <h2 id="configurador-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Diseña tu web y <span className="gradient-text">calcula tu ahorro</span>
          </h2>
          <p className="mt-5 text-muted text-base sm:text-lg leading-relaxed">
            Elige tu tipo de negocio y lo que quieres que haga tu web. Verás cómo quedaría y cuánto dinero y tiempo te ahorra
            cada mes. Sin registros y sin compromiso.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-5 items-start">
          {/* ── Controles ─────────────────────────────────── */}
          <div className="border-glow rounded-[2rem] p-5 sm:p-7 shadow-glass space-y-8">
            <fieldset>
              <legend className="cfg-step">
                <span>1</span> ¿Qué tipo de negocio tienes?
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {SECTORS.map((s) => {
                  const Icon = SECTOR_ICONS[s.id];
                  const selected = s.id === config.sector;
                  return (
                    <label key={s.id} className={cn("cfg-option", selected && "is-selected")}>
                      <input type="radio" name="cfg-sector" value={s.id} checked={selected} onChange={() => chooseSector(s.id)} className="sr-only" />
                      <span className={cn("cfg-icon", selected && "is-selected")}>
                        <Icon size={20} aria-hidden="true" />
                      </span>
                      <span className="block mt-2.5 text-sm font-semibold leading-tight">{s.label}</span>
                      {selected && <SelectedBadge />}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="cfg-step">
                <span>2</span> ¿Cuántas páginas necesitas?
              </legend>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                {PAGE_OPTIONS.map((p) => {
                  const selected = p.id === config.pages;
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        "relative cursor-pointer rounded-xl px-2 py-2.5 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan-400",
                        selected ? "bg-brand shadow-cta" : "text-muted hover:text-foreground"
                      )}
                    >
                      <input type="radio" name="cfg-pages" value={p.id} checked={selected} onChange={() => update({ pages: p.id as PagesId })} className="sr-only" />
                      <span className="block text-sm font-bold">{p.label}</span>
                      <span className={cn("block text-[11px] leading-tight mt-0.5", selected ? "text-[#062033]" : "")}>{p.detail}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="cfg-step">
                <span>3</span> ¿Qué quieres que haga tu web sola?
              </legend>
              <div className="space-y-2.5">
                {FEATURES.map((f) => {
                  const Icon = FEATURE_ICONS[f.id];
                  const on = config.features.includes(f.id);
                  const recommended = sector.recommended.includes(f.id);
                  return (
                    <label key={f.id} className={cn("cfg-toggle", on && "is-on")}>
                      <input type="checkbox" role="switch" aria-checked={on} checked={on} onChange={() => toggleFeature(f.id)} className="sr-only" />
                      <span className={cn("cfg-icon shrink-0", on && "is-selected")}>
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold leading-snug">{f.title}</span>
                        <span className="block text-xs text-muted mt-0.5">
                          {f.detail}
                          {recommended && <span className="ml-1.5 text-cyan-300">· Recomendado</span>}
                        </span>
                      </span>
                      <span className="cfg-switch" aria-hidden="true">
                        <span />
                      </span>
                    </label>
                  );
                })}
              </div>
              {!hasFeatures && (
                <p role="status" className="mt-3 text-sm text-amber-200 flex items-center gap-2">
                  <Info size={15} aria-hidden="true" /> Activa al menos una función para calcular tu ahorro.
                </p>
              )}
            </fieldset>

            <fieldset>
              <legend className="cfg-step">
                <span>4</span> Tu volumen de trabajo
              </legend>
              <CfgSlider
                id="cfg-volume"
                label={sector.volumeLabel}
                value={config.volume}
                min={sector.volume.min}
                max={sector.volume.max}
                step={sector.volume.step}
                display={`${config.volume.toLocaleString("es-ES")} ${sector.unit}`}
                onChange={(v) => update({ volume: v })}
              />
              {showFee && (
                <div className="mt-5">
                  <CfgSlider
                    id="cfg-fee"
                    label="Comisión que pagas hoy a Glovo, Uber Eats o Just Eat"
                    value={Math.round(config.fee * 100)}
                    min={20}
                    max={30}
                    step={1}
                    display={`${Math.round(config.fee * 100)} %`}
                    onChange={(v) => update({ fee: v / 100 })}
                  />
                </div>
              )}
            </fieldset>

            {/* Móvil: el ahorro siempre a la vista mientras se configura */}
            <a
              href="#ahorro"
              className="lg:hidden sticky bottom-[calc(80px+env(safe-area-inset-bottom))] z-10 -mx-1 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-[#0B1A17]/95 px-4 py-3 shadow-glass"
            >
              <span className="text-xs text-emerald-200/90 leading-tight">
                Ahorro estimado
                <span className="block font-display text-2xl font-bold text-emerald-400 tabular-nums">
                  <AnimatedCounter value={result.monthlyNet} suffix=" €/mes" />
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-300">
                Ver resultado <ArrowRight size={15} aria-hidden="true" />
              </span>
            </a>
          </div>

          {/* ── Vista previa + resultados ─────────────────── */}
          <div className="lg:sticky lg:top-24 space-y-4 min-w-0">
            <SitePreview config={config} />

            <div id="ahorro" className="rounded-[2rem] p-5 sm:p-7 border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.10] via-emerald-500/[0.03] to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div aria-live="polite">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300/90">Ahorro estimado al mes</p>
                  <p className="mt-1 font-display text-5xl sm:text-6xl font-bold text-emerald-400 tabular-nums leading-none">
                    <AnimatedCounter value={result.monthlyNet} suffix=" €" />
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    <AnimatedCounter value={result.yearlyNet} suffix=" € al año" className="text-emerald-300 font-semibold" />
                  </p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 sm:text-right">
                  <p className="text-[11px] text-muted flex sm:justify-end items-center gap-1">
                    <Clock3 size={12} aria-hidden="true" /> Tiempo que recuperas
                  </p>
                  <p className="font-display text-2xl font-bold tabular-nums">
                    <AnimatedCounter value={result.hours} suffix=" h/mes" />
                  </p>
                </div>
              </div>

              <dl className="mt-6 space-y-2 text-sm">
                <Row label="Comisiones de plataformas evitadas" value={result.commissionSaved} hidden={sector.platformFee === 0} />
                <Row label={`Horas de atención (${ASSUMPTIONS.hourlyCost} €/h)`} value={result.hoursValue} />
                <Row label="Citas no perdidas (menos ausencias)" value={result.noShowRecovered} hidden={sector.noShowRate === 0} />
                <div className="flex justify-between gap-3 pt-2 border-t border-white/[0.08]">
                  <dt className="text-muted">Plan {result.planName} de LOCALIS (tarifa plana)</dt>
                  <dd className="font-semibold tabular-nums text-cyan-300">−{result.planPrice} €</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={requestDemo}
                  aria-disabled={!hasFeatures}
                  className={cn("btn btn-primary flex-1", !hasFeatures && "opacity-50 cursor-not-allowed")}
                >
                  Quiero esta web · pedir demo <ArrowRight size={17} aria-hidden="true" />
                </button>
                <a
                  href={waLink(`Hola LOCALIS AI, he configurado mi web: ${summary}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost text-sm"
                >
                  <WhatsAppIcon size={17} className="text-[#25D366]" /> Enviar por WhatsApp
                </a>
              </div>

              <details className="mt-5 group">
                <summary className="cursor-pointer list-none text-xs text-muted hover:text-foreground inline-flex items-center gap-1.5 [&::-webkit-details-marker]:hidden">
                  <Info size={13} aria-hidden="true" /> ¿Cómo lo calculamos?
                </summary>
                <p className="mt-2 text-xs text-muted leading-relaxed">
                  Estimación orientativa con tu volumen y un ticket medio de {sector.ticket} € en {sector.short.toLowerCase()}. Contamos{" "}
                  {ASSUMPTIONS.minPerBooking} min por cita gestionada, {ASSUMPTIONS.minPerMessage} min por conversación y factura,{" "}
                  {ASSUMPTIONS.minPerPhoneOrder} min por pedido telefónico y {ASSUMPTIONS.minPerTrackingCall} min por llamada de
                  seguimiento, a {ASSUMPTIONS.hourlyCost} €/h. Las comisiones solo se cuentan si repartes con tus propios medios (GPS)
                  {sector.noShowRate > 0 ? `, y las ausencias bajan un ${ASSUMPTIONS.noShowReduction * 100} % con recordatorios automáticos` : ""}.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectedBadge() {
  return (
    <span className="cfg-badge" aria-hidden="true">
      <Check size={12} strokeWidth={3} />
    </span>
  );
}

function Row({ label, value, hidden }: { label: string; value: number; hidden?: boolean }) {
  if (hidden) return null;
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("font-semibold tabular-nums", value > 0 ? "text-emerald-300" : "text-muted")}>+{eur(value)} €</dd>
    </div>
  );
}

function CfgSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground/90">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-lg font-bold text-cyan-300 tabular-nums shrink-0">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
        className="range w-full"
        style={{ ["--pct" as string]: `${pct}%` }}
      />
    </div>
  );
}

// ── Vista previa en vivo de la web que se está configurando ──────────
function SitePreview({ config }: { config: Config }) {
  const s = sectorById(config.sector);
  const on = (f: FeatureId) => config.features.includes(f);
  const pages =
    config.pages === "landing"
      ? ["Inicio"]
      : config.pages === "corporativa"
        ? ["Inicio", s.catalogWord, "Nosotros", "Contacto"]
        : ["Inicio", s.catalogWord, "Pedidos", "Ofertas", "Nosotros", "Contacto"];

  return (
    <div className="config-preview border-glow rounded-[2rem] overflow-hidden shadow-glass" aria-label={`Vista previa de la web de ${s.sampleName}`} role="img">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.07] bg-black/30">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        </span>
        <span className="flex-1 mx-2 truncate rounded-lg bg-white/[0.05] px-3 py-1 text-[11px] text-muted">
          {s.sampleName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "")}.es
        </span>
      </div>

      {/* key por sector: al cambiar, el bloque se vuelve a montar con un fundido CSS (GPU). */}
      <div key={config.sector} className="cfg-fade p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <span className="font-display font-bold text-sm mr-2">{s.sampleName}</span>
            {pages.map((p, i) => (
              <span
                key={p}
                className={cn(
                  "cfg-pop text-[10.5px] px-2 py-1 rounded-md border",
                  i === 0 ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-200" : "border-white/[0.08] text-muted"
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {p}
              </span>
            ))}
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-cyan-500/[0.10] to-cobalt-500/[0.06] border border-white/[0.07] p-4">
            <p className="font-display font-bold text-lg leading-tight">{headline(s.id)}</p>
            <p className="text-xs text-muted mt-1">Zaragoza · Abierto hoy</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {on("citas") && <PreviewChip key="c" tone="primary">{s.bookingCta}</PreviewChip>}
              {on("catalogo") && <PreviewChip key="o" tone="primary">Pedir online</PreviewChip>}
              {on("whatsapp") && <PreviewChip key="w" tone="wa">WhatsApp</PreviewChip>}
              {!on("citas") && !on("catalogo") && !on("whatsapp") && <PreviewChip tone="ghost">Llamar</PreviewChip>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-2.5">
              {on("catalogo") && (
                <PreviewBlock key="cat" className="col-span-2">
                  <p className="text-[11px] font-semibold mb-2">{s.catalogWord}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2">
                        <div className="h-8 rounded-md bg-gradient-to-br from-cyan-500/20 to-cobalt-500/20" />
                        <div className="mt-1.5 h-1.5 w-3/4 rounded bg-white/15" />
                        <div className="mt-1 h-1.5 w-1/3 rounded bg-cyan-400/40" />
                      </div>
                    ))}
                  </div>
                </PreviewBlock>
              )}
              {on("citas") && (
                <PreviewBlock key="cal">
                  <p className="text-[11px] font-semibold mb-2 flex items-center gap-1">
                    <CalendarCheck size={12} className="text-cyan-300" aria-hidden="true" /> Huecos libres
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {["10:00", "11:30", "17:00"].map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </PreviewBlock>
              )}
              {on("gps") && (
                <PreviewBlock key="gps">
                  <p className="text-[11px] font-semibold mb-2 flex items-center gap-1">
                    <Navigation size={12} className="text-emerald-400" aria-hidden="true" /> Tu pedido llega en 6 min
                  </p>
                  <div className="cfg-rider-track relative h-8 rounded-md bg-[#0A0E15] overflow-hidden">
                    <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 bg-cyan-400/30 rounded" />
                    <div className="cfg-rider absolute top-1/2 -mt-1.5 w-3 h-3 rounded-full bg-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.8)]" />
                    <div className="absolute right-2 top-1/2 -mt-1 w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </PreviewBlock>
              )}
              {on("whatsapp") && (
                <PreviewBlock key="wa">
                  <p className="text-[11px] font-semibold mb-2 flex items-center gap-1">
                    <WhatsAppIcon size={12} className="text-[#25D366]" /> Stella responde
                  </p>
                  <p className="text-[10.5px] leading-snug rounded-lg rounded-tl-sm bg-white/[0.06] px-2 py-1.5">¡Hola! ¿En qué te ayudo? 😊</p>
                </PreviewBlock>
              )}
          </div>
      </div>
    </div>
  );
}

function headline(id: SectorId): string {
  switch (id) {
    case "restaurante":
      return "Pizza artesana a domicilio, sin esperas";
    case "clinica":
      return "Tu sonrisa en buenas manos";
    case "taller":
      return "Tu coche listo cuando lo necesitas";
    default:
      return "Producto fresco de barrio, en tu casa";
  }
}

function PreviewChip({ children, tone }: { children: React.ReactNode; tone: "primary" | "wa" | "ghost" }) {
  return (
    <span
      className={cn(
        "cfg-pop text-[11px] font-semibold px-2.5 py-1.5 rounded-lg",
        tone === "primary" && "bg-brand",
        tone === "wa" && "bg-[#25D366] text-[#05210f]",
        tone === "ghost" && "border border-white/15 text-muted"
      )}
    >
      {children}
    </span>
  );
}

function PreviewBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("cfg-pop rounded-xl bg-white/[0.03] border border-white/[0.07] p-3", className)}>{children}</div>;
}
