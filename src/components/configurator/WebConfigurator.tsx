"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  UtensilsCrossed,
  Stethoscope,
  Wrench,
  Store,
  Plus,
  X,
  Check,
  Sparkles,
  ArrowRight,
  Bot,
  Navigation,
  ShoppingBag,
  Info,
  Palette,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedCounter from "@/components/effects/AnimatedCounter";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { MARKET, reviewedLabel } from "@/lib/marketPrices";
import { SECTORS, sectorById, type SectorId } from "./configModel";
import {
  BRAND_SWATCHES,
  BUTTON_PRESETS,
  HOVER_ANIMS,
  MODULES,
  PAGE_NAME_MAX,
  PRICING,
  STYLES,
  defaultStudio,
  newButtonId,
  pageNameError,
  quote,
  readableOn,
  styleById,
  type HoverAnim,
  type ModuleId,
  type Studio,
  type StyleId,
} from "./studioModel";
import StudioSendModal from "./StudioSendModal";

const SECTOR_ICONS: Record<SectorId, LucideIcon> = { restaurante: UtensilsCrossed, clinica: Stethoscope, taller: Wrench, comercio: Store };
const MODULE_ICONS: Record<ModuleId, LucideIcon> = { stella: Bot, gps: Navigation, catalogo: ShoppingBag };
const MAX_BUTTONS = 4;
const BUTTON_LABEL_MAX = 24;
const eur = (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`;

export default function WebConfigurator() {
  const [studio, setStudio] = useState<Studio>(() => defaultStudio("restaurante"));
  const [activePage, setActivePage] = useState(0);
  const [demo, setDemo] = useState<string | null>(null); // botón que reproduce su animación
  const [sendOpen, setSendOpen] = useState(false);
  const demoTimer = useRef<number | null>(null);

  const q = useMemo(() => quote(studio), [studio]);
  const sector = sectorById(studio.sector);
  const style = styleById(studio.style);
  const pageErrors = studio.pages.map((p, i) => pageNameError(p, studio.pages, i));
  const hasErrors = pageErrors.some(Boolean) || studio.buttons.some((b) => !b.label.trim());
  const showFee = sector.platformFee > 0 && studio.modules.includes("gps");

  useEffect(() => () => {
    if (demoTimer.current) window.clearTimeout(demoTimer.current);
  }, []);

  const patch = (p: Partial<Studio>) => setStudio((s) => ({ ...s, ...p }));

  const chooseSector = (id: SectorId) => {
    if (id === studio.sector) return;
    setStudio(defaultStudio(id));
    setActivePage(0);
  };

  const chooseStyle = (id: StyleId) => patch({ style: id, brand: styleById(id).accent });

  // ── Páginas ───────────────────────────────────────────────────
  const renamePage = (i: number, name: string) => patch({ pages: studio.pages.map((p, j) => (j === i ? name.slice(0, PAGE_NAME_MAX + 4) : p)) });
  const removePage = (i: number) => {
    if (studio.pages.length <= PRICING.minPages) return;
    patch({ pages: studio.pages.filter((_, j) => j !== i) });
    setActivePage((a) => Math.max(0, Math.min(a, studio.pages.length - 2)));
  };
  const addPage = () => {
    if (studio.pages.length >= PRICING.maxPages) return;
    let n = studio.pages.length + 1;
    let name = `Página ${n}`;
    while (studio.pages.some((p) => p.toLowerCase() === name.toLowerCase())) name = `Página ${++n}`;
    patch({ pages: [...studio.pages, name] });
    setActivePage(studio.pages.length);
  };

  // ── Botones ───────────────────────────────────────────────────
  const playDemo = (id: string) => {
    setDemo(id);
    if (demoTimer.current) window.clearTimeout(demoTimer.current);
    demoTimer.current = window.setTimeout(() => setDemo(null), 1400);
  };
  const addButton = (label: string) => {
    if (studio.buttons.length >= MAX_BUTTONS) return;
    const id = newButtonId();
    patch({ buttons: [...studio.buttons, { id, label, anim: "neon" }] });
    playDemo(id);
  };
  const updateButton = (id: string, p: { label?: string; anim?: HoverAnim }) => {
    patch({ buttons: studio.buttons.map((b) => (b.id === id ? { ...b, ...p, label: (p.label ?? b.label).slice(0, BUTTON_LABEL_MAX) } : b)) });
    if (p.anim) playDemo(id);
  };
  const removeButton = (id: string) => patch({ buttons: studio.buttons.filter((b) => b.id !== id) });
  const unusedPresets = BUTTON_PRESETS.filter((p) => !studio.buttons.some((b) => b.label === p));

  const toggleModule = (id: ModuleId) =>
    patch({ modules: studio.modules.includes(id) ? studio.modules.filter((m) => m !== id) : [...studio.modules, id] });

  const canvasVars = {
    "--c-bg": style.bg,
    "--c-surface": style.surface,
    "--c-text": style.text,
    "--c-muted": style.muted,
    "--c-border": style.border,
    "--c-accent": studio.brand,
    "--c-on-accent": readableOn(studio.brand),
    "--c-font": style.font,
  } as CSSProperties;

  return (
    <section id="configurador" aria-labelledby="configurador-title" className="relative w-full py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="eyebrow eyebrow-live mb-5">
            <Sparkles size={13} aria-hidden="true" /> Estudio visual · en directo
          </span>
          <h2 id="configurador-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Diseña tu web <span className="gradient-text">en directo</span> y descubre cuánto ahorras
          </h2>
          <p className="mt-5 text-muted text-base sm:text-lg leading-relaxed">
            Elige estilo, colores, páginas, botones y animaciones. Lo ves al instante, con precio cerrado y comparado con lo que
            cobra hoy una agencia.
          </p>
        </div>

        <div className="studio-grid grid grid-cols-1 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] gap-5 items-start">
          {/* ═════════════ Controles ═════════════ */}
          <div className="border-glow rounded-[2rem] p-5 sm:p-6 shadow-glass space-y-7">
            <fieldset>
              <legend className="cfg-step">
                <span>1</span> Tu negocio
              </legend>
              <div className="grid grid-cols-2 gap-2.5">
                {SECTORS.map((s) => {
                  const Icon = SECTOR_ICONS[s.id];
                  const selected = s.id === studio.sector;
                  return (
                    <label key={s.id} className={cn("cfg-option !p-3", selected && "is-selected")}>
                      <input type="radio" name="st-sector" checked={selected} onChange={() => chooseSector(s.id)} className="sr-only" />
                      <span className="flex items-center gap-2.5">
                        <span className={cn("cfg-icon !w-9 !h-9 shrink-0", selected && "is-selected")}>
                          <Icon size={17} aria-hidden="true" />
                        </span>
                        <span className="text-[13px] font-semibold leading-tight">{s.label}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-[11.5px] text-muted">Al cambiar de sector cargamos una propuesta recomendada que puedes ajustar.</p>
            </fieldset>

            <fieldset>
              <legend className="cfg-step">
                <span>2</span> Estilo y color de marca
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map((st) => {
                  const selected = st.id === studio.style;
                  return (
                    <label key={st.id} className={cn("cfg-option !p-2.5", selected && "is-selected")}>
                      <input type="radio" name="st-style" checked={selected} onChange={() => chooseStyle(st.id)} className="sr-only" />
                      <span className="block h-12 rounded-lg border overflow-hidden" style={{ background: st.bg, borderColor: st.border }} aria-hidden="true">
                        <span className="block h-3" style={{ background: st.surface, borderBottom: `1px solid ${st.border}` }} />
                        <span className="flex gap-1 p-1.5">
                          <span className="h-2 w-6 rounded" style={{ background: st.accent }} />
                          <span className="h-2 w-4 rounded" style={{ background: st.muted, opacity: 0.5 }} />
                        </span>
                      </span>
                      <span className="mt-1.5 block text-[11.5px] font-semibold leading-tight">{st.label}</span>
                      <span className="block text-[10.5px] text-muted leading-tight">{st.hint}</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-3" role="radiogroup" aria-label="Color de marca">
                <Palette size={16} className="text-muted shrink-0" aria-hidden="true" />
                {BRAND_SWATCHES.map((sw) => {
                  const selected = sw.hex.toLowerCase() === studio.brand.toLowerCase();
                  return (
                    <button
                      key={sw.hex}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={`Color ${sw.name}`}
                      onClick={() => patch({ brand: sw.hex })}
                      className={cn("swatch", selected && "is-selected")}
                      style={{ background: sw.hex }}
                    >
                      {selected && <Check size={14} strokeWidth={3} style={{ color: readableOn(sw.hex) }} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="cfg-step">
                <span>3</span> Páginas ({studio.pages.length}/{PRICING.maxPages})
              </legend>
              <ul className="space-y-2">
                {studio.pages.map((p, i) => (
                  <li key={i}>
                    <div className="flex items-center gap-2">
                      <label className="sr-only" htmlFor={`st-page-${i}`}>
                        Nombre de la página {i + 1}
                      </label>
                      <input
                        id={`st-page-${i}`}
                        value={p}
                        onChange={(e) => renamePage(i, e.target.value)}
                        onFocus={() => setActivePage(i)}
                        aria-invalid={Boolean(pageErrors[i])}
                        aria-describedby={pageErrors[i] ? `st-page-err-${i}` : undefined}
                        className={cn(
                          "focus-ring flex-1 min-w-0 min-h-[44px] rounded-xl bg-[#0B0F17]/80 border px-3 text-sm",
                          pageErrors[i] ? "border-red-400/60" : "border-white/10"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => removePage(i)}
                        disabled={studio.pages.length <= PRICING.minPages}
                        aria-label={`Quitar la página ${p || i + 1}`}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-muted hover:text-foreground hover:border-red-400/40 disabled:opacity-30 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {pageErrors[i] && (
                      <p id={`st-page-err-${i}`} className="mt-1 text-xs text-red-300">
                        {pageErrors[i]}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={addPage}
                disabled={studio.pages.length >= PRICING.maxPages}
                className="btn btn-ghost mt-2.5 w-full min-h-[44px] text-sm disabled:opacity-40"
              >
                <Plus size={16} aria-hidden="true" /> Añadir página
                <span className="text-xs text-muted font-medium">(+{PRICING.extraPage} € desde la {PRICING.includedPages + 1}.ª)</span>
              </button>
            </fieldset>

            <fieldset>
              <legend className="cfg-step">
                <span>4</span> Botones y animación al pasar el ratón
              </legend>
              <ul className="space-y-2.5">
                {studio.buttons.map((b) => (
                  <li key={b.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2.5">
                    <div className="flex items-center gap-2">
                      <label className="sr-only" htmlFor={`st-btn-${b.id}`}>
                        Texto del botón
                      </label>
                      <input
                        id={`st-btn-${b.id}`}
                        value={b.label}
                        onChange={(e) => updateButton(b.id, { label: e.target.value })}
                        aria-invalid={!b.label.trim()}
                        className={cn("focus-ring flex-1 min-w-0 min-h-[42px] rounded-xl bg-[#0B0F17]/80 border px-3 text-sm", !b.label.trim() ? "border-red-400/60" : "border-white/10")}
                      />
                      <button
                        type="button"
                        onClick={() => removeButton(b.id)}
                        aria-label={`Quitar el botón ${b.label}`}
                        className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-white/10 text-muted hover:text-foreground hover:border-red-400/40 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {!b.label.trim() && <p className="mt-1 text-xs text-red-300">Escribe el texto del botón.</p>}
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5" role="radiogroup" aria-label={`Animación de ${b.label || "botón"}`}>
                      {HOVER_ANIMS.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          role="radio"
                          aria-checked={b.anim === a.id}
                          onClick={() => updateButton(b.id, { anim: a.id })}
                          className={cn(
                            "min-h-[36px] rounded-lg px-2 text-[11.5px] font-semibold border transition-colors",
                            b.anim === a.id ? "bg-cyan-500/15 border-cyan-500/45 text-cyan-200" : "border-white/[0.08] text-muted hover:text-foreground"
                          )}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              {studio.buttons.length < MAX_BUTTONS && unusedPresets.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {unusedPresets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => addButton(p)}
                      className="inline-flex items-center gap-1 min-h-[36px] rounded-lg border border-dashed border-white/15 px-2.5 text-xs font-medium text-muted hover:text-foreground hover:border-cyan-500/40 transition-colors"
                    >
                      <Plus size={13} aria-hidden="true" /> {p}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[11.5px] text-muted flex items-center gap-1.5">
                <MousePointerClick size={13} aria-hidden="true" /> Pasa el ratón (o toca) los botones del lienzo para probar el efecto.
              </p>
            </fieldset>

            <fieldset>
              <legend className="cfg-step">
                <span>5</span> Módulos inteligentes
              </legend>
              <div className="space-y-2">
                {MODULES.map((m) => {
                  const Icon = MODULE_ICONS[m.id];
                  const on = studio.modules.includes(m.id);
                  return (
                    <label key={m.id} className={cn("cfg-toggle !min-h-[58px]", on && "is-on")}>
                      <input type="checkbox" role="switch" aria-checked={on} checked={on} onChange={() => toggleModule(m.id)} className="sr-only" />
                      <span className={cn("cfg-icon !w-9 !h-9 shrink-0", on && "is-selected")}>
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">
                          {m.label} <span className="text-cyan-300 font-medium">+{m.price} €</span>
                        </span>
                        <span className="block text-xs text-muted">{m.detail}</span>
                      </span>
                      <span className="cfg-switch" aria-hidden="true">
                        <span />
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="cfg-step">
                <span>6</span> Tu volumen (para el ahorro mensual)
              </legend>
              <StudioSlider
                id="st-volume"
                label={sector.volumeLabel}
                value={studio.volume}
                min={sector.volume.min}
                max={sector.volume.max}
                step={sector.volume.step}
                display={`${studio.volume.toLocaleString("es-ES")} ${sector.unit}`}
                onChange={(v) => patch({ volume: v })}
              />
              {showFee && (
                <div className="mt-4">
                  <StudioSlider
                    id="st-fee"
                    label="Comisión que pagas hoy a Glovo, Uber Eats o Just Eat"
                    value={Math.round(studio.fee * 100)}
                    min={20}
                    max={30}
                    step={1}
                    display={`${Math.round(studio.fee * 100)} %`}
                    onChange={(v) => patch({ fee: v / 100 })}
                  />
                </div>
              )}
            </fieldset>

            {/* Móvil: precio y ahorro siempre a la vista mientras se configura */}
            <a
              href="#studio-canvas"
              className="lg:hidden sticky bottom-[calc(80px+env(safe-area-inset-bottom))] z-10 -mx-1 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-[#0B1A17]/95 px-4 py-3 shadow-glass"
            >
              <span className="leading-tight">
                <span className="block font-display text-xl font-bold tabular-nums">
                  <AnimatedCounter value={q.total} suffix=" €" />
                </span>
                <span className="block text-xs font-semibold text-emerald-400">
                  Ahorras un <AnimatedCounter value={q.savingPct} suffix=" %" />
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-300">
                Ver mi web <ArrowRight size={15} aria-hidden="true" />
              </span>
            </a>
          </div>

          {/* ═════════════ Lienzo en vivo + precio ═════════════ */}
          <div className="lg:sticky lg:top-20 space-y-4 min-w-0">
            <div id="studio-canvas" className="rounded-[1.6rem] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1A2232]">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </span>
                <span className="flex-1 mx-2 truncate rounded-lg bg-black/30 px-3 py-1 text-[11px] text-slate-300">
                  {slug(sector.sampleName)}.es/{activePage === 0 ? "" : slug(studio.pages[activePage] ?? "")}
                </span>
                <span className="text-[10.5px] font-semibold text-emerald-300 hidden sm:inline">Vista previa en vivo</span>
              </div>

              <div className="studio-canvas" style={canvasVars}>
                <div className="sc-nav">
                  <span className="sc-logo" style={{ fontFamily: style.font }}>
                    {sector.sampleName}
                  </span>
                  <div className="sc-tabs no-scrollbar" role="tablist" aria-label="Páginas de la vista previa">
                    {studio.pages.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={i === activePage}
                        onClick={() => setActivePage(i)}
                        className={cn("sc-tab", i === activePage && "is-active")}
                      >
                        {p.trim() || "Sin nombre"}
                      </button>
                    ))}
                  </div>
                </div>

                <div key={`${studio.sector}-${activePage}`} className="sc-hero cfg-fade">
                  <p className="sc-kicker">{studio.pages[activePage]?.trim() || "Inicio"}</p>
                  <p className="sc-title" style={{ fontFamily: style.font }}>
                    {heroTitle(studio.sector)}
                  </p>
                  <p className="sc-sub">Zaragoza · Abierto hoy · Atención 24/7</p>
                  <div className="sc-actions">
                    {studio.buttons.length === 0 && <span className="sc-empty">Añade botones desde el paso 4</span>}
                    {studio.buttons.map((b, i) => (
                      <button
                        key={b.id}
                        type="button"
                        aria-label={`Vista previa del botón ${b.label} con animación ${HOVER_ANIMS.find((a) => a.id === b.anim)?.label}`}
                        className={cn("sc-btn", i > 0 && "is-outline", `anim-${b.anim}`, demo === b.id && "is-demo")}
                        onClick={() => playDemo(b.id)}
                      >
                        <span className="sc-sweep" aria-hidden="true" />
                        {b.label.trim() === "Hablar por WhatsApp" && <WhatsAppIcon size={14} />}
                        <span>{b.label.trim() || "Botón"}</span>
                        <ArrowRight size={14} className="sc-arrow" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>

                {studio.modules.length > 0 && (
                  <div className="sc-modules">
                    {studio.modules.includes("catalogo") && (
                      <div className="sc-card cfg-pop sc-wide">
                        <p className="sc-card-title">
                          <ShoppingBag size={13} aria-hidden="true" /> {sector.catalogWord}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="sc-item">
                              <div className="sc-thumb" />
                              <div className="sc-line" />
                              <div className="sc-price" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {studio.modules.includes("stella") && (
                      <div className="sc-card cfg-pop">
                        <p className="sc-card-title">
                          <Bot size={13} aria-hidden="true" /> Stella · 24/7
                        </p>
                        <p className="sc-bubble">¡Hola! Tengo hueco hoy a las 17:30. ¿Te lo reservo? 📅</p>
                      </div>
                    )}
                    {studio.modules.includes("gps") && (
                      <div className="sc-card cfg-pop">
                        <p className="sc-card-title">
                          <Navigation size={13} aria-hidden="true" /> Tu pedido llega en 6 min
                        </p>
                        <div className="sc-track cfg-rider-track">
                          <span className="sc-road" />
                          <span className="cfg-rider sc-rider" />
                          <span className="sc-dest" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Panel de precio e impacto */}
            <div id="ahorro" className="border-glow rounded-[1.6rem] p-5 sm:p-6 shadow-glass">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
                  <p className="text-[11px] text-muted">Precio habitual en agencia</p>
                  <p className="mt-1 font-display text-2xl sm:text-3xl font-bold tabular-nums text-muted line-through decoration-red-400/80 decoration-2">
                    ~{eur(q.agency)}
                  </p>
                </div>
                <div className="rounded-2xl bg-cyan-500/[0.07] border border-cyan-500/30 p-4">
                  <p className="text-[11px] text-cyan-200/90">Tu precio en LOCALIS AI</p>
                  <p className="mt-1 font-display text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
                    <AnimatedCounter value={q.total} suffix=" €" />
                  </p>
                  <p className="text-[10.5px] text-muted">pago único{q.capped ? " · tope aplicado" : ""}</p>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-500/[0.16] to-emerald-500/[0.04] p-4 sm:p-5" aria-live="polite">
                <p className="font-display text-2xl sm:text-3xl font-bold text-emerald-400 leading-tight">
                  Te ahorras un <AnimatedCounter value={q.savingPct} suffix=" %" />
                </p>
                <p className="mt-1 text-sm text-emerald-100/90">
                  <AnimatedCounter value={q.saving} suffix=" €" className="font-semibold" /> hoy mismo en el desarrollo de tu web
                </p>
                {q.monthlySaving > 0 && (
                  <p className="mt-2 text-sm text-emerald-200/90 border-t border-emerald-500/20 pt-2">
                    + <AnimatedCounter value={q.monthlySaving} suffix=" €/mes" className="font-semibold text-emerald-300" />{" "}
                    {q.commissionSaved > 0 ? "sin comisiones del 20–30 % y con menos horas de gestión" : "en horas de gestión y citas no perdidas"}
                  </p>
                )}
              </div>

              <dl className="mt-4 space-y-1.5 text-[13px]">
                <Line label={`Web Esencial (hasta ${PRICING.includedPages} páginas, botones y animaciones)`} value={eur(q.base)} />
                {q.extraPages > 0 && <Line label={`${q.extraPages} página(s) extra × ${PRICING.extraPage} €`} value={`+${eur(q.extraPagesCost)}`} />}
                {MODULES.filter((m) => studio.modules.includes(m.id)).map((m) => (
                  <Line key={m.id} label={m.label} value={`+${eur(m.price)}`} />
                ))}
                {q.capped && <Line label={`Tope cerrado: nunca más de ${eur(PRICING.cap)}`} value={`−${eur(q.subtotal - q.total)}`} accent />}
                <div className="flex justify-between gap-3 pt-2 border-t border-white/[0.08] text-muted">
                  <dt>Mantenimiento sugerido · Plan {q.plan.name}</dt>
                  <dd className="tabular-nums">{q.plan.price} €/mes</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => !hasErrors && setSendOpen(true)}
                aria-disabled={hasErrors}
                className={cn("btn btn-primary w-full mt-5 min-h-[54px] text-base", hasErrors && "opacity-50 cursor-not-allowed")}
              >
                <WhatsAppIcon size={18} /> Quiero esta web · Enviar por WhatsApp
              </button>
              {hasErrors && (
                <p role="status" className="mt-2 text-xs text-amber-200 flex items-center gap-1.5">
                  <Info size={13} aria-hidden="true" /> Revisa los nombres de páginas y botones marcados en rojo.
                </p>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer list-none text-xs text-muted hover:text-foreground inline-flex items-center gap-1.5 [&::-webkit-details-marker]:hidden">
                  <Info size={13} aria-hidden="true" /> Precios de mercado revisados el {reviewedLabel()} · ver fuentes
                </summary>
                <ul className="mt-2 space-y-2 text-[11.5px] text-muted leading-relaxed">
                  {(
                    [
                      ["Web corporativa", MARKET.web],
                      ["Página adicional", MARKET.extraPage],
                      ["Asistente IA / WhatsApp", MARKET.stella],
                      ["Seguimiento GPS a medida", MARKET.gps],
                      ["Tienda / carta con pedidos", MARKET.catalogo],
                      ["Comisión de plataformas", MARKET.commission],
                    ] as const
                  ).map(([name, item]) => (
                    <li key={name}>
                      <span className="text-foreground/85 font-medium">{name}:</span> {item.range}. {item.method}{" "}
                      {item.sources.map((s, i) => (
                        <span key={s.url}>
                          {i > 0 && " · "}
                          <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-cyan-400 underline underline-offset-2">
                            {s.name}
                          </a>
                        </span>
                      ))}
                    </li>
                  ))}
                  <li>Importes sin IVA. El precio de agencia usa el extremo bajo de cada rango publicado.</li>
                </ul>
              </details>
            </div>
          </div>
        </div>
      </div>

      <StudioSendModal open={sendOpen} onClose={() => setSendOpen(false)} studio={studio} quote={q} />
    </section>
  );
}

function Line({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("tabular-nums font-semibold shrink-0", accent ? "text-emerald-300" : "text-foreground/90")}>{value}</dd>
    </div>
  );
}

function StudioSlider({
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
        <output htmlFor={id} className="font-display text-base font-bold text-cyan-300 tabular-nums shrink-0">
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
          if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="range w-full"
        style={{ ["--pct" as string]: `${pct}%` }}
      />
    </div>
  );
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function heroTitle(id: SectorId): string {
  switch (id) {
    case "restaurante":
      return "Cocina casera a domicilio, sin esperas";
    case "clinica":
      return "Tu sonrisa en las mejores manos";
    case "taller":
      return "Tu coche listo cuando lo necesitas";
    default:
      return "Producto de barrio, en tu puerta hoy";
  }
}
