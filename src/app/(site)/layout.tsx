import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeBoundary from "@/components/SafeBoundary";
import { LeadProvider } from "@/components/lead/LeadProvider";
import LeadModalGate from "@/components/lead/LeadModalGate";

// Estructura común de los cuatro apartados (Inicio, Plataforma, Diseña tu web,
// Tarifas y FAQ). El proveedor de leads queda montado al navegar entre páginas,
// así el formulario de demo funciona igual en todas.
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
