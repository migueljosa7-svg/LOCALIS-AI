// Ficha de un negocio: tipo, lectura/escritura de los campos de texto del panel y validación.
// Funciones puras: se usan igual en el panel /admin y en los tests.
import { parseDomains } from "./domains";

export interface StellaBusiness {
  id: string;
  name: string;
  sector: string;
  area: string;
  about: string;
  services: { name: string; price?: string; detail?: string }[];
  faqs: { q: string; a: string }[];
  hours?: string;
  /** Solo dígitos con prefijo, p. ej. 34640809238 */
  whatsapp: string;
  phone?: string;
  /** Dónde llegan los avisos de nuevos contactos (además de LEAD_INBOX_EMAIL). */
  notifyEmail?: string;
  greeting: string;
  notAvailable: string[];
  /** Política de privacidad del NEGOCIO (responsable del tratamiento de los datos que deja el visitante). */
  privacyUrl: string;
  /** Hosts donde se puede instalar el widget (ejemplo.com). */
  domains: string[];
  active: boolean;
  dailyBudgetUsd: number;
  monthlyBudgetUsd: number;
  notes?: string;
  /** Ficha interna de LOCALIS (no está en la base de datos). */
  builtin?: boolean;
}

export const ID_RE = /^[a-z0-9-]{2,40}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── Servicios y preguntas frecuentes como texto editable ──────────
/** Una línea por servicio: «Corte de pelo | 15 € | Incluye lavado». Precio y detalle son opcionales. */
export function parseServices(raw: string): { items: StellaBusiness["services"]; errors: string[] } {
  const items: StellaBusiness["services"] = [];
  const errors: string[] = [];
  raw.split("\n").map((l) => l.trim()).filter(Boolean).forEach((line, n) => {
    const [name, price, ...rest] = line.split("|").map((p) => p.trim());
    if (!name) return errors.push(`Servicio ${n + 1}: falta el nombre.`);
    if (name.length > 80) return errors.push(`Servicio «${name.slice(0, 20)}…»: nombre demasiado largo (máx. 80).`);
    const detail = rest.join(" | ");
    if ((price?.length ?? 0) > 60) return errors.push(`Servicio «${name}»: precio demasiado largo (máx. 60).`);
    if (detail.length > 240) return errors.push(`Servicio «${name}»: detalle demasiado largo (máx. 240).`);
    items.push({ name, ...(price ? { price } : {}), ...(detail ? { detail } : {}) });
  });
  if (items.length > 40) errors.push("Máximo 40 servicios.");
  return { items, errors };
}
export const servicesToText = (s: StellaBusiness["services"]): string => s.map((x) => [x.name, x.price ?? "", x.detail ?? ""].join(" | ").replace(/( \| )+$/, "")).join("\n");

/** Una línea por pregunta: «¿Aceptáis tarjeta? | Sí, Visa y Mastercard». */
export function parseFaqs(raw: string): { items: StellaBusiness["faqs"]; errors: string[] } {
  const items: StellaBusiness["faqs"] = [];
  const errors: string[] = [];
  raw.split("\n").map((l) => l.trim()).filter(Boolean).forEach((line, n) => {
    const i = line.indexOf("|");
    const q = i < 0 ? "" : line.slice(0, i).trim();
    const a = i < 0 ? "" : line.slice(i + 1).trim();
    if (!q || !a) return errors.push(`Pregunta ${n + 1}: usa el formato «Pregunta | Respuesta».`);
    if (q.length > 160) return errors.push(`Pregunta ${n + 1}: demasiado larga (máx. 160).`);
    if (a.length > 600) return errors.push(`Pregunta ${n + 1}: respuesta demasiado larga (máx. 600).`);
    items.push({ q, a });
  });
  if (items.length > 40) errors.push("Máximo 40 preguntas.");
  return { items, errors };
}
export const faqsToText = (f: StellaBusiness["faqs"]): string => f.map((x) => `${x.q} | ${x.a}`).join("\n");

// ── Validación del formulario completo del panel ──────────────────
export interface FichaInput {
  id: string;
  name: string;
  sector: string;
  area: string;
  about: string;
  services: string;
  faqs: string;
  hours: string;
  whatsapp: string;
  phone: string;
  notifyEmail: string;
  greeting: string;
  notAvailable: string;
  privacyUrl: string;
  domains: string;
  dailyBudgetUsd: string;
  monthlyBudgetUsd: string;
  notes: string;
}

export function buildFicha(input: FichaInput): { ok: true; value: Omit<StellaBusiness, "active" | "builtin"> } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const id = input.id.trim().toLowerCase();
  if (!ID_RE.test(id)) errors.push("El identificador solo admite minúsculas, números y guiones (2–40 caracteres). Ej.: peluqueria-ana.");
  const name = input.name.trim();
  if (name.length < 2 || name.length > 120) errors.push("El nombre del negocio debe tener entre 2 y 120 caracteres.");
  const about = input.about.trim();
  if (about.length > 1200) errors.push("«Qué hace el negocio» admite hasta 1200 caracteres.");

  const services = parseServices(input.services);
  const faqs = parseFaqs(input.faqs);
  errors.push(...services.errors, ...faqs.errors);

  const whatsapp = input.whatsapp.replace(/[\s+()-]/g, "");
  if (whatsapp && !/^\d{9,15}$/.test(whatsapp)) errors.push("WhatsApp: solo dígitos con prefijo de país, p. ej. 34640809238.");
  const notifyEmail = input.notifyEmail.trim().toLowerCase();
  if (notifyEmail && !EMAIL_RE.test(notifyEmail)) errors.push("El email de avisos no es válido.");
  const privacyUrl = input.privacyUrl.trim();
  if (privacyUrl) {
    try {
      if (new URL(privacyUrl).protocol !== "https:") errors.push("La política de privacidad debe empezar por https://");
    } catch {
      errors.push("La URL de la política de privacidad no es válida.");
    }
  }
  const dom = parseDomains(input.domains);
  if (dom.rejected.length) errors.push(`Dominios no válidos: ${dom.rejected.join(", ")}. Escribe solo el dominio, p. ej. ejemplo.com.`);

  const daily = Number(input.dailyBudgetUsd.replace(",", "."));
  const monthly = Number(input.monthlyBudgetUsd.replace(",", "."));
  if (!Number.isFinite(daily) || daily < 0 || daily > 1000) errors.push("Presupuesto diario: número entre 0 y 1000 (USD).");
  if (!Number.isFinite(monthly) || monthly < 0 || monthly > 10000) errors.push("Presupuesto mensual: número entre 0 y 10000 (USD).");

  const sizeEstimate = about.length + JSON.stringify(services.items).length + JSON.stringify(faqs.items).length;
  if (sizeEstimate > 14000) errors.push("La ficha es demasiado larga: Stella necesita información breve y clara (reduce servicios o preguntas).");

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      id,
      name,
      sector: input.sector.trim().slice(0, 120),
      area: input.area.trim().slice(0, 120),
      about,
      services: services.items,
      faqs: faqs.items,
      hours: input.hours.trim().slice(0, 300) || undefined,
      whatsapp,
      phone: input.phone.trim().slice(0, 40) || undefined,
      notifyEmail: notifyEmail || undefined,
      greeting: input.greeting.trim().slice(0, 400) || defaultGreeting(name),
      notAvailable: input.notAvailable.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 20),
      privacyUrl,
      domains: dom.hosts,
      dailyBudgetUsd: daily,
      monthlyBudgetUsd: monthly,
      notes: input.notes.trim().slice(0, 4000) || undefined,
    },
  };
}

export const defaultGreeting = (name: string): string => `¡Hola! Soy Stella, la asistente virtual con IA de ${name}. ¿En qué puedo ayudarte?`;

/** Requisitos para poder activar un negocio. Devuelve lo que falta (vacío = listo). */
export function activationChecklist(b: Pick<StellaBusiness, "name" | "about" | "services" | "whatsapp" | "domains" | "privacyUrl">): string[] {
  const missing: string[] = [];
  if (b.about.trim().length < 20) missing.push("Describe qué hace el negocio (mín. 20 caracteres).");
  if (b.services.length === 0) missing.push("Añade al menos un servicio.");
  if (!b.whatsapp) missing.push("Indica el WhatsApp del negocio (es la salida cuando Stella no sabe algo).");
  if (b.domains.length === 0) missing.push("Autoriza al menos un dominio.");
  if (!b.privacyUrl) missing.push("Indica la política de privacidad del negocio (necesaria para el consentimiento).");
  return missing;
}
