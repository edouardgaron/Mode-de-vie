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
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { HabitCheck } from "@/components/HabitCheck";
import { SliderInput } from "@/components/SliderInput";

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

    const last7 = allEntries
      .filter(e => {
        const date = new Date(e.date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays < 7;
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({
        date: new Date(e.date).toLocaleDateString('fr-CA', { month: '2-digit', day: '2-digit' }),
        vaping: e.vapingLevel,
        sleep: e.sleepHours || 0,
        workout: e.workoutDone ? 1 : 0,
        walk: e.walkDone ? 1 : 0,
        energy: e.energyLevel,
      }));
    setChartData(last7);
  }, []);

  const handleSaveEntry = () => {
    const newEntry: HealthEntry = {
      id: todayEntry.id || generateId(),
      date: today,
      weight: todayEntry.weight,
      workoutDone: todayEntry.workoutDone || false,
      workoutType: todayEntry.workoutType,
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
            <Input value={todayEntry.workoutType || ""} onChange={(e) => setTodayEntry({ ...todayEntry, workoutType: e.target.value })} placeholder="Type: Musculation, cardio, yoga..." />
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
              <CardTitle>Vape - 7 derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis dataKey="date" stroke="hsl(0 0% 63.9%)" />
                  <YAxis stroke="hsl(0 0% 63.9%)" domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 14.9%)' }} />
                  <Line type="monotone" dataKey="vape" stroke="#ef4444" dot={{ fill: '#ef4444' }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activités - 7 derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis dataKey="date" stroke="hsl(0 0% 63.9%)" />
                  <YAxis stroke="hsl(0 0% 63.9%)" />
                  <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 14.9%)' }} />
                  <Bar dataKey="workout" fill="#22c55e" name="Entraînement" />
                  <Bar dataKey="walk" fill="#3b82f6" name="Marche" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Énergie - 7 derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis dataKey="date" stroke="hsl(0 0% 63.9%)" />
                  <YAxis stroke="hsl(0 0% 63.9%)" domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 14.9%)' }} />
                  <Line type="monotone" dataKey="energy" stroke="#22c55e" dot={{ fill: '#22c55e' }} strokeWidth={2} />
                </LineChart>
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
                    <div className="flex gap-2 text-xs">
                      {entry.workoutDone && <span className="px-2 py-1 rounded bg-green-500/10 text-green-400">Entraînement</span>}
                      {entry.walkDone && <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400">Marche</span>}
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
