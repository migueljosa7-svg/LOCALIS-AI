import { Calendar } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import { WA_AUDIT_TEXT, waLink } from "@/lib/site";

// Barra de conversión fija en móvil: siempre a un toque del contacto.
export default function MobileStickyBar() {
  return (
    <nav
      aria-label="Acciones rápidas"
      className="no-print md:hidden fixed inset-x-0 bottom-0 z-[60] glass-bar border-t border-white/10 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center gap-2 max-w-md mx-auto">
        <a href="#cita" className="btn btn-primary flex-1 min-h-[48px] px-2 text-[13px]">
          <Calendar size={16} aria-hidden="true" />
          Auditoría gratis
        </a>
        <a
          href={waLink(WA_AUDIT_TEXT)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn flex-1 min-h-[48px] px-2 text-[13px] bg-[#25D366] text-[#05210f]"
        >
          <WhatsAppIcon size={17} />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
