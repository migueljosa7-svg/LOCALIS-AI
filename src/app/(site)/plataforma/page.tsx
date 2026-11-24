import dynamic from "next/dynamic";
import Link from "next/link";
import { Bot, MapPin, Store } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import SafeBoundary from "@/components/SafeBoundary";
import { CtaBand, PageHeader, PlatformIntro } from "@/components/site/Blocks";
import StellaLiveSection from "@/components/stella/StellaLiveSection";
import StellaOrderButton from "@/components/stella/StellaOrderButton";
import { PLATFORM_SECTIONS } from "@/lib/navigation";
import { pageMeta } from "@/lib/seo";

// Las demostraciones son interactivas: su código se descarga aparte y no retrasa el resto de la página.
const StellaConsole = dynamic(() => import("@/components/stella/StellaConsole"));
const GpsModuleSection = dynamic(() => import("@/components/gps/GpsModuleSection"));
const SectorsShowcase = dynamic(() => import("@/components/SectorsShowcase"));

export const metadata = pageMeta({
  path: "/plataforma",
  title: "Plataforma: Stella IA, reparto GPS y sectores",
  description: "Conoce la plataforma de LOCALIS AI: Stella, el asistente con IA para tu web; el módulo de reparto con GPS en desarrollo y soluciones por sector para negocios de Zaragoza.",
});

export default function PlataformaPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Plataforma", path: "/plataforma" }]} />
      <PageHeader
        eyebrow="Plataforma LOCALIS AI"
        title="Herramientas para que tu negocio"
        accent="capte más clientes"
        intro="Empezamos por una web que convierte visitas en contactos y sumamos herramientas por encima. Te contamos con claridad qué es real hoy y qué estamos desarrollando: lo que ves marcado como demostración todavía no se puede contratar."
        crumbs={[{ name: "Plataforma" }]}
      />
      <nav aria-label="Apartados de la plataforma" className="w-full pb-10">
        <ul className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 sm:px-6 lg:px-8">
          {PLATFORM_SECTIONS.map((s) => (
            <li key={s.id}>
              <Link href={`#${s.id}`} className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/[0.04] px-4 text-sm font-semibold transition-colors hover:border-cyan-500/40 hover:text-cyan-200">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <PlatformIntro
        id="stella"
        icon={Bot}
        title="Stella: un asistente con IA que atiende tu web"
        status="En fase piloto · solicítala y te avisamos"
        tone="wip"
        problem="Tus clientes preguntan lo mismo una y otra vez (precios, horarios, servicios) y muchos se marchan si nadie responde. Stella responde al momento con la información que tú le das y, si no la sabe, lo dice y te pasa el cliente por WhatsApp."
        how={[
          "Responde solo con los datos de tu negocio: no inventa precios, servicios ni condiciones.",
          "Reconoce cuándo no sabe algo y ofrece tu WhatsApp o que te llamen.",
          "Recoge nombre y teléfono con el consentimiento de la persona y te avisa por email.",
          "Se instala en tu web con una línea de código y solo funciona en los dominios que autorices.",
        ]}
      >
        <div className="mx-auto mt-8 flex w-full max-w-7xl flex-col items-start gap-3 px-4 sm:px-6 lg:px-8">
          <StellaOrderButton />
          <p className="text-sm text-muted">Pedir Stella no activa ni cobra nada: es una solicitud y hablamos contigo antes.</p>
        </div>
        <StellaLiveSection />
        <SafeBoundary name="Demostración de Stella" minHeight={400}>
          <StellaConsole />
        </SafeBoundary>
      </PlatformIntro>

      <PlatformIntro
        id="reparto"
        icon={MapPin}
        title="Reparto con GPS: tus repartidores, sin comisiones"
        status="En desarrollo · hoy es una demostración"
        tone="wip"
        problem="Las plataformas de reparto se quedan entre un 20 % y un 30 % de cada pedido. Este módulo busca que puedas repartir con tu propia gente y que tu cliente vea dónde va su pedido. No está disponible todavía: lo que ves es una demostración con repartidores y rutas ficticios."
        how={[
          "Qué estamos desarrollando: seguimiento de repartos propios y enlace de seguimiento para el cliente.",
          "Qué no existe aún: seguimiento real de repartidores. No se contrata ni se cobra.",
          "Qué sí tienes hoy en tu web: botón «Cómo llegar» y mapa de Google gratis, sin claves.",
        ]}
      >
        <SafeBoundary name="Demostración de reparto" minHeight={400}>
          <GpsModuleSection />
        </SafeBoundary>
      </PlatformIntro>

      <PlatformIntro
        id="sectores"
        icon={Store}
        title="Soluciones por sector: webs pensadas para tu tipo de negocio"
        status="Disponible: webs por sector"
        tone="ok"
        problem="Un restaurante, una clínica y un taller no necesitan lo mismo en su web. Partimos de plantillas y secciones adaptadas a cada sector (carta, tratamientos, presupuesto, ubicación…) y las ajustas a tu medida en el configurador."
        how={[
          "Restauración, comercio, peluquería y estética, clínicas, talleres, servicios y profesionales.",
          "Secciones adecuadas a cada sector: servicios, galería, opiniones reales, preguntas frecuentes y ubicación.",
          "Los paneles y funciones avanzadas que aparecen en los ejemplos son demostraciones.",
        ]}
      >
        <SafeBoundary name="Sectores" minHeight={400}>
          <SectorsShowcase />
        </SafeBoundary>
      </PlatformIntro>

      <CtaBand title="Empieza por lo que ya funciona: tu web" text="Diseña tu página web en unos minutos y te enviamos un presupuesto por escrito. Si te interesa Stella, la solicitamos juntos." />
    </>
  );
}
