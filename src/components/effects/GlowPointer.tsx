"use client";

import { useEffect } from "react";

/**
 * Un único listener global (pasivo, limitado a 1 escritura por frame) que
 * actualiza --mx/--my en la `.glow-card` bajo el cursor. Sustituye a decenas
 * de listeners por tarjeta. Solo se activa con puntero fino (ratón/trackpad).
 */
export default function GlowPointer() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let lastEvent: PointerEvent | null = null;

    const flush = () => {
      raf = 0;
      const e = lastEvent;
      if (!e) return;
      const target = (e.target as Element | null)?.closest?.(".glow-card") as HTMLElement | null;
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${e.clientX - r.left}px`);
      target.style.setProperty("--my", `${e.clientY - r.top}px`);
    };

    const onMove = (e: PointerEvent) => {
      lastEvent = e;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
