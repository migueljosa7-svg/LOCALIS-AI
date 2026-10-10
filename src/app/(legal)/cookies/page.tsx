/**
 * Página: Política de Cookies
 * Válida desde 2026-10-10
 * Última actualización: 2026-10-10
 */

import Link from "next/link";

export const metadata = {
  title: "Política de Cookies — LOCALIS AI",
  description:
    "Información detallada sobre el uso de cookies y tecnologías similares en LOCALIS AI.",
  robots: "noindex, nofollow",
};

export default function CookiesPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <article className="glass border-glow rounded-2xl p-6 sm:p-10 space-y-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Aviso legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold font-display">
            Política de Cookies
          </h1>
          <p className="mt-3 text-muted max-w-2xl">
            Última actualización: <time dateTime="2026-10-10">10 de octubre de 2026</time>
          </p>
        </header>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">1. ¿Qué son las cookies?</h2>
          <p className="text-muted">
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo
            cuando visitas una web. Permiten al sitio recordar información sobre tu
            navegación (preferencias, sesiones, analíticas, etc.).
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">2. Tipos de cookies que utilizamos</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li><strong>Necesarias:</strong> Son imprescindibles para el funcionamiento de la web (sesiones, accesos, seguridad). No requieren consentimiento.</li>
            <li><strong>Analíticas:</strong> Nos permiten comprender cómo los usuarios interactúan con la web para mejorar la experiencia.</li>
            <li><strong>De preferencias:</strong> Recordamos tus opciones y configuraciones.</li>
            <li><strong>De consentimiento:</strong> Nos permiten recordar qué has aceptado o rechazado.</li>
          </ul>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">3. Exención de cookies</h2>
          <p className="text-muted">
            Se excluyen de la obligación de consentimiento: cookies estrictamente necesarias
            para el suministro de un servicio explícitamente solicitado por el usuario.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">4. Terceros y cookies</h2>
          <p className="text-muted">
            Podemos emplear servicios de terceros (análisis web, funcionalidades de
            compartición, etc.) que establezcan sus propias cookies. Toda decisión de
            aceptar o no estas cookies corresponde al usuario, gestionada desde su
            configuración del navegador o desde el banner de consentimiento.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">5. Cómo gestionar las cookies</h2>
          <p className="text-muted">
            Puedes permitir, bloquear o eliminar las cookies de tu navegador. La mayoría
            de navegadores te permiten revisar las cookies instaladas y sus orígenes.
            Ten en cuenta que ciertas funcionalidades pueden verse afectadas si las
            deshabilitas.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">6. Control continuo de consentimiento</h2>
          <p className="text-muted">
            El banner de consentimiento se mostrará en cada navegación (o en una ventana
            periódica) para garantizar que cada usuario pueda cambiar su decisión en
            cualquier momento.
          </p>
        </section>

        <footer className="pt-4 border-t border-border text-sm text-muted">
          <Link href="/" className="text-cyan-400 underline underline-offset-2">Volver al inicio</Link>
        </footer>
      </article>
    </div>
  );
}
