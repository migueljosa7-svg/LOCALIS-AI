import WhatsAppIcon from "./WhatsAppIcon";
import { CONTACT, waLink } from "@/lib/site";

// Botón flotante de WhatsApp (escritorio). En móvil lo cubre MobileStickyBar.
export default function WhatsAppFloat() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Escribir por WhatsApp a LOCALIS AI (${CONTACT.phoneDisplay})`}
      className="no-print hidden md:inline-flex fixed bottom-6 right-6 z-[55] items-center gap-2 pl-4 pr-5 py-3.5 rounded-full bg-[#25D366] text-[#05210f] font-bold text-sm shadow-[0_12px_32px_-8px_rgba(37,211,102,0.55)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
    >
      <WhatsAppIcon size={22} />
      WhatsApp
    </a>
  );
}
