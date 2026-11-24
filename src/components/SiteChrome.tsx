"use client";

import { usePathname } from "next/navigation";

// Elementos globales de nuestra web (analítica, cookies, botones flotantes…).
// No se muestran en el chat de Stella incrustado en webs de clientes: allí no
// deben cargarse nuestras cookies ni nuestra analítica.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/stella/embed")) return null;
  // Página de pruebas de instalación (solo Preview): ahí el único Stella debe ser el del negocio de prueba.
  if (pathname?.startsWith("/prueba-stella")) return null;
  // Panel interno: sin analítica, cookies de la web pública ni botones flotantes (taparían los controles y no aplican).
  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;
  return <>{children}</>;
}
