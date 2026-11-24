"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, LayoutDashboard, MapPin, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORM_SECTIONS, type PlatformSectionId } from "@/lib/navigation";

const ICONS: Record<PlatformSectionId, LucideIcon> = { stella: Bot, gps: MapPin, panel: LayoutDashboard };
// Anclas antiguas que siguen funcionando.
const ALIAS: Record<string, PlatformSectionId> = { reparto: "gps", sectores: "stella", demo: "panel" };

function fromHash(): PlatformSectionId | null {
  const h = window.location.hash.replace("#", "");
  if (PLATFORM_SECTIONS.some((s) => s.id === h)) return h as PlatformSectionId;
  return ALIAS[h] ?? null;
}

/**
 * Pestañas de la plataforma: se ve un solo apartado a la vez y la dirección (#stella, #gps, #panel) lleva directo a él.
 * El texto de los tres apartados está siempre en el HTML (lo lee Google y funciona sin JavaScript);
 * las demostraciones pesadas (`demos`) solo se montan cuando se abre su pestaña.
 */
export default function PlatformTabs({ intros, demos }: { intros: Record<PlatformSectionId, React.ReactNode>; demos: Record<PlatformSectionId, React.ReactNode> }) {
  const [active, setActive] = useState<PlatformSectionId>("stella");
  const [visited, setVisited] = useState<Set<PlatformSectionId>>(new Set(["stella"]));
  const barRef = useRef<HTMLDivElement>(null);

  const select = useCallback((id: PlatformSectionId, opts: { scroll?: boolean; push?: boolean } = {}) => {
    setActive(id);
    setVisited((v) => (v.has(id) ? v : new Set(v).add(id)));
    if (opts.push) window.history.replaceState(null, "", `#${id}`);
    if (opts.scroll) {
      const top = barRef.current?.getBoundingClientRect().top ?? 0;
      // Si la barra de pestañas ya está pegada arriba (se ha bajado), se vuelve a ella; así no hay que recorrer el apartado anterior.
      if (top <= 72) barRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const apply = () => {
      const id = fromHash();
      if (id) select(id);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [select]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = PLATFORM_SECTIONS.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    const id = PLATFORM_SECTIONS[next].id;
    select(id, { push: true });
    document.getElementById(`tab-${id}`)?.focus();
  };

  return (
    <div>
      <div ref={barRef} className="sticky top-16 z-40 border-y border-white/[0.07] bg-background/85 backdrop-blur-md">
        <div role="tablist" aria-label="Apartados de la plataforma" className="mx-auto grid w-full max-w-7xl grid-cols-3 gap-1.5 px-4 py-2.5 sm:px-6 lg:px-8">
          {PLATFORM_SECTIONS.map((s, i) => {
            const Icon = ICONS[s.id];
            const on = active === s.id;
            return (
              <button
                key={s.id}
                id={`tab-${s.id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`panel-${s.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => select(s.id, { push: true, scroll: true })}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  "flex min-h-[52px] items-center justify-center gap-2 rounded-xl border px-2 py-2 text-sm font-semibold transition-colors sm:justify-start sm:px-4",
                  on ? "border-cyan-400/50 bg-cyan-400/12 text-cyan-100" : "border-white/10 text-muted hover:border-white/25 hover:text-foreground",
                )}
              >
                <Icon size={18} aria-hidden="true" className="shrink-0" />
                <span className="flex flex-col text-left leading-tight">
                  <span>{s.label}</span>
                  <span className="hidden text-[11px] font-normal opacity-75 lg:block">{s.short}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {PLATFORM_SECTIONS.map((s) => (
        <section key={s.id} id={`panel-${s.id}`} role="tabpanel" aria-labelledby={`tab-${s.id}`} hidden={active !== s.id} className="scroll-mt-32">
          {intros[s.id]}
          {visited.has(s.id) && demos[s.id]}
        </section>
      ))}
    </div>
  );
}
