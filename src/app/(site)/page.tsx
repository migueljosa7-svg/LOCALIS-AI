import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import JsonLd from "@/components/JsonLd";
import LegacyHashRedirect from "@/components/LegacyHashRedirect";
import { HomeProblems, HomeExplore } from "@/components/home/HomeSections";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// INICIO: presentación breve, problemas que resolvemos y acceso a los otros tres apartados.
export default function HomePage() {
  return (
    <>
      <JsonLd />
      <LegacyHashRedirect />
      <HeroSection />
      <HomeProblems />
      <HomeExplore />
    </>
  );
}
