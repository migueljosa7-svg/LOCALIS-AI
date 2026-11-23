import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { PLATFORM, ROUTES } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Plataforma: qué funciona hoy y qué está en desarrollo",
  description:
    "Webs de captación para negocios de Zaragoza disponibles hoy, y demostraciones de Stella IA, reparto con GPS y panel de control en desarrollo.",
  alternates: { canonical: ROUTES.plataforma },
};

// Debe coincidir con lib/faqs.ts: solo es "disponible" lo que ya entregamos.
const AVAILABLE = [
  "Web profesional adaptada al móvil, con tus servicios",
  "Formulario de presupuesto y de auditoría gratuita",
  "Botón de WhatsApp y enlace a Google Maps",
  "SEO local básico para Zaragoza y alrededores",
  "Estudio «Diseña tu web» con precio cerrado al momento",
];

const IN_PROGRESS = [
  "Stella: asistente con IA para WhatsApp y la web",
  "Citas online sincronizadas con Google Calendar",
  "Catálogo o carta digital con pedidos",
  "Reparto con seguimiento GPS sin comisiones",
  "Panel de control para el negocio y facturas",
];

export default function PlataformaPage() {
  const sections = PLATFORM.filter((p) => p.href !== ROUTES.plataforma);
  return (
    <section aria-labelledby="plataforma-title" className="relative w-full py-14 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="eyebrow">Plataforma LOCALIS AI</span>
          <h1 id="plataforma-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Lo que funciona hoy y <span className="gradient-text">lo que estamos construyendo</span>
          </h1>
          <p className="mt-5 text-muted text-base sm:text-lg leading-relaxed">
            Hoy entregamos webs de captación para negocios locales. Las herramientas marcadas como <strong className="text-foreground">demo</strong>{" "}
            están en desarrollo: puedes probarlas con datos de ejemplo, pero todavía no las vendemos ni las cobramos.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass rounded-3xl p-6 sm:p-7 border border-emerald-500/20">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-300" aria-hidden="true" /> Disponible hoy
            </h2>
            <ul className="mt-5 space-y-3">
              {AVAILABLE.map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 size={17} className="text-emerald-300 shrink-0 mt-px" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
            <Link href={ROUTES.disena} className="btn btn-primary mt-7 w-full sm:w-auto">
              Diseñar mi web <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="glass rounded-3xl p-6 sm:p-7 border border-amber-400/20">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Clock3 size={20} className="text-amber-200" aria-hidden="true" /> En desarrollo
            </h2>
            <ul className="mt-5 space-y-3">
              {IN_PROGRESS.map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-muted">
                  <Clock3 size={17} className="text-amber-200 shrink-0 mt-px" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-sm text-muted">Si te interesa alguna, pídela en la auditoría y te avisaremos cuando esté lista.</p>
          </div>
        </div>

        <h2 className="mt-14 font-display font-bold text-2xl sm:text-3xl">Explora cada apartado</h2>
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="group glow-card lift glass h-full rounded-3xl p-6 flex flex-col">
                <span className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300">
                    <p.icon size={20} aria-hidden="true" />
                  </span>
                  {p.status === "demo" && (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">Demo</span>
                  )}
                </span>
                <span className="mt-5 font-display font-semibold text-lg">{p.title}</span>
                <span className="mt-2 text-sm text-muted leading-relaxed flex-1">{p.detail}</span>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300">
                  Ver <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
