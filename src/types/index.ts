// ===================== TAMBIÉN DISPONIBLE (TypeScript Interfaces) =====================

// ── Usuario / Negocio ────────────────────────────────
export interface Business {
  id: string;
  name: string;
  category: Sector;
  email: string;
  phone: string;
  logo: string;
  plan: PlanType;
  timezone: string;
  lastActive: string;
}

// ── Plan de suscripción ──────────────────────────────
export type PlanType = "starter" | "pro" | "enterprise";

export interface Plan {
  id: PlanType;
  name: string;
  priceMonth: number;
  priceYear: number;
  features: string[];
  highlighted: boolean;
  cta: string;
  description: string;
}

// ── Cita / Reserva ───────────────────────────────────
export interface Appointment {
  id: string;
  businessId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string;
  calendarEvent: string | null;
}

// ── Factura / Facturación ────────────────────────────
export interface Invoice {
  id: string;
  businessId: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "pending" | "paid" | "sent";
  date: string;
  dueDate: string;
  pdfUrl: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ── Chat con Stella AI ───────────────────────────────
export type StellaMessageType = "user" | "ai" | "system";

export interface StellaMessage {
  id: string;
  role: StellaMessageType;
  content: string;
  timestamp: string;
  action?: "calendar" | "whatsapp" | "invoice" | "tracking" | "default";
  reference?: string;
}

// ── Pedido / Reparto ─────────────────────────────────
export interface DeliveryOrder {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: DeliveryItem[];
  total: number;
  status: "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  driver: Driver;
  eta: string;
  deliveredAt: string | null;
  trackingLink: string;
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Driver {
  id: string;
  name: string;
  plate: string;
  vehicle: string;
  avatar: string;
  live: boolean;
}

// ── Métricas de ventas generadas por IA ──────────────
export interface AiMetric {
  label: string;
  value: string;
  change: number;
  icon: string;
  negative?: boolean;
  positive: boolean;
}

// ── Sector / Sector vertical ─────────────────────────
export type Sector =
  | "groceries"
  | "gourmet"
  | "bakery"
  | "butchery"
  | "food"
  | "barber"
  | "beauty"
  | "salon"
  | "medical"
  | "service"
  | "restaurant"
  | "delivery"
  | "office"
  | "gobierno"
  | "evento"
  | "festival";

export interface SectorMeta {
  id: Sector;
  icon: string;
  label: string;
  color: string;
  benefits: string[];
}

// ── Preguntas frecuentes ─────────────────────────────
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// ── Modal de login ───────────────────────────────────
export interface LoginState {
  mode: "google" | "email" | "dashboard";
  email: string;
  password: string;
  submitting: boolean;
  error: string | null;
  user: Business | null;
}
