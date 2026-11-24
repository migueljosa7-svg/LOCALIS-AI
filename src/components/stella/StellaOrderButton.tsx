"use client";

import { Sparkles } from "lucide-react";
import { useLead } from "@/components/lead/LeadProvider";

/** Pedido de Stella (queda en el panel como «PEDIDO DE STELLA»; no activa ni cobra nada). */
export default function StellaOrderButton({ label = "Quiero Stella en mi web" }: { label?: string }) {
  const { openLead } = useLead();
  return (
    <button type="button" onClick={() => openLead("stella-pedido", { details: "Pedido: Stella, asistente virtual con IA, para la web de mi negocio." })} className="btn btn-primary min-h-[54px] px-6 text-base">
      <Sparkles size={19} aria-hidden="true" /> {label}
    </button>
  );
}
