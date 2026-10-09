import { SectorMeta } from "@/types";

export const SECTORS: SectorMeta[] = [
  { id: "groceries", label: "Fruterías y Comercio Local", icon: "🍏", color: "#F97316", benefits: [ "Reserva de pedidos online 24/7", "Confirmación automática por WhatsApp", "Nacionalización de inventario por IA", "Emisión de recibos e impuestos simplificados" ] },
  { id: "gourmet", label: "Floristerías y Gourmet", icon: "🌹", color: "#EC4899", benefits: [ "Seguimiento de pedidos de flores", "Presupuestos automáticos", "Enlace de rastreo en tiempo real", "Recordatorios de entrega por WhatsApp" ] },
  { id: "bakery", label: "Panaderías y Reposteros", icon: "🥐", color: "#F59E0B", benefits: [ "Sincronización de producción diaria", "Automatización de pedidos por teléfono", "Envíos programados 24/7", "Mantenimiento de la cadena de frío" ] },
  { id: "butchery", label: "Carnicerías", icon: "🥩", color: "#EF4444", benefits: [ "Control de partes frescas por hora", "Facturación electrónica integrada", "Seguimiento de pedidos de restaurantes", "Reparto al momento con GPS" ] },
  { id: "food", label: "Restauración y Delivery Propio", icon: "🍔", color: "#8B5CF6", benefits: [ "Menu online interactivo", "Pedidos del día en tiempo real", "Enlace de rastreo para clientes", "Reclamos y devoluciones automatizados" ] },
  { id: "barber", label: "Peluquerías y Talleres", icon: "💈", color: "#10B981", benefits: [ "Reserva de citas inteligente", "Notificaciones de llegada del cliente", "Facturación de servicios", "Reparto de pedidos a domicilio" ] },
  { id: "beauty", label: "Servicios y Citas", icon: "💇", color: "#F472B6", benefits: [ "Agenda compartida con Google Calendar", "Recordatorios automáticos", "Facturación por servicio", "Chat de atención 24/7" ] },
  { id: "medical", label: "Clínicas y Salud", icon: "🏥", color: "#06B6D4", benefits: [ "Citas médicas gestadas por IA", "Historia clínica ligera", "Seguimiento de citas", "Compliance y seguridad" ] },
  { id: "service", label: "Servicios y Citas", icon: "🔧", color: "#14B8A6", benefits: [ "Gestión de citas y turnos", "Facturación de servicios", "Reparto de pedidos local", "Rastreo de flota de técnicos" ] },
  { id: "restaurant", label: "Restauración y Eventos", icon: "🍽️", color: "#F97316", benefits: [ "Gestión de mesas y reservas", "Facturación por cuenta", "Entrega de alimentos con GPS", "Métricas de ventas por hora" ] },
  { id: "delivery", label: "Restauración y Delivery Propio", icon: "🍟", color: "#6366F1", benefits: [ "Reparto independiente sin comisiones", "Enlace de rastreo en tiempo real", "Control de flota", "Métricas de entregas por hora" ] },
  { id: "office", label: "Ayuntamientos y Grandes Empresas", icon: "🏛️", color: "#3B82F6", benefits: [ "Dashboard B2G y municipal", "Monitoreo de flotas municipales", "API completa y custom", "Informes y seguridad" ] },
  { id: "gobierno", label: "Ayuntamientos y Grandes Empresas", icon: "🏛️", color: "#3B82F6", benefits: [ "API completa y custom", "Monitoreo de flotas municipales", "Reportes y seguridad", "Dashboard B2G y municipal" ] },
  { id: "evento", label: "Eventos y Festivales", icon: "🎪", color: "#F43F5E", benefits: [ "Gestión de pedidos por evento", "Reparto de comida en eventos", "Seguimiento de redes", "Control de flota" ] },
  { id: "festival", label: "Eventos y Festivales", icon: "🎪", color: "#F43F5E", benefits: [ "Gestión de pedidos por evento", "Reparto de comida en eventos", "Seguimiento de redes", "Control de flota" ] },
];
