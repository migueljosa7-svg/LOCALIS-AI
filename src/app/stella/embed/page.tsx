import type { Metadata } from "next";
import { headers } from "next/headers";
import StellaChat from "@/components/stella/StellaChat";
import { authorizeEmbed, DENIED_TEXT } from "@/lib/stella/embed";
import { readConfig } from "@/lib/stella/config";
import { dbStore } from "@/lib/stella/store";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stella", robots: { index: false, follow: false } };

// Chat de Stella para incrustar en la web de un cliente (lo carga /stella.js en un iframe).
// Aquí se valida en el SERVIDOR: negocio existente y activo, web de origen autorizada, límites.
// Solo entonces se emite el token firmado que la API del chat exige.
export default async function StellaEmbedPage({ searchParams }: { searchParams: Promise<{ negocio?: string }> }) {
  const { negocio } = await searchParams;
  const h = await headers();
  const ip = h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const res = await authorizeEmbed(
    { store: dbStore, config: readConfig() },
    { negocio, referer: h.get("referer"), fetchDest: h.get("sec-fetch-dest"), host: h.get("host"), ip }
  );

  if (!res.ok) {
    return (
      <div role="alert" className="fixed inset-0 flex items-center justify-center bg-[#0B0F17] p-6 text-center text-sm text-muted">
        {DENIED_TEXT[res.reason]}
      </div>
    );
  }
  const b = res.business;
  const privacy = new URL(b.privacyUrl || "/privacy", SITE_URL).toString();
  return (
    <div className="fixed inset-0">
      <StellaChat
        config={{ id: b.id, name: b.name, greeting: b.greeting, whatsapp: b.whatsapp, phone: b.phone, privacyUrl: privacy, token: res.token }}
        autoFocus={false}
        embedded
      />
    </div>
  );
}
