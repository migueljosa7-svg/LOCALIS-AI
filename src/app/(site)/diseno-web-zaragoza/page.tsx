import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { CtaBand, PageHeader } from "@/components/site/Blocks";
import { ROUTES } from "@/lib/navigation";
import { CONTACT, SITE_URL } from "@/lib/site";
import { jsonLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/diseno-web-zaragoza",
  title: "Páginas web para empresas de Zaragoza y Aragón",
  description: "Páginas web profesionales para comercios, restauración, clínicas, talleres y autónomos de Zaragoza y Aragón. Diseñas tu web online y recibes un presupuesto por escrito.",
});

const SERVICE = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Diseño y creación de páginas web para negocios de Zaragoza y Aragón",
  serviceType: "Diseño web",
  provider: { "@id": `${SITE_URL}/#negocio` },
  areaServed: [{ "@type": "City", name: "Zaragoza" }, { "@type": "AdministrativeArea", name: "Aragón" }],
  url: `${SITE_URL}/diseno-web-zaragoza`,
};

const WHO = ["Comercios y tiendas de barrio", "Bares, restaurantes y cafeterías", "Peluquerías, estética y bienestar", "Clínicas y consultas", "Talleres y servicios técnicos", "Autónomos y profesionales independientes", "Empresas de servicios de Aragón"];

export default function LocalPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(SERVICE)} />
      <BreadcrumbJsonLd items={[{ name: "Diseño web en Zaragoza", path: "/diseno-web-zaragoza" }]} />
      <PageHeader
        eyebrow={`${CONTACT.city} y ${CONTACT.region}`}
        title="Diseño web en Zaragoza para"
        accent="negocios que quieren más clientes"
        intro="Somos un estudio de diseño web de Zaragoza. Creamos páginas web claras y rápidas para negocios, autónomos y empresas de Aragón, pensadas para que quien te busca en Google o en el móvil pueda contactarte en segundos."
        crumbs={[{ name: "Diseño web en Zaragoza" }]}
      />
      <article className="w-full pb-10">
        <div className="mx-auto w-full max-w-3xl space-y-10 px-4 text-[16px] leading-relaxed text-foreground/90 sm:px-6">
          <section aria-labelledby="para-quien">
            <h2 id="para-quien" className="font-display text-2xl font-bold">
              Para quién trabajamos
            </h2>
            <p className="mt-3 text-muted">Trabajamos con negocios locales de todo tipo. Estos son los más habituales:</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {WHO.map((w) => (
                <li key={w} className="flex gap-2.5">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" /> {w}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="por-que">
            <h2 id="por-que" className="font-display text-2xl font-bold">
              Por qué un negocio de Zaragoza necesita una buena página web
            </h2>
            <p className="mt-3 text-muted">
              Cuando alguien busca un servicio cerca de casa, lo primero que hace es mirar el móvil: busca en Google, abre el mapa y decide en pocos segundos. Una web clara, con tus servicios, tu horario, tu dirección y un botón de WhatsApp o de llamada a un toque, convierte esa búsqueda en un contacto. Y una web bien construida (rápida, ordenada y con tus datos de Zaragoza) ayuda a que los buscadores entiendan quién eres y a quién sirves.
            </p>
          </section>

          <section aria-labelledby="que-incluye">
            <h2 id="que-incluye" className="font-display text-2xl font-bold">
              Qué incluye tu página web
            </h2>
            <ul className="mt-4 space-y-2.5">
              {["Diseño adaptado a móvil, tablet y ordenador", "Formulario de presupuesto y botón de WhatsApp", "Mapa de Google y botón «Cómo llegar»", "Estructura y textos pensados para Google (títulos, descripciones, datos locales)", "Publicación y revisión contigo antes de salir"].map((i) => (
                <li key={i} className="flex gap-2.5">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" /> {i}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">Nadie puede garantizar una posición concreta en Google: depende de la competencia y del tiempo. Nosotros nos ocupamos de que la base técnica y de contenidos esté bien hecha.</p>
          </section>

          <section aria-labelledby="como-trabajamos">
            <h2 id="como-trabajamos" className="font-display text-2xl font-bold">
              Cómo trabajamos
            </h2>
            <ol className="mt-4 space-y-3 text-muted">
              <li>
                <strong className="text-foreground">1. Diseñas tu web online.</strong> En el <Link href={ROUTES.disena} className="text-cyan-300 underline">configurador</Link> eliges plantilla, colores, secciones e imágenes y ves el resultado al instante.
              </li>
              <li>
                <strong className="text-foreground">2. Te enviamos un presupuesto por escrito.</strong> Revisamos tu diseño y, hasta que lo aceptes, no se cobra nada. Consulta las <Link href={ROUTES.tarifas} className="text-cyan-300 underline">tarifas</Link>.
              </li>
              <li>
                <strong className="text-foreground">3. La construimos y la publicamos.</strong> Normalmente entre 5 y 10 días laborables desde que tenemos tus contenidos.
              </li>
            </ol>
          </section>

          <section aria-labelledby="dudas">
            <h2 id="dudas" className="font-display text-2xl font-bold">
              Dudas habituales
            </h2>
            <p className="mt-3 text-muted">
              ¿Necesitas saber de tecnología? No. ¿Puedo usar mi dominio? Sí. ¿Y si ya tengo una web? Podemos aprovechar sus contenidos con tu permiso. Más respuestas en las <Link href={ROUTES.faq} className="text-cyan-300 underline">preguntas frecuentes</Link>.
            </p>
          </section>
        </div>
      </article>
      <CtaBand title="Cuéntanos qué necesita tu negocio" text="Diseña tu web en unos minutos o escríbenos desde Zaragoza: te respondemos con un presupuesto por escrito." />
    </>
  );
}
