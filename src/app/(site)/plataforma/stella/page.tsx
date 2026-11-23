import type { Metadata } from "next";
import StellaConsole from "@/components/stella/StellaConsole";
import SafeBoundary from "@/components/SafeBoundary";
import { ROUTES } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Stella IA (demostración)",
  description:
    "Prueba la demostración de Stella, la asistente con IA que LOCALIS AI está desarrollando para atender WhatsApp y agendar citas. Datos de ejemplo.",
  alternates: { canonical: ROUTES.stella },
};

export default function StellaPage() {
  return (
    <SafeBoundary name="Simulador de Stella" minHeight={400}>
      <StellaConsole titleAs="h1" />
    </SafeBoundary>
  );
}
