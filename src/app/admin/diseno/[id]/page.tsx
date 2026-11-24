import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DesignViewer from "./DesignViewer";
import { updateDesignAction } from "../actions";
import { rest, type LeadRow } from "@/lib/db";
import { DESIGN_STAGES, STAGE_LABEL, getDesign } from "@/lib/builder/store";
import { builderFontClass } from "@/lib/builder/fonts";
import { estimate, euro, KIND_LABEL } from "@/lib/builder/estimate";
import {
  ACTIONS, FONTS, HEADERS, HEROES, INTERESTS, POSITIONS, SECTION_DEFS, SECTORS, TEMPLATES, buttonPending,
} from "@/lib/builder/model";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Diseño del cliente", robots: { index: false, follow: false } };

const lab = <T extends { id: string; label: string }>(l: readonly T[], id: string) => l.find((x) => x.id === id)?.label ?? id;
const fmt = (iso: string) => new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function DesignPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aviso?: string }> }) {
  const { id } = await params;
  const { aviso } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const d = await getDesign(id);
  if (!d.ok) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          No se pudo leer la solicitud ({d.message}). ¿Has ejecutado <code>supabase/configurador.sql</code>? Mira la guía B.
        </p>
      </main>
    );
  }
  if (!d.row) notFound();
  const row = d.row;
  const cfg = row.config;
  const b = cfg.business;
  const leadRes = row.lead_id ? await rest<LeadRow[]>(`leads?select=*&id=eq.${encodeURIComponent(row.lead_id)}&limit=1`) : null;
  const lead = leadRes?.ok ? leadRes.data[0] : null;
  const est = estimate(cfg);
  const swatches = [["Principal", cfg.theme.colors.primary], ["Secundario", cfg.theme.colors.secondary], ["Fondo", cfg.theme.colors.background], ["Textos", cfg.theme.colors.text], ["Tarjetas", cfg.theme.colors.card], ["Botones", cfg.theme.colors.button]] as const;
  const title = b.name || lead?.business_name || "Cliente";

  return (
    <main className={`mx-auto max-w-7xl space-y-8 px-4 py-10 ${builderFontClass}`}>
      <p className="text-sm print:hidden">
        <Link href="/admin/diseno" className="text-cyan-300 underline">← Diseños de clientes</Link> · <Link href="/admin" className="text-cyan-300 underline">Resumen</Link>
      </p>
      {aviso && <p role="status" className={"rounded-xl border px-4 py-3 text-sm " + (aviso === "guardado" ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100" : "border-amber-400/40 bg-amber-500/10 text-amber-100")}>{aviso === "guardado" ? "Cambios guardados." : "No se pudo guardar."}</p>}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="text-sm text-muted">Solicitud del {fmt(row.created_at)} · {lab(SECTORS, b.sector)} · plantilla {lab(TEMPLATES, cfg.template)}</p>
          {lead && (
            <p className="mt-2 text-sm">
              {lead.contact_name} · <a className="text-cyan-300 underline" href={`tel:${lead.phone.replace(/\s/g, "")}`}>{lead.phone}</a> · <a className="text-cyan-300 underline" href={`mailto:${lead.email}`}>{lead.email}</a>
            </p>
          )}
        </div>
        <form action={updateDesignAction} className="w-full max-w-sm space-y-2 rounded-2xl border border-white/10 p-4 print:hidden">
          <input type="hidden" name="id" value={row.id} />
          <label className="block text-sm font-semibold" htmlFor="stage">Fase de la solicitud</label>
          <select id="stage" name="stage" defaultValue={row.stage} className="min-h-[44px] w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-base">
            {DESIGN_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
          </select>
          <label className="block text-sm font-semibold" htmlFor="notes">Notas internas</label>
          <textarea id="notes" name="notes" rows={3} defaultValue={row.notes ?? ""} maxLength={4000} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-base" />
          <button type="submit" className="btn btn-primary min-h-[44px] w-full">Guardar fase y notas</button>
        </form>
      </header>

      <section aria-labelledby="vista-h">
        <h2 id="vista-h" className="mb-3 font-display text-xl font-bold">Así quiere su web</h2>
        <DesignViewer cfg={cfg} uploads={row.uploads.map((u) => u.id)} designId={row.id} title={title} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-white/10 p-4" aria-labelledby="dis-h">
          <h2 id="dis-h" className="font-display text-lg font-bold">Decisiones de diseño</h2>
          <div className="flex flex-wrap gap-2">
            {swatches.map(([n, h]) => (
              <span key={n} className="flex items-center gap-2 rounded-lg border border-white/10 px-2 py-1 text-xs"><span className="inline-block h-5 w-5 rounded border border-white/20" style={{ background: h }} />{n} <code className="text-muted">{h}</code></span>
            ))}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-muted">Paleta</dt><dd>{cfg.theme.palette === "custom" ? "Personalizada" : cfg.theme.palette}</dd>
            <dt className="text-muted">Títulos</dt><dd>{lab(FONTS, cfg.theme.fontHeading)} · {cfg.theme.headingWeight} · escala {cfg.theme.headingScale}</dd>
            <dt className="text-muted">Textos</dt><dd>{lab(FONTS, cfg.theme.fontBody)} · {cfg.theme.textSize}</dd>
            <dt className="text-muted">Cabecera / portada</dt><dd>{lab(HEADERS, cfg.theme.header)} / {lab(HEROES, cfg.theme.hero)}</dd>
            <dt className="text-muted">Esquinas</dt><dd>{cfg.theme.radius}</dd>
            <dt className="text-muted">Páginas</dt><dd>{cfg.pages}</dd>
            <dt className="text-muted">Galería</dt><dd>{cfg.gallery.layout} · {cfg.gallery.ids.length} imágenes</dd>
            <dt className="text-muted">Carrusel</dt><dd>{cfg.carousel.style}{cfg.carousel.autoplay ? " · automático" : ""} · {cfg.carousel.ids.length} imágenes</dd>
          </dl>
          <h3 className="pt-2 text-sm font-semibold">Secciones, en el orden elegido</h3>
          <ol className="list-decimal space-y-0.5 pl-5 text-sm">
            {cfg.sections.map((s) => <li key={s.id} className={s.enabled ? "" : "text-muted line-through"}>{SECTION_DEFS[s.id].label}{!s.enabled && " (desactivada)"}</li>)}
          </ol>
          <h3 className="pt-2 text-sm font-semibold">Botones</h3>
          <ul className="space-y-1.5 text-sm">
            {cfg.buttons.map((bt) => {
              const p = buttonPending(bt, b);
              return (
                <li key={bt.id} className="rounded-lg border border-white/10 p-2">
                  <strong>«{bt.label}»</strong> → {lab(ACTIONS, bt.action)}{bt.action === "link" && bt.url ? ` (${bt.url})` : ""}{bt.action === "section" ? ` (${SECTION_DEFS[bt.target].label})` : ""}
                  <span className="block text-xs text-muted">{bt.style} · {bt.shape} · color {bt.color} · en: {bt.positions.map((x) => lab(POSITIONS, x)).join(", ") || "ninguna posición"}</span>
                  {p && <span className="block text-xs text-amber-200">Pendiente de configuración: {p}</span>}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-white/10 p-4" aria-labelledby="neg-h">
          <h2 id="neg-h" className="font-display text-lg font-bold">Su negocio</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            {([["Nombre", b.name], ["Ciudad", b.city], ["Frase principal", b.tagline], ["Descripción", b.description], ["Objetivo", b.goal], ["Teléfono", b.phone], ["WhatsApp", b.whatsapp], ["Email", b.email], ["Dirección", b.address], ["Instagram", b.instagram], ["Facebook", b.facebook], ["Dominio", b.domain]] as const).map(([k, v]) => (
              <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd className="break-words">{v || <span className="text-muted">—</span>}</dd></div>
            ))}
            <dt className="text-muted">Logotipo</dt><dd>{b.hasLogo ? "Lo aporta" : "No / sin indicar"}</dd>
          </dl>
          {b.services.length > 0 && (<><h3 className="text-sm font-semibold">Servicios</h3><ul className="list-disc pl-5 text-sm">{b.services.map((s, i) => <li key={i}>{s.name}{s.price && ` · ${s.price}`}{s.desc && ` — ${s.desc}`}</li>)}</ul></>)}
          <p className="text-sm"><span className="text-muted">Quiere Stella:</span> {cfg.wants.stella ? "Sí (presupuestar aparte)" : "No"}</p>
          {cfg.wants.interests.length > 0 && <p className="text-sm"><span className="text-muted">Le interesa cuando exista:</span> {cfg.wants.interests.map((i) => INTERESTS.find((x) => x.id === i)?.label ?? i).join(", ")}</p>}
          {cfg.comments && <p className="rounded-lg border border-white/10 p-2 text-sm"><span className="text-muted">Comentarios:</span> {cfg.comments}</p>}
          <h3 className="pt-1 text-sm font-semibold">Imágenes propias ({row.uploads.length})</h3>
          {row.uploads.length === 0 ? <p className="text-sm text-muted">No ha subido ninguna.</p> : (
            <ul className="grid grid-cols-3 gap-2">
              {row.uploads.map((u) => (
                <li key={u.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/admin/design-image?id=${row.id}&u=${u.id}`} alt={u.name} className="aspect-[4/3] w-full rounded-lg object-cover" />
                  <p className="truncate text-xs text-muted">{u.name} · {Math.round(u.bytes / 1024)} KB</p>
                </li>
              ))}
            </ul>
          )}
          <h3 className="pt-1 text-sm font-semibold">Estimación orientativa: {est.packName}, {est.priceLabel}</h3>
          <ul className="space-y-1 text-sm">
            {est.lines.map((l, i) => <li key={i}><span className="mr-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px]">{KIND_LABEL[l.kind]}</span>{l.label}{l.amount !== undefined && ` · ${l.amount > 0 ? "+" : ""}${euro(l.amount)}`}{l.detail && <span className="block text-xs text-muted">{l.detail}</span>}</li>)}
          </ul>
        </section>
      </div>
    </main>
  );
}
