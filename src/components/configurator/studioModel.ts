// ════════════════════════════════════════════════════════════════
//  Estudio visual "Diseña tu web en directo": modelo de datos, precios
//  y generador del prompt técnico. Funciones puras (sin React).
// ════════════════════════════════════════════════════════════════
import { compute, defaultConfig, sectorById, type FeatureId, type SectorId } from "./configModel";
import { MARKET } from "@/lib/marketPrices";

export type StyleId = "clinico" | "gastronomico" | "darktech";
export type ModuleId = "stella" | "gps" | "catalogo";
export type HoverAnim = "neon" | "lift" | "pulse" | "slide";

export interface StylePreset {
  id: StyleId;
  label: string;
  hint: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  /** Color de marca por defecto para esta paleta. */
  accent: string;
  font: string;
}

export const STYLES: StylePreset[] = [
  {
    id: "clinico",
    label: "Blanco limpio y clínico",
    hint: "Clínicas, estética y despachos",
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
    muted: "#475569",
    border: "#E2E8F0",
    accent: "#2563EB",
    font: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: "gastronomico",
    label: "Cálido gastronómico",
    hint: "Restaurantes, bares y obradores",
    bg: "#FBF4E9",
    surface: "#FFFDF8",
    text: "#2B2622",
    muted: "#6B5E52",
    border: "#EADCC6",
    accent: "#C2410C",
    font: "Georgia, 'Times New Roman', serif",
  },
  {
    id: "darktech",
    label: "Dark tech neón",
    hint: "Talleres, tecnología y motor",
    bg: "#0B0F17",
    surface: "#131B2A",
    text: "#E2E8F0",
    muted: "#94A3B8",
    border: "#1F2A3C",
    accent: "#00F2FE",
    font: "var(--font-display), system-ui, sans-serif",
  },
];

/** Colores de marca rápidos para los botones del lienzo. */
export const BRAND_SWATCHES: { hex: string; name: string }[] = [
  { hex: "#2563EB", name: "Azul" },
  { hex: "#059669", name: "Esmeralda" },
  { hex: "#C2410C", name: "Terracota" },
  { hex: "#00F2FE", name: "Cian" },
];

export const BUTTON_PRESETS = ["Pedir a Domicilio", "Reservar Cita 24/7", "Hablar por WhatsApp", "Ver Ubicación GPS"] as const;

export const HOVER_ANIMS: { id: HoverAnim; label: string; css: string }[] = [
  { id: "neon", label: "Brillo neón", css: "halo luminoso del color de marca (box-shadow en un pseudo-elemento, transición de opacity)" },
  { id: "lift", label: "Elevación 3D", css: "translateY(-4px) + rotateX(6deg) con perspective y sombra suave (solo transform)" },
  { id: "pulse", label: "Pulso llamativo", css: "animación scale 1→1.06 en bucle mientras dura el hover (keyframes con transform)" },
  { id: "slide", label: "Deslizamiento suave", css: "capa de brillo que barre el botón de izquierda a derecha (translateX) y flecha que avanza 4px" },
];

export const MODULES: { id: ModuleId; label: string; detail: string; price: number }[] = [
  { id: "stella", label: "IA Stella 24/7", detail: "Citas, WhatsApp automático y facturas", price: 150 },
  { id: "gps", label: "Mapa GPS de reparto", detail: "Tus repartidores en vivo, sin comisiones", price: 150 },
  { id: "catalogo", label: "Catálogo / carta digital", detail: "Pedidos directos desde tu web", price: 100 },
];

export const PRICING = {
  base: 400, // Web Esencial: hasta 5 páginas, botones y animaciones
  includedPages: 5,
  extraPage: 15,
  cap: 800, // tope cerrado con todo incluido
  minPages: 4,
  maxPages: 10,
} as const;

/** Precios de agencia (fuentes y fecha en src/lib/marketPrices.ts). */
export const AGENCY = {
  base: MARKET.web.value,
  extraPage: MARKET.extraPage.value,
  stella: MARKET.stella.value,
  gps: MARKET.gps.value,
  catalogo: MARKET.catalogo.value,
} as const;

export interface StudioButton {
  id: string;
  label: string;
  anim: HoverAnim;
}

export interface Studio {
  sector: SectorId;
  style: StyleId;
  brand: string;
  pages: string[];
  buttons: StudioButton[];
  modules: ModuleId[];
  volume: number;
  fee: number;
}

const DEFAULT_PAGES: Record<SectorId, string[]> = {
  restaurante: ["Inicio", "Carta", "Pedidos", "Reservas", "Contacto"],
  clinica: ["Inicio", "Tratamientos", "Equipo", "Pedir cita", "Contacto"],
  taller: ["Inicio", "Servicios", "Presupuesto", "Contacto"],
  comercio: ["Inicio", "Tienda", "Ofertas", "Envíos", "Contacto"],
};

const DEFAULT_STYLE: Record<SectorId, StyleId> = {
  restaurante: "gastronomico",
  clinica: "clinico",
  taller: "darktech",
  comercio: "clinico",
};

const DEFAULT_BUTTONS: Record<SectorId, [string, HoverAnim][]> = {
  restaurante: [["Pedir a Domicilio", "pulse"], ["Hablar por WhatsApp", "lift"]],
  clinica: [["Reservar Cita 24/7", "neon"], ["Hablar por WhatsApp", "slide"]],
  taller: [["Reservar Cita 24/7", "neon"], ["Ver Ubicación GPS", "slide"]],
  comercio: [["Pedir a Domicilio", "lift"], ["Hablar por WhatsApp", "slide"]],
};

const DEFAULT_MODULES: Record<SectorId, ModuleId[]> = {
  restaurante: ["stella", "gps", "catalogo"],
  clinica: ["stella"],
  taller: ["stella"],
  comercio: ["catalogo", "gps"],
};

let seq = 0;
export const newButtonId = () => `b${Date.now().toString(36)}${(seq++).toString(36)}`;

export function defaultStudio(sector: SectorId = "restaurante"): Studio {
  const style = STYLES.find((s) => s.id === DEFAULT_STYLE[sector]) ?? STYLES[0];
  const base = defaultConfig(sector);
  return {
    sector,
    style: style.id,
    brand: style.accent,
    pages: [...DEFAULT_PAGES[sector]],
    buttons: DEFAULT_BUTTONS[sector].map(([label, anim], i) => ({ id: `d${i}`, label, anim })),
    modules: [...DEFAULT_MODULES[sector]],
    volume: base.volume,
    fee: base.fee,
  };
}

export function styleById(id: StyleId): StylePreset {
  return STYLES.find((s) => s.id === id) ?? STYLES[0];
}

// ── Validación de nombres de página ────────────────────────────────
export const PAGE_NAME_MAX = 18;
export function pageNameError(name: string, all: string[], index: number): string | null {
  const n = name.trim();
  if (!n) return "Pon un nombre a la página.";
  if (n.length > PAGE_NAME_MAX) return `Máximo ${PAGE_NAME_MAX} caracteres.`;
  if (all.some((o, i) => i !== index && o.trim().toLowerCase() === n.toLowerCase())) return "Ya tienes una página con ese nombre.";
  return null;
}

// ── Precios ───────────────────────────────────────────────────────
export interface Quote {
  base: number;
  extraPages: number;
  extraPagesCost: number;
  modulesCost: number;
  subtotal: number;
  total: number;
  capped: boolean;
  agency: number;
  saving: number;
  savingPct: number;
  monthlySaving: number;
  monthlyHours: number;
  commissionSaved: number;
  plan: { name: string; price: number };
}

/** Funciones del modelo operativo equivalentes a los módulos elegidos. */
function featuresFor(modules: ModuleId[]): FeatureId[] {
  const f: FeatureId[] = [];
  if (modules.includes("stella")) f.push("citas", "whatsapp");
  if (modules.includes("gps")) f.push("gps");
  if (modules.includes("catalogo")) f.push("catalogo");
  return f;
}

export function quote(s: Studio): Quote {
  const P = PRICING;
  const pageCount = Math.min(P.maxPages, Math.max(P.minPages, s.pages.length));
  const extraPages = Math.max(0, pageCount - P.includedPages);
  const extraPagesCost = extraPages * P.extraPage;
  const modulesCost = MODULES.filter((m) => s.modules.includes(m.id)).reduce((a, m) => a + m.price, 0);
  const subtotal = P.base + extraPagesCost + modulesCost;
  const total = Math.min(P.cap, subtotal);

  const A = AGENCY;
  const agency =
    A.base +
    extraPages * A.extraPage +
    (s.modules.includes("stella") ? A.stella : 0) +
    (s.modules.includes("gps") ? A.gps : 0) +
    (s.modules.includes("catalogo") ? A.catalogo : 0);
  const saving = agency - total;

  // Ahorro mensual de la operativa (comisiones 20–30 %, horas de atención, ausencias).
  const ops = compute({ sector: s.sector, pages: pageCount > 5 ? "catalogo" : "corporativa", features: featuresFor(s.modules), volume: s.volume, fee: s.fee });

  return {
    base: P.base,
    extraPages,
    extraPagesCost,
    modulesCost,
    subtotal,
    total,
    capped: subtotal > P.cap,
    agency,
    saving,
    savingPct: Math.round((saving / agency) * 100),
    monthlySaving: ops.monthlyNet,
    monthlyHours: ops.hours,
    commissionSaved: ops.commissionSaved,
    plan: { name: ops.planName, price: ops.planPrice },
  };
}

// ── Contraste: texto legible sobre el color de marca ──────────────
export function readableOn(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#FFFFFF";
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.045) / 1.055, 2.4);
  });
  const L = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  // Contraste con blanco vs con casi-negro: se elige el mayor.
  return 1.05 / (L + 0.05) >= (L + 0.05) / 0.055 ? "#FFFFFF" : "#0B0F17";
}

const eur = (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`;
const animLabel = (a: HoverAnim) => HOVER_ANIMS.find((h) => h.id === a)?.label ?? a;
const moduleLabel = (m: ModuleId) => MODULES.find((x) => x.id === m)?.label ?? m;

/** Resumen corto y limpio (WhatsApp y campo "details" del lead). */
export function summary(s: Studio, q: Quote): string {
  const sec = sectorById(s.sector);
  const st = styleById(s.style);
  return [
    `Sector: ${sec.label}`,
    `Estilo: ${st.label} · color ${s.brand}`,
    `Páginas (${s.pages.length}): ${s.pages.join(", ")}`,
    `Botones: ${s.buttons.map((b) => `${b.label} (${animLabel(b.anim)})`).join(", ") || "ninguno"}`,
    `Módulos: ${s.modules.map(moduleLabel).join(", ") || "ninguno"}`,
    `Presupuesto cerrado: ${eur(q.total)} (vs ~${eur(q.agency)} en agencia, ahorro ${q.savingPct} %)`,
    `Suscripción sugerida: Plan ${q.plan.name} ${q.plan.price} €/mes`,
  ].join("\n");
}

/** Prompt técnico completo para generar la web del cliente en una sola petición. */
export function buildPrompt(s: Studio, q: Quote, client?: { business?: string; contact?: string }): string {
  const sec = sectorById(s.sector);
  const st = styleById(s.style);
  const brandText = readableOn(s.brand);
  const business = client?.business?.trim() || sec.sampleName;
  const moduleSpecs: Record<ModuleId, string> = {
    stella:
      "IA Stella 24/7: widget de chat + integración WhatsApp Cloud API. Responde FAQs del negocio, propone huecos libres y crea citas en Google Calendar, envía confirmación y recordatorio por WhatsApp y genera facturas PDF con IVA. Deja la lógica de IA detrás de una API route (/api/stella) con interfaz tipada para conectar el proveedor.",
    gps:
      "Mapa GPS de reparto propio sin comisiones: vista de seguimiento en tiempo real del repartidor (WebSocket o polling cada 5 s), ETA, enlace público de tracking compartible por WhatsApp y panel de repartidores. Mapa con Leaflet + teselas OSM/CARTO, cargado de forma diferida.",
    catalogo:
      `Catálogo / carta digital (${sec.catalogWord}): categorías, fichas con foto, precio y alérgenos/variantes, carrito y pedido directo (recogida o domicilio) que notifica al negocio por WhatsApp/email. Sin pasarela de terceros con comisión.`,
  };

  return `# Encargo: web para "${business}" (${sec.label}) — LOCALIS AI

## Rol
Actúa como ingeniero/a full-stack senior y diseñador/a UI. Genera el proyecto completo, listo para producción, en un único resultado.

## Stack obligatorio
- Next.js 15 (App Router) + TypeScript estricto + Tailwind CSS 3.
- Componentes de servidor por defecto; "use client" solo en islas interactivas.
- next/font, metadatos SEO completos, sitemap.ts, robots.ts y JSON-LD LocalBusiness (Zaragoza).
- Despliegue en Vercel. Lighthouse móvil ≥ 95 en las 4 categorías. WCAG 2.1 AA.

## Negocio
- Nombre: ${business}${client?.contact ? `\n- Contacto: ${client.contact}` : ""}
- Sector: ${sec.label} · ciudad: Zaragoza (España) · idioma: español de España.

## Dirección visual — paleta "${st.label}"
- Fondo: ${st.bg} · superficies: ${st.surface} · bordes: ${st.border}
- Texto: ${st.text} · texto secundario: ${st.muted}
- Color de marca (botones, enlaces, acentos): ${s.brand} con texto ${brandText} encima (contraste ≥ 4.5:1).
- Tipografía base: ${st.font}. Esquinas redondeadas 12–16 px, espaciado amplio, móvil primero.

## Páginas / pestañas del menú (${s.pages.length}, en este orden)
${s.pages.map((p, i) => `${i + 1}. ${p}`).join("\n")}
Cada página con su propia ruta, cabecera fija con estas pestañas, menú móvil táctil y pie con datos de contacto y enlaces legales (aviso legal, privacidad, cookies con consentimiento RGPD).

## Botones de acción (visibles en el hero y repetidos donde tenga sentido)
${s.buttons.length ? s.buttons.map((b, i) => `${i + 1}. "${b.label}" — animación hover: ${animLabel(b.anim)} → ${HOVER_ANIMS.find((h) => h.id === b.anim)?.css}.`).join("\n") : "Sin botones adicionales: usa un CTA principal de contacto."}
Las animaciones deben usar solo transform/opacity (GPU, 60 fps), respetar prefers-reduced-motion y tener equivalente en :focus-visible y en táctil (:active).

## Módulos inteligentes
${s.modules.length ? s.modules.map((m) => `- ${moduleSpecs[m]}`).join("\n") : "- Ninguno (web informativa)."}

## Requisitos funcionales
- Formulario de contacto validado (teléfono español de 9 cifras o con prefijo, email con detección de erratas), envío a /api/contact con rate-limit y aviso por email (Resend).
- Botón flotante de WhatsApp. Google Maps embebido en Contacto (carga diferida).
- Textos reales y persuasivos para un ${sec.short.toLowerCase()} de Zaragoza (nada de lorem ipsum).

## Presupuesto cerrado (no superar)
- Web Esencial: ${eur(q.base)}${q.extraPages ? `\n- Páginas extra: ${q.extraPages} × ${PRICING.extraPage} € = ${eur(q.extraPagesCost)}` : ""}
- Módulos: ${eur(q.modulesCost)}
- TOTAL DESARROLLO: ${eur(q.total)}${q.capped ? ` (tope cerrado de ${eur(PRICING.cap)} aplicado)` : ""}
- Mantenimiento: Plan ${q.plan.name}, ${q.plan.price} €/mes.

## Entregables
Estructura de carpetas, todos los archivos con código completo, .env.example, README con pasos de despliegue en Vercel y checklist final de QA (responsive 360–1440 px, accesibilidad, rendimiento y SEO).`;
}
