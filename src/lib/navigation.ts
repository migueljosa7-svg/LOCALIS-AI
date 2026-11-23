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
  /** "proximamente": aún no se vende; la página lo explica. Stella depende de stellaEnabled(). */
  status: "info" | "stella" | "proximamente";
}

export const PLATFORM: PlatformItem[] = [
  { href: ROUTES.plataforma, title: "Resumen de la plataforma", short: "Resumen", detail: "Todo lo que hacemos por tu negocio", icon: Layers, status: "info" },
  { href: ROUTES.stella, title: "Stella IA", short: "Stella IA", detail: "Asistente virtual con IA para tu web", icon: Bot, status: "stella" },
  { href: ROUTES.reparto, title: "Reparto GPS", short: "Reparto GPS", detail: "Repartos propios, sin comisiones", icon: MapPin, status: "proximamente" },
  { href: ROUTES.sectores, title: "Soluciones por sector", short: "Sectores", detail: "Restaurantes, clínicas, talleres y comercios", icon: LayoutGrid, status: "info" },
  { href: ROUTES.panel, title: "Panel de control", short: "Panel", detail: "Citas, contactos y repartos en una pantalla", icon: LayoutDashboard, status: "proximamente" },
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
