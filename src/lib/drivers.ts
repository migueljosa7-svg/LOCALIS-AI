// Datos de flota/repartidores para el panel GPS del dashboard.

export interface Driver {
  id: string;
  name: string;
  vehicle: string;
  phone: string;
  status: "en_ruta" | "disponible" | "en_local";
  eta: string;
  orderId: string;
  customerName: string;
  customerAddress: string;
  /** Posición simulada sobre la ruta de demo. */
  progress: number;
  trackingLink: string;
}

export const SAMPLE_DRIVERS: Driver[] = [
  {
    id: "drv_1",
    name: "Juan",
    vehicle: "Moto 1",
    phone: "+34 611 111 111",
    status: "en_ruta",
    eta: "4 min",
    orderId: "#104",
    customerName: "Ana López",
    customerAddress: "C/ Gran Vía, 24, Madrid",
    progress: 0.55,
    trackingLink: "https://localis.ai/t/demo-104",
  },
  {
    id: "drv_2",
    name: "Pedro",
    vehicle: "Bici 2",
    phone: "+34 622 222 222",
    status: "en_ruta",
    eta: "7 min",
    orderId: "#118",
    customerName: "Lucía Pérez",
    customerAddress: "C/ Serrano, 8, Madrid",
    progress: 0.3,
    trackingLink: "https://localis.ai/t/demo-118",
  },
  {
    id: "drv_3",
    name: "Marta",
    vehicle: "Furgoneta 3",
    phone: "+34 633 333 333",
    status: "disponible",
    eta: "—",
    orderId: "—",
    customerName: "—",
    customerAddress: "Base central",
    progress: 0,
    trackingLink: "https://localis.ai/t/",
  },
  {
    id: "drv_4",
    name: "Álvaro",
    vehicle: "Moto 4",
    phone: "+34 644 444 444",
    status: "en_local",
    eta: "—",
    orderId: "—",
    customerName: "—",
    customerAddress: "Cargando pedidos",
    progress: 0,
    trackingLink: "https://localis.ai/t/",
  },
];

export const STATUS_META: Record<
  Driver["status"],
  { label: string; className: string }
> = {
  en_ruta: { label: "En ruta", className: "bg-emerald-500/15 text-emerald-400" },
  disponible: { label: "Disponible", className: "bg-cyan-500/15 text-cyan-400" },
  en_local: { label: "En local", className: "bg-yellow-500/15 text-yellow-400" },
};
