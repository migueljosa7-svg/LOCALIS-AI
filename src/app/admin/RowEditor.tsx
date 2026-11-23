"use client";

import { useState } from "react";

const LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  propuesta: "Propuesta enviada",
  ganado: "Ganado",
  perdido: "Perdido",
  investigada: "Investigada",
  auditoria_lista: "Auditoría lista",
  propuesta_lista: "Propuesta lista",
  contactada: "Contactada",
  descartada: "Descartada",
  cliente: "Cliente",
};

/** Cambia el estado y las notas de un lead u oportunidad (guarda al instante). */
export default function RowEditor({
  kind,
  id,
  status,
  notes,
  options,
}: {
  kind: "leads" | "opportunities";
  id: string;
  status: string;
  notes: string | null;
  options: readonly string[];
}) {
  const [value, setValue] = useState(status);
  const [text, setText] = useState(notes ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const save = async (patch: { status?: string; notes?: string }) => {
    setState("saving");
    try {
      const res = await fetch(`/api/admin/${kind}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setState(res.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-[180px]">
      <label className="sr-only" htmlFor={`st-${id}`}>
        Estado
      </label>
      <select
        id={`st-${id}`}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          save({ status: e.target.value });
        }}
        className="rounded-lg bg-[#0B0F17] border border-white/15 px-2 py-1.5 text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {LABELS[o] ?? o}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor={`nt-${id}`}>
        Notas
      </label>
      <textarea
        id={`nt-${id}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => text !== (notes ?? "") && save({ notes: text })}
        rows={2}
        placeholder="Notas internas"
        className="rounded-lg bg-[#0B0F17] border border-white/15 px-2 py-1.5 text-xs"
      />
      <span className="text-[11px] text-muted h-4" aria-live="polite">
        {state === "saving" ? "Guardando…" : state === "saved" ? "Guardado" : state === "error" ? "Error al guardar" : ""}
      </span>
    </div>
  );
}
