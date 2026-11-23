import "server-only";
// Acceso del configurador a Supabase: solicitudes de diseño e imágenes (almacén privado). Solo servidor.
import { authHeaders, rest } from "@/lib/db";
import type { SiteConfig } from "./model";

export const DESIGN_STAGES = ["recibida", "en_revision", "presupuesto_enviado", "aceptada", "en_construccion", "entregada", "descartada"] as const;
export type DesignStage = (typeof DESIGN_STAGES)[number];
export const STAGE_LABEL: Record<DesignStage, string> = {
  recibida: "Recibida",
  en_revision: "En revisión",
  presupuesto_enviado: "Presupuesto enviado",
  aceptada: "Aceptada por el cliente",
  en_construccion: "En construcción",
  entregada: "Entregada",
  descartada: "Descartada",
};

export interface UploadMeta {
  id: string;
  name: string;
  path: string;
  mime: string;
  bytes: number;
}

export interface DesignRow {
  id: string;
  created_at: string;
  lead_id: string | null;
  stage: DesignStage;
  config: SiteConfig;
  uploads: UploadMeta[];
  notes: string | null;
}

const BUCKET = "design-uploads";

function storageCfg() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

/** Sube una imagen al almacén privado. Devuelve true si quedó guardada. */
export async function uploadImage(path: string, bytes: Uint8Array, mime: string): Promise<boolean> {
  const cfg = storageCfg();
  if (!cfg) return false;
  try {
    const res = await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`, {
      method: "POST",
      headers: { ...authHeaders(cfg.key), "Content-Type": mime, "x-upsert": "false" },
      body: bytes as unknown as BodyInit,
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!res.ok) console.error(`[design] subida de imagen → ${res.status}`);
    return res.ok;
  } catch (e) {
    console.error("[design] subida de imagen falló:", e instanceof Error ? e.name : "error");
    return false;
  }
}

export async function downloadImage(path: string): Promise<{ body: ArrayBuffer } | null> {
  const cfg = storageCfg();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`, {
      headers: authHeaders(cfg.key),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    return res.ok ? { body: await res.arrayBuffer() } : null;
  } catch {
    return null;
  }
}

export async function countRecentByIp(ipHash: string, minutes: number): Promise<number | null> {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const r = await rest<{ id: string }[]>(`design_requests?select=id&ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${encodeURIComponent(since)}&limit=50`);
  return r.ok ? r.data.length : null;
}

export async function insertDesign(row: { id: string; config: SiteConfig; uploads: UploadMeta[]; ipHash: string }) {
  return rest("design_requests", { method: "POST", body: JSON.stringify({ id: row.id, config: row.config, uploads: row.uploads, ip_hash: row.ipHash }) });
}

export async function linkLead(id: string, leadId: string) {
  return rest(`design_requests?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ lead_id: leadId, updated_at: new Date().toISOString() }) });
}

export async function getDesign(id: string) {
  const r = await rest<DesignRow[]>(`design_requests?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return r.ok ? { ok: true as const, row: r.data[0] ?? null } : { ok: false as const, message: r.message ?? r.reason };
}

export async function updateStage(id: string, stage: DesignStage, notes: string) {
  return rest(`design_requests?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ stage, notes: notes.slice(0, 4000), updated_at: new Date().toISOString() }) });
}

export async function listDesigns(limit = 100) {
  return rest<Pick<DesignRow, "id" | "created_at" | "stage" | "lead_id">[]>(`design_requests?select=id,created_at,stage,lead_id&order=created_at.desc&limit=${limit}`);
}
