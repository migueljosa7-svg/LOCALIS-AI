"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORM } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// Navegación secundaria de Plataforma: fija bajo la cabecera y desplazable en móvil.
export default function PlatformSubnav() {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);

  // En móvil, deja visible la pestaña activa aunque esté al final de la lista.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    el?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav aria-label="Apartados de la plataforma" className="no-print sticky top-16 z-40 glass-bar border-b border-white/10">
      <ul ref={listRef} className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PLATFORM.map((p) => {
          const active = pathname === p.href;
          return (
            <li key={p.href} className="shrink-0">
              <Link
                href={p.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "bg-cyan-500/[0.12] text-foreground border border-cyan-500/35" : "text-muted hover:text-foreground hover:bg-white/[0.04] border border-transparent"
                )}
              >
                <p.icon size={16} aria-hidden="true" className={active ? "text-cyan-300" : ""} />
                {p.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
