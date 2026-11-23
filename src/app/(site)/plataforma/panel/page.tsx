import type { Metadata } from "next";
import DashboardPreview from "@/components/DashboardPreview";
import { ROUTES } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Panel de control (próximamente)",
  description: "Próximamente: el panel de LOCALIS AI para gestionar citas, conversaciones, facturas y repartos. Vista con datos de ejemplo.",
  // Igual que la antigua /dashboard: es una maqueta, no se indexa.
  robots: { index: false, follow: true },
  alternates: { canonical: ROUTES.panel },
};

export default function PanelPage() {
  return <DashboardPreview titleAs="h1" />;
}
