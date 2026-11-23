import { Bot, MapPin, LayoutGrid, LayoutDashboard, Layers, type LucideIcon } from "lucide-react";

// ════════════════════════════════════════════════════════════════
//  Mapa de navegación de la web (una sola fuente para cabecera, pie,
//  navegación secundaria de Plataforma, sitemap y redirecciones).
// ════════════════════════════════════════════════════════════════

export const ROUTES = {
  inicio: "/",
  plataforma: "/plataforma",
  stella: "/plataforma/stella",
  reparto: "/plataforma/reparto",
  sectores: "/plataforma/sectores",
  panel: "/plataforma/panel",
  disena: "/disena-tu-web",
  cita: "/disena-tu-web#cita",
  tarifas: "/tarifas",
  faq: "/tarifas#faq",
} as const;

export interface PlatformItem {
  href: string;
  title: string;
  short: string; // etiqueta corta para la navegación secundaria
  detail: string;
  icon: LucideIcon;
  status: "info" | "demo";
}

export const PLATFORM: PlatformItem[] = [
  { href: ROUTES.plataforma, title: "Resumen de la plataforma", short: "Resumen", detail: "Qué funciona hoy y qué está en desarrollo", icon: Layers, status: "info" },
  { href: ROUTES.stella, title: "IA Stella (demo)", short: "Stella IA", detail: "En desarrollo · citas, WhatsApp y facturas", icon: Bot, status: "demo" },
  { href: ROUTES.reparto, title: "Mapa GPS (demo)", short: "Reparto GPS", detail: "En desarrollo · repartos propios, sin comisiones", icon: MapPin, status: "demo" },
  { href: ROUTES.sectores, title: "Soluciones por sector", short: "Sectores", detail: "Restaurantes, clínicas, talleres y comercios", icon: LayoutGrid, status: "info" },
  { href: ROUTES.panel, title: "Panel de control (demo)", short: "Panel", detail: "Vista previa con datos de ejemplo", icon: LayoutDashboard, status: "demo" },
];

/**
 * Enlaces antiguos de la web de una sola página (/#cita, /#precios…). El navegador no
 * envía el "#" al servidor, así que se redirigen en el cliente desde la portada.
 * Mantiene vivos los enlaces ya compartidos (Google Business, anuncios, WhatsApp).
 */
export const LEGACY_HASHES: Record<string, string> = {
  "#configurador": ROUTES.disena,
  "#cita": ROUTES.cita,
  "#stella": ROUTES.stella,
  "#reparto": ROUTES.reparto,
  "#sectores": ROUTES.sectores,
  "#demo": ROUTES.panel,
  "#precios": ROUTES.tarifas,
  "#faq": ROUTES.faq,
  "#web": "/tarifas#web",
};
