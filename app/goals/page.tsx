"use client";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { Goal } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toaster";
import { Trash2, Plus, Check } from "lucide-react";

type Category = 'health' | 'business' | 'finance' | 'personal' | 'social';
const categories: Record<Category, { label: string; color: string }> = {
  health: { label: 'Santé', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  business: { label: 'Business', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  finance: { label: 'Finances', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  personal: { label: 'Personnel', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  social: { label: 'Social', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'health' as Category, targetDate: '' });
  const { toast } = useToast();

  useEffect(() => {
    const stored = storage.getGoals();
    setGoals(stored);
  }, []);

  const handleSaveGoal = () => {
    if (!formData.title.trim() || !formData.targetDate) {
      toast({ title: 'Erreur', description: 'Veuillez compléter tous les champs', variant: 'destructive' });
      return;
    }
    const newGoal: Goal = {
      id: generateId(),
      title: formData.title,
      description: formData.description,
      category: formData.category as Category,
      targetDate: formData.targetDate,
      active: true,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    storage.saveGoals(updated);
    toast({ title: 'Objectif créé', description: formData.title });
    setFormData({ title: '', description: '', category: 'health', targetDate: '' });
    setShowForm(false);
  };

  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    const updated = goals.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g);
    setGoals(updated);
    storage.saveGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    if (!confirm('Supprimer cet objectif?')) return;
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    storage.saveGoals(updated);
    toast({ title: 'Objectif supprimé' });
  };

  const groupedGoals = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) acc[goal.category] = [];
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<Category, Goal[]>);

  const totalProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;
  const activeCount = goals.filter(g => g.active).length;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold mb-1">Objectifs 90 jours</h1>
        <p className="text-muted-foreground">Vos objectifs pour transformer votre vie</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Progrès moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{totalProgress}%</div>
            <Progress value={totalProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={16} /> Nouvel objectif
        </Button>
      )}

      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Créer un objectif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Marcher 45 min par jour" className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Détails et notes..." className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Catégorie</Label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })} className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background">
                  {Object.entries(categories).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Date cible</Label>
                <Input type="date" value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveGoal} size="sm">Créer</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" size="sm">Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.entries(groupedGoals).map(([category, items]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {categories[category as Category].label}
            <span className="text-sm text-muted-foreground">({items.length})</span>
          </h2>
          <div className="space-y-3">
            {items.map(goal => (
              <Card key={goal.id} className={goal.active ? "" : "opacity-50"}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{goal.title}</h3>
                        {goal.active ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Inactif</span>
                        )}
                      </div>
                      {goal.description && <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Progrès: {goal.progress}%</span>
                          <span className="text-xs text-muted-foreground">Cible: {new Date(goal.targetDate).toLocaleDateString('fr-CA')}</span>
                        </div>
                        <Progress value={goal.progress} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateGoal(goal.id, { active: !goal.active })}
                      >
                        {goal.active ? 'Pause' : 'Activer'}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteGoal(goal.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {[0, 25, 50, 75, 100].map(val => (
                      <Button
                        key={val}
                        size="sm"
                        variant={goal.progress === val ? "default" : "outline"}
                        onClick={() => handleUpdateGoal(goal.id, { progress: val })}
                        className="text-xs"
                      >
                        {val}%
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {goals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">Aucun objectif créé</p>
            <Button onClick={() => setShowForm(true)}>Créer votre premier objectif</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
