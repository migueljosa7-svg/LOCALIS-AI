import Builder from "@/components/builder/Builder";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import SafeBoundary from "@/components/SafeBoundary";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/disena-tu-web",
  title: "Diseña tu web en directo",
  description: "Elige colores, tipografías, imágenes y secciones con vista previa en ordenador, tablet y móvil. Envíanos tu diseño y te enviamos un presupuesto sin compromiso.",
});

export default function DisenaTuWebPage() {
  return (
    <main id="contenido">
      <BreadcrumbJsonLd items={[{ name: "Diseña tu web", path: "/disena-tu-web" }]} />
      <SafeBoundary name="Editor «Diseña tu web»" minHeight={600}>
        <Builder />
      </SafeBoundary>
    </main>
  );
}
