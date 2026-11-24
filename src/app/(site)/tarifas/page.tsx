import Link from "next/link";
import { BadgeCheck, Hammer, LayoutDashboard, LifeBuoy, Sparkles } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { CtaBand, PageHeader } from "@/components/site/Blocks";
import StellaOrderButton from "@/components/stella/StellaOrderButton";
import { ROUTES } from "@/lib/navigation";
import { CLIENTE_APORTA, NO_INCLUIDO, TARIFAS, maintenanceFor, vatBreakdown } from "@/lib/pricing";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/tarifas",
  title: "Tarifas: Web Esencial desde 390 € y Web Pro",
  description: "Web Esencial 390 € IVA incluido, con dominio el primer año. Web Pro 590 € + IVA. Mantenimiento desde 15 € por página al mes. Presupuesto por escrito. Zaragoza.",
});

const eur = (n: number) => `${n.toLocaleString("es-ES")} €`;

// Servicios sin precio publicado: Stella (piloto) y el panel (en desarrollo).
const EXTRA = [
  {
    icon: Sparkles,
    title: "Stella · asistente con IA",
    status: "Fase piloto",
    lead: "Un asistente que responde en tu web con la información de tu negocio y recoge contactos con consentimiento.",
    note: "Se presupuesta aparte y por separado de la web. Todavía no está validada con la IA real, por eso se ofrece como piloto. Pedirla no activa ni cobra nada.",
    cta: true,
  },
  {
    icon: LayoutDashboard,
    title: "Panel de control para clientes",
    status: "En desarrollo",
    lead: "Una pantalla para ver tus contactos y solicitudes en un solo sitio.",
    note: "No está disponible ni se puede contratar. Hoy es una maqueta; te avisaremos cuando exista y tendrá su propio presupuesto.",
    cta: false,
  },
];

function List({ items, icon = true }: { items: readonly string[]; icon?: boolean }) {
  return (
    <ul className="space-y-2.5">
      {items.map((x) => (
        <li key={x} className="flex gap-2.5 text-[15px] text-foreground/90">
          {icon ? <BadgeCheck size={18} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" /> : <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />} {x}
        </li>
      ))}
    </ul>
  );
}

export default function TarifasPage() {
  const E = TARIFAS.esencial;
  const P = TARIFAS.pro;
  const ve = vatBreakdown(E);
  const vp = vatBreakdown(P);
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Tarifas", path: "/tarifas" }]} />
      <PageHeader
        eyebrow="Tarifas"
        title="Una web profesional,"
        accent="con precio claro"
        intro="Empieza con nuestra Web Esencial a un precio cerrado de entrada o elige un proyecto más grande. En todos los casos te enviamos un presupuesto por escrito, antes de empezar y sin compromiso."
        crumbs={[{ name: "Tarifas" }]}
      />

      <section aria-labelledby="esencial-h" className="w-full pb-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <article className="glass border-glow rounded-3xl p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                <Hammer size={22} aria-hidden="true" />
              </span>
              <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-100">Oferta de entrada</span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">Disponible</span>
            </div>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <h2 id="esencial-h" className="font-display text-3xl font-bold sm:text-4xl">
                  {E.name}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{E.tagline}. Pensada para autónomos, pequeños negocios y empresas con facturación modesta.</p>
                <p className="mt-5 font-display text-5xl font-bold">
                  {eur(E.price)} <span className="text-lg font-medium text-muted">IVA incluido</span>
                </p>
                <p className="mt-1 text-sm text-muted">{ve.text}. Pago único.</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">Precio de referencia: el presupuesto final se confirma por escrito tras revisar tu proyecto.</p>
                <Link href={ROUTES.disena} className="btn btn-primary mt-6 min-h-[52px] w-full sm:w-auto">
                  Diseña tu web y pide presupuesto
                </Link>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Qué incluye</h3>
                <div className="mt-3">
                  <List items={E.includes} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-bold">Lo que aportas tú</h3>
                <div className="mt-3">
                  <List items={CLIENTE_APORTA} icon={false} />
                </div>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">No está incluido en los {eur(E.price)}</h3>
                <p className="mt-1 text-sm text-muted">Lo explicamos siempre antes de empezar:</p>
                <div className="mt-3">
                  <List items={NO_INCLUIDO} icon={false} />
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section aria-labelledby="pro-h" className="w-full pb-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <article className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                <Hammer size={22} aria-hidden="true" />
              </span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">Disponible</span>
            </div>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <h2 id="pro-h" className="font-display text-2xl font-bold sm:text-3xl">
                  {P.name}
                </h2>
                <p className="mt-1 text-[15px] text-muted">{P.tagline}</p>
                <p className="mt-4 font-display text-4xl font-bold">
                  {eur(P.price)} <span className="text-base font-medium text-muted">+ IVA</span>
                </p>
                <p className="mt-1 text-sm text-muted">{vp.text}. Precio de referencia · pago único.</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  <strong className="text-foreground">Diferencia con la Web Esencial:</strong> más páginas (hasta {P.pages} en lugar de {E.pages}), más contenido por página y textos orientados a Google redactados contigo. Lo demás (aportaciones del cliente y costes no incluidos) funciona igual.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  ¿Más de {P.pages} páginas o funciones especiales? Presupuesto personalizado por escrito.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Qué incluye</h3>
                <div className="mt-3">
                  <List items={P.includes} />
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section aria-labelledby="mant-h" className="w-full pb-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                <LifeBuoy size={22} aria-hidden="true" />
              </span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">Disponible · opcional</span>
            </div>
            <h2 id="mant-h" className="mt-4 font-display text-2xl font-bold sm:text-3xl">
              Mantenimiento: {TARIFAS.mantenimientoPorPagina} € por página al mes <span className="text-base font-medium text-muted">+ IVA</span>
            </h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted">
              Para que tu web siga al día sin que tengas que ocuparte de ella. Es opcional: no está incluido en el precio de la web, y no se activa ni se cobra nada sin tu confirmación. Este importe es un precio de referencia.
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="font-display text-lg font-bold">Qué incluye</h3>
                <div className="mt-3">
                  <List
                    items={[
                      "Cambios razonables de contenido: textos, imágenes, datos de contacto, horarios, precios",
                      "Pequeños ajustes de la web",
                      "Soporte por email o WhatsApp en horario laboral, respondiendo lo antes posible",
                    ]}
                  />
                </div>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Cómo se calcula</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Punto de partida: {TARIFAS.mantenimientoPorPagina} € por página al mes. Una página, {eur(maintenanceFor(1))} al mes; 5 páginas, {eur(maintenanceFor(5))} al mes; 10 páginas, {eur(maintenanceFor(10))} al mes (todos + IVA). El presupuesto final puede variar según:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-muted">
                  <li>el número de páginas,</li>
                  <li>la complejidad de la web,</li>
                  <li>las necesidades de mantenimiento,</li>
                  <li>los cambios y actualizaciones que pidas,</li>
                  <li>los servicios adicionales que contrates.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Se cobra aparte</h3>
                <p className="mt-3 text-sm text-muted">No son modificaciones ilimitadas: si un mes necesitas un cambio grande, te lo presupuestamos antes de hacerlo.</p>
                <div className="mt-3">
                  <List items={["Páginas, secciones o funciones nuevas", "Rediseños", "Redacción extensa de textos y fotografía", "Alojamiento y renovación del dominio"]} icon={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="extra-h" className="w-full pb-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="extra-h" className="font-display text-2xl font-bold sm:text-3xl">
            Servicios adicionales, por separado
          </h2>
          <p className="mt-2 max-w-3xl text-[15px] text-muted">No están incluidos en el precio de la web ni tienen precio publicado todavía.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {EXTRA.map((b) => (
              <article key={b.title} className="glass flex flex-col rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                    <b.icon size={22} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100">{b.status}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{b.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{b.lead}</p>
                <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-foreground/90">{b.note}</p>
                {b.cta && (
                  <div className="mt-5">
                    <StellaOrderButton label="Solicitar Stella" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="medida-h" className="w-full pb-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 p-6 sm:p-8">
            <h2 id="medida-h" className="font-display text-xl font-bold sm:text-2xl">
              Un presupuesto a la medida de tu proyecto
            </h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
              Los precios de arriba son nuestro punto de partida. Si necesitas más páginas, funciones especiales o varios servicios, o quieres trabajar con nosotros de forma continuada, lo tenemos en cuenta al preparar tu presupuesto. Siempre por escrito y antes de empezar.
            </p>
            <ol className="mt-6 grid gap-4 text-[15px] text-muted sm:grid-cols-3">
              <li>
                <strong className="text-foreground">1. Cuéntanos qué necesitas.</strong> Diseñas tu web en el configurador o nos escribes.
              </li>
              <li>
                <strong className="text-foreground">2. Presupuesto por escrito.</strong> Lo revisas con calma; hasta que lo aceptes no se cobra nada.
              </li>
              <li>
                <strong className="text-foreground">3. Construimos y publicamos.</strong> La probamos contigo antes de salir. Las condiciones de pago constan en el presupuesto.
              </li>
            </ol>
            <p className="mt-6 text-sm text-muted">
              Reparto con GPS, citas y reservas con calendario, WhatsApp automático, facturación y tienda online con pagos aparecen en la web como demostración o están en desarrollo: no se incluyen en ningún presupuesto hasta que estén terminados y probados.
            </p>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
