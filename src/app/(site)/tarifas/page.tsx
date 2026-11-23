import type { Metadata } from "next";
import PricingSection from "@/components/PricingSection";
import WebDesignSection from "@/components/WebDesignSection";
import ConditionsSection from "@/components/pricing/ConditionsSection";
import FaqSection from "@/components/FaqSection";
import SafeBoundary from "@/components/SafeBoundary";
import { FaqJsonLd } from "@/components/JsonLd";
import { ROUTES } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Tarifas y preguntas frecuentes",
  description:
    "Precios cerrados de diseño web para negocios de Zaragoza, qué incluye cada plan, condiciones sin permanencia y respuestas a las dudas más habituales.",
  alternates: { canonical: ROUTES.tarifas },
};

// TARIFAS Y FAQ: precios, qué incluye, condiciones y preguntas frecuentes.
export default function TarifasPage() {
  return (
    <>
      <FaqJsonLd />
      <SafeBoundary name="Precios">
        <PricingSection titleAs="h1" />
      </SafeBoundary>
      <WebDesignSection />
      <ConditionsSection />
      <FaqSection />
    </>
  );
}
