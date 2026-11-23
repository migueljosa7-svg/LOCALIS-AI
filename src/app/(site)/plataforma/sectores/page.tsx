import type { Metadata } from "next";
import SectorsShowcase from "@/components/SectorsShowcase";
import SafeBoundary from "@/components/SafeBoundary";
import { ROUTES } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Soluciones por sector",
  description:
    "Webs para restaurantes, clínicas, talleres y comercios de Zaragoza: qué necesita cada sector y qué incluye hoy tu web.",
  alternates: { canonical: ROUTES.sectores },
};

export default function SectoresPage() {
  return (
    <SafeBoundary name="Sectores">
      <SectorsShowcase titleAs="h1" />
    </SafeBoundary>
  );
}
