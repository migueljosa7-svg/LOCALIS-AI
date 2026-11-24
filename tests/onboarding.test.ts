import { test } from "node:test";
import assert from "node:assert/strict";
import { createOnboardingToken, readOnboardingToken, ONBOARDING_TTL_SECONDS } from "../src/lib/stella/onboarding";
import { signToken } from "../src/lib/stella/token";
import { composeAbout, parseAbout } from "../src/lib/stella/about";
import { assertPublicUrl, extractDraft, fetchPublicPage, isPrivateIp } from "../src/lib/stella/import";

const S = "secreto-de-pruebas-0123456789";
const NOW = 1_800_000_000;

test("enlace de alta: ligado a un negocio, caduca, no se puede falsificar y no vale un token del chat", async () => {
  const t = await createOnboardingToken(S, "peluqueria-ana", NOW);
  assert.equal(await readOnboardingToken(S, t, NOW + 60), "peluqueria-ana");
  assert.equal(await readOnboardingToken(S, t, NOW + ONBOARDING_TTL_SECONDS + 5), null, "caducado");
  assert.equal(await readOnboardingToken("otro-secreto", t, NOW + 60), null);
  assert.equal(await readOnboardingToken(S, t.slice(0, -3) + "abc", NOW + 60), null, "manipulado");
  const body = Buffer.from(JSON.stringify({ b: "otro-negocio", s: "x", h: "alta", i: NOW, e: NOW + 99999 })).toString("base64url");
  assert.equal(await readOnboardingToken(S, `${body}.${t.split(".")[1]}`, NOW + 60), null, "cambiar el negocio invalida la firma");
  const chatToken = await signToken(S, { b: "peluqueria-ana", s: "s", h: "web.com", i: NOW, e: NOW + 9999 });
  assert.equal(await readOnboardingToken(S, chatToken, NOW + 60), null, "un token del chat no sirve para el alta");
  for (const bad of [undefined, null, "", "x.y", 5]) assert.equal(await readOnboardingToken(S, bad, NOW), null);
});

test("composeAbout / parseAbout: ida y vuelta con web, dirección e información adicional", () => {
  const a = composeAbout({ description: "Peluquería de barrio.\nTrabajamos con cita.", website: "https://ana.es", address: "Calle Falsa 1, Zaragoza", extra: "Aparcamiento\ngratuito" });
  assert.match(a, /Web: https:\/\/ana\.es/);
  assert.deepEqual(parseAbout(a), { description: "Peluquería de barrio.\nTrabajamos con cita.", website: "https://ana.es", address: "Calle Falsa 1, Zaragoza", extra: "Aparcamiento gratuito" });
  assert.deepEqual(parseAbout("Solo texto"), { description: "Solo texto", website: "", address: "", extra: "" });
});

test("importador: bloquea IPs y direcciones internas, esquemas raros, puertos y credenciales (SSRF)", async () => {
  for (const ip of ["127.0.0.1", "10.1.2.3", "192.168.0.5", "172.16.0.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1", "224.0.0.1"]) assert.ok(isPrivateIp(ip), ip);
  for (const ip of ["8.8.8.8", "93.184.216.34", "2606:4700::1111"]) assert.ok(!isPrivateIp(ip), ip);
  const pub = async () => [{ address: "93.184.216.34" }];
  const priv = async () => [{ address: "10.0.0.7" }];
  for (const u of ["http://localhost/", "http://127.0.0.1/", "http://[::1]/", "http://169.254.169.254/latest/meta-data", "file:///etc/passwd", "ftp://x.com", "javascript:alert(1)", "https://user:pw@x.com", "https://x.com:8080", "http://miservidor.local/", "no es url", "http://10.0.0.1"]) {
    await assert.rejects(assertPublicUrl(u, pub), () => true, u);
  }
  await assert.rejects(assertPublicUrl("https://interno.empresa.com", priv), /internas/, "un dominio que resuelve a IP privada");
  await assert.rejects(assertPublicUrl("https://no-existe.example", async () => { throw new Error("ENOTFOUND"); }), /no responde/);
  assert.equal((await assertPublicUrl("https://www.minegocio.es/contacto", pub)).hostname, "www.minegocio.es");
});

test("importador: las redirecciones se revisan una a una y se limitan; solo HTML", async () => {
  const lookup = async (h: string) => [{ address: h === "malo.com" ? "10.0.0.1" : "93.184.216.34" }];
  const redirect = (loc: string) => (async () => new Response(null, { status: 302, headers: { location: loc } })) as never;
  await assert.rejects(fetchPublicPage("https://bien.com", { lookup, fetchImpl: redirect("http://malo.com/admin") }), /internas/);
  await assert.rejects(fetchPublicPage("https://bien.com", { lookup, fetchImpl: redirect("/otra") }), /redirecciones/);
  const html = (ct: string) => (async () => new Response("<html><title>X</title></html>", { status: 200, headers: { "content-type": ct } })) as never;
  assert.equal((await fetchPublicPage("https://bien.com", { lookup, fetchImpl: html("text/html; charset=utf-8") })).html.includes("<title>X</title>"), true);
  await assert.rejects(fetchPublicPage("https://bien.com", { lookup, fetchImpl: html("application/pdf") }), /no es una página web/);
  await assert.rejects(fetchPublicPage("https://bien.com", { lookup, fetchImpl: (async () => new Response("x", { status: 500 })) as never }), /error 500/);
});

const PAGE = `<!doctype html><html><head><title>Peluquería Ana | Zaragoza</title>
<meta name="description" content="Peluquería de barrio con 20 años de experiencia en corte y color.">
<meta property="og:site_name" content="Peluquería Ana">
<script>var tel="600999888";</script>
<script type="application/ld+json">{"address":{"streetAddress":"Calle Falsa 123","addressLocality":"Zaragoza"}}</script></head>
<body><h1>Tu mejor versión</h1><ul><li>Corte de pelo — 15 €</li><li>Tinte desde 35 €</li><li>Manicura: 20,50 €</li><li>Sin precio</li></ul>
<p>Llama al 976 123 456 o al 612 34 56 78. Escríbenos a Hola@PeluqueriaAna.es</p>
<a href="https://wa.me/34612345678">WhatsApp</a><a href="https://www.instagram.com/peluqueriaana">IG</a><a href="https://facebook.com/peluqueriaana">FB</a>
<img src="logo@2x.png"></body></html>`;

test("importador: extrae un BORRADOR (nombre, descripción, contacto, redes, líneas con precio) sin inventar nada", () => {
  const d = extractDraft(PAGE, "https://www.peluqueriaana.es/");
  assert.equal(d.name, "Peluquería Ana");
  assert.match(d.description, /20 años/);
  assert.equal(d.headline, "Tu mejor versión");
  assert.deepEqual(d.emails, ["hola@peluqueriaana.es"]);
  assert.ok(d.phones.includes("976123456") && d.phones.includes("612345678"), d.phones.join());
  assert.ok(!d.phones.includes("600999888"), "no se leen números de los scripts");
  assert.equal(d.whatsapp, "34612345678");
  assert.match(d.instagram, /instagram\.com\/peluqueriaana/);
  assert.equal(d.address, "Calle Falsa 123, Zaragoza");
  assert.equal(d.host, "peluqueriaana.es");
  assert.deepEqual(d.priceLines.map((l) => l.split(" | ")[1]), ["15 €", "desde 35 €", "20,50 €"]);
  assert.ok(!d.priceLines.some((l) => /Sin precio/.test(l)), "sin precio no se inventa");
  const empty = extractDraft("<html></html>", "https://x.es");
  assert.deepEqual([empty.name, empty.phones.length, empty.priceLines.length], ["", 0, 0]);
});
