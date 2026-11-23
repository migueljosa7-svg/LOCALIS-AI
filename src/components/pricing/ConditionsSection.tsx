import Link from "next/link";
import { BadgeCheck, CalendarClock, ClipboardCheck, RefreshCcw, Clock3, Calendar } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { ROUTES } from "@/lib/navigation";
import { WA_AUDIT_TEXT, waLink } from "@/lib/site";

// Condiciones comerciales que ya figuran en planes y FAQ (lib/plans.ts, lib/faqs.ts).
// No añadir aquí nada que no esté acordado: impuestos, pagos y garantías se
// completarán cuando estén definidos en los textos legales.
const CONDITIONS = [
  { icon: BadgeCheck, title: "Precio cerrado", text: "Ves el precio de tu web en el estudio antes de hablar con nosotros." },
  { icon: ClipboardCheck, title: "Auditoría gratuita", text: "Antes de empezar revisamos tu caso y te proponemos solo lo que necesitas." },
  { icon: CalendarClock, title: "Entrega en 5–10 días", text: "Días laborables desde que tenemos tus contenidos: logo, fotos, servicios y precios." },
  { icon: RefreshCcw, title: "Sin permanencia", text: "Cambia de plan o cancela el mantenimiento cuando quieras escribiéndonos." },
  { icon: Clock3, title: "Módulos en desarrollo", text: "Stella IA, citas, catálogo y GPS no se cobran hasta que estén terminados y probados." },
];

export default function ConditionsSection() {
  return (
    <section id="condiciones" aria-labelledby="condiciones-title" className="relative w-full py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="condiciones-title" className="font-display font-bold text-3xl sm:text-4xl leading-tight text-center">
          Condiciones <span className="gradient-text">claras</span>
        </h2>
        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CONDITIONS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="glass rounded-3xl p-5 flex flex-col">
              <Icon size={20} className="text-cyan-300" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={ROUTES.cita} className="btn btn-primary min-h-[52px] px-6">
            <Calendar size={18} aria-hidden="true" /> Pedir auditoría gratuita
          </Link>
          <a href={waLink(WA_AUDIT_TEXT)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-[52px] px-6">
            <WhatsAppIcon size={18} className="text-[#25D366]" /> Preguntar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
