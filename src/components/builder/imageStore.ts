"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sampleSrc } from "@/lib/builder/images";
import { LIMITS, MAX_FILE_BYTES, MAX_TOTAL_BYTES } from "@/lib/builder/validate";

export interface UploadItem {
  id: string;
  name: string;
  blob: Blob;
  url: string;
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_RAW = 15 * 1024 * 1024;

/** Reduce la imagen en el navegador (máx. 1600 px) hasta que pese poco: así cabe en la petición y carga rápido. */
export async function compressImage(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file); // si no es una imagen real, falla aquí
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  const toBlob = (type: string, q: number) => new Promise<Blob | null>((ok) => canvas.toBlob(ok, type, q));
  for (const q of [0.85, 0.75, 0.65, 0.55, 0.45]) {
    const webp = await toBlob("image/webp", q);
    const out = webp && webp.type === "image/webp" ? webp : await toBlob("image/jpeg", q);
    if (out && out.size <= MAX_FILE_BYTES) return out;
  }
  throw new Error("size");
}

/** Biblioteca de imágenes propias del cliente (viven en el navegador hasta enviar la solicitud). */
export function useImageStore() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const total = items.reduce((a, i) => a + i.blob.size, 0);

  const add = useCallback(
    async (files: File[]): Promise<{ added: UploadItem[]; errors: string[] }> => {
      const errors: string[] = [];
      const added: UploadItem[] = [];
      let used = items.map((i) => i.id);
      let bytes = total;
      for (const f of files) {
        if (used.length >= LIMITS.maxUploads) {
          errors.push(`Máximo ${LIMITS.maxUploads} imágenes propias. Las demás las podrás enviar después por WhatsApp o email.`);
          break;
        }
        if (!ALLOWED.includes(f.type)) {
          errors.push(`«${f.name}»: solo se admiten imágenes JPG, PNG o WebP.`);
          continue;
        }
        if (f.size > MAX_RAW) {
          errors.push(`«${f.name}» pesa demasiado (máx. 15 MB).`);
          continue;
        }
        try {
          const blob = await compressImage(f);
          if (bytes + blob.size > MAX_TOTAL_BYTES) {
            errors.push(`«${f.name}»: el conjunto de imágenes supera el límite. Quita alguna o envíala después.`);
            continue;
          }
          const id = ["u1", "u2", "u3", "u4", "u5"].find((x) => !used.includes(x))!;
          const url = URL.createObjectURL(blob);
          urls.current.push(url);
          used = [...used, id];
          bytes += blob.size;
          added.push({ id, name: f.name.slice(0, 80), blob, url });
        } catch {
          errors.push(`«${f.name}» no se ha podido procesar (¿está dañada o es demasiado grande?).`);
        }
      }
      if (added.length) setItems((prev) => [...prev, ...added]);
      return { added, errors };
    },
    [items, total]
  );

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const reset = useCallback(() => setItems([]), []);
  const src = useCallback((id: string): string | null => items.find((i) => i.id === id)?.url ?? sampleSrc(id), [items]);

  return { items, add, remove, reset, src, total };
}
export type ImageStore = ReturnType<typeof useImageStore>;
