"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { readableOn } from "@/components/configurator/studioModel";
import { PREVIEW_CSS } from "./previewCss";
import { sampleSrc } from "@/lib/builder/images";
import {
  SAMPLE_BY_SECTOR, SECTION_DEFS, buttonPending, fontCss, resolveButtonColor,
  type BuilderButton, type ButtonPosition, type SectionId, type SiteConfig,
} from "@/lib/builder/model";

export interface PreviewProps {
  cfg: SiteConfig;
  /** Origen real de cada imagen: ejemplos generados, archivos subidos (en el editor) o rutas del panel. */
  imageSrc?: (id: string) => string | null;
  /** Si es true, los botones y los enlaces del menú responden (aviso / desplazamiento). */
  interactive?: boolean;
  /** Muestra marcas «ejemplo» en los textos que aún no ha escrito el cliente. */
  showExamples?: boolean;
}

const H1: Record<string, number> = { sm: 36, md: 46, lg: 58 };
const FS: Record<string, string> = { sm: "15px", md: "17px", lg: "19px" };
const FW: Record<string, number> = { normal: 400, bold: 700, black: 900 };
const RADIUS: Record<string, string> = { recto: "0px", suave: "12px", redondo: "24px" };

export default function SitePreview({ cfg, imageSrc, interactive = true, showExamples = true }: PreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const src = (id: string | null): string | null => (id ? (imageSrc?.(id) ?? sampleSrc(id)) : null);
  const biz = cfg.business;
  const sample = SAMPLE_BY_SECTOR[biz.sector];
  const name = biz.name || sample.name;
  const tagline = biz.tagline || sample.tagline;
  const description = biz.description || sample.description;
  const services = biz.services.length ? biz.services : sample.services;
  const exName = !biz.name, exTag = !biz.tagline, exServ = !biz.services.length;

  const c = cfg.theme.colors;
  const vars = {
    "--c-primary": c.primary, "--c-secondary": c.secondary, "--c-bg": c.background, "--c-text": c.text, "--c-card": c.card, "--c-button": c.button,
    "--fh": fontCss(cfg.theme.fontHeading), "--fb": fontCss(cfg.theme.fontBody), "--fw": FW[cfg.theme.headingWeight], "--h1": H1[cfg.theme.headingScale],
    "--fs": FS[cfg.theme.textSize], "--r": RADIUS[cfg.theme.radius],
  } as CSSProperties;

  const enabled = useMemo(() => cfg.sections.filter((s) => s.enabled).map((s) => s.id), [cfg.sections]);
  const on = (id: SectionId) => enabled.includes(id);
  const navItems = enabled.filter((id) => id !== "header" && id !== "footer" && id !== "hero");

  function notify(msg: string) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }
  useEffect(() => () => void (toastTimer.current && window.clearTimeout(toastTimer.current)), []);

  function goTo(id: SectionId) {
    setMenu(false);
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-sec="${id}"]`);
    el?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  function press(b: BuilderButton) {
    if (!interactive) return;
    const pend = buttonPending(b, biz);
    if (b.action === "section") return goTo(b.target);
    if (b.action === "contact" || b.action === "form") return goTo("contact");
    if (pend) return notify(`«${b.label}»: ${pend.toLowerCase()}. Queda como ejemplo.`);
    if (b.action === "whatsapp") return notify(`Aquí se abriría WhatsApp con ${biz.whatsapp}.`);
    if (b.action === "call") return notify(`Aquí se llamaría al ${biz.phone}.`);
    if (b.action === "link") return notify(`Aquí se abriría ${b.url}.`);
  }

  const Btn = ({ b }: { b: BuilderButton }) => {
    const col = resolveButtonColor(b, c);
    const pend = buttonPending(b, biz);
    return (
      <button
        type="button"
        className={`btn s-${b.style} sh-${b.shape}${pend ? " pend" : ""}`}
        style={{ "--bc": col, "--on-bc": readableOn(col) } as CSSProperties}
        onClick={() => press(b)}
        title={pend ?? undefined}
      >
        {b.label}
      </button>
    );
  };
  const btnsAt = (pos: ButtonPosition) => cfg.buttons.filter((b) => b.positions.includes(pos));
  const Strip = ({ pos }: { pos: ButtonPosition }) => {
    const list = btnsAt(pos);
    return list.length ? (
      <div className="strip">
        <div className="wrap">
          <div className="btns row-center" style={{ marginTop: 0 }}>
            {list.map((b) => (
              <Btn key={b.id} b={b} />
            ))}
          </div>
        </div>
      </div>
    ) : null;
  };

  const Head = ({ id, sub }: { id: SectionId; sub?: string }) => (
    <div className="head">
      <h2>{SECTION_DEFS[id].label === "Productos o carta" ? "Nuestros productos" : SECTION_DEFS[id].label === "Opiniones" ? "Lo que dicen de nosotros" : SECTION_DEFS[id].label}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );

  const hero = src(cfg.heroImage);
  const logo = src(cfg.logoImage);
  const gal = cfg.gallery.ids.map(src).filter((x): x is string => !!x);

  const sections: Record<SectionId, React.ReactNode> = {
    header: (
      <header className={`hd h-${cfg.theme.header}`} data-sec="header">
        <div className="wrap">
          <a className="brand" onClick={() => rootRef.current?.scrollTo?.({ top: 0 })}>
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" />
            )}
            <span>{name}</span>
          </a>
          <nav className="nav" aria-label="Menú de la web de ejemplo">
            {navItems.map((id) => (
              <a key={id} onClick={() => interactive && goTo(id)}>
                {SECTION_DEFS[id].label.split(" ")[0]}
              </a>
            ))}
          </nav>
          <div className="hd-actions">
            {btnsAt("header").map((b) => (
              <Btn key={b.id} b={b} />
            ))}
          </div>
          <button type="button" className="burger" aria-label="Abrir menú" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
            ☰
          </button>
        </div>
        <div className={`menu${menu ? " open" : ""}`}>
          {navItems.map((id) => (
            <a key={id} onClick={() => interactive && goTo(id)}>
              {SECTION_DEFS[id].label}
            </a>
          ))}
          {btnsAt("header").length > 0 && (
            <div className="btns">
              {btnsAt("header").map((b) => (
                <Btn key={b.id} b={b} />
              ))}
            </div>
          )}
        </div>
      </header>
    ),
    hero: (
      <section className={`hero l-${cfg.theme.hero}`} data-sec="hero" style={cfg.theme.hero === "imagen" && hero ? { backgroundImage: `url("${hero}")` } : undefined}>
        <div className="wrap">
          <div>
            {showExamples && (exName || exTag) && <span className="tag">Texto de ejemplo</span>}
            <h1 style={{ marginTop: 12 }}>{tagline}</h1>
            <p className="lead">{description}</p>
            {biz.city && <p className="muted" style={{ marginTop: 12 }}>📍 {biz.city}</p>}
            {btnsAt("hero").length > 0 && (
              <div className="btns">
                {btnsAt("hero").map((b) => (
                  <Btn key={b.id} b={b} />
                ))}
              </div>
            )}
          </div>
          {cfg.theme.hero !== "imagen" && hero && (
            <div className="pic">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero} alt="Imagen de portada" />
            </div>
          )}
        </div>
      </section>
    ),
    services: (
      <section data-sec="services">
        <div className="wrap">
          <Head id="services" sub={showExamples && exServ ? "Servicios de ejemplo: los sustituiremos por los tuyos." : undefined} />
          <div className="grid">
            {services.map((s, i) => (
              <div className="card" key={i}>
                <div className="ico">{i + 1}</div>
                <h3>{s.name}</h3>
                {s.price && <div className="price">{s.price}</div>}
                {s.desc && <p>{s.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    products: (
      <section data-sec="products">
        <div className="wrap">
          <Head id="products" sub={showExamples ? "Productos de ejemplo." : undefined} />
          <div className="grid">
            {["s2", "s4", "s6"].map((id, i) => (
              <div className="card prod" key={id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src(id) ?? ""} alt="" />
                <h3>Producto {i + 1}</h3>
                <p>Descripción breve del producto.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    gallery: (
      <section data-sec="gallery">
        <div className="wrap">
          <Head id="gallery" />
          {gal.length ? (
            <div className={`gal g-${cfg.gallery.layout}`}>
              {gal.map((u, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={u} alt={`Foto ${i + 1} de la galería`} />
              ))}
            </div>
          ) : (
            <div className="empty">Añade imágenes a la galería</div>
          )}
        </div>
      </section>
    ),
    carousel: (
      <section data-sec="carousel">
        <div className="wrap">
          <Carousel style={cfg.carousel.style} autoplay={cfg.carousel.autoplay && interactive} images={cfg.carousel.ids.map(src).filter((x): x is string => !!x)} />
        </div>
      </section>
    ),
    testimonials: (
      <section data-sec="testimonials">
        <div className="wrap">
          <Head id="testimonials" sub={showExamples ? "Opiniones de ejemplo: se sustituyen por opiniones reales de tus clientes." : undefined} />
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {[1, 2].map((n) => (
              <div className="card" key={n}>
                <p className="quote">«Aquí irá la opinión de un cliente real, con su permiso.»</p>
                <p className="muted" style={{ marginTop: 12 }}>Cliente {n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    team: (
      <section data-sec="team">
        <div className="wrap">
          <Head id="team" />
          <div className="grid">
            {[1, 2, 3].map((n) => (
              <div className="card" key={n}>
                <div className="avatar">{n}</div>
                <h3>Nombre {n}</h3>
                <p>Cargo o especialidad</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    faq: (
      <section data-sec="faq">
        <div className="wrap faq">
          <Head id="faq" />
          {["¿Cómo puedo pedir cita o presupuesto?", "¿Qué horario tenéis?", "¿Dónde estáis?"].map((q) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>Respuesta de ejemplo: aquí irá la información real de tu negocio.</p>
            </details>
          ))}
        </div>
      </section>
    ),
    location: (
      <section data-sec="location">
        <div className="wrap">
          <Head id="location" />
          <div className="loc">
            <div>
              <h3>{name}</h3>
              <p className="muted" style={{ marginTop: 8 }}>{biz.address || "Tu dirección aparecerá aquí"}{biz.city ? `, ${biz.city}` : ""}</p>
              <p className="muted" style={{ marginTop: 8 }}>El mapa interactivo se añade al construir la web.</p>
            </div>
            <div className="map" role="img" aria-label="Mapa de ejemplo">
              <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <g stroke="currentColor" strokeOpacity=".18" strokeWidth="14" fill="none"><path d="M-10 70 L410 110" /><path d="M120 -10 L160 250" /><path d="M-10 190 L410 150" /><path d="M280 -10 L250 250" /></g>
                <g stroke="currentColor" strokeOpacity=".1" strokeWidth="6" fill="none"><path d="M-10 130 L410 40" /><path d="M60 -10 L30 250" /><path d="M340 -10 L380 250" /></g>
              </svg>
              <span className="pin" aria-hidden="true">📍</span>
            </div>
          </div>
        </div>
      </section>
    ),
    contact: (
      <section data-sec="contact">
        <div className="wrap">
          <Head id="contact" />
          <div className="contact">
            <form className="cf" onSubmit={(e) => { e.preventDefault(); if (interactive) notify("Formulario de ejemplo: en tu web real llegará a tu correo."); }}>
              <input className="in" placeholder="Tu nombre" aria-label="Tu nombre" />
              <input className="in" placeholder="Tu teléfono o email" aria-label="Tu teléfono o email" />
              <textarea className="in" rows={3} placeholder="¿En qué podemos ayudarte?" aria-label="Tu mensaje" />
              <button type="submit" className="btn sh-redondeado" style={{ "--bc": c.button, "--on-bc": readableOn(c.button), borderRadius: "var(--r)" } as CSSProperties}>Enviar mensaje</button>
            </form>
            <div>
              <h3>Hablemos</h3>
              <p className="muted" style={{ marginTop: 8 }}>{biz.phone ? `📞 ${biz.phone}` : "📞 Tu teléfono"}</p>
              <p className="muted">{biz.whatsapp ? `💬 WhatsApp ${biz.whatsapp}` : "💬 Tu WhatsApp"}</p>
              <p className="muted">{biz.email ? `✉️ ${biz.email}` : "✉️ Tu email"}</p>
              {(biz.instagram || biz.facebook) && <p className="muted" style={{ marginTop: 8 }}>{[biz.instagram && `Instagram ${biz.instagram}`, biz.facebook && `Facebook ${biz.facebook}`].filter(Boolean).join(" · ")}</p>}
            </div>
          </div>
        </div>
      </section>
    ),
    footer: (
      <footer className="ft" data-sec="footer">
        <div className="wrap">
          <span>© {new Date().getFullYear()} {name}</span>
          <span className="muted">Aviso legal · Privacidad · Cookies</span>
        </div>
      </footer>
    ),
  };

  // Orden real: lo que el cliente ha decidido. Los botones «después de servicios» y «antes del pie» se intercalan.
  const out: React.ReactNode[] = [];
  let servicesDone = false;
  for (const id of enabled) {
    if (id === "footer") out.push(<Strip key="bf" pos="beforeFooter" />);
    out.push(<div key={id}>{sections[id]}</div>);
    if (id === "services") {
      out.push(<Strip key="as" pos="afterServices" />);
      servicesDone = true;
    }
  }
  if (!servicesDone && on("hero") && btnsAt("afterServices").length) out.splice(1, 0, <Strip key="as" pos="afterServices" />);

  return (
    <div ref={rootRef} className="bp" style={vars} role="region" aria-label="Vista previa de la web (ejemplo)">
      <style>{PREVIEW_CSS}</style>
      {out}
      {btnsAt("sticky").length > 0 && (
        <div className="sticky">
          {btnsAt("sticky").map((b) => (
            <Btn key={b.id} b={b} />
          ))}
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function Carousel({ style, autoplay, images }: { style: string; autoplay: boolean; images: string[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const n = images.length;
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const go = (to: number) => {
    const next = (to + n) % n;
    setI(next);
    if (style === "tarjetas" && trackRef.current) {
      const slide = trackRef.current.children[next] as HTMLElement | undefined;
      slide?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  };
  useEffect(() => {
    if (!autoplay || paused || reduced || n < 2) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % n), 3800);
    return () => window.clearInterval(t);
  }, [autoplay, paused, reduced, n]);

  if (n === 0) return <div className="empty">Añade imágenes al carrusel</div>;
  const cls = `car c-${style}`;
  return (
    <div className={cls} role="region" aria-roledescription="carrusel" aria-label="Carrusel de imágenes" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="view">
        <div className="track" ref={trackRef} style={style === "deslizar" || style === "miniaturas" ? { transform: `translateX(-${i * 100}%)` } : undefined}>
          {images.map((u, k) => (
            <div key={k} className={`slide${k === i ? " on" : ""}`} aria-hidden={style !== "tarjetas" && k !== i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`Imagen ${k + 1} de ${n}`} />
            </div>
          ))}
        </div>
      </div>
      {n > 1 && style !== "tarjetas" && (
        <>
          <button type="button" className="nb prev" aria-label="Imagen anterior" onClick={() => go(i - 1)}>‹</button>
          <button type="button" className="nb next" aria-label="Imagen siguiente" onClick={() => go(i + 1)}>›</button>
        </>
      )}
      {n > 1 && style === "tarjetas" && (
        <>
          <button type="button" className="nb prev" aria-label="Imágenes anteriores" onClick={() => go(i - 1)}>‹</button>
          <button type="button" className="nb next" aria-label="Imágenes siguientes" onClick={() => go(i + 1)}>›</button>
        </>
      )}
      {style === "miniaturas" ? (
        <div className="thumbs">
          {images.map((u, k) => (
            <button type="button" key={k} aria-label={`Ver imagen ${k + 1}`} aria-current={k === i} onClick={() => go(k)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" />
            </button>
          ))}
        </div>
      ) : (
        <div className="dots">
          {images.map((_, k) => (
            <button type="button" key={k} aria-label={`Ir a la imagen ${k + 1}`} aria-current={k === i} onClick={() => go(k)} />
          ))}
        </div>
      )}
    </div>
  );
}
