"use client";

import Link from "next/link";
import { 
  Globe, 
  Smartphone, 
  Search, 
  Bot, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  MapPin,
  Clock
} from "lucide-react";
import { useLead } from "@/components/lead/LeadProvider";

const WEB_FEATURES = [
  {
    icon: Search,
    title: "Posicionamiento SEO Local en Zaragoza",
    desc: "Optimizamos tu arquitectura web y Google Maps para que los clientes de Zaragoza te encuentren primero al buscar tus servicios.",
    badge: "Google & Maps",
  },
  {
    icon: Bot,
    title: "Integración con Asistente Stella IA 24/7",
    desc: "Tus visitantes no se quedan con dudas: Stella responde consultas, cualifica leads y agenda citas en piloto automático día y noche.",
    badge: "IA Conversacional",
  },
  {
    icon: Smartphone,
    title: "Diseño Mobile-First y Web App (PWA)",
    desc: "Tu web carga en menos de 1 segundo en móviles, se puede instalar como aplicación en el teléfono del cliente y funciona sin fricción.",
    badge: "Ultrarrápida",
  },
  {
    icon: ShieldCheck,
    title: "100% Tuya · Sin Comisiones a Terceros",
    desc: "Olvídate de comisiones del 20% al 30% en plataformas externas. Vende tus productos, menús o servicios con cobro directo a tu cuenta.",
    badge: "0% Comisiones",
  },
];

const LOCAL_SECTORS = [
  "Restaurantes y Bares en Zaragoza",
  "Clínicas dentales, fisioterapia y salud",
  "Peluquerías, estética y barberías",
  "Fruterías, panaderías y comercio local",
  "Talleres mecánicos y servicios del automóvil",
  "Reformas, cerrajería y servicios a domicilio",
];

export default function WebDesignSection() {
  const { openLead } = useLead();

  return (
    <section
      id="web"
      className="w-full py-20 lg:py-28 relative overflow-hidden bg-background border-t border-border/40 scroll-mt-20"
    >
      {/* Orbes decorativos */}
      <div className="orb orb-cyan w-[420px] h-[420px] top-12 -left-36 opacity-30" aria-hidden />
      <div className="orb orb-purple w-[380px] h-[380px] bottom-10 -right-24 opacity-30" aria-hidden />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Globe size={14} className="text-cyan-400" />
            <span>Diseño Web Local en Zaragoza</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display leading-tight">
            Páginas web creadas para <span className="gradient-text">vender y captar clientes</span> en Zaragoza
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
            Desarrollo web moderno adaptado a las necesidades de PYMEs y comercios locales aragoneses. 
            Sin plantillas genéricas: webs rápidas, optimizadas para Google y conectadas con Inteligencia Artificial.
          </p>
        </div>

        {/* Grid de características destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {WEB_FEATURES.map((item) => (
            <div
              key={item.title}
              className="glass border-glow rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-neonglow transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <item.icon size={22} />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-display mb-2 text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2 text-xs font-medium text-cyan-400">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Incluido en desarrollo</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bloque comparativo / propuesta de valor local */}
        <div className="glass-strong border border-cyan-500/30 rounded-3xl p-6 sm:p-10 lg:p-12 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
                <Zap size={13} /> Ventaja competitiva para negocios de Zaragoza
              </span>

              <h3 className="text-2xl sm:text-3xl font-bold font-display leading-snug">
                Tu escaparate digital 24/7 con soporte técnico local y de cercanía
              </h3>

              <p className="mt-4 text-muted text-sm sm:text-base leading-relaxed">
                En LOCALIS AI no solo diseñamos una web bonita; creamos un sistema comercial completo. 
                Cada página incluye integración con <strong>Google Maps</strong>, botones directos de <strong>WhatsApp</strong>, 
                asistente virtual <strong>Stella IA</strong> para responder dudas a medianoche y pasarela de reservas directas.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {LOCAL_SECTORS.map((sector) => (
                  <div key={sector} className="flex items-center gap-2 text-foreground/90">
                    <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                    <span className="text-xs sm:text-sm">{sector}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-background/80 rounded-2xl p-6 border border-border flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-cyan-400" />
                  <span className="font-semibold text-sm">Desarrollo Web en Zaragoza</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 font-medium">
                  Auditoría Gratis
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-muted">
                <div className="flex justify-between items-center">
                  <span>Tiempo medio de entrega:</span>
                  <span className="font-semibold text-foreground">5 a 10 días laborables</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Velocidad de carga móvil:</span>
                  <span className="font-semibold text-emerald-400">Grado A (&gt;95 Google PSI)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cumplimiento legal y RGPD:</span>
                  <span className="font-semibold text-foreground">100% Adaptado en España</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Dominio y hosting de alta velocidad:</span>
                  <span className="font-semibold text-foreground">Configuración incluida</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Link
                  href="#cita"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer"
                >
                  <Sparkles size={16} /> Pedir Auditoría Web Gratuita
                  <ArrowRight size={16} />
                </Link>

                <a
                  href="https://wa.me/34640809238?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20dise%C3%B1o%20web%20para%20mi%20negocio%20en%20Zaragoza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl glass border border-glass-border hover:border-emerald-500/40 text-foreground text-xs sm:text-sm font-medium transition-all"
                >
                  <Clock size={15} className="text-emerald-400" />
                  <span>Consultar por WhatsApp (+34 640 80 92 38)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
