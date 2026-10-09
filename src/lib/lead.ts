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
  if (!data.sector.trim()) errors.sector = "Selecciona un sector.";
  if (!data.contactName.trim()) errors.contactName = "Indica un nombre de contacto.";

  const phone = data.phone.trim();
  const phoneDigits = phone.replace(/[^\d]/g, "");
  if (!phone) {
    errors.phone = "Indica un teléfono o WhatsApp.";
  } else if (phoneDigits.length < 9) {
    errors.phone = "El teléfono debe tener al menos 9 dígitos.";
  }

  const email = data.email.trim();
  if (!email) {
    errors.email = "Indica un email de contacto.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "El email no tiene un formato válido.";
  }

  return errors;
}

/**
 * Envía el lead. Actualmente no hay backend conectado, por lo que se simula la
 * petición y se persiste localmente (localStorage) para no perder la solicitud.
 * Sustituye el cuerpo por una llamada real a tu CRM / endpoint cuando exista.
 */
export async function submitLead(data: LeadData): Promise<{ ok: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 1100));

  try {
    if (typeof window !== "undefined") {
      const key = "localis-leads";
      const existing = JSON.parse(window.localStorage.getItem(key) || "[]");
      existing.push({ ...data, at: new Date().toISOString() });
      window.localStorage.setItem(key, JSON.stringify(existing));
    }
  } catch {
    // localStorage no disponible (modo privado, etc.): ignoramos de forma segura.
  }

  return { ok: true };
}
