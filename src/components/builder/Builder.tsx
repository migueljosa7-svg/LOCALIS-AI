"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, Monitor, Pencil, RotateCcw, Smartphone, Tablet } from "lucide-react";
import SitePreview from "./SitePreview";
import { ColorsStep, TemplateStep, TypeStep } from "./StepsDesign";
import { ButtonsStep, ImagesStep, SectionsStep } from "./StepsContent";
import { BusinessStep, ReviewStep, StartScreen, type ContactForm, type SubmitState } from "./StepsInfo";
import { useImageStore } from "./imageStore";
import { estimate, euro } from "@/lib/builder/estimate";
import { sanitizeConfig } from "@/lib/builder/validate";
import { cn } from "@/lib/utils";
import { defaultConfig, type Device, type SiteConfig } from "@/lib/builder/model";

const STEPS = [
  { id: "plantilla", label: "Plantilla" },
  { id: "colores", label: "Colores" },
  { id: "letras", label: "Letras y estilo" },
  { id: "secciones", label: "Secciones" },
  { id: "botones", label: "Botones" },
  { id: "imagenes", label: "Imágenes" },
  { id: "negocio", label: "Tu negocio" },
  { id: "enviar", label: "Enviar" },
] as const;

const DEVICES: { id: Device; label: string; width: number; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Ordenador", width: 1280, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 820, icon: Tablet },
  { id: "mobile", label: "Móvil", width: 390, icon: Smartphone },
];

const DRAFT_KEY = "localis-builder-draft-v1";

/** Ajusta el dispositivo simulado al espacio disponible (escala sin cambiar su ancho de diseño). */
function useFit(width: number) {
  // Referencia por callback: el contenedor aparece solo después de la pantalla de inicio.
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [el]);
  const scale = box.w ? Math.min(1, box.w / width) : 1;
  return { ref: setEl, scale, box };
}

export default function Builder() {
  const [cfg, setCfg] = useState<SiteConfig>(() => defaultConfig("otro"));
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [device, setDevice] = useState<Device>("desktop");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [confirmReset, setConfirmReset] = useState(false);
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle", error: null, reference: null });
  const store = useImageStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  // Recupera el borrador (sin imágenes propias: viven solo en el navegador de esa sesión).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { cfg?: unknown; step?: number; started?: boolean };
        const clean = sanitizeConfig(d.cfg);
        if (clean) {
          setCfg(clean);
          setStarted(!!d.started);
          setStep(Math.min(STEPS.length - 1, Math.max(0, Number(d.step) || 0)));
        }
      }
    } catch {}
    loaded.current = true;
    // Pantalla pequeña: el dispositivo simulado por defecto es el móvil.
    if (window.matchMedia("(max-width: 700px)").matches) setDevice("mobile");
    else if (window.matchMedia("(max-width: 1100px)").matches) setDevice("tablet");
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    if (submit.status === "done") {
      // Solicitud enviada: el borrador ya no hace falta (y no debe volver a guardarse).
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      return;
    }
    const t = window.setTimeout(() => {
      try {
        const noUploads: SiteConfig = { ...cfg, images: cfg.images.filter((i) => i.kind === "sample"), heroImage: cfg.heroImage && /^s\d/.test(cfg.heroImage) ? cfg.heroImage : null, logoImage: null };
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ cfg: noUploads, step, started }));
      } catch {}
    }, 400);
    return () => window.clearTimeout(t);
  }, [cfg, step, started, submit.status]);

  const set = useCallback((fn: (c: SiteConfig) => SiteConfig) => setCfg((c) => fn(c)), []);
  const est = useMemo(() => estimate(cfg), [cfg]);
  const dev = DEVICES.find((d) => d.id === device)!;
  const fit = useFit(dev.width);

  function go(n: number) {
    setStep(n);
    editorRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }

  function reset() {
    setCfg(defaultConfig(cfg.business.sector));
    store.reset();
    setStep(0);
    setConfirmReset(false);
    setSubmit({ status: "idle", error: null, reference: null });
  }

  async function sendRequest(form: ContactForm) {
    setSubmit({ status: "sending", error: null, reference: null });
    try {
      const fd = new FormData();
      fd.set("config", JSON.stringify(cfg));
      fd.set("contact", JSON.stringify({ businessName: form.businessName, contactName: form.contactName, phone: form.phone, email: form.email, consent: form.consent, website: form.website }));
      for (const it of store.items) if (cfg.images.some((i) => i.id === it.id)) fd.set(`file_${it.id}`, new File([it.blob], `${it.id}`, { type: it.blob.type }));
      const res = await fetch("/api/design/request", { method: "POST", body: fd, signal: AbortSignal.timeout(90_000) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; reference?: string };
      if (!res.ok || !data.ok) {
        setSubmit({ status: "idle", error: data.error || "No hemos podido enviar tu diseño. Inténtalo de nuevo o escríbenos por WhatsApp.", reference: null });
        return;
      }
      setSubmit({ status: "done", error: null, reference: data.reference ?? null });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
    } catch {
      setSubmit({ status: "idle", error: "No hay conexión o ha tardado demasiado. Inténtalo de nuevo o escríbenos por WhatsApp.", reference: null });
    }
  }

  // Al pasar a diseñar: arriba del todo (si no, el editor queda medio tapado por la cabecera) y sin botones flotantes encima.
  useEffect(() => {
    const el = document.documentElement;
    if (started) {
      el.setAttribute("data-builder-editing", "");
      window.scrollTo({ top: 0, behavior: "instant" });
    } else el.removeAttribute("data-builder-editing");
    return () => el.removeAttribute("data-builder-editing");
  }, [started]);

  // ── Pantalla de inicio ──
  if (!started) {
    return (
      <div className="bg-background text-foreground">
        <StartScreen cfg={cfg} set={set} onStart={() => { setStarted(true); setStep(0); }} />
      </div>
    );
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const stepProps = { cfg, set };
  const content = (() => {
    switch (STEPS[step].id) {
      case "plantilla": return <TemplateStep {...stepProps} />;
      case "colores": return <ColorsStep {...stepProps} />;
      case "letras": return <TypeStep {...stepProps} />;
      case "secciones": return <SectionsStep {...stepProps} />;
      case "botones": return <ButtonsStep {...stepProps} />;
      case "imagenes": return <ImagesStep {...stepProps} store={store} />;
      case "negocio": return <BusinessStep {...stepProps} store={store} />;
      default: return <ReviewStep cfg={cfg} store={store} submit={sendRequest} state={submit} />;
    }
  })();

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[560px] flex-col bg-background text-foreground">
      <TopBar>
        <button type="button" onClick={() => go(STEPS.length - 1)} className="hidden min-h-[40px] rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 text-xs font-semibold text-emerald-200 sm:inline-flex sm:items-center" aria-label={`Estimación: ${euro(est.definedTotal)}. Ir a revisar y enviar`}>
          Desde {euro(est.definedTotal)} <span className="ml-1 font-normal text-emerald-200/70">orientativo</span>
        </button>
        {confirmReset ? (
          <span className="flex items-center gap-2 text-xs">
            ¿Restablecer todo?
            <button type="button" onClick={reset} className="min-h-[40px] rounded-lg bg-red-500/20 px-3 font-semibold text-red-100">Sí</button>
            <button type="button" onClick={() => setConfirmReset(false)} className="min-h-[40px] rounded-lg border border-white/10 px-3">No</button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs text-muted hover:text-foreground">
            <RotateCcw size={14} aria-hidden="true" /> <span className="hidden sm:inline">Restablecer</span>
          </button>
        )}
      </TopBar>

      {/* Progreso */}
      <div className="border-b border-white/10 px-4 py-2.5">
        <div className="mx-auto flex max-w-[1800px] items-center gap-3">
          <p className="shrink-0 text-sm font-semibold">
            Paso {step + 1} de {STEPS.length}<span className="hidden sm:inline"> · {STEPS[step].label}</span>
          </p>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progreso del diseño">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cobalt-500 transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex rounded-xl border border-white/10 p-0.5 lg:hidden" role="tablist" aria-label="Editar o ver la vista previa">
            {([["edit", "Editar", Pencil], ["preview", "Vista previa", Eye]] as const).map(([id, label, Icon]) => (
              <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => setView(id)} className={cn("inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold", view === id ? "bg-cyan-400/20 text-cyan-100" : "text-muted")}>
                <Icon size={14} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        </div>
        <ol className="mx-auto mt-2 hidden max-w-[1800px] gap-1 lg:flex" aria-label="Pasos">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex-1">
              <button type="button" onClick={() => go(i)} aria-current={i === step ? "step" : undefined} className={cn("min-h-[36px] w-full rounded-lg px-2 text-xs font-medium transition-colors", i === step ? "bg-cyan-400/15 text-cyan-100" : i < step ? "text-foreground/80 hover:bg-white/5" : "text-muted hover:bg-white/5")}>
                {i + 1}. {s.label}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto grid min-h-0 w-full max-w-[1800px] flex-1 lg:grid-cols-[minmax(380px,460px)_1fr]">
        {/* Editor */}
        <div className={cn("min-h-0 flex-col border-white/10 lg:flex lg:border-r", view === "edit" ? "flex" : "hidden")}>
          <div ref={editorRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
            {content}
            {STEPS[step].id !== "enviar" && (
              <div className="mt-8 rounded-2xl border border-white/10 p-3 text-xs text-muted">
                Resumen: {cfg.sections.filter((s) => s.enabled).length - 2} secciones · {cfg.buttons.length} botones · {cfg.pages} páginas · estimación orientativa {euro(est.definedTotal)}.
              </div>
            )}
          </div>
          <div className="flex gap-3 border-t border-white/10 bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6">
            <button type="button" onClick={() => (step === 0 ? setStarted(false) : go(step - 1))} className="btn btn-ghost min-h-[48px] flex-1 sm:flex-none sm:px-6">
              <ArrowLeft size={17} aria-hidden="true" /> Atrás
            </button>
            {step < STEPS.length - 1 && (
              <button type="button" onClick={() => go(step + 1)} className="btn btn-primary min-h-[48px] flex-[2] sm:flex-none sm:px-8">
                Siguiente <ArrowRight size={17} aria-hidden="true" />
              </button>
            )}
            {step < STEPS.length - 1 && (
              <button type="button" onClick={() => setView("preview")} className="btn btn-ghost min-h-[48px] px-4 lg:hidden" aria-label="Ver la vista previa">
                <Eye size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Vista previa */}
        <div className={cn("min-h-0 min-w-0 flex-col bg-[#05080d] lg:flex", view === "preview" ? "flex" : "hidden")}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
            <div className="flex rounded-xl border border-white/10 p-0.5" role="group" aria-label="Dispositivo de la vista previa">
              {DEVICES.map((d) => (
                <button key={d.id} type="button" aria-pressed={device === d.id} onClick={() => setDevice(d.id)} className={cn("inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold", device === d.id ? "bg-cyan-400/20 text-cyan-100" : "text-muted hover:text-foreground")}>
                  <d.icon size={15} aria-hidden="true" /> {d.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted">Vista previa en directo · pulsa los botones y el menú para probarlos</p>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden" data-testid="preview-area">
            <div ref={fit.ref} className="absolute inset-3 sm:inset-4">
              <div className="mx-auto overflow-hidden rounded-2xl border border-white/15 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]" style={{ width: dev.width * fit.scale, height: fit.box.h }}>
                <div className="overflow-y-auto overscroll-contain" data-testid="preview-scroll" style={{ width: dev.width, height: fit.box.h / fit.scale, transform: `scale(${fit.scale})`, transformOrigin: "top left" }}>
                  <SitePreview cfg={cfg} imageSrc={store.src} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Barra de herramientas del editor (precio, restablecer…). La cabecera con el menú es la común de la web (Header). */
function TopBar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2">
      <p className="text-sm font-semibold">Tu diseño</p>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  );
}
