import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import WhatsAppIcon from "./WhatsAppIcon";
import { CONTACT, waLink } from "@/lib/site";
import CookieSettingsButton from "./CookieSettingsButton";

const COLUMNS = [
  {
    title: "Soluciones",
    links: [
      { label: "Stella IA (en desarrollo)", href: "/plataforma/stella" },
      { label: "Reparto GPS (en desarrollo)", href: "/plataforma/reparto" },
      { label: "Diseña tu web y precio", href: "/disena-tu-web" },
      { label: "Qué incluye tu web", href: "/tarifas#web" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sectores", href: "/plataforma/sectores" },
      { label: "Tarifas", href: "/tarifas" },
      { label: "Preguntas frecuentes", href: "/tarifas#faq" },
      { label: "Auditoría gratuita", href: "/disena-tu-web#cita" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="cv-auto [contain-intrinsic-size:auto_520px] relative w-full border-t border-white/[0.07] bg-[#080B12]/80">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="LOCALIS AI · inicio">
              <BrandMark size={34} id="ftr" />
              <span className="font-display text-lg font-bold">
                LOCALIS <span className="gradient-text">AI</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
              Diseño web a precio cerrado para negocios de Zaragoza y Aragón. Webs que convierten visitas en clientes.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-sm font-semibold text-foreground mb-4">{col.title}</h2>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-muted hover:text-cyan-300 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 md:col-span-1">
            <h2 className="text-sm font-semibold text-foreground mb-4">Contacto</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 text-muted hover:text-cyan-300 transition-colors break-all">
                  <Mail size={15} className="text-cyan-400 shrink-0" aria-hidden="true" /> {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT.phoneE164}`} className="inline-flex items-center gap-2 text-muted hover:text-cyan-300 transition-colors">
                  <Phone size={15} className="text-cyan-400 shrink-0" aria-hidden="true" /> {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted hover:text-cyan-300 transition-colors">
                  <WhatsAppIcon size={15} className="text-[#25D366] shrink-0" /> WhatsApp
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-muted">
                <MapPin size={15} className="text-cyan-400 shrink-0" aria-hidden="true" /> {CONTACT.city}, {CONTACT.region}, España
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.07] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>© {new Date().getFullYear()} LOCALIS AI. Todos los derechos reservados.</p>
          <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/terms" className="hover:text-cyan-300 transition-colors">
              Aviso legal
            </Link>
            <Link href="/privacy" className="hover:text-cyan-300 transition-colors">
              Política de privacidad
            </Link>
            <Link href="/cookies" className="hover:text-cyan-300 transition-colors">
              Política de cookies
            </Link>
            <CookieSettingsButton />
          </nav>
        </div>
      </div>
    </footer>
  );
}
