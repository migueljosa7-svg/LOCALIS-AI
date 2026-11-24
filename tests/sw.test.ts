// Prueba del Service Worker (public/sw.js) ejecutándolo con un entorno simulado: no guarda páginas privadas ni el chat
// de Stella, y nunca resuelve una petición con «undefined» (error «Failed to convert value to Response»).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

type Handler = (e: unknown) => void;

function load(fetchImpl: (r: unknown) => Promise<unknown>) {
  const handlers: Record<string, Handler> = {};
  const store = new Map<string, unknown>();
  const caches = {
    open: async () => ({ addAll: async () => undefined, put: async (k: unknown, v: unknown) => void store.set(String(typeof k === "string" ? k : (k as { url: string }).url), v) }),
    keys: async () => [],
    delete: async () => true,
    match: async (k: unknown) => store.get(String(typeof k === "string" ? k : (k as { url: string }).url)),
  };
  class FakeResponse {
    ok = true;
    status = 200;
    static error() { const r = new FakeResponse(); r.status = 0; r.ok = false; return r; }
    clone() { return this; }
  }
  const ctx = {
    self: { addEventListener: (n: string, h: Handler) => (handlers[n] = h), location: { origin: "https://localis.test" }, skipWaiting: () => undefined, clients: { claim: () => undefined } },
    caches, fetch: fetchImpl, Response: FakeResponse, URL,
  };
  vm.runInNewContext(readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"), ctx);
  const fire = (url: string, mode = "cors", method = "GET") => {
    let responded: Promise<unknown> | null = null;
    handlers.fetch({ request: { url, method, mode }, respondWith: (p: Promise<unknown>) => (responded = p) });
    return responded as Promise<unknown> | null;
  };
  return { fire, store, FakeResponse };
}

test("sw: no intercepta ni guarda /admin, /stella/embed, /prueba-stella ni /api (datos privados y sesiones firmadas)", async () => {
  const { fire, store } = load(async () => new (class { ok = true; status = 200; clone() { return this; } })());
  for (const p of ["/admin", "/admin/stella/mi-negocio", "/admin/diseno/123", "/stella/embed?negocio=x", "/prueba-stella", "/api/stella"]) {
    assert.equal(fire(`https://localis.test${p}`, "navigate"), null, `${p} no debe pasar por el Service Worker`);
  }
  assert.equal(store.size, 0, "no se guarda nada en caché");
  assert.equal(fire("https://localis.test/admin", "cors", "POST"), null);
  assert.notEqual(fire("https://localis.test/privacy", "navigate"), null, "las páginas públicas siguen funcionando offline");
});

test("sw: un recurso estático que falla sin caché responde con un error válido (nunca undefined)", async () => {
  const { fire, FakeResponse } = load(async () => { throw new TypeError("network"); });
  const out = await fire("https://localis.test/_next/static/chunk.js");
  assert.ok(out instanceof FakeResponse && (out as { status: number }).status === 0, "Response.error() en lugar de undefined");
});
