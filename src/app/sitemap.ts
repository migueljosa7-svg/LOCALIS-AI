import type { MetadataRoute } from "next";
import { INDEXABLE } from "@/lib/navigation";
import { SITE_URL } from "@/lib/site";

// Solo las páginas indexables. Legales, admin, alta y pruebas llevan noindex y no aparecen aquí.
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE.map((p) => ({
    url: `${SITE_URL}${p.path === "/" ? "" : p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
