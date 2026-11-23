// Dobles de prueba compartidos: base de datos en memoria y cliente de IA falso (no se llama a la API real).
import type { StellaBusiness } from "../src/lib/stella/ficha";
import type { GateRequest, GateResult, StellaStore, UsageDelta } from "../src/lib/stella/types";
import type { ModelClient } from "../src/lib/stella/chat";
import type { StellaConfig } from "../src/lib/stella/config";
import type { NewLead } from "../src/lib/db";

export const SECRET = "secreto-de-pruebas-0123456789";

export function biz(over: Partial<StellaBusiness> = {}): StellaBusiness {
  return {
    id: "peluqueria-ana",
    name: "Peluquería Ana",
    sector: "Peluquería",
    area: "Zaragoza",
    about: "Peluquería de barrio con 20 años de experiencia en corte y color.",
    services: [{ name: "Corte de pelo", price: "15 €" }, { name: "Tinte", price: "desde 35 €" }],
    faqs: [{ q: "¿Aceptáis tarjeta?", a: "Sí, Visa y Mastercard." }],
    whatsapp: "34600111222",
    greeting: "¡Hola! Soy Stella, la asistente virtual con IA de Peluquería Ana.",
    notAvailable: [],
    privacyUrl: "https://peluqueriaana.es/privacidad",
    domains: ["peluqueriaana.es"],
    active: true,
    dailyBudgetUsd: 1,
    monthlyBudgetUsd: 5,
    ...over,
  };
}

export const config = (over: Partial<StellaConfig> = {}): StellaConfig => ({
  enabled: true,
  model: "claude-haiku-5-5",
  secret: SECRET,
  globalDailyMicro: 3_000_000,
  globalMonthlyMicro: 20_000_000,
  ...over,
});

export class FakeStore implements StellaStore {
  businesses = new Map<string, StellaBusiness>();
  gateCalls: GateRequest[] = [];
  gateResult: GateResult = { ok: true };
  usage: UsageDelta[] = [];
  contacts: NewLead[] = [];
  contactOk = true;
  constructor(...list: StellaBusiness[]) {
    list.forEach((b) => this.businesses.set(b.id, b));
  }
  async getBusiness(id: string) {
    return this.businesses.get(id) ?? null;
  }
  async gate(req: GateRequest) {
    this.gateCalls.push(req);
    return this.gateResult;
  }
  async addUsage(d: UsageDelta) {
    this.usage.push(d);
  }
  async insertContact(l: NewLead) {
    if (!this.contactOk) return { ok: false };
    this.contacts.push(l);
    return { ok: true, id: "lead-1" };
  }
}

export interface FakeModel extends ModelClient {
  calls: Parameters<ModelClient["messages"]["create"]>[0][];
}

/** Cliente de IA falso: devuelve `text` con el consumo indicado, o lanza `error`. */
export function fakeModel(opts: { text?: string; error?: unknown; usage?: { input_tokens: number; output_tokens: number }; stop?: string } = {}): FakeModel {
  const calls: FakeModel["calls"] = [];
  return {
    calls,
    messages: {
      async create(params) {
        calls.push(params);
        if (opts.error) throw opts.error;
        return {
          id: "msg_test",
          type: "message",
          role: "assistant",
          model: params.model,
          content: [{ type: "text", text: opts.text ?? "Respuesta de prueba.", citations: null }],
          stop_reason: opts.stop ?? "end_turn",
          stop_sequence: null,
          usage: { input_tokens: opts.usage?.input_tokens ?? 2000, output_tokens: opts.usage?.output_tokens ?? 100 },
        } as never;
      },
    },
  };
}
