// ============================================================
//  Stella AI — Motor de intenciones contextuales
//  Detecta la intención del usuario por palabras clave y
//  devuelve la respuesta + la acción/tarjeta a desplegar.
// ============================================================

export type StellaMode = "citas" | "facturacion" | "gps" | "general";

export type IntentId =
  | "invoice"
  | "summary"
  | "tracking"
  | "calendar"
  | "fallback";

export type StellaAction =
  | "calendar"
  | "invoice"
  | "summary"
  | "tracking"
  | null;

export interface IntentResult {
  intent: IntentId;
  reply: string;
  action: StellaAction;
}

// Palabras clave por intención (se evalúan en orden de prioridad).
const KEYWORDS: Record<Exclude<IntentId, "fallback">, string[]> = {
  // Factura / contabilidad
  invoice: ["factura", "facturacion", "facturación", "cobro", "cobrar", "ticket", "cuenta", "pdf", "iva", "presupuesto", "emitir", "emit"],
  // Resumen / ventas del día
  summary: ["resumen", "dia", "día", "hoy", "caja", "ventas", "venta", "metricas", "métricas", "ingresos", "beneficio", "cuanto llevo", "cuánto llevo", "estadistica", "estadística", "informe"],
  // Seguimiento GPS / rastreo
  tracking: ["gps", "donde esta", "dónde está", "repartidor", "pedido", "tracking", "ruta", "entrega", "enviar", "camino", "llegar", "ubicacion", "ubicación"],
  // Citas / agenda
  calendar: ["cita", "reserva", "reservar", "jueves", "agenda", "calendario", "hora", "hueco", "turno", "confirmar cita", "viernes", "lunes", "martes", "miercoles", "miércoles"],
};

// Respuestas y acciones por intención (copy solicitado en la spec).
const INTENT_RESPONSES: Record<IntentId, IntentResult> = {
  invoice: {
    intent: "invoice",
    reply:
      "He generado el desglose contable y borrador de factura para el cliente. 🧾",
    action: "invoice",
  },
  summary: {
    intent: "summary",
    reply:
      "Aquí tienes el resumen operativo de hoy. Has facturado un +18% más que ayer. 📈",
    action: "summary",
  },
  tracking: {
    intent: "tracking",
    reply:
      "Conectando con el GPS en tiempo real. El repartidor está a 4 minutos del destino. 📍",
    action: "tracking",
  },
  calendar: {
    intent: "calendar",
    reply:
      "Cita agendada para la fecha indicada y sincronizada con Google Calendar. 📅",
    action: "calendar",
  },
  fallback: {
    intent: "fallback",
    reply:
      "Puedo ayudarte a gestionar tu negocio: agendar citas, generar facturas, enviar el resumen de ventas del día o localizar a tus repartidores en el mapa. ¿Sobre qué quieres que trabaje?",
    action: null,
  },
};

// Respuestas de fallback adicionales para variar la conversación.
const FALLBACK_VARIANTS: string[] = [
  "Puedo ayudarte a gestionar tu negocio: agendar citas, generar facturas, enviar el resumen de ventas del día o localizar a tus repartidores en el mapa. ¿Sobre qué quieres que trabaje?",
  "Soy Stella. Dime algo como «genera la factura de Pepe», «resumen de hoy», «¿dónde está el pedido #104?» o «resérvame el jueves a las 11» y lo ejecuto al instante.",
  "No estoy segura de haber entendido. Prueba con: una cita, una factura, el resumen de ventas o el seguimiento de un reparto.",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita acentos
}

/**
 * Detecta la intención del mensaje. El `mode` actual sesga el resultado
 * (útil cuando el usuario pulsa un chip contextual), pero las palabras
 * clave del texto siempre tienen prioridad.
 */
export function detectIntent(text: string, mode: StellaMode = "general"): IntentResult {
  const t = normalize(text);

  const has = (words: string[]) => words.some((w) => t.includes(normalize(w)));

  // Orden de prioridad: factura → resumen → gps → citas.
  if (has(KEYWORDS.invoice)) return INTENT_RESPONSES.invoice;
  if (has(KEYWORDS.summary)) return INTENT_RESPONSES.summary;
  if (has(KEYWORDS.tracking)) return INTENT_RESPONSES.tracking;
  if (has(KEYWORDS.calendar)) return INTENT_RESPONSES.calendar;

  // Sin palabras clave: usamos el modo contextual activo como respaldo.
  if (mode === "facturacion") return INTENT_RESPONSES.invoice;
  if (mode === "gps") return INTENT_RESPONSES.tracking;
  if (mode === "citas") return INTENT_RESPONSES.calendar;

  // Fallback general variado.
  const variant = Math.floor(Math.random() * FALLBACK_VARIANTS.length);
  return { intent: "fallback", reply: FALLBACK_VARIANTS[variant], action: null };
}
