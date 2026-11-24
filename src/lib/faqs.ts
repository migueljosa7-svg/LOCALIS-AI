import type { FaqItem } from "@/types";

// Preguntas frecuentes: se muestran en la sección #faq y alimentan el JSON-LD FAQPage
// (Google exige que el contenido marcado sea visible en la página).
// Regla: solo se describe como disponible lo que ya funciona hoy.
export const FAQS: FaqItem[] = [
  {
    id: "faq0",
    question: "¿Qué incluye hoy mi web?",
    answer:
      "Una web profesional adaptada al móvil con tus servicios, formulario de contacto o presupuesto, botón de WhatsApp, enlace a Google Maps y SEO local básico, con la imagen de tu negocio. El precio es cerrado y lo ves en el estudio «Diseña tu web» antes de hablar con nosotros.",
    category: "Diseño web",
  },
  {
    id: "faq1",
    question: "¿Necesito saber de tecnología?",
    answer:
      "No. Nosotros diseñamos y publicamos la web y te explicamos cómo recibir los contactos. Tienes soporte local en Zaragoza.",
    category: "General",
  },
  {
    id: "faq2",
    question: "¿Qué hace Stella hoy?",
    answer:
      "Stella es una asistente con IA que se instala en la web de tu negocio con una línea de código. Responde al momento las dudas de tus clientes con la información que tú le das (servicios, precios, horarios y preguntas frecuentes), te dice cuándo no sabe algo y ofrece tu WhatsApp. Si la persona quiere, deja su nombre y teléfono con su consentimiento y te avisamos. Todavía NO atiende WhatsApp por su cuenta, no agenda citas ni factura: son módulos en desarrollo. Pídela en la auditoría o por WhatsApp; no se activa ni se cobra nada sin tu confirmación.",
    category: "Stella IA",
  },
  {
    id: "faq3",
    question: "¿Puedo tener citas online o seguimiento de repartos?",
    answer:
      "Son módulos en desarrollo (citas con Google Calendar, catálogo con pedidos y reparto con GPS sin comisiones). Las demostraciones de la web muestran cómo funcionarán. No los cobramos hasta que estén terminados y probados.",
    category: "Plataforma",
  },
  {
    id: "faq4",
    question: "¿Cuánto tarda en estar lista mi web?",
    answer:
      "Entre 5 y 10 días laborables desde que tenemos tus contenidos (logo, fotos, servicios y precios). Antes te hacemos una auditoría gratuita para proponerte exactamente lo que necesitas.",
    category: "Diseño web",
  },
  {
    id: "faq5",
    question: "¿Puedo cancelar el mantenimiento cuando quiera?",
    answer: "Sí. Puedes cambiar de plan o cancelar el mantenimiento en cualquier momento escribiéndonos.",
    category: "Planes",
  },
];
