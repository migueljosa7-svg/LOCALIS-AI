import type { Metadata } from "next";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard cliente — LOCALIS AI",
  description:
    "Panel de negocio: citas activas, métricas IA, chat con Stella y mapa de flota en vivo.",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <DashboardClient />
    </main>
  );
}
