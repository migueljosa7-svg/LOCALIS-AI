// Enlace de incorporación: permite que el CLIENTE complete la ficha de SU negocio sin entrar en el panel.
// Es un token firmado (HMAC) ligado a un único negocio y con caducidad. Solo permite editar la ficha mientras el
// negocio está DESACTIVADO (borrador): activar, presupuestos y notas internas son siempre cosa del panel.
import { randomId, signToken, verifyToken } from "./token";

export const ONBOARDING_TTL_SECONDS = 14 * 24 * 3600;
// Secreto distinto del de las sesiones del chat: un token de una clase no sirve para la otra.
const secretFor = (secret: string): string => `${secret}:alta-v1`;

export async function createOnboardingToken(secret: string, businessId: string, now = Math.floor(Date.now() / 1000)): Promise<string> {
  return signToken(secretFor(secret), { b: businessId, s: randomId(), h: "alta", i: now - 1, e: now + ONBOARDING_TTL_SECONDS });
}

export async function readOnboardingToken(secret: string, token: unknown, now = Math.floor(Date.now() / 1000)): Promise<string | null> {
  const r = await verifyToken(secretFor(secret), token, now);
  return r.ok && r.payload.h === "alta" ? r.payload.b : null;
}
