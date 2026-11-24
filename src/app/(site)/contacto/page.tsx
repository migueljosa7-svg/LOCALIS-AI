import dynamic from "next/dynamic";
import JsonLd, { BreadcrumbJsonLd } from "@/components/JsonLd";
import SafeBoundary from "@/components/SafeBoundary";
import { ContactCards, PageHeader } from "@/components/site/Blocks";
import { pageMeta } from "@/lib/seo";

const ThreeStepLeadSection = dynamic(() => import("@/components/ThreeStepLeadSection"));

export const metadata = pageMeta({
  path: "/contacto",
  title: "Contacto: pide presupuesto para tu web en Zaragoza",
  description: "Cuéntanos qué necesitas y te respondemos con un presupuesto por escrito. Escríbenos por WhatsApp, llama o rellena el formulario. Estamos en Zaragoza.",
});

export default function ContactoPage() {
  return (
    <>
      <JsonLd />
      <BreadcrumbJsonLd items={[{ name: "Contacto", path: "/contacto" }]} />
      <PageHeader
        eyebrow="Contacto"
        title="Hablemos de tu web"
        intro="Cuéntanos qué necesitas y te respondemos con un presupuesto por escrito, sin compromiso. Puedes escribirnos por WhatsApp, llamarnos o dejar tus datos en el formulario."
        crumbs={[{ name: "Contacto" }]}
      />
      <section aria-label="Formas de contacto" className="w-full pb-4">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactCards />
        </div>
      </section>
      <SafeBoundary name="Formulario de contacto">
        <ThreeStepLeadSection />
      </SafeBoundary>
    </>
  );
}
