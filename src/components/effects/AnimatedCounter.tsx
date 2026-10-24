"use client";

import { useEffect, useRef, useState } from "react";

function format(v: number, decimals: number, locale: string) {
  return v.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * Contador animado sin re-renders: escribe el texto directamente en el nodo
 * (requestAnimationFrame) en vez de hacer setState 60 veces por segundo.
 * - SSR y primer render muestran el valor final (SEO, sin JS, sin desajuste de hidratación).
 * - La primera animación arranca justo antes de entrar en pantalla.
 * - Si `value` cambia (p. ej. un slider) anima desde el valor mostrado al nuevo.
 */
export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 900,
  locale = "es-ES",
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  locale?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Texto inicial fijo: React no vuelve a tocar el nodo, solo el efecto lo actualiza.
  const [initialText] = useState(() => `${prefix}${format(value, decimals, locale)}${suffix}`);
  const shown = useRef(value);
  const started = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const write = (v: number) => {
      shown.current = v;
      el.textContent = `${prefix}${format(v, decimals, locale)}${suffix}`;
    };

    const animate = (from: number, to: number, ms: number) => {
      cancelAnimationFrame(raf.current);
      if (reduced || from === to) return write(to);
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        write(from + (to - from) * (1 - Math.pow(1 - t, 3)));
        if (t < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    };

    if (started.current) {
      animate(shown.current, value, Math.min(duration, 450));
      return () => cancelAnimationFrame(raf.current);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        started.current = true;
        animate(0, value, duration);
      },
      { rootMargin: "0px 0px 10% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [value, prefix, suffix, decimals, duration, locale]);

  return (
    <span ref={ref} className={className}>
      {initialText}
    </span>
  );
}
