import { Business, Appointment, Invoice } from "@/types";
import type { StellaMessage } from "@/types";

export const SAMPLE_BUSINESSES: Business[] = [
  { id: "biz_001", name: "Frutería El Dorado", category: "groceries", email: "contacto@fruperia-eldorado.com", phone: "+34 912 345 678", logo: "🍎", plan: "pro", timezone: "Europe/Madrid", lastActive: "Hace 5 min" },
  { id: "biz_002", name: "Los Donaos", category: "bakery", email: "pedidos@losdonajos.com", phone: "+34 918 765 432", logo: "🥐", plan: "starter", timezone: "Europe/Madrid", lastActive: "Hace 2 min" },
  { id: "biz_003", name: "Barbería Elite", category: "barber", email: "hola@barberiaelite.com", phone: "+34 925 111 222", logo: "💈", plan: "enterprise", timezone: "Europe/Madrid", lastActive: "Hoy" },
  { id: "biz_004", name: "Floristería Rosa Mágica", category: "gourmet", email: "ventas@floristeria-rosamagic.com", phone: "+34 930 988 776", logo: "🌹", plan: "pro", timezone: "Europe/Madrid", lastActive: "Hace 20 min" },
  { id: "biz_005", name: "Taller Mecanizado", category: "service", email: "servicios@tallermecanizado.com", phone: "+34 915 222 333", logo: "🔧", plan: "starter", timezone: "Europe/Madrid", lastActive: "Hace 1 hora" },
  { id: "biz_006", name: "Arte y Gourmet", category: "food", email: "menu@arteengourmet.com", phone: "+34 922 444 555", logo: "🍔", plan: "pro", timezone: "Europe/Madrid", lastActive: "Hace 30 seg" },
];

export const SAMPLE_APPOINTMENTS: Appointment[] = [
  { id: "apt_001", businessId: "biz_002", customerName: "Ana Martínez", customerEmail: "ana.m@email.com", customerPhone: "+34 612 345 678", service: "Café especial + tostada", date: "2026-09-10", time: "11:00", duration: 60, status: "confirmed", notes: "Sin lactosa", calendarEvent: "confirmed" },
  { id: "apt_002", businessId: "biz_004", customerName: "Carlos Ruiz", customerEmail: "carlos@email.com", customerPhone: "+34 623 456 789", service: "Ramo de claveles + flor para oficina", date: "2026-09-10", time: "14:30", duration: 45, status: "pending", notes: "Entrega en local, sin recoger", calendarEvent: null },
  { id: "apt_003", businessId: "biz_001", customerName: "Beatriz Gómez", customerEmail: "betty@email.com", customerPhone: "+34 634 567 890", service: "Peso de fruta orgánica (1kg)", date: "2026-09-10", time: "09:00", duration: 10, status: "completed", notes: "Pedido de la mañana", calendarEvent: "completed" },
  { id: "apt_004", businessId: "biz_003", customerName: "Diego Fernández", customerEmail: "diego@email.com", customerPhone: "+34 698 765 432", service: "Corte + barba", date: "2026-09-10", time: "16:00", duration: 60, status: "confirmed", notes: "Cliente VIP", calendarEvent: "confirmed" },
];

export const SAMPLE_INVOICES: Invoice[] = [
  { id: "inv_001", businessId: "biz_001", customerName: "Frutería El Dorado", customerEmail: "ventas@fruperia-eldorado.com", items: [ { id: "inv1_item1", description: "Manzanas Fuji 1kg", quantity: 3, unitPrice: 4.5, total: 13.5 }, { id: "inv1_item2", description: "Peras Victoria 1kg", quantity: 2, unitPrice: 5.2, total: 10.4 }, { id: "inv1_item3", description: "Naranjas 800g", quantity: 4, unitPrice: 3.0, total: 12.0 } ], subtotal: 35.9, tax: 6.46, total: 42.36, status: "paid", date: "2026-09-08", dueDate: "2026-09-08", pdfUrl: "#" },
  { id: "inv_002", businessId: "biz_004", customerName: "Floristería Rosa Mágica", customerEmail: "compras@floristeria-rosamagic.com", items: [ { id: "inv2_item1", description: "Claveles 1dosa", quantity: 2, unitPrice: 18.0, total: 36.0 }, { id: "inv2_item2", description: "Ramos decorativos", quantity: 3, unitPrice: 12.5, total: 37.5 } ], subtotal: 73.5, tax: 13.23, total: 86.73, status: "sent", date: "2026-09-09", dueDate: "2026-09-16", pdfUrl: "#" },
];

export const SAMPLE_STELLA_MESSAGES: StellaMessage[] = [
  { id: "msg_001", role: "ai", content: "�Hola! ?? Soy Stella, tu asistente IA. �En qu� puedo ayudarte?", timestamp: "10:00:00" },
  { id: "msg_002", role: "user", content: "Hola, necesito reservar una cita para el jueves", timestamp: "10:00:15" },
  { id: "msg_003", role: "ai", content: "Entonces, �a qu� hora del jueves acordamos?", timestamp: "10:00:20", action: "calendar" },
  { id: "msg_004", role: "user", content: "Jueves a las 11:00", timestamp: "10:00:30" },
  { id: "msg_005", role: "ai", content: "? �Reserva confirmada! ??\n\n� Cita: Jueves 10 Septiembre, 11:00\n� Servicio: Caf� especial\n� Notificaci�n:true\n� �Te enviaremos un recordatorio 15 min antes!", timestamp: "10:00:45", action: "calendar" },
  { id: "msg_006", role: "ai", content: "?? WhatsApp: Hemos enviado un recordatorio a tu cliente.", timestamp: "10:00:50", action: "whatsapp" },
];
export type { StellaMessage } from "@/types";
