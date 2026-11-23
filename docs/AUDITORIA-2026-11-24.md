# Auditoría de LOCALIS AI · 24-nov-2026

Rama revisada: `integracion/stella-configurador` (Stella + configurador juntos; NO es `main`).
Detalle completo y estados por funcionalidad: ver el informe entregado en el chat. Resumen de pruebas reproducibles:

- `npm run check` → 69 tests + lint + TypeScript + build.
- `npm run test:e2e:stella` → 108 comprobaciones (Preview) / 82 (producción simulada) en Chrome real, con Supabase y Anthropic SIMULADOS.
- `npm run test:e2e:builder` → 99 comprobaciones en Chrome real, Supabase simulado.
- `npm run test:e2e:audit` → 49 comprobaciones de rutas, autenticación, regresión de leads y Stella sin clave / con fallo de la IA.

Ninguna de estas pruebas usa Supabase, Resend ni Anthropic reales.
