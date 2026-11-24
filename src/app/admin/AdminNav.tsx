"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Resumen", match: (p: string) => p === "/admin" },
  { href: "/admin/leads", label: "Leads", match: (p: string) => p.startsWith("/admin/leads") },
  { href: "/admin/clientes", label: "Clientes y negocios", match: (p: string) => p.startsWith("/admin/clientes") },
  { href: "/admin/proyectos", label: "Proyectos y webs", match: (p: string) => p.startsWith("/admin/proyectos") },
  { href: "/admin/diseno", label: "Diseños y configurador", match: (p: string) => p.startsWith("/admin/diseno") },
  { href: "/admin/stella", label: "Stella", match: (p: string) => p.startsWith("/admin/stella") },
  { href: "/admin/consumo", label: "Consumo y límites", match: (p: string) => p.startsWith("/admin/consumo") },
  { href: "/admin/entorno", label: "Entorno", match: (p: string) => p.startsWith("/admin/entorno") },
  { href: "/admin/configuracion", label: "Configuración", match: (p: string) => p.startsWith("/admin/configuracion") },
];

// Navegación única del panel: barra lateral en pantallas grandes y pestañas con desplazamiento horizontal en móvil.
export default function AdminNav() {
  const path = usePathname() ?? "";
  return (
    <nav aria-label="Panel interno" className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0F17]/95 backdrop-blur print:hidden lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible lg:py-5">
        <span className="mr-2 shrink-0 font-display text-sm font-bold lg:mb-3 lg:px-3 lg:text-base">
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
        <Link href="/" className="ml-2 inline-flex min-h-[44px] shrink-0 items-center rounded-xl px-3.5 text-sm text-muted hover:text-foreground lg:ml-0 lg:mt-4">
          ← Ver la web pública
        </Link>
      </div>
    </nav>
  );
}
