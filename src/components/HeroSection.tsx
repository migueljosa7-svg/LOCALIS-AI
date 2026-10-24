import { PlayCircle, Calculator, ArrowRight, ShieldCheck, Clock3, MapPin } from "lucide-react";
import HeroShowcaseCard from "./HeroShowcaseCard";

const TRUST = [
  { icon: ShieldCheck, text: "Auditoría gratuita y sin compromiso" },
  { icon: Clock3, text: "Tu web lista en 5–10 días" },
  { icon: MapPin, text: "Soporte local en Zaragoza" },
];

// Componente de servidor: el hero (LCP) llega en el HTML sin esperar a JS.
export default function HeroSection() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative w-full overflow-hidden lg:min-h-[calc(100svh-76px)] flex items-center"
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
              <span className="eyebrow">Diseño web e IA · Zaragoza</span>
              <span className="eyebrow eyebrow-live">
                <span className="live-dot" aria-hidden="true" /> 0% comisiones
              </span>
            </div>

            <h1
              id="hero-title"
              className="font-display font-bold text-[2.35rem] leading-[1.05] sm:text-5xl lg:text-[3.6rem] xl:text-[4.1rem]"
            >
              Webs con IA que{" "}
              <span className="gradient-text">atienden, agendan y reparten</span>{" "}
              por ti
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Para PYMEs de Zaragoza: tu asistente <strong className="text-foreground font-semibold">Stella</strong> responde
              por WhatsApp, cierra citas y factura 24/7, y tu propio GPS de reparto te libera del{" "}
              <strong className="text-foreground font-semibold">20–30&nbsp;%</strong> que se quedan las plataformas.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a href="#stella" className="btn btn-primary text-base px-6 min-h-[54px]">
                <PlayCircle size={20} aria-hidden="true" />
                Probar demostración
              </a>
              <a href="#ahorro" className="btn btn-live text-base px-6 min-h-[54px]">
                <Calculator size={19} aria-hidden="true" />
                Calcular ahorro sin comisiones
              </a>
            </div>

            <a
              href="#cita"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              o reserva tu auditoría gratuita en 1 minuto <ArrowRight size={15} aria-hidden="true" />
            </a>

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
