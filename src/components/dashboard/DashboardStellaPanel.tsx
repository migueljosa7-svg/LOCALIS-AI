"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectIntent, type IntentId, type StellaAction } from "@/components/stella/stellaEngine";

interface ChatMsg {
  id: string;
  role: "user" | "ai";
  text: string;
  intent?: IntentId;
  action?: StellaAction;
}

const ACTION_LOG: Record<string, string> = {
  invoice: "🧾 Generó borrador de factura",
  summary: "📈 Desplegó resumen de ventas",
  tracking: "📍 Abrió seguimiento GPS",
  calendar: "📅 Agendó cita en Google Calendar",
};

const QUICK = ["Resumen de hoy", "Genera la factura de Pepe", "¿Dónde está el pedido #104?", "Reserva el jueves 11:00"];

export function DashboardStellaPanel() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { id: "s0", role: "ai", text: "Hola, soy Stella 👋 Dime una orden y la ejecuto en tu negocio." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [history, setHistory] = useState<{ id: string; text: string }[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, typing]);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    setMsgs((p) => [...p, { id: "u" + Date.now(), role: "user", text }]);
    setInput("");
    setTyping(true);
    const { reply, action, intent } = detectIntent(text);
    window.setTimeout(() => {
      setMsgs((p) => [...p, { id: "a" + Date.now(), role: "ai", text: reply, intent, action }]);
      setTyping(false);
      if (action && ACTION_LOG[action]) {
        setHistory((h) => [{ id: "h" + Date.now(), text: ACTION_LOG[action] }, ...h].slice(0, 6));
      }
    }, 700);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Chat */}
      <div className="lg:col-span-2 flex flex-col rounded-xl border border-border bg-background/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Bot size={16} className="text-cyan-400" />
          <p className="text-sm font-semibold">Consola de Stella</p>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
            ● Activa
          </span>
        </div>

        <div className="flex-1 min-h-[280px] max-h-[360px] overflow-y-auto p-4 space-y-3">
          <AnimatePresence initial={false}>
            {msgs.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line",
                    m.role === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white rounded-br-sm"
                      : "bg-background border border-border rounded-bl-sm"
                  )}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <div className="flex justify-start">
              <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-muted">
                Stella está escribiendo…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="px-4 pt-2 pb-1 flex flex-wrap gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2 p-4 pt-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Escribe una orden a Stella…"
            className="flex-1 px-4 py-2.5 rounded-xl bg-background/70 border border-border text-sm text-foreground placeholder:text-muted/70 focus-ring"
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={typing}
            aria-label="Enviar"
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white btn-glow cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Historial de acciones de la IA */}
      <div className="rounded-xl border border-border bg-background/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={15} className="text-cyan-400" />
          <p className="text-sm font-semibold">Acciones ejecutadas</p>
        </div>
        {history.length === 0 ? (
          <p className="text-xs text-muted">Aún no hay acciones. Pide algo a Stella y aparecerá aquí.</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {history.map((h) => (
                <motion.li
                  key={h.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs p-2.5 rounded-lg bg-background/60 border border-border/50"
                >
                  {h.text}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

