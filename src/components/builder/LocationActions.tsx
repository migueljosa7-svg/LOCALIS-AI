"use client";

import { useState } from "react";
import { directionsFrom, getPositionOnce, mapLinks, POSITION_MESSAGES, type PositionError } from "@/lib/geo";

/**
 * Botones de ubicación para la web del cliente: ver en el mapa, cómo llegar y «desde mi ubicación» (opcional).
 * Gratis y sin claves: son enlaces a Google Maps. La ubicación de la persona solo se lee si pulsa el botón y concede
 * el permiso, una sola vez, y se queda en su dispositivo (se usa únicamente para abrir la ruta).
 */
export default function LocationActions({ address, city }: { address: string; city?: string }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<PositionError | null>(null);
  const place = { address: [address, city].filter(Boolean).join(", ") };
  const links = mapLinks(place);
  if (!links) return <p className="muted">Cuando añadas tu dirección aparecerán aquí los botones «Ver en el mapa» y «Cómo llegar».</p>;

  async function fromHere() {
    setBusy(true);
    setProblem(null);
    const r = await getPositionOnce();
    setBusy(false);
    if (!r.ok) return setProblem(r.error);
    const url = directionsFrom({ lat: r.lat, lng: r.lng }, place);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="geo">
      <div className="btns" style={{ marginTop: 14 }}>
        <a className="btn s-solido sh-redondeado" style={{ "--bc": "var(--c-button)", "--on-bc": "#fff" } as React.CSSProperties} href={links.view} target="_blank" rel="noopener noreferrer">
          Ver en Google Maps
        </a>
        <a className="btn s-contorno sh-redondeado" style={{ "--bc": "var(--c-button)" } as React.CSSProperties} href={links.directions} target="_blank" rel="noopener noreferrer">
          Cómo llegar
        </a>
        <button type="button" className="btn s-texto sh-redondeado" style={{ "--bc": "var(--c-primary)" } as React.CSSProperties} onClick={fromHere} disabled={busy} data-testid="geo-desde-aqui">
          {busy ? "Buscando tu ubicación…" : "Cómo llegar desde mi ubicación"}
        </button>
      </div>
      {problem && (
        <p role="status" className="muted" style={{ marginTop: 8, fontSize: ".9em" }} data-testid="geo-aviso">
          {POSITION_MESSAGES[problem]}
        </p>
      )}
      <p className="muted" style={{ marginTop: 8, fontSize: ".8em" }}>
        Tu ubicación solo se usa en tu dispositivo para abrir la ruta: no la guardamos.
      </p>
    </div>
  );
}
