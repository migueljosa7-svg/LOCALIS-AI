import Script from "next/script";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import StellaPendingLauncher from "./StellaPendingLauncher";
import { siteStatus } from "@/lib/stella/status";
import { waLink } from "@/lib/site";

// Stella en la web de LOCALIS:
//  · Chat REAL (widget /stella.js, el mismo que se instala en webs de clientes): solo con clave de IA y STELLA_SITE_WIDGET=on.
//  · Sin configurar, en Preview/local: botón flotante «pendiente de configuración» (no responde ni finge respuestas).
//  · Sin configurar, en producción: la web queda como siempre (botón flotante de WhatsApp), sin avisos.
export default function StellaGate() {
  const st = siteStatus();
  if (st.live) return <Script id="stella-widget" src="/stella.js" data-negocio="localis" data-bottom="84" strategy="lazyOnload" />;
  return (
    <>
      <WhatsAppFloat />
      {st.showPending && <StellaPendingLauncher checks={st.checks} waHref={waLink()} />}
    </>
  );
}
