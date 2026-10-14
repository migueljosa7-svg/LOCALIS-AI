import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SAMPLE_STELLA_MESSAGES } from "@/lib/demoSamples";

export function StellaChatPanel() {
  return (
    <div className="glass rounded-xl p-5 border border-border md:col-span-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
          <MessageCircle size={14} className="text-cyan-400" />
        </div>
        <h4 className="font-semibold text-sm">Chat de Stella</h4>
      </div>
      <div className="h-32 overflow-y-auto space-y-2">
        {SAMPLE_STELLA_MESSAGES.map((msg) => (
          <div key={msg.id} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3 py-2 text-xs",
                msg.role === "user"
                  ? "bg-cyan-500/20 text-white rounded-br-sm"
                  : "bg-background border border-border rounded-bl-sm",
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
