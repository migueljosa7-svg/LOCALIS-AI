import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StellaChat from "@/components/stella/StellaChat";
import { fetchBusiness } from "@/lib/stella/store";
import { issueTestToken } from "@/lib/stella/embed";
import { readConfig } from "@/lib/stella/config";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stella · prueba", robots: { index: false, follow: false } };

// Prueba del chat de un negocio desde el panel (protegido). Usa el mismo núcleo que la web real, con un
// token de prueba: funciona aunque el negocio esté desactivado y NO guarda contactos ni envía correos.
export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await fetchBusiness(id);
  if (!b) notFound();
  const cfg = readConfig();
  const token = cfg.enabled ? await issueTestToken(cfg, b.id) : null;

  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <p className="text-sm">
        <Link href={b.builtin ? "/admin/stella" : `/admin/stella/${b.id}`} className="text-cyan-300 underline">
          ← Volver
        </Link>
      </p>
      <h1 className="font-display text-2xl font-bold">Prueba de Stella · {b.name}</h1>
      <p className="text-sm text-muted">
        Prueba con preguntas reales: precios, horarios, algo que NO esté en la ficha (debe decir que no lo sabe y ofrecer WhatsApp), un intento de manipularla y el formulario de contacto (en esta prueba no se guarda nada).
        Cada mensaje consume unos céntimos de IA.
      </p>
      {!token || !b ? (
        <p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          La IA está apagada: falta <code>ANTHROPIC_API_KEY</code> en Vercel (o <code>STELLA_ENABLED=false</code>). Añádela, haz Redeploy y vuelve aquí.
        </p>
      ) : (
        <div className="h-[70vh] min-h-[420px] overflow-hidden rounded-2xl border border-white/10">
          <StellaChat
            config={{ id: b.id, name: b.name, greeting: b.greeting, whatsapp: b.whatsapp, phone: b.phone, privacyUrl: new URL(b.privacyUrl || "/privacy", SITE_URL).toString(), token }}
            autoFocus
          />
        </div>
      )}
    </main>
  );
}
