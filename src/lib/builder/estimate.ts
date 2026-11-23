// Estimación orientativa. Usa SOLO las tarifas que ya existen en el estudio actual (PRICING) y distingue
// qué está definido, qué es opcional, qué hay que valorar y qué no existe todavía. Nunca cobra ni promete.
import { PRICING } from "@/components/configurator/studioModel";
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
  /** precio base ya definido por tarifa (sin extras por valorar) */
  definedTotal: number;
  capped: boolean;
  pages: number;
}

export const KIND_LABEL: Record<LineKind, string> = {
  definido: "Precio definido",
  opcional: "Extra opcional",
  valorar: "Pendiente de valoración",
  "no-disponible": "Aún no disponible",
};

export const clampPages = (n: number): number => Math.min(PRICING.maxPages, Math.max(PRICING.minPages, Math.round(Number.isFinite(n) ? n : PRICING.minPages)));

export function estimate(cfg: SiteConfig): Estimate {
  const pages = clampPages(cfg.pages);
  const extra = Math.max(0, pages - PRICING.includedPages);
  const subtotal = PRICING.base + extra * PRICING.extraPage;
  const definedTotal = Math.min(PRICING.cap, subtotal);
  const lines: EstimateLine[] = [
    { kind: "definido", label: "Web Esencial", detail: `Hasta ${PRICING.includedPages} páginas, con tus colores, secciones y botones`, amount: PRICING.base },
  ];
  if (extra > 0) lines.push({ kind: "definido", label: `${extra} página${extra > 1 ? "s" : ""} extra`, detail: `${PRICING.extraPage} € por página`, amount: extra * PRICING.extraPage });
  if (subtotal > PRICING.cap) lines.push({ kind: "definido", label: "Tope cerrado", detail: `El precio nunca supera ${PRICING.cap} €`, amount: PRICING.cap - subtotal });

  const on = enabledSections(cfg);
  if (on.includes("gallery") || on.includes("carousel")) lines.push({ kind: "valorar", label: "Galería y carrusel", detail: "Se confirma al revisar el diseño y las imágenes que aportes" });
  if (cfg.images.some((i) => i.kind === "upload") || cfg.business.hasLogo) lines.push({ kind: "valorar", label: "Tus imágenes y logotipo", detail: "Se revisan antes de publicarlas (calidad y derechos de uso)" });
  if (cfg.wants.stella) lines.push({ kind: "opcional", label: "Stella, asistente con IA en tu web", detail: "Responde dudas con la información de tu negocio y recoge contactos. Se presupuesta aparte" });
  if (cfg.business.domain.trim() === "") lines.push({ kind: "valorar", label: "Dominio y alojamiento", detail: "Si aún no tienes dominio, lo vemos contigo" });
  for (const id of cfg.wants.interests) {
    const it = INTERESTS.find((i) => i.id === id);
    if (it) lines.push({ kind: "no-disponible", label: it.label, detail: "Todavía no existe: queda anotado como interés, no se presupuesta ni se cobra" });
  }
  return { lines, definedTotal, capped: subtotal > PRICING.cap, pages };
}

export const euro = (n: number): string => `${n.toLocaleString("es-ES")} €`;
