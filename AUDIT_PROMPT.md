# Role
**Lead Full-Stack QA & Next.js Architect** — revisión técnica exhaustiva, corrección de consistencia de nombres, cálculos numéricos y limpieza de codigo/tooling.

# Target Repository
**https://github.com/migueljosa7-svg/LOCALIS-AI.git**
- Working directory: `c:\Users\migue\Desktop\LOCALIS AI\LOCALIS-AI`
- Branch: `main` / `origin/main`
- Stack: Next.js 15 (App Router), TypeScript strict, Tailwind CSS, React 19

# Objective
Aplicar las correcciones de la auditoría técnica ejecutiva **en un único pase**:
1. Unificar el nombre de la IA a **Stella** (eliminar referencias a "Marta").
2. Revisar y corregir la calculadora de ROI (coherencia matemática).
3. Repasar datos de contacto/corporativos (email, teléfono, empresa).
4. Eliminar dependencias muertas y añadir scripts de calidad (`lint`).
5. Verificar/typecheck/build, confirmar 0 errores, hacer commit y push a origin/main.

---

# TASK 1 — CORRECCIÓN DE TEXTOS, ENCODING Y NOMENCLATURA DE IA

## 1.1. Nuevo nombre de IA: **Stella**
- Buscar y eliminar **toda** referencia residual a "Marta" u otros nombres antiguos.
- Revisar en: `README.md`, `package.json`, `public/*`, `stella-dump.txt`, `tsc-check.txt`, `check.ts` (ficheros temporales).
- Reemplazar **marta**, **Marta**, **STELLA**, **stella**, **STELLA AI** → **Stella** consistentemente.
- Revisar respuestas simuladas de `StellaConsole.tsx` y mocks de datos para asegurar tildes correctas:
  - "facturación", "gestiona", "calendario", "resumen", "métricas", "operativas", "directión", "correo", "apellidos", "telefono", etc.

## 1.2. Spell-check global
- Leer todos los componentes principales (`src/components/`, `src/app/`, `src/lib/`) buscando tildes mal escritas, comillas rotas o strings vacíos.
- Corregir: "facturación", "gestionar", "calendario", "resumen", "métricas", "operativas", "dirección", "correo", "apellidos", "telefono", "página", "seguridad", "privacidad", "cookies", "legal", "acompañante".

---

# TASK 2 — RECALIBRACIÓN DE LA CALCULADORA DE ROI

## 2.1. Coherencia matemática
Abrir `src/components/gps/RoiCalculator.tsx` y verificar que las métricas guardan exacta coherencia matemática:

- **Comisiones tradicionales** (Glovo/Uber Eats, 30%):  
  `monthlyVolume = orders * ticket`  
  `traditionalFee = monthlyVolume * 0.30`
- **Comisiones LOCALIS AI**: 0% comisión por pedido (solo tarifa plana fija `PLAN_FLAT = 49 EUR`).
- **Ahorro mensual**:  
  `monthlySave = max(0, traditionalFee - PLAN_FLAT)`
- **Ahorro anual**:  
  `yearlySave = monthlySave * 12`

## 2.2. Verificación visual
- Confirmar que `MapPanel.tsx` y `GpsModuleSection.tsx` consumen los mismos datos (`savedEuro`, `distance`, `etaMin`, `speedKmh`) y que los números coinciden con el cálculo de la calculadora.
- Garantizar que los indicadores del ROI coinciden con los datos del resumen.
- Confirmar que `onChange` de los inputs (`setOrders`, `setTicket`) funciona correctamente.
- Verificar que `maxBar = 60000` no causa overflow en la barra de progreso.

# TASK 3 — DATOS DE CONTACTO Y CONFIGURACIÓN CORPORATIVA

## 3.1. Unificar datos de contacto
- Revisar `src/lib/mockData.ts`, `src/components/Footer.tsx`, `src/components/lead/LeadCaptureModal.tsx` y páginas legales (`src/app/(legal)/*/page.tsx`).
- Configurar datos oficiales de la empresa (o el sandbox proporcionado):
  - **Empresa**: LOCALIS AI
  - **Email**: `hola@localis.ai` (u `info@localis.ai`, según definido oficialmente)
  - **Teléfono**: `+34 912 345 678` (u el oficial)
  - **Dirección**: `C/ Demo 1, 28001 Madrid, España` (u dirección oficial)
  - **Localización**: si se usa para Google Business Profile (Zaragoza o Madrid), la misma que en el resto de la web.

## 3.2. Consistencia global
- Buscar cadenas de email/teléfono en todo el repo; asegurar **solo una variante** de cada uno:
  - `mailto:hola@localis.ai` o `mailto:info@localis.ai` (una sola)
  - `tel:+34912345678` o `tel:+34 912 345 678` (una sola)
- Reemplazar cualquier variante mixta por la estándar elegida.

---

# TASK 4 — LIMPIEZA DE DEPENDENCIAS Y SCRIPTS DE CALIDAD

## 4.1. Eliminar dependencias muertas
- **Uninstall** en `package.json`: `leaflet`, `react-leaflet`, `@types/leaflet`.
- Confirmar que `package.json` no refleje la eliminación (no queden referencias).
- Reconstruir `package-lock.json` ejecutando `npm install` (si es necesario).

## 4.2. Scripts de calidad en `package.json`
Añadir los scripts de calidad:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "typecheck": "tsc --noEmit",
  "lint": "next lint"
}
```

## 4.3. Limpiar `.gitignore`
Asegurar que `.gitignore` excluye ficheros temporales de build:
```
.next/
tsc-check.txt
stella-dump.txt
*.tsbuildinfo
```

---

# TASK 5 — VERIFICACIÓN Y COMPILACIÓN

## 5.1. Comandos de verificación
1. **Uninstall dependencias**:  
   `npm uninstall leaflet react-leaflet @types/leaflet`
2. **TypeScript check**:  
   `npx tsc --noEmit` — debe salir sin errores (exit code 0).
3. **Build production**:  
   `npm run build` — debe compilar exitosamente.

## 5.2. Criterios de aceptación
- [ ] `npx tsc --noEmit` → 0 errores
- [ ] `npm run build` → exit code 0, todas las rutas generadas
- [ ] Sin advertencias de consola en `build` (ni en `dev`)
- [ ] Sin dependencias muertas en `package.json`

---

# COMMIT Y PUSH

## 5.3. Git
1. **Commit** con mensaje descriptivo:
   ```
   feat: unify AI name to Stella, fix ROI calculator, clean dead deps, add lint scripts
   ```
2. **Push** a `origin/main`:
   ```
   git push origin main
   ```

---

# RICOS PARA EL REPORTE FINAL

1. **100% pulida visualmente**: Sin fallos ortográficos, con Stella unificado, calculadora de ROI con matemáticas exactas.
2. **Optimizado para Google Business Profile**: Con datos de contacto unificados y SEO impecable.
3. **Código ultra-limpio**: Sin dependencias muertas, sin errores en consola, con scripts de calidad explicados.

## Gracias
Gracias por la oportunidad de implementar esto. El código está listo para desplegar.