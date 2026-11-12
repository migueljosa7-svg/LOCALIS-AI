// ════════════════════════════════════════════════════════════════
//  Modelo del configurador "Diseña tu web y calcula tu ahorro".
//  Funciones puras: sin React, fáciles de probar y de ajustar.
//  Todas las cifras son ESTIMACIONES orientativas y se muestran así en la UI.
// ════════════════════════════════════════════════════════════════
import { PLANS } from "@/lib/plans";

export type SectorId = "restaurante" | "clinica" | "taller" | "comercio";
export type PagesId = "landing" | "corporativa" | "catalogo";
export type FeatureId = "citas" | "gps" | "whatsapp" | "catalogo";

export interface SectorDef {
  id: SectorId;
  label: string;
  short: string;
  /** Opción equivalente del desplegable del formulario de leads. */
  leadSector: string;
  sampleName: string;
  volumeLabel: string;
  unit: string;
  volume: { min: number; max: number; step: number; default: number };
  /** Ticket medio estimado (€). */
  ticket: number;
  /** Parte del volumen que son reservas/citas, entregas a domicilio y pedidos. */
  bookingShare: number;
  deliveryShare: number;
  orderShare: number;
  /** Comisión típica de plataformas (0 si el sector no las usa). */
  platformFee: number;
  /** Tasa de ausencias a citas y cuánto la reducen los recordatorios. */
  noShowRate: number;
  recommended: FeatureId[];
  recommendedPages: PagesId;
  catalogWord: string;
  bookingCta: string;
}

export const SECTORS: SectorDef[] = [
  {
    id: "restaurante",
    label: "Restaurante / Delivery",
    short: "Restaurante",
    leadSector: "Restauración / Delivery",
    sampleName: "Pizzería del Ebro",
    volumeLabel: "Pedidos a domicilio al mes",
    unit: "pedidos",
    volume: { min: 20, max: 2000, step: 10, default: 300 },
    ticket: 22,
    bookingShare: 0.25,
    deliveryShare: 1,
    orderShare: 1,
    platformFee: 0.25,
    noShowRate: 0,
    recommended: ["gps", "whatsapp", "catalogo"],
    recommendedPages: "corporativa",
    catalogWord: "Carta",
    bookingCta: "Reservar mesa",
  },
  {
    id: "clinica",
    label: "Clínica / Estética",
    short: "Clínica",
    leadSector: "Clínica / Salud",
    sampleName: "Clínica Dental Sol",
    volumeLabel: "Citas al mes",
    unit: "citas",
    volume: { min: 40, max: 1500, step: 10, default: 250 },
    ticket: 55,
    bookingShare: 1,
    deliveryShare: 0,
    orderShare: 0.05,
    platformFee: 0,
    noShowRate: 0.08,
    recommended: ["citas", "whatsapp"],
    recommendedPages: "corporativa",
    catalogWord: "Tratamientos",
    bookingCta: "Pedir cita",
  },
  {
    id: "taller",
    label: "Taller mecánico",
    short: "Taller",
    leadSector: "Taller / Servicios a domicilio",
    sampleName: "Talleres Delicias",
    volumeLabel: "Citas y reparaciones al mes",
    unit: "citas",
    volume: { min: 20, max: 800, step: 10, default: 120 },
    ticket: 180,
    bookingShare: 1,
    deliveryShare: 0,
    orderShare: 0.1,
    platformFee: 0,
    noShowRate: 0.05,
    recommended: ["citas", "whatsapp"],
    recommendedPages: "landing",
    catalogWord: "Servicios",
    bookingCta: "Pedir cita",
  },
  {
    id: "comercio",
    label: "Comercio / Servicios",
    short: "Comercio",
    leadSector: "Comercio minorista",
    sampleName: "Frutería Pepe",
    volumeLabel: "Pedidos o servicios al mes",
    unit: "pedidos",
    volume: { min: 20, max: 1500, step: 10, default: 200 },
    ticket: 30,
    bookingShare: 0.2,
    deliveryShare: 0.6,
    orderShare: 1,
    platformFee: 0.2,
    noShowRate: 0,
    recommended: ["catalogo", "whatsapp", "gps"],
    recommendedPages: "catalogo",
    catalogWord: "Tienda",
    bookingCta: "Reservar",
  },
];

export const PAGE_OPTIONS: { id: PagesId; label: string; detail: string }[] = [
  { id: "landing", label: "1 página", detail: "Landing de conversión" },
  { id: "corporativa", label: "3–5 páginas", detail: "Web corporativa" },
  { id: "catalogo", label: "+5 páginas", detail: "Catálogo / tienda" },
];

export const FEATURES: { id: FeatureId; title: string; detail: string }[] = [
  { id: "citas", title: "Citas automáticas 24/7 con IA Stella", detail: "Sincronizado con Google Calendar" },
  { id: "gps", title: "Mapa GPS de reparto en tiempo real", detail: "Tus repartidores, sin comisiones" },
  { id: "whatsapp", title: "WhatsApp automatizado + facturación", detail: "Respuestas y facturas al instante" },
  { id: "catalogo", title: "Catálogo / carta digital con pedidos", detail: "Pedidos directos, sin intermediarios" },
];

// Hipótesis (minutos de trabajo manual que se ahorran por unidad).
export const ASSUMPTIONS = {
  minPerBooking: 4, // atender llamada, buscar hueco, apuntar y confirmar
  minPerMessage: 2.5, // contestar WhatsApp + preparar factura
  minPerPhoneOrder: 2, // tomar un pedido por teléfono
  minPerTrackingCall: 1, // "¿dónde está mi pedido?"
  hourlyCost: 14, // € por hora de atención / recepción
  noShowReduction: 0.6, // reducción de ausencias con recordatorios
} as const;

export interface Config {
  sector: SectorId;
  pages: PagesId;
  features: FeatureId[];
  volume: number;
  /** Comisión actual de la plataforma (0–1), solo en sectores con reparto. */
  fee: number;
}

export interface Result {
  hours: number;
  hoursValue: number;
  commissionSaved: number;
  noShowRecovered: number;
  planName: string;
  planPrice: number;
  monthlyNet: number;
  yearlyNet: number;
}

export function sectorById(id: SectorId): SectorDef {
  return SECTORS.find((s) => s.id === id) ?? SECTORS[0];
}

export function defaultConfig(id: SectorId = "restaurante"): Config {
  const s = sectorById(id);
  return { sector: s.id, pages: s.recommendedPages, features: [...s.recommended], volume: s.volume.default, fee: s.platformFee };
}

/** Normaliza cualquier entrada (p. ej. de la URL o del estado) a valores válidos. */
export function sanitize(c: Config): Config {
  const s = sectorById(c.sector);
  const vol = Number.isFinite(c.volume) ? c.volume : s.volume.default;
  const fee = Number.isFinite(c.fee) ? c.fee : s.platformFee;
  return {
    sector: s.id,
    pages: PAGE_OPTIONS.some((p) => p.id === c.pages) ? c.pages : s.recommendedPages,
    features: FEATURES.map((f) => f.id).filter((id) => c.features.includes(id)),
    volume: Math.min(s.volume.max, Math.max(s.volume.min, Math.round(vol))),
    fee: Math.min(0.3, Math.max(0.2, fee)),
  };
}

export function compute(input: Config): Result {
  const c = sanitize(input);
  const s = sectorById(c.sector);
  const on = (f: FeatureId) => c.features.includes(f);
  const A = ASSUMPTIONS;

  let minutes = 0;
  if (on("citas")) minutes += c.volume * s.bookingShare * A.minPerBooking;
  if (on("whatsapp")) minutes += c.volume * A.minPerMessage;
  if (on("catalogo")) minutes += c.volume * s.orderShare * A.minPerPhoneOrder;
  if (on("gps")) minutes += c.volume * s.deliveryShare * A.minPerTrackingCall;
  const hours = minutes / 60;
  const hoursValue = hours * A.hourlyCost;

  // Comisiones: solo si el negocio reparte con sus propios medios (GPS activado).
  const commissionSaved = on("gps") && s.platformFee > 0 ? c.volume * s.deliveryShare * s.ticket * c.fee : 0;

  // Ausencias evitadas gracias a confirmaciones y recordatorios automáticos.
  const noShowRecovered = on("citas") && s.noShowRate > 0 ? c.volume * s.noShowRate * A.noShowReduction * s.ticket : 0;

  const needsPro = on("gps") || c.pages === "catalogo";
  const plan = PLANS.find((p) => p.id === (needsPro ? "pro" : "starter")) ?? PLANS[0];

  const monthlyNet = Math.max(0, commissionSaved + hoursValue + noShowRecovered - plan.priceMonth);
  return {
    hours,
    hoursValue,
    commissionSaved,
    noShowRecovered,
    planName: plan.name,
    planPrice: plan.priceMonth,
    monthlyNet,
    yearlyNet: monthlyNet * 12,
  };
}
