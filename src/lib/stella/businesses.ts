// ════════════════════════════════════════════════════════════════
//  Stella · ficha de cada negocio
//
//  Para instalar Stella a un cliente nuevo solo hay que rellenar UNA ficha:
//    1. Datos del negocio (nombre, sector, zona)
//    2. Servicios y precios
//    3. Contacto: WhatsApp, teléfono, email de avisos y horario
//    4. Preguntas frecuentes y webs donde se instala (domains)
//  y pegar en su web:
//    <script src="https://<nuestra-web>/stella.js" data-negocio="<id>" defer></script>
//
//  Regla: Stella solo responde con lo que hay en la ficha. Nada inventado.
// ════════════════════════════════════════════════════════════════
import { FAQS } from "@/lib/faqs";
import { PLANS } from "@/lib/plans";
import { PRICING } from "@/components/configurator/studioModel";
import { CONTACT } from "@/lib/site";

export interface StellaBusiness {
  id: string;
  name: string;
  sector: string;
  area: string;
  /** Qué hace el negocio, en 1–3 frases. */
  about: string;
  services: { name: string; price?: string; detail?: string }[];
  /** Horario de atención; si no se conoce, se omite (Stella no lo inventa). */
  hours?: string;
  whatsapp: string; // solo dígitos con prefijo, p. ej. 34640809238
  phone?: string;
  /** Dónde llegan los avisos de nuevos contactos. */
  notifyEmail?: string;
  faqs: { q: string; a: string }[];
  /** Cosas que Stella NO debe ofrecer como disponibles. */
  notAvailable?: string[];
  privacyUrl: string;
  /** Webs donde se puede instalar el widget (orígenes https://…). */
  domains: string[];
  greeting: string;
}

const LOCALIS: StellaBusiness = {
  id: "localis",
  name: "LOCALIS AI",
  sector: "Diseño web para negocios locales",
  area: `${CONTACT.city} y ${CONTACT.region}`,
  about:
    "Diseñamos webs profesionales a precio cerrado para comercios, clínicas, talleres y restaurantes: formulario de presupuesto, botón de WhatsApp, Google Maps y SEO local.",
  services: [
    {
      name: "Web Esencial (pago único)",
      price: `desde ${PRICING.base} €, con un tope cerrado de ${PRICING.cap} €`,
      detail: `Incluye hasta ${PRICING.includedPages} páginas; cada página extra +${PRICING.extraPage} €. El precio exacto se ve en el estudio «Diseña tu web».`,
    },
    ...PLANS.map((p) => ({
      name: `Plan mensual ${p.name}`,
      price: `${p.priceMonth} €/mes o ${p.priceYear} €/año`,
      detail: p.features.filter((f) => !/en desarrollo/i.test(f)).join("; ") || undefined,
    })),
    { name: "Auditoría gratuita", price: "gratis", detail: "Revisamos tu web o tu ficha de Google y te decimos qué mejorar, sin compromiso." },
  ],
  whatsapp: "34640809238",
  phone: CONTACT.phoneDisplay,
  faqs: FAQS.map((f) => ({ q: f.question, a: f.answer })),
  notAvailable: [
    "citas online con Google Calendar",
    "WhatsApp automático",
    "facturación",
    "reparto con GPS",
    "catálogo con pedidos",
    "panel de control para clientes",
  ],
  privacyUrl: "/privacy",
  domains: [],
  greeting: "¡Hola! Soy Stella, la asistente virtual de LOCALIS AI. ¿En qué puedo ayudarte con la web de tu negocio?",
};

const BUSINESSES: Record<string, StellaBusiness> = {
  [LOCALIS.id]: LOCALIS,
  // Nuevos clientes: añadir aquí su ficha con el mismo formato.
};

export function getBusiness(id: string | null | undefined): StellaBusiness | null {
  if (!id || !/^[a-z0-9-]{2,40}$/.test(id)) return null;
  return BUSINESSES[id] ?? null;
}

/** Stella solo se activa si hay clave de la API de Claude configurada en el servidor. */
export function stellaEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
