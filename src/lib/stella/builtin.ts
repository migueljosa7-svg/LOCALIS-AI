// Ficha interna de LOCALIS AI (Stella en nuestra propia web). Los negocios clientes viven en la base de datos.
// Solo afirma lo que existe hoy: los precios salen de las mismas constantes que usa la web (src/lib/pricing.ts).
import { CONTACT } from "@/lib/site";
import { TARIFAS } from "@/lib/pricing";
import type { StellaBusiness } from "./ficha";

export const LOCALIS_ID = "localis";

export const LOCALIS_BUSINESS: StellaBusiness = {
  id: LOCALIS_ID,
  name: "LOCALIS AI",
  sector: "Diseño web para negocios locales",
  area: `${CONTACT.city} y ${CONTACT.region}`,
  about:
    "Diseñamos webs profesionales con presupuesto por escrito para comercios, clínicas, talleres y restaurantes: formulario de presupuesto, botón de WhatsApp, Google Maps y SEO local. También ofrecemos Stella, una asistente virtual con IA para la web de cada negocio.",
  services: [
    {
      name: TARIFAS.captacion.name,
      price: `${TARIFAS.captacion.price} € + IVA (precio de referencia)`,
      detail: `Hasta ${TARIFAS.captacion.pages} páginas. El presupuesto final se adapta a cada proyecto y se envía por escrito antes de empezar`,
    },
    {
      name: TARIFAS.pro.name,
      price: `${TARIFAS.pro.price} € + IVA (precio de referencia)`,
      detail: `Hasta ${TARIFAS.pro.pages} páginas y más contenido. Presupuesto final por escrito según el proyecto`,
    },
    { name: "Mantenimiento de la web", price: `referencia ${TARIFAS.mantenimientoPorPagina} € por página al mes + IVA`, detail: "Cambios de textos, imágenes y datos, ajustes pequeños y soporte. El importe final depende de las páginas, la complejidad y los cambios que necesites" },
    { name: "Stella, asistente virtual con IA para tu web", detail: "Está en fase piloto; el precio se presupuesta aparte según el negocio y se solicita desde el formulario o por WhatsApp" },
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
