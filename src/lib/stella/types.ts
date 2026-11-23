import type { NewLead } from "@/lib/db";
import type { StellaBusiness } from "./ficha";

export interface RateRule {
  /** nombre corto del límite (se devuelve como «rate:<name>» si se supera) */
  name: string;
  key: string;
  /** ventana en segundos */
  window: number;
  limit: number;
}

export interface GateRequest {
  businessId: string;
  rates: RateRule[];
  /** topes en micro-USD; 0 = sin comprobar */
  bizDayMicro: number;
  bizMonthMicro: number;
  globalDayMicro: number;
  globalMonthMicro: number;
}

export type GateResult = { ok: true } | { ok: false; reason: string };

export interface UsageDelta {
  businessId: string;
  messages: number;
  inputTokens: number;
  outputTokens: number;
  costMicro: number;
  errors: number;
  contacts: number;
}

/** Lo que el núcleo de Stella necesita de la base de datos (se sustituye por un doble en los tests). */
export interface StellaStore {
  getBusiness(id: string): Promise<StellaBusiness | null>;
  gate(req: GateRequest): Promise<GateResult>;
  addUsage(delta: UsageDelta): Promise<void>;
  insertContact(lead: NewLead): Promise<{ ok: boolean; id?: string }>;
}
