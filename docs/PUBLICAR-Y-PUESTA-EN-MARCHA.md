# Publicar LOCALIS AI y ponerlo en marcha

Rama `integracion/stella-configurador`. Lo que no se ha podido verificar está marcado **(sin verificar)**. Precios, comparativa y dominios: el documento interno `COMERCIAL-INTERNO.md` (guardado FUERA del repositorio, porque este es público). Estado técnico: `docs/ESTADO-FINAL-LOCALIS.md`.

## 1. Estado de Git y de los despliegues (comprobado el 24-nov-2026)

- `main` está en `1e4ddfb` y es **ancestro** de la integración: la fusión es **fast-forward, sin conflictos**.
- **Actualizar `main` publica en Production automáticamente** (Vercel). Nada se ha fusionado.
- Production (https://localis-ai-one.vercel.app) sirve hoy la **web antigua de una sola página**. Último despliegue correcto de Production: `0d8da33` (12-nov); el de `1e4ddfb` consta como cancelado desde el panel de Vercel.
- `/admin` en Production responde 401: confirma que `ADMIN_USER` y `ADMIN_PASSWORD` (16+ caracteres) existen allí. **No tengo acceso a las variables de Vercel**, así que el resto de variables de Production es **(sin verificar)** por mi parte.
- **Supabase:** según tu confirmación, Production usa el **mismo proyecto** que Preview; por tanto las tablas y permisos que ya comprobaste con `/admin/entorno` en Preview valen también para Production y **no hace falta ejecutar SQL**.

## 2. Procedimiento de publicación (solo con tu autorización)

**Antes** (Vercel → Project → Settings → Environment Variables → **Production**; solo comprobar que existen, sin copiar valores):

| Variable | Debe estar | Nota |
| --- | --- | --- |
| `ADMIN_USER`, `ADMIN_PASSWORD` | Sí | Confirmado (401) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Sí | **(sin verificar)** |
| `RESEND_API_KEY` | Sí | **(sin verificar)** |
| `LEAD_INBOX_EMAIL` | Recomendado | Si falta, usa el email del código |
| `STELLA_SITE_WIDGET` | **No debe existir** | Con `on` saldría Stella en la web |
| `ANTHROPIC_API_KEY` | **Mejor que no exista** hasta validar Stella | |
| `NEXT_PUBLIC_SITE_URL` | Cuando haya dominio | Hasta entonces sitemap y canonical usan `localis-ai-one.vercel.app` |

**Publicar:**

```
git checkout main
git merge --ff-only integracion/stella-configurador
git push origin main
```

**Después, en la URL de Production:** revisar las seis páginas + `/tarifas` y `/diseno-web-zaragoza`; `/sitemap.xml` con 7 URLs; `/prueba-stella` debe dar 404; enviar **un** lead de prueba por `/contacto` y ver que aparece en `/admin/leads` y llega el aviso por email; en `/admin/entorno` pulsar las comprobaciones de Supabase, almacén y Resend.

**Volver atrás:** Vercel → Deployments → despliegue `0d8da33` → *Promote to Production* (o *Instant Rollback*). Alternativa por Git: `git revert -m 1 <commit>` o `git revert <rango>` en `main` y push. Parar Stella en una emergencia: `STELLA_ENABLED=false` + Redeploy.

## 3. Vercel: plan para uso comercial

La documentación de Vercel indica que el plan gratuito **Hobby es solo para uso personal y no comercial**, y que **Pro cuesta 20 USD al mes por miembro** (fuentes: https://vercel.com/docs/plans/hobby y https://vercel.com/pricing, consultadas el 24-nov-2026). LOCALIS es un negocio: **el plan actual no es adecuado para uso comercial si es Hobby**. No puedo ver qué plan tienes ni cambiarlo. Decisión y pago: tuyos, antes de empezar a captar clientes de pago.

## 4. Stella: qué falta y prueba real

Estado: código, límites de gasto, dominios autorizados, consentimiento y panel completos y probados **con Anthropic simulado**. **No validada con la API real** (sin crédito; la clave existe en Preview según tu confirmación, **sin verificar desde aquí**). Se mantiene en fase piloto y **fuera de Production**. No he activado la integración ni gastado crédito.

1. En la consola de Anthropic: añadir crédito (unos 5 USD bastan) y fijar un **límite de gasto mensual**. (Tú.)
2. Prueba del modelo, una vez, en tu PowerShell (la clave no se escribe en archivos ni en el chat): `$env:ANTHROPIC_API_KEY="…"; npm run stella:smoke`. Revisar las 8 respuestas: dice que no sabe lo desconocido, no inventa precios, no obedece «ignora tus instrucciones», no se sale del tema, avisa de que es una IA.
3. En Preview, `/admin/stella/diagnostico` en verde; luego `/admin/stella/prueba-peluqueria/prueba`: «Respuesta real de claude-haiku-5-5 · N tokens».
4. Instalar el chat en un negocio de prueba (`docs/STELLA-GUIA.md`): un contacto con consentimiento aparece como lead `stella:<negocio>` y llega el email.
5. `/admin/consumo`: coste > 0 y coincide con la consola de Anthropic; probar que al agotar el tope diario deja de responder y ofrece WhatsApp.
6. Solo si todo pasa: decidir la oferta comercial de Stella y, si quieres, `STELLA_SITE_WIDGET=on` en Production. **Antes, revisar la ficha de la Stella de LOCALIS** (`src/lib/stella/builtin.ts`): ya usa los precios de referencia y no ofrece auditorías.

## 5. Dominio, correo, SEO y Google

**Dominio.** Tres recomendaciones con disponibilidad, precio y **riesgo de marca** (hay empresas con nombres casi idénticos, entre ellas una agencia «Localis.ai») en el documento interno `COMERCIAL-INTERNO.md` (guardado FUERA del repositorio, porque este es público) §4. No se ha comprado nada. Tras comprar: Vercel → Settings → Domains → Add → copiar los registros DNS que muestre → esperar «Valid» → `NEXT_PUBLIC_SITE_URL=https://tudominio` en Production → Redeploy.

**Correo / Resend.** El remitente actual es `onboarding@resend.dev`: Resend solo entrega a tu propia dirección. **Los avisos a ti funcionan; la confirmación automática al cliente que deja su email no le llegará** hasta verificar un dominio: Resend → Domains → Add → registros SPF/DKIM en el DNS → Verify → `EMAIL_FROM=LOCALIS AI <avisos@tudominio>` en Vercel → Redeploy → botón de prueba de `/admin/entorno`.

**Search Console.** Sitemap y verificación por etiqueta HTML (`GOOGLE_SITE_VERIFICATION`) listos en código; **no verificado ni enviado** (requiere tu cuenta). Pasos exactos en `ESTADO-FINAL-LOCALIS.md` §6; hazlo con el dominio definitivo.

**Google Business Profile.** No se ha tocado nada. Igualar nombre, teléfono, horario y web con `/contacto`. **No subas las imágenes de `public/google-business-assets/`** tal cual: incluyen piezas que muestran GPS de reparto, panel de control, Stella y «sin comisiones» como servicios disponibles. Usa solo logo y portada revisados.

## 6. Textos: qué se ha corregido y qué queda

Corregido en esta ronda: Tarifas con los precios de referencia; FAQ; mensaje de WhatsApp; emails de aviso y de confirmación; página 404; ficha de la Stella de LOCALIS (sin auditoría gratuita ni precios antiguos); Aviso legal (servicio real, sin enlace a otro dominio, sin datos inventados) y Política de privacidad (finalidades); imagen para compartir en redes (`og-image.png` regenerada: ya no dice «Stella 24/7, citas, facturas, GPS, 0 % comisiones»); manifest de la app y palabras clave; formulario de contacto. Se eliminaron componentes antiguos sin uso que contenían precios y promesas viejas.

Queda (sin impacto público): estados internos de oportunidades del panel («Auditoría lista»); código antiguo del configurador previo (`src/components/configurator/*Model.ts`) que ya no se muestra en ninguna página; las imágenes de Google Business Profile del punto anterior.
