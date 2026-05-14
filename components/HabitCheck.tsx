import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface HabitCheckProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  points?: number;
}

export function HabitCheck({ label, checked, onChange, points }: HabitCheckProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-lg border transition-all text-left",
        checked ? "border-primary/40 bg-primary/5 text-foreground" : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
      )}
    >
      <div className={cn("w-5 h-5 rounded flex items-center justify-center border flex-shrink-0", checked ? "bg-primary border-primary" : "border-muted-foreground")}>
        {checked && <Check size={12} className="text-white" />}
      </div>
      <span className="text-sm flex-1">{label}</span>
      {points && <span className="text-xs text-muted-foreground">+{points}pt</span>}
    </button>
  );
}
