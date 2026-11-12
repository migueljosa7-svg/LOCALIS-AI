"use client";

// Último recurso: si falla incluso el layout raíz. HTML y estilos mínimos en línea.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0B0F17", color: "#E2E8F0", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>LOCALIS AI</h1>
          <p style={{ color: "#94A3B8", marginBottom: 24 }}>Ha ocurrido un error. Vuelve a intentarlo en unos segundos.</p>
          <button
            type="button"
            onClick={reset}
            style={{ background: "linear-gradient(120deg,#00F2FE,#3B82F6)", color: "#041019", border: 0, borderRadius: 14, padding: "14px 22px", fontWeight: 700, cursor: "pointer" }}
          >
            Reintentar
          </button>
          <p style={{ marginTop: 20 }}>
            <a href="https://wa.me/34640809238" style={{ color: "#00F2FE" }}>Escríbenos por WhatsApp</a>
          </p>
        </div>
      </body>
    </html>
  );
}
