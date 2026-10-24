import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import AmbientOrbs from '@/components/effects/AmbientOrbs';
import GlowPointer from '@/components/effects/GlowPointer';
import MotionProvider from '@/components/motion/MotionProvider';
import LegalBanner from '@/components/LegalBanner';
import PwaSetup from '@/components/pwa/PwaSetup';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import MobileStickyBar from '@/components/MobileStickyBar';
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
const TITLE = 'Diseño Web e IA en Zaragoza | LOCALIS AI';
const DESCRIPTION =
  'Páginas web con IA autónoma (Stella 24/7) y GPS de reparto integrado para PYMEs de Zaragoza. Citas automáticas, WhatsApp, facturación y entregas propias sin comisiones.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s | LOCALIS AI' },
  description: DESCRIPTION,
  keywords: [
    'diseño web Zaragoza',
    'asistente virtual IA Zaragoza',
    'software reparto GPS sin comisiones',
    'citas automáticas WhatsApp',
    'páginas web PYME Zaragoza',
  ],
  authors: [{ name: 'LOCALIS AI' }],
  creator: 'LOCALIS AI',
  applicationName: 'LOCALIS AI',
  manifest: '/manifest.json',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    siteName: 'LOCALIS AI',
    locale: 'es_ES',
    url: '/',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'LOCALIS AI · Webs con IA Stella y GPS integrado para PYMEs en Zaragoza' }],
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
// elección guardada por el banner. Las conversiones de Ads siguen midiéndose
// de forma anónima hasta que el usuario acepta.
const CONSENT_BOOTSTRAP = `
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{var c=JSON.parse(localStorage.getItem('localis-cookie-consent')||'null');if(c){gtag('consent','update',{ad_storage:c.marketing?'granted':'denied',ad_user_data:c.marketing?'granted':'denied',ad_personalization:c.marketing?'granted':'denied',analytics_storage:c.analytics?'granted':'denied'});}}catch(e){}
gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={spaceGrotesk.variable}>
      <body className="font-sans min-h-screen bg-background text-foreground antialiased pb-[calc(68px+env(safe-area-inset-bottom))] md:pb-0">
        <Script id="consent-bootstrap" strategy="afterInteractive">
          {CONSENT_BOOTSTRAP}
        </Script>
        {/* gtag.js se descarga en la primera interacción (o a los 4 s): no compite con el LCP. */}
        <GtagLoader id={GOOGLE_ADS_ID} />

        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-cyan-500 focus:text-background focus:font-semibold"
        >
          Saltar al contenido
        </a>
        <AmbientOrbs />
        <GlowPointer />
        <MotionProvider>
          {children}
          <PwaSetup />
          <LegalBanner />
        </MotionProvider>
        <WhatsAppFloat />
        <MobileStickyBar />
      </body>
    </html>
  );
}
