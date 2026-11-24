import Link from "next/link";
import { BadgeCheck, Hammer, LayoutDashboard, LifeBuoy, Sparkles } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { CtaBand, PageHeader } from "@/components/site/Blocks";
import StellaOrderButton from "@/components/stella/StellaOrderButton";
import { ROUTES } from "@/lib/navigation";
import { TARIFAS, maintenanceFor } from "@/lib/pricing";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/tarifas",
  title: "Tarifas: Web Captación, Web Pro y mantenimiento",
  description: "Web Captación desde 390 € + IVA, Web Pro desde 590 € + IVA y mantenimiento desde 15 € por página al mes. Presupuesto por escrito adaptado a tu proyecto. Zaragoza.",
});

const eur = (n: number) => `${n.toLocaleString("es-ES")} €`;

const WEBS = [TARIFAS.captacion, TARIFAS.pro];

// Servicios que no tienen precio publicado: Stella (piloto) y el panel (en desarrollo).
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

export default function TarifasPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Tarifas", path: "/tarifas" }]} />
      <PageHeader
        eyebrow="Tarifas"
        title="Precios claros y"
        accent="presupuesto a tu medida"
        intro="Estos son nuestros precios de referencia, sin IVA. Cada negocio es distinto: te enviamos un presupuesto por escrito adaptado a lo que necesitas, antes de empezar y sin compromiso."
        crumbs={[{ name: "Tarifas" }]}
      />

      <section aria-labelledby="webs-h" className="w-full pb-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="webs-h" className="font-display text-2xl font-bold sm:text-3xl">
            Tu página web
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {WEBS.map((w, i) => (
              <article key={w.name} className={"glass flex flex-col rounded-3xl p-6 sm:p-8 " + (i === 1 ? "border-glow" : "")}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                    <Hammer size={22} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">Disponible</span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold">{w.name}</h3>
                <p className="mt-1 text-[15px] text-muted">{w.tagline}</p>
                <p className="mt-4 font-display text-4xl font-bold">
                  {eur(w.price)} <span className="text-base font-medium text-muted">+ IVA</span>
                </p>
                <p className="text-xs text-muted">Precio de referencia · pago único · hasta {w.pages} páginas</p>
                <ul className="mt-5 space-y-2.5">
                  {w.includes.map((x) => (
                    <li key={x} className="flex gap-2.5 text-[15px] text-foreground/90">
                      <BadgeCheck size={18} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" /> {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex-1" />
                <Link href={ROUTES.disena} className="btn btn-primary min-h-[50px]">
                  Diseña tu web y calcula tu presupuesto
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            ¿Cuál elegir? Web Captación sirve para presentar tu negocio y recibir contactos. Web Pro es para negocios con más servicios, más páginas y más contenido. Si dudas, lo vemos contigo al preparar el presupuesto.
          </p>
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
              Mantenimiento: desde {TARIFAS.mantenimientoPorPagina} € por página al mes <span className="text-base font-medium text-muted">+ IVA</span>
            </h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted">
              Para que tu web siga al día sin que tengas que ocuparte de ella. Es opcional: no se activa ni se cobra nada sin tu confirmación.
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="font-display text-lg font-bold">Qué incluye</h3>
                <ul className="mt-3 space-y-2 text-[15px] text-foreground/90">
                  {["Cambios de textos, imágenes y datos de contacto", "Ajustes y pequeñas mejoras", "Soporte cuando tengas una duda o una incidencia"].map((x) => (
                    <li key={x} className="flex gap-2.5">
                      <BadgeCheck size={18} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" /> {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Cómo se calcula</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  El punto de partida es {TARIFAS.mantenimientoPorPagina} € por página al mes: una web de 5 páginas parte de {eur(maintenanceFor(5))} al mes + IVA. El presupuesto final puede variar según:
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
                <h3 className="font-display text-lg font-bold">Se presupuesta aparte</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] text-muted">
                  <li>Rediseños y secciones o funciones nuevas</li>
                  <li>Páginas adicionales fuera de tu paquete</li>
                  <li>Dominio y alojamiento: se indican por separado en el presupuesto</li>
                </ul>
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
              Los precios de arriba son nuestro punto de partida, no una cifra cerrada. Si necesitas varias páginas o varios servicios, o quieres trabajar con nosotros de forma continuada, lo tenemos en cuenta al preparar tu presupuesto. Siempre por escrito y antes de empezar.
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
              Todos los importes son sin IVA. Reparto con GPS, citas y reservas con calendario, WhatsApp automático, facturación y tienda online con pagos aparecen en la web como demostración o están en desarrollo: no se incluyen en ningún presupuesto hasta que estén terminados y probados.
            </p>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
