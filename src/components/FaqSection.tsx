import { Plus } from "lucide-react";
import { FAQS } from "@/lib/faqs";

// Acordeón nativo (<details>): accesible por teclado, funciona sin JavaScript.
export default function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="cv-auto relative w-full py-20 lg:py-28">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="eyebrow mb-5">Preguntas frecuentes</span>
          <h2 id="faq-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Resolvemos tus <span className="gradient-text">dudas</span>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.id} className="group glass rounded-2xl open:border-cyan-500/30 transition-colors">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 min-h-[56px] [&::-webkit-details-marker]:hidden">
                <h3 className="font-semibold text-[15px] sm:text-base text-foreground">{faq.question}</h3>
                <span className="shrink-0 w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-cyan-300 transition-transform duration-300 group-open:rotate-45">
                  <Plus size={16} aria-hidden="true" />
                </span>
              </summary>
              <p className="px-5 sm:px-6 pb-5 -mt-1 text-[15px] text-muted leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
