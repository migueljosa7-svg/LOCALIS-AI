import FaqSection from "@/components/FaqSection";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { CtaBand } from "@/components/site/Blocks";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/preguntas-frecuentes",
  title: "Preguntas frecuentes sobre diseño web y mantenimiento",
  description: "Resolvemos tus dudas sobre cómo contratar tu web, plazos, mantenimiento, Google y Stella, el asistente con IA. Respuestas claras de LOCALIS AI, en Zaragoza.",
});

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd />
      <BreadcrumbJsonLd items={[{ name: "Preguntas frecuentes", path: "/preguntas-frecuentes" }]} />
      <FaqSection titleAs="h1" />
      <CtaBand title="¿No encuentras tu duda?" text="Escríbenos y te respondemos personalmente. También puedes empezar a diseñar tu web ahora mismo." />
    </>
  );
}
