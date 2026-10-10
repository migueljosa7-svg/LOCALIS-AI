"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StellaConsole from "@/components/stella/StellaConsole";
import GpsModuleSection from "@/components/gps/GpsModuleSection";
import SectorsShowcase from "@/components/SectorsShowcase";
import PricingSection from "@/components/PricingSection";
import DashboardClient from "@/components/DashboardClient";
import TestimonialsSection from "@/components/TestimonialsSection";
import AiImpactBlock from "@/components/AiImpactBlock";
import Footer from "@/components/Footer";
import { LeadProvider } from "@/components/lead/LeadProvider";
import LeadCaptureModal from "@/components/lead/LeadCaptureModal";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <LeadProvider>
      <div className="w-full min-w-0 min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
        <Header
          scrolled={scrolled}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className="w-full min-w-0">
          <HeroSection />
          <StellaConsole />
          <GpsModuleSection />
          <SectorsShowcase />
          <PricingSection />
          <DashboardClient />
          <TestimonialsSection />
          <AiImpactBlock />
        </main>
        <Footer />
        <LeadCaptureModal />
      </div>
    </LeadProvider>
  );
}
