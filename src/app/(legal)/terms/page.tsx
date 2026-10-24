/**
 * Página: Aviso Legal
 * Válido desde 2026-10-10
 * Última actualización: 2026-10-10
 */

import Link from "next/link";

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
            Última actualización: <time dateTime="2026-10-10">10 de octubre de 2026</time>
          </p>
        </header>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">1. Identificación del titular</h2>
          <p className="text-muted">
            <strong>LOCALIS AI</strong>, Zaragoza (España),
            con representación en toda la Unión Europea.
            <a href="mailto:migueljosa7@gmail.com" className="text-cyan-400 underline underline-offset-2">migueljosa7@gmail.com</a>
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">2. Objetivo del servicio</h2>
          <p className="text-muted">
            LOCALIS AI ofrece una plataforma web que permite a los negocios automatizar
            agendas, facturación y control de repartos en tiempo real mediante IA y GPS,
            todo ello sin comisiones por entrega.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">3. Condiciones de uso</h2>
          <p className="text-muted">
            El acceso y uso del portal <Link href="https://localis.ai" className="text-cyan-400 underline underline-offset-2">localis.ai</Link>
            supone la aceptación de estas condiciones. El usuario se compromete a usar el
            servicio de forma lícita y no realizar actividades que puedan perjudicar,
            sobrecargar o comprometer el correcto funcionamiento de la plataforma.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">4. Propiedad intelectual</h2>
          <p className="text-muted">
            Todo el contenido de la web —textos, logos, gráficos, software, marcas
            registradas— es propiedad de LOCALIS AI y está protegido por las leyes
            de propiedad intelectual. Queda prohibida su reproducción, distribución o
            explotación comercial sin autorización expresa.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">5. Limitación de responsabilidad</h2>
          <p className="text-muted">
            LOCALIS AI no se hace responsable de los daños directos, indirectos o
            consecuentes derivados del uso o imposible uso del servicio, salvo que
            exista dolo o fault grave, y conforme a lo establecido por la legislación
            aplicable.
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
          <h2 className="text-xl font-bold font-display">7. Legitimación y ley aplicable</h2>
          <p className="text-muted">
            Este aviso legal se regula por las leyes españolas. Cualquier discusión o
            litigio derivado del uso del servicio será resuelto por los juzgados y
            tribunales de Zaragoza, sin perjuicio del artículo 24.1 de la Convención
            Europea de Derechos Humanos.
          </p>
        </section>

        <footer className="pt-4 border-t border-border text-sm text-muted">
          <Link href="/" className="text-cyan-400 underline underline-offset-2">Volver al inicio</Link>
        </footer>
      </article>
    </div>
  );
}
