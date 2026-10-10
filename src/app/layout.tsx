import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/effects/CursorGlow";
import LegalBanner from "@/components/LegalBanner";
import JsonLd from "@/components/JsonLd";
import PwaSetup from "@/components/pwa/PwaSetup";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LOCALIS AI — Páginas Web con IA y GPS para Negocios",
  description:
    "AUTOMATIZA tu negocio con LOCALIS AI: IA Stella para citas y facturación, GPS en tiempo real sin comisiones y venta 24/7. Plantea provecho de negocio para municipios, restaurantes y talleres.",
  keywords: [
    "LOCALIS AI",
    "IA para negocios",
    "plataforma IA GPS",
    "control reparto sin comisiones",
    "facturación automática IA",
    "agenda inteligente IA",
    "gestión de pedidos",
    "Stella AI",
    "reparto en tiempo real",
    "B2B",
    "SaaS España",
  ],
  authors: [{ name: "LOCALIS AI" }],
  creator: "LOCALIS AI",
  applicationName: "LOCALIS AI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LOCALIS AI",
  },
  openGraph: {
    title: "LOCALIS AI — Páginas Web con IA y GPS para Negocios",
    description:
      "AUTOMATIZA tu negocio con IA Stella y GPS en tiempo real sin comisiones. Plantea provecho de negocio para municipios, restaurantes y talleres.",
    type: "website",
    siteName: "LOCALIS AI",
    locale: "es_ES",
    images: [
      {
        url: "https://localis.ai/og-image.png",
        width: 1200,
        height: 630,
        alt: "LOCALIS AI — IA y GPS para Negocios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOCALIS AI — Páginas Web con IA y GPS para Negocios",
    description:
      "AUTOMATIZA tu negocio con IA Stella y GPS en tiempo real sin comisiones.",
    images: ["https://localis.ai/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0F17",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className="w-full p-0 m-0">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <JsonLd />
      </head>
      <body
        className={`${inter.variable} w-full min-h-screen bg-[#0B0F17] text-foreground overflow-x-hidden p-0 m-0 antialiased`}
      >
        <PwaSetup />
        <CursorGlow />
        <LegalBanner />
        {children}
      </body>
    </html>
  );
}
