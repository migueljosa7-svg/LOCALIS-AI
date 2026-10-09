import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/effects/CursorGlow";
import PwaSetup from "@/components/pwa/PwaSetup";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LOCALIS AI — La primera plataforma web con IA Autónoma y GPS Integrado para tu negocio",
  description: "Automatiza tu agenda, emite facturas, atiende a tus clientes 24/7 con la IA Stella y controla tus repartos en tiempo real sin comisiones.",
  keywords: ["IA", "GPS", "plataforma", "entrega", "reparto", "Stella AI", "locales", "administración", "facturación", "agenda"],
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
    title: "LOCALIS AI — IA y GPS para tu negocio",
    description: "Automatiza tu agenda, emite facturas y controla tus repartos en tiempo real sin comisiones.",
    type: "website",
    siteName: "LOCALIS AI",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "LOCALIS AI — IA y GPS para tu negocio",
    description: "Automatiza tu agenda, emite facturas y controla tus repartos en tiempo real sin comisiones.",
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
      </head>
      <body
        className={`${inter.variable} w-full min-h-screen bg-[#0B0F17] text-foreground overflow-x-hidden p-0 m-0 antialiased`}
      >
        <PwaSetup />
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}
