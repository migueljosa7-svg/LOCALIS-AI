"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Choice, Field, Panel, Toggle, inputCls } from "./ui";
import type { StepProps } from "./StepsDesign";
import type { ImageStore } from "./imageStore";
import { SAMPLE_IMAGES, sampleSrc } from "@/lib/builder/images";
import { LIMITS } from "@/lib/builder/validate";
import {
  ACTIONS, POSITIONS, SECTION_DEFS, buttonPending, moveSection, newButtonId, reorderSection, sectionsFor, toggleSection,
  type BuilderButton, type ButtonPosition, type SectionId, type SiteConfig,
} from "@/lib/builder/model";

// ── Secciones ─────────────────────────────────────────────────────
export function SectionsStep({ cfg, set }: StepProps) {
  const [drag, setDrag] = useState<SectionId | null>(null);
  const [over, setOver] = useState<SectionId | null>(null);
  const allowed = sectionsFor(cfg.business.sector);
  const list = cfg.sections.filter((s) => allowed.includes(s.id));
  const [status, setStatus] = useState("");

  const move = (id: SectionId, dir: -1 | 1) => {
    set((c) => ({ ...c, sections: moveSection(c.sections, id, dir) }));
    setStatus(`${SECTION_DEFS[id].label} movida ${dir < 0 ? "arriba" : "abajo"}`);
  };

  return (
    <Panel title="Organiza tu página" hint="Activa o desactiva secciones y cámbialas de orden: arrastra con el ratón o usa las flechas. La cabecera y el pie siempre quedan al principio y al final.">
      <p className="sr-only" role="status" aria-live="polite">{status}</p>
      <ul className="space-y-2">
        {list.map((s, i) => {
          const def = SECTION_DEFS[s.id];
          const fixed = !!def.fixed;
          return (
            <li
              key={s.id}
              draggable={!fixed}
              onDragStart={(e) => {
                setDrag(s.id);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", s.id);
              }}
              onDragOver={(e) => {
                if (drag && !(def.fixed === "start")) {
                  e.preventDefault();
                  setOver(s.id);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (drag) set((c) => ({ ...c, sections: reorderSection(c.sections, drag, s.id) }));
                setDrag(null);
                setOver(null);
              }}
              onDragEnd={() => {
                setDrag(null);
                setOver(null);
              }}
              data-testid={`section-${s.id}`}
              className={cn("flex items-center gap-2 rounded-xl border p-2 transition-colors", s.enabled ? "border-white/15 bg-white/[0.05]" : "border-white/[0.06] bg-white/[0.015] opacity-70", over === s.id && drag !== s.id && "border-cyan-400")}
            >
              <span className={cn("flex h-11 w-7 shrink-0 items-center justify-center text-muted", !fixed && "cursor-grab")} aria-hidden="true">
                {!fixed && <GripVertical size={18} />}
              </span>
              <label className="flex min-h-[44px] min-w-0 flex-1 cursor-pointer items-center gap-3">
                <input type="checkbox" checked={s.enabled} onChange={() => set((c) => ({ ...c, sections: toggleSection(c.sections, s.id) }))} className="h-5 w-5 shrink-0 accent-cyan-400" aria-label={`Mostrar ${def.label}`} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{def.label}</span>
                  <span className="block truncate text-xs text-muted">{def.hint}</span>
                </span>
              </label>
              {!fixed && (
                <span className="flex shrink-0">
                  <button type="button" aria-label={`Subir ${def.label}`} disabled={i <= 1} onClick={() => move(s.id, -1)} className="flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-white/10 hover:text-foreground disabled:opacity-30">
                    <ArrowUp size={17} />
                  </button>
                  <button type="button" aria-label={`Bajar ${def.label}`} disabled={i >= list.length - 2} onClick={() => move(s.id, 1)} className="flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-white/10 hover:text-foreground disabled:opacity-30">
                    <ArrowDown size={17} />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <Field label="Número de páginas de la web" hint="Es lo que determina el precio base. Las secciones de arriba se reparten en esas páginas.">
        {(id) => (
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Una página menos" onClick={() => set((c) => ({ ...c, pages: Math.max(4, c.pages - 1) }))} className="h-11 w-11 rounded-xl border border-white/10 text-lg">−</button>
            <output id={id} className="min-w-10 text-center font-display text-2xl font-bold" aria-live="polite">{cfg.pages}</output>
            <button type="button" aria-label="Una página más" onClick={() => set((c) => ({ ...c, pages: Math.min(10, c.pages + 1) }))} className="h-11 w-11 rounded-xl border border-white/10 text-lg">+</button>
          </div>
        )}
      </Field>
    </Panel>
  );
}

// ── Botones ───────────────────────────────────────────────────────
export function ButtonsStep({ cfg, set }: StepProps) {
  const update = (id: string, patch: Partial<BuilderButton>) => set((c) => ({ ...c, buttons: c.buttons.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  const add = () =>
    set((c) =>
      c.buttons.length >= LIMITS.maxButtons
        ? c
        : { ...c, buttons: [...c.buttons, { id: newButtonId(), label: "Llamar ahora", action: "call", url: "", target: "services", style: "solido", shape: "redondeado", color: "button", positions: ["hero"] }] }
    );
  const enabledTargets = cfg.sections.filter((s) => s.enabled && s.id !== "header" && s.id !== "footer");
  return (
    <Panel title="Botones" hint="Añade los botones que quieras, elige qué hacen y dónde aparecen. Si falta un dato (teléfono, WhatsApp, enlace), el botón queda como ejemplo hasta que lo completes.">
      <div className="space-y-4">
        {cfg.buttons.map((b) => {
          const pend = buttonPending(b, cfg.business);
          return (
            <div key={b.id} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5" data-testid="button-card">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Field label="Texto del botón">
                    {(id) => <input id={id} className={inputCls} value={b.label} maxLength={40} onChange={(e) => update(b.id, { label: e.target.value })} />}
                  </Field>
                </div>
                <button type="button" aria-label={`Quitar el botón «${b.label}»`} onClick={() => set((c) => ({ ...c, buttons: c.buttons.filter((x) => x.id !== b.id) }))} className="mt-6 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-muted hover:text-red-300">
                  <Trash2 size={17} />
                </button>
              </div>
              <Field label="¿Qué hace?">
                {(id) => (
                  <select id={id} className={inputCls} value={b.action} onChange={(e) => update(b.id, { action: e.target.value as BuilderButton["action"] })}>
                    {ACTIONS.map((a) => (
                      <option key={a.id} value={a.id}>{a.label} · {a.hint}</option>
                    ))}
                  </select>
                )}
              </Field>
              {b.action === "link" && (
                <Field label="Dirección del enlace" hint="Debe empezar por https://">
                  {(id) => <input id={id} className={inputCls} type="url" inputMode="url" placeholder="https://" value={b.url} onChange={(e) => update(b.id, { url: e.target.value })} />}
                </Field>
              )}
              {b.action === "section" && (
                <Field label="Sección de destino">
                  {(id) => (
                    <select id={id} className={inputCls} value={b.target} onChange={(e) => update(b.id, { target: e.target.value as SectionId })}>
                      {enabledTargets.map((s) => (
                        <option key={s.id} value={s.id}>{SECTION_DEFS[s.id].label}</option>
                      ))}
                    </select>
                  )}
                </Field>
              )}
              {pend && <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-100">Pendiente de configuración: {pend.toLowerCase()} (en «Tu negocio»). Mientras tanto se muestra como ejemplo.</p>}
              <Choice label="Estilo" cols={4} value={b.style} onChange={(v) => update(b.id, { style: v })} options={[{ id: "solido", label: "Sólido" }, { id: "contorno", label: "Contorno" }, { id: "suave", label: "Suave" }, { id: "texto", label: "Texto" }]} />
              <Choice label="Forma" value={b.shape} onChange={(v) => update(b.id, { shape: v })} options={[{ id: "cuadrado", label: "Cuadrado" }, { id: "redondeado", label: "Redondeado" }, { id: "pildora", label: "Píldora" }]} />
              <Choice label="Color" cols={4} value={/^#/.test(b.color) ? "custom" : (b.color as "button")} onChange={(v) => v !== "custom" && update(b.id, { color: v })} options={[{ id: "button", label: "Botones" }, { id: "primary", label: "Principal" }, { id: "secondary", label: "Secundario" }, { id: "custom" as "button", label: "Propio" }]} />
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted" htmlFor={`col-${b.id}`}>Color propio</label>
                <input id={`col-${b.id}`} type="color" aria-label="Color propio del botón" value={/^#/.test(b.color) ? b.color : cfg.theme.colors.button} onChange={(e) => update(b.id, { color: e.target.value.toLowerCase() })} className="h-11 w-14 cursor-pointer rounded-lg border border-white/15 bg-transparent" />
              </div>
              <fieldset>
                <legend className="mb-1.5 text-sm font-semibold">¿Dónde aparece?</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {POSITIONS.map((p) => (
                    <Toggle
                      key={p.id}
                      label={p.label}
                      checked={b.positions.includes(p.id)}
                      onChange={(on) => update(b.id, { positions: on ? [...b.positions, p.id as ButtonPosition] : b.positions.filter((x) => x !== p.id) })}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={add} disabled={cfg.buttons.length >= LIMITS.maxButtons} className="btn btn-ghost min-h-[48px] w-full disabled:opacity-40">
        <Plus size={17} aria-hidden="true" /> Añadir un botón
      </button>
      <div className="flex flex-wrap gap-2">
        {["Pedir presupuesto", "Reservar cita", "Llamar ahora", "Ver servicios", "Escríbenos por WhatsApp"].map((l) => (
          <button
            key={l}
            type="button"
            onClick={() =>
              set((c) => ({
                ...c,
                buttons: c.buttons.length >= LIMITS.maxButtons ? c.buttons : [...c.buttons, { id: newButtonId(), label: l, action: l.includes("WhatsApp") ? "whatsapp" : l.includes("Llamar") ? "call" : l.includes("servicios") ? "section" : "form", url: "", target: "services", style: "solido", shape: "redondeado", color: "button", positions: ["hero"] }],
              }))
            }
            className="min-h-[40px] rounded-full border border-cyan-500/30 bg-cyan-500/[0.06] px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/15"
          >
            + {l}
          </button>
        ))}
      </div>
    </Panel>
  );
}

// ── Imágenes, galería y carrusel ──────────────────────────────────
export function ImagesStep({ cfg, set, store }: StepProps & { store: ImageStore }) {
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErrors([]);
    const { added, errors: errs } = await store.add(Array.from(files));
    if (added.length) {
      set((c) => ({
        ...c,
        images: [...c.images, ...added.map((a) => ({ id: a.id, kind: "upload" as const, name: a.name }))],
        heroImage: c.heroImage ?? added[0].id,
      }));
    }
    setErrors(errs);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  const toggleIn = (list: "gallery" | "carousel", id: string) =>
    set((c) => {
      const ids = c[list].ids.includes(id) ? c[list].ids.filter((x) => x !== id) : [...c[list].ids, id].slice(0, 12);
      return { ...c, [list]: { ...c[list], ids } } as SiteConfig;
    });
  const move = (list: "gallery" | "carousel", id: string, dir: -1 | 1) =>
    set((c) => {
      const ids = c[list].ids.slice();
      const i = ids.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= ids.length) return c;
      [ids[i], ids[j]] = [ids[j], ids[i]];
      return { ...c, [list]: { ...c[list], ids } } as SiteConfig;
    });
  const nameOf = (id: string) => cfg.images.find((i) => i.id === id)?.name ?? id;
  const allImages = [...SAMPLE_IMAGES.map((s) => ({ id: s.id, name: s.name, kind: "sample" as const })), ...cfg.images.filter((i) => i.kind === "upload")];

  const OrderList = ({ list, label }: { list: "gallery" | "carousel"; label: string }) => (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      {cfg[list].ids.length === 0 ? (
        <p className="text-xs text-muted">Aún no hay imágenes. Elígelas en la biblioteca de arriba.</p>
      ) : (
        <ul className="space-y-1.5">
          {cfg[list].ids.map((id, i) => (
            <li key={id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={store.src(id) ?? ""} alt="" className="h-11 w-16 shrink-0 rounded-md object-cover" />
              <span className="min-w-0 flex-1 truncate text-xs">{nameOf(id)}</span>
              <button type="button" aria-label={`Subir ${nameOf(id)}`} disabled={i === 0} onClick={() => move(list, id, -1)} className="flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-white/10 disabled:opacity-30"><ArrowUp size={16} /></button>
              <button type="button" aria-label={`Bajar ${nameOf(id)}`} disabled={i === cfg[list].ids.length - 1} onClick={() => move(list, id, 1)} className="flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-white/10 disabled:opacity-30"><ArrowDown size={16} /></button>
              <button type="button" aria-label={`Quitar ${nameOf(id)}`} onClick={() => toggleIn(list, id)} className="flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-white/10 hover:text-red-300"><X size={16} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Panel title="Imágenes, galería y carrusel" hint="Elige imágenes de ejemplo o sube las tuyas. Las de ejemplo son ilustraciones nuestras para ver cómo quedaría: sin derechos de terceros.">
      <div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" id="upload-input" onChange={(e) => onFiles(e.target.files)} data-testid="upload-input" />
        <label htmlFor="upload-input" className={cn("btn btn-ghost min-h-[48px] w-full cursor-pointer", busy && "pointer-events-none opacity-60")}>
          <ImagePlus size={18} aria-hidden="true" /> {busy ? "Procesando…" : "Subir mis imágenes (JPG, PNG o WebP)"}
        </label>
        <p className="mt-1.5 text-xs text-muted">Hasta {LIMITS.maxUploads} imágenes. Se reducen automáticamente. Las revisaremos antes de publicarlas; sube solo imágenes que tengas derecho a usar.</p>
        {errors.length > 0 && (
          <ul role="alert" className="mt-2 space-y-1 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold">Biblioteca</p>
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {allImages.map((im) => {
            const inGal = cfg.gallery.ids.includes(im.id);
            const inCar = cfg.carousel.ids.includes(im.id);
            const isHero = cfg.heroImage === im.id;
            return (
              <li key={im.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={store.src(im.id) ?? sampleSrc(im.id) ?? ""} alt={im.name} className="aspect-[4/3] w-full object-cover" />
                <div className="space-y-1 p-1.5">
                  {[
                    { on: isHero, label: "Portada", fn: () => set((c) => ({ ...c, heroImage: isHero ? null : im.id })) },
                    { on: inGal, label: "Galería", fn: () => toggleIn("gallery", im.id) },
                    { on: inCar, label: "Carrusel", fn: () => toggleIn("carousel", im.id) },
                  ].map((b) => (
                    <button key={b.label} type="button" aria-pressed={b.on} aria-label={`${b.label}: ${im.name}`} onClick={b.fn} className={cn("min-h-[36px] w-full rounded-lg border px-2 text-xs font-medium", b.on ? "border-cyan-400 bg-cyan-400/15 text-cyan-100" : "border-white/10 text-foreground/80 hover:border-white/25")}>
                      {b.on ? "✓ " : ""}{b.label}
                    </button>
                  ))}
                  {im.kind === "upload" && (
                    <button
                      type="button"
                      onClick={() => {
                        store.remove(im.id);
                        set((c) => ({ ...c, images: c.images.filter((x) => x.id !== im.id), heroImage: c.heroImage === im.id ? null : c.heroImage, logoImage: c.logoImage === im.id ? null : c.logoImage, gallery: { ...c.gallery, ids: c.gallery.ids.filter((x) => x !== im.id) }, carousel: { ...c.carousel, ids: c.carousel.ids.filter((x) => x !== im.id) } }));
                      }}
                      className="min-h-[36px] w-full rounded-lg border border-red-400/30 px-2 text-xs text-red-200"
                    >
                      Quitar mi imagen
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 p-3.5">
        <h3 className="font-display text-base font-bold">Galería</h3>
        <Choice label="Distribución" value={cfg.gallery.layout} onChange={(v) => set((c) => ({ ...c, gallery: { ...c.gallery, layout: v } }))} options={[{ id: "cuadricula", label: "Cuadrícula" }, { id: "mosaico", label: "Mosaico" }, { id: "columnas", label: "Columnas" }]} />
        <OrderList list="gallery" label="Orden de la galería" />
        {!cfg.sections.find((s) => s.id === "gallery")?.enabled && <p className="text-xs text-amber-200">La sección Galería está desactivada: actívala en «Secciones» para que aparezca.</p>}
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 p-3.5">
        <h3 className="font-display text-base font-bold">Carrusel</h3>
        <Toggle label="Mostrar el carrusel en mi web" hint="También puedes colocarlo en el orden que quieras en «Secciones»." checked={!!cfg.sections.find((s) => s.id === "carousel")?.enabled} onChange={() => set((c) => ({ ...c, sections: toggleSection(c.sections, "carousel") }))} />
        <Choice label="Estilo" cols={4} value={cfg.carousel.style} onChange={(v) => set((c) => ({ ...c, carousel: { ...c.carousel, style: v } }))} options={[{ id: "deslizar", label: "Deslizar" }, { id: "fundido", label: "Fundido" }, { id: "tarjetas", label: "Tarjetas" }, { id: "miniaturas", label: "Miniaturas" }]} />
        <Toggle label="Pasar solo cada pocos segundos" checked={cfg.carousel.autoplay} onChange={(v) => set((c) => ({ ...c, carousel: { ...c.carousel, autoplay: v } }))} />
        <OrderList list="carousel" label="Orden del carrusel" />
      </div>
    </Panel>
  );
}
