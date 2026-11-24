import { test } from "node:test";
import assert from "node:assert/strict";
import { directionsFrom, getPositionOnce, mapLinks } from "../src/lib/geo";

test("mapLinks: enlaces gratuitos de Google Maps y OpenStreetMap, con la dirección codificada y sin claves", () => {
  const l = mapLinks({ address: "Calle Mayor 1, Zaragoza" })!;
  assert.equal(l.view, "https://www.google.com/maps/search/?api=1&query=Calle%20Mayor%201%2C%20Zaragoza");
  assert.match(l.directions, /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=Calle%20Mayor/);
  assert.match(l.osm, /^https:\/\/www\.openstreetmap\.org\/search\?query=/);
  for (const u of Object.values(l)) assert.ok(!/key=|apikey/i.test(u), "sin claves de API");
  assert.equal(mapLinks({ address: "   " }), null);
  assert.equal(mapLinks({}), null);
});

test("mapLinks: con coordenadas válidas se usan; con inválidas se cae a la dirección; nada puede inyectar parámetros", () => {
  assert.match(mapLinks({ lat: 41.65, lng: -0.88, address: "x" })!.view, /query=41\.65%2C-0\.88$/);
  assert.match(mapLinks({ lat: 999, lng: 0, address: "Calle A" })!.view, /query=Calle%20A$/);
  assert.match(mapLinks({ lat: Number.NaN, lng: 0, address: "Calle A" })!.view, /query=Calle%20A$/);
  const evil = mapLinks({ address: "Calle&destination=https://malo.com#" })!;
  assert.ok(!evil.directions.includes("&destination=https"), "el & de la dirección se codifica");
  assert.equal(new URL(evil.directions).searchParams.get("destination"), "Calle&destination=https://malo.com#");
});

test("directionsFrom: añade el origen solo con coordenadas válidas", () => {
  const u = directionsFrom({ lat: 41.6, lng: -0.9 }, { address: "Calle A, Zaragoza" })!;
  const q = new URL(u).searchParams;
  assert.equal(q.get("origin"), "41.6,-0.9");
  assert.equal(q.get("destination"), "Calle A, Zaragoza");
  assert.equal(directionsFrom({ lat: 200, lng: 0 }, { address: "x" }), null);
  assert.equal(directionsFrom({ lat: 1, lng: 1 }, {}), null);
});

test("getPositionOnce: una sola lectura, y errores claros (sin soporte, sin https, denegado, sin señal, tiempo)", async () => {
  const mk = (code: number | null) => ({ geolocation: { getCurrentPosition: (ok: (p: unknown) => void, err: (e: { code: number }) => void) => (code === null ? ok({ coords: { latitude: 41.6, longitude: -0.9 } }) : err({ code })) } }) as never;
  assert.deepEqual(await getPositionOnce(mk(null), true), { ok: true, lat: 41.6, lng: -0.9 });
  assert.deepEqual(await getPositionOnce(mk(1), true), { ok: false, error: "denied" });
  assert.deepEqual(await getPositionOnce(mk(2), true), { ok: false, error: "unavailable" });
  assert.deepEqual(await getPositionOnce(mk(3), true), { ok: false, error: "timeout" });
  assert.deepEqual(await getPositionOnce(mk(null), false), { ok: false, error: "insecure" });
  assert.deepEqual(await getPositionOnce({} as never, true), { ok: false, error: "unsupported" });
  let watch = false;
  await getPositionOnce({ geolocation: { getCurrentPosition: (ok: (p: unknown) => void) => ok({ coords: { latitude: 1, longitude: 2 } }), watchPosition: () => { watch = true; } } } as never, true);
  assert.equal(watch, false, "nunca se usa watchPosition (seguimiento continuo)");
});
