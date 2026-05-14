"use client";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { calculateDailyScore, getMotivationalMessage, getStreakCount, getWeeklyScore } from "@/lib/scoring";
import { getTodayString, formatDate, formatCurrency } from "@/lib/utils";
import { ScoreRing } from "@/components/ScoreRing";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toaster";
import { Download, Upload, RotateCcw, CheckSquare, Timer, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { DailyCheckin } from "@/types";
import { getCheckinCalendarUrl } from "@/lib/calendar";
import Link from "next/link";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function getHeatmapColor(score: number | null): string {
  if (score === null) return 'bg-muted/30';
  if (score === 0) return 'bg-red-900/60';
  if (score <= 40) return 'bg-red-900';
  if (score <= 60) return 'bg-yellow-900';
  if (score <= 80) return 'bg-green-800';
  return 'bg-green-500';
}

export default function Dashboard() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [todayScore, setTodayScore] = useState(0);
  const [weeklyScore, setWeeklyScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [motivationalMsg, setMotivationalMsg] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [scoreBreakdown, setScoreBreakdown] = useState({ health: 0, business: 0, integrity: 0, finance: 0, journal: 0, social: 0 });
  const [heatmapData, setHeatmapData] = useState<(number | null)[][]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const allCheckins = storage.getCheckins();
    const allGoals = storage.getGoals();
    setCheckins(allCheckins);
    setGoals(allGoals);

    const today = getTodayString();
    const todayCheckin = allCheckins.find(c => c.date === today);
    if (todayCheckin) {
      const score = calculateDailyScore(todayCheckin);
      setTodayScore(score.total);
      setScoreBreakdown(score);
      setMotivationalMsg(getMotivationalMessage(score.total));
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

    const last14 = allCheckins
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map(c => ({
        date: new Date(c.date + 'T12:00:00').toLocaleDateString('fr-CA', { month: '2-digit', day: '2-digit' }),
        score: c.dailyScore,
      }));
    setChartData(last14);

    // Build heatmap: 5 weeks x 7 days
    const scoreMap: Record<string, number> = {};
    allCheckins.forEach(c => { scoreMap[c.date] = c.dailyScore; });

    const grid: (number | null)[][] = [];
    const refDate = new Date();
    // go back to start of current week (Monday)
    const dayOfWeek = refDate.getDay() === 0 ? 6 : refDate.getDay() - 1; // 0=Mon
    const startDate = new Date(refDate);
    startDate.setDate(startDate.getDate() - dayOfWeek - 28); // 4 full weeks back + current week

    for (let week = 0; week < 5; week++) {
      const weekRow: (number | null)[] = [];
      for (let day = 0; day < 7; day++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + week * 7 + day);
        const dateStr = d.toISOString().slice(0, 10);
        if (d > refDate) {
          weekRow.push(null);
        } else {
          weekRow.push(scoreMap[dateStr] ?? null);
        }
      }
      grid.push(weekRow);
    }
    setHeatmapData(grid);
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

  const breakdownItems = [
    { label: 'Santé', value: scoreBreakdown.health, max: 30, color: 'bg-green-500' },
    { label: 'Business', value: scoreBreakdown.business, max: 25, color: 'bg-blue-500' },
    { label: 'Intégrité', value: scoreBreakdown.integrity, max: 20, color: 'bg-purple-500' },
    { label: 'Finances', value: scoreBreakdown.finance, max: 10, color: 'bg-yellow-500' },
    { label: 'Journal', value: scoreBreakdown.journal, max: 10, color: 'bg-orange-500' },
    { label: 'Social', value: scoreBreakdown.social, max: 5, color: 'bg-pink-500' },
  ];

  const dayLabels = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-muted-foreground text-sm">{formatDate(getTodayString())}</p>
        <h1 className="text-4xl font-bold mt-1">{getGreeting()} 👋</h1>
        {motivationalMsg && (
          <p className="text-muted-foreground mt-2 italic text-sm">"{motivationalMsg}"</p>
        )}
      </div>

      {!todayCheckin && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-foreground">Check-in non complété pour aujourd'hui</p>
            <Button onClick={() => window.location.href = '/checkin'}>
              Faire le check-in →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Score + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex justify-center items-center">
          <ScoreRing score={todayScore} size={160} label="Aujourd'hui" />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Score hebdo" value={weeklyScore} color="blue" />
            <StatCard label="Streak" value={`${streak}j`} color="green" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Habitudes complétées" value={`${habitCount}/8`} color="green" />
            <StatCard label="Objectifs actifs" value={goals.filter(g => g.active).length} color="default" />
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      {todayCheckin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition du score d'aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {breakdownItems.map(({ label, value, max, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
                <div className="flex-1 bg-muted/40 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${color} transition-all`}
                    style={{ width: `${(value / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-foreground w-10 text-right shrink-0">{value}/{max}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 14-day chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>14 derniers jours</CardTitle>
            <CardDescription>Évolution du score quotidien</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                <XAxis dataKey="date" stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} />
                <YAxis stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', color: '#fff' }} />
                <Area type="monotone" dataKey="score" stroke="#22c55e" fill="url(#scoreGrad)" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Activité — 5 dernières semaines</CardTitle>
          <CardDescription>Intensité = score du jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 mb-2">
            {dayLabels.map(d => (
              <div key={d} className="w-8 text-center text-xs text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {heatmapData.map((week, wi) => (
              <div key={wi} className="flex gap-1">
                {week.map((score, di) => (
                  <div
                    key={di}
                    className={`w-8 h-8 rounded-sm ${getHeatmapColor(score)} transition-colors`}
                    title={score !== null ? `Score: ${score}` : 'Pas de données'}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <span>Moins</span>
            <div className="w-4 h-4 rounded-sm bg-muted/30" />
            <div className="w-4 h-4 rounded-sm bg-yellow-900" />
            <div className="w-4 h-4 rounded-sm bg-green-800" />
            <div className="w-4 h-4 rounded-sm bg-green-500" />
            <span>Plus</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/checkin">
            <Button variant="outline" className="gap-2">
              <CheckSquare size={16} /> Check-in quotidien
            </Button>
          </Link>
          <Link href="/timer">
            <Button variant="outline" className="gap-2">
              <Timer size={16} /> Minuterie focus
            </Button>
          </Link>
          <a href={getCheckinCalendarUrl()} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <Calendar size={16} /> Ajouter au calendrier
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Export/Import/Reset */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download size={16} /> Exporter
        </Button>
        <label className="cursor-pointer">
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full gap-2 cursor-pointer">
            <Upload size={16} /> Importer
          </div>
        </label>
        <Button onClick={handleReset} variant="destructive" className="gap-2">
          <RotateCcw size={16} /> Réinitialiser
        </Button>
      </div>
    </div>
  );
}
