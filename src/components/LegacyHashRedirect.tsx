"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LEGACY_HASHES } from "@/lib/navigation";

// Los enlaces antiguos con «#» (la web era una sola página) llegan a la portada: se llevan a su página actual.
export default function LegacyHashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const target = LEGACY_HASHES[window.location.hash];
    if (target) router.replace(target);
  }, [router]);
  return null;
}
