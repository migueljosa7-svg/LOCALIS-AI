"use client";

import { useEffect, useState } from "react";

/**
 * Devuelve `true` solo tras el primer montaje en el cliente.
 * Evita el render de componentes que dependen de APIs del navegador (Leaflet,
 * canvas, etc.) durante el SSR, previniendo errores de hidratación en Next.js.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
