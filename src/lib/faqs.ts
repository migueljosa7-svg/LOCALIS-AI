import type { FaqItem } from "@/types";

// Preguntas frecuentes: se muestran en la sección #faq y alimentan el JSON-LD FAQPage
// (Google exige que el contenido marcado sea visible en la página).
export const FAQS: FaqItem[] = [
  {
    id: "faq1",
    question: "¿Necesito saber de tecnología para usar LOCALIS AI?",
    answer:
      "No. Nosotros diseñamos la web, configuramos a Stella con la información de tu negocio y conectamos tu agenda y tu WhatsApp. Tú solo usas un panel sencillo desde el móvil o el ordenador, y tienes soporte local en Zaragoza.",
    category: "General",
  },
  {
    id: "faq2",
    question: "¿Cómo atiende Stella a mis clientes por WhatsApp?",
    answer:
      "Stella se conecta a tu número de WhatsApp Business a través de la API oficial de WhatsApp Cloud. Responde dudas sobre horarios, precios y servicios, propone huecos libres, confirma citas y envía recordatorios. Si una conversación necesita a una persona, te la pasa a ti.",
    category: "Stella IA",
  },
  {
    id: "faq3",
    question: "¿Stella gestiona las citas en Google Calendar?",
    answer:
      "Sí. Cuando un cliente pide cita, Stella comprueba la disponibilidad real de tu calendario, crea el evento, envía la confirmación por WhatsApp y programa un recordatorio para reducir las ausencias.",
    category: "Stella IA",
  },
  {
    id: "faq4",
    question: "¿Por qué no pago comisiones por cada reparto?",
    answer:
      "Porque los repartos los hacen tus propios repartidores con el módulo LOCALIS GPS. A diferencia de Glovo, Uber Eats o Just Eat, que cobran entre un 20 % y un 30 % por pedido, tú solo pagas la tarifa plana de tu plan.",
    category: "GPS",
  },
  {
    id: "faq5",
    question: "¿Cuánto tarda en estar lista mi web?",
    answer:
      "Entre 5 y 10 días laborables desde que tenemos tus contenidos (logo, fotos, servicios y precios). Antes te hacemos una auditoría gratuita para proponerte exactamente lo que necesitas.",
    category: "Diseño web",
  },
  {
    id: "faq6",
    question: "¿Las facturas incluyen IVA?",
    answer:
      "Sí. Las facturas se generan con su IVA correspondiente, numeración correlativa y descarga en PDF, y Stella puede enviarlas por email o WhatsApp a tu cliente.",
    category: "Stella IA",
  },
  {
    id: "faq7",
    question: "¿Puedo cancelar cuando quiera?",
    answer: "Sí. Puedes cambiar de plan o cancelar tu suscripción en cualquier momento desde tu panel o escribiéndonos.",
    category: "Planes",
  },
  {
    id: "faq8",
    question: "¿Cómo seguirán mis clientes su pedido?",
    answer:
      "Cada pedido genera un enlace de seguimiento que se envía por WhatsApp. Tu cliente ve en el mapa dónde está el repartidor y la hora estimada de llegada, sin descargar ninguna app.",
    category: "GPS",
  },
];
