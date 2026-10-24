/**
 * Logotipo de LOCALIS AI: pin de ubicación (GPS) con destello de IA.
 * SVG puro, sin JS. `id` evita colisiones de degradados si hay varios en la página.
 */
export default function BrandMark({ size = 36, id = "bm", className }: { size?: number; id?: string; className?: string }) {
  const g = `${id}-g`;
  const f = `${id}-f`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={g} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00F2FE" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id={f} x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#141C2B" />
          <stop offset="1" stopColor="#0B0F17" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill={`url(#${f})`} stroke={`url(#${g})`} strokeWidth="2" />
      <path
        d="M24 9.5c-6.6 0-12 5.2-12 11.7 0 8.6 12 17.8 12 17.8s12-9.2 12-17.8c0-6.5-5.4-11.7-12-11.7Z"
        stroke={`url(#${g})`}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M24 14.6l1.7 4.6 4.6 1.7-4.6 1.7-1.7 4.6-1.7-4.6-4.6-1.7 4.6-1.7 1.7-4.6Z" fill="#00F2FE" />
    </svg>
  );
}
