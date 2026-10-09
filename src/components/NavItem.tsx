import { cn } from "@/lib/utils";

export function NavItem({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all",
        active
          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          : "glass text-foreground border border-border hover:border-cyan-500/20"
      )}
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
    </button>
  );
}
