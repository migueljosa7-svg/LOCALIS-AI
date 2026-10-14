export type LngLat = [number, number];

// ── Demo LOCALIS GPS: centro de ZARAGOZA ─────────────────
// Eje: Plaza del Pilar → C/ Alfonso I → Coso → Pza. España → Independencia
export const DEMO_ROUTE: LngLat[] = [
  [41.6566, -0.8782],
  [41.6559, -0.8774],
  [41.6549, -0.8763],
  [41.6538, -0.8749],
  [41.6527, -0.8737],
  [41.6517, -0.8726],
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
