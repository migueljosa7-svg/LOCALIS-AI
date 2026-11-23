import { CheckCircle2, Code2 } from "lucide-react";
import StellaOpenButton from "./StellaOpenButton";
import { SITE_URL } from "@/lib/site";

const TODAY = [
  "Responde al momento las dudas de tus clientes con la información de tu negocio: servicios, precios y preguntas frecuentes.",
  "Recoge nombre y teléfono de quien quiere que le llames, con su consentimiento, y te avisa por email.",
  "Pasa la conversación a tu WhatsApp con un toque.",
  "No inventa: si no sabe algo, lo dice y ofrece que le contestes tú.",
];

// Parte real de la página de Stella (solo se muestra con Stella activada).
export default function StellaLiveSection() {
  return (
    <section aria-labelledby="stella-live-title" className="relative w-full pt-14 pb-6 lg:pt-20">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="eyebrow eyebrow-live">Disponible · asistente virtual con IA</span>
          <h1 id="stella-live-title" className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Stella atiende tu web <span className="gradient-text">mientras tú trabajas</span>
          </h1>
          <ul className="mt-6 space-y-3">
            {TODAY.map((t) => (
              <li key={t} className="flex gap-2.5 text-[15px] text-foreground/90">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <StellaOpenButton />
            <p className="mt-3 text-sm text-muted">Es la misma Stella que instalamos en las webs de nuestros clientes.</p>
          </div>
        </div>
        <div className="glass self-start rounded-3xl p-6 sm:p-7">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <Code2 size={20} className="text-cyan-300" aria-hidden="true" /> Se instala con una línea
          </h2>
          <p className="mt-3 text-sm text-muted">
            Preparamos la ficha de tu negocio (servicios, precios, contacto y preguntas frecuentes) y pegamos esto en tu web, sea cual sea tu
            plataforma:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-[#05080d] p-4 text-[12.5px] leading-relaxed text-cyan-200">
            <code>{`<script src="${SITE_URL}/stella.js"\n        data-negocio="tu-negocio" defer></script>`}</code>
          </pre>
          <p className="mt-4 text-sm text-muted">El chat se abre en una ventana aislada: no ralentiza tu web ni comparte sus cookies.</p>
        </div>
      </div>
    </section>
  );
}
