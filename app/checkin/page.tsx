"use client";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { calculateDailyScore, getMotivationalMessage } from "@/lib/scoring";
import { getTodayString, generateId } from "@/lib/utils";
import { HabitCheck } from "@/components/HabitCheck";
import { SliderInput } from "@/components/SliderInput";
import { ScoreRing } from "@/components/ScoreRing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { DailyCheckin } from "@/types";

export default function CheckinPage() {
  const today = getTodayString();
  const { toast } = useToast();
  const [checkin, setCheckin] = useState<Partial<DailyCheckin>>({
    slept7h: false,
    walked45min: false,
    didWorkout: false,
    drankWater: false,
    reducedVaping: false,
    did3Tasks: false,
    avoidedDispersal: false,
    toldTruth: false,
    didHealthAction: false,
    didFinanceAction: false,
    socialContact: false,
    energyLevel: 5,
    stressLevel: 5,
    confidenceLevel: 5,
    integrityScore: 5,
    avoidedToday: "",
    proudOf: "",
    truthToAccept: "",
  });

  const [score, setScore] = useState<any>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    const existing = storage.getCheckinByDate(today);
    if (existing) {
      setCheckin(existing);
      setAlreadyCompleted(true);
    }
    updateScore();
  }, []);

  const updateScore = () => {
    const breakdown = calculateDailyScore(checkin);
    setScore(breakdown);
  };

  const handleChange = (key: keyof DailyCheckin, value: any) => {
    const updated = { ...checkin, [key]: value };
    setCheckin(updated);
    const breakdown = calculateDailyScore(updated);
    setScore(breakdown);
  };

  const handleSubmit = () => {
    const breakdown = calculateDailyScore(checkin);
    const now = new Date().toISOString();
    const newCheckin: DailyCheckin = {
      id: checkin.id || generateId(),
      date: today,
      slept7h: checkin.slept7h || false,
      walked45min: checkin.walked45min || false,
      didWorkout: checkin.didWorkout || false,
      drankWater: checkin.drankWater || false,
      reducedVaping: checkin.reducedVaping || false,
      did3Tasks: checkin.did3Tasks || false,
      avoidedDispersal: checkin.avoidedDispersal || false,
      toldTruth: checkin.toldTruth || false,
      didHealthAction: checkin.didHealthAction || false,
      didFinanceAction: checkin.didFinanceAction || false,
      socialContact: checkin.socialContact || false,
      energyLevel: checkin.energyLevel || 5,
      stressLevel: checkin.stressLevel || 5,
      confidenceLevel: checkin.confidenceLevel || 5,
      integrityScore: checkin.integrityScore || 5,
      avoidedToday: checkin.avoidedToday || "",
      proudOf: checkin.proudOf || "",
      truthToAccept: checkin.truthToAccept || "",
      dailyScore: breakdown.total,
      createdAt: checkin.createdAt || now,
      updatedAt: now,
    };
    storage.upsertCheckin(newCheckin);
    toast({ title: "Check-in enregistré", description: `Score: ${breakdown.total}/100` });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold mb-1">Check-in quotidien</h1>
        {alreadyCompleted && (
          <p className="text-primary">Déjà complété aujourd'hui. Vous pouvez mettre à jour.</p>
        )}
      </div>

      {score && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex justify-center lg:col-span-1">
            <ScoreRing score={score.total} size={140} label="Score" />
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Santé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{score.health}/30</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Business</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{score.business}/25</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Intégrité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">{score.integrity}/20</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Autres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{score.finance + score.journal + score.social}/25</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Habitudes Santé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <HabitCheck label="J'ai dormi 7+ heures" checked={checkin.slept7h || false} onChange={(v) => handleChange('slept7h', v)} points={6} />
          <HabitCheck label="J'ai marché 45 min" checked={checkin.walked45min || false} onChange={(v) => handleChange('walked45min', v)} points={6} />
          <HabitCheck label="J'ai fait de l'entraînement" checked={checkin.didWorkout || false} onChange={(v) => handleChange('didWorkout', v)} points={6} />
          <HabitCheck label="J'ai bu de l'eau" checked={checkin.drankWater || false} onChange={(v) => handleChange('drankWater', v)} points={4} />
          <HabitCheck label="J'ai réduit la vape" checked={checkin.reducedVaping || false} onChange={(v) => handleChange('reducedVaping', v)} points={4} />
          <HabitCheck label="J'ai fait une action santé" checked={checkin.didHealthAction || false} onChange={(v) => handleChange('didHealthAction', v)} points={4} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Habitudes Business</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <HabitCheck label="J'ai complété 3 tâches importantes" checked={checkin.did3Tasks || false} onChange={(v) => handleChange('did3Tasks', v)} points={12} />
          <HabitCheck label="J'ai évité la dispersion" checked={checkin.avoidedDispersal || false} onChange={(v) => handleChange('avoidedDispersal', v)} points={8} />
          <HabitCheck label="J'ai fait une action financière" checked={checkin.didFinanceAction || false} onChange={(v) => handleChange('didFinanceAction', v)} points={10} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intégrité & Vérité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <HabitCheck label="Je me suis dit la vérité aujourd'hui" checked={checkin.toldTruth || false} onChange={(v) => handleChange('toldTruth', v)} points={10} />
          <SliderInput label="Score d'intégrité" value={checkin.integrityScore || 5} onChange={(v) => handleChange('integrityScore', v)} />
          <HabitCheck label="Contact social" checked={checkin.socialContact || false} onChange={(v) => handleChange('socialContact', v)} points={5} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Niveaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SliderInput label="Énergie" value={checkin.energyLevel || 5} onChange={(v) => handleChange('energyLevel', v)} colorize />
          <SliderInput label="Stress" value={checkin.stressLevel || 5} onChange={(v) => handleChange('stressLevel', v)} colorize />
          <SliderInput label="Confiance" value={checkin.confidenceLevel || 5} onChange={(v) => handleChange('confidenceLevel', v)} colorize />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journal</CardTitle>
          <CardDescription>Réponses courtes mais honnêtes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Qu'ai-je évité aujourd'hui?</Label>
            <Textarea value={checkin.avoidedToday || ""} onChange={(e) => handleChange('avoidedToday', e.target.value)} placeholder="Ce que tu as fui ou reporté..." className="mt-2" />
          </div>
          <div>
            <Label>Je suis fier/fière de...</Label>
            <Textarea value={checkin.proudOf || ""} onChange={(e) => handleChange('proudOf', e.target.value)} placeholder="Une chose que tu as bien faite aujourd'hui..." className="mt-2" />
          </div>
          <div>
            <Label>Une vérité que je dois accepter</Label>
            <Textarea value={checkin.truthToAccept || ""} onChange={(e) => handleChange('truthToAccept', e.target.value)} placeholder="La dure vérité que tu dois reconnaître..." className="mt-2" />
          </div>
        </CardContent>
      </Card>

      {score && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-center italic text-foreground">"{getMotivationalMessage(score.total)}"</p>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSubmit} size="lg" className="w-full">
        Enregistrer le check-in
      </Button>
    </div>
  );
}
