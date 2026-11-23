"use client";

import { usePathname } from "next/navigation";

// Elementos globales de nuestra web (analítica, cookies, botones flotantes…).
// No se muestran en el chat de Stella incrustado en webs de clientes: allí no
// deben cargarse nuestras cookies ni nuestra analítica.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/stella/embed")) return null;
  return <>{children}</>;
}
