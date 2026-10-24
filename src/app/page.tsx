import dynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import WebDesignSection from "@/components/WebDesignSection";
import DashboardPreview from "@/components/DashboardPreview";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { LeadProvider } from "@/components/lead/LeadProvider";
import LeadModalGate from "@/components/lead/LeadModalGate";

// Islas interactivas en chunks separados (se renderizan en el servidor para SEO,
// pero su JS se descarga en paralelo y no bloquea el hero).
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
        <StellaConsole />
        <GpsModuleSection />
        <SectorsShowcase />
        <WebDesignSection />
        <DashboardPreview />
        <PricingSection />
        <TestimonialsSection />
        <ThreeStepLeadSection />
        <FaqSection />
      </main>
      <Footer />
      <LeadModalGate />
    </LeadProvider>
  );
}
