# Publicar LOCALIS AI y ponerlo en marcha

Código de referencia: rama `integracion/stella-configurador`, commit de código `f4a831d` (verificado: árbol limpio, 109/109 configurador, 143/143 SEO, 108/108 Stella, 49/49 auditoría, 64/64 producto, 94/94 unitarias, build con salida 0). Lo que no se ha podido verificar está marcado **(sin verificar)**.

## 1. Estado de Git y de los despliegues (comprobado el 24-nov-2026)

- `main` está en `1e4ddfb` y es **ancestro** de la integración: no hay nada en `main` que falte en la integración y la fusión es **fast-forward, sin conflictos** (28 commits, 167 archivos).
- **Actualizar `main` publica en Production automáticamente** (Vercel). Por eso no se ha hecho.
- Production (https://localis-ai-one.vercel.app) sirve hoy la **web antigua de una sola página** (`/plataforma` da 404, aún dice «Auditoría gratis»). El último despliegue correcto de Production es `0d8da33` (12-nov). El de `1e4ddfb` figura como *cancelado desde el panel de Vercel* (hecho por ti).
- `/admin` en Production responde **401**: indica que `ADMIN_USER` y `ADMIN_PASSWORD` (16+ caracteres) existen allí. Es lo único de Production que se ha podido confirmar sin acceso a Vercel.
- Preview de `f4a831d`: desplegada correctamente; protegida por inicio de sesión de Vercel.
- Ramas: `feat/captacion-segura`, `feat/configurador-web`, `feat/stella-produccion` están contenidas. `feat/rediseno-secciones` (5 commits) y `fix/revision-conexiones` (3, solo local) están **reemplazadas o ya integradas** (detalle en `ESTADO-FINAL-LOCALIS.md`). No hay trabajo válido sin integrar.

## 2. Procedimiento de publicación (solo con tu autorización)

Antes (5 minutos, en Vercel → Project → Settings → Environment Variables → **Production**):

| Variable | Debe estar | Nota |
| --- | --- | --- |
| `ADMIN_USER`, `ADMIN_PASSWORD` | Sí | Ya funcionan (401 observado) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Sí | **(sin verificar)**. Deben apuntar a un Supabase con `schema.sql`, `fix-permisos.sql`, `stella.sql` y `configurador.sql` ya ejecutados (si es el mismo proyecto que usas en Preview, ya lo están) |
| `RESEND_API_KEY` | Sí | **(sin verificar)** |
| `LEAD_INBOX_EMAIL` | Recomendado | Si falta, usa el email del código |
| `STELLA_SITE_WIDGET` | **No debe existir** | Si existiera con valor `on`, Stella saldría en la web |
| `ANTHROPIC_API_KEY` | **Mejor que no exista** hasta validar Stella | |
| `NEXT_PUBLIC_SITE_URL` | Cuando tengas dominio | Hasta entonces sitemap y canonical usan `localis-ai-one.vercel.app` |

Publicar (desde la carpeta del proyecto):

```
git checkout main
git merge --ff-only integracion/stella-configurador
git push origin main
```

Vercel despliega solo. Después, comprobar en la URL de Production: `/`, `/plataforma`, `/disena-tu-web`, `/tarifas`, `/preguntas-frecuentes`, `/contacto`, `/sitemap.xml`; que `/prueba-stella` da 404; enviar **un** lead de prueba por `/contacto` y ver que aparece en `/admin/leads` y llega el email; abrir `/admin/entorno` y pulsar las comprobaciones de Supabase, almacén y Resend.

Volver atrás si algo falla: Vercel → Deployments → el despliegue `0d8da33` → *Promote to Production* (o *Instant Rollback*). Parar Stella en una emergencia: `STELLA_ENABLED=false` + Redeploy.

## 3. Stella: qué falta y prueba real

Estado: código, límites de gasto, dominios autorizados, consentimiento y panel completos y probados **con Anthropic simulado**. **No validada con la API real** (sin crédito al cierre; la clave existe en Preview según tu confirmación, **sin verificar desde aquí**). No se vende ni se activa en Production hasta pasar esta prueba.

1. En la consola de Anthropic: añadir crédito (unos 5 $ bastan) y poner un **límite de gasto mensual**. (Tú, con tu cuenta.)
2. Prueba del modelo, una vez, en tu PowerShell (la clave no se escribe en ningún archivo ni en el chat): `$env:ANTHROPIC_API_KEY="…"; npm run stella:smoke`. Revisar las 8 respuestas: dice no saber lo desconocido, no inventa precios, no obedece «ignora tus instrucciones», no sale del tema, avisa de que es una IA.
3. En Preview, `/admin/stella/diagnostico`: todo en verde. Luego `/admin/stella/prueba-peluqueria/prueba`: la respuesta debe decir «Respuesta real de claude-haiku-5-5 · N tokens».
4. Instalar el chat en un negocio de prueba (guía `docs/STELLA-GUIA.md`): contacto con consentimiento → aparece como lead `stella:<negocio>` y llega el email.
5. En `/admin/consumo`: mensajes, tokens y coste > 0, y el coste coincide con la consola de Anthropic. Probar que al agotar el tope diario deja de responder y ofrece WhatsApp.
6. Solo si todo pasa: cambiar «Fase piloto» por la oferta comercial que decidas y, si quieres Stella en la web de LOCALIS, poner `STELLA_SITE_WIDGET=on` en Production.

## 4. Dominio, correo, SEO y Google

**Dominio (tú: compra y DNS).** Comprar el dominio → Vercel → Project → Settings → Domains → Add → copiar los registros DNS que Vercel muestre en tu proveedor → esperar «Valid» → poner `NEXT_PUBLIC_SITE_URL=https://tudominio.es` en Production → Redeploy. Elegir si la versión principal es con o sin `www` (Vercel redirige la otra).

**Plan de Vercel (tú: decisión y pago).** El plan gratuito *Hobby* es solo para uso no comercial; para vender conviene *Pro*.

**Correo / Resend.** Hoy el remitente es `onboarding@resend.dev`: Resend solo entrega a tu propia dirección. **Los avisos a ti funcionan; la confirmación automática al cliente que deja su email no le llegará** hasta verificar un dominio. Pasos: Resend → Domains → Add → copiar los registros SPF/DKIM en el DNS → Verify → en Vercel `EMAIL_FROM=LOCALIS AI <avisos@tudominio.es>` → Redeploy → botón de prueba de `/admin/entorno`.

**Search Console.** El sitemap ya existe y la verificación está soportada en código; **no está verificado ni enviado** (requiere tu cuenta). Pasos exactos en `ESTADO-FINAL-LOCALIS.md` §6, y hacerlo **con el dominio definitivo**.

**Google Business Profile.** No se ha tocado nada. Igualar nombre, teléfono, horario y web con `/contacto`; web de la ficha = la portada; descripción sin «24/7» ni Stella como disponible.

## 5. Legal y privacidad (necesita datos tuyos)

- Aviso legal: la identificación del titular solo dice «LOCALIS AI, Zaragoza» y un Gmail. La LSSI exige nombre o razón social, NIF/CIF, domicilio y contacto.
- **Términos, apartado 2:** describe el servicio como «automatizar agendas, facturación y control de repartos en tiempo real mediante IA y GPS, sin comisiones», es decir, como si existiera hoy. Debe reescribirse con lo que realmente ofreces (web, mantenimiento, Stella en piloto). Pendiente de tu autorización y, idealmente, de revisión profesional.
- Política de privacidad: comprobar con tu gestor/abogado el listado de encargados (Supabase, Vercel, Resend, Anthropic, Google) y los plazos de conservación. Los contactos de Stella ya se guardan con fecha y consentimiento.
- El banner de cookies con Consent Mode v2 ya está en la web.

## 6. Residuos de texto detectados (no corregidos, esperan tu OK)

Visibles para el público o para tus clientes:

- **Mensaje de WhatsApp** que se rellena al pulsar los botones: «quiero reservar una auditoría gratuita» (`WA_AUDIT_TEXT`, `src/lib/site.ts`). Propuesta: «quiero información y un presupuesto para mi web».
- **Página 404** (`src/app/not-found.tsx`): «pide tu auditoría gratuita» y botón «Auditoría gratis».
- **Emails de aviso y de confirmación al cliente** (`src/lib/email.ts`): hablan de «solicitud de auditoría/demo».
- **Ficha de la Stella de LOCALIS** (`src/lib/stella/builtin.ts`): lista «Auditoría gratuita» como servicio y cita «desde 400 €, tope 800 €». Solo se vería con `STELLA_SITE_WIDGET=on`, pero **antes de activarla** debe alinearse con Tarifas (sin precios definitivos hasta que los apruebes).

Internos o sin uso: estados del panel («Auditoría lista»), y `WebDesignSection`/`PricingSection`, que ya no se muestran en ninguna página.
