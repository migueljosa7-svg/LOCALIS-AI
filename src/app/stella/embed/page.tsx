import type { Metadata } from "next";
import { headers } from "next/headers";
import StellaEmbedClient from "@/components/stella/StellaEmbedClient";
import { getBusiness, stellaEnabled } from "@/lib/stella/businesses";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stella", robots: { index: false, follow: false } };

// Chat de Stella para incrustar en la web de un cliente (lo carga /stella.js en un iframe).
// Solo se muestra en las webs autorizadas en la ficha del negocio.
export default async function StellaEmbedPage({ searchParams }: { searchParams: Promise<{ negocio?: string }> }) {
  const { negocio } = await searchParams;
  const b = getBusiness(negocio);
  const h = await headers();
  let from = "", fromHost = "";
  try {
    const u = new URL(h.get("referer") ?? "");
    from = u.origin;
    fromHost = u.host;
  } catch {}
  // Permitido en nuestra propia web (mismo dominio que esta petición) y en las webs de la ficha.
  const allowed = b && (fromHost === h.get("host") || b.domains.includes(from));

  if (!b || !allowed || !stellaEnabled()) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0B0F17] p-6 text-center text-sm text-muted">
        {!b ? "Asistente no encontrado." : !allowed ? "Este asistente no está autorizado en esta web." : "El asistente no está disponible en este momento."}
      </div>
    );
  }
  return (
    <div className="fixed inset-0">
      <StellaEmbedClient config={{ id: b.id, name: b.name, greeting: b.greeting, whatsapp: b.whatsapp, privacyUrl: new URL(b.privacyUrl, SITE_URL).toString() }} />
    </div>
  );
}
