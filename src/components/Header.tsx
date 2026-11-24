"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandMark from "@/components/brand/BrandMark";
import { NAV, ROUTES, isActive } from "@/lib/navigation";
import { waLink } from "@/lib/site";

// Cabecera común de la web pública: una pestaña por apartado, la actual siempre marcada, y menú móvil accesible.
export default function Header() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
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

  return (
    <header className={cn("sticky top-0 z-50 w-full transition-colors", scrolled || open ? "glass-bar border-b border-white/[0.07]" : "bg-transparent")}>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.inicio} className="flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-xl" aria-label="LOCALIS AI · inicio">
          <BrandMark size={34} id="hdr" />
          <span className="font-display text-lg font-bold">
            LOCALIS <span className="gradient-text">AI</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const on = isActive(pathname, n);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={cn("relative inline-flex min-h-[44px] items-center rounded-xl px-3.5 text-[15px] font-medium transition-colors", on ? "text-foreground" : "text-muted hover:text-foreground")}
              >
                {n.label}
                {on && <span className="absolute inset-x-3.5 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-cobalt-500" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-[44px] px-4 text-sm">
            <MessageCircle size={16} aria-hidden="true" /> WhatsApp
          </a>
          <Link href={ROUTES.disena} className="btn btn-primary min-h-[44px] px-5 text-sm">
            Diseña tu web
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Cerrar el menú" : "Abrir el menú"}
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div id={menuId} hidden={!open} className="glass-bar max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.07] px-4 pb-6 pt-3 lg:hidden">
        <nav aria-label="Menú móvil" className="mx-auto flex max-w-md flex-col gap-1">
          {NAV.map((n) => {
            const on = isActive(pathname, n);
            return (
              <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined} className={cn("flex min-h-[52px] items-center rounded-xl px-4 text-base font-medium", on ? "bg-cyan-400/10 text-cyan-100" : "text-foreground/90 active:bg-white/[0.06]")}>
                {n.label}
              </Link>
            );
          })}
          <Link href={ROUTES.disena} className="btn btn-primary mt-3 min-h-[54px] text-base">
            Diseña tu web
          </Link>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-[54px] text-base">
            <MessageCircle size={18} aria-hidden="true" /> Escríbenos por WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
