// Resúmenes legibles de una configuración: texto corto para el lead y briefing técnico para construir la web.
import { estimate, euro, KIND_LABEL } from "./estimate";
import {
  ACTIONS, FONTS, HEADERS, HEROES, POSITIONS, SECTION_DEFS, SECTORS, TEMPLATES, PAGE_TYPES, buttonPending, enabledSections,
  type SiteConfig,
} from "./model";

const label = <T extends { id: string; label: string }>(list: readonly T[], id: string): string => list.find((x) => x.id === id)?.label ?? id;

/** Resumen breve (cabe en la ficha del lead, máx. ~1.100 caracteres). */
export function summarize(cfg: SiteConfig, adminUrl?: string): string {
  const est = estimate(cfg);
  const on = enabledSections(cfg).filter((s) => s !== "header" && s !== "footer");
  const uploads = cfg.images.filter((i) => i.kind === "upload").length;
  const lines = [
    `Web: ${label(TEMPLATES, cfg.template)} · ${label(SECTORS, cfg.business.sector)} · ${label(PAGE_TYPES, cfg.pageType)} (${est.pages} páginas)`,
    `Colores: ${cfg.theme.palette === "custom" ? "personalizados" : cfg.theme.palette} (principal ${cfg.theme.colors.primary}, fondo ${cfg.theme.colors.background})`,
    `Tipografías: ${label(FONTS, cfg.theme.fontHeading)} + ${label(FONTS, cfg.theme.fontBody)}`,
    `Secciones: ${on.map((s) => SECTION_DEFS[s].label).join(" → ")}`,
    `Botones (${cfg.buttons.length}): ${cfg.buttons.map((b) => `«${b.label}»`).join(", ") || "ninguno"}`,
    `Imágenes: ${uploads} propias, ${cfg.images.length - uploads} de ejemplo`,
    `Estimación: ${euro(est.definedTotal)} (precio base definido; extras sin valorar)`,
  ];
  if (adminUrl) lines.push(`Ver diseño completo: ${adminUrl}`);
  return lines.join("\n").slice(0, 1180);
}

/** Briefing técnico completo para quien construya la web (va en el campo «prompt» del lead). */
export function techBrief(cfg: SiteConfig): string {
  const b = cfg.business;
  const est = estimate(cfg);
  const out: string[] = [];
  out.push("BRIEFING DE CONSTRUCCIÓN (generado por «Diseña tu web»). Estado: SOLICITUD, pendiente de revisión y presupuesto definitivo.");
  out.push("");
  out.push("== Negocio ==");
  out.push(`Nombre: ${b.name || "(sin indicar)"} · Sector: ${label(SECTORS, b.sector)} · Ciudad: ${b.city || "—"}`);
  out.push(`Titular: ${b.tagline || "—"}`);
  out.push(`Descripción: ${b.description || "—"}`);
  out.push(`Objetivo de la web: ${b.goal || "—"}`);
  out.push(`Contacto: tel ${b.phone || "—"} · WhatsApp ${b.whatsapp || "—"} · email ${b.email || "—"} · dirección ${b.address || "—"}`);
  out.push(`Redes: Instagram ${b.instagram || "—"} · Facebook ${b.facebook || "—"} · Dominio: ${b.domain || "no tiene / sin indicar"} · Logotipo: ${b.hasLogo ? "lo aporta" : "no / sin indicar"}`);
  if (b.services.length) out.push("Servicios: " + b.services.map((s) => `${s.name}${s.price ? ` (${s.price})` : ""}${s.desc ? ` — ${s.desc}` : ""}`).join(" | "));
  out.push("");
  out.push("== Diseño elegido ==");
  out.push(`Plantilla: ${label(TEMPLATES, cfg.template)} · Páginas: ${est.pages}`);
  const c = cfg.theme.colors;
  out.push(`Colores: principal ${c.primary} · secundario ${c.secondary} · fondo ${c.background} · texto ${c.text} · tarjetas ${c.card} · botones ${c.button}`);
  out.push(`Tipografías: títulos ${label(FONTS, cfg.theme.fontHeading)} (${cfg.theme.headingWeight}, escala ${cfg.theme.headingScale}) · texto ${label(FONTS, cfg.theme.fontBody)} (${cfg.theme.textSize})`);
  out.push(`Cabecera: ${label(HEADERS, cfg.theme.header)} · Portada: ${label(HEROES, cfg.theme.hero)} · Esquinas: ${cfg.theme.radius}`);
  out.push("Secciones en orden: " + cfg.sections.map((s) => `${SECTION_DEFS[s.id].label}${s.enabled ? "" : " (desactivada)"}`).join(" → "));
  out.push("Botones:");
  for (const bt of cfg.buttons) {
    const pend = buttonPending(bt, b);
    out.push(`  - «${bt.label}» → ${label(ACTIONS, bt.action)}${bt.action === "link" ? ` ${bt.url || "(sin enlace)"}` : ""}${bt.action === "section" ? ` ${SECTION_DEFS[bt.target].label}` : ""} · ${bt.style}/${bt.shape} · color ${bt.color} · en: ${bt.positions.map((p) => label(POSITIONS, p)).join(", ") || "ninguna posición"}${pend ? ` · PENDIENTE: ${pend}` : ""}`);
  }
  out.push(`Galería: ${cfg.gallery.layout}, ${cfg.gallery.ids.length} imágenes · Carrusel: ${cfg.carousel.style}${cfg.carousel.autoplay ? " con autoavance" : ""}, ${cfg.carousel.ids.length} imágenes`);
  out.push(`Imagen de portada: ${cfg.heroImage ?? "ninguna"} · Imágenes propias: ${cfg.images.filter((i) => i.kind === "upload").map((i) => i.name).join(", ") || "ninguna"}`);
  out.push("");
  out.push("== Presupuesto orientativo (no vinculante) ==");
  for (const l of est.lines) out.push(`  [${KIND_LABEL[l.kind]}] ${l.label}${l.amount !== undefined ? `: ${euro(l.amount)}` : ""}${l.detail ? ` — ${l.detail}` : ""}`);
  out.push(`Precio base definido: ${euro(est.definedTotal)}${est.capped ? " (tope cerrado aplicado)" : ""}`);
  if (cfg.wants.stella) out.push("Quiere Stella (asistente con IA) en su web: presupuestar aparte.");
  if (cfg.comments) out.push(`\nComentarios del cliente: ${cfg.comments}`);
  out.push("\nAviso: imágenes de ejemplo = marcadores. No publicar nada sin revisión y aprobación del cliente.");
  return out.join("\n").slice(0, 7900);
}
