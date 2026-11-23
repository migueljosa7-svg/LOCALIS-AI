import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Script from "next/script";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prueba de instalación de Stella", robots: { index: false, follow: false } };

// Página de pruebas para instalar el widget como lo haría un cliente. SOLO existe fuera de producción:
// en Production responde 404, así que no cambia nada de la web pública.
export default async function PruebaStellaPage({ searchParams }: { searchParams: Promise<{ negocio?: string }> }) {
  if (process.env.VERCEL_ENV === "production") notFound();
  const { negocio } = await searchParams;
  const id = /^[a-z0-9-]{2,40}$/.test(negocio ?? "") ? (negocio as string) : "prueba-peluqueria";
  const host = (await headers()).get("host") ?? "";
  return (
    <main className="mx-auto max-w-2xl px-4 py-12" style={{ background: "#fff7ec", color: "#222", minHeight: "100vh", fontFamily: "Georgia, serif" }}>
      <h1 style={{ fontSize: 30, fontWeight: 700 }}>Peluquería de Prueba (negocio ficticio)</h1>
      <p style={{ marginTop: 12 }}>
        Esta es una web de pruebas que simula la página de un cliente. Stella se instala aquí con una sola línea, igual que en una web real. El botón del chat aparece abajo a la derecha.
      </p>
      <div style={{ marginTop: 20, padding: 16, border: "1px dashed #999", borderRadius: 8, fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
        <p>
          <strong>Dominio de esta página (el que debe estar autorizado en la ficha):</strong> <code data-testid="prueba-host">{host}</code>
        </p>
        <p style={{ marginTop: 6 }}>
          <strong>Negocio:</strong> <code>{id}</code>
        </p>
        <pre style={{ marginTop: 10, whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#fff", padding: 10, borderRadius: 6 }}>{`<script src="https://${host}/stella.js" data-negocio="${id}" defer></script>`}</pre>
      </div>
      <p style={{ marginTop: 20, fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
        Si el botón no aparece: el negocio está desactivado, el dominio no coincide con el de arriba o falta ejecutar <code>supabase/stella.sql</code>.
      </p>
      <Script id="stella-prueba" src="/stella.js" data-negocio={id} strategy="afterInteractive" />
    </main>
  );
}
