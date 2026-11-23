import type { Metadata } from "next";
import GpsModuleSection from "@/components/gps/GpsModuleSection";
import SafeBoundary from "@/components/SafeBoundary";
import { ROUTES } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Reparto con GPS sin comisiones (demostración)",
  description:
    "Demostración del módulo de reparto con seguimiento GPS que LOCALIS AI está desarrollando para negocios con repartidores propios en Zaragoza.",
  alternates: { canonical: ROUTES.reparto },
};

export default function RepartoPage() {
  return (
    <SafeBoundary name="Mapa GPS en tiempo real" minHeight={400}>
      <GpsModuleSection titleAs="h1" />
    </SafeBoundary>
  );
}
