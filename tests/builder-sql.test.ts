// Ejecuta el SQL REAL de supabase/configurador.sql en un PostgreSQL de pruebas (PGlite). No toca Supabase.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

let db: PGlite;
// PGlite no incluye la extensión pgcrypto (en Supabase ya está instalada y gen_random_uuid es nativa): se omite solo esa línea.
const sql = readFileSync(new URL("../supabase/configurador.sql", import.meta.url), "utf8").replace(/create extension if not exists pgcrypto;/i, "");

before(async () => {
  db = new PGlite();
  await db.exec("create role anon nologin; create role authenticated nologin; create role service_role nologin;");
  // En Supabase el esquema «storage» ya existe; aquí se simula solo la tabla de buckets.
  await db.exec("create schema storage; create table storage.buckets (id text primary key, name text, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);");
  await db.exec(sql);
  await db.exec(sql); // idempotente
});

test("sql configurador: se ejecuta dos veces, RLS activado y sin permisos para anon/authenticated", async () => {
  const r = await db.query<{ relrowsecurity: boolean }>("select relrowsecurity from pg_class where relname = 'design_requests'");
  assert.equal(r.rows[0].relrowsecurity, true);
  const p = async (role: string, priv: string) => (await db.query<{ h: boolean }>("select has_table_privilege($1, 'public.design_requests', $2) as h", [role, priv])).rows[0].h;
  assert.equal(await p("anon", "select"), false);
  assert.equal(await p("authenticated", "insert"), false);
  assert.equal(await p("service_role", "insert"), true);
});

test("sql configurador: el almacén de imágenes es PRIVADO, con límite y solo JPG/PNG/WebP", async () => {
  const b = (await db.query<{ public: boolean; file_size_limit: string; allowed_mime_types: string[] }>("select * from storage.buckets where id = 'design-uploads'")).rows;
  assert.equal(b.length, 1);
  assert.equal(b[0].public, false);
  assert.equal(Number(b[0].file_size_limit), 2_000_000);
  assert.deepEqual([...b[0].allowed_mime_types].sort(), ["image/jpeg", "image/png", "image/webp"]);
  // Reejecutar el script no puede volver público un bucket que alguien hubiera cambiado.
  await db.exec("update storage.buckets set public = true where id = 'design-uploads'");
  await db.exec(sql);
  assert.equal((await db.query<{ public: boolean }>("select public from storage.buckets where id = 'design-uploads'")).rows[0].public, false);
});

test("sql configurador: fases válidas, valor por defecto «recibida» y configuración obligatoria", async () => {
  await db.query("insert into design_requests (config) values ($1::jsonb)", [JSON.stringify({ a: 1 })]);
  const r = await db.query<{ stage: string; uploads: unknown }>("select stage, uploads from design_requests");
  assert.equal(r.rows[0].stage, "recibida");
  assert.deepEqual(r.rows[0].uploads, []);
  await assert.rejects(db.query("insert into design_requests (config, stage) values ('{}'::jsonb, 'inventada')"));
  await assert.rejects(db.query("insert into design_requests (config) values (null)"));
  for (const st of ["en_revision", "presupuesto_enviado", "aceptada", "en_construccion", "entregada", "descartada"]) await db.query("update design_requests set stage = $1", [st]);
});
