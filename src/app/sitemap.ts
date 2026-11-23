import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { ROUTES } from "@/lib/navigation";

export default function sitemap(): MetadataRoute.Sitemap {
  // Las páginas legales y el panel de demostración llevan noindex, así que no se incluyen.
  const pages: [string, number][] = [
    [ROUTES.inicio, 1],
    [ROUTES.disena, 0.9],
    [ROUTES.tarifas, 0.9],
    [ROUTES.plataforma, 0.7],
    [ROUTES.sectores, 0.7],
    [ROUTES.stella, 0.5],
    [ROUTES.reparto, 0.5],
  ];
  const lastModified = new Date();
  return pages.map(([path, priority]) => ({
    url: `${SITE_URL}${path === "/" ? "/" : path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));
}
