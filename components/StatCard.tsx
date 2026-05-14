import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color?: "green" | "blue" | "yellow" | "red" | "default";
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, trendLabel, color = "default", className }: StatCardProps) {
  const colors = {
    green: "text-green-400",
    blue: "text-blue-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    default: "text-foreground",
  };
  const trendColors = { up: "text-green-400", down: "text-red-400", neutral: "text-muted-foreground" };

  return (
    <div className={cn("rounded-xl border bg-card p-5 flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={16} className="text-muted-foreground" />}
      </div>
      <div className={cn("text-3xl font-bold", colors[color])}>{value}</div>
      {trendLabel && <p className={cn("text-xs", trend ? trendColors[trend] : "text-muted-foreground")}>{trendLabel}</p>}
    </div>
  );
}
