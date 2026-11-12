import dynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import WebDesignSection from "@/components/WebDesignSection";
import DashboardPreview from "@/components/DashboardPreview";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import SafeBoundary from "@/components/SafeBoundary";
import { LeadProvider } from "@/components/lead/LeadProvider";
import LeadModalGate from "@/components/lead/LeadModalGate";

// Islas interactivas en chunks separados (se renderizan en el servidor para SEO,
// pero su JS se descarga en paralelo y no bloquea el hero). Cada una va dentro
// de un Error Boundary: si una falla, el resto de la página sigue funcionando.
const WebConfigurator = dynamic(() => import("@/components/configurator/WebConfigurator"));
const StellaConsole = dynamic(() => import("@/components/stella/StellaConsole"));
const GpsModuleSection = dynamic(() => import("@/components/gps/GpsModuleSection"));
const SectorsShowcase = dynamic(() => import("@/components/SectorsShowcase"));
const PricingSection = dynamic(() => import("@/components/PricingSection"));
const ThreeStepLeadSection = dynamic(() => import("@/components/ThreeStepLeadSection"));

export default function LandingPage() {
  return (
    <LeadProvider>
      <JsonLd />
      <Header />
      <main id="contenido" className="w-full min-w-0">
        <HeroSection />
        <SafeBoundary name="Estudio visual · Diseña tu web" minHeight={400}>
          <WebConfigurator />
        </SafeBoundary>
        <SafeBoundary name="Simulador de Stella" minHeight={400}>
          <StellaConsole />
        </SafeBoundary>
        <SafeBoundary name="Mapa GPS en tiempo real" minHeight={400}>
          <GpsModuleSection />
        </SafeBoundary>
        <SafeBoundary name="Sectores">
          <SectorsShowcase />
        </SafeBoundary>
        <WebDesignSection />
        <DashboardPreview />
        <SafeBoundary name="Precios">
          <PricingSection />
        </SafeBoundary>
        <FaqSection />
        <TestimonialsSection />
        <SafeBoundary name="Formulario de auditoría">
          <ThreeStepLeadSection />
        </SafeBoundary>
      </main>
      <Footer />
      <SafeBoundary name="Formulario de demo">
        <LeadModalGate />
      </SafeBoundary>
    </LeadProvider>
  );
}
