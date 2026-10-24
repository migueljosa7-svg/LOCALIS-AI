import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="contenido" className="mx-auto max-w-xl px-4 py-28 text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-5 font-display text-4xl font-bold">Esta página no existe</h1>
        <p className="mt-4 text-muted">Puede que el enlace haya cambiado. Vuelve al inicio o pide tu auditoría gratuita.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary">
            Volver al inicio
          </Link>
          <Link href="/#cita" className="btn btn-ghost">
            Auditoría gratis
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
