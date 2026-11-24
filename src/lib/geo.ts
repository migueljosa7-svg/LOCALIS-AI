// Ubicación y mapas SIN APIs de pago ni seguimiento:
//  · Mapas y rutas = enlaces a Google Maps / OpenStreetMap (gratuitos, sin clave).
//  · Geolocalización = API del navegador, UNA sola lectura cuando la persona pulsa el botón y concede el permiso.
// Las coordenadas se usan solo en su dispositivo para construir el enlace de la ruta: no se envían ni se guardan en LOCALIS.

export interface Place {
  /** dirección escrita por el negocio (calle, ciudad) */
  address?: string;
  /** coordenadas del negocio si se conocen (opcional) */
  lat?: number;
  lng?: number;
}

const validCoord = (n: unknown, max: number): n is number => typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= max;

/** Destino legible para los enlaces: coordenadas si las hay, si no la dirección. */
function destination(p: Place): string | null {
  if (validCoord(p.lat, 90) && validCoord(p.lng, 180)) return `${p.lat},${p.lng}`;
  const a = (p.address ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
  return a || null;
}

export interface MapLinks {
  /** ver el sitio en el mapa */
  view: string;
  /** ruta hasta el negocio (Google Maps pide el origen si no se indica) */
  directions: string;
  /** alternativa abierta */
  osm: string;
}

export function mapLinks(p: Place): MapLinks | null {
  const d = destination(p);
  if (!d) return null;
  const q = encodeURIComponent(d);
  return {
    view: `https://www.google.com/maps/search/?api=1&query=${q}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`,
    osm: `https://www.openstreetmap.org/search?query=${q}`,
  };
}

/** Ruta desde una posición concreta (lat,lng) hasta el negocio. Devuelve null si faltan datos. */
export function directionsFrom(origin: { lat: number; lng: number }, p: Place): string | null {
  const d = destination(p);
  if (!d || !validCoord(origin.lat, 90) || !validCoord(origin.lng, 180)) return null;
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${encodeURIComponent(d)}&travelmode=driving`;
}

export type PositionError = "unsupported" | "insecure" | "denied" | "unavailable" | "timeout";
export type PositionResult = { ok: true; lat: number; lng: number } | { ok: false; error: PositionError };

export const POSITION_MESSAGES: Record<PositionError, string> = {
  unsupported: "Tu navegador no permite obtener la ubicación. Usa el botón «Cómo llegar» y escribe tu origen en el mapa.",
  insecure: "La ubicación solo funciona en páginas seguras (https). Usa el botón «Cómo llegar».",
  denied: "No has dado permiso para usar tu ubicación, no pasa nada: usa «Cómo llegar» y escribe tu origen en el mapa. Puedes cambiar el permiso en los ajustes del navegador.",
  unavailable: "No hemos podido obtener tu ubicación ahora mismo. Usa «Cómo llegar» y escribe tu origen en el mapa.",
  timeout: "Tu ubicación ha tardado demasiado. Inténtalo de nuevo o usa «Cómo llegar».",
};

/** UNA lectura puntual de la posición (nunca seguimiento continuo). El navegador pide permiso a la persona. */
export function getPositionOnce(nav: Pick<Navigator, "geolocation"> | undefined = typeof navigator === "undefined" ? undefined : navigator, secure = typeof window === "undefined" ? false : window.isSecureContext): Promise<PositionResult> {
  return new Promise((resolve) => {
    if (!nav?.geolocation) return resolve({ ok: false, error: "unsupported" });
    if (!secure) return resolve({ ok: false, error: "insecure" });
    nav.geolocation.getCurrentPosition(
      (pos) => resolve({ ok: true, lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => resolve({ ok: false, error: err.code === 1 ? "denied" : err.code === 3 ? "timeout" : "unavailable" }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
    );
  });
}
