import type { Metadata } from "next";
import StellaConsole from "@/components/stella/StellaConsole";
import StellaLiveSection from "@/components/stella/StellaLiveSection";
import SafeBoundary from "@/components/SafeBoundary";
import { ROUTES } from "@/lib/navigation";
import { stellaEnabled } from "@/lib/stella/businesses";

export function generateMetadata(): Metadata {
  const live = stellaEnabled();
  return {
    title: live ? "Stella, asistente virtual con IA para tu web" : "Stella, asistente virtual con IA (próximamente)",
    description: live
      ? "Stella responde las dudas de tus clientes en tu web, recoge sus datos con su consentimiento y los pasa a WhatsApp. Se instala con una línea. Próximamente: citas y WhatsApp automático."
      : "Así funcionará Stella, la asistente virtual con IA de LOCALIS AI para negocios locales: WhatsApp, citas y facturas. Próximamente.",
    alternates: { canonical: ROUTES.stella },
  };
}

export default function StellaPage() {
  const live = stellaEnabled();
  return (
    <>
      {live && <StellaLiveSection />}
      <SafeBoundary name="Simulador de Stella" minHeight={400}>
        {/* Con Stella activa, el simulador muestra lo que viene (citas, WhatsApp, facturas). */}
        <StellaConsole titleAs={live ? "h2" : "h1"} />
      </SafeBoundary>
    </>
  );
}
