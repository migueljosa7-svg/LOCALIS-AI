// ============================================================
//  Stella AI — Motor NLU v2 (sin dependencias)
//  Normalizacion ES + entidades (dia/hora/servicio/cliente/pedido)
//  + respuestas dinamicas que reutilizan lo escrito por el usuario.
// ============================================================

export type StellaMode = "citas" | "facturacion" | "gps" | "general";

export type IntentId =
  | "greeting" | "capabilities" | "pricing" | "availability"
  | "booking" | "invoice" | "summary" | "tracking"
  | "hours" | "thanks" | "farewell" | "fallback" | "referral";

export type StellaAction = "calendar" | "invoice" | "summary" | "tracking" | "referral" | null;

export interface StellaSlots {
  dayLabel?: string; dayDate?: string; time?: string;
  service?: string; client?: string; orderId?: string;
  options?: string[]; kind?: "availability" | "booking";
}

export interface IntentResult {
  intent: IntentId; reply: string; action: StellaAction;
  slots?: StellaSlots; chips?: string[];
}

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD")
    .replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;:()"]/g, " ")
    .replace(/\s+/g, " ").trim();
}

const STOP = new Set(["hola","por","para","con","que","una","unos","unas","esto","esta","este","tienes","tiene","quiero","puedes","puedo","hacer","como","cuando","donde","cuanto","cuesta","gracias","favor","seria","algo","aqui","los","las","del","pero","porque","solo","tambien","tengo","hay","muy","mas","menos"]);

const WEEKDAYS = [
  { key: "lunes", label: "lunes", jsDay: 1 },
  { key: "martes", label: "martes", jsDay: 2 },
  { key: "miercoles", label: "miércoles", jsDay: 3 },
  { key: "jueves", label: "jueves", jsDay: 4 },
  { key: "viernes", label: "viernes", jsDay: 5 },
  { key: "sabado", label: "sábado", jsDay: 6 },
  { key: "domingo", label: "domingo", jsDay: 0 },
];

const MONTHS_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function nextDateForWeekday(jsDay: number, base = new Date()): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + ((jsDay - d.getDay() + 7) % 7));
  return d;
}
function formatDateEs(d: Date): string {
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
}
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const ALL_SLOTS = ["09:00","09:45","10:30","11:00","11:45","12:30","13:15","16:00","16:45","17:30","18:15","19:00"];
function pickSlots(seed: string, count = 3): string[] {
  const h = hashStr(seed); const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(ALL_SLOTS[(h % ALL_SLOTS.length + i * 3 + 1) % ALL_SLOTS.length]);
  return [...new Set(out)].sort().slice(0, count);
}


function extractDay(norm: string): { label: string; date: Date } | null {
  if (/\bpasado manana\b/.test(norm)) { const d = new Date(); d.setDate(d.getDate() + 2); return { label: "pasado mañana", date: d }; }
  if (/\bmanana\b/.test(norm)) { const d = new Date(); d.setDate(d.getDate() + 1); return { label: "mañana", date: d }; }
  if (/\bhoy\b/.test(norm)) return { label: "hoy", date: new Date() };
  for (const w of WEEKDAYS) if (norm.includes(w.key)) return { label: `el ${w.label}`, date: nextDateForWeekday(w.jsDay) };
  return null;
}
function padTime(h: string, min?: string): string {
  return `${String(Number(h)).padStart(2, "0")}:${min ? String(Number(min)).padStart(2, "0") : "00"}`;
}
function extractTime(norm: string): string | null {
  let m = norm.match(/a\s+las\s+(\d{1,2})(?:[:h.](\d{2}))?/);
  if (m) return padTime(m[1], m[2]);
  m = norm.match(/\b(\d{1,2}):(\d{2})\b/);
  if (m && Number(m[1]) >= 7 && Number(m[1]) <= 22) return padTime(m[1], m[2]);
  m = norm.match(/\b(\d{1,2})\s*h\b/);
  if (m) return padTime(m[1], undefined);
  if (/\by media\b/.test(norm)) { const hm = norm.match(/(\d{1,2})\s+y media/); if (hm) return padTime(hm[1], "30"); }
  return null;
}
function extractService(original: string, norm: string): string {
  const SV: { keys: string[]; label: string }[] = [
    { keys: ["corte", "barba", "peluqueria"], label: "Corte + barba" },
    { keys: ["tinte", "mechas"], label: "Color / tinte" },
    { keys: ["manicura", "pedicura", "unas"], label: "Manicura" },
    { keys: ["masaje"], label: "Masaje terapéutico" },
    { keys: ["cafe", "tostada", "desayuno"], label: "Café especial + tostada" },
    { keys: ["ramo", "flores", "claveles", "rosas"], label: "Ramo personalizado" },
    { keys: ["cesta", "fruta"], label: "Cesta de fruta" },
    { keys: ["revision", "taller", "coche", "aceite"], label: "Revisión de taller" },
    { keys: ["consulta", "dentista", "medico"], label: "Consulta" },
    { keys: ["mesa", "cena", "restaurante"], label: "Reserva de mesa" },
  ];
  for (const s of SV) if (s.keys.some((k) => norm.includes(normalize(k)))) return s.label;
  const m = original.match(/(?:cita|reserva|reservar)\s+(?:de|para)\s+([a-záéíóúñ\s]{3,30})/i);
  if (m) { const c = m[1].trim().split(/\s+(el|la|los|las)\s+/i)[0].trim(); if (c.length >= 3) return c.charAt(0).toUpperCase() + c.slice(1); }
  return "Servicio general";
}
function extractClient(original: string, norm: string): string | null {
  const m = original.match(/(?:factura(?:\s+de|\s+a)?|para|a nombre de)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)/i);
  if (m) { const n = m[1].trim().split(/\s+(el|la|de|del|a las).*/i)[0].trim(); if (n.length >= 2 && n.length <= 28) return n.charAt(0).toUpperCase() + n.slice(1); }
  if (/pepe/.test(norm)) return "Pepe";
  const m2 = original.match(/de\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/);
  if (m2 && /factura/.test(norm)) return m2[1];
  return null;
}
function extractOrderId(text: string): string | null {
  const h = text.match(/#(\d{2,4})/);
  if (h) return `#${h[1]}`;
  const m = text.match(/\b(\d{3,4})\b/);
  if (m && /pedido|entrega|repart|gps|tracking|envio|paquete/.test(normalize(text))) return `#${m[1]}`;
  return null;
}
const has = (t: string, words: string[]) => words.some((w) => t.includes(normalize(w)));

export function detectIntent(text: string, mode: StellaMode = "general"): IntentResult {
  const t = normalize(text);
  const original = text.trim();
  if (!original) return { intent: "fallback", reply: "Escríbeme qué necesitas y lo ejecuto al momento.", action: null };
  if (/^(hola|buenas|buenos dias|buenas tardes|hey|saludos|que tal)\b/.test(t) && original.length < 40) {
    return {
      intent: "greeting",
      reply: "¡Hola! Soy Stella, el asistente con IA de LOCALIS AI. Esto es una demostración con datos ficticios: Stella está en fase piloto.\n\nEn tu web podría:\n• Responder las dudas de tus clientes con la información de tu negocio\n• Recoger el contacto de quien quiere que le llames, con su consentimiento\n\nAgenda, facturas y reparto los simulo aquí como ejemplo: están en desarrollo y todavía no se contratan.\n\n¿Quieres pedir información y un presupuesto para tu web?",
      action: null,
      chips: ["📝 Pedir presupuesto para mi negocio", "¿Qué puedes hacer?", "Tienes hueco mañana?", "Genera la factura de Pepe"]
    };
  }
  if (has(t, ["presupuesto para mi negocio", "pedir presupuesto", "quiero presupuesto", "informacion y presupuesto", "auditoria", "cita zaragoza", "pedir cita", "formulario", "demo personalizada", "quiero cita", "agendar auditoria", "como gestionas citas", "como gestionas"])) {
    return {
      intent: "referral",
      reply: "¡Perfecto! En tu web, Stella recogería la solicitud de tu cliente y te la haría llegar. Para tu negocio, puedes pedir información y un presupuesto por escrito, sin compromiso:",
      action: "referral",
      chips: ["¿Qué puedes hacer?", "Tienes hueco mañana?", "Resumen de hoy"]
    };
  }
  if (has(t, ["que puedes hacer", "que sabes hacer", "ayuda", "como funciona", "que haces", "capacidades", "para que sirves"])) {
    return {
      intent: "capabilities",
      reply: "Esto es una demostración. Lo que Stella haría en tu web (fase piloto):\n\n1. ATENCIÓN AL CLIENTE — Responde dudas sobre servicios, precios y horarios con la ficha de tu negocio.\n2. CONTACTOS — Recoge nombre y teléfono con consentimiento y te avisa.\n3. DERIVACIÓN — Si no sabe algo, lo dice y pasa al cliente a tu WhatsApp.\n\nLo que ves simulado (agenda, facturas y mapa de reparto) está en desarrollo y todavía no se contrata.\n\nPrueba a escribir: 'Pedir presupuesto para mi negocio'.",
      action: null,
      chips: ["📝 Pedir presupuesto para mi negocio", "Tienes hueco mañana?", "Resumen de hoy", "¿Dónde está el pedido #104?"]
    };
  }
  if (has(t, ["cuanto cuesta", "cuanto vale", "precio", "precios", "planes", "tarifa", "cuota", "suscripcion"])) {
    return {
      intent: "pricing",
      reply: "Cada web se presupuesta por escrito según lo que necesites, sin compromiso. Todavía no publicamos precios cerrados; en la página Tarifas tienes qué incluye cada servicio y cómo se calcula. Agenda, facturación y reparto con GPS están en desarrollo y no se incluyen en ningún presupuesto.",
      action: null,
      chips: ["📝 Pedir presupuesto para mi negocio", "¿Qué puedes hacer?", "Resumen de hoy"]
    };
  }
  if (has(t, ["gracias", "genial", "perfecto", "estupendo"])) {
    return { intent: "thanks", reply: "¡De nada! Si quieres, probamos otra simulación de la demo o pides información para tu web.",
      action: null, chips: ["Reserva el jueves a las 11:00", "Resumen de hoy", "¿Dónde está el pedido #104?"] };
  }
  if (has(t, ["adios", "hasta luego", "nos vemos", "chao"])) {
    return { intent: "farewell", reply: "¡Hasta luego! Cuando quieras, pide información y un presupuesto para tu web.", action: null };
  }
  if (has(t, ["horario", "abris", "cerrado", "apertura", "cierre"])) {
    return { intent: "hours", reply: "Horario de ejemplo de esta demo: lun–sáb 09:00–20:00. En tu web, Stella respondería con el horario real de tu negocio. ¿Probamos a buscar un hueco simulado?",
      action: null, chips: ["Tienes hueco mañana?", "¿Qué citas tengo mañana?"] };
  }
  const day = extractDay(t);
  const time = extractTime(t);
  const service = extractService(original, t);
  const client = extractClient(original, t);
  const orderId = extractOrderId(original);



  if (has(t, ["factura", "facturacion", "cobro", "cobrar", "ticket", "pdf", "iva", "presupuesto", "emitir", "albaran"])) {
    const who = client ?? "Frutería Pepe";
    const total = (34 + (hashStr(who) % 60) + ((hashStr(who) % 99) / 100)).toFixed(2).replace(".", ",");
    return { intent: "invoice",
      reply: `Simulación: factura de ejemplo para ${who}. Base + IVA 21 por cien, total ${total} euros. La facturación está en desarrollo: no se genera ningún documento real. La tienes abajo como muestra.`,
      action: "invoice", slots: { client: who },
      chips: ["Resumen de hoy", "¿Dónde está el pedido #104?", "Reserva el jueves a las 11:00"] };
  }
  if (has(t, ["resumen", "caja", "ventas", "venta", "metricas", "ingresos", "beneficio", "cuanto llevo", "estadistica", "informe", "balance", "cierre"])) {
    return { intent: "summary",
      reply: "Resumen de ejemplo (datos ficticios): 1.463 euros facturados, 12 citas, 27 clientes. Es una maqueta del panel que estamos desarrollando; no son datos de nadie.",
      action: "summary",
      chips: ["Genera la factura de Pepe", "¿Qué citas tengo mañana?", "¿Dónde está el pedido #104?"] };
  }
  if (has(t, ["gps", "donde esta", "repartidor", "pedido", "tracking", "ruta", "entrega", "camino", "llegar", "ubicacion", "reparto", "conductor", "eta"]) || orderId) {
    const oid = orderId ?? "#104";
    const eta = 2 + (hashStr(oid) % 7);
    const driver = hashStr(oid) % 2 === 0 ? "Luis García" : "Marta Ruiz";
    const meters = 180 + (hashStr(oid + "m") % 900);
    return { intent: "tracking",
      reply: `Simulación de reparto: el pedido ${oid} va con ${driver} (ficticio), a ${meters} m del destino, unos ${eta} min. El seguimiento GPS real está en desarrollo; abajo ves cómo se mostraría.`,
      action: "tracking", slots: { orderId: oid },
      chips: ["¿Cuánto falta para la entrega?", "Resumen de hoy", "Genera la factura de Pepe"] };
  }
  const bookVerb = has(t, ["reserva", "reservar", "agenda", "agendar", "confirma", "confirmar", "apuntame", "quiero cita", "pido cita", "cita"]);
  const availWord = has(t, ["hueco", "huecos", "sitio", "libre", "libres", "disponibilidad", "disponible", "tienes hora", "hay hora", "que citas", "mis citas"]);
  if (bookVerb || (day && time)) {
    const dayLabel = day ? day.label : "el jueves";
    const dateObj = day ? day.date : nextDateForWeekday(4);
    const dateStr = formatDateEs(dateObj);
    const timeStr = time ?? "11:00";
    const who = client ? ` a nombre de ${client}` : "";
    return { intent: "booking",
      reply: `Simulación: así se vería una cita de ${service} ${dayLabel} ${dateStr} a las ${timeStr}${who}. No hay agenda, Google Calendar ni WhatsApp conectados: la reserva de citas está en desarrollo y no se ha guardado nada.`,
      action: "calendar",
      slots: { dayLabel, dayDate: dateStr, time: timeStr, service, client: client ?? undefined, kind: "booking" },
      chips: ["Tienes otro hueco ese día?", "Genera la factura de Pepe", "Resumen de hoy"] };
  }
  if (availWord || day || time || mode === "citas") {
    const dayLabel = day ? day.label : "mañana";
    const dateObj = day ? day.date : (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })();
    const dateStr = formatDateEs(dateObj);
    const seedBase = `${dayLabel}-${time ?? "any"}`;
    const options = time ? [time, ...pickSlots(seedBase + "x", 2)] : pickSlots(seedBase, 4);
    const opts = [...new Set(options)].sort().slice(0, 4);
    const svc = service !== "Servicio general" ? ` para ${service}` : "";
    return { intent: "availability",
      reply: `Agenda de ejemplo ${dayLabel} (${dateStr})${svc}. Huecos simulados: ${opts.join(", ")}. Dime cuál y te muestro cómo se vería; no hay una agenda real conectada.`,
      action: "calendar",
      slots: { dayLabel, dayDate: dateStr, time: time ?? undefined, service, options: opts, kind: "availability" },
      chips: [`Reserva ${dayLabel} a las ${opts[0]}`, "¿Y el viernes?", "¿Qué citas tengo mañana?"] };
  }
  if (mode === "facturacion") {
    const who = client ?? "Pepe";
    return { intent: "invoice", reply: `Modo Facturación (simulación): te muestro un borrador de ejemplo de ${who}. La facturación está en desarrollo.`, action: "invoice", slots: { client: who } };
  }
  if (mode === "gps") {
    const oid = orderId ?? "#104";
    return { intent: "tracking", reply: `Modo GPS (simulación): te muestro el seguimiento de ejemplo de ${oid}. El seguimiento real está en desarrollo.`, action: "tracking", slots: { orderId: oid } };
  }
  const keys = normalize(original).split(" ").filter((w) => w.length > 3 && !STOP.has(w)).slice(0, 4);
  if (keys.length > 0) {
    return { intent: "fallback",
      reply: `Te he entendido: mencionas ${keys.map((k) => `"${k}"`).join(", ")}. En esta demo solo simulo ejemplos de agenda, facturas y reparto. Prueba con un día y hora, un cliente o un número de pedido, o pide presupuesto para tu web.`,
      action: null, chips: ["¿Qué puedes hacer?", "Tienes hueco el viernes?", "Genera la factura de Pepe"] };
  }
  return { intent: "fallback",
    reply: "Soy Stella (demostración con datos ficticios). Simulo ejemplos de agenda, facturas, resúmenes y reparto. Prueba: tienes sitio el viernes, factura de Pepe, o dónde está el pedido 104. O pide presupuesto para tu web.",
    action: null, chips: ["¿Qué puedes hacer?", "Resumen del día", "¿Dónde está el pedido #104?"] };
}
