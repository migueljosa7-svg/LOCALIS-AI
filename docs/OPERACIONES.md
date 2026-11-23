# Operaciones — activar la captación de leads

Rama: `feat/captacion-segura`. Nada de esto afecta a producción hasta que se fusione con `main`.

## Qué cambia

- Cada lead se **guarda en Supabase** (tabla `leads`) y además se avisa por email (Resend).
- Si no se puede guardar **ni** avisar, el formulario muestra un error real con WhatsApp como alternativa (antes decía «recibido» aunque se perdiera).
- Panel interno en `/admin` (usuario + contraseña) con leads y oportunidades, estado y notas.
- Lead Engine v1: `lead-engine/README.md` + `scripts/import-opportunities.mjs`.
- Textos de la web: Stella, GPS, panel y módulos marcados como **demostración / en desarrollo**.

## 1. Supabase (gratis) — 10 minutos

1. Crea cuenta en supabase.com → **New project** (región: Europe, p. ej. Frankfurt o París). Guarda la contraseña de la base de datos en tu gestor de contraseñas.
2. **SQL Editor → New query** → pega el contenido de `supabase/schema.sql` → **Run**. Incluye los permisos (`GRANT`) que Supabase exige desde octubre de 2026: sin ellos la API responde `42501 permission denied`.
   - Si ya habías creado las tablas antes de este cambio, ejecuta también `supabase/fix-permisos.sql` (no toca los datos). La consulta final debe mostrar 8 filas de `service_role`.
3. **Project Settings → API Keys**: copia la `Project URL` (`https://<proyecto>.supabase.co`) y una clave secreta: la **Secret key** (`sb_secret_…`, recomendada) o la antigua **service_role** (`eyJ…`, Supabase la retira a finales de 2026). Nunca la clave *publishable* ni la *anon*.
4. Plan gratuito: un proyecto se pausa tras unos 7 días sin actividad; cada lead y cada visita al panel cuentan como actividad. Si se pausa, se reactiva desde el panel de Supabase.

## 2. Variables en Vercel — 5 minutos

Vercel → proyecto → **Settings → Environment Variables** (marca *Production* y *Preview*):

| Variable | Valor |
| --- | --- |
| `SUPABASE_URL` | Project URL de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key `sb_secret_…` o service_role `eyJ…` (nunca con prefijo `NEXT_PUBLIC_`) |
| `ADMIN_USER` | el usuario que quieras |
| `ADMIN_PASSWORD` | contraseña de **16 caracteres o más**, generada por tu gestor |
| `RESEND_API_KEY` | ya creada |
| `LEAD_INBOX_EMAIL` | email donde quieres recibir los avisos |

Nunca pegues estas claves en chats, en GitHub ni en documentos.

## 3. Resend — remitente

- Con el remitente de prueba `onboarding@resend.dev`, Resend **solo entrega al email de tu propia cuenta**: los avisos te llegan, pero la confirmación al cliente falla.
- Para escribir a clientes hay que **verificar un dominio propio** (registros DNS SPF y DKIM) y poner `EMAIL_FROM="LOCALIS AI <avisos@tudominio.es>"`. Requiere comprar dominio (decisión tuya).
- Mientras tanto: `LEAD_INBOX_EMAIL` = el email de tu cuenta de Resend.

## 4. Probar en la vista previa (antes de producción)

1. Haz push de la rama: Vercel crea una URL de *preview*.
2. En la preview, envía el formulario de auditoría con tus propios datos.
3. Comprueba: aparece en `/preview-url/admin` (usuario y contraseña) y te llega el email de aviso.
4. Cambia el estado del lead en el panel y recarga: debe mantenerse.
5. Si todo está bien, fusiona con `main` (producción). **Solo con tu aprobación.**

## 5. Vuelta atrás

Vercel → **Deployments** → el despliegue anterior → **Promote to Production**. Los datos de Supabase no se pierden.

## 6. Coordinación de herramientas

- Una sola herramienta modifica el repositorio a la vez. Antes de empezar: `git pull` y rama nueva `tipo/descripcion`.
- Claude: arquitectura y desarrollo en ramas. Antigravity: implementación y pruebas en ramas distintas. Gemini: investigación (no toca el repositorio).
- Nada se fusiona en `main` sin `npm run check` en verde y tu aprobación.
