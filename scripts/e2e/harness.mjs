// Entorno de pruebas de extremo a extremo (SOLO PARA PRUEBAS LOCALES, nunca se despliega):
//   · Un "Supabase" local: PostgreSQL real en memoria (PGlite) con el SQL de supabase/stella.sql y una
//     capa mínima que imita la API REST (PostgREST) solo en lo que usa la web.
//   · Un "Anthropic" falso que responde con texto fijo y apunta lo que recibe (no hay IA real ni gasto).
//   · Un servidor HTTPS con tres sitios falsos (nuestra web, la web de un cliente y una web no autorizada)
//     para probar el widget instalado en una web externa, con certificado autofirmado.
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PGlite } from "@electric-sql/pglite";

export const HOSTS = { site: "localis-test.com", client: "cliente-prueba.com", other: "otra-web.com" };
export const PORTS = { next: 3100, supabase: 54321, anthropic: 54322, https: 8443 };

const ident = /^[a-z_][a-z0-9_]*$/;

export async function startSupabase(root) {
  const db = new PGlite();
  await db.exec("create role anon nologin; create role authenticated nologin; create role service_role nologin;");
  await db.exec(fs.readFileSync(path.join(root, "supabase/stella.sql"), "utf8"));
  const schema = fs.readFileSync(path.join(root, "supabase/schema.sql"), "utf8").replace(/create extension if not exists pgcrypto;/i, "");
  await db.exec(schema);
  // Tabla de diseños del configurador (si existe en esta rama) con un «storage» mínimo simulado.
  const cfgSql = path.join(root, "supabase/configurador.sql");
  if (fs.existsSync(cfgSql)) {
    await db.exec("create schema if not exists storage; create table if not exists storage.buckets (id text primary key, name text, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);");
    await db.exec(fs.readFileSync(cfgSql, "utf8").replace(/create extension if not exists pgcrypto;/i, ""));
  }

  const storage = new Map();
  const colTypes = {};
  async function types(table) {
    if (!colTypes[table]) {
      const r = await db.query("select column_name, udt_name from information_schema.columns where table_schema='public' and table_name=$1", [table]);
      colTypes[table] = Object.fromEntries(r.rows.map((x) => [x.column_name, x.udt_name]));
    }
    return colTypes[table];
  }
  const cast = (udt) => (udt === "_text" ? "text[]" : udt);
  const val = (v, udt) => (udt === "jsonb" || udt === "json" ? JSON.stringify(v) : v);

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks); // bytes tal cual (imágenes de prueba)
    const body = raw.toString("utf8");
    const send = (status, data) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(data === undefined ? "" : JSON.stringify(data));
    };
    try {
      // Almacenamiento simulado (un solo bucket privado «design-uploads»).
      if (url.pathname.startsWith("/storage/v1/")) {
        const bucket = url.pathname.match(/^\/storage\/v1\/bucket\/design-uploads$/);
        if (bucket) return send(200, { id: "design-uploads", public: false });
        const obj = url.pathname.match(/^\/storage\/v1\/object\/(public\/)?design-uploads\/(.+)$/);
        if (!obj) return send(404, { message: "no" });
        const objPath = decodeURIComponent(obj[2]);
        if (obj[1]) return send(400, { message: "Bucket not public" });
        if (req.method === "POST") { storage.set(objPath, { bytes: raw, mime: String(req.headers["content-type"]) }); return send(200, { Key: objPath }); }
        if (req.method === "DELETE") { storage.delete(objPath); return send(200, { message: "ok" }); }
        const f = storage.get(objPath);
        if (!f) return send(404, { message: "no" });
        res.writeHead(200, { "Content-Type": f.mime });
        return res.end(f.bytes);
      }
      const m = url.pathname.match(/^\/rest\/v1\/(.+)$/);
      if (!m) return send(404, { message: "no" });
      const target = m[1];
      if (target === "rpc/stella_gate") {
        const a = JSON.parse(body);
        const r = await db.query("select stella_gate($1, $2::jsonb, $3, $4, $5, $6) as r", [a.p_business, JSON.stringify(a.p_rates), a.p_biz_day_micro, a.p_biz_month_micro, a.p_global_day_micro, a.p_global_month_micro]);
        return send(200, r.rows[0].r);
      }
      if (target === "rpc/stella_usage_add") {
        const a = JSON.parse(body);
        await db.query("select stella_usage_add($1,$2,$3,$4,$5,$6,$7)", [a.p_business, a.p_messages, a.p_in, a.p_out, a.p_cost, a.p_errors, a.p_contacts]);
        return send(200, null);
      }
      if (!ident.test(target)) return send(404, { message: "tabla" });
      const t = await types(target);
      const where = [];
      const params = [];
      let order = "";
      let limit = "";
      for (const [k, v] of url.searchParams) {
        if (k === "select") continue;
        if (k === "order") {
          order = " order by " + v.split(",").map((o) => { const [c, d] = o.split("."); if (!ident.test(c)) throw new Error("order"); return `${c} ${d === "desc" ? "desc" : "asc"}`; }).join(", ");
          continue;
        }
        if (k === "limit") { limit = ` limit ${parseInt(v, 10)}`; continue; }
        const mm = v.match(/^(eq|gte)\.(.*)$/);
        if (!mm || !t[k]) throw new Error("filtro " + k);
        params.push(mm[2]);
        where.push(`${k} ${mm[1] === "eq" ? "=" : ">="} $${params.length}::${cast(t[k])}`);
      }
      const w = where.length ? " where " + where.join(" and ") : "";
      if (req.method === "GET") {
        const r = await db.query(`select * from public.${target}${w}${order}${limit}`, params);
        return send(200, r.rows);
      }
      const data = body ? JSON.parse(body) : {};
      const cols = Object.keys(data);
      if (cols.some((c) => !t[c])) throw new Error("columna");
      const ret = (req.headers.prefer ?? "").includes("return=representation");
      if (req.method === "POST") {
        const ps = cols.map((c) => val(data[c], t[c]));
        const r = await db.query(`insert into public.${target} (${cols.join(",")}) values (${cols.map((c, i) => `$${i + 1}::${cast(t[c])}`).join(",")}) returning *`, ps);
        return send(201, ret ? r.rows : undefined);
      }
      if (req.method === "PATCH") {
        const ps = cols.map((c) => val(data[c], t[c]));
        const shifted = w.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + cols.length}`);
        const r = await db.query(`update public.${target} set ${cols.map((c, i) => `${c} = $${i + 1}::${cast(t[c])}`).join(",")}${shifted} returning *`, [...ps, ...params]);
        return send(200, ret ? r.rows : undefined);
      }
      return send(405, { message: "método" });
    } catch (e) {
      return send(400, { code: "E2E", message: String(e.message ?? e) });
    }
  });
  await new Promise((ok) => server.listen(PORTS.supabase, "127.0.0.1", ok));
  return { db, storage, close: () => new Promise((ok) => server.close(ok)) };
}

/** "Anthropic" falso: responde según la pregunta y guarda cada petición para inspeccionarla. */
export async function startAnthropic() {
  const calls = [];
  const server = http.createServer(async (req, res) => {
    const body = await new Promise((ok) => {
      let b = "";
      req.on("data", (c) => (b += c));
      req.on("end", () => ok(b));
    });
    if (req.url === "/__calls") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(calls));
    }
    const j = JSON.parse(body || "{}");
    // Modelos «err-<código>» simulan los errores reales de la API de Anthropic (mismo formato de cuerpo).
    const em = /^err-(\d{3})$/.exec(String(j.model));
    if (em) {
      const code = Number(em[1]);
      const E = { 400: ["invalid_request_error", "Your credit balance is too low to access the Anthropic API."], 401: ["authentication_error", "invalid x-api-key"], 404: ["not_found_error", `model: ${j.model}`], 429: ["rate_limit_error", "Number of request tokens has exceeded your per-minute rate limit"], 529: ["overloaded_error", "Overloaded"] }[code] ?? ["api_error", "error interno"];
      res.writeHead(code, { "Content-Type": "application/json", "request-id": "req_err_e2e", "x-should-retry": "false" });
      return res.end(JSON.stringify({ type: "error", error: { type: E[0], message: E[1] }, request_id: "req_err_e2e" }));
    }
    calls.push({ model: j.model, max_tokens: j.max_tokens, system: j.system, messages: j.messages, hasKey: /^Bearer .+/.test(String(req.headers.authorization ?? "")) || Boolean(req.headers["x-api-key"]) });
    const last = String(j.messages?.at(-1)?.content ?? "").toLowerCase();
    const text = last.includes("llamen") ? "Claro, te ayudo con eso. [[FORMULARIO]]" : last.includes("corte") ? "Un corte de pelo cuesta 15 €." : "Eso no lo sé con seguridad. Puedes escribirnos por WhatsApp.";
    res.writeHead(200, { "Content-Type": "application/json", "request-id": "req_e2e" });
    res.end(JSON.stringify({ id: "msg_e2e", type: "message", role: "assistant", model: j.model, content: [{ type: "text", text }], stop_reason: "end_turn", stop_sequence: null, usage: { input_tokens: 1800, output_tokens: 60 } }));
  });
  await new Promise((ok) => server.listen(PORTS.anthropic, "127.0.0.1", ok));
  return { calls, close: () => new Promise((ok) => server.close(ok)) };
}

function selfSigned(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const key = path.join(dir, "key.pem");
  const crt = path.join(dir, "crt.pem");
  if (!fs.existsSync(crt)) {
    const san = Object.values(HOSTS).map((h) => `DNS:${h}`).join(",");
    execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", key, "-out", crt, "-days", "2", "-subj", "/CN=localis-test.com", "-addext", `subjectAltName=${san}`], { stdio: "ignore" });
  }
  return { key: fs.readFileSync(key), cert: fs.readFileSync(crt) };
}

const clientPage = (negocio, title) => `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>
  /* CSS hostil típico de webs de clientes: debe NO afectar al widget (Shadow DOM) */
  *{box-sizing:content-box!important;font-family:serif!important}
  button{display:none!important;background:red!important;width:3px!important}
  iframe{display:none!important}
  body{margin:0;padding:24px;background:#fff7ec;color:#222}
  h1{font-size:2rem} p{max-width:60ch}
</style></head><body>
<h1>${title}</h1><p>Peluquería de barrio. Corte, color y peinados. Esta es una web de pruebas para instalar Stella.</p>
<p>${"Texto de relleno para forzar scroll. ".repeat(60)}</p>
<script src="https://${HOSTS.site}/stella.js" data-negocio="${negocio}" defer></script>
</body></html>`;

/** Servidor HTTPS con 3 sitios virtuales (según la cabecera Host). */
export function startVhosts(root) {
  const tls = selfSigned(path.join(root, ".next", "e2e-cert"));
  const server = https.createServer(tls, (req, res) => {
    const host = String(req.headers.host ?? "").split(":")[0];
    if (host === HOSTS.client) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(clientPage("peluqueria-ana", "Peluquería Ana"));
    }
    if (host === HOSTS.other) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(clientPage("peluqueria-ana", "Web no autorizada"));
    }
    // Nuestra web: proxy a Next.js conservando Host y poniendo la IP como lo hace Vercel.
    const p = http.request({ host: "127.0.0.1", port: PORTS.next, path: req.url, method: req.method, headers: { ...req.headers, "x-real-ip": "198.51.100.23", "x-forwarded-proto": "https" } }, (r) => {
      res.writeHead(r.statusCode ?? 502, r.headers);
      r.pipe(res);
    });
    p.on("error", () => { res.writeHead(502); res.end("proxy"); });
    req.pipe(p);
  });
  return new Promise((ok) => server.listen(PORTS.https, "127.0.0.1", () => ok({ close: () => new Promise((c) => server.close(c)) })));
}
