"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, X } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";

/**
 * Botón flotante de Stella cuando el chat real AÚN NO está configurado (solo se monta fuera de producción).
 * No responde nada ni simula respuestas: explica qué falta y ofrece WhatsApp. Se distingue de la demostración comercial.
 */
export default function StellaPendingLauncher({ checks, waHref }: { checks: { label: string; ok: boolean; how: string }[]; waHref: string }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("stella:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("stella:open", onOpen);
    };
  }, [open]);
  return (
    <>
      <button
        ref={btn}
        type="button"
        data-testid="stella-pending-button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="stella-pending-panel"
        aria-label="Chat con Stella (pendiente de configurar)"
        className="no-print fixed right-4 z-[61] inline-flex min-h-[56px] items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cobalt-500 px-4 font-bold text-[#04121a] shadow-[0_12px_32px_-8px_rgba(0,242,254,0.55)] bottom-[calc(84px+env(safe-area-inset-bottom))] md:bottom-24 md:right-6"
      >
        <Bot size={22} aria-hidden="true" />
        <span className="text-sm">
          Stella <span className="font-normal opacity-80">· chat IA</span>
        </span>
      </button>
      {open && (
        <div
          id="stella-pending-panel"
          role="dialog"
          aria-label="Chat con Stella: pendiente de configuración"
          data-testid="stella-pending-panel"
          className="no-print fixed inset-0 z-[70] flex flex-col overflow-hidden border border-white/10 bg-[#0B0F17] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] md:inset-auto md:bottom-44 md:right-6 md:h-auto md:max-h-[min(560px,calc(100vh-12rem))] md:w-[390px] md:rounded-3xl"
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-200">
              <Bot size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">Stella · chat con IA</p>
              <p className="text-[11px] text-amber-200">Pendiente de configuración</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                btn.current?.focus();
              }}
              aria-label="Cerrar"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2.5 text-amber-100">
              El chat real de Stella <strong>todavía no está activado</strong> en esta web, así que ahora mismo no puede responder. No es una demostración y no se simulan respuestas.
            </p>
            <p className="text-muted">Lo que falta (solo lo ves en Preview; en la web pública este botón no aparece hasta que esté listo):</p>
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className={c.ok ? "text-emerald-300" : "text-red-300"}>
                    {c.ok ? "✓" : "✗"} {c.label}
                  </p>
                  {!c.ok && <p className="mt-0.5 text-xs text-muted">{c.how}</p>}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">
              Después de cambiar variables en Vercel hay que hacer <strong>Redeploy</strong> de esta Preview.
            </p>
          </div>
          <div className="border-t border-white/10 p-3">
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn min-h-[48px] w-full bg-[#25D366] text-[#05210f]">
              <WhatsAppIcon size={18} /> Mientras tanto, escríbenos por WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
