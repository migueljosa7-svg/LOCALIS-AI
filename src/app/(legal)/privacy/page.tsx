/**
 * PÃ¡gina: PolÃ­tica de Privacidad
 * VÃ¡lida desde 2026-10-10
 * Ãšltima actualizaciÃ³n: 2026-10-10
 */

import Link from "next/link";

export const metadata = {
  title: "PolÃ­tica de Privacidad â€” LOCALIS AI",
  description:
    "Detalle de cÃ³mo recopilamos, utilizamos y protegemos tus datos personales en LOCALIS AI.",
  robots: "noindex, nofollow",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <article className="glass border-glow rounded-2xl p-6 sm:p-10 space-y-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Aviso legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold font-display">
            PolÃ­tica de Privacidad
          </h1>
          <p className="mt-3 text-muted max-w-2xl">
            Ãšltima actualizaciÃ³n: <time dateTime="2026-10-10">10 de octubre de 2026</time>
          </p>
        </header>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">1. IdentificaciÃ³n del contrario</h2>
          <p className="text-muted">
            La presente PolÃ­tica de Privacidad explica cÃ³mo recopilamos, utilizamos,
            almacenamos y protegemos tus datos personales cuando utilizas el portal
            <Link href="https://localis.ai" className="text-cyan-400 underline underline-offset-2">localis.ai</Link>
            , operado por LOCALIS AI.
          </p>
          <p className="text-muted">
            <strong>Responsable del tratamiento:</strong> LOCALIS AI, c/ Demo 1, 28001 Madrid (EspaÃ±a).
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">2. Datos personales que recopilamos</h2>
          <p className="text-muted">
            Podemos recopilar datos personales que nos facilitas directamente (nombre,
            email, telÃ©fono, empresa, sector econÃ³mico) o datos de carÃ¡cter indirecto
            mediante el uso del servicio (pÃ¡gina web, consultas, interacciones con la IA
            Stella, mÃ³dulos GPS, facturaciÃ³n demo, etc.).
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">3. Finalidades del tratamiento</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>Gestionar tu cuenta y la suscripciÃ³n al servicio.</li>
            <li>Atender tus consultas y gestionar la fecha de tu demo.</li>
            <li>Proporcionar los mÃ³dulos de IA (Stella), GPS y facturaciÃ³n.</li>
            <li>Enviarte material de comunicaciÃ³n, no comercial, sobre nuestra oferta.</li>
            <li>Cumplir con las obligaciones legales derivadas del RGPD y la normativa aplicable.</li>
          </ul>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">4. Base legal del tratamiento</h2>
          <p className="text-muted">
            El tratamiento de tus datos se basa en: tu consentimiento, el cumplimiento de
            una obligaciÃ³n legal, la ejecuciÃ³n de un contrato con vos o el interÃ©s legÃ­timo
            del responsable, segÃºn corresponda.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">5. Tus derechos ARCO</h2>
          <p className="text-muted">
            Tienes derecho a conocer, rectificar, eliminar, opposiciÃ³n, limitaciÃ³n,
            portabilidad y retirar el consentimiento, asÃ­ como a presentar una reclamaciÃ³n
            ante la autoridad de control (Agencia EspaÃ±ola de ProtecciÃ³n de Datos).
          </p>
          <p className="text-muted">
            Puedes ejercer tus derechos escribiendo a <a href="mailto:datos@localis.ai" className="text-cyan-400 underline underline-offset-2">datos@localis.ai</a>.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">6. Cookies</h2>
          <p className="text-muted">
            El uso de cookies se rige por nuestra{" "}
            <Link href="/cookies" className="text-cyan-400 underline underline-offset-2">PolÃ­tica de Cookies</Link>
            . Puedes aceptar, rechazar o configurarlas en tiempo real desde el banner de
            consentimiento.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">7. Seguridad de los datos</h2>
          <p className="text-muted">
            Adoptamos medidas tÃ©cnicas y organizativas apropiadas para proteger tus datos
            contra accesos no autorizados, pÃ©rdida, alteraciÃ³n o destrucciÃ³n.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">8. Cambios en la polÃ­tica</h2>
          <p className="text-muted">
            Podemos actualizar esta polÃ­tica. La versiÃ³n mÃ¡s actualizada siempre estarÃ¡
            disponible en <Link href="/privacy" className="text-cyan-400 underline underline-offset-2">/privacy</Link>
            .
          </p>
        </section>

        <footer className="pt-4 border-t border-border text-sm text-muted">
          <Link href="/" className="text-cyan-400 underline underline-offset-2">Volver al inicio</Link>
        </footer>
      </article>
    </div>
  );
}
