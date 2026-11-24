import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: "LOCALIS AI · diseño web para negocios de Zaragoza y Aragón" };

/** Metadatos de una página: título único, descripción, URL canónica propia, Open Graph y Twitter. */
export function pageMeta(o: { title: string; description: string; path: string; index?: boolean }): Metadata {
  const url = o.path === "/" ? "/" : o.path;
  return {
    title: o.path === "/" ? { absolute: o.title } : o.title,
    description: o.description,
    alternates: { canonical: url },
    robots: o.index === false ? { index: false, follow: false } : undefined,
    openGraph: { type: "website", locale: "es_ES", siteName: "LOCALIS AI", url, title: o.title, description: o.description, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: o.title, description: o.description, images: [OG_IMAGE.url] },
  };
}

export const abs = (path: string): string => `${SITE_URL}${path === "/" ? "" : path}`;

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Inicio", path: "/" }, ...items].map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

// Escapa "<" para que ningún texto pueda cerrar la etiqueta <script>.
export const jsonLd = (data: unknown): { __html: string } => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
