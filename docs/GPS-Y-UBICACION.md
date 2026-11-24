# GPS, ubicación y mapas · qué es real y qué es simulación

Auditoría del código a 24-nov-2026. **No hay ninguna función de GPS real de reparto.** Lo único real en el navegador es lo que se añadió en esta versión para las webs de los clientes.

## Qué existe

| Función | Dónde | ¿Real o simulación? |
| --- | --- | --- |
| Mapa de reparto con repartidores, rutas, ETA y «seguimiento en directo» | Sección «Módulo GPS» de la home (`GpsModuleSection`, `TelemetryMap`) | **SIMULACIÓN**. Repartidores, pedidos y rutas ficticios y animados. Está etiquetada «Demostración · Módulo GPS en desarrollo» |
| Mapa con teselas de Zaragoza y marcadores | Consola demo de Stella (`LiveMap`, Leaflet) | **Mapa real, datos de ejemplo**. Las teselas son reales; los marcadores y la ruta son ficticios |
| Seguimiento de repartidores, flota, enlace de seguimiento para el cliente final | Planes «Pro» (marcados «en desarrollo») | **NO EXISTE**. Pendiente de desarrollo |
| Geolocalización del visitante mediante el navegador | — | **No existía**. Ahora, solo en el bloque «Ubicación y mapa» de las webs diseñadas con el configurador (ver abajo) |

## Qué se ha implementado (real, gratis, sin APIs de pago)

En el bloque **«Ubicación y mapa»** de las webs de los clientes (configurador):

1. **«Ver en Google Maps»**: enlace que abre la dirección del negocio. **Mapas.**
2. **«Cómo llegar»**: enlace a la ruta hasta el negocio en Google Maps (el visitante escribe su origen). **Navegación/ruta, calculada por Google Maps**, no por nosotros.
3. **«Cómo llegar desde mi ubicación»** (opcional): pide permiso al navegador **una sola vez**, lee la posición **una única vez** y abre la ruta con ese origen. **Geolocalización.**

Garantías (comprobadas en un Chrome real, con tests):
- Solo funciona bajo **HTTPS** (o localhost); si no, lo explica.
- **No hay seguimiento continuo** (no se usa `watchPosition`).
- Si el usuario **deniega el permiso**, se muestra un mensaje claro y los otros dos botones siguen funcionando.
- Las **coordenadas no se envían ni se guardan** en LOCALIS: se usan solo en el dispositivo para construir el enlace.
- Sin dirección no se inventa ninguna ubicación.
- Cabecera `Permissions-Policy: geolocation=(self)`: solo nuestras páginas pueden pedir la ubicación (antes estaba bloqueada para todos).

## Diferencias que no hay que mezclar al vender

| Concepto | Qué es | ¿Lo ofrecemos? |
| --- | --- | --- |
| Geolocalización | Saber dónde está el visitante (con su permiso) | Sí, como botón opcional |
| Mapa | Ver un sitio en un mapa | Sí, con enlaces gratuitos. **No** se incrusta un mapa propio |
| Navegación / ruta | Cómo llegar de A a B | Sí, mediante enlace a Google Maps |
| Seguimiento de repartidores (GPS de flota) | Ver en vivo dónde va un repartidor | **No existe. No se vende** |

## Servicios externos y costes

| Servicio | Uso actual | Coste |
| --- | --- | --- |
| API de geolocalización del navegador | Botón «desde mi ubicación» | Gratis, sin clave |
| Enlaces de Google Maps (`google.com/maps/search` y `/dir`) | Ver y ruta | Gratis, sin clave ni cuenta |
| OpenStreetMap (enlace alternativo en el código, no mostrado) | — | Gratis |
| Teselas CARTO en la demo de Stella | Solo la demo (Leaflet) | **Revisa las condiciones de uso de CARTO antes de usarlas en un producto de pago**: pueden exigir licencia para uso comercial. No lo he podido verificar |

**Si en el futuro hiciera falta** un mapa incrustado o cálculo de rutas propio: Google Maps Platform, Mapbox u OpenRouteService/OSM son opciones. **No las he contratado ni integrado**, y sus precios y cuotas gratuitas cambian: hay que comprobarlos en el momento. Para el seguimiento real de repartidores haría falta además una app o dispositivo en cada repartidor y un servidor en tiempo real: es un proyecto aparte.

## Protección de datos

- No se guardan coordenadas de nadie.
- No hay seguimiento. La posición se lee solo al pulsar el botón y concederse el permiso.
- Aviso visible en la propia web: «Tu ubicación solo se usa en tu dispositivo para abrir la ruta: no la guardamos».
- Al abrir Google Maps, la persona sale a un servicio de Google con sus propias condiciones.
