import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { PLATFORM, ROUTES } from "@/lib/navigation";
import { stellaEnabled } from "@/lib/stella/businesses";

export const metadata: Metadata = {
  title: "Plataforma para negocios locales",
  description:
    "Webs de captación para negocios de Zaragoza, Stella (asistente virtual con IA para tu web) y las próximas herramientas: reparto con GPS y panel de control.",
  alternates: { canonical: ROUTES.plataforma },
};

// Debe coincidir con lib/faqs.ts: solo se presenta como disponible lo que ya entregamos.
const AVAILABLE = [
  "Web profesional adaptada al móvil, con tus servicios",
  "Formulario de presupuesto y de auditoría gratuita",
  "Botón de WhatsApp y enlace a Google Maps",
  "SEO local básico para Zaragoza y alrededores",
  "Estudio «Diseña tu web» con precio cerrado al momento",
];
const STELLA_LIVE = "Stella: asistente virtual con IA que responde en tu web, recoge contactos y los pasa a WhatsApp";

const NEXT = [
  "Stella en WhatsApp: respuestas automáticas en tu número",
  "Citas online sincronizadas con Google Calendar",
  "Catálogo o carta digital con pedidos",
  "Reparto con seguimiento GPS sin comisiones",
  "Panel de control para el negocio y facturas",
];

export default function PlataformaPage() {
  const live = stellaEnabled();
  const available = live ? [...AVAILABLE, STELLA_LIVE] : AVAILABLE;
  const sections = PLATFORM.filter((p) => p.href !== ROUTES.plataforma);
  const soon = (status: string) => status === "proximamente" || (status === "stella" && !live);

  return (
    <section aria-labelledby="plataforma-title" className="relative w-full py-14 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="eyebrow">Plataforma LOCALIS AI</span>
          <h1 id="plataforma-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Todo lo que tu negocio necesita para <span className="gradient-text">captar clientes</span>
          </h1>
          <p className="mt-5 text-muted text-base sm:text-lg leading-relaxed">
            Empezamos por una web que convierte visitas en contactos y vamos sumando herramientas. Te contamos con claridad qué puedes contratar
            hoy y qué llega próximamente.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass rounded-3xl p-6 sm:p-7 border border-emerald-500/20">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-300" aria-hidden="true" /> Disponible hoy
            </h2>
            <ul className="mt-5 space-y-3">
              {available.map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 size={17} className="text-emerald-300 shrink-0 mt-px" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
            <Link href={ROUTES.disena} className="btn btn-primary mt-7 w-full sm:w-auto">
              Diseñar mi web <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="glass rounded-3xl p-6 sm:p-7 border border-cyan-500/20">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Sparkles size={20} className="text-cyan-300" aria-hidden="true" /> Próximamente
            </h2>
            <ul className="mt-5 space-y-3">
              {NEXT.map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-muted">
                  <Sparkles size={16} className="text-cyan-300 shrink-0 mt-0.5" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-sm text-muted">Pídelo en la auditoría y te avisamos en cuanto puedas activarlo. No se cobra hasta que esté listo.</p>
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
                  {soon(p.status) ? (
                    <span className="rounded-full border border-cyan-500/25 bg-cyan-500/[0.06] px-2 py-0.5 text-[11px] font-semibold text-cyan-200">Próximamente</span>
                  ) : p.status === "stella" ? (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">Disponible</span>
                  ) : null}
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
