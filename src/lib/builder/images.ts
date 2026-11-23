// Imágenes de ejemplo del configurador. Se generan aquí (ilustraciones abstractas en SVG): son nuestras,
// sin derechos de terceros ni descargas. NO representan el negocio del cliente: son solo marcadores de sitio.

export interface SampleImage {
  id: string;
  name: string;
}

const HUES: [number, number][] = [
  [210, 260], [20, 340], [150, 190], [45, 15], [280, 220], [170, 120],
  [330, 280], [60, 100], [200, 160], [10, 40], [250, 300], [130, 70],
];

export const SAMPLE_IMAGES: SampleImage[] = HUES.map((_, i) => ({ id: `s${i + 1}`, name: `Imagen de ejemplo ${i + 1}` }));

/** Data-URI del SVG de ejemplo, o null si el id no es de ejemplo. */
export function sampleSrc(id: string): string | null {
  const m = /^s(\d{1,2})$/.exec(id);
  const n = m ? Number(m[1]) : 0;
  if (n < 1 || n > HUES.length) return null;
  const [h1, h2] = HUES[n - 1];
  const shape = n % 4;
  const cx = 160 + ((n * 97) % 480);
  const cy = 120 + ((n * 53) % 260);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h1} 70% 62%)"/><stop offset="1" stop-color="hsl(${h2} 65% 38%)"/></linearGradient></defs>` +
    `<rect width="800" height="520" fill="url(#g)"/>` +
    (shape === 0
      ? `<circle cx="${cx}" cy="${cy}" r="150" fill="rgba(255,255,255,.22)"/><circle cx="${800 - cx}" cy="${520 - cy}" r="90" fill="rgba(255,255,255,.16)"/>`
      : shape === 1
        ? `<rect x="${cx - 120}" y="${cy - 90}" width="300" height="200" rx="28" fill="rgba(255,255,255,.2)" transform="rotate(-8 ${cx} ${cy})"/><rect x="60" y="360" width="520" height="22" rx="11" fill="rgba(255,255,255,.2)"/>`
        : shape === 2
          ? `<polygon points="${cx},${cy - 140} ${cx + 170},${cy + 120} ${cx - 170},${cy + 120}" fill="rgba(255,255,255,.2)"/><circle cx="130" cy="110" r="46" fill="rgba(255,255,255,.18)"/>`
          : `<path d="M0 380 Q 200 280 400 360 T 800 330 L800 520 L0 520Z" fill="rgba(255,255,255,.2)"/><circle cx="${cx}" cy="150" r="70" fill="rgba(255,255,255,.22)"/>`) +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
