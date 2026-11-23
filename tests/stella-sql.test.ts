// Ejecuta el SQL REAL de supabase/stella.sql en un PostgreSQL (PGlite, en memoria) y comprueba las
// funciones de límites y presupuestos. No toca Supabase ni ningún dato real.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

let db: PGlite;
const sql = readFileSync(new URL("../supabase/stella.sql", import.meta.url), "utf8");

before(async () => {
  db = new PGlite();
  // Roles que en Supabase ya existen.
  await db.exec("create role anon nologin; create role authenticated nologin; create role service_role nologin;");
  await db.exec(sql);
  await db.exec(sql); // debe poder ejecutarse dos veces sin errores
});

const gate = async (business: string, rates: object[], limits: [number, number, number, number] = [0, 0, 0, 0]) => {
  const r = await db.query<{ stella_gate: string }>("select stella_gate($1, $2::jsonb, $3, $4, $5, $6)", [business, JSON.stringify(rates), ...limits]);
  return r.rows[0].stella_gate;
};

test("sql: el script se ejecuta dos veces sin errores y crea tablas con RLS activado", async () => {
  const r = await db.query<{ relname: string; relrowsecurity: boolean }>(
    "select relname, relrowsecurity from pg_class where relname in ('stella_businesses','stella_usage','stella_rate') order by 1"
  );
  assert.equal(r.rows.length, 3);
  assert.ok(r.rows.every((x) => x.relrowsecurity), "RLS debe estar activado en las tres tablas");
});

test("sql: anon y authenticated no tienen permisos; service_role sí", async () => {
  const p = async (role: string, table: string, priv: string) =>
    (await db.query<{ has: boolean }>("select has_table_privilege($1, $2, $3) as has", [role, `public.${table}`, priv])).rows[0].has;
  for (const t of ["stella_businesses", "stella_usage", "stella_rate"]) {
    assert.equal(await p("anon", t, "select"), false, `anon no debe leer ${t}`);
    assert.equal(await p("authenticated", t, "insert"), false);
    assert.equal(await p("service_role", t, "select"), true);
  }
  const f = async (role: string, fn: string) => (await db.query<{ has: boolean }>("select has_function_privilege($1, $2, 'execute') as has", [role, fn])).rows[0].has;
  assert.equal(await f("anon", "stella_gate(text, jsonb, bigint, bigint, bigint, bigint)"), false);
  assert.equal(await f("authenticated", "stella_usage_add(text, integer, bigint, bigint, bigint, integer, integer)"), false);
  assert.equal(await f("service_role", "stella_gate(text, jsonb, bigint, bigint, bigint, bigint)"), true);
});

test("sql: el límite deja pasar hasta el máximo y rechaza el siguiente (ventana fija)", async () => {
  const rule = { name: "ip", key: "ip:test1:chat", window: 600, limit: 3 };
  assert.equal(await gate("x", [rule]), "ok");
  assert.equal(await gate("x", [rule]), "ok");
  assert.equal(await gate("x", [rule]), "ok");
  assert.equal(await gate("x", [rule]), "rate:ip");
  assert.equal(await gate("x", [rule]), "rate:ip");
});

test("sql: cada clave tiene su propio contador (aislamiento entre IPs, sesiones y negocios)", async () => {
  const a = { name: "ip", key: "ip:A:chat", window: 600, limit: 1 };
  const b = { name: "ip", key: "ip:B:chat", window: 600, limit: 1 };
  assert.equal(await gate("x", [a]), "ok");
  assert.equal(await gate("x", [b]), "ok", "otra IP no se ve afectada");
  assert.equal(await gate("x", [a]), "rate:ip");
});

test("sql: devuelve el nombre del primer límite superado", async () => {
  const rules = [
    { name: "burst", key: "tok:S:burst", window: 3, limit: 100 },
    { name: "session", key: "tok:S:chat", window: 3600, limit: 1 },
  ];
  assert.equal(await gate("x", rules), "ok");
  assert.equal(await gate("x", rules), "rate:session");
});

test("sql: presupuestos — negocio/día, negocio/mes, global/día y global/mes cortan antes de consumir cuota", async () => {
  await db.query("select stella_usage_add('neg-a', 1, 1000, 100, 600000, 0, 0)"); // 0,60 USD de neg-a
  await db.query("select stella_usage_add('neg-b', 1, 1000, 100, 500000, 0, 0)"); // 0,50 USD de neg-b
  const rule = { name: "ip", key: "ip:budget:chat", window: 600, limit: 1 };
  assert.equal(await gate("neg-a", [rule], [600000, 0, 0, 0]), "budget:business-day");
  assert.equal(await gate("neg-a", [rule], [0, 600000, 0, 0]), "budget:business-month");
  assert.equal(await gate("neg-a", [rule], [0, 0, 1100000, 0]), "budget:global-day", "suma de todos los negocios");
  assert.equal(await gate("neg-a", [rule], [0, 0, 0, 1100000]), "budget:global-month");
  // Los rechazos por presupuesto no gastaron cuota del límite (limit 1): el primer uso real es «ok» y el segundo no.
  assert.equal(await gate("neg-b", [rule], [600000, 0, 0, 0]), "ok", "neg-b no ha llegado a SU tope");
  assert.equal(await gate("neg-b", [rule], [600000, 0, 0, 0]), "rate:ip");
});

test("sql: el consumo se acumula por negocio y día", async () => {
  await db.query("select stella_usage_add('neg-z', 1, 2000, 100, 250, 0, 0)");
  await db.query("select stella_usage_add('neg-z', 1, 2000, 100, 250, 1, 1)");
  const r = await db.query<{ messages: number; cost_micro: string; errors: number; contacts: number }>("select * from stella_usage where business_id = 'neg-z'");
  assert.equal(r.rows.length, 1);
  assert.equal(r.rows[0].messages, 2);
  assert.equal(Number(r.rows[0].cost_micro), 500);
  assert.equal(r.rows[0].errors, 1);
  assert.equal(r.rows[0].contacts, 1);
});

test("sql: restricciones de la ficha (id válido, whatsapp solo dígitos, presupuesto no negativo)", async () => {
  const ins = (id: string, wa: string, daily = 1) =>
    db.query("insert into stella_businesses (id, name, whatsapp, daily_budget_usd) values ($1, 'Negocio', $2, $3)", [id, wa, daily]);
  await ins("buen-id", "34600111222");
  await assert.rejects(ins("Mal Id", "34600111222"));
  await assert.rejects(ins("otro-id", "+34 600"));
  await assert.rejects(ins("otro-id2", "34600111222", -1));
  const def = await db.query<{ active: boolean }>("select active from stella_businesses where id = 'buen-id'");
  assert.equal(def.rows[0].active, false, "un negocio nuevo nace DESACTIVADO");
});
