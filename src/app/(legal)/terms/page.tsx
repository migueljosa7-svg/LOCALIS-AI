/**
 * PÃ¡gina: Aviso Legal
 * VÃ¡lido desde 2026-10-10
 * Ãšltima actualizaciÃ³n: 2026-10-10
 */

import Link from "next/link";

export const metadata = {
  title: "Aviso Legal â€” LOCALIS AI",
  description:
    "InformaciÃ³n legal, condiciones de uso y responsabilidades del servicio LOCALIS AI.",
  robots: "noindex, nofollow",
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
            Ãšltima actualizaciÃ³n: <time dateTime="2026-10-10">10 de octubre de 2026</time>
          </p>
        </header>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">1. IdentificaciÃ³n del partido</h2>
          <p className="text-muted">
            <strong>LOCALIS AI</strong>, c/ Demo 1, 28001 Madrid (EspaÃ±a),
            con representaciÃ³n en toda la UniÃ³n Europea.
            <a href="mailto:hola@localis.ai" className="text-cyan-400 underline underline-offset-2">hola@localis.ai</a>
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">2. Objetivo del servicio</h2>
          <p className="text-muted">
            LOCALIS AI ofrece una plataforma web que permite a los negocios automatizar
            agendas, facturaciÃ³n y control de repartos en tiempo real mediante IA y GPS,
            todo ello sin comisiones por entrega.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">3. Condiciones de uso</h2>
          <p className="text-muted">
            El acceso y uso del portal <Link href="https://localis.ai" className="text-cyan-400 underline underline-offset-2">localis.ai</Link>
            supone la aceptaciÃ³n de estas condiciones. El usuario se compromete a usar el
            servicio de forma lÃ­cita y no realizar actividades que puedan perjudicar,
            sobrecargar o comprometer el correcto funcionamiento de la plataforma.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">4. Propiedad intelectual</h2>
          <p className="text-muted">
            Todo el contenido de la web â€”textos, logos, grÃ¡ficos, software, marcas
            registradasâ€” es propiedad de LOCALIS AI y estÃ¡ protegido por las leyes
            de propiedad intelectual. Queda prohibida su reproducciÃ³n, distribuciÃ³n o
            explotaciÃ³n comercial sin autorizaciÃ³n expresa.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">5. LimitaciÃ³n de responsabilidad</h2>
          <p className="text-muted">
            LOCALIS AI no se hace responsable de los daÃ±os directos, indirectos o
            consecuentes derivados del uso o imposible uso del servicio, salvo que
            exista dolo o fault grave, y conforme a lo establecido por la legislaciÃ³n
            aplicable.
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">6. Datos personales</h2>
          <p className="text-muted">
            El tratamiento de tus datos personales estÃ¡ regido por nuestra{" "}
            <Link href="/privacy" className="text-cyan-400 underline underline-offset-2">PolÃ­tica de Privacidad</Link>
            .
          </p>
        </section>

        <section className="space-y-4 border-border border-l-2 pl-4">
          <h2 className="text-xl font-bold font-display">7. LegitimaciÃ³n y ley aplicable</h2>
          <p className="text-muted">
            Este aviso legal se regula por las leyes espaÃ±olas. Cualquier discusiÃ³n o
            litigio derivado del uso del servicio serÃ¡ resuelto por los juzgados y
            tribunales de Madrid, sin perjuicio del artÃ­culo 24.1 de la ConvenciÃ³n
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
