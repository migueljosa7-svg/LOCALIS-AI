import { NextResponse, type NextRequest } from "next/server";
import { embedCsp } from "@/lib/stella/edge";

// 1) Protege el panel interno (/admin) y su API con usuario y contraseña.
// 2) Para el chat de Stella incrustado (/stella/embed) fija en el servidor qué webs pueden mostrarlo
//    (CSP frame-ancestors: lo hace cumplir el navegador, no depende de que el cliente sea honesto).
// Variables de entorno en Vercel: ADMIN_USER y ADMIN_PASSWORD (16+ caracteres).
// Si no están configuradas, el panel no existe (404): nunca queda abierto por error.
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*", "/stella/embed"] };

const MIN_PASSWORD = 16;

// Comparación en tiempo constante (no revela por timing cuántos caracteres coinciden).
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/stella/embed") {
    const res = NextResponse.next();
    res.headers.set("Content-Security-Policy", await embedCsp(req.nextUrl.searchParams.get("negocio")));
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass || pass.length < MIN_PASSWORD) {
    return new NextResponse("Not found", { status: 404 });
  }

  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(":");
      const u = decoded.slice(0, sep);
      const p = decoded.slice(sep + 1);
      if (sep > 0 && safeEqual(u, user) && safeEqual(p, pass)) {
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        res.headers.set("Cache-Control", "no-store");
        return res;
      }
    } catch {
      // cabecera mal formada → se trata como no autenticado
    }
  }

  return new NextResponse("Autenticación requerida", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="LOCALIS admin", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}
