import Link from "next/link";
import { PlayCircle, Calculator, ArrowRight, ShieldCheck, Clock3, MapPin } from "lucide-react";
import HeroShowcaseCard from "./HeroShowcaseCard";
import StellaOpenButton from "./stella/StellaOpenButton";
import { stellaEnabled } from "@/lib/stella/businesses";

const TRUST = [
  { icon: ShieldCheck, text: "Auditoría gratuita y sin compromiso" },
  { icon: Clock3, text: "Tu web lista en 5–10 días" },
  { icon: MapPin, text: "Soporte local en Zaragoza" },
];

// Componente de servidor: el hero (LCP) llega en el HTML sin esperar a JS.
export default function HeroSection() {
  const live = stellaEnabled();
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative w-full overflow-hidden lg:min-h-[calc(100svh-64px)] flex items-center"
    >
      <div className="tech-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[1100px] max-w-[160vw] h-[520px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,242,254,0.14), transparent 65%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center">
          <div className="text-center lg:text-left min-w-0 animate-rise">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6">
              <span className="eyebrow">Diseño web · Zaragoza</span>
              <span className="eyebrow">Precio cerrado</span>
            </div>

            <h1
              id="hero-title"
              className="font-display font-bold text-[2.35rem] leading-[1.05] sm:text-5xl lg:text-[3.6rem] xl:text-[4.1rem]"
            >
              Webs que{" "}
              <span className="gradient-text">convierten visitas en clientes</span>{" "}
              para tu negocio
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Para negocios de Zaragoza y Aragón: web profesional con formulario de presupuesto, botón de WhatsApp, Google
              Maps y SEO local, a <strong className="text-foreground font-semibold">precio cerrado</strong>.{" "}
              {live ? (
                <>
                  ¿Dudas? Pregúntale a <strong className="text-foreground font-semibold">Stella</strong>, nuestra asistente con IA.
                </>
              ) : (
                <>
                  Y conoce a <strong className="text-foreground font-semibold">Stella</strong>, la asistente con IA que llega próximamente.
                </>
              )}
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/disena-tu-web" className="btn btn-primary text-base px-6 min-h-[54px]">
                <Calculator size={19} aria-hidden="true" />
                Diseñar mi web y ver el precio
              </Link>
              {live ? (
                <StellaOpenButton label="Hablar con Stella" variant="live" />
              ) : (
                <Link href="/plataforma/stella" className="btn btn-live text-base px-6 min-h-[54px]">
                  <PlayCircle size={20} aria-hidden="true" />
                  Conocer a Stella
                </Link>
              )}
            </div>

            <Link
              href="/disena-tu-web#cita"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              o reserva tu auditoría gratuita en 1 minuto <ArrowRight size={15} aria-hidden="true" />
            </Link>

            <ul className="mt-9 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-muted">
              {TRUST.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon size={16} className="text-cyan-400 shrink-0" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <HeroShowcaseCard />
        </div>
      </div>
    </section>
  );
}
