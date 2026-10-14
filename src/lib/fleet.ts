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
    customerAddress: "C/ Gran Vía, 24, Zaragoza",
    etaMin: 4,
    position: [41.6570, -0.8770],
    route: [
      [41.6566, -0.8782],
      [41.6568, -0.8776],
      [41.6570, -0.8770],
      [41.6574, -0.8755],
      [41.6577, -0.8740],
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
    customerAddress: "C/ Serrano, 88, Zaragoza",
    etaMin: 9,
    position: [40.4215, -3.6915],
    route: [
      [40.4205, -3.6975],
      [40.421, -3.6945],
      [40.4215, -3.6915],
      [41.6582, -0.8726],
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
    customerAddress: "Pza. Mayor, 3, Zaragoza",
    etaMin: 15,
    position: [41.6549, -0.8763],
    route: [
      [41.6538, -0.8749],
      [41.6543, -0.8756],
      [41.6549, -0.8763],
      [41.6556, -0.8786],
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
    position: [41.6556, -0.8786],
    route: [
      [41.6582, -0.8726],
      [41.6572, -0.8745],
      [41.6560, -0.8760],
      [41.6556, -0.8786],
    ],
    trackingLink: "https://localis.ai/track/demo-097",
  },
];

export const FLEET_CENTER: LngLat = [41.6560, -0.8760];

/** Genera el mensaje de WhatsApp pre-rellenado para compartir el tracking. */
export function trackingMessage(driver: FleetDriver): string {
  return `¡Hola ${driver.customerName}! 🚚 Tu pedido ${driver.orderId} va en camino con ${driver.name} (${driver.vehicle}). Síguelo en vivo aquí: ${driver.trackingLink}`;
}

export function statusLabel(status: FleetStatus): string {
  return status === "active" ? "En reparto" : status === "idle" ? "En espera" : "Volviendo";
}
