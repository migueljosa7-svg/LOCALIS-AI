// Precios de REFERENCIA de LOCALIS AI (fuente única: web pública, configurador, ficha de Stella y panel).
// Son importes iniciales, no una obligación: cada proyecto se presupuesta por escrito y puede ajustarse.
// No hay descuentos automáticos ni publicados; cualquier ajuste lo decide el titular en cada presupuesto.
// Márgenes, costes y estrategia comercial NO van aquí ni en este repositorio (es público).

const IVA = 0.21;
const r2 = (n: number) => Math.round(n * 100) / 100;
const eur2 = (n: number) => `${n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export const TARIFAS = {
  /** Oferta de entrada. 390 € ES EL PRECIO FINAL con IVA incluido. */
  esencial: {
    id: "esencial",
    name: "Web Esencial LOCALIS",
    price: 390,
    ivaIncluido: true,
    pages: 5,
    tagline: "Presencia profesional en Internet para autónomos y pequeños negocios",
    includes: [
      "Hasta 5 páginas",
      "Diseño adaptado a móvil, tablet y ordenador",
      "Dominio propio con el registro del primer año incluido (.es o .com estándar, sujeto a disponibilidad)",
      "SEO básico inicial: títulos, descripciones y estructura preparados para Google",
      "Botones de teléfono, WhatsApp y contacto",
      "Formulario de contacto",
      "Configuración y publicación, con revisión contigo antes de salir",
    ],
  },
  /** Web de mayor tamaño. 590 € + IVA. */
  pro: {
    id: "pro",
    name: "Web Pro",
    price: 590,
    ivaIncluido: false,
    pages: 10,
    tagline: "Para negocios con más servicios y más contenido",
    includes: [
      "Todo lo de la Web Esencial LOCALIS",
      "Hasta 10 páginas",
      "Más contenido por página: galería, carrusel, preguntas frecuentes y opiniones reales de tus clientes (si nos las facilitas)",
      "Textos de cada página orientados a Google (SEO local), redactados contigo",
    ],
  },
  /** Referencia mensual por página, sin IVA. El presupuesto real puede variar. */
  mantenimientoPorPagina: 15,
} as const;

export type Pack = typeof TARIFAS.esencial | typeof TARIFAS.pro;

/** Lo que aporta el cliente (y, si no puede, se presupuesta aparte). */
export const CLIENTE_APORTA = [
  "Los textos de tu negocio (o nos pides que te ayudemos a redactarlos: se presupuesta aparte)",
  "Tus fotografías y tu logotipo (si no los tienes, se presupuestan aparte)",
  "Los datos del negocio: nombre, dirección, horario, teléfono, servicios",
  "Tu aprobación del diseño antes de publicar",
] as const;

/** Qué NO está incluido en el precio de la web y cuándo se explica. */
export const NO_INCLUIDO = [
  "Alojamiento de la web: no está incluido. Te explicamos las opciones y su coste en el presupuesto, antes de empezar",
  "Renovación del dominio a partir del segundo año: a cargo del cliente (te avisamos antes de cada renovación)",
  "Mantenimiento: opcional, se contrata aparte (ver más abajo)",
  "Redacción de textos, fotografía profesional y diseño de logotipo",
  "Páginas adicionales y funciones a medida (reservas, tienda online, etc.)",
] as const;

/** Paquete de referencia según el número de páginas elegido en el configurador. */
export const packageForPages = (pages: number): Pack => (pages > TARIFAS.esencial.pages ? TARIFAS.pro : TARIFAS.esencial);

/** «390 € IVA incluido» o «590 € + IVA». */
export const priceLabel = (p: Pack): string => `${p.price.toLocaleString("es-ES")} €${p.ivaIncluido ? " IVA incluido" : " + IVA"}`;

/** Desglose con IVA al 21 % para mostrar al cliente: «322,31 € + 67,69 € de IVA». */
export function vatBreakdown(p: Pack): { net: number; vat: number; gross: number; text: string } {
  if (p.ivaIncluido) {
    const net = r2(p.price / (1 + IVA));
    const vat = r2(p.price - net);
    return { net, vat, gross: p.price, text: `${eur2(net)} + ${eur2(vat)} de IVA (21 %)` };
  }
  const gross = r2(p.price * (1 + IVA));
  return { net: p.price, vat: r2(gross - p.price), gross, text: `${eur2(gross)} con IVA (21 %)` };
}

/** Mantenimiento de referencia por mes para un número de páginas (sin IVA). */
export const maintenanceFor = (pages: number): number => Math.max(1, Math.round(pages)) * TARIFAS.mantenimientoPorPagina;
