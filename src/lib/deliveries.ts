import { DeliveryOrder, Driver } from "@/types";

const SAMPLE_DRIVERS: Driver[] = [
  { id: "drv_01", name: "Luis García", plate: "M-9-4821-X", vehicle: "Vans 3.0", avatar: "?????", live: true },
  { id: "drv_02", name: "María Sánchez", plate: "B-7-1234-L", vehicle: "Mercedes Vito", avatar: "?????", live: true },
  { id: "drv_03", name: "Javier Muñoz", plate: "D-2-9012-K", vehicle: "Ford Transit", avatar: "?????", live: false },
];

export const SAMPLE_DELIVERY_ORDERS: DeliveryOrder[] = [
  { id: "ord_001", businessId: "biz_005", customerName: "Ana López", customerPhone: "+34 655 123 456", customerAddress: "C/ Gran Vía, 24, Zaragoza",
    items: [ { id: "ord1_item1", name: "Pastel de chocolate", quantity: 3, price: 9.5 }, { id: "ord1_item2", name: "Macarons variados", quantity: 2, price: 6.0 } ],
    total: 39.5, status: "out_for_delivery", driver: SAMPLE_DRIVERS[0], eta: "11:25", deliveredAt: null, trackingLink: "https://localis.ai/track/ord_001" }
];

export const SAMPLE_ROUTES = [
  { id: "route_001", driver: "Luis García", from: [41.6556, -0.8786], to: [41.6580, -0.8730], current: [41.6560, -0.8772], waypoints: [ [41.6556, -0.8786], [41.6558, -0.8780], [41.6560, -0.8772], [41.6565, -0.8760], [41.6568, -0.8748], [41.6580, -0.8730] ], color: "#3B82F6", eta: "11:25" },
];
