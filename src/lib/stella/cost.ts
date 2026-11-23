// Precios oficiales de la API de Claude (USD por millón de tokens) y cálculo de coste.
// Fuente: https://platform.claude.com/docs/en/about-claude/pricing (verificado el 23-nov-2026).
// Si cambias de modelo con STELLA_MODEL y no está aquí, se aplica el precio de Sonnet 5.5
// (más prudente que subestimar el gasto).

export interface ModelPrice {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite5m: number;
  /** Haiku 5.5 cobra más si el prompt supera 100.000 tokens. */
  longInput?: number;
  longOutput?: number;
  longCacheRead?: number;
  longCacheWrite5m?: number;
}

export const PRICES: Record<string, ModelPrice> = {
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite5m: 0.125, longInput: 0.5, longOutput: 2.5, longCacheRead: 0.05, longCacheWrite5m: 0.625 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.1, cacheWrite5m: 2.5 },
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite5m: 5 },
};
const FALLBACK_PRICE = PRICES["claude-sonnet-5-5"];

export interface Usage {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

/** Coste en micro-dólares (1.000.000 = 1 USD), redondeado hacia arriba. 1 USD/MTok = 1 micro-USD/token. */
export function costMicro(model: string, u: Usage): number {
  const p = PRICES[model] ?? FALLBACK_PRICE;
  const i = u.input_tokens ?? 0;
  const o = u.output_tokens ?? 0;
  const cr = u.cache_read_input_tokens ?? 0;
  const cw = u.cache_creation_input_tokens ?? 0;
  const long = p.longInput !== undefined && i + cr + cw > 100_000;
  const cost =
    i * (long ? p.longInput! : p.input) +
    o * (long ? p.longOutput! : p.output) +
    cr * (long ? p.longCacheRead! : p.cacheRead) +
    cw * (long ? p.longCacheWrite5m! : p.cacheWrite5m);
  return Math.ceil(cost);
}

export const usdToMicro = (usd: number): number => Math.round(usd * 1_000_000);
export const microToUsd = (micro: number): number => micro / 1_000_000;
