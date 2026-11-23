"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, ChevronDown, Sparkles, PlayCircle } from "lucide-react";
import { PLATFORM } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import BrandMark from "@/components/brand/BrandMark";

type TabId = "inicio" | "plataforma" | "disena" | "tarifas";

// Pestaña activa según la ruta actual.
function tabFor(path: string): TabId | "" {
  if (path === "/") return "inicio";
  if (path.startsWith("/plataforma")) return "plataforma";
  if (path.startsWith("/disena-tu-web")) return "disena";
  if (path.startsWith("/tarifas")) return "tarifas";
  return "";
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function Header() {
  const [open, setOpen] = useState(false); // menú móvil
  const [platformOpen, setPlatformOpen] = useState(false); // submenú escritorio
  const [mobilePlatform, setMobilePlatform] = useState(false); // acordeón móvil
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || "/";
  const active = tabFor(pathname);
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const ddRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const menuId = useId();

  // Fondo de cristal al hacer scroll (listener pasivo, máx. 1 cálculo por frame).
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const next = window.scrollY > 24;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Al cambiar de página se cierran los menús.
  useEffect(() => {
    setOpen(false);
    setPlatformOpen(false);
  }, [pathname]);

  // Indicador deslizante bajo la pestaña activa (solo transform → GPU).
  useIsoLayoutEffect(() => {
    const nav = navRef.current;
    const bar = barRef.current;
    if (!nav || !bar) return;
    const place = () => {
      const el = active ? nav.querySelector<HTMLElement>(`[data-tab="${active}"]`) : null;
      if (!el) {
        bar.style.opacity = "0";
        return;
      }
      bar.style.transform = `translate3d(${el.offsetLeft}px,0,0) scaleX(${el.offsetWidth / 100})`;
      bar.style.opacity = "1";
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  // Submenú: cerrar con Escape o al hacer clic fuera.
  useEffect(() => {
    if (!platformOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPlatformOpen(false);
        ddRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!ddRef.current?.contains(e.target as Node)) setPlatformOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [platformOpen]);

  // Menú móvil: Escape y sin scroll de fondo mientras está abierto.
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

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  // Hover con pequeño retardo de cierre para que el submenú no "parpadee".
  const openedByHover = useRef(false);
  const hoverOpen = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (!platformOpen) openedByHover.current = true;
    setPlatformOpen(true);
  };
  // Si el ratón ya lo abrió al pasar por encima, el clic lo deja abierto (antes lo
  // cerraba). Con teclado (detail === 0) el botón sigue funcionando como interruptor.
  const togglePlatform = (e: React.MouseEvent) => {
    if (e.detail > 0 && openedByHover.current) {
      openedByHover.current = false;
      setPlatformOpen(true);
      return;
    }
    openedByHover.current = false;
    setPlatformOpen((v) => !v);
  };
  const hoverClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      openedByHover.current = false;
      setPlatformOpen(false);
    }, 140);
  };

  const close = () => {
    setOpen(false);
    setPlatformOpen(false);
  };

  const tabCls = (tab: TabId) =>
    cn(
      "relative z-[1] inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200",
      active === tab ? "text-foreground" : "text-muted hover:text-foreground"
    );

  return (
    <>
      <header
        className={cn(
          "no-print sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300",
          scrolled || open ? "glass-bar border-white/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]" : "bg-transparent border-transparent"
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" onClick={close} className="flex shrink-0 items-center gap-2.5 rounded-xl" aria-label="LOCALIS AI · inicio">
            <BrandMark size={34} id="hdr" />
            <span className="font-display text-[1.1rem] font-bold tracking-tight">
              LOCALIS <span className="gradient-text">AI</span>
            </span>
          </Link>

          <nav ref={navRef} aria-label="Principal" className="relative hidden lg:flex items-center gap-0.5">
            <Link href="/" data-tab="inicio" onClick={close} className={tabCls("inicio")} aria-current={active === "inicio" ? "page" : undefined}>
              Inicio
            </Link>

            <div ref={ddRef} className="relative" data-tab="plataforma" onMouseEnter={hoverOpen} onMouseLeave={hoverClose}>
              <button
                type="button"
                className={tabCls("plataforma")}
                aria-expanded={platformOpen}
                aria-controls={menuId}
                aria-haspopup="true"
                aria-current={active === "plataforma" ? "page" : undefined}
                onClick={togglePlatform}
              >
                Plataforma
                <ChevronDown size={15} aria-hidden="true" className={cn("transition-transform duration-200", platformOpen && "rotate-180")} />
              </button>
              <div
                id={menuId}
                className={cn(
                  "absolute left-1/2 top-full w-[340px] -translate-x-1/2 pt-3 transition-[opacity,transform,visibility] duration-200 ease-out",
                  platformOpen ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-1 pointer-events-none"
                )}
              >
                <ul className="glass-bar rounded-2xl border border-white/10 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]">
                  {PLATFORM.map((p) => (
                    <li key={p.href}>
                      <Link
                        href={p.href}
                        onClick={close}
                        tabIndex={platformOpen ? 0 : -1}
                        aria-current={pathname === p.href ? "page" : undefined}
                        className={cn(
                          "group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.05]",
                          pathname === p.href && "bg-white/[0.05]"
                        )}
                      >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300 transition-transform duration-200 group-hover:scale-105">
                          <p.icon size={17} aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-foreground">{p.title}</span>
                          <span className="block text-xs text-muted">{p.detail}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link
              href="/disena-tu-web"
              data-tab="disena"
              onClick={close}
              className={cn(tabCls("disena"), "text-cyan-300 hover:text-cyan-200")}
              aria-current={active === "disena" ? "page" : undefined}
            >
              <Sparkles size={14} aria-hidden="true" />
              Diseña tu Web
            </Link>
            <Link href="/tarifas" data-tab="tarifas" onClick={close} className={tabCls("tarifas")} aria-current={active === "tarifas" ? "page" : undefined}>
              Tarifas y FAQ
            </Link>

            <span
              ref={barRef}
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-0.5 left-0 h-[2px] w-[100px] origin-left rounded-full opacity-0 transition-[transform,opacity] duration-300 ease-out"
              style={{ background: "linear-gradient(90deg,#00F2FE,#3B82F6)", boxShadow: "0 0 10px rgba(0,242,254,0.7)" }}
            />
          </nav>

          <Link href="/disena-tu-web" onClick={close} className="btn btn-primary hidden lg:inline-flex min-h-[40px] px-4 text-sm shrink-0">
            Pedir presupuesto <ArrowRight size={15} aria-hidden="true" />
          </Link>

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
            "glass-bar relative max-h-full overflow-y-auto overscroll-contain border-b border-white/10 px-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-transform duration-300 ease-out",
            open ? "translate-y-0" : "-translate-y-3"
          )}
        >
          <nav aria-label="Principal (móvil)" className="grid gap-1.5">
            <MobileLink href="/" active={active === "inicio"} onClick={close} tabbable={open}>
              Inicio
            </MobileLink>

            <div className={cn("rounded-2xl border transition-colors", active === "plataforma" ? "border-cyan-500/35 bg-cyan-500/[0.06]" : "border-white/[0.06] bg-white/[0.02]")}>
              <button
                type="button"
                onClick={() => setMobilePlatform((v) => !v)}
                aria-expanded={mobilePlatform}
                aria-controls="mobile-platform"
                tabIndex={open ? 0 : -1}
                className="flex w-full min-h-[56px] items-center gap-3 px-4 text-[16px] font-semibold text-foreground"
              >
                Plataforma
                <ChevronDown size={18} aria-hidden="true" className={cn("ml-auto text-muted transition-transform duration-300", mobilePlatform && "rotate-180")} />
              </button>
              {/* Acordeón: grid-rows 0fr→1fr anima la altura sin JS */}
              <div id="mobile-platform" className={cn("grid transition-[grid-template-rows] duration-300 ease-out", mobilePlatform ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <ul className="overflow-hidden">
                  {PLATFORM.map((p) => (
                    <li key={p.href} className="px-2 pb-2">
                      <Link
                        href={p.href}
                        onClick={close}
                        tabIndex={open && mobilePlatform ? 0 : -1}
                        aria-current={pathname === p.href ? "page" : undefined}
                        className={cn("flex min-h-[56px] items-center gap-3 rounded-xl px-3 active:bg-white/[0.06]", pathname === p.href && "bg-white/[0.06]")}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                          <p.icon size={17} aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-[15px] font-semibold">{p.title}</span>
                          <span className="block text-xs text-muted">{p.detail}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <MobileLink href="/disena-tu-web" active={active === "disena"} onClick={close} tabbable={open} highlight>
              <Sparkles size={17} aria-hidden="true" className="text-cyan-300" /> Diseña tu Web
            </MobileLink>
            <MobileLink href="/tarifas" active={active === "tarifas"} onClick={close} tabbable={open}>
              Tarifas y FAQ
            </MobileLink>
          </nav>
          <div className="grid grid-cols-2 gap-2 pt-4">
            <Link href="/plataforma/stella" onClick={close} tabIndex={open ? 0 : -1} className="btn btn-ghost min-h-[54px] text-[15px]">
              <PlayCircle size={18} aria-hidden="true" /> Conocer a Stella
            </Link>
            <Link href="/disena-tu-web" onClick={close} tabIndex={open ? 0 : -1} className="btn btn-primary min-h-[54px] text-[15px]">
              Pedir presupuesto
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileLink({
  href,
  active,
  onClick,
  tabbable,
  highlight,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  tabbable: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      tabIndex={tabbable ? 0 : -1}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-[56px] items-center gap-2.5 rounded-2xl border px-4 text-[16px] font-semibold transition-colors active:scale-[0.99]",
        active ? "border-cyan-500/35 bg-cyan-500/10" : highlight ? "border-cyan-500/20 bg-cyan-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]"
      )}
    >
      {children}
      <ArrowRight size={16} className="ml-auto text-muted" aria-hidden="true" />
    </Link>
  );
}
