// Datos de métricas/finanzas por rango temporal para el dashboard.

export type RangeId = "hoy" | "semana" | "mes";

export interface RangeMeta {
  id: RangeId;
  label: string;
}

export const RANGES: RangeMeta[] = [
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mes" },
];

export interface MetricSnapshot {
  facturado: number;
  facturadoDelta: number;
  pedidos: number;
  pedidosDelta: number;
  ticketMedio: number;
  ticketDelta: number;
  clientesNuevos: number;
  clientesDelta: number;
  /** Barras del gráfico: etiqueta + valor (€). */
  bars: { label: string; value: number; highlight?: boolean }[];
  /** Comparativa mensual simple (%). */
  gastoIa: number;
  ahorroComisiones: number;
}

export const METRICS: Record<RangeId, MetricSnapshot> = {
  hoy: {
    facturado: 1463,
    facturadoDelta: 18,
    pedidos: 12,
    pedidosDelta: 3,
    ticketMedio: 54.2,
    ticketDelta: 6,
    clientesNuevos: 5,
    clientesDelta: 2,
    bars: [
      { label: "9h", value: 180 },
      { label: "11h", value: 320 },
      { label: "13h", value: 260 },
      { label: "16h", value: 410 },
      { label: "18h", value: 293, highlight: true },
    ],
    gastoIa: 6.4,
    ahorroComisiones: 214,
  },
  semana: {
    facturado: 6842,
    facturadoDelta: 22,
    pedidos: 57,
    pedidosDelta: 9,
    ticketMedio: 51.8,
    ticketDelta: 4,
    clientesNuevos: 23,
    clientesDelta: 7,
    bars: [
      { label: "Lun", value: 620 },
      { label: "Mar", value: 480 },
      { label: "Mié", value: 710 },
      { label: "Jue", value: 540 },
      { label: "Vie", value: 980 },
      { label: "Sáb", value: 1240 },
      { label: "Dom", value: 2272, highlight: true },
    ],
    gastoIa: 38.2,
    ahorroComisiones: 1180,
  },
  mes: {
    facturado: 27410,
    facturadoDelta: 31,
    pedidos: 236,
    pedidosDelta: 42,
    ticketMedio: 53.1,
    ticketDelta: 8,
    clientesNuevos: 96,
    clientesDelta: 18,
    bars: [
      { label: "S1", value: 4200 },
      { label: "S2", value: 5100 },
      { label: "S3", value: 6300 },
      { label: "S4", value: 11810, highlight: true },
    ],
    gastoIa: 149.0,
    ahorroComisiones: 5120,
  },
};
