import { Goal, BusinessFocus } from '@/types';

export function generateDefaultGoals(): Goal[] {
  const now = new Date().toISOString();
  const target = new Date();
  target.setDate(target.getDate() + 90);
  const targetDate = target.toISOString().slice(0, 10);

  const goals: Goal[] = [
    { id: '1', title: 'Marcher 45 min/jour', description: 'Au moins 5x par semaine', category: 'health', targetDate, active: true, progress: 0, createdAt: now, updatedAt: now },
    { id: '2', title: 'Entraînement 3x/semaine', description: 'Musculation ou cardio intense', category: 'health', targetDate, active: true, progress: 0, createdAt: now, updatedAt: now },
    { id: '3', title: 'Réduire la vape progressivement', description: 'Objectif : arrêt complet dans 90 jours', category: 'health', targetDate, active: true, progress: 0, createdAt: now, updatedAt: now },
    { id: '4', title: '3 tâches importantes par jour', description: 'Finir avant de commencer autre chose', category: 'business', targetDate, active: true, progress: 0, createdAt: now, updatedAt: now },
    { id: '5', title: 'Une seule priorité business principale', description: 'Éviter la dispersion entre les compagnies', category: 'business', targetDate, active: true, progress: 0, createdAt: now, updatedAt: now },
    { id: '6', title: 'Écrire 10 minutes par jour', description: 'Journal ou réflexion personnelle', category: 'personal', targetDate, active: true, progress: 0, createdAt: now, updatedAt: now },
    { id: '7', title: 'Ne pas surpromettre', description: 'Dire non quand c\'est non', category: 'personal', targetDate, active: true, progress: 0, createdAt: now, updatedAt: now },
    { id: '8', title: 'Finir avant de lancer', description: 'Aucun nouveau projet tant qu\'un ancien n\'est pas terminé', category: 'business', targetDate, active: true, progress: 0, createdAt: now, updatedAt: now },
    { id: '9', title: 'Améliorer la rentabilité des entreprises', description: 'Peinture + Préfab : marges nettes +10%', category: 'business', targetDate, active: true, progress: 0, createdAt: now, updatedAt: now },
    { id: '10', title: 'Bâtir une base pour la liberté financière', description: 'Épargner et investir chaque mois', category: 'finance', targetDate, active: true, progress: 0, createdAt: now, updatedAt: now },
  ];
  return goals;
}

export function generateDefaultBusinessFocus(): BusinessFocus {
  const month = new Date().toISOString().slice(0, 7);
  const now = new Date().toISOString();
  return {
    id: '1',
    date: month,
    mainBusiness: 'Compagnie de Peinture',
    monthlyObjective: 'Fermer 5 nouveaux contrats et améliorer les marges de 10%',
    weeklyPriorities: [
      'Faire les suivis clients en attente',
      'Préparer les soumissions de la semaine',
      'Réviser les coûts de matériaux',
    ],
    dailyTasks: [
      'Répondre aux messages clients',
      'Mettre à jour le calendrier des équipes',
      'Vérifier les dépenses de la semaine',
    ],
    ideasNotToStart: [
      'Application mobile pour clients',
      'Partenariat avec entrepreneur général',
      'Expansion au Québec',
    ],
    activeProjects: [
      { id: 'p1', name: 'Peinture - Saison printemps', status: 'active', createdAt: now },
      { id: 'p2', name: 'Immobilier - Refinancement', status: 'active', createdAt: now },
    ],
    updatedAt: now,
  };
}
