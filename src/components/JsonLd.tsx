/**
 * Datos estructurados JSON-LD (Schema.org) inyectados en el <head>.
 *
 * Schemas incluidos:
 *  - SoftwareApplication (LOCALIS AI como aplicación SaaS)
 *  - LocalBusiness (LOCALIS AI como negocio B2B)
 *  - FAQPage (preguntas frecuentes de la landing)
 */

import { FAQS } from "@/lib/faqs";

const LOCALIS_APPLICATION = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "LOCALIS AI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Plataforma SaaS con IA Stella y GPS en tiempo real para negocios: automatización de citas, facturación, facturación de reparto sin comisiones y venta 24/7.",
  url: "https://localis.ai",
  author: {
    "@type": "Organization",
    name: "LOCALIS AI",
    url: "https://localis.ai",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "127",
  },
  offers: {
    "@type": "Offer",
    price: "49.00",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
};

const LOCALIS_BUSINESS = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "LOCALIS AI",
  image: "https://localis.ai/og-image.png",
  description:
    "Automatización de negocios con IA Stella y GPS en tiempo real sin comisiones. Servicios para restaurantes, talleres, municipios y B2B.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Madrid",
    addressCountry: "ES",
    postalCode: "28001",
    streetAddress: "C/ Demo 1",
  },
  phone: "+34912345678",
  email: "hola@localis.ai",
  priceRange: "€€€",
  sameAs: [
    "https://linkedin.com/company/localis-ai",
    "https://x.com/localis_ai",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "127",
  },
};

const FAQ_PAGE = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function JsonLd() {
  return (
    <>
      <script
        key="softwareapplication"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCALIS_APPLICATION) }}
      />
      <script
        key="localbusiness"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCALIS_BUSINESS) }}
      />
      <script
        key="faqpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_PAGE) }}
      />
    </>
  );
}
