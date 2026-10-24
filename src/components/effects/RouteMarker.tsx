/**
 * Marcador que recorre una ruta Bézier sobre un SVG escalable.
 *
 * En vez de SMIL (<animateMotion>), que en Chrome recalcula estilo y repinta
 * en el hilo principal en cada frame, se precalculan los puntos de la curva
 * en el servidor y se genera un @keyframes de `transform: translate(%)`.
 * La capa es un div HTML a pantalla completa del SVG → animación 100 % en GPU.
 */
type P = readonly [number, number];
export interface CubicSeg {
  c1: P;
  c2: P;
  p: P;
}

function cubic(a: P, b: P, c: P, d: P, t: number): [number, number] {
  const u = 1 - t;
  const x = u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0];
  const y = u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1];
  return [x, y];
}

function keyframes(name: string, start: P, segs: CubicSeg[], w: number, h: number, steps = 10): string {
  const pts: [number, number][] = [];
  let from = start;
  segs.forEach((s, i) => {
    for (let k = i === 0 ? 0 : 1; k <= steps; k++) pts.push(cubic(from, s.c1, s.c2, s.p, k / steps));
    from = s.p;
  });
  const frames = pts
    .map(([x, y], i) => {
      const pct = ((i / (pts.length - 1)) * 92).toFixed(2); // 92-100 %: pausa en destino
      return `${pct}%{transform:translate3d(${((x / w) * 100).toFixed(2)}%,${((y / h) * 100).toFixed(2)}%,0)}`;
    })
    .join("");
  const [lx, ly] = pts[pts.length - 1];
  return `@keyframes ${name}{${frames}100%{transform:translate3d(${((lx / w) * 100).toFixed(2)}%,${((ly / h) * 100).toFixed(2)}%,0)}}`;
}

export default function RouteMarker({
  name,
  start,
  segs,
  viewW,
  viewH,
  duration = 9,
}: {
  name: string;
  start: P;
  segs: CubicSeg[];
  viewW: number;
  viewH: number;
  duration?: number;
}) {
  return (
    <>
      <style>{keyframes(name, start, segs, viewW, viewH)}</style>
      <div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ animation: `${name} ${duration}s linear infinite` }}
        aria-hidden="true"
      >
        <span className="absolute left-0 top-0 -ml-3 -mt-3 w-6 h-6 rounded-full bg-cyan-400/20" />
        <span className="absolute left-0 top-0 -ml-[6px] -mt-[6px] w-3 h-3 rounded-full bg-[#00F2FE] ring-2 ring-[#0B0F17] shadow-[0_0_12px_rgba(0,242,254,0.8)]" />
      </div>
    </>
  );
}
