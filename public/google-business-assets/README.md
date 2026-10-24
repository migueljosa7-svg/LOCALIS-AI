# Recursos para Google Business Profile

Generados con `npm run assets:google` (script: `scripts/google-business-assets.mjs`).

| Archivo | Uso en Google Business | Medidas |
|---|---|---|
| logo-720x720.png | Logotipo (se muestra recortado en círculo) | 720×720 |
| logo-wordmark-1080x1080.png | Logo con nombre (redes sociales, Google Posts) | 1080×1080 |
| portada-2048x1152.png | Foto de portada | 2048×1152 (16:9) |
| servicio-*-1200x900.png | Fotos de servicios y publicaciones | 1200×900 (4:3) |
| ../og-image.png | Vista previa al compartir la web | 1200×630 |

Requisitos de Google: JPG o PNG, entre 10 KB y 5 MB, sin marcos ni texto excesivo en fotos
de producto. Para regenerar con capturas reales: `npm run build && npm start` y, en otra
terminal, `npm run assets:google` (o `BASE_URL=https://tu-dominio npm run assets:google`).
