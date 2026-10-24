import { Globe, Smartphone, Search, Bot, CheckCircle2, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import { waLink } from "@/lib/site";

const WEB_FEATURES = [
  {
    icon: Search,
    title: "SEO local en Zaragoza",
    desc: "Arquitectura web y ficha de Google optimizadas para que te encuentren primero cuando buscan tu servicio cerca.",
    badge: "Google y Maps",
  },
  {
    icon: Bot,
    title: "Stella IA integrada",
    desc: "Tus visitas no se quedan con dudas: Stella responde, cualifica y agenda citas día y noche.",
    badge: "IA 24/7",
  },
  {
    icon: Smartphone,
    title: "Móvil primero y ultrarrápida",
    desc: "Carga instantánea en cualquier móvil y se instala como app (PWA) en el teléfono de tus clientes.",
    badge: "PWA",
  },
  {
    icon: ShieldCheck,
    title: "100 % tuya, sin comisiones",
    desc: "Vende tus productos, menús o servicios y cobra directo en tu cuenta. Sin intermediarios.",
    badge: "0 % comisiones",
    live: true,
  },
];

const LOCAL_SECTORS = [
  "Restaurantes y bares",
  "Clínicas dentales y fisioterapia",
  "Peluquerías y estética",
  "Fruterías y comercio de barrio",
  "Talleres mecánicos",
  "Reformas y servicios a domicilio",
];

const FACTS = [
  { k: "Entrega", v: "5–10 días laborables" },
  { k: "Velocidad móvil", v: "Objetivo 95+ en PageSpeed" },
  { k: "Legal y RGPD", v: "Adaptado a España" },
  { k: "Dominio y hosting", v: "Configuración incluida" },
];

export default function WebDesignSection() {
  return (
    <section id="web" aria-labelledby="web-title" className="cv-auto section-band relative w-full py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="eyebrow mb-5">
            <Globe size={13} aria-hidden="true" /> Diseño web en Zaragoza
          </span>
          <h2 id="web-title" className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Webs creadas para <span className="gradient-text">vender y captar clientes</span>
          </h2>
          <p className="mt-5 text-muted text-base sm:text-lg leading-relaxed">
            Sin plantillas genéricas: webs rápidas, optimizadas para Google y conectadas con inteligencia artificial, pensadas
            para PYMEs y comercios de Zaragoza y Aragón.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {WEB_FEATURES.map((item) => (
            <li key={item.title} className="glow-card lift glass rounded-3xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <span className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300">
                  <item.icon size={22} aria-hidden="true" />
                </span>
                <span
                  className={
                    "text-[11px] font-semibold px-2.5 py-1 rounded-full border " +
                    (item.live ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-white/[0.04] border-white/10 text-muted")
                  }
                >
                  {item.badge}
                </span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </li>
          ))}
        </ul>

        <div className="border-glow rounded-[2rem] p-6 sm:p-10 lg:p-12 shadow-glass">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <h3 className="font-display font-bold text-2xl sm:text-3xl leading-snug">
                Tu escaparate digital 24/7, con soporte técnico local y cercano
              </h3>
              <p className="mt-4 text-muted text-sm sm:text-base leading-relaxed">
                No solo diseñamos una web bonita: creamos un sistema comercial completo. Cada proyecto incluye{" "}
                <strong className="text-foreground">Google Maps</strong>, botones directos de{" "}
                <strong className="text-foreground">WhatsApp</strong>, la asistente <strong className="text-foreground">Stella IA</strong> y
                reservas online directas.
              </p>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {LOCAL_SECTORS.map((sector) => (
                  <li key={sector} className="flex items-center gap-2.5 text-sm text-foreground/90">
                    <CheckCircle2 size={17} className="text-cyan-400 shrink-0" aria-hidden="true" />
                    {sector}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 rounded-3xl bg-[#0B0F17]/80 border border-white/[0.08] p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
                <span className="flex items-center gap-2 font-semibold text-sm">
                  <MapPin size={17} className="text-cyan-400" aria-hidden="true" /> Desarrollo web en Zaragoza
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-semibold">
                  Auditoría gratis
                </span>
              </div>
              <dl className="space-y-3 text-sm">
                {FACTS.map((f) => (
                  <div key={f.k} className="flex justify-between gap-4">
                    <dt className="text-muted">{f.k}</dt>
                    <dd className="font-semibold text-right">{f.v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-2.5 pt-1">
                <a href="#cita" className="btn btn-primary w-full">
                  Pedir auditoría web gratuita <ArrowRight size={17} aria-hidden="true" />
                </a>
                <a
                  href={waLink("Hola LOCALIS AI, quiero información sobre diseño web para mi negocio en Zaragoza")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost w-full text-sm"
                >
                  <WhatsAppIcon size={17} className="text-[#25D366]" /> Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
