// Modelo de datos y utilidades para la captura de leads B2B (Solicitar Demo / Contacto).

export interface LeadData {
  businessName: string;
  sector: string;
  contactName: string;
  phone: string;
  email: string;
  source?: string | null;
  /** Resumen de la configuración elegida en el configurador (opcional). */
  details?: string | null;
  /** Prompt técnico generado por el estudio visual (solo llega al email interno). */
  prompt?: string | null;
}

export interface LeadErrors {
  businessName?: string;
  sector?: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

// Sectores ofrecidos en el formulario (coinciden con los verticales del producto).
export const LEAD_SECTORS = [
  "Frutería / Alimentación",
  "Panadería / Repostería",
  "Carnicería / Charcutería",
  "Restauración / Delivery",
  "Floristería / Gourmet",
  "Peluquería / Estética",
  "Taller / Servicios a domicilio",
  "Clínica / Salud",
  "Comercio minorista",
  "Ayuntamiento / Empresa",
  "Otro",
] as const;

export function validateLead(data: LeadData): LeadErrors {
  const errors: LeadErrors = {};
  if (!data.businessName.trim()) errors.businessName = "Indica el nombre de tu negocio.";
  else if (data.businessName.trim().length < 2) errors.businessName = "El nombre es demasiado corto.";
  if (!data.sector.trim()) errors.sector = "Selecciona un sector.";
  if (!data.contactName.trim()) errors.contactName = "Indica un nombre de contacto.";
  else if (data.contactName.trim().length < 2) errors.contactName = "El nombre es demasiado corto.";

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  return errors;
}

/**
 * Teléfono: acepta móviles/fijos españoles (9 cifras empezando por 6, 7, 8 o 9,
 * con o sin +34/0034) e internacionales con prefijo (+XX…, 8–15 cifras).
 * Devuelve un mensaje en español claro, o null si es válido.
 */
export function validatePhone(raw: string): string | null {
  const phone = raw.trim();
  if (!phone) return "Indica un teléfono o WhatsApp para poder llamarte.";
  if (/[^\d\s+().-]/.test(phone)) return "El teléfono solo puede llevar números (y el prefijo +).";
  let digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = "+" + digits.slice(2);
  if (digits.startsWith("+34")) digits = digits.slice(3);
  else if (digits.startsWith("+")) {
    const intl = digits.slice(1);
    return intl.length >= 8 && intl.length <= 15 ? null : "Revisa el número internacional: debe tener entre 8 y 15 cifras tras el prefijo.";
  }
  if (digits.includes("+")) return "El prefijo + solo puede ir al principio.";
  if (digits.length !== 9) return `Un teléfono español tiene 9 cifras (has escrito ${digits.length}).`;
  if (!/^[6789]/.test(digits)) return "Un teléfono español empieza por 6, 7, 8 o 9. Si es extranjero, añade el prefijo (p. ej. +33).";
  return null;
}

// Erratas frecuentes en dominios de email → sugerencia amable.
const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com",
  "gmail.co": "gmail.com", "gmail.con": "gmail.com", "gmail.cmo": "gmail.com", "gmail.es": "gmail.com",
  "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmail.con": "hotmail.com", "hotmail.co": "hotmail.com",
  "hotmai.es": "hotmail.es", "hotmial.es": "hotmail.es",
  "outlok.com": "outlook.com", "outlook.con": "outlook.com", "outlok.es": "outlook.es",
  "yahoo.con": "yahoo.com", "yaho.com": "yahoo.com", "yahoo.co": "yahoo.com",
  "icloud.con": "icloud.com", "iclod.com": "icloud.com",
};

export function validateEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email) return "Indica un email para enviarte la propuesta.";
  if (/\s/.test(email)) return "El email no puede llevar espacios.";
  if (!email.includes("@")) return "Al email le falta la @ (ej. nombre@negocio.com).";
  if (email.length > 160 || email.includes("..") || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
    return "Ese email no parece válido. Revísalo (ej. nombre@negocio.com).";
  }
  const [user, domain] = email.split("@");
  const fix = DOMAIN_TYPOS[domain];
  if (fix) return `¿Quisiste decir ${user}@${fix}?`;
  return null;
}

const STORAGE_KEY = "localis-leads";

function persistLocal(data: LeadData): void {
  try {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const existing = raw ? (JSON.parse(raw) as unknown) : [];
    const list = Array.isArray(existing) ? existing : [];
    list.push({ ...data, at: new Date().toISOString() });
    // Evita que el localStorage crezca sin límite (máx. 50 leads).
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-50)));
  } catch {
    // localStorage no disponible (modo privado, etc.): ignoramos de forma segura.
  }
}

/**
 * Envía el lead al endpoint propio `/api/lead` (validación servidor + rate-limit).
 * Nunca rompe la UX: si la red o el servidor fallan, persiste en local y devuelve ok
 * para mostrar el estado de éxito sin recargar la página.
 */
export async function submitLead(data: LeadData): Promise<{ ok: boolean; degraded?: boolean }> {
  const payload = {
    businessName: data.businessName.trim(),
    sector: data.sector.trim(),
    contactName: data.contactName.trim(),
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    source: data.source ?? null,
    details: data.details ? data.details.trim().slice(0, 1200) : null,
    prompt: data.prompt ? data.prompt.trim().slice(0, 8000) : null,
  };

  try {
    const ctrl = new AbortController();
    const timeout = window.setTimeout(() => ctrl.abort(), 9000);
    let res: Response;
    try {
      res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
    } finally {
      window.clearTimeout(timeout);
    }
    if (!res.ok) {
      // El servidor valida; si es 4xx mostramos éxito degradado en lugar de pantalla de error.
      persistLocal(payload);
      return { ok: true, degraded: true };
    }
    persistLocal(payload);
    return { ok: true };
  } catch {
    // Sin red / timeout / API caída: no perdemos la solicitud.
    persistLocal(payload);
    return { ok: true, degraded: true };
  }
}

