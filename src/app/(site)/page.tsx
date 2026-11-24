import HeroSection from "@/components/HeroSection";
import JsonLd from "@/components/JsonLd";
import LegacyHashRedirect from "@/components/LegacyHashRedirect";
import { CtaBand, HomeBenefits, HomeExplore, HomeProcess } from "@/components/site/Blocks";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/",
  title: "Diseño web en Zaragoza para negocios y autónomos | LOCALIS AI",
  description: "Diseñamos páginas web para negocios, autónomos y empresas de Zaragoza y Aragón. Diseña la tuya online, recibe un presupuesto por escrito y consigue más contactos.",
});

// INICIO: presentación breve, beneficios, cómo empezar y acceso al resto de apartados.
export default function HomePage() {
  return (
    <>
      <JsonLd />
      <LegacyHashRedirect />
      <HeroSection />
      <HomeBenefits />
      <HomeProcess />
      <HomeExplore />
      <CtaBand />
    </>
  );
}
