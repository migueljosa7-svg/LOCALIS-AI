# LOCALIS AI

Páginas web con IA autónoma (**Stella**) y **GPS de reparto integrado** para PYMEs de Zaragoza:
atención por WhatsApp, citas automáticas, facturación 24/7 y entregas propias sin comisiones.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript estricto
- Tailwind CSS 3 · Framer Motion en modo ligero (`LazyMotion` + `m.*`)
- Sin imágenes rasterizadas en la página: todo es SVG/CSS (0 KB de imágenes en la carga)
- Despliegue: Vercel (build `next build`, Node ≥ 20.9)

## Desarrollo

```bash
npm install
npm run dev            # http://localhost:3000
npm run typecheck      # TypeScript sin emitir
npm run check          # typecheck + build de producción (lo mismo que hará Vercel)
```

## Recursos para Google Business

```bash
npm run build && npm start              # terminal 1
npm run assets:google                   # terminal 2 → public/google-business-assets/
BASE_URL=https://tu-dominio npm run assets:google   # o desde la web publicada
```

Genera logo (720×720 y 1080×1080), portada 16:9 (2048×1152), banners de servicios 4:3
(1200×900) con capturas reales de la web, y `public/og-image.png` (1200×630).
Usa Chrome/Edge instalados en el equipo (vía `playwright-core`, sin descargar navegadores).

## Estructura

```
src/
  app/
    layout.tsx            Layout raíz: SEO, viewport, Consent Mode v2, fuentes
    page.tsx              Landing (composición de secciones)
    globals.css           Design system: tokens, glass, glow, botones, animaciones GPU
    (legal)/              Aviso legal, privacidad y cookies (+ layout con cabecera/pie)
    dashboard/page.tsx    Vista previa del panel (noindex)
    api/lead/route.ts     Recepción de leads (validación + rate-limit + email Resend)
    robots.ts · sitemap.ts · not-found.tsx
  components/
    HeroSection · HeroShowcaseCard        Hero (componentes de servidor, 0 JS)
    stella/                               Simulador de Stella con autopiloto + modales
    gps/                                  Mapa de telemetría, panel y calculadora de ahorro
    SectorsShowcase · PricingSection · ThreeStepLeadSection · FaqSection · …
    brand/BrandMark.tsx                   Logotipo vectorial
    effects/                              Orbes ambientales, brillo del cursor, contador, marcador de ruta
    lead/                                 Contexto y modal de captura (carga bajo demanda)
  lib/                                    site (contacto/URL), lead, analytics, plans, faqs, routes, env, email
scripts/
  google-business-assets.mjs              Generador de recursos para Google Business
  generate-icons.mjs                      Iconos PWA
public/
  google-business-assets/                 Logo, portada y banners listos para subir
```

## Variables de entorno

Copia `.env.example` a `.env.local`. Todas son opcionales; las importantes en Vercel:
`RESEND_API_KEY` (emails de leads), `NEXT_PUBLIC_SITE_URL` (si usas dominio propio) y
`NEXT_PUBLIC_GADS_LEAD_SEND_TO` (conversión de Google Ads por lead).
