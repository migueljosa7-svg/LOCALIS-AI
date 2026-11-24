// Mapa de navegación de la web pública: UNA sola fuente para la cabecera, el pie, el sitemap y las comprobaciones.

export const ROUTES = {
  inicio: "/",
  plataforma: "/plataforma",
  disena: "/disena-tu-web",
  tarifas: "/tarifas",
  faq: "/preguntas-frecuentes",
  contacto: "/contacto",
  local: "/diseno-web-zaragoza",
} as const;

export interface NavItem {
  href: string;
  label: string;
  /** rutas que también iluminan esta pestaña */
  also?: string[];
}

export const NAV: NavItem[] = [
  { href: ROUTES.inicio, label: "Inicio" },
  { href: ROUTES.plataforma, label: "Plataforma" },
  { href: ROUTES.disena, label: "Diseña tu web" },
  { href: ROUTES.tarifas, label: "Tarifas" },
  { href: ROUTES.faq, label: "Preguntas frecuentes" },
  { href: ROUTES.contacto, label: "Contacto" },
];

/** Los tres apartados de /plataforma (pestañas; la dirección #stella, #gps o #panel abre cada uno). */
export const PLATFORM_SECTIONS = [
  { id: "stella", label: "Stella", short: "Asistente con IA para tu web" },
  { id: "gps", label: "GPS y reparto", short: "Repartos propios con seguimiento" },
  { id: "panel", label: "Panel de control", short: "Tu actividad en una pantalla" },
] as const;
export type PlatformSectionId = (typeof PLATFORM_SECTIONS)[number]["id"];

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(item.href + "/") || (item.also ?? []).some((p) => pathname.startsWith(p));
}

/** Páginas que deben aparecer en el sitemap (todo lo indexable, y nada más). */
export const INDEXABLE: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: ROUTES.local, priority: 0.9, changeFrequency: "monthly" },
  { path: ROUTES.disena, priority: 0.9, changeFrequency: "monthly" },
  { path: ROUTES.plataforma, priority: 0.8, changeFrequency: "monthly" },
  { path: ROUTES.tarifas, priority: 0.8, changeFrequency: "monthly" },
  { path: ROUTES.faq, priority: 0.7, changeFrequency: "monthly" },
  { path: ROUTES.contacto, priority: 0.7, changeFrequency: "monthly" },
];

/** Enlaces antiguos de la web de una sola página (p. ej. «/#cita» en Google Business o anuncios). El «#» no llega al servidor: se redirige en el navegador. */
export const LEGACY_HASHES: Record<string, string> = {
  "#configurador": ROUTES.disena,
  "#cita": ROUTES.contacto,
  "#contacto": ROUTES.contacto,
  "#stella": `${ROUTES.plataforma}#stella`,
  "#reparto": `${ROUTES.plataforma}#gps`,
  "#sectores": ROUTES.plataforma,
  "#demo": `${ROUTES.plataforma}#panel`,
  "#precios": ROUTES.tarifas,
  "#web": ROUTES.tarifas,
  "#faq": ROUTES.faq,
};
