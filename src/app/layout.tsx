import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import AmbientOrbs from '@/components/effects/AmbientOrbs';
import GlowPointer from '@/components/effects/GlowPointer';
import MotionProvider from '@/components/motion/MotionProvider';
import LegalBanner from '@/components/LegalBanner';
import PwaSetup from '@/components/pwa/PwaSetup';
import SiteChrome from '@/components/SiteChrome';
import StellaGate from '@/components/stella/StellaGate';
import MobileStickyBar from '@/components/MobileStickyBar';
import HideOnBuilder from '@/components/HideOnBuilder';
import { SITE_URL } from '@/lib/site';
import GtagLoader from '@/components/GtagLoader';

// Tipografía:
//  · Titulares: Space Grotesk (geométrica, autoalojada y precargada por next/font, sin
//    peticiones a Google en runtime). 'swap' + fuente de reserva con métricas ajustadas:
//    CLS medido 0,001 y el titular siempre se ve con la fuente de marca.
//  · Texto: fuente del sistema (SF Pro en iOS/macOS, Roboto en Android, Segoe UI en
//    Windows): 0 KB de descarga y ~35 % menos coste de layout inicial medido en móvil.
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-display' });

const GOOGLE_ADS_ID = 'AW-18505356053';
const GTM_ID = 'GTM-PQQNZPC7';
const TITLE = 'Diseño Web e IA en Zaragoza | LOCALIS AI';
const DESCRIPTION =
  'Diseño web para negocios y autónomos de Zaragoza y Aragón: formulario de presupuesto, WhatsApp, Google Maps y base SEO local. Diseña tu web online y recibe un presupuesto por escrito.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s | LOCALIS AI' },
  description: DESCRIPTION,
  keywords: [
    'diseño web Zaragoza',
    'diseño web Aragón',
    'páginas web para autónomos',
    'páginas web PYME Zaragoza',
    'presupuesto página web Zaragoza',
    'configurador web restaurante clínica taller',
  ],
  authors: [{ name: 'LOCALIS AI' }],
  creator: 'LOCALIS AI',
  applicationName: 'LOCALIS AI',
  manifest: '/manifest.json',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    siteName: 'LOCALIS AI',
    locale: 'es_ES',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'LOCALIS AI · diseño web para negocios y autónomos de Zaragoza' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  formatDetection: { telephone: false },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

// Sin maximumScale: bloquear el zoom penaliza accesibilidad (Lighthouse / WCAG 1.4.4).
export const viewport: Viewport = {
  themeColor: '#0B0F17',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
  viewportFit: 'cover',
};

// Google Consent Mode v2: todo denegado por defecto (RGPD) y se restaura la
// elección guardada por el banner. Se ejecuta ANTES de cargar gtag/GTM, así
// ninguna etiqueta se dispara sin consentimiento. El evento 'gtm.start' es el
// que activa los disparadores "Todas las páginas" del contenedor de GTM.
const CONSENT_BOOTSTRAP = `
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{var c=JSON.parse(localStorage.getItem('localis-cookie-consent')||'null');if(c){gtag('consent','update',{ad_storage:c.marketing?'granted':'denied',ad_user_data:c.marketing?'granted':'denied',ad_personalization:c.marketing?'granted':'denied',analytics_storage:c.analytics?'granted':'denied'});}}catch(e){}
gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');
dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={spaceGrotesk.variable}>
      <body className="font-sans min-h-screen bg-background text-foreground antialiased pb-[calc(68px+env(safe-area-inset-bottom))] md:pb-0">
        <Script id="consent-bootstrap" strategy="beforeInteractive">
          {CONSENT_BOOTSTRAP}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* gtag.js y GTM se descargan en la primera interacción (o a los 4 s): no compiten con el LCP. */}
        <SiteChrome>
          <GtagLoader
            sources={[
              `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`,
              `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`,
            ]}
          />
        </SiteChrome>

        <SiteChrome>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-cyan-500 focus:text-background focus:font-semibold"
          >
            Saltar al contenido
          </a>
        </SiteChrome>
        <SiteChrome>
          <HideOnBuilder>
            <AmbientOrbs />
            <GlowPointer />
          </HideOnBuilder>
        </SiteChrome>
        <MotionProvider>
          {children}
          <SiteChrome>
            <PwaSetup />
            <LegalBanner />
          </SiteChrome>
        </MotionProvider>
        <SiteChrome>
          <HideOnBuilder mode="editing">
            <StellaGate />
            <MobileStickyBar />
          </HideOnBuilder>
        </SiteChrome>
      </body>
    </html>
  );
}
