import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Clock3, LayoutGrid, Mail, MapPin, MessageCircle, Palette, Phone, Search, Send, Smartphone, Store, type LucideIcon } from "lucide-react";
import { CONTACT, waLink } from "@/lib/site";
import { ROUTES } from "@/lib/navigation";

/** Cabecera de página interior: un único H1, introducción y migas de pan. */
export function PageHeader({ eyebrow, title, accent, intro, crumbs }: { eyebrow: string; title: string; accent?: string; intro: string; crumbs?: { name: string; href?: string }[] }) {
  return (
    <section className="relative w-full pb-6 pt-12 lg:pt-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {crumbs && (
          <nav aria-label="Migas de pan" className="mb-5 text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-cyan-300">
                  Inicio
                </Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.name} className="flex items-center gap-1.5">
                  <span aria-hidden="true">/</span>
                  {c.href ? (
                    <Link href={c.href} className="hover:text-cyan-300">
                      {c.name}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-foreground/80">
                      {c.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="max-w-3xl">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {title} {accent && <span className="gradient-text">{accent}</span>}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{intro}</p>
        </div>
      </div>
    </section>
  );
}

export function CtaBand({ title = "¿Empezamos con tu web?", text = "Diséñala tú mismo en unos minutos o cuéntanos qué necesitas. Sin compromiso y sin cobrar nada por enviarnos tu idea." }: { title?: string; text?: string }) {
  return (
    <section aria-label="Siguiente paso" className="relative w-full py-14 lg:py-20">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-3xl p-7 text-center sm:p-10">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">{text}</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={ROUTES.disena} className="btn btn-primary min-h-[54px] px-7 text-base">
              Diseña tu web <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href={ROUTES.contacto} className="btn btn-ghost min-h-[54px] px-7 text-base">
              Pedir presupuesto
            </Link>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-[54px] px-7 text-base">
              <MessageCircle size={18} aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <li className="glass rounded-2xl p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
        <Icon size={21} aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
    </li>
  );
}

export function HomeBenefits() {
  return (
    <section aria-labelledby="benef-title" className="relative w-full py-14 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="benef-title" className="max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          Una web que trabaja para tu negocio, <span className="gradient-text">no solo un escaparate</span>
        </h2>
        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card icon={Phone} title="Pensada para que te contacten" text="Formulario de presupuesto, botón de WhatsApp, teléfono y mapa a un toque, también en el móvil." />
          <Card icon={Palette} title="La diseñas tú, la construimos nosotros" text="Elige colores, secciones, botones e imágenes viendo el resultado al instante. Nos llega tu diseño completo." />
          <Card icon={Search} title="Preparada para Google" text="Estructura, velocidad y datos locales de Zaragoza para que los buscadores puedan encontrarte." />
          <Card icon={MapPin} title="Trato cercano en Zaragoza" text="Hablas con personas, no con un formulario. Te acompañamos desde la idea hasta que la web está publicada." />
        </ul>
      </div>
    </section>
  );
}

const STEPS = [
  { n: 1, title: "Diseña tu web", text: "En unos minutos eliges plantilla, colores, secciones e imágenes y ves cómo queda en ordenador, tablet y móvil." },
  { n: 2, title: "Revisamos y te presupuestamos", text: "Estudiamos tu diseño y te enviamos un presupuesto por escrito. Hasta que lo aceptes, no se contrata ni se cobra nada." },
  { n: 3, title: "La construimos y la publicamos", text: "Preparamos tu web con tus contenidos, la probamos contigo y la publicamos. Después te ayudamos a mantenerla al día." },
];

export function HomeProcess() {
  return (
    <section aria-labelledby="proceso-title" className="relative w-full py-14 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <span className="eyebrow">Cómo empezar</span>
        <h2 id="proceso-title" className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          Tres pasos, sin complicaciones
        </h2>
        <ol className="mt-9 grid gap-4 lg:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="glass rounded-2xl p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-cobalt-500 font-display text-lg font-bold text-[#04121a]">{s.n}</span>
              <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Link href={ROUTES.disena} className="btn btn-primary min-h-[54px] px-7 text-base">
            Empezar a diseñar <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const EXPLORE = [
  { href: ROUTES.plataforma, icon: LayoutGrid, title: "Plataforma", text: "Stella, reparto con GPS y soluciones por sector: qué es real hoy y qué estamos desarrollando." },
  { href: ROUTES.tarifas, icon: Store, title: "Tarifas", text: "Cómo se presupuesta la web, el mantenimiento y Stella, explicado sin letra pequeña." },
  { href: ROUTES.faq, icon: Clock3, title: "Preguntas frecuentes", text: "Contratación, plazos, mantenimiento y Google: las dudas más habituales." },
  { href: ROUTES.local, icon: MapPin, title: "Diseño web en Zaragoza", text: "Qué hacemos por negocios, autónomos y empresas de Zaragoza y Aragón." },
];

export function HomeExplore() {
  return (
    <section aria-labelledby="explora-title" className="relative w-full py-14 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="explora-title" className="font-display text-3xl font-bold leading-tight sm:text-4xl">
          Descubre LOCALIS AI
        </h2>
        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXPLORE.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="glass group flex h-full min-h-[44px] flex-col rounded-2xl p-6 transition-colors hover:border-cyan-500/40">
                <e.icon size={22} className="text-cyan-300" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-bold">{e.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{e.text}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300">
                  Ver más <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Introducción de cada apartado de la plataforma: qué es, qué problema resuelve y su estado REAL. */
export function PlatformIntro({ id, icon: Icon, title, status, tone, problem, how, children }: { id: string; icon: LucideIcon; title: string; status: string; tone: "ok" | "wip"; problem: string; how: string[]; children?: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="relative w-full scroll-mt-24 border-t border-white/[0.07] pt-12 lg:pt-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (tone === "ok" ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-100")}>{status}</span>
            </div>
            <h2 id={`${id}-h`} className="mt-4 font-display text-2xl font-bold leading-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted sm:text-base">{problem}</p>
          </div>
          <ul className="space-y-3 self-center">
            {how.map((h) => (
              <li key={h} className="flex gap-2.5 text-[15px] text-foreground/90">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" /> {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {children}
    </section>
  );
}

export const PLATFORM_ICONS = { Bot, MapPin, Store, Smartphone, Send };

export function ContactCards() {
  const items = [
    { icon: MessageCircle, label: "WhatsApp", value: "Escríbenos ahora", href: waLink(), ext: true },
    { icon: Phone, label: "Teléfono", value: CONTACT.phoneDisplay, href: `tel:${CONTACT.phoneE164}` },
    { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { icon: MapPin, label: "Dónde estamos", value: `${CONTACT.city}, ${CONTACT.region}`, href: "https://www.google.com/maps/search/?api=1&query=Zaragoza", ext: true },
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <li key={i.label}>
          <a href={i.href} {...(i.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="glass flex min-h-[72px] items-center gap-3.5 rounded-2xl p-4 transition-colors hover:border-cyan-500/40">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
              <i.icon size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-wider text-muted">{i.label}</span>
              <span className="block break-words text-[15px] font-semibold">{i.value}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
