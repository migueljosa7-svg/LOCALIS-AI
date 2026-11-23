"use client";

import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Choice, ColorField, Panel } from "./ui";
import { contrastRatio } from "@/lib/builder/contrast";
import {
  FONTS, HEADERS, HEROES, PALETTES, TEMPLATES, applyTemplate, fontCss, paletteById,
  type Colors, type FontId, type PaletteId, type SiteConfig, type TemplateId,
} from "@/lib/builder/model";

export interface StepProps {
  cfg: SiteConfig;
  set: (fn: (c: SiteConfig) => SiteConfig) => void;
}

export function TemplateStep({ cfg, set }: StepProps) {
  return (
    <Panel title="Elige una plantilla de partida" hint="Es solo el punto de partida: después puedes cambiar colores, textos, secciones y botones.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {TEMPLATES.map((t) => {
          const p = paletteById(t.palette).colors;
          const on = cfg.template === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => set((c) => applyTemplate(c, t.id as TemplateId))}
              className={cn("rounded-2xl border p-3 text-left transition-colors", on ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 bg-white/[0.03] hover:border-white/25")}
            >
              <div className="flex h-16 overflow-hidden rounded-lg border border-white/10" style={{ background: p.background }} aria-hidden="true">
                <div className="flex w-1/2 flex-col justify-center gap-1.5 p-2">
                  <span className="h-2 w-3/4 rounded" style={{ background: p.text, opacity: 0.85 }} />
                  <span className="h-1.5 w-1/2 rounded" style={{ background: p.text, opacity: 0.35 }} />
                  <span className="mt-1 h-3 w-10 rounded-full" style={{ background: p.button }} />
                </div>
                <div className="flex-1" style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }} />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
                {on && <Check size={14} className="text-cyan-300" aria-hidden="true" />} {t.label}
              </p>
              <p className="text-xs text-muted">{t.hint}</p>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

const COLOR_FIELDS: { key: keyof Colors; label: string }[] = [
  { key: "primary", label: "Color principal" },
  { key: "secondary", label: "Color secundario" },
  { key: "background", label: "Fondo" },
  { key: "text", label: "Textos" },
  { key: "card", label: "Tarjetas y secciones" },
  { key: "button", label: "Botones" },
];

export function ColorsStep({ cfg, set }: StepProps) {
  const c = cfg.theme.colors;
  const low = contrastRatio(c.text, c.background) < 4.5;
  const lowCard = contrastRatio(c.text, c.card) < 4.5;
  return (
    <Panel title="Colores" hint="Elige una paleta o ajusta cada color. Verás el resultado al instante en la vista previa.">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PALETTES.map((p) => {
          const on = cfg.theme.palette === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              onClick={() => set((s) => ({ ...s, theme: { ...s.theme, palette: p.id as PaletteId, colors: { ...p.colors } } }))}
              className={cn("min-h-[44px] rounded-xl border p-2 text-left transition-colors", on ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 bg-white/[0.03] hover:border-white/25")}
            >
              <span className="flex h-6 overflow-hidden rounded-md border border-white/10" aria-hidden="true">
                {[p.colors.primary, p.colors.secondary, p.colors.background, p.colors.card].map((h, i) => (
                  <span key={i} className="flex-1" style={{ background: h }} />
                ))}
              </span>
              <span className="mt-1 block text-xs font-semibold">{p.label}</span>
            </button>
          );
        })}
      </div>
      {cfg.theme.palette === "custom" && <p className="text-xs text-cyan-200">Estás usando colores personalizados.</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {COLOR_FIELDS.map((f) => (
          <ColorField key={f.key} label={f.label} value={c[f.key]} onChange={(hex) => set((s) => ({ ...s, theme: { ...s.theme, palette: "custom", colors: { ...s.theme.colors, [f.key]: hex } } }))} />
        ))}
      </div>
      {(low || lowCard) && (
        <p role="status" className="flex gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          El texto se leerá con dificultad sobre {low ? "el fondo" : "las tarjetas"}. Prueba un texto más oscuro sobre fondo claro (o al revés).
        </p>
      )}
    </Panel>
  );
}

export function TypeStep({ cfg, set }: StepProps) {
  const t = cfg.theme;
  const setTheme = (patch: Partial<SiteConfig["theme"]>) => set((s) => ({ ...s, theme: { ...s.theme, ...patch } }));
  const FontPick = ({ label, value, onPick }: { label: string; value: FontId; onPick: (f: FontId) => void }) => (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {FONTS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={value === f.id}
            onClick={() => onPick(f.id)}
            className={cn("min-h-[56px] rounded-xl border px-3 py-2 text-left transition-colors", value === f.id ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 bg-white/[0.03] hover:border-white/25")}
          >
            <span className="block text-lg leading-tight" style={{ fontFamily: fontCss(f.id) }}>
              {f.label}
            </span>
            <span className="block text-xs text-muted">{f.sample}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
  return (
    <Panel title="Tipografía y estilo" hint="Cómo se escriben los títulos y los textos, y cómo es la cabecera y la portada.">
      <FontPick label="Tipografía de los títulos" value={t.fontHeading} onPick={(f) => setTheme({ fontHeading: f })} />
      <FontPick label="Tipografía de los textos" value={t.fontBody} onPick={(f) => setTheme({ fontBody: f })} />
      <Choice label="Tamaño de los títulos" value={t.headingScale} onChange={(v) => setTheme({ headingScale: v })} options={[{ id: "sm", label: "Discreto" }, { id: "md", label: "Normal" }, { id: "lg", label: "Grande" }]} />
      <Choice label="Grosor de los títulos" value={t.headingWeight} onChange={(v) => setTheme({ headingWeight: v })} options={[{ id: "normal", label: "Fino" }, { id: "bold", label: "Negrita" }, { id: "black", label: "Muy grueso" }]} />
      <Choice label="Tamaño del texto" value={t.textSize} onChange={(v) => setTheme({ textSize: v })} options={[{ id: "sm", label: "Pequeño" }, { id: "md", label: "Normal" }, { id: "lg", label: "Grande" }]} />
      <Choice label="Esquinas" value={t.radius} onChange={(v) => setTheme({ radius: v })} options={[{ id: "recto", label: "Rectas" }, { id: "suave", label: "Suaves" }, { id: "redondo", label: "Redondas" }]} />
      <Choice label="Diseño de la cabecera" cols={4} value={t.header} onChange={(v) => setTheme({ header: v })} options={HEADERS} />
      <Choice label="Diseño de la portada" value={t.hero} onChange={(v) => setTheme({ hero: v })} options={HEROES} />
    </Panel>
  );
}
