// Estimación orientativa. Usa SOLO las tarifas de referencia de src/lib/pricing.ts y distingue
// qué está definido, qué es opcional, qué hay que valorar y qué no existe todavía. Nunca cobra ni promete.
import { TARIFAS, maintenanceFor, packageForPages } from "@/lib/pricing";
import { INTERESTS, enabledSections, type SiteConfig } from "./model";

export type LineKind = "definido" | "opcional" | "valorar" | "no-disponible";

export interface EstimateLine {
  kind: LineKind;
  label: string;
  detail?: string;
  /** euros; solo en líneas «definido» */
  amount?: number;
}

export interface Estimate {
  lines: EstimateLine[];
  /** precio de referencia del paquete (sin IVA y sin extras por valorar) */
  definedTotal: number;
  pages: number;
}

export const KIND_LABEL: Record<LineKind, string> = {
  definido: "Precio definido",
  opcional: "Extra opcional",
  valorar: "Pendiente de valoración",
  "no-disponible": "Aún no disponible",
};

const MIN_PAGES = 4;
export const clampPages = (n: number): number => Math.min(TARIFAS.pro.pages, Math.max(MIN_PAGES, Math.round(Number.isFinite(n) ? n : MIN_PAGES)));

export function estimate(cfg: SiteConfig): Estimate {
  const pages = clampPages(cfg.pages);
  const pack = packageForPages(pages);
  const definedTotal = pack.price;
  const lines: EstimateLine[] = [
    { kind: "definido", label: `${pack.name} (precio de referencia + IVA)`, detail: `Hasta ${pack.pages} páginas, con tus colores, secciones y botones`, amount: pack.price },
    { kind: "opcional", label: "Mantenimiento mensual (opcional)", detail: `Referencia: ${TARIFAS.mantenimientoPorPagina} € por página al mes + IVA (${pages} páginas ≈ ${maintenanceFor(pages)} € al mes). Se presupuesta según tu caso` },
  ];

  const on = enabledSections(cfg);
  if (on.includes("gallery") || on.includes("carousel")) lines.push({ kind: "valorar", label: "Galería y carrusel", detail: "Se confirma al revisar el diseño y las imágenes que aportes" });
  if (cfg.images.some((i) => i.kind === "upload") || cfg.business.hasLogo) lines.push({ kind: "valorar", label: "Tus imágenes y logotipo", detail: "Se revisan antes de publicarlas (calidad y derechos de uso)" });
  if (cfg.wants.stella) lines.push({ kind: "opcional", label: "Stella, asistente con IA en tu web", detail: "Responde dudas con la información de tu negocio y recoge contactos. Se presupuesta aparte" });
  if (cfg.business.domain.trim() === "") lines.push({ kind: "valorar", label: "Dominio y alojamiento", detail: "Si aún no tienes dominio, lo vemos contigo" });
  for (const id of cfg.wants.interests) {
    const it = INTERESTS.find((i) => i.id === id);
    if (it) lines.push({ kind: "no-disponible", label: it.label, detail: "Todavía no existe: queda anotado como interés, no se presupuesta ni se cobra" });
  }
  return { lines, definedTotal, pages };
}

export const euro = (n: number): string => `${n.toLocaleString("es-ES")} €`;
