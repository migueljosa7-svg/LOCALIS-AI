/**
 * Página: Política de Cookies
 * Válida desde 2026-10-10
 * Última actualización: 2026-10-10
 */

import Link from "next/link";

export const metadata = {
  title: "Política de cookies",
  description:
    "Información detallada sobre el uso de cookies y tecnologías similares en LOCALIS AI.",
  robots: { index: false, follow: true },
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
            <li><strong>Publicitarias y de conversión:</strong> Miden la eficacia de nuestras campañas de Google Ads. Solo se activan si las aceptas.</li>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted border border-white/10 rounded-xl">
              <thead className="text-foreground">
                <tr className="border-b border-white/10">
                  <th scope="col" className="p-3">Cookie / almacenamiento</th>
                  <th scope="col" className="p-3">Titular</th>
                  <th scope="col" className="p-3">Finalidad</th>
                  <th scope="col" className="p-3">Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="p-3">localis-cookie-consent (localStorage)</td>
                  <td className="p-3">LOCALIS AI</td>
                  <td className="p-3">Recordar tu elección sobre cookies</td>
                  <td className="p-3">Hasta que la borres</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-3">_gcl_au, _gcl_aw</td>
                  <td className="p-3">Google Ireland Ltd.</td>
                  <td className="p-3">Medición de conversiones de Google Ads (solo con tu consentimiento)</td>
                  <td className="p-3">90 días</td>
                </tr>
                <tr>
                  <td className="p-3">IDE, test_cookie (doubleclick.net)</td>
                  <td className="p-3">Google Ireland Ltd.</td>
                  <td className="p-3">Publicidad y remarketing de Google (solo con tu consentimiento)</td>
                  <td className="p-3">Hasta 13 meses</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted">
            Usamos el Modo de Consentimiento de Google: mientras no aceptes, Google solo recibe señales anónimas sin cookies.
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
            Puedes cambiar o retirar tu consentimiento en cualquier momento desde el enlace
            «Configurar cookies» del pie de página. Volveremos a pedirte tu elección si
            cambiamos las cookies que utilizamos.
          </p>
        </section>

        <footer className="pt-4 border-t border-border text-sm text-muted">
          <Link href="/" className="text-cyan-400 underline underline-offset-2">Volver al inicio</Link>
        </footer>
      </article>
    </div>
  );
}
