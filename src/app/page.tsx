import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { LeadProvider } from "@/components/lead/LeadProvider";
import LeadCaptureModal from "@/components/lead/LeadCaptureModal";
import dynamic from "next/dynamic";

// Módulos pesados con interactividad → code-splitting (no bloquean LCP del hero).
const StellaConsole = dynamic(() => import("@/components/stella/StellaConsole"), {
  loading: () => (
    <div className="w-full py-20 text-center text-sm text-muted animate-pulse">
      Cargando consola Stella…
    </div>
  ),
});
const GpsModuleSection = dynamic(() => import("@/components/gps/GpsModuleSection"), {
  loading: () => (
    <div className="w-full py-20 text-center text-sm text-muted animate-pulse">
      Cargando módulo GPS…
    </div>
  ),
});
const SectorsShowcase = dynamic(() => import("@/components/SectorsShowcase"));
const PricingSection = dynamic(() => import("@/components/PricingSection"));
const DashboardClient = dynamic(() => import("@/components/DashboardClient"), {
  loading: () => (
    <div className="w-full py-20 text-center text-sm text-muted animate-pulse">
      Cargando demo interactiva…
    </div>
  ),
});
const TestimonialsSection = dynamic(() => import("@/components/TestimonialsSection"));
const AiImpactBlock = dynamic(() => import("@/components/AiImpactBlock"));

export default function LandingPage() {
  return (
    <LeadProvider>
      <div className="w-full min-w-0 min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
        <Header />
        <main className="w-full min-w-0">
          <HeroSection />
          <StellaConsole />
          <GpsModuleSection />
          <SectorsShowcase />
          <PricingSection />
          <DashboardClient />
          <TestimonialsSection />
          <AiImpactBlock />
        </main>
        <Footer />
        <LeadCaptureModal />
      </div>
    </LeadProvider>
  );
}

