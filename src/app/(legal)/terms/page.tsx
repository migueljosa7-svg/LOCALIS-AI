/**
 * Página: Aviso Legal
 * Válido desde 2026-10-10
 * Última actualización: 2026-11-24
 */

import Link from "next/link";
import { CONTACT, LEGAL } from "@/lib/site";

export const metadata = {
  title: "Aviso legal",
  description:
    "Información legal, condiciones de uso y responsabilidades del servicio LOCALIS AI.",
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <article className="glass border-glow rounded-2xl p-6 sm:p-10 space-y-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Aviso legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold font-display">
            Aviso Legal
          </h1>
          <p className="mt-3 text-muted max-w-2xl">
            Última actualización: <time dateTime="2026-11-24">24 de noviembre de 2026</time>
          </p>
        </header>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">1. Identificación del titular</h2>
          <ul className="space-y-1 text-muted">
            <li><strong>LOCALIS AI</strong>, {CONTACT.city} ({CONTACT.region}, España).</li>
            {LEGAL.titular && <li>Titular: {LEGAL.titular}.</li>}
            {LEGAL.nif && <li>NIF/CIF: {LEGAL.nif}.</li>}
            {LEGAL.domicilio && <li>Domicilio: {LEGAL.domicilio}.</li>}
            <li>
              Contacto: <a href={`mailto:${CONTACT.email}`} className="text-cyan-400 underline underline-offset-2">{CONTACT.email}</a> · {CONTACT.phoneDisplay}.
            </li>
          </ul>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">2. Servicios</h2>
          <p className="text-muted">
            LOCALIS AI diseña y construye páginas web para negocios, autónomos y empresas de Zaragoza y Aragón, y ofrece su mantenimiento. Cada servicio
            se contrata mediante un presupuesto por escrito que el cliente acepta expresamente. Los precios publicados en la web son de referencia, se
            indican con la referencia de IVA que consta en cada caso (la Web Esencial, con IVA incluido; el resto, más IVA) y no son vinculantes hasta la aceptación del presupuesto, que puede ajustarse a cada proyecto.
          </p>
          <p className="text-muted">
            Stella (asistente con inteligencia artificial) se ofrece en fase piloto. El panel de control, el módulo de reparto con GPS, las citas y
            reservas automáticas, la facturación y el WhatsApp automatizado que se muestran en la web son demostraciones o funciones en desarrollo:
            no forman parte de ningún servicio contratado salvo que se indique expresamente por escrito en el presupuesto.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">3. Condiciones de uso</h2>
          <p className="text-muted">
            El acceso y uso de este sitio web supone la aceptación de estas condiciones. El usuario se compromete a usarlo de forma lícita y a no
            realizar actividades que puedan perjudicar, sobrecargar o comprometer su correcto funcionamiento.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">4. Propiedad intelectual</h2>
          <p className="text-muted">
            Los contenidos de esta web (textos, imágenes, diseño y software) son titularidad de LOCALIS AI o se utilizan con licencia, y están
            protegidos por la normativa de propiedad intelectual. Queda prohibida su reproducción o explotación comercial sin autorización. Las
            condiciones de titularidad de cada web entregada a un cliente se indican en su presupuesto.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">5. Limitación de responsabilidad</h2>
          <p className="text-muted">
            LOCALIS AI no se hace responsable de los daños derivados del uso o de la imposibilidad de uso de este sitio, salvo en los casos de dolo o
            negligencia grave y conforme a la legislación aplicable. Esto no limita los derechos que la ley reconozca al cliente en el servicio contratado.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">6. Datos personales</h2>
          <p className="text-muted">
            El tratamiento de tus datos personales está regido por nuestra{" "}
            <Link href="/privacy" className="text-cyan-400 underline underline-offset-2">Política de Privacidad</Link>
            .
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">7. Ley aplicable y jurisdicción</h2>
          <p className="text-muted">
            Este aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de
            Zaragoza, salvo que la normativa de protección de consumidores y usuarios establezca otro fuero.
          </p>
        </section>

        <footer className="pt-4 border-t border-border text-sm text-muted">
          <Link href="/" className="text-cyan-400 underline underline-offset-2">Volver al inicio</Link>
        </footer>
      </article>
    </div>
  );
}
