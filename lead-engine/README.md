# Lead Engine v1 — investigación de oportunidades

Versión manual-asistida: **Gemini investiga, una persona revisa, el script valida y carga en el CRM** (`/admin`).
No envía mensajes a nadie: el contacto comercial siempre lo aprueba y lo hace una persona.

## Flujo (30–45 min por tanda de 10 empresas)

1. Copia `plantilla-oportunidades.csv` a `investigacion-AAAA-MM-DD.csv` (los CSV de investigación no se suben a GitHub).
2. Pega el **prompt de investigación** (abajo) en Gemini, indicando sector y localidad.
3. **Revisa tú cada fila**: abre `source_url` y la web. Si algo no se puede comprobar, márcalo `hipotesis` o borra la fila.
4. Simula: `node scripts/import-opportunities.mjs lead-engine/investigacion-AAAA-MM-DD.csv`
5. Si no hay errores, importa: añade `--apply` (requiere `.env.local` con las claves de Supabase).
6. En `/admin`, trabaja las de prioridad **alta**: prepara la auditoría y la propuesta (plantillas abajo).

## Columnas

| Columna | Obligatoria | Qué poner |
| --- | --- | --- |
| company | sí | Nombre comercial tal como aparece en la fuente |
| locality | sí | Municipio (Zaragoza, Utebo, Cuarte de Huerva…) |
| sector | sí | Taller, Instalador, Reformas, Clínica, Fisioterapia, Estética, Restaurante… |
| website | no | URL completa. **Vacío = no tiene web** |
| source_url | sí | Dónde se ha visto la empresa (ficha pública de Google Maps, directorio, web) |
| problem | sí | Un problema concreto (p. ej. «la web no se adapta al móvil») |
| evidence | sí | Lo que se ha visto exactamente (p. ej. «texto cortado en móvil, captura del 23/11») |
| evidence_type | sí | `hecho` (comprobado) o `hipotesis` (probable, sin comprobar) |
| recommended_service | sí | `Web Captación Local` o `Web Captación Pro` (solo servicios que entregamos hoy) |
| next_step | no | Siguiente acción propuesta |
| researched_at | no | AAAA-MM-DD (por defecto, hoy) |
| mobile_ok, https, has_contact_cta | no | `si` / `no` / vacío si no se sabe |
| google_rating, google_reviews | no | Nota y número de reseñas públicas |

## Puntuación (0–100) — `scripts/import-opportunities.mjs`

| Señal | Puntos |
| --- | --- |
| No tiene web | +40 |
| Tiene web pero no se adapta al móvil | +25 |
| Web sin HTTPS | +10 |
| Sin formulario ni botón de WhatsApp | +15 |
| 20 reseñas o más (negocio activo) | +10 |
| Nota de 4 o más | +5 |
| Problema comprobado (`hecho`) | +5 |

Prioridad: **alta** ≥ 60 · **media** 35–59 · **baja** < 35.

## Prompt de investigación para Gemini

```
Actúa como analista comercial. Busca negocios REALES de [SECTOR] en [LOCALIDAD], Aragón,
usando solo fuentes públicas (Google Maps, sus webs, directorios públicos).

Para cada negocio (máximo 10) devuelve UNA fila en formato CSV separado por punto y coma con
estas columnas exactas:
company;locality;sector;website;source_url;problem;evidence;evidence_type;recommended_service;next_step;researched_at;mobile_ok;https;has_contact_cta;google_rating;google_reviews

Reglas obligatorias:
- No inventes negocios, webs, teléfonos, reseñas ni problemas. Si no puedes comprobar un dato, déjalo vacío.
- source_url debe ser una URL pública donde se vea el negocio.
- evidence_type = "hecho" solo si lo has comprobado en la fuente; si no, "hipotesis".
- No incluyas datos personales (nombres de empleados, móviles particulares, emails personales).
- recommended_service solo puede ser "Web Captación Local" o "Web Captación Pro".
- researched_at = fecha de hoy en formato AAAA-MM-DD.
Devuelve solo el CSV, sin explicaciones.
```

## Plantilla de auditoría (para una oportunidad de prioridad alta)

1. **Lo que hemos visto** (solo hechos, con fecha): …
2. **Qué le cuesta al negocio** (en lenguaje del cliente): «los clientes que buscan "taller en Delicias" desde el móvil no encuentran cómo pedir cita».
3. **Propuesta**: Web Captación Local — páginas, formulario, WhatsApp, Google Maps, SEO básico. Precio cerrado y plazo.
4. **Siguiente paso**: llamada de 15 minutos o visita.

## Reglas legales (RGPD y LSSI)

- Solo datos de **empresas** obtenidos de fuentes públicas; nada de datos personales de empleados.
- **No enviar emails comerciales no solicitados** (art. 21 LSSI). Primer contacto: llamada al teléfono público del negocio, visita o formulario de contacto de su web, siempre identificándose.
- Atender cualquier petición de no ser contactado y anotarla como `descartada`.
- Respetar las condiciones de uso de cada fuente: nada de scraping automatizado de Google Maps.
