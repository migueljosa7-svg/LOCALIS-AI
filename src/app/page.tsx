"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StellaAiSimulator from "@/components/StellaAiSimulator";
import GpsModuleSection from "@/components/GpsModuleSection";
import SectorsCarousel from "@/components/SectorsCarousel";
import PricingSection from "@/components/PricingSection";
import DashboardClient from "@/components/DashboardClient";
import Footer from "@/components/Footer";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full min-w-0 min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
      <Header
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="w-full min-w-0">
        <HeroSection />
        <StellaAiSimulator />
        <GpsModuleSection />
        <SectorsCarousel />
        <PricingSection />
        <DashboardClient />
      </main>
      <Footer />
    </div>
  );
}
