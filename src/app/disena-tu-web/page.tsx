import type { Metadata } from "next";
import Builder from "@/components/builder/Builder";
import SafeBoundary from "@/components/SafeBoundary";

export const metadata: Metadata = {
  title: "Diseña tu web en directo",
  description:
    "Elige colores, tipografías, botones, imágenes y el orden de tu página con una vista previa en directo en ordenador, tablet y móvil. Envíanos tu diseño y te preparamos el presupuesto, sin compromiso.",
  alternates: { canonical: "/disena-tu-web" },
};

export default function DisenaTuWebPage() {
  return (
    <main id="contenido">
      <SafeBoundary name="Editor «Diseña tu web»" minHeight={600}>
        <Builder />
      </SafeBoundary>
    </main>
  );
}
