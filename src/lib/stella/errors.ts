// Clasificación SEGURA de los errores de la API de Anthropic. Sin dependencias del SDK (se basa en las propiedades
// que expone su clase APIError). Nunca incluye la clave, el contenido de la conversación ni el texto genérico de
// la excepción: solo estado HTTP, tipo de error, código, el mensaje que devuelve el propio proveedor (sin claves)
// y el identificador de petición, que sirve para reclamar a Anthropic.

export interface ErrorInfo {
  kind: "api" | "timeout" | "connection" | "other";
  status: number | null;
  type: string | null;
  code: string | null;
  /** mensaje del PROVEEDOR (p. ej. «model: xxx»), saneado y acortado; null si no lo hay */
  message: string | null;
  requestId: string | null;
}

const clean = (s: string, max: number): string =>
  s
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "[clave]")
    .replace(/\b(Bearer|x-api-key)\s+\S+/gi, "$1 [oculto]")
    .replace(/[\u0000-\u001f]/g, " ")
    .trim()
    .slice(0, max);

export function describeError(err: unknown): ErrorInfo {
  const e = (err ?? {}) as Record<string, unknown>;
  const name = typeof e.constructor === "function" ? String((e.constructor as { name?: string }).name ?? "") : "";
  const status = typeof e.status === "number" ? e.status : null;
  const str = (v: unknown, max: number) => (typeof v === "string" && v ? clean(v, max) : null);
  const kind: ErrorInfo["kind"] = /Timeout/i.test(name) ? "timeout" : /Connection/i.test(name) ? "connection" : status !== null ? "api" : "other";
  return {
    kind,
    status,
    type: str(e.type, 60),
    code: str(e.errorCode, 80),
    message: status !== null ? str(e.apiMessage, 240) : null,
    requestId: str(e.requestID, 80),
  };
}

/** Explicación en español de la causa más probable y de qué hacer. */
export function hint(i: ErrorInfo): string {
  if (i.kind === "timeout") return "La API de Anthropic tardó demasiado (más de 25 s). Suele ser temporal; si se repite, prueba con otro modelo o revisa el estado de Anthropic.";
  if (i.kind === "connection") return "No se pudo conectar con la API de Anthropic desde el servidor. Revisa que no haya definido ANTHROPIC_BASE_URL por error y el estado de Anthropic.";
  if (i.status === 401 || i.type === "authentication_error") return "La clave de API no es válida: mal copiada (espacios o comillas), revocada, o de otra organización. Crea una nueva en la consola de Anthropic, ponla en Vercel (Preview) y haz Redeploy.";
  if (i.status === 403 || i.type === "permission_error") return "La clave no tiene permiso para este modelo o la organización no lo tiene habilitado. Prueba con otro modelo (STELLA_MODEL=claude-sonnet-5-5) o revisa los permisos en la consola.";
  if (i.status === 404 || i.type === "not_found_error") return "Modelo no encontrado: el valor de STELLA_MODEL no es un identificador válido (debe ser exactamente claude-haiku-5-5 o claude-sonnet-5-5). Bórrala para usar el predeterminado.";
  if (i.status === 400 && /credit|balance|billing|plan/i.test(i.message ?? "")) return "Saldo insuficiente en la cuenta de Anthropic: añade crédito o activa la facturación en la consola.";
  if (i.status === 400 || i.type === "invalid_request_error") return "Anthropic rechaza el formato de la petición. Revisa el mensaje del proveedor de arriba: indica qué campo no acepta.";
  if (i.status === 413) return "La petición es demasiado grande.";
  if (i.status === 429 || i.type === "rate_limit_error") return "Límite de uso de tu cuenta de Anthropic alcanzado (peticiones o tokens por minuto). Espera un minuto o sube el límite en la consola.";
  if (i.status !== null && i.status >= 500) return "La API de Anthropic está saturada o con incidencia (5xx/529). Suele ser temporal.";
  return "Error no clasificado. Revisa los registros de Vercel (buscar «[stella]»).";
}

/** Línea para los registros del servidor (sin secretos ni conversación). */
export const logLine = (i: ErrorInfo): string =>
  `tipo=${i.kind} estado=${i.status ?? "-"} error=${i.type ?? "-"} codigo=${i.code ?? "-"} peticion=${i.requestId ?? "-"} mensaje=${i.message ?? "-"}`;
