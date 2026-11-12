"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Home, Calculator, Bot, MapPin, LayoutGrid, PlayCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandMark from "@/components/brand/BrandMark";

const TABS: { id: string; label: string; short: string; icon: LucideIcon }[] = [
  { id: "inicio", label: "Inicio", short: "Inicio", icon: Home },
  { id: "configurador", label: "Configurador y Ahorro", short: "Configurador", icon: Calculator },
  { id: "stella", label: "IA Stella", short: "IA Stella", icon: Bot },
  { id: "reparto", label: "Mapa GPS", short: "Mapa GPS", icon: MapPin },
  { id: "sectores", label: "Sectores", short: "Sectores", icon: LayoutGrid },
];

// En el cliente usamos useLayoutEffect para medir antes de pintar.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("inicio");
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  // Fondo de cristal + scrollspy en un solo listener pasivo (como mucho 1 cálculo
  // por frame). Las secciones se buscan cada vez porque la hidratación diferida
  // (LazyHydrate) puede sustituir sus nodos. La activa es la que cruza el centro.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const next = window.scrollY > 24;
      setScrolled((prev) => (prev === next ? prev : next));
      const mid = window.innerHeight * 0.5;
      let current = "";
      for (const t of TABS) {
        const el = document.getElementById(t.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          current = t.id;
          break;
        }
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Indicador deslizante bajo la pestaña activa: solo transform (GPU), sin layout.
  useIsoLayoutEffect(() => {
    const nav = navRef.current;
    const bar = barRef.current;
    if (!nav || !bar) return;
    const place = () => {
      const link = active ? nav.querySelector<HTMLElement>(`[data-tab="${active}"]`) : null;
      if (!link) {
        bar.style.opacity = "0";
        return;
      }
      bar.style.transform = `translate3d(${link.offsetLeft}px,0,0) scaleX(${link.offsetWidth / 100})`;
      bar.style.opacity = "1";
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  // Menú móvil: Escape para cerrar y sin scroll de fondo mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
    <header
      className={cn(
        "no-print sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled || open ? "glass-bar border-white/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]" : "bg-transparent border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 lg:h-[76px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" onClick={close} className="flex shrink-0 items-center gap-2.5 rounded-xl" aria-label="LOCALIS AI · inicio">
          <BrandMark size={36} id="hdr" />
          <span className="font-display text-[1.15rem] font-bold tracking-tight">
            LOCALIS <span className="gradient-text">AI</span>
          </span>
        </Link>

        <nav ref={navRef} aria-label="Secciones" className="relative hidden lg:flex items-center gap-0.5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={`/#${t.id}`}
              data-tab={t.id}
              aria-current={active === t.id ? "location" : undefined}
              onClick={() => setActive(t.id)}
              className={cn(
                "relative z-[1] rounded-xl px-3 xl:px-3.5 py-2 text-[13px] xl:text-sm font-medium whitespace-nowrap transition-colors duration-200",
                active === t.id ? "text-foreground" : "text-muted hover:text-foreground"
              )}
            >
              {t.label}
            </Link>
          ))}
          <span
            ref={barRef}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0.5 left-0 h-[3px] w-[100px] origin-left rounded-full opacity-0 transition-[transform,opacity] duration-300 ease-out"
            style={{ background: "linear-gradient(90deg,#00F2FE,#3B82F6)", boxShadow: "0 0 12px rgba(0,242,254,0.7)" }}
          />
        </nav>

        <div className="hidden lg:flex shrink-0 items-center gap-2">
          <Link href="/#stella" className="btn btn-ghost min-h-[42px] px-3.5 text-sm">
            Probar demo
          </Link>
          <Link href="/#configurador" className="btn btn-primary min-h-[42px] px-4 text-sm">
            Calcular ahorro <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-foreground active:scale-95 transition-transform"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>

      {/* ── Menú móvil (fuera del <header>: su backdrop-filter rompería el position:fixed) ── */}
      <div
        className={cn(
          "no-print lg:hidden fixed inset-x-0 top-16 bottom-0 z-[45] transition-[opacity,visibility] duration-300",
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <button type="button" tabIndex={-1} aria-label="Cerrar menú" onClick={close} className="absolute inset-0 bg-[#05080d]/70" />
        <div
          id="mobile-menu"
          className={cn(
            "glass-bar relative border-b border-white/10 px-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-transform duration-300 ease-out",
            open ? "translate-y-0" : "-translate-y-3"
          )}
        >
          <nav aria-label="Secciones (móvil)" className="grid gap-1.5">
            {TABS.map((t) => {
              const isActive = active === t.id;
              return (
                <Link
                  key={t.id}
                  href={`/#${t.id}`}
                  onClick={() => {
                    setActive(t.id);
                    close();
                  }}
                  tabIndex={open ? 0 : -1}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "flex min-h-[56px] items-center gap-3 rounded-2xl px-4 text-[16px] font-semibold border transition-colors active:scale-[0.99]",
                    isActive ? "bg-cyan-500/10 border-cyan-500/35 text-foreground" : "border-white/[0.06] bg-white/[0.02] text-foreground/90"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl border",
                      isActive ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300" : "bg-white/[0.04] border-white/10 text-muted"
                    )}
                  >
                    <t.icon size={18} aria-hidden="true" />
                  </span>
                  {t.label}
                  <ArrowRight size={16} className="ml-auto text-muted" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
          <div className="grid grid-cols-2 gap-2 pt-4">
            <Link href="/#stella" onClick={close} tabIndex={open ? 0 : -1} className="btn btn-ghost min-h-[54px] text-[15px]">
              <PlayCircle size={18} aria-hidden="true" /> Probar demo
            </Link>
            <Link href="/#configurador" onClick={close} tabIndex={open ? 0 : -1} className="btn btn-primary min-h-[54px] text-[15px]">
              Calcular ahorro
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
