import type { Metadata } from "next";
import GpsModuleSection from "@/components/gps/GpsModuleSection";
import SafeBoundary from "@/components/SafeBoundary";
import { ROUTES } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Reparto con GPS sin comisiones (próximamente)",
  description:
    "Próximamente: reparto con seguimiento GPS en tiempo real para negocios de Zaragoza con repartidores propios, sin comisiones de plataformas.",
  alternates: { canonical: ROUTES.reparto },
};

export default function RepartoPage() {
  return (
    <SafeBoundary name="Mapa GPS en tiempo real" minHeight={400}>
      <GpsModuleSection titleAs="h1" />
    </SafeBoundary>
  );
}
