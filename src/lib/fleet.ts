import type { LngLat } from "./routes";

// ── Flota de reparto (demo del dashboard) ────────────────
export type FleetStatus = "active" | "idle" | "returning";

export interface FleetDriver {
  id: string;
  name: string; // "Juan"
  vehicle: string; // "Moto 1"
  phone: string;
  status: FleetStatus;
  orderId: string;
  customerName: string;
  customerAddress: string;
  etaMin: number;
  position: LngLat;
  route: LngLat[];
  trackingLink: string;
}

export const FLEET_DRIVERS: FleetDriver[] = [
  {
    id: "drv_juan",
    name: "Juan",
    vehicle: "Moto 1",
    phone: "+34 611 223 344",
    status: "active",
    orderId: "#104",
    customerName: "Ana López",
    customerAddress: "C/ Gran Vía, 24, Madrid",
    etaMin: 4,
    position: [40.4192, -3.701],
    route: [
      [40.4188, -3.7038],
      [40.419, -3.7025],
      [40.4192, -3.701],
      [40.4196, -3.6975],
      [40.4199, -3.694],
    ],
    trackingLink: "https://localis.ai/track/demo-104",
  },
  {
    id: "drv_pedro",
    name: "Pedro",
    vehicle: "Bici 2",
    phone: "+34 622 334 455",
    status: "active",
    orderId: "#108",
    customerName: "Luis Pérez",
    customerAddress: "C/ Serrano, 88, Madrid",
    etaMin: 9,
    position: [40.4215, -3.6915],
    route: [
      [40.4205, -3.6975],
      [40.421, -3.6945],
      [40.4215, -3.6915],
      [40.4204, -3.688],
    ],
    trackingLink: "https://localis.ai/track/demo-108",
  },
  {
    id: "drv_marta",
    name: "Marta",
    vehicle: "Furgoneta 3",
    phone: "+34 633 445 566",
    status: "active",
    orderId: "#111",
    customerName: "Rest. La Esquina",
    customerAddress: "Pza. Mayor, 3, Madrid",
    etaMin: 15,
    position: [40.4155, -3.7074],
    route: [
      [40.413, -3.712],
      [40.4142, -3.7098],
      [40.4155, -3.7074],
      [40.4168, -3.7038],
    ],
    trackingLink: "https://localis.ai/track/demo-111",
  },
  {
    id: "drv_sergio",
    name: "Sergio",
    vehicle: "Moto 4",
    phone: "+34 644 556 677",
    status: "returning",
    orderId: "#097",
    customerName: "Entregado",
    customerAddress: "Vuelta a base",
    etaMin: 0,
    position: [40.4168, -3.7038],
    route: [
      [40.4204, -3.688],
      [40.419, -3.695],
      [40.4175, -3.699],
      [40.4168, -3.7038],
    ],
    trackingLink: "https://localis.ai/track/demo-097",
  },
];

export const FLEET_CENTER: LngLat = [40.4175, -3.699];

/** Genera el mensaje de WhatsApp pre-rellenado para compartir el tracking. */
export function trackingMessage(driver: FleetDriver): string {
  return `¡Hola ${driver.customerName}! 🚚 Tu pedido ${driver.orderId} va en camino con ${driver.name} (${driver.vehicle}). Síguelo en vivo aquí: ${driver.trackingLink}`;
}

export function statusLabel(status: FleetStatus): string {
  return status === "active" ? "En reparto" : status === "idle" ? "En espera" : "Volviendo";
}
