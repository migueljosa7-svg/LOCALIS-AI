"use client";

import { MessageCircle } from "lucide-react";
import { STELLA_OPEN_EVENT } from "./StellaLauncher";

export default function StellaOpenButton({ label = "Hablar con Stella ahora", variant = "primary" }: { label?: string; variant?: "primary" | "live" }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(STELLA_OPEN_EVENT))} className={`btn ${variant === "live" ? "btn-live" : "btn-primary"} min-h-[54px] px-6 text-base`}>
      <MessageCircle size={19} aria-hidden="true" /> {label}
    </button>
  );
}
