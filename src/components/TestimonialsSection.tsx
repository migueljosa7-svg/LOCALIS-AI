import { UtensilsCrossed, Wrench, Stethoscope, Store, Quote } from "lucide-react";

/**
 * Escenarios de uso por tipo de negocio.
 * IMPORTANTE: son ejemplos ilustrativos, no reseñas de clientes reales.
 * Cuando tengas opiniones verificables (p. ej. reseñas de Google), sustitúyelas
 * aquí con el nombre real del negocio y su permiso. Presentar reseñas inventadas
 * como reales está prohibido (Directiva UE 2019/2161 y directrices de Google).
 */
const SCENARIOS = [
  {
    icon: UtensilsCrossed,
    business: "Restaurante con reparto propio",
    quote: "Los pedidos a domicilio entran por la web y los llevan nuestros repartidores. Lo que antes se iba en comisiones ahora se queda en caja.",
    metric: "0 %",
    metricLabel: "comisión por pedido",
  },
  {
    icon: Wrench,
    business: "Taller mecánico",
    quote: "Stella coge las citas mientras estamos con las manos en el motor y avisa al cliente cuando el coche está listo.",
    metric: "24/7",
    metricLabel: "citas sin coger el teléfono",
  },
  {
    icon: Stethoscope,
    business: "Clínica de fisioterapia",
    quote: "Los recordatorios por WhatsApp y el cambio de cita en un mensaje reducen los huecos vacíos de la agenda.",
    metric: "Menos",
    metricLabel: "ausencias y llamadas",
  },
  {
    icon: Store,
    business: "Frutería de barrio",
    quote: "Los pedidos de WhatsApp quedan ordenados, la factura sale sola y el cliente ve en el mapa cuándo llega su cesta.",
    metric: "1 panel",
    metricLabel: "pedidos, facturas y repartos",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="casos" aria-labelledby="casos-title" className="cv-auto section-band relative w-full py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="eyebrow mb-5">Casos de uso</span>
          <h2 id="casos-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Así cambia el día a día de <span className="gradient-text">un negocio local</span>
          </h2>
          <p className="mt-5 text-muted text-base sm:text-lg">Escenarios típicos de negocios de Zaragoza que trabajan con webs con IA y reparto propio.</p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {SCENARIOS.map((s) => (
            <li key={s.business} className="glow-card lift glass rounded-3xl p-6 flex flex-col">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 flex items-center justify-center">
                  <s.icon size={19} aria-hidden="true" />
                </span>
                <p className="font-display font-semibold text-[15px] leading-tight">{s.business}</p>
              </div>
              <blockquote className="mt-5 text-[15px] text-foreground/85 leading-relaxed flex-1">
                <Quote size={16} className="text-cyan-500/60 mb-2" aria-hidden="true" />
                {s.quote}
              </blockquote>
              <div className="mt-6 pt-4 border-t border-white/[0.07]">
                <p className="font-display text-2xl font-bold text-emerald-400">{s.metric}</p>
                <p className="text-xs text-muted">{s.metricLabel}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-muted">Escenarios ilustrativos. Pide en la auditoría ejemplos reales de tu sector.</p>
      </div>
    </section>
  );
}
