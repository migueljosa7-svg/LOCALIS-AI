import Script from "next/script";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { readConfig } from "@/lib/stella/config";

// Stella en la web de LOCALIS: SOLO si hay clave de la API Y se ha activado expresamente con
// STELLA_SITE_WIDGET=on. Sin eso la web queda exactamente como hoy (botón flotante de WhatsApp).
// Usa el mismo widget (/stella.js) que se instala en las webs de los clientes: una sola vía que probar.
export default function StellaGate() {
  const on = process.env.STELLA_SITE_WIDGET?.trim().toLowerCase() === "on" && readConfig().enabled;
  if (!on) return <WhatsAppFloat />;
  return <Script id="stella-widget" src="/stella.js" data-negocio="localis" data-bottom="84" strategy="lazyOnload" />;
}
