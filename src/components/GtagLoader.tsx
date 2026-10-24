"use client";

import { useEffect } from "react";

/**
 * Descarga gtag.js (≈170 KB) en la primera interacción del usuario o, como
 * mucho, 4 s después de cargar la página. La cola `dataLayer` ya creada en el
 * layout guarda los eventos previos, así que no se pierde ninguna conversión,
 * y el script deja de competir con el LCP y la interactividad inicial.
 */
export default function GtagLoader({ id }: { id: string }) {
  useEffect(() => {
    let done = false;
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    const load = () => {
      if (done) return;
      done = true;
      events.forEach((e) => window.removeEventListener(e, load));
      const s = document.createElement("script");
      s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      s.async = true;
      document.head.appendChild(s);
    };
    events.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
    const timer = window.setTimeout(load, 4000);
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, load));
    };
  }, [id]);
  return null;
}
