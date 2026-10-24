/**
 * Datos estructurados JSON-LD (Schema.org) en el <head>:
 *  - ProfessionalService (negocio local en Zaragoza) → ficha enriquecida / Maps
 *  - WebSite
 *  - FAQPage (las mismas preguntas visibles en la sección #faq)
 *
 * No se publica AggregateRating: Google exige que las valoraciones sean reales y
 * verificables. Añádelo solo cuando tengas reseñas reales (p. ej. de Google Business).
 */
import { FAQS } from "@/lib/faqs";
import { PLANS } from "@/lib/plans";
import { CONTACT, SITE_URL } from "@/lib/site";

const BUSINESS = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#negocio`,
  name: "LOCALIS AI",
  description:
    "Diseño web e inteligencia artificial en Zaragoza: páginas web con asistente IA Stella 24/7 (WhatsApp, citas y facturación) y software de reparto GPS sin comisiones para PYMEs.",
  url: SITE_URL,
  logo: `${SITE_URL}/google-business-assets/logo-720x720.png`,
  image: `${SITE_URL}/og-image.png`,
  telephone: CONTACT.phoneE164,
  email: CONTACT.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Zaragoza",
    addressRegion: "Aragón",
    addressCountry: "ES",
  },
  areaServed: [
    { "@type": "City", name: "Zaragoza" },
    { "@type": "AdministrativeArea", name: "Aragón" },
  ],
  priceRange: "€€",
  makesOffer: PLANS.map((p) => ({
    "@type": "Offer",
    name: `Plan ${p.name}`,
    description: p.description,
    price: p.priceMonth.toFixed(2),
    priceCurrency: "EUR",
  })),
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
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

// Escapa "<" para que ningún texto pueda cerrar la etiqueta <script>.
const json = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

export default function JsonLd() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={json(BUSINESS)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={json(WEBSITE)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={json(FAQ_PAGE)} />
    </>
  );
}
