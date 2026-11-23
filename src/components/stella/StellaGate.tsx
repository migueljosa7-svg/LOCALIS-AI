import WhatsAppFloat from "@/components/WhatsAppFloat";
import StellaLauncher from "./StellaLauncher";
import { getBusiness, stellaEnabled } from "@/lib/stella/businesses";

// Con ANTHROPIC_API_KEY configurada, la web muestra a Stella (que incluye WhatsApp).
// Sin ella, todo queda como antes: solo el botón flotante de WhatsApp.
export default function StellaGate() {
  const b = getBusiness("localis");
  if (!stellaEnabled() || !b) return <WhatsAppFloat />;
  return <StellaLauncher config={{ id: b.id, name: b.name, greeting: b.greeting, whatsapp: b.whatsapp, privacyUrl: b.privacyUrl }} />;
}
