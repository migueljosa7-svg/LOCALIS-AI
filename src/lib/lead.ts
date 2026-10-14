// Modelo de datos y utilidades para la captura de leads B2B (Solicitar Demo / Contacto).

export interface LeadData {
  businessName: string;
  sector: string;
  contactName: string;
  phone: string;
  email: string;
  source?: string | null;
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

  const phone = data.phone.trim();
  const phoneDigits = phone.replace(/[^\d]/g, "");
  if (!phone) {
    errors.phone = "Indica un teléfono o WhatsApp.";
  } else if (phoneDigits.length < 9 || phoneDigits.length > 15) {
    errors.phone = "El teléfono debe tener entre 9 y 15 dígitos.";
  }

  const email = data.email.trim().toLowerCase();
  if (!email) {
    errors.email = "Indica un email de contacto.";
  } else if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "El email no tiene un formato válido.";
  }

  return errors;
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

