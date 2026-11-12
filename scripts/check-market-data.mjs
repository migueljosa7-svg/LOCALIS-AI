// Aviso de caducidad de los precios de mercado (src/lib/marketPrices.ts).
// No rompe el build: solo recuerda revisar las fuentes cada 90 días.
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/lib/marketPrices.ts", import.meta.url), "utf8");
const match = src.match(/REVIEWED_AT\s*=\s*"(\d{4}-\d{2}-\d{2})"/);
if (!match) {
  console.error("✖ No se encuentra REVIEWED_AT en src/lib/marketPrices.ts");
  process.exit(1);
}
const days = Math.floor((Date.now() - Date.parse(match[1])) / 86_400_000);
if (days > 90) {
  console.warn(`⚠ Los precios de mercado se revisaron hace ${days} días (${match[1]}). Revisa las fuentes y actualiza src/lib/marketPrices.ts.`);
} else {
  console.log(`✔ Precios de mercado revisados hace ${days} días (${match[1]}).`);
}
