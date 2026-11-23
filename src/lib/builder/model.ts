// Modelo del configurador visual «Diseña tu web». Datos puros (sin React): se comparten entre el editor,
// la vista previa, el servidor (validación) y el panel interno. Nada de aquí inventa precios ni enlaces.

export type SectorId = "restaurante" | "comercio" | "peluqueria" | "clinica" | "taller" | "servicios" | "profesional" | "otro";
export type PageTypeId = "presentacion" | "corporativa" | "catalogo" | "reservas";
export type SectionId = "header" | "hero" | "services" | "products" | "gallery" | "carousel" | "testimonials" | "team" | "faq" | "location" | "contact" | "footer";
export type TemplateId = "elegante" | "moderno" | "minimalista" | "servicios" | "restaurante" | "comercio" | "peluqueria" | "profesional";
export type PaletteId = "elegante" | "moderno" | "minimalista" | "tecnologico" | "natural" | "comercial" | "creativo";
export type FontId = "playfair" | "lora" | "poppins" | "montserrat" | "inter" | "sistema";
export type HeaderStyle = "clasica" | "centrada" | "minima" | "dividida";
export type HeroLayout = "dividida" | "centrada" | "imagen";
export type Radius = "recto" | "suave" | "redondo";
export type ButtonAction = "whatsapp" | "call" | "form" | "contact" | "link" | "section";
export type ButtonStyle = "solido" | "contorno" | "suave" | "texto";
export type ButtonShape = "cuadrado" | "redondeado" | "pildora";
export type ButtonPosition = "header" | "hero" | "afterServices" | "beforeFooter" | "sticky";
export type GalleryLayout = "cuadricula" | "mosaico" | "columnas";
export type CarouselStyle = "deslizar" | "fundido" | "tarjetas" | "miniaturas";
export type HeadingScale = "sm" | "md" | "lg";
export type HeadingWeight = "normal" | "bold" | "black";
export type TextSize = "sm" | "md" | "lg";
export type Device = "desktop" | "tablet" | "mobile";

export interface Colors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  card: string;
  button: string;
}

export interface BuilderButton {
  id: string;
  label: string;
  action: ButtonAction;
  /** https://… (acción «link») */
  url: string;
  /** sección destino (acción «section») */
  target: SectionId;
  style: ButtonStyle;
  shape: ButtonShape;
  /** "button" (color de botones del tema), "primary", "secondary" o un #rrggbb propio */
  color: string;
  positions: ButtonPosition[];
}

export interface ImageRef {
  id: string;
  kind: "sample" | "upload";
  name: string;
}

export interface Service {
  name: string;
  price: string;
  desc: string;
}

export interface Business {
  name: string;
  sector: SectorId;
  city: string;
  tagline: string;
  description: string;
  services: Service[];
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  domain: string;
  goal: string;
  hasLogo: boolean;
}

export interface SectionState {
  id: SectionId;
  enabled: boolean;
}

export interface SiteConfig {
  version: 1;
  template: TemplateId;
  pageType: PageTypeId;
  pages: number;
  business: Business;
  theme: {
    palette: PaletteId | "custom";
    colors: Colors;
    fontHeading: FontId;
    fontBody: FontId;
    headingScale: HeadingScale;
    headingWeight: HeadingWeight;
    textSize: TextSize;
    radius: Radius;
    header: HeaderStyle;
    hero: HeroLayout;
  };
  sections: SectionState[];
  buttons: BuilderButton[];
  images: ImageRef[];
  heroImage: string | null;
  logoImage: string | null;
  gallery: { layout: GalleryLayout; ids: string[] };
  carousel: { style: CarouselStyle; autoplay: boolean; ids: string[] };
  wants: { stella: boolean; interests: string[] };
  comments: string;
}

// ── Catálogos ─────────────────────────────────────────────────────
export const SECTORS: { id: SectorId; label: string; hint: string; template: TemplateId; pageType: PageTypeId }[] = [
  { id: "restaurante", label: "Restaurante o bar", hint: "Carta, reservas y ubicación", template: "restaurante", pageType: "reservas" },
  { id: "comercio", label: "Comercio o tienda", hint: "Productos, horarios y contacto", template: "comercio", pageType: "catalogo" },
  { id: "peluqueria", label: "Peluquería o estética", hint: "Servicios, galería y citas", template: "peluqueria", pageType: "reservas" },
  { id: "clinica", label: "Clínica o salud", hint: "Tratamientos, equipo y citas", template: "elegante", pageType: "corporativa" },
  { id: "taller", label: "Taller o servicios técnicos", hint: "Servicios, presupuesto y llamada", template: "servicios", pageType: "corporativa" },
  { id: "servicios", label: "Empresa de servicios", hint: "Presentación, servicios y confianza", template: "servicios", pageType: "corporativa" },
  { id: "profesional", label: "Profesional independiente", hint: "Tu perfil, servicios y contacto", template: "profesional", pageType: "presentacion" },
  { id: "otro", label: "Otro tipo de negocio", hint: "Empieza desde una plantilla limpia", template: "moderno", pageType: "presentacion" },
];

export const PAGE_TYPES: { id: PageTypeId; label: string; hint: string; pages: number }[] = [
  { id: "presentacion", label: "Presentación en una página", hint: "Todo lo esencial, en una sola página", pages: 4 },
  { id: "corporativa", label: "Web corporativa", hint: "Inicio, servicios, nosotros y contacto", pages: 5 },
  { id: "catalogo", label: "Catálogo o carta", hint: "Más páginas para productos o platos", pages: 6 },
  { id: "reservas", label: "Reservas y contacto", hint: "Pensada para que te llamen o reserven", pages: 5 },
];

export const SECTION_DEFS: Record<SectionId, { label: string; hint: string; fixed?: "start" | "end" }> = {
  header: { label: "Cabecera", hint: "Logo, menú y botones", fixed: "start" },
  hero: { label: "Presentación", hint: "Titular, texto y botón principal" },
  services: { label: "Servicios", hint: "Lo que ofreces" },
  products: { label: "Productos o carta", hint: "Productos, platos o tarifas" },
  gallery: { label: "Galería", hint: "Fotos de tu trabajo o local" },
  carousel: { label: "Carrusel", hint: "Fotos que se deslizan" },
  testimonials: { label: "Opiniones", hint: "Lo que dicen tus clientes" },
  team: { label: "Equipo", hint: "Quién está detrás" },
  faq: { label: "Preguntas frecuentes", hint: "Dudas habituales" },
  location: { label: "Ubicación y mapa", hint: "Dónde estás y cómo llegar" },
  contact: { label: "Contacto", hint: "Formulario, teléfono y redes" },
  footer: { label: "Pie de página", hint: "Datos legales y enlaces", fixed: "end" },
};

/** Secciones disponibles según el tipo de negocio (no todas tienen sentido para todos). */
const ALL: SectionId[] = ["header", "hero", "services", "products", "gallery", "carousel", "testimonials", "team", "faq", "location", "contact", "footer"];
export const SECTIONS_BY_SECTOR: Record<SectorId, SectionId[]> = {
  restaurante: ["header", "hero", "services", "products", "gallery", "carousel", "testimonials", "faq", "location", "contact", "footer"],
  comercio: ["header", "hero", "services", "products", "gallery", "carousel", "testimonials", "faq", "location", "contact", "footer"],
  peluqueria: ["header", "hero", "services", "products", "gallery", "carousel", "testimonials", "team", "faq", "location", "contact", "footer"],
  clinica: ["header", "hero", "services", "gallery", "carousel", "testimonials", "team", "faq", "location", "contact", "footer"],
  taller: ["header", "hero", "services", "gallery", "carousel", "testimonials", "faq", "location", "contact", "footer"],
  servicios: ["header", "hero", "services", "gallery", "carousel", "testimonials", "team", "faq", "location", "contact", "footer"],
  profesional: ["header", "hero", "services", "gallery", "carousel", "testimonials", "faq", "contact", "footer"],
  otro: ALL,
};
export const sectionsFor = (s: SectorId): SectionId[] => SECTIONS_BY_SECTOR[s];

export const PALETTES: { id: PaletteId; label: string; colors: Colors }[] = [
  { id: "elegante", label: "Elegante", colors: { primary: "#8a6d3b", secondary: "#2b2b2b", background: "#faf7f2", text: "#26221c", card: "#ffffff", button: "#8a6d3b" } },
  { id: "moderno", label: "Moderno", colors: { primary: "#2563eb", secondary: "#0ea5e9", background: "#f8fafc", text: "#0f172a", card: "#ffffff", button: "#2563eb" } },
  { id: "minimalista", label: "Minimalista", colors: { primary: "#111111", secondary: "#6b7280", background: "#ffffff", text: "#111111", card: "#f4f4f5", button: "#111111" } },
  { id: "tecnologico", label: "Tecnológico", colors: { primary: "#22d3ee", secondary: "#6366f1", background: "#0b1020", text: "#e6edf7", card: "#141b30", button: "#22d3ee" } },
  { id: "natural", label: "Natural", colors: { primary: "#4d7c0f", secondary: "#a16207", background: "#f6f7ef", text: "#22301a", card: "#ffffff", button: "#4d7c0f" } },
  { id: "comercial", label: "Comercial", colors: { primary: "#dc2626", secondary: "#f59e0b", background: "#fffaf5", text: "#1f1410", card: "#ffffff", button: "#dc2626" } },
  { id: "creativo", label: "Creativo", colors: { primary: "#c026d3", secondary: "#f97316", background: "#fff7fb", text: "#2a1233", card: "#ffffff", button: "#c026d3" } },
];
export const paletteById = (id: PaletteId): (typeof PALETTES)[number] => PALETTES.find((p) => p.id === id) ?? PALETTES[1];

export const FONTS: { id: FontId; label: string; sample: string; css: string }[] = [
  { id: "playfair", label: "Playfair Display", sample: "Elegante y clásica", css: "var(--bf-playfair), Georgia, serif" },
  { id: "lora", label: "Lora", sample: "Serif cálida y legible", css: "var(--bf-lora), Georgia, serif" },
  { id: "poppins", label: "Poppins", sample: "Redondeada y moderna", css: "var(--bf-poppins), system-ui, sans-serif" },
  { id: "montserrat", label: "Montserrat", sample: "Geométrica y potente", css: "var(--bf-montserrat), system-ui, sans-serif" },
  { id: "inter", label: "Inter", sample: "Neutra y muy clara", css: "var(--bf-inter), system-ui, sans-serif" },
  { id: "sistema", label: "Tipografía del sistema", sample: "La más rápida", css: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
];
export const fontCss = (id: FontId): string => (FONTS.find((f) => f.id === id) ?? FONTS[4]).css;

export const HEADERS: { id: HeaderStyle; label: string }[] = [
  { id: "clasica", label: "Clásica" },
  { id: "centrada", label: "Centrada" },
  { id: "minima", label: "Mínima" },
  { id: "dividida", label: "Dividida" },
];
export const HEROES: { id: HeroLayout; label: string }[] = [
  { id: "dividida", label: "Texto e imagen" },
  { id: "centrada", label: "Centrada" },
  { id: "imagen", label: "Imagen de fondo" },
];

export const ACTIONS: { id: ButtonAction; label: string; hint: string }[] = [
  { id: "whatsapp", label: "WhatsApp", hint: "Abre un chat contigo" },
  { id: "call", label: "Llamada", hint: "Llama a tu teléfono" },
  { id: "form", label: "Formulario", hint: "Va al formulario de contacto" },
  { id: "contact", label: "Contacto", hint: "Va a la sección de contacto" },
  { id: "section", label: "Ir a una sección", hint: "Servicios, galería…" },
  { id: "link", label: "Enlace", hint: "Una dirección web (https://…)" },
];
export const POSITIONS: { id: ButtonPosition; label: string }[] = [
  { id: "header", label: "Cabecera" },
  { id: "hero", label: "Primera sección" },
  { id: "afterServices", label: "Después de los servicios" },
  { id: "beforeFooter", label: "Antes del pie" },
  { id: "sticky", label: "Barra fija" },
];

export const INTERESTS: { id: string; label: string }[] = [
  { id: "reservas", label: "Reservas o citas online" },
  { id: "tienda", label: "Tienda online con pagos" },
  { id: "pedidos", label: "Catálogo con pedidos" },
  { id: "whatsapp-auto", label: "WhatsApp automático" },
];

// ── Plantillas ────────────────────────────────────────────────────
interface TemplateDef {
  id: TemplateId;
  label: string;
  hint: string;
  palette: PaletteId;
  fontHeading: FontId;
  fontBody: FontId;
  header: HeaderStyle;
  hero: HeroLayout;
  radius: Radius;
  headingWeight: HeadingWeight;
  gallery: GalleryLayout;
  carousel: CarouselStyle;
  /** secciones activadas por defecto, en orden */
  order: SectionId[];
}

export const TEMPLATES: TemplateDef[] = [
  { id: "elegante", label: "Web elegante", hint: "Serif, tonos cálidos y aire", palette: "elegante", fontHeading: "playfair", fontBody: "lora", header: "centrada", hero: "centrada", radius: "suave", headingWeight: "normal", gallery: "mosaico", carousel: "fundido", order: ["hero", "services", "gallery", "testimonials", "team", "location", "contact"] },
  { id: "moderno", label: "Web moderna", hint: "Limpia, azul y con carácter", palette: "moderno", fontHeading: "poppins", fontBody: "inter", header: "clasica", hero: "dividida", radius: "redondo", headingWeight: "bold", gallery: "cuadricula", carousel: "deslizar", order: ["hero", "services", "carousel", "testimonials", "faq", "contact"] },
  { id: "minimalista", label: "Web minimalista", hint: "Blanco y negro, lo esencial", palette: "minimalista", fontHeading: "inter", fontBody: "inter", header: "minima", hero: "centrada", radius: "recto", headingWeight: "bold", gallery: "columnas", carousel: "miniaturas", order: ["hero", "services", "gallery", "contact"] },
  { id: "servicios", label: "Servicios profesionales", hint: "Confianza, servicios y contacto directo", palette: "moderno", fontHeading: "montserrat", fontBody: "inter", header: "dividida", hero: "dividida", radius: "suave", headingWeight: "bold", gallery: "cuadricula", carousel: "tarjetas", order: ["hero", "services", "testimonials", "faq", "location", "contact"] },
  { id: "restaurante", label: "Web para restaurantes", hint: "Carta, fotos y reservas", palette: "comercial", fontHeading: "playfair", fontBody: "poppins", header: "clasica", hero: "imagen", radius: "suave", headingWeight: "bold", gallery: "mosaico", carousel: "fundido", order: ["hero", "products", "gallery", "testimonials", "location", "contact"] },
  { id: "comercio", label: "Web para comercios", hint: "Productos destacados y horarios", palette: "natural", fontHeading: "poppins", fontBody: "inter", header: "clasica", hero: "dividida", radius: "redondo", headingWeight: "bold", gallery: "cuadricula", carousel: "tarjetas", order: ["hero", "products", "carousel", "services", "location", "contact"] },
  { id: "peluqueria", label: "Peluquerías y estética", hint: "Servicios, trabajos y citas", palette: "creativo", fontHeading: "playfair", fontBody: "poppins", header: "centrada", hero: "dividida", radius: "redondo", headingWeight: "normal", gallery: "mosaico", carousel: "deslizar", order: ["hero", "services", "gallery", "team", "testimonials", "location", "contact"] },
  { id: "profesional", label: "Profesional independiente", hint: "Tu perfil y cómo contratarte", palette: "tecnologico", fontHeading: "montserrat", fontBody: "inter", header: "minima", hero: "centrada", radius: "redondo", headingWeight: "black", gallery: "columnas", carousel: "miniaturas", order: ["hero", "services", "testimonials", "faq", "contact"] },
];
export const templateById = (id: TemplateId): TemplateDef => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[1];

// ── Textos de ejemplo por sector (se muestran como EJEMPLO, no como datos del cliente) ──
export const SAMPLE_BY_SECTOR: Record<SectorId, { name: string; tagline: string; description: string; services: Service[] }> = {
  restaurante: { name: "Tu restaurante", tagline: "Cocina de siempre, en el corazón de tu barrio", description: "Cuenta aquí en pocas frases qué hace especial tu cocina y tu local.", services: [{ name: "Menú del día", price: "", desc: "Platos caseros de temporada" }, { name: "Carta", price: "", desc: "Especialidades de la casa" }, { name: "Reservas", price: "", desc: "Mesas para grupos y celebraciones" }] },
  comercio: { name: "Tu comercio", tagline: "Producto cercano y trato de siempre", description: "Explica qué vendes, qué te diferencia y cómo comprar.", services: [{ name: "Productos destacados", price: "", desc: "Lo mejor de la semana" }, { name: "Pedidos especiales", price: "", desc: "Encargos a medida" }, { name: "Atención personal", price: "", desc: "Te asesoramos en tienda" }] },
  peluqueria: { name: "Tu peluquería", tagline: "Tu mejor versión, con cita previa", description: "Cuenta tu estilo, tu equipo y los servicios que más piden.", services: [{ name: "Corte y peinado", price: "", desc: "Para todo tipo de cabello" }, { name: "Color y mechas", price: "", desc: "Técnicas actuales" }, { name: "Tratamientos", price: "", desc: "Cuidado y brillo" }] },
  clinica: { name: "Tu clínica", tagline: "Cuidamos de ti con cercanía y profesionalidad", description: "Presenta tu equipo, tu forma de trabajar y tus tratamientos.", services: [{ name: "Primera consulta", price: "", desc: "Valoración inicial" }, { name: "Tratamientos", price: "", desc: "Adaptados a cada persona" }, { name: "Seguimiento", price: "", desc: "Acompañamiento continuo" }] },
  taller: { name: "Tu taller", tagline: "Reparamos bien a la primera", description: "Explica qué reparas, tus garantías y cómo pedir presupuesto.", services: [{ name: "Mantenimiento", price: "", desc: "Revisiones y puesta a punto" }, { name: "Reparaciones", price: "", desc: "Diagnóstico y reparación" }, { name: "Presupuesto sin compromiso", price: "", desc: "Rápido y claro" }] },
  servicios: { name: "Tu empresa", tagline: "Soluciones fiables para tu día a día", description: "Resume qué haces, para quién y por qué confiar en ti.", services: [{ name: "Servicio principal", price: "", desc: "Describe en una línea" }, { name: "Servicio complementario", price: "", desc: "Describe en una línea" }, { name: "Asesoramiento", price: "", desc: "Describe en una línea" }] },
  profesional: { name: "Tu nombre", tagline: "Profesional de confianza, cerca de ti", description: "Preséntate: experiencia, forma de trabajar y cómo contactarte.", services: [{ name: "Servicio 1", price: "", desc: "Describe en una línea" }, { name: "Servicio 2", price: "", desc: "Describe en una línea" }, { name: "Servicio 3", price: "", desc: "Describe en una línea" }] },
  otro: { name: "Tu negocio", tagline: "Lo que haces, explicado en una frase", description: "Cuenta en pocas frases qué ofreces y por qué elegirte.", services: [{ name: "Servicio 1", price: "", desc: "Describe en una línea" }, { name: "Servicio 2", price: "", desc: "Describe en una línea" }, { name: "Servicio 3", price: "", desc: "Describe en una línea" }] },
};

// ── Construcción de la configuración inicial ──────────────────────
let seq = 0;
export const newButtonId = (): string => `b${Date.now().toString(36)}${(seq++).toString(36)}`;

export function emptyBusiness(sector: SectorId): Business {
  return { name: "", sector, city: "", tagline: "", description: "", services: [], phone: "", whatsapp: "", email: "", address: "", instagram: "", facebook: "", domain: "", goal: "", hasLogo: false };
}

function defaultButtons(sector: SectorId): BuilderButton[] {
  const label = sector === "restaurante" || sector === "peluqueria" || sector === "clinica" ? "Reservar cita" : "Pedir presupuesto";
  const base = { url: "", target: "services" as SectionId, style: "solido" as ButtonStyle, shape: "redondeado" as ButtonShape, color: "button" };
  return [
    { ...base, id: newButtonId(), label, action: "form", positions: ["hero", "beforeFooter"] },
    { ...base, id: newButtonId(), label: "Escríbenos por WhatsApp", action: "whatsapp", style: "contorno", positions: ["header", "sticky"] },
  ];
}

/** Aplica una plantilla (tema + secciones + galería/carrusel) conservando datos del negocio, imágenes y botones. */
export function applyTemplate(cfg: SiteConfig, id: TemplateId): SiteConfig {
  const t = templateById(id);
  const allowed = sectionsFor(cfg.business.sector);
  const order = t.order.filter((s) => allowed.includes(s));
  const rest = allowed.filter((s) => s !== "header" && s !== "footer" && !order.includes(s));
  const sections: SectionState[] = [
    { id: "header", enabled: true },
    ...order.map((s) => ({ id: s, enabled: true })),
    ...rest.map((s) => ({ id: s, enabled: false })),
    { id: "footer", enabled: true },
  ];
  return {
    ...cfg,
    template: id,
    theme: { ...cfg.theme, palette: t.palette, colors: { ...paletteById(t.palette).colors }, fontHeading: t.fontHeading, fontBody: t.fontBody, header: t.header, hero: t.hero, radius: t.radius, headingWeight: t.headingWeight },
    sections,
    gallery: { ...cfg.gallery, layout: t.gallery },
    carousel: { ...cfg.carousel, style: t.carousel },
  };
}

export function defaultConfig(sector: SectorId = "otro", pageType?: PageTypeId): SiteConfig {
  const s = SECTORS.find((x) => x.id === sector) ?? SECTORS[SECTORS.length - 1];
  const pt = PAGE_TYPES.find((p) => p.id === (pageType ?? s.pageType)) ?? PAGE_TYPES[0];
  const t = templateById(s.template);
  const base: SiteConfig = {
    version: 1,
    template: t.id,
    pageType: pt.id,
    pages: pt.pages,
    business: emptyBusiness(sector),
    theme: { palette: t.palette, colors: { ...paletteById(t.palette).colors }, fontHeading: t.fontHeading, fontBody: t.fontBody, headingScale: "md", headingWeight: t.headingWeight, textSize: "md", radius: t.radius, header: t.header, hero: t.hero },
    sections: [],
    buttons: defaultButtons(sector),
    images: ["s1", "s2", "s3", "s4", "s5", "s6"].map((id, i) => ({ id, kind: "sample" as const, name: `Imagen de ejemplo ${i + 1}` })),
    heroImage: "s1",
    logoImage: null,
    gallery: { layout: t.gallery, ids: ["s2", "s3", "s4", "s5"] },
    carousel: { style: t.carousel, autoplay: true, ids: ["s1", "s3", "s5"] },
    wants: { stella: false, interests: [] },
    comments: "",
  };
  return applyTemplate(base, t.id);
}

/** Cambia el tipo de negocio: ajusta plantilla y secciones disponibles sin perder datos del negocio. */
export function changeSector(cfg: SiteConfig, sector: SectorId): SiteConfig {
  const s = SECTORS.find((x) => x.id === sector) ?? SECTORS[SECTORS.length - 1];
  return applyTemplate({ ...cfg, business: { ...cfg.business, sector }, buttons: cfg.buttons }, s.template);
}

// ── Operaciones sobre secciones y botones ─────────────────────────
export function moveSection(sections: SectionState[], id: SectionId, dir: -1 | 1): SectionState[] {
  const i = sections.findIndex((s) => s.id === id);
  const j = i + dir;
  if (i < 0 || SECTION_DEFS[id].fixed || j < 0 || j >= sections.length) return sections;
  const target = sections[j];
  if (SECTION_DEFS[target.id].fixed) return sections; // la cabecera y el pie no se desplazan
  const next = sections.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Mueve `id` justo antes de `beforeId` (arrastrar y soltar). */
export function reorderSection(sections: SectionState[], id: SectionId, beforeId: SectionId): SectionState[] {
  if (id === beforeId || SECTION_DEFS[id].fixed || SECTION_DEFS[beforeId].fixed === "start") return sections;
  const moving = sections.find((s) => s.id === id);
  if (!moving) return sections;
  const without = sections.filter((s) => s.id !== id);
  const idx = without.findIndex((s) => s.id === beforeId);
  if (idx < 0) return sections;
  without.splice(idx, 0, moving);
  return without;
}

export const toggleSection = (sections: SectionState[], id: SectionId): SectionState[] => sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
export const enabledSections = (cfg: SiteConfig): SectionId[] => cfg.sections.filter((s) => s.enabled).map((s) => s.id);

/** Datos que faltan para que un botón funcione (null = completo). El botón queda «pendiente de configuración». */
export function buttonPending(b: BuilderButton, biz: Business): string | null {
  if (b.action === "whatsapp" && !biz.whatsapp.trim()) return "Falta tu WhatsApp";
  if (b.action === "call" && !biz.phone.trim()) return "Falta tu teléfono";
  if (b.action === "link" && !/^https:\/\/[^\s]+$/i.test(b.url.trim())) return "Falta el enlace (https://…)";
  return null;
}

export function resolveButtonColor(b: BuilderButton, colors: Colors): string {
  if (b.color === "primary") return colors.primary;
  if (b.color === "secondary") return colors.secondary;
  if (b.color === "button") return colors.button;
  return /^#[0-9a-f]{6}$/i.test(b.color) ? b.color : colors.button;
}
