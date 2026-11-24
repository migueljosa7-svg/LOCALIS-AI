import type { Metadata } from "next";
import OnboardingForm from "./OnboardingForm";
import { parseAbout } from "@/lib/stella/about";
import { readConfig } from "@/lib/stella/config";
import { faqsToText, servicesToText } from "@/lib/stella/ficha";
import { readOnboardingToken } from "@/lib/stella/onboarding";
import { fetchBusiness } from "@/lib/stella/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Datos de tu negocio", robots: { index: false, follow: false }, referrer: "no-referrer" };

// Página pública SIN usuario ni contraseña, protegida por un enlace firmado de un solo negocio y con caducidad.
export default async function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cfg = readConfig();
  const id = cfg.secret ? await readOnboardingToken(cfg.secret, token) : null;
  const b = id ? await fetchBusiness(id) : null;
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm text-muted">LOCALIS AI · asistente virtual Stella</p>
      {!b || b.builtin ? (
        <div role="alert" className="mt-6 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 text-amber-100" data-testid="alta-invalido">
          <h1 className="font-display text-2xl font-bold">Enlace no válido o caducado</h1>
          <p className="mt-2 text-sm">Pide un enlace nuevo a LOCALIS AI por WhatsApp o email.</p>
        </div>
      ) : b.active ? (
        <div className="mt-6 rounded-2xl border border-white/10 p-5">
          <h1 className="font-display text-2xl font-bold">Tu asistente ya está activo</h1>
          <p className="mt-2 text-sm text-muted">Para cambiar información escribe a LOCALIS AI y lo actualizamos juntos.</p>
        </div>
      ) : (
        <>
          <h1 className="mt-2 font-display text-3xl font-bold">Cuéntanos sobre {b.name}</h1>
          <p className="mt-2 text-sm text-muted">
            Rellena lo que sepas; puedes dejar en blanco lo demás. Con esta información prepararemos el asistente de tu web. No tienes que crear ninguna cuenta y puedes volver a este enlace para completarla.
          </p>
          <div className="mt-6">
            <OnboardingForm
              token={token}
              d={(() => {
                const a = parseAbout(b.about);
                return {
                  name: b.name,
                  sector: b.sector,
                  area: b.area,
                  description: a.description,
                  website: a.website,
                  address: a.address,
                  extra: a.extra,
                  services: servicesToText(b.services),
                  faqs: faqsToText(b.faqs),
                  hours: b.hours ?? "",
                  whatsapp: b.whatsapp,
                  phone: b.phone ?? "",
                  notifyEmail: b.notifyEmail ?? "",
                  domains: b.domains.join("\n"),
                  privacyUrl: b.privacyUrl,
                  notAvailable: b.notAvailable.join("\n"),
                };
              })()}
            />
          </div>
        </>
      )}
    </main>
  );
}
