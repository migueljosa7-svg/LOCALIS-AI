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
    question: "¿Stella ya puede atender a mis clientes por WhatsApp?",
    answer:
      "Todavía no. Stella, nuestra asistente con IA, está en desarrollo: lo que ves en la web es una demostración con datos de ejemplo. Hoy tu web incluye un botón de WhatsApp que abre una conversación contigo. Si te interesa Stella, pídelo en la auditoría y te avisaremos cuando esté disponible.",
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
