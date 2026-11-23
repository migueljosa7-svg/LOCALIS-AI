// Entorno LOCAL de pruebas del configurador (nunca se despliega): un «Supabase» falso hecho con PostgreSQL real
// en memoria (PGlite) con el SQL de supabase/schema.sql y supabase/configurador.sql, una capa mínima que imita
// la API REST y el almacenamiento de archivos. Sin servicios reales ni datos reales.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

export const PORTS = { next: 3200, supabase: 54331 };
const ident = /^[a-z_][a-z0-9_]*$/;

export async function startBackend(root) {
  const db = new PGlite();
  await db.exec("create role anon nologin; create role authenticated nologin; create role service_role nologin;");
  await db.exec("create schema storage; create table storage.buckets (id text primary key, name text, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);");
  const strip = (f) => fs.readFileSync(path.join(root, f), "utf8").replace(/create extension if not exists pgcrypto;/i, "");
  await db.exec(strip("supabase/schema.sql"));
  await db.exec(strip("supabase/configurador.sql"));

  const files = new Map(); // almacenamiento falso: ruta → { bytes, mime }
  const colTypes = {};
  async function types(table) {
    if (!colTypes[table]) {
      const r = await db.query("select column_name, udt_name from information_schema.columns where table_schema='public' and table_name=$1", [table]);
      colTypes[table] = Object.fromEntries(r.rows.map((x) => [x.column_name, x.udt_name]));
    }
    return colTypes[table];
  }
  const cast = (u) => (u === "_text" ? "text[]" : u);
  const val = (v, u) => (u === "jsonb" || u === "json" ? JSON.stringify(v) : v);

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks);
    const send = (status, data, headers = {}) => {
      res.writeHead(status, { "Content-Type": "application/json", ...headers });
      res.end(data === undefined ? "" : JSON.stringify(data));
    };
    try {
      const st = url.pathname.match(/^\/storage\/v1\/object\/design-uploads\/(.+)$/);
      if (st) {
        const p = decodeURIComponent(st[1]);
        if (req.method === "POST") {
          if (!/Bearer|apikey/i.test(JSON.stringify(req.headers))) return send(401, { message: "auth" });
          files.set(p, { bytes: raw, mime: String(req.headers["content-type"]) });
          return send(200, { Key: p });
        }
        const f = files.get(p);
        if (!f) return send(404, { message: "no" });
        res.writeHead(200, { "Content-Type": f.mime });
        return res.end(f.bytes);
      }
      const m = url.pathname.match(/^\/rest\/v1\/(.+)$/);
      if (!m) return send(404, { message: "no" });
      const target = m[1];
      if (!ident.test(target)) return send(404, { message: "tabla" });
      const t = await types(target);
      const where = [];
      const params = [];
      let order = "";
      let limit = "";
      for (const [k, v] of url.searchParams) {
        if (k === "select") continue;
        if (k === "order") { order = " order by " + v.split(",").map((o) => { const [c, d] = o.split("."); if (!ident.test(c)) throw new Error("order"); return `${c} ${d === "desc" ? "desc" : "asc"}`; }).join(", "); continue; }
        if (k === "limit") { limit = ` limit ${parseInt(v, 10)}`; continue; }
        const mm = v.match(/^(eq|gte)\.(.*)$/);
        if (!mm || !t[k]) throw new Error("filtro " + k);
        params.push(mm[2]);
        where.push(`${k} ${mm[1] === "eq" ? "=" : ">="} $${params.length}::${cast(t[k])}`);
      }
      const w = where.length ? " where " + where.join(" and ") : "";
      if (req.method === "GET") return send(200, (await db.query(`select * from public.${target}${w}${order}${limit}`, params)).rows);
      const data = raw.length ? JSON.parse(raw.toString("utf8")) : {};
      const cols = Object.keys(data);
      if (cols.some((c) => !t[c])) throw new Error("columna");
      const ret = (req.headers.prefer ?? "").includes("return=representation");
      const ps = cols.map((c) => val(data[c], t[c]));
      if (req.method === "POST") {
        const r = await db.query(`insert into public.${target} (${cols.join(",")}) values (${cols.map((c, i) => `$${i + 1}::${cast(t[c])}`).join(",")}) returning *`, ps);
        return send(201, ret ? r.rows : undefined);
      }
      if (req.method === "PATCH") {
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
  return { db, files, close: () => new Promise((ok) => server.close(ok)) };
}
