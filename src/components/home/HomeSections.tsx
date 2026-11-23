import Link from "next/link";
import { ArrowRight, Search, MessageCircle, Receipt, Store, Sparkles, Layers, Tags, Calendar } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { ROUTES } from "@/lib/navigation";
import { WA_AUDIT_TEXT, waLink } from "@/lib/site";

// Solo se describe como solución lo que ya entregamos hoy (ver lib/faqs.ts).
const PROBLEMS = [
  {
    icon: Search,
    problem: "Te buscan en Google y aparece la competencia",
    solution: "Web con SEO local para Zaragoza, enlazada con tu ficha de Google Maps.",
  },
  {
    icon: MessageCircle,
    problem: "Te escriben poco porque cuesta contactarte",
    solution: "Formulario de presupuesto y botón de WhatsApp siempre a mano, también en el móvil.",
  },
  {
    icon: Receipt,
    problem: "No sabes cuánto te va a costar una web",
    solution: "Precio cerrado que ves en el estudio antes de hablar con nosotros.",
  },
  {
    icon: Store,
    problem: "Pagas comisión por cada cliente o pedido",
    solution: "Tu web es tuya: quien te encuentra te contacta directamente, sin intermediarios.",
  },
];

export function HomeProblems() {
  return (
    <section id="que-hacemos" aria-labelledby="problemas-title" className="section-band relative w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10 lg:mb-12">
          <span className="eyebrow">Qué hacemos</span>
          <h2 id="problemas-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl leading-tight">
            Diseñamos webs para que los negocios locales <span className="gradient-text">reciban más contactos</span>
          </h2>
          <p className="mt-4 text-muted text-base sm:text-lg leading-relaxed">
            Problemas habituales en comercios, clínicas, talleres y restaurantes, y cómo los resolvemos.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROBLEMS.map(({ icon: Icon, problem, solution }) => (
            <li key={problem} className="glass rounded-3xl p-6 flex flex-col">
              <span className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 mb-5">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="font-display font-semibold text-[17px] leading-snug">{problem}</h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                <span className="font-semibold text-emerald-300">Solución: </span>
                {solution}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const PATHS = [
  {
    href: ROUTES.disena,
    icon: Sparkles,
    title: "Diseña tu web",
    text: "Elige sector, estilo, páginas y botones, mira cómo quedaría y conoce el precio al momento.",
    cta: "Abrir el estudio",
    primary: true,
  },
  {
    href: ROUTES.tarifas,
    icon: Tags,
    title: "Tarifas y FAQ",
    text: "Planes con precio cerrado, qué incluye cada uno y respuestas a las dudas más habituales.",
    cta: "Ver tarifas",
  },
  {
    href: ROUTES.plataforma,
    icon: Layers,
    title: "Plataforma",
    text: "Demostraciones de lo que estamos desarrollando: Stella IA, reparto con GPS y panel de control.",
    cta: "Ver demostraciones",
  },
];

export function HomeExplore() {
  return (
    <section aria-labelledby="explora-title" className="relative w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="explora-title" className="font-display font-bold text-3xl sm:text-4xl leading-tight text-center">
          ¿Por dónde quieres <span className="gradient-text">empezar</span>?
        </h2>

        <ul className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PATHS.map(({ href, icon: Icon, title, text, cta, primary }) => (
            <li key={href}>
              <Link
                href={href}
                className={
                  "group glow-card lift h-full rounded-3xl p-6 sm:p-7 flex flex-col border transition-colors " +
                  (primary ? "border-cyan-500/35 bg-cyan-500/[0.06]" : "glass")
                }
              >
                <span className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-300 mb-5">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="font-display font-bold text-xl">{title}</span>
                <span className="mt-2 text-sm text-muted leading-relaxed flex-1">{text}</span>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 group-hover:text-cyan-200">
                  {cta} <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 border-glow rounded-[2rem] p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
          <div>
            <p className="font-display font-bold text-2xl sm:text-3xl">Auditoría gratuita de tu presencia online</p>
            <p className="mt-2 text-muted">Revisamos tu web o tu ficha de Google y te decimos qué mejorar. Sin compromiso.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link href={ROUTES.cita} className="btn btn-primary min-h-[52px] px-6">
              <Calendar size={18} aria-hidden="true" /> Pedir auditoría
            </Link>
            <a href={waLink(WA_AUDIT_TEXT)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-[52px] px-6">
              <WhatsAppIcon size={18} className="text-[#25D366]" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
