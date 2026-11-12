"use client";

import { useEffect } from "react";
import Link from "next/link";

// Error de ruta: se muestra en lugar de la página si algo falla al renderizar.
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[LOCALIS] Error de página:", error.message, error.digest ?? "");
  }, [error]);

  return (
    <main id="contenido" className="mx-auto max-w-xl px-4 py-28 text-center">
      <p className="eyebrow">Algo no ha ido bien</p>
      <h1 className="mt-5 font-display text-3xl sm:text-4xl font-bold">Ha ocurrido un error inesperado</h1>
      <p className="mt-4 text-muted">Ya estamos avisados. Puedes reintentarlo o contactarnos por WhatsApp mientras tanto.</p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button type="button" onClick={reset} className="btn btn-primary">
          Reintentar
        </button>
        <Link href="/" className="btn btn-ghost">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
