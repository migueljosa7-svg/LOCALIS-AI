"use server";

import { redirect } from "next/navigation";
import { DESIGN_STAGES, updateStage, type DesignStage } from "@/lib/builder/store";

// Cambia la fase de una solicitud de diseño. Protegido por el middleware de /admin (usuario y contraseña).
export async function updateDesignAction(form: FormData): Promise<void> {
  const id = String(form.get("id") ?? "");
  const stage = String(form.get("stage") ?? "");
  const notes = String(form.get("notes") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !(DESIGN_STAGES as readonly string[]).includes(stage)) redirect("/admin/diseno");
  const r = await updateStage(id, stage as DesignStage, notes);
  redirect(`/admin/diseno/${id}?aviso=${r.ok ? "guardado" : "error"}`);
}
