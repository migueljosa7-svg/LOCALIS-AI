"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Bot } from "lucide-react";
import type { StellaPublicConfig } from "./StellaChat";
import { cn } from "@/lib/utils";

// El código del chat solo se descarga cuando alguien lo abre.
const StellaChat = dynamic(() => import("./StellaChat"), { ssr: false });

/** Evento para abrir Stella desde cualquier botón: window.dispatchEvent(new Event("stella:open")). */
export const STELLA_OPEN_EVENT = "stella:open";

export default function StellaLauncher({ config }: { config: StellaPublicConfig }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onOpen = () => {
      setMounted(true);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener(STELLA_OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(STELLA_OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMounted(true);
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-controls="stella-panel"
        aria-label={open ? "Cerrar el chat con Stella" : "Abrir el chat con Stella, asistente virtual"}
        className={cn(
          "no-print fixed right-4 z-[61] inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cobalt-500 font-bold text-[#04121a] shadow-[0_12px_32px_-8px_rgba(0,242,254,0.55)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-95",
          "bottom-[calc(76px+env(safe-area-inset-bottom))] h-14 w-14 justify-center md:bottom-6 md:right-6 md:h-auto md:w-auto md:py-3.5 md:pl-4 md:pr-5",
          open && "max-md:hidden"
        )}
      >
        <Bot size={22} aria-hidden="true" />
        <span className="hidden text-sm md:inline">Pregunta a Stella</span>
      </button>

      {mounted && (
        <div
          id="stella-panel"
          role="dialog"
          aria-label="Chat con Stella"
          aria-modal="false"
          className={cn(
            "no-print fixed z-[70] overflow-hidden border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] transition-[opacity,transform,visibility] duration-200",
            "inset-0 md:inset-auto md:bottom-24 md:right-6 md:h-[min(620px,calc(100vh-8rem))] md:w-[390px] md:rounded-3xl",
            open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-2 opacity-0"
          )}
        >
          <StellaChat config={config} onClose={() => setOpen(false)} autoFocus={open} />
        </div>
      )}
    </>
  );
}
