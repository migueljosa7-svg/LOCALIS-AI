import { CheckCircle2, Code2 } from "lucide-react";
import StellaLiveActions from "./StellaLiveActions";
import { readConfig } from "@/lib/stella/config";
import { SITE_URL } from "@/lib/site";

const TODAY = [
  "Responde al momento las dudas de tus clientes con la información de tu negocio: servicios, precios, horarios y preguntas frecuentes.",
  "Si no sabe algo, lo dice y ofrece tu WhatsApp: no inventa precios ni condiciones.",
  "Recoge nombre y teléfono de quien quiere que le llames, con su consentimiento, y te avisa por email.",
  "Se instala con una línea de código y solo funciona en las webs que tú autorizas.",
];

/** Stella de verdad (no demostración). Solo se muestra si hay clave de IA y STELLA_SITE_WIDGET=on. */
export function stellaSiteLive(): boolean {
  return process.env.STELLA_SITE_WIDGET?.trim().toLowerCase() === "on" && readConfig().enabled;
}

export default function StellaLiveSection() {
  if (!stellaSiteLive()) return null;
  return (
    <section id="stella-real" aria-labelledby="stella-live-title" className="relative w-full pt-14 pb-6 lg:pt-20">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="eyebrow eyebrow-live">Disponible · asistente virtual con IA</span>
          <h2 id="stella-live-title" className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Stella atiende tu web <span className="gradient-text">mientras tú trabajas</span>
          </h2>
          <ul className="mt-6 space-y-3">
            {TODAY.map((t) => (
              <li key={t} className="flex gap-2.5 text-[15px] text-foreground/90">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <StellaLiveActions />
            <p className="mt-3 text-sm text-muted">Es la misma Stella que instalamos en las webs de nuestros clientes. Hoy no atiende WhatsApp ni agenda citas: eso sigue en desarrollo.</p>
          </div>
        </div>
        <div className="glass self-start rounded-3xl p-6 sm:p-7">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold">
            <Code2 size={20} className="text-cyan-300" aria-hidden="true" /> Se instala con una línea
          </h3>
          <p className="mt-3 text-sm text-muted">Preparamos la ficha de tu negocio y pegamos esto en tu web, sea cual sea tu plataforma:</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-[#05080d] p-4 text-[12.5px] leading-relaxed text-cyan-200">
            <code>{`<script src="${SITE_URL}/stella.js"\n        data-negocio="tu-negocio" defer></script>`}</code>
          </pre>
          <p className="mt-4 text-sm text-muted">El chat se abre en una ventana aislada: no ralentiza tu web ni comparte sus cookies.</p>
        </div>
      </div>
    </section>
  );
}
