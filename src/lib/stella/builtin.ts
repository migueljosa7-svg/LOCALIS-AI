// Ficha interna de LOCALIS AI (Stella en nuestra propia web). Los negocios clientes viven en la base de datos.
// Solo afirma lo que existe hoy: los precios salen de las mismas constantes que usa el configurador.
import { CONTACT } from "@/lib/site";
import { PRICING } from "@/components/configurator/studioModel";
import type { StellaBusiness } from "./ficha";

export const LOCALIS_ID = "localis";

export const LOCALIS_BUSINESS: StellaBusiness = {
  id: LOCALIS_ID,
  name: "LOCALIS AI",
  sector: "Diseño web para negocios locales",
  area: `${CONTACT.city} y ${CONTACT.region}`,
  about:
    "Diseñamos webs profesionales a precio cerrado para comercios, clínicas, talleres y restaurantes: formulario de presupuesto, botón de WhatsApp, Google Maps y SEO local. También ofrecemos Stella, una asistente virtual con IA para la web de cada negocio.",
  services: [
    {
      name: "Web Esencial (pago único)",
      price: `desde ${PRICING.base} €, con un tope cerrado de ${PRICING.cap} €`,
      detail: `Incluye hasta ${PRICING.includedPages} páginas; cada página extra +${PRICING.extraPage} €. El precio exacto se calcula en el estudio «Diseña tu web»`,
    },
    { name: "Auditoría gratuita", price: "gratis", detail: "Revisamos tu web o tu ficha de Google y te decimos qué mejorar, sin compromiso" },
    { name: "Stella, asistente virtual con IA para tu web", detail: "El precio se presupuesta según el negocio; se solicita desde el formulario o por WhatsApp" },
  ],
  faqs: [
    { q: "¿Cómo pido presupuesto?", a: "Puedes diseñar tu web en el estudio «Diseña tu web» y enviarnos la solicitud, o escribirnos por WhatsApp." },
    { q: "¿Dónde estáis?", a: `Trabajamos desde ${CONTACT.city} (${CONTACT.region}) y atendemos negocios de la zona.` },
  ],
  whatsapp: "34640809238",
  phone: CONTACT.phoneDisplay,
  greeting: "¡Hola! Soy Stella, la asistente virtual con IA de LOCALIS AI. ¿En qué puedo ayudarte con la web de tu negocio?",
  notAvailable: ["citas online con Google Calendar", "WhatsApp automático", "facturación", "reparto con GPS", "catálogo con pedidos", "panel de control para clientes"],
  privacyUrl: "/privacy",
  domains: [],
  active: true,
  dailyBudgetUsd: 1,
  monthlyBudgetUsd: 5,
  builtin: true,
};
