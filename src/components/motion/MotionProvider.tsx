"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Framer Motion en modo ligero: `LazyMotion` + componentes `m.*` cargan solo
 * las features de animación DOM (~-60% de peso frente a `motion.*`).
 * `strict` hace fallar en desarrollo si alguien vuelve a importar `motion`.
 * `reducedMotion="user"` respeta la preferencia del sistema operativo.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
