/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
];

// El chat de Stella (/stella/embed) SÍ se incrusta en webs de clientes: allí el control de quién puede
// enmarcarlo lo hace el CSP frame-ancestors que fija src/middleware.ts, así que no lleva X-Frame-Options.
const embedHeaders = securityHeaders.filter((h) => h.key !== "X-Frame-Options");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Importa solo los iconos usados de lucide-react (tree-shaking agresivo).
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async redirects() {
    return [{ source: "/dashboard", destination: "/plataforma", permanent: true }];
  },
  async headers() {
    return [
      { source: "/stella/embed", headers: embedHeaders },
      { source: "/((?!stella/embed).*)", headers: securityHeaders },
      {
        // El widget se actualiza sin que el cliente toque su web: caché corta con revalidación.
        source: "/stella.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
      {
        // El Service Worker nunca debe quedarse cacheado: así cada deploy se aplica.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/google-business-assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;
