"use client";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { getTodayString, generateId } from "@/lib/utils";
import { HealthEntry } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { HabitCheck } from "@/components/HabitCheck";
import { SliderInput } from "@/components/SliderInput";

const WORKOUT_TYPES = [
  "Musculation",
  "Cardio",
  "HIIT",
  "Course à pied",
  "Vélo",
  "Natation",
  "Yoga / Mobilité",
  "Crossfit",
  "Calisthenics",
  "Boxe / Arts martiaux",
  "Sports d'équipe",
  "Étirements",
];

const MUSCLE_GROUPS = [
  "Poitrine", "Dos", "Épaules", "Biceps", "Triceps",
  "Jambes", "Abdos", "Fessiers", "Full body",
];

export default function HealthPage() {
  const today = getTodayString();
  const { toast } = useToast();
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<Partial<HealthEntry>>({
    workoutDone: false,
    walkDone: false,
    vapingLevel: 5,
    energyLevel: 5,
    stressLevel: 5,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const allEntries = storage.getHealthEntries();
    setEntries(allEntries);

    const existing = allEntries.find(e => e.date === today);
    if (existing) {
      setTodayEntry(existing);
    }

    const last14 = allEntries
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map(e => ({
        date: new Date(e.date + 'T12:00:00').toLocaleDateString('fr-CA', { month: '2-digit', day: '2-digit' }),
        vaping: e.vapingLevel,
        sleep: e.sleepHours || 0,
        workout: e.workoutDone ? 1 : 0,
        walk: e.walkDone ? 1 : 0,
        energy: e.energyLevel,
        stress: e.stressLevel,
      }));
    setChartData(last14);
  }, []);

  const handleSaveEntry = () => {
    const newEntry: HealthEntry = {
      id: todayEntry.id || generateId(),
      date: today,
      weight: todayEntry.weight,
      workoutDone: todayEntry.workoutDone || false,
      workoutType: todayEntry.workoutType,
      workoutDuration: todayEntry.workoutDuration,
      workoutIntensity: todayEntry.workoutIntensity,
      musclesWorked: todayEntry.musclesWorked,
      walkDone: todayEntry.walkDone || false,
      walkDuration: todayEntry.walkDuration,
      sleepHours: todayEntry.sleepHours,
      vapingLevel: todayEntry.vapingLevel || 5,
      energyLevel: todayEntry.energyLevel || 5,
      stressLevel: todayEntry.stressLevel || 5,
      notes: todayEntry.notes,
      createdAt: todayEntry.createdAt || new Date().toISOString(),
    };
    storage.upsertHealthEntry(newEntry);
    setEntries(prev => {
      const updated = prev.filter(e => e.date !== today);
      return [...updated, newEntry].sort((a, b) => b.date.localeCompare(a.date));
    });
    toast({ title: "Santé enregistrée" });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold mb-1">Suivi Santé</h1>
        <p className="text-muted-foreground">Votre bien-être, semaine par semaine</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entrée d'aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Poids (kg)</Label>
              <Input type="number" value={todayEntry.weight || ""} onChange={(e) => setTodayEntry({ ...todayEntry, weight: e.target.value ? Number(e.target.value) : undefined })} placeholder="80" className="mt-1" />
            </div>
            <div>
              <Label>Sommeil (heures)</Label>
              <Input type="number" step="0.5" value={todayEntry.sleepHours || ""} onChange={(e) => setTodayEntry({ ...todayEntry, sleepHours: e.target.value ? Number(e.target.value) : undefined })} placeholder="8" className="mt-1" />
            </div>
          </div>

          <HabitCheck label="Entraînement complété" checked={todayEntry.workoutDone || false} onChange={(v) => setTodayEntry({ ...todayEntry, workoutDone: v })} />

          {todayEntry.workoutDone && (
            <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
              <div>
                <Label>Type d'entraînement</Label>
                <select
                  value={todayEntry.workoutType || ""}
                  onChange={(e) => setTodayEntry({ ...todayEntry, workoutType: e.target.value })}
                  className="w-full mt-1 p-2 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">-- Choisir un type --</option>
                  {WORKOUT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Durée (minutes)</Label>
                  <Input
                    type="number"
                    value={todayEntry.workoutDuration || ""}
                    onChange={(e) => setTodayEntry({ ...todayEntry, workoutDuration: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="45"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Intensité (1-10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={todayEntry.workoutIntensity || ""}
                    onChange={(e) => setTodayEntry({ ...todayEntry, workoutIntensity: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="7"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Muscles travaillés</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map((m) => {
                    const selected = (todayEntry.musclesWorked || []).includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          const current = todayEntry.musclesWorked || [];
                          setTodayEntry({
                            ...todayEntry,
                            musclesWorked: selected
                              ? current.filter((x) => x !== m)
                              : [...current, m],
                          });
                        }}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          selected
                            ? "bg-green-500/20 border-green-500 text-green-400"
                            : "border-input text-muted-foreground hover:border-green-500/50"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <HabitCheck label="Marche complétée" checked={todayEntry.walkDone || false} onChange={(v) => setTodayEntry({ ...todayEntry, walkDone: v })} />

          {todayEntry.walkDone && (
            <Input type="number" value={todayEntry.walkDuration || ""} onChange={(e) => setTodayEntry({ ...todayEntry, walkDuration: e.target.value ? Number(e.target.value) : undefined })} placeholder="Durée en minutes" />
          )}

          <div className="pt-4 space-y-6">
            <SliderInput label="Niveau de vape (0 = absent)" value={todayEntry.vapingLevel || 5} onChange={(v) => setTodayEntry({ ...todayEntry, vapingLevel: v })} min={0} max={10} colorize />
            <SliderInput label="Énergie" value={todayEntry.energyLevel || 5} onChange={(v) => setTodayEntry({ ...todayEntry, energyLevel: v })} colorize />
            <SliderInput label="Stress" value={todayEntry.stressLevel || 5} onChange={(v) => setTodayEntry({ ...todayEntry, stressLevel: v })} colorize />
          </div>

          <div>
            <Label>Notes</Label>
            <textarea value={todayEntry.notes || ""} onChange={(e) => setTodayEntry({ ...todayEntry, notes: e.target.value })} className="w-full mt-1 p-2 rounded-md border border-input bg-background text-foreground" rows={2} placeholder="Observations personnelles..." />
          </div>

          <Button onClick={handleSaveEntry} size="lg" className="w-full">
            Enregistrer
          </Button>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Énergie — 14 derniers jours</CardTitle>
              <CardDescription>Niveau d'énergie quotidien (1-10)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis dataKey="date" stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} />
                  <YAxis stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', color: '#fff' }} />
                  <Area type="monotone" dataKey="energy" stroke="#22c55e" fill="url(#energyGrad)" strokeWidth={2} name="Énergie" dot={{ fill: '#22c55e', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activités — 14 derniers jours</CardTitle>
              <CardDescription>Entraînements et marches</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis dataKey="date" stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} />
                  <YAxis stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', color: '#fff' }} />
                  <Bar dataKey="workout" fill="#22c55e" name="Entraînement" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="walk" fill="#3b82f6" name="Marche" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Niveau de vape — 14 derniers jours</CardTitle>
              <CardDescription>0 = aucune, 10 = beaucoup (objectif : descendre)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis dataKey="date" stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} />
                  <YAxis stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', color: '#fff' }} />
                  <Line type="monotone" dataKey="vaping" stroke="#ef4444" dot={{ fill: '#ef4444', r: 3 }} strokeWidth={2} name="Vape" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sommeil — 14 derniers jours</CardTitle>
              <CardDescription>Heures de sommeil par nuit</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis dataKey="date" stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} />
                  <YAxis stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} domain={[0, 12]} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', color: '#fff' }} />
                  <Bar dataKey="sleep" fill="#a855f7" name="Sommeil (h)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {entries
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 10)
                .map(entry => (
                  <div key={entry.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 text-sm">
                    <div>
                      <p className="font-medium">{new Date(entry.date).toLocaleDateString('fr-CA')}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.sleepHours}h sommeil | Vape: {entry.vapingLevel}/10 | Énergie: {entry.energyLevel}/10
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end text-xs">
                      {entry.workoutDone && (
                        <span className="px-2 py-1 rounded bg-green-500/10 text-green-400">
                          {entry.workoutType || "Entraînement"}
                          {entry.workoutDuration ? ` · ${entry.workoutDuration}min` : ""}
                          {entry.workoutIntensity ? ` · ${entry.workoutIntensity}/10` : ""}
                        </span>
                      )}
                      {entry.workoutDone && entry.musclesWorked && entry.musclesWorked.length > 0 && (
                        <span className="text-muted-foreground">{entry.musclesWorked.join(", ")}</span>
                      )}
                      {entry.walkDone && <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400">Marche{entry.walkDuration ? ` · ${entry.walkDuration}min` : ""}</span>}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
