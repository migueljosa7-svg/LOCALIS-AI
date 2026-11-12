"use client";

import { useEffect } from "react";

/**
 * Descarga gtag.js y Google Tag Manager en la primera interacción del usuario o, como
 * mucho, 4 s después de cargar la página. La cola `dataLayer` ya creada en el
 * layout guarda los eventos previos, así que no se pierde ninguna conversión,
 * y el script deja de competir con el LCP y la interactividad inicial.
 */
// Garantiza una sola carga aunque el componente se vuelva a montar al navegar.
let loaded = false;

export default function GtagLoader({ sources }: { sources: string[] }) {
  useEffect(() => {
    if (loaded) return;
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    const load = () => {
      if (loaded) return;
      loaded = true;
      events.forEach((e) => window.removeEventListener(e, load));
      for (const src of sources) {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        document.head.appendChild(s);
      }
    };
    events.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
    const timer = window.setTimeout(load, 4000);
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, load));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- las URLs son constantes del layout
  }, []);
  return null;
}
