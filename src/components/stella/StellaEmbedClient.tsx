"use client";

import StellaChat, { type StellaPublicConfig } from "./StellaChat";

// Dentro del iframe: el botón de cerrar avisa a la web del cliente (stella.js) para ocultarlo.
export default function StellaEmbedClient({ config }: { config: StellaPublicConfig }) {
  return <StellaChat config={config} autoFocus={false} onClose={() => window.parent.postMessage({ type: "stella:close" }, "*")} />;
}
