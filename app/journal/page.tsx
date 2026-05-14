"use client";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { getTodayString, generateId } from "@/lib/utils";
import { JournalEntry } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SliderInput } from "@/components/SliderInput";
import { HabitCheck } from "@/components/HabitCheck";
import { useToast } from "@/components/ui/toaster";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function JournalPage() {
  const today = getTodayString();
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [current, setCurrent] = useState<Partial<JournalEntry>>({
    plannedActions: "",
    actualActions: "",
    exaggerationsOrAvoidances: "",
    tomorrowCorrection: "",
    wasReliable: false,
    integrityScore: 5,
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const all = storage.getJournalEntries();
    setEntries(all);
    const existing = all.find(e => e.date === today);
    if (existing) {
      setCurrent(existing);
    }
  }, []);

  const handleUpdate = (key: keyof JournalEntry, value: any) => {
    setCurrent({ ...current, [key]: value });
  };

  const handleSave = () => {
    const newEntry: JournalEntry = {
      id: current.id || generateId(),
      date: today,
      plannedActions: current.plannedActions || "",
      actualActions: current.actualActions || "",
      exaggerationsOrAvoidances: current.exaggerationsOrAvoidances || "",
      tomorrowCorrection: current.tomorrowCorrection || "",
      wasReliable: current.wasReliable || false,
      integrityScore: current.integrityScore || 5,
      createdAt: current.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.upsertJournalEntry(newEntry);
    setEntries(prev => {
      const updated = prev.filter(e => e.date !== today);
      return [...updated, newEntry].sort((a, b) => b.date.localeCompare(a.date));
    });
    toast({ title: "Journal enregistré" });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold mb-1">Journal d'honnêteté</h1>
        <p className="text-muted-foreground">Pour te dire la vérité sur ta fiabilité</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aujourd'hui - {new Date(today).toLocaleDateString('fr-CA')}</CardTitle>
          <CardDescription>Sois honnête avec toi-même</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Ce que j'avais planifié</Label>
            <Textarea
              value={current.plannedActions || ""}
              onChange={(e) => handleUpdate('plannedActions', e.target.value)}
              placeholder="Tes objectifs pour la journée..."
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Ce que j'ai vraiment fait</Label>
            <Textarea
              value={current.actualActions || ""}
              onChange={(e) => handleUpdate('actualActions', e.target.value)}
              placeholder="La réalité de ta journée..."
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Où ai-je exagéré ou fui?</Label>
            <Textarea
              value={current.exaggerationsOrAvoidances || ""}
              onChange={(e) => handleUpdate('exaggerationsOrAvoidances', e.target.value)}
              placeholder="Les mensonges ou fuites d'aujourd'hui..."
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Correction pour demain</Label>
            <Textarea
              value={current.tomorrowCorrection || ""}
              onChange={(e) => handleUpdate('tomorrowCorrection', e.target.value)}
              placeholder="Comment je vais corriger cela..."
              rows={3}
              className="mt-2"
            />
          </div>

          <HabitCheck
            label="J'ai été fiable aujourd'hui"
            checked={current.wasReliable || false}
            onChange={(v) => handleUpdate('wasReliable', v)}
            points={10}
          />

          <SliderInput
            label="Score d'intégrité"
            value={current.integrityScore || 5}
            onChange={(v) => handleUpdate('integrityScore', v)}
            colorize
          />

          <Button onClick={handleSave} size="lg" className="w-full">
            Enregistrer le journal
          </Button>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Entrées précédentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {entries
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 30)
              .map(entry => (
                <button
                  key={entry.id}
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{new Date(entry.date).toLocaleDateString('fr-CA')}</p>
                      <p className={`text-xs ${entry.wasReliable ? 'text-green-400' : 'text-red-400'}`}>
                        {entry.wasReliable ? 'Fiable' : 'Non fiable'} • Score: {entry.integrityScore}/10
                      </p>
                    </div>
                    {expandedId === entry.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {expandedId === entry.id && (
                    <div className="mt-2 p-4 rounded-lg bg-card/50 border border-border/30 space-y-4 text-sm">
                      <div>
                        <p className="font-semibold text-xs text-muted-foreground mb-1">PLANIFIÉ</p>
                        <p>{entry.plannedActions}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-muted-foreground mb-1">RÉALISÉ</p>
                        <p>{entry.actualActions}</p>
                      </div>
                      {entry.exaggerationsOrAvoidances && (
                        <div>
                          <p className="font-semibold text-xs text-red-400 mb-1">EXAGÉRATIONS/FUITES</p>
                          <p>{entry.exaggerationsOrAvoidances}</p>
                        </div>
                      )}
                      {entry.tomorrowCorrection && (
                        <div>
                          <p className="font-semibold text-xs text-green-400 mb-1">CORRECTION</p>
                          <p>{entry.tomorrowCorrection}</p>
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
