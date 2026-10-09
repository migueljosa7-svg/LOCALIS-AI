import { FaqItem, AiMetric } from "@/types";

export const AI_METRICS: AiMetric[] = [
  { label: "Ventas IA", value: "1.245", change: 12.5, icon: "📈", positive: true },
  { label: "Nueva cuota", value: "320", change: 8.2, icon: "👥", positive: true },
  { label: "Citas automáticas", value: "84", change: 24.1, icon: "📅", positive: true },
  { label: "Entregas GPS", value: "142", change: 6.8, icon: "🚚", positive: true },
  { label: "Ahorro comisiones", value: "€452", change: 18.3, icon: "💰", positive: true, negative: false },
];

export const FAQS: FaqItem[] = [
  { id: "faq1", question: "¿La IA Stella gestiona citas en Google Calendar?", answer: "Sí. Stella integra con Google Calendar de forma nativa. Cuando un cliente te reserva una cita, la IA verifica la disponibilidad, la confirma, envía un recordatorio por WhatsApp al cliente y añade el evento al calendario del dueño.", category: "Stella AI" },
  { id: "faq2", question: "¿Por qué no pago comisiones en el módulo GPS?", answer: "LOCALIS GPS usa WebSockets y enlaces nativos de seguimiento, sin intermediarios. A diferencia de Glovo o Just Eat, no cobramos comisión por cada entrega: solo el plan base.", category: "GPS" },
  { id: "faq3", question: "¿Necesito conocimientos técnicos para instalar el módulo GPS?", answer: "No. El módulo GPS se integra en tu tienda web en menos de una hora. Proporcionamos un panel de configuración sin código y soporte técnico dedicado.", category: "GPS" },
  { id: "faq4", question: "¿Cuántos dispositivos pueden ver el mapa en vivo?", answer: "Las diferentes cuentas de negocio: el dueño, un encargado, y el cliente (vía enlace). Cada conector tiene una URL única de seguimiento.", category: "GPS" },
  { id: "faq5", question: "¿La facturación incluye IVA y total?", answer: "Sí. La facturación automática incluye IVA aplicable según la comunidad autónoma y el total. También puedes descargar el PDF en formato A4.", category: "Stella AI" },
  { id: "faq6", question: "¿Se puede conectar con el WhatsApp Cloud API?", answer: "Sí. Stella envía mensajes de confirmación, recordatorios y facturas a través del WhatsApp Cloud API, disminuyendo el abandono de pedidos.", category: "Stella AI" },
  { id: "faq7", question: "¿Qué sucede si el repartidor se queda fuera del rango?", answer: "La API de ubicación avisa automáticamente al dueño y al cliente, y Stella envía una actualización push con la nueva ubicación estimada.", category: "GPS" },
  { id: "faq8", question: "¿Puedo cancelar mi suscripción en cualquier momento?", answer: "Sí. Puedes cancelar tu suscripción desde la sección de configuración. Se aplican las consideraciones legales vigentes.", category: "Planes" },
];
