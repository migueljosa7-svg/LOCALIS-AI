import type { Metadata } from "next";
import Link from "next/link";
import DiagnosticForm from "./DiagnosticForm";
import { readConfig } from "@/lib/stella/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stella · diagnóstico de la IA", robots: { index: false, follow: false } };

// Solo muestra SI cada elemento existe, nunca su valor.
export default function DiagnosticPage() {
  const cfg = readConfig();
  const raw = process.env.ANTHROPIC_API_KEY ?? "";
  const key = raw.trim();
  const rows: [string, boolean, string][] = [
    ["ANTHROPIC_API_KEY presente", key.length > 0, "Falta en este entorno (marca Preview) o falta el Redeploy."],
    ["La clave tiene el formato esperado (empieza por sk-ant-)", key.startsWith("sk-ant-"), "No parece una clave de Anthropic: revisa que no tenga comillas y que sea la variable correcta."],
    ["La clave no tiene espacios ni saltos de línea en los extremos", raw === key, "Hay espacios al principio o al final: vuelve a pegarla sin ellos."],
    ["ANTHROPIC_BASE_URL sin definir (usa la API oficial)", !process.env.ANTHROPIC_BASE_URL, "Está definida: bórrala salvo que sepas lo que haces."],
    ["STELLA_ENABLED no apaga Stella", process.env.STELLA_ENABLED?.trim().toLowerCase() !== "false", "Está en false."],
  ];
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <p className="text-sm">
        <Link href="/admin/stella" className="text-cyan-300 underline">
          ← Negocios de Stella
        </Link>
      </p>
      <h1 className="font-display text-3xl font-bold">Diagnóstico de la conexión con Anthropic</h1>
      <p className="text-sm text-muted">
        Modelo configurado: <code>{cfg.model}</code> {process.env.STELLA_MODEL ? "(definido con STELLA_MODEL)" : "(predeterminado)"} · entorno: {process.env.VERCEL_ENV ?? "local"}
      </p>
      <ul className="space-y-2">
        {rows.map(([label, ok, how]) => (
          <li key={label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
            <span className={ok ? "text-emerald-300" : "text-red-300"}>
              {ok ? "✓" : "✗"} {label}
            </span>
            {!ok && <span className="block text-xs text-muted">{how}</span>}
          </li>
        ))}
      </ul>
      <DiagnosticForm />
    </main>
  );
}
