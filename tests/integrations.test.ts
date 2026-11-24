import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSupabase, sendTestEmail } from "../src/lib/admin/integrations";

const ENV = { SUPABASE_URL: "https://proyecto.supabase.co/rest/v1/", SUPABASE_SERVICE_ROLE_KEY: "sb_secret_SECRETISIMO", RESEND_API_KEY: "re_SECRETISIMO", LEAD_INBOX_EMAIL: "dueno@ejemplo.com", VERCEL_ENV: "preview" };

/** Supabase simulado en memoria: tablas, funciones y almacén (con opción de bucket público o tablas ausentes). */
function fakeSupabase(opts: { missing?: string[]; denied?: string[]; publicBucket?: boolean; noBucket?: boolean; storageDown?: boolean } = {}) {
  const objects = new Map<string, Uint8Array>();
  const calls: string[] = [];
  const impl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    const method = init?.method ?? "GET";
    calls.push(`${method} ${url.replace("https://proyecto.supabase.co", "")}`);
    const h = (init?.headers ?? {}) as Record<string, string>;
    const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
    const tbl = /\/rest\/v1\/([a-z_]+)\?select/.exec(url)?.[1];
    if (tbl) {
      if (opts.missing?.includes(tbl)) return json(404, { code: "42P01", message: `relation "public.${tbl}" does not exist` });
      if (opts.denied?.includes(tbl)) return json(403, { code: "42501", message: `permission denied for table ${tbl}` });
      return json(200, []);
    }
    if (url.includes("/rpc/stella_gate")) return opts.missing?.includes("stella_businesses") ? json(404, { code: "PGRST202", message: "Could not find the function" }) : json(200, "ok");
    if (url.includes("/storage/v1/bucket/design-uploads")) return opts.noBucket ? json(404, { statusCode: "404", error: "Bucket not found", message: "Bucket not found" }) : json(200, { id: "design-uploads", public: !!opts.publicBucket });
    const obj = /\/storage\/v1\/object\/(public\/)?design-uploads\/(.+)$/.exec(url);
    if (obj) {
      if (opts.storageDown) return json(500, { message: "boom" });
      const path = decodeURIComponent(obj[2]);
      if (obj[1]) return opts.publicBucket && objects.has(path) ? new Response(objects.get(path)) : json(400, { message: "not found" });
      if (!h.apikey) return json(401, { message: "no key" });
      if (method === "POST") { objects.set(path, new Uint8Array(init!.body as Uint8Array)); return json(200, { Key: path }); }
      if (method === "DELETE") { objects.delete(path); return json(200, { message: "ok" }); }
      return objects.has(path) ? new Response(objects.get(path)) : json(404, { message: "no" });
    }
    return json(404, {});
  };
  return { impl: impl as typeof fetch, objects, calls };
}

test("Supabase: todo correcto → tablas, función de límites, almacén privado, subir/recuperar/borrar; sin dejar rastro", async () => {
  const f = fakeSupabase();
  const r = await checkSupabase({ fetchImpl: f.impl, env: ENV });
  assert.ok(r.every((x) => x.ok), JSON.stringify(r.filter((x) => !x.ok)));
  const names = r.map((x) => x.name).join("|");
  for (const n of ["Tabla leads", "Tabla stella_businesses", "Tabla design_requests", "stella_gate", "PRIVADO", "Subir imagen", "Recuperar la imagen", "NO es accesible sin clave", "Borrar la imagen"]) assert.ok(names.includes(n), n);
  assert.equal(f.objects.size, 0, "la imagen de prueba se borra en la misma operación");
  assert.ok(f.calls.some((c) => c.startsWith("GET /rest/v1/leads?select=*&limit=0")), "solo lectura de 0 filas (no se leen leads)");
  assert.ok(!f.calls.some((c) => /POST \/rest\/v1\/(leads|design_requests)/.test(c)), "no escribe en tablas de clientes");
  assert.ok(f.calls.some((c) => c.includes("/storage/v1/object/design-uploads/_diagnostico/")), "usa una carpeta propia de diagnóstico");
  assert.ok(!JSON.stringify(r).includes("SECRETISIMO"), "nunca devuelve claves");
});

test("Supabase: señala la tabla que falta y el SQL a ejecutar, los permisos que faltan y un almacén inexistente", async () => {
  const r = await checkSupabase({ fetchImpl: fakeSupabase({ missing: ["design_requests"], denied: ["leads"], noBucket: true }).impl, env: ENV });
  const by = (n: string) => r.find((x) => x.name.includes(n))!;
  assert.equal(by("design_requests").ok, false);
  assert.match(by("design_requests").detail, /no existe.*supabase\/configurador\.sql/s);
  assert.match(by("Tabla leads").detail, /permisos.*fix-permisos/s);
  assert.equal(by("Almacén design-uploads").ok, false);
  assert.match(by("Almacén design-uploads").detail, /configurador\.sql/);
  assert.equal(r.some((x) => x.name.includes("Subir imagen")), false, "sin almacén no se intenta subir");
});

test("Supabase: un almacén PÚBLICO se marca como fallo grave", async () => {
  const r = await checkSupabase({ fetchImpl: fakeSupabase({ publicBucket: true }).impl, env: ENV });
  assert.equal(r.find((x) => x.name.includes("PRIVADO"))!.ok, false);
  assert.match(r.find((x) => x.name.includes("PRIVADO"))!.detail, /PÚBLICO/);
  assert.equal(r.find((x) => x.name.includes("NO es accesible"))!.ok, false, "la ruta pública devolvería la imagen");
});

test("Supabase: sin variables o sin conexión devuelve un mensaje claro (sin lanzar)", async () => {
  assert.match((await checkSupabase({ env: {} }))[0].detail, /Faltan SUPABASE_URL/);
  const down = (async () => { throw new Error("ECONNREFUSED"); }) as unknown as typeof fetch;
  const r = await checkSupabase({ fetchImpl: down, env: ENV });
  assert.equal(r.length, 1);
  assert.match(r[0].detail, /sin conexión/);
  const s = await checkSupabase({ fetchImpl: fakeSupabase({ storageDown: true }).impl, env: ENV });
  assert.equal(s.find((x) => x.name.includes("Subir imagen"))!.ok, false);
});

test("Resend: un solo correo de prueba al email de avisos; errores explicados; sin claves en el resultado", async () => {
  let sent: { to: string[]; subject: string; auth: string } | null = null;
  const ok = (async (_u: unknown, init: RequestInit) => {
    const b = JSON.parse(String(init.body));
    sent = { to: b.to, subject: b.subject, auth: String((init.headers as Record<string, string>).Authorization) };
    return new Response(JSON.stringify({ id: "abc" }), { status: 200 });
  }) as unknown as typeof fetch;
  const r = await sendTestEmail({ fetchImpl: ok, env: ENV });
  assert.equal(r.ok, true);
  assert.deepEqual(sent!.to, ["dueno@ejemplo.com"], "solo al destinatario de avisos del negocio");
  assert.match(sent!.subject, /\[PRUEBA\]/);
  assert.equal(r.to, "d***@ejemplo.com", "el destinatario se muestra enmascarado");
  assert.ok(!JSON.stringify(r).includes("SECRETISIMO"));

  const resend422 = (async () => new Response(JSON.stringify({ name: "validation_error", message: "You can only send testing emails to your own email address" }), { status: 422 })) as unknown as typeof fetch;
  const r2 = await sendTestEmail({ fetchImpl: resend422, env: ENV });
  assert.equal(r2.ok, false);
  assert.match(r2.detail, /onboarding@resend\.dev|solo entrega/);
  const r3 = await sendTestEmail({ fetchImpl: (async () => new Response("{}", { status: 401 })) as unknown as typeof fetch, env: ENV });
  assert.match(r3.detail, /no es válida/);
  assert.match((await sendTestEmail({ env: {} })).detail, /Falta RESEND_API_KEY/);
  const net = await sendTestEmail({ fetchImpl: (async () => { throw new Error("x"); }) as unknown as typeof fetch, env: ENV });
  assert.equal(net.ok, false);
});
