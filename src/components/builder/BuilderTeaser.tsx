import Link from "next/link";
import { Palette, LayoutTemplate, Smartphone, ArrowRight } from "lucide-react";

const POINTS = [
  { icon: Palette, text: "Colores, tipografías, botones e imágenes a tu gusto" },
  { icon: LayoutTemplate, text: "Elige y ordena las secciones de tu página" },
  { icon: Smartphone, text: "Míralo en ordenador, tablet y móvil al instante" },
];

// Acceso al editor visual desde la home (el calculador de ahorro de más abajo sigue funcionando igual).
export default function BuilderTeaser() {
  return (
    <section id="editor-visual" aria-labelledby="editor-title" className="relative w-full pt-14 lg:pt-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass grid items-center gap-8 rounded-3xl p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:p-10">
          <div>
            <span className="eyebrow eyebrow-live">Nuevo · editor visual</span>
            <h2 id="editor-title" className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Diseña tu web <span className="gradient-text">tal y como la quieres</span>
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Sin saber de diseño. Cuando termines, nos envías tu diseño completo y te preparamos el presupuesto. Sin compromiso y sin cobrar nada.
            </p>
            <ul className="mt-5 space-y-2.5">
              {POINTS.map((p) => (
                <li key={p.text} className="flex items-center gap-2.5 text-[15px]">
                  <p.icon size={18} className="shrink-0 text-cyan-300" aria-hidden="true" /> {p.text}
                </li>
              ))}
            </ul>
            <Link href="/disena-tu-web" className="btn btn-primary mt-7 min-h-[54px] px-7 text-base">
              Empezar a diseñar <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div aria-hidden="true" className="relative mx-auto hidden aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#05080d] p-3 lg:block">
            <div className="h-full rounded-xl bg-[#faf7f2] p-3">
              <div className="mx-auto h-2 w-1/3 rounded bg-[#26221c]/70" />
              <div className="mx-auto mt-4 h-4 w-3/4 rounded bg-[#26221c]" />
              <div className="mx-auto mt-2 h-2 w-1/2 rounded bg-[#26221c]/40" />
              <div className="mx-auto mt-4 h-5 w-20 rounded-full bg-[#8a6d3b]" />
              <div className="mt-5 grid grid-cols-3 gap-2">
                {["#8a6d3b", "#2b2b2b", "#c026d3"].map((c) => (
                  <div key={c} className="aspect-[4/3] rounded-md" style={{ background: c, opacity: 0.85 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
