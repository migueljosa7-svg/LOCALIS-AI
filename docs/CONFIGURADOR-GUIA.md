# Guía B · Cómo gestionar los pedidos de «Diseña tu web»

El cliente entra en **`/disena-tu-web`**, diseña su web (colores, letras, botones, imágenes, secciones y orden) viendo el resultado en directo en ordenador, tablet y móvil, y pulsa **«Quiero esta web»**. Tú recibes **todas sus decisiones**, no solo un mensaje.

---

## 0. Preparación (una sola vez)

1. **Copia de seguridad.** Supabase → **Table Editor** → tabla `leads` → **Export → CSV** y guárdala. (El script no toca tus datos, pero así tienes copia.)
2. Supabase → **SQL Editor → New query** → pega **todo** `supabase/configurador.sql` → **Run**. Es seguro repetirlo. Crea:
   - la tabla `design_requests` (el diseño completo de cada solicitud);
   - el almacén **privado** `design-uploads` para las imágenes de los clientes (solo JPG, PNG o WebP, máx. 2 MB cada una; nadie puede verlas sin tu usuario y contraseña).
3. Comprobación: en **Table Editor** aparece `design_requests`; en **Storage** aparece el bucket `design-uploads` marcado como **Private**.
4. No hay variables nuevas en Vercel: usa las mismas de la captación de leads (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USER`, `ADMIN_PASSWORD`, `RESEND_API_KEY`, `LEAD_INBOX_EMAIL`).

> **Si todavía no has ejecutado el SQL:** el pedido **no se pierde**. Te llega igualmente como lead, con el resumen y el **briefing técnico completo** en el campo «prompt técnico». Lo único que no tendrás es la vista visual del diseño ni las imágenes.

---

## 1. Dónde recibo cada solicitud

| Dónde | Qué ves |
| --- | --- |
| **Email** (a `LEAD_INBOX_EMAIL`) | Asunto «Nueva solicitud: *Negocio* (**Web diseñada por el cliente** · *sector*)». Incluye resumen y el briefing técnico. |
| **`/admin`** → Leads | La fila tiene el origen `disena-tu-web` y un botón **«VER SU WEB DISEÑADA →»** |
| **`/admin/diseno`** | Lista de todos los diseños con su **fase** (Recibida, En revisión, Presupuesto enviado, Aceptada, En construcción, Entregada, Descartada) |

El cliente recibe automáticamente el email de «hemos recibido tu solicitud» (el mismo de los demás formularios). **No se envía nada más** y no se cobra nada.

---

## 2. Abrir la configuración del cliente

`/admin/diseno/<id>` (desde el botón del lead). Verás:

1. **«Así quiere su web»**: su web, construida con sus decisiones, con botones para verla en **Ordenador / Tablet / Móvil**. Puedes pulsar sus botones, el menú, el carrusel…
2. **Decisiones de diseño**: los 6 colores con su código (#rrggbb), paleta, tipografías, tamaños, cabecera y portada, número de páginas, galería y carrusel.
3. **Secciones, en el orden elegido** (las desactivadas aparecen tachadas).
4. **Botones**: texto, qué hacen, estilo, forma, color y **dónde** van. Si falta un dato (teléfono, WhatsApp, enlace) aparece **«Pendiente de configuración»**: el cliente no lo dio y tú no debes inventarlo.
5. **Su negocio**: nombre, ciudad, frase principal, descripción, servicios, teléfono, WhatsApp, email, dirección, redes, dominio, objetivo, comentarios, si quiere **Stella** y qué funciones futuras le interesan.
6. **Imágenes propias**: las que subió (servidas solo a ti, con contraseña).
7. **Estimación orientativa**: con cada línea etiquetada **Precio definido / Extra opcional / Pendiente de valoración / Aún no disponible**.

**Exportar:** *Descargar informe (HTML)* (un archivo que se abre en cualquier navegador, con su diseño y sus imágenes dentro; sirve para enviárselo o archivarlo), *Datos (JSON)* y *Imprimir / PDF*.

---

## 3. Revisar su diseño (checklist)

- [ ] **Textos de ejemplo.** Lo que el cliente no escribió aparece como «Texto de ejemplo»: pídele el contenido real.
- [ ] **Botones pendientes.** Pídele el teléfono/WhatsApp/enlace que falte.
- [ ] **Imágenes.** ¿Son suyas o tiene derecho a usarlas? Las de ejemplo son solo marcadores (ilustraciones nuestras): **no se publican**; hay que sustituirlas por fotos reales.
- [ ] **Contraste y legibilidad** de sus colores en móvil y ordenador.
- [ ] **Dominio.** ¿Tiene? Si no, lo ves con él.
- [ ] **Secciones que necesitan contenido** (opiniones reales, equipo, preguntas frecuentes): no se inventan opiniones.
- [ ] **Stella.** Si la pidió, se presupuesta aparte (ver Guía A).
- [ ] Marca la solicitud como **«En revisión»**.

---

## 4. Preparar el presupuesto definitivo

La estimación de la pantalla usa **solo las tarifas que ya tienes publicadas** (Web Esencial, páginas extra y tope cerrado). Para el presupuesto definitivo:

1. Parte del **«Precio definido»** (base + páginas extra, con el tope).
2. Valora a mano lo marcado **«Pendiente de valoración»** (galería/carrusel, tratamiento de imágenes propias, logotipo, dominio y alojamiento).
3. Añade los **«Extras opcionales»** (Stella, si la pidió).
4. Lo marcado **«Aún no disponible»** (reservas, tienda con pagos, pedidos, WhatsApp automático) **no se presupuesta ni se cobra**: solo queda anotado como interés para avisarle cuando exista.
5. Envíaselo tú (email o WhatsApp) con el informe HTML si quieres. **Nada de esto es automático.**
6. En la solicitud: fase **«Presupuesto enviado»** y anota en «Notas internas» el importe y la fecha.

> Aclara siempre al cliente que el diseño es una **solicitud**: se revisa antes de construir y la web final puede ajustarse (no se promete que quede exactamente igual).

---

## 5. Aceptar el proyecto y pasarlo a construcción

1. Cuando el cliente **acepte por escrito** (email o WhatsApp): fase **«Aceptada por el cliente»** y, en `/admin`, el estado del lead pasa a **«ganado»** (propuesta → ganado).
2. Cobra y factura tú, como siempre (el sistema no cobra nada).
3. Para construir: abre el diseño y usa **Datos (JSON)**, el **informe HTML** y el **«prompt técnico»** del lead (en `/admin`, «Ver prompt técnico»). Ese briefing contiene colores, tipografías, secciones en orden, botones con su estado, imágenes, textos y presupuesto, listo para pasárselo a quien construya la web.
4. Fase **«En construcción»**.

---

## 6. Dónde cambio el estado (hay dos, y sirven para cosas distintas)

| Estado | Dónde | Para qué |
| --- | --- | --- |
| **Estado del lead** (nuevo, contactado, propuesta, ganado, perdido) | `/admin` → fila del lead | Seguimiento comercial |
| **Fase del diseño** (recibida … entregada, descartada) + **notas internas** | `/admin/diseno/<id>` → «Fase de la solicitud» | Seguimiento del trabajo de la web |

---

## 7. Entregar la web

1. Antes de publicar: contenido real del cliente, imágenes con derechos, botones con sus datos reales, revisión en móvil/tablet/ordenador.
2. Enseña al cliente la web **antes** de publicarla y consigue su OK por escrito.
3. Publica y comprueba formulario y botones reales.
4. Fase **«Entregada»** y nota con la fecha.
5. Si contrata mantenimiento o Stella, sigue la **Guía A**.

---

## 8. Qué hace el sistema y qué haces tú

| El sistema… | Tú… |
| --- | --- |
| Valida y guarda el diseño completo y las imágenes (en almacén privado) | Revisas el diseño y pides lo que falta |
| Te avisa por email y crea el lead enlazado a su diseño | Preparas y envías el presupuesto definitivo |
| Calcula la estimación orientativa con las tarifas existentes | Decides el precio final y cobras |
| Frena abusos (límite por persona y hora, trampa anti-robots, validación de imágenes) | Aceptas el proyecto y lo pasas a construcción |
| Envía solo el «hemos recibido tu solicitud» al cliente | Entregas la web |

---

## 9. Seguridad de lo que sube el cliente

- Solo **JPG, PNG o WebP**, comprobados por su **contenido real** (no por el nombre): se rechaza SVG, GIF, HTML, ejecutables, etc.
- Se **reducen en el navegador** (máx. 1.600 px) y hay límite de tamaño y de número (5 imágenes propias).
- Se guardan **como archivos** en un almacén **privado**, no dentro de la base de datos. Solo se ven en `/admin` con tu usuario y contraseña.
- Todo lo que llega se **sanea** en el servidor (listas blancas para cada opción, colores solo #rrggbb, enlaces solo `https://`).
- Máximo **5 solicitudes por hora y persona** (se guarda una huella no reversible, nunca la IP).

---

## 10. Problemas frecuentes

| Síntoma | Causa y solución |
| --- | --- |
| `/admin/diseno` dice «No se pudo leer» | No has ejecutado `supabase/configurador.sql` |
| El lead dice «Diseño solo en el prompt técnico» | Llegó antes de ejecutar el SQL (o falló la base de datos): todo el diseño está en el «prompt técnico» del lead |
| «imagen(es) del cliente no se pudieron guardar» | Falta el bucket `design-uploads` (ejecuta el SQL) o falló el envío: pídele las fotos por WhatsApp |
| El cliente dice que no puede enviar | Revisa el mensaje que ve (límite por hora, imagen no válida…) |

---

## 11. Pruebas incluidas

- `npm test`: 23 pruebas automáticas (incluye ejecutar el SQL real en un PostgreSQL de pruebas).
- `npm run test:e2e`: ~100 comprobaciones en un **Chrome real** (escritorio, tablet y móvil): editor completo, previsualización, subida de imágenes, envío, guardado en base de datos y almacén, panel y ataques típicos. Usa un Supabase **simulado** (no tus datos).
- `npm run check`: tests + lint + TypeScript + build.
