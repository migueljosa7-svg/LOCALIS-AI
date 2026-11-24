// Precios de REFERENCIA de LOCALIS AI (fuente única: web pública, configurador, ficha de Stella y panel).
// Son importes iniciales sin IVA, no una obligación: cada proyecto se presupuesta por escrito y puede ajustarse.
// No hay descuentos automáticos ni publicados; cualquier ajuste lo decide el titular en cada presupuesto.

export const TARIFAS = {
  captacion: {
    name: "Web Captación",
    price: 390,
    pages: 5,
    tagline: "Para que te encuentren y te contacten",
    includes: [
      "Hasta 5 páginas con tus colores, secciones y botones",
      "Adaptada a móvil, tablet y ordenador",
      "Formulario de presupuesto y botón de WhatsApp",
      "Mapa de Google y botón «Cómo llegar»",
      "Títulos, descripciones y estructura preparados para Google",
      "Publicación y revisión contigo antes de salir",
    ],
  },
  pro: {
    name: "Web Pro",
    price: 590,
    pages: 10,
    tagline: "Para negocios con más servicios y contenido",
    includes: [
      "Todo lo de Web Captación",
      "Hasta 10 páginas",
      "Más contenido por página: galería, carrusel, preguntas frecuentes y opiniones reales de tus clientes (si nos las facilitas)",
      "Textos de cada página orientados a Google (SEO local) redactados contigo",
    ],
  },
  /** Referencia mensual por página. El presupuesto real puede variar. */
  mantenimientoPorPagina: 15,
} as const;

/** Paquete de referencia según el número de páginas elegido. */
export const packageForPages = (pages: number) => (pages > TARIFAS.captacion.pages ? TARIFAS.pro : TARIFAS.captacion);

/** Mantenimiento de referencia por mes para un número de páginas (sin IVA). */
export const maintenanceFor = (pages: number): number => Math.max(1, Math.round(pages)) * TARIFAS.mantenimientoPorPagina;
