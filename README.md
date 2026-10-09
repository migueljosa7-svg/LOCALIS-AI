# LOCALIS AI — localis.ai

**La primera plataforma web con IA Autónoma y GPS Integrado para tu negocio.**

Automatiza tu agenda, emite facturas, atiende a tus clientes 24/7 con la IA
**Stella** y controla tus repartos en tiempo real sin comisiones.

## Características

1. **STELLA AI** — asistente conversacional autónomo / capa ERP:
   agenda en Google Calendar, recordatorios por WhatsApp, facturación
   básica en PDF y atención al cliente 24/7.
2. **LOCALIS GPS** — módulo de reparto con seguimiento en tiempo real
   (WebSockets + mapa interactivo), con enlaces de tracking nativos y
   **0% de comisión** frente al ~30% de Glovo / Just Eat.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Framer Motion + Lucide Icons + componentes estilo Shadcn UI (`cn` + cva)
- Datos mock 100% locales: toda la interactividad funciona sin backend

## Estructura

```
src/
  app/
    layout.tsx          # layout raíz + metadata SEO
    page.tsx            # landing page (composición de secciones)
    globals.css         # design system (dark #0B0F17, cyan, emerald, cobalt)
    dashboard/page.tsx  # ruta /dashboard (reutiliza el mockup cliente)
  components/           # Header, Hero, StellaAiSimulator, GpsModuleSection,
                        # SectorsCarousel, PricingSection, DashboardClient+tabs,
                        # Footer, ui/* (button, card, modal)
  lib/                  # utils, mockData, demoSamples, deliveries, plans,
                        # sectors, faqs, demo (barrel)
  hooks/                # useScrollPosition
  types/                # interfaces TypeScript
```

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run typecheck
npm run build
```

## Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores
(Mapbox, Google, WhatsApp Cloud API, WebSocket GPS). La demo funciona
sin claves: todos los datos son mock locales.
