import Link from "next/link";
import { ArrowRight, Clock3, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/lib/navigation";

const TRUST = [
  { icon: ShieldCheck, text: "Presupuesto por escrito, sin compromiso" },
  { icon: Clock3, text: "Normalmente lista en 5–10 días laborables" },
  { icon: MapPin, text: "Trato cercano en Zaragoza" },
];

/** Ilustración de ejemplo (no es un cliente real): una web de negocio local con contacto a un toque. */
function HeroVisual() {
  return (
    <figure className="mx-auto w-full max-w-[520px]" aria-label="Ejemplo ilustrativo del diseño de una web para un negocio local">
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0e1422] shadow-[0_30px_80px_-30px_rgba(0,242,254,0.35)]">
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/30 px-3 py-2.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 h-5 flex-1 rounded-md bg-white/[0.06]" />
        </div>
        <div className="space-y-4 bg-[#faf7f2] p-5 text-[#26221c]">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold">Tu negocio</span>
            <span className="flex gap-3 text-[11px] opacity-70" aria-hidden="true">
              <span>Servicios</span>
              <span>Galería</span>
              <span>Contacto</span>
            </span>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-[#8a6d3b] to-[#c9a35f] p-5 text-white">
            <p className="font-display text-lg font-bold leading-tight">Cuenta en una frase qué haces</p>
            <p className="mt-1 text-[12px] opacity-90">Tus servicios, tus fotos y cómo contactar, en una web clara.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#26221c]">
                <Phone size={12} aria-hidden="true" /> Pedir presupuesto
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-[11px] font-semibold text-[#05210f]">
                <MessageCircle size={12} aria-hidden="true" /> WhatsApp
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2" aria-hidden="true">
            {["#8a6d3b", "#2b2b2b", "#c026d3"].map((c) => (
              <div key={c} className="aspect-[4/3] rounded-lg" style={{ background: c, opacity: 0.85 }} />
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white p-3 text-[12px]">
            <MapPin size={14} className="text-[#8a6d3b]" aria-hidden="true" /> Calle y ciudad · Ver en Google Maps
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted">Ejemplo ilustrativo de diseño</figcaption>
    </figure>
  );
}

// Componente de servidor: el hero (LCP) llega en el HTML sin esperar a JS.
export default function HeroSection() {
  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative flex w-full items-center overflow-hidden lg:min-h-[calc(100svh-64px)]">
      <div className="tech-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[1100px] max-w-[160vw] -translate-x-1/2" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,242,254,0.14), transparent 65%)" }} aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="animate-rise min-w-0 text-center lg:text-left">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="eyebrow">Diseño web · Zaragoza y Aragón</span>
            </div>
            <h1 id="hero-title" className="font-display text-[2.35rem] font-bold leading-[1.05] sm:text-5xl lg:text-[3.6rem] xl:text-[4.1rem]">
              Tu negocio merece una web que <span className="gradient-text">te traiga clientes</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl lg:mx-0">
              Diseñamos páginas web para negocios, autónomos y empresas de Zaragoza: claras, rápidas en el móvil y con todo lo que necesita un cliente para contactarte. Tú eliges cómo la quieres y{" "}
              <strong className="font-semibold text-foreground">nosotros la construimos</strong>.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href={ROUTES.disena} className="btn btn-primary min-h-[54px] px-6 text-base">
                Diseña tu web <ArrowRight size={19} aria-hidden="true" />
              </Link>
              <Link href={ROUTES.contacto} className="btn btn-ghost min-h-[54px] px-6 text-base">
                Pedir presupuesto
              </Link>
            </div>
            <ul className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted lg:justify-start">
              {TRUST.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon size={16} className="shrink-0 text-cyan-400" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
