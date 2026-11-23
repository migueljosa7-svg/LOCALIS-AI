// Saneado estricto de la configuración que llega al servidor. Nada que venga del navegador se guarda sin pasar
// por aquí: listas blancas para cada opción, textos acotados y colores solo #rrggbb. Nunca lanza.
import {
  ACTIONS, FONTS, HEADERS, HEROES, INTERESTS, PALETTES, POSITIONS, SECTION_DEFS, SECTORS, TEMPLATES, PAGE_TYPES, defaultConfig,
  sectionsFor,
  type BuilderButton, type ButtonAction, type ButtonPosition, type ButtonShape, type ButtonStyle, type CarouselStyle, type GalleryLayout, type ImageRef,
  type SectionId, type SectionState, type SiteConfig,
} from "./model";
import { SAMPLE_IMAGES } from "./images";

export const LIMITS = { maxImages: 12, maxUploads: 5, maxButtons: 8, maxServices: 12, maxJsonBytes: 120_000 } as const;

type R = Record<string, unknown>;
const isObj = (v: unknown): v is R => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown, max: number): string => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "");
const oneOf = <T extends string>(v: unknown, list: readonly T[], fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback);
const hex = (v: unknown, fallback: string): string => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v.toLowerCase() : fallback);
const bool = (v: unknown): boolean => v === true;
const arr = (v: unknown, max: number): unknown[] => (Array.isArray(v) ? v.slice(0, max) : []);

const SAMPLE_IDS = new Set(SAMPLE_IMAGES.map((s) => s.id));
const UPLOAD_ID = /^u[1-5]$/;

/** Solo https://… sin espacios ni caracteres de control; el resto se descarta (el botón queda pendiente). */
export function cleanUrl(v: unknown): string {
  const s = str(v, 300);
  if (!/^https:\/\/[^\s<>"']+$/i.test(s)) return "";
  try {
    return new URL(s).protocol === "https:" ? s : "";
  } catch {
    return "";
  }
}

export function sanitizeConfig(raw: unknown): SiteConfig | null {
  if (!isObj(raw)) return null;
  const sectorId = oneOf(isObj(raw.business) ? raw.business.sector : "", SECTORS.map((s) => s.id), "otro");
  const d = defaultConfig(sectorId, oneOf(raw.pageType, PAGE_TYPES.map((p) => p.id), "presentacion"));
  const biz = isObj(raw.business) ? raw.business : {};
  const theme = isObj(raw.theme) ? raw.theme : {};
  const colors = isObj(theme.colors) ? theme.colors : {};

  // Imágenes: solo ejemplos conocidos o subidas u1..u5 (las referencias reales las fija el servidor).
  const images: ImageRef[] = [];
  const seen = new Set<string>();
  for (const x of arr(raw.images, LIMITS.maxImages)) {
    if (!isObj(x) || typeof x.id !== "string" || seen.has(x.id)) continue;
    const kind = SAMPLE_IDS.has(x.id) ? "sample" : UPLOAD_ID.test(x.id) ? "upload" : null;
    if (!kind) continue;
    seen.add(x.id);
    images.push({ id: x.id, kind, name: str(x.name, 80) || (kind === "sample" ? "Imagen de ejemplo" : "Imagen subida") });
  }
  const known = (id: unknown): id is string => typeof id === "string" && seen.has(id);
  const ids = (v: unknown, max: number): string[] => arr(v, max).filter(known);

  // Secciones: solo las permitidas para el sector, sin duplicados; cabecera primero y pie al final.
  const allowed = sectionsFor(sectorId);
  const secs: SectionState[] = [];
  for (const x of arr(raw.sections, 20)) {
    if (!isObj(x) || typeof x.id !== "string" || !(x.id in SECTION_DEFS)) continue;
    const id = x.id as SectionId;
    if (!allowed.includes(id) || secs.some((s) => s.id === id)) continue;
    secs.push({ id, enabled: bool(x.enabled) });
  }
  for (const id of allowed) if (!secs.some((s) => s.id === id)) secs.push({ id, enabled: false });
  const sections = [
    ...secs.filter((s) => s.id === "header"),
    ...secs.filter((s) => s.id !== "header" && s.id !== "footer"),
    ...secs.filter((s) => s.id === "footer"),
  ];

  const buttons: BuilderButton[] = [];
  for (const x of arr(raw.buttons, LIMITS.maxButtons)) {
    if (!isObj(x)) continue;
    const label = str(x.label, 40);
    if (!label) continue;
    buttons.push({
      id: str(x.id, 24).replace(/[^a-z0-9]/gi, "") || `b${buttons.length + 1}`,
      label,
      action: oneOf<ButtonAction>(x.action, ACTIONS.map((a) => a.id), "contact"),
      url: cleanUrl(x.url),
      target: oneOf<SectionId>(x.target, Object.keys(SECTION_DEFS) as SectionId[], "services"),
      style: oneOf<ButtonStyle>(x.style, ["solido", "contorno", "suave", "texto"], "solido"),
      shape: oneOf<ButtonShape>(x.shape, ["cuadrado", "redondeado", "pildora"], "redondeado"),
      color: x.color === "primary" || x.color === "secondary" || x.color === "button" ? x.color : hex(x.color, "button"),
      positions: Array.from(new Set(arr(x.positions, 5).filter((p): p is ButtonPosition => typeof p === "string" && POSITIONS.some((q) => q.id === p)))),
    });
  }

  const services = arr(biz.services, LIMITS.maxServices)
    .filter(isObj)
    .map((s) => ({ name: str(s.name, 80), price: str(s.price, 60), desc: str(s.desc, 200) }))
    .filter((s) => s.name);

  const interests = arr((isObj(raw.wants) ? raw.wants : {}).interests, 6).filter((i): i is string => typeof i === "string" && INTERESTS.some((x) => x.id === i));

  return {
    version: 1,
    template: oneOf(raw.template, TEMPLATES.map((t) => t.id), d.template),
    pageType: d.pageType,
    pages: Math.min(10, Math.max(4, Math.round(Number(raw.pages) || d.pages))),
    business: {
      name: str(biz.name, 120), sector: sectorId, city: str(biz.city, 80), tagline: str(biz.tagline, 140), description: str(biz.description, 700), services,
      phone: str(biz.phone, 40), whatsapp: str(biz.whatsapp, 40), email: str(biz.email, 160).toLowerCase(), address: str(biz.address, 200),
      instagram: str(biz.instagram, 120), facebook: str(biz.facebook, 120), domain: str(biz.domain, 120).toLowerCase(), goal: str(biz.goal, 300), hasLogo: bool(biz.hasLogo),
    },
    theme: {
      palette: theme.palette === "custom" ? "custom" : oneOf(theme.palette, PALETTES.map((p) => p.id), d.theme.palette as never),
      colors: {
        primary: hex(colors.primary, d.theme.colors.primary), secondary: hex(colors.secondary, d.theme.colors.secondary), background: hex(colors.background, d.theme.colors.background),
        text: hex(colors.text, d.theme.colors.text), card: hex(colors.card, d.theme.colors.card), button: hex(colors.button, d.theme.colors.button),
      },
      fontHeading: oneOf(theme.fontHeading, FONTS.map((f) => f.id), d.theme.fontHeading),
      fontBody: oneOf(theme.fontBody, FONTS.map((f) => f.id), d.theme.fontBody),
      headingScale: oneOf(theme.headingScale, ["sm", "md", "lg"] as const, "md"),
      headingWeight: oneOf(theme.headingWeight, ["normal", "bold", "black"] as const, "bold"),
      textSize: oneOf(theme.textSize, ["sm", "md", "lg"] as const, "md"),
      radius: oneOf(theme.radius, ["recto", "suave", "redondo"] as const, "suave"),
      header: oneOf(theme.header, HEADERS.map((h) => h.id), d.theme.header),
      hero: oneOf(theme.hero, HEROES.map((h) => h.id), d.theme.hero),
    },
    sections,
    buttons,
    images,
    heroImage: known(raw.heroImage) ? raw.heroImage : null,
    logoImage: known(raw.logoImage) ? raw.logoImage : null,
    gallery: { layout: oneOf<GalleryLayout>(isObj(raw.gallery) ? raw.gallery.layout : "", ["cuadricula", "mosaico", "columnas"], "cuadricula"), ids: ids(isObj(raw.gallery) ? raw.gallery.ids : [], 12) },
    carousel: {
      style: oneOf<CarouselStyle>(isObj(raw.carousel) ? raw.carousel.style : "", ["deslizar", "fundido", "tarjetas", "miniaturas"], "deslizar"),
      autoplay: isObj(raw.carousel) ? bool(raw.carousel.autoplay) : true,
      ids: ids(isObj(raw.carousel) ? raw.carousel.ids : [], 12),
    },
    wants: { stella: isObj(raw.wants) ? bool(raw.wants.stella) : false, interests },
    comments: str(raw.comments, 1500),
  };
}

/** Ids de las imágenes subidas que la configuración usa (hay que adjuntar su archivo). */
export const uploadIds = (cfg: SiteConfig): string[] => cfg.images.filter((i) => i.kind === "upload").map((i) => i.id);

// ── Archivos subidos ──────────────────────────────────────────────
export const MAX_FILE_BYTES = 1_200_000;
export const MAX_TOTAL_BYTES = 4_000_000; // Vercel admite 4,5 MB por petición
export type ImageType = { ext: "jpg" | "png" | "webp"; mime: string };

/** Tipo REAL de imagen por los primeros bytes (no por el nombre ni por lo que diga el navegador). */
export function sniffImage(b: Uint8Array): ImageType | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (b.length > 12 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return { ext: "png", mime: "image/png" };
  if (b.length > 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return { ext: "webp", mime: "image/webp" };
  return null;
}
