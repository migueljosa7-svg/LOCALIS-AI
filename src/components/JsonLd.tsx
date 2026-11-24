/**
 * Datos estructurados JSON-LD (Schema.org). Solo se publica lo que es verdad y verificable:
 *  - ProfessionalService: negocio local de Zaragoza (sin valoraciones ni precios inventados).
 *  - WebSite.
 *  - FAQPage: las mismas preguntas visibles en /preguntas-frecuentes.
 *  - BreadcrumbList en las páginas interiores.
 * No se publica AggregateRating ni Offer con precios: no hay reseñas verificadas aportadas ni tarifas aprobadas.
 */
import { FAQS } from "@/lib/faqs";
import { CONTACT, SITE_URL } from "@/lib/site";
import { breadcrumbs, jsonLd } from "@/lib/seo";

const BUSINESS = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#negocio`,
  name: "LOCALIS AI",
  description: "Diseño web para negocios, autónomos y empresas de Zaragoza y Aragón: webs profesionales con formulario de presupuesto, WhatsApp, Google Maps y SEO local.",
  url: SITE_URL,
  logo: `${SITE_URL}/google-business-assets/logo-720x720.png`,
  image: `${SITE_URL}/og-image.png`,
  telephone: CONTACT.phoneE164,
  email: CONTACT.email,
  address: { "@type": "PostalAddress", addressLocality: "Zaragoza", addressRegion: "Aragón", addressCountry: "ES" },
  areaServed: [
    { "@type": "City", name: "Zaragoza" },
    { "@type": "AdministrativeArea", name: "Aragón" },
  ],
  knowsLanguage: "es-ES",
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Diseño y creación de páginas web para negocios locales" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Mantenimiento de páginas web" } },
  ],
};

const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#web`,
  url: SITE_URL,
  name: "LOCALIS AI",
  inLanguage: "es-ES",
  publisher: { "@id": `${SITE_URL}/#negocio` },
};

const FAQ_PAGE = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
};

/** Negocio + sitio web (portada y contacto). */
export default function JsonLd() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(BUSINESS)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(WEBSITE)} />
    </>
  );
}

export function FaqJsonLd() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(FAQ_PAGE)} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs(items))} />;
}
