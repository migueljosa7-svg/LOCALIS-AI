/**
 * Página: Política de Privacidad
 * Válida desde 2026-10-10
 * Última actualización: 2026-10-10
 */

import Link from "next/link";

export const metadata = {
  title: "Política de privacidad",
  description:
    "Detalle de cómo recopilamos, utilizamos y protegemos tus datos personales en LOCALIS AI.",
  robots: { index: false, follow: true },
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
            Política de Privacidad
          </h1>
          <p className="mt-3 text-muted max-w-2xl">
            Última actualización: <time dateTime="2026-10-10">10 de octubre de 2026</time>
          </p>
        </header>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">1. Identificación del contrario</h2>
          <p className="text-muted">
            La presente Política de Privacidad explica cómo recopilamos, utilizamos,
            almacenamos y protegemos tus datos personales cuando utilizas el portal
            <Link href="https://localis.ai" className="text-cyan-400 underline underline-offset-2">localis.ai</Link>
            , operado por LOCALIS AI.
          </p>
          <p className="text-muted">
            <strong>Responsable del tratamiento:</strong> LOCALIS AI, Zaragoza (España).
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">2. Datos personales que recopilamos</h2>
          <p className="text-muted">
            Podemos recopilar datos personales que nos facilitas directamente (nombre,
            email, teléfono, empresa, sector económico) o datos de carácter indirecto
            mediante el uso del servicio (página web, consultas, interacciones con la IA
            Stella, etc.).
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">3. Finalidades del tratamiento</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>Gestionar tu solicitud y, en su caso, la contratación y la prestación del servicio.</li>
            <li>Atender tus consultas y enviarte la información y el presupuesto que solicites.</li>
            <li>Prestar el asistente Stella a los negocios que lo contraten (fase piloto).</li>
            <li>Enviarte material de comunicación, no comercial, sobre nuestra oferta.</li>
            <li>Cumplir con las obligaciones legales derivadas del RGPD y la normativa aplicable.</li>
          </ul>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">3 bis. Asistente virtual Stella (chat con IA)</h2>
          <p className="text-muted">
            Stella es una inteligencia artificial, no una persona. Los mensajes que escribes en el chat se envían a nuestro
            proveedor de IA, Anthropic, únicamente para generar la respuesta. Por eso te pedimos que <strong>no escribas datos
            personales en el chat</strong> (DNI, datos bancarios o de salud). No guardamos el contenido de las conversaciones;
            solo registramos datos técnicos de uso (número de mensajes y consumo) para controlar los límites del servicio.
          </p>
          <p className="text-muted">
            Si quieres que te contactemos, el chat muestra un formulario con una casilla de consentimiento: solo con esa
            casilla marcada guardamos tu nombre, teléfono y, si lo indicas, tu email, y los usamos únicamente para atender tu
            consulta. Cuando Stella está instalada en la web de otro negocio, ese negocio es el responsable de los datos que
            le dejas y LOCALIS AI actúa como encargado del tratamiento.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">4. Base legal del tratamiento</h2>
          <p className="text-muted">
            El tratamiento de tus datos se basa en: tu consentimiento, el cumplimiento de
            una obligación legal, la ejecución de un contrato con vos o el interés legítimo
            del responsable, según corresponda.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">5. Tus derechos ARCO</h2>
          <p className="text-muted">
            Tienes derecho a conocer, rectificar, eliminar, opposición, limitación,
            portabilidad y retirar el consentimiento, así como a presentar una reclamación
            ante la autoridad de control (Agencia Española de Protección de Datos).
          </p>
          <p className="text-muted">
            Puedes ejercer tus derechos escribiendo a <a href="mailto:datos@localis.ai" className="text-cyan-400 underline underline-offset-2">datos@localis.ai</a>.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">6. Cookies</h2>
          <p className="text-muted">
            El uso de cookies se rige por nuestra{" "}
            <Link href="/cookies" className="text-cyan-400 underline underline-offset-2">Política de Cookies</Link>
            . Puedes aceptar, rechazar o configurarlas en tiempo real desde el banner de
            consentimiento.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">7. Seguridad de los datos</h2>
          <p className="text-muted">
            Adoptamos medidas técnicas y organizativas apropiadas para proteger tus datos
            contra accesos no autorizados, pérdida, alteración o destrucción.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">8. Cambios en la política</h2>
          <p className="text-muted">
            Podemos actualizar esta política. La versión más actualizada siempre estará
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
