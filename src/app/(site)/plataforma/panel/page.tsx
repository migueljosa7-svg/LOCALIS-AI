import type { Metadata } from "next";
import DashboardPreview from "@/components/DashboardPreview";
import { ROUTES } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Panel de control (demostración)",
  description: "Vista previa con datos de ejemplo del panel que LOCALIS AI está desarrollando: citas, Stella IA, facturas y repartos.",
  // Igual que la antigua /dashboard: es una maqueta, no se indexa.
  robots: { index: false, follow: true },
  alternates: { canonical: ROUTES.panel },
};

export default function PanelPage() {
  return <DashboardPreview titleAs="h1" />;
}
