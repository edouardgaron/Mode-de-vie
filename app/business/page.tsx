"use client";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { getTodayString, getMonthString } from "@/lib/utils";
import { BusinessFocus, Project } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { AlertCircle, Trash2, Plus, AlertTriangle } from "lucide-react";

export default function BusinessPage() {
  const [business, setBusiness] = useState<BusinessFocus | null>(null);
  const [mainBusiness, setMainBusiness] = useState("");
  const [monthlyObjective, setMonthlyObjective] = useState("");
  const [weeklyPriorities, setWeeklyPriorities] = useState<string[]>(["", "", ""]);
  const [dailyTasks, setDailyTasks] = useState<string[]>(["", "", ""]);
  const [ideasNotToStart, setIdeasNotToStart] = useState<string[]>(["", "", ""]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const existing = storage.getCurrentBusinessFocus();
    if (existing) {
      setBusiness(existing);
      setMainBusiness(existing.mainBusiness);
      setMonthlyObjective(existing.monthlyObjective);
      setWeeklyPriorities(existing.weeklyPriorities.length > 0 ? existing.weeklyPriorities : ["", "", ""]);
      setDailyTasks(existing.dailyTasks.length > 0 ? existing.dailyTasks : ["", "", ""]);
      setIdeasNotToStart(existing.ideasNotToStart.length > 0 ? existing.ideasNotToStart : ["", "", ""]);
      setActiveProjects(existing.activeProjects);
    }
  }, []);

  const handleSave = () => {
    const month = getMonthString();
    const updated: BusinessFocus = {
      id: business?.id || "1",
      date: month,
      mainBusiness: mainBusiness || "Non spécifié",
      monthlyObjective: monthlyObjective || "",
      weeklyPriorities: weeklyPriorities.filter(p => p.trim()),
      dailyTasks: dailyTasks.filter(t => t.trim()),
      ideasNotToStart: ideasNotToStart.filter(i => i.trim()),
      activeProjects,
      updatedAt: new Date().toISOString(),
    };
    storage.upsertBusinessFocus(updated);
    setBusiness(updated);
    toast({ title: "Focus business sauvegardé" });
  };

  const handleAddProject = () => {
    if (!newProjectName.trim()) {
      toast({ title: "Erreur", description: "Entrez un nom de projet", variant: "destructive" });
      return;
    }
    if (activeProjects.length >= 3) {
      toast({ title: "Erreur", description: "Maximum 3 projets actifs", variant: "destructive" });
      return;
    }
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    const updated = [...activeProjects, newProject];
    setActiveProjects(updated);
    setNewProjectName("");
  };

  const handleDeleteProject = (id: string) => {
    setActiveProjects(activeProjects.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold mb-1">Focus Business</h1>
        <p className="text-muted-foreground">Votre priorité principale et vos limites de dispersion</p>
      </div>

      {activeProjects.length > 2 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertTriangle className="text-yellow-400 flex-shrink-0" size={20} />
            <p className="text-sm text-yellow-400">Vous avez {activeProjects.length} projets actifs. Limitezvous à 3 maximum!</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Entreprise principale ce mois</CardTitle>
          <CardDescription>Une seule priorité pour éviter la dispersion</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={mainBusiness}
            onChange={(e) => setMainBusiness(e.target.value)}
            placeholder="Compagnie de Peinture / Préfab / Immobilier..."
            className="text-lg font-semibold"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objectif du mois</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={monthlyObjective}
            onChange={(e) => setMonthlyObjective(e.target.value)}
            placeholder="Ex: Fermer 5 nouveaux contrats, améliorer les marges de 10%..."
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priorités hebdomadaires</CardTitle>
          <CardDescription>3 priorités maximum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {weeklyPriorities.map((priority, idx) => (
            <div key={idx}>
              <Label>Priorité {idx + 1}</Label>
              <Input
                value={priority}
                onChange={(e) => {
                  const updated = [...weeklyPriorities];
                  updated[idx] = e.target.value;
                  setWeeklyPriorities(updated);
                }}
                placeholder="Faire les suivis clients..."
                className="mt-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tâches quotidiennes</CardTitle>
          <CardDescription>Actions à compléter chaque jour</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dailyTasks.map((task, idx) => (
            <div key={idx}>
              <Label>Tâche {idx + 1}</Label>
              <Input
                value={task}
                onChange={(e) => {
                  const updated = [...dailyTasks];
                  updated[idx] = e.target.value;
                  setDailyTasks(updated);
                }}
                placeholder="Répondre aux messages clients..."
                className="mt-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parking lot - Idées à NE PAS démarrer</CardTitle>
          <CardDescription>Les tentations à rejeter pour rester focalisé</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ideasNotToStart.map((idea, idx) => (
            <div key={idx}>
              <Label>Idée {idx + 1}</Label>
              <Input
                value={idea}
                onChange={(e) => {
                  const updated = [...ideasNotToStart];
                  updated[idx] = e.target.value;
                  setIdeasNotToStart(updated);
                }}
                placeholder="Application mobile, partenariat..."
                className="mt-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projets actifs</CardTitle>
          <CardDescription>Maximum 3 projets simultanément</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddProject()}
              placeholder="Nom du projet..."
            />
            <Button onClick={handleAddProject} size="sm" className="gap-2">
              <Plus size={16} /> Ajouter
            </Button>
          </div>

          <div className="space-y-2">
            {activeProjects.map(project => (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                <div>
                  <p className="font-medium text-sm">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(project.createdAt).toLocaleDateString('fr-CA')}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>

          {activeProjects.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun projet actif</p>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} size="lg" className="w-full">
        Enregistrer le focus business
      </Button>
    </div>
  );
}
