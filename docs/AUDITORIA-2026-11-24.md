# Auditoría final de LOCALIS AI · rama `integracion/stella-configurador` · 24-nov-2026

## Verificado con integraciones REALES (en el despliegue Preview, desde `/admin/entorno`, ejecutado por el propietario)

| Comprobación | Resultado |
| --- | --- |
| Seis tablas (`leads`, `opportunities`, `stella_businesses`, `stella_usage`, `stella_rate`, `design_requests`) y permisos de `service_role` | Correcto |
| Función `stella_gate` (límites persistentes) | Responde «ok» |
| Almacén `design-uploads` | Existe y es **privado** |
| Subir, recuperar (bytes idénticos) y borrar una imagen de diagnóstico | Correcto |
| La imagen no es accesible por la ruta pública | Correcto |
| Resend: correo de prueba a la dirección del propietario | HTTP 200, aceptado |
| Variables obligatorias en Preview (`ADMIN_USER`, `ADMIN_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `STELLA_MODEL`, `STELLA_SITE_WIDGET`) | Presentes |

## Verificado solo en local (con servicios simulados)

`npm run check` (94 tests, lint, TypeScript, build) y e2e en Chrome real: Stella 108, configurador 99, auditoría de rutas 49, producto 64.

## NO verificado

- Stella con Anthropic **real** (sin crédito): solo probados errores simulados 400/401/404/sin clave.
- Variables de **Production** (Vercel no accesible desde aquí).
- Previews y Production de Vercel más allá de «build correcto».

## Estado de las ramas

`integracion/stella-configurador` = 23 commits por delante de `main`, 0 por detrás, **sin conflictos** al fusionar. Sin merge ni cambios en Production.
