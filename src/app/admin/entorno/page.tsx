import type { Metadata } from "next";
import { envChecks } from "@/lib/admin/overview";
import Integrations from "./Integrations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Configuración del entorno", robots: { index: false, follow: false } };

// Estado de la configuración de ESTE despliegue. Solo muestra si cada variable existe, nunca su valor.
export default function EnvPage() {
  const checks = envChecks();
  const groups = Array.from(new Set(checks.map((c) => c.group)));
  const env = process.env.VERCEL_ENV ?? "local";
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Configuración del entorno</h1>
      <p className="text-sm text-muted">
        Despliegue actual: <strong>{env}</strong>. Cada entorno de Vercel (Production, Preview) tiene sus propias variables: esta página solo refleja el que estás viendo.
        Nunca se muestran valores ni claves. Tras cambiar variables hay que hacer <strong>Redeploy</strong>.
      </p>
      {groups.map((g) => (
        <section key={g} aria-labelledby={`g-${g}`}>
          <h2 id={`g-${g}`} className="mb-2 font-display text-lg font-bold">
            {g}
          </h2>
          <ul className="space-y-2">
            {checks
              .filter((c) => c.group === g)
              .map((c) => (
                <li key={c.name} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm">
                  <p className={c.ok ? "text-emerald-300" : c.required ? "text-red-300" : "text-amber-200"}>
                    {c.ok ? "✓" : c.required ? "✗" : "○"} {c.label} <code className="text-xs text-muted">{c.name}</code>
                    {!c.required && !c.ok && <span className="ml-2 text-xs text-muted">(opcional)</span>}
                  </p>
                  {!c.ok && <p className="mt-0.5 text-xs text-muted">{c.how}</p>}
                </li>
              ))}
          </ul>
        </section>
      ))}
      <Integrations />
      <section className="rounded-2xl border border-white/10 p-4 text-sm text-muted">
        <h2 className="font-display text-lg font-bold text-foreground">Seguridad de las claves</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Las claves privadas (Anthropic, Supabase, Resend, contraseña del panel) solo existen en el servidor: ninguna lleva el prefijo NEXT_PUBLIC_ y los tests lo comprueban.</li>
          <li>Para ver a qué entorno está asignada cada variable, usa Vercel → Settings → Environment Variables (columnas Production / Preview).</li>
          <li>No rotes ni cambies claves sin avisar: rompería los despliegues que las usan.</li>
        </ul>
      </section>
    </main>
  );
}
