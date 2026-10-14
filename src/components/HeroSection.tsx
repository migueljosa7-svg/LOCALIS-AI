"use client";

import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative w-full min-w-0 min-h-screen flex items-center overflow-hidden bg-background"
      style={{ contentVisibility: "auto" }}
    >
      <HeroBackground />
      <HeroContent />
    </section>
  );
}
