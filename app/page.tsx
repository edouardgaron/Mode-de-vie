"use client";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { calculateDailyScore, getMotivationalMessage, getStreakCount, getWeeklyScore } from "@/lib/scoring";
import { getTodayString, formatDate, formatCurrency } from "@/lib/utils";
import { ScoreRing } from "@/components/ScoreRing";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { Download, Upload, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DailyCheckin } from "@/types";

export default function Dashboard() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [todayScore, setTodayScore] = useState(0);
  const [weeklyScore, setWeeklyScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [motivationalMsg, setMotivationalMsg] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const allCheckins = storage.getCheckins();
    const allGoals = storage.getGoals();
    setCheckins(allCheckins);
    setGoals(allGoals);

    const today = getTodayString();
    const todayCheckin = allCheckins.find(c => c.date === today);
    if (todayCheckin) {
      const score = calculateDailyScore(todayCheckin).total;
      setTodayScore(score);
      setMotivationalMsg(getMotivationalMessage(score));
    }

    const lastWeek = allCheckins.filter(c => {
      const date = new Date(c.date);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays < 7;
    });
    const weekly = getWeeklyScore(lastWeek.map(c => c.dailyScore));
    setWeeklyScore(weekly);

    setStreak(getStreakCount(allCheckins));

    const last7 = allCheckins
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map(c => ({
        date: new Date(c.date).toLocaleDateString('fr-CA', { month: '2-digit', day: '2-digit' }),
        score: c.dailyScore,
      }));
    setChartData(last7);
  }, []);

  const handleExport = () => {
    const data = storage.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mode-de-vie-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast({ title: "Données exportées", description: "Fichier JSON téléchargé" });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        storage.importAll(data);
        toast({ title: "Données importées", description: "Vos données ont été restaurées" });
        window.location.reload();
      } catch {
        toast({ title: "Erreur", description: "Fichier invalide", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser TOUTES les données? Cette action est irréversible.")) {
      storage.resetAll();
      toast({ title: "Données réinitialisées", description: "Toutes les données ont été supprimées" });
      window.location.reload();
    }
  };

  const todayCheckin = checkins.find(c => c.date === getTodayString());
  const habitCount = todayCheckin ? [
    todayCheckin.slept7h,
    todayCheckin.walked45min,
    todayCheckin.didWorkout,
    todayCheckin.drankWater,
    todayCheckin.reducedVaping,
    todayCheckin.did3Tasks,
    todayCheckin.avoidedDispersal,
    todayCheckin.toldTruth,
  ].filter(Boolean).length : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-1">Bienvenue</h1>
        <p className="text-muted-foreground">{formatDate(getTodayString())}</p>
      </div>

      {!todayCheckin && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground mb-4">Check-in non complété pour aujourd'hui</p>
            <Button onClick={() => window.location.href = '/checkin'}>
              Faire le check-in quotidien
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex justify-center">
          <div className="w-fit">
            <ScoreRing score={todayScore} size={140} label="Aujourd'hui" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Score hebdo" value={weeklyScore} color="blue" />
            <StatCard label="Streak" value={`${streak}j`} color="green" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Habitudes complétées" value={habitCount} color="green" />
            <StatCard label="Objectifs actifs" value={goals.filter(g => g.active).length} color="default" />
          </div>
          {motivationalMsg && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm italic text-foreground">"{motivationalMsg}"</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Derniers 7 jours</CardTitle>
            <CardDescription>Évolution de votre score quotidien</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                <XAxis dataKey="date" stroke="hsl(0 0% 63.9%)" />
                <YAxis stroke="hsl(0 0% 63.9%)" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'hsl(0 0% 7%)', border: '1px solid hsl(0 0% 14.9%)' }} />
                <Bar dataKey="score" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download size={16} /> Exporter
        </Button>
        <label className="cursor-pointer">
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button variant="outline" className="w-full gap-2">
            <Upload size={16} /> Importer
          </Button>
        </label>
        <Button onClick={handleReset} variant="destructive" className="gap-2">
          <RotateCcw size={16} /> Réinitialiser
        </Button>
      </div>
    </div>
  );
}
