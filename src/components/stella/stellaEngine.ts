// ============================================================
//  Stella AI — Motor NLU v2 (sin dependencias)
//  Normalizacion ES + entidades (dia/hora/servicio/cliente/pedido)
//  + respuestas dinamicas que reutilizan lo escrito por el usuario.
// ============================================================

export type StellaMode = "citas" | "facturacion" | "gps" | "general";

export type IntentId =
  | "greeting" | "capabilities" | "pricing" | "availability"
  | "booking" | "invoice" | "summary" | "tracking"
  | "hours" | "thanks" | "farewell" | "fallback";

export type StellaAction = "calendar" | "invoice" | "summary" | "tracking" | null;

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
    return { intent: "greeting",
      reply: "¡Hola! Soy Stella, tu operativa con IA. Hoy puedo:\n• Buscar huecos y reservar citas con Calendar\n• Generar facturas con IVA y PDF\n• Darte el resumen de ventas del día\n• Rastrear tus repartos por GPS en vivo\n\nDime, ¿empezamos por una cita, una factura o un pedido?",
      action: null,
      chips: ["¿Qué puedes hacer?", "Tienes hueco el viernes?", "Genera la factura de Pepe", "¿Dónde está el pedido #104?"] };
  }
  if (has(t, ["que puedes hacer", "que sabes hacer", "ayuda", "como funciona", "que haces", "capacidades", "para que sirves"])) {
    return { intent: "capabilities",
      reply: "Puedo operar tu negocio de punta a punta:\n\nCITAS — pregúntame huecos o pide reserva y sincronizo Calendar + WhatsApp.\nFACTURACIÓN — dime cliente y preparo desglose con IVA, PDF y envío.\nRESUMEN — dime resumen de hoy y te doy caja, citas y ticket medio.\nGPS — dime número de pedido y abro el mapa en vivo con ETA.\n\nPrueba: quiero reservar el jueves a las 11.",
      action: null,
      chips: ["Tienes hueco mañana?", "Reserva el jueves a las 11:00", "Resumen de hoy", "¿Dónde está el pedido #104?"] };
  }
  if (has(t, ["cuanto cuesta", "cuanto vale", "precio", "precios", "planes", "tarifa", "cuota", "suscripcion"])) {
    return { intent: "pricing",
      reply: "Precios sin comisiones:\n• Starter 29 €/mes: agenda + Stella básica.\n• Pro 49 €/mes: citas + facturación + GPS en vivo.\n• Enterprise a medida: multi-local y API.\n\nCon 300 pedidos de 18 € al mes te ahorras unos 1.570 € frente al 30% de Glovo/Uber.",
      action: null, chips: ["¿Qué puedes hacer?", "Genera la factura de Pepe", "Resumen de hoy"] };
  }
  if (has(t, ["gracias", "genial", "perfecto", "estupendo"])) {
    return { intent: "thanks", reply: "¡De nada! Para eso estoy. Sigo con lo siguiente: otro hueco, una factura o un reparto.",
      action: null, chips: ["Reserva el jueves a las 11:00", "Resumen de hoy", "¿Dónde está el pedido #104?"] };
  }
  if (has(t, ["adios", "hasta luego", "nos vemos", "chao"])) {
    return { intent: "farewell", reply: "¡Hasta luego! Dejo agenda, facturas y GPS sincronizados. Dime resumen de hoy cuando vuelvas.", action: null };
  }
  if (has(t, ["horario", "abris", "cerrado", "apertura", "cierre"])) {
    return { intent: "hours", reply: "Horario demo lun–sáb 09:00–20:00. Stella atiende 24/7: si pides fuera de hora te propongo el hueco más cercano. ¿Buscamos uno?",
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
      reply: `He preparado la factura de ${who}. Base + IVA 21 por cien. Total ${total} euros. Vence en 7 días. PDF listo y borrador sincronizado. La tienes abajo: ábrela para descargar o enviarla. ¿La envío ya a ${who}?`,
      action: "invoice", slots: { client: who },
      chips: ["Resumen de hoy", "¿Dónde está el pedido #104?", "Reserva el jueves a las 11:00"] };
  }
  if (has(t, ["resumen", "caja", "ventas", "venta", "metricas", "ingresos", "beneficio", "cuanto llevo", "estadistica", "informe", "balance", "cierre"])) {
    return { intent: "summary",
      reply: "Pulso de hoy: 1.463 euros facturados (+18 por cien vs ayer), 12 citas, 27 clientes. Ticket medio 54,2 euros. 2 citas pendientes. He abierto el panel con gráfico de 7 días y detalle. ¿Confirmo las pendientes o genero las facturas?",
      action: "summary",
      chips: ["Genera la factura de Pepe", "¿Qué citas tengo mañana?", "¿Dónde está el pedido #104?"] };
  }
  if (has(t, ["gps", "donde esta", "repartidor", "pedido", "tracking", "ruta", "entrega", "camino", "llegar", "ubicacion", "reparto", "conductor", "eta"]) || orderId) {
    const oid = orderId ?? "#104";
    const eta = 2 + (hashStr(oid) % 7);
    const driver = hashStr(oid) % 2 === 0 ? "Luis García" : "Marta Ruiz";
    const meters = 180 + (hashStr(oid + "m") % 900);
    return { intent: "tracking",
      reply: `Localizado. El pedido ${oid} va con ${driver}, a ${meters} m del destino. ETA unos ${eta} min. He abierto el mapa en vivo: ruta, distancia y botón de WhatsApp. ¿Te aviso cuando esté a 1 minuto?`,
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
      reply: `Listo. He reservado ${service} ${dayLabel} ${dateStr} a las ${timeStr}${who}. Sincronizado con Google Calendar. WhatsApp enviado. Recordatorio 15 min antes. Tienes la tarjeta abajo con todos los datos. ¿Añado otra o genero su factura?`,
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
      reply: `He revisado la agenda ${dayLabel} (${dateStr})${svc}. Huecos libres: ${opts.join(", ")}. Dime cuál te viene bien, por ejemplo reserva ${dayLabel} a las ${opts[1] ?? opts[0]}, y lo confirmo con Calendar + WhatsApp.`,
      action: "calendar",
      slots: { dayLabel, dayDate: dateStr, time: time ?? undefined, service, options: opts, kind: "availability" },
      chips: [`Reserva ${dayLabel} a las ${opts[0]}`, "¿Y el viernes?", "¿Qué citas tengo mañana?"] };
  }
  if (mode === "facturacion") {
    const who = client ?? "Pepe";
    return { intent: "invoice", reply: `Modo Facturación: preparo el borrador de ${who} con IVA y PDF. Si me das importes los meto en líneas al momento.`, action: "invoice", slots: { client: who } };
  }
  if (mode === "gps") {
    const oid = orderId ?? "#104";
    return { intent: "tracking", reply: `Modo GPS: abro el seguimiento de ${oid} con posición en vivo y ETA. Si es otro dime su número y cambio de ruta.`, action: "tracking", slots: { orderId: oid } };
  }
  const keys = normalize(original).split(" ").filter((w) => w.length > 3 && !STOP.has(w)).slice(0, 4);
  if (keys.length > 0) {
    return { intent: "fallback",
      reply: `Te he entendido: mencionas ${keys.map((k) => `"${k}"`).join(", ")}. Lo registro. Conviértelo en acción: dime día y hora para cita, cliente para factura, o número para reparto. ¿Con cuál seguimos?`,
      action: null, chips: ["¿Qué puedes hacer?", "Tienes hueco el viernes?", "Genera la factura de Pepe"] };
  }
  return { intent: "fallback",
    reply: "Soy Stella. Trabajo con citas, facturas, resúmenes y GPS. Prueba: tienes sitio el viernes, reserva el jueves a las 11, factura de Pepe, o dónde está el pedido 104.",
    action: null, chips: ["¿Qué puedes hacer?", "Resumen del día", "¿Dónde está el pedido #104?"] };
}
