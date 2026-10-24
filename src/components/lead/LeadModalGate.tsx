"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLead } from "./LeadProvider";

// El código del modal (formulario + animaciones) solo se descarga la primera vez
// que alguien lo abre; después queda montado para conservar la animación de salida.
const LeadCaptureModal = dynamic(() => import("./LeadCaptureModal"), { ssr: false });

export default function LeadModalGate() {
  const { isOpen } = useLead();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);
  return mounted ? <LeadCaptureModal /> : null;
}
