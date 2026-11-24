// «Qué hace el negocio» con web, dirección e información adicional.
// La ficha guarda estos datos dentro del campo «about» (así no hace falta cambiar la base de datos).
export const ABOUT_MAX = 1200;

export interface AboutParts {
  description: string;
  website: string;
  address: string;
  extra: string;
}

export function composeAbout(p: AboutParts): string {
  return [
    p.description.trim(),
    p.website.trim() && `Web: ${p.website.trim()}`,
    p.address.trim() && `Dirección: ${p.address.trim()}`,
    p.extra.trim() && `Información adicional: ${p.extra.trim().replace(/\n+/g, " ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function parseAbout(about: string): AboutParts {
  const out: AboutParts = { description: "", website: "", address: "", extra: "" };
  const desc: string[] = [];
  for (const line of about.split("\n")) {
    const m = /^(Web|Dirección|Información adicional): ?(.*)$/.exec(line);
    if (m) out[m[1] === "Web" ? "website" : m[1] === "Dirección" ? "address" : "extra"] = m[2];
    else desc.push(line);
  }
  out.description = desc.join("\n").trim();
  return out;
}
