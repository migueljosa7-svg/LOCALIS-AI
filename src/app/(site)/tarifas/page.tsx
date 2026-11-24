import Link from "next/link";
import { BadgeCheck, Hammer, LifeBuoy, LayoutDashboard, Sparkles } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { CtaBand, PageHeader } from "@/components/site/Blocks";
import StellaOrderButton from "@/components/stella/StellaOrderButton";
import { ROUTES } from "@/lib/navigation";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/tarifas",
  title: "Tarifas: creación de la web, mantenimiento y Stella",
  description: "Cómo presupuestamos tu página web, el mantenimiento y Stella, el asistente con IA. Presupuesto por escrito antes de empezar y sin compromiso. Diseño web en Zaragoza.",
});

// Sin precios definitivos hasta su aprobación: se explica cómo se presupuesta cada servicio y qué incluye.
const BLOCKS = [
  {
    icon: Hammer,
    title: "Creación de la web",
    status: "Disponible",
    tone: "ok" as const,
    lead: "Diseñamos y construimos tu página web a medida de tu negocio.",
    includes: ["Diseño adaptado a móvil, tablet y ordenador", "Formulario de presupuesto y botón de WhatsApp", "Mapa de Google y botones de «Cómo llegar»", "Base técnica para Google: títulos, descripciones y estructura", "Publicación y revisión contigo antes de salir"],
    price: "Presupuesto cerrado por escrito antes de empezar. Depende de las páginas y secciones que elijas: el configurador te da una estimación orientativa al momento.",
    cta: { href: ROUTES.disena, label: "Calcula tu estimación diseñando tu web" },
  },
  {
    icon: LifeBuoy,
    title: "Mantenimiento",
    status: "Disponible",
    tone: "ok" as const,
    lead: "Para que tu web siga al día sin que tengas que ocuparte de ella.",
    includes: ["Cambios de textos, imágenes y datos de contacto", "Ajustes y pequeñas mejoras", "Soporte cuando tengas una duda o una incidencia"],
    price: "Servicio opcional. El alcance y el coste se acuerdan contigo en el presupuesto; no se activa nada sin tu confirmación.",
    cta: { href: ROUTES.contacto, label: "Consultar el mantenimiento" },
  },
  {
    icon: Sparkles,
    title: "Stella · asistente con IA",
    status: "Fase piloto",
    tone: "wip" as const,
    lead: "Un asistente que responde en tu web con la información de tu negocio y recoge contactos con consentimiento.",
    includes: ["Preparamos su ficha con tus servicios, precios y preguntas frecuentes", "Instalación con una línea de código en tu dominio", "Reconoce lo que no sabe y te pasa el cliente por WhatsApp"],
    price: "Se presupuesta a medida y todavía estamos abriendo plazas del piloto. Pedirla no activa ni cobra nada.",
    cta: null,
  },
  {
    icon: LayoutDashboard,
    title: "Panel de control para clientes",
    status: "En desarrollo",
    tone: "wip" as const,
    lead: "Una pantalla para ver tus contactos y solicitudes en un solo sitio.",
    includes: ["Hoy te enviamos tus contactos por email y WhatsApp", "El panel para clientes es una demostración: no se puede contratar todavía"],
    price: "No disponible. Te avisaremos cuando exista y se pueda contratar.",
    cta: null,
  },
];

export default function TarifasPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Tarifas", path: "/tarifas" }]} />
      <PageHeader
        eyebrow="Tarifas"
        title="Claras, por escrito y"
        accent="sin sorpresas"
        intro="Cada negocio es distinto, así que preparamos un presupuesto cerrado por escrito antes de empezar. Aquí tienes qué incluye cada servicio y cómo se calcula. Enviarnos tu diseño o pedir presupuesto no cuesta nada ni te compromete."
        crumbs={[{ name: "Tarifas" }]}
      />
      <section aria-label="Servicios y tarifas" className="w-full pb-10">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          {BLOCKS.map((b) => (
            <article key={b.title} className="glass flex flex-col rounded-3xl p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                  <b.icon size={22} aria-hidden="true" />
                </span>
                <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (b.tone === "ok" ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-100")}>{b.status}</span>
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold">{b.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{b.lead}</p>
              <ul className="mt-5 space-y-2.5">
                {b.includes.map((i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] text-foreground/90">
                    <BadgeCheck size={18} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" /> {i}
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-foreground/90">
                <strong>Precio:</strong> {b.price}
              </p>
              <div className="mt-5 flex-1" />
              {b.cta ? (
                <Link href={b.cta.href} className="btn btn-primary min-h-[50px]">
                  {b.cta.label}
                </Link>
              ) : b.title.startsWith("Stella") ? (
                <StellaOrderButton label="Solicitar Stella" />
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="no-disp" className="w-full pb-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-400/25 bg-amber-500/[0.06] p-6 sm:p-8">
            <h2 id="no-disp" className="font-display text-xl font-bold">
              Todavía no se pueden contratar
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              Estas funciones aparecen en la web como demostración y están en desarrollo: reparto con seguimiento GPS, citas y reservas con calendario, WhatsApp automático, facturación, tienda online con pagos y catálogo con pedidos. No las incluimos en ningún presupuesto hasta que estén terminadas y probadas.
            </p>
          </div>
          <div className="mt-8 rounded-3xl border border-white/10 p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold">Cómo funciona la contratación</h2>
            <ol className="mt-4 grid gap-4 text-[15px] text-muted sm:grid-cols-3">
              <li>
                <strong className="text-foreground">1. Cuéntanos qué necesitas.</strong> Diseñas tu web en el configurador o nos escribes.
              </li>
              <li>
                <strong className="text-foreground">2. Presupuesto por escrito.</strong> Lo revisas con calma; hasta que lo aceptes no se cobra nada.
              </li>
              <li>
                <strong className="text-foreground">3. Construimos y publicamos.</strong> Probamos la web contigo y la publicamos. Las condiciones de pago constan en el presupuesto.
              </li>
            </ol>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
