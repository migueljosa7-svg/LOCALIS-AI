import { NextResponse } from "next/server";
import { downloadImage, getDesign } from "@/lib/builder/store";

// Sirve al panel (protegido por el middleware de /api/admin) las imágenes que subieron los clientes.
// Nunca son públicas: el almacén es privado y esta ruta exige usuario y contraseña.
export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("id") ?? "";
  const img = u.searchParams.get("u") ?? "";
  if (!UUID.test(id) || !/^u[1-5]$/.test(img)) return new NextResponse("Petición no válida", { status: 400 });
  const d = await getDesign(id);
  const meta = d.ok ? d.row?.uploads.find((x) => x.id === img) : null;
  if (!meta) return new NextResponse("No encontrada", { status: 404 });
  const file = await downloadImage(meta.path);
  if (!file) return new NextResponse("No disponible", { status: 502 });
  return new NextResponse(file.body, {
    headers: {
      "Content-Type": meta.mime,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "Content-Disposition": "inline",
    },
  });
}
