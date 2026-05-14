"use client";

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  colorize?: boolean;
}

export function SliderInput({ label, value, onChange, min = 1, max = 10, colorize = false }: SliderInputProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = colorize ? (pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444") : "#22c55e";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-muted-foreground">{label}</label>
        <span className="text-sm font-bold" style={{ color }}>{value}/{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
        style={{ background: `linear-gradient(to right, ${color} ${pct}%, hsl(0 0% 14.9%) ${pct}%)` }}
      />
    </div>
  );
}
