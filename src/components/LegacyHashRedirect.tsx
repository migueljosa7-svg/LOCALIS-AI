"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LEGACY_HASHES } from "@/lib/navigation";

// Enlaces antiguos de la web de una sola página (p. ej. /#cita en Google Business o
// en un anuncio): el "#" no llega al servidor, así que se redirige aquí, en la portada.
export default function LegacyHashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const target = LEGACY_HASHES[window.location.hash];
    if (target) router.replace(target);
  }, [router]);
  return null;
}
