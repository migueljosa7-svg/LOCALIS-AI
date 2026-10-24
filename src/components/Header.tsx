"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandMark from "@/components/brand/BrandMark";

const NAV_LINKS = [
  { label: "Stella IA", href: "/#stella" },
  { label: "GPS en vivo", href: "/#reparto" },
  { label: "Sectores", href: "/#sectores" },
  { label: "Diseño web", href: "/#web" },
  { label: "Precios", href: "/#precios" },
  { label: "FAQ", href: "/#faq" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Un solo listener pasivo, como mucho 1 setState por frame (y solo si cambia).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const next = window.scrollY > 24;
        setScrolled((prev) => (prev === next ? prev : next));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={cn(
        "no-print sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled || open
          ? "glass-bar border-white/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 lg:h-[76px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" onClick={close} className="flex items-center gap-2.5 rounded-xl" aria-label="LOCALIS AI · inicio">
          <BrandMark size={36} id="hdr" />
          <span className="font-display text-[1.15rem] font-bold tracking-tight">
            LOCALIS <span className="gradient-text">AI</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground hover:bg-white/[0.04]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2.5">
          <a href="/#stella" className="btn btn-ghost min-h-[42px] px-4 text-sm">
            Probar demo
          </a>
          <a href="/#cita" className="btn btn-primary min-h-[42px] px-4 text-sm">
            Auditoría gratis <ArrowRight size={15} aria-hidden="true" />
          </a>
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

      {/* Menú móvil: grid-rows 0fr→1fr anima la altura sin JS ni layout thrash. */}
      <div
        id="mobile-menu"
        className={cn(
          "lg:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <nav aria-label="Móvil" className="px-4 pb-5 pt-1 space-y-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                tabIndex={open ? 0 : -1}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium text-foreground/90 active:bg-white/[0.06]"
              >
                {l.label}
                <ArrowRight size={15} className="text-muted" aria-hidden="true" />
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-3">
              <a href="/#stella" onClick={close} tabIndex={open ? 0 : -1} className="btn btn-ghost text-sm">
                Probar demo
              </a>
              <a href="/#cita" onClick={close} tabIndex={open ? 0 : -1} className="btn btn-primary text-sm">
                Auditoría gratis
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
