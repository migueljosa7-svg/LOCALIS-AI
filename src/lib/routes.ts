export type LngLat = [number, number];

// Ruta de demo por el centro de Madrid (Gran Via -> Serrano)
export const DEMO_ROUTE: LngLat[] = [
  [40.4188, -3.7038],
  [40.4192, -3.7010],
  [40.4196, -3.6975],
  [40.4199, -3.6940],
  [40.4202, -3.6905],
  [40.4204, -3.6880],
];

export const DEMO_DEST: LngLat = DEMO_ROUTE[DEMO_ROUTE.length - 1];

export function haversineMeters(a: LngLat, b: LngLat): number {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function interpolateRoute(route: LngLat[], t: number): LngLat {
  const segments = route.length - 1;
  const clamped = Math.min(1, Math.max(0, t));
  const raw = clamped * segments;
  const i = Math.min(segments - 1, Math.floor(raw));
  const f = raw - i;
  const a = route[i];
  const b = route[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

export function remainingMeters(pos: LngLat): number {
  return haversineMeters(pos, DEMO_DEST);
}
