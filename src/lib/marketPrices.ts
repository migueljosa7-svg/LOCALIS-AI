// ════════════════════════════════════════════════════════════════
//  Precios de mercado (España) usados en la comparativa del estudio.
//
//  REGLA: ninguna cifra se inventa. Cada valor sale de precios publicados
//  por agencias/proveedores españoles y se usa el EXTREMO BAJO (o el punto
//  medio del tramo más barato) para que la comparativa sea conservadora.
//
//  Para actualizar: revisa las fuentes, ajusta valores y cambia REVIEWED_AT.
//  `npm run check` avisa si han pasado más de 90 días desde la revisión.
// ════════════════════════════════════════════════════════════════

/** Fecha de la última revisión de las fuentes (AAAA-MM-DD). */
export const REVIEWED_AT = "2026-11-12";

export interface MarketItem {
  /** Valor usado en el cálculo (€, sin IVA). */
  value: number;
  /** Rango publicado en las fuentes. */
  range: string;
  /** Cómo se obtiene el valor a partir del rango. */
  method: string;
  sources: { name: string; url: string }[];
}

export const MARKET = {
  web: {
    value: 1000,
    range: "800–1.200 € (web corporativa profesional de 5–10 páginas); 1.500–3.500 € en otras agencias",
    method: "Punto medio del tramo más barato publicado.",
    sources: [
      { name: "Trend Marketing", url: "https://trendmarketing.es/blog/cuanto-cuesta-una-pagina-web/" },
      { name: "Departamento Creativo", url: "https://departamentocreativo.com/blog-posts/cuanto-cuesta-una-pagina-web-en-espana-precios-reales-2026" },
      { name: "Karma Studio", url: "https://karma.studio/es/blog/cuanto-cuesta-una-pagina-web/" },
    ],
  },
  extraPage: {
    value: 80,
    range: "+400 € entre una web de 5 y una de 10 páginas (800 → 1.200 €)",
    method: "Diferencia del tramo dividida entre 5 páginas.",
    sources: [{ name: "Trend Marketing", url: "https://trendmarketing.es/blog/cuanto-cuesta-una-pagina-web/" }],
  },
  stella: {
    value: 990,
    range: "800–3.000 € de implantación (chatbot a medida con IA); 1.500–5.000 € con agenda/CRM",
    method: "Precio público más bajo encontrado para chatbot de WhatsApp con reservas (990 € + 79 €/mes).",
    sources: [
      { name: "Altoestrato", url: "https://www.altoestrato.com/precios-whatsapp-business-api-pymes/" },
      { name: "Flowmatic", url: "https://flowmatic.es/automatizacion/chatbot-whatsapp-empresas/" },
      { name: "Grupo ORO", url: "https://grupooro.es/cuanto-cuesta-un-chatbot-de-whatsapp/" },
    ],
  },
  gps: {
    value: 3000,
    range: "3.000–6.000 € (geolocalización en tiempo real y rutas); 5.000–15.000 € en otras fuentes",
    method: "Extremo bajo del rango publicado para el módulo de seguimiento GPS.",
    sources: [
      { name: "Yeeply", url: "https://yeeply.com/cuanto-cuesta/crear-app-delivery/" },
      { name: "Docastix", url: "https://docastix.com/blog/cuanto-cuesta-hacer-una-app" },
    ],
  },
  catalogo: {
    value: 500,
    range: "Web con tienda online / delivery: 1.500–4.000 €",
    method: "Sobrecoste mínimo frente a la web corporativa (1.500 € − 1.000 €).",
    sources: [{ name: "Hubs Mesa Click", url: "https://hubsmesaclick.com/2026/03/30/cuanto-cuesta-digitalizar-un-restaurante-en-espana-en-2026/" }],
  },
  commission: {
    value: 25,
    range: "15–35 % por pedido; ~30 % cuando reparte la plataforma (Glovo, Uber Eats, Just Eat)",
    method: "Valor por defecto del control; el cliente lo ajusta entre 20 % y 30 %.",
    sources: [
      { name: "Qamarero", url: "https://qamarero.com/blog/comisiones-delivery-cuanto-cobran-realmente-las-plataformas/" },
      { name: "DeliveryLift", url: "https://deliverylift.com/es/blog/glovo-uber-eats-just-eat-cual-es-mas-barato/" },
    ],
  },
} satisfies Record<string, MarketItem>;

/** Fecha de revisión legible en español (p. ej. "12 de noviembre de 2026"). */
export function reviewedLabel(): string {
  const [y, m, d] = REVIEWED_AT.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
