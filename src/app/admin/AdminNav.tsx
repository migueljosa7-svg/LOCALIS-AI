"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Resumen y leads", match: (p: string) => p === "/admin" },
  { href: "/admin/stella", label: "Stella", match: (p: string) => p.startsWith("/admin/stella") },
  { href: "/admin/diseno", label: "Diseños web", match: (p: string) => p.startsWith("/admin/diseno") },
  { href: "/admin/entorno", label: "Configuración", match: (p: string) => p.startsWith("/admin/entorno") },
];

// Navegación única del panel (la misma en todas las pantallas; en móvil se desplaza en horizontal sin romper la página).
export default function AdminNav() {
  const path = usePathname() ?? "";
  return (
    <nav aria-label="Panel interno" className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0F17]/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 py-2">
        <span className="mr-2 shrink-0 font-display text-sm font-bold">
          LOCALIS<span className="text-cyan-300"> AI</span> · panel
        </span>
        {ITEMS.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            aria-current={i.match(path) ? "page" : undefined}
            className={cn("inline-flex min-h-[44px] shrink-0 items-center rounded-xl px-3.5 text-sm font-semibold transition-colors", i.match(path) ? "bg-cyan-400/15 text-cyan-100" : "text-muted hover:bg-white/5 hover:text-foreground")}
          >
            {i.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
