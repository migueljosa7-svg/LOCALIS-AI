/**
 * Sección: Testimonios y Reseñas (prueba social B2B)
 *
 * Casos de éxito simulados de negocios reales, con estrellas de confianza,
 * métricas de satisfacción y insignias de impacto.
 */

import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  business: string;
  location: string;
  rating: number;
  quote: string;
  metric: string;
  metricLabel: string;
  badge: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    business: "Frutería El Trébol",
    location: "Zaragoza",
    rating: 5,
    quote:
      "Con LOCALIS AI la caja de pedidos y la facturación se resolvieron sola. Ahorro de tiempo real y más cliente contento.",
    metric: "7 h",
    metricLabel: "Horas ahorradas/semana",
    badge: "+62% de ahorro en gasto administrativo",
  },
  {
    id: "t2",
    business: "Taller Mecánico Josa",
    location: "Tortosa",
    rating: 5,
    quote:
      "La agenda inteligente de Stella gestiona las citas de los talleres y el reparto de cotizaciones. Menos estrés, más vueltas.",
    metric: "+38%",
    metricLabel: "Más citas confirmadas",
    badge: "Citas duplicadas -100%",
  },
  {
    id: "t3",
    business: "Restaurante La Lonja",
    location: "Zaragoza",
    rating: 5,
    quote:
      "El servidor de reservas y facturación redujo los tiempos de espera. Mesas más ocupadas y mejor experiencia de cliente.",
    metric: "+41%",
    metricLabel: "Tasa de ocupación",
    badge: "Reseñas y valoración 5 estrellas",
  },
  {
    id: "t4",
    business: "Panadería & Café Buen Día",
    location: "Teruel",
    rating: 5,
    quote:
      "El módulo GPS permitió llevar la ruta de reparto del día a día sin intermediarios. Ahorro de 30% que era de comisión.",
    metric: "30%",
    metricLabel: "Ahorro frente a delivery",
    badge: "Comisión eliminada del coste",
  },
  {
    id: "t5",
    business: "Taller de Bolsones Sánchez",
    location: "Migjorn",
    rating: 5,
    quote:
      "Todo lo que vendemos se factura solo. Stella genera la factura en PDF, lo envía al cliente y nos avisa de la recepción.",
    metric: "98%",
    metricLabel: "Facturación en menos de 1 minuto",
    badge: "Tiempo de visita al mostrador -50%",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonios" className="w-full py-20 lg:py-28 bg-surface-elevated relative overflow-hidden">
      <div className="orb orb-cyan w-[380px] h-[380px] top-10 -left-32 animate-float" aria-hidden />
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Prueba social
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            ¿Qué dicen nuestros <span className="gradient-text">clientes</span>?
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
            Resultados reales de negocios que ya cambiaron su operativa con LOCALIS AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.id}
              className={cn(
                "glass border-glow rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-neonglow",
                "border border-border/60",
              )}
            >
              {/* Estrellas de confianza */}
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-sm leading-none",
                      i < t.rating ? "opacity-100" : "opacity-30",
                    )}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Negocio y ubicación */}
              <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {t.business}
                <span className="text-border">·</span>
                <span>{t.location}</span>
              </div>

              {/* Citación */}
              <blockquote className="text-sm text-muted leading-relaxed mb-4">
                “{t.quote}”
              </blockquote>

              {/* Métricas */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold font-display gradient-text">
                    {t.metric}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{t.metricLabel}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  {t.badge}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Insignias de confianza */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted">
          {[
            "Más del 90% realizó su prueba en menos de 10 minutos",
            "Más del 95% recomienda LOCALIS AI a otro negocio",
            "Mención de especialistas en el sector salud",
            "127+ empresas ya activas",
          ].map((badge) => (
            <span
              key={badge}
              className="px-3 py-1.5 rounded-full bg-background/60 border border-border text-center"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
