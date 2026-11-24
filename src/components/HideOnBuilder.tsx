"use client";

import { usePathname } from "next/navigation";

// Editor «Diseña tu web»:
//  · mode="always": efectos de fondo, fuera en todo el editor (pesan y no aportan).
//  · mode="editing": botones flotantes y barra inferior. Se ven en la pantalla de inicio del editor y en el resto de la web,
//    y se ocultan solo mientras se diseña (el editor marca <html data-builder-editing>), porque taparían los controles.
export default function HideOnBuilder({ children, mode = "always" }: { children: React.ReactNode; mode?: "always" | "editing" }) {
  const onBuilder = usePathname()?.startsWith("/disena-tu-web");
  if (mode === "always") return onBuilder ? null : <>{children}</>;
  return <div className="builder-float">{children}</div>;
}
