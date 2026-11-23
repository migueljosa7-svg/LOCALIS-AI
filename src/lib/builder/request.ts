// Núcleo de «Quiero esta web»: valida, guarda imágenes, guarda el diseño, crea el lead y avisa.
// Sin Next ni Supabase directos: todo lo externo entra por `deps` (se prueba sin red).
import { SECTORS, type SiteConfig } from "./model";
import { LIMITS, MAX_FILE_BYTES, MAX_TOTAL_BYTES, sanitizeConfig, sniffImage, uploadIds } from "./validate";
import { summarize, techBrief } from "./summary";
import { validateLead } from "@/lib/lead";
import type { UploadMeta } from "./store";

export interface RequestDeps {
  /** huella no reversible de la IP */
  hashIp(ip: string): Promise<string>;
  countRecentByIp(ipHash: string, minutes: number): Promise<number | null>;
  uploadImage(path: string, bytes: Uint8Array, mime: string): Promise<boolean>;
  insertDesign(row: { id: string; config: SiteConfig; uploads: UploadMeta[]; ipHash: string }): Promise<{ ok: boolean }>;
  insertLead(l: { businessName: string; contactName: string; email: string; phone: string; service: string; source: string; details: string; prompt: string }): Promise<{ ok: boolean; id?: string }>;
  notify(l: { businessName: string; sector: string; contactName: string; phone: string; email: string; source: string; details: string; prompt: string }): Promise<{ notified: boolean }>;
  markNotified(leadId: string): Promise<void>;
  linkLead(designId: string, leadId: string): Promise<void>;
  newId(): string;
  siteUrl: string;
}

export interface DesignIncoming {
  host: string | null;
  origin: string | null;
  contentLength: number | null;
  ip: string;
  form: FormData;
}

export type Outcome = { status: number; body: Record<string, unknown> };
const fail = (status: number, error: string): Outcome => ({ status, body: { ok: false, error } });
const FALLBACK = "No hemos podido registrar tu diseño. Escríbenos por WhatsApp al +34 640 80 92 38 y te atendemos al momento.";

export const MAX_REQUEST_BYTES = 4_400_000;
export const MAX_PER_HOUR = 5;

/** Quita de la configuración las imágenes propias cuyo archivo no llegó (y sus usos). */
export function dropMissingUploads(cfg: SiteConfig, present: Set<string>): SiteConfig {
  const keep = (id: string) => !/^u\d$/.test(id) || present.has(id);
  return {
    ...cfg,
    images: cfg.images.filter((i) => keep(i.id)),
    heroImage: cfg.heroImage && keep(cfg.heroImage) ? cfg.heroImage : null,
    logoImage: cfg.logoImage && keep(cfg.logoImage) ? cfg.logoImage : null,
    gallery: { ...cfg.gallery, ids: cfg.gallery.ids.filter(keep) },
    carousel: { ...cfg.carousel, ids: cfg.carousel.ids.filter(keep) },
  };
}

function json(form: FormData, key: string, max: number): Record<string, unknown> | null {
  const v = form.get(key);
  if (typeof v !== "string" || v.length > max) return null;
  try {
    const p = JSON.parse(v) as unknown;
    return p && typeof p === "object" && !Array.isArray(p) ? (p as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function handleDesignRequest(deps: RequestDeps, req: DesignIncoming): Promise<Outcome> {
  // Solo desde nuestra propia web (descarta tráfico ajeno; la defensa real son los límites y la validación).
  let originHost = "";
  try {
    originHost = new URL(req.origin ?? "").host;
  } catch {}
  if (!req.host || originHost !== req.host) return fail(403, "Origen no permitido.");
  if ((req.contentLength ?? 0) > MAX_REQUEST_BYTES) return fail(413, "Las imágenes pesan demasiado. Quita alguna o envíalas después por WhatsApp.");

  const rawConfig = json(req.form, "config", LIMITS.maxJsonBytes);
  const contact = json(req.form, "contact", 4000);
  if (!rawConfig || !contact) return fail(400, "Solicitud no válida.");

  // Trampa anti-robots: parece que ha funcionado, pero no se guarda nada.
  if (typeof contact.website === "string" && contact.website.trim() !== "") return { status: 200, body: { ok: true } };

  const s = (k: string, max: number) => String(contact[k] ?? "").trim().slice(0, max);
  const cfg0 = sanitizeConfig(rawConfig);
  if (!cfg0) return fail(400, "Solicitud no válida.");
  const sectorLabel = SECTORS.find((x) => x.id === cfg0.business.sector)?.label ?? "Otro";
  const lead = { businessName: s("businessName", 120), contactName: s("contactName", 120), phone: s("phone", 40), email: s("email", 160).toLowerCase(), sector: sectorLabel };
  const errors = validateLead(lead);
  if (Object.keys(errors).length) return { status: 422, body: { ok: false, error: Object.values(errors)[0], errors } };
  if (contact.consent !== true) return fail(422, "Necesitamos tu permiso para contactarte.");

  // Límites de uso persistentes por IP (huella, no la IP).
  const ipHash = await deps.hashIp(req.ip);
  const recent = await deps.countRecentByIp(ipHash, 60);
  if (recent !== null && recent >= MAX_PER_HOUR) return fail(429, "Has enviado varios diseños seguidos. Escríbenos por WhatsApp y lo vemos juntos.");

  // Imágenes propias: se validan por su contenido real, tamaño y número.
  const designId = deps.newId();
  const wanted = uploadIds(cfg0).slice(0, LIMITS.maxUploads);
  const stored: UploadMeta[] = [];
  let total = 0;
  let lost = 0;
  for (const id of wanted) {
    const f = req.form.get(`file_${id}`);
    if (!(f instanceof File)) {
      lost++;
      continue;
    }
    if (f.size > MAX_FILE_BYTES || total + f.size > MAX_TOTAL_BYTES) return fail(413, "Las imágenes pesan demasiado. Quita alguna o envíalas después por WhatsApp.");
    const bytes = new Uint8Array(await f.arrayBuffer());
    const type = sniffImage(bytes);
    if (!type) return fail(422, `«${cfg0.images.find((i) => i.id === id)?.name ?? id}» no es una imagen JPG, PNG o WebP válida.`);
    total += bytes.length;
    const path = `${designId}/${id}.${type.ext}`;
    if (await deps.uploadImage(path, bytes, type.mime)) stored.push({ id, name: cfg0.images.find((i) => i.id === id)?.name ?? id, path, mime: type.mime, bytes: bytes.length });
    else lost++;
  }
  const cfg = dropMissingUploads(cfg0, new Set(stored.map((u) => u.id)));

  const design = await deps.insertDesign({ id: designId, config: cfg, uploads: stored, ipHash });
  const adminUrl = design.ok ? `${deps.siteUrl}/admin/diseno/${designId}` : undefined;
  let details = summarize(cfg, adminUrl);
  if (lost) details = `${details}\n⚠ ${lost} imagen(es) del cliente no se pudieron guardar: pídelas por WhatsApp.`.slice(0, 1200);
  if (!design.ok) details = `${details}\n⚠ El diseño completo no se guardó en la base de datos; está en el prompt técnico.`.slice(0, 1200);
  const prompt = techBrief(cfg);

  const stored2 = await deps.insertLead({ ...lead, service: sectorLabel.slice(0, 120), source: "disena-tu-web", details, prompt });
  const mail = await deps.notify({ ...lead, sector: `Web diseñada por el cliente · ${sectorLabel}`, source: "disena-tu-web", details, prompt });
  if (stored2.ok && stored2.id) {
    if (mail.notified) await deps.markNotified(stored2.id);
    if (design.ok) await deps.linkLead(designId, stored2.id);
  }
  if (!stored2.ok && !mail.notified && !design.ok) {
    console.error("[design] solicitud NO registrada: ni base de datos ni email");
    return fail(503, FALLBACK);
  }
  return { status: 200, body: { ok: true, reference: designId, savedImages: stored.length, lostImages: lost } };
}
