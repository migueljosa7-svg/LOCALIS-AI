import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeBoundary from "@/components/SafeBoundary";
import { LeadProvider } from "@/components/lead/LeadProvider";
import LeadModalGate from "@/components/lead/LeadModalGate";

// Estructura común de la web pública: cabecera con pestañas, contenido, pie y formulario de contacto emergente.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LeadProvider>
      <Header />
      <main id="contenido" className="w-full min-w-0">
        {children}
      </main>
      <Footer />
      <SafeBoundary name="Formulario de contacto">
        <LeadModalGate />
      </SafeBoundary>
    </LeadProvider>
  );
}
