"use client";

import { usePathname } from "next/navigation";

// El editor «Diseña tu web» ocupa toda la pantalla: aquí no se muestran los botones flotantes,
// la barra inferior ni los efectos de fondo de la web (taparían los controles).
export default function HideOnBuilder({ children }: { children: React.ReactNode }) {
  return usePathname()?.startsWith("/disena-tu-web") ? null : <>{children}</>;
}
