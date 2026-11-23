"use client";

import { MessageCircle, Sparkles } from "lucide-react";
import { useLead } from "@/components/lead/LeadProvider";

/** Etiqueta con la que llegan al panel los pedidos de Stella (ver /admin y docs/STELLA-GUIA.md). */
export const STELLA_ORDER_SOURCE = "stella-pedido";

/** Botones de la sección real de Stella: hablar con ella (abre el widget) y pedirla para la web propia. */
export default function StellaActions() {
  const { openLead } = useLead();
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button type="button" onClick={() => {
          // Si el widget aún no ha cargado, queda anotado y se abre en cuanto esté listo.
          (window as unknown as { __stellaOpenPending?: boolean }).__stellaOpenPending = true;
          window.dispatchEvent(new Event("stella:open"));
        }} className="btn btn-primary min-h-[54px] px-6 text-base">
        <MessageCircle size={19} aria-hidden="true" /> Hablar con Stella ahora
      </button>
      <button
        type="button"
        onClick={() => openLead(STELLA_ORDER_SOURCE, { details: "Pedido: Stella, asistente virtual con IA, para la web de mi negocio." })}
        className="btn btn-live min-h-[54px] px-6 text-base"
      >
        <Sparkles size={19} aria-hidden="true" /> Quiero Stella en mi web
      </button>
    </div>
  );
}
