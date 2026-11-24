import dynamic from "next/dynamic";
import { BarChart3, Bot, Inbox, LayoutDashboard, MapPin, Navigation, ShieldCheck, Smartphone, Route, UserCheck, Wallet } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import SafeBoundary from "@/components/SafeBoundary";
import { CtaBand, PageHeader, PlatformApartado } from "@/components/site/Blocks";
import PlatformTabs from "@/components/site/PlatformTabs";
import StellaLiveSection from "@/components/stella/StellaLiveSection";
import StellaOrderButton from "@/components/stella/StellaOrderButton";
import { pageMeta } from "@/lib/seo";

// Las demostraciones son interactivas: su código se descarga aparte y solo se monta al abrir su pestaña.
const StellaConsole = dynamic(() => import("@/components/stella/StellaConsole"));
const GpsModuleSection = dynamic(() => import("@/components/gps/GpsModuleSection"));
const DashboardPreview = dynamic(() => import("@/components/DashboardPreview"));

export const metadata = pageMeta({
  path: "/plataforma",
  title: "Plataforma: Stella IA, GPS y panel de control",
  description: "Conoce Stella, el asistente con IA para tu web, el módulo de reparto con GPS y el panel de control que estamos desarrollando. Qué es real hoy y qué es demostración.",
});

function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-100">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> {label}
        </p>
      </div>
      {children}
    </div>
  );
}

export default function PlataformaPage() {
  const intros = {
    stella: (
      <>
        <PlatformApartado
          icon={Bot}
          title="Stella: un asistente que atiende a los clientes de tu web"
          status="Fase piloto · plazas limitadas"
          tone="wip"
          lead="Responde al momento las dudas de tus visitantes con la información de tu negocio y te avisa cuando alguien quiere que le llames."
          benefits={[
            { icon: Smartphone, title: "Respuestas al momento", text: "Precios, horarios y servicios contestados mientras el cliente decide, también fuera de tu horario." },
            { icon: ShieldCheck, title: "Solo dice lo que tú le cuentas", text: "Si no sabe algo, lo reconoce y ofrece tu WhatsApp. No se inventa precios ni condiciones." },
            { icon: UserCheck, title: "Te trae contactos", text: "Si alguien pide que le llames, guarda su nombre y teléfono con su consentimiento y te avisa por email." },
          ]}
          real={["Chat con la ficha de tu negocio, límites de gasto y protecciones, probados con pruebas automáticas.", "Se instala con una línea de código y solo funciona en tu dominio."]}
          demo={["El chat de ejemplo que ves más abajo responde con textos preparados de un negocio ficticio."]}
          missing={["Validación con la IA real en producción: por eso se ofrece como piloto.", "No se activa ni se cobra nada al solicitarla."]}
        />
        <div className="mx-auto mt-8 flex w-full max-w-7xl flex-col items-start gap-2 px-4 sm:px-6 lg:px-8">
          <StellaOrderButton />
          <p className="text-sm text-muted">Pedir Stella no activa ni cobra nada: es una solicitud y hablamos contigo antes.</p>
        </div>
        <StellaLiveSection />
      </>
    ),
    gps: (
      <PlatformApartado
        icon={MapPin}
        title="GPS y reparto: reparte con tu gente, sin intermediarios"
        status="En desarrollo · hoy es una demostración"
        tone="wip"
        lead="Un módulo pensado para negocios que reparten ellos mismos: tú organizas los pedidos y tu cliente ve por dónde va el suyo."
        benefits={[
          { icon: Wallet, title: "Sin comisión por pedido", text: "Las plataformas de reparto cobran un porcentaje de cada pedido. Con tus propios repartidores, ese margen es tuyo." },
          { icon: Route, title: "Rutas claras para tu equipo", text: "Cada repartidor ve sus pedidos y la ruta, sin llamadas ni mensajes sueltos." },
          { icon: Navigation, title: "Seguimiento para tu cliente", text: "Un enlace para ver el estado del pedido en un mapa, sin descargar nada." },
        ]}
        real={["Botón «Cómo llegar» y mapa de Google en tu web: gratis y sin claves."]}
        demo={["Simulación con repartidores, rutas y pedidos ficticios para ver cómo funcionará."]}
        missing={["Seguimiento GPS real de repartidores y enlace de seguimiento para el cliente.", "No se contrata ni se cobra todavía."]}
      />
    ),
    panel: (
      <PlatformApartado
        icon={LayoutDashboard}
        title="Panel de control: tu actividad en una sola pantalla"
        status="En desarrollo · todavía no se puede contratar"
        tone="wip"
        lead="Estamos diseñando una pantalla donde ver de un vistazo los contactos y solicitudes que te llegan desde tu web. Hoy es una maqueta con datos ficticios: no existe un panel de acceso para clientes."
        benefits={[
          { icon: Inbox, title: "Todo en un sitio", text: "Contactos, solicitudes y actividad juntos, en lugar de repartidos entre correos y mensajes." },
          { icon: BarChart3, title: "Ver qué funciona", text: "De dónde llegan tus contactos y cuántos atiendes, para decidir con datos." },
          { icon: ShieldCheck, title: "Sin perder ninguno", text: "Un listado ordenado para que ninguna solicitud se quede sin respuesta." },
        ]}
        real={["Hoy cada contacto de tu web te llega por email y puedes escribirnos por WhatsApp para cualquier cambio."]}
        demo={["La pantalla de abajo es una maqueta con ventas, citas y facturas de ejemplo; no son datos de nadie."]}
        missing={["Acceso con usuario para clientes, métricas, agenda y facturación.", "Te avisaremos cuando exista; hasta entonces no se vende."]}
      />
    ),
  };

  const demos = {
    stella: (
      <Demo label="Demostración · negocio ficticio">
        <SafeBoundary name="Demostración de Stella" minHeight={400}>
          <StellaConsole />
        </SafeBoundary>
      </Demo>
    ),
    gps: (
      <Demo label="Demostración · datos ficticios">
        <SafeBoundary name="Demostración de reparto" minHeight={400}>
          <GpsModuleSection />
        </SafeBoundary>
      </Demo>
    ),
    panel: (
      <Demo label="Maqueta · datos ficticios">
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <SafeBoundary name="Maqueta del panel" minHeight={400}>
            <DashboardPreview compact />
          </SafeBoundary>
        </div>
      </Demo>
    ),
  };

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Plataforma", path: "/plataforma" }]} />
      <PageHeader
        eyebrow="Plataforma LOCALIS AI"
        title="Herramientas para que tu negocio"
        accent="capte más clientes"
        intro="Empezamos por una web que convierte visitas en contactos y sumamos herramientas por encima. Elige un apartado: te contamos qué es real hoy y qué estamos desarrollando."
        crumbs={[{ name: "Plataforma" }]}
      />
      <PlatformTabs intros={intros} demos={demos} />
      <div className="pt-14">
        <CtaBand title="Empieza por lo que ya funciona: tu web" text="Diseña tu página web en unos minutos y te enviamos un presupuesto por escrito. Si te interesa Stella, la solicitamos juntos." />
      </div>
    </>
  );
}
