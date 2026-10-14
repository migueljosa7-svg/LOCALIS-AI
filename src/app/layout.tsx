import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/effects/CursorGlow";
import LegalBanner from "@/components/LegalBanner";
import JsonLd from "@/components/JsonLd";
import PwaSetup from "@/components/pwa/PwaSetup";
import { env } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-display" });

const SITE_URL = env.siteUrl.replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LOCALIS AI - Paginas Web con IA y GPS para Negocios",
  description:
    "Automatiza tu negocio con LOCALIS AI: IA Stella para citas y facturacion, GPS en tiempo real sin comisiones y venta 24/7. Ideal para municipios, restaurantes y talleres.",
  keywords: [
    "LOCALIS AI",
    "IA para negocios",
    "plataforma IA GPS",
    "control reparto sin comisiones",
    "facturacion automatica IA",
    "agenda inteligente IA",
    "gestion de pedidos",
    "Stella AI",
    "reparto en tiempo real",
    "B2B",
    "SaaS Espana",
  ],
  authors: [{ name: "LOCALIS AI" }],
  creator: "LOCALIS AI",
  applicationName: "LOCALIS AI",
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LOCALIS AI",
  },
  openGraph: {
    title: "LOCALIS AI - Paginas Web con IA y GPS para Negocios",
    description:
      "Automatiza tu negocio con IA Stella y GPS en tiempo real sin comisiones. Ideal para municipios, restaurantes y talleres.",
    type: "website",
    siteName: "LOCALIS AI",
    locale: "es_ES",
    url: "/",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "LOCALIS AI - IA y GPS para Negocios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOCALIS AI - Paginas Web con IA y GPS para Negocios",
    description: "Automatiza tu negocio con IA Stella y GPS en tiempo real sin comisiones.",
    images: ["/icons/icon-512.png"],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className="w-full p-0 m-0">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <JsonLd />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} w-full min-h-screen bg-[#0B0F17] text-foreground overflow-x-hidden p-0 m-0 antialiased`}
      >
        <PwaSetup />
        <CursorGlow />
        <LegalBanner />
        {children}
      </body>
    </html>
  );
}
