import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/effects/CursorGlow";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LOCALIS AI — La primera plataforma web con IA Autónoma y GPS Integrado para tu negocio",
  description: "Automatiza tu agenda, emite facturas, atiende a tus clientes 24/7 con la IA Stella y controla tus repartos en tiempo real sin comisiones.",
  keywords: ["IA", "GPS", "plataforma", "entrega", "reparto", "Stella AI", "locales", "administración", "facturación", "agenda"],
  authors: [{ name: "LOCALIS AI" }],
  creator: "LOCALIS AI",
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
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className="w-full p-0 m-0">
      <body
        className={`${inter.variable} w-full min-h-screen bg-[#0B0F17] text-foreground overflow-x-hidden p-0 m-0 antialiased`}
      >
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}
