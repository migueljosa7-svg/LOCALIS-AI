"use client";

import { useRef, useState } from "react";
import { Download, FileJson, Monitor, Printer, Smartphone, Tablet } from "lucide-react";
import SitePreview from "@/components/builder/SitePreview";
import { PREVIEW_CSS } from "@/components/builder/previewCss";
import { cn } from "@/lib/utils";
import type { Device, SiteConfig } from "@/lib/builder/model";

const DEVICES: { id: Device; label: string; width: number; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Ordenador", width: 1280, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 820, icon: Tablet },
  { id: "mobile", label: "Móvil", width: 390, icon: Smartphone },
];

async function toDataUri(url: string): Promise<string> {
  try {
    const blob = await (await fetch(url)).blob();
    return await new Promise((ok) => {
      const r = new FileReader();
      r.onload = () => ok(String(r.result));
      r.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

/** Vista del diseño del cliente en el panel: la misma página que ve él, en los tres dispositivos, y exportable. */
export default function DesignViewer({ cfg, uploads, designId, title }: { cfg: SiteConfig; uploads: string[]; designId: string; title: string }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [busy, setBusy] = useState(false);
  const holder = useRef<HTMLDivElement>(null);
  const dev = DEVICES.find((d) => d.id === device)!;
  const imageSrc = (id: string): string | null => (uploads.includes(id) ? `/api/admin/design-image?id=${designId}&u=${id}` : null);
  const scale = device === "desktop" ? 0.62 : device === "tablet" ? 0.8 : 1;

  function download(name: string, mime: string, content: string) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // Informe HTML autónomo: el diseño tal y como se ve, con las imágenes incrustadas (se abre en cualquier navegador).
  async function exportHtml() {
    setBusy(true);
    try {
      const root = holder.current?.querySelector<HTMLElement>(".bp");
      if (!root) return;
      const clone = root.cloneNode(true) as HTMLElement;
      for (const img of Array.from(clone.querySelectorAll("img"))) {
        const s = img.getAttribute("src") ?? "";
        if (s.startsWith("/")) img.setAttribute("src", await toDataUri(s));
      }
      clone.querySelectorAll(".toast,.burger").forEach((n) => n.remove());
      const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Diseño · ${title.replace(/[<>&]/g, "")}</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#e5e7eb}header.rep{padding:16px 24px;background:#0b0f17;color:#e6edf7}header.rep h1{margin:0;font-size:18px}header.rep p{margin:4px 0 0;font-size:13px;opacity:.7}.frame{max-width:1280px;margin:24px auto;background:#fff;box-shadow:0 10px 40px rgba(0,0,0,.25)}${PREVIEW_CSS}</style></head>
<body><header class="rep"><h1>Diseño elegido por el cliente · ${title.replace(/[<>&]/g, "")}</h1><p>Informe generado por LOCALIS AI. Las tipografías se muestran con alternativas del sistema. Solicitud ${designId}.</p></header><div class="frame">${clone.outerHTML}</div></body></html>`;
      download(`diseno-${designId.slice(0, 8)}.html`, "text/html", html);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex rounded-xl border border-white/10 p-0.5" role="group" aria-label="Dispositivo">
          {DEVICES.map((d) => (
            <button key={d.id} type="button" aria-pressed={device === d.id} onClick={() => setDevice(d.id)} className={cn("inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold", device === d.id ? "bg-cyan-400/20 text-cyan-100" : "text-muted hover:text-foreground")}>
              <d.icon size={15} aria-hidden="true" /> {d.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportHtml} disabled={busy} className="btn btn-ghost min-h-[40px] px-3 text-xs disabled:opacity-50">
            <Download size={14} aria-hidden="true" /> {busy ? "Preparando…" : "Descargar informe (HTML)"}
          </button>
          <button type="button" onClick={() => download(`diseno-${designId.slice(0, 8)}.json`, "application/json", JSON.stringify(cfg, null, 2))} className="btn btn-ghost min-h-[40px] px-3 text-xs">
            <FileJson size={14} aria-hidden="true" /> Datos (JSON)
          </button>
          <button type="button" onClick={() => window.print()} className="btn btn-ghost min-h-[40px] px-3 text-xs">
            <Printer size={14} aria-hidden="true" /> Imprimir / PDF
          </button>
        </div>
      </div>
      <div className="mt-3 overflow-auto rounded-2xl border border-white/15 bg-[#05080d] p-3 print:border-0" style={{ maxHeight: "78vh" }}>
        <div className="mx-auto overflow-hidden rounded-xl border border-white/15" style={{ width: dev.width * scale, height: 680 * scale * (device === "mobile" ? 1.15 : 1) }}>
          <div ref={holder} className="overflow-y-auto" style={{ width: dev.width, height: (680 * (device === "mobile" ? 1.15 : 1)), transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <SitePreview cfg={cfg} imageSrc={imageSrc} interactive showExamples />
          </div>
        </div>
      </div>
    </div>
  );
}
