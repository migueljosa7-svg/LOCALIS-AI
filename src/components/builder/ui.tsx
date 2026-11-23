"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { readableOn } from "@/components/configurator/studioModel";

export const inputCls =
  "min-h-[44px] w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-base outline-none placeholder:text-muted focus:border-cyan-500/60 focus-visible:ring-2 focus-visible:ring-cyan-400/40";

export function Panel({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold leading-tight">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, hint, optional, children }: { label: string; hint?: string; optional?: boolean; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {optional && <span className="ml-1.5 text-xs font-normal text-muted">(opcional)</span>}
      </label>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      <div className="mt-1.5">{children(id)}</div>
    </div>
  );
}

/** Selector de una opción (botones grandes y accesibles). */
export function Choice<T extends string>({ label, value, options, onChange, cols = 3 }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; cols?: 2 | 3 | 4 }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
      <div className={cn("grid gap-2", cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3")}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "min-h-[44px] rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
              value === o.id ? "border-cyan-400 bg-cyan-400/15 text-cyan-100" : "border-white/10 bg-white/[0.03] text-foreground/85 hover:border-white/25"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-400" />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Selector de color: muestra el color, permite elegirlo con el selector del navegador o escribir el código. */
export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const id = useId();
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
      <label htmlFor={id} className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/20" style={{ background: value }}>
        <span className="sr-only">Elegir {label}</span>
        <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value.toLowerCase())} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: readableOn(value) }} aria-hidden="true">
          ✎
        </span>
      </label>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <input
          aria-label={`Código de color de ${label}`}
          value={text}
          maxLength={7}
          spellCheck={false}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setText(v);
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v.toLowerCase());
          }}
          onBlur={() => setText(value)}
          className="w-full rounded-md bg-transparent font-mono text-xs text-muted outline-none focus:text-foreground focus-visible:ring-1 focus-visible:ring-cyan-400"
        />
      </div>
    </div>
  );
}
