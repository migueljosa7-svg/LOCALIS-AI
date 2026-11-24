# Qué se puede vender ya y qué no · LOCALIS AI (24-nov-2026)

Criterio: solo se vende lo que **funciona de verdad y está probado**. «Probado» aquí significa probado en local y con simulaciones; ver las pruebas reales pendientes al final.

## Se puede vender (tras las comprobaciones de «Antes de vender»)

| Producto | Qué recibe el cliente | Cómo se contrata y entrega |
| --- | --- | --- |
| **Web profesional** (Web Esencial, con tus tarifas publicadas) | Web con formulario de presupuesto, botón de WhatsApp, enlaces a Google Maps y SEO local | 1) El cliente diseña su web en `/disena-tu-web` y pulsa «Quiero esta web» (o la pides tú desde auditoría). 2) Recibes el diseño completo en `/admin/diseno`. 3) Tú preparas el presupuesto definitivo y lo envías. 4) Aceptación por escrito → fase «Aceptada» → «En construcción» → «Entregada». Ver `docs/CONFIGURADOR-GUIA.md` |
| **Configurador visual** como herramienta de captación | El cliente llega con las decisiones tomadas: ahorra tiempo en la toma de requisitos | Ya incluido en el paso anterior |
| **Stella (chat con IA en la web del negocio)** — *solo cuando la prueba real con Anthropic esté hecha* | Asistente que responde con la ficha del negocio, reconoce lo que no sabe, ofrece WhatsApp y recoge contactos con consentimiento | Lo pide en «Quiero Stella en mi web» (queda como pedido en `/admin`) → alta con enlace de incorporación → instalación (una línea) → activación. Ver `docs/ALTA-CLIENTES.md` y `docs/STELLA-GUIA.md` |
| **Botones de ubicación** (ver en el mapa, cómo llegar, desde mi ubicación) | En la web diseñada, gratis y sin claves | Incluido en la sección «Ubicación y mapa» |
| **Mantenimiento** | Actualizar contenido y ficha de Stella | Servicio manual tuyo: la plataforma te da el panel, no automatiza el servicio. Define precio y alcance tú |

## NO se puede vender todavía (no funciona o es una simulación)

| Función | Estado real |
| --- | --- |
| GPS y seguimiento de repartidores, flota, enlace de seguimiento | **Simulación** en la home. No existe |
| Citas, reservas, calendario (Google Calendar) | **No existe** |
| WhatsApp automático / WhatsApp Business integrado | **No existe**: solo hay un botón que abre WhatsApp |
| Facturación, facturas PDF | **Simulación** en la demo |
| Panel de control para clientes, métricas | **Simulación** |
| Catálogo con pedidos, tienda online con pagos | **No existe** |
| Cobros automáticos / contratación online con pago | **No existe**: todo se acuerda y cobra a mano |

Estas funciones aparecen en la web como «en desarrollo» o «demostración». No las prometas en presupuestos, y en el configurador solo se anotan como interés del cliente (no se presupuestan ni se cobran).

## Qué cuesta mantenerlo (servicios externos)

| Servicio | Para qué | Coste |
| --- | --- | --- |
| Vercel | Alojar la web | Hobby es **no comercial**: para vender conviene el plan de pago (decisión tuya; no se ha cambiado nada) |
| Supabase | Base de datos y almacén de imágenes | Plan gratuito con límites; revisar al crecer |
| Resend | Emails de aviso | Gratuito con límites; sin dominio verificado solo entrega a tu email |
| Anthropic | IA de Stella | Por uso. Haiku 5.5: ≈ 0,0002–0,0005 $ por mensaje (verifícalo en su web). Hay topes por negocio y globales, y el límite de gasto de tu cuenta |
| Google Maps (enlaces) | Mapas y rutas en las webs | Gratis (enlaces); una API de mapas de pago **no** se usa |
| Dominio propio | Remitente de emails y marca | A tu cargo, pendiente de decidir |

## Antes de vender (lista de comprobación)

1. [ ] `supabase/stella.sql` y `supabase/configurador.sql` ejecutados en tu Supabase.
2. [ ] Variables en **Production**: `ADMIN_USER`, `ADMIN_PASSWORD` (16+), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`; para Stella: `ANTHROPIC_API_KEY` y `STELLA_SITE_WIDGET=on`. Comprobarlas en `/admin/entorno`.
3. [ ] **Prueba real de Stella con Anthropic** (cuando haya crédito): `/admin/stella/diagnostico` y el negocio de prueba. Hasta entonces, no vender Stella como operativa.
4. [ ] Prueba real del configurador con tu Supabase: enviar un diseño con una imagen y verlo en `/admin/diseno`.
5. [ ] Decidir y publicar precios definitivos (la oferta recomendada sigue pendiente de tu aprobación) y condiciones; revisión legal de privacidad y condiciones.
6. [ ] Plan de Vercel adecuado para uso comercial.

## Documentación para el cliente

- Estimación, alcance y qué incluye cada servicio: lo que muestra el configurador (precio definido / extra opcional / pendiente de valoración / no disponible).
- Instalación de Stella: una línea de código (se la das desde la ficha del negocio) y el enlace de incorporación.
- Qué datos trata el chat y cómo se guarda el consentimiento: política de privacidad de la web (pendiente de revisión legal).
