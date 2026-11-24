// Comprobaciones REALES de las integraciones desde el propio despliegue (con SUS variables): Supabase, almacén de imágenes
// y Resend. Se lanzan a mano desde /admin/entorno. Nunca devuelven claves ni valores de variables.
// Lo que crean (una imagen diminuta de prueba) lo borran en la misma operación. No tocan leads ni datos de clientes.

export interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

export interface Deps {
  fetchImpl?: typeof fetch;
  env?: Record<string, string | undefined>;
}

const TABLES: { name: string; sql: string }[] = [
  { name: "leads", sql: "supabase/schema.sql + supabase/fix-permisos.sql" },
  { name: "opportunities", sql: "supabase/schema.sql + supabase/fix-permisos.sql" },
  { name: "stella_businesses", sql: "supabase/stella.sql" },
  { name: "stella_usage", sql: "supabase/stella.sql" },
  { name: "stella_rate", sql: "supabase/stella.sql" },
  { name: "design_requests", sql: "supabase/configurador.sql" },
];

// PNG válido de 1×1 píxel (67 bytes).
const PNG_1X1 = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="), (c) => c.charCodeAt(0));

const short = (s: string, n = 160) => s.replace(/\s+/g, " ").slice(0, n);

function cfg(env: Record<string, string | undefined>) {
  const url = env.SUPABASE_URL?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}
const headers = (key: string): Record<string, string> => (key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key });

/** Qué hacer según lo que responde Supabase (sin mostrar nada sensible). */
function explain(status: number, body: string): string {
  let code = "";
  let msg = "";
  try {
    const j = JSON.parse(body) as { code?: string; message?: string; error?: string; statusCode?: string };
    code = j.code ?? j.statusCode ?? "";
    msg = j.message ?? j.error ?? "";
  } catch {
    msg = body;
  }
  const base = `HTTP ${status}${code ? ` · ${code}` : ""}${msg ? ` · ${short(msg, 120)}` : ""}`;
  if (code === "42P01" || /relation .* does not exist|Could not find the table/i.test(msg)) return `${base} → la tabla no existe: ejecuta el SQL indicado.`;
  if (code === "42501" || /permission denied/i.test(msg)) return `${base} → faltan permisos (GRANT): ejecuta supabase/fix-permisos.sql o el SQL de esa parte.`;
  if (status === 401 || status === 403) return `${base} → la clave no tiene acceso: revisa SUPABASE_SERVICE_ROLE_KEY (Secret key o service_role, no la pública).`;
  if (code === "PGRST125" || status === 404) return `${base} → revisa SUPABASE_URL (sin /rest/v1/) o que el recurso exista.`;
  return base;
}

export async function checkSupabase(deps: Deps = {}): Promise<CheckResult[]> {
  const doFetch = deps.fetchImpl ?? fetch;
  const c = cfg(deps.env ?? process.env);
  if (!c) return [{ name: "Conexión con Supabase", ok: false, detail: "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en este entorno." }];
  const out: CheckResult[] = [];
  const get = async (path: string, init: RequestInit = {}) => {
    const res = await doFetch(`${c.url}${path}`, { ...init, headers: { ...headers(c.key), ...(init.headers as Record<string, string> | undefined) }, cache: "no-store", signal: AbortSignal.timeout(10_000) });
    return { status: res.status, ok: res.ok, text: await res.text().catch(() => ""), res };
  };

  // 1) Tablas (lectura de 0 filas: comprueba que existen y que el servidor tiene permiso)
  for (const t of TABLES) {
    try {
      const r = await get(`/rest/v1/${t.name}?select=*&limit=0`);
      out.push({ name: `Tabla ${t.name}`, ok: r.ok, detail: r.ok ? "existe y hay permiso" : `${explain(r.status, r.text)} [${t.sql}]` });
    } catch (e) {
      out.push({ name: `Tabla ${t.name}`, ok: false, detail: e instanceof Error && e.name === "TimeoutError" ? "tiempo agotado (¿proyecto pausado?)" : "sin conexión con Supabase (revisa SUPABASE_URL)" });
      return out; // sin conexión no tiene sentido seguir
    }
  }

  // 2) Funciones de límites de Stella (sin escribir nada: sin reglas ni presupuestos)
  try {
    const r = await get("/rest/v1/rpc/stella_gate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ p_business: "diagnostico", p_rates: [], p_biz_day_micro: 0, p_biz_month_micro: 0, p_global_day_micro: 0, p_global_month_micro: 0 }) });
    out.push({ name: "Función stella_gate (límites persistentes)", ok: r.ok && r.text.replace(/"/g, "") === "ok", detail: r.ok ? "responde «ok»" : `${explain(r.status, r.text)} [supabase/stella.sql]` });
  } catch {
    out.push({ name: "Función stella_gate (límites persistentes)", ok: false, detail: "sin respuesta" });
  }

  // 3) Almacén de imágenes del configurador: existe, es PRIVADO, y subir → descargar → borrar funciona
  let bucketOk = false;
  try {
    const r = await get("/storage/v1/bucket/design-uploads");
    if (!r.ok) out.push({ name: "Almacén design-uploads", ok: false, detail: `${explain(r.status, r.text)} [supabase/configurador.sql]` });
    else {
      const b = JSON.parse(r.text) as { public?: boolean };
      bucketOk = true;
      out.push({ name: "Almacén design-uploads es PRIVADO", ok: b.public === false, detail: b.public === false ? "existe y no es público" : "¡ES PÚBLICO! Cámbialo a privado (Storage → design-uploads → Edit) o vuelve a ejecutar supabase/configurador.sql" });
    }
  } catch {
    out.push({ name: "Almacén design-uploads", ok: false, detail: "sin respuesta" });
  }
  if (bucketOk) {
    const path = `_diagnostico/${crypto.randomUUID()}.png`;
    const enc = path.split("/").map(encodeURIComponent).join("/");
    try {
      const up = await get(`/storage/v1/object/design-uploads/${enc}`, { method: "POST", headers: { "Content-Type": "image/png", "x-upsert": "false" }, body: PNG_1X1 as unknown as BodyInit });
      out.push({ name: "Subir imagen al almacén", ok: up.ok, detail: up.ok ? "subida correcta" : explain(up.status, up.text) });
      if (up.ok) {
        const down = await doFetch(`${c.url}/storage/v1/object/design-uploads/${enc}`, { headers: headers(c.key), cache: "no-store", signal: AbortSignal.timeout(10_000) });
        const bytes = down.ok ? new Uint8Array(await down.arrayBuffer()) : new Uint8Array();
        const same = bytes.length === PNG_1X1.length && bytes.every((v, i) => v === PNG_1X1[i]);
        out.push({ name: "Recuperar la imagen (idéntica a la subida)", ok: same, detail: same ? "los bytes coinciden" : `HTTP ${down.status}, ${bytes.length} bytes`, });
        const anon = await doFetch(`${c.url}/storage/v1/object/public/design-uploads/${enc}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
        out.push({ name: "La imagen NO es accesible sin clave (ruta pública)", ok: !anon.ok, detail: anon.ok ? "¡cualquiera podría verla! El almacén debe ser privado" : `la ruta pública responde ${anon.status}` });
        const del = await get(`/storage/v1/object/design-uploads/${enc}`, { method: "DELETE" });
        out.push({ name: "Borrar la imagen de prueba (la creada ahora)", ok: del.ok, detail: del.ok ? "borrada" : `${explain(del.status, del.text)} — borra a mano el archivo _diagnostico/ si queda` });
      }
    } catch {
      out.push({ name: "Subir imagen al almacén", ok: false, detail: "sin respuesta" });
    }
  }
  return out;
}

export interface MailResult {
  ok: boolean;
  status: number | null;
  detail: string;
  to: string;
}

/** Un único correo de prueba al destinatario de avisos del propio negocio (LEAD_INBOX_EMAIL). Nunca a clientes. */
export async function sendTestEmail(deps: Deps = {}): Promise<MailResult> {
  const env = deps.env ?? process.env;
  const doFetch = deps.fetchImpl ?? fetch;
  const key = env.RESEND_API_KEY?.trim();
  const to = env.LEAD_INBOX_EMAIL?.trim() || "migueljosa7@gmail.com";
  const mask = (e: string) => e.replace(/^(.).*(@.*)$/, "$1***$2");
  if (!key) return { ok: false, status: null, detail: "Falta RESEND_API_KEY en este entorno.", to: mask(to) };
  const from = env.EMAIL_FROM?.trim() || "LOCALIS AI <onboarding@resend.dev>";
  try {
    const res = await doFetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: "[PRUEBA] LOCALIS AI: el envío de correo funciona", html: `<p>Este es un correo de <strong>prueba</strong> enviado desde el panel de LOCALIS AI (entorno: ${env.VERCEL_ENV ?? "local"}). No es necesario responder.</p>` }),
      signal: AbortSignal.timeout(10_000),
    });
    const text = await res.text().catch(() => "");
    let msg = "";
    try {
      const j = JSON.parse(text) as { message?: string; name?: string };
      msg = [j.name, j.message].filter(Boolean).join(": ");
    } catch {
      msg = text;
    }
    if (res.ok) return { ok: true, status: res.status, detail: "Resend aceptó el correo: revisa tu bandeja (y spam) en unos segundos.", to: mask(to) };
    const hintMsg =
      res.status === 401 || res.status === 403 ? "La clave de Resend no es válida o no tiene permiso de envío."
      : res.status === 422 && /domain|from|testing emails/i.test(msg) ? "Con el remitente de prueba (onboarding@resend.dev) Resend solo entrega al email de la cuenta de Resend. Pon LEAD_INBOX_EMAIL = ese email, o verifica un dominio propio."
      : res.status === 429 ? "Límite de envíos de Resend alcanzado."
      : "";
    return { ok: false, status: res.status, detail: `${short(msg, 200)} ${hintMsg}`.trim(), to: mask(to) };
  } catch (e) {
    return { ok: false, status: null, detail: e instanceof Error && e.name === "TimeoutError" ? "Resend no respondió a tiempo." : "No se pudo conectar con Resend.", to: mask(to) };
  }
}
