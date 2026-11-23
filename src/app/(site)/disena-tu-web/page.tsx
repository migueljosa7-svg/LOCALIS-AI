import type { Metadata } from "next";
import WebConfigurator from "@/components/configurator/WebConfigurator";
import ThreeStepLeadSection from "@/components/ThreeStepLeadSection";
import SafeBoundary from "@/components/SafeBoundary";
import { ROUTES } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Diseña tu web y calcula el precio",
  description:
    "Elige sector, estilo, páginas y botones, mira cómo quedaría tu web y conoce el precio cerrado al momento. Envíanos tu diseño o pide una auditoría gratuita.",
  alternates: { canonical: ROUTES.disena },
};

// DISEÑA TU WEB: estudio visual con precio al momento + formulario de auditoría.
export default function DisenaPage() {
  return (
    <>
      <SafeBoundary name="Estudio visual · Diseña tu web" minHeight={400}>
        <WebConfigurator titleAs="h1" />
      </SafeBoundary>
      <SafeBoundary name="Formulario de auditoría">
        <ThreeStepLeadSection />
      </SafeBoundary>
    </>
  );
}
