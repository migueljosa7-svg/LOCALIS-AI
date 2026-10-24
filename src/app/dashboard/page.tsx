import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardPreview from "@/components/DashboardPreview";

export const metadata: Metadata = {
  title: "Panel de control (demo)",
  description: "Vista previa del panel de LOCALIS AI: citas, Stella IA, facturas y repartos GPS en directo.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/dashboard" },
};

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main id="contenido" className="w-full min-w-0">
        <DashboardPreview />
      </main>
      <Footer />
    </>
  );
}
