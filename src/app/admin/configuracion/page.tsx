import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Configuración", robots: { index: false, follow: false } };

const ROWS: { name: string; status: "real" | "demo" | "pendiente"; note: string }[] = [
  { name: "Captación de leads (formularios, WhatsApp)", status: "real", note: "Se guardan en Supabase y avisan por email con Resend." },
  { name: "Diseña tu web (configurador)", status: "real", note: "Guarda el diseño, las imágenes en almacenamiento privado y crea el lead." },
  { name: "Stella (asistente con IA)", status: "pendiente", note: "Código y protecciones probados con Anthropic simulado; falta crédito para la prueba real. En Producción debe seguir desactivada." },
  { name: "Panel para clientes", status: "demo", note: "Demostración en la web pública; no se vende." },
  { name: "Reparto con GPS", status: "demo", note: "Demostración con datos ficticios; no se vende." },
  { name: "Mapas y «Cómo llegar»", status: "real", note: "Enlaces gratuitos de Google Maps, sin clave de pago." },
];
const TONE = { real: "bg-emerald-500/15 text-emerald-200", demo: "bg-amber-500/15 text-amber-100", pendiente: "bg-white/10 text-foreground" } as const;
const LABEL = { real: "Real", demo: "Demostración", pendiente: "Pendiente de prueba real" } as const;

export default function ConfiguracionPage() {
  return (
    <main className="space-y-8 px-4 py-8 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Configuración</h1>
        <p className="mt-1 text-sm text-muted">Qué es real y qué es demostración en el producto. Las variables y conexiones (Supabase, Resend, Anthropic) se comprueban en <Link href="/admin/entorno" className="text-cyan-300 underline">Entorno</Link>.</p>
      </header>
      <ul className="grid gap-3 md:grid-cols-2">
        {ROWS.map((r) => (
          <li key={r.name} className="rounded-2xl border border-white/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold">{r.name}</p>
              <span className={"shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold " + TONE[r.status]}>{LABEL[r.status]}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{r.note}</p>
          </li>
        ))}
      </ul>
      <section className="rounded-2xl border border-white/10 p-4 text-sm text-muted">
        <h2 className="font-display text-lg font-bold text-foreground">Accesos</h2>
        <ul className="mt-2 space-y-1">
          <li><Link href="/admin/entorno" className="text-cyan-300 underline">Entorno: variables y pruebas de conexión</Link></li>
          <li><Link href="/admin/stella/diagnostico" className="text-cyan-300 underline">Diagnóstico de Stella</Link></li>
        </ul>
        <p className="mt-3">Usuario y contraseña del panel, claves y dominio se gestionan en Vercel (variables de entorno); desde aquí nunca se muestran ni se modifican.</p>
      </section>
    </main>
  );
}
