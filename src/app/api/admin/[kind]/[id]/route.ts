import { NextResponse } from "next/server";
import { LEAD_STATUSES, OPP_STATUSES, updateLead, updateOpportunity, type LeadStatus, type OppStatus } from "@/lib/db";

// Actualiza estado / notas de un lead o una oportunidad. Protegido por src/middleware.ts.
// Además, solo acepta peticiones del propio dominio (defensa contra CSRF).
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: Request, ctx: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await ctx.params;
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  let originHost = "";
  try {
    originHost = new URL(origin ?? "").host; // un Origin malformado o «null» se rechaza (antes provocaba un error 500)
  } catch {}
  if (!origin || !host || originHost !== host) {
    return NextResponse.json({ ok: false, error: "Origen no permitido." }, { status: 403 });
  }
  if (!UUID.test(id) || (kind !== "leads" && kind !== "opportunities")) {
    return NextResponse.json({ ok: false, error: "Petición no válida." }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { status?: string; notes?: string };
  const notes = typeof body.notes === "string" ? body.notes.slice(0, 4000) : undefined;

  if (kind === "leads") {
    if (body.status !== undefined && !LEAD_STATUSES.includes(body.status as LeadStatus)) {
      return NextResponse.json({ ok: false, error: "Estado no válido." }, { status: 400 });
    }
    const r = await updateLead(id, { status: body.status as LeadStatus | undefined, notes });
    return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ ok: false, error: "No se pudo guardar." }, { status: 502 });
  }

  if (body.status !== undefined && !OPP_STATUSES.includes(body.status as OppStatus)) {
    return NextResponse.json({ ok: false, error: "Estado no válido." }, { status: 400 });
  }
  const r = await updateOpportunity(id, { status: body.status as OppStatus | undefined, notes });
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ ok: false, error: "No se pudo guardar." }, { status: 502 });
}
