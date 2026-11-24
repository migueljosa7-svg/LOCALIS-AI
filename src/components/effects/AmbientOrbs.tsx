"use client";

import { useEffect, useState } from "react";

/**
 * Orbes ambientales flotantes. Capa fija detrás del contenido: solo se anima `transform`.
 * Son decoración: se montan cuando la página ya ha cargado y el navegador está libre (unos segundos después),
 * con un fundido suave. Medido con Lighthouse (móvil): montarlos durante la carga bloqueaba el hilo principal
 * ~1,3 s (TBT) y quitarlos lo dejaba en ~0,06 s. Se ocultan con prefers-reduced-motion (ver globals.css).
 */
export default function AmbientOrbs() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer = 0;
    const idle = (cb: () => void) => {
      const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(cb, { timeout: 2000 });
      else window.setTimeout(cb, 1);
    };
    const start = () => {
      timer = window.setTimeout(() => idle(() => setReady(true)), 3000);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      window.clearTimeout(timer);
    };
  }, []);

  if (!ready) return null;
  return (
    <div className="ambient ambient-in" aria-hidden="true">
      <div className="orb orb-cyan animate-drift" style={{ width: "70vmax", height: "70vmax", top: "-30vmax", left: "-25vmax" }} />
      <div className="orb orb-cobalt animate-drift-slow" style={{ width: "65vmax", height: "65vmax", top: "20vh", right: "-30vmax" }} />
      <div className="orb orb-emerald animate-drift" style={{ width: "50vmax", height: "50vmax", bottom: "-25vmax", left: "15vw", animationDelay: "-12s" }} />
    </div>
  );
}
