# Estado final de LOCALIS AI · rama `integracion/stella-configurador` · 24-nov-2026

> **Actualización (24-nov-2026):** precios de referencia (fuente única `src/lib/pricing.ts`), textos y Aviso legal corregidos. Para publicar y poner en marcha: **`docs/PUBLICAR-Y-PUESTA-EN-MARCHA.md`**. Resultados vigentes: 94 unitarias, E2E configurador 109, SEO 158, Stella 108, auditoría 49, producto 64; Lighthouse en local: escritorio 100 y móvil 97–100.

> Este documento describe lo que existe y lo que se ha comprobado de verdad. Lo que no se ha podido comprobar está marcado como tal.

## 1. Arquitectura

- Next.js 15 (App Router) + React 19 + TypeScript + Tailwind. Base de datos Supabase (REST con clave de servicio, RLS sin políticas, almacén privado `design-uploads`). Correo: Resend. IA: Anthropic (modelo por defecto `claude-haiku-5-5`).
- Grupos de rutas: `(site)` (web pública con cabecera/pie), `(legal)`, `/disena-tu-web` (editor a pantalla completa), `/admin/*` (panel con Basic Auth, 404 si no está configurado), `/alta/[token]` (ficha del cliente), `/stella/embed` + `public/stella.js` (chat instalable), `/api/*`.
- Seguridad: tokens firmados, lista de dominios + CSP `frame-ancestors`, límites y presupuestos persistentes en SQL, importador con protección SSRF, honeypots y consentimiento.

## 2. Rutas públicas y navegación

| Ruta | Contenido | Indexable |
| --- | --- | --- |
| `/` | INICIO corto: propuesta, beneficios, cómo empezar, accesos a cada apartado, CTA | Sí |
| `/plataforma` | Tres apartados apilados y diferenciados: **Stella IA**, **Reparto con GPS** (demostración, en desarrollo), **Soluciones por sector**; cada uno con problema que resuelve, estado real y demo | Sí |
| `/disena-tu-web` | El configurador **existente** (no hay otro) | Sí |
| `/tarifas` | Creación de web, mantenimiento, Stella (piloto), panel de clientes (no disponible). **Sin precios numéricos** | Sí |
| `/preguntas-frecuentes` | 12 preguntas por categoría + FAQPage JSON-LD | Sí |
| `/contacto` | Formulario real (guarda lead + email), WhatsApp, teléfono, email | Sí |
| `/diseno-web-zaragoza` | Página local única (Zaragoza/Aragón), sin páginas casi idénticas por ciudad | Sí |
| `/privacy`, `/terms`, `/cookies` | Legales | No (noindex) |
| `/dashboard` | Redirección permanente → `/plataforma` | — |

Menú: escritorio y móvil accesible (Esc cierra, bloqueo de scroll), pestaña activa con `aria-current="page"`; el editor lleva su propia barra con los mismos enlaces. Enlaces antiguos con `#` (`/#cita`, `/#precios`…) se redirigen en el navegador (`LegacyHashRedirect`).

## 3. Funciones y estado (real vs demostración)

| Función | Estado |
| --- | --- |
| Formularios de lead, WhatsApp, guardado en Supabase, aviso por email | **Real** (Supabase y Resend verificados con servicios reales por el propietario) |
| Configurador «Diseña tu web» (diseño, imágenes privadas, lead enlazado, ficha en `/admin/diseno`) | **Real** (probado extremo a extremo con servicios simulados + almacén real verificado) |
| Stella | **Código completo y probado con Anthropic simulado.** Sin crédito: **no validada con la API real**. En Producción debe seguir apagada |
| Panel de clientes, Reparto GPS | **Demostraciones** (etiquetadas; no se venden) |
| Mapas / «Cómo llegar» | Real, enlaces gratuitos sin clave |

## 4. Panel `/admin`

Menú lateral (escritorio) / pestañas (móvil): **Resumen**, **Leads** (+ oportunidades, filtros por estado/origen), **Clientes y negocios**, **Proyectos y webs** (por fase), **Diseños y configurador**, **Stella**, **Consumo y límites**, **Entorno** (pruebas reales de Supabase/almacén/Resend), **Configuración** (qué es real/demo). Solo datos reales de la base de datos.

## 5. SEO implementado (técnico, real)

- Un `<title>` y una meta description únicos por página; canonical propio por página; Open Graph y Twitter; `lang="es"`.
- Un único H1 por página con jerarquía H2; `alt` en imágenes; enlaces internos entre todas las secciones y pie.
- JSON-LD: `ProfessionalService` + `WebSite` (sin precios ni valoraciones inventadas), `FAQPage`, `BreadcrumbList`, `Service` (página local).
- `sitemap.xml` generado desde la lista de rutas indexables (7 URLs); `robots.txt` bloquea `/admin`, `/api/`, `/alta`, `/stella/`, `/prueba-stella` y declara el sitemap.
- Legales con `noindex`; 404 real; redirección `/dashboard`.
- No se prometen posiciones en Google.

## 6. Search Console — estado y pasos

**Estado: NO está verificada ni se ha enviado ningún sitemap** (requiere tu cuenta de Google). El código ya soporta la verificación por etiqueta HTML.

1. https://search.google.com/search-console → Añadir propiedad → «Prefijo de URL» con la URL pública definitiva (con dominio propio, cuando exista).
2. Método «Etiqueta HTML»: copia **solo el valor** de `content="…"`.
3. Vercel → Settings → Environment Variables → `GOOGLE_SITE_VERIFICATION` = ese valor (en Production) → Redeploy.
4. Vuelve a Search Console → Verificar.
5. Sitemaps → escribe `sitemap.xml` → Enviar. Comprueba que aparecen 7 URLs.
6. Inspección de URLs → prueba `/` y `/diseno-web-zaragoza` → «Solicitar indexación».

## 7. Google Business Profile — recomendaciones (no se ha modificado nada)

- Nombre, dirección/área de servicio y teléfono idénticos a los de `/contacto` y al JSON-LD.
- URL del sitio web de la ficha: la portada (o `/contacto`). Los enlaces antiguos `/#cita` siguen funcionando por redirección.
- Categoría principal coherente con el servicio (diseño de sitios web) y descripción sin promesas no cumplidas (sin «24/7», sin Stella como disponible).
- Horario y área de servicio (Zaragoza/Aragón) iguales a la web.

## 8. Ramas integradas (revisión de commits)

| Rama | Resultado de la revisión |
| --- | --- |
| `feat/stella-produccion`, `feat/configurador-web`, `feat/captacion-segura` | Contenidas en la rama de integración (0 commits exclusivos). |
| `fix/revision-conexiones` (3 commits: `5c5498f`, `db44035`, `45936f4`) | Contenido ya presente (GRANT/`fix-permisos.sql`, normalización de `SUPABASE_URL`, `diagnose-supabase.mjs`; la integración añade además exports y la función de contactos por origen). El texto «24/7» ya no existe. **Nada que portar.** |
| `feat/rediseno-secciones` · `a4f9197` (web en 4 apartados) | **Reemplazado** por la nueva estructura de 6 rutas pedida después. Se **portó** lo que faltaba: redirección de enlaces antiguos con `#` (`LegacyHashRedirect`/`LEGACY_HASHES`, adaptado a las rutas actuales). Sus subpáginas `/plataforma/stella`, `/reparto`, `/sectores`, `/panel` no se incorporan: ahora son tres apartados dentro de `/plataforma` y el panel no se vende. |
| `feat/rediseno-secciones` · `d8b8500` (Stella fase 2) | **Reemplazado** por la Stella multi-negocio de `feat/stella-produccion` (fichas en BD, dominios, límites). La subida a Next 15.5.29 ya está en la integración. Se **portó** la limpieza de `.env.example` (variables muertas eliminadas, añadidas las reales). Su guía de activación (modelo por defecto Opus, fichas en código) está obsoleta y no se incorpora. |
| `feat/rediseno-secciones` · `45936f4`, `db44035`, `5c5498f` | Son los mismos tres commits de `fix/revision-conexiones`. |

Ninguna rama se ha borrado.

## 9. Pruebas ejecutadas (resultados reales de esta sesión)

- `tsc --noEmit`: sin errores · `eslint . --max-warnings=0`: sin avisos · `npm test`: **94/94**.
- `next build`: **código de salida 0** (comprobado por `$?`, no por filtrado de salida).
- E2E (Chrome real, Supabase y Anthropic **simulados**): Stella **108/108**, configurador **99/99**, auditoría de rutas/auth **49/49**, producto/panel **64/64**, SEO y web pública **128/128**.
- Nota de honestidad: tras el último ajuste (barra del editor y un título) se repitieron solo configurador y SEO; Stella, auditoría y producto pasaron sobre el build inmediatamente anterior, y el ajuste no toca su código.
- La auditoría SEO (`npm run test:e2e:seo`) recorre el sitemap: estado 200, título/description únicos, canonical, un H1, Open Graph, JSON-LD válido, `alt`, sin errores de consola, sin desbordamiento a 1280 y 390 px, menú activo, enlaces internos sin roto, redirección, 404 y noindex.
- **No ejecutado: Lighthouse** (no hay herramienta disponible en este entorno); no se inventan puntuaciones. Puedes lanzarlo en Chrome → DevTools → Lighthouse sobre la URL de Preview/Producción.

## 10. Git

- Producción: **actualizar `main` dispara un despliegue automático a Production**, así que **no se ha hecho el merge**. `main` ← integración es un merge limpio (comprobado sin conflictos), 0 commits de `main` sin integrar.
- Antes de fusionar: confirmar que `STELLA_SITE_WIDGET` y `ANTHROPIC_API_KEY` no están en Production (Stella apagada) y que las variables obligatorias de Production existen.

## 11. Pendiente y tareas tuyas

1. **Autorizar el merge a `main`** (equivale a publicar en Production).
2. Variables de Production en Vercel (`ADMIN_USER`, `ADMIN_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `LEAD_INBOX_EMAIL`; **sin** `STELLA_SITE_WIDGET`) — yo no puedo verlas.
3. Dominio propio y plan de Vercel adecuado a uso comercial; verificar dominio en Resend para enviar desde tu dominio.
4. Search Console (sección 6) y revisión de Google Business (sección 7).
5. Crédito en Anthropic y **prueba real de Stella** antes de venderla.
6. Revisión legal de privacidad/términos y aprobación de precios para publicarlos en `/tarifas`.
