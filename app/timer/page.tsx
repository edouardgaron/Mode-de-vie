"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, SkipForward, Coffee, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Pause courte',
  longBreak: 'Pause longue',
};

const MODE_COLORS: Record<TimerMode, string> = {
  focus: 'text-green-400',
  shortBreak: 'text-blue-400',
  longBreak: 'text-purple-400',
};

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [task, setTask] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = DURATIONS[mode];
  const pct = ((total - timeLeft) / total) * 100;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  }, [mode]);

  const switchMode = (newMode: TimerMode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (mode === 'focus') {
              setSessions(s => s + 1);
              setTotalFocusTime(t => t + DURATIONS.focus);
            }
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(mode === 'focus' ? '🎉 Session terminée !' : '⚡ Retour au focus !', {
                body: mode === 'focus' ? 'Prends ta pause.' : "C'est l'heure de travailler.",
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode]);

  // Reset timer when mode changes (but not on mount-triggered calls — handled by switchMode)
  const prevModeRef = useRef(mode);
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      prevModeRef.current = mode;
    }
  }, [mode]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const fmtTotal = (s: number) => `${Math.floor(s / 3600)}h${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;

  const color = mode === 'focus' ? '#22c55e' : mode === 'shortBreak' ? '#3b82f6' : '#a855f7';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minuterie Focus</h1>
        <p className="text-muted-foreground mt-1">Technique Pomodoro — travail en blocs de 25 minutes</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
          <Button key={m} variant={mode === m ? "default" : "outline"} size="sm" onClick={() => switchMode(m)}>
            {m === 'focus' ? <Zap size={14} className="mr-1" /> : <Coffee size={14} className="mr-1" />}
            {MODE_LABELS[m]}
          </Button>
        ))}
      </div>

      {/* Timer ring */}
      <Card>
        <CardContent className="flex flex-col items-center py-12 gap-8">
          {/* Task input */}
          <input
            type="text"
            placeholder="Sur quoi tu travailles ?"
            value={task}
            onChange={e => setTask(e.target.value)}
            className="w-full max-w-sm text-center bg-transparent border-b border-border pb-2 text-sm text-muted-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
          />

          {/* Ring */}
          <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
            <svg width={260} height={260} className="absolute -rotate-90">
              <circle cx={130} cy={130} r={radius} fill="none" stroke="hsl(0 0% 14.9%)" strokeWidth="10" />
              <circle
                cx={130} cy={130} r={radius} fill="none"
                stroke={color} strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - dash}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="relative flex flex-col items-center">
              <span className={cn("text-6xl font-mono font-bold tabular-nums", MODE_COLORS[mode])}>{fmt(timeLeft)}</span>
              <span className="text-sm text-muted-foreground mt-2">{MODE_LABELS[mode]}</span>
              {isRunning && <Badge variant="default" className="mt-2 animate-pulse">En cours</Badge>}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button variant="outline" size="icon" onClick={reset}><RotateCcw size={18} /></Button>
            <Button size="lg" onClick={() => setIsRunning(!isRunning)} className="px-12 gap-2">
              {isRunning ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Démarrer</>}
            </Button>
            <Button variant="outline" size="icon" onClick={() => switchMode(mode === 'focus' ? 'shortBreak' : 'focus')}>
              <SkipForward size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{sessions}</div>
            <div className="text-xs text-muted-foreground mt-1">Sessions aujourd'hui</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{fmtTotal(totalFocusTime)}</div>
            <div className="text-xs text-muted-foreground mt-1">Temps de focus</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{Math.floor(sessions / 4)}</div>
            <div className="text-xs text-muted-foreground mt-1">Cycles complets</div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Comment ça marche</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Choisis une tâche sur laquelle travailler</p>
          <p>2. Travaille 25 minutes sans interruption</p>
          <p>3. Prends une pause de 5 minutes</p>
          <p>4. Après 4 sessions → pause longue de 15 minutes</p>
        </CardContent>
      </Card>
    </div>
  );
}
