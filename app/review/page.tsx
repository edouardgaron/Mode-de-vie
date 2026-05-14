"use client";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { WeeklyReview } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SliderInput } from "@/components/SliderInput";
import { HabitCheck } from "@/components/HabitCheck";
import { useToast } from "@/components/ui/toaster";
import { ChevronDown, ChevronUp } from "lucide-react";

const HABIT_LABELS = [
  "Sommeil 7+ heures",
  "Marche 45 min",
  "Entraînement",
  "Eau",
  "Réduit vape",
  "3 tâches importantes",
  "Évité dispersion",
  "Honnêteté",
];

export default function ReviewPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [current, setCurrent] = useState<Partial<WeeklyReview>>({
    wentWell: "",
    avoided: "",
    habitsSucceeded: [],
    habitsFailed: [],
    reasonsFailed: "",
    whatToKeep: "",
    whatToChange: "",
    nextWeekPriority: "",
    nextWeekObjectives: [],
    overallScore: 5,
  });

  useEffect(() => {
    const all = storage.getWeeklyReviews();
    setReviews(all);
  }, []);

  const getWeekString = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10),
    };
  };

  const week = getWeekString();

  const handleToggleHabit = (habit: string, isSucceeded: boolean) => {
    if (isSucceeded) {
      const updated = (current.habitsSucceeded || []).includes(habit)
        ? (current.habitsSucceeded || []).filter(h => h !== habit)
        : [...(current.habitsSucceeded || []), habit];
      setCurrent({ ...current, habitsSucceeded: updated });
    } else {
      const updated = (current.habitsFailed || []).includes(habit)
        ? (current.habitsFailed || []).filter(h => h !== habit)
        : [...(current.habitsFailed || []), habit];
      setCurrent({ ...current, habitsFailed: updated });
    }
  };

  const handleAddObjective = () => {
    setCurrent({
      ...current,
      nextWeekObjectives: [...(current.nextWeekObjectives || []), ""],
    });
  };

  const handleUpdateObjective = (idx: number, value: string) => {
    const updated = [...(current.nextWeekObjectives || [])];
    updated[idx] = value;
    setCurrent({ ...current, nextWeekObjectives: updated });
  };

  const handleSave = () => {
    const newReview: WeeklyReview = {
      id: current.id || generateId(),
      weekStart: week.start,
      weekEnd: week.end,
      wentWell: current.wentWell || "",
      avoided: current.avoided || "",
      habitsSucceeded: current.habitsSucceeded || [],
      habitsFailed: current.habitsFailed || [],
      reasonsFailed: current.reasonsFailed || "",
      whatToKeep: current.whatToKeep || "",
      whatToChange: current.whatToChange || "",
      nextWeekPriority: current.nextWeekPriority || "",
      nextWeekObjectives: (current.nextWeekObjectives || []).filter(o => o.trim()),
      overallScore: current.overallScore || 5,
      createdAt: current.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.upsertWeeklyReview(newReview);
    setReviews(prev => {
      const updated = prev.filter(r => r.id !== newReview.id);
      return [...updated, newReview];
    });
    toast({ title: "Revue hebdomadaire enregistrée" });
    setShowForm(false);
    setCurrent({
      wentWell: "",
      avoided: "",
      habitsSucceeded: [],
      habitsFailed: [],
      reasonsFailed: "",
      whatToKeep: "",
      whatToChange: "",
      nextWeekPriority: "",
      nextWeekObjectives: [],
      overallScore: 5,
    });
  };

  const existingThisWeek = reviews.find(r => r.weekStart === week.start);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold mb-1">Revue hebdomadaire</h1>
        <p className="text-muted-foreground">Semaine du {new Date(week.start).toLocaleDateString('fr-CA')} au {new Date(week.end).toLocaleDateString('fr-CA')}</p>
      </div>

      {!showForm && !existingThisWeek && (
        <Button onClick={() => setShowForm(true)} size="lg" className="w-full">
          Faire la revue de cette semaine
        </Button>
      )}

      {(showForm || existingThisWeek) && (
        <Card>
          <CardHeader>
            <CardTitle>Revue de la semaine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Ce qui a bien fonctionné</Label>
              <Textarea
                value={current.wentWell || ""}
                onChange={(e) => setCurrent({ ...current, wentWell: e.target.value })}
                placeholder="Les victoires de la semaine..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Ce que j'ai évité</Label>
              <Textarea
                value={current.avoided || ""}
                onChange={(e) => setCurrent({ ...current, avoided: e.target.value })}
                placeholder="Les tentations que tu as rejettées..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm">Habitudes</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Habitudes complétées</p>
                  <div className="space-y-2">
                    {HABIT_LABELS.map(habit => (
                      <HabitCheck
                        key={habit}
                        label={habit}
                        checked={(current.habitsSucceeded || []).includes(habit)}
                        onChange={() => handleToggleHabit(habit, true)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Habitudes manquées</p>
                  <div className="space-y-2">
                    {HABIT_LABELS.map(habit => (
                      <HabitCheck
                        key={habit + "-failed"}
                        label={habit}
                        checked={(current.habitsFailed || []).includes(habit)}
                        onChange={() => handleToggleHabit(habit, false)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>Pourquoi certaines habitudes ont-elles manqué?</Label>
              <Textarea
                value={current.reasonsFailed || ""}
                onChange={(e) => setCurrent({ ...current, reasonsFailed: e.target.value })}
                placeholder="Les obstacles ou les raisons..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Ce que je vais garder</Label>
              <Textarea
                value={current.whatToKeep || ""}
                onChange={(e) => setCurrent({ ...current, whatToKeep: e.target.value })}
                placeholder="Les habitudes qui fonctionnent..."
                rows={2}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Ce que je vais changer</Label>
              <Textarea
                value={current.whatToChange || ""}
                onChange={(e) => setCurrent({ ...current, whatToChange: e.target.value })}
                placeholder="Les ajustements à faire..."
                rows={2}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Priorité pour la prochaine semaine</Label>
              <Input
                value={current.nextWeekPriority || ""}
                onChange={(e) => setCurrent({ ...current, nextWeekPriority: e.target.value })}
                placeholder="Une seule priorité..."
                className="mt-2"
              />
            </div>

            <div>
              <Label>Objectifs de la semaine prochaine</Label>
              <div className="mt-2 space-y-2">
                {(current.nextWeekObjectives || []).map((obj, idx) => (
                  <Input
                    key={idx}
                    value={obj}
                    onChange={(e) => handleUpdateObjective(idx, e.target.value)}
                    placeholder={`Objectif ${idx + 1}...`}
                  />
                ))}
                <Button onClick={handleAddObjective} variant="outline" size="sm" className="w-full">
                  Ajouter un objectif
                </Button>
              </div>
            </div>

            <SliderInput
              label="Score global de la semaine"
              value={current.overallScore || 5}
              onChange={(v) => setCurrent({ ...current, overallScore: v })}
              colorize
            />

            <div className="flex gap-2">
              <Button onClick={handleSave} size="lg" className="flex-1">
                Enregistrer la revue
              </Button>
              {showForm && (
                <Button onClick={() => setShowForm(false)} variant="outline" size="lg">
                  Annuler
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reviews
              .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
              .map(review => (
                <button
                  key={review.id}
                  onClick={() => setExpandedId(expandedId === review.id ? null : review.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {new Date(review.weekStart).toLocaleDateString('fr-CA')} - {new Date(review.weekEnd).toLocaleDateString('fr-CA')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Score: {review.overallScore}/10 • Habitudes: {review.habitsSucceeded.length} réussies, {review.habitsFailed.length} manquées
                      </p>
                    </div>
                    {expandedId === review.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {expandedId === review.id && (
                    <div className="mt-2 p-4 rounded-lg bg-card/50 border border-border/30 space-y-3 text-sm">
                      {review.wentWell && (
                        <div>
                          <p className="font-semibold text-xs text-green-400 mb-1">QUI A BIEN FONCTIONNÉ</p>
                          <p>{review.wentWell}</p>
                        </div>
                      )}
                      {review.whatToKeep && (
                        <div>
                          <p className="font-semibold text-xs text-blue-400 mb-1">À GARDER</p>
                          <p>{review.whatToKeep}</p>
                        </div>
                      )}
                      {review.whatToChange && (
                        <div>
                          <p className="font-semibold text-xs text-yellow-400 mb-1">À CHANGER</p>
                          <p>{review.whatToChange}</p>
                        </div>
                      )}
                      {review.nextWeekPriority && (
                        <div>
                          <p className="font-semibold text-xs text-purple-400 mb-1">PRIORITÉ SEMAINE PROCHAINE</p>
                          <p>{review.nextWeekPriority}</p>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
