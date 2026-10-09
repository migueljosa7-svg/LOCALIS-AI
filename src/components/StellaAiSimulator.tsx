"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Calendar, MessageCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SAMPLE_STELLA_MESSAGES } from "@/lib/demoSamples";

export type StellaMsg = {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  timestamp: string;
};

const QUICK_REPLIES: Record<string, string[]> = {
  cita: [
    "He reservado Jueves 11:00 en tu Google Calendar.",
    "WhatsApp de confirmacion enviado al cliente.",
  ],
  factura: [
    "Factura INV-2026-104 generada: Fruteria Pepe, 42.36 EUR.",
    "PDF listo para descargar y enviar por WhatsApp.",
  ],
  tracking: [
    "Pedido #104: repartidor a 1.2 km, ETA 11:25.",
    "Enlace de seguimiento en vivo abierto en el mapa.",
  ],
  default: ["Accion registrada. Te muestro el resultado en el panel."],
};

export function pickFlow(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("cita") || t.includes("jueves") || t.includes("reserva")) return "cita";
  if (t.includes("factura") || t.includes("pepe") || t.includes("inv")) return "factura";
  if (t.includes("repartidor") || t.includes("pedido") || t.includes("104") || t.includes("donde")) return "tracking";
  return "default";
}

export const CHIPS = [
  { icon: Calendar, label: "Reservar cita jueves 11:00", text: "Stella, reserva cita jueves 11:00" },
  { icon: MessageCircle, label: "Factura Fruteria Pepe", text: "Stella, genera la factura de Fruteria Pepe" },
  { icon: MapPin, label: "Localizar pedido 104", text: "Stella, donde esta el pedido 104?" },
];

export default function StellaAiSimulator() {
  const [messages, setMessages] = useState<StellaMsg[]>(SAMPLE_STELLA_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lastFlow, setLastFlow] = useState<string | null>(null);

  const handleSend = (text: string) => {
    if (!text.trim() || typing) return;
    const flow = pickFlow(text);
    setMessages((prev) => [
      ...prev,
      { id: "user_" + Date.now(), role: "user", content: text, timestamp: "ahora" },
    ]);
    setInput("");
    setTyping(true);
    setLastFlow(flow);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        ...QUICK_REPLIES[flow].map((content, i) => ({
          id: "ai_" + Date.now() + "_" + i,
          role: "ai" as const,
          content,
          timestamp: "ahora" as const,
        })),
      ]);
      setTyping(false);
    }, 700);
  };

  return (
    <section id="stella" className="w-full py-20 lg:py-28 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Stella AI · ERP
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Habla con <span className="gradient-text">Stella</span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
            Pulsa un acceso rapido o escribe: citas, facturas y tracking en vivo.
          </p>
        </div>
        <div className="w-full max-w-4xl mx-auto">
          <div className="glass rounded-2xl overflow-hidden border border-border w-full">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-background/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cobalt-500 flex items-center justify-center text-white font-bold shrink-0">
                S
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">Stella AI</h3>
                <p className="text-xs text-muted">Tu asistente inteligente</p>
              </div>
              <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full font-medium shrink-0">
                Online
              </span>
            </div>
            <StellaMessageList messages={messages} typing={typing} />
            <StellaInputBar
              input={input}
              setInput={setInput}
              onSend={handleSend}
              typing={typing}
              lastFlow={lastFlow}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function StellaMessageList({
  messages,
  typing,
}: {
  messages: StellaMsg[];
  typing: boolean;
}) {
  return (
    <div className="h-64 lg:h-80 overflow-y-auto p-4 space-y-3 w-full">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white rounded-br-sm"
                  : "bg-background border border-border rounded-bl-sm"
              )}
            >
              <div className="whitespace-pre-line">{msg.content}</div>
              <div className={cn("text-xs mt-1", msg.role === "user" ? "text-white/70" : "text-muted")}>
                {msg.timestamp}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {typing && (
        <div className="flex justify-start w-full">
          <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted">
            Stella esta escribiendo...
          </div>
        </div>
      )}
    </div>
  );
}

export function StellaInputBar({
  input,
  setInput,
  onSend,
  typing,
  lastFlow,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: (text: string) => void;
  typing: boolean;
  lastFlow: string | null;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 border-t border-border bg-background/50 w-full">
      <div className="flex flex-wrap gap-2 w-full">
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => onSend(chip.text)}
            disabled={typing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-xs font-medium text-foreground border border-border hover:border-cyan-500/40 hover:text-cyan-400 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <chip.icon size={12} />
            {chip.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend(input)}
          placeholder="Escribe un mensaje..."
          className="flex-1 min-w-0 px-4 py-3 rounded-xl glass text-sm bg-background border border-border focus-ring text-foreground placeholder:text-muted"
        />
        <button
          type="button"
          onClick={() => onSend(input)}
          disabled={typing}
          className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white hover:shadow-neonglow hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          aria-label="Enviar"
        >
          <Send size={18} />
        </button>
      </div>
      {lastFlow && (
        <p className="text-xs text-muted">
          Ultimo flujo ejecutado: <span className="text-cyan-400 font-semibold">{lastFlow}</span>
        </p>
      )}
    </div>
  );
}
